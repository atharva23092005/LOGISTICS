import 'package:flutter/material.dart';

class AppColors {
  // ═══════════════════════════════════════════════════════════════════════
  //  LIGHT THEME COLORS (default)
  // ═══════════════════════════════════════════════════════════════════════
  static const Color lightBackground = Color(0xFFF8FAFC);
  static const Color lightSurface    = Color(0xFFFFFFFF);
  static const Color lightSurface2   = Color(0xFFF1F5F9);
  static const Color lightSurface3   = Color(0xFFE2E8F0);
  static const Color lightBorder     = Color(0xFFE2E8F0);

  static const Color lightText       = Color(0xFF0F172A);
  static const Color lightTextMuted  = Color(0xFF475569);
  static const Color lightTextDim    = Color(0xFF94A3B8);

  // ═══════════════════════════════════════════════════════════════════════
  //  DARK THEME COLORS
  // ═══════════════════════════════════════════════════════════════════════
  static const Color darkBackground  = Color(0xFF080E1A);
  static const Color darkSurface     = Color(0xFF0D1626);
  static const Color darkSurface2    = Color(0xFF111E33);
  static const Color darkSurface3    = Color(0xFF16253F);
  static const Color darkBorder      = Color(0xFF1F3352);

  static const Color darkText        = Color(0xFFE2E8F0);
  static const Color darkTextMuted   = Color(0xFF94A3B8);
  static const Color darkTextDim     = Color(0xFF475569);

  // ═══════════════════════════════════════════════════════════════════════
  //  SHARED BRAND / SEMANTIC COLORS (same in both themes)
  // ═══════════════════════════════════════════════════════════════════════
  static const Color primary  = Color(0xFF2563EB);
  static const Color success  = Color(0xFF059669);
  static const Color warning  = Color(0xFFD97706);
  static const Color danger   = Color(0xFFDC2626);
  static const Color info     = Color(0xFF0891B2);
  static const Color purple   = Color(0xFF7C3AED);

  // Semantic overlays (15% opacity)
  static const Color primaryDim = Color(0x262563EB);
  static const Color successDim = Color(0x26059669);
  static const Color warningDim = Color(0x26D97706);
  static const Color dangerDim  = Color(0x26DC2626);
  static const Color infoDim    = Color(0x260891B2);
  static const Color purpleDim  = Color(0x267C3AED);

  // ═══════════════════════════════════════════════════════════════════════
  //  BACKWARD-COMPATIBLE ALIASES (map to light defaults for existing code)
  //  Screens using these will work, but for proper theme awareness use
  //  Theme.of(context).colorScheme or the themed light/dark variants.
  // ═══════════════════════════════════════════════════════════════════════
  static const Color background = lightBackground;
  static const Color surface    = lightSurface;
  static const Color surface2   = lightSurface2;
  static const Color surface3   = lightSurface3;
  static const Color border     = lightBorder;
  static const Color text       = lightText;
  static const Color textMuted  = lightTextMuted;
  static const Color textDim    = lightTextDim;
}
