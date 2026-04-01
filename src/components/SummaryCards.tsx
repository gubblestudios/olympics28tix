import { OlympicEvent } from "@/lib/types";
import { Calendar, Medal, MapPin, AlertTriangle } from "lucide-react";

interface Props {
  events: OlympicEvent[];
  conflictCount: number;
  shortlistedCount: number;
  onConflictsClick?: () => void;
}

export function SummaryCards({ events, conflictCount, shortlistedCount, onConflictsClick }: Props) {
  const total = events.length;
  const medalCount = events.filter((e) => e.isMedalEvent).length;
  const venues = new Set(events.map((e) => e.venue)).size;

  const cards = [
    { label: "Total Sessions", value: total, icon: Calendar, color: "text-primary", onClick: undefined },
    { label: "Medal Sessions", value: medalCount, icon: Medal, color: "text-accent", onClick: undefined },
    { label: "Unique Venues", value: venues, icon: MapPin, color: "text-primary", onClick: undefined },
    { label: "Conflicts Detected", value: conflictCount, icon: AlertTriangle, color: "text-destructive", onClick: onConflictsClick },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div
          key={c.label}
          onClick={c.onClick}
          className={`bg-card rounded-lg border p-4 flex items-center gap-3 ${c.onClick ? "cursor-pointer hover:bg-muted/50 transition-colors" : ""}`}
        >
          <div className={`p-2 rounded-lg bg-muted ${c.color}`}>
            <c.icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{c.value}</p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
