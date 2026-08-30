import 'dart:async';
import 'package:flutter/material.dart';
import '../utils/colors.dart';
import '../utils/constants.dart';
import '../models/app_user.dart';

class SimulatedStatusBar extends StatefulWidget {
  final UserRole? role;
  const SimulatedStatusBar({super.key, this.role});

  @override
  State<SimulatedStatusBar> createState() => _SimulatedStatusBarState();
}

class _SimulatedStatusBarState extends State<SimulatedStatusBar> {
  late Timer _timer;
  late DateTime _now;

  @override
  void initState() {
    super.initState();
    _now = DateTime.now();
    _timer = Timer.periodic(const Duration(seconds: 30), (_) {
      if (mounted) setState(() => _now = DateTime.now());
    });
  }

  @override
  void dispose() { _timer.cancel(); super.dispose(); }

  String get _timeStr {
    return '${_now.hour.toString().padLeft(2,'0')}:${_now.minute.toString().padLeft(2,'0')}';
  }

  String get _modeLabel {
    if (widget.role == UserRole.fieldOfficer) return 'FIELD-OPS';
    if (widget.role == UserRole.driver)       return 'COCKPIT';
    return AppConstants.buildEnv;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 32,
      color: AppColors.surface,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          Text(_timeStr, style: const TextStyle(
            color: AppColors.text, fontSize: 13,
            fontWeight: FontWeight.w700, fontFamily: 'monospace',
          )),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
            decoration: BoxDecoration(
              color: AppColors.primaryDim,
              borderRadius: BorderRadius.circular(4),
              border: Border.all(color: AppColors.primary.withValues(alpha: 0.4)),
            ),
            child: Text('$_modeLabel ${AppConstants.appVersion}', style: const TextStyle(
              color: AppColors.primary, fontSize: 9,
              fontWeight: FontWeight.w700, letterSpacing: 0.8,
            )),
          ),
          const Spacer(),
          // Signal bars
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: List.generate(4, (i) => Container(
              width: 3,
              height: 4.0 + i * 2.5,
              margin: const EdgeInsets.only(right: 1),
              decoration: BoxDecoration(
                color: i < 3 ? AppColors.success : AppColors.textDim,
                borderRadius: BorderRadius.circular(1),
              ),
            )),
          ),
          const SizedBox(width: 8),
          // Battery
          Row(children: [
            Container(
              width: 20, height: 11,
              decoration: BoxDecoration(border: Border.all(color: AppColors.textMuted), borderRadius: BorderRadius.circular(2)),
              child: Padding(
                padding: const EdgeInsets.all(1.5),
                child: FractionallySizedBox(
                  widthFactor: 0.78, alignment: Alignment.centerLeft,
                  child: Container(decoration: BoxDecoration(color: AppColors.success, borderRadius: BorderRadius.circular(1))),
                ),
              ),
            ),
            Container(width: 2, height: 5, margin: const EdgeInsets.only(left: 1),
              decoration: BoxDecoration(color: AppColors.textMuted, borderRadius: const BorderRadius.only(
                topRight: Radius.circular(1), bottomRight: Radius.circular(1)))),
          ]),
        ],
      ),
    );
  }
}
