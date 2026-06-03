"use client";

import React, { useState, useRef, useCallback } from "react";

/**
 * BonusTrackerCard — The Levi System
 * -----------------------------------
 * Bonus "inconsistent reinforcement" card for the low-ticket dashboard, styled
 * to match the live tracker: white card, soft rounded corners, subtle shadow,
 * tier-colored XP pill + full-width complete button.
 *
 *  - Four tiers: Keystone (gold) / Ultra (teal) / High (purple) / Standard (green)
 *  - On completion: a green/tier blob splat bursts from the card center with
 *    bold white "+XP" inside, pops (0 → 1.3 → 1), holds, floats up, fades.
 *  - Card does a quick scale(1.03) bounce, then settles into a muted checkmark
 *    state (no "XP banked" text).
 *  - Delayed tasks show a "Confirm tomorrow morning" pending state.
 *  - Respects prefers-reduced-motion.
 *  - Demo tier toggle lives subtly at the very bottom (testing only).
 *
 * Dependencies: React + Tailwind only. No extra packages.
 */

/* ------------------------------------------------------------------ */
/*  Tier tokens — white card everywhere, accent drives pill/button/blob */
/* ------------------------------------------------------------------ */

const TIERS = {
  keystone: { label: "KEYSTONE", xp: 50, accent: "#d4a017", accentLight: "#f0d27a" }, // gold
  ultra: { label: "ULTRA", xp: 35, accent: "#2a9d8f", accentLight: "#6fc7bc" }, // teal
  high: { label: "HIGH", xp: 20, accent: "#7c6bc9", accentLight: "#b3a8e0" }, // purple
  standard: { label: "STANDARD", xp: 10, accent: "#4caf7d", accentLight: "#8fd9b3" }, // green
};

/* Demo tasks (toggleable preview state) */
const DEMO_TASKS = [
  {
    tier: "standard",
    name: "Water-Only Day",
    description: "Drink only water today. No other beverages.",
    delayed: false,
  },
  {
    tier: "keystone",
    name: "Delete Short-Form App",
    description:
      "Delete one short-form media app of your choosing today, forever.",
    delayed: false,
  },
  {
    // Showcases the delayed "Confirm tomorrow morning" pending state.
    tier: "ultra",
    name: "Bedroom Device Ban",
    description:
      "Keep your mobile device outside the bedroom for the entire night tonight.",
    delayed: true,
  },
];

/* ------------------------------------------------------------------ */
/*  Animations (self-contained; disabled under prefers-reduced-motion) */
/* ------------------------------------------------------------------ */

