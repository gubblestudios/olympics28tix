import { Ticket, Star, MapPin, Clock } from "lucide-react";

export function FloatingSessionCard() {
  return (
    <div className="glass-card rounded-2xl p-5 w-72 shadow-2xl border border-white/20 animate-float">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[hsl(var(--la28-orange))] to-[hsl(var(--la28-yellow))] flex items-center justify-center">
          <Star className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-xs font-medium text-white/60 uppercase tracking-wider">Gold Medal Event</p>
        </div>
      </div>
      <h4 className="text-lg font-bold text-white mb-1">Women's 100m Final</h4>
      <p className="text-sm text-white/70 mb-3">Athletics — Track &amp; Field</p>
      <div className="flex items-center gap-3 text-xs text-white/50 mb-4">
        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> SoFi Stadium</span>
        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 8:30 PM</span>
      </div>
      <button className="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold rounded-xl py-2.5 text-sm hover:bg-white/90 transition-colors">
        <Ticket className="h-4 w-4" /> Buy Tickets
      </button>
    </div>
  );
}
