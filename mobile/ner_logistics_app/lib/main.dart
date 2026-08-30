import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'app/app.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // Light theme defaults — will be dynamically updated when theme changes
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,   // dark icons for light bg
      systemNavigationBarColor: Color(0xFFF8FAFC), // light background
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );

  runApp(const NerLogisticsApp());
}
