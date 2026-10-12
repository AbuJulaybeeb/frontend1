# Frontend Repository Cleanup Plan

## Section 1: Confirmed Removals

### 1.1 Unused DevDependencies

- **`jest` (^29.7.0)** — Jest package is installed but the project uses vitest as the primary test runner. Only `npm run test:contract` uses jest, and it runs pact consumer tests. Evidence: Package.json shows "test" uses vitest, "test:run" uses vitest, all unit test files import from vitest. No jest config file exists (jest.config.js/ts not found). Stryker is configured to use vitest-runner, not jest-runner. Removal: Safe; pact tests will need reconfiguration to use vitest instead.

- **`ts-jest` (^29.1.2)** — Depends on jest. Not referenced in any config file (no jest.config exists). No TypeScript jest transformer is needed if jest is removed. Removal: Safe; remove with jest.

- **`@types/jest` (^29.5.14)** — Type definitions for jest. Grep search found no references to jest typing in TypeScript files. Vitest types come from @vitest/ui and vitest core. Removal: Safe; remove with jest.

- **`@stryker-mutator/jest-runner` (^8.5.0)** — Stryker plugin for jest. Stryker.conf.mjs explicitly configures `testRunner: 'vitest'` and loads `@stryker-mutator/vitest-runner`, not jest-runner. Jest runner is never used. Removal: Safe; stryker runs via vitest only.

- **`pact-broker-cli` (^0.3.2)** — Undeclared in package.json script invocations. The pact:publish script uses `pact-broker publish` (not pact-broker-cli command). Search found zero references to pact-broker-cli CLI invocation. Evidence: pact:publish script uses "pact-broker publish pacts ..." which is a shell builtin/global, not pact-broker-cli CLI. Removal: Likely safe; verify pact-broker publish works without it or use @pact-foundation/pact-node instead.

- **`@axe-core/cli` (^4.10.2)** — CLI scanner package. test:a11y script runs `axe-core --ext .ts,.tsx src` which is incorrect syntax; axe-core is a library, not a command-line tool in this context. Accessibility testing happens via @axe-core/playwright in e2e/a11y/accessibility.spec.ts (verified via grep). The CLI invocation in package.json scripts appears to be a misconfiguration. Removal: Safe; accessibility testing is via playwright integration, not axe-core CLI.

### 1.2 Stub/TODO Code to Remove

- **src/hooks/use-realtime-tips.ts** lines 64–68: Commented-out fetch call with TODO "Replace with actual API endpoint". The function is stubbed with mocked response `{ tips: [] }`. 

- **src/app/api/og/creator/[username]/route.tsx** lines 22–25: Commented-out fetch for creator data with TODO "Replace with actual API call". Function returns mocked data (displayName, bio, earnings hardcoded).

- **src/app/(app)/settings/page.tsx** lines 70–73: Commented-out PUT /api/settings with TODO "Replace with actual API call". Handler logs "Settings saved successfully!" with no actual API call.

### 1.3 Large Commented-Out Code Blocks

Three files contain multi-line commented code: use-realtime-tips.ts (websocket mock fallback, lines 119–156), and route.tsx (OG image rendering with inline data, no unused blocks). Recommendation: Remove or replace with a note referencing the API stub documentation.

---

## Section 2: Suspected Removals (Needs Deeper Check)

### 2.1 Pact Contract Testing Framework

- **@pact-foundation/pact** (^16.0.0) — Package is installed and used: pact/consumer/creator-analytics.pact.test.ts imports PactV3, MatchersV3. Script `test:contract` runs jest on pact/consumer tests. However, pact tests use jest but the team standardized on vitest; this is a framework mismatch.
- **Action required**: Verify whether pact contract tests are actively maintained and run in CI. If yes, migrate pact tests to vitest or keep jest for pact only (separate test runner). If no (stub/legacy), remove both.

### 2.2 axe-core/playwright Integration Status

- **@axe-core/playwright** (^4.10.2) — Package is used: e2e/a11y/accessibility.spec.ts imports AxeBuilder. Playwright e2e tests run accessibility checks.
- **Action required**: Verify test:e2e includes a11y tests and is run regularly. If yes, keep. If no (stub), consider removing.

