# NER Logistics Mobile Apps

Two Flutter Android applications for the NER Logistics Command System.

## Apps

### 1. `ner_field_officer` — Field Officer App
For ground officers managing incidents, convoys, and offline data collection.

**Features:**
- **Report Tab** — Full incident form with hazard type grid, severity chips, GPS capture (geolocator), geo-photo (image_picker), voice memo
- **Queue Tab** — Submitted reports list with sync status, bottom-sheet detail view
- **Checkpoints Tab** — Convoy authorization control, QR scan simulation, ECDSA verification display
- **Map Tab** — Offline map placeholder with custom terrain painter, alert pins, coordinate overlay
- **Vault Tab** — SQLite stats, offline map pack info, sync controls, AES-256/ECDSA security info

### 2. `ner_driver` — Driver/Transporter App
For drivers navigating routes with convoy pass management.

**Features:**
- **Nav HUD Tab** — Full-screen map with animated turn card, reroute alert, trip status buttons, telemetry strip
- **Turns Tab** — 5-step route manifest with visual stepper (completed/active/upcoming)
- **QR Pass Tab** — Animated QR code widget, ECDSA pass details, consignee OTP handover
- **SMS Feed Tab** — Dead-zone SMS fallback with priority-colored messages, ACK replies
- **Diagnostics Tab** — Live vehicle health metrics, anti-fatigue banner, system checks, fuel log

## Design System

Both apps share the same dark navy visual language:

| Token | Color |
|-------|-------|
| Background | `#080E1A` |
| Surface | `#0D1626` |
| Surface2 | `#111E33` |
| Border | `#1F3352` |
| Primary | `#3B82F6` |
| Success | `#10B981` |
| Warning | `#F59E0B` |
| Danger | `#EF4444` |
| Info | `#06B6D4` |
| Text | `#E2E8F0` |

## Setup

```bash
# Field Officer app
cd ner_field_officer
flutter pub get
flutter run

# Driver app
cd ner_driver
flutter pub get
flutter run
```

## Requirements
- Flutter SDK ≥ 3.2.0
- Android SDK ≥ 21 (Android 5.0+)
- For field officer: grant Location + Camera permissions on first launch

## Demo Credentials

**Field Officer:**
- Badge ID: `NER-FO-8841`
- PIN: `1234`
- District: East Siang
- Use "Quick Demo Login" button

**Driver:**
- Phone: `9862145890`
- Convoy: AR-01-GH-2345 (Medical Supplies)
- Check all 4 pre-trip boxes
- Use "Quick Demo" button

## OTP for Driver POD
Delivery OTP: `8842` (Dr. P. Baruah, Pasighat Hospital Hub)
