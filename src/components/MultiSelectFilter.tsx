import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface MultiSelectFilterProps {
  label: string;
  options: string[];
  selected: Set<string>;
  onChange: (selected: Set<string>) => void;
}

export function MultiSelectFilter({ label, options, selected, onChange }: MultiSelectFilterProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const allSelected = selected.size === options.length;
  const noneSelected = selected.size === 0;
  const displayLabel = noneSelected || allSelected
    ? label
    : selected.size === 1
    ? [...selected][0]
    : `${label} (${selected.size})`;

  const toggleItem = (item: string) => {
    const next = new Set(selected);
    if (next.has(item)) next.delete(item);
    else next.add(item);
    onChange(next);
  };

  const selectAll = () => onChange(new Set(options));
  const deselectAll = () => onChange(new Set());

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 text-xs bg-card border rounded px-2 py-1.5 text-foreground hover:bg-muted transition-colors min-w-[100px] ${
          !noneSelected && !allSelected ? "border-primary/50 bg-primary/5" : ""
        }`}
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDown className={`h-3 w-3 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 bg-popover border rounded-lg shadow-lg py-1 min-w-[180px] max-h-[300px] overflow-y-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 border-b mb-1">
            <button onClick={selectAll} className="text-xs text-primary hover:underline">Select All</button>
            <span className="text-muted-foreground">|</span>
            <button onClick={deselectAll} className="text-xs text-primary hover:underline">Clear</button>
          </div>
          {options.map((opt) => {
            const isChecked = selected.has(opt);
            return (
              <button
                key={opt}
                onClick={() => toggleItem(opt)}
                className="w-full flex items-center gap-2 px-3 py-1 text-xs text-left hover:bg-muted transition-colors"
              >
                <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                  isChecked ? "bg-primary border-primary" : "border-muted-foreground/40"
                }`}>
                  {isChecked && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                </span>
                <span className="truncate">{opt}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}