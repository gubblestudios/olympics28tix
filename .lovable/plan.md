

## Fix Popular Sports Name Matching

The five popular sports aren't all appearing in the top section because the hardcoded names don't match the CSV data. Specifically, "Athletics" should be "Athletics (Track & Field)" and "Football" should be "Football (Soccer)".

### Change

**File: `src/components/SportInterestCards.tsx`** — Update the `POPULAR_SPORTS` array:

```
// From:
const POPULAR_SPORTS = ["Artistic Gymnastics", "Athletics", "Basketball", "Football", "Swimming"];

// To:
const POPULAR_SPORTS = ["Artistic Gymnastics", "Athletics (Track & Field)", "Basketball", "Football (Soccer)", "Swimming"];
```

Single-line fix, no other files affected.

