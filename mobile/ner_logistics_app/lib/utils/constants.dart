class AppConstants {
  static const String appName    = 'NER Logistics';
  static const String appVersion = 'v2.5';
  static const String buildEnv   = 'NER-OPS';

  static const List<String> highways = [
    'NH-415', 'SH-15', 'NH-27', 'NH-13', 'BRO-104',
  ];

  static const List<String> districts = [
    'East Siang', 'Papum Pare', 'Dibrugarh',
    'Tinsukia', 'Lohit', 'Anjaw', 'Upper Siang',
  ];

  static const List<String> clearanceEtas = [
    '< 1 Hour', '1–3 Hours', '3–6 Hours',
    '6–12 Hours', '12–24 Hours', '24–48 Hours', 'Unknown',
  ];

  static const List<Map<String, String>> convoys = [
    {
      'id': 'AR-01-GH-2345',
      'label': 'AR-01-GH-2345 — Medical Supplies (Emergency)',
      'cargo': 'Medical Supplies',
      'priority': 'EMERGENCY',
      'origin': 'Guwahati Depot',
      'destination': 'Pasighat Hospital Hub',
      'seal': 'SEL-8842',
      'payload': '1,240 kg',
    },
    {
      'id': 'AS-01-AB-1234',
      'label': 'AS-01-AB-1234 — Vaccines Cold Chain (High)',
      'cargo': 'Vaccines (Cold Chain)',
      'priority': 'HIGH',
      'origin': 'Dibrugarh Depot',
      'destination': 'Tinsukia PHC',
      'seal': 'SEL-9901',
      'payload': '340 kg',
    },
    {
      'id': 'AS-09-CD-5678',
      'label': 'AS-09-CD-5678 — Drinking Water (Medium)',
      'cargo': 'Drinking Water',
      'priority': 'MEDIUM',
      'origin': 'Tezpur Store',
      'destination': 'Aalo Camp',
      'seal': 'SEL-7700',
      'payload': '5,000 kg',
    },
  ];

  static const double cardRadius  = 16.0;
  static const double cardPadding = 16.0;
}
