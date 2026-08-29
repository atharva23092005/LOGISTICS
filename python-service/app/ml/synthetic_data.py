"""
NER Logistics — Semi-Synthetic Geospatial & Geological Data Generator
Implements: synthetic-data-generator & landslide-feature-engineer skills.
Generates authentic Northeast India terrain profiles across major corridors.
"""
import math
import random
from typing import Dict, List, Any

import numpy as np
import pandas as pd

from app.config import RANDOM_SEED, SYNTHETIC_CAP
from app.ml.features import FEATURE_COLUMNS, LABEL_COLUMN

# Major Northeast Highway Segments
NER_ROAD_SEGMENTS: List[Dict[str, Any]] = [
    {
        "id": "nh415-seg1",
        "highway": "NH-415",
        "name": "NH-415 Km 42 (Jeypore Pass to Pasighat)",
        "district": "East Siang",
        "state": "Arunachal Pradesh",
        "start_coords": {"lat": 27.5500, "lng": 94.9000},
        "end_coords": {"lat": 27.8000, "lng": 95.2000},
        "length_km": 48.5,
        "elevation_m": 820,
        "slope_deg": 24.5,
        "soil_type": "Clayey Silt / Schist",
        "plasticity_index": 22.4,
        "historical_landslides_5yr": 14,
        "default_rainfall_mm_h": 84.0,
        "default_soil_moisture_pct": 88.0,
    },
    {
        "id": "sh15-seg1",
        "highway": "SH-15",
        "name": "SH-15 North Bank Safe Corridor",
        "district": "North Lakhimpur / East Siang",
        "state": "Assam & Arunachal Pradesh",
        "start_coords": {"lat": 27.2000, "lng": 94.1000},
        "end_coords": {"lat": 27.7500, "lng": 95.1000},
        "length_km": 62.0,
        "elevation_m": 180,
        "slope_deg": 3.2,
        "soil_type": "Alluvial Sand & Gravel",
        "plasticity_index": 8.2,
        "historical_landslides_5yr": 1,
        "default_rainfall_mm_h": 18.0,
        "default_soil_moisture_pct": 54.0,
    },
    {
        "id": "nh27-seg1",
        "highway": "NH-27",
        "name": "NH-27 East-West Expressway (Guwahati – Nagaon)",
        "district": "Kamrup & Nagaon",
        "state": "Assam",
        "start_coords": {"lat": 26.1500, "lng": 91.7500},
        "end_coords": {"lat": 26.3500, "lng": 92.7000},
        "length_km": 115.0,
        "elevation_m": 55,
        "slope_deg": 1.2,
        "soil_type": "Brahmaputra Floodplain Alluvium",
        "plasticity_index": 12.0,
        "historical_landslides_5yr": 0,
        "default_rainfall_mm_h": 22.0,
        "default_soil_moisture_pct": 60.0,
    },
    {
        "id": "nh37-seg1",
        "highway": "NH-37",
        "name": "NH-37 Kaziranga Lowland Corridor",
        "district": "Golaghat & Nagaon",
        "state": "Assam",
        "start_coords": {"lat": 26.5800, "lng": 93.1500},
        "end_coords": {"lat": 26.7500, "lng": 93.6500},
        "length_km": 54.0,
        "elevation_m": 62,
        "slope_deg": 1.8,
        "soil_type": "Lowland Silt & Peat",
        "plasticity_index": 16.5,
        "historical_landslides_5yr": 2,
        "default_rainfall_mm_h": 34.0,
        "default_soil_moisture_pct": 76.0,
    },
    {
        "id": "nh13-seg1",
        "highway": "NH-13",
        "name": "NH-13 Trans-Arunachal Highway (Itanagar – Along)",
        "district": "Papum Pare & West Siang",
        "state": "Arunachal Pradesh",
        "start_coords": {"lat": 27.1000, "lng": 93.6000},
        "end_coords": {"lat": 28.1500, "lng": 94.8000},
        "length_km": 142.0,
        "elevation_m": 1250,
        "slope_deg": 28.0,
        "soil_type": "Gneissic Debris & Sandstone",
        "plasticity_index": 24.0,
        "historical_landslides_5yr": 22,
        "default_rainfall_mm_h": 42.0,
        "default_soil_moisture_pct": 82.0,
    },
    {
        "id": "nh6-seg1",
        "highway": "NH-6",
        "name": "NH-6 Meghalaya Plateau Arc (Guwahati – Shillong)",
        "district": "Ri-Bhoi & East Khasi Hills",
        "state": "Meghalaya",
        "start_coords": {"lat": 25.8500, "lng": 91.8000},
        "end_coords": {"lat": 25.5500, "lng": 91.9000},
        "length_km": 68.0,
        "elevation_m": 1480,
        "slope_deg": 18.0,
        "soil_type": "Laterite & Quartzite Bedrock",
        "plasticity_index": 18.0,
        "historical_landslides_5yr": 8,
        "default_rainfall_mm_h": 38.0,
        "default_soil_moisture_pct": 79.0,
    },
    {
        "id": "nh10-seg1",
        "highway": "NH-10",
        "name": "NH-10 Teesta Valley Pass (Siliguri – Gangtok)",
        "district": "East Sikkim",
        "state": "Sikkim",
        "start_coords": {"lat": 26.7271, "lng": 88.3953},
        "end_coords": {"lat": 27.3389, "lng": 88.6065},
        "length_km": 114.0,
        "elevation_m": 1650,
        "slope_deg": 32.5,
        "soil_type": "Mica Schist & Phyllite",
        "plasticity_index": 26.0,
        "historical_landslides_5yr": 25,
        "default_rainfall_mm_h": 48.0,
        "default_soil_moisture_pct": 86.0,
    },
    {
        "id": "nh29-seg1",
        "highway": "NH-29",
        "name": "NH-29 Naga Hills Corridor (Dimapur – Kohima)",
        "district": "Kohima",
        "state": "Nagaland",
        "start_coords": {"lat": 25.9068, "lng": 93.7273},
        "end_coords": {"lat": 25.6701, "lng": 94.1077},
        "length_km": 74.0,
        "elevation_m": 1440,
        "slope_deg": 19.2,
        "soil_type": "Disang Shale & Siltstone",
        "plasticity_index": 21.0,
        "historical_landslides_5yr": 18,
        "default_rainfall_mm_h": 36.0,
        "default_soil_moisture_pct": 78.0,
    },
    {
        "id": "nh102-seg1",
        "highway": "NH-102",
        "name": "NH-102 Asian Highway 1 (Imphal – Moreh)",
        "district": "Imphal East & Tengnoupal",
        "state": "Manipur",
        "start_coords": {"lat": 24.8170, "lng": 93.9368},
        "end_coords": {"lat": 24.2442, "lng": 94.3013},
        "length_km": 108.0,
        "elevation_m": 780,
        "slope_deg": 16.0,
        "soil_type": "Clayey Loam & Sandstone",
        "plasticity_index": 19.5,
        "historical_landslides_5yr": 12,
        "default_rainfall_mm_h": 32.0,
        "default_soil_moisture_pct": 74.0,
    },
    {
        "id": "nh54-seg1",
        "highway": "NH-54",
        "name": "NH-54 Mizoram Spine (Silchar – Aizawl)",
        "district": "Aizawl",
        "state": "Mizoram",
        "start_coords": {"lat": 24.8333, "lng": 92.8000},
        "end_coords": {"lat": 23.7271, "lng": 92.7176},
        "length_km": 180.0,
        "elevation_m": 1130,
        "slope_deg": 24.0,
        "soil_type": "Surma Group Siltstone",
        "plasticity_index": 23.0,
        "historical_landslides_5yr": 15,
        "default_rainfall_mm_h": 40.0,
        "default_soil_moisture_pct": 80.0,
    },
    {
        "id": "nh8-seg1",
        "highway": "NH-8",
        "name": "NH-8 Tripura Lifeline (Churaibari – Agartala)",
        "district": "West Tripura",
        "state": "Tripura",
        "start_coords": {"lat": 24.5300, "lng": 92.2500},
        "end_coords": {"lat": 23.8315, "lng": 91.2868},
        "length_km": 195.0,
        "elevation_m": 45,
        "slope_deg": 3.0,
        "soil_type": "Tripura Red Loam & Alluvium",
        "plasticity_index": 10.0,
        "historical_landslides_5yr": 1,
        "default_rainfall_mm_h": 24.0,
        "default_soil_moisture_pct": 65.0,
    },
]


