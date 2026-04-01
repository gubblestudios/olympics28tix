import Papa from "papaparse";
import { OlympicEvent } from "./types";

export async function loadEvents(): Promise<OlympicEvent[]> {
  const res = await fetch("/data/la28_diana_events.csv");
  const text = await res.text();
  const result = Papa.parse(text, { header: true, skipEmptyLines: true });

  return (result.data as Record<string, string>[]).map((row) => ({
    sport: row["Sport"] ?? "",
    venue: row["Venue"] ?? "",
    zone: row["Zone"] ?? "",
    sessionCode: row["Session Code"] ?? "",
    date: row["Date"] ?? "",
    gamesDay: parseFloat(row["Games Day"] ?? "0"),
    sessionType: row["Session Type"] ?? "",
    sessionDescription: row["Session Description"] ?? "",
    startTime: row["Start Time"] ?? "",
    endTime: row["End Time"] ?? "",
    dateParsed: row["Date_parsed"] ?? "",
    isMedalEvent: row["is_medal_event"] === "True",
    indoorOutdoor: row["Indoor_Outdoor"] ?? "",
    neighborhood: row["Neighborhood"] ?? "",
    myInterest: parseInt(row["my_interest"] ?? "0", 10) || 0,
    priceTierEst: row["price_tier_est"] ?? "",
    parkingNotes: row["parking_notes"] ?? "",
    conflict: row["conflict"] ?? "",
  }));
}
