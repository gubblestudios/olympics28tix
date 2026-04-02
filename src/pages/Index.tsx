import { useState, useEffect, useMemo, useCallback } from "react";
import { OlympicEvent, Weights, DEFAULT_WEIGHTS } from "@/lib/types";
import { loadEvents } from "@/lib/parseCSV";
import { computeScore, detectConflicts, detectTravelIssues, exportCSV } from "@/lib/scoring";
import { SummaryCards } from "@/components/SummaryCards";
import { ScoringPanel } from "@/components/ScoringPanel";
import { EventTable } from "@/components/EventTable";
import { SportInterestCards } from "@/components/SportInterestCards";
import { PreferencesCards } from "@/components/PreferencesCards";
import { DayPlannerView } from "@/components/DayPlannerView";
import { LandingHero } from "@/components/LandingHero";
import { Download, List, Star, Settings, CalendarDays, CheckCircle2 } from "lucide-react";
import la28Logo from "@/assets/la28-logo.png";

function loadFromLS<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}

type AppStep = "landing" | "sports" | "preferences" | "results";

export default function Index() {
  const [events, setEvents] = useState<OlympicEvent[]>([]);
  const [weights, setWeights] = useState<Weights>(() => loadFromLS("la28_weights", DEFAULT_WEIGHTS));
  const [sportInterests, setSportInterests] = useState<Record<string, number>>(() => loadFromLS("la28_interests", {}));
  const [shortlisted, setShortlisted] = useState<Set<string>>(() => new Set(loadFromLS<string[]>("la28_shortlist", [])));
  const [finalList, setFinalList] = useState<Set<string>>(() => new Set(loadFromLS<string[]>("la28_final", [])));
  
  const [tab, setTab] = useState<"all" | "shortlist" | "planner" | "final">("all");


  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Determine initial step: if user has already set interests, go straight to results
  const [step, setStep] = useState<AppStep>(() => {
    const saved = loadFromLS<Record<string, number>>("la28_interests", {});
    return Object.keys(saved).length > 0 ? "results" : "landing";
  });

  useEffect(() => { loadEvents().then(setEvents); }, []);
  useEffect(() => { localStorage.setItem("la28_weights", JSON.stringify(weights)); }, [weights]);
  useEffect(() => { localStorage.setItem("la28_interests", JSON.stringify(sportInterests)); }, [sportInterests]);
  useEffect(() => { localStorage.setItem("la28_shortlist", JSON.stringify([...shortlisted])); }, [shortlisted]);
  useEffect(() => { localStorage.setItem("la28_final", JSON.stringify([...finalList])); }, [finalList]);
  

  const scores = useMemo(() => {
    const map: Record<string, number> = {};
    events.forEach((e) => { map[e.sessionCode] = computeScore(e, weights, sportInterests); });
    return map;
  }, [events, weights, sportInterests]);

  const conflicts = useMemo(() => detectConflicts(events, shortlisted), [events, shortlisted]);
  const travelWarnings = useMemo(() => detectTravelIssues(events, shortlisted), [events, shortlisted]);

  const shortlistEvents = useMemo(() => {
    return events.filter((e) => shortlisted.has(e.sessionCode));
  }, [events, shortlisted]);

  const finalListEvents = useMemo(() => {
    return events.filter((e) => finalList.has(e.sessionCode));
  }, [events, finalList]);

  const excludedSports = useMemo(() => {
    const set = new Set<string>();
    Object.entries(sportInterests).forEach(([k, v]) => { if (v === -1) set.add(k); });
    return set;
  }, [sportInterests]);

  const filteredEvents = useMemo(() => events.filter((e) => !excludedSports.has(e.sport)), [events, excludedSports]);

  const displayEvents = tab === "shortlist" ? shortlistEvents : filteredEvents;

  const handleInterest = useCallback((sport: string, val: number) => {
    setSportInterests((prev) => ({ ...prev, [sport]: val }));
  }, []);

  const handleToggleShortlist = useCallback((code: string) => {
    setShortlisted((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }, []);

  const handleToggleFinal = useCallback((code: string) => {
    setFinalList((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }, []);

  const handleExport = (list: "shortlist" | "final") => {
    const eventsToExport = list === "final" ? finalListEvents : shortlistEvents;
    const csv = exportCSV(eventsToExport, scores);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = list === "final" ? "la28_final_list.csv" : "la28_shortlist.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Landing page
  if (step === "landing") {
    return <LandingHero onGetStarted={() => setStep("sports")} />;
  }

  // Onboarding steps
  if (step === "sports" && events.length > 0) {
    return (
      <div className="min-h-screen bg-background">
      <header className="olympic-header px-6 py-4 text-center flex flex-col items-center gap-2">
          <img src={la28Logo} alt="LA 2028" className="h-16" />
          <div>
            <h1 className="text-xl font-bold tracking-tight">Ticket Planner</h1>
            <p className="text-xs text-muted-foreground">Step 1 of 2 — Rate your sports</p>
          </div>
        </header>
        <div className="p-6">
          <SportInterestCards
            events={events}
            sportInterests={sportInterests}
            onComplete={(interests) => {
              setSportInterests(interests);
              setStep("preferences");
            }}
          />
        </div>
      </div>
    );
  }

  if (step === "preferences") {
    return (
      <div className="min-h-screen bg-background">
      <header className="olympic-header px-6 py-4 text-center flex flex-col items-center gap-2">
          <img src={la28Logo} alt="LA 2028" className="h-16" />
          <div>
            <h1 className="text-xl font-bold tracking-tight">Ticket Planner</h1>
            <p className="text-xs text-muted-foreground">Step 2 of 2 — Set your preferences</p>
          </div>
        </header>
        <div className="p-6">
          <PreferencesCards
            initialWeights={weights}
            onComplete={(w) => {
              setWeights(w);
              setStep("results");
            }}
            onBack={() => setStep("sports")}
          />
        </div>
      </div>
    );
  }

  // Results view
  return (
    <div className="min-h-screen bg-background">
      <header className="olympic-header px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={la28Logo} alt="LA 2028" className="h-14" />
          <div>
            <h1 className="text-xl font-bold tracking-tight">Ticket Planner</h1>
            <p className="text-xs text-muted-foreground">Diana's Olympic Session Picker</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStep("sports")}
            className="text-xs text-muted-foreground hover:text-accent transition-colors border border-border rounded px-3 py-1.5 flex items-center gap-1.5"
          >
            <Settings className="h-3.5 w-3.5" /> Edit Preferences
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-xs text-muted-foreground hover:text-accent transition-colors border border-border rounded px-3 py-1.5"
          >
            {sidebarOpen ? "Hide Weights" : "Show Weights"}
          </button>
        </div>
      </header>

      <div className="flex">
        {sidebarOpen && (
          <aside className="w-72 min-w-[280px] p-4 border-r bg-muted/30 shrink-0 overflow-y-auto max-h-[calc(100vh-64px)] sticky top-[64px]">
            <ScoringPanel weights={weights} onChange={setWeights} />
          </aside>
        )}

        <main className="flex-1 p-6 space-y-6 overflow-x-hidden">
          <SummaryCards events={filteredEvents} conflictCount={conflicts.size} shortlistedCount={shortlisted.size} onConflictsClick={() => setTab("planner")} />

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab("all")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "all" ? "bg-primary text-primary-foreground" : "bg-card border text-foreground hover:bg-muted"}`}
            >
              <List className="h-4 w-4" /> All Sessions
            </button>
            <button
              onClick={() => setTab("shortlist")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "shortlist" ? "bg-primary text-primary-foreground" : "bg-card border text-foreground hover:bg-muted"}`}
            >
              <Star className="h-4 w-4" /> My Shortlist ({shortlistEvents.length})
            </button>
            <button
              onClick={() => setTab("planner")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "planner" ? "bg-primary text-primary-foreground" : "bg-card border text-foreground hover:bg-muted"}`}
            >
              <CalendarDays className="h-4 w-4" /> Day Planner
            </button>
            <button
              onClick={() => setTab("final")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "final" ? "bg-primary text-primary-foreground" : "bg-card border text-foreground hover:bg-muted"}`}
            >
              <CheckCircle2 className="h-4 w-4" /> Final List ({finalListEvents.length})
            </button>
            <div className="ml-auto flex items-center gap-1.5">
              <button onClick={() => handleExport("shortlist")} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-accent text-accent-foreground hover:opacity-90 transition-opacity">
                <Download className="h-3.5 w-3.5" /> Export Shortlist
              </button>
              <button onClick={() => handleExport("final")} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                <Download className="h-3.5 w-3.5" /> Export Final
              </button>
            </div>
          </div>

          {tab === "planner" ? (
            <DayPlannerView
              events={shortlistEvents}
              scores={scores}
              conflicts={conflicts}
              travelWarnings={travelWarnings}
              shortlisted={shortlisted}
              onToggleShortlist={handleToggleShortlist}
              finalList={finalList}
              onToggleFinal={handleToggleFinal}
            />
          ) : (
            <EventTable
              events={tab === "final" ? finalListEvents : displayEvents}
              scores={scores}
              weights={weights}
              sportInterests={sportInterests}
              onInterestChange={handleInterest}
              shortlisted={shortlisted}
              onToggleShortlist={handleToggleShortlist}
              finalList={finalList}
              onToggleFinal={handleToggleFinal}
              conflicts={conflicts}
            />
          )}
        </main>
      </div>
    </div>
  );
}
