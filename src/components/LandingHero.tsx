import { ArrowRight, ChevronDown } from "lucide-react";
import { CountdownTimer } from "@/components/CountdownTimer";

import la28Logo from "@/assets/la28-logo.png";
import heroImg from "@/assets/hero-stadium.jpg";

interface LandingHeroProps {
  onGetStarted: () => void;
}

export function LandingHero({ onGetStarted }: LandingHeroProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[hsl(var(--la28-purple))] via-[hsl(var(--la28-orange))] to-[hsl(var(--la28-yellow))]">
      {/* Ambient shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-[hsl(var(--la28-purple))] opacity-30 blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full bg-[hsl(var(--la28-yellow))] opacity-20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-[hsl(var(--la28-orange))] opacity-20 blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-20 glass-card border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={la28Logo} alt="LA 2028" className="h-10" />
            <span className="text-white font-bold text-lg tracking-tight">Ticket Planner</span>
          </div>
          <button
            onClick={onGetStarted}
            className="glass-card px-5 py-2 rounded-xl text-sm font-semibold text-white border border-white/20 hover:bg-white/20 transition-colors"
          >
            Open Planner
          </button>
        </div>
      </nav>

      {/* Hero content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 sm:pt-24 pb-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-200px)]">
          {/* Left — Value prop */}
          <div className="flex flex-col gap-8">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-white/60 font-medium mb-4">
                Los Angeles 2028 Olympic Games
              </p>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[0.95] tracking-tight">
                Schedule
                <br />
                Like a Pro.
                <br />
                <span className="bg-gradient-to-r from-[hsl(var(--la28-yellow))] to-[hsl(var(--la28-orange))] bg-clip-text text-transparent">
                  Own the Moment.
                </span>
              </h1>
              <p className="text-lg text-white/70 mt-6 max-w-lg leading-relaxed">
                The smarter way to plan your LA28. We break down popular sessions by score, rank, and logistics to make planning simpler.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-4">
              <button
                onClick={onGetStarted}
                className="group flex items-center gap-3 bg-black text-white font-bold rounded-2xl px-8 py-4 text-lg hover:shadow-[0_0_40px_rgba(255,214,0,0.3)] transition-all duration-300"
              >
                Start Planning
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href="#countdown"
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-medium py-4"
              >
                <ChevronDown className="h-4 w-4 animate-bounce" /> See Countdown
              </a>
            </div>
          </div>

          {/* Right — Visual */}
          <div className="relative flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-lg">
              <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                <img
                  src={heroImg}
                  alt="Olympic stadium with cheering crowd at sunset"
                  className="w-full h-auto object-cover"
                  width={1280}
                  height={960}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Countdown section */}
      <div id="countdown" className="relative z-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/50 font-medium mb-2">Countdown to Opening Ceremony</p>
            <p className="text-sm text-white/40">July 14, 2028 — Los Angeles, California</p>
          </div>
          <CountdownTimer />
        </div>
      </div>

      {/* Footer with Olympic rings watermark */}
      <footer className="relative z-10 border-t border-white/10 py-8 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none">
          <svg viewBox="0 0 500 200" className="w-[600px]" fill="none" stroke="white" strokeWidth="8">
            <circle cx="100" cy="100" r="60" />
            <circle cx="180" cy="100" r="60" />
            <circle cx="260" cy="100" r="60" />
            <circle cx="140" cy="150" r="60" />
            <circle cx="220" cy="150" r="60" />
          </svg>
        </div>
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-white/40">
            LA28 Ticket Planner — A personal planning tool. Not affiliated with the IOC or LA28 Organizing Committee.
          </p>
          <p className="pt-8 text-center" style={{ fontSize: '10px', color: '#9CA3AF', fontFamily: 'Inter, sans-serif' }}>
            Made in LA. Strategy &amp; Design by{' '}
            <a href="https://www.linkedin.com/in/dolympia" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/60 transition-colors" style={{ color: '#9CA3AF' }}>
              AI Made Simpler
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