def generate_semi_synthetic_features(
    rainfall_multiplier: float = 1.0,
    seed: int = 42
) -> List[Dict[str, Any]]:
    """
    Produces semi-synthetic feature tables with authentic geospatial attributes.
    """
    random.seed(seed)
    features = []
    
    for seg in NER_ROAD_SEGMENTS:
        # Simulate slight noise over static parameters
        rain = round(seg["default_rainfall_mm_h"] * rainfall_multiplier + random.uniform(-2.5, 2.5), 1)
        rain = max(0.0, rain)
        
        moisture = round(seg["default_soil_moisture_pct"] * math.sqrt(rainfall_multiplier) + random.uniform(-1.5, 1.5), 1)
        moisture = min(100.0, max(10.0, moisture))
        
        # 3-day antecedent rainfall index
        rain_3day = round(rain * 2.8 + random.uniform(5.0, 15.0), 1)
        
        features.append({
            "segment_id": seg["id"],
            "highway": seg["highway"],
            "name": seg["name"],
            "district": seg["district"],
            "state": seg["state"],
            "slope_deg": seg["slope_deg"],
            "elevation_m": seg["elevation_m"],
            "rainfall_1h_mm": rain,
            "antecedent_rain_3day_mm": rain_3day,
            "soil_moisture_pct": moisture,
            "plasticity_index": seg["plasticity_index"],
            "historical_landslides_5yr": seg["historical_landslides_5yr"],
            "coordinates": {
                "start": seg["start_coords"],
                "end": seg["end_coords"]
            }
        })
        
    return features
