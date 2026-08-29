---
name: i18n-string-checker
description: Use this skill when the user adds new UI text anywhere in the mobile app or dashboard, or asks to check multilingual coverage for Assamese, Bengali, Bodo, Manipuri, Hindi, or English.
---

# i18n String Checker

## Goal
Ensure every user-facing string ships with entries in all required languages (Assamese, Bengali, Bodo, Manipuri, Hindi, English) rather than silently falling back to hardcoded English in the UI.

## Instructions
1. **No inline hardcoded strings.** Every user-facing string must route through the i18n resource system (e.g., `strings.json` per locale) — flag any hardcoded string literal found directly in UI component code.
2. **Track coverage per language.** After any new string is added, check which locale files are missing that key and report them explicitly rather than letting the app silently fall back to English for untranslated keys without anyone noticing.
3. **Flag machine-translated placeholders distinctly** from human-reviewed translations (e.g., a `needs_review: true` flag) — a wrong translation in an incident-report form could cause real confusion for field officers, so this distinction should be visible to whoever manages translations.
4. **Check for string interpolation issues** across languages — word order and pluralization rules differ (e.g., Hindi/Assamese sentence structure), so simple string concatenation with variables inserted at fixed positions will produce broken sentences in some languages; use proper ICU message format instead.
5. **Run this check in CI** on every PR that touches UI strings, not just before a release.

## Examples
**Input:** "Added a new form field label 'Estimated road width'."
**Action:** Add the key to the English locale file, generate placeholder entries for the other five languages marked `needs_review: true`, and report that they need human translation review before the next release.

**Input:** "Why does the Manipuri version of the incident form look broken?"
**Action:** Check for string interpolation issues first — a literal string-concatenation approach with inserted variables is a common cause of broken sentence structure in languages with different word order.

## Constraints
- Never let a hardcoded string ship in UI component code instead of going through the i18n system.
- Never silently fall back to English for a missing translation without flagging the gap.
- Never treat a machine-translated string as equivalent to a human-reviewed one without a visible flag distinguishing them.
- Never use fixed-position string concatenation for interpolated variables across multiple languages.
