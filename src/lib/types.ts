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
  "Exposition Park": 5,
  "USC/Exposition Park": 5,
  "Inglewood": 4,
  "Venice": 4,
  "Carson": 4,
  "Universal City": 3,
  "Pacific Palisades": 3,
  "Pasadena": 3,
  "Van Nuys": 3,
  "Long Beach": 2,
  "San Pedro": 2,
  "Arcadia": 2,
  "Whittier": 2,
  "Industry Hills": 2,
  "Pomona": 1,
  "Anaheim": 1,
  "San Clemente": 1,
  "San Jose": 0,
  "San Diego": 0,
  "Columbus, OH": 0,
  "Nashville, TN": 0,
  "New York, NY": 0,
  "Oklahoma City": 0,
  "St. Louis, MO": 0,
  "Unknown": 1,
};

export const SPORT_ICONS: Record<string, string> = {
  "3x3 Basketball": "🏀",
  "Archery": "🏹",
  "Artistic Gymnastics": "🤸",
  "Artistic Swimming": "🏊",
  "Athletics (Marathon)": "🏃",
  "Athletics (Race Walk)": "🚶",
  "Badminton": "🏸",
  "Basketball": "🏀",
  "BMX Freestyle": "🚲",
  "BMX Racing": "🚲",
  "Boxing - Final Stages": "🥊",
  "Boxing - Preliminary Stages": "🥊",
  "Canoe Slalom": "🛶",
  "Canoe Sprint": "🛶",
  "Climbing": "🧗",
  "Cricket": "🏏",
  "Cycling Road (Road Race)": "🚴",
  "Cycling Road (Time Trial)": "🚴",
  "Cycling Track": "🚴",
  "Diving": "🤿",
  "Equestrian": "🐴",
  "Flag Football": "🏈",
  "Football (Soccer)": "⚽",
  "Golf": "⛳",
  "Handball": "🤾",
  "Hockey": "🏑",
  "Judo": "🥋",
  "Lacrosse": "🥍",
  "Modern Pentathlon": "🤺",
  "Mountain Bike": "🚵",
  "Open Water Swimming": "🏊",
  "Rhythmic Gymnastics": "🎀",
  "Rowing": "🚣",
  "Rowing Coastal Beach Sprints": "🚣",
  "Rugby Sevens": "🏉",
  "Sailing (Dinghy, Skiff &\nMultihull)": "⛵",
  "Sailing (Windsurfing & Kite)": "🪁",
  "Shooting (Rifle & Pistol)": "🎯",
  "Shooting (Shotgun)": "🎯",
  "Skateboarding (Park)": "🛹",
  "Skateboarding (Street)": "🛹",
  "Softball": "🥎",
  "Squash": "🎾",
  "Surfing": "🏄",
  "Table Tennis": "🏓",
  "Taekwondo": "🥋",
  "Tennis": "🎾",
  "Trampoline Gymnastics": "🤸",
  "Triathlon": "🏊",
  "Volleyball": "🏐",
  "Water Polo": "🤽",
  "Weightlifting": "🏋️",
  "Wrestling": "🤼",
};

// Travel times in minutes between neighborhoods (LA-area only; out-of-state venues default to 999)
const LA_HOODS = ["Pasadena","Downtown LA","Exposition Park","USC/Exposition Park","Universal City","Inglewood","Carson","Van Nuys","Long Beach","Anaheim","San Diego","Venice","Pacific Palisades","San Pedro","Arcadia","Whittier","Industry Hills","Pomona","San Clemente","San Jose"];
const OUT_OF_STATE = ["Columbus, OH","Nashville, TN","New York, NY","Oklahoma City","St. Louis, MO"];

