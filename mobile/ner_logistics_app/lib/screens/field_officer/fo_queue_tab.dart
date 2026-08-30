import 'package:flutter/material.dart';
import '../../utils/colors.dart';
import '../../models/report.dart';

class FoQueueTab extends StatelessWidget {
  final List<IncidentReport> reports;
  const FoQueueTab({super.key, required this.reports});

  Color _severityColor(SeverityLevel s) => switch (s) {
    SeverityLevel.minor        => AppColors.success,
    SeverityLevel.moderate     => AppColors.warning,
    SeverityLevel.severe       => AppColors.danger,
    SeverityLevel.catastrophic => AppColors.purple,
  };

  void _openDetail(BuildContext ctx, IncidentReport r) {
    showModalBottomSheet(
      context: ctx, backgroundColor: AppColors.surface, isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => _DetailSheet(report: r),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (reports.isEmpty) return _emptyState();
    final pending = reports.where((r) => r.syncStatus == SyncStatus.pending).length;
    return Column(children: [
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: const BoxDecoration(color: AppColors.surface,
          border: Border(bottom: BorderSide(color: AppColors.border))),
        child: Row(children: [
          Text('${reports.length} report${reports.length != 1 ? "s" : ""}',
            style: const TextStyle(color: AppColors.text, fontSize: 14, fontWeight: FontWeight.w600)),
          const Spacer(),
          if (pending > 0) _chip('$pending pending sync', AppColors.warning),
          if (pending == 0 && reports.isNotEmpty) _chip('All synced ✓', AppColors.success),
        ]),
      ),
      Expanded(child: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: reports.length,
        separatorBuilder: (_, __) => const SizedBox(height: 10),
        itemBuilder: (ctx, i) => _ReportCard(
          report: reports[i],
          severityColor: _severityColor(reports[i].severity),
          onTap: () => _openDetail(ctx, reports[i]),
        ),
      )),
    ]);
  }

  Widget _chip(String label, Color color) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
    decoration: BoxDecoration(color: color.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(20),
      border: Border.all(color: color.withValues(alpha: 0.4))),
    child: Text(label, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w600)));

  Widget _emptyState() => Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
    Container(width: 68, height: 68,
      decoration: BoxDecoration(color: AppColors.surface, shape: BoxShape.circle, border: Border.all(color: AppColors.border)),
      child: const Icon(Icons.inbox_outlined, color: AppColors.textMuted, size: 34)),
    const SizedBox(height: 14),
    const Text('No reports yet', style: TextStyle(color: AppColors.text, fontSize: 16, fontWeight: FontWeight.w600)),
    const SizedBox(height: 6),
    const Text('Submit one from the Report tab', style: TextStyle(color: AppColors.textMuted, fontSize: 13)),
  ]));
}

class _ReportCard extends StatelessWidget {
  final IncidentReport report;
  final Color severityColor;
  final VoidCallback onTap;
  const _ReportCard({required this.report, required this.severityColor, required this.onTap});

  @override
  Widget build(BuildContext context) => GestureDetector(
    onTap: onTap,
    child: Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(14),
        border: Border.all(color: severityColor.withValues(alpha: 0.3))),
      child: Row(children: [
        Container(width: 44, height: 44,
          decoration: BoxDecoration(color: severityColor.withValues(alpha: 0.15), shape: BoxShape.circle,
            border: Border.all(color: severityColor.withValues(alpha: 0.35))),
          child: Center(child: Text(report.hazardType.emoji, style: const TextStyle(fontSize: 20)))),
        const SizedBox(width: 12),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Expanded(child: Text(report.title, style: const TextStyle(color: AppColors.text, fontSize: 14,
              fontWeight: FontWeight.w600), maxLines: 1, overflow: TextOverflow.ellipsis)),
            const SizedBox(width: 8),
            _syncBadge(report.syncStatus),
          ]),
          const SizedBox(height: 4),
          Text('${report.highway}  ·  ${report.chainage}', style: const TextStyle(
            color: AppColors.textMuted, fontSize: 11, fontFamily: 'monospace')),
          const SizedBox(height: 3),
          Row(children: [
            Container(width: 6, height: 6, decoration: BoxDecoration(color: severityColor, shape: BoxShape.circle)),
            const SizedBox(width: 5),
            Text('${report.severityLabel}  ·  ${report.passabilityLabel}',
              style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
            if (report.gpsData != null) ...[
              const Spacer(),
              Text('${report.gpsData!.latitude.toStringAsFixed(4)}°N',
                style: const TextStyle(color: AppColors.textDim, fontSize: 10, fontFamily: 'monospace')),
            ],
          ]),
        ])),
        const SizedBox(width: 6),
        const Icon(Icons.chevron_right, color: AppColors.textDim, size: 18),
      ]),
    ),
  );

  Widget _syncBadge(SyncStatus s) {
    final synced = s == SyncStatus.synced;
    final color = synced ? AppColors.success : AppColors.warning;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(color: color.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(4),
        border: Border.all(color: color.withValues(alpha: 0.4))),
      child: Text(synced ? 'SYNCED' : 'PENDING',
        style: TextStyle(color: color, fontSize: 9, fontWeight: FontWeight.w700)));
  }
}

class _DetailSheet extends StatelessWidget {
  final IncidentReport report;
  const _DetailSheet({required this.report});

  @override
  Widget build(BuildContext context) => DraggableScrollableSheet(
    expand: false, initialChildSize: 0.65, maxChildSize: 0.95, minChildSize: 0.4,
    builder: (_, ctrl) => SingleChildScrollView(
      controller: ctrl, padding: const EdgeInsets.all(20),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Center(child: Container(width: 36, height: 4,
          decoration: BoxDecoration(color: AppColors.border, borderRadius: BorderRadius.circular(2)))),
        const SizedBox(height: 16),
        Row(children: [
          Text(report.hazardType.emoji, style: const TextStyle(fontSize: 28)),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(report.title, style: const TextStyle(color: AppColors.text, fontSize: 17, fontWeight: FontWeight.w700)),
            Text(report.reportId, style: const TextStyle(color: AppColors.textMuted, fontSize: 11, fontFamily: 'monospace')),
          ])),
        ]),
        const SizedBox(height: 16),
        ...[ ['Hazard', report.hazardLabel], ['Severity', report.severityLabel],
          ['Highway', report.highway], ['Chainage', report.chainage],
          ['Passability', report.passabilityLabel], ['Clearance ETA', report.clearanceEta],
          if (report.gpsData != null) ...[ ['Latitude', report.gpsData!.latStr],
            ['Longitude', report.gpsData!.lngStr], ['Altitude', report.gpsData!.altStr]],
          ['Photo', report.photoPath != null ? 'Captured ✓' : '—'],
          ['Voice', report.hasVoiceMemo ? 'Recorded ✓' : '—'],
          ['Reported by', report.reportedBy],
        ].map((row) => _row(row[0], row[1])),
        const SizedBox(height: 16),
        SizedBox(width: double.infinity, child: OutlinedButton(
          onPressed: () => Navigator.pop(context),
          style: OutlinedButton.styleFrom(side: const BorderSide(color: AppColors.border),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
          child: const Text('Close', style: TextStyle(color: AppColors.textMuted)))),
      ]),
    ),
  );

  Widget _row(String lbl, String val) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 5),
    child: Row(children: [
      SizedBox(width: 110, child: Text(lbl, style: const TextStyle(color: AppColors.textMuted, fontSize: 13))),
      Expanded(child: Text(val, style: const TextStyle(color: AppColors.text, fontSize: 13, fontWeight: FontWeight.w600))),
    ]));
}
