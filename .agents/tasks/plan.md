# Implementation Plan: Fix Frontend TypeScript Compilation Errors

## Overview
Fix 34 TypeScript compilation errors across 8 files in the frontend codebase, falling into 5 categories: type mismatches in creator search/infinite-scroll hooks, mock/test setup issues, SDK import errors, component type safety, and vitest configuration.

---

## Error Fixes (Ordered by Category & Dependency)

- [ ] 1. **Add `page` property to CreatorSearchFilters in use-creator-infinite-scroll.ts**
  
  Root cause: `CreatorSearchFilters` in `use-creator-infinite-scroll.ts` is missing the `page` property that exists in `use-creator-search.ts`. The page.tsx component expects both hooks to export compatible types, but the infinite-scroll hook uses cursor-based pagination while page.tsx was written expecting offset-based pagination with a `page` number.
  
  Action: Add `page: number` property to the `CreatorSearchFilters` interface and update `DEFAULT_FILTERS` to include `page: 1`. Add `page` to the URL parameter sync logic.
  
  Files: `src/hooks/use-creator-infinite-scroll.ts`
  
  Verify: `npm run type-check` — the errors about `page` property missing should resolve (currently ~10 errors related to page).

- [ ] 2. **Add missing formatCurrency and totalPages utility to creators/page.tsx**
  
  Root cause: The component uses `formatCurrency(creator.totalEarnings)` and displays `totalPages` for pagination, but neither is defined or imported.
  
  Action: 
  - Create or import `formatCurrency` function from a utils file (check if it exists in src/lib or src/utils). If it doesn't exist, create `src/lib/currency.ts` with a simple `formatCurrency(amount: number): string` that formats USD currency.
  - Define `totalPages` constant derived from the hook's return value. Since `useCreatorInfiniteScroll()` returns `hasNextPage` and data from pages, calculate totalPages by dividing total items by PAGE_SIZE. Alternatively, return it from the hook and import it.
  
  Files: `src/app/(app)/creators/page.tsx`, `src/lib/currency.ts` (create if missing)
  
  Verify: `npm run type-check` — formatCurrency and totalPages errors should resolve (currently ~5 errors).

- [ ] 3. **Fix vi.fn() mock type in Button.test.tsx line 15**
  
  Root cause: The error `Property 'fn' does not exist on type '() => { fn: () => MockedFunction<unknown>; } & Record<string, unknown>'` indicates the mock return type is wrapping the result incorrectly. `vi.fn()` returns a MockedFunction directly, not a function that returns a MockedFunction.
  
  Action: Change line 15 from `const handleClick = vi.fn();` to `const handleClick = vi.fn(() => {});` or simply ensure the usage matches the return type. Verify that `handleClick` is being called correctly with the expectation `expect(handleClick).toHaveBeenCalledTimes(1);`.
  
  Files: `src/components/__tests__/Button.test.tsx`
  
  Verify: `npm run test:run` on just this test file — test should compile and pass.

- [ ] 4. **Fix global.fetch mock type in use-activity-feed.test.tsx line 63**
  
  Root cause: `global.fetch = vi.fn()` returns `Mock<() => Promise<unknown>>`, but the global fetch type expects `Promise<Response>`. TypeScript cannot assign `Promise<unknown>` to `Promise<Response>`.
  
  Action: Cast the mock return to the correct type: `global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({...}) } as Response));` or use `as unknown as typeof fetch` after the vi.fn() call.
  
  Files: `src/hooks/use-activity-feed.test.tsx`
  
  Verify: `npm run type-check` — line 63 error should resolve.

- [ ] 5. **Fix null → undefined in use-create-tip.test.ts line 24**
  
  Root cause: `message: null` fails type check when the setter expects `string | undefined` (not including `null`).
  
  Action: Change line 24 from `message: null` to `message: undefined` in the `makeTransaction` default override.
  
  Files: `src/hooks/use-create-tip.test.ts`
  
  Verify: `npm run type-check` — line 24 error should resolve.

- [ ] 6. **Remove or stub non-existent SDK error imports in sdk-usage-examples.test.ts**
  
  Root cause: The test imports `RateLimitError`, `TimeoutError`, `AuthError`, `ValidationError`, `PaymentError`, `WalletVerificationError` from `'dorisio-sdk'`, but the SDK's index.ts only exports generic error types (`ApiError`, `DorisioError`) and utility functions. These specific error classes are not exported by the SDK.
  
  Action: 
  - Remove lines 21–27 (the incorrect imports).
  - Keep `DorisioError` import (which is exported).
  - Update the tests that instantiate these error classes (around lines 139 and 412) to either:
    a) Comment them out or skip those test cases, OR
    b) Instantiate `DorisioError` directly with appropriate parameters.
  - Similarly, remove lines 28–31 (buildQueryString, parsePaginationMeta, createPaginator, encodeCursor, decodeCursor) and check if they are actually exported from the SDK. Per index.ts, these ARE exported from the query-builder, so keep only those imports that are in the exports list.
  
  Files: `src/lib/sdk-usage-examples.test.ts`
  
  Verify: `npm run type-check` — all SDK import errors should resolve.

