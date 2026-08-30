enum UserRole { fieldOfficer, driver }

class AppUser {
  final UserRole role;
  final String name;
  final String id;        // badge ID or phone
  final String district;  // field officer district
  final String? convoyId; // driver convoy

  const AppUser({
    required this.role,
    required this.name,
    required this.id,
    required this.district,
    this.convoyId,
  });

  bool get isFieldOfficer => role == UserRole.fieldOfficer;
  bool get isDriver        => role == UserRole.driver;

  String get roleLabel => isFieldOfficer ? 'Field Officer' : 'Driver / Transporter';
}
