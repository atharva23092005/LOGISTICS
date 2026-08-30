import 'package:flutter/material.dart';
import '../utils/colors.dart';
import '../utils/constants.dart';
import '../models/app_user.dart';
import '../widgets/status_bar.dart';
import 'field_officer/fo_home_screen.dart';
import 'driver/driver_home_screen.dart';

class RoleLoginScreen extends StatefulWidget {
  const RoleLoginScreen({super.key});

  @override
  State<RoleLoginScreen> createState() => _RoleLoginScreenState();
}

class _RoleLoginScreenState extends State<RoleLoginScreen>
    with SingleTickerProviderStateMixin {
  // Which role tab is selected
  UserRole _selectedRole = UserRole.fieldOfficer;

  // ── Field Officer form ──────────────────────────────────────────────
  final _badgeCtrl    = TextEditingController(text: 'NER-FO-8841');
  final _pinCtrl      = TextEditingController(text: '1234');
  String _foDistrict  = 'East Siang';
  bool   _offlineMode = false;
  bool   _pinVisible  = false;

  // ── Driver form ─────────────────────────────────────────────────────
  final _phoneCtrl    = TextEditingController(text: '9862145890');
  int    _convoyIndex = 0;
  final  _checklist   = [false, false, false, false];
  static const _checklistLabels = [
    'Fuel Level Verified (>70%)',
    'Brakes & Tyre Pressure OK',
    'Cargo E-Waybill & Seal Verified',
    'Offline Maps Loaded',
  ];
  bool get _allChecked => _checklist.every((c) => c);

  bool _isLoading = false;

  // Animation for the role-selector tab
  late AnimationController _tabAnim;

  @override
  void initState() {
    super.initState();
    _tabAnim = AnimationController(vsync: this, duration: const Duration(milliseconds: 300));
  }

  @override
  void dispose() {
    _badgeCtrl.dispose(); _pinCtrl.dispose(); _phoneCtrl.dispose();
    _tabAnim.dispose();
    super.dispose();
  }

  void _switchRole(UserRole role) {
    setState(() => _selectedRole = role);
    if (role == UserRole.driver) {
      _tabAnim.forward();
    } else {
      _tabAnim.reverse();
    }
  }

  void _showSnack(String msg, Color color) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg, style: const TextStyle(color: Colors.white)),
      backgroundColor: color.withValues(alpha: 0.92),
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      duration: const Duration(seconds: 3),
    ));
  }

  Future<void> _login() async {
    // Validate
    if (_selectedRole == UserRole.fieldOfficer) {
      if (_badgeCtrl.text.trim().isEmpty) { _showSnack('Enter your Badge ID.', AppColors.danger); return; }
      if (_pinCtrl.text.trim().isEmpty)   { _showSnack('Enter your PIN.',      AppColors.danger); return; }
    } else {
      if (_phoneCtrl.text.trim().isEmpty) { _showSnack('Enter your phone number.', AppColors.danger); return; }
      if (!_allChecked) { _showSnack('Complete all 4 pre-trip checks first.', AppColors.warning); return; }
    }

    setState(() => _isLoading = true);
    await Future.delayed(const Duration(milliseconds: 900));
    if (!mounted) return;
    setState(() => _isLoading = false);

    if (_selectedRole == UserRole.fieldOfficer) {
      final user = AppUser(
        role: UserRole.fieldOfficer,
        name: 'Field Officer Priya Das',
        id: _badgeCtrl.text,
        district: _foDistrict,
      );
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => FoHomeScreen(user: user)),
      );
    } else {
      final convoy = AppConstants.convoys[_convoyIndex];
      final user = AppUser(
        role: UserRole.driver,
        name: 'Tashi Namgyal',
        id: _phoneCtrl.text,
        district: 'East Siang',
        convoyId: convoy['id'],
      );
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => DriverHomeScreen(user: user, convoy: convoy)),
      );
    }
  }

  void _quickDemo() {
    if (_selectedRole == UserRole.fieldOfficer) {
      _badgeCtrl.text = 'NER-FO-8841';
      _pinCtrl.text   = '1234';
      setState(() { _foDistrict = 'East Siang'; });
    } else {
      _phoneCtrl.text = '9862145890';
      setState(() {
        _convoyIndex = 0;
        for (int i = 0; i < _checklist.length; i++) _checklist[i] = true;
      });
    }
    _login();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Column(
        children: [
          const SafeArea(bottom: false, child: SimulatedStatusBar()),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(24, 24, 24, 32),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _buildBranding(),
                  const SizedBox(height: 28),
                  _buildRoleSelector(),
                  const SizedBox(height: 24),
                  AnimatedSwitcher(
                    duration: const Duration(milliseconds: 260),
                    transitionBuilder: (child, anim) =>
                        FadeTransition(opacity: anim, child: SlideTransition(
                          position: Tween<Offset>(begin: const Offset(0, 0.04), end: Offset.zero)
                              .animate(anim),
                          child: child,
                        )),
                    child: _selectedRole == UserRole.fieldOfficer
                        ? _buildFieldOfficerForm()
                        : _buildDriverForm(),
                  ),
                  const SizedBox(height: 20),
                  _buildLoginButton(),
                  const SizedBox(height: 10),
                  _buildDemoButton(),
                  const SizedBox(height: 24),
                  const Center(child: Text(
                    'NER LOGISTICS COMMAND SYSTEM © 2025',
                    style: TextStyle(color: AppColors.textDim, fontSize: 10, letterSpacing: 0.8),
                  )),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBranding() {
    return Column(
      children: [
        // Logo
        Container(
          width: 72, height: 72,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: AppColors.primaryDim,
            border: Border.all(color: AppColors.primary.withValues(alpha: 0.5), width: 2),
            boxShadow: [BoxShadow(color: AppColors.primary.withValues(alpha: 0.2), blurRadius: 20, spreadRadius: 2)],
          ),
          child: const Icon(Icons.security, color: AppColors.primary, size: 36),
        ),
        const SizedBox(height: 14),
        const Text('NER Logistics', style: TextStyle(
          color: AppColors.text, fontSize: 26, fontWeight: FontWeight.w800, letterSpacing: -0.5,
        )),
        const SizedBox(height: 4),
        const Text('DISASTER LOGISTICS COMMAND', style: TextStyle(
          color: AppColors.primary, fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 2.5,
        )),
        const SizedBox(height: 6),
        const Text('Northeast Region · Offline-First · ECDSA-Secured', style: TextStyle(
          color: AppColors.textMuted, fontSize: 12,
        )),
      ],
    );
  }

  Widget _buildRoleSelector() {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          _roleTab(UserRole.fieldOfficer, Icons.shield_outlined,  'Field Officer'),
          _roleTab(UserRole.driver,       Icons.local_shipping,   'Driver'),
        ],
      ),
    );
  }

  Widget _roleTab(UserRole role, IconData icon, String label) {
    final selected = _selectedRole == role;
    final color    = role == UserRole.fieldOfficer ? AppColors.primary : AppColors.success;
    return Expanded(
      child: GestureDetector(
        onTap: () => _switchRole(role),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 220),
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: selected ? color.withValues(alpha: 0.15) : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
            border: selected ? Border.all(color: color.withValues(alpha: 0.5)) : null,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, color: selected ? color : AppColors.textMuted, size: 18),
              const SizedBox(width: 8),
              Text(label, style: TextStyle(
                color: selected ? color : AppColors.textMuted,
                fontSize: 14, fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
              )),
            ],
          ),
        ),
      ),
    );
  }

  // ── Field Officer Form ──────────────────────────────────────────────
  Widget _buildFieldOfficerForm() {
    return Container(
      key: const ValueKey('fo_form'),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header row
          Row(children: [
            Container(width: 36, height: 36,
              decoration: BoxDecoration(color: AppColors.primaryDim, borderRadius: BorderRadius.circular(10)),
              child: const Icon(Icons.shield_outlined, color: AppColors.primary, size: 20)),
            const SizedBox(width: 12),
            const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Field Officer Sign-In', style: TextStyle(color: AppColors.text, fontSize: 15, fontWeight: FontWeight.w700)),
              Text('FIELD-OPS TERMINAL AUTH', style: TextStyle(color: AppColors.primary, fontSize: 9, fontWeight: FontWeight.w700, letterSpacing: 1.2)),
            ]),
          ]),
          const SizedBox(height: 20),
          TextFormField(
            controller: _badgeCtrl,
            style: const TextStyle(color: AppColors.text, fontFamily: 'monospace', letterSpacing: 1),
            decoration: const InputDecoration(
              labelText: 'Badge ID', hintText: 'NER-FO-XXXX',
              prefixIcon: Icon(Icons.badge_outlined, color: AppColors.textMuted, size: 18),
            ),
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: _pinCtrl,
            obscureText: !_pinVisible,
            keyboardType: TextInputType.number,
            style: const TextStyle(color: AppColors.text, fontFamily: 'monospace', letterSpacing: 4),
            decoration: InputDecoration(
              labelText: 'PIN', hintText: '••••',
              prefixIcon: const Icon(Icons.lock_outline, color: AppColors.textMuted, size: 18),
              suffixIcon: IconButton(
                icon: Icon(_pinVisible ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                    color: AppColors.textMuted, size: 18),
                onPressed: () => setState(() => _pinVisible = !_pinVisible),
              ),
            ),
          ),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(
            initialValue: _foDistrict,
            dropdownColor: AppColors.surface2,
            style: const TextStyle(color: AppColors.text, fontSize: 14),
            decoration: const InputDecoration(
              labelText: 'Assigned District',
              prefixIcon: Icon(Icons.location_on_outlined, color: AppColors.textMuted, size: 18),
            ),
            items: AppConstants.districts.map((d) => DropdownMenuItem(value: d, child: Text(d))).toList(),
            onChanged: (v) => setState(() => _foDistrict = v ?? _foDistrict),
          ),
          const SizedBox(height: 14),
          GestureDetector(
            onTap: () => setState(() => _offlineMode = !_offlineMode),
            child: Row(children: [
              AnimatedContainer(
                duration: const Duration(milliseconds: 180),
                width: 20, height: 20,
                decoration: BoxDecoration(
                  color: _offlineMode ? AppColors.primary : Colors.transparent,
                  borderRadius: BorderRadius.circular(5),
                  border: Border.all(color: _offlineMode ? AppColors.primary : AppColors.border, width: 1.5),
                ),
                child: _offlineMode ? const Icon(Icons.check, color: Colors.white, size: 13) : null,
              ),
              const SizedBox(width: 10),
              const Text('Offline login (cached credentials)', style: TextStyle(color: AppColors.textMuted, fontSize: 13)),
              const Spacer(),
              if (_offlineMode) Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(color: AppColors.warningDim, borderRadius: BorderRadius.circular(4)),
                child: const Text('OFFLINE', style: TextStyle(color: AppColors.warning, fontSize: 9, fontWeight: FontWeight.w700)),
              ),
            ]),
          ),
        ],
      ),
    );
  }

  // ── Driver Form ─────────────────────────────────────────────────────
  Widget _buildDriverForm() {
    return Column(
      key: const ValueKey('driver_form'),
      children: [
        // Credentials card
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(children: [
                Container(width: 36, height: 36,
                  decoration: BoxDecoration(color: AppColors.successDim, borderRadius: BorderRadius.circular(10)),
                  child: const Icon(Icons.local_shipping, color: AppColors.success, size: 20)),
                const SizedBox(width: 12),
                const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('Driver Sign-In', style: TextStyle(color: AppColors.text, fontSize: 15, fontWeight: FontWeight.w700)),
                  Text('IN-CAB COCKPIT AUTH', style: TextStyle(color: AppColors.success, fontSize: 9, fontWeight: FontWeight.w700, letterSpacing: 1.2)),
                ]),
              ]),
              const SizedBox(height: 20),
              TextFormField(
                controller: _phoneCtrl,
                keyboardType: TextInputType.phone,
                style: const TextStyle(color: AppColors.text, fontFamily: 'monospace', letterSpacing: 1),
                decoration: const InputDecoration(
                  labelText: 'Driver Phone Number', hintText: '9XXXXXXXXX',
                  prefixIcon: Icon(Icons.phone_android, color: AppColors.textMuted, size: 18),
                ),
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<int>(
                initialValue: _convoyIndex,
                dropdownColor: AppColors.surface2,
                isExpanded: true,
                style: const TextStyle(color: AppColors.text, fontSize: 13),
                decoration: const InputDecoration(
                  labelText: 'Assigned Convoy',
                  prefixIcon: Icon(Icons.local_shipping_outlined, color: AppColors.textMuted, size: 18),
                ),
                items: AppConstants.convoys.asMap().entries.map((e) =>
                  DropdownMenuItem(value: e.key, child: Text(e.value['label']!, overflow: TextOverflow.ellipsis))
                ).toList(),
                onChanged: (v) => setState(() => _convoyIndex = v ?? _convoyIndex),
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),
        // Pre-trip checklist card
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: _allChecked ? AppColors.success.withValues(alpha: 0.4) : AppColors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(children: [
                const Text('PRE-TRIP CHECKLIST', style: TextStyle(
                  color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 1.5,
                )),
                const Spacer(),
                Text('${_checklist.where((c) => c).length}/4',
                  style: TextStyle(color: _allChecked ? AppColors.success : AppColors.textMuted,
                      fontSize: 12, fontWeight: FontWeight.w700, fontFamily: 'monospace')),
              ]),
              const SizedBox(height: 14),
              ...List.generate(_checklistLabels.length, (i) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: GestureDetector(
                  onTap: () => setState(() => _checklist[i] = !_checklist[i]),
                  child: Row(children: [
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 180),
                      width: 22, height: 22,
                      decoration: BoxDecoration(
                        color: _checklist[i] ? AppColors.success : Colors.transparent,
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: _checklist[i] ? AppColors.success : AppColors.border, width: 1.5),
                      ),
                      child: _checklist[i] ? const Icon(Icons.check, color: Colors.white, size: 14) : null,
                    ),
                    const SizedBox(width: 12),
                    Text(_checklistLabels[i], style: TextStyle(
                      color: _checklist[i] ? AppColors.text : AppColors.textMuted, fontSize: 13,
                      fontWeight: _checklist[i] ? FontWeight.w500 : FontWeight.w400,
                    )),
                  ]),
                ),
              )),
              if (!_allChecked) const Text(
                '* All 4 checks required before starting shift',
                style: TextStyle(color: AppColors.warning, fontSize: 11),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildLoginButton() {
    final isDriver  = _selectedRole == UserRole.driver;
    final btnColor  = isDriver ? AppColors.success : AppColors.primary;
    final btnLabel  = isDriver ? 'Start Shift & Launch HUD' : 'Authorize Terminal & Enter';
    final btnIcon   = isDriver ? Icons.rocket_launch_outlined : Icons.verified_user_outlined;

    return SizedBox(
      width: double.infinity,
      child: ElevatedButton.icon(
        onPressed: _isLoading ? null : _login,
        icon: _isLoading
            ? const SizedBox(width: 18, height: 18,
                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
            : Icon(btnIcon, size: 20),
        label: Text(_isLoading ? 'Verifying...' : btnLabel,
            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
        style: ElevatedButton.styleFrom(
          backgroundColor: _isLoading ? AppColors.surface2 : btnColor,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        ),
      ),
    );
  }

  Widget _buildDemoButton() {
    final isDriver = _selectedRole == UserRole.driver;
    final color    = isDriver ? AppColors.success : AppColors.warning;
    final label    = isDriver ? 'Quick Demo — Tashi Namgyal (Driver)' : 'Quick Demo — Priya Das (Field Officer)';

    return SizedBox(
      width: double.infinity,
      child: OutlinedButton.icon(
        onPressed: _quickDemo,
        icon: Icon(Icons.bolt, size: 18, color: color),
        label: Text(label, style: TextStyle(color: color, fontSize: 13)),
        style: OutlinedButton.styleFrom(
          side: BorderSide(color: color.withValues(alpha: 0.4)),
          padding: const EdgeInsets.symmetric(vertical: 12),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      ),
    );
  }
}
