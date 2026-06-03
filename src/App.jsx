import { useState, useRef, useMemo } from "react";
import BonusTrackerCard from "./BonusTrackerCard.jsx";
import { getMonthBonuses } from "./bonusEngine.js";

/* Shared confetti XP burst: bold "+XP" text rises while specks erupt upward. */
function XpConfetti({ xp, color = "#4caf7d", colorLight = "#8fd9b3" }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => {
        const angle = (i / 22) * Math.PI * 2 + Math.random() * 0.5;
        const dist = 50 + Math.random() * 70;
        const palette = [color, colorLight, "#ffffff"];
        return {
          tx: Math.cos(angle) * dist,
          ty: Math.sin(angle) * dist - (30 + Math.random() * 40),
          rot: Math.random() * 540 - 270,
          w: 4 + Math.random() * 3,
          h: 9 + Math.random() * 7,
          color: palette[i % 3],
          delay: Math.random() * 60,
        };
      }),
    [color, colorLight]
  );

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2"
    >
      {pieces.map((p, i) => (
        <span
          key={i}
          className="lv-confetti absolute block"
          style={{
            left: 0,
            top: 0,
            width: p.w,
            height: p.h,
            backgroundColor: p.color,
            borderRadius: "1px",
            animationDelay: `${p.delay}ms`,
            "--tx": `${p.tx}px`,
            "--ty": `${p.ty}px`,
            "--rot": `${p.rot}deg`,
          }}
        />
      ))}
      <span
        className="lv-rise lv-xp-num absolute left-1/2 top-1/2 whitespace-nowrap text-xl font-extrabold"
        style={{ color }}
      >
        +{xp} XP
      </span>
    </div>
  );
}

/* ================================================================== */
/*  The Levi System — Tracker dashboard (recreated to match the app)  */
/* ================================================================== */

export default function App() {
  const [view, setView] = useState("dashboard");
  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-4">
        {/* Page header + view tabs */}
        <header className="px-1 pb-1">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-700">
            The Levi System
          </div>
          <h1 className="font-serif text-4xl font-bold text-slate-900">
            {view === "dashboard" ? "Dashboard" : "Bonus Engine"}
          </h1>
          <div className="mt-3 inline-flex rounded-xl bg-slate-100 p-1 text-sm font-semibold">
            <button
              type="button"
              onClick={() => setView("dashboard")}
              className={`rounded-lg px-4 py-1.5 transition ${
                view === "dashboard" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
              }`}
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => setView("engine")}
              className={`rounded-lg px-4 py-1.5 transition ${
                view === "engine" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
              }`}
            >
              Bonus Engine
            </button>
          </div>
        </header>

        {view === "engine" ? <BonusEngineDemo /> : <Dashboard />}
      </div>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="space-y-4">
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
              icon={<AppleIcon />}
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
              defaultChecked
            />
            <HabitCard
              icon={<TongueIcon />}
              from="#fb923c"
              to="#ea580c"
              tint="from-orange-50"
              title="RLD"
              desc="AERO support"
              defaultChecked
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
              defaultChecked
            />
            <HabitCard
              icon={<HandIcon />}
              from="#a78bfa"
              to="#7c3aed"
              tint="from-violet-50"
              title="EYEBROW PROTOCOL"
              desc="Supraorbital ridge release"
              defaultChecked
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
              unit="L"
              title="WATER"
              desc="Log daily hydration in liters"
            />
            <MetricCard
              icon={<BrainIcon />}
              from="#a78bfa"
              to="#8b5cf6"
              tint="from-violet-100 to-purple-50"
              unit="min"
              title="MEDITATION"
              desc="Daily mindfulness practice"
            />
          </div>
        </section>

      {/* Analysis Journal */}
      <AnalysisJournalCard />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Bonus Engine demo — drives the card with REAL selected tasks       */
/* ------------------------------------------------------------------ */

const TIER_TONE = {
  keystone: "bg-amber-100 text-amber-700",
  ultra: "bg-teal-100 text-teal-700",
  high: "bg-violet-100 text-violet-700",
  standard: "bg-emerald-100 text-emerald-700",
};

