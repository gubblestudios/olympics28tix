import { OlympicEvent, Weights, NEIGHBORHOOD_RANKS } from "./types";

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
  const interest = (sportInterests[event.sport] ?? 0) / 5; // 0-1
  const medal = event.isMedalEvent ? 1 : 0;
  const indoor = event.indoorOutdoor === "indoor" ? 1 : 0;
  const hood = (NEIGHBORHOOD_RANKS[event.neighborhood] ?? 3) / 5;
  const evening = getTimeScore(event.startTime);

  const raw =
    interest * weights.interest +
    medal * weights.medal +
    indoor * weights.indoor +
    hood * weights.neighborhood +
    evening * weights.evening;

  const maxPossible = weights.interest + weights.medal + weights.indoor + weights.neighborhood + weights.evening;
  if (maxPossible === 0) return 0;
  return Math.round((raw / maxPossible) * 100);
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

export function exportCSV(events: OlympicEvent[], scores: Record<string, number>): string {
  const headers = ["Session Code", "Sport", "Date", "Start", "End", "Venue", "Type", "Description", "Medal", "Score"];
  const rows = events.map((e) => [
    e.sessionCode, e.sport, e.date, e.startTime, e.endTime, e.venue, e.sessionType, `"${e.sessionDescription}"`,
    e.isMedalEvent ? "Yes" : "No", scores[e.sessionCode]?.toString() ?? "",
  ]);
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}