### 2.3 Percy Visual Testing

- **@percy/cli** (^1.29.6) and **@percy/playwright** (^1.0.6) — Installed and referenced in scripts: `test:visual: "percy exec -- playwright test --config=playwright-visual.config.ts"`. Requires environment setup.
- **Action required**: Verify percy config exists and is active, or remove if unused.

### 2.4 Storybook Integration

- **@storybook/*** packages (8.6.14 family) — Installed and configured. Storybook dev server runs on port 6006. Verify whether storybook is actively maintained and used in workflow before keeping.

---

## Section 3: Code Fixes Needed

### 3.1 Broken / Mock Implementations

1. **src/hooks/use-realtime-tips.ts** — Remove commented-out fetch and websocket code (lines 64–68, 119–156). Replace mock `{ tips: [] }` response with actual API call or stub with a clear "TODO: Implement" comment.

2. **src/app/api/og/creator/[username]/route.tsx** — Remove commented-out API call (lines 22–25). Replace mocked creator data with actual fetch or stub with clear documentation.

3. **src/app/(app)/settings/page.tsx** — Remove commented-out fetch (lines 70–73). Replace or document the stub behavior.

### 3.2 Broken Imports (if any)

Run `npm run type-check` to identify TypeScript compilation errors. Verify no imports reference non-existent paths.

---

## Section 4: Config Fixes Needed

### 4.1 TypeScript Configuration

- **tsconfig.json** line `"noUnusedLocals": false` and `"noUnusedParameters": false` — These are disabled. Recommend enabling to catch dead code. Verify no breaking changes before enabling.

### 4.2 Vitest Configuration Issues

- **vitest.config.ts** excludes memory tests correctly. No changes needed.

### 4.3 Missing or Incorrect Package.json Scripts

- **test:a11y script** `"axe-core --ext .ts,.tsx src"` — This syntax is incorrect. Axe-core does not have a CLI that works this way. Either:
  - Remove it if accessibility is covered by playwright tests.
  - Or replace with an e2e task: `"test:a11y": "playwright test --grep a11y"`.

---

## Section 5: Do NOT Touch (Verified as Needed)

- **@sentry/nextjs** (^8.55.2) — Error monitoring integration. Used in next.config.js and sentry.*.config.ts files. KEEP.

- **vitest** (^5.0.0), **@vitest/ui**, **@vitest/coverage-v8** — Primary test runner and utilities. KEEP.

- **@stryker-mutator/core**, **@stryker-mutator/vitest-runner**, **@stryker-mutator/typescript-checker** — Mutation testing active in stryker.conf.mjs. KEEP.

- **@playwright/test**, **playwright** — E2E testing framework. KEEP.

- **Storybook** ecosystem (@storybook/*) — Component documentation. Verify active before cleanup; tentatively KEEP.

- **@pact-foundation/pact** — If pact tests are maintained, KEEP; otherwise remove (see Section 2.1).

- **All production dependencies** (@stellar/stellar-sdk, zustand, react-hook-form, etc.) — All used. KEEP.

- **Public assets** (public/dorisio-logo.svg, icons, manifest.json, service-worker.js) — All referenced by app. KEEP.

- **Docs** (README.md, CONTRIBUTING.md, DEPLOYMENT.md, etc.) — Do NOT delete docs; only flag for review if outdated.

---

## Next Steps for Implementation

1. **Immediate wins** (low risk):
   - Remove jest, ts-jest, @types/jest, @stryker-mutator/jest-runner from devDependencies.
   - Remove or clean up commented-out code in use-realtime-tips.ts and og/creator route.
   - Fix or remove test:a11y script.

2. **Conditional on verification** (medium risk):
   - Migrate pact tests to vitest or remove if not maintained.
   - Verify percy and storybook are active.

3. **After removal**:
   - Run `npm run build` and `npm run test:run` to verify no breakage.
   - Run `npm run lint` and `npm run type-check` to catch any issues.
   - Update CI/CD to remove jest and pact-broker-cli if applicable.

