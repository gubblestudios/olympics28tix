import { Weights } from "@/lib/types";
import { Slider } from "@/components/ui/slider";
import { SlidersHorizontal } from "lucide-react";

interface Props {
  weights: Weights;
  onChange: (w: Weights) => void;
}

const LABELS: { key: keyof Weights; label: string; desc: string }[] = [
  { key: "interest", label: "Sport Interest", desc: "How much I care about this sport" },
  { key: "medal", label: "Medal Event", desc: "Bonus for medal ceremonies" },
  { key: "indoor", label: "Indoor Preference", desc: "I prefer indoor venues" },
  { key: "neighborhood", label: "DTLA Proximity", desc: "Closer to Downtown LA = better" },
  { key: "evening", label: "Evening Sessions", desc: "I prefer evening over morning" },
];

export function ScoringPanel({ weights, onChange }: Props) {
  return (
    <div className="bg-primary text-primary-foreground rounded-lg p-5 space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <SlidersHorizontal className="h-5 w-5 text-accent" />
        <h2 className="font-bold text-lg">Scoring Weights</h2>
      </div>

      {LABELS.map(({ key, label, desc }) => (
        <div key={key} className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">{label}</span>
            <span className="text-xs font-bold text-accent">{weights[key]}</span>
          </div>
          <p className="text-xs text-primary-foreground/60">{desc}</p>
          <Slider
            min={0}
            max={10}
            step={1}
            value={[weights[key]]}
            onValueChange={([v]) => onChange({ ...weights, [key]: v })}
            className="[&_[role=slider]]:bg-accent [&_[role=slider]]:border-accent [&_.relative>div:first-child>div]:bg-accent/40 [&_.relative>div:first-child>div>div]:bg-accent"
          />
        </div>
      ))}

    </div>
  );
}
