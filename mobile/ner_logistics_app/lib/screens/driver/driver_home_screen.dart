import 'package:flutter/material.dart';
import 'dart:async';
import '../../utils/colors.dart';
import '../../models/app_user.dart';
import '../../models/sms_message.dart';
import '../../models/mock_data.dart';
import '../../widgets/status_bar.dart';
import '../../screens/role_login_screen.dart';
import 'driver_nav_tab.dart';
import 'driver_manifest_tab.dart';
import 'driver_qr_tab.dart';
import 'driver_sms_tab.dart';
import 'driver_diagnostics_tab.dart';

class DriverHomeScreen extends StatefulWidget {
  final AppUser user;
  final Map<String, String> convoy;
  const DriverHomeScreen({super.key, required this.user, required this.convoy});
  @override
  State<DriverHomeScreen> createState() => _DriverHomeScreenState();
}

class _DriverHomeScreenState extends State<DriverHomeScreen> {
  int _tabIndex = 0;
  bool _voiceEnabled = true;
  late List<SmsMessage> _messages;

  @override
  void initState() { super.initState(); _messages = buildMockMessages(); }

  void _showQrPass() => setState(() => _tabIndex = 2);

  void _toggleVoice() => setState(() => _voiceEnabled = !_voiceEnabled);

  void _triggerSos() {
    showDialog(
      context: context, barrierDismissible: false,
      builder: (_) => _SosDialog(),
    );
  }

  void _logout() {
    showDialog(context: context, builder: (_) => AlertDialog(
      backgroundColor: AppColors.surface2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      title: const Text('End Shift?', style: TextStyle(color: AppColors.text)),
      content: const Text('Telemetry will be saved locally.',
        style: TextStyle(color: AppColors.textMuted, fontSize: 13)),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context),
          child: const Text('Continue', style: TextStyle(color: AppColors.textMuted))),
        ElevatedButton(
          onPressed: () { Navigator.pop(context);
            Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => const RoleLoginScreen())); },
          style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger),
          child: const Text('End Shift')),
      ],
    ));
  }

  @override
  Widget build(BuildContext context) {
    final tabs = [
      const DriverNavTab(),
      const DriverManifestTab(),
      DriverQrTab(convoy: widget.convoy),
      DriverSmsTab(
        messages: _messages,
        onNewMessage: (m) => setState(() => _messages.insert(0, m))),
      const DriverDiagnosticsTab(),
    ];

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Column(children: [
        SafeArea(bottom: false, child: SimulatedStatusBar(role: widget.user.role)),
        // Persistent driver header
        _DriverHeader(
          convoy: widget.convoy, voiceEnabled: _voiceEnabled,
          onQrPass: _showQrPass, onVoiceToggle: _toggleVoice,
          onSos: _triggerSos, onLogout: _logout),
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
            const NavigationDestination(icon: Icon(Icons.navigation_outlined), selectedIcon: Icon(Icons.navigation), label: 'Nav'),
            const NavigationDestination(icon: Icon(Icons.turn_right_outlined), selectedIcon: Icon(Icons.turn_right), label: 'Turns'),
            const NavigationDestination(icon: Icon(Icons.qr_code_outlined), selectedIcon: Icon(Icons.qr_code), label: 'QR Pass'),
            NavigationDestination(
              icon: Badge(isLabelVisible: _messages.any((m) => !m.acknowledged),
                label: Text('${_messages.where((m) => !m.acknowledged).length}'),
                child: const Icon(Icons.sms_outlined)),
              selectedIcon: const Icon(Icons.sms), label: 'SMS'),
            const NavigationDestination(icon: Icon(Icons.speed_outlined), selectedIcon: Icon(Icons.speed), label: 'Diagnostics'),
          ],
        ),
      ),
    );
  }
}

class _DriverHeader extends StatelessWidget {
  final Map<String, String> convoy;
  final bool voiceEnabled;
  final VoidCallback onQrPass, onVoiceToggle, onSos, onLogout;
  const _DriverHeader({required this.convoy, required this.voiceEnabled,
    required this.onQrPass, required this.onVoiceToggle, required this.onSos, required this.onLogout});

