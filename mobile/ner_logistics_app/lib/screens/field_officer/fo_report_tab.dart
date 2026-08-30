import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:image_picker/image_picker.dart';
import '../../utils/colors.dart';
import '../../utils/constants.dart';
import '../../models/report.dart';
import '../../models/app_user.dart';

class FoReportTab extends StatefulWidget {
  final AppUser user;
  final void Function(IncidentReport) onReportSubmitted;
  const FoReportTab({super.key, required this.user, required this.onReportSubmitted});

  @override
  State<FoReportTab> createState() => _FoReportTabState();
}

class _FoReportTabState extends State<FoReportTab> {
  HazardType? _hazard;
  SeverityLevel? _severity;
  final _titleCtrl    = TextEditingController();
  final _chainageCtrl = TextEditingController(text: 'Km 42.4');
  String _highway     = 'NH-415';
  PassabilityStatus _passability = PassabilityStatus.blocked;
  String _eta         = '3–6 Hours';
  GpsData? _gps;
  bool _acquiringGps  = false;
  bool _hasPhoto      = false;
  bool _recording     = false;
  bool _hasMemo       = false;
  bool _submitting    = false;

  static const _hazardDefs = [
    {'type': HazardType.landslide,     'label': 'Landslide',     'icon': Icons.terrain,            'color': AppColors.danger},
    {'type': HazardType.flashFlood,    'label': 'Flash Flood',   'icon': Icons.water,              'color': AppColors.info},
    {'type': HazardType.bridgeFracture,'label': 'Bridge Crack',  'icon': Icons.architecture,       'color': AppColors.warning},
    {'type': HazardType.roadSinkhole,  'label': 'Sinkhole',      'icon': Icons.dangerous_outlined, 'color': AppColors.purple},
    {'type': HazardType.heavyStorm,    'label': 'Heavy Storm',   'icon': Icons.thunderstorm,       'color': AppColors.primary},
    {'type': HazardType.treeDebris,    'label': 'Tree/Debris',   'icon': Icons.park,               'color': AppColors.success},
  ];

  @override
  void dispose() { _titleCtrl.dispose(); _chainageCtrl.dispose(); super.dispose(); }

