export interface OlympicEvent {
  sport: string;
  venue: string;
  zone: string;
  sessionCode: string;
  date: string;
  gamesDay: number;
  sessionType: string;
  sessionDescription: string;
  startTime: string;
  endTime: string;
  dateParsed: string;
  isMedalEvent: boolean;
  indoorOutdoor: string;
  neighborhood: string;
  myInterest: number;
  priceTierEst: string;
  parkingNotes: string;
  conflict: string;
}

export interface Weights {
  interest: number;
  medal: number;
  indoor: number;
  neighborhood: number;
  evening: number;
}

export const NEIGHBORHOOD_RANKS: Record<string, number> = {
  "Pasadena": 5,
  "Downtown LA": 4,
  "Exposition Park": 3,
  "Universal City": 3,
  "Long Beach": 2,
  "Anaheim": 1,
};

export const SPORT_ICONS: Record<string, string> = {
  "Artistic Gymnastics": "🤸",
  "Climbing": "🧗",
  "Diving": "🤿",
  "Flag Football": "🏈",
  "Handball": "🤾",
  "Squash": "🎾",
  "Table Tennis": "🏓",
  "Volleyball": "🏐",
  "Wrestling": "🤼",
};

// Travel times in minutes between neighborhoods
export const TRAVEL_TIMES: Record<string, Record<string, number>> = {
  "Pasadena": { "Pasadena": 0, "Downtown LA": 20, "Exposition Park": 25, "Universal City": 30, "Long Beach": 50, "Anaheim": 60 },
  "Downtown LA": { "Pasadena": 20, "Downtown LA": 0, "Exposition Park": 10, "Universal City": 15, "Long Beach": 30, "Anaheim": 40 },
  "Exposition Park": { "Pasadena": 25, "Downtown LA": 10, "Exposition Park": 0, "Universal City": 20, "Long Beach": 25, "Anaheim": 35 },
  "Universal City": { "Pasadena": 30, "Downtown LA": 15, "Exposition Park": 20, "Universal City": 0, "Long Beach": 40, "Anaheim": 45 },
  "Long Beach": { "Pasadena": 50, "Downtown LA": 30, "Exposition Park": 25, "Universal City": 40, "Long Beach": 0, "Anaheim": 25 },
  "Anaheim": { "Pasadena": 60, "Downtown LA": 40, "Exposition Park": 35, "Universal City": 45, "Long Beach": 25, "Anaheim": 0 },
};

export function getTravelTime(from: string, to: string): number {
  return TRAVEL_TIMES[from]?.[to] ?? TRAVEL_TIMES[to]?.[from] ?? 30;
}

export interface TravelWarning {
  eventA: string; // sessionCode
  eventB: string;
  travelMinutes: number;
  gapMinutes: number; // time between end of A and start of B
}

export const DEFAULT_WEIGHTS: Weights = {
  interest: 5,
  medal: 5,
  indoor: 5,
  neighborhood: 5,
  evening: 5,
};
