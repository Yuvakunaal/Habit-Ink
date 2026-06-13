---
name: SVG CompletionRing rotation pattern
description: Correct way to rotate a progress arc in react-native-svg
---

## Rule
Use `transform` string prop syntax for SVG element rotation in react-native-svg:
```tsx
<Circle transform={`rotate(-90, ${cx}, ${cy})`} ... />
```
Do NOT use the shorthand `rotation="-90" origin="cx,cy"` props — they may be deprecated or unreliable in newer versions.

**Why:** The `rotation`/`origin` convenience props have inconsistent behavior across react-native-svg versions. The SVG `transform` attribute string is stable and always works.

## How to apply
When drawing a donut/ring progress arc that starts at 12 o'clock (top), rotate the circle -90 degrees around its center point using the transform string.
