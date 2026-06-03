"use client";

import React, { useState, useRef, useCallback } from "react";

/**
 * BonusTrackerCard — The Levi System
 * -----------------------------------
 * A single, self-contained "inconsistent reinforcement" bonus card for the
 * low-ticket user dashboard. Drops into the middle of the tracker grid.
 *
 *  - Desktop: spans 2–3 normal tracker card widths (md:col-span-2 lg:col-span-3)
 *  - Mobile: full width
 *  - Four tiers: Keystone / Ultra / High / Standard
 *  - XP badge floats up + fades on completion (matches existing tracker)
 *  - Delayed tasks show a "Confirm tomorrow morning" pending state
 *  - Respects prefers-reduced-motion for every animation
 *
 * Dependencies: React + Tailwind only. No extra packages.
 *
 * Usage:
 *   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 *     <NormalTrackerCard />
 *     <BonusTrackerCard />   // sits in the middle, spans 2–3 cols
 *     <NormalTrackerCard />
 *   </div>
 */

/* ------------------------------------------------------------------ */
/*  Tier design tokens                                                 */
/* ------------------------------------------------------------------ */

const TIERS = {
  keystone: {
    label: "KEYSTONE",
    xp: 50,
    accent: "#d4a017",
    accentLight: "#f0d27a",
    // The floating XP text + drop-shadow color on completion
    float: "text-[#e9c468] drop-shadow-[0_2px_6px_rgba(212,160,23,0.6)]",
    // Black + gold, the prestige tier
    card: "bg-neutral-950 border border-[#d4a017]/60 shadow-[0_8px_30px_rgba(212,160,23,0.18)]",
    title: "text-[#f5e6c8]",
    desc: "text-[#d4a017]/70",
    // Glowing solid pill: gold bg, dark text + shimmer/pulse
    badge:
      "bg-[#d4a017] text-neutral-900 shadow-[0_0_0_3px_rgba(212,160,23,0.18),0_4px_16px_rgba(212,160,23,0.55)] lv-badge-shimmer",
    tag: "text-[#d4a017]",
    button:
      "bg-[#d4a017] text-neutral-950 hover:bg-[#e9b938] focus-visible:ring-[#d4a017]",
    shimmer: true,
  },
  ultra: {
    label: "ULTRA",
    xp: 35,
    accent: "#2a9d8f",
    accentLight: "#6fc7bc",
    float: "text-[#2a9d8f] drop-shadow-[0_2px_6px_rgba(42,157,143,0.45)]",
    card: "bg-white border border-[#2a9d8f]/25 shadow-[0_6px_24px_rgba(42,157,143,0.12)]",
    title: "text-slate-800",
    desc: "text-slate-500",
    // Glowing solid pill: teal bg, white text
    badge:
      "bg-[#2a9d8f] text-white shadow-[0_0_0_3px_rgba(42,157,143,0.15),0_4px_14px_rgba(42,157,143,0.5)]",
    tag: "text-[#2a9d8f]",
    button:
      "bg-[#2a9d8f] text-white hover:bg-[#248577] focus-visible:ring-[#2a9d8f]",
    shimmer: false,
  },
  high: {
    label: "HIGH",
    xp: 20,
    accent: "#7c6bc9",
    accentLight: "#b3a8e0",
    float: "text-[#7c6bc9] drop-shadow-[0_2px_6px_rgba(124,107,201,0.45)]",
    card: "bg-white border border-[#7c6bc9]/25 shadow-[0_6px_24px_rgba(124,107,201,0.12)]",
    title: "text-slate-800",
    desc: "text-slate-500",
    // Glowing solid pill: purple bg, white text
    badge:
      "bg-[#7c6bc9] text-white shadow-[0_0_0_3px_rgba(124,107,201,0.15),0_4px_14px_rgba(124,107,201,0.5)]",
    tag: "text-[#7c6bc9]",
    button:
      "bg-[#7c6bc9] text-white hover:bg-[#6a5ab5] focus-visible:ring-[#7c6bc9]",
    shimmer: false,
  },
  standard: {
    label: "STANDARD",
    xp: 10,
    accent: "#4caf7d",
    accentLight: "#8fd9b3",
    float: "text-[#3a8c63] drop-shadow-[0_2px_6px_rgba(76,175,125,0.5)]",
    card: "bg-white border border-[#4caf7d]/25 shadow-[0_6px_24px_rgba(76,175,125,0.12)]",
    title: "text-slate-800",
    desc: "text-slate-500",
    // Glowing solid pill: green bg, white text, soft glow
    badge:
      "bg-[#4caf7d] text-white shadow-[0_0_0_3px_rgba(76,175,125,0.15),0_4px_14px_rgba(76,175,125,0.5)]",
    tag: "text-[#4caf7d]",
    button:
      "bg-[#4caf7d] text-white hover:bg-[#3f9a6c] focus-visible:ring-[#4caf7d]",
    shimmer: false,
  },
};

