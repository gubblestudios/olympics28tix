import { useState, useMemo } from "react";
import { OlympicEvent, Weights } from "@/lib/types";
import { getScoreBadgeClass, computeScoreWithBreakdown } from "@/lib/scoring";
import { StarRating } from "./StarRating";
import { ArrowUpDown, ChevronDown } from "lucide-react";

interface Props {
  events: OlympicEvent[];
  scores: Record<string, number>;
  weights: Weights;
  sportInterests: Record<string, number>;
  onInterestChange: (sport: string, val: number) => void;
  shortlisted: Set<string>;
  onToggleShortlist: (code: string) => void;
  conflicts: Set<string>;
  filterSport: string;
  filterType: string;
  filterNeighborhood: string;
  onFilterSport: (s: string) => void;
  onFilterType: (s: string) => void;
  onFilterNeighborhood: (s: string) => void;
}

type SortKey = "score" | "date" | "sport" | "startTime" | "neighborhood";

export function EventTable({
  events, scores, weights, sportInterests, onInterestChange,
  shortlisted, onToggleShortlist, conflicts,
  filterSport, filterType, filterNeighborhood,
  onFilterSport, onFilterType, onFilterNeighborhood,
}: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [sortAsc, setSortAsc] = useState(false);

  const sports = useMemo(() => [...new Set(events.map((e) => e.sport))].sort(), [events]);
  const types = useMemo(() => [...new Set(events.map((e) => e.sessionType))].sort(), [events]);
  const hoods = useMemo(() => [...new Set(events.map((e) => e.neighborhood))].sort(), [events]);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (filterSport && e.sport !== filterSport) return false;
      if (filterType && e.sessionType !== filterType) return false;
      if (filterNeighborhood && e.neighborhood !== filterNeighborhood) return false;
      return true;
    });
  }, [events, filterSport, filterType, filterNeighborhood]);

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
        <span className="text-xs text-muted-foreground self-center ml-auto">{sorted.length} sessions</span>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="olympic-header">
              <th className="p-2 text-left w-8">★</th>
              <th className="p-2 text-left"><SortBtn k="score">Score</SortBtn></th>
              <th className="p-2 text-left"><SortBtn k="sport">Sport</SortBtn></th>
              <th className="p-2 text-left">Interest</th>
              <th className="p-2 text-left"><SortBtn k="date">Date</SortBtn></th>
              <th className="p-2 text-left"><SortBtn k="startTime">Time</SortBtn></th>
              <th className="p-2 text-left">Type</th>
              <th className="p-2 text-left max-w-[250px]">Description</th>
              <th className="p-2 text-left">Venue</th>
              <th className="p-2 text-left"><SortBtn k="neighborhood">Area</SortBtn></th>
              <th className="p-2 text-center">Medal</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((ev) => {
              const isShort = shortlisted.has(ev.sessionCode);
              const isConflict = conflicts.has(ev.sessionCode);
              return (
                <tr
                  key={ev.sessionCode}
                  className={`border-t hover:bg-muted/50 transition-colors cursor-pointer ${isConflict ? "conflict-row" : ""} ${isShort ? "shortlisted-row" : ""}`}
                  onClick={() => onToggleShortlist(ev.sessionCode)}
                >
                  <td className="p-2 text-center">
                    <span className={`text-lg ${isShort ? "text-accent" : "text-muted-foreground/30"}`}>
                      {isShort ? "★" : "☆"}
                    </span>
                  </td>
                  <td className="p-2">
                    <span className={getScoreBadgeClass(scores[ev.sessionCode] ?? 0)}>
                      {scores[ev.sessionCode] ?? 0}
                    </span>
                  </td>
                  <td className="p-2 font-medium whitespace-nowrap">{ev.sport}</td>
                  <td className="p-2">
                    <StarRating value={sportInterests[ev.sport] ?? 0} onChange={(v) => onInterestChange(ev.sport, v)} />
                  </td>
                  <td className="p-2 whitespace-nowrap text-xs">{ev.dateParsed}</td>
                  <td className="p-2 whitespace-nowrap text-xs">{ev.startTime}–{ev.endTime}</td>
                  <td className="p-2 text-xs">{ev.sessionType}</td>
                  <td className="p-2 text-xs max-w-[250px] truncate" title={ev.sessionDescription}>{ev.sessionDescription}</td>
                  <td className="p-2 text-xs whitespace-nowrap">{ev.venue}</td>
                  <td className="p-2 text-xs whitespace-nowrap">{ev.neighborhood}</td>
                  <td className="p-2 text-center">
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
