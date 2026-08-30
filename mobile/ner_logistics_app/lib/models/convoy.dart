enum ConvoyPriority { emergency, high, medium, normal }
enum ConvoyStatus   { approaching, authorized, held }

class ConvoyVehicle {
  final String id;
  final String regNo;
  final String driverName;
  final String driverPhone;
  final String cargoType;
  final ConvoyPriority priority;
  final String etaMinutes;
  final String origin;
  final String destination;
  final String sealNo;
  final String payloadKg;
  ConvoyStatus status;

  ConvoyVehicle({
    required this.id, required this.regNo, required this.driverName,
    required this.driverPhone, required this.cargoType, required this.priority,
    required this.etaMinutes, required this.origin, required this.destination,
    required this.sealNo, required this.payloadKg,
    this.status = ConvoyStatus.approaching,
  });

  String get priorityLabel {
    const labels = { ConvoyPriority.emergency: 'EMERGENCY', ConvoyPriority.high: 'HIGH',
      ConvoyPriority.medium: 'MEDIUM', ConvoyPriority.normal: 'NORMAL' };
    return labels[priority]!;
  }
}

final List<ConvoyVehicle> mockConvoys = [
  ConvoyVehicle(id: 'c1', regNo: 'AR-01-GH-2345', driverName: 'Raju Taye', driverPhone: '9862145890',
    cargoType: 'Medical Supplies', priority: ConvoyPriority.emergency, etaMinutes: '8 min',
    origin: 'Guwahati', destination: 'Pasighat Hospital', sealNo: 'SEL-8842', payloadKg: '1,240 kg'),
  ConvoyVehicle(id: 'c2', regNo: 'AS-01-AB-1234', driverName: 'Bikash Gogoi', driverPhone: '9435112233',
    cargoType: 'Vaccines (Cold Chain)', priority: ConvoyPriority.high, etaMinutes: '22 min',
    origin: 'Dibrugarh', destination: 'Tinsukia PHC', sealNo: 'SEL-9901', payloadKg: '340 kg'),
  ConvoyVehicle(id: 'c3', regNo: 'NL-07-CD-5678', driverName: 'Hemanta Bora', driverPhone: '9678001122',
    cargoType: 'Relief Materials', priority: ConvoyPriority.medium, etaMinutes: '41 min',
    origin: 'Jorhat', destination: 'East Siang DC Office', sealNo: 'SEL-7700', payloadKg: '2,100 kg'),
];
