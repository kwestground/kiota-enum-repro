# Kiota TypeScript Enum Import Bug Reproduction

This repository demonstrates an issue with Kiota's TypeScript code generation where enum type aliases are imported as values instead of types, causing errors when `verbatimModuleSyntax` is enabled.

## The Problem

When Kiota generates TypeScript code for an OpenAPI spec with enums, it creates:

1. A type alias: `export type ItemStatus = (typeof ItemStatusObject)[keyof typeof ItemStatusObject];`
2. A const object: `export const ItemStatusObject = { Draft: "Draft", ... } as const;`

The issue is that other generated files import `ItemStatus` as a **value**:

```typescript
// ❌ WRONG - imports type alias as value
import { ItemStatus, ... } from '../models/index.js';
```

But with `verbatimModuleSyntax: true`, TypeScript requires type-only imports:

```typescript
// ✅ CORRECT - imports as type
import { type ItemStatus, ... } from '../models/index.js';
```

## Reproduce

1. Install dependencies:

   ```bash
   npm install
   ```

2. Generate client with official Kiota (shows error):

   ```bash
   npm run generate
   npm run build
   ```

   You'll see an error like:

   ```console
   src/index.ts:4:10 - error TS1484: 'ApiClient' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.

   import { ApiClient } from './client/apiClient.js';
   ```

3. Generate with fixed Kiota (no error):

   ```bash
   npm run generate-fixed
   npm run build
   ```

## Building and Testing the Fix Locally

If you want to test the fix from PR #7332 locally:

1. Clone the Kiota repo and checkout the fix branch:

   ```bash
   git clone https://github.com/microsoft/kiota.git
   cd kiota
   git fetch origin pull/7332/head:fix-ts-enum-imports
   git checkout fix-ts-enum-imports
   ```

2. Build Kiota:

   ```bash
   dotnet build src/kiota/kiota.csproj -c Release
   ```

3. Run your local build against this repro:

   ```bash
   # Windows
   path/to/kiota/src/kiota/bin/Release/net10.0/kiota.exe generate -d openapi.json -l TypeScript -c ApiClient -n Api -o ./src/client --clean-output --exclude-backward-compatible

   # Linux/macOS
   path/to/kiota/src/kiota/bin/Release/net10.0/kiota generate -d openapi.json -l TypeScript -c ApiClient -n Api -o ./src/client --clean-output --exclude-backward-compatible
   ```

4. Verify the fix by checking `src/client/items/index.ts`:

   ```typescript
   // Before fix:
   import { ..., ItemStatus, type Item } from '../models/index.js';

   // After fix:
   import { ..., type ItemStatus, type Item } from '../models/index.js';
   ```

5. Run TypeScript check (should pass now):

   ```bash
   npm run build
   ```

## Fix

The fix (PR #7332) changes Kiota to emit `type` keyword for type alias imports:

- Before: `import { ItemStatus, ... }`
- After: `import { type ItemStatus, ... }`

## Files

- `openapi.json` - Minimal OpenAPI spec with an enum
- `tsconfig.json` - TypeScript config with `verbatimModuleSyntax: true`
- `src/index.ts` - Simple usage of generated client
