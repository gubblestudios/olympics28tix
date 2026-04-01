

## Simplify: Remove Threshold-Based Auto-Shortlisting

### Problem
There are two overlapping concepts:
1. **Starred events** (`shortlisted` Set) — manually picked by user
2. **`shortlistCodes`** — stars + any event above score threshold — used for conflict/travel detection

This is confusing. The threshold slider doesn't clearly do anything visible, and conflicts show for events the user never picked.

### Solution
- **Remove the threshold concept entirely.** Shortlist = starred events only.
- Remove the `threshold` state, localStorage persistence, and the threshold slider from `ScoringPanel`
- Remove `shortlistCodes` — just use `shortlisted` everywhere (conflicts, travel warnings, Day Planner)
- The scoring weights panel remains for adjusting how events are scored/ranked

### Files to Change
1. **`src/pages/Index.tsx`** — Remove `threshold` state/localStorage, remove `shortlistCodes`, pass `shortlisted` to `detectTravelIssues` instead
2. **`src/components/ScoringPanel.tsx`** — Remove threshold slider props and UI
3. **`src/lib/types.ts`** — Remove `DEFAULT_WEIGHTS` threshold if present

