enum MessagePriority { urgent, warning, normal }

class SmsMessage {
  final String id;
  final String sender;
  final String text;
  final DateTime timestamp;
  final MessagePriority priority;
  bool acknowledged;

  SmsMessage({
    required this.id, required this.sender, required this.text,
    required this.timestamp, required this.priority, this.acknowledged = false,
  });

  String get timeAgo {
    final diff = DateTime.now().difference(timestamp);
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    return '${diff.inHours}h ago';
  }
}

List<SmsMessage> buildInitialMessages() => [
  SmsMessage(id: 'm1', sender: 'NER-HQ-DISPATCH',
    text: 'ALERT: NH-415 km 142 landslide active. Route bypassed via BRO-104. Confirm receipt. ETA revised +45 min.',
    timestamp: DateTime.now().subtract(const Duration(minutes: 8)), priority: MessagePriority.urgent),
  SmsMessage(id: 'm2', sender: 'NER-HQ-DISPATCH',
    text: 'Checkpoint Pasighat: Field Officer NER-FO-8841 on duty. Show QR Pass on arrival. Seq No: AR01-CHK.',
    timestamp: DateTime.now().subtract(const Duration(minutes: 22)), priority: MessagePriority.warning),
  SmsMessage(id: 'm3', sender: 'NER-HQ-DISPATCH',
    text: 'Fuel stop approved at Tezu. Next mandatory rest at Pasighat. Anti-fatigue protocol after 4h drive.',
    timestamp: DateTime.now().subtract(const Duration(minutes: 55)), priority: MessagePriority.normal),
];
