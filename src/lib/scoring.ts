import { OlympicEvent, Weights, NEIGHBORHOOD_RANKS, getTravelTime, TravelWarning } from "./types";

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function getTimeScore(startTime: string): number {
  const mins = timeToMinutes(startTime);
  // Evening (17:00+) = 1.0, afternoon (12:00-17:00) = 0.6, morning (<12:00) = 0.2
  if (mins >= 1020) return 1.0;
  if (mins >= 720) return 0.6;
  return 0.2;
}

export function computeScore(event: OlympicEvent, weights: Weights, sportInterests: Record<string, number>): number {
  return computeScoreWithBreakdown(event, weights, sportInterests).score;
}

export interface ScoreBreakdown {
  interest: { raw: number; weighted: number };
  medal: { raw: number; weighted: number };
  indoor: { raw: number; weighted: number };
  neighborhood: { raw: number; weighted: number };
  evening: { raw: number; weighted: number };
}

export function computeScoreWithBreakdown(event: OlympicEvent, weights: Weights, sportInterests: Record<string, number>): { score: number; breakdown: ScoreBreakdown } {
  const interest = (sportInterests[event.sport] ?? 0) / 5;
  const medal = event.isMedalEvent ? 1 : 0;
  const indoor = event.indoorOutdoor === "indoor" ? 1 : 0;
  const hood = (NEIGHBORHOOD_RANKS[event.neighborhood] ?? 3) / 5;
  const evening = getTimeScore(event.startTime);

  const breakdown: ScoreBreakdown = {
    interest: { raw: interest, weighted: interest * weights.interest },
    medal: { raw: medal, weighted: medal * weights.medal },
    indoor: { raw: indoor, weighted: indoor * weights.indoor },
    neighborhood: { raw: hood, weighted: hood * weights.neighborhood },
    evening: { raw: evening, weighted: evening * weights.evening },
  };

  // Medal and indoor are bonus-only: exclude their weight from maxPossible when the event doesn't have the trait
  const maxPossible = weights.interest + weights.neighborhood + weights.evening
    + (event.isMedalEvent ? weights.medal : 0)
    + (event.indoorOutdoor === "indoor" ? weights.indoor : 0);
  const raw = breakdown.interest.weighted + breakdown.medal.weighted + breakdown.indoor.weighted + breakdown.neighborhood.weighted + breakdown.evening.weighted;
  const score = maxPossible === 0 ? 0 : Math.round((raw / maxPossible) * 100);

  return { score, breakdown };
}

export function getScoreBadgeClass(score: number): string {
  if (score >= 65) return "score-badge-high";
  if (score >= 40) return "score-badge-mid";
  return "score-badge-low";
}

export function detectConflicts(events: OlympicEvent[], shortlisted: Set<string>): Set<string> {
  const conflicts = new Set<string>();
  const selected = events.filter((e) => shortlisted.has(e.sessionCode));

  for (let i = 0; i < selected.length; i++) {
    for (let j = i + 1; j < selected.length; j++) {
      const a = selected[i];
      const b = selected[j];
      if (a.dateParsed !== b.dateParsed) continue;

      const aStart = timeToMinutes(a.startTime);
      const aEnd = timeToMinutes(a.endTime);
      const bStart = timeToMinutes(b.startTime);
      const bEnd = timeToMinutes(b.endTime);

      if (aStart < bEnd && bStart < aEnd) {
        conflicts.add(a.sessionCode);
        conflicts.add(b.sessionCode);
      }
    }
  }
  return conflicts;
}

export function detectTravelIssues(events: OlympicEvent[], selectedCodes: Set<string>): TravelWarning[] {
  const warnings: TravelWarning[] = [];
  const selected = events.filter((e) => selectedCodes.has(e.sessionCode));

  // Group by date
  const byDate: Record<string, OlympicEvent[]> = {};
  selected.forEach((e) => {
    (byDate[e.dateParsed] ??= []).push(e);
  });

  for (const dateEvents of Object.values(byDate)) {
    const sorted = [...dateEvents].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    for (let i = 0; i < sorted.length - 1; i++) {
      const a = sorted[i];
      const b = sorted[i + 1];
      const gapMinutes = timeToMinutes(b.startTime) - timeToMinutes(a.endTime);
      const travelMinutes = getTravelTime(a.neighborhood, b.neighborhood);

      if (travelMinutes > 15 && gapMinutes < travelMinutes + 15) {
        warnings.push({
          eventA: a.sessionCode,
          eventB: b.sessionCode,
          travelMinutes,
          gapMinutes,
        });
      }
    }
  }
  return warnings;
}

export function exportCSV(events: OlympicEvent[], scores: Record<string, number>): string {
  const headers = ["Session Code", "Sport", "Date", "Start", "End", "Venue", "Type", "Description", "Medal", "Score"];
  const rows = events.map((e) => [
    e.sessionCode, e.sport, e.date, e.startTime, e.endTime, e.venue, e.sessionType, `"${e.sessionDescription}"`,
    e.isMedalEvent ? "Yes" : "No", scores[e.sessionCode]?.toString() ?? "",
  ]);
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}
