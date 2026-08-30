import 'package:flutter/material.dart';
import 'dart:math' as math;
import '../../utils/colors.dart';

class FoMapTab extends StatefulWidget {
  const FoMapTab({super.key});
  @override
  State<FoMapTab> createState() => _FoMapTabState();
}

class _FoMapTabState extends State<FoMapTab> with SingleTickerProviderStateMixin {
  late AnimationController _pulseCtrl;
  late Animation<double> _pulseAnim;

  @override
  void initState() {
    super.initState();
    _pulseCtrl = AnimationController(vsync: this, duration: const Duration(seconds: 2))..repeat(reverse: true);
    _pulseAnim = Tween<double>(begin: 0.6, end: 1.0).animate(CurvedAnimation(parent: _pulseCtrl, curve: Curves.easeInOut));
  }

  @override
  void dispose() { _pulseCtrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Stack(children: [
      Positioned.fill(child: CustomPaint(painter: _TerrainMapPainter())),
      // Animated alert pins
      ..._AlertPin.pins.map((p) => Positioned(
        left: MediaQuery.of(context).size.width * p.xFrac - 12,
        top: MediaQuery.of(context).size.height * p.yFrac - 12,
        child: AnimatedBuilder(animation: _pulseAnim, builder: (_, __) => Stack(
          alignment: Alignment.center,
          children: [
            Container(width: 28 * _pulseAnim.value, height: 28 * _pulseAnim.value,
              decoration: BoxDecoration(color: p.color.withValues(alpha: 0.2 * _pulseAnim.value), shape: BoxShape.circle)),
            Container(width: 14, height: 14,
              decoration: BoxDecoration(color: p.color, shape: BoxShape.circle,
                border: Border.all(color: Colors.white, width: 2))),
          ],
        )),
      )),
      // Top overlay: GPS coordinates + sector
      Positioned(top: 12, left: 12, right: 12, child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(color: AppColors.surface.withValues(alpha: 0.88),
          borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.border)),
        child: Row(children: [
          const Icon(Icons.map_outlined, color: AppColors.primary, size: 18),
          const SizedBox(width: 10),
          const Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('East Siang Sector  ·  Offline Vector Map', style: TextStyle(
              color: AppColors.text, fontSize: 12, fontWeight: FontWeight.w600)),
            Text('27.8612° N,  94.9079° E  ·  MBTiles 142 MB cached', style: TextStyle(
              color: AppColors.textMuted, fontSize: 10, fontFamily: 'monospace')),
          ])),
          Container(padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
            decoration: BoxDecoration(color: AppColors.successDim, borderRadius: BorderRadius.circular(6)),
            child: const Text('OFFLINE', style: TextStyle(
              color: AppColors.success, fontSize: 9, fontWeight: FontWeight.w700))),
        ]),
      )),
      // Legend
      Positioned(bottom: 16, left: 12, child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(color: AppColors.surface.withValues(alpha: 0.88),
          borderRadius: BorderRadius.circular(10), border: Border.all(color: AppColors.border)),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min,
          children: _AlertPin.pins.map((p) => Padding(
            padding: const EdgeInsets.symmetric(vertical: 2),
            child: Row(mainAxisSize: MainAxisSize.min, children: [
              Container(width: 8, height: 8, decoration: BoxDecoration(color: p.color, shape: BoxShape.circle)),
              const SizedBox(width: 6),
              Text(p.label, style: const TextStyle(color: AppColors.textMuted, fontSize: 10)),
            ]),
          )).toList()),
      )),
    ]);
  }
}

class _AlertPin { final double xFrac, yFrac; final Color color; final String label;
  const _AlertPin(this.xFrac, this.yFrac, this.color, this.label);
  static const pins = [
    _AlertPin(0.45, 0.35, AppColors.danger,  'Landslide (NH-415 km 142)'),
    _AlertPin(0.68, 0.55, AppColors.warning, 'Bridge caution (SH-15)'),
    _AlertPin(0.28, 0.60, AppColors.info,    'Checkpoint Gate #04'),
    _AlertPin(0.55, 0.72, AppColors.success, 'Current position'),
  ];
}

class _TerrainMapPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    // Background
    canvas.drawRect(Offset.zero & size, Paint()..color = const Color(0xFF06101E));

    // Grid
    final grid = Paint()..color = const Color(0xFF1F3352).withValues(alpha: 0.3)..strokeWidth = 0.5;
    for (int i = 0; i <= 20; i++) {
      canvas.drawLine(Offset(size.width * i / 20, 0), Offset(size.width * i / 20, size.height), grid);
      canvas.drawLine(Offset(0, size.height * i / 20), Offset(size.width, size.height * i / 20), grid);
    }

    // Terrain fills
    void drawTerrain(List<Offset> pts, Color c) {
      final path = Path()..moveTo(pts[0].dx, pts[0].dy);
      for (var p in pts.skip(1)) path.lineTo(p.dx, p.dy);
      path.close();
      canvas.drawPath(path, Paint()..color = c);
    }

    final w = size.width; final h = size.height;
    drawTerrain([Offset(0, h * 0.5), Offset(w * 0.3, h * 0.3), Offset(w * 0.6, h * 0.45), Offset(w * 0.4, h * 0.65), Offset(0, h * 0.75)], const Color(0xFF112240));
    drawTerrain([Offset(w * 0.6, h * 0.2), Offset(w, h * 0.15), Offset(w, h * 0.55), Offset(w * 0.75, h * 0.6), Offset(w * 0.55, h * 0.45)], const Color(0xFF0E1C35));

    // River
    final river = Paint()..color = const Color(0xFF06B6D4).withValues(alpha: 0.35)..strokeWidth = 3..style = PaintingStyle.stroke;
    final rp = Path()..moveTo(0, h * 0.82);
    for (int i = 1; i <= 12; i++) rp.lineTo(w * i / 12, h * (0.82 + math.sin(i * 0.8) * 0.04));
    canvas.drawPath(rp, river);

    // Road NH-415 (blue — main)
    final road = Paint()..color = AppColors.primary.withValues(alpha: 0.7)..strokeWidth = 2.5..style = PaintingStyle.stroke..strokeCap = StrokeCap.round;
    final roa = Path()..moveTo(w * 0.05, h * 0.9);
    roa.cubicTo(w * 0.2, h * 0.75, w * 0.35, h * 0.65, w * 0.45, h * 0.72);
    roa.cubicTo(w * 0.58, h * 0.78, w * 0.75, h * 0.6, w * 0.95, h * 0.55);
    canvas.drawPath(roa, road);

    // Bypass road (green — safe)
    final bypass = Paint()..color = AppColors.success.withValues(alpha: 0.6)..strokeWidth = 2..style = PaintingStyle.stroke..strokeCap = StrokeCap.round;
    final byp = Path()..moveTo(w * 0.35, h * 0.65);
    byp.cubicTo(w * 0.4, h * 0.45, w * 0.55, h * 0.35, w * 0.68, h * 0.45);
    byp.cubicTo(w * 0.82, h * 0.55, w * 0.9, h * 0.52, w * 0.95, h * 0.55);
    canvas.drawPath(byp, bypass);

    // Danger zone
    canvas.drawCircle(Offset(w * 0.45, h * 0.35), 22, Paint()..color = AppColors.danger.withValues(alpha: 0.18));
    canvas.drawCircle(Offset(w * 0.45, h * 0.35), 22, Paint()..color = AppColors.danger.withValues(alpha: 0.5)..style = PaintingStyle.stroke..strokeWidth = 1.5);
  }

  @override
  bool shouldRepaint(covariant CustomPainter _) => false;
}
