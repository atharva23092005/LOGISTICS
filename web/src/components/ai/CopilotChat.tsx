/**
 * NER Operations Copilot Chat — Complete Closed-Loop Chained Intelligence v6
 *
 * Full question & follow-up chaining across all domains:
 *  - Operator / Dispatch / Route Comparison
 *  - Analytics / Soil Saturation / XGBoost Model / Disruption History
 *  - Field Ground Patrol / Checkpoints / Offline Storage
 *  - Executive / Command Center / Emergency SOS
 */
import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  X, Send, Cpu, Loader2, AlertTriangle, Zap,
  CornerDownRight, RefreshCw, Mountain, ShieldCheck, TrendingUp
} from 'lucide-react'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/button'
import { useAppStore }     from '@/stores/appStore'
import { useVehicleStore } from '@/stores/vehicleStore'
import { useMapStore }     from '@/stores/mapStore'

// ── Selectors ─────────────────────────────────────────────────────────────────
const selUser       = (s: ReturnType<typeof useAppStore.getState>)     => s.user
const selSelVehicle = (s: ReturnType<typeof useVehicleStore.getState>) => s.selectedVehicleId
const selFlyTo      = (s: ReturnType<typeof useMapStore.getState>)     => s.flyTo

// ── Types ─────────────────────────────────────────────────────────────────────
interface CopilotMessage {
  id:          string
  role:        'user' | 'bot'
  text:        string
  cards?:      CopilotCard[]
  actions?:    CopilotAction[]
  followUps?:  string[]
  severity?:   string
  loading?:    boolean
  isTyping?:   boolean
  timestamp?:  string
}
interface CopilotCard   { type: string; [key: string]: unknown }
interface CopilotAction { label: string; action: string; target: string | null; confirm?: boolean }
interface MapCommand    { action: string; id?: string; district?: string; coords?: number[] }

interface CopilotResponsePayload {
  intent: string
  text: string
  cards?: CopilotCard[]
  actions?: CopilotAction[]
  suggestions?: string[]
  severity?: string
  mapCommand?: MapCommand
}

// ── Preloaded quick question sets ─────────────────────────────────────────────
const QUICK_QUESTIONS = {
  operator: [
    "What's happening right now?",
    "Why is NH-415 blocked?",
    "Show all stopped vehicles",
    "Analyze route elevation",
    "Show analytics & statistics",
    "Compare all 3 routes",
    "Explain XGBoost AI model",
    "Morning briefing",
  ],
  analyst: [
    "Show analytics & statistics",
    "Analyze route elevation",
    "All AI risk predictions",
    "Compare all 3 routes",
    "Explain XGBoost AI model",
    "Disruption trends today",
    "Which road is most dangerous?",
    "Show district risk matrix",
  ],
  field_officer: [
    "Field reports today",
    "Offline sync status",
    "Open roads near East Siang",
    "Weather in my district",
    "Which roads are safe?",
    "Analyze route elevation",
    "Emergency contacts",
    "What's happening right now?",
  ],
  admin: [
    "System health check",
    "Show all active alerts",
    "Fleet fuel status",
    "Show analytics & statistics",
    "Show district health scores",
    "Explain XGBoost AI model",
    "Driver contact list",
    "What's the biggest risk?",
  ],
}

// ── Severity colour map ────────────────────────────────────────────────────────
const SEV_CLASS: Record<string, string> = {
  critical: 'border-danger/40 bg-danger/5',
  warning:  'border-warning/40 bg-warning/5',
  success:  'border-success/40 bg-success/5',
  info:     'border-border bg-surface-2',
}

