import Papa from "papaparse";

export interface TicketPrices {
  sessionCode: string;
  categories: { label: string; price: number }[];
}

export type PriceMap = Record<string, TicketPrices>;

const CATEGORY_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

function parsePrice(val: string): number | null {
  if (!val || val.trim() === "-" || val.trim() === "") return null;
  const cleaned = val.replace(/[$,"]/g, "").trim();
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

export async function loadPrices(): Promise<PriceMap> {
  const res = await fetch("/data/la28_ticket_prices.csv");
  const text = await res.text();
  const result = Papa.parse(text, { header: true, skipEmptyLines: true });

  const map: PriceMap = {};
  for (const row of result.data as Record<string, string>[]) {
    const code = row["Session Code"]?.trim();
    if (!code) continue;

    const categories: { label: string; price: number }[] = [];
    for (const label of CATEGORY_LABELS) {
      const colName = `Category ${label}`;
      const price = parsePrice(row[colName] ?? "");
      if (price !== null) {
        categories.push({ label, price });
      }
    }
    if (categories.length > 0) {
      map[code] = { sessionCode: code, categories };
    }
  }
  return map;
}

export function getCheapestCategory(prices: TicketPrices): { label: string; price: number } {
  return prices.categories[prices.categories.length - 1];
}

export function getCategoryPrice(prices: TicketPrices, label: string): number | null {
  const cat = prices.categories.find((c) => c.label === label);
  return cat?.price ?? null;
}
