import 'package:flutter/material.dart';
import 'theme.dart';
import '../screens/role_login_screen.dart';

/// Global theme notifier for switching between light and dark modes.
final ValueNotifier<ThemeMode> themeNotifier = ValueNotifier(ThemeMode.light);

class NerLogisticsApp extends StatelessWidget {
  const NerLogisticsApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<ThemeMode>(
      valueListenable: themeNotifier,
      builder: (context, themeMode, _) {
        return MaterialApp(
          title: 'NER Logistics',
          debugShowCheckedModeBanner: false,
          theme: AppTheme.light,
          darkTheme: AppTheme.dark,
          themeMode: themeMode,
          home: const RoleLoginScreen(),
        );
      },
    );
  }
}
