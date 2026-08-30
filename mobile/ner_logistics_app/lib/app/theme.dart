import 'package:flutter/material.dart';
import '../utils/colors.dart';

class AppTheme {
  // ═════════════════════════════════════════════════════════════════════
  //  LIGHT THEME (default)
  // ═════════════════════════════════════════════════════════════════════
  static ThemeData get light {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: const ColorScheme.light(
        surface: AppColors.lightSurface,
        primary: AppColors.primary,
        secondary: AppColors.info,
        error: AppColors.danger,
        onSurface: AppColors.lightText,
        onPrimary: Colors.white,
        outline: AppColors.lightBorder,
      ),
      scaffoldBackgroundColor: AppColors.lightBackground,
      cardColor: AppColors.lightSurface,
      dividerColor: AppColors.lightBorder,
      textTheme: const TextTheme(
        displayLarge: TextStyle(color: AppColors.lightText, fontSize: 28, fontWeight: FontWeight.w700),
        titleLarge: TextStyle(color: AppColors.lightText, fontSize: 15, fontWeight: FontWeight.w600),
        titleMedium: TextStyle(color: AppColors.lightText, fontSize: 14, fontWeight: FontWeight.w500),
        bodyLarge: TextStyle(color: AppColors.lightText, fontSize: 15),
        bodyMedium: TextStyle(color: AppColors.lightText, fontSize: 14),
        bodySmall: TextStyle(color: AppColors.lightTextMuted, fontSize: 12),
        labelLarge: TextStyle(color: AppColors.lightText, fontSize: 14, fontWeight: FontWeight.w600),
        labelSmall: TextStyle(color: AppColors.lightTextDim, fontSize: 10, fontWeight: FontWeight.w500, letterSpacing: 0.8),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.lightSurface2,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.lightBorder)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.lightBorder)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.primary, width: 1.5)),
        hintStyle: const TextStyle(color: AppColors.lightTextDim, fontSize: 14),
        labelStyle: const TextStyle(color: AppColors.lightTextMuted, fontSize: 14),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
          elevation: 0,
        ),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.lightSurface,
        foregroundColor: AppColors.lightText,
        elevation: 0,
        scrolledUnderElevation: 1,
        surfaceTintColor: Colors.transparent,
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: AppColors.lightSurface,
        indicatorColor: AppColors.primaryDim,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        shadowColor: Colors.transparent,
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const TextStyle(color: AppColors.primary, fontSize: 11, fontWeight: FontWeight.w600);
          }
          return const TextStyle(color: AppColors.lightTextMuted, fontSize: 11, fontWeight: FontWeight.w500);
        }),
        iconTheme: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const IconThemeData(color: AppColors.primary, size: 22);
          }
          return const IconThemeData(color: AppColors.lightTextMuted, size: 22);
        }),
      ),
      cardTheme: CardThemeData(
        color: AppColors.lightSurface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: AppColors.lightBorder),
        ),
      ),
    );
  }

  // ═════════════════════════════════════════════════════════════════════
  //  DARK THEME
  // ═════════════════════════════════════════════════════════════════════
  static ThemeData get dark {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: const ColorScheme.dark(
        surface: AppColors.darkSurface,
        primary: AppColors.primary,
        secondary: AppColors.info,
        error: AppColors.danger,
        onSurface: AppColors.darkText,
        onPrimary: Colors.white,
        outline: AppColors.darkBorder,
      ),
      scaffoldBackgroundColor: AppColors.darkBackground,
      cardColor: AppColors.darkSurface,
      dividerColor: AppColors.darkBorder,
      textTheme: const TextTheme(
        displayLarge: TextStyle(color: AppColors.darkText, fontSize: 28, fontWeight: FontWeight.w700),
        titleLarge: TextStyle(color: AppColors.darkText, fontSize: 15, fontWeight: FontWeight.w600),
        titleMedium: TextStyle(color: AppColors.darkText, fontSize: 14, fontWeight: FontWeight.w500),
        bodyLarge: TextStyle(color: AppColors.darkText, fontSize: 15),
        bodyMedium: TextStyle(color: AppColors.darkText, fontSize: 14),
        bodySmall: TextStyle(color: AppColors.darkTextMuted, fontSize: 12),
        labelLarge: TextStyle(color: AppColors.darkText, fontSize: 14, fontWeight: FontWeight.w600),
        labelSmall: TextStyle(color: AppColors.darkTextDim, fontSize: 10, fontWeight: FontWeight.w500, letterSpacing: 0.8),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.darkSurface2,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.darkBorder)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.darkBorder)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.primary, width: 1.5)),
        hintStyle: const TextStyle(color: AppColors.darkTextDim, fontSize: 14),
        labelStyle: const TextStyle(color: AppColors.darkTextMuted, fontSize: 14),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
          elevation: 0,
        ),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.darkSurface,
        foregroundColor: AppColors.darkText,
        elevation: 0,
        scrolledUnderElevation: 0,
        surfaceTintColor: Colors.transparent,
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: AppColors.darkSurface,
        indicatorColor: AppColors.primaryDim,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        shadowColor: Colors.transparent,
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const TextStyle(color: AppColors.primary, fontSize: 11, fontWeight: FontWeight.w600);
          }
          return const TextStyle(color: AppColors.darkTextMuted, fontSize: 11, fontWeight: FontWeight.w500);
        }),
        iconTheme: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const IconThemeData(color: AppColors.primary, size: 22);
          }
          return const IconThemeData(color: AppColors.darkTextMuted, size: 22);
        }),
      ),
      cardTheme: CardThemeData(
        color: AppColors.darkSurface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: AppColors.darkBorder),
        ),
      ),
    );
  }
}
