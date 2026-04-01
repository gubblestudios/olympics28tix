import { useState, useMemo } from "react";
import { OlympicEvent, Weights } from "@/lib/types";
import { getScoreBadgeClass, computeScoreWithBreakdown } from "@/lib/scoring";
import { StarRating } from "./StarRating";
import { MultiSelectFilter } from "./MultiSelectFilter";
import { ArrowUpDown, CheckCircle2 } from "lucide-react";

function formatDate(dateParsed: string): string {
  const d = new Date(dateParsed + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getDayName(dateParsed: string): string {
  const d = new Date(dateParsed + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

function isWeekend(dateParsed: string): boolean {
  const d = new Date(dateParsed + "T00:00:00");
  const day = d.getDay();
  return day === 0 || day === 6;
}

function formatTime(t: string): string {
  if (!t || t === "TBD") return "TBD";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

interface Props {
  events: OlympicEvent[];
  scores: Record<string, number>;
  weights: Weights;
  sportInterests: Record<string, number>;
  onInterestChange: (sport: string, val: number) => void;
  shortlisted: Set<string>;
  onToggleShortlist: (code: string) => void;
  finalList: Set<string>;
  onToggleFinal: (code: string) => void;
  conflicts: Set<string>;
}

type SortKey = "score" | "date" | "sport" | "startTime" | "neighborhood";

function ScoreTooltip({ event, weights, sportInterests }: { event: OlympicEvent; weights: Weights; sportInterests: Record<string, number> }) {
  const { score, breakdown } = computeScoreWithBreakdown(event, weights, sportInterests);
  const lines = [
    { label: "Sport Interest", pct: Math.round(breakdown.interest.raw * 100) },
    { label: "Medal Event", pct: Math.round(breakdown.medal.raw * 100) },
    { label: "Indoor", pct: Math.round(breakdown.indoor.raw * 100) },
    { label: "Neighborhood", pct: Math.round(breakdown.neighborhood.raw * 100) },
    { label: "Time of Day", pct: Math.round(breakdown.evening.raw * 100) },
  ];
  return (
    <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block z-50 bg-popover text-popover-foreground border rounded-lg shadow-lg p-3 w-52 text-xs">
      <div className="font-semibold mb-1.5">Score: {score}/100</div>
      {lines.map((l) => (
        <div key={l.label} className="flex justify-between py-0.5">
          <span>{l.label}</span>
          <span className={l.pct >= 60 ? "text-[hsl(var(--score-high))]" : l.pct >= 30 ? "text-[hsl(var(--score-mid))]" : "text-[hsl(var(--score-low))]"}>
            {l.pct}%
          </span>
        </div>
      ))}
    </div>
  );
}

export function EventTable({
  events, scores, weights, sportInterests, onInterestChange,
  shortlisted, onToggleShortlist, finalList, onToggleFinal, conflicts,
  filterSport, filterType, filterNeighborhood,
  onFilterSport, onFilterType, onFilterNeighborhood,
}: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [sortAsc, setSortAsc] = useState(false);
  const [filterDay, setFilterDay] = useState("");

  const sports = useMemo(() => [...new Set(events.map((e) => e.sport))].sort(), [events]);
  const types = useMemo(() => [...new Set(events.map((e) => e.sessionType))].sort(), [events]);
  const hoods = useMemo(() => [...new Set(events.map((e) => e.neighborhood))].sort(), [events]);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (filterSport && e.sport !== filterSport) return false;
      if (filterType && e.sessionType !== filterType) return false;
      if (filterNeighborhood && e.neighborhood !== filterNeighborhood) return false;
      if (filterDay === "weekend" && !isWeekend(e.dateParsed)) return false;
      if (filterDay === "weekday" && isWeekend(e.dateParsed)) return false;
      return true;
    });
  }, [events, filterSport, filterType, filterNeighborhood, filterDay]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "score": cmp = (scores[a.sessionCode] ?? 0) - (scores[b.sessionCode] ?? 0); break;
        case "date": cmp = a.dateParsed.localeCompare(b.dateParsed) || a.startTime.localeCompare(b.startTime); break;
        case "sport": cmp = a.sport.localeCompare(b.sport); break;
        case "startTime": cmp = a.startTime.localeCompare(b.startTime); break;
        case "neighborhood": cmp = a.neighborhood.localeCompare(b.neighborhood); break;
      }
      return sortAsc ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sortKey, sortAsc, scores]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  }

  const SortBtn = ({ k, children }: { k: SortKey; children: React.ReactNode }) => (
    <button onClick={() => toggleSort(k)} className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide hover:text-accent transition-colors">
      {children}
      <ArrowUpDown className={`h-3 w-3 ${sortKey === k ? "text-accent" : "text-muted-foreground/50"}`} />
    </button>
  );

  const selectClass = "text-xs bg-card border rounded px-2 py-1.5 text-foreground";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <select value={filterSport} onChange={(e) => onFilterSport(e.target.value)} className={selectClass}>
          <option value="">All Sports</option>
          {sports.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterType} onChange={(e) => onFilterType(e.target.value)} className={selectClass}>
          <option value="">All Types</option>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterNeighborhood} onChange={(e) => onFilterNeighborhood(e.target.value)} className={selectClass}>
          <option value="">All Neighborhoods</option>
          {hoods.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        <select value={filterDay} onChange={(e) => setFilterDay(e.target.value)} className={selectClass}>
          <option value="">All Days</option>
          <option value="weekend">Weekend</option>
          <option value="weekday">Weekday</option>
        </select>
        <div className="flex gap-4 text-xs text-muted-foreground self-center ml-auto items-center">
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-3 rounded bg-accent/20 border border-accent/40" /> Starred
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-3 rounded bg-destructive/10 border-l-4 border-destructive" /> Time Conflict
          </span>
          <span>{sorted.length} sessions</span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="text-sm" style={{ minWidth: 1220, tableLayout: "fixed", width: 1220 }}>
          <thead>
            <tr className="olympic-header">
              <th className="px-2 py-2 text-left" style={{ width: 36 }}>★</th>
              <th className="px-2 py-2 text-center" style={{ width: 70 }}>Final</th>
              <th className="px-2 py-2 text-left" style={{ width: 55 }}><SortBtn k="score">Score</SortBtn></th>
              <th className="px-2 py-2 text-left" style={{ width: 150 }}><SortBtn k="sport">Sport</SortBtn></th>
              <th className="px-2 py-2 text-left" style={{ width: 100 }}>Interest</th>
              <th className="px-2 py-2 text-left" style={{ width: 50 }}>Day</th>
              <th className="px-2 py-2 text-left" style={{ width: 90 }}><SortBtn k="date">Date</SortBtn></th>
              <th className="px-2 py-2 text-left whitespace-nowrap" style={{ width: 140 }}><SortBtn k="startTime">Time</SortBtn></th>
              <th className="px-2 py-2 text-left" style={{ width: 75 }}>Type</th>
              <th className="px-2 py-2 text-left" style={{ width: 200, maxWidth: 200 }}>Description</th>
              <th className="px-2 py-2 text-left" style={{ width: 120 }}>Venue</th>
              <th className="px-2 py-2 text-left" style={{ width: 100 }}><SortBtn k="neighborhood">Area</SortBtn></th>
              <th className="px-2 py-2 text-center" style={{ width: 45 }}>Medal</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((ev) => {
              const isShort = shortlisted.has(ev.sessionCode);
              const isFinal = finalList.has(ev.sessionCode);
              const isConflict = conflicts.has(ev.sessionCode);
              return (
                <tr
                  key={ev.sessionCode}
                  className={`border-t hover:bg-muted/50 transition-colors cursor-pointer ${isConflict ? "conflict-row" : ""} ${isShort ? "shortlisted-row" : ""}`}
                  onClick={() => onToggleShortlist(ev.sessionCode)}
                >
                  <td className="px-2 py-1.5 text-center">
                    <span className={`text-lg ${isShort ? "text-accent" : "text-muted-foreground/30"}`}>
                      {isShort ? "★" : "☆"}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onToggleFinal(ev.sessionCode)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                        isFinal
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                      title={isFinal ? "Remove from Final List" : "Add to Final List"}
                    >
                      <CheckCircle2 className={`h-3 w-3 ${isFinal ? "fill-primary/20" : ""}`} />
                      {isFinal ? "Final" : "Add"}
                    </button>
                  </td>
                  <td className="px-2 py-1.5 relative group">
                    <span className={getScoreBadgeClass(scores[ev.sessionCode] ?? 0)}>
                      {scores[ev.sessionCode] ?? 0}
                    </span>
                    <ScoreTooltip event={ev} weights={weights} sportInterests={sportInterests} />
                  </td>
                  <td className="px-2 py-1.5 font-medium text-xs" title={ev.sport}>{ev.sport}</td>
                  <td className="px-2 py-1.5" onClick={(e) => e.stopPropagation()}>
                    <StarRating value={sportInterests[ev.sport] ?? 0} onChange={(v) => onInterestChange(ev.sport, v)} />
                  </td>
                  <td className="px-2 py-1.5 text-xs whitespace-nowrap">{getDayName(ev.dateParsed)}</td>
                  <td className="px-2 py-1.5 text-xs whitespace-nowrap">{formatDate(ev.dateParsed)}</td>
                  <td className="px-2 py-1.5 text-xs whitespace-nowrap">{formatTime(ev.startTime)}–{formatTime(ev.endTime)}</td>
                  <td className="px-2 py-1.5 text-xs">{ev.sessionType}</td>
                  <td className="px-2 py-1.5 text-xs truncate" style={{ maxWidth: 200 }} title={ev.sessionDescription}>{ev.sessionDescription}</td>
                  <td className="px-2 py-1.5 text-xs truncate" title={ev.venue}>{ev.venue}</td>
                  <td className="px-2 py-1.5 text-xs truncate" title={ev.neighborhood}>{ev.neighborhood}</td>
                  <td className="px-2 py-1.5 text-center">
                    {ev.isMedalEvent && <span className="text-accent text-xs font-bold">🏅</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
