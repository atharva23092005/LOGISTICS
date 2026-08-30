import 'package:flutter/material.dart';
import 'dart:async';
import 'dart:math' as math;
import '../../utils/colors.dart';

class DriverDiagnosticsTab extends StatefulWidget {
  const DriverDiagnosticsTab({super.key});
  @override
  State<DriverDiagnosticsTab> createState() => _DriverDiagnosticsTabState();
}

class _DriverDiagnosticsTabState extends State<DriverDiagnosticsTab> {
  double _engineTemp = 88.0;
  double _fuel       = 73.0;
  int    _driveMinutes = 252; // 4h 12m
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 5), (_) {
      if (mounted) setState(() {
        _engineTemp = 85 + math.Random().nextDouble() * 6;
        _fuel = math.max(0, _fuel - 0.05);
        _driveMinutes++;
      });
    });
  }

  @override
  void dispose() { _timer?.cancel(); super.dispose(); }

  String get _driveTime {
    final h = _driveMinutes ~/ 60;
    final m = _driveMinutes % 60;
    return '${h}h ${m.toString().padLeft(2,'0')}m';
  }

  bool get _fatigue => _driveMinutes >= 240; // ≥ 4 hours

  @override
  Widget build(BuildContext context) => SingleChildScrollView(
    padding: const EdgeInsets.all(16),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      if (_fatigue) _fatigueBanner(),
      if (_fatigue) const SizedBox(height: 14),
      // Metric grid
      const _SectionTitle('LIVE VEHICLE HEALTH'),
      const SizedBox(height: 10),
      Row(children: [
        Expanded(child: _MetricCard(
          icon: Icons.thermostat_outlined, iconColor: AppColors.warning,
          label: 'Engine Temp', value: '${_engineTemp.toStringAsFixed(1)}°C',
          status: _engineTemp > 95 ? 'HIGH' : 'OK',
          statusColor: _engineTemp > 95 ? AppColors.danger : AppColors.success)),
        const SizedBox(width: 10),
        Expanded(child: _MetricCard(
          icon: Icons.tire_repair_outlined, iconColor: AppColors.info,
          label: 'Tyre Pressure', value: '34 PSI',
          status: '6/6 OK', statusColor: AppColors.success)),
      ]),
      const SizedBox(height: 10),
      Row(children: [
        Expanded(child: _MetricCard(
          icon: Icons.bolt_outlined, iconColor: AppColors.warning,
          label: 'Alternator', value: '24.2 V',
          status: 'Charging', statusColor: AppColors.success)),
        const SizedBox(width: 10),
        Expanded(child: _MetricCard(
          icon: Icons.access_time_outlined, iconColor: AppColors.primary,
          label: 'Drive Time', value: _driveTime,
          status: _fatigue ? 'Rest Due' : 'OK',
          statusColor: _fatigue ? AppColors.warning : AppColors.success)),
      ]),
      const SizedBox(height: 20),
      // Fuel gauge
      const _SectionTitle('FUEL LEVEL'),
      const SizedBox(height: 10),
      _fuelGauge(),
      const SizedBox(height: 20),
      // Systems checklist
      const _SectionTitle('SYSTEM CHECKS'),
      const SizedBox(height: 10),
      _systemsCard(),
      const SizedBox(height: 20),
    ]),
  );

  Widget _fatigueBanner() => Container(
    padding: const EdgeInsets.all(14),
    decoration: BoxDecoration(color: AppColors.warning.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12),
      border: Border.all(color: AppColors.warning.withValues(alpha: 0.5))),
    child: Row(children: [
      const Icon(Icons.warning_amber_outlined, color: AppColors.warning, size: 22),
      const SizedBox(width: 12),
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('Anti-Fatigue Alert', style: TextStyle(
          color: AppColors.warning, fontSize: 14, fontWeight: FontWeight.w700)),
        Text('$_driveTime continuous driving. Mandatory 15-min rest due.',
          style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
      ])),
    ]),
  );

  Widget _fuelGauge() => Container(
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(14),
      border: Border.all(color: AppColors.border)),
    child: Column(children: [
      Row(children: [
        const Icon(Icons.local_gas_station_outlined, color: AppColors.warning, size: 18),
        const SizedBox(width: 8),
        const Text('Fuel Tank', style: TextStyle(color: AppColors.text, fontSize: 13, fontWeight: FontWeight.w600)),
        const Spacer(),
        Text('${_fuel.toStringAsFixed(1)}%', style: TextStyle(
          color: _fuel < 25 ? AppColors.danger : AppColors.success,
          fontSize: 16, fontWeight: FontWeight.w800, fontFamily: 'monospace')),
      ]),
      const SizedBox(height: 10),
      ClipRRect(
        borderRadius: BorderRadius.circular(6),
        child: LinearProgressIndicator(value: _fuel / 100, minHeight: 12,
          backgroundColor: AppColors.surface2,
          color: _fuel < 25 ? AppColors.danger : _fuel < 50 ? AppColors.warning : AppColors.success)),
      const SizedBox(height: 8),
      Row(children: [
        Text('≈ ${(_fuel * 0.8).toStringAsFixed(0)} km range remaining',
          style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
        const Spacer(),
        if (_fuel < 50) Container(padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
          decoration: BoxDecoration(color: AppColors.warningDim, borderRadius: BorderRadius.circular(4)),
          child: const Text('REFUEL SOON', style: TextStyle(color: AppColors.warning, fontSize: 9, fontWeight: FontWeight.w700))),
      ]),
    ]),
  );

  Widget _systemsCard() => Container(
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(14),
      border: Border.all(color: AppColors.border)),
    child: Column(children: [
      _sysRow('Brakes',              true),
      _sysRow('ABS / EBS',           true),
      _sysRow('Lights & Indicators', true),
      _sysRow('GPS Transponder',     true),
      _sysRow('Offline Maps Loaded', true),
      _sysRow('Cargo Seal Intact',   true),
    ]),
  );

  Widget _sysRow(String lbl, bool ok) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 5),
    child: Row(children: [
      Icon(ok ? Icons.check_circle_outline : Icons.error_outline,
        color: ok ? AppColors.success : AppColors.danger, size: 18),
      const SizedBox(width: 10),
      Text(lbl, style: const TextStyle(color: AppColors.text, fontSize: 13)),
      const Spacer(),
      Text(ok ? 'OK' : 'FAULT', style: TextStyle(
        color: ok ? AppColors.success : AppColors.danger,
        fontSize: 11, fontWeight: FontWeight.w700, fontFamily: 'monospace')),
    ]));
}

