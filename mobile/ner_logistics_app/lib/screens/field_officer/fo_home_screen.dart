import 'package:flutter/material.dart';
import '../../utils/colors.dart';
import '../../models/app_user.dart';
import '../../models/report.dart';
import '../../models/mock_data.dart';
import '../../widgets/status_bar.dart';
import '../../screens/role_login_screen.dart';
import 'fo_report_tab.dart';
import 'fo_queue_tab.dart';
import 'fo_checkpoints_tab.dart';
import 'fo_map_tab.dart';
import 'fo_vault_tab.dart';

class FoHomeScreen extends StatefulWidget {
  final AppUser user;
  const FoHomeScreen({super.key, required this.user});

  @override
  State<FoHomeScreen> createState() => _FoHomeScreenState();
}

class _FoHomeScreenState extends State<FoHomeScreen> {
  int _tabIndex = 0;
  late List<IncidentReport> _reports;

  @override
  void initState() {
    super.initState();
    _reports = List.from(mockReports); // seed with mock data
  }

  void _addReport(IncidentReport r) => setState(() { _reports.insert(0, r); _tabIndex = 1; });

  void _logout() {
    showDialog(context: context, builder: (_) => AlertDialog(
      backgroundColor: AppColors.surface2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      title: const Text('Lock Terminal?', style: TextStyle(color: AppColors.text)),
      content: const Text('Session will be saved to local cache.',
          style: TextStyle(color: AppColors.textMuted, fontSize: 13)),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context),
            child: const Text('Cancel', style: TextStyle(color: AppColors.textMuted))),
        ElevatedButton(
          onPressed: () { Navigator.pop(context);
            Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => const RoleLoginScreen())); },
          style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger),
          child: const Text('Lock'),
        ),
      ],
    ));
  }

  @override
  Widget build(BuildContext context) {
    final tabs = [
      FoReportTab(user: widget.user, onReportSubmitted: _addReport),
      FoQueueTab(reports: _reports),
      const FoCheckpointsTab(),
      const FoMapTab(),
      FoVaultTab(reports: _reports),
    ];

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Column(children: [
        SafeArea(bottom: false, child: SimulatedStatusBar(role: widget.user.role)),
        // App bar
        Container(
          padding: const EdgeInsets.fromLTRB(14, 10, 14, 10),
          decoration: const BoxDecoration(
            color: AppColors.surface,
            border: Border(bottom: BorderSide(color: AppColors.border)),
          ),
          child: Row(children: [
            Container(width: 34, height: 34,
              decoration: BoxDecoration(color: AppColors.primaryDim, borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.primary.withValues(alpha: 0.4))),
              child: const Icon(Icons.shield_outlined, color: AppColors.primary, size: 18)),
            const SizedBox(width: 10),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('NER Field Officer', style: TextStyle(color: AppColors.text, fontSize: 14, fontWeight: FontWeight.w700)),
              Text('${widget.user.id}  ·  ${widget.user.district}',
                  style: const TextStyle(color: AppColors.textMuted, fontSize: 11, fontFamily: 'monospace')),
            ])),
            // Pending count badge
            if (_reports.where((r) => r.syncStatus == SyncStatus.pending).isNotEmpty)
              Container(
                margin: const EdgeInsets.only(right: 8),
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(color: AppColors.warningDim, borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.warning.withValues(alpha: 0.4))),
                child: Row(mainAxisSize: MainAxisSize.min, children: [
                  const Icon(Icons.sync, color: AppColors.warning, size: 12),
                  const SizedBox(width: 4),
                  Text('${_reports.where((r) => r.syncStatus == SyncStatus.pending).length} PENDING',
                      style: const TextStyle(color: AppColors.warning, fontSize: 10, fontWeight: FontWeight.w700)),
                ]),
              ),
            IconButton(
              icon: const Icon(Icons.logout, color: AppColors.textMuted, size: 18),
              onPressed: _logout, tooltip: 'Lock Terminal',
              style: IconButton.styleFrom(padding: const EdgeInsets.all(6), minimumSize: const Size(32, 32)),
            ),
          ]),
        ),
        Expanded(child: IndexedStack(index: _tabIndex, children: tabs)),
      ]),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(border: Border(top: BorderSide(color: AppColors.border))),
        child: NavigationBar(
          selectedIndex: _tabIndex,
          onDestinationSelected: (i) => setState(() => _tabIndex = i),
          backgroundColor: AppColors.surface,
          surfaceTintColor: Colors.transparent,
          shadowColor: Colors.transparent,
          labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
          destinations: [
            const NavigationDestination(icon: Icon(Icons.add_circle_outline), selectedIcon: Icon(Icons.add_circle), label: 'Report'),
            NavigationDestination(
              icon: Badge(
                isLabelVisible: _reports.where((r) => r.syncStatus == SyncStatus.pending).isNotEmpty,
                label: Text('${_reports.where((r) => r.syncStatus == SyncStatus.pending).length}'),
                child: const Icon(Icons.inbox_outlined),
              ),
              selectedIcon: const Icon(Icons.inbox),
              label: 'Queue',
            ),
            const NavigationDestination(icon: Icon(Icons.traffic_outlined), selectedIcon: Icon(Icons.traffic), label: 'Checkpoints'),
            const NavigationDestination(icon: Icon(Icons.map_outlined), selectedIcon: Icon(Icons.map), label: 'Map'),
            const NavigationDestination(icon: Icon(Icons.storage_outlined), selectedIcon: Icon(Icons.storage), label: 'Vault'),
          ],
        ),
      ),
    );
  }
}
