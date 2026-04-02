

## Add Session Code Column to Event Table

**What**: Add a "Session Code" column as the last column in the results table, after the Medal column. This gives users a quick reference code to search for tickets.

**Changes** (single file: `src/components/EventTable.tsx`):

1. **Increase table width** from 1311px to ~1411px (adding ~100px for the new column)
2. **Add header** `<th>` for "Code" after the Medal column header, width ~100px
3. **Add body** `<td>` displaying `ev.sessionCode` after the Medal cell, styled as `text-xs` monospace for easy reading

No other files need changes — `sessionCode` is already part of the `OlympicEvent` type and loaded from the CSVs.

