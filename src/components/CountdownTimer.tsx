import { useState, useEffect } from "react";

const OPENING_CEREMONY = new Date("2028-07-14T17:30:00-07:00").getTime();

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(): TimeLeft {
  const diff = Math.max(0, OPENING_CEREMONY - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function CountdownTimer() {
  const [time, setTime] = useState<TimeLeft>(getTimeLeft);

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const blocks = [
    { label: "Days", value: time.days },
    { label: "Hours", value: time.hours },
    { label: "Minutes", value: time.minutes },
    { label: "Seconds", value: time.seconds },
  ];

  return (
    <div className="flex items-center gap-3 sm:gap-4">
      {blocks.map((b, i) => (
        <div key={b.label} className="flex items-center gap-3 sm:gap-4">
          <div className="flex flex-col items-center">
            <span className="text-3xl sm:text-5xl font-black tabular-nums tracking-tight text-white drop-shadow-lg">
              {String(b.value).padStart(2, "0")}
            </span>
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-white/70 font-medium mt-1">
              {b.label}
            </span>
          </div>
          {i < blocks.length - 1 && (
            <span className="text-2xl sm:text-4xl font-light text-white/40 -mt-4">:</span>
          )}
        </div>
      ))}
    </div>
  );
}
