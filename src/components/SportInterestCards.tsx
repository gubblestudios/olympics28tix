import { useState, useMemo } from "react";
import { OlympicEvent, SPORT_ICONS } from "@/lib/types";
import { StarRating } from "./StarRating";
import { X } from "lucide-react";

interface Props {
  events: OlympicEvent[];
  sportInterests: Record<string, number>;
  onComplete: (interests: Record<string, number>) => void;
}

export function SportInterestCards({ events, sportInterests: initial, onComplete }: Props) {
  const [interests, setInterests] = useState<Record<string, number>>(initial);

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

  const allRated = sports.every(([s]) => (interests[s] ?? 0) > 0);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <p className="text-3xl">🏅</p>
        <h2 className="text-2xl font-bold">How excited are you about each sport?</h2>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          Rate your interest from 1–5 stars. This helps prioritize which sessions to attend.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {sports.map(([sport, info]) => {
          const rated = (interests[sport] ?? 0) > 0;
          return (
            <div
              key={sport}
              className={`bg-card rounded-xl border-2 p-5 transition-all ${rated ? "border-accent shadow-md" : "border-border hover:border-muted-foreground/30"}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{SPORT_ICONS[sport] ?? "🏟️"}</span>
                  <h3 className="font-bold text-sm">{sport}</h3>
                </div>
                {rated && <span className="text-accent text-xs font-semibold">✓</span>}
              </div>

              <div className="flex gap-3 text-xs text-muted-foreground mb-4">
                <span>{info.count} sessions</span>
                <span>·</span>
                <span>{info.medals} medal</span>
                <span>·</span>
                <span>{info.venues.length} venue{info.venues.length > 1 ? "s" : ""}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Your interest:</span>
                <StarRating
                  value={interests[sport] ?? 0}
                  onChange={(v) => setInterests((prev) => ({ ...prev, [sport]: v }))}
                  size="md"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center pt-4">
        <button
          onClick={() => onComplete(interests)}
          className={`px-8 py-3 rounded-lg font-semibold text-sm transition-all ${allRated ? "bg-accent text-accent-foreground hover:opacity-90" : "bg-primary text-primary-foreground hover:opacity-90"}`}
        >
          {allRated ? "Next →" : "Skip unrated & continue →"}
        </button>
      </div>
    </div>
  );
}
