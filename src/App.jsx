import BonusTrackerCard from "./BonusTrackerCard.jsx";

/* ================================================================== */
/*  The Levi System — Tracker dashboard (recreated to match the app)  */
/* ================================================================== */

export default function App() {
  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-4">
        {/* Page header */}
        <header className="px-1 pb-1">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-700">
            The Levi System
          </div>
          <h1 className="font-serif text-4xl font-bold text-slate-900">Dashboard</h1>
        </header>

        {/* AERO PROTOCOL */}
        <AeroProtocolCard />

        {/* Locked module */}
        <LockedModuleCard
          phase="Phase 3 · Module 1"
          title="CMD Protocol"
          unlock="Unlocks at Level 25"
        />

        {/* ---- Tracker section: habit cards with the bonus card in the middle ---- */}
        <section className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <HabitCard
              icon={<LeafIcon />}
              from="#34d399"
              to="#059669"
              tint="from-emerald-50"
              title="DIET"
              desc="Low-carb, clean source and high fat"
              xp={4}
            />
            <HabitCard
              icon={<HandIcon />}
              from="#2dd4bf"
              to="#0d9488"
              tint="from-teal-50"
              title="CTR"
              desc="Fascia release"
              checked
            />
            <HabitCard
              icon={<DropletPlusIcon />}
              from="#fb923c"
              to="#ea580c"
              tint="from-orange-50"
              title="RLD"
              desc="AERO support"
              checked
            />
          </div>

          {/* Bonus tracker — full-width row, in the middle of the section */}
          <BonusTrackerCard />

          <div className="grid grid-cols-3 gap-3">
            <HabitCard
              icon={<CapsuleIcon />}
              from="#60a5fa"
              to="#2563eb"
              tint="from-sky-50"
              title="SUPPLEMENTS"
              desc="Daily supplement stack"
              checked
            />
            <HabitCard
              icon={<BrowIcon />}
              from="#a78bfa"
              to="#7c3aed"
              tint="from-violet-50"
              title="EYEBROW PROTOCOL"
              desc="Supraorbital ridge release"
              checked
            />
            <div className="hidden sm:block" aria-hidden="true" />
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              icon={<DropletIcon />}
              from="#38bdf8"
              to="#3b82f6"
              tint="from-sky-100 to-blue-50"
              value="0"
              unit="L"
              title="WATER"
              desc="Log daily hydration in liters"
            />
            <MetricCard
              icon={<BrainIcon />}
              from="#a78bfa"
              to="#8b5cf6"
              tint="from-violet-100 to-purple-50"
              value="0"
              unit="min"
              title="MEDITATION"
              desc="Daily mindfulness practice"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Cards                                                              */
/* ------------------------------------------------------------------ */

function IconTile({ children, from, to, size = "h-11 w-11" }) {
  return (
    <div
      className={`flex ${size} shrink-0 items-center justify-center rounded-2xl text-white shadow-[0_6px_14px_-4px_rgba(0,0,0,0.3),inset_0_1px_2px_rgba(255,255,255,0.5)]`}
      style={{ background: `linear-gradient(160deg, ${from} 0%, ${to} 100%)` }}
    >
      {children}
    </div>
  );
}

function Checkbox({ checked }) {
  return (
    <span
      className={[
        "flex h-5 w-5 items-center justify-center rounded-md border",
        checked
          ? "border-emerald-300 bg-white text-emerald-500"
          : "border-slate-300 bg-white text-transparent",
      ].join(" ")}
    >
      <CheckIcon className="h-3 w-3" strokeWidth={3} />
    </span>
  );
}

function HabitCard({ icon, from, to, tint, title, desc, checked = false, xp }) {
  return (
    <div
      className={`relative flex flex-col items-center rounded-2xl border border-white/60 bg-gradient-to-br ${tint} to-white p-3.5 text-center shadow-[0_4px_16px_rgba(15,23,42,0.05)]`}
    >
      {xp != null && (
        <span className="absolute left-2 top-2 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm">
          +{xp} XP
        </span>
      )}
      <span className="absolute right-2 top-2">
        <Checkbox checked={checked} />
      </span>

      <div className="mt-3">
        <IconTile from={from} to={to}>
          {icon}
        </IconTile>
      </div>
      <div className="mt-2 text-xs font-bold leading-tight text-slate-700">
        {title}
      </div>
      <div className="mt-0.5 text-[10px] leading-tight text-slate-500">{desc}</div>
    </div>
  );
}

function MetricCard({ icon, from, to, tint, value, unit, title, desc }) {
  return (
    <div
      className={`rounded-3xl border border-white/60 bg-gradient-to-br ${tint} p-4 shadow-[0_6px_20px_rgba(15,23,42,0.06)]`}
    >
      <IconTile from={from} to={to} size="h-12 w-12">
        {icon}
      </IconTile>
      <div className="mt-4 text-center">
        <div className="flex items-end justify-center gap-1">
          <span className="text-3xl font-bold text-slate-400">{value}</span>
          <span className="mb-1 text-sm font-medium text-slate-500">{unit}</span>
        </div>
        <div className="mt-1 text-sm font-bold tracking-wide text-slate-700">
          {title}
        </div>
        <div className="text-[11px] text-slate-500">{desc}</div>
      </div>
    </div>
  );
}

function AeroProtocolCard() {
  return (
    <div className="rounded-3xl border border-rose-100/80 bg-gradient-to-br from-rose-50 to-white p-5 shadow-[0_6px_24px_rgba(244,63,94,0.08)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <IconTile from="#fb7185" to="#e11d48" size="h-9 w-9">
            <FlameIcon className="h-5 w-5" />
          </IconTile>
          <span className="text-sm font-bold uppercase tracking-[0.12em] text-rose-500">
            Aero Protocol
          </span>
        </div>
        <span className="text-xs text-slate-500">Total: 0m</span>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="font-bold text-slate-800">Minutes</span>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-500">
            +2 XP
          </span>
          <div className="flex h-11 w-20 items-center justify-center rounded-xl border border-slate-200 bg-white text-2xl font-bold text-slate-800">
            0
          </div>
          <span className="text-sm text-rose-400">min</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Effectiveness
        </span>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-500">
            +1 XP
          </span>
          <span className="text-sm font-medium text-slate-500">0%</span>
        </div>
      </div>
      <div className="mt-2 h-2 w-full rounded-full bg-rose-100">
        <div className="h-2 w-0 rounded-full bg-gradient-to-r from-rose-400 to-rose-500" />
      </div>
    </div>
  );
}

function LockedModuleCard({ phase, title, unlock }) {
  return (
    <div className="flex items-center gap-3 rounded-3xl border border-slate-200/80 bg-slate-50/70 p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
        <LockIcon className="h-4 w-4" />
      </span>
      <div>
        <div className="text-[11px] font-medium text-slate-400">{phase}</div>
        <div className="text-sm font-bold text-slate-700">{title}</div>
        <div className="text-xs text-slate-400">{unlock}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Icons (white line icons for the gradient tiles)                    */
/* ------------------------------------------------------------------ */

const S = (p) => ({
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  ...p,
});

function LeafIcon({ className = "h-5 w-5" }) {
  return (
    <svg {...S({ className })}>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6" />
    </svg>
  );
}
function HandIcon({ className = "h-5 w-5" }) {
  return (
    <svg {...S({ className })}>
      <path d="M18 11V6a2 2 0 0 0-4 0v5" />
      <path d="M14 10V4a2 2 0 0 0-4 0v6" />
      <path d="M10 10.5V6a2 2 0 0 0-4 0v8" />
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
    </svg>
  );
}
function DropletPlusIcon({ className = "h-5 w-5" }) {
  return (
    <svg {...S({ className })}>
      <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5S5 13 5 15a7 7 0 0 0 7 7Z" />
      <path d="M12 11v5M9.5 13.5h5" />
    </svg>
  );
}
function CapsuleIcon({ className = "h-5 w-5" }) {
  return (
    <svg {...S({ className })}>
      <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
      <path d="m8.5 8.5 7 7" />
    </svg>
  );
}
function BrowIcon({ className = "h-5 w-5" }) {
  return (
    <svg {...S({ className })}>
      <path d="M3 9c2.5-2 6-2 8.5 0" />
      <path d="M12.5 9c2.5-2 6-2 8.5 0" />
      <circle cx="7" cy="14" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="17" cy="14" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}
function DropletIcon({ className = "h-6 w-6" }) {
  return (
    <svg {...S({ className })}>
      <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5S5 13 5 15a7 7 0 0 0 7 7Z" />
    </svg>
  );
}
function BrainIcon({ className = "h-6 w-6" }) {
  return (
    <svg {...S({ className })}>
      <path d="M12 5a3 3 0 0 0-5.99.14 3 3 0 0 0-2.83 4.13A3 3 0 0 0 4.5 15 3 3 0 0 0 9 18a3 3 0 0 0 3-1.5V5Z" />
      <path d="M12 5a3 3 0 0 1 5.99.14 3 3 0 0 1 2.83 4.13A3 3 0 0 1 19.5 15 3 3 0 0 1 15 18a3 3 0 0 1-3-1.5V5Z" />
    </svg>
  );
}
function FlameIcon({ className = "h-5 w-5" }) {
  return (
    <svg {...S({ className })}>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.71-4.5 1.5-6.5 0 3 1.5 4.5 3 6 1.2 1.2 2 2.65 2 4.5a5 5 0 1 1-10 0c0-.5.06-1 .18-1.46.5.83 1.3 1.46 1.82 1.46Z" />
    </svg>
  );
}
function LockIcon({ className = "h-4 w-4" }) {
  return (
    <svg {...S({ className })}>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
function CheckIcon({ className = "", strokeWidth = 2.5 }) {
  return (
    <svg {...S({ className, strokeWidth })}>
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}
