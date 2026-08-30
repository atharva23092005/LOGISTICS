import 'package:flutter/material.dart';
import '../../utils/colors.dart';
import '../../models/convoy.dart';

class FoCheckpointsTab extends StatefulWidget {
  const FoCheckpointsTab({super.key});
  @override
  State<FoCheckpointsTab> createState() => _FoCheckpointsTabState();
}

class _FoCheckpointsTabState extends State<FoCheckpointsTab> {
  late List<ConvoyVehicle> _convoys;

  @override
  void initState() { super.initState(); _convoys = List.from(mockConvoys); }

  Color _priorityColor(ConvoyPriority p) => switch (p) {
    ConvoyPriority.emergency => AppColors.danger,
    ConvoyPriority.high      => AppColors.warning,
    ConvoyPriority.medium    => AppColors.info,
    ConvoyPriority.normal    => AppColors.success,
  };

  void _authorize(String id) {
    setState(() => _convoys.firstWhere((c) => c.id == id).status = ConvoyStatus.authorized);
    _snack('Convoy authorized to pass.', AppColors.success);
  }

  void _hold(String id) {
    setState(() => _convoys.firstWhere((c) => c.id == id).status = ConvoyStatus.held);
    _snack('Convoy held at checkpoint.', AppColors.warning);
  }

  void _snack(String msg, Color c) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg, style: const TextStyle(color: Colors.white)),
      backgroundColor: c.withValues(alpha: 0.9),
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      duration: const Duration(seconds: 2),
    ));
  }

  void _showScan(ConvoyVehicle c) {
    showModalBottomSheet(
      context: context, backgroundColor: AppColors.surface, isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => _ScanSheet(convoy: c,
        onAuthorize: () { Navigator.pop(context); _authorize(c.id); },
        onHold: () { Navigator.pop(context); _hold(c.id); }),
    );
  }

  @override
  Widget build(BuildContext context) {
    final approaching = _convoys.where((c) => c.status == ConvoyStatus.approaching).length;
    final authorized  = _convoys.where((c) => c.status == ConvoyStatus.authorized).length;
    final held        = _convoys.where((c) => c.status == ConvoyStatus.held).length;

    return Column(children: [
      // Stats header
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: const BoxDecoration(color: AppColors.surface,
          border: Border(bottom: BorderSide(color: AppColors.border))),
        child: Row(children: [
          Expanded(child: Row(children: [
            const Icon(Icons.traffic_outlined, color: AppColors.info, size: 18),
            const SizedBox(width: 8),
            const Text('Checkpoint Control', style: TextStyle(color: AppColors.text, fontSize: 14, fontWeight: FontWeight.w700)),
          ])),
          _statBadge('$approaching approaching', AppColors.info),
          const SizedBox(width: 6),
          if (held > 0) _statBadge('$held held', AppColors.danger),
          if (authorized > 0) _statBadge('$authorized passed', AppColors.success),
          const SizedBox(width: 6),
          IconButton(
            icon: const Icon(Icons.qr_code_scanner, color: AppColors.primary, size: 22),
            tooltip: 'Scan QR Pass',
            onPressed: () {
              final first = _convoys.where((c) => c.status == ConvoyStatus.approaching);
              if (first.isNotEmpty) _showScan(first.first);
            },
          ),
        ]),
      ),
      Expanded(child: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: _convoys.length,
        separatorBuilder: (_, __) => const SizedBox(height: 10),
        itemBuilder: (_, i) => _ConvoyCard(
          convoy: _convoys[i],
          priorityColor: _priorityColor(_convoys[i].priority),
          onAuthorize: () => _authorize(_convoys[i].id),
          onHold: () => _hold(_convoys[i].id),
          onScan: () => _showScan(_convoys[i]),
        ),
      )),
    ]);
  }

  Widget _statBadge(String label, Color color) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
    decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(6),
      border: Border.all(color: color.withValues(alpha: 0.3))),
    child: Text(label, style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.w600)));
}

class _ConvoyCard extends StatelessWidget {
  final ConvoyVehicle convoy;
  final Color priorityColor;
  final VoidCallback onAuthorize, onHold, onScan;
  const _ConvoyCard({required this.convoy, required this.priorityColor,
    required this.onAuthorize, required this.onHold, required this.onScan});

