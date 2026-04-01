import { useState } from "react";
import { Weights, DEFAULT_WEIGHTS, NEIGHBORHOOD_RANKS } from "@/lib/types";
import { Slider } from "@/components/ui/slider";
import { Sun, Moon, Sunset, Home, Medal, Cloud } from "lucide-react";

interface Props {
  initialWeights: Weights;
  onComplete: (weights: Weights) => void;
  onBack: () => void;
}

const TIME_LABELS = ["Morning lover 🌅", "No preference", "Evening lover 🌙"];
const INDOOR_LABELS = ["Prefer outdoor ☀️", "No preference", "Prefer indoor 🏟️"];

const HOOD_ORDER = ["Pasadena", "Downtown LA", "Exposition Park", "Universal City", "Long Beach", "Anaheim"];

export function PreferencesCards({ initialWeights, onComplete, onBack }: Props) {
  const [weights, setWeights] = useState<Weights>(initialWeights);

  const updateWeight = (key: keyof Weights, val: number) => {
    setWeights((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <p className="text-3xl">⚙️</p>
        <h2 className="text-2xl font-bold">Set your preferences</h2>
        <p className="text-muted-foreground text-sm">
          These weights determine how sessions are scored and ranked for you.
        </p>
      </div>

      {/* Medal importance */}
      <div className="bg-card rounded-xl border p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/15 text-accent">
            <Medal className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Medal Events</h3>
            <p className="text-xs text-muted-foreground">How important is it that the session includes a medal ceremony?</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground w-20">Not important</span>
          <Slider min={0} max={10} step={1} value={[weights.medal]} onValueChange={([v]) => updateWeight("medal", v)} />
          <span className="text-xs text-muted-foreground w-20 text-right">Must-have</span>
        </div>
        <p className="text-center text-sm font-bold text-accent">{weights.medal}/10</p>
      </div>

      {/* Indoor/Outdoor */}
      <div className="bg-card rounded-xl border p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/15 text-accent">
            <Cloud className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Indoor vs Outdoor</h3>
            <p className="text-xs text-muted-foreground">Do you prefer indoor venues or don't mind outdoor?</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground w-20">Outdoor ☀️</span>
          <Slider min={0} max={10} step={1} value={[weights.indoor]} onValueChange={([v]) => updateWeight("indoor", v)} />
          <span className="text-xs text-muted-foreground w-20 text-right">Indoor 🏟️</span>
        </div>
        <p className="text-center text-sm font-bold text-accent">{weights.indoor}/10</p>
      </div>

      {/* Neighborhood */}
      <div className="bg-card rounded-xl border p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/15 text-accent">
            <Home className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Neighborhood Convenience</h3>
            <p className="text-xs text-muted-foreground">How much does proximity to Pasadena matter? Closer venues score higher.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground w-20">Don't care</span>
          <Slider min={0} max={10} step={1} value={[weights.neighborhood]} onValueChange={([v]) => updateWeight("neighborhood", v)} />
          <span className="text-xs text-muted-foreground w-20 text-right">Very important</span>
        </div>
        <p className="text-center text-sm font-bold text-accent">{weights.neighborhood}/10</p>

        <div className="flex flex-wrap gap-2 pt-2">
          {HOOD_ORDER.map((h, i) => (
            <span key={h} className={`text-xs px-2.5 py-1 rounded-full border ${i === 0 ? "bg-accent/15 border-accent text-accent font-semibold" : "bg-muted text-muted-foreground"}`}>
              {h} ({NEIGHBORHOOD_RANKS[h]}/5)
            </span>
          ))}
        </div>
      </div>

      {/* Time of day */}
      <div className="bg-card rounded-xl border p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/15 text-accent">
            <Sunset className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Time of Day</h3>
            <p className="text-xs text-muted-foreground">Do you prefer evening sessions over morning ones?</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground w-20">Morning 🌅</span>
          <Slider min={0} max={10} step={1} value={[weights.evening]} onValueChange={([v]) => updateWeight("evening", v)} />
          <span className="text-xs text-muted-foreground w-20 text-right">Evening 🌙</span>
        </div>
        <p className="text-center text-sm font-bold text-accent">{weights.evening}/10</p>
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-lg font-semibold text-sm border bg-card text-foreground hover:bg-muted transition-colors"
        >
          ← Back to sports
        </button>
        <button
          onClick={() => onComplete(weights)}
          className="px-8 py-3 rounded-lg font-semibold text-sm bg-accent text-accent-foreground hover:opacity-90 transition-all"
        >
          See my ranked sessions →
        </button>
      </div>
    </div>
  );
}