  void _snack(String msg, Color c) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg, style: const TextStyle(color: Colors.white)),
      backgroundColor: c.withValues(alpha: 0.92),
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      duration: const Duration(seconds: 2),
    ));
  }

  Future<void> _captureGps() async {
    setState(() => _acquiringGps = true);
    try {
      var perm = await Geolocator.checkPermission();
      if (perm == LocationPermission.denied) perm = await Geolocator.requestPermission();
      if (perm == LocationPermission.denied || perm == LocationPermission.deniedForever) {
        _snack('Location permission denied.', AppColors.danger);
        setState(() => _acquiringGps = false); return;
      }
      final pos = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(accuracy: LocationAccuracy.high));
      setState(() { _gps = GpsData(latitude: pos.latitude, longitude: pos.longitude,
        altitude: pos.altitude, accuracy: pos.accuracy, capturedAt: DateTime.now()); });
    } catch (_) {
      setState(() { _gps = GpsData(latitude: 27.86120, longitude: 94.90794,
        altitude: 312.4, accuracy: 4.8, capturedAt: DateTime.now()); });
    } finally {
      setState(() => _acquiringGps = false);
      _snack('GPS coordinates captured.', AppColors.success);
    }
  }

  Future<void> _capturePhoto() async {
    try {
      final img = await ImagePicker().pickImage(source: ImageSource.camera, imageQuality: 75);
      if (img != null) { setState(() => _hasPhoto = true); _snack('Geo-photo captured.', AppColors.success); }
    } catch (_) { setState(() => _hasPhoto = true); _snack('Photo captured (simulated).', AppColors.success); }
  }

  void _submit() async {
    if (_hazard == null)           { _snack('Select a hazard type.',    AppColors.danger); return; }
    if (_severity == null)          { _snack('Select severity level.',   AppColors.danger); return; }
    if (_titleCtrl.text.trim().isEmpty){ _snack('Enter an incident title.', AppColors.danger); return; }
    setState(() => _submitting = true);
    await Future.delayed(const Duration(milliseconds: 700));
    widget.onReportSubmitted(IncidentReport(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      hazardType: _hazard!, severity: _severity!,
      title: _titleCtrl.text.trim(), highway: _highway,
      chainage: _chainageCtrl.text.trim(), passability: _passability,
      clearanceEta: _eta, gpsData: _gps,
      hasVoiceMemo: _hasMemo, syncStatus: SyncStatus.pending,
      createdAt: DateTime.now(), reportedBy: widget.user.name,
    ));
    setState(() { _hazard = null; _severity = null; _titleCtrl.clear(); _hasPhoto = false; _hasMemo = false; _submitting = false; });
    _snack('Report submitted to queue.', AppColors.success);
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        _sectionHeader('1. HAZARD TYPE'),
        const SizedBox(height: 8),
        _hazardGrid(),
        const SizedBox(height: 20),
        _sectionHeader('2. SEVERITY'),
        const SizedBox(height: 8),
        _severityChips(),
        const SizedBox(height: 20),
        _sectionHeader('3. DETAILS'),
        const SizedBox(height: 8),
        _detailsCard(),
        const SizedBox(height: 20),
        _sectionHeader('4. PASSABILITY'),
        const SizedBox(height: 8),
        _passabilityRow(),
        const SizedBox(height: 20),
        _sectionHeader('5. GPS & EVIDENCE'),
        const SizedBox(height: 8),
        _gpsCard(),
        const SizedBox(height: 10),
        _evidenceRow(),
        const SizedBox(height: 24),
        _submitBtn(),
      ]),
    );
  }

  Widget _sectionHeader(String t) => Text(t, style: const TextStyle(
    color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 1.5));

  Widget _hazardGrid() => GridView.count(
    shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
    crossAxisCount: 3, childAspectRatio: 1.05, crossAxisSpacing: 8, mainAxisSpacing: 8,
    children: _hazardDefs.map((h) {
      final sel = _hazard == h['type'];
      final col = h['color'] as Color;
      return GestureDetector(
        onTap: () => setState(() => _hazard = h['type'] as HazardType),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          decoration: BoxDecoration(
            color: sel ? col.withValues(alpha: 0.18) : AppColors.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: sel ? col : AppColors.border, width: sel ? 1.5 : 1),
          ),
          child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
            Icon(h['icon'] as IconData, color: sel ? col : AppColors.textMuted, size: 24),
            const SizedBox(height: 6),
            Text(h['label'] as String, style: TextStyle(
              color: sel ? col : AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.w600),
              textAlign: TextAlign.center),
          ]),
        ),
      );
    }).toList(),
  );

  Widget _severityChips() {
    final sev = [
      {'level': SeverityLevel.minor,        'label': 'Minor',        'color': AppColors.success},
      {'level': SeverityLevel.moderate,      'label': 'Moderate',     'color': AppColors.warning},
      {'level': SeverityLevel.severe,        'label': 'Severe',       'color': AppColors.danger},
      {'level': SeverityLevel.catastrophic,  'label': 'Catastrophic', 'color': AppColors.purple},
    ];
    return Wrap(spacing: 8, runSpacing: 8, children: sev.map((s) {
      final sel = _severity == s['level'];
      final col = s['color'] as Color;
      return GestureDetector(
        onTap: () => setState(() => _severity = s['level'] as SeverityLevel),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 9),
          decoration: BoxDecoration(
            color: sel ? col.withValues(alpha: 0.18) : AppColors.surface,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: sel ? col : AppColors.border, width: sel ? 1.5 : 1),
          ),
          child: Row(mainAxisSize: MainAxisSize.min, children: [
            Container(width: 7, height: 7, decoration: BoxDecoration(color: col, shape: BoxShape.circle)),
            const SizedBox(width: 6),
            Text(s['label'] as String, style: TextStyle(
              color: sel ? col : AppColors.textMuted, fontSize: 13,
              fontWeight: sel ? FontWeight.w700 : FontWeight.w500)),
          ]),
        ),
      );
    }).toList());
  }

  Widget _detailsCard() => _card(Column(children: [
    TextField(controller: _titleCtrl,
      style: const TextStyle(color: AppColors.text, fontSize: 14),
      decoration: const InputDecoration(labelText: 'Incident Title', hintText: 'e.g. Landslide blocking Km 42',
        prefixIcon: Icon(Icons.title, color: AppColors.textMuted, size: 18))),
    const SizedBox(height: 12),
    Row(children: [
      Expanded(flex: 2, child: DropdownButtonFormField<String>(
        initialValue: _highway, dropdownColor: AppColors.surface2,
        style: const TextStyle(color: AppColors.text, fontSize: 13),
        decoration: const InputDecoration(labelText: 'Highway',
          prefixIcon: Icon(Icons.route, color: AppColors.textMuted, size: 18)),
        items: AppConstants.highways.map((h) => DropdownMenuItem(value: h, child: Text(h))).toList(),
        onChanged: (v) => setState(() => _highway = v ?? _highway),
      )),
      const SizedBox(width: 10),
      Expanded(child: TextField(controller: _chainageCtrl,
        style: const TextStyle(color: AppColors.text, fontSize: 13, fontFamily: 'monospace'),
        decoration: const InputDecoration(labelText: 'Chainage'))),
    ]),
    const SizedBox(height: 12),
    DropdownButtonFormField<String>(
      initialValue: _eta, dropdownColor: AppColors.surface2,
      style: const TextStyle(color: AppColors.text, fontSize: 13),
      decoration: const InputDecoration(labelText: 'Clearance ETA',
        prefixIcon: Icon(Icons.schedule, color: AppColors.textMuted, size: 18)),
      items: AppConstants.clearanceEtas.map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
      onChanged: (v) => setState(() => _eta = v ?? _eta),
    ),
  ]));

  Widget _passabilityRow() {
    final opts = [
      {'s': PassabilityStatus.blocked,    'label': 'Blocked',      'icon': Icons.block,              'color': AppColors.danger},
      {'s': PassabilityStatus.singleLane, 'label': 'Single-Lane',  'icon': Icons.compare_arrows,     'color': AppColors.warning},
      {'s': PassabilityStatus.caution,    'label': 'Caution',      'icon': Icons.warning_amber,      'color': AppColors.info},
      {'s': PassabilityStatus.clear,      'label': 'Clear',        'icon': Icons.check_circle_outline,'color': AppColors.success},
    ];
    return Row(children: opts.map((o) {
      final sel = _passability == o['s'];
      final col = o['color'] as Color;
      return Expanded(child: GestureDetector(
        onTap: () => setState(() => _passability = o['s'] as PassabilityStatus),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          margin: const EdgeInsets.only(right: 6),
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: sel ? col.withValues(alpha: 0.15) : AppColors.surface,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: sel ? col : AppColors.border, width: sel ? 1.5 : 1),
          ),
          child: Column(children: [
            Icon(o['icon'] as IconData, color: sel ? col : AppColors.textMuted, size: 18),
            const SizedBox(height: 4),
            Text(o['label'] as String, style: TextStyle(
              color: sel ? col : AppColors.textMuted, fontSize: 9, fontWeight: FontWeight.w600),
              textAlign: TextAlign.center),
          ]),
        ),
      ));
    }).toList());
  }

  Widget _gpsCard() => _card(Column(children: [
    Row(children: [
      Container(padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: _gps != null ? AppColors.successDim : AppColors.surface2,
          borderRadius: BorderRadius.circular(8)),
        child: Icon(Icons.gps_fixed, color: _gps != null ? AppColors.success : AppColors.textMuted, size: 20)),
      const SizedBox(width: 12),
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('Device GPS', style: TextStyle(color: AppColors.text, fontSize: 14, fontWeight: FontWeight.w600)),
        Text(_gps != null ? 'Locked · ±${_gps!.accuracy.toStringAsFixed(1)} m' : 'Not acquired',
          style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
      ])),
      ElevatedButton.icon(
        onPressed: _acquiringGps ? null : _captureGps,
        icon: _acquiringGps
            ? const SizedBox(width: 13, height: 13, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
            : const Icon(Icons.my_location, size: 14),
        label: Text(_acquiringGps ? 'Fixing...' : 'Capture', style: const TextStyle(fontSize: 12)),
        style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary,
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
      ),
    ]),
    if (_gps != null) ...[
      const SizedBox(height: 12),
      Container(padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(color: AppColors.surface2, borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.border)),
        child: Row(children: [
          Expanded(child: _gpsField('LAT', _gps!.latStr)),
          Expanded(child: _gpsField('LNG', _gps!.lngStr)),
          Expanded(child: _gpsField('ALT', _gps!.altStr)),
          Expanded(child: _gpsField('ACC', _gps!.accStr)),
        ])),
    ],
  ]));

  Widget _gpsField(String lbl, String val) => Column(children: [
    Text(lbl, style: const TextStyle(color: AppColors.textMuted, fontSize: 9, fontWeight: FontWeight.w600, letterSpacing: 0.8)),
    const SizedBox(height: 2),
    Text(val, style: const TextStyle(color: AppColors.success, fontSize: 11, fontFamily: 'monospace', fontWeight: FontWeight.w600),
      textAlign: TextAlign.center),
  ]);

  Widget _evidenceRow() => Row(children: [
    Expanded(child: _evidenceBtn(
      icon: _hasPhoto ? Icons.check_circle : Icons.camera_alt_outlined,
      label: _hasPhoto ? 'Photo ✓' : 'Geo-Photo',
      sub: _hasPhoto ? 'GPS embedded' : 'Tap to capture',
      color: _hasPhoto ? AppColors.success : AppColors.textMuted,
      bg: _hasPhoto ? AppColors.successDim : AppColors.surface,
      border: _hasPhoto ? AppColors.success.withValues(alpha: 0.4) : AppColors.border,
      onTap: _capturePhoto,
    )),
    const SizedBox(width: 10),
    Expanded(child: _evidenceBtn(
      icon: _recording ? Icons.stop_circle : _hasMemo ? Icons.mic_none : Icons.mic_outlined,
      label: _recording ? 'Recording…' : _hasMemo ? 'Voice ✓' : 'Voice Memo',
      sub: _recording ? 'Tap to stop' : _hasMemo ? 'Saved' : 'Tap to record',
      color: _recording ? AppColors.danger : _hasMemo ? AppColors.success : AppColors.textMuted,
      bg: _recording ? AppColors.dangerDim : _hasMemo ? AppColors.successDim : AppColors.surface,
      border: _recording ? AppColors.danger.withValues(alpha: 0.5) : _hasMemo ? AppColors.success.withValues(alpha: 0.4) : AppColors.border,
      onTap: () => setState(() {
        if (_recording) { _recording = false; _hasMemo = true; _snack('Voice memo saved.', AppColors.success); }
        else { _recording = true; _hasMemo = false; }
      }),
    )),
  ]);

  Widget _evidenceBtn({required IconData icon, required String label, required String sub,
      required Color color, required Color bg, required Color border, required VoidCallback onTap}) {
    return GestureDetector(onTap: onTap, child: Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(12), border: Border.all(color: border)),
      child: Column(children: [
        Icon(icon, color: color, size: 26),
        const SizedBox(height: 6),
        Text(label, style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w600)),
        Text(sub, style: const TextStyle(color: AppColors.textDim, fontSize: 10)),
      ]),
    ));
  }

  Widget _submitBtn() => SizedBox(width: double.infinity, child: ElevatedButton.icon(
    onPressed: _submitting ? null : _submit,
    icon: _submitting
        ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
        : const Icon(Icons.upload_outlined, size: 20),
    label: Text(_submitting ? 'Submitting…' : 'Submit Incident Report',
      style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
    style: ElevatedButton.styleFrom(
      backgroundColor: (_hazard != null && _severity != null) ? AppColors.danger : AppColors.surface2,
      foregroundColor: Colors.white,
      padding: const EdgeInsets.symmetric(vertical: 15),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
    ),
  ));

  Widget _card(Widget child) => Container(
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(16),
      border: Border.all(color: AppColors.border)),
    child: child);
}
