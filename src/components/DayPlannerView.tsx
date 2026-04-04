import { useMemo, useState } from "react";
import { OlympicEvent, SPORT_ICONS, TravelWarning, getTravelTime } from "@/lib/types";
import { getScoreBadgeClass } from "@/lib/scoring";
import { ChevronDown, ChevronRight, Star, AlertTriangle, Car, Clock, MapPin, CheckCircle2 } from "lucide-react";

interface DayPlannerViewProps {
  events: OlympicEvent[];
  scores: Record<string, number>;
  conflicts: Set<string>;
  travelWarnings: TravelWarning[];
  shortlisted: Set<string>;
  onToggleShortlist: (code: string) => void;
  finalList: Set<string>;
  onToggleFinal: (code: string) => void;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function formatTime(t: string): string {
  if (!t || t === "TBD") return "TBD";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export function DayPlannerView({
  events,
  scores,
  conflicts,
  travelWarnings,
  shortlisted,
  onToggleShortlist,
  finalList,
  onToggleFinal,
}: DayPlannerViewProps) {
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [filterMode, setFilterMode] = useState<"all" | "shortlist" | "final" | "conflicts">("all");

  const filteredEvents = useMemo(() => {
    let result = events;
    if (filterMode === "shortlist") result = result.filter((e) => shortlisted.has(e.sessionCode));
    if (filterMode === "final") result = result.filter((e) => finalList.has(e.sessionCode));
    if (filterMode === "conflicts") result = result.filter((e) => conflicts.has(e.sessionCode));
    return result;
  }, [events, shortlisted, finalList, filterMode, conflicts]);

  const dayGroups = useMemo(() => {
    const byDate: Record<string, OlympicEvent[]> = {};
    filteredEvents.forEach((e) => {
      (byDate[e.dateParsed] ??= []).push(e);
    });

    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, dayEvents]) => ({
        date,
        events: [...dayEvents].sort(
          (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
        ),
      }));
  }, [filteredEvents]);

  // Index travel warnings by pair for quick lookup
  const travelMap = useMemo(() => {
    const map = new Map<string, TravelWarning>();
    travelWarnings.forEach((w) => {
      map.set(`${w.eventA}|${w.eventB}`, w);
    });
    return map;
  }, [travelWarnings]);