function BonusEngineDemo() {
  const [userId, setUserId] = useState("levi");
  const [monthIndex, setMonthIndex] = useState(0);
  const [day, setDay] = useState(null);

  const schedule = useMemo(
    () => getMonthBonuses(userId, monthIndex),
    [userId, monthIndex]
  );

  const selectedDay = day ?? schedule[0]?.day;
  const selected = schedule.find((b) => b.day === selectedDay) || schedule[0];
  const task = selected
    ? {
        tier: selected.tier,
        name: selected.task.name,
        description: selected.task.description,
        delayed: selected.task.delayed,
        confirm: selected.task.confirm,
      }
    : null;

  const setMonth = (next) => {
    setMonthIndex(Math.max(0, next));
    setDay(null);
  };

  return (
    <div className="space-y-4">
      {/* Explainer + controls */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_6px_24px_rgba(15,23,42,0.06)]">
        <p className="text-sm leading-relaxed text-slate-600">
          The real selection engine from the handoff spec — deterministic,
          seeded per <strong>user&nbsp;+&nbsp;month</strong>. Month&nbsp;1 places
          the <strong>Keystone on day&nbsp;10</strong>; later months rotate one
          Ultra + one High (with 8- and 6-month cooldowns) and draw 5 Standard
          tasks without replacement until the 30-task bag resets. 7 bonus days
          per month, one bonus per day.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            User&nbsp;ID
            <input
              value={userId}
              onChange={(e) => {
                setUserId(e.target.value || "levi");
                setDay(null);
              }}
              className="w-28 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-teal-300 focus:ring-2 focus:ring-teal-100"
            />
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMonth(monthIndex - 1)}
              disabled={monthIndex === 0}
              className="h-8 w-8 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40"
            >
              ‹
            </button>
            <span className="text-sm font-bold text-slate-700">
              Month {monthIndex + 1}
            </span>
            <button
              type="button"
              onClick={() => setMonth(monthIndex + 1)}
              className="h-8 w-8 rounded-lg border border-slate-200 text-slate-600"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* This month's 7 bonus days */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_6px_24px_rgba(15,23,42,0.06)]">
        <div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Bonus days this month · tap one to load it
        </div>
        <ul className="space-y-1.5">
          {schedule.map((b) => {
            const active = b.day === selectedDay;
            return (
              <li key={b.day}>
                <button
                  type="button"
                  onClick={() => setDay(b.day)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition ${
                    active
                      ? "border-teal-300 bg-teal-50"
                      : "border-transparent hover:bg-slate-50"
                  }`}
                >
                  <span className="w-12 shrink-0 text-sm font-bold text-slate-700">
                    Day {b.day}
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${TIER_TONE[b.tier]}`}
                  >
                    {b.tier} · {b.xp}xp
                  </span>
                  <span className="truncate text-sm text-slate-600">
                    {b.task.name}
                  </span>
                  {b.task.delayed && (
                    <span className="ml-auto shrink-0 text-[10px] font-semibold text-amber-600">
                      ⏳ delayed
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* The actual card, driven by the engine-selected task */}
      {task && (
        <BonusTrackerCard
          key={`${userId}-${monthIndex}-${selectedDay}`}
          task={task}
        />
      )}
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

function HabitCard({
  icon,
  from,
  to,
  tint,
  title,
  desc,
  defaultChecked = false,
  xp = 4,
}) {
  const [checked, setChecked] = useState(defaultChecked);
  const [bursts, setBursts] = useState([]);
  const [bounce, setBounce] = useState(false);
  const idRef = useRef(0);

  const toggle = () => {
    setChecked((wasChecked) => {
      const next = !wasChecked;
      if (next) {
        // checking the habit → fire the same +XP blob burst as the bonus card
        const id = idRef.current++;
        setBursts((b) => [...b, id]);
        window.setTimeout(
          () => setBursts((b) => b.filter((x) => x !== id)),
          1350
        );
        setBounce(true);
        window.setTimeout(() => setBounce(false), 460);
      }
      return next;
    });
  };

  return (
    <div
      className={[
        "relative flex flex-col items-center rounded-2xl border border-white/60 bg-gradient-to-br p-3.5 text-center shadow-[0_4px_16px_rgba(15,23,42,0.05)]",
        tint,
        "to-white",
        bounce ? "lv-card-bounce" : "",
      ].join(" ")}
    >
      {/* +XP confetti burst — bold green text + specks, same everywhere */}
      {bursts.map((id) => (
        <XpConfetti key={id} xp={xp} />
      ))}

      {/* +XP incentive pill — shown until the habit is completed */}
      {!checked && (
        <span className="absolute left-2 top-2 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm">
          +{xp} XP
        </span>
      )}

      {/* Toggle button (was a static checkbox) */}
      <button
        type="button"
        onClick={toggle}
        aria-pressed={checked}
        aria-label={`Mark ${title} complete`}
        className="absolute right-2 top-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
      >
        <Checkbox checked={checked} />
      </button>

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

function MetricCard({ icon, from, to, tint, unit, title, desc, xp = 4 }) {
  const [value, setValue] = useState("");
  const [awarded, setAwarded] = useState(false);
  const [bursts, setBursts] = useState([]);
  const idRef = useRef(0);

  const fireBurst = () => {
    const id = idRef.current++;
    setBursts((b) => [...b, id]);
    window.setTimeout(() => setBursts((b) => b.filter((x) => x !== id)), 1350);
  };

  // Award once the logged value first becomes positive.
  const commit = () => {
    const n = Number(value) || 0;
    if (n > 0 && !awarded) {
      setAwarded(true);
      fireBurst();
    } else if (n <= 0) {
      setAwarded(false);
    }
  };

  return (
    <div
      className={`relative rounded-3xl border border-white/60 bg-gradient-to-br ${tint} p-4 shadow-[0_6px_20px_rgba(15,23,42,0.06)]`}
    >
      {/* +XP confetti burst on logging */}
      {bursts.map((id) => (
        <XpConfetti key={id} xp={xp} />
      ))}

      <div className="flex items-start justify-between">
        <IconTile from={from} to={to} size="h-12 w-12">
          {icon}
        </IconTile>
        {!awarded && (
          <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
            +{xp} XP
          </span>
        )}
      </div>

      <div className="mt-4 text-center">
        <div className="flex items-end justify-center gap-1">
          <input
            type="number"
            min={0}
            inputMode="decimal"
            value={value}
            placeholder="0"
            onChange={(e) => setValue(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            aria-label={`Log ${title}`}
            className="w-16 bg-transparent text-center text-3xl font-bold text-slate-700 outline-none placeholder:text-slate-400 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
          />
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
  const [minutes, setMinutes] = useState(0);
  const [effectiveness, setEffectiveness] = useState(0);

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
        <span className="text-xs text-slate-500">
          Total: <span className="font-bold text-slate-700">{minutes}m</span>
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="font-bold text-slate-800">Minutes</span>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-500">
            +2 XP
          </span>
          <input
            type="number"
            min={0}
            value={minutes}
            onChange={(e) => setMinutes(Math.max(0, Number(e.target.value) || 0))}
            aria-label="Minutes"
            className="h-11 w-20 rounded-xl border border-slate-200 bg-white text-center text-2xl font-bold text-slate-800 shadow-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-200 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-sm font-medium text-rose-400">min</span>
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
          <span className="text-sm font-bold text-slate-700">{effectiveness}%</span>
        </div>
      </div>

      {/* Draggable slider — thumb moves and fill follows as you slide it */}
      <input
        type="range"
        min={0}
        max={100}
        value={effectiveness}
        onChange={(e) => setEffectiveness(Number(e.target.value))}
        aria-label="Effectiveness"
        className="lv-range mt-3 w-full"
        style={{
          background: `linear-gradient(to right, #ef4444 0%, #fb7185 ${effectiveness}%, #ffe4e6 ${effectiveness}%, #ffe4e6 100%)`,
        }}
      />
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

const JOURNAL_PROMPTS = [
  { label: "What shifted today", cls: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  { label: "Where I drifted", cls: "border-rose-200 bg-rose-50 text-rose-600" },
  { label: "One win, one lesson", cls: "border-amber-200 bg-amber-50 text-amber-700" },
  { label: "What pattern is forming", cls: "border-indigo-200 bg-indigo-50 text-indigo-700" },
];

function AnalysisJournalCard() {
  const XP = 2;
  const MAX = 500;
  const [entry, setEntry] = useState("");
  const [week, setWeek] = useState(0);
  const [bursts, setBursts] = useState([]);
  const idRef = useRef(0);

  const save = () => {
    if (!entry.trim()) return;
    // fire the same +XP blob burst as the habit cards, over the entry box
    const id = idRef.current++;
    setBursts((b) => [...b, id]);
    window.setTimeout(() => setBursts((b) => b.filter((x) => x !== id)), 1350);
    setWeek((w) => Math.min(7, w + 1));
    setEntry("");
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_6px_24px_rgba(15,23,42,0.06)]">
      {/* Header */}
      <div className="flex items-center gap-3">
        <IconTile from="#a78bfa" to="#6d28d9">
          <BookIcon className="h-6 w-6" />
        </IconTile>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-800">Analysis Journal</h3>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-600">
              Unlocked
            </span>
          </div>
          <p className="text-xs leading-snug text-slate-500">
            Today's signal becomes tomorrow's pattern. Capture before it fades.
          </p>
        </div>
      </div>

      {/* Prompts */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Prompts to start
        </span>
        <span className="text-[11px] text-slate-400">tap to seed</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {JOURNAL_PROMPTS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => setEntry(p.label + ": ")}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition active:scale-95 ${p.cls}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Today's entry */}
      <div className="mt-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
        Today's entry
      </div>
      <div className="relative mt-2">
        {/* +XP confetti burst on save */}
        {bursts.map((id) => (
          <XpConfetti key={id} xp={XP} />
        ))}
        <textarea
          value={entry}
          onChange={(e) => setEntry(e.target.value.slice(0, MAX))}
          rows={3}
          placeholder="What is one thing you noticed about your face, breath, or posture today?"
          className="w-full resize-none rounded-2xl border border-slate-200 bg-white p-3 pb-7 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
        />
        <span className="pointer-events-none absolute bottom-2.5 right-3 text-[11px] text-slate-400">
          {entry.length} / {MAX}
        </span>
      </div>

      {/* This week */}
      <div className="mt-3 flex items-center gap-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          This week
        </span>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: 7 }).map((_, i) => (
            <span
              key={i}
              className={`h-2.5 w-2.5 rounded-full ${
                i < week ? "bg-emerald-500" : "bg-slate-200"
              }`}
            />
          ))}
        </div>
        <span className="text-sm font-bold text-indigo-600">{week} / 7</span>
        <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-600">
          +{XP} XP
        </span>
      </div>

      {/* Save */}
      <button
        type="button"
        onClick={save}
        disabled={!entry.trim()}
        className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition ${
          entry.trim()
            ? "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98]"
            : "cursor-not-allowed bg-slate-200 text-slate-400"
        }`}
      >
        Save entry →
      </button>
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

function AppleIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12 7.9C10.9 5.6 8.4 4.8 6.6 6 4.6 7.3 4.2 10.3 5.4 13c.7 1.6 1 3.1.6 4.7-.2.9.1 1.9.9 2.5.7.6 1.7.6 2.4.2.5-.3 1.1-.3 1.6 0 .7.4 1.7.4 2.4-.2.8-.6 1.1-1.6.9-2.5-.4-1.6-.1-3.1.6-4.7 1.2-2.7.8-5.7-1.2-7-1.8-1.2-4.3-.4-5.4 1.9Z" />
      <path
        d="M12 7.9c.1-1.7 1.4-3 3.1-3.3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
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
function TongueIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M6 5h12c.6 0 1 .5 1 1.1 0 1.4-.5 2.6-1.3 3.4.2.5.3 1 .3 1.6a6 6 0 0 1-12 0c0-.6.1-1.1.3-1.6C5.5 8.7 5 7.5 5 6.1 5 5.5 5.4 5 6 5Z" />
      <path
        d="M12 11.5V17"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.55"
      />
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
function BookIcon({ className = "h-6 w-6" }) {
  return (
    <svg {...S({ className })}>
      <path d="M12 7v13" />
      <path d="M3 5.5c2.5-1 5.5-1 9 1v13c-3.5-2-6.5-2-9-1z" />
      <path d="M21 5.5c-2.5-1-5.5-1-9 1v13c3.5-2 6.5-2 9-1z" />
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
