import 'package:flutter/material.dart';
import '../../utils/colors.dart';
import '../../models/report.dart';

class FoVaultTab extends StatefulWidget {
  final List<IncidentReport> reports;
  const FoVaultTab({super.key, required this.reports});
  @override
  State<FoVaultTab> createState() => _FoVaultTabState();
}

class _FoVaultTabState extends State<FoVaultTab> {
  bool _syncing = false;

  int get _pending => widget.reports.where((r) => r.syncStatus == SyncStatus.pending).length;
  int get _total   => widget.reports.length;

  void _syncNow() async {
    if (_pending == 0) { _snack('All reports already synced.', AppColors.info); return; }
    setState(() => _syncing = true);
    await Future.delayed(const Duration(milliseconds: 1800));
    if (mounted) { setState(() => _syncing = false); _snack('$_pending reports synced to HQ.', AppColors.success); }
  }

  void _snack(String m, Color c) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(m, style: const TextStyle(color: Colors.white)),
      backgroundColor: c.withValues(alpha: 0.9), behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))));
  }

  @override
  Widget build(BuildContext context) => SingleChildScrollView(
    padding: const EdgeInsets.all(16),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      // SQLite stats card
      _card(Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Container(width: 40, height: 40,
            decoration: BoxDecoration(color: AppColors.primaryDim, borderRadius: BorderRadius.circular(10)),
            child: const Icon(Icons.storage_outlined, color: AppColors.primary, size: 22)),
          const SizedBox(width: 12),
          const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Local SQLite Vault', style: TextStyle(color: AppColors.text, fontSize: 14, fontWeight: FontWeight.w700)),
            Text('AES-256 GCM encrypted', style: TextStyle(color: AppColors.textMuted, fontSize: 11)),
          ]),
          const Spacer(),
          Container(padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
            decoration: BoxDecoration(color: AppColors.successDim, borderRadius: BorderRadius.circular(6)),
            child: const Text('ACTIVE', style: TextStyle(color: AppColors.success, fontSize: 9, fontWeight: FontWeight.w700))),
        ]),
        const SizedBox(height: 16),
        Row(children: [
          _statBox('$_total', 'Total Records', AppColors.primary),
          const SizedBox(width: 10),
          _statBox('$_pending', 'Pending Sync', _pending > 0 ? AppColors.warning : AppColors.textDim),
          const SizedBox(width: 10),
          _statBox('${_total - _pending}', 'Synced', AppColors.success),
        ]),
        const SizedBox(height: 14),
        Row(children: [
          const Text('Storage used:', style: TextStyle(color: AppColors.textMuted, fontSize: 12)),
          const Spacer(),
          const Text('14.2 MB / 512 MB', style: TextStyle(color: AppColors.text, fontSize: 12, fontWeight: FontWeight.w600)),
        ]),
        const SizedBox(height: 6),
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(value: 0.028, minHeight: 6,
            backgroundColor: AppColors.surface2, color: AppColors.primary)),
      ])),
      const SizedBox(height: 14),
      // Offline map pack
      _card(Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Row(children: [
          Icon(Icons.offline_pin_outlined, color: AppColors.info, size: 20),
          SizedBox(width: 10),
          Text('Offline Map Pack', style: TextStyle(color: AppColors.text, fontSize: 14, fontWeight: FontWeight.w700)),
        ]),
        const SizedBox(height: 12),
        _infoRow('Format', 'MBTiles v1.3 (Vector)'),
        _infoRow('Coverage', 'East Siang · Dibrugarh · Tinsukia'),
        _infoRow('Pack Size', '142 MB cached on device'),
        _infoRow('Routing', 'Dijkstra WASM — Active'),
        _infoRow('Last Updated', '28 Aug 2026'),
      ])),
      const SizedBox(height: 14),
      // Security
      _card(Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Row(children: [
          Icon(Icons.security_outlined, color: AppColors.success, size: 20),
          SizedBox(width: 10),
          Text('Security & Encryption', style: TextStyle(color: AppColors.text, fontSize: 14, fontWeight: FontWeight.w700)),
        ]),
        const SizedBox(height: 12),
        _infoRow('Encryption', 'AES-256 GCM'),
        _infoRow('Signatures', 'ECDSA SHA-256 offline'),
        _infoRow('QR Tokens', 'Cryptographically signed'),
        _infoRow('Auth', 'Offline credential cache'),
      ])),
      const SizedBox(height: 20),
      SizedBox(width: double.infinity, child: ElevatedButton.icon(
        onPressed: _syncing ? null : _syncNow,
        icon: _syncing
            ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
            : const Icon(Icons.sync, size: 20),
        label: Text(_syncing ? 'Syncing ${_pending} reports…' : 'Sync Now  ($_pending pending)',
          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
        style: ElevatedButton.styleFrom(
          backgroundColor: _pending > 0 ? AppColors.primary : AppColors.surface2,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
      )),
    ]),
  );

  Widget _card(Widget child) => Container(
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(16),
      border: Border.all(color: AppColors.border)),
    child: child);

  Widget _statBox(String val, String lbl, Color color) => Expanded(child: Container(
    padding: const EdgeInsets.symmetric(vertical: 10),
    decoration: BoxDecoration(color: AppColors.surface2, borderRadius: BorderRadius.circular(10),
      border: Border.all(color: AppColors.border)),
    child: Column(children: [
      Text(val, style: TextStyle(color: color, fontSize: 22, fontWeight: FontWeight.w800, fontFamily: 'monospace')),
      Text(lbl, style: const TextStyle(color: AppColors.textMuted, fontSize: 10), textAlign: TextAlign.center),
    ])));

  Widget _infoRow(String lbl, String val) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 4),
    child: Row(children: [
      SizedBox(width: 100, child: Text(lbl, style: const TextStyle(color: AppColors.textMuted, fontSize: 12))),
      Expanded(child: Text(val, style: const TextStyle(color: AppColors.text, fontSize: 12, fontWeight: FontWeight.w500))),
    ]));
}
