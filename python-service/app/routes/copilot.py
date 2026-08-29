"""
NER Operations Copilot — Complete Chained Demo Intelligence Engine v7

Full closed-loop question & follow-up chaining across all operational domains +
graceful, professional handling of all human conversational & greeting messages.
"""
import re
from typing import Optional, List, Dict, Any
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class ChatMessage(BaseModel):
    message: str
    context: Optional[dict] = None
    role: Optional[str] = "operator"

class ChatResponse(BaseModel):
    intent: str
    text: str
    cards: list = []
    actions: list = []
    suggestions: list = []
    severity: str = "info"
    mapCommand: Optional[dict] = None

# ── Complete Chained Knowledge Map ─────────────────────────────────────────────

KNOWLEDGE_CHAIN: Dict[str, Dict[str, Any]] = {

    # ── Conversational & Human Messages (Graceful & Professional) ─────────────

    # 1. Natural Greetings
    "greeting": {
        "patterns": [
            r"^(hi|hello|hey|greetings|howdy|sup|good day|namaste|morning|good morning|evening|good evening|afternoon|good afternoon|start|start chat)\b"
        ],
        "text": "Hello! I am your **NER Logistics Operations Copilot**. How can I assist you with fleet dispatch, road terrain, or hazard analytics today?",
        "cards": [],
        "actions": [],
        "suggestions": [
            "What's happening right now?",
            "Why is NH-415 blocked?",
            "Show all stopped vehicles",
            "Analyze route elevation"
        ],
        "severity": "info"
    },

    # 2. How Are You
    "how_are_you": {
        "patterns": [
            r"how are you",
            r"how.s it going",
            r"how are things",
            r"how are you doing",
            r"how are you today",
            r"are you ok",
            r"are you online",
            r"status check",
            r"\bping\b"
        ],
        "text": "I am operating at full capacity. All 12 telemetry streams, the XGBoost landslide prediction engine, and the OSRM routing network are running normally. How can I support your operations right now?",
        "cards": [],
        "actions": [],
        "suggestions": [
            "What's happening right now?",
            "Show analytics & statistics",
            "System health check",
            "Morning briefing"
        ],
        "severity": "info"
    },

    # 3. Identity
    "identity": {
        "patterns": [
            r"who are you",
            r"what are you",
            r"your name",
            r"who built you",
            r"who created you",
            r"tell me about yourself",
            r"introduce yourself"
        ],
        "text": "I am the **NER Operations Copilot** — an enterprise AI assistant designed for terrain intelligence, multi-modal convoy routing, and disaster-resilient logistics across Northeast India.",
        "cards": [],
        "actions": [],
        "suggestions": [
            "What can you do?",
            "Explain XGBoost AI model",
            "Analyze route elevation",
            "What's happening right now?"
        ],
        "severity": "info"
    },

    # 4. Capabilities / Help
    "capabilities": {
        "patterns": [
            r"what can you do",
            r"help me",
            r"\bhelp\b",
            r"what are your features",
            r"what are your capabilities",
            r"\bcommands\b",
            r"how does this work",
            r"how to use",
            r"what do you do"
        ],
        "text": """I can assist you across all key operational domains:

- **Fleet Dispatch:** Track 12 live vehicle convoys, driver Hours of Service, fuel reserves, and automated rerouting.
- **Terrain & Elevation Analysis:** Topographic elevation profiling, slope gradient calculations, and mountain pass conditions.
- **Predictive Risk & Weather:** Real-time landslide forecasts, IMD precipitation radar, and district soil moisture saturation indices.
- **Incident Response:** Field ground reports, checkpoint inspections, and life-critical emergency dispatches.""",
        "cards": [],
        "actions": [],
        "suggestions": [
            "What's happening right now?",
            "Compare all 3 routes",
            "Show district risk matrix",
            "Explain XGBoost AI model"
        ],
        "severity": "info"
    },

    # 5. Acknowledgement
    "acknowledgement": {
        "patterns": [
            r"^(ok|okay|got it|understood|sure|cool|fine|noted|roger|roger that|copy that|alright|all right|acknowledged)\b"
        ],
        "text": "Understood. Standing by for your next operational query or directive.",
        "cards": [],
        "actions": [],
        "suggestions": [
            "What's happening right now?",
            "Why is NH-415 blocked?",
            "Show all stopped vehicles",
            "Analyze route elevation"
        ],
        "severity": "info"
    },

    # 6. Thanks
    "thanks": {
        "patterns": [
            r"\bthanks\b",
            r"thank you",
            r"\bthx\b",
            r"\bty\b",
            r"appreciate it",
            r"great job",
            r"awesome",
            r"perfect",
            r"good work",
            r"well done",
            r"thanks a lot"
        ],
        "text": "You're welcome! Let me know whenever you need further routing analysis, driver contact details, or operational updates.",
        "cards": [],
        "actions": [],
        "suggestions": [
            "Morning briefing",
            "Why is NH-415 blocked?",
            "Fleet fuel status",
            "Show analytics & statistics"
        ],
        "severity": "info"
    },

    # 7. Farewell
    "bye": {
        "patterns": [
            r"\bbye\b",
            r"goodbye",
            r"\bcya\b",
            r"see you",
            r"signing off",
            r"\bexit\b",
            r"\bquit\b",
            r"talk to you later",
            r"good night"
        ],
        "text": "Goodbye! The background intelligence engine will continue monitoring all Northeastern corridors and active convoys 24/7. Stay safe.",
        "cards": [],
        "actions": [],
        "suggestions": [
            "Morning briefing",
            "What's happening right now?"
        ],
        "severity": "info"
    },

    # 8. Emergency SOS Trigger
    "emergency_sos": {
        "patterns": [
            r"\bemergency\b",
            r"\bsos\b",
            r"\bmayday\b",
            r"urgent help",
            r"critical emergency",
            r"emergency dispatch"
        ],
        "text": "Emergency protocols engaged. Critical attention required for 3 halted convoys at NH-415 Km 42, including Life-Critical Ambulance `AR-01-GH-2345` carrying surgical supplies.",
        "cards": [],
        "actions": [
            {"label": "Why is NH-415 Blocked?", "action": "chat", "target": "why is NH-415 blocked?"},
            {"label": "Call Ambulance Driver", "action": "callDriver", "target": "+91-9876543213"},
            {"label": "Reroute All Stranded", "action": "activateRerouting", "target": "all"}
        ],
        "suggestions": [
            "Why is NH-415 blocked?",
            "Show all stopped vehicles",
            "Call ambulance driver",
            "Reroute all stranded vehicles"
        ],
        "severity": "critical"
    },

    # 9. Yes / No
    "yes_no": {
        "patterns": [
            r"^(yes|yep|yeah|no|nope)\b"
        ],
        "text": "Acknowledged. Please let me know how you would like to proceed.",
        "cards": [],
        "actions": [],
        "suggestions": [
            "What's happening right now?",
            "Compare all 3 routes",
            "Why is NH-415 blocked?",
            "Analyze route elevation"
        ],
        "severity": "info"
    },

    # ── Operational Knowledge & Domain Topics ─────────────────────────────────

    # 10. Situation Overview
    "situation_overview": {
        "patterns": [
            r"what.s happening right now",
            r"\bsituation\b",
            r"current status",
            r"overview",
            r"network summary",
            r"what is happening",
            r"how many vehicle"
        ],
        "text": """### Regional Logistics Situation Overview

**Active Fleet Distribution (12 Convoys):**
- On Route: **6 convoys** (Normal transit speed)
- Delayed: **3 convoys** (Slowed by fog/congestion on NH-37 & NH-13)
- Stopped: **3 convoys** (Stranded at NH-415 Km 42 blockage)

**Highway Infrastructure Status:**
- **1 Road Blocked:** NH-415 Dibrugarh–Pasighat (Active Landslide at Km 42)
- **2 Roads Restricted:** NH-37 (Hojai congestion) and NH-13B (Sela Pass dense fog)
- **4 Safe Corridors Open:** NH-27, SH-15, NH-6, and NH-715

**Highest Priority Command Alert:**
- Emergency Ambulance `AR-01-GH-2345` (carrying critical surgical equipment) is halted 12 km before Pasighat.
- **Recommended Action:** Execute emergency detour via **Route C (SH-15 North Bank Bypass)**.""",
        "cards": [
            {
                "type": "kpi_grid",
                "items": [
                    {"label": "On Route", "value": 6, "color": "success"},
                    {"label": "Delayed", "value": 3, "color": "warning"},
                    {"label": "Stopped", "value": 3, "color": "danger"},
                    {"label": "Critical Alerts", "value": 2, "color": "danger"}
                ]
            },
            {
                "type": "risk_bar",
                "road": "NH-415 (East Siang)",
                "score": 87,
                "level": "critical"
            }
        ],
        "actions": [
            {"label": "View NH-415 on Map", "action": "flyToRoad", "target": "nh415-seg1"},
            {"label": "Compare All 3 Routes", "action": "chat", "target": "compare all 3 routes"},
            {"label": "Emergency Center", "action": "navigate", "target": "/emergency"}
        ],
        "suggestions": [
            "Why is NH-415 blocked?",
            "Show all stopped vehicles",
            "Analyze route elevation",
            "Show analytics & statistics"
        ],
        "severity": "warning"
    },

    # 11. Why is NH-415 Blocked
    "nh415_blocked": {
        "patterns": [
            r"why.*nh-415",
            r"nh-415.*blocked",
            r"why.*blocked",
            r"\bnh415\b",
            r"explain.*nh-415"
        ],
        "text": """### Incident Breakdown: NH-415 Dibrugarh–Pasighat (Km 42 Blockage)

- **Location:** Km 42 near Jeypore, East Siang Sector
- **Status:** BLOCKED — Impassable for all standard vehicular traffic
- **Hazard Trigger:** Mudslide & boulder debris collapse following 85 mm/hr monsoonal rainfall
- **Composite Risk Score:** **87% (Critical Hazard)**

**Measured Geological & Meteorological Telemetry:**
- Slope Gradient: **31.0°** (exceeds critical slope stability threshold of 15°)
- Soil Moisture Saturation: **88%** (subsoil shear strength collapsed)
- Debris Volume: Approx. **200 linear meters** covering both lanes
- Affected Convoys: **3 units** (Ambulance `v4`, Fuel Tanker `v6`, Water Tanker `v9`)

**Clearance Status:**
2 heavy excavators from NHIDCL are clearing debris. Estimated clearance window is **5.5 to 6.0 hours**. Central HQ has routed all inbound traffic through the **SH-15 North Bank Bypass**.""",
        "cards": [
            {
                "type": "risk_bar",
                "road": "NH-415 (Km 42)",
                "score": 87,
                "level": "critical"
            },
            {
                "type": "elevation_summary",
                "route": "Route A (via NH-415)",
                "peakElev": 820,
                "maxSlope": 24.5,
                "totalAscent": 1850,
                "status": "Active Mudslide at Km 42"
            }
        ],
        "actions": [
            {"label": "Fly to NH-415 Blockage", "action": "flyToRoad", "target": "nh415-seg1"},
            {"label": "Batch Reroute Stranded", "action": "activateRerouting", "target": "all"},
            {"label": "Show Stopped Vehicles", "action": "chat", "target": "show all stopped vehicles"}
        ],
        "suggestions": [
            "Show all stopped vehicles",
            "Safest route to Itanagar",
            "Simulate NH-415 blockage 6h",
            "Call ambulance driver"
        ],
        "severity": "critical"
    },

    # 12. Stopped / Stranded Vehicles
    "stopped_vehicles": {
        "patterns": [
            r"stopped vehicle",
            r"\bstranded\b",
            r"\bstuck\b",
            r"show.*stopped",
            r"which.*stranded"
        ],
        "text": """### Stranded Fleet Convoys (3 Vehicles at NH-415 Blockage)

1. **AR-01-GH-2345 (Ambulance — Emergency Priority)**
   - Cargo: *Emergency Surgical Equipment & Blood Plasma Units*
   - Driver: Sanjay Taye (+91-9876543213) | Fuel: 71%
   - Location: NH-415 Km 42 (12 km before Pasighat)

2. **AR-05-KL-3456 (Tanker — High Priority)**
   - Cargo: *Diesel Fuel Depot Stock (90% capacity)*
   - Driver: Bikash Mech (+91-9876543215) | Fuel: 90%
   - Location: NH-415 Km 38 Approach

3. **AR-07-QR-1234 (Tanker — Emergency Priority)**
   - Cargo: *Potable Water Supply for Relief Camps*
   - Driver: Tapa Gao (+91-9876543218) | Fuel: 85%
   - Location: NH-415 Km 35

**Immediate Directive:** Initiate automated turn-around and reroute via **Route C (SH-15 North Bank Bypass)** to recover delivery schedule.""",
        "cards": [
            {
                "type": "kpi_grid",
                "items": [
                    {"label": "Medical Supplies", "value": 1, "color": "danger"},
                    {"label": "Fuel Supply", "value": 1, "color": "warning"},
                    {"label": "Potable Water", "value": 1, "color": "danger"},
                    {"label": "Clearance ETA", "value": "5.5h", "color": "danger"}
                ]
            }
        ],
        "actions": [
            {"label": "Reroute All Stranded Convoys", "action": "activateRerouting", "target": "all"},
            {"label": "Call Ambulance Driver", "action": "callDriver", "target": "+91-9876543213"},
            {"label": "Open Emergency Center", "action": "navigate", "target": "/emergency"}
        ],
        "suggestions": [
            "Call ambulance driver",
            "Reroute all stranded vehicles",
            "Why is Route C recommended?",
            "Which vehicles carry medical?"
        ],
        "severity": "critical"
    },

    # 13. Call Driver
    "call_driver": {
        "patterns": [
            r"call.*driver",
            r"contact.*driver",
            r"driver phone",
            r"sanjay taye",
            r"driver contact"
        ],
        "text": """### Driver Telemetry & Communications Contact

- **Vehicle:** `AR-01-GH-2345` (Critical Care Ambulance)
- **Driver:** **Sanjay Taye**
- **Contact Number:** **+91-9876543213**
- **Current Status:** Halted at NH-415 Km 42 (Safe from direct mudflow)
- **Cargo:** *Emergency Surgical Equipment & Blood Units*
- **Fuel Level:** 71% (Sufficient for 260 km detour)
- **Continuous Driving Time:** 3.8 hours (Within safety limit)

**Action:** Telephony link ready for direct cellular patch.""",
        "actions": [
            {"label": "Call Sanjay Taye (+91-9876543213)", "action": "callDriver", "target": "+91-9876543213"},
            {"label": "Dispatch Alternate Route", "action": "activateRerouting", "target": "v4"}
        ],
        "suggestions": [
            "Reroute all stranded vehicles",
            "Safest route to Itanagar",
            "Fleet fuel status",
            "Show all stopped vehicles"
        ],
        "severity": "info"
    },

    # 14. Reroute Stranded Vehicles
    "reroute_stranded": {
        "patterns": [
            r"reroute.*stranded",
            r"activate.*rerout",
            r"reroute all",
            r"execute detour",
            r"activate route c detour"
        ],
        "text": """### Emergency Rerouting Command Executed

**Reroute Target:** Route C (North Bank Safe Bypass via SH-15 & NH-27)

- **Ambulance AR-01-GH-2345:** Turn-around instructed. Heading to SH-15 North Bank interchange. ETA to Pasighat: **3h 40m** (Avoids 6h blockade delay).
- **Fuel Tanker AR-05-KL-3456:** Rerouted via SH-15.
- **Water Tanker AR-07-QR-1234:** Rerouted via SH-15.

**Safety Verification:**
- SH-15 Bridge Approach: Verified Operational
- Slope Gradient on SH-15: 7.4° (Safe)
- Estimated Schedule Recovery: **+92% on-time confidence**.""",
        "cards": [
            {
                "type": "elevation_summary",
                "route": "Route C (via SH-15)",
                "peakElev": 750,
                "maxSlope": 7.4,
                "totalAscent": 1240,
                "status": "Safe & Verified"
            }
        ],
        "actions": [
            {"label": "Open Route Planner", "action": "navigate", "target": "/routes"},
            {"label": "View Live Map", "action": "navigate", "target": "/map"}
        ],
        "suggestions": [
            "Compare all 3 routes",
            "Analyze route elevation",
            "Show analytics & statistics",
            "What's happening right now?"
        ],
        "severity": "success"
    },

    # 15. Compare All 3 Routes
    "compare_routes": {
        "patterns": [
            r"compare",
            r"comparison matrix",
            r"all routes",
            r"route a.*b",
            r"which route.*better",
            r"compare all 3 routes"
        ],
        "text": """### Multi-Modal Route Comparison Matrix

| Corridor Route | Distance & ETA | Hazard Risk | Peak Altitude | Max Slope | Infrastructure Health | Status |
|---|---|---|---|---|---|---|
| **Route C (Safe Bypass)** | **368 km** (5h 30m) | **18% (Low)** | 750m | 7.4° (Safe) | All Bridges Green | **Recommended** |
| **Route A (Direct Highway)** | **335 km** (5h 10m) | **87% (Critical)** | 820m | 24.5° (Hazard) | Active Debris | Blocked |
| **Route B (Southern Arc)** | **412 km** (7h 00m) | **54% (Moderate)**| 185m | 8.5° (Safe) | Lowland Floodplain | Congested |

**Technical Trade-off:**
Route C requires only +33 km additional driving distance (+20 minutes ETA) while reducing hazard risk from 87% to 18% and avoiding the active NH-415 mudslide.""",
        "cards": [
            {
                "type": "route_comparison",
                "routes": [
                    {"label": "Route C (Safe Bypass)", "type": "Safe Bypass", "distance": 368, "duration": 5.5, "risk": 18, "recommended": True, "via": ["NH-27", "SH-15"]},
                    {"label": "Route A (Direct Highway)", "type": "Direct Highway", "distance": 335, "duration": 5.1, "risk": 87, "recommended": False, "via": ["NH-27", "NH-415"]},
                    {"label": "Route B (Southern Arc)", "type": "Southern Corridor", "distance": 412, "duration": 7.0, "risk": 54, "recommended": False, "via": ["NH-37", "NH-715"]}
                ]
            },
            {
                "type": "elevation_summary",
                "route": "Route C (Safe Bypass)",
                "peakElev": 750,
                "maxSlope": 7.4,
                "totalAscent": 1240,
                "status": "Safe Gradient"
            }
        ],
        "actions": [
            {"label": "Open Routes Page", "action": "navigate", "target": "/routes"},
            {"label": "Dispatch Route C", "action": "dispatchRoute", "target": "route-c"}
        ],
        "suggestions": [
            "Why is Route C recommended?",
            "Analyze route elevation",
            "Why is NH-415 blocked?",
            "Show stopped vehicles"
        ],
        "severity": "info"
    },

    # 16. Why is Route C Recommended
    "why_route_c": {
        "patterns": [
            r"why.*route c",
            r"why not route a",
            r"why route c recommended"
        ],
        "text": """### Strategic Justification: Why Route C is Recommended

1. **Avoids Active Blockade:** Route C completely bypasses NH-415 Km 42 (where 200m of mudslide debris has halted traffic).
2. **Minimal Distance Penalty:** Adds only **33 km (+20 mins)** compared to the blocked direct highway.
3. **Safe Topographic Profile:** Maximum slope gradient is **7.4°** compared to 24.5° on Route A and 35.2° on Sela Pass.
4. **Bridge & Pavement Health:** All 6 major river crossings along SH-15 are verified operational with zero flood submergence risk.""",
        "cards": [
            {
                "type": "elevation_summary",
                "route": "Route C (Safe Bypass)",
                "peakElev": 750,
                "maxSlope": 7.4,
                "totalAscent": 1240,
                "status": "Safe & Verified"
            }
        ],
        "actions": [
            {"label": "Dispatch Route C", "action": "dispatchRoute", "target": "route-c"},
            {"label": "Analyze Route Elevation", "action": "chat", "target": "analyze route elevation"}
        ],
        "suggestions": [
            "Analyze route elevation",
            "Safest route to Itanagar",
            "Why is NH-415 blocked?",
            "Show district risk matrix"
        ],
        "severity": "info"
    },

    # 17. Elevation Analysis
    "elevation_analysis": {
        "patterns": [
            r"elevation",
            r"\bslope\b",
            r"\bgradient\b",
            r"\baltitude\b",
            r"topography",
            r"terrain profile",
            r"\bascent\b",
            r"\bheight\b"
        ],
        "text": """### Topographic Elevation & Terrain Gradient Analysis

Northeast India's transport network navigates high-altitude Himalayan topography where slope angle is the second-highest weighted risk factor (28%) in our landslide prediction architecture.

**Corridor Topographic Profiles:**

1. **Route C — Safe Bypass Corridor (SH-15 & NH-27):**
   - Peak Elevation: **750 meters**
   - Maximum Slope Gradient: **7.4° (Safe Threshold)**
   - Cumulative Ascent: **+1,240 meters**
   - Terrain Classification: Stable foothill bypass, fully paved, minimal mudslide vulnerability.

2. **Route A — Direct Highway (NH-27 & NH-415):**
   - Peak Elevation: **820 meters**
   - Maximum Slope Gradient: **24.5° (High Risk Trigger Zone)**
   - Cumulative Ascent: **+1,850 meters**
   - Hazard Point: Km 42 Jeypore cutoff. Extreme slope instability during heavy rainfalls (>40 mm/hr).

3. **Route B — Southern Arc (NH-37 & NH-715):**
   - Peak Elevation: **185 meters**
   - Maximum Slope Gradient: **8.5° (Safe Lowland)**
   - Cumulative Ascent: **+420 meters**
   - Terrain Classification: Low-lying floodplains adjacent to Kaziranga National Park.""",
        "cards": [
            {
                "type": "elevation_summary",
                "route": "Route C (Safe Bypass)",
                "peakElev": 750,
                "maxSlope": 7.4,
                "totalAscent": 1240,
                "status": "Safe Gradient"
            },
            {
                "type": "elevation_summary",
                "route": "Route A (Direct Highway)",
                "peakElev": 820,
                "maxSlope": 24.5,
                "totalAscent": 1850,
                "status": "Critical Landslide Trigger"
            }
        ],
        "actions": [
            {"label": "Open Elevation in Routes", "action": "navigate", "target": "/routes"},
            {"label": "Compare All 3 Corridors", "action": "chat", "target": "compare all 3 routes"}
        ],
        "suggestions": [
            "Compare all 3 routes",
            "Why is Route C recommended?",
            "Why is NH-415 blocked?",
            "Show district risk matrix"
        ],
        "severity": "info"
    },

    # 18. Analytics & Statistics
    "analytics_statistics": {
        "patterns": [
            r"analytics",
            r"statistics",
            r"trend",
            r"scorecard",
            r"bottleneck",
            r"disruption trend",
            r"kpi",
            r"heatmap",
            r"saturation",
            r"soil moisture",
            r"show district risk matrix"
        ],
        "text": """### Operational Analytics & Predictive Intelligence Report

**1. Network Dispatch Performance (24h Trend):**
- Network On-Time Rate: **91.4%** (+6.2% improvement via dynamic rerouting)
- Delayed Convoys: **8.6%** (average delay reduced from 2.0h to 1.2h)
- Weekly Disruptions Avoided: **42 Incidents**

**2. District Soil Moisture Saturation & Hazard Matrix:**

| District & State | Precipitation | Soil Saturation | Slope Gradient | Landslide Risk | Operational Status |
|---|---|---|---|---|---|
| Papum Pare (Itanagar) | 45 mm/h | 88% | 24.5° | 87% | Critical Landslide Zone |
| Kamrup Metro (Guwahati) | 12 mm/h | 42% | 2.4° | 14% | Normal Operations |
| Nagaon & Tezpur | 18 mm/h | 54% | 3.1° | 22% | Safe Corridor Active |
| Golaghat (Kaziranga) | 34 mm/h | 76% | 1.8° | 62% | Flood Warning (Lowland) |
| East Siang (Pasighat) | 28 mm/h | 65% | 14.2° | 48% | Moderate Hill Hazard |
| East Khasi Hills (Shillong) | 38 mm/h | 79% | 18.0° | 58% | Heavy Fog & Wet Pavement |

**3. Arterial Bottlenecks & Critical Chokepoints:**
- **Rank 1:** NH-415 Pasighat — 8 Incidents | Avg Delay: **3.8 hrs** (Active Mudslide)
- **Rank 2:** NH-13 West Siang — 5 Incidents | Avg Delay: **2.4 hrs** (High Risk)
- **Rank 3:** NH-37 Hojai — 4 Incidents | Avg Delay: **1.8 hrs** (Congestion)""",
        "cards": [
            {
                "type": "kpi_grid",
                "items": [
                    {"label": "Network On-Time", "value": "91.4%", "color": "success"},
                    {"label": "Disruptions Avoided", "value": "42", "color": "success"},
                    {"label": "Avg Delay Hours", "value": "1.2h", "color": "warning"},
                    {"label": "Critical Hazards", "value": "1", "color": "danger"}
                ]
            }
        ],
        "actions": [
            {"label": "Open Analytics Hub", "action": "navigate", "target": "/analytics"},
            {"label": "Export Report as CSV", "action": "navigate", "target": "/analytics"}
        ],
        "suggestions": [
            "Disruption trends today",
            "Which road is most dangerous?",
            "Show bottleneck analysis",
            "Explain XGBoost AI model"
        ],
        "severity": "info"
    },

    # 19. Disruption Trends Today
    "disruption_trends": {
        "patterns": [
            r"disruption trends",
            r"disruption history",
            r"past disruption",
            r"incidents this week"
        ],
        "text": """### Regional Disruption Trends & Historical Incident Log

Over the past 7 days, the Northeastern transport network recorded **68 total disruptive events**:
- **Landslides & Mudflows:** 42 events (61.8%) — concentrated along NH-415, NH-13, and NH-13B.
- **Floods & Highway Inundation:** 18 events (26.5%) — primarily along NH-37 Kaziranga lowlands.
- **Structural Bridge Stress:** 8 events (11.7%) — minor joint fractures managed with single-lane flow.

**Key Finding:** Proactive AI rerouting prevented **42 convoy strandings**, saving an estimated **164 vehicle-hours** of idle time.""",
        "cards": [
            {
                "type": "kpi_grid",
                "items": [
                    {"label": "Landslides (7d)", "value": 42, "color": "danger"},
                    {"label": "Floods (7d)", "value": 18, "color": "warning"},
                    {"label": "Bridge Alerts", "value": 8, "color": "warning"},
                    {"label": "Hours Saved", "value": "164h", "color": "success"}
                ]
            }
        ],
        "actions": [
            {"label": "Open Analytics Trends", "action": "navigate", "target": "/analytics"},
            {"label": "Show Bottleneck Analysis", "action": "chat", "target": "show bottleneck analysis"}
        ],
        "suggestions": [
            "Which road is most dangerous?",
            "Show bottleneck analysis",
            "All AI risk predictions",
            "Show analytics & statistics"
        ],
        "severity": "info"
    },

    # 20. Which Road is Most Dangerous
    "dangerous_roads": {
        "patterns": [
            r"most dangerous",
            r"highest hazard",
            r"riskiest road",
            r"dangerous highway"
        ],
        "text": """### Arterial Hazard Ranking (Northeast India Corridors)

1. **NH-415 Dibrugarh–Pasighat:** **87% Risk (Critical)**
   - Active mudslide debris at Km 42. Continuous 85 mm/hr downpour. Total blockage.
2. **NH-13 Itanagar–Along (West Siang):** **72% Risk (High Alert)**
   - Steep 28.4° rock face slopes. Convoy escort required; night travel restricted after 20:00.
3. **NH-13B Tezpur–Tawang (Sela Pass):** **68% Risk (High Alert)**
   - High altitude (13,700 ft) with sub-zero freezing fog and 35.2° slope gradient.
4. **NH-37 Guwahati–Lumding:** **52% Risk (Moderate Caution)**
   - Waterlogging near Kaziranga overflow channels.""",
        "cards": [
            {
                "type": "risk_bar",
                "road": "NH-415 (East Siang)",
                "score": 87,
                "level": "critical"
            },
            {
                "type": "risk_bar",
                "road": "NH-13 (West Siang)",
                "score": 72,
                "level": "high"
            },
            {
                "type": "risk_bar",
                "road": "NH-13B (Tawang)",
                "score": 68,
                "level": "high"
            }
        ],
        "actions": [
            {"label": "Why is NH-415 Blocked?", "action": "chat", "target": "why is NH-415 blocked?"},
            {"label": "Explain Sela Pass", "action": "chat", "target": "explain sela pass conditions"}
        ],
        "suggestions": [
            "Why is NH-415 blocked?",
            "Explain Sela Pass conditions",
            "All AI risk predictions",
            "Compare all 3 routes"
        ],
        "severity": "critical"
    },

    # 21. Sela Pass Conditions
    "sela_pass": {
        "patterns": [
            r"sela pass",
            r"tawang route",
            r"nh-13b",
            r"nh13b"
        ],
        "text": """### High-Altitude Assessment: NH-13B Tezpur–Tawang (Sela Pass)

- **Altitude:** 13,700 feet (4,170 meters)
- **Current Temperature:** -2°C (Freezing drizzle & dense fog)
- **Visibility:** Under 50 meters
- **Slope Gradient:** **35.2° (Extreme Himalayan Gradient)**
- **Operational Advisory:**
  - 4WD / High-Clearance convoys mandatory.
  - Tire chains recommended above Baisakhi point.
  - Night travel strictly prohibited between 18:00 and 06:00.""",
        "cards": [
            {
                "type": "risk_bar",
                "road": "NH-13B (Sela Pass 13,700 ft)",
                "score": 68,
                "level": "high"
            }
        ],
        "actions": [
            {"label": "View on Map", "action": "navigate", "target": "/map"},
            {"label": "All AI Risk Predictions", "action": "chat", "target": "all ai risk predictions"}
        ],
        "suggestions": [
            "All AI risk predictions",
            "Which road is most dangerous?",
            "Analyze route elevation",
            "Weather in my district"
        ],
        "severity": "warning"
    },

    # 22. All AI Risk Predictions
    "ai_predictions": {
        "patterns": [
            r"all.*prediction",
            r"ai prediction",
            r"risk prediction",
            r"landslide forecast"
        ],
        "text": """### Active AI Landslide & Hazard Risk Forecasts (Next 6–12 Hours)

1. **NH-415 (East Siang):** **87% Critical** — Confirmed 200m mudflow. Action: Detour via Route C.
2. **NH-13 (West Siang):** **72% High** — Slope saturation rising. Action: 4WD convoy escort only.
3. **NH-13B (Tawang / Sela Pass):** **68% High** — Icy fog. Action: Daylight movement only.
4. **NH-37 (Nagaon):** **52% Medium** — Water accumulation. Action: High-clearance pass.
5. **NH-27 (Guwahati–Jorhat):** **18% Low** — Fully clear. Action: Primary arterial route.""",
        "cards": [
            {
                "type": "kpi_grid",
                "items": [
                    {"label": "NH-415 Risk", "value": "87%", "color": "danger"},
                    {"label": "NH-13 Risk", "value": "72%", "color": "danger"},
                    {"label": "NH-13B Risk", "value": "68%", "color": "warning"},
                    {"label": "NH-27 Risk", "value": "18%", "color": "success"}
                ]
            }
        ],
        "actions": [
            {"label": "Open Analytics", "action": "navigate", "target": "/analytics"},
            {"label": "Explain XGBoost Model", "action": "chat", "target": "explain xgboost ai model"}
        ],
        "suggestions": [
            "Explain XGBoost AI model",
            "Which road is most dangerous?",
            "Why is NH-415 blocked?",
            "Show district risk matrix"
        ],
        "severity": "info"
    },

    # 23. Explain XGBoost Model
    "ml_architecture": {
        "patterns": [
            r"xgboost",
            r"machine learning",
            r"ai model",
            r"how.*predict",
            r"algorithm",
            r"neural",
            r"model architecture"
        ],
        "text": """### Machine Learning Architecture: XGBoost Topographic Classifier (v2.4)

The platform employs a gradient-boosted decision tree ensemble trained on Geological Survey of India (GSI) landslide telemetry, IMD precipitation radar, and SRTM digital elevation data.

**Feature Importance Weights:**
- **Rainfall Intensity (32%):** Hourly precipitation in mm/hr (critical threshold: >50 mm/h).
- **Terrain Slope Gradient (28%):** Digital elevation slope in degrees (slopes >15° combined with saturation >75% yield 87% landslide probability).
- **Soil Moisture Saturation (22%):** Volumetric water content in the subsoil.
- **Historical Recurrence Rate (18%):** Past disruption frequency index for the specific highway stretch.

**Current Active Predictions:**
- **NH-415 Km 42:** 87% Risk (Critical Triggered — 200m active mudslide)
- **NH-13 West Siang:** 72% Risk (High Alert — Convoy escort recommended)
- **NH-27 North Bank:** 18% Risk (Clear & Operational)""",
        "cards": [
            {
                "type": "kpi_grid",
                "items": [
                    {"label": "Rainfall Weight", "value": "32%", "color": "warning"},
                    {"label": "Slope Weight", "value": "28%", "color": "warning"},
                    {"label": "Soil Saturation", "value": "22%", "color": "warning"},
                    {"label": "Hist. Recurrence", "value": "18%", "color": "warning"}
                ]
            }
        ],
        "actions": [
            {"label": "Open Analytics ML Tab", "action": "navigate", "target": "/analytics"},
            {"label": "View Route Elevation", "action": "navigate", "target": "/routes"}
        ],
        "suggestions": [
            "Show district risk matrix",
            "All AI risk predictions",
            "Why is NH-415 blocked?",
            "Analyze route elevation"
        ],
        "severity": "info"
    },

    # 24. Field Reports Today
    "field_reports": {
        "patterns": [
            r"field report",
            r"ground incident",
            r"officer report",
            r"field feed"
        ],
        "text": """### Ground Field Incident Feed (3 Logged Reports)

1. **NH-415 Km 42 (Landslide — Critical)**
   - Logged: 1h ago by Officer Sunil Pegu (East Siang)
   - Status: Impassable. 200m boulder slurry. NHIDCL excavators on site.

2. **NH-37 Near Kaziranga (Flood — Warning)**
   - Logged: 2h ago by Driver Mahesh Gogoi
   - Status: 30cm water depth across asphalt. Heavy trucks passable.

3. **SH-15 Bridge Approach (Bridge Stress — Warning)**
   - Logged: 30m ago by Officer Rani Borah
   - Status: Surface crack along approach span. Single-lane alternate traffic active.""",
        "cards": [
            {
                "type": "kpi_grid",
                "items": [
                    {"label": "Active Reports", "value": 3, "color": "danger"},
                    {"label": "Synced to HQ", "value": 2, "color": "success"},
                    {"label": "Offline Queued", "value": 1, "color": "warning"},
                    {"label": "Patrol Officers", "value": 4, "color": "success"}
                ]
            }
        ],
        "actions": [
            {"label": "Open Field Dashboard", "action": "navigate", "target": "/"},
            {"label": "Check Offline Sync", "action": "chat", "target": "offline sync status"}
        ],
        "suggestions": [
            "Offline sync status",
            "Open roads near East Siang",
            "Weather in my district",
            "Emergency contacts"
        ],
        "severity": "info"
    },

    # 25. Offline Sync Status
    "offline_sync": {
        "patterns": [
            r"offline sync",
            r"sync status",
            r"queue status",
            r"pending sync"
        ],
        "text": """### Offline Local Storage & Grid Sync Telemetry

- **Central HQ Link:** Online (Low Latency 18ms)
- **Local Storage Cache:** Active & Encrypted
- **Synced Reports:** 2 reports successfully stored on Central HQ database
- **Pending Reports:** 1 report (SH-15 Bridge Stress Inspection)
- **Automatic Sync:** Background sync worker triggers packet handshake every 30 seconds when network is detected.""",
        "actions": [
            {"label": "Sync Now", "action": "syncReports", "target": "all"},
            {"label": "Field Reports Today", "action": "chat", "target": "field reports today"}
        ],
        "suggestions": [
            "Field reports today",
            "Open roads near East Siang",
            "Which roads are safe?",
            "Emergency contacts"
        ],
        "severity": "info"
    },

    # 26. Open Roads / Safe Roads
    "safe_roads": {
        "patterns": [
            r"open road",
            r"safe road",
            r"which roads are safe",
            r"roads near east siang"
        ],
        "text": """### Highway Passability Status (Sector Breakdown)

**Clear & Fully Open Corridors (Green):**
- **NH-27 Guwahati–Jorhat:** 100% Open (18% Risk)
- **SH-15 North Lakhimpur–Itanagar:** 100% Open (Safe bypass route)
- **NH-6 Guwahati–Shillong:** 100% Open (22% Risk)
- **NH-715 Lumding–Dibrugarh:** 100% Open (24% Risk)

**Restricted / Impassable Corridors:**
- **NH-415 Dibrugarh–Pasighat:** **BLOCKED at Km 42** (Active Landslide)
- **NH-13 Itanagar–Along:** **Partial (Caution)** (Rockfall risk)
- **NH-13B Tezpur–Tawang:** **Partial (Caution)** (Sela Pass fog/ice)""",
        "actions": [
            {"label": "Safest Route to Itanagar", "action": "chat", "target": "safest route to itanagar"},
            {"label": "View on Map", "action": "navigate", "target": "/map"}
        ],
        "suggestions": [
            "Safest route to Itanagar",
            "Weather in my district",
            "Field reports today",
            "Why is NH-415 blocked?"
        ],
        "severity": "info"
    },

    # 27. Weather in District
    "weather_district": {
        "patterns": [
            r"weather.*district",
            r"weather in east siang",
            r"weather in my district",
            r"weather forecast"
        ],
        "text": """### Sector Meteorological Telemetry (East Siang District)

- **Condition:** Heavy Monsoonal Downpour
- **Precipitation Rate:** **84 mm/hr (Extreme Intensity)**
- **Relative Humidity:** 95%
- **Surface Visibility:** **1.2 km (Fog & Rain Obscuration)**
- **Wind Velocity:** 42 km/h gusts
- **Soil Moisture Saturation:** **88% (Exceeds 75% Slope Stability Threshold)**

**Alert:** High probability of secondary debris slumping along steep river cuttings over the next 4 hours.""",
        "cards": [
            {
                "type": "risk_bar",
                "road": "East Siang Landslide Risk",
                "score": 87,
                "level": "critical"
            }
        ],
        "actions": [
            {"label": "View Weather Radar", "action": "navigate", "target": "/"},
            {"label": "Show District Risk Matrix", "action": "chat", "target": "show district risk matrix"}
        ],
        "suggestions": [
            "Open roads near East Siang",
            "Show district risk matrix",
            "Why is NH-415 blocked?",
            "Field reports today"
        ],
        "severity": "warning"
    },

    # 28. Emergency Contacts
    "emergency_contacts": {
        "patterns": [
            r"emergency contact",
            r"driver contact list",
            r"phone list",
            r"contact directory"
        ],
        "text": """### Operational Communications Directory

**Stranded Convoy Drivers:**
- Sanjay Taye (Ambulance `v4`): **+91-9876543213**
- Bikash Mech (Fuel Tanker `v6`): **+91-9876543215**
- Tapa Gao (Water Tanker `v9`): **+91-9876543218**

**Sector Field Officers:**
- Sunil Pegu (East Siang Sector): **+91-9876543230**
- Rani Borah (Jorhat / SH-15 Sector): **+91-9876543231**

**Engineering & Emergency Services:**
- NHIDCL Highway Clearance Unit: **+91-9876543299**
- State Disaster Response Force (SDRF): **1077 / +91-9876543288**""",
        "actions": [
            {"label": "Call Ambulance Driver", "action": "callDriver", "target": "+91-9876543213"},
            {"label": "Show Stopped Vehicles", "action": "chat", "target": "show all stopped vehicles"}
        ],
        "suggestions": [
            "Call ambulance driver",
            "Show all stopped vehicles",
            "System health check",
            "Morning briefing"
        ],
        "severity": "info"
    },

    # 29. Medical Vehicles
    "medical_vehicles": {
        "patterns": [
            r"medical",
            r"surgical",
            r"blood units",
            r"vaccine",
            r"which vehicles carry medical"
        ],
        "text": """### Life-Critical Medical Freight Telemetry (4 Convoys)

1. **AR-01-GH-2345 (Ambulance — Emergency Priority)**
   - Cargo: *Emergency Surgical Equipment & Blood Units*
   - Status: **Stopped at NH-415 Km 42** | Driver: Sanjay Taye (+91-9876543213)
   - Action: Rerouted via SH-15 North Bank.

2. **AS-01-AB-1234 (Heavy Truck — High Priority)**
   - Cargo: *Essential Medicines & Cold-Chain Vaccines*
   - Status: **On Route (NH-27, 52 km/h)** | Destination: Jorhat

3. **AS-25-WX-9012 (Van — High Priority)**
   - Cargo: *Dialysis Supplies*
   - Status: **On Route (SH-15, 55 km/h)** | Destination: North Lakhimpur

4. **AR-09-UV-5678 (Rescue Vehicle — Emergency Priority)**
   - Cargo: *Rescue Equipment & First Aid Kits*
   - Status: **On Route (NH-13B, 38 km/h)** | Destination: Tawang""",
        "cards": [
            {
                "type": "kpi_grid",
                "items": [
                    {"label": "Medical Convoys", "value": 4, "color": "success"},
                    {"label": "On Route", "value": 3, "color": "success"},
                    {"label": "Stranded Units", "value": 1, "color": "danger"},
                    {"label": "Detour Assigned", "value": 1, "color": "warning"}
                ]
            }
        ],
        "actions": [
            {"label": "Call Ambulance Driver", "action": "callDriver", "target": "+91-9876543213"},
            {"label": "Reroute Stranded Units", "action": "activateRerouting", "target": "all"}
        ],
        "suggestions": [
            "Call ambulance driver",
            "Show all stopped vehicles",
            "Safest route to Itanagar",
            "Fleet fuel status"
        ],
        "severity": "info"
    },

    # 30. District Health Scores
    "district_scores": {
        "patterns": [
            r"district health score",
            r"district scorecard",
            r"show district health scores",
            r"district scores"
        ],
        "text": """### Composite District Health Scorecard (Northeast India)

- **Guwahati (Kamrup Metro):** **88 / 100** (Low Risk · 4 Active Convoys)
- **Jorhat (Assam):** **90 / 100** (Low Risk · All Corridors Green)
- **Shillong (Meghalaya):** **91 / 100** (Low Risk · Normal Operations)
- **Nagaon (Assam):** **72 / 100** (Medium Risk · NH-37 Congestion)
- **Itanagar (Papum Pare):** **71 / 100** (Medium Risk · High Soil Moisture)
- **Dibrugarh (Assam):** **64 / 100** (Medium Risk · 1 Blocked Segment)
- **Tawang (Arunachal):** **59 / 100** (Medium Risk · Sela Pass Fog)
- **East Siang (Arunachal):** **36 / 100 (CRITICAL)** — 2 Blocked Highways, 87% Landslide Trigger.""",
        "cards": [
            {
                "type": "kpi_grid",
                "items": [
                    {"label": "Guwahati Score", "value": "88/100", "color": "success"},
                    {"label": "Jorhat Score", "value": "90/100", "color": "success"},
                    {"label": "Shillong Score", "value": "91/100", "color": "success"},
                    {"label": "East Siang Score", "value": "36/100", "color": "danger"}
                ]
            }
        ],
        "actions": [
            {"label": "Show District Risk Matrix", "action": "chat", "target": "show district risk matrix"},
            {"label": "Open Analytics Hub", "action": "navigate", "target": "/analytics"}
        ],
        "suggestions": [
            "Show district risk matrix",
            "Show analytics & statistics",
            "What's the biggest risk?",
            "Show all active alerts"
        ],
        "severity": "info"
    },

    # 31. What's the Biggest Risk
    "biggest_risk": {
        "patterns": [
            r"biggest risk",
            r"primary hazard",
            r"main threat",
            r"what.s the biggest risk"
        ],
        "text": """### Primary Operational Hazard Assessment

The single highest operational risk in the network is the **NH-415 Pasighat Corridor Blockade (87% Landslide Risk)**.

**Key Threats:**
1. **Supply Chain Disruption:** Cuts off primary road access to East Siang and upper Arunachal districts.
2. **Critical Cargo Delay:** Ambulance carrying surgical equipment is delayed until Route C detour is fully executed.
3. **Soil Moisture Saturation:** Continuous 84 mm/hr rain is threatening adjacent slopes along Km 38 to Km 48.

**Mitigation Plan:**
Enforce immediate mandatory diversion for all traffic at the North Lakhimpur interchange into **Route C (SH-15 North Bank Bypass)**.""",
        "cards": [
            {
                "type": "risk_bar",
                "road": "NH-415 Km 42 Threat Index",
                "score": 87,
                "level": "critical"
            }
        ],
        "actions": [
            {"label": "Why is NH-415 Blocked?", "action": "chat", "target": "why is NH-415 blocked?"},
            {"label": "Simulate 6h Blockage", "action": "chat", "target": "simulate nh-415 blockage 6h"}
        ],
        "suggestions": [
            "Why is NH-415 blocked?",
            "Simulate NH-415 blockage 6h",
            "Compare all 3 routes",
            "Show all stopped vehicles"
        ],
        "severity": "critical"
    },

    # 32. Active Alerts
    "active_alerts": {
        "patterns": [
            r"active alert",
            r"all alert",
            r"critical alert",
            r"show.*alert"
        ],
        "text": """### Active Priority Alerts (5 System Alerts)

1. **[CRITICAL] NH-415 Blocked — Landslide Confirmed at Km 42**
   - Location: NH-415 East Siang | Affected: 3 Convoys (`v4`, `v6`, `v9`)
2. **[CRITICAL] Emergency Ambulance Stranded — AR-01-GH-2345**
   - Location: NH-415 blockage | Cargo: Surgical equipment & blood units
3. **[CRITICAL] Landslide Risk 72% — NH-13 West Siang**
   - Location: NH-13 Km 88 | Alert Source: XGBoost AI Model
4. **[WARNING] Heavy Precipitation Radar — East Siang 84 mm/hr**
   - Location: East Siang District | Alert Source: IMD Radar
5. **[WARNING] Convoy Delay Alert — NH-37 Hojai Sector**
   - Location: NH-37 Hojai | Affected: 2 Convoys (`v3`, `v7`)""",
        "cards": [
            {
                "type": "kpi_grid",
                "items": [
                    {"label": "Critical Alerts", "value": 3, "color": "danger"},
                    {"label": "Warning Alerts", "value": 2, "color": "warning"},
                    {"label": "Resolved (24h)", "value": 14, "color": "success"},
                    {"label": "Active Convoys", "value": 12, "color": "success"}
                ]
            }
        ],
        "actions": [
            {"label": "Acknowledge Alerts", "action": "acknowledgeAll", "target": "all"},
            {"label": "Open Emergency Center", "action": "navigate", "target": "/emergency"}
        ],
        "suggestions": [
            "Why is NH-415 blocked?",
            "Show all stopped vehicles",
            "Morning briefing",
            "System health check"
        ],
        "severity": "critical"
    },

    # 33. Siliguri Corridor
    "siliguri_corridor": {
        "patterns": [
            r"siliguri corridor",
            r"chicken.s neck",
            r"geography",
            r"terrain challenge",
            r"logistics challenge"
        ],
        "text": """### Regional Logistics Context: The Siliguri Corridor ("Chicken's Neck")

The Siliguri Corridor is a narrow 22-kilometer land bridge connecting mainland India to all 8 Northeastern states.

**Key Logistics Vulnerabilities:**
1. **Single Point of Inbound Failure:** All freight entering Assam, Meghalaya, and Arunachal must transit this passage.
2. **Brahmaputra Flood Dynamics:** Monsoonal flooding regularly submerges arterial connections along the southern bank (NH-37).
3. **High-Altitude Himalayan Chokepoints:** Landslides and steep gradients (>25°) routinely sever northern routes, making multi-modal redundancy (Route C bypass) vital.""",
        "actions": [
            {"label": "Compare All 3 Routes", "action": "chat", "target": "compare all 3 routes"},
            {"label": "View Live Map", "action": "navigate", "target": "/map"}
        ],
        "suggestions": [
            "Compare all 3 routes",
            "Explain XGBoost AI model",
            "Show analytics & statistics",
            "What's happening right now?"
        ],
        "severity": "info"
    },

    # 34. Fuel Status
    "fuel_status": {
        "patterns": [
            r"\bfuel\b",
            r"\bdiesel\b",
            r"low fuel",
            r"refuel",
            r"fleet fuel"
        ],
        "text": """### Fleet Fuel & Range Telemetry (12 Vehicles)

- **Average Fleet Fuel Level:** **72.4%**
- **Critical Fuel Alert (< 30%):** **0 Vehicles**
- **Lowest Fuel Unit:** `v5` (AR-03-IJ-5678, Truck) — **44% Fuel** (~140 km range remaining)
- **Stranded Units Fuel:**
  - `v4` (Ambulance): **71%** (Safe for detour)
  - `v6` (Fuel Tanker): **90%** (Full reserves)
  - `v9` (Water Tanker): **85%** (Safe for detour)

All active convoys possess sufficient diesel reserves to complete rerouted journeys through the SH-15 North Bank corridor.""",
        "cards": [
            {
                "type": "kpi_grid",
                "items": [
                    {"label": "Average Fuel", "value": "72.4%", "color": "success"},
                    {"label": "Low Fuel Units", "value": "0", "color": "success"},
                    {"label": "Lowest Unit", "value": "44%", "color": "warning"},
                    {"label": "Refuel Depots Open", "value": "8", "color": "success"}
                ]
            }
        ],
        "actions": [
            {"label": "Open Fleet Management", "action": "navigate", "target": "/fleet"},
            {"label": "Show All Vehicles", "action": "chat", "target": "show all vehicles"}
        ],
        "suggestions": [
            "Show all stopped vehicles",
            "Safest route to Itanagar",
            "Why is NH-415 blocked?",
            "Morning briefing"
        ],
        "severity": "info"
    },

    # 35. System Health Check
    "system_health": {
        "patterns": [
            r"system health",
            r"health check",
            r"subsystem",
            r"diagnostic"
        ],
        "text": """### NER Logistics Platform Subsystem Health Diagnostic

- **GPS Telemetry Ingestion:** **100% Operational** (12/12 vehicle transponders active)
- **Topographic Landslide AI (XGBoost v2.4):** **Online** (Inference latency: 42ms)
- **OSRM Topological Routing Engine:** **Online** (Multi-modal graph active)
- **IMD Weather & Precipitation Radar:** **Connected** (Refreshed 8 min ago)
- **Offline Local Sync Queue:** **Synced** (Zero lost data packets)
- **Network Dispatch Efficiency:** **91.4% on-time delivery rate**""",
        "cards": [
            {
                "type": "kpi_grid",
                "items": [
                    {"label": "System Uptime", "value": "99.98%", "color": "success"},
                    {"label": "AI Latency", "value": "42ms", "color": "success"},
                    {"label": "Active Nodes", "value": "8 States", "color": "success"},
                    {"label": "Sync Status", "value": "Live", "color": "success"}
                ]
            }
        ],
        "actions": [
            {"label": "View Settings", "action": "navigate", "target": "/settings"},
            {"label": "Command Center", "action": "navigate", "target": "/"}
        ],
        "suggestions": [
            "Show all active alerts",
            "Show analytics & statistics",
            "Why is NH-415 blocked?",
            "Morning briefing"
        ],
        "severity": "info"
    },

    # 36. Morning Briefing
    "morning_briefing": {
        "patterns": [
            r"morning briefing",
            r"\bbriefing\b",
            r"daily briefing",
            r"start my day",
            r"today.s status"
        ],
        "text": """### Operational Morning Briefing

**Executive Summary:**
- Critical Incidents: **2 requiring immediate command action**
- Active Fleet: **6 on-route · 3 delayed · 3 stopped**
- Blocked Infrastructure: **1 Highway Segment (NH-415 Km 42)**
- Overall Network On-Time Rate: **91.4%**

**Primary Risk Focus:**
- **NH-415 East Siang:** 87% Critical Landslide Risk. 200m mudslide at Km 42.

**Priority Action Items:**
1. Reroute 3 stranded convoys (Ambulance `v4`, Fuel `v6`, Water `v9`) via **Route C (SH-15 North Bank)**.
2. Monitor East Siang telemetry (84 mm/hr heavy rainfall).
3. Verify SH-15 bridge expansion joints clearance.""",
        "cards": [
            {
                "type": "kpi_grid",
                "items": [
                    {"label": "Critical Incidents", "value": 2, "color": "danger"},
                    {"label": "Active Fleet", "value": 6, "color": "success"},
                    {"label": "Stopped Units", "value": 3, "color": "danger"},
                    {"label": "Delayed Units", "value": 3, "color": "warning"}
                ]
            },
            {
                "type": "risk_bar",
                "road": "NH-415 (East Siang)",
                "score": 87,
                "level": "critical"
            }
        ],
        "actions": [
            {"label": "Why is NH-415 Blocked?", "action": "chat", "target": "why is NH-415 blocked?"},
            {"label": "Show Stopped Vehicles", "action": "chat", "target": "show all stopped vehicles"},
            {"label": "Open Command Center", "action": "navigate", "target": "/"}
        ],
        "suggestions": [
            "Why is NH-415 blocked?",
            "Show all stopped vehicles",
            "Safest route to Itanagar",
            "Analyze route elevation"
        ],
        "severity": "info"
    },

    # 37. Safest Route to Itanagar
    "safest_route_itanagar": {
        "patterns": [
            r"safest route.*itanagar",
            r"best route.*itanagar",
            r"route to itanagar",
            r"drive to itanagar",
            r"how to reach itanagar"
        ],
        "text": """### Recommended Safe Route: Guwahati to Itanagar

**AI Dispatch Recommendation:** **Route C (North Bank Safe Bypass via NH-27 & SH-15)**

- Distance: **368 km** (Estimated Driving Time: **5 hours 30 mins**)
- Landslide Hazard Risk: **18% (Low)**
- Maximum Terrain Slope: **7.4° (Safe)**
- Structural Infrastructure: All bridges along SH-15 verified operational.

**Why avoid the direct NH-415 route?**
The direct highway via NH-415 is completely blocked at Km 42 by a 200m active mudslide (87% hazard score). Taking Route C adds only +33 km but guarantees cargo safety.""",
        "cards": [
            {
                "type": "elevation_summary",
                "route": "Route C (via SH-15)",
                "peakElev": 750,
                "maxSlope": 7.4,
                "totalAscent": 1240,
                "status": "Safe & Verified"
            }
        ],
        "actions": [
            {"label": "Dispatch Route C", "action": "dispatchRoute", "target": "route-c"},
            {"label": "Compare All 3 Routes", "action": "chat", "target": "compare all 3 routes"}
        ],
        "suggestions": [
            "Why is Route C recommended?",
            "Analyze route elevation",
            "Why is NH-415 blocked?",
            "Show stopped vehicles"
        ],
        "severity": "info"
    },

    # 38. Impact Simulation
    "impact_simulation": {
        "patterns": [
            r"what if",
            r"simulate",
            r"\bimpact\b",
            r"6 hour",
            r"if.*stays blocked"
        ],
        "text": """### What-If Disruption Simulation: NH-415 Blocked for 6 Hours

| Operational Metric | Normal Baseline | Without Dynamic Rerouting | With AI Auto-Detour (Route C) |
|---|---|---|---|
| **Regional On-Time Rate** | 91.4% | **62.8% (Severe Drop)** | **88.2% (Protected)** |
| **Average Delay per Convoy** | 24 min | **210 min (3.5 hrs)** | **35 min** |
| **Stranded Convoys** | 0 | **3 vehicles** | **0 vehicles** |

**Critical Cargo At Risk:**
- Surgical Equipment & Blood Supplies (`v4`)
- Regional Fuel Depot Diesel Supply (`v6`)
- Potable Drinking Water (`v9`)

**Recommendation:** Execute immediate batch detour via Route C to bypass the entire chokepoint.""",
        "cards": [
            {
                "type": "risk_bar",
                "road": "NH-415 (Simulated 6h Impact)",
                "score": 87,
                "level": "critical"
            }
        ],
        "actions": [
            {"label": "Activate Dynamic Reroute", "action": "activateRerouting", "target": "all"},
            {"label": "Open Emergency Dashboard", "action": "navigate", "target": "/emergency"}
        ],
        "suggestions": [
            "Show all stopped vehicles",
            "Safest route to Itanagar",
            "Why is NH-415 blocked?",
            "Compare all 3 routes"
        ],
        "severity": "warning"
    }
}

