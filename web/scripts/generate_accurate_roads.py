"""
Generate high-density, smooth geodetic spline curves for NER highways.
Each curve uses Catmull-Rom / cubic interpolation to produce realistic highway vectors without jagged straight lines.
"""
import math
import json

def catmull_rom_spline(p0, p1, p2, p3, num_points=12):
    """Generate smooth Catmull-Rom spline points between p1 and p2."""
    points = []
    for i in range(num_points):
        t = i / float(num_points)
        t2 = t * t
        t3 = t2 * t
        
        lat = 0.5 * (
            (2 * p1['lat']) +
            (-p0['lat'] + p2['lat']) * t +
            (2 * p0['lat'] - 5 * p1['lat'] + 4 * p2['lat'] - p3['lat']) * t2 +
            (-p0['lat'] + 3 * p1['lat'] - 3 * p2['lat'] + p3['lat']) * t3
        )
        lng = 0.5 * (
            (2 * p1['lng']) +
            (-p0['lng'] + p2['lng']) * t +
            (2 * p0['lng'] - 5 * p1['lng'] + 4 * p2['lng'] - p3['lng']) * t2 +
            (-p0['lng'] + 3 * p1['lng'] - 3 * p2['lng'] + p3['lng']) * t3
        )
        points.append({'lat': round(lat, 6), 'lng': round(lng, 6)})
    return points

def smooth_polyline(control_points, points_per_seg=8):
    if len(control_points) < 2:
        return control_points
    
    # Pad endpoints for Catmull-Rom
    pts = [control_points[0]] + control_points + [control_points[-1]]
    smooth = []
    for i in range(1, len(pts) - 2):
        seg = catmull_rom_spline(pts[i-1], pts[i], pts[i+1], pts[i+2], points_per_seg)
        smooth.extend(seg)
    smooth.append(control_points[-1])
    return smooth