class _MetricCard extends StatelessWidget {
  final IconData icon; final Color iconColor;
  final String label, value, status; final Color statusColor;
  const _MetricCard({required this.icon, required this.iconColor, required this.label,
    required this.value, required this.status, required this.statusColor});

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(14),
    decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(14),
      border: Border.all(color: AppColors.border)),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(children: [
        Container(width: 32, height: 32,
          decoration: BoxDecoration(color: iconColor.withValues(alpha: 0.14), borderRadius: BorderRadius.circular(8)),
          child: Icon(icon, color: iconColor, size: 18)),
        const Spacer(),
        Container(padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
          decoration: BoxDecoration(color: statusColor.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(4)),
          child: Text(status, style: TextStyle(
            color: statusColor, fontSize: 9, fontWeight: FontWeight.w700))),
      ]),
      const SizedBox(height: 10),
      Text(value, style: const TextStyle(
        color: AppColors.text, fontSize: 22, fontWeight: FontWeight.w800, fontFamily: 'monospace')),
      const SizedBox(height: 3),
      Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
    ]),
  );
}

class _SectionTitle extends StatelessWidget {
  final String title;
  const _SectionTitle(this.title);
  @override
  Widget build(BuildContext context) => Text(title, style: const TextStyle(
    color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 1.5));
}
