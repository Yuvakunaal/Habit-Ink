---
name: Orval codegen duplicate export fix
description: When Orval generates Zod schemas, the types file may conflict; fix by only exporting api.ts
---

# Orval Zod Export Conflict

When Orval generates `@workspace/api-zod`, it creates two files in `generated/`:
- `api.ts` — Zod schemas (e.g. `CreateHabitBody`, `UpdateHabitBody`)
- `types` — a file that may repeat the same TypeScript type names

**Why:** Both files export names like `CreateHabitBody`, causing TS2308 ambiguity errors.

**Fix:** In `lib/api-zod/src/index.ts`, only re-export from `./generated/api`:
```typescript
export * from "./generated/api";
// Do NOT add: export * from "./generated/types";
```

**How to apply:** After every `pnpm --filter @workspace/api-spec run codegen` run, check if index.ts was overwritten to re-add the types export, and remove it if so.
