---
name: Expo font switching pattern
description: How to implement dynamic font switching in an Expo app using a context hook
---

## Rule
Font family strings must be applied as inline styles on Text components, NOT inside StyleSheet.create(). StyleSheet.create() is evaluated once at module load time — fontFamily values there are frozen and cannot react to context changes.

## How to apply
1. Create a `useFont()` hook that reads from SettingsContext and returns `{ heading, label, body, medium, size(n) }`.
2. Inside each component, call `const font = useFont();`
3. Apply as: `<Text style={{ fontFamily: font.heading, fontSize: font.size(20) }}>...</Text>`
4. If a StyleSheet entry had `fontFamily`, split it: keep spacing/layout in StyleSheet, add `fontFamily` inline.

**Why:** React Native's StyleSheet.create() is a performance optimization that registers styles at boot. Dynamic style properties must be in plain JS objects (inline styles) to respond to state/context changes.
