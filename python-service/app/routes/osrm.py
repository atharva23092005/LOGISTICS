"""
OSRM wrapper — exposes the public OSRM API to the frontend via this Python service.

Endpoints:
  POST /osrm/route          — full route geometry between waypoints
  POST /osrm/nearest        — snap a coordinate to the nearest road node
  POST /osrm/match          — map-match a GPS trace to actual roads
  POST /osrm/batch-route    — fetch road-snapped geometry for multiple segments

Uses the public demo server: https://router.project-osrm.org
For production, swap OSRM_BASE_URL for a self-hosted instance.
"""
import os
import httpx
from typing import List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()
OSRM = os.getenv("OSRM_BASE_URL", "https://router.project-osrm.org")


# ── Request / Response models ────────────────────────────────────────────────

class Coord(BaseModel):
    lat: float
    lng: float

class RouteRequest(BaseModel):
    waypoints: List[Coord]
    overview: str = "full"          # full | simplified | false
    steps: bool = False
    geometries: str = "geojson"     # geojson | polyline | polyline6

class NearestRequest(BaseModel):
    coord: Coord
    number: int = 1                 # how many nearest snaps to return

class MatchRequest(BaseModel):
    coords: List[Coord]             # GPS trace
    radiuses: List[float] = []      # per-point search radius in metres
    geometries: str = "geojson"
    overview: str = "full"

class BatchRouteRequest(BaseModel):
    segments: List[List[Coord]]     # list of waypoint arrays (one per road)
    sample_n: int = 30              # target points per route after sub-sampling


# ── Helpers ───────────────────────────────────────────────────────────────────

def coords_to_osrm(coords: List[Coord]) -> str:
    """Convert [{lat,lng}] → 'lng,lat;lng,lat;...' as required by OSRM."""
    return ";".join(f"{c.lng},{c.lat}" for c in coords)

def subsample(geometry_coords: list, n: int) -> List[dict]:
    """Keep first, last, and every Nth point from an OSRM [lng,lat] list."""
    total = len(geometry_coords)
    if total <= n:
        step = 1
    else:
        step = max(1, total // n)

    out = []
    for i, pt in enumerate(geometry_coords):
        if i == 0 or i == total - 1 or i % step == 0:
            out.append({"lat": round(pt[1], 6), "lng": round(pt[0], 6)})
    return out


# ── /route ────────────────────────────────────────────────────────────────────

@router.post("/route")
async def get_route(req: RouteRequest):
    """
    Get a road-snapped route between waypoints.
    Returns full geometry as { lat, lng } point array + summary stats.
    """
    if len(req.waypoints) < 2:
        raise HTTPException(status_code=400, detail="At least 2 waypoints required")

    coord_str = coords_to_osrm(req.waypoints)
    url = (
        f"{OSRM}/route/v1/driving/{coord_str}"
        f"?overview={req.overview}&geometries={req.geometries}"
        f"&steps={'true' if req.steps else 'false'}"
    )

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(url)

    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail=f"OSRM error: {resp.text[:200]}")

    data = resp.json()
    if data.get("code") != "Ok" or not data.get("routes"):
        raise HTTPException(status_code=404, detail="No route found")

    route = data["routes"][0]
    raw_coords = route["geometry"]["coordinates"]  # [lng, lat] pairs

    return {
        "distance_m":  round(route["legs"][0]["distance"]),
        "duration_s":  round(route["legs"][0]["duration"]),
        "coordinates": raw_coords,   # keep raw for the batch endpoint
        "waypoints":   [{"lat": round(c[1], 6), "lng": round(c[0], 6)} for c in raw_coords],
    }


# ── /nearest ─────────────────────────────────────────────────────────────────

@router.post("/nearest")
async def nearest_road(req: NearestRequest):
    """
    Snap a lat/lng coordinate to the nearest road node.
    Useful for keeping vehicle markers on actual roads.
    """
    url = f"{OSRM}/nearest/v1/driving/{req.coord.lng},{req.coord.lat}?number={req.number}"

    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(url)

    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail=f"OSRM error: {resp.text[:200]}")

    data = resp.json()
    if data.get("code") != "Ok" or not data.get("waypoints"):
        # Return original if no snap found
        return {"snapped": req.coord, "distance_m": 0}

    wp = data["waypoints"][0]
    lng, lat = wp["location"]
    return {
        "snapped":    {"lat": round(lat, 6), "lng": round(lng, 6)},
        "distance_m": round(wp.get("distance", 0)),
        "name":       wp.get("name", ""),
    }


# ── /match ────────────────────────────────────────────────────────────────────

@router.post("/match")
async def map_match(req: MatchRequest):
    """
    Map-match a GPS trace to the actual road network.
    Used to clean up noisy vehicle GPS positions.
    """
    if len(req.coords) < 2:
        raise HTTPException(status_code=400, detail="At least 2 coordinates required")

    coord_str = coords_to_osrm(req.coords)

    # Build radiuses param
    if req.radiuses and len(req.radiuses) == len(req.coords):
        rad_str = ";".join(str(r) for r in req.radiuses)
    else:
        rad_str = ";".join("25" for _ in req.coords)  # 25m default

    url = (
        f"{OSRM}/match/v1/driving/{coord_str}"
        f"?overview={req.overview}&geometries={req.geometries}&radiuses={rad_str}"
    )

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(url)

    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail=f"OSRM error: {resp.text[:200]}")

    data = resp.json()
    if data.get("code") != "Ok" or not data.get("matchings"):
        raise HTTPException(status_code=404, detail="Map matching failed")

    matching = data["matchings"][0]
    raw_coords = matching["geometry"]["coordinates"]

    return {
        "confidence":  round(matching.get("confidence", 0), 3),
        "distance_m":  round(matching["legs"][0]["distance"] if matching.get("legs") else 0),
        "coordinates": [{"lat": round(c[1], 6), "lng": round(c[0], 6)} for c in raw_coords],
    }


# ── /batch-route ──────────────────────────────────────────────────────────────

@router.post("/batch-route")
async def batch_route(req: BatchRouteRequest):
    """
    Fetch OSRM road-snapped geometry for multiple route segments in parallel.
    Returns sub-sampled coordinate arrays ready for use in mockRoads.
    """
    results = []

    async with httpx.AsyncClient(timeout=20.0) as client:
        for segment in req.segments:
            if len(segment) < 2:
                results.append({"error": "need >= 2 waypoints", "coordinates": []})
                continue

            coord_str = coords_to_osrm(segment)
            url = (
                f"{OSRM}/route/v1/driving/{coord_str}"
                f"?overview=full&geometries=geojson&steps=false"
            )
            try:
                resp = await client.get(url)
                data = resp.json()
                if data.get("code") != "Ok" or not data.get("routes"):
                    results.append({"error": "no route", "coordinates": []})
                    continue

                raw = data["routes"][0]["geometry"]["coordinates"]
                sampled = subsample(raw, req.sample_n)
                results.append({
                    "coordinates": sampled,
                    "distance_m":  round(data["routes"][0]["legs"][0]["distance"]),
                    "duration_s":  round(data["routes"][0]["legs"][0]["duration"]),
                })
            except Exception as e:
                results.append({"error": str(e), "coordinates": []})

    return {"segments": results}
