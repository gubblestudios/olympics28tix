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
  "Inglewood": 3,
  "Carson": 2,
  "Van Nuys": 2,
  "Long Beach": 2,
  "Anaheim": 1,
  "San Diego": 0,
};

export const SPORT_ICONS: Record<string, string> = {
  "Artistic Gymnastics": "🤸",
  "Basketball": "🏀",
  "Climbing": "🧗",
  "Diving": "🤿",
  "Flag Football": "🏈",
  "Football (Soccer)": "⚽",
  "Handball": "🤾",
  "Rugby Sevens": "🏉",
  "Skateboarding (Park)": "🛹",
  "Skateboarding (Street)": "🛹",
  "Squash": "🎾",
  "Table Tennis": "🏓",
  "Tennis": "🎾",
  "Volleyball": "🏐",
  "Wrestling": "🤼",
};

// Travel times in minutes between neighborhoods
export const TRAVEL_TIMES: Record<string, Record<string, number>> = {
  "Pasadena":       { "Pasadena": 0, "Downtown LA": 20, "Exposition Park": 25, "Universal City": 30, "Inglewood": 35, "Carson": 40, "Van Nuys": 35, "Long Beach": 50, "Anaheim": 60, "San Diego": 150 },
  "Downtown LA":    { "Pasadena": 20, "Downtown LA": 0, "Exposition Park": 10, "Universal City": 15, "Inglewood": 15, "Carson": 20, "Van Nuys": 25, "Long Beach": 30, "Anaheim": 40, "San Diego": 130 },
  "Exposition Park": { "Pasadena": 25, "Downtown LA": 10, "Exposition Park": 0, "Universal City": 20, "Inglewood": 10, "Carson": 15, "Van Nuys": 30, "Long Beach": 25, "Anaheim": 35, "San Diego": 130 },
  "Universal City": { "Pasadena": 30, "Downtown LA": 15, "Exposition Park": 20, "Universal City": 0, "Inglewood": 25, "Carson": 30, "Van Nuys": 15, "Long Beach": 40, "Anaheim": 45, "San Diego": 140 },
  "Inglewood":      { "Pasadena": 35, "Downtown LA": 15, "Exposition Park": 10, "Universal City": 25, "Inglewood": 0, "Carson": 15, "Van Nuys": 35, "Long Beach": 20, "Anaheim": 35, "San Diego": 125 },
  "Carson":         { "Pasadena": 40, "Downtown LA": 20, "Exposition Park": 15, "Universal City": 30, "Inglewood": 15, "Carson": 0, "Van Nuys": 40, "Long Beach": 10, "Anaheim": 30, "San Diego": 120 },
  "Van Nuys":       { "Pasadena": 35, "Downtown LA": 25, "Exposition Park": 30, "Universal City": 15, "Inglewood": 35, "Carson": 40, "Van Nuys": 0, "Long Beach": 45, "Anaheim": 50, "San Diego": 150 },
  "Long Beach":     { "Pasadena": 50, "Downtown LA": 30, "Exposition Park": 25, "Universal City": 40, "Inglewood": 20, "Carson": 10, "Van Nuys": 45, "Long Beach": 0, "Anaheim": 25, "San Diego": 120 },
  "Anaheim":        { "Pasadena": 60, "Downtown LA": 40, "Exposition Park": 35, "Universal City": 45, "Inglewood": 35, "Carson": 30, "Van Nuys": 50, "Long Beach": 25, "Anaheim": 0, "San Diego": 110 },
  "San Diego":      { "Pasadena": 150, "Downtown LA": 130, "Exposition Park": 130, "Universal City": 140, "Inglewood": 125, "Carson": 120, "Van Nuys": 150, "Long Beach": 120, "Anaheim": 110, "San Diego": 0 },
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