  const toggleDay = (date: string) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };

  // Auto-expand all on mount
  useMemo(() => {
    if (expandedDays.size === 0 && dayGroups.length > 0) {
      setExpandedDays(new Set(dayGroups.map((g) => g.date)));
    }
  }, [dayGroups]);

  if (events.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg">No events to plan</p>
        <p className="text-sm mt-1">Star some sessions or lower your score threshold to see events here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterMode("all")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterMode === "all" ? "bg-primary text-primary-foreground" : "bg-card border text-foreground hover:bg-muted"}`}
        >
          All Shortlisted
        </button>
        <button
          onClick={() => setFilterMode("shortlist")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterMode === "shortlist" ? "bg-primary text-primary-foreground" : "bg-card border text-foreground hover:bg-muted"}`}
        >
          <Star className="h-3 w-3" /> Shortlist Only ({events.filter(e => shortlisted.has(e.sessionCode)).length})
        </button>
        <button
          onClick={() => setFilterMode("final")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterMode === "final" ? "bg-primary text-primary-foreground" : "bg-card border text-foreground hover:bg-muted"}`}
        >
          <CheckCircle2 className="h-3 w-3" /> Final Only ({events.filter(e => finalList.has(e.sessionCode)).length})
        </button>
        <button
          onClick={() => setFilterMode("conflicts")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterMode === "conflicts" ? "bg-destructive text-destructive-foreground" : "bg-card border text-foreground hover:bg-muted"}`}
        >
          <AlertTriangle className="h-3 w-3" /> Conflicts ({events.filter(e => conflicts.has(e.sessionCode)).length})
        </button>
      </div>
      {dayGroups.map(({ date, events: dayEvents }) => {
        const isOpen = expandedDays.has(date);
        const dayConflicts = dayEvents.filter((e) => conflicts.has(e.sessionCode)).length;
        const formatted = new Date(date + "T00:00:00").toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        });

        return (
          <div key={date} className="border rounded-lg bg-card overflow-hidden">
            <button
              onClick={() => toggleDay(date)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-semibold text-sm">{formatted}</span>
                <span className="text-xs text-muted-foreground">
                  {dayEvents.length} session{dayEvents.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {dayConflicts > 0 && (
                  <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> {dayConflicts} conflict{dayConflicts !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </button>

            {isOpen && (
              <div className="px-4 pb-4 space-y-0">
                {dayEvents.map((event, idx) => {
                  const score = scores[event.sessionCode] ?? 0;
                  const badgeClass = getScoreBadgeClass(score);
                  const isConflict = conflicts.has(event.sessionCode);
                  const isStarred = shortlisted.has(event.sessionCode);
                  const isFinal = finalList.has(event.sessionCode);
                  const icon = SPORT_ICONS[event.sport] ?? "🏟️";

                  // Check for warnings between this event and the next
                  const nextEvent = dayEvents[idx + 1];
                  let gapInfo: { gapMinutes: number; travelMinutes: number; isTight: boolean } | null = null;

                  if (nextEvent) {
                    const gapMinutes = timeToMinutes(nextEvent.startTime) - timeToMinutes(event.endTime);
                    const travelMinutes = getTravelTime(event.neighborhood, nextEvent.neighborhood);
                    const warning = travelMap.get(`${event.sessionCode}|${nextEvent.sessionCode}`);
                    const overlapping = gapMinutes < 0;
                    gapInfo = {
                      gapMinutes,
                      travelMinutes,
                      isTight: !!warning || overlapping,
                    };
                  }

                  // Score-based border color
                  const borderColor =
                    score >= 65
                      ? "border-l-[hsl(var(--score-high))]"
                      : score >= 40
                      ? "border-l-[hsl(var(--score-mid))]"
                      : "border-l-[hsl(var(--score-low))]";

                  return (
                    <div key={event.sessionCode}>
                      {/* Event Card */}
                      <div
                        className={`border rounded-lg p-3 border-l-4 ${borderColor} ${
                          isConflict ? "bg-destructive/5" : "bg-background"
                        } transition-colors hover:bg-muted/30`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <span className="text-xl mt-0.5">{icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-sm">{event.sport}</span>
                                {event.isMedalEvent && (
                                  <span className="text-xs bg-[hsl(var(--gold))]/20 text-[hsl(var(--gold))] px-1.5 py-0.5 rounded font-medium">
                                    🥇 Medal
                                  </span>
                                )}
                                {isConflict && (
                                  <span className="text-xs bg-destructive/10 text-destructive px-1.5 py-0.5 rounded flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" /> Conflict
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                {event.sessionDescription}
                              </p>
                              <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatTime(event.startTime)}–{formatTime(event.endTime)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {event.venue}
                                </span>
                                <span className="text-muted-foreground/60">{event.neighborhood}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`text-xs font-bold px-2 py-1 rounded ${
                                badgeClass === "score-badge-high"
                                  ? "bg-[hsl(var(--score-high))]/15 text-[hsl(var(--score-high))]"
                                  : badgeClass === "score-badge-mid"
                                  ? "bg-[hsl(var(--score-mid))]/15 text-[hsl(var(--score-mid))]"
                                  : "bg-[hsl(var(--score-low))]/15 text-[hsl(var(--score-low))]"
                              }`}
                            >
                              {score}
                            </span>
                            <button
                              onClick={() => onToggleFinal(event.sessionCode)}
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                                isFinal
                                  ? "bg-primary/15 text-primary"
                                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                              }`}
                              title={isFinal ? "Remove from Final List" : "Add to Final List"}
                            >
                              <CheckCircle2 className={`h-3 w-3 ${isFinal ? "fill-primary/20" : ""}`} />
                              {isFinal ? "Final" : "Add to Final"}
                            </button>
                            <button
                              onClick={() => onToggleShortlist(event.sessionCode)}
                              className="p-1.5 rounded hover:bg-muted transition-colors"
                              title={isStarred ? "Remove from shortlist" : "Add to shortlist"}
                            >
                              <Star
                                className={`h-4 w-4 ${
                                  isStarred
                                    ? "fill-[hsl(var(--gold))] text-[hsl(var(--gold))]"
                                    : "text-muted-foreground"
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Gap / Travel Warning between events */}
                      {gapInfo && (
                        <div className="flex items-center gap-2 py-1.5 px-6">
                          <div className="flex-1 border-t border-dashed border-border" />
                          {gapInfo.gapMinutes < 0 ? (
                            <span className="text-xs text-destructive flex items-center gap-1 font-medium">
                              <AlertTriangle className="h-3 w-3" />
                              ⚠ Overlaps by {Math.abs(gapInfo.gapMinutes)} min
                            </span>
                          ) : gapInfo.isTight ? (
                            <span className="text-xs text-[hsl(var(--score-mid))] flex items-center gap-1 font-medium">
                              <Car className="h-3 w-3" />
                              {gapInfo.gapMinutes} min gap · ~{gapInfo.travelMinutes} min travel
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {gapInfo.gapMinutes} min gap
                            </span>
                          )}
                          <div className="flex-1 border-t border-dashed border-border" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