  @override
  Widget build(BuildContext context) {
    final statusColor = switch (convoy.status) {
      ConvoyStatus.authorized => AppColors.success,
      ConvoyStatus.held       => AppColors.danger,
      _                       => AppColors.info,
    };
    return Container(
      decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(14),
        border: Border.all(color: priorityColor.withValues(alpha: 0.3))),
      child: Column(children: [
        Padding(padding: const EdgeInsets.fromLTRB(14, 12, 14, 0), child: Row(children: [
          Container(width: 40, height: 40,
            decoration: BoxDecoration(color: priorityColor.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(10)),
            child: Icon(Icons.local_shipping, color: priorityColor, size: 20)),
          const SizedBox(width: 10),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(convoy.regNo, style: const TextStyle(color: AppColors.text, fontSize: 14,
              fontWeight: FontWeight.w700, fontFamily: 'monospace')),
            Text('${convoy.origin} → ${convoy.destination}',
              style: const TextStyle(color: AppColors.textMuted, fontSize: 11), overflow: TextOverflow.ellipsis),
          ])),
          Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
            Container(padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
              decoration: BoxDecoration(color: priorityColor.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(6),
                border: Border.all(color: priorityColor.withValues(alpha: 0.4))),
              child: Text(convoy.priorityLabel, style: TextStyle(
                color: priorityColor, fontSize: 9, fontWeight: FontWeight.w700))),
            const SizedBox(height: 3),
            Text('ETA ${convoy.etaMinutes}', style: const TextStyle(color: AppColors.textMuted, fontSize: 10)),
          ]),
        ])),
        Padding(padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8), child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(color: AppColors.surface2, borderRadius: BorderRadius.circular(8)),
          child: Row(children: [
            const Icon(Icons.inventory_2_outlined, size: 13, color: AppColors.textMuted),
            const SizedBox(width: 6),
            Text(convoy.cargoType, style: const TextStyle(color: AppColors.text, fontSize: 12)),
            const Spacer(),
            Text(convoy.payloadKg, style: const TextStyle(color: AppColors.textMuted, fontSize: 11, fontFamily: 'monospace')),
          ]),
        )),
        Padding(padding: const EdgeInsets.fromLTRB(14, 0, 14, 12), child: Row(children: [
          Container(padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
            decoration: BoxDecoration(color: statusColor.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(6),
              border: Border.all(color: statusColor.withValues(alpha: 0.3))),
            child: Text(convoy.status.name.toUpperCase(),
              style: TextStyle(color: statusColor, fontSize: 9, fontWeight: FontWeight.w700))),
          const Spacer(),
          IconButton(icon: const Icon(Icons.qr_code_2, color: AppColors.info, size: 22),
            tooltip: 'Scan QR', onPressed: onScan,
            style: IconButton.styleFrom(backgroundColor: AppColors.infoDim, padding: const EdgeInsets.all(6), minimumSize: const Size(32, 32))),
          const SizedBox(width: 6),
          if (convoy.status == ConvoyStatus.approaching) ...[
            _actionBtn('Authorize', AppColors.success, Icons.check, onAuthorize),
            const SizedBox(width: 6),
            _actionBtn('Hold', AppColors.danger, Icons.pause, onHold),
          ],
        ])),
      ]),
    );
  }

  Widget _actionBtn(String label, Color color, IconData icon, VoidCallback onTap) =>
    ElevatedButton.icon(
      onPressed: onTap,
      icon: Icon(icon, size: 13),
      label: Text(label, style: const TextStyle(fontSize: 12)),
      style: ElevatedButton.styleFrom(backgroundColor: color, foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))));
}

class _ScanSheet extends StatelessWidget {
  final ConvoyVehicle convoy;
  final VoidCallback onAuthorize, onHold;
  const _ScanSheet({required this.convoy, required this.onAuthorize, required this.onHold});

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.all(24),
    child: Column(mainAxisSize: MainAxisSize.min, children: [
      Center(child: Container(width: 36, height: 4,
        decoration: BoxDecoration(color: AppColors.border, borderRadius: BorderRadius.circular(2)))),
      const SizedBox(height: 16),
      Container(width: double.infinity, padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(color: AppColors.successDim, borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.success.withValues(alpha: 0.4))),
        child: const Row(mainAxisAlignment: MainAxisAlignment.center, children: [
          Icon(Icons.verified_outlined, color: AppColors.success, size: 18),
          SizedBox(width: 8),
          Text('✓ ECDSA SIGNATURE VALID', style: TextStyle(
            color: AppColors.success, fontSize: 13, fontWeight: FontWeight.w700, letterSpacing: 1)),
        ])),
      const SizedBox(height: 20),
      ...[ ['Reg No', convoy.regNo], ['Driver', convoy.driverName],
        ['Phone', convoy.driverPhone], ['Cargo', convoy.cargoType],
        ['Payload', convoy.payloadKg], ['Seal No', convoy.sealNo],
        ['Route', '${convoy.origin} → ${convoy.destination}'],
      ].map((r) => _row(r[0], r[1])),
      const SizedBox(height: 20),
      Row(children: [
        Expanded(child: ElevatedButton.icon(
          onPressed: onAuthorize,
          icon: const Icon(Icons.check_circle_outline, size: 18),
          label: const Text('Authorize Pass'),
          style: ElevatedButton.styleFrom(backgroundColor: AppColors.success, foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))))),
        const SizedBox(width: 10),
        Expanded(child: OutlinedButton.icon(
          onPressed: onHold,
          icon: const Icon(Icons.pause_circle_outline, size: 18, color: AppColors.danger),
          label: const Text('Hold', style: TextStyle(color: AppColors.danger)),
          style: OutlinedButton.styleFrom(side: BorderSide(color: AppColors.danger.withValues(alpha: 0.5)),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))))),
      ]),
    ]),
  );

  Widget _row(String lbl, String val) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 5),
    child: Row(children: [
      SizedBox(width: 90, child: Text(lbl, style: const TextStyle(color: AppColors.textMuted, fontSize: 13))),
      Expanded(child: Text(val, style: const TextStyle(color: AppColors.text, fontSize: 13,
        fontWeight: FontWeight.w600, fontFamily: 'monospace'))),
    ]));
}
