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
  "Downtown LA": 5,
  "Exposition Park": 4,
  "Universal City": 4,
  "Long Beach": 3,
  "Pasadena": 2,
  "Anaheim": 1,
};

export const DEFAULT_WEIGHTS: Weights = {
  interest: 5,
  medal: 5,
  indoor: 5,
  neighborhood: 5,
  evening: 5,
};
