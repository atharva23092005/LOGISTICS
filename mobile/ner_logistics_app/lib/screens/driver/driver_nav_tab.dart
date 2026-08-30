import 'package:flutter/material.dart';
import 'dart:async';
import 'dart:math' as math;
import '../../utils/colors.dart';

class DriverNavTab extends StatefulWidget {
  const DriverNavTab({super.key});
  @override
  State<DriverNavTab> createState() => _DriverNavTabState();
}

class _DriverNavTabState extends State<DriverNavTab> with SingleTickerProviderStateMixin {
  late AnimationController _pulseCtrl;
  late Animation<double> _pulseAnim;
  bool _rerouteAlert = true;
  String _tripStatus = 'En Route';
  double _speed = 58.0;
  Timer? _speedTimer;

  static const _statuses = ['Loaded', 'En Route', 'Delayed', 'Delivered'];
  static const _statusColors = [AppColors.primary, AppColors.success, AppColors.warning, AppColors.info];

  @override
  void initState() {
    super.initState();
    _pulseCtrl = AnimationController(vsync: this, duration: const Duration(seconds: 2))..repeat(reverse: true);
    _pulseAnim = Tween<double>(begin: 0.7, end: 1.0).animate(CurvedAnimation(parent: _pulseCtrl, curve: Curves.easeInOut));
    _speedTimer = Timer.periodic(const Duration(seconds: 3), (_) {
      if (mounted) setState(() => _speed = 45 + math.Random().nextInt(22).toDouble());
    });
  }

  @override
  void dispose() { _pulseCtrl.dispose(); _speedTimer?.cancel(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Stack(children: [
      Positioned.fill(child: CustomPaint(painter: _NavMapPainter())),
      // Turn card
      Positioned(top: 12, left: 12, right: 12, child: _turnCard()),
      // Reroute alert
      if (_rerouteAlert) Positioned(top: 118, left: 12, right: 12, child: _rerouteCard()),
      // Current position puck
      Positioned(
        left: MediaQuery.of(context).size.width * 0.42,
        top: MediaQuery.of(context).size.height * 0.42,
        child: AnimatedBuilder(animation: _pulseAnim, builder: (_, __) => Stack(alignment: Alignment.center, children: [
          Container(width: 34 * _pulseAnim.value, height: 34 * _pulseAnim.value,
            decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.18 * _pulseAnim.value), shape: BoxShape.circle)),
          Container(width: 18, height: 18,
            decoration: BoxDecoration(color: AppColors.primary, shape: BoxShape.circle,
              border: Border.all(color: Colors.white, width: 2.5),
              boxShadow: [BoxShadow(color: AppColors.primary.withValues(alpha: 0.4), blurRadius: 8)])),
        ])),
      ),
      // Bottom telemetry
      Positioned(bottom: 0, left: 0, right: 0, child: Column(mainAxisSize: MainAxisSize.min, children: [
        _statusRow(), _telemetryStrip(),
      ])),
    ]);
  }

  Widget _turnCard() => Container(
    padding: const EdgeInsets.all(14),
    decoration: BoxDecoration(
      color: AppColors.surface.withValues(alpha: 0.93),
      borderRadius: BorderRadius.circular(14),
      border: Border.all(color: AppColors.border),
      boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.3), blurRadius: 10, offset: const Offset(0, 3))]),
    child: Row(children: [
      Container(width: 48, height: 48,
        decoration: BoxDecoration(color: AppColors.primaryDim, borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.primary.withValues(alpha: 0.4))),
        child: const Icon(Icons.turn_right, color: AppColors.primary, size: 26)),
      const SizedBox(width: 12),
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('Bear left onto BRO-104 Bypass', style: TextStyle(
          color: AppColors.text, fontSize: 14, fontWeight: FontWeight.w700)),
        const SizedBox(height: 3),
        Row(children: [
          const Icon(Icons.straighten, size: 11, color: AppColors.textMuted),
          const SizedBox(width: 4),
          const Text('1.8 km ahead', style: TextStyle(color: AppColors.textMuted, fontSize: 11)),
          const SizedBox(width: 10),
          _speedLimit('40 km/h'),
        ]),
      ])),
      Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
        const Text('↗ +6%', style: TextStyle(color: AppColors.warning, fontSize: 11, fontWeight: FontWeight.w600, fontFamily: 'monospace')),
        const Text('slope', style: TextStyle(color: AppColors.textMuted, fontSize: 10)),
      ]),
    ]),
  );

  Widget _speedLimit(String lbl) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
    decoration: BoxDecoration(color: AppColors.warningDim, borderRadius: BorderRadius.circular(4),
      border: Border.all(color: AppColors.warning.withValues(alpha: 0.4))),
    child: Text(lbl, style: const TextStyle(color: AppColors.warning, fontSize: 10, fontWeight: FontWeight.w700)));

  Widget _rerouteCard() => Container(
    padding: const EdgeInsets.all(12),
    decoration: BoxDecoration(
      color: AppColors.danger.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(12),
      border: Border.all(color: AppColors.danger.withValues(alpha: 0.5))),
    child: Row(children: [
      Container(padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(color: AppColors.dangerDim, borderRadius: BorderRadius.circular(8)),
        child: const Icon(Icons.warning_amber, color: AppColors.danger, size: 18)),
      const SizedBox(width: 10),
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: const [
        Text('NH-415 · Landslide at Km 142', style: TextStyle(color: AppColors.danger, fontSize: 12, fontWeight: FontWeight.w700)),
        Text('Safe bypass via BRO-104 available (+18 min)', style: TextStyle(color: AppColors.textMuted, fontSize: 10)),
      ])),
      const SizedBox(width: 8),
      ElevatedButton(
        onPressed: () => setState(() => _rerouteAlert = false),
        style: ElevatedButton.styleFrom(backgroundColor: AppColors.success, foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
        child: const Text('Accept', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700))),
    ]),
  );

  Widget _statusRow() => Container(
    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
    color: AppColors.background.withValues(alpha: 0.9),
    child: Row(children: _statuses.asMap().entries.map((e) {
      final sel = _tripStatus == e.value;
      final col = _statusColors[e.key];
      return Expanded(child: GestureDetector(
        onTap: () => setState(() => _tripStatus = e.value),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          margin: const EdgeInsets.symmetric(horizontal: 3),
          padding: const EdgeInsets.symmetric(vertical: 7),
          decoration: BoxDecoration(
            color: sel ? col.withValues(alpha: 0.15) : AppColors.surface,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: sel ? col : AppColors.border, width: sel ? 1.5 : 1)),
          child: Text(e.value, style: TextStyle(
            color: sel ? col : AppColors.textMuted,
            fontSize: 10, fontWeight: sel ? FontWeight.w700 : FontWeight.w500),
            textAlign: TextAlign.center),
        ),
      ));
    }).toList()),
  );

  Widget _telemetryStrip() => Container(
    padding: const EdgeInsets.fromLTRB(16, 10, 16, 14),
    decoration: const BoxDecoration(color: AppColors.surface, border: Border(top: BorderSide(color: AppColors.border))),
    child: Row(children: [
      _telItem('${_speed.toInt()}', 'km/h', _speed > 70 ? AppColors.warning : AppColors.primary),
      _divider(),
      _telItem('73', '%', AppColors.success, lbl: 'Fuel'),
      _divider(),
      _telItem('2h 18m', '', AppColors.info, lbl: 'ETA'),
      _divider(),
      _telItem('187', 'km', AppColors.text, lbl: 'Remain'),
    ]),
  );

  Widget _telItem(String val, String unit, Color col, {String? lbl}) => Expanded(child: Column(
    mainAxisSize: MainAxisSize.min,
    children: [
      if (lbl != null) Text(lbl, style: const TextStyle(color: AppColors.textMuted, fontSize: 9, letterSpacing: 0.5)),
      Row(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.end, children: [
        Text(val, style: TextStyle(color: col, fontSize: 22, fontWeight: FontWeight.w800, fontFamily: 'monospace', height: 1.1)),
        if (unit.isNotEmpty) Padding(padding: const EdgeInsets.only(bottom: 3, left: 2),
          child: Text(unit, style: const TextStyle(color: AppColors.textMuted, fontSize: 11))),
      ]),
    ],
  ));

  Widget _divider() => Container(width: 1, height: 30, color: AppColors.border, margin: const EdgeInsets.symmetric(horizontal: 4));
}

