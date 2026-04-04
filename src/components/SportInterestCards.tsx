import { useState, useMemo } from "react";
import { OlympicEvent, SPORT_ICONS } from "@/lib/types";
import { StarRating } from "./StarRating";
import { X } from "lucide-react";

interface Props {
  events: OlympicEvent[];
  sportInterests: Record<string, number>;
  onComplete: (interests: Record<string, number>) => void;
}

const POPULAR_SPORTS = ["Artistic Gymnastics", "Athletics", "Basketball", "Football", "Swimming"];

export function SportInterestCards({ events, sportInterests: initial, onComplete }: Props) {
  const [interests, setInterests] = useState<Record<string, number>>(initial);
  const [excluded, setExcluded] = useState<Set<string>>(() => {
    const ex = new Set<string>();
    Object.entries(initial).forEach(([k, v]) => { if (v === -1) ex.add(k); });
    return ex;
  });

  const toggleExclude = (sport: string) => {
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(sport)) next.delete(sport);
      else next.add(sport);
      return next;
    });
  };

  const sports = useMemo(() => {
    const map = new Map<string, { count: number; medals: number; venues: string[] }>();
    events.forEach((e) => {
      const existing = map.get(e.sport) || { count: 0, medals: 0, venues: [] };
      existing.count++;
      if (e.isMedalEvent) existing.medals++;
      if (!existing.venues.includes(e.venue)) existing.venues.push(e.venue);
      map.set(e.sport, existing);
    });
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [events]);

  const popularSports = useMemo(() => sports.filter(([s]) => POPULAR_SPORTS.includes(s)), [sports]);
  const otherSports = useMemo(() => sports.filter(([s]) => !POPULAR_SPORTS.includes(s)), [sports]);

  const allRated = sports.every(([s]) => excluded.has(s) || (interests[s] ?? 0) > 0);

  const handleContinue = () => {
    const merged = { ...interests };
    excluded.forEach((s) => { merged[s] = -1; });
    onComplete(merged);
  };

  const renderCard = ([sport, info]: [string, { count: number; medals: number; venues: string[] }]) => {
    const isExcluded = excluded.has(sport);
    const rated = !isExcluded && (interests[sport] ?? 0) > 0;
    return (
      <div
        key={sport}
        className={`relative bg-card rounded-xl border-2 p-5 transition-all ${isExcluded ? "opacity-50 border-destructive/40" : rated ? "border-accent shadow-md" : "border-border hover:border-muted-foreground/30"}`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{SPORT_ICONS[sport] ?? "🏟️"}</span>
            <h3 className={`font-bold text-sm ${isExcluded ? "line-through text-muted-foreground" : ""}`}>{sport}</h3>
          </div>
          <button
            onClick={() => toggleExclude(sport)}
            className={`text-xs px-2 py-1 rounded-md border transition-colors ${isExcluded ? "bg-destructive/10 border-destructive/30 text-destructive hover:bg-destructive/20" : "border-border text-muted-foreground hover:text-destructive hover:border-destructive/30"}`}
            title={isExcluded ? "Include this sport" : "Exclude this sport"}
          >
            {isExcluded ? "Excluded ✕" : <X className="h-3.5 w-3.5" />}
          </button>
        </div>
        <div className="flex gap-3 text-xs text-muted-foreground mb-4">
          <span>{info.count} sessions</span>
          <span>·</span>
          <span>{info.medals} medal</span>
          <span>·</span>
          <span>{info.venues.length} venue{info.venues.length > 1 ? "s" : ""}</span>
        </div>
        {!isExcluded && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Your interest:</span>
            <StarRating
              value={interests[sport] ?? 0}
              onChange={(v) => setInterests((prev) => ({ ...prev, [sport]: v }))}
              size="md"
            />
          </div>
        )}
        {isExcluded && (
          <p className="text-xs text-destructive/70">Sessions for this sport will be hidden</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <p className="text-3xl">🏅</p>
        <h2 className="text-2xl font-bold">How excited are you about each sport?</h2>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          Rate your interest from 1–5 stars. This helps prioritize which sessions to attend.
        </p>
      </div>

      {/* Most Popular Sports */}
      <div className="max-w-4xl mx-auto space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">🔥 Most Popular Sports</h3>
          <button
            onClick={handleContinue}
            className="px-5 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Skip unrated &amp; continue →
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularSports.map(renderCard)}
        </div>
      </div>

      {/* All Other Sports */}
      <div className="max-w-4xl mx-auto space-y-3">
        <h3 className="text-lg font-semibold">All Other Sports</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {otherSports.map(renderCard)}
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <button
          onClick={handleContinue}
          className={`px-8 py-3 rounded-lg font-semibold text-sm transition-all ${allRated ? "bg-accent text-accent-foreground hover:opacity-90" : "bg-primary text-primary-foreground hover:opacity-90"}`}
        >
          {allRated ? "Next →" : "Skip unrated & continue →"}
        </button>
      </div>
    </div>
  );
}
