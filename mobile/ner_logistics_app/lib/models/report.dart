enum HazardType { landslide, flashFlood, bridgeFracture, roadSinkhole, heavyStorm, treeDebris }
enum SeverityLevel { minor, moderate, severe, catastrophic }
enum PassabilityStatus { blocked, singleLane, caution, clear }
enum SyncStatus { pending, synced, failed }

class GpsData {
  final double latitude;
  final double longitude;
  final double altitude;
  final double accuracy;
  final DateTime capturedAt;

  const GpsData({
    required this.latitude, required this.longitude,
    required this.altitude, required this.accuracy,
    required this.capturedAt,
  });

  String get latStr => '${latitude.toStringAsFixed(6)}° N';
  String get lngStr => '${longitude.toStringAsFixed(6)}° E';
  String get altStr => '${altitude.toStringAsFixed(1)} m';
  String get accStr => '±${accuracy.toStringAsFixed(1)} m';
}

class IncidentReport {
  final String id;
  final HazardType hazardType;
  final SeverityLevel severity;
  final String title;
  final String highway;
  final String chainage;
  final PassabilityStatus passability;
  final String clearanceEta;
  final GpsData? gpsData;
  final String? photoPath;
  final bool hasVoiceMemo;
  final SyncStatus syncStatus;
  final DateTime createdAt;
  final String reportedBy;

  IncidentReport({
    required this.id, required this.hazardType, required this.severity,
    required this.title, required this.highway, required this.chainage,
    required this.passability, required this.clearanceEta,
    this.gpsData, this.photoPath, this.hasVoiceMemo = false,
    this.syncStatus = SyncStatus.pending,
    required this.createdAt, required this.reportedBy,
  });

  String get hazardLabel {
    const labels = {
      HazardType.landslide: 'Landslide', HazardType.flashFlood: 'Flash Flood',
      HazardType.bridgeFracture: 'Bridge Fracture', HazardType.roadSinkhole: 'Road Sinkhole',
      HazardType.heavyStorm: 'Heavy Storm', HazardType.treeDebris: 'Tree / Debris',
    };
    return labels[hazardType]!;
  }

  String get severityLabel {
    const labels = { SeverityLevel.minor: 'Minor', SeverityLevel.moderate: 'Moderate',
      SeverityLevel.severe: 'Severe', SeverityLevel.catastrophic: 'Catastrophic' };
    return labels[severity]!;
  }

  String get passabilityLabel {
    const labels = { PassabilityStatus.blocked: 'Blocked', PassabilityStatus.singleLane: 'Single-Lane',
      PassabilityStatus.caution: 'Caution', PassabilityStatus.clear: 'Clear' };
    return labels[passability]!;
  }

  String get reportId => 'RPT-${id.substring(0, 8).toUpperCase()}';
}

extension HazardEmoji on HazardType {
  String get emoji {
    const e = { HazardType.landslide: '⛰️', HazardType.flashFlood: '🌊',
      HazardType.bridgeFracture: '🌉', HazardType.roadSinkhole: '🕳️',
      HazardType.heavyStorm: '⛈️', HazardType.treeDebris: '🌲' };
    return e[this]!;
  }
}