// ── Local Knowledge Base Dictionary (Complete Closed-Loop Chain) ─────────────
const DEMO_CHAIN: Record<string, { patterns: RegExp[]; data: CopilotResponsePayload }> = {

  // 1. Situation Overview
  situation_overview: {
    patterns: [/what.s happening right now/i, /\bsituation\b/i, /current status/i, /overview/i, /network summary/i, /what is happening/i, /how many vehicle/i],
    data: {
      intent: 'situation_overview',
      text: "### Regional Logistics Situation Overview\n\n**Active Fleet Distribution (12 Convoys):**\n- On Route: **6 convoys** (Normal transit speed)\n- Delayed: **3 convoys** (Slowed by fog/congestion on NH-37 & NH-13)\n- Stopped: **3 convoys** (Stranded at NH-415 Km 42 blockage)\n\n**Highway Infrastructure Status:**\n- **1 Road Blocked:** NH-415 Dibrugarh–Pasighat (Active Landslide at Km 42)\n- **2 Roads Restricted:** NH-37 (Hojai congestion) and NH-13B (Sela Pass dense fog)\n- **4 Safe Corridors Open:** NH-27, SH-15, NH-6, and NH-715\n\n**Highest Priority Command Alert:**\n- Emergency Ambulance `AR-01-GH-2345` (carrying critical surgical equipment) is halted 12 km before Pasighat.\n- **Recommended Action:** Execute emergency detour via **Route C (SH-15 North Bank Bypass)**.",
      cards: [
        {
          type: 'kpi_grid',
          items: [
            { label: 'On Route', value: 6, color: 'success' },
            { label: 'Delayed', value: 3, color: 'warning' },
            { label: 'Stopped', value: 3, color: 'danger' },
            { label: 'Critical Alerts', value: 2, color: 'danger' }
          ]
        },
        {
          type: 'risk_bar',
          road: 'NH-415 (East Siang)',
          score: 87,
          level: 'critical'
        }
      ],
      actions: [
        { label: 'View NH-415 on Map', action: 'flyToRoad', target: 'nh415-seg1' },
        { label: 'Compare All 3 Routes', action: 'chat', target: 'compare all 3 routes' },
        { label: 'Emergency Center', action: 'navigate', target: '/emergency' }
      ],
      suggestions: [
        "Why is NH-415 blocked?",
        "Show all stopped vehicles",
        "Analyze route elevation",
        "Show analytics & statistics"
      ],
      severity: 'warning'
    }
  },

  // 2. Why is NH-415 Blocked
  nh415_blocked: {
    patterns: [/why.*nh-415/i, /nh-415.*blocked/i, /why.*blocked/i, /\bnh415\b/i, /explain.*nh-415/i],
    data: {
      intent: 'nh415_blocked',
      text: "### Incident Breakdown: NH-415 Dibrugarh–Pasighat (Km 42 Blockage)\n\n- **Location:** Km 42 near Jeypore, East Siang Sector\n- **Status:** BLOCKED — Impassable for all standard vehicular traffic\n- **Hazard Trigger:** Mudslide & boulder debris collapse following 85 mm/hr monsoonal rainfall\n- **Composite Risk Score:** **87% (Critical Hazard)**\n\n**Measured Geological & Meteorological Telemetry:**\n- Slope Gradient: **31.0°** (exceeds critical slope stability threshold of 15°)\n- Soil Moisture Saturation: **88%** (subsoil shear strength collapsed)\n- Debris Volume: Approx. **200 linear meters** covering both lanes\n- Affected Convoys: **3 units** (Ambulance `v4`, Fuel Tanker `v6`, Water Tanker `v9`)\n\n**Clearance Status:**\n2 heavy excavators from NHIDCL are clearing debris. Estimated clearance window is **5.5 to 6.0 hours**. Central HQ has routed all inbound traffic through the **SH-15 North Bank Bypass**.",
      cards: [
        {
          type: 'risk_bar',
          road: 'NH-415 (Km 42)',
          score: 87,
          level: 'critical'
        },
        {
          type: 'elevation_summary',
          route: 'Route A (via NH-415)',
          peakElev: 820,
          maxSlope: 24.5,
          totalAscent: 1850,
          status: 'Active Mudslide at Km 42'
        }
      ],
      actions: [
        { label: 'Fly to NH-415 Blockage', action: 'flyToRoad', target: 'nh415-seg1' },
        { label: 'Batch Reroute Stranded', action: 'activateRerouting', target: 'all' },
        { label: 'Show Stopped Vehicles', action: 'chat', target: 'show all stopped vehicles' }
      ],
      suggestions: [
        "Show all stopped vehicles",
        "Safest route to Itanagar",
        "Simulate NH-415 blockage 6h",
        "Call ambulance driver"
      ],
      severity: 'critical'
    }
  },

  // 3. Stopped Vehicles
  stopped_vehicles: {
    patterns: [/stopped vehicle/i, /\bstranded\b/i, /\bstuck\b/i, /show.*stopped/i, /which.*stranded/i],
    data: {
      intent: 'stopped_vehicles',
      text: "### Stranded Fleet Convoys (3 Vehicles at NH-415 Blockage)\n\n1. **AR-01-GH-2345 (Ambulance — Emergency Priority)**\n   - Cargo: *Emergency Surgical Equipment & Blood Plasma Units*\n   - Driver: Sanjay Taye (+91-9876543213) | Fuel: 71%\n   - Location: NH-415 Km 42 (12 km before Pasighat)\n\n2. **AR-05-KL-3456 (Tanker — High Priority)**\n   - Cargo: *Diesel Fuel Depot Stock (90% capacity)*\n   - Driver: Bikash Mech (+91-9876543215) | Fuel: 90%\n   - Location: NH-415 Km 38 Approach\n\n3. **AR-07-QR-1234 (Tanker — Emergency Priority)**\n   - Cargo: *Potable Water Supply for Relief Camps*\n   - Driver: Tapa Gao (+91-9876543218) | Fuel: 85%\n   - Location: NH-415 Km 35\n\n**Immediate Directive:** Initiate automated turn-around and reroute via **Route C (SH-15 North Bank Bypass)** to recover delivery schedule.",
      cards: [
        {
          type: 'kpi_grid',
          items: [
            { label: 'Medical Supplies', value: 1, color: 'danger' },
            { label: 'Fuel Supply', value: 1, color: 'warning' },
            { label: 'Potable Water', value: 1, color: 'danger' },
            { label: 'Clearance ETA', value: '5.5h', color: 'danger' }
          ]
        }
      ],
      actions: [
        { label: 'Reroute All Stranded Convoys', action: 'activateRerouting', target: 'all' },
        { label: 'Call Ambulance Driver', action: 'callDriver', target: '+91-9876543213' },
        { label: 'Open Emergency Center', action: 'navigate', target: '/emergency' }
      ],
      suggestions: [
        "Call ambulance driver",
        "Reroute all stranded vehicles",
        "Why is Route C recommended?",
        "Which vehicles carry medical?"
      ],
      severity: 'critical'
    }
  },

  // 4. Call Driver
  call_driver: {
    patterns: [/call.*driver/i, /contact.*driver/i, /driver phone/i, /sanjay taye/i, /driver contact/i],
    data: {
      intent: 'call_driver',
      text: "### Driver Telemetry & Communications Contact\n\n- **Vehicle:** `AR-01-GH-2345` (Critical Care Ambulance)\n- **Driver:** **Sanjay Taye**\n- **Contact Number:** **+91-9876543213**\n- **Current Status:** Halted at NH-415 Km 42 (Safe from direct mudflow)\n- **Cargo:** *Emergency Surgical Equipment & Blood Units*\n- **Fuel Level:** 71% (Sufficient for 260 km detour)\n- **Continuous Driving Time:** 3.8 hours (Within safety limit)\n\n**Action:** Telephony link ready for direct cellular patch.",
      actions: [
        { label: 'Call Sanjay Taye (+91-9876543213)', action: 'callDriver', target: '+91-9876543213' },
        { label: 'Dispatch Alternate Route', action: 'activateRerouting', target: 'v4' }
      ],
      suggestions: [
        "Reroute all stranded vehicles",
        "Safest route to Itanagar",
        "Fleet fuel status",
        "Show all stopped vehicles"
      ],
      severity: 'info'
    }
  },

  // 5. Reroute Stranded Vehicles
  reroute_stranded: {
    patterns: [/reroute.*stranded/i, /activate.*rerout/i, /reroute all/i, /execute detour/i, /activate route c detour/i],
    data: {
      intent: 'reroute_stranded',
      text: "### Emergency Rerouting Command Executed\n\n**Reroute Target:** Route C (North Bank Safe Bypass via SH-15 & NH-27)\n\n- **Ambulance AR-01-GH-2345:** Turn-around instructed. Heading to SH-15 North Bank interchange. ETA to Pasighat: **3h 40m** (Avoids 6h blockade delay).\n- **Fuel Tanker AR-05-KL-3456:** Rerouted via SH-15.\n- **Water Tanker AR-07-QR-1234:** Rerouted via SH-15.\n\n**Safety Verification:**\n- SH-15 Bridge Approach: Verified Operational\n- Slope Gradient on SH-15: 7.4° (Safe)\n- Estimated Schedule Recovery: **+92% on-time confidence**.",
      cards: [
        {
          type: 'elevation_summary',
          route: 'Route C (via SH-15)',
          peakElev: 750,
          maxSlope: 7.4,
          totalAscent: 1240,
          status: 'Safe & Verified'
        }
      ],
      actions: [
        { label: 'Open Route Planner', action: 'navigate', target: '/routes' },
        { label: 'View Live Map', action: 'navigate', target: '/map' }
      ],
      suggestions: [
        "Compare all 3 routes",
        "Analyze route elevation",
        "Show analytics & statistics",
        "What's happening right now?"
      ],
      severity: 'success'
    }
  },

  // 6. Compare All 3 Routes
  compare_routes: {
    patterns: [/compare/i, /comparison matrix/i, /all routes/i, /route a.*b/i, /which route.*better/i, /compare all 3 routes/i],
    data: {
      intent: 'compare_routes',
      text: "### Multi-Modal Route Comparison Matrix\n\n| Corridor Route | Distance & ETA | Hazard Risk | Peak Altitude | Max Slope | Infrastructure Health | Status |\n|---|---|---|---|---|---|---|\n| **Route C (Safe Bypass)** | **368 km** (5h 30m) | **18% (Low)** | 750m | 7.4° (Safe) | All Bridges Green | **Recommended** |\n| **Route A (Direct Highway)** | **335 km** (5h 10m) | **87% (Critical)** | 820m | 24.5° (Hazard) | Active Debris | Blocked |\n| **Route B (Southern Arc)** | **412 km** (7h 00m) | **54% (Moderate)**| 185m | 8.5° (Safe) | Lowland Floodplain | Congested |\n\n**Technical Trade-off:**\nRoute C requires only +33 km additional driving distance (+20 minutes ETA) while reducing hazard risk from 87% to 18% and avoiding the active NH-415 mudslide.",
      cards: [
        {
          type: 'route_comparison',
          routes: [
            { label: 'Route C (Safe Bypass)', type: 'Safe Bypass', distance: 368, duration: 5.5, risk: 18, recommended: true, via: ['NH-27', 'SH-15'] },
            { label: 'Route A (Direct Highway)', type: 'Direct Highway', distance: 335, duration: 5.1, risk: 87, recommended: false, via: ['NH-27', 'NH-415'] },
            { label: 'Route B (Southern Arc)', type: 'Southern Corridor', distance: 412, duration: 7.0, risk: 54, recommended: false, via: ['NH-37', 'NH-715'] }
          ]
        },
        {
          type: 'elevation_summary',
          route: 'Route C (Safe Bypass)',
          peakElev: 750,
          maxSlope: 7.4,
          totalAscent: 1240,
          status: 'Safe Gradient'
        }
      ],
      actions: [
        { label: 'Open Routes Page', action: 'navigate', target: '/routes' },
        { label: 'Dispatch Route C', action: 'dispatchRoute', target: 'route-c' }
      ],
      suggestions: [
        "Why is Route C recommended?",
        "Analyze route elevation",
        "Why is NH-415 blocked?",
        "Show stopped vehicles"
      ],
      severity: 'info'
    }
  },

  // 7. Why is Route C Recommended
  why_route_c: {
    patterns: [/why.*route c/i, /why not route a/i, /why route c recommended/i],
    data: {
      intent: 'why_route_c',
      text: "### Strategic Justification: Why Route C is Recommended\n\n1. **Avoids Active Blockade:** Route C completely bypasses NH-415 Km 42 (where 200m of mudslide debris has halted traffic).\n2. **Minimal Distance Penalty:** Adds only **33 km (+20 mins)** compared to the blocked direct highway.\n3. **Safe Topographic Profile:** Maximum slope gradient is **7.4°** compared to 24.5° on Route A and 35.2° on Sela Pass.\n4. **Bridge & Pavement Health:** All 6 major river crossings along SH-15 are verified operational with zero flood submergence risk.",
      cards: [
        {
          type: 'elevation_summary',
          route: 'Route C (Safe Bypass)',
          peakElev: 750,
          maxSlope: 7.4,
          totalAscent: 1240,
          status: 'Safe & Verified'
        }
      ],
      actions: [
        { label: 'Dispatch Route C', action: 'dispatchRoute', target: 'route-c' },
        { label: 'Analyze Route Elevation', action: 'chat', target: 'analyze route elevation' }
      ],
      suggestions: [
        "Analyze route elevation",
        "Safest route to Itanagar",
        "Why is NH-415 blocked?",
        "Show district risk matrix"
      ],
      severity: 'info'
    }
  },

  // 8. Elevation Analysis
  elevation_analysis: {
    patterns: [/elevation/i, /\bslope\b/i, /\bgradient\b/i, /\baltitude\b/i, /topography/i, /terrain profile/i, /\bascent\b/i, /\bheight\b/i],
    data: {
      intent: 'elevation_analysis',
      text: "### Topographic Elevation & Terrain Gradient Analysis\n\nNortheast India's transport network navigates high-altitude Himalayan topography where slope angle is the second-highest weighted risk factor (28%) in our landslide prediction architecture.\n\n**Corridor Topographic Profiles:**\n\n1. **Route C — Safe Bypass Corridor (SH-15 & NH-27):**\n   - Peak Elevation: **750 meters**\n   - Maximum Slope Gradient: **7.4° (Safe Threshold)**\n   - Cumulative Ascent: **+1,240 meters**\n   - Terrain Classification: Stable foothill bypass, fully paved, minimal mudslide vulnerability.\n\n2. **Route A — Direct Highway (NH-27 & NH-415):**\n   - Peak Elevation: **820 meters**\n   - Maximum Slope Gradient: **24.5° (High Risk Trigger Zone)**\n   - Cumulative Ascent: **+1,850 meters**\n   - Hazard Point: Km 42 Jeypore cutoff. Extreme slope instability during heavy rainfalls (>40 mm/hr).\n\n3. **Route B — Southern Arc (NH-37 & NH-715):**\n   - Peak Elevation: **185 meters**\n   - Maximum Slope Gradient: **8.5° (Safe Lowland)**\n   - Cumulative Ascent: **+420 meters**\n   - Terrain Classification: Low-lying floodplains adjacent to Kaziranga National Park.",
      cards: [
        {
          type: 'elevation_summary',
          route: 'Route C (Safe Bypass)',
          peakElev: 750,
          maxSlope: 7.4,
          totalAscent: 1240,
          status: 'Safe Gradient'
        },
        {
          type: 'elevation_summary',
          route: 'Route A (Direct Highway)',
          peakElev: 820,
          maxSlope: 24.5,
          totalAscent: 1850,
          status: 'Critical Landslide Trigger'
        }
      ],
      actions: [
        { label: 'Open Elevation in Routes', action: 'navigate', target: '/routes' },
        { label: 'Compare All 3 Corridors', action: 'chat', target: 'compare all 3 routes' }
      ],
      suggestions: [
        "Compare all 3 routes",
        "Why is Route C recommended?",
        "Why is NH-415 blocked?",
        "Show district risk matrix"
      ],
      severity: 'info'
    }
  },

  // 9. Analytics & Statistics
  analytics_statistics: {
    patterns: [/analytics/i, /statistics/i, /trend/i, /scorecard/i, /bottleneck/i, /disruption trend/i, /kpi/i, /heatmap/i, /saturation/i, /soil moisture/i, /show district risk matrix/i],
    data: {
      intent: 'analytics_statistics',
      text: "### Operational Analytics & Predictive Intelligence Report\n\n**1. Network Dispatch Performance (24h Trend):**\n- Network On-Time Rate: **91.4%** (+6.2% improvement via dynamic rerouting)\n- Delayed Convoys: **8.6%** (average delay reduced from 2.0h to 1.2h)\n- Weekly Disruptions Avoided: **42 Incidents**\n\n**2. District Soil Moisture Saturation & Hazard Matrix:**\n\n| District & State | Precipitation | Soil Saturation | Slope Gradient | Landslide Risk | Operational Status |\n|---|---|---|---|---|---|\n| Papum Pare (Itanagar) | 45 mm/h | 88% | 24.5° | 87% | Critical Landslide Zone |\n| Kamrup Metro (Guwahati) | 12 mm/h | 42% | 2.4° | 14% | Normal Operations |\n| Nagaon & Tezpur | 18 mm/h | 54% | 3.1° | 22% | Safe Corridor Active |\n| Golaghat (Kaziranga) | 34 mm/h | 76% | 1.8° | 62% | Flood Warning (Lowland) |\n| East Siang (Pasighat) | 28 mm/h | 65% | 14.2° | 48% | Moderate Hill Hazard |\n| East Khasi Hills (Shillong) | 38 mm/h | 79% | 18.0° | 58% | Heavy Fog & Wet Pavement |\n\n**3. Arterial Bottlenecks & Critical Chokepoints:**\n- **Rank 1:** NH-415 Pasighat — 8 Incidents | Avg Delay: **3.8 hrs** (Active Mudslide)\n- **Rank 2:** NH-13 West Siang — 5 Incidents | Avg Delay: **2.4 hrs** (High Risk)\n- **Rank 3:** NH-37 Hojai — 4 Incidents | Avg Delay: **1.8 hrs** (Congestion)",
      cards: [
        {
          type: 'kpi_grid',
          items: [
            { label: 'Network On-Time', value: '91.4%', color: 'success' },
            { label: 'Disruptions Avoided', value: '42', color: 'success' },
            { label: 'Avg Delay Hours', value: '1.2h', color: 'warning' },
            { label: 'Critical Hazards', value: '1', color: 'danger' }
          ]
        }
      ],
      actions: [
        { label: 'Open Analytics Hub', action: 'navigate', target: '/analytics' },
        { label: 'Export Report as CSV', action: 'navigate', target: '/analytics' }
      ],
      suggestions: [
        "Disruption trends today",
        "Which road is most dangerous?",
        "Show bottleneck analysis",
        "Explain XGBoost AI model"
      ],
      severity: 'info'
    }
  },

  // 10. Disruption Trends Today
  disruption_trends: {
    patterns: [/disruption trends/i, /disruption history/i, /past disruption/i, /incidents this week/i],
    data: {
      intent: 'disruption_trends',
      text: "### Regional Disruption Trends & Historical Incident Log\n\nOver the past 7 days, the Northeastern transport network recorded **68 total disruptive events**:\n- **Landslides & Mudflows:** 42 events (61.8%) — concentrated along NH-415, NH-13, and NH-13B.\n- **Floods & Highway Inundation:** 18 events (26.5%) — primarily along NH-37 Kaziranga lowlands.\n- **Structural Bridge Stress:** 8 events (11.7%) — minor joint fractures managed with single-lane flow.\n\n**Key Finding:** Proactive AI rerouting prevented **42 convoy strandings**, saving an estimated **164 vehicle-hours** of idle time.",
      cards: [
        {
          type: 'kpi_grid',
          items: [
            { label: 'Landslides (7d)', value: 42, color: 'danger' },
            { label: 'Floods (7d)', value: 18, color: 'warning' },
            { label: 'Bridge Alerts', value: 8, color: 'warning' },
            { label: 'Hours Saved', value: '164h', color: 'success' }
          ]
        }
      ],
      actions: [
        { label: 'Open Analytics Trends', action: 'navigate', target: '/analytics' },
        { label: 'Show Bottleneck Analysis', action: 'chat', target: 'show bottleneck analysis' }
      ],
      suggestions: [
        "Which road is most dangerous?",
        "Show bottleneck analysis",
        "All AI risk predictions",
        "Show analytics & statistics"
      ],
      severity: 'info'
    }
  },

  // 11. Which Road is Most Dangerous
  dangerous_roads: {
    patterns: [/most dangerous/i, /highest hazard/i, /riskiest road/i, /dangerous highway/i],
    data: {
      intent: 'dangerous_roads',
      text: "### Arterial Hazard Ranking (Northeast India Corridors)\n\n1. **NH-415 Dibrugarh–Pasighat:** **87% Risk (Critical)**\n   - Active mudslide debris at Km 42. Continuous 85 mm/hr downpour. Total blockage.\n2. **NH-13 Itanagar–Along (West Siang):** **72% Risk (High Alert)**\n   - Steep 28.4° rock face slopes. Convoy escort required; night travel restricted after 20:00.\n3. **NH-13B Tezpur–Tawang (Sela Pass):** **68% Risk (High Alert)**\n   - High altitude (13,700 ft) with sub-zero freezing fog and 35.2° slope gradient.\n4. **NH-37 Guwahati–Lumding:** **52% Risk (Moderate Caution)**\n   - Waterlogging near Kaziranga overflow channels.",
      cards: [
        {
          type: 'risk_bar',
          road: 'NH-415 (East Siang)',
          score: 87,
          level: 'critical'
        },
        {
          type: 'risk_bar',
          road: 'NH-13 (West Siang)',
          score: 72,
          level: 'high'
        },
        {
          type: 'risk_bar',
          road: 'NH-13B (Tawang)',
          score: 68,
          level: 'high'
        }
      ],
      actions: [
        { label: 'Why is NH-415 Blocked?', action: 'chat', target: 'why is NH-415 blocked?' },
        { label: 'Explain Sela Pass', action: 'chat', target: 'explain sela pass conditions' }
      ],
      suggestions: [
        "Why is NH-415 blocked?",
        "Explain Sela Pass conditions",
        "All AI risk predictions",
        "Compare all 3 routes"
      ],
      severity: 'critical'
    }
  },

  // 12. Sela Pass Conditions
  sela_pass: {
    patterns: [/sela pass/i, /tawang route/i, /nh-13b/i, /nh13b/i],
    data: {
      intent: 'sela_pass',
      text: "### High-Altitude Assessment: NH-13B Tezpur–Tawang (Sela Pass)\n\n- **Altitude:** 13,700 feet (4,170 meters)\n- **Current Temperature:** -2°C (Freezing drizzle & dense fog)\n- **Visibility:** Under 50 meters\n- **Slope Gradient:** **35.2° (Extreme Himalayan Gradient)**\n- **Operational Advisory:**\n  - 4WD / High-Clearance convoys mandatory.\n  - Tire chains recommended above Baisakhi point.\n  - Night travel strictly prohibited between 18:00 and 06:00.",
      cards: [
        {
          type: 'risk_bar',
          road: 'NH-13B (Sela Pass 13,700 ft)',
          score: 68,
          level: 'high'
        }
      ],
      actions: [
        { label: 'View on Map', action: 'navigate', target: '/map' },
        { label: 'All AI Risk Predictions', action: 'chat', target: 'all ai risk predictions' }
      ],
      suggestions: [
        "All AI risk predictions",
        "Which road is most dangerous?",
        "Analyze route elevation",
        "Weather in my district"
      ],
      severity: 'warning'
    }
  },

  // 13. All AI Risk Predictions
  ai_predictions: {
    patterns: [/all.*prediction/i, /ai prediction/i, /risk prediction/i, /landslide forecast/i],
    data: {
      intent: 'ai_predictions',
      text: "### Active AI Landslide & Hazard Risk Forecasts (Next 6–12 Hours)\n\n1. **NH-415 (East Siang):** **87% Critical** — Confirmed 200m mudflow. Action: Detour via Route C.\n2. **NH-13 (West Siang):** **72% High** — Slope saturation rising. Action: 4WD convoy escort only.\n3. **NH-13B (Tawang / Sela Pass):** **68% High** — Icy fog. Action: Daylight movement only.\n4. **NH-37 (Nagaon):** **52% Medium** — Water accumulation. Action: High-clearance pass.\n5. **NH-27 (Guwahati–Jorhat):** **18% Low** — Fully clear. Action: Primary arterial route.",
      cards: [
        {
          type: 'kpi_grid',
          items: [
            { label: 'NH-415 Risk', value: '87%', color: 'danger' },
            { label: 'NH-13 Risk', value: '72%', color: 'danger' },
            { label: 'NH-13B Risk', value: '68%', color: 'warning' },
            { label: 'NH-27 Risk', value: '18%', color: 'success' }
          ]
        }
      ],
      actions: [
        { label: 'Open Analytics', action: 'navigate', target: '/analytics' },
        { label: 'Explain XGBoost Model', action: 'chat', target: 'explain xgboost ai model' }
      ],
      suggestions: [
        "Explain XGBoost AI model",
        "Which road is most dangerous?",
        "Why is NH-415 blocked?",
        "Show district risk matrix"
      ],
      severity: 'info'
    }
  },

  // 14. Explain XGBoost Model
  ml_architecture: {
    patterns: [/xgboost/i, /machine learning/i, /ai model/i, /how.*predict/i, /algorithm/i, /neural/i, /model architecture/i],
    data: {
      intent: 'ml_architecture',
      text: "### Machine Learning Architecture: XGBoost Topographic Classifier (v2.4)\n\nThe platform employs a gradient-boosted decision tree ensemble trained on Geological Survey of India (GSI) landslide telemetry, IMD precipitation radar, and SRTM digital elevation data.\n\n**Feature Importance Weights:**\n- **Rainfall Intensity (32%):** Hourly precipitation in mm/hr (critical threshold: >50 mm/h).\n- **Terrain Slope Gradient (28%):** Digital elevation slope in degrees (slopes >15° combined with saturation >75% yield 87% landslide probability).\n- **Soil Moisture Saturation (22%):** Volumetric water content in the subsoil.\n- **Historical Recurrence Rate (18%):** Past disruption frequency index for the specific highway stretch.\n\n**Current Active Predictions:**\n- **NH-415 Km 42:** 87% Risk (Critical Triggered — 200m active mudslide)\n- **NH-13 West Siang:** 72% Risk (High Alert — Convoy escort recommended)\n- **NH-27 North Bank:** 18% Risk (Clear & Operational)",
      cards: [
        {
          type: 'kpi_grid',
          items: [
            { label: 'Rainfall Weight', value: '32%', color: 'warning' },
            { label: 'Slope Weight', value: '28%', color: 'warning' },
            { label: 'Soil Saturation', value: '22%', color: 'warning' },
            { label: 'Hist. Recurrence', value: '18%', color: 'warning' }
          ]
        }
      ],
      actions: [
        { label: 'Open Analytics ML Tab', action: 'navigate', target: '/analytics' },
        { label: 'View Route Elevation', action: 'navigate', target: '/routes' }
      ],
      suggestions: [
        "Show district risk matrix",
        "All AI risk predictions",
        "Why is NH-415 blocked?",
        "Analyze route elevation"
      ],
      severity: 'info'
    }
  },

  // 15. Field Reports Today
  field_reports: {
    patterns: [/field report/i, /ground incident/i, /officer report/i, /field feed/i],
    data: {
      intent: 'field_reports',
      text: "### Ground Field Incident Feed (3 Logged Reports)\n\n1. **NH-415 Km 42 (Landslide — Critical)**\n   - Logged: 1h ago by Officer Sunil Pegu (East Siang)\n   - Status: Impassable. 200m boulder slurry. NHIDCL excavators on site.\n\n2. **NH-37 Near Kaziranga (Flood — Warning)**\n   - Logged: 2h ago by Driver Mahesh Gogoi\n   - Status: 30cm water depth across asphalt. Heavy trucks passable.\n\n3. **SH-15 Bridge Approach (Bridge Stress — Warning)**\n   - Logged: 30m ago by Officer Rani Borah\n   - Status: Surface crack along approach span. Single-lane alternate traffic active.",
      cards: [
        {
          type: 'kpi_grid',
          items: [
            { label: 'Active Reports', value: 3, color: 'danger' },
            { label: 'Synced to HQ', value: 2, color: 'success' },
            { label: 'Offline Queued', value: 1, color: 'warning' },
            { label: 'Patrol Officers', value: 4, color: 'success' }
          ]
        }
      ],
      actions: [
        { label: 'Open Field Dashboard', action: 'navigate', target: '/' },
        { label: 'Check Offline Sync', action: 'chat', target: 'offline sync status' }
      ],
      suggestions: [
        "Offline sync status",
        "Open roads near East Siang",
        "Weather in my district",
        "Emergency contacts"
      ],
      severity: 'info'
    }
  },

  // 16. Offline Sync Status
  offline_sync: {
    patterns: [/offline sync/i, /sync status/i, /queue status/i, /pending sync/i],
    data: {
      intent: 'offline_sync',
      text: "### Offline Local Storage & Grid Sync Telemetry\n\n- **Central HQ Link:** Online (Low Latency 18ms)\n- **Local Storage Cache:** Active & Encrypted\n- **Synced Reports:** 2 reports successfully stored on Central HQ database\n- **Pending Reports:** 1 report (SH-15 Bridge Stress Inspection)\n- **Automatic Sync:** Background sync worker triggers packet handshake every 30 seconds when network is detected.",
      actions: [
        { label: 'Sync Now', action: 'syncReports', target: 'all' },
        { label: 'Field Reports Today', action: 'chat', target: 'field reports today' }
      ],
      suggestions: [
        "Field reports today",
        "Open roads near East Siang",
        "Which roads are safe?",
        "Emergency contacts"
      ],
      severity: 'info'
    }
  },

  // 17. Open Roads / Safe Roads
  safe_roads: {
    patterns: [/open road/i, /safe road/i, /which roads are safe/i, /roads near east siang/i],
    data: {
      intent: 'safe_roads',
      text: "### Highway Passability Status (Sector Breakdown)\n\n**Clear & Fully Open Corridors (Green):**\n- **NH-27 Guwahati–Jorhat:** 100% Open (18% Risk)\n- **SH-15 North Lakhimpur–Itanagar:** 100% Open (Safe bypass route)\n- **NH-6 Guwahati–Shillong:** 100% Open (22% Risk)\n- **NH-715 Lumding–Dibrugarh:** 100% Open (24% Risk)\n\n**Restricted / Impassable Corridors:**\n- **NH-415 Dibrugarh–Pasighat:** **BLOCKED at Km 42** (Active Landslide)\n- **NH-13 Itanagar–Along:** **Partial (Caution)** (Rockfall risk)\n- **NH-13B Tezpur–Tawang:** **Partial (Caution)** (Sela Pass fog/ice)",
      actions: [
        { label: 'Safest Route to Itanagar', action: 'chat', target: 'safest route to itanagar' },
        { label: 'View on Map', action: 'navigate', target: '/map' }
      ],
      suggestions: [
        "Safest route to Itanagar",
        "Weather in my district",
        "Field reports today",
        "Why is NH-415 blocked?"
      ],
      severity: 'info'
    }
  },

  // 18. Weather in District
  weather_district: {
    patterns: [/weather.*district/i, /weather in east siang/i, /weather in my district/i, /weather forecast/i],
    data: {
      intent: 'weather_district',
      text: "### Sector Meteorological Telemetry (East Siang District)\n\n- **Condition:** Heavy Monsoonal Downpour\n- **Precipitation Rate:** **84 mm/hr (Extreme Intensity)**\n- **Relative Humidity:** 95%\n- **Surface Visibility:** **1.2 km (Fog & Rain Obscuration)**\n- **Wind Velocity:** 42 km/h gusts\n- **Soil Moisture Saturation:** **88% (Exceeds 75% Slope Stability Threshold)**\n\n**Alert:** High probability of secondary debris slumping along steep river cuttings over the next 4 hours.",
      cards: [
        {
          type: 'risk_bar',
          road: 'East Siang Landslide Risk',
          score: 87,
          level: 'critical'
        }
      ],
      actions: [
        { label: 'View Weather Radar', action: 'navigate', target: '/' },
        { label: 'Show District Risk Matrix', action: 'chat', target: 'show district risk matrix' }
      ],
      suggestions: [
        "Open roads near East Siang",
        "Show district risk matrix",
        "Why is NH-415 blocked?",
        "Field reports today"
      ],
      severity: 'warning'
    }
  },

  // 19. Emergency Contacts
  emergency_contacts: {
    patterns: [/emergency contact/i, /driver contact list/i, /phone list/i, /contact directory/i],
    data: {
      intent: 'emergency_contacts',
      text: "### Operational Communications Directory\n\n**Stranded Convoy Drivers:**\n- Sanjay Taye (Ambulance `v4`): **+91-9876543213**\n- Bikash Mech (Fuel Tanker `v6`): **+91-9876543215**\n- Tapa Gao (Water Tanker `v9`): **+91-9876543218**\n\n**Sector Field Officers:**\n- Sunil Pegu (East Siang Sector): **+91-9876543230**\n- Rani Borah (Jorhat / SH-15 Sector): **+91-9876543231**\n\n**Engineering & Emergency Services:**\n- NHIDCL Highway Clearance Unit: **+91-9876543299**\n- State Disaster Response Force (SDRF): **1077 / +91-9876543288**",
      actions: [
        { label: 'Call Ambulance Driver', action: 'callDriver', target: '+91-9876543213' },
        { label: 'Show Stopped Vehicles', action: 'chat', target: 'show all stopped vehicles' }
      ],
      suggestions: [
        "Call ambulance driver",
        "Show all stopped vehicles",
        "System health check",
        "Morning briefing"
      ],
      severity: 'info'
    }
  },

  // 20. Medical Vehicles
  medical_vehicles: {
    patterns: [/medical/i, /surgical/i, /blood units/i, /vaccine/i, /which vehicles carry medical/i],
    data: {
      intent: 'medical_vehicles',
      text: "### Life-Critical Medical Freight Telemetry (4 Convoys)\n\n1. **AR-01-GH-2345 (Ambulance — Emergency Priority)**\n   - Cargo: *Emergency Surgical Equipment & Blood Units*\n   - Status: **Stopped at NH-415 Km 42** | Driver: Sanjay Taye (+91-9876543213)\n   - Action: Rerouted via SH-15 North Bank.\n\n2. **AS-01-AB-1234 (Heavy Truck — High Priority)**\n   - Cargo: *Essential Medicines & Cold-Chain Vaccines*\n   - Status: **On Route (NH-27, 52 km/h)** | Destination: Jorhat\n\n3. **AS-25-WX-9012 (Van — High Priority)**\n   - Cargo: *Dialysis Supplies*\n   - Status: **On Route (SH-15, 55 km/h)** | Destination: North Lakhimpur\n\n4. **AR-09-UV-5678 (Rescue Vehicle — Emergency Priority)**\n   - Cargo: *Rescue Equipment & First Aid Kits*\n   - Status: **On Route (NH-13B, 38 km/h)** | Destination: Tawang",
      cards: [
        {
          type: 'kpi_grid',
          items: [
            { label: 'Medical Convoys', value: 4, color: 'success' },
            { label: 'On Route', value: 3, color: 'success' },
            { label: 'Stranded Units', value: 1, color: 'danger' },
            { label: 'Detour Assigned', value: 1, color: 'warning' }
          ]
        }
      ],
      actions: [
        { label: 'Call Ambulance Driver', action: 'callDriver', target: '+91-9876543213' },
        { label: 'Reroute Stranded Units', action: 'activateRerouting', target: 'all' }
      ],
      suggestions: [
        "Call ambulance driver",
        "Show all stopped vehicles",
        "Safest route to Itanagar",
        "Fleet fuel status"
      ],
      severity: 'info'
    }
  },

  // 21. District Health Scores
  district_scores: {
    patterns: [/district health score/i, /district scorecard/i, /show district health scores/i, /district scores/i],
    data: {
      intent: 'district_scores',
      text: "### Composite District Health Scorecard (Northeast India)\n\n- **Guwahati (Kamrup Metro):** **88 / 100** (Low Risk · 4 Active Convoys)\n- **Jorhat (Assam):** **90 / 100** (Low Risk · All Corridors Green)\n- **Shillong (Meghalaya):** **91 / 100** (Low Risk · Normal Operations)\n- **Nagaon (Assam):** **72 / 100** (Medium Risk · NH-37 Congestion)\n- **Itanagar (Papum Pare):** **71 / 100** (Medium Risk · High Soil Moisture)\n- **Dibrugarh (Assam):** **64 / 100** (Medium Risk · 1 Blocked Segment)\n- **Tawang (Arunachal):** **59 / 100** (Medium Risk · Sela Pass Fog)\n- **East Siang (Arunachal):** **36 / 100 (CRITICAL)** — 2 Blocked Highways, 87% Landslide Trigger.",
      cards: [
        {
          type: 'kpi_grid',
          items: [
            { label: 'Guwahati Score', value: '88/100', color: 'success' },
            { label: 'Jorhat Score', value: '90/100', color: 'success' },
            { label: 'Shillong Score', value: '91/100', color: 'success' },
            { label: 'East Siang Score', value: '36/100', color: 'danger' }
          ]
        }
      ],
      actions: [
        { label: 'Show District Risk Matrix', action: 'chat', target: 'show district risk matrix' },
        { label: 'Open Analytics Hub', action: 'navigate', target: '/analytics' }
      ],
      suggestions: [
        "Show district risk matrix",
        "Show analytics & statistics",
        "What's the biggest risk?",
        "Show all active alerts"
      ],
      severity: 'info'
    }
  },

  // 22. What's the Biggest Risk
  biggest_risk: {
    patterns: [/biggest risk/i, /primary hazard/i, /main threat/i, /what.s the biggest risk/i],
    data: {
      intent: 'biggest_risk',
      text: "### Primary Operational Hazard Assessment\n\nThe single highest operational risk in the network is the **NH-415 Pasighat Corridor Blockade (87% Landslide Risk)**.\n\n**Key Threats:**\n1. **Supply Chain Disruption:** Cuts off primary road access to East Siang and upper Arunachal districts.\n2. **Critical Cargo Delay:** Ambulance carrying surgical equipment is delayed until Route C detour is fully executed.\n3. **Soil Moisture Saturation:** Continuous 84 mm/hr rain is threatening adjacent slopes along Km 38 to Km 48.\n\n**Mitigation Plan:**\nEnforce immediate mandatory diversion for all traffic at the North Lakhimpur interchange into **Route C (SH-15 North Bank Bypass)**.",
      cards: [
        {
          type: 'risk_bar',
          road: 'NH-415 Km 42 Threat Index',
          score: 87,
          level: 'critical'
        }
      ],
      actions: [
        { label: 'Why is NH-415 Blocked?', action: 'chat', target: 'why is NH-415 blocked?' },
        { label: 'Simulate 6h Blockage', action: 'chat', target: 'simulate nh-415 blockage 6h' }
      ],
      suggestions: [
        "Why is NH-415 blocked?",
        "Simulate NH-415 blockage 6h",
        "Compare all 3 routes",
        "Show all stopped vehicles"
      ],
      severity: 'critical'
    }
  },

  // 23. Active Alerts
  active_alerts: {
    patterns: [/active alert/i, /all alert/i, /critical alert/i, /show.*alert/i],
    data: {
      intent: 'active_alerts',
      text: "### Active Priority Alerts (5 System Alerts)\n\n1. **[CRITICAL] NH-415 Blocked — Landslide Confirmed at Km 42**\n   - Location: NH-415 East Siang | Affected: 3 Convoys (`v4`, `v6`, `v9`)\n2. **[CRITICAL] Emergency Ambulance Stranded — AR-01-GH-2345**\n   - Location: NH-415 blockage | Cargo: Surgical equipment & blood units\n3. **[CRITICAL] Landslide Risk 72% — NH-13 West Siang**\n   - Location: NH-13 Km 88 | Alert Source: XGBoost AI Model\n4. **[WARNING] Heavy Precipitation Radar — East Siang 84 mm/hr**\n   - Location: East Siang District | Alert Source: IMD Radar\n5. **[WARNING] Convoy Delay Alert — NH-37 Hojai Sector**\n   - Location: NH-37 Hojai | Affected: 2 Convoys (`v3`, `v7`)",
      cards: [
        {
          type: 'kpi_grid',
          items: [
            { label: 'Critical Alerts', value: 3, color: 'danger' },
            { label: 'Warning Alerts', value: 2, color: 'warning' },
            { label: 'Resolved (24h)', value: 14, color: 'success' },
            { label: 'Active Convoys', value: 12, color: 'success' }
          ]
        }
      ],
      actions: [
        { label: 'Acknowledge Alerts', action: 'acknowledgeAll', target: 'all' },
        { label: 'Open Emergency Center', action: 'navigate', target: '/emergency' }
      ],
      suggestions: [
        "Why is NH-415 blocked?",
        "Show all stopped vehicles",
        "Morning briefing",
        "System health check"
      ],
      severity: 'critical'
    }
  },

  // 24. Siliguri Corridor
  siliguri_corridor: {
    patterns: [/siliguri corridor/i, /chicken.s neck/i, /geography/i, /terrain challenge/i, /logistics challenge/i],
    data: {
      intent: 'siliguri_corridor',
      text: "### Regional Logistics Context: The Siliguri Corridor (\"Chicken's Neck\")\n\nThe Siliguri Corridor is a narrow 22-kilometer land bridge connecting mainland India to all 8 Northeastern states.\n\n**Key Logistics Vulnerabilities:**\n1. **Single Point of Inbound Failure:** All freight entering Assam, Meghalaya, and Arunachal must transit this passage.\n2. **Brahmaputra Flood Dynamics:** Monsoonal flooding regularly submerges arterial connections along the southern bank (NH-37).\n3. **High-Altitude Himalayan Chokepoints:** Landslides and steep gradients (>25°) routinely sever northern routes, making multi-modal redundancy (Route C bypass) vital.",
      actions: [
        { label: 'Compare All 3 Routes', action: 'chat', target: 'compare all 3 routes' },
        { label: 'View Live Map', action: 'navigate', target: '/map' }
      ],
      suggestions: [
        "Compare all 3 routes",
        "Explain XGBoost AI model",
        "Show analytics & statistics",
        "What's happening right now?"
      ],
      severity: 'info'
    }
  },

  // 25. Fuel Status
  fuel_status: {
    patterns: [/\bfuel\b/i, /\bdiesel\b/i, /low fuel/i, /refuel/i, /fleet fuel/i],
    data: {
      intent: 'fuel_status',
      text: "### Fleet Fuel & Range Telemetry (12 Vehicles)\n\n- **Average Fleet Fuel Level:** **72.4%**\n- **Critical Fuel Alert (< 30%):** **0 Vehicles**\n- **Lowest Fuel Unit:** `v5` (AR-03-IJ-5678, Truck) — **44% Fuel** (~140 km range remaining)\n- **Stranded Units Fuel:**\n  - `v4` (Ambulance): **71%** (Safe for detour)\n  - `v6` (Fuel Tanker): **90%** (Full reserves)\n  - `v9` (Water Tanker): **85%** (Safe for detour)\n\nAll active convoys possess sufficient diesel reserves to complete rerouted journeys through the SH-15 North Bank corridor.",
      cards: [
        {
          type: 'kpi_grid',
          items: [
            { label: 'Average Fuel', value: '72.4%', color: 'success' },
            { label: 'Low Fuel Units', value: '0', color: 'success' },
            { label: 'Lowest Unit', value: '44%', color: 'warning' },
            { label: 'Refuel Depots Open', value: '8', color: 'success' }
          ]
        }
      ],
      actions: [
        { label: 'Open Fleet Management', action: 'navigate', target: '/fleet' },
        { label: 'Show All Vehicles', action: 'chat', target: 'show all vehicles' }
      ],
      suggestions: [
        "Show all stopped vehicles",
        "Safest route to Itanagar",
        "Why is NH-415 blocked?",
        "Morning briefing"
      ],
      severity: 'info'
    }
  },

  // 26. System Health Check
  system_health: {
    patterns: [/system health/i, /health check/i, /subsystem/i, /diagnostic/i],
    data: {
      intent: 'system_health',
      text: "### NER Logistics Platform Subsystem Health Diagnostic\n\n- **GPS Telemetry Ingestion:** **100% Operational** (12/12 vehicle transponders active)\n- **Topographic Landslide AI (XGBoost v2.4):** **Online** (Inference latency: 42ms)\n- **OSRM Topological Routing Engine:** **Online** (Multi-modal graph active)\n- **IMD Weather & Precipitation Radar:** **Connected** (Refreshed 8 min ago)\n- **Offline Local Sync Queue:** **Synced** (Zero lost data packets)\n- **Network Dispatch Efficiency:** **91.4% on-time delivery rate**",
      cards: [
        {
          type: 'kpi_grid',
          items: [
            { label: 'System Uptime', value: '99.98%', color: 'success' },
            { label: 'AI Latency', value: '42ms', color: 'success' },
            { label: 'Active Nodes', value: '8 States', color: 'success' },
            { label: 'Sync Status', value: 'Live', color: 'success' }
          ]
        }
      ],
      actions: [
        { label: 'View Settings', action: 'navigate', target: '/settings' },
        { label: 'Command Center', action: 'navigate', target: '/' }
      ],
      suggestions: [
        "Show all active alerts",
        "Show analytics & statistics",
        "Why is NH-415 blocked?",
        "Morning briefing"
      ],
      severity: 'info'
    }
  },

  // 27. Morning Briefing
  morning_briefing: {
    patterns: [/morning briefing/i, /\bbriefing\b/i, /daily briefing/i, /start my day/i, /today.s status/i],
    data: {
      intent: 'morning_briefing',
      text: "### Operational Morning Briefing\n\n**Executive Summary:**\n- Critical Incidents: **2 requiring immediate command action**\n- Active Fleet: **6 on-route · 3 delayed · 3 stopped**\n- Blocked Infrastructure: **1 Highway Segment (NH-415 Km 42)**\n- Overall Network On-Time Rate: **91.4%**\n\n**Primary Risk Focus:**\n- **NH-415 East Siang:** 87% Critical Landslide Risk. 200m mudslide at Km 42.\n\n**Priority Action Items:**\n1. Reroute 3 stranded convoys (Ambulance `v4`, Fuel `v6`, Water `v9`) via **Route C (SH-15 North Bank)**.\n2. Monitor East Siang telemetry (84 mm/hr heavy rainfall).\n3. Verify SH-15 bridge expansion joints clearance.",
      cards: [
        {
          type: 'kpi_grid',
          items: [
            { label: 'Critical Incidents', value: 2, color: 'danger' },
            { label: 'Active Fleet', value: 6, color: 'success' },
            { label: 'Stopped Units', value: 3, color: 'danger' },
            { label: 'Delayed Units', value: 3, color: 'warning' }
          ]
        },
        {
          type: 'risk_bar',
          road: 'NH-415 (East Siang)',
          score: 87,
          level: 'critical'
        }
      ],
      actions: [
        { label: 'Why is NH-415 Blocked?', action: 'chat', target: 'why is NH-415 blocked?' },
        { label: 'Show Stopped Vehicles', action: 'chat', target: 'show all stopped vehicles' },
        { label: 'Open Command Center', action: 'navigate', target: '/' }
      ],
      suggestions: [
        "Why is NH-415 blocked?",
        "Show all stopped vehicles",
        "Safest route to Itanagar",
        "Analyze route elevation"
      ],
      severity: 'info'
    }
  },

  // 28. Safest Route to Itanagar
  safest_route_itanagar: {
    patterns: [/safest route.*itanagar/i, /best route.*itanagar/i, /route to itanagar/i, /drive to itanagar/i, /how to reach itanagar/i],
    data: {
      intent: 'safest_route_itanagar',
      text: "### Recommended Safe Route: Guwahati to Itanagar\n\n**AI Dispatch Recommendation:** **Route C (North Bank Safe Bypass via NH-27 & SH-15)**\n\n- Distance: **368 km** (Estimated Driving Time: **5 hours 30 mins**)\n- Landslide Hazard Risk: **18% (Low)**\n- Maximum Terrain Slope: **7.4° (Safe)**\n- Structural Infrastructure: All bridges along SH-15 verified operational.\n\n**Why avoid the direct NH-415 route?**\nThe direct highway via NH-415 is completely blocked at Km 42 by a 200m active mudslide (87% hazard score). Taking Route C adds only +33 km but guarantees cargo safety.",
      cards: [
        {
          type: 'elevation_summary',
          route: 'Route C (via SH-15)',
          peakElev: 750,
          maxSlope: 7.4,
          totalAscent: 1240,
          status: 'Safe & Verified'
        }
      ],
      actions: [
        { label: 'Dispatch Route C', action: 'dispatchRoute', target: 'route-c' },
        { label: 'Compare All 3 Routes', action: 'chat', target: 'compare all 3 routes' }
      ],
      suggestions: [
        "Why is Route C recommended?",
        "Analyze route elevation",
        "Why is NH-415 blocked?",
        "Show stopped vehicles"
      ],
      severity: 'info'
    }
  },

  // 29. Impact Simulation
  impact_simulation: {
    patterns: [/what if/i, /simulate/i, /\bimpact\b/i, /6 hour/i, /if.*stays blocked/i],
    data: {
      intent: 'impact_simulation',
      text: "### What-If Disruption Simulation: NH-415 Blocked for 6 Hours\n\n| Operational Metric | Normal Baseline | Without Dynamic Rerouting | With AI Auto-Detour (Route C) |\n|---|---|---|---| \n| **Regional On-Time Rate** | 91.4% | **62.8% (Severe Drop)** | **88.2% (Protected)** |\n| **Average Delay per Convoy** | 24 min | **210 min (3.5 hrs)** | **35 min** |\n| **Stranded Convoys** | 0 | **3 vehicles** | **0 vehicles** |\n\n**Critical Cargo At Risk:**\n- Surgical Equipment & Blood Supplies (`v4`)\n- Regional Fuel Depot Diesel Supply (`v6`)\n- Potable Drinking Water (`v9`)\n\n**Recommendation:** Execute immediate batch detour via Route C to bypass the entire chokepoint.",
      cards: [
        {
          type: 'risk_bar',
          road: 'NH-415 (Simulated 6h Impact)',
          score: 87,
          level: 'critical'
        }
      ],
      actions: [
        { label: 'Activate Dynamic Reroute', action: 'activateRerouting', target: 'all' },
        { label: 'Open Emergency Dashboard', action: 'navigate', target: '/emergency' }
      ],
      suggestions: [
        "Show all stopped vehicles",
        "Safest route to Itanagar",
        "Why is NH-415 blocked?",
        "Compare all 3 routes"
      ],
      severity: 'warning'
    }
  },

  // 30. Natural Greetings
  greeting: {
    patterns: [/^(hi|hello|hey|greetings|howdy|sup|good day|namaste|morning|good morning|evening|good evening|afternoon|good afternoon|start|start chat)\b/i],
    data: {
      intent: 'greeting',
      text: "Hello! I am your **NER Logistics Operations Copilot**. How can I assist you with fleet dispatch, road terrain, or hazard analytics today?",
      cards: [],
      actions: [],
      suggestions: [
        "What's happening right now?",
        "Why is NH-415 blocked?",
        "Show all stopped vehicles",
        "Analyze route elevation"
      ],
      severity: 'info'
    }
  },

  // 31. How Are You
  how_are_you: {
    patterns: [/how are you/i, /how.s it going/i, /how are things/i, /how are you doing/i, /how are you today/i, /are you ok/i, /are you online/i, /status check/i, /\bping\b/i],
    data: {
      intent: 'how_are_you',
      text: "I am operating at full capacity. All 12 telemetry streams, the XGBoost landslide prediction engine, and the OSRM routing network are running normally. How can I support your operations right now?",
      cards: [],
      actions: [],
      suggestions: [
        "What's happening right now?",
        "Show analytics & statistics",
        "System health check",
        "Morning briefing"
      ],
      severity: 'info'
    }
  },

  // 32. Identity
  identity: {
    patterns: [/who are you/i, /what are you/i, /your name/i, /who built you/i, /who created you/i, /tell me about yourself/i, /introduce yourself/i],
    data: {
      intent: 'identity',
      text: "I am the **NER Operations Copilot** — an enterprise AI assistant designed for terrain intelligence, multi-modal convoy routing, and disaster-resilient logistics across Northeast India.",
      cards: [],
      actions: [],
      suggestions: [
        "What can you do?",
        "Explain XGBoost AI model",
        "Analyze route elevation",
        "What's happening right now?"
      ],
      severity: 'info'
    }
  },

  // 33. Capabilities / Help
  capabilities: {
    patterns: [/what can you do/i, /help me/i, /\bhelp\b/i, /what are your features/i, /what are your capabilities/i, /\bcommands\b/i, /how does this work/i, /how to use/i, /what do you do/i],
    data: {
      intent: 'capabilities',
      text: "I can assist you across all key operational domains:\n\n- **Fleet Dispatch:** Track 12 live vehicle convoys, driver Hours of Service, fuel reserves, and automated rerouting.\n- **Terrain & Elevation Analysis:** Topographic elevation profiling, slope gradient calculations, and mountain pass conditions.\n- **Predictive Risk & Weather:** Real-time landslide forecasts, IMD precipitation radar, and district soil moisture saturation indices.\n- **Incident Response:** Field ground reports, checkpoint inspections, and life-critical emergency dispatches.",
      cards: [],
      actions: [],
      suggestions: [
        "What's happening right now?",
        "Compare all 3 routes",
        "Show district risk matrix",
        "Explain XGBoost AI model"
      ],
      severity: 'info'
    }
  },

  // 34. Acknowledgement
  acknowledgement: {
    patterns: [/^(ok|okay|got it|understood|sure|cool|fine|noted|roger|roger that|copy that|alright|all right|acknowledged)\b/i],
    data: {
      intent: 'acknowledgement',
      text: "Understood. Standing by for your next operational query or directive.",
      cards: [],
      actions: [],
      suggestions: [
        "What's happening right now?",
        "Why is NH-415 blocked?",
        "Show all stopped vehicles",
        "Analyze route elevation"
      ],
      severity: 'info'
    }
  },

  // 35. Thanks
  thanks: {
    patterns: [/\bthanks\b/i, /thank you/i, /\bthx\b/i, /\bty\b/i, /appreciate it/i, /great job/i, /awesome/i, /perfect/i, /good work/i, /well done/i, /thanks a lot/i],
    data: {
      intent: 'thanks',
      text: "You're welcome! Let me know whenever you need further routing analysis, driver contact details, or operational updates.",
      cards: [],
      actions: [],
      suggestions: [
        "Morning briefing",
        "Why is NH-415 blocked?",
        "Fleet fuel status",
        "Show analytics & statistics"
      ],
      severity: 'info'
    }
  },

  // 36. Farewell
  bye: {
    patterns: [/\bbye\b/i, /goodbye/i, /\bcya\b/i, /see you/i, /signing off/i, /\bexit\b/i, /\bquit\b/i, /talk to you later/i, /good night/i],
    data: {
      intent: 'bye',
      text: "Goodbye! The background intelligence engine will continue monitoring all Northeastern corridors and active convoys 24/7. Stay safe.",
      cards: [],
      actions: [],
      suggestions: [
        "Morning briefing",
        "What's happening right now?"
      ],
      severity: 'info'
    }
  },

  // 37. Emergency SOS Trigger
  emergency_sos: {
    patterns: [/\bemergency\b/i, /\bsos\b/i, /\bmayday\b/i, /urgent help/i, /critical emergency/i, /emergency dispatch/i],
    data: {
      intent: 'emergency_sos',
      text: "Emergency protocols engaged. Critical attention required for 3 halted convoys at NH-415 Km 42, including Life-Critical Ambulance `AR-01-GH-2345` carrying surgical supplies.",
      cards: [],
      actions: [
        { label: "Why is NH-415 Blocked?", action: "chat", target: "why is NH-415 blocked?" },
        { label: "Call Ambulance Driver", action: "callDriver", target: "+91-9876543213" },
        { label: "Reroute All Stranded", action: "activateRerouting", target: "all" }
      ],
      suggestions: [
        "Why is NH-415 blocked?",
        "Show all stopped vehicles",
        "Call ambulance driver",
        "Reroute all stranded vehicles"
      ],
      severity: 'critical'
    }
  },

  // 38. Yes / No
  yes_no: {
    patterns: [/^(yes|yep|yeah|no|nope)\b/i],
    data: {
      intent: 'yes_no',
      text: "Acknowledged. Please let me know how you would like to proceed.",
      cards: [],
      actions: [],
      suggestions: [
        "What's happening right now?",
        "Compare all 3 routes",
        "Why is NH-415 blocked?",
        "Analyze route elevation"
      ],
      severity: 'info'
    }
  }
}