class _NavMapPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    canvas.drawRect(Offset.zero & size, Paint()..color = const Color(0xFF060C18));
    final w = size.width; final h = size.height;
    final grid = Paint()..color = const Color(0xFF1F3352).withValues(alpha: 0.3)..strokeWidth = 0.5;
    for (int i = 0; i <= 20; i++) {
      canvas.drawLine(Offset(w * i / 20, 0), Offset(w * i / 20, h), grid);
      canvas.drawLine(Offset(0, h * i / 20), Offset(w, h * i / 20), grid);
    }
    // Terrain
    void terrain(List<Offset> pts, Color c) {
      final p = Path()..moveTo(pts[0].dx, pts[0].dy);
      for (var o in pts.skip(1)) p.lineTo(o.dx, o.dy);
      p.close(); canvas.drawPath(p, Paint()..color = c);
    }
    terrain([Offset(0,h*0.5),Offset(w*0.25,h*0.3),Offset(w*0.5,h*0.4),Offset(w*0.35,h*0.65),Offset(0,h*0.75)], const Color(0xFF102040));
    terrain([Offset(w*0.55,h*0.2),Offset(w,h*0.1),Offset(w,h*0.6),Offset(w*0.7,h*0.65)], const Color(0xFF0D1A30));
    // Roads
    void road(Path p, Color c, double w2) => canvas.drawPath(p, Paint()..color=c..strokeWidth=w2..style=PaintingStyle.stroke..strokeCap=StrokeCap.round);
    final r1 = Path()..moveTo(w*0.05, h*0.92);
    r1.cubicTo(w*0.2,h*0.78,w*0.38,h*0.68,w*0.42,h*0.74);
    r1.cubicTo(w*0.52,h*0.82,w*0.7,h*0.66,w*0.95,h*0.6);
    road(r1, AppColors.primary.withValues(alpha: 0.65), 3.0);
    final r2 = Path()..moveTo(w*0.35,h*0.67);
    r2.cubicTo(w*0.4,h*0.48,w*0.55,h*0.35,w*0.68,h*0.45);
    r2.cubicTo(w*0.82,h*0.55,w*0.9,h*0.54,w*0.95,h*0.6);
    road(r2, AppColors.success.withValues(alpha: 0.6), 2.0);
    // Danger zone circle
    canvas.drawCircle(Offset(w*0.42,h*0.35), 24, Paint()..color=AppColors.danger.withValues(alpha: 0.16));
    canvas.drawCircle(Offset(w*0.42,h*0.35), 24, Paint()..color=AppColors.danger.withValues(alpha: 0.4)..style=PaintingStyle.stroke..strokeWidth=1.5);
    // Destination pin
    canvas.drawCircle(Offset(w*0.82,h*0.28), 8, Paint()..color=AppColors.success);
    canvas.drawCircle(Offset(w*0.82,h*0.28), 13, Paint()..color=AppColors.success.withValues(alpha: 0.3)..style=PaintingStyle.stroke..strokeWidth=2);
  }
  @override
  bool shouldRepaint(_) => false;
}
