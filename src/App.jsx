import BonusTrackerCard from "./BonusTrackerCard.jsx";

/* A normal tracker card, just to demonstrate the bonus card's placement and
   2–3 column span within a real tracker grid. */
function NormalCard({ tone, icon, title, sub }) {
  return (
    <div className={["rounded-3xl p-5 shadow-sm border", tone].join(" ")}>
      <div className="text-2xl">{icon}</div>
      <div className="mt-6 text-base font-bold text-slate-700">{title}</div>
      <div className="mt-1 text-xs text-slate-500">{sub}</div>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
            The Levi System
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800">Tracker Section</h1>
          <p className="text-sm text-slate-500">
            Bonus card sits in the middle · spans 2–3 cards on desktop, full width on mobile.
            Click <strong>Complete bonus</strong> to see the XP pop, and use the demo toggle
            to cycle tiers.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          <NormalCard
            tone="bg-emerald-50 border-emerald-100"
            icon="🍎"
            title="Diet"
            sub="Low-carb, clean source"
          />
          <BonusTrackerCard />
          <NormalCard
            tone="bg-violet-50 border-violet-100"
            icon="🧠"
            title="Meditation"
            sub="Daily mindfulness"
          />
        </div>
      </div>
    </div>
  );
}