- [ ] 7. **Fix creator-live-stream.tsx viewerCount null check at line 113**
  
  Root cause: The expression `viewerCount.toLocaleString()` at line 113 is called inside a condition `{stream.isLive && viewerCount !== null && (...)}`, but TypeScript cannot narrow the type properly because `viewerCount` is declared as `number | null` and may still be undefined from the ternary logic above.
  
  Action: Change the viewerCount declaration to explicitly handle undefined with nullish coalescing: `const viewerCount = Number.isSafeInteger(stream.viewerCount) && (stream.viewerCount ?? -1) >= 0 ? stream.viewerCount : null;` or simplify by casting after the null check with `viewerCount ?? 0` in the toLocaleString call. Or add a guard: `{stream.isLive && viewerCount != null && ... {(viewerCount as number).toLocaleString()} ...}`.
  
  Files: `src/components/sections/creator-live-stream.tsx`
  
  Verify: `npm run type-check` — line 113 error should resolve.

- [ ] 8. **Fix creator-portfolio.tsx setState string | undefined error at line 125**
  
  Root cause: The state setter `setSelectedCategory` is typed to accept only `string`, but somewhere (likely from a computed value or function parameter) it receives `string | undefined`.
  
  Action: Review line 125 context (may be in a click handler or effect that passes a computed category). Ensure all calls to `setSelectedCategory()` pass a string, not undefined. If the logic requires undefined, change the state type to `useState<string | undefined>` and provide a fallback: `setSelectedCategory(value ?? 'all')`.
  
  Files: `src/components/sections/creator-portfolio.tsx`
  
  Verify: `npm run type-check` — line 125 error should resolve.

- [ ] 9. **Fix date-time-picker.tsx Floating-UI middleware missing fn property at line 83**
  
  Root cause: The `popperModifiers` array in react-datepicker expects Floating-UI middleware objects with a `fn` property, but the object only has `name` and `options`.
  
  Action: Replace the middleware object with the correct Floating-UI structure. The `preventOverflow` middleware is from `@floating-ui/dom`. Change from `{ name: 'preventOverflow', options: { padding: 8 } }` to a proper middleware instance: `import { preventOverflow } from '@floating-ui/react'; ... popperModifiers={[preventOverflow({ padding: 8 })]}` or use Floating-UI's proper middleware import and structure.
  
  Files: `src/components/ui/date-time-picker.tsx`
  
  Verify: `npm run type-check` — line 83 error should resolve.

- [ ] 10. **Fix component-benchmarks.bench.tsx vitest bench import at line 1**
  
  Root cause: The import `import { describe, bench }` is incorrect. The vitest export is `Bench` (capital B, a class), not `bench` (lowercase, which doesn't exist or is a different function).
  
  Action: Change `import { describe, bench } from 'vitest'` to `import { describe, bench } from 'vitest'` if `bench` is the correct function (check vitest docs), or change to `import { describe, Bench } from 'vitest'` if the code uses the class. Most likely: `bench` should be the correct export; verify against vitest 5.0 docs. If not available, define a wrapper or skip benchmarks for now. Update line 1 to use the correct named export.
  
  Files: `src/test/benchmarks/component-benchmarks.bench.tsx`
  
  Verify: `npm run type-check` — line 1 error should resolve.

- [ ] 11. **Fix test/setup.ts typo thresholdM → thresholdMs (if present)**
  
  Root cause: The error message mentions line 137 with `thresholdM`, but the current code shows `thresholdMs` correctly. If the file was already partially corrected or the error is stale, no action is needed. Verify the actual error by running type-check.
  
  Action: Check the latest type-check output. If the error persists, search for any usage of `thresholdM` (without the final 's') and correct to `thresholdMs`.
  
  Files: `src/test/setup.ts`
  
  Verify: `npm run type-check` — if line 137 error is still present, it should resolve after fix.

---

## Verification Steps

After implementing each fix:

1. Run `npm run type-check` to verify all TypeScript errors for that section are resolved.
2. If the fix affects tests, run `npm run test:run` on the related test file to ensure tests still compile and pass.
3. If the fix affects components, run `npm run lint` to check for any linting issues introduced.

Final verification after all fixes:
- Run `npm run type-check` globally — should report 0 errors.
- Run `npm run test:run` — all tests should compile and pass.
- Run `npm run build` — the Next.js build should succeed.

---

## Notes

- **CreatorSearchFilters type mismatch**: The root issue is that `use-creator-infinite-scroll.ts` and `use-creator-search.ts` export incompatible `CreatorSearchFilters` types. Adding `page` to the infinite-scroll version aligns them, allowing page.tsx to use either hook without type errors.
- **SDK imports**: The test file was written against a different or older version of the SDK. The query utilities (buildQueryString, createPaginator, encodeCursor, decodeCursor) ARE exported by the SDK; the error classes are NOT. Verify exports in `sdk/src/index.ts` before committing changes.
- **Mock types**: All mock type issues stem from incorrect casting or mismatched expectations. Using `as unknown as TargetType` casts can silence these, but the cleaner fix is to align the mock return type with the actual expected signature.
- **Component type errors**: Most component errors are trivial null/undefined narrowing issues—add a null check or provide a fallback (e.g., `value ?? 0`).