# ── Dynamic Chained Matcher with Real-Time Context Injection ──────────────

def resolve_query(message: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    m = message.lower().strip()
    context = context or {}

    matched_key = None
    matched_data = None

    for key, data in KNOWLEDGE_CHAIN.items():
        for pat in data["patterns"]:
            if re.search(pat, m, re.IGNORECASE):
                matched_key = key
                matched_data = data
                break
        if matched_key:
            break

    if not matched_data:
        matched_key = "situation_overview"
        matched_data = KNOWLEDGE_CHAIN["situation_overview"]

    text = matched_data["text"]
    cards = list(matched_data.get("cards", []))
    actions = list(matched_data.get("actions", []))
    suggestions = list(matched_data.get("suggestions", []))
    severity = matched_data.get("severity", "info")
    mapCommand = matched_data.get("mapCommand")

    # Dynamic Real-Data Context Injection
    fleet = context.get("fleetSummary", {})
    hazards = context.get("hazardSummary", {})
    weather = context.get("weatherTelemetry", [])
    roads = context.get("roadNetwork", [])

    if matched_key == "situation_overview" and fleet:
        total = fleet.get("total", 10)
        on_route = fleet.get("onRoute", 6)
        delayed = fleet.get("delayed", 3)
        stopped = fleet.get("stopped", 1)
        critical_count = hazards.get("criticalCount", 2)

        text = f"""### Regional Logistics Situation Overview (Live Telemetry)

**Active Fleet Distribution ({total} Total Convoys):**
- On Route: **{on_route} convoys** (Normal transit speed)
- Delayed: **{delayed} convoys** (Slowed by mountain terrain / rain)
- Stopped: **{stopped} convoys** (Halted at hazard blockades)

**Highway Infrastructure Status:**
- **Critical Alerts:** {critical_count} active hazard alerts
- **Primary Blockade:** NH-415 Dibrugarh–Pasighat (Active Landslide at Km 42)
- **Designated Safe Corridor:** SH-15 North Bank Safe Bypass (Risk: 18%)

**Highest Priority Command Alert:**
Emergency Ambulance `AR-01-GH-2345` (carrying critical surgical equipment) is halted near Pasighat. Reroute via **SH-15 North Bank Bypass** is recommended."""

        cards = [
            {
                "type": "kpi_grid",
                "items": [
                    {"label": "On Route", "value": on_route, "color": "success"},
                    {"label": "Delayed", "value": delayed, "color": "warning"},
                    {"label": "Stopped", "value": stopped, "color": "danger"},
                    {"label": "Critical Hazards", "value": critical_count, "color": "danger"},
                ],
            },
            {
                "type": "risk_bar",
                "road": "NH-415 (East Siang)",
                "score": 87,
                "level": "critical",
            },
        ]

    elif matched_key == "stopped_vehicles" and fleet.get("stoppedList"):
        stopped_list = fleet.get("stoppedList", [])
        lines = []
        for v in stopped_list:
            lines.append(f"- **{v.get('reg', 'Vehicle')}** ({v.get('cargo', 'Supplies')}) — Driver: **{v.get('driver', 'Unknown')}** ({v.get('phone', 'N/A')})")

        text = f"""### Stranded Fleet Convoys ({len(stopped_list)} Vehicles at Blockade)

{chr(10).join(lines)}

**Immediate Directive:** Initiate automated turn-around and reroute via **Route C (SH-15 North Bank Bypass)** to recover delivery schedule."""

    elif matched_key in ("dangerous_roads", "analytics_statistics") and roads:
        sorted_roads = sorted(roads, key=lambda r: r.get("risk", 0), reverse=True)[:4]
        road_cards = [
            {"type": "risk_bar", "road": f"{r.get('name', 'Road')}", "score": round(r.get("risk", 0)), "level": "critical" if r.get("risk", 0) >= 70 else "high" if r.get("risk", 0) >= 60 else "medium"}
            for r in sorted_roads
        ]
        cards = road_cards

    return {
        "intent": matched_key,
        "text": text,
        "cards": cards,
        "actions": actions,
        "suggestions": suggestions,
        "severity": severity,
        "mapCommand": mapCommand,
    }

# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatMessage):
    msg = req.message.strip()
    if not msg:
        msg = "situation overview"
    result = resolve_query(msg, req.context)
    return ChatResponse(**result)

@router.get("/suggestions")
async def get_suggestions(role: str = "operator"):
    return {
        "suggestions": [
            "What's happening right now?",
            "Why is NH-415 blocked?",
            "Show all stopped vehicles",
            "Analyze route elevation",
            "Show analytics & statistics",
            "Compare all 3 routes"
        ]
    }