// Rough estimates for LA-area neighborhoods
const LA_TIMES: Record<string, Record<string, number>> = {
  "Pasadena":       { "Pasadena": 0, "Downtown LA": 20, "Exposition Park": 25, "USC/Exposition Park": 25, "Universal City": 30, "Inglewood": 35, "Carson": 40, "Van Nuys": 35, "Long Beach": 50, "Anaheim": 60, "San Diego": 150, "Venice": 35, "Pacific Palisades": 40, "San Pedro": 50, "Arcadia": 15, "Whittier": 35, "Industry Hills": 30, "Pomona": 40, "San Clemente": 90, "San Jose": 360 },
  "Downtown LA":    { "Pasadena": 20, "Downtown LA": 0, "Exposition Park": 10, "USC/Exposition Park": 10, "Universal City": 15, "Inglewood": 15, "Carson": 20, "Van Nuys": 25, "Long Beach": 30, "Anaheim": 40, "San Diego": 130, "Venice": 25, "Pacific Palisades": 30, "San Pedro": 30, "Arcadia": 25, "Whittier": 25, "Industry Hills": 30, "Pomona": 35, "San Clemente": 80, "San Jose": 350 },
  "Exposition Park": { "Pasadena": 25, "Downtown LA": 10, "Exposition Park": 0, "USC/Exposition Park": 0, "Universal City": 20, "Inglewood": 10, "Carson": 15, "Van Nuys": 30, "Long Beach": 25, "Anaheim": 35, "San Diego": 130, "Venice": 20, "Pacific Palisades": 25, "San Pedro": 25, "Arcadia": 30, "Whittier": 25, "Industry Hills": 30, "Pomona": 35, "San Clemente": 80, "San Jose": 350 },
  "USC/Exposition Park": { "Pasadena": 25, "Downtown LA": 10, "Exposition Park": 0, "USC/Exposition Park": 0, "Universal City": 20, "Inglewood": 10, "Carson": 15, "Van Nuys": 30, "Long Beach": 25, "Anaheim": 35, "San Diego": 130, "Venice": 20, "Pacific Palisades": 25, "San Pedro": 25, "Arcadia": 30, "Whittier": 25, "Industry Hills": 30, "Pomona": 35, "San Clemente": 80, "San Jose": 350 },
  "Universal City": { "Pasadena": 30, "Downtown LA": 15, "Exposition Park": 20, "USC/Exposition Park": 20, "Universal City": 0, "Inglewood": 25, "Carson": 30, "Van Nuys": 15, "Long Beach": 40, "Anaheim": 45, "San Diego": 140, "Venice": 25, "Pacific Palisades": 20, "San Pedro": 40, "Arcadia": 35, "Whittier": 35, "Industry Hills": 35, "Pomona": 40, "San Clemente": 90, "San Jose": 350 },
  "Inglewood":      { "Pasadena": 35, "Downtown LA": 15, "Exposition Park": 10, "USC/Exposition Park": 10, "Universal City": 25, "Inglewood": 0, "Carson": 15, "Van Nuys": 35, "Long Beach": 20, "Anaheim": 35, "San Diego": 125, "Venice": 15, "Pacific Palisades": 20, "San Pedro": 20, "Arcadia": 35, "Whittier": 25, "Industry Hills": 30, "Pomona": 35, "San Clemente": 75, "San Jose": 350 },
  "Carson":         { "Pasadena": 40, "Downtown LA": 20, "Exposition Park": 15, "USC/Exposition Park": 15, "Universal City": 30, "Inglewood": 15, "Carson": 0, "Van Nuys": 40, "Long Beach": 10, "Anaheim": 30, "San Diego": 120, "Venice": 25, "Pacific Palisades": 30, "San Pedro": 10, "Arcadia": 35, "Whittier": 20, "Industry Hills": 25, "Pomona": 30, "San Clemente": 70, "San Jose": 360 },
  "Van Nuys":       { "Pasadena": 35, "Downtown LA": 25, "Exposition Park": 30, "USC/Exposition Park": 30, "Universal City": 15, "Inglewood": 35, "Carson": 40, "Van Nuys": 0, "Long Beach": 45, "Anaheim": 50, "San Diego": 150, "Venice": 30, "Pacific Palisades": 25, "San Pedro": 45, "Arcadia": 40, "Whittier": 40, "Industry Hills": 40, "Pomona": 45, "San Clemente": 95, "San Jose": 340 },
  "Long Beach":     { "Pasadena": 50, "Downtown LA": 30, "Exposition Park": 25, "USC/Exposition Park": 25, "Universal City": 40, "Inglewood": 20, "Carson": 10, "Van Nuys": 45, "Long Beach": 0, "Anaheim": 25, "San Diego": 120, "Venice": 30, "Pacific Palisades": 35, "San Pedro": 15, "Arcadia": 40, "Whittier": 20, "Industry Hills": 25, "Pomona": 30, "San Clemente": 65, "San Jose": 370 },
  "Anaheim":        { "Pasadena": 60, "Downtown LA": 40, "Exposition Park": 35, "USC/Exposition Park": 35, "Universal City": 45, "Inglewood": 35, "Carson": 30, "Van Nuys": 50, "Long Beach": 25, "Anaheim": 0, "San Diego": 110, "Venice": 40, "Pacific Palisades": 45, "San Pedro": 30, "Arcadia": 40, "Whittier": 20, "Industry Hills": 20, "Pomona": 25, "San Clemente": 55, "San Jose": 380 },
  "San Diego":      { "Pasadena": 150, "Downtown LA": 130, "Exposition Park": 130, "USC/Exposition Park": 130, "Universal City": 140, "Inglewood": 125, "Carson": 120, "Van Nuys": 150, "Long Beach": 120, "Anaheim": 110, "San Diego": 0, "Venice": 135, "Pacific Palisades": 140, "San Pedro": 120, "Arcadia": 145, "Whittier": 130, "Industry Hills": 125, "Pomona": 120, "San Clemente": 70, "San Jose": 480 },
  "Venice":         { "Pasadena": 35, "Downtown LA": 25, "Exposition Park": 20, "USC/Exposition Park": 20, "Universal City": 25, "Inglewood": 15, "Carson": 25, "Van Nuys": 30, "Long Beach": 30, "Anaheim": 40, "San Diego": 135, "Venice": 0, "Pacific Palisades": 10, "San Pedro": 25, "Arcadia": 40, "Whittier": 30, "Industry Hills": 35, "Pomona": 40, "San Clemente": 85, "San Jose": 350 },
  "Pacific Palisades": { "Pasadena": 40, "Downtown LA": 30, "Exposition Park": 25, "USC/Exposition Park": 25, "Universal City": 20, "Inglewood": 20, "Carson": 30, "Van Nuys": 25, "Long Beach": 35, "Anaheim": 45, "San Diego": 140, "Venice": 10, "Pacific Palisades": 0, "San Pedro": 30, "Arcadia": 45, "Whittier": 35, "Industry Hills": 40, "Pomona": 45, "San Clemente": 90, "San Jose": 350 },
  "San Pedro":      { "Pasadena": 50, "Downtown LA": 30, "Exposition Park": 25, "USC/Exposition Park": 25, "Universal City": 40, "Inglewood": 20, "Carson": 10, "Van Nuys": 45, "Long Beach": 15, "Anaheim": 30, "San Diego": 120, "Venice": 25, "Pacific Palisades": 30, "San Pedro": 0, "Arcadia": 40, "Whittier": 25, "Industry Hills": 30, "Pomona": 35, "San Clemente": 70, "San Jose": 370 },
  "Arcadia":        { "Pasadena": 15, "Downtown LA": 25, "Exposition Park": 30, "USC/Exposition Park": 30, "Universal City": 35, "Inglewood": 35, "Carson": 35, "Van Nuys": 40, "Long Beach": 40, "Anaheim": 40, "San Diego": 145, "Venice": 40, "Pacific Palisades": 45, "San Pedro": 40, "Arcadia": 0, "Whittier": 25, "Industry Hills": 20, "Pomona": 25, "San Clemente": 80, "San Jose": 370 },
  "Whittier":       { "Pasadena": 35, "Downtown LA": 25, "Exposition Park": 25, "USC/Exposition Park": 25, "Universal City": 35, "Inglewood": 25, "Carson": 20, "Van Nuys": 40, "Long Beach": 20, "Anaheim": 20, "San Diego": 130, "Venice": 30, "Pacific Palisades": 35, "San Pedro": 25, "Arcadia": 25, "Whittier": 0, "Industry Hills": 10, "Pomona": 15, "San Clemente": 65, "San Jose": 370 },
  "Industry Hills": { "Pasadena": 30, "Downtown LA": 30, "Exposition Park": 30, "USC/Exposition Park": 30, "Universal City": 35, "Inglewood": 30, "Carson": 25, "Van Nuys": 40, "Long Beach": 25, "Anaheim": 20, "San Diego": 125, "Venice": 35, "Pacific Palisades": 40, "San Pedro": 30, "Arcadia": 20, "Whittier": 10, "Industry Hills": 0, "Pomona": 10, "San Clemente": 65, "San Jose": 370 },
  "Pomona":         { "Pasadena": 40, "Downtown LA": 35, "Exposition Park": 35, "USC/Exposition Park": 35, "Universal City": 40, "Inglewood": 35, "Carson": 30, "Van Nuys": 45, "Long Beach": 30, "Anaheim": 25, "San Diego": 120, "Venice": 40, "Pacific Palisades": 45, "San Pedro": 35, "Arcadia": 25, "Whittier": 15, "Industry Hills": 10, "Pomona": 0, "San Clemente": 60, "San Jose": 370 },
  "San Clemente":   { "Pasadena": 90, "Downtown LA": 80, "Exposition Park": 80, "USC/Exposition Park": 80, "Universal City": 90, "Inglewood": 75, "Carson": 70, "Van Nuys": 95, "Long Beach": 65, "Anaheim": 55, "San Diego": 70, "Venice": 85, "Pacific Palisades": 90, "San Pedro": 70, "Arcadia": 80, "Whittier": 65, "Industry Hills": 65, "Pomona": 60, "San Clemente": 0, "San Jose": 440 },
  "San Jose":       { "Pasadena": 360, "Downtown LA": 350, "Exposition Park": 350, "USC/Exposition Park": 350, "Universal City": 350, "Inglewood": 350, "Carson": 360, "Van Nuys": 340, "Long Beach": 370, "Anaheim": 380, "San Diego": 480, "Venice": 350, "Pacific Palisades": 350, "San Pedro": 370, "Arcadia": 370, "Whittier": 370, "Industry Hills": 370, "Pomona": 370, "San Clemente": 440, "San Jose": 0 },
};

export const TRAVEL_TIMES = LA_TIMES;

export function getTravelTime(from: string, to: string): number {
  return LA_TIMES[from]?.[to] ?? LA_TIMES[to]?.[from] ?? 30;
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