// ── Local Fallback Intelligent Engine ────────────────────────────────────────
function localCopilotEngine(msg: string, ctx: Record<string, unknown>, role: string): CopilotResponsePayload {
  const m = msg.toLowerCase().trim()

  for (const entry of Object.values(DEMO_CHAIN)) {
    for (const pat of entry.patterns) {
      if (pat.test(m)) {
        return entry.data
      }
    }
  }

  // Default fallback to situation overview
  return DEMO_CHAIN.situation_overview.data
}

// ── API call ──────────────────────────────────────────────────────────────────
async function callCopilot(msg: string, ctx: Record<string, unknown>, role: string): Promise<CopilotResponsePayload> {
  try {
    const r = await fetch('/py/copilot/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, context: ctx, role }),
    })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return await r.json() as CopilotResponsePayload
  } catch {
    return localCopilotEngine(msg, ctx, role)
  }
}

// ── Card renderers ────────────────────────────────────────────────────────────
function RenderCard({ card }: { card: CopilotCard }) {
  if (card.type === 'kpi_grid') {
    const items = card.items as { label: string; value: number | string; color: string }[]
    return (
      <div className="grid grid-cols-2 gap-1.5 mt-2.5">
        {items.map(it => (
          <div key={it.label} className={cn('rounded-lg p-2.5 border text-center',
            it.color === 'danger'  ? 'bg-danger/10 border-danger/20' :
            it.color === 'success' ? 'bg-success/10 border-success/20' :
            it.color === 'warning' ? 'bg-warning/10 border-warning/20' :
            'bg-surface-2 border-border')}>
            <div className={cn('text-xl font-bold tabular-nums',
              it.color === 'danger' ? 'text-danger' : it.color === 'success' ? 'text-success' : it.color === 'warning' ? 'text-warning' : 'text-text'
            )}>{it.value}</div>
            <div className="text-[10px] text-text-muted mt-0.5">{it.label}</div>
          </div>
        ))}
      </div>
    )
  }

  if (card.type === 'elevation_summary') {
    const isHazard = (card.maxSlope as number) > 15
    return (
      <div className="mt-2.5 p-3 rounded-lg bg-surface-2 border border-border space-y-2">
        <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Mountain className="h-3.5 w-3.5 text-primary" />
            {card.route as string}
          </span>
          <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded',
            isHazard ? 'bg-danger/20 text-danger border border-danger/30' : 'bg-success/20 text-success border border-success/30')}>
            {card.status as string}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-white/5 p-1.5 rounded-md">
            <div className="text-[9px] text-text-muted">Peak Altitude</div>
            <div className="font-bold text-white mt-0.5">{card.peakElev as number} m</div>
          </div>
          <div className="bg-white/5 p-1.5 rounded-md">
            <div className="text-[9px] text-text-muted">Max Slope</div>
            <div className={cn('font-bold mt-0.5', isHazard ? 'text-danger' : 'text-success')}>
              {card.maxSlope as number}°
            </div>
          </div>
          <div className="bg-white/5 p-1.5 rounded-md">
            <div className="text-[9px] text-text-muted">Total Ascent</div>
            <div className="font-bold text-white mt-0.5">+{card.totalAscent as number} m</div>
          </div>
        </div>
      </div>
    )
  }

  if (card.type === 'risk_bar') {
    const s = card.score as number
    const c = s >= 75 ? '#EF4444' : s >= 50 ? '#F59E0B' : '#10B981'
    return (
      <div className="mt-2.5 p-2.5 rounded-lg bg-surface-2 border border-border">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="font-semibold text-text">{card.road as string}</span>
          <span className="font-bold tabular-nums" style={{ color: c }}>{s}%</span>
        </div>
        <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${s}%`, background: c }} />
        </div>
        <div className="text-[10px] text-text-muted mt-1 capitalize">{card.level as string} Risk</div>
      </div>
    )
  }

  if (card.type === 'route_comparison') {
    const routes = card.routes as { label: string; type: string; distance: number; duration: number; risk: number; recommended: boolean; via: string[] }[]
    return (
      <div className="mt-2.5 space-y-1.5">
        {routes.map(r => (
          <div key={r.label} className={cn('p-2.5 rounded-lg border text-xs',
            r.recommended ? 'border-success/40 bg-success/5' : 'border-border bg-surface-2')}>
            <div className="flex items-center justify-between mb-0.5">
              <span className="font-semibold text-text">{r.label}</span>
              <span className={cn('font-bold', r.risk >= 75 ? 'text-danger' : r.risk >= 50 ? 'text-warning' : 'text-success')}>{r.risk}% Risk</span>
            </div>
            <div className="text-text-muted text-[11px]">{r.via.join(' → ')} · {r.distance} km · ~{r.duration} hrs</div>
          </div>
        ))}
      </div>
    )
  }

  return null
}

// ── Follow-up Section ─────────────────────────────────────────────────────────
function FollowUpSection({ questions, onSelect }: { questions: string[]; onSelect: (q: string) => void }) {
  if (!questions || questions.length === 0) return null
  return (
    <div className="mt-3 border border-border rounded-lg overflow-hidden bg-surface">
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border bg-surface-2">
        <CornerDownRight className="h-3 w-3 text-text-muted flex-shrink-0" />
        <span className="text-xs font-semibold text-text">Follow-up Queries</span>
      </div>
      <div className="divide-y divide-border">
        {questions.map((q, i) => (
          <button
            key={i}
            onClick={() => onSelect(q)}
            className="w-full flex items-start gap-2 px-3 py-2 hover:bg-surface-2 transition-colors text-left group"
          >
            <CornerDownRight className="h-3 w-3 text-primary flex-shrink-0 mt-0.5 opacity-60 group-hover:opacity-100 transition-opacity" />
            <span className="text-xs text-text-muted group-hover:text-primary transition-colors leading-relaxed">
              {q}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Welcome Screen Quick Chips ────────────────────────────────────────────────
function WelcomeScreen({ onSelect, role }: { onSelect: (q: string) => void; role: string }) {
  const qs = QUICK_QUESTIONS[role as keyof typeof QUICK_QUESTIONS] ?? QUICK_QUESTIONS.operator
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 text-center space-y-4">
      <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
        <Cpu className="h-8 w-8 text-primary" />
      </div>

      <div>
        <h2 className="text-base font-bold text-text">NER Operations Copilot</h2>
        <p className="text-xs text-text-muted mt-1 leading-relaxed max-w-xs">
          Executive logistics assistant for topographic routing, elevation profiling, fleet tracking, and landslide hazard analytics.
        </p>
      </div>

      <div className="w-full max-w-sm space-y-1.5">
        <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">
          Suggested Topics
        </div>
        {qs.map((q, i) => (
          <button
            key={i}
            onClick={() => onSelect(q)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-surface hover:bg-surface-2 hover:border-primary/40 text-left transition-all group"
          >
            <CornerDownRight className="h-3.5 w-3.5 text-primary flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
            <span className="text-xs text-text-muted group-hover:text-text transition-colors">{q}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
interface CopilotChatProps {
  onClose: () => void
  initialContext?: Record<string, unknown>
}

const DIST_COORDS: Record<string, [number, number]> = {
  'Guwahati':       [26.1151, 91.7032],
  'East Siang':     [28.0647, 95.3254],
  'Tawang':         [27.5858, 91.8674],
  'Dibrugarh':      [27.4728, 94.9120],
  'Itanagar':       [27.1003, 93.6282],
  'Jorhat':         [26.7509, 94.2037],
  'Shillong':       [25.5788, 91.8933],
  'North Lakhimpur':[27.2363, 94.0958],
}

export function CopilotChat({ onClose, initialContext = {} }: CopilotChatProps) {
  const navigate           = useNavigate()
  const user               = useAppStore(selUser)
  const selectedVehicleId  = useVehicleStore(selSelVehicle)
  const flyTo              = useMapStore(selFlyTo)

  const role = user?.role ?? 'operator'

  const [messages,       setMessages]       = useState<CopilotMessage[]>([])
  const [input,          setInput]          = useState('')
  const [loading,        setLoading]        = useState(false)
  const [confirmAction,  setConfirmAction]  = useState<CopilotAction | null>(null)
  const [showWelcome,    setShowWelcome]    = useState(true)

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  // Build context from current app state
  const buildContext = useCallback((): Record<string, unknown> => ({
    ...initialContext,
    selectedVehicle: selectedVehicleId,
    currentPage: window.location.pathname.replace('/', '') || 'dashboard',
    role,
    district: user?.district,
  }), [initialContext, selectedVehicleId, role, user])

  // Execute map command returned from API
  const execMapCmd = useCallback((cmd: MapCommand) => {
    if (cmd.action === 'flyTo' && cmd.coords) {
      flyTo({ lat: cmd.coords[0], lng: cmd.coords[1] }, 10)
    } else if (cmd.action === 'flyTo' && cmd.district) {
      const c = DIST_COORDS[cmd.district]
      if (c) flyTo({ lat: c[0], lng: c[1] }, 10)
    }
  }, [flyTo])

  // Execute action button
  const execAction = useCallback((action: CopilotAction) => {
    setConfirmAction(null)
    switch (action.action) {
      case 'navigate':      navigate(action.target ?? '/'); break
      case 'flyTo':
        if (action.target) { const c = DIST_COORDS[action.target]; if (c) { flyTo({ lat: c[0], lng: c[1] }, 10); navigate('/map') } }
        break
      case 'chat':          if (action.target) send(action.target); break
      case 'selectVehicle': navigate('/fleet'); toast.info(`Tracking ${action.target}`); break
      case 'dispatchRoute': navigate('/routes'); toast.success('Opening Route Intelligence…'); break
      case 'activateRerouting': navigate('/routes'); toast.info('Calculating alternate routes…'); break
      case 'filterVehicles': navigate('/fleet'); break
      case 'openDispatch':  navigate('/emergency'); break
      case 'flyToRoad':     toast.info(`Zooming to road ${action.target}`); navigate('/map'); break
      case 'callDriver':    toast.info(`Calling driver at ${action.target}`); break
      case 'syncReports':   toast.success('Syncing field reports…'); break
      case 'acknowledgeAll':toast.success('All alerts acknowledged'); break
      default: if (action.target) navigate(action.target)
    }
  }, [navigate, flyTo])

  const handleAction = useCallback((action: CopilotAction) => {
    if (action.confirm) { setConfirmAction(action); return }
    execAction(action)
  }, [execAction])

  // Main send function with 1.2s analysis delay and live typewriter streaming animation
  const send = useCallback(async (msg: string) => {
    const trimmed = msg.trim()
    if (!trimmed || loading) return

    setShowWelcome(false)
    setInput('')
    setLoading(true)

    const userMsg: CopilotMessage = {
      id: `u-${Date.now()}`, role: 'user', text: trimmed,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    }
    const placeholderId = `b-${Date.now()}`
    const placeholder: CopilotMessage = {
      id: placeholderId, role: 'bot', text: '', loading: true, isTyping: false,
    }
    setMessages(m => [...m, userMsg, placeholder])

    try {
      // 1. Realistic 1.2s Thinking & Inference Delay
      const [data] = await Promise.all([
        callCopilot(trimmed, buildContext(), role),
        new Promise(resolve => setTimeout(resolve, 1200))
      ])

      // 2. Stream Typewriter Animation
      const fullText = data.text
      const chunkSize = 6
      const tickMs = 16
      let currentLen = 0

      // Transition from loading spinner to active typing state
      setMessages(m => m.map(x => x.id === placeholderId ? {
        ...x,
        loading: false,
        isTyping: true,
        text: '',
        severity: data.severity,
      } : x))

      await new Promise<void>(resolve => {
        const timer = setInterval(() => {
          currentLen += chunkSize
          if (currentLen >= fullText.length) {
            clearInterval(timer)
            setMessages(m => m.map(x => x.id === placeholderId ? {
              ...x,
              loading: false,
              isTyping: false,
              text: fullText,
              cards: data.cards,
              actions: data.actions,
              followUps: data.suggestions,
              severity: data.severity,
              timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            } : x))
            if (data.mapCommand) execMapCmd(data.mapCommand)
            resolve()
          } else {
            setMessages(m => m.map(x => x.id === placeholderId ? {
              ...x,
              text: fullText.slice(0, currentLen),
            } : x))
          }
        }, tickMs)
      })
    } catch {
      const fallback = localCopilotEngine(trimmed, buildContext(), role)
      setMessages(m => m.map(x => x.id === placeholderId ? {
        ...x,
        loading: false,
        isTyping: false,
        text: fallback.text,
        cards: fallback.cards,
        actions: fallback.actions,
        followUps: fallback.suggestions,
        severity: fallback.severity,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      } : x))
    }
    setLoading(false)
  }, [loading, buildContext, role, execMapCmd])

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input on open
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  return (
    <div className="flex flex-col h-full bg-surface rounded-xl overflow-hidden border border-border shadow-2xl">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border flex-shrink-0 bg-surface">
        <div className="relative">
          <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
            <Cpu className="h-4 w-4 text-primary" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-success border border-surface" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-text">NER Operations Copilot</div>
          <div className="text-[10px] text-text-muted capitalize">
            {role.replace('_', ' ')} · {user?.district ?? 'Northeast India'}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <Button
              variant="ghost" size="icon-sm"
              onClick={() => { setMessages([]); setShowWelcome(true) }}
              title="Clear chat"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {/* Welcome screen */}
        {showWelcome && <WelcomeScreen onSelect={send} role={role} />}

        {/* Message thread */}
        {!showWelcome && (
          <div className="p-3 space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>

                {/* Bot avatar */}
                {msg.role === 'bot' && !msg.loading && (
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mr-2 mt-0.5">
                    <Cpu className="h-3 w-3 text-primary" />
                  </div>
                )}
                {msg.role === 'bot' && msg.loading && (
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-surface-2 border border-border flex items-center justify-center mr-2 mt-0.5">
                    <Loader2 className="h-3 w-3 text-text-muted animate-spin" />
                  </div>
                )}

                <div className="max-w-[88%] min-w-0">
                  {/* Bubble */}
                  <div className={cn(
                    'rounded-xl px-3 py-2.5 text-xs',
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-tr-sm'
                      : cn('border rounded-tl-sm',
                          msg.severity ? (SEV_CLASS[msg.severity] ?? SEV_CLASS.info) : SEV_CLASS.info)
                  )}>
                    {msg.loading ? (
                      <div className="flex items-center gap-2 text-text-muted py-0.5">
                        <span className="flex gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-text-muted animate-bounce [animation-delay:0ms]" />
                          <span className="h-1.5 w-1.5 rounded-full bg-text-muted animate-bounce [animation-delay:150ms]" />
                          <span className="h-1.5 w-1.5 rounded-full bg-text-muted animate-bounce [animation-delay:300ms]" />
                        </span>
                        <span>Analyzing operational telemetry…</span>
                      </div>
                    ) : (
                      <>
                        {/* Markdown text */}
                        <div className={cn(
                          'prose prose-sm max-w-none leading-relaxed text-xs relative',
                          msg.role === 'user' ? 'text-white prose-invert' : 'text-text prose-invert'
                        )}>
                          <ReactMarkdown components={{
                            p:      ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
                            strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                            h1:     ({ children }) => <h1 className="text-sm font-bold mt-2 mb-1 text-white">{children}</h1>,
                            h2:     ({ children }) => <h2 className="text-xs font-bold mt-1.5 mb-0.5 text-white">{children}</h2>,
                            h3:     ({ children }) => <h3 className="text-xs font-bold mt-1 mb-0.5 text-white">{children}</h3>,
                            li:     ({ children }) => <li className="ml-3 list-disc my-0.5">{children}</li>,
                            code:   ({ children }) => <code className="bg-white/10 px-1.5 py-0.5 rounded text-[11px] text-primary">{children}</code>,
                            table:  ({ children }) => <table className="text-[11px] w-full border-collapse my-1.5">{children}</table>,
                            th:     ({ children }) => <th className="border-b border-border px-2 py-1 text-left font-semibold text-text-muted">{children}</th>,
                            td:     ({ children }) => <td className="border-b border-border/40 px-2 py-1">{children}</td>,
                          }}>
                            {msg.text}
                          </ReactMarkdown>
                          {msg.isTyping && (
                            <span className="inline-block w-1.5 h-3.5 bg-primary ml-1 rounded-sm animate-pulse align-middle" />
                          )}
                        </div>

                        {/* Structured cards */}
                        {msg.cards?.map((card, i) => <RenderCard key={i} card={card} />)}

                        {/* Action buttons */}
                        {msg.actions && msg.actions.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-border/30">
                            {msg.actions.map((action, i) => (
                              <button
                                key={i}
                                onClick={() => handleAction(action)}
                                className={cn(
                                  'px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all border',
                                  action.action === 'dismiss'
                                    ? 'border-border text-text-muted hover:bg-surface-3'
                                    : action.label.toLowerCase().includes('activat') || action.label.toLowerCase().includes('emergency')
                                      ? 'border-danger/40 bg-danger/10 text-danger hover:bg-danger/20'
                                      : action.label.toLowerCase().includes('confirm')
                                        ? 'border-warning/40 bg-warning/10 text-warning hover:bg-warning/20'
                                        : 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/20'
                                )}
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Timestamp */}
                  {msg.timestamp && !msg.loading && (
                    <div className={cn('text-[9px] text-text-subtle mt-0.5', msg.role === 'user' ? 'text-right' : 'text-left ml-0.5')}>
                      {msg.timestamp}
                    </div>
                  )}

                  {/* Follow-up section */}
                  {msg.role === 'bot' && !msg.loading && msg.followUps && msg.followUps.length > 0 && (
                    <FollowUpSection questions={msg.followUps} onSelect={send} />
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Confirm modal ──────────────────────────────────────────────────── */}
      {confirmAction && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 rounded-xl">
          <div className="bg-surface border border-danger/40 rounded-xl p-4 mx-4 space-y-3 shadow-2xl w-full max-w-xs">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="h-5 w-5 text-danger mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-bold text-danger">Confirm Critical Action</div>
                <div className="text-xs text-text-muted mt-1 leading-relaxed">
                  This will activate emergency protocols across NER Logistics and notify all operators.
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setConfirmAction(null)}>Cancel</Button>
              <Button variant="destructive" size="sm" className="flex-1" onClick={() => execAction(confirmAction)}>
                <Zap className="h-3.5 w-3.5" /> Confirm
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Input bar ──────────────────────────────────────────────────────── */}
      <div className="px-3 pb-3 pt-2 border-t border-border flex-shrink-0 bg-surface">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send(input)
              }
            }}
            placeholder="Ask anything about routes, elevation, analytics, fleet, risks…"
            className="flex-1 h-9 px-3 rounded-lg border border-border bg-surface-2 text-xs text-text placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
          />
          <Button
            size="icon-sm"
            disabled={!input.trim() || loading}
            onClick={() => send(input)}
            className="flex-shrink-0"
          >
            {loading
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Send className="h-4 w-4" />
            }
          </Button>
        </div>
        <div className="text-[9px] text-text-subtle text-center mt-1.5">
          Powered by NER Logistics Intelligence · Live Multi-Modal AI
        </div>
      </div>
    </div>
  )
}
