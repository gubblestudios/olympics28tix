

## Conflict & Travel Comparison View

### Problem
Right now, conflicts are detected among shortlisted events and shown as row highlights, but there's no way to easily **compare** your top-rated sessions against each other to see which ones clash in time or require long venue-to-venue travel.

### Solution: "Day Planner" Comparison Panel

Add a new **"Day View"** tab alongside "All Sessions" and "My Shortlist" that groups your highest-scored / shortlisted events by date and visually shows conflicts and travel issues.

### What gets built

1. **New `DayPlannerView` component** — Groups shortlisted + high-scored events by date, displayed as a vertical timeline per day. Each session is a card showing sport, time, venue, neighborhood, and score.

2. **Time conflict detection (visual)** — Sessions on the same day with overlapping times are connected with a red "⚠ Time Conflict" indicator between them.

3. **Travel distance warnings** — Define a simple neighborhood-to-neighborhood travel difficulty matrix (e.g., Pasadena ↔ Long Beach = "far", Downtown LA ↔ Exposition Park = "close"). When consecutive sessions on the same day are in distant neighborhoods, show an orange "🚗 ~45 min travel" warning between them.

4. **Enhanced conflict detection in `scoring.ts`** — Extend `detectConflicts` to also return travel warnings (pairs of events on the same day in far-apart neighborhoods with tight gaps between them).

5. **Tab addition in Index.tsx** — Add a third tab "📅 Day Planner" that renders the new view, filtered to shortlisted/high-score events only.

### Technical details

**Travel matrix** (`src/lib/types.ts`):
```text
TRAVEL_TIMES: Record<string, Record<string, number>> (minutes)
  Pasadena ↔ Anaheim: 60
  Pasadena ↔ Long Beach: 50
  Pasadena ↔ Downtown LA: 20
  Downtown LA ↔ Anaheim: 40
  etc.
```

**Files changed**:
- `src/lib/types.ts` — Add `TRAVEL_TIMES` matrix
- `src/lib/scoring.ts` — Add `detectTravelIssues()` function returning pairs of events with tight gaps + long travel; extend `detectConflicts` to return conflict pairs (not just a set) so we know *which* events conflict with *which*
- `src/components/DayPlannerView.tsx` — New component: groups events by date, renders timeline cards with conflict/travel warnings between them
- `src/pages/Index.tsx` — Add "Day Planner" tab, compute travel issues, pass to new component

### UX
- Each day is a collapsible section showing a vertical list of sessions sorted by start time
- Between consecutive sessions: show gap time, travel warning (if far), or conflict warning (if overlapping)
- Cards are color-coded by score (green/yellow/red border)
- Clicking a card toggles shortlist status (same as table rows)

