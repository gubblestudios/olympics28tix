import { useState, useEffect, useMemo, useCallback } from "react";
import { OlympicEvent, Weights, DEFAULT_WEIGHTS } from "@/lib/types";
import { loadEvents } from "@/lib/parseCSV";
import { computeScore, detectConflicts, detectTravelIssues, exportCSV } from "@/lib/scoring";
import { loadPrices, PriceMap, getCheapestCategory } from "@/lib/prices";
import { SummaryCards } from "@/components/SummaryCards";
import { ScoringPanel } from "@/components/ScoringPanel";
import { EventTable } from "@/components/EventTable";
import { SportInterestCards } from "@/components/SportInterestCards";
import { PreferencesCards } from "@/components/PreferencesCards";
import { DayPlannerView } from "@/components/DayPlannerView";
import { BudgetPlanner } from "@/components/BudgetPlanner";
import { LandingHero } from "@/components/LandingHero";
import { Download, List, Star, Settings, CalendarDays, CheckCircle2, ChevronDown } from "lucide-react";
import la28Logo from "@/assets/la28-logo.png";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

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
  const [priceMap, setPriceMap] = useState<PriceMap>({});
  const [selectedCategories, setSelectedCategories] = useState<Record<string, string>>(() => loadFromLS("la28_categories", {}));
  const [budget, setBudget] = useState<number>(() => loadFromLS("la28_budget", 0));
  const [quantities, setQuantities] = useState<Record<string, number>>(() => loadFromLS("la28_quantities", {}));
  const [userName, setUserName] = useState<string>(() => loadFromLS("la28_username", "Diana"));

  const [tab, setTab] = useState<"all" | "shortlist" | "planner" | "final">("all");


  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Determine initial step: if user has already set interests, go straight to results
  const [step, setStep] = useState<AppStep>(() => {
    const saved = loadFromLS<Record<string, number>>("la28_interests", {});
    return Object.keys(saved).length > 0 ? "results" : "landing";
  });

  useEffect(() => { loadEvents().then(setEvents); loadPrices().then(setPriceMap); }, []);
  useEffect(() => { localStorage.setItem("la28_weights", JSON.stringify(weights)); }, [weights]);
  useEffect(() => { localStorage.setItem("la28_interests", JSON.stringify(sportInterests)); }, [sportInterests]);
  useEffect(() => { localStorage.setItem("la28_shortlist", JSON.stringify([...shortlisted])); }, [shortlisted]);
  useEffect(() => { localStorage.setItem("la28_final", JSON.stringify([...finalList])); }, [finalList]);
  useEffect(() => { localStorage.setItem("la28_categories", JSON.stringify(selectedCategories)); }, [selectedCategories]);
  useEffect(() => { localStorage.setItem("la28_budget", JSON.stringify(budget)); }, [budget]);
  useEffect(() => { localStorage.setItem("la28_quantities", JSON.stringify(quantities)); }, [quantities]);
  useEffect(() => { localStorage.setItem("la28_username", JSON.stringify(userName)); }, [userName]);

  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(() => !localStorage.getItem("la28_welcome_seen"));
  const [shortlistTipOpen, setShortlistTipOpen] = useState(false);
  const [plannerTipOpen, setPlannerTipOpen] = useState(false);
  const [finalTipOpen, setFinalTipOpen] = useState(false);

  const scores = useMemo(() => {
    const map: Record<string, number> = {};
    events.forEach((e) => { map[e.sessionCode] = computeScore(e, weights, sportInterests); });
    return map;
  }, [events, weights, sportInterests]);

  const combinedList = useMemo(() => {
    const combined = new Set(shortlisted);
    finalList.forEach((code) => combined.add(code));
    return combined;
  }, [shortlisted, finalList]);

  const conflicts = useMemo(() => detectConflicts(events, combinedList), [events, combinedList]);
  const travelWarnings = useMemo(() => detectTravelIssues(events, combinedList), [events, combinedList]);

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
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
        // Auto-set cheapest category if not already set
        if (!selectedCategories[code] && priceMap[code]) {
          const cheapest = getCheapestCategory(priceMap[code]);
          setSelectedCategories((prev) => ({ ...prev, [code]: cheapest.label }));
        }
      }
      return next;
    });
  }, [priceMap, selectedCategories]);

  const handleCategoryChange = useCallback((code: string, category: string) => {
    setSelectedCategories((prev) => ({ ...prev, [code]: category }));
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
      <Dialog open={welcomeOpen} onOpenChange={(open) => { setWelcomeOpen(open); if (!open) localStorage.setItem("la28_welcome_seen", "1"); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Welcome to Your Session Picker! 🎉</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed pt-2">
              All sessions are listed with ranked <strong>Scores</strong> based on your preferences. You can filter by individual sport, location, type of event (Final) or type into the <strong>Search</strong> box.
            </DialogDescription>
          </DialogHeader>
          <button
            onClick={() => { setWelcomeOpen(false); localStorage.setItem("la28_welcome_seen", "1"); }}
            className="mt-2 w-full bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Got it — Let's Go!
          </button>
        </DialogContent>
      </Dialog>
      <Dialog open={shortlistTipOpen} onOpenChange={setShortlistTipOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your Shortlist ⭐️</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed pt-2">
              These are your ⭐️ sessions. You can view these in <strong>Day Planner</strong> to help you narrow down to <strong>Final List</strong> or skip and add directly to Final, where you can also play around with a <strong>Budget Tracker</strong>.
            </DialogDescription>
          </DialogHeader>
          <button
            onClick={() => setShortlistTipOpen(false)}
            className="mt-2 w-full bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Got it!
          </button>
        </DialogContent>
      </Dialog>
      <Dialog open={plannerTipOpen} onOpenChange={setPlannerTipOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Day Planner 📅</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed pt-2">
              Here are your ⭐️ Shortlist and ✅ Final sessions viewable by day. Conflicts are flagged. Move to <strong>Final List</strong> tab when you're ready to view estimated costs.
            </DialogDescription>
          </DialogHeader>
          <button
            onClick={() => setPlannerTipOpen(false)}
            className="mt-2 w-full bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Got it!
          </button>
        </DialogContent>
      </Dialog>
      <header className="olympic-header px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={la28Logo} alt="LA 2028" className="h-14" />
          <div>
            <h1 className="text-xl font-bold tracking-tight">Ticket Planner</h1>
            <p className="text-xs text-muted-foreground">{userName}'s Olympic Session Picker</p>
          </div>
        </div>
        <div className="flex items-center gap-2 relative">
          <button
            onClick={() => setCustomizeOpen(!customizeOpen)}
            className="text-xs text-muted-foreground hover:text-accent transition-colors border border-border rounded px-3 py-1.5 flex items-center gap-1.5"
          >
            <Settings className="h-3.5 w-3.5" /> Customize <ChevronDown className="h-3 w-3" />
          </button>
          {customizeOpen && (
            <div className="absolute right-0 top-full mt-1 z-50 bg-card border border-border rounded-lg shadow-lg p-3 space-y-2 w-60">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Your Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full mt-1 px-2 py-1.5 text-sm rounded border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="Enter your name"
                />
              </div>
              <div className="border-t border-border pt-2 space-y-1">
                <button onClick={() => { setStep("sports"); setCustomizeOpen(false); }} className="w-full text-left text-sm px-2 py-1.5 rounded hover:bg-muted transition-colors">
                  🏅 Edit Sport Interests
                </button>
                <button onClick={() => { setStep("preferences"); setCustomizeOpen(false); }} className="w-full text-left text-sm px-2 py-1.5 rounded hover:bg-muted transition-colors">
                  ⚙️ Edit Scoring Preferences
                </button>
              </div>
            </div>
          )}
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
              onClick={() => {
                setTab("shortlist");
                if (!localStorage.getItem("la28_shortlist_tip_seen")) {
                  setShortlistTipOpen(true);
                  localStorage.setItem("la28_shortlist_tip_seen", "1");
                }
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "shortlist" ? "bg-primary text-primary-foreground" : "bg-card border text-foreground hover:bg-muted"}`}
            >
              <Star className="h-4 w-4" /> My Shortlist ({shortlistEvents.length})
            </button>
            <button
              onClick={() => {
                setTab("planner");
                if (!localStorage.getItem("la28_planner_tip_seen")) {
                  setPlannerTipOpen(true);
                  localStorage.setItem("la28_planner_tip_seen", "1");
                }
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "planner" ? "bg-primary text-primary-foreground" : "bg-card border text-foreground hover:bg-muted"}`}
            >
              <CalendarDays className="h-4 w-4" /> Day Planner
            </button>
            <button
              onClick={() => {
                setTab("final");
                if (!localStorage.getItem("la28_final_tip_seen")) {
                  setFinalTipOpen(true);
                  localStorage.setItem("la28_final_tip_seen", "1");
                }
              }}
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
          ) : tab === "final" ? (
            <div className="space-y-6">
              <BudgetPlanner
                events={finalListEvents}
                scores={scores}
                priceMap={priceMap}
                selectedCategories={selectedCategories}
                onCategoryChange={handleCategoryChange}
                budget={budget}
                onBudgetChange={setBudget}
                quantities={quantities}
                onQuantityChange={(code, qty) => setQuantities((prev) => ({ ...prev, [code]: qty }))}
              />
              <EventTable
                events={finalListEvents}
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
            </div>
          ) : (
            <EventTable
              events={displayEvents}
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