/* ------------------------------------------------------------------ */
/*  Demo tasks (toggleable preview state)                              */
/* ------------------------------------------------------------------ */

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
    // Bonus: showcases the delayed "Confirm tomorrow morning" pending state.
    tier: "ultra",
    name: "Bedroom Device Ban",
    description:
      "Keep your mobile device outside the bedroom for the entire night tonight.",
    delayed: true,
  },
];

/* ------------------------------------------------------------------ */
/*  Inline keyframes (self-contained, no tailwind.config changes)      */
/*  All motion is disabled under prefers-reduced-motion.               */
/* ------------------------------------------------------------------ */

const STYLE = `
/* "+XP" TEXT (1.4s): quick springy pop, then a long, clear float upward
   (~110px) while fading — like the live tracker's reward pop. */
@keyframes lv-xp-burst {
  0%   { transform: translateY(8px)    scale(0);    opacity: 0; }
  10%  { transform: translateY(0)      scale(1.3);  opacity: 1; }
  18%  { transform: translateY(-4px)   scale(0.96); opacity: 1; }
  26%  { transform: translateY(-10px)  scale(1);    opacity: 1; }
  70%  { transform: translateY(-72px)  scale(1);    opacity: 1; }
  100% { transform: translateY(-112px) scale(1.05); opacity: 0; }
}
/* Confetti dash: erupts outward + upward from the click point, spins, drifts
   further up, then fades. Carries its own --tx/--ty + --rot (spin). */
@keyframes lv-confetti {
  0%   { transform: translate(0, 0) rotate(0deg) scale(0.6); opacity: 0; }
  10%  { transform: translate(calc(var(--tx) * 0.35), calc(var(--ty) * 0.35)) rotate(calc(var(--rot) * 0.3)) scale(1); opacity: 1; }
  70%  { opacity: 1; }
  100% { transform: translate(var(--tx), calc(var(--ty) - 24px)) rotate(var(--rot)) scale(0.7); opacity: 0; }
}
/* Card gives a quick satisfying scale-bounce on completion */
@keyframes lv-card-bounce {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.03); }
  100% { transform: scale(1); }
}
/* Card-edge shimmer (Keystone prestige) */
@keyframes lv-shimmer {
  0%   { background-position: -150% 0; }
  100% { background-position: 250% 0; }
}
/* Completion check + text "pop in" */
@keyframes lv-pop {
  0%   { transform: scale(0.4); opacity: 0; }
  60%  { transform: scale(1.18); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
/* Badge pulses once when the bonus is banked */
@keyframes lv-badge-pop {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.28); }
  100% { transform: scale(1); }
}
/* Keystone badge: gentle continuous glow pulse */
@keyframes lv-badge-shimmer {
  0%, 100% { box-shadow: 0 0 0 3px rgba(212,160,23,0.18), 0 4px 16px rgba(212,160,23,0.45); }
  50%      { box-shadow: 0 0 0 4px rgba(212,160,23,0.30), 0 6px 22px rgba(212,160,23,0.75); }
}
/* Completion glow ring behind the checkmark */
@keyframes lv-glow {
  0%   { box-shadow: 0 0 0 0 rgba(16,185,129,0.55); }
  100% { box-shadow: 0 0 0 10px rgba(16,185,129,0); }
}
/* Soft dark text-shadow so white text reads on the colored token */
.lv-xp-num { text-shadow: 0 1px 3px rgba(0,0,0,0.35); }
.lv-burst {
  animation: lv-xp-burst 1400ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
.lv-confetti      { animation: lv-confetti 1000ms cubic-bezier(0.18, 0.7, 0.3, 1) forwards; }
.lv-card-bounce   { animation: lv-card-bounce 440ms cubic-bezier(0.34, 1.56, 0.64, 1); }
.lv-pop           { animation: lv-pop 380ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
.lv-badge-pop     { animation: lv-badge-pop 520ms cubic-bezier(0.34, 1.56, 0.64, 1); }
.lv-badge-shimmer { animation: lv-badge-shimmer 2.4s ease-in-out infinite; }
.lv-glow          { animation: lv-glow 900ms ease-out 1; }
.lv-shimmer::before {
  content: "";
  position: absolute; inset: 0;
  border-radius: inherit;
  background: linear-gradient(115deg, transparent 30%, rgba(233,196,104,0.28) 50%, transparent 70%);
  background-size: 200% 100%;
  animation: lv-shimmer 3.2s linear infinite;
  pointer-events: none;
}
/* Reduced motion: NO movement, but the reward is still SHOWN — the blob
   simply fades in and out in place (no scale, no float, no specks/flash). */
@keyframes lv-burst-rm {
  0%   { opacity: 0; }
  18%  { opacity: 1; }
  72%  { opacity: 1; }
  100% { opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .lv-burst        { animation: lv-burst-rm 1300ms ease-out forwards; }
  .lv-confetti     { display: none; }
  .lv-card-bounce, .lv-badge-pop, .lv-badge-shimmer, .lv-glow { animation: none; }
  .lv-pop          { animation: none; opacity: 1; transform: none; }
  .lv-shimmer::before { animation: none; background: none; }
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
  const [bursts, setBursts] = useState([]); // ephemeral XP bursts {id, x, y, particles}
  const burstId = useRef(0);
  const cardRef = useRef(null);
  const buttonRef = useRef(null);

  const isDark = task.tier === "keystone";

  // Spawn a burst at (x, y) relative to the card: bold "+XP" text that pops &
  // drifts up, plus a shower of thin confetti dashes that erupt outward. Then
  // it unmounts after the animation. Matches the live tracker's reward pop.
  const spawnToken = useCallback(
    (x, y) => {
      const id = burstId.current++;
      // Confetti palette: tier color, a lighter tint, and white flecks.
      const palette = [tier.accent, tier.accentLight, tier.accent, "#ffffff"];
      // 30 dashes shooting outward, biased strongly upward, randomized.
      const confetti = Array.from({ length: 30 }, (_, i) => {
        const angle = (i / 30) * Math.PI * 2 + Math.random() * 0.5;
        const dist = 60 + Math.random() * 95;
        return {
          tx: Math.cos(angle) * dist,
          // bias the whole spray upward so the confetti reads as "coming up"
          ty: Math.sin(angle) * dist - (40 + Math.random() * 45),
          rot: `${Math.random() * 540 - 270}deg`,
          w: 4 + Math.random() * 3,
          h: 9 + Math.random() * 8,
          color: palette[i % palette.length],
          delay: Math.random() * 60,
        };
      });
      setBursts((b) => [...b, { id, x, y, confetti }]);
      window.setTimeout(() => {
        setBursts((b) => b.filter((p) => p.id !== id));
      }, 1450);
    },
    [tier.accent, tier.accentLight]
  );

  const handleComplete = () => {
    if (status !== "idle") return;
    if (task.delayed) {
      // Delayed tasks can't award XP yet — they enter a pending state and the
      // tick becomes available the next morning (or after the gated window).
      setStatus("pending");
      return;
    }

    // Burst origin: the "Complete bonus" button — the "+XP" and confetti erupt
    // from the top of the button and float up. Captured before the button
    // unmounts. Falls back to the card's lower-center.
    const rect = cardRef.current?.getBoundingClientRect();
    const btn = buttonRef.current?.getBoundingClientRect();
    let x = rect ? rect.width / 2 : 0;
    let y = rect ? rect.height - 56 : 0;
    if (rect && btn) {
      x = btn.left + btn.width / 2 - rect.left;
      y = btn.top - rect.top; // emerge from the top edge of the button
    }

    spawnToken(x, y);
    setStatus("done"); // card scale-bounces + transitions to its complete state
  };

  const cycleDemo = () => {
    setDemoIndex((i) => (i + 1) % DEMO_TASKS.length);
    setStatus("idle");
    setBursts([]);
  };

  const nextLabel = DEMO_TASKS[(demoIndex + 1) % DEMO_TASKS.length].tier;

  return (
    <section
      aria-label="Bonus task"
      className="col-span-1 md:col-span-2 lg:col-span-3 w-full"
    >
      <style>{STYLE}</style>

      <div
        ref={cardRef}
        className={[
          "relative rounded-3xl p-5 sm:p-6",
          tier.card,
          tier.shimmer && status !== "done" ? "lv-shimmer overflow-hidden" : "",
          status === "done" ? "lv-card-bounce" : "",
        ].join(" ")}
      >
        {/* Ephemeral reward burst at the click point: confetti dashes erupt
            outward while bold "+XP" text pops, holds, drifts up, then unmounts.
            Matches the live tracker's habit-complete reward pop. */}
        {bursts.map((burst) => (
          <div
            key={burst.id}
            aria-hidden="true"
            className="pointer-events-none absolute z-40"
            style={{ left: burst.x, top: burst.y }}
          >
            {/* confetti dashes — erupt from the anchor, spin, scatter, fade */}
            {burst.confetti.map((c, i) => (
              <span
                key={i}
                className="lv-confetti absolute block"
                style={{
                  left: 0,
                  top: 0,
                  width: c.w,
                  height: c.h,
                  backgroundColor: c.color,
                  borderRadius: "1px",
                  animationDelay: `${c.delay}ms`,
                  "--tx": `${c.tx}px`,
                  "--ty": `${c.ty}px`,
                  "--rot": c.rot,
                }}
              />
            ))}

            {/* bold "+XP" text — no pill, just colored type, centered on anchor */}
            <div className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2">
              <div className="lv-burst">
                <span
                  className="lv-xp-num block whitespace-nowrap text-2xl font-extrabold leading-none"
                  style={{ color: isDark ? tier.accentLight : tier.accent }}
                >
                  +{tier.xp} XP
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Header row: tier tag + XP badge ---------------------------- */}
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="flex flex-col gap-2">
            <span
              className={[
                "text-[11px] font-bold uppercase tracking-[0.18em]",
                tier.tag,
              ].join(" ")}
            >
              {tier.label} BONUS
            </span>
          </div>

          {/* Glowing XP badge pill — pulses once on completion */}
          <span
            className={[
              "inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold tracking-wide whitespace-nowrap",
              tier.badge,
              status === "done" ? "lv-badge-pop" : "",
            ].join(" ")}
          >
            +{tier.xp} XP
          </span>
        </div>

        {/* Body: task name + description ----------------------------- */}
        <div className="relative z-10 mt-3">
          <h3 className={["text-lg font-bold leading-snug", tier.title].join(" ")}>
            {task.name}
          </h3>
          <p className={["mt-1 text-sm leading-relaxed", tier.desc].join(" ")}>
            {task.description}
          </p>
        </div>

        {/* Footer: action / state ----------------------------------- */}
        <div className="relative z-10 mt-5 flex items-center gap-3">
          {status === "idle" && (
            <button
              ref={buttonRef}
              type="button"
              onClick={handleComplete}
              className={[
                "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold",
                "transition-transform active:scale-[0.97] focus:outline-none",
                "focus-visible:ring-2 focus-visible:ring-offset-2",
                isDark
                  ? "focus-visible:ring-offset-neutral-950"
                  : "focus-visible:ring-offset-white",
                tier.button,
              ].join(" ")}
            >
              <CheckIcon className="h-4 w-4" />
              {task.delayed ? "Mark for tomorrow" : "Complete bonus"}
            </button>
          )}

          {status === "pending" && (
            <div
              className={[
                "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium",
                isDark
                  ? "bg-white/5 text-[#e9c468]"
                  : "bg-amber-50 text-amber-700 border border-amber-200/70",
              ].join(" ")}
              role="status"
            >
              <ClockIcon className="h-4 w-4 shrink-0" />
              Confirm tomorrow morning
            </div>
          )}

          {status === "done" && (
            <div
              className={[
                "flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-bold lv-pop",
                isDark
                  ? "bg-[#d4a017]/15 text-[#e9c468] ring-1 ring-[#d4a017]/40"
                  : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
              ].join(" ")}
              role="status"
            >
              <span
                className={[
                  "lv-glow flex h-6 w-6 items-center justify-center rounded-full",
                  isDark ? "bg-[#d4a017] text-neutral-950" : "bg-emerald-500 text-white",
                ].join(" ")}
              >
                <CheckIcon className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
              <span>Bonus complete</span>
            </div>
          )}
        </div>
      </div>

      {/* ----- Demo-only controls (remove in production) ------------- */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={cycleDemo}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:bg-white"
        >
          <SwapIcon className="h-3.5 w-3.5" />
          Demo: switch tier → <span className="capitalize">{nextLabel}</span>
        </button>
        {status !== "idle" && (
          <button
            type="button"
            onClick={() => {
              setStatus("idle");
              setBursts([]);
            }}
            className="rounded-lg border border-slate-300 bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-500 shadow-sm transition-colors hover:bg-white"
          >
            Reset
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

function SwapIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 7h11l-3-3M17 17H6l3 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
