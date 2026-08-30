import 'package:flutter/material.dart';
import '../../utils/colors.dart';
import '../../models/sms_message.dart';

class DriverSmsTab extends StatelessWidget {
  final List<SmsMessage> messages;
  final void Function(SmsMessage) onNewMessage;
  const DriverSmsTab({super.key, required this.messages, required this.onNewMessage});

  void _simulateSms(BuildContext ctx) {
    final msg = SmsMessage(
      id: 'sim-${DateTime.now().millisecondsSinceEpoch}',
      sender: 'NER-HQ-DISPATCH',
      text: 'STATUS UPDATE: NH-415 remains impassable. Maintain BRO-104 bypass. Confirm ETA to Pasighat checkpoint.',
      timestamp: DateTime.now(),
      priority: MessagePriority.urgent);
    onNewMessage(msg);
    ScaffoldMessenger.of(ctx).showSnackBar(const SnackBar(
      content: Text('New SMS received from NER-HQ', style: TextStyle(color: Colors.white)),
      backgroundColor: AppColors.primary, behavior: SnackBarBehavior.floating,
      duration: Duration(seconds: 2)));
  }

  void _acknowledge(BuildContext ctx, SmsMessage msg) {
    msg.acknowledged = true;
    ScaffoldMessenger.of(ctx).showSnackBar(const SnackBar(
      content: Text('ACK sent to NER-HQ-DISPATCH', style: TextStyle(color: Colors.white)),
      backgroundColor: AppColors.success, behavior: SnackBarBehavior.floating,
      duration: Duration(seconds: 2)));
  }

  @override
  Widget build(BuildContext context) => Column(children: [
    // Header
    Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: const BoxDecoration(color: AppColors.surface,
        border: Border(bottom: BorderSide(color: AppColors.border))),
      child: Row(children: [
        const Icon(Icons.cell_tower, color: AppColors.info, size: 18),
        const SizedBox(width: 10),
        const Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('SMS Dead-Zone Feed', style: TextStyle(color: AppColors.text, fontSize: 14, fontWeight: FontWeight.w700)),
          Text('Cellular fallback · Works without internet', style: TextStyle(color: AppColors.textMuted, fontSize: 11)),
        ])),
        OutlinedButton.icon(
          onPressed: () => _simulateSms(context),
          icon: const Icon(Icons.add, size: 14, color: AppColors.info),
          label: const Text('Simulate', style: TextStyle(color: AppColors.info, fontSize: 12)),
          style: OutlinedButton.styleFrom(
            side: BorderSide(color: AppColors.info.withValues(alpha: 0.4)),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)))),
      ]),
    ),
    Expanded(child: messages.isEmpty ? _emptyState() : ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: messages.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (ctx, i) => _SmsCard(message: messages[i],
        onAck: () => _acknowledge(ctx, messages[i])),
    )),
  ]);

  Widget _emptyState() => const Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
    Icon(Icons.sms_outlined, color: AppColors.textMuted, size: 48),
    SizedBox(height: 12),
    Text('No messages yet', style: TextStyle(color: AppColors.text, fontSize: 16, fontWeight: FontWeight.w600)),
    SizedBox(height: 6),
    Text('HQ dispatch messages appear here', style: TextStyle(color: AppColors.textMuted, fontSize: 13)),
  ]));
}

class _SmsCard extends StatelessWidget {
  final SmsMessage message;
  final VoidCallback onAck;
  const _SmsCard({required this.message, required this.onAck});

  Color get _borderColor => switch (message.priority) {
    MessagePriority.urgent  => AppColors.danger.withValues(alpha: 0.5),
    MessagePriority.warning => AppColors.warning.withValues(alpha: 0.5),
    MessagePriority.normal  => AppColors.border,
  };

  Color get _bgColor => switch (message.priority) {
    MessagePriority.urgent  => AppColors.danger.withValues(alpha: 0.05),
    MessagePriority.warning => AppColors.warning.withValues(alpha: 0.04),
    MessagePriority.normal  => AppColors.surface,
  };

  Color get _labelColor => switch (message.priority) {
    MessagePriority.urgent  => AppColors.danger,
    MessagePriority.warning => AppColors.warning,
    MessagePriority.normal  => AppColors.textMuted,
  };

  String get _priorityLabel => switch (message.priority) {
    MessagePriority.urgent  => 'URGENT',
    MessagePriority.warning => 'WARNING',
    MessagePriority.normal  => 'INFO',
  };

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(14),
    decoration: BoxDecoration(color: _bgColor, borderRadius: BorderRadius.circular(14),
      border: Border.all(color: _borderColor)),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(children: [
        const Icon(Icons.radio_outlined, size: 13, color: AppColors.primary),
        const SizedBox(width: 5),
        Text(message.sender, style: const TextStyle(
          color: AppColors.primary, fontSize: 11, fontWeight: FontWeight.w700, fontFamily: 'monospace')),
        const Spacer(),
        Container(padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
          decoration: BoxDecoration(color: _labelColor.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(4),
            border: Border.all(color: _labelColor.withValues(alpha: 0.3))),
          child: Text(_priorityLabel, style: TextStyle(
            color: _labelColor, fontSize: 9, fontWeight: FontWeight.w700))),
        const SizedBox(width: 8),
        Text(message.timeAgo, style: const TextStyle(color: AppColors.textDim, fontSize: 10, fontFamily: 'monospace')),
      ]),
      const SizedBox(height: 8),
      Text(message.text, style: const TextStyle(color: AppColors.text, fontSize: 13, height: 1.5)),
      const SizedBox(height: 8),
      Row(mainAxisAlignment: MainAxisAlignment.end, children: [
        if (message.acknowledged)
          const Row(mainAxisSize: MainAxisSize.min, children: [
            Icon(Icons.check_circle, size: 13, color: AppColors.success),
            SizedBox(width: 4),
            Text('ACK sent', style: TextStyle(color: AppColors.success, fontSize: 11, fontWeight: FontWeight.w600)),
          ])
        else
          TextButton.icon(
            onPressed: onAck,
            icon: const Icon(Icons.reply, size: 14, color: AppColors.primary),
            label: const Text('Reply ACK', style: TextStyle(color: AppColors.primary, fontSize: 11, fontWeight: FontWeight.w600)),
            style: TextButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              minimumSize: Size.zero, tapTargetSize: MaterialTapTargetSize.shrinkWrap)),
      ]),
    ]),
  );
}
