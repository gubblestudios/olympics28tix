

## Add Legend for Row Highlights

### Problem
The table has colored row highlights (yellow/gold for starred events, red for conflicts) but no explanation of what they mean.

### Solution
Add a compact inline legend below the filter bar in `EventTable.tsx` showing:
- **Gold/accent background** = Starred (shortlisted) event
- **Red left border** = Time conflict with another starred event

### Changes
**`src/components/EventTable.tsx`** — Add a small legend row between the filters and the table:
```
<div className="flex gap-4 text-xs text-muted-foreground">
  <span className="flex items-center gap-1.5">
    <span className="w-4 h-3 rounded bg-accent/20 border border-accent/40" /> Starred
  </span>
  <span className="flex items-center gap-1.5">
    <span className="w-4 h-3 rounded bg-destructive/10 border-l-4 border-destructive" /> Time Conflict
  </span>
</div>
```

This sits next to the session count, keeping the UI compact.

