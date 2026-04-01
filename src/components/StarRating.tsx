import { Star } from "lucide-react";

interface Props {
  value: number;
  onChange: (v: number) => void;
  size?: "sm" | "md";
}

export function StarRating({ value, onChange, size = "sm" }: Props) {
  const iconClass = size === "md" ? "h-5 w-5" : "h-4 w-4";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          onClick={(e) => { e.stopPropagation(); onChange(value === i ? 0 : i); }}
          className="p-0 hover:scale-110 transition-transform"
        >
          <Star
            className={`${iconClass} ${i <= value ? "fill-accent text-accent" : "text-muted-foreground/40"}`}
          />
        </button>
      ))}
    </div>
  );
}
