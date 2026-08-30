import 'package:flutter/material.dart';
import 'dart:math' as math;
import '../../utils/colors.dart';

class DriverQrTab extends StatefulWidget {
  final Map<String, String> convoy;
  const DriverQrTab({super.key, required this.convoy});
  @override
  State<DriverQrTab> createState() => _DriverQrTabState();
}

class _DriverQrTabState extends State<DriverQrTab> with SingleTickerProviderStateMixin {
  bool _delivered = false;
  late AnimationController _shimmer;

  @override
  void initState() {
    super.initState();
    _shimmer = AnimationController(vsync: this, duration: const Duration(seconds: 2))..repeat();
  }

  @override
  void dispose() { _shimmer.dispose(); super.dispose(); }

  String get _passToken => 'NER-PASS-${widget.convoy['id']!.replaceAll('-','')}-MED-8842';

  void _verifyOtp() {
    final ctrl = TextEditingController();
    showDialog(context: context, builder: (_) => AlertDialog(
      backgroundColor: AppColors.surface2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      title: const Text('Verify Delivery OTP', style: TextStyle(color: AppColors.text, fontSize: 16)),
      content: Column(mainAxisSize: MainAxisSize.min, children: [
        const Text('Ask the consignee for the 4-digit handover OTP.',
          style: TextStyle(color: AppColors.textMuted, fontSize: 13)),
        const SizedBox(height: 16),
        TextField(controller: ctrl, keyboardType: TextInputType.number, maxLength: 4,
          textAlign: TextAlign.center,
          style: const TextStyle(color: AppColors.text, fontSize: 30, fontFamily: 'monospace',
            fontWeight: FontWeight.w800, letterSpacing: 10),
          decoration: InputDecoration(counterText: '', hintText: '○○○○',
            filled: true, fillColor: AppColors.surface,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppColors.border)),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppColors.primary, width: 1.5)))),
        const SizedBox(height: 8),
        const Text('Hint: provided by Dr. P. Baruah on arrival',
          style: TextStyle(color: AppColors.textDim, fontSize: 11)),
      ]),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context),
          child: const Text('Cancel', style: TextStyle(color: AppColors.textMuted))),
        ElevatedButton.icon(
          icon: const Icon(Icons.verified, size: 16),
          label: const Text('Confirm'),
          style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
          onPressed: () {
            Navigator.pop(context);
            if (ctrl.text == '8842') {
              setState(() => _delivered = true);
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                content: Text('✓ Delivery confirmed. POD recorded.',
                  style: TextStyle(color: Colors.white)),
                backgroundColor: AppColors.success, behavior: SnackBarBehavior.floating));
            } else {
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                content: Text('✗ Invalid OTP. Try again.',
                  style: TextStyle(color: Colors.white)),
                backgroundColor: AppColors.danger, behavior: SnackBarBehavior.floating));
            }
          }),
      ],
    ));
  }

  @override
  Widget build(BuildContext context) => SingleChildScrollView(
    padding: const EdgeInsets.all(16),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      // Title row
      Row(children: [
        Container(width: 38, height: 38,
          decoration: BoxDecoration(color: AppColors.primaryDim, borderRadius: BorderRadius.circular(10),
            border: Border.all(color: AppColors.primary.withValues(alpha: 0.4))),
          child: const Icon(Icons.qr_code_2, color: AppColors.primary, size: 20)),
        const SizedBox(width: 12),
        const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Digital Transit Pass', style: TextStyle(color: AppColors.text, fontSize: 16, fontWeight: FontWeight.w700)),
          Text('ECDSA-SIGNED · OFFLINE-VERIFIABLE', style: TextStyle(
            color: AppColors.textMuted, fontSize: 9, fontWeight: FontWeight.w700, letterSpacing: 1.2)),
        ]),
      ]),
      const SizedBox(height: 16),
      // QR card
      Container(
        width: double.infinity, padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: AppColors.surface, borderRadius: BorderRadius.circular(20),
          border: Border.all(color: _delivered ? AppColors.success.withValues(alpha: 0.5) : AppColors.border),
          boxShadow: [BoxShadow(color: AppColors.primary.withValues(alpha: 0.07), blurRadius: 20)]),
        child: Column(children: [
          if (_delivered)
            Container(width: double.infinity, padding: const EdgeInsets.symmetric(vertical: 8),
              margin: const EdgeInsets.only(bottom: 14),
              decoration: BoxDecoration(color: AppColors.successDim, borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.success.withValues(alpha: 0.4))),
              child: const Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                Icon(Icons.check_circle, color: AppColors.success, size: 16),
                SizedBox(width: 8),
                Text('DELIVERY CONFIRMED · POD RECORDED', style: TextStyle(
                  color: AppColors.success, fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 0.8)),
              ])),
          // Animated QR widget
          Center(child: SizedBox(width: 200, height: 200,
            child: AnimatedBuilder(animation: _shimmer,
              builder: (_, __) => CustomPaint(painter: _QrPainter(_shimmer.value))))),
          const SizedBox(height: 14),
          // Token
          Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(color: AppColors.surface2, borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppColors.border)),
            child: Text(_passToken, style: const TextStyle(color: AppColors.primary, fontSize: 11,
              fontFamily: 'monospace', fontWeight: FontWeight.w700, letterSpacing: 0.8))),
          const SizedBox(height: 14),
          // Pass details table
          ...[
            ['Vehicle', widget.convoy['id']!],
            ['Cargo', widget.convoy['cargo']!],
            ['Seal No.', widget.convoy['seal']!],
            ['Payload', widget.convoy['payload']!],
            ['Route', '${widget.convoy['origin']} → ${widget.convoy['destination']}'],
          ].map((r) => Column(children: [
            _passRow(r[0], r[1]),
            const Divider(color: AppColors.border, height: 12),
          ])),
        ]),
      ),
      const SizedBox(height: 16),
      // Consignee handover
      Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surface, borderRadius: BorderRadius.circular(16),
          border: Border.all(color: _delivered ? AppColors.success.withValues(alpha: 0.4) : AppColors.border)),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('CONSIGNEE HANDOVER', style: TextStyle(
            color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 1.5)),
          const SizedBox(height: 12),
          _infoRow(Icons.person_outline, 'Recipient', 'Dr. P. Baruah · Pasighat Hospital Hub'),
          const SizedBox(height: 6),
          _infoRow(Icons.pin_outlined, 'OTP', '4-digit code from consignee on delivery'),
          const SizedBox(height: 14),
          SizedBox(width: double.infinity, child: ElevatedButton.icon(
            onPressed: _delivered ? null : _verifyOtp,
            icon: Icon(_delivered ? Icons.check_circle : Icons.verified_outlined, size: 18),
            label: Text(_delivered ? 'Delivery Confirmed ✓' : 'Verify Handover OTP',
              style: const TextStyle(fontWeight: FontWeight.w700)),
            style: ElevatedButton.styleFrom(
              backgroundColor: _delivered ? AppColors.success : AppColors.primary,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 13),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))))),
        ]),
      ),
      const SizedBox(height: 20),
    ]),
  );

  Widget _passRow(String lbl, String val) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 3),
    child: Row(children: [
      SizedBox(width: 72, child: Text(lbl, style: const TextStyle(color: AppColors.textMuted, fontSize: 12))),
      Expanded(child: Text(val, style: const TextStyle(color: AppColors.text, fontSize: 12,
        fontWeight: FontWeight.w600, fontFamily: 'monospace'))),
    ]));

  Widget _infoRow(IconData icon, String lbl, String val) => Row(children: [
    Icon(icon, size: 15, color: AppColors.textMuted),
    const SizedBox(width: 8),
    Text('$lbl: ', style: const TextStyle(color: AppColors.textMuted, fontSize: 13)),
    Expanded(child: Text(val, style: const TextStyle(color: AppColors.text, fontSize: 13, fontWeight: FontWeight.w500))),
  ]);
}

class _QrPainter extends CustomPainter {
  final double shimmerValue;
  _QrPainter(this.shimmerValue);

  @override
  void paint(Canvas canvas, Size size) {
    // Background
    canvas.drawRRect(RRect.fromRectAndRadius(Offset.zero & size, const Radius.circular(14)),
      Paint()..color = const Color(0xFF0D1626));

    // Simulated data cells
    final dot = Paint()..color = const Color(0xFF2A4166);
    const sz = 10.0; const gap = 3.0; const off = 14.0;
    final cols = ((size.width - off * 2) / (sz + gap)).floor();
    final rows = ((size.height - off * 2) / (sz + gap)).floor();
    final rng = math.Random(42);
    for (int r = 0; r < rows; r++) {
      for (int c = 0; c < cols; c++) {
        if (_isCorner(r, c, rows, cols)) continue;
        if (rng.nextBool()) {
          canvas.drawRRect(
            RRect.fromRectAndRadius(
              Rect.fromLTWH(off + c * (sz + gap), off + r * (sz + gap), sz, sz),
              const Radius.circular(2)),
            dot);
        }
      }
    }

    // 3 corner markers
    for (final pos in [(0.0, 0.0), (size.width - 44.0, 0.0), (0.0, size.height - 44.0)]) {
      _corner(canvas, Offset(pos.$1 + 8, pos.$2 + 8));
    }

    // Center shield icon area
    final cx = size.width / 2; final cy = size.height / 2;
    canvas.drawRRect(RRect.fromRectAndRadius(Rect.fromCenter(center: Offset(cx, cy), width: 48, height: 48),
      const Radius.circular(10)), Paint()..color = const Color(0xFF1A2E4A));

    // Shimmer scan line
    final y = shimmerValue * size.height;
    final shimmerPaint = Paint()..shader = LinearGradient(
      begin: Alignment.topCenter, end: Alignment.bottomCenter,
      colors: [AppColors.primary.withValues(alpha: 0), AppColors.primary.withValues(alpha: 0.5), AppColors.primary.withValues(alpha: 0)],
    ).createShader(Rect.fromLTWH(0, y - 15, size.width, 30));
    canvas.drawRect(Rect.fromLTWH(0, y - 10, size.width, 20), shimmerPaint);
  }

  void _corner(Canvas canvas, Offset origin) {
    final outer = Paint()..color = AppColors.primary..style = PaintingStyle.stroke..strokeWidth = 2.5;
    final inner = Paint()..color = AppColors.primary;
    canvas.drawRRect(RRect.fromRectAndRadius(Rect.fromLTWH(origin.dx, origin.dy, 28, 28), const Radius.circular(4)), outer);
    canvas.drawRRect(RRect.fromRectAndRadius(Rect.fromLTWH(origin.dx + 7, origin.dy + 7, 14, 14), const Radius.circular(2)), inner);
  }

  bool _isCorner(int r, int c, int rows, int cols) {
    const sz = 4;
    return (r < sz && c < sz) || (r < sz && c >= cols - sz) || (r >= rows - sz && c < sz);
  }

  @override
  bool shouldRepaint(_QrPainter old) => old.shimmerValue != shimmerValue;
}
