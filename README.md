# Kiota TypeScript Enum Import Bug Reproduction

Minimal reproduction for [microsoft/kiota#7332](https://github.com/microsoft/kiota/pull/7332).

## The Problem

Kiota generates TypeScript enum type aliases but imports them as **values** instead of **types**, causing TS1484 errors when `verbatimModuleSyntax` is enabled.

### Generated code in `models/index.ts`

```typescript
export type ItemStatus =
  (typeof ItemStatusObject)[keyof typeof ItemStatusObject];
export const ItemStatusObject = { Draft: "Draft", Active: "Active" } as const;
```

### Generated import in `items/index.ts`

```typescript
// ❌ BUG: ItemStatus is a type alias, not a value
import { ItemStatus, type Item } from "../models/index.js";
```

With [`verbatimModuleSyntax`](https://www.typescriptlang.org/tsconfig/#verbatimModuleSyntax) enabled, TypeScript requires type-only imports to use the `type` keyword:

```typescript
// ✅ CORRECT
import { type ItemStatus, type Item } from "../models/index.js";
```

### TypeScript error

```console
src/client/items/index.ts:4:44 - error TS1484: 'ItemStatus' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.

4 import { createItemFromDiscriminatorValue, ItemStatus, type Item } from '../models/index.js';
```

## Reproduce

```bash
npm install
npm run generate   # Generate with official Kiota (strips @ts-ignore)
npm run build      # TypeScript check → see TS1484 error
```

## Test the Fix

```bash
npm run generate-fixed   # Generate with fixed Kiota (PR #7332)
npm run build            # TypeScript check → works!
```

## Files

- `openapi.json` - Minimal OpenAPI spec with one enum
- `tsconfig.json` - TypeScript config with `verbatimModuleSyntax: true`
- `scripts/strip-ts-ignore.ps1` - Removes `@ts-ignore` from generated code to expose the error