# Accurate Highway Control Waypoints
HIGHWAYS = {
    "NH27": [
        {"lat": 26.1445, "lng": 91.7362}, # Guwahati
        {"lat": 26.1265, "lng": 91.7915}, # Khanapara
        {"lat": 26.1167, "lng": 91.9723}, # Sonapur
        {"lat": 26.1215, "lng": 92.2136}, # Jagiroad
        {"lat": 26.1824, "lng": 92.4215}, # Nellie
        {"lat": 26.2291, "lng": 92.5187}, # Raha
        {"lat": 26.3465, "lng": 92.6841}, # Nagaon
        {"lat": 26.5412, "lng": 92.8912}, # Kaliabor
        {"lat": 26.5824, "lng": 92.9912}, # Jakhalabandha
        {"lat": 26.5886, "lng": 93.4116}, # Kaziranga
        {"lat": 26.6278, "lng": 93.5934}, # Bokakhat
        {"lat": 26.5925, "lng": 93.7381}, # Numaligarh
        {"lat": 26.7011, "lng": 93.9722}, # Dergaon
        {"lat": 26.7509, "lng": 94.2037}, # Jorhat
        {"lat": 26.8532, "lng": 94.4623}, # Jhanji
        {"lat": 26.9826, "lng": 94.6300}, # Sivasagar
        {"lat": 27.1856, "lng": 94.9315}, # Moranhat
        {"lat": 27.4728, "lng": 94.9120}  # Dibrugarh
    ],
    "NH37": [
        {"lat": 26.1445, "lng": 91.7362},
        {"lat": 26.1215, "lng": 92.2136},
        {"lat": 26.1024, "lng": 92.5112},
        {"lat": 25.9812, "lng": 92.8124},
        {"lat": 25.8642, "lng": 93.0112},
        {"lat": 25.7516, "lng": 93.1729}
    ],
    "NH715": [
        {"lat": 25.7516, "lng": 93.1729},
        {"lat": 25.8912, "lng": 93.7124},
        {"lat": 26.1214, "lng": 93.8124},
        {"lat": 26.5124, "lng": 93.9712},
        {"lat": 26.7509, "lng": 94.2037},
        {"lat": 26.9826, "lng": 94.6300},
        {"lat": 27.4728, "lng": 94.9120}
    ],
    "NH415": [
        {"lat": 27.0987, "lng": 93.8189}, # Banderdewa
        {"lat": 27.1265, "lng": 93.7423}, # Nirjuli
        {"lat": 27.1089, "lng": 93.6934}, # Naharlagun
        {"lat": 27.0844, "lng": 93.6053}  # Itanagar
    ],
    "SH15": [
        {"lat": 26.6538, "lng": 92.7926}, # Tezpur
        {"lat": 26.7321, "lng": 93.1567}, # Biswanath
        {"lat": 26.8856, "lng": 93.6124}, # Gohpur
        {"lat": 27.0987, "lng": 93.8189}, # Banderdewa
        {"lat": 27.0844, "lng": 93.6053}  # Itanagar
    ],
    "NH515": [
        {"lat": 27.4728, "lng": 94.9120}, # Dibrugarh
        {"lat": 27.4042, "lng": 94.7578}, # Bogibeel Bridge
        {"lat": 27.4812, "lng": 94.5821}, # Dhemaji
        {"lat": 27.5912, "lng": 94.7214}, # Silapathar
        {"lat": 27.8341, "lng": 95.1624}, # Jonai
        {"lat": 28.0667, "lng": 95.3300}  # Pasighat
    ],
    "NH13": [
        {"lat": 27.0844, "lng": 93.6053}, # Itanagar
        {"lat": 27.2415, "lng": 93.4124}, # Sagalee
        {"lat": 27.3218, "lng": 93.7845}, # Potin
        {"lat": 27.5942, "lng": 93.8426}, # Ziro
        {"lat": 27.7812, "lng": 94.0215}, # Raga
        {"lat": 27.9862, "lng": 94.2215}, # Daporijo
        {"lat": 28.1694, "lng": 94.8012}, # Aalo
        {"lat": 28.0667, "lng": 95.3300}  # Pasighat
    ],
    "NH13B": [
        {"lat": 26.7824, "lng": 92.8214}, # Balipara
        {"lat": 27.0145, "lng": 92.6512}, # Bhalukpong
        {"lat": 27.1824, "lng": 92.4812}, # Tenga
        {"lat": 27.2641, "lng": 92.4215}, # Bomdila
        {"lat": 27.3592, "lng": 92.2418}, # Dirang
        {"lat": 27.5042, "lng": 92.1024}, # Sela Pass
        {"lat": 27.5812, "lng": 91.9821}, # Jang
        {"lat": 27.5861, "lng": 91.8594}  # Tawang
    ],
    "NH6": [
        {"lat": 26.1445, "lng": 91.7362}, # Guwahati
        {"lat": 26.1112, "lng": 91.8624}, # Jorabat
        {"lat": 25.9014, "lng": 91.8812}, # Nongpoh
        {"lat": 25.6612, "lng": 91.9024}, # Umiam Lake
        {"lat": 25.5788, "lng": 91.8933}, # Shillong
        {"lat": 25.4412, "lng": 92.2145}, # Jowai
        {"lat": 25.3214, "lng": 92.3512}, # Ladrymbai
        {"lat": 24.8170, "lng": 92.7976}  # Silchar
    ]
}

