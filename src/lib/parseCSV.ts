import Papa from "papaparse";
import { OlympicEvent } from "./types";

export async function loadEvents(): Promise<OlympicEvent[]> {
  const files = ["/data/la28_diana_events.csv", "/data/la28_addendum_events.csv", "/data/la28_addendum2_events.csv"];
  const allEvents: OlympicEvent[] = [];

  for (const file of files) {
    const res = await fetch(file);
    const text = await res.text();
    const result = Papa.parse(text, { header: true, skipEmptyLines: true });

    const events = (result.data as Record<string, string>[]).map((row) => ({
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
    allEvents.push(...events);
  }

  return allEvents;
}