  @override
  Widget build(BuildContext context) {
    final isEmergency = convoy['priority'] == 'EMERGENCY';
    final pColor = isEmergency ? AppColors.danger : AppColors.warning;
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
      decoration: const BoxDecoration(color: AppColors.surface,
        border: Border(bottom: BorderSide(color: AppColors.border))),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(color: pColor.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(6),
              border: Border.all(color: pColor.withValues(alpha: 0.5))),
            child: Text(convoy['id']!, style: TextStyle(
              color: pColor, fontSize: 13, fontWeight: FontWeight.w800, fontFamily: 'monospace'))),
          const SizedBox(width: 6),
          Container(padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
            decoration: BoxDecoration(color: pColor, borderRadius: BorderRadius.circular(4)),
            child: Text(convoy['priority']!, style: const TextStyle(
              color: Colors.white, fontSize: 9, fontWeight: FontWeight.w800, letterSpacing: 0.8))),
          const Spacer(),
          _headerBtn(Icons.qr_code_2, AppColors.primary, AppColors.primaryDim, onQrPass, 'QR Pass'),
          const SizedBox(width: 4),
          _headerBtn(voiceEnabled ? Icons.volume_up : Icons.volume_off,
            voiceEnabled ? AppColors.info : AppColors.textDim,
            voiceEnabled ? AppColors.infoDim : AppColors.surface2,
            onVoiceToggle, 'Voice'),
          const SizedBox(width: 4),
          GestureDetector(onTap: onSos, child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
            decoration: BoxDecoration(color: AppColors.danger, borderRadius: BorderRadius.circular(8)),
            child: const Row(mainAxisSize: MainAxisSize.min, children: [
              Icon(Icons.sos, color: Colors.white, size: 15),
              SizedBox(width: 4),
              Text('SOS', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w900)),
            ]))),
          const SizedBox(width: 4),
          IconButton(onPressed: onLogout, icon: const Icon(Icons.logout, color: AppColors.textMuted, size: 18),
            tooltip: 'End Shift', style: IconButton.styleFrom(padding: const EdgeInsets.all(6), minimumSize: const Size(32, 32))),
        ]),
        const SizedBox(height: 6),
        Row(children: [
          const Icon(Icons.my_location, size: 11, color: AppColors.textMuted),
          const SizedBox(width: 4),
          Text(convoy['origin']!, style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
          const SizedBox(width: 6),
          const Icon(Icons.arrow_forward, size: 11, color: AppColors.textDim),
          const SizedBox(width: 6),
          Expanded(child: Text(convoy['destination']!, style: const TextStyle(
            color: AppColors.text, fontSize: 11, fontWeight: FontWeight.w600))),
          Text(convoy['cargo']!, style: const TextStyle(color: AppColors.textMuted, fontSize: 10)),
        ]),
      ]),
    );
  }

  Widget _headerBtn(IconData icon, Color color, Color bg, VoidCallback onTap, String tooltip) =>
    IconButton(onPressed: onTap, icon: Icon(icon, color: color, size: 20), tooltip: tooltip,
      style: IconButton.styleFrom(backgroundColor: bg, padding: const EdgeInsets.all(6), minimumSize: const Size(34, 34)));
}

class _SosDialog extends StatefulWidget {
  @override
  State<_SosDialog> createState() => _SosDialogState();
}

class _SosDialogState extends State<_SosDialog> {
  int _countdown = 5;
  bool _broadcast = false;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (_countdown <= 1) { t.cancel(); setState(() => _broadcast = true); }
      else setState(() => _countdown--);
    });
  }

  @override
  void dispose() { _timer?.cancel(); super.dispose(); }

  @override
  Widget build(BuildContext context) => AlertDialog(
    backgroundColor: AppColors.surface2,
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
    content: _broadcast ? _broadcastView(context) : _countdownView(context),
  );

  Widget _countdownView(BuildContext ctx) => Column(mainAxisSize: MainAxisSize.min, children: [
    Container(width: 80, height: 80,
      decoration: BoxDecoration(color: AppColors.danger.withValues(alpha: 0.15), shape: BoxShape.circle,
        border: Border.all(color: AppColors.danger, width: 2)),
      child: Center(child: Text('$_countdown', style: const TextStyle(
        color: AppColors.danger, fontSize: 40, fontWeight: FontWeight.w900, fontFamily: 'monospace')))),
    const SizedBox(height: 16),
    const Text('EMERGENCY SOS', style: TextStyle(color: AppColors.danger, fontSize: 18,
      fontWeight: FontWeight.w900, letterSpacing: 1.5)),
    const SizedBox(height: 8),
    const Text('Broadcasting emergency beacon\nto NER Command in…',
      style: TextStyle(color: AppColors.textMuted, fontSize: 13, height: 1.5), textAlign: TextAlign.center),
    const SizedBox(height: 20),
    SizedBox(width: double.infinity, child: OutlinedButton(
      onPressed: () => Navigator.pop(ctx),
      style: OutlinedButton.styleFrom(side: const BorderSide(color: AppColors.border),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
      child: const Text('Cancel', style: TextStyle(color: AppColors.textMuted)))),
  ]);

  Widget _broadcastView(BuildContext ctx) => Column(mainAxisSize: MainAxisSize.min, children: [
    Container(padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(color: AppColors.dangerDim, shape: BoxShape.circle),
      child: const Icon(Icons.cell_tower, color: AppColors.danger, size: 38)),
    const SizedBox(height: 16),
    const Text('BEACON BROADCAST', style: TextStyle(color: AppColors.danger, fontSize: 16,
      fontWeight: FontWeight.w900, letterSpacing: 1.5)),
    const SizedBox(height: 10),
    const Text('✓ Signal sent to NER Command\n✓ GPS coordinates transmitted\n✓ Convoy status: EMERGENCY HALT',
      style: TextStyle(color: AppColors.text, fontSize: 13, height: 1.6), textAlign: TextAlign.center),
    const SizedBox(height: 6),
    const Text('Help is on the way. Stay with vehicle.',
      style: TextStyle(color: AppColors.textMuted, fontSize: 12)),
    const SizedBox(height: 20),
    SizedBox(width: double.infinity, child: ElevatedButton(
      onPressed: () => Navigator.pop(ctx),
      style: ElevatedButton.styleFrom(backgroundColor: AppColors.surface,
        foregroundColor: AppColors.text, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
      child: const Text('Acknowledge'))),
  ]);
}