def generate_roads_file():
    paths = {}
    for name, pts in HIGHWAYS.items():
        paths[name] = smooth_polyline(pts, points_per_seg=6)

    ts_content = "/**\n * NER Highway Polylines — Smooth Geodetic Alignment\n */\n"
    ts_content += "import type { RoadSegment } from '@/types'\n\n"
    ts_content += "type Pt = { lat: number; lng: number }\n\n"

    for name, pts in paths.items():
        coords_json = json.dumps([{"lat": p["lat"], "lng": p["lng"]} for p in pts], indent=2)
        ts_content += f"const {name}_COORDS: Pt[] = {coords_json}\n\n"

    ts_content += """export const mockRoads: RoadSegment[] = [
  {
    id: 'nh27-seg1',
    name: 'NH-27 (Guwahati – Kaziranga – Jorhat – Dibrugarh)',
    highway: 'NH-27',
    status: 'open',
    risk: 'low',
    riskScore: 18,
    district: 'Nagaon',
    coordinates: NH27_COORDS,
    affectedVehicles: ['v1', 'v4'],
    weatherImpact: 15,
    lastInspection: new Date(Date.now() - 3600000).toISOString(),
    slope: 3.2,
    bridgeCondition: 'good',
    trafficLoad: 42,
  },
  {
    id: 'nh37-seg1',
    name: 'NH-37 (Guwahati – Jagiroad – Lumding)',
    highway: 'NH-37',
    status: 'partial',
    risk: 'medium',
    riskScore: 54,
    district: 'Morigaon',
    coordinates: NH37_COORDS,
    affectedVehicles: ['v3', 'v7'],
    weatherImpact: 48,
    lastInspection: new Date(Date.now() - 7200000).toISOString(),
    slope: 5.8,
    bridgeCondition: 'caution',
    trafficLoad: 68,
  },
  {
    id: 'nh715-seg1',
    name: 'NH-715 (Lumding – Diphu – Golaghat – Dibrugarh)',
    highway: 'NH-715',
    status: 'open',
    risk: 'low',
    riskScore: 22,
    district: 'Golaghat',
    coordinates: NH715_COORDS,
    affectedVehicles: ['v10'],
    weatherImpact: 20,
    lastInspection: new Date(Date.now() - 10800000).toISOString(),
    slope: 4.1,
    bridgeCondition: 'good',
    trafficLoad: 35,
  },
  {
    id: 'nh415-seg1',
    name: 'NH-415 (Banderdewa – Naharlagun – Itanagar Km 42)',
    highway: 'NH-415',
    status: 'blocked',
    risk: 'critical',
    riskScore: 92,
    district: 'Papum Pare',
    coordinates: NH415_COORDS,
    blockedSince: new Date(Date.now() - 14400000).toISOString(),
    reason: 'Major landslide at Km 42 near Itanagar. 120m roadway covered by debris.',
    affectedVehicles: ['v4', 'v6', 'v9'],
    weatherImpact: 95,
    lastInspection: new Date(Date.now() - 1800000).toISOString(),
    slope: 24.5,
    bridgeCondition: 'poor',
    trafficLoad: 0,
  },
  {
    id: 'sh15-seg1',
    name: 'SH-15 / NH-15 (Tezpur – Gohpur – Banderdewa – Itanagar)',
    highway: 'SH-15',
    status: 'open',
    risk: 'low',
    riskScore: 24,
    district: 'Papum Pare',
    coordinates: SH15_COORDS,
    affectedVehicles: ['v2', 'v12'],
    weatherImpact: 22,
    lastInspection: new Date(Date.now() - 5400000).toISOString(),
    slope: 6.4,
    bridgeCondition: 'good',
    trafficLoad: 38,
  },
  {
    id: 'nh515-seg1',
    name: 'NH-515 (Dibrugarh – Bogibeel Bridge – Silapathar – Pasighat)',
    highway: 'NH-515',
    status: 'open',
    risk: 'low',
    riskScore: 19,
    district: 'East Siang',
    coordinates: NH515_COORDS,
    affectedVehicles: ['v5', 'v11'],
    weatherImpact: 25,
    lastInspection: new Date(Date.now() - 4800000).toISOString(),
    slope: 4.5,
    bridgeCondition: 'good',
    trafficLoad: 32,
  },
  {
    id: 'nh13-seg1',
    name: 'NH-13 Trans-Arunachal (Itanagar – Ziro – Daporijo – Aalo – Pasighat)',
    highway: 'NH-13',
    status: 'partial',
    risk: 'high',
    riskScore: 78,
    district: 'Lower Subansiri',
    coordinates: NH13_COORDS,
    affectedVehicles: ['v5'],
    weatherImpact: 82,
    lastInspection: new Date(Date.now() - 9000000).toISOString(),
    slope: 18.2,
    bridgeCondition: 'caution',
    trafficLoad: 45,
  },
  {
    id: 'nh13b-seg1',
    name: 'NH-13B (Balipara – Bhalukpong – Bomdila – Sela Pass – Tawang)',
    highway: 'NH-13B',
    status: 'partial',
    risk: 'high',
    riskScore: 71,
    district: 'Tawang',
    coordinates: NH13B_COORDS,
    affectedVehicles: ['v11'],
    weatherImpact: 76,
    lastInspection: new Date(Date.now() - 6000000).toISOString(),
    slope: 22.0,
    bridgeCondition: 'good',
    trafficLoad: 28,
  },
  {
    id: 'nh6-seg1',
    name: 'NH-6 (Guwahati – Shillong – Jowai – Silchar)',
    highway: 'NH-6',
    status: 'open',
    risk: 'low',
    riskScore: 28,
    district: 'East Khasi Hills',
    coordinates: NH6_COORDS,
    affectedVehicles: ['v8'],
    weatherImpact: 30,
    lastInspection: new Date(Date.now() - 3600000).toISOString(),
    slope: 11.5,
    bridgeCondition: 'good',
    trafficLoad: 60,
  },
]
"""
    with open(r"c:\Users\angad\Desktop\Sih2025\ner-logistics\web\src\mock\roads.ts", "w", encoding="utf-8") as f:
        f.write(ts_content)
    print("Regenerated smooth spline roads!")

if __name__ == "__main__":
    generate_roads_file()