const STYLE = `
/* Blob splat (≈1.3s): pop 0→1.3→1 (~0.3s), hold ~0.5s, float up -80px + fade.
   translate(-50%,-50%) keeps it centered on the card while it scales. */
@keyframes lv-blob {
  0%   { transform: translate(-50%, -50%) scale(0);   opacity: 0; }
  18%  { transform: translate(-50%, -50%) scale(1.3); opacity: 1; }
  30%  { transform: translate(-50%, -50%) scale(1);   opacity: 1; }
  62%  { transform: translate(-50%, -50%) scale(1);   opacity: 1; }
  100% { transform: translate(-50%, calc(-50% - 80px)) scale(1); opacity: 0; }
}
/* Quick satisfying card bounce on completion */
@keyframes lv-card-bounce {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.03); }
  100% { transform: scale(1); }
}
.lv-blob        { animation: lv-blob 1300ms cubic-bezier(0.22, 1, 0.36, 1) forwards; }
.lv-card-bounce { animation: lv-card-bounce 440ms cubic-bezier(0.34, 1.56, 0.64, 1); }
.lv-xp-num      { text-shadow: 0 1px 3px rgba(0,0,0,0.28); }

/* Reduced motion: no scale/float/bounce — the blob simply fades in + out. */
@keyframes lv-blob-rm {
  0% { opacity: 0; } 20% { opacity: 1; } 75% { opacity: 1; } 100% { opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .lv-blob        { animation: lv-blob-rm 1200ms ease-out forwards; transform: translate(-50%, -50%); }
  .lv-card-bounce { animation: none; }
}
`;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function BonusTrackerCard() {
  const [demoIndex, setDemoIndex] = useState(0);
  const task = DEMO_TASKS[demoIndex];
  const tier = TIERS[task.tier];

  // status: "idle" | "pending" | "done"
  const [status, setStatus] = useState("idle");
  const [bursts, setBursts] = useState([]); // ephemeral blob splats {id}
  const burstId = useRef(0);

  // Fire a center blob splat, then unmount it after the ~1.3s animation.
  const fireBlob = useCallback(() => {
    const id = burstId.current++;
    setBursts((b) => [...b, { id }]);
    window.setTimeout(() => {
      setBursts((b) => b.filter((p) => p.id !== id));
    }, 1350);
  }, []);

  const handleComplete = () => {
    if (status !== "idle") return;
    if (task.delayed) {
      // Delayed tasks can't award XP yet — tick becomes available tomorrow.
      setStatus("pending");
      return;
    }
    fireBlob();
    setStatus("done");
  };

  const cycleDemo = () => {
    setDemoIndex((i) => (i + 1) % DEMO_TASKS.length);
    setStatus("idle");
    setBursts([]);
  };
  const resetDemo = () => {
    setStatus("idle");
    setBursts([]);
  };

  const nextLabel = TIERS[DEMO_TASKS[(demoIndex + 1) % DEMO_TASKS.length].tier]
    .label;
  const muted = status === "done";

  return (
    <section
      aria-label="Bonus task"
      className="col-span-1 w-full md:col-span-2 lg:col-span-3"
    >
      <style>{STYLE}</style>

      {/* CARD */}
      <div
        className={[
          "relative rounded-3xl border border-slate-200/80 p-5 shadow-[0_6px_24px_rgba(15,23,42,0.06)] sm:p-6",
          status === "done" ? "lv-card-bounce" : "",
        ].join(" ")}
        style={{
          // soft tier-tinted card background, matching the pastel habit cards
          background: `linear-gradient(135deg, #ffffff 55%, ${tier.accent}12 100%)`,
        }}
      >
        {/* Blob splat — centered, full opacity (sits above the muted content) */}
        {bursts.map((b) => (
          <span
            key={b.id}
            aria-hidden="true"
            className="lv-blob lv-xp-num pointer-events-none absolute left-1/2 top-1/2 z-30 flex items-center justify-center whitespace-nowrap px-6 py-4 text-xl font-extrabold leading-none text-white shadow-lg"
            style={{
              backgroundColor: tier.accent,
              borderRadius: "60% 40% 55% 45% / 45% 55% 40% 60%",
            }}
          >
            +{tier.xp} XP
          </span>
        ))}

        {/* CONTENT (mutes on completion; blob stays vivid above it) */}
        <div
          className={[
            "relative z-10 transition-all duration-500",
            muted ? "opacity-70 saturate-[0.85]" : "",
          ].join(" ")}
        >
          {/* Header: gradient icon tile + tier label/name, XP pill top-right */}
          <div className="flex items-start gap-3.5">
            {/* Gradient icon tile, matching the habit-card icons */}
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-[0_6px_14px_-3px_rgba(0,0,0,0.25),inset_0_1px_2px_rgba(255,255,255,0.5)]"
              style={{
                background: `linear-gradient(160deg, ${tier.accentLight} 0%, ${tier.accent} 100%)`,
              }}
            >
              <SparklesIcon className="h-6 w-6" />
            </div>

            <div className="min-w-0 flex-1">
              <span
                className="text-[11px] font-bold uppercase tracking-[0.15em]"
                style={{ color: tier.accent }}
              >
                {tier.label} BONUS
              </span>
              <h3 className="mt-0.5 text-lg font-bold leading-snug text-slate-800">
                {task.name}
              </h3>
            </div>

            <span
              className="inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-bold text-white shadow-sm"
              style={{ backgroundColor: tier.accent }}
            >
              +{tier.xp} XP
            </span>
          </div>

          {/* Description */}
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            {task.description}
          </p>

          {/* Footer: full-width action / state */}
          {status === "idle" && (
            <button
              type="button"
              onClick={handleComplete}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{ backgroundColor: tier.accent }}
            >
              <CheckIcon className="h-4 w-4" />
              {task.delayed ? "Mark for tomorrow" : "Complete bonus"}
            </button>
          )}

          {status === "pending" && (
            <div
              role="status"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 py-3 text-sm font-medium text-amber-700"
            >
              <ClockIcon className="h-4 w-4 shrink-0" />
              Confirm tomorrow morning
            </div>
          )}

          {status === "done" && (
            <div
              role="status"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 py-3 text-sm font-semibold text-emerald-700"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
                <CheckIcon className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
              Completed
            </div>
          )}
        </div>
      </div>

      {/* Demo tier toggle — subtle, testing only */}
      <div className="mt-2 flex items-center justify-center gap-3 opacity-30 transition-opacity hover:opacity-100">
        <button
          type="button"
          onClick={cycleDemo}
          className="text-[11px] text-slate-400 underline underline-offset-2"
        >
          demo · switch to {nextLabel.toLowerCase()}
        </button>
        {status !== "idle" && (
          <button
            type="button"
            onClick={resetDemo}
            className="text-[11px] text-slate-400 underline underline-offset-2"
          >
            reset
          </button>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Inline icons (no icon library dependency)                          */
/* ------------------------------------------------------------------ */

function CheckIcon({ className = "", strokeWidth = 2.5 }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SparklesIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3l1.8 4.9L18.7 9.7 13.8 11.5 12 16.4 10.2 11.5 5.3 9.7 10.2 7.9 12 3z"
        fill="currentColor"
      />
      <path d="M18.5 14.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z" fill="currentColor" opacity="0.85" />
    </svg>
  );
}

function ClockIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 7v5l3 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
