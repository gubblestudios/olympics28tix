import { useState, useMemo, useEffect } from "react";
import { OlympicEvent } from "@/lib/types";
import { PriceMap, getCheapestCategory, getCategoryPrice } from "@/lib/prices";
import { DollarSign, Zap, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";

interface Props {
  events: OlympicEvent[];
  scores: Record<string, number>;
  priceMap: PriceMap;
  selectedCategories: Record<string, string>;
  onCategoryChange: (code: string, category: string) => void;
  budget: number;
  onBudgetChange: (budget: number) => void;
}

function formatUSD(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function BudgetPlanner({ events, scores, priceMap, selectedCategories, onCategoryChange, budget, onBudgetChange }: Props) {
  const [expanded, setExpanded] = useState(true);

  // Sort events by score descending
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => (scores[b.sessionCode] ?? 0) - (scores[a.sessionCode] ?? 0));
  }, [events, scores]);

  // Compute totals
  const { totalCost, breakdown } = useMemo(() => {
    let total = 0;
    const items: { code: string; sport: string; description: string; category: string; price: number; score: number; hasPrice: boolean }[] = [];
    
    for (const ev of sortedEvents) {
      const prices = priceMap[ev.sessionCode];
      const selectedCat = selectedCategories[ev.sessionCode];
      
      if (prices && selectedCat) {
        const price = getCategoryPrice(prices, selectedCat);
        if (price !== null) {
          total += price;
          items.push({ code: ev.sessionCode, sport: ev.sport, description: ev.sessionDescription, category: selectedCat, price, score: scores[ev.sessionCode] ?? 0, hasPrice: true });
        } else {
          items.push({ code: ev.sessionCode, sport: ev.sport, description: ev.sessionDescription, category: selectedCat, price: 0, score: scores[ev.sessionCode] ?? 0, hasPrice: false });
        }
      } else if (!prices) {
        items.push({ code: ev.sessionCode, sport: ev.sport, description: ev.sessionDescription, category: "-", price: 0, score: scores[ev.sessionCode] ?? 0, hasPrice: false });
      }
    }
    return { totalCost: total, breakdown: items };
  }, [sortedEvents, priceMap, selectedCategories, scores]);

  const remaining = budget - totalCost;
  const overBudget = remaining < 0;

  // Auto-allocate: set all to cheapest
  const handleAutoAllocate = () => {
    for (const ev of events) {
      const prices = priceMap[ev.sessionCode];
      if (prices) {
        const cheapest = getCheapestCategory(prices);
        onCategoryChange(ev.sessionCode, cheapest.label);
      }
    }
  };

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {/* Header */}
      <div className="olympic-header px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          <span className="font-semibold text-sm">Budget Planner</span>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground hover:text-foreground">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {expanded && (
        <div className="p-4 space-y-4">
          {/* Budget input + summary */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-muted-foreground">Budget:</label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input
                  type="number"
                  value={budget || ""}
                  onChange={(e) => onBudgetChange(Number(e.target.value) || 0)}
                  className="w-32 pl-6 pr-2 py-1.5 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="5000"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <span>Total: <strong>{formatUSD(totalCost)}</strong></span>
              <span className={`font-semibold ${overBudget ? "text-destructive" : "text-[hsl(var(--score-high))]"}`}>
                {overBudget && <AlertTriangle className="h-3.5 w-3.5 inline mr-1" />}
                Remaining: {formatUSD(remaining)}
              </span>
            </div>

            <button
              onClick={handleAutoAllocate}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent text-accent-foreground hover:opacity-90 transition-opacity"
            >
              <Zap className="h-3.5 w-3.5" /> Auto-fill Cheapest
            </button>
          </div>

          {/* Budget bar */}
          {budget > 0 && (
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${overBudget ? "bg-destructive" : "bg-primary"}`}
                style={{ width: `${Math.min((totalCost / budget) * 100, 100)}%` }}
              />
            </div>
          )}

          {/* Per-session breakdown */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground uppercase tracking-wide">
                  <th className="text-left py-2 px-2">Score</th>
                  <th className="text-left py-2 px-2">Code</th>
                  <th className="text-left py-2 px-2">Sport</th>
                  <th className="text-left py-2 px-2">Description</th>
                  <th className="text-left py-2 px-2">Category</th>
                  <th className="text-right py-2 px-2">Price</th>
                </tr>
              </thead>
              <tbody>
                {breakdown.map((item) => {
                  const prices = priceMap[item.code];
                  return (
                    <tr key={item.code} className="border-t hover:bg-muted/50 transition-colors">
                      <td className="px-2 py-1.5">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                          item.score >= 65 ? "bg-[hsl(var(--score-high))]/15 text-[hsl(var(--score-high))]" :
                          item.score >= 40 ? "bg-[hsl(var(--score-mid))]/15 text-[hsl(var(--score-mid))]" :
                          "bg-[hsl(var(--score-low))]/15 text-[hsl(var(--score-low))]"
                        }`}>
                          {item.score}
                        </span>
                      </td>
                      <td className="px-2 py-1.5 font-mono text-xs text-muted-foreground">{item.code}</td>
                      <td className="px-2 py-1.5 text-xs font-medium">{item.sport}</td>
                      <td className="px-2 py-1.5 text-xs truncate max-w-[250px]" title={item.description}>{item.description}</td>
                      <td className="px-2 py-1.5">
                        {prices ? (
                          <select
                            value={selectedCategories[item.code] ?? ""}
                            onChange={(e) => onCategoryChange(item.code, e.target.value)}
                            className="text-xs border rounded px-2 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                          >
                            {prices.categories.map((cat) => (
                              <option key={cat.label} value={cat.label}>
                                Cat {cat.label} — {formatUSD(cat.price)}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-xs text-muted-foreground">No pricing</span>
                        )}
                      </td>
                      <td className="px-2 py-1.5 text-right font-medium text-xs">
                        {item.hasPrice ? formatUSD(item.price) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 font-semibold">
                  <td colSpan={5} className="px-2 py-2 text-right text-xs">Total Estimated Cost:</td>
                  <td className="px-2 py-2 text-right text-sm">{formatUSD(totalCost)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
