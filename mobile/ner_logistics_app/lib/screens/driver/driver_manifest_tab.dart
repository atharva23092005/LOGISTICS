import 'package:flutter/material.dart';
import '../../utils/colors.dart';

class DriverManifestTab extends StatelessWidget {
  const DriverManifestTab({super.key});

  static const _steps = [
    _RouteStep(1, '0.0 km',    'Depart Guwahati Relief Depot (Gate 2)',              '07:15 AM', _StepStatus.completed),
    _RouteStep(2, '38.4 km',   'Merge onto NH-27 Eastbound Corridor',                '08:00 AM', _StepStatus.completed),
    _RouteStep(3, '94.2 km',   'Cross Tezpur Brahmaputra Bridge via SH-15',          '09:20 AM', _StepStatus.active),
    _RouteStep(4, '142.0 km',  'Pasighat District Checkpoint Gate #04',              '11:45 AM', _StepStatus.upcoming),
    _RouteStep(5, '186.5 km',  'Arrive Pasighat General Hospital Hub (Delivery)',    '01:15 PM', _StepStatus.upcoming),
  ];

  @override
  Widget build(BuildContext context) {
    final completed = _steps.where((s) => s.status == _StepStatus.completed).length;
    return Column(children: [
      // Header
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: const BoxDecoration(color: AppColors.surface,
          border: Border(bottom: BorderSide(color: AppColors.border))),
        child: Row(children: [
          const Icon(Icons.route_outlined, color: AppColors.primary, size: 18),
          const SizedBox(width: 10),
          const Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Route Manifest', style: TextStyle(color: AppColors.text, fontSize: 14, fontWeight: FontWeight.w700)),
            Text('Guwahati → Pasighat  ·  186.5 km', style: TextStyle(color: AppColors.textMuted, fontSize: 11)),
          ])),
          // Progress indicator
          Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(color: AppColors.primaryDim, borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppColors.primary.withValues(alpha: 0.4))),
            child: Text('$completed / ${_steps.length}  waypoints',
              style: const TextStyle(color: AppColors.primary, fontSize: 11, fontWeight: FontWeight.w700))),
        ]),
      ),
      // Progress bar
      Container(height: 4, color: AppColors.surface2,
        child: FractionallySizedBox(widthFactor: completed / _steps.length, alignment: Alignment.centerLeft,
          child: Container(color: AppColors.primary))),
      // Step list
      Expanded(child: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: _steps.length,
        separatorBuilder: (_, __) => const SizedBox(height: 10),
        itemBuilder: (_, i) => _StepCard(step: _steps[i]),
      )),
    ]);
  }
}

enum _StepStatus { completed, active, upcoming }

class _RouteStep {
  final int number;
  final String distance;
  final String instruction;
  final String eta;
  final _StepStatus status;
  const _RouteStep(this.number, this.distance, this.instruction, this.eta, this.status);
}

class _StepCard extends StatelessWidget {
  final _RouteStep step;
  const _StepCard({required this.step});

  @override
  Widget build(BuildContext context) {
    final isActive    = step.status == _StepStatus.active;
    final isCompleted = step.status == _StepStatus.completed;

    final circleColor = isCompleted ? AppColors.success
        : isActive ? AppColors.primary
        : AppColors.surface2;
    final circleBorder = isCompleted ? AppColors.success
        : isActive ? AppColors.primary
        : AppColors.border;
    final cardBorder = isActive ? AppColors.primary.withValues(alpha: 0.4) : AppColors.border;
    final cardBg     = isActive ? AppColors.primary.withValues(alpha: 0.04) : AppColors.surface;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: cardBg, borderRadius: BorderRadius.circular(14),
        border: Border.all(color: cardBorder, width: isActive ? 1.5 : 1)),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        // Step circle
        Container(
          width: 32, height: 32,
          decoration: BoxDecoration(color: circleColor, shape: BoxShape.circle,
            border: Border.all(color: circleBorder, width: isActive ? 0 : 1.5),
            boxShadow: isActive ? [BoxShadow(color: AppColors.primary.withValues(alpha: 0.3), blurRadius: 8)] : null),
          child: Center(child: isCompleted
              ? const Icon(Icons.check, color: Colors.white, size: 16)
              : Text('${step.number}', style: TextStyle(
                  color: isActive ? Colors.white : AppColors.textMuted,
                  fontSize: 13, fontWeight: FontWeight.w700))),
        ),
        const SizedBox(width: 12),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Container(padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(color: AppColors.surface2, borderRadius: BorderRadius.circular(4),
                border: Border.all(color: AppColors.border)),
              child: Text(step.distance, style: const TextStyle(
                color: AppColors.textMuted, fontSize: 10, fontFamily: 'monospace'))),
            const Spacer(),
            Row(children: [
              const Icon(Icons.access_time, size: 11, color: AppColors.textMuted),
              const SizedBox(width: 3),
              Text(step.eta, style: const TextStyle(color: AppColors.textDim, fontSize: 10, fontFamily: 'monospace')),
            ]),
          ]),
          const SizedBox(height: 6),
          Text(step.instruction, style: TextStyle(
            color: isActive ? AppColors.text : isCompleted ? AppColors.textMuted : AppColors.text,
            fontSize: 13, fontWeight: isActive ? FontWeight.w600 : FontWeight.w500)),
          if (isActive) ...[
            const SizedBox(height: 6),
            Row(children: [
              Container(width: 6, height: 6,
                decoration: const BoxDecoration(color: AppColors.primary, shape: BoxShape.circle)),
              const SizedBox(width: 5),
              const Text('Current position · En route',
                style: TextStyle(color: AppColors.primary, fontSize: 11, fontWeight: FontWeight.w600)),
            ]),
          ],
        ])),
      ]),
    );
  }
}
