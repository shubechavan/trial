/**
 * bonusEngine.js — The Levi System bonus selection engine.
 *
 * Implements the handoff spec's *logic* (not just the card UI):
 *   - Task pools: 1 Keystone, 10 Ultra, 11 High, 30 Standard
 *   - Monthly cadence: M1 = Keystone(day 10) + 1 High + 5 Standard;
 *                      M2+ = 1 Ultra + 1 High + 5 Standard  (7 bonus days, one/day)
 *   - Controlled randomness seeded per user + month; month split into 7 windows,
 *     one date picked per window, adjacent days avoided
 *   - Cooldowns: Keystone once (M1 day 10); Ultra no-repeat 8 months;
 *                High no-repeat 6 months; Standard draws without replacement
 *                until the 30-task bag is exhausted, then reshuffles
 *   - Delayed completion: certain tasks unlock their tick later (next morning,
 *     after midday tomorrow, etc.)
 *
 * Pure + deterministic: getMonthBonuses(userId, monthIndex) always returns the
 * same schedule for the same inputs. monthIndex is 0-based since the user joined
 * (0 = their first month).
 */

/* ----------------------------- seeded RNG ----------------------------- */

function hashStr(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rngFor = (seed) => mulberry32(hashStr(seed));

function shuffle(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ------------------------------- pools -------------------------------- */
/* delayed tasks carry `delayed: true` + a `confirm` message (see spec p.4) */

export const TIER_XP = { keystone: 50, ultra: 35, high: 20, standard: 10 };

export const POOLS = {
  keystone: [
    {
      name: "Delete Short-Form App",
      description:
        "Delete one short-form media app of your choosing today, forever.",
    },
  ],
  ultra: [
    { name: "Screen Time Cap", description: "Keep total screen time under 1 hour today." },
    {
      name: "Bedroom Device Ban",
      description:
        "Keep your mobile device outside the bedroom for the entire night tonight.",
      delayed: true,
      confirm: "Confirm tomorrow morning",
    },
    {
      name: "No Entertainment Screen Day",
      description: "Use screens only for work, school, admin, or communication today.",
    },
    {
      name: "Full Notification Blackout",
      description: "Turn off all non-essential notifications for the next 24 hours.",
    },
    {
      name: "No Phone Until Midday",
      description: "Use no phone until midday tomorrow.",
      delayed: true,
      confirm: "Confirm after midday tomorrow",
    },
    {
      name: "Three-Hour Evening Lockout",
      description: "Complete the final 3 hours before sleep with no phone use.",
    },
    {
      name: "No Passive Consumption",
      description:
        "Spend zero minutes on passive entertainment today: scrolling, video feeds, gaming, streaming, or browsing.",
    },
    {
      name: "Two-Hour Focus Point",
      description: "Complete two uninterrupted hours on one focus point today.",
    },
    { name: "No Added Sugar Day", description: "Consume 0g added sugar today." },
    {
      name: "Consumption Discipline",
      description:
        "Complete the full day with no snacks, no liquid calories, and no food after your final planned meal.",
    },
  ],
  high: [
    { name: "Low Pickup Day", description: "Keep total phone pickups under 15 today." },
    {
      name: "Morning Phone Lockout",
      description: "Spend the first 90 minutes after waking up tomorrow with no phone use.",
      delayed: true,
      confirm: "Confirm after your first 90 minutes tomorrow",
    },
    {
      name: "Zero Entertainment Media",
      description: "Spend zero minutes on any entertainment based media today.",
    },
    { name: "Four-Hour Intake Window", description: "Consume all food within a 4-hour window today." },
    {
      name: "Deep Work Before Entertainment",
      description: "Complete 90 minutes of uninterrupted work before any entertainment.",
    },
    {
      name: "No Phone In Bathroom",
      description: "Do not take your phone into the bathroom at any point today.",
    },
    { name: "Message Batching Day", description: "Check messages only 3 times today." },
    {
      name: "Single-Tab Work Block",
      description:
        "Complete one 60-minute work or study block with only one tab or app open. Do not multitask with entertainment such as music.",
    },
    {
      name: "No Algorithm Before Work",
      description: "Use zero algorithmic feeds before your first work or study block is complete.",
    },
    {
      name: "Two-Hour Phone Distance",
      description: "Keep your phone physically out of reach for one continuous 2-hour block.",
    },
    {
      name: "No Snooze Tomorrow",
      description: "Wake up tomorrow without using snooze.",
      delayed: true,
      confirm: "Confirm after waking tomorrow",
    },
  ],
  standard: [
    { name: "Water-Only Day", description: "Drink only water today. No other beverages." },
    { name: "Early Food Cutoff", description: "Finish all food at least 4 hours before sleep." },
    {
      name: "No Unplanned Snacks",
      description: "Consume zero snacks outside planned meals today. Increase meal volume if necessary.",
    },
    { name: "Sedentary Ceiling", description: "Do not sit for longer than 20 minutes at a time while awake." },
    { name: "Post-Meal Walks", description: "Complete a 10-minute walk after your meals today." },
    { name: "Thirty-Minute Outdoor Block", description: "Spend 30 continuous minutes outdoors today." },
    { name: "Zero Caffeine Day", description: "Consume zero caffeine today. Great if you do not drink coffee." },
    {
      name: "Environment Reset",
      description: "Spend 15 minutes resetting your environment. Clean your desk, bedroom, kitchen, car, or workspace.",
    },
    { name: "Phone Across The Room", description: "Keep your phone across the room during one work or study block today." },
    { name: "Meal Focus Discipline", description: "While eating food, focus entirely on the food and do not multitask." },
    { name: "Thirty-Minute Reading Block", description: "Read a physical book for 30 minutes today." },
    { name: "Unstimulated Walk", description: "Complete a 10-minute walk without external stimulation such as music today." },
    { name: "Gratitude Journal", description: "Write today's top three things you are grateful for before sleep." },
    { name: "Screen Time Awareness", description: "Check your screen time once today to be conscious of your usage." },
    {
      name: "Nine-Hour Sleep",
      description: "Tonight, sleep at least 9 hours continuously.",
      delayed: true,
      confirm: "Confirm tomorrow morning",
    },
    { name: "Home Food Day", description: "Eat only food prepared at home today." },
    { name: "No Fried Food", description: "Consume zero fried food today." },
    { name: "Tomorrow's Game Plan", description: "Spend 10 minutes writing tomorrow's game plan before sleeping." },
    { name: "Body Flexibility Block", description: "Complete 10 minutes of body stretching today." },
    { name: "Plan Tomorrow's Meals", description: "Plan tomorrow's meals before going to sleep tonight." },
    { name: "No Eating While Standing", description: "Eat all food today seated at a table or fixed eating place." },
    { name: "Whole Food Meal", description: "Eat one full meal today made from single-ingredient foods." },
    { name: "No Food Delivery", description: "Make sure to order zero food delivery today." },
    { name: "Focused Nasal Breathing", description: "Complete 10 minutes of focused slow nasal breathing today." },
    { name: "Calendar Lock", description: "Put tomorrow's three main obligations into your calendar before sleep." },
    { name: "Morning Light", description: "Get outside for 15 minutes within 60 minutes of waking." },
    { name: "Stair Choice", description: "Take the longer set of stairs rather than a lift or escalator at least once today." },
    { name: "Floor Mobility", description: "Spend 5 minutes on the floor stretching or opening your hips, back, shoulders, or ankles." },
    { name: "No Rushed Meal", description: "Make one meal last at least 15 minutes today." },
    { name: "Chewing Target", description: "Chew at least 33 times during your meal today." },
  ],
};

/* ---------------------- bonus-day selection (windows) ----------------- */

// 7 windows across the month; one date per window, avoiding adjacent days.
function bonusDays(userId, monthIndex, daysInMonth = 30) {
  const rng = rngFor(`${userId}|days|${monthIndex}`);
  const days = [];
  const size = daysInMonth / 7;
  for (let w = 0; w < 7; w++) {
    const lo = Math.floor(w * size) + 1;
    const hi = Math.max(lo, Math.min(daysInMonth, Math.floor((w + 1) * size)));
    let day;
    let tries = 0;
    do {
      day = lo + Math.floor(rng() * (hi - lo + 1));
      tries++;
    } while (days.length && Math.abs(day - days[days.length - 1]) <= 1 && tries < 10);
    days.push(day);
  }
  return days;
}

// Assign a tier to each of the 7 bonus days per the monthly cadence.
function tierLayout(userId, monthIndex, days) {
  const rng = rngFor(`${userId}|tiers|${monthIndex}`);
  const slots = days.map((d) => ({ day: d, tier: "standard" }));

  if (monthIndex === 0) {
    // Keystone is fixed on day 10; snap the nearest window slot to it.
    let ki = 0;
    let best = Infinity;
    slots.forEach((s, i) => {
      const dist = Math.abs(s.day - 10);
      if (dist < best) {
        best = dist;
        ki = i;
      }
    });
    slots[ki] = { day: 10, tier: "keystone" };
    const rest = slots.map((_, i) => i).filter((i) => i !== ki);
    const hi = rest[Math.floor(rng() * rest.length)];
    slots[hi].tier = "high"; // 1 High; the remaining 5 stay Standard
  } else {
    const order = shuffle(
      slots.map((_, i) => i),
      rng
    );
    slots[order[0]].tier = "ultra"; // 1 Ultra
    slots[order[1]].tier = "high"; // 1 High; remaining 5 Standard
  }

  return slots.sort((a, b) => a.day - b.day);
}

/* --------------- task picking with cooldowns (forward sim) ------------ */

// Simulate months 0..targetMonth so cooldowns/bag carry forward correctly,
// then return the target month's [{ day, tier, task }] schedule.
function simulate(userId, targetMonth) {
  let stdBag = [];
  let bagRefills = 0;
  const ultraLast = {}; // task name -> last month used
  const highLast = {};
  let out = [];

  for (let m = 0; m <= targetMonth; m++) {
    const layout = tierLayout(userId, m, bonusDays(userId, m));
    const rng = rngFor(`${userId}|pick|${m}`);

    const monthSchedule = layout.map((slot) => {
      let task;
      if (slot.tier === "keystone") {
        task = POOLS.keystone[0];
      } else if (slot.tier === "standard") {
        // draw without replacement; reshuffle a fresh bag when exhausted
        if (stdBag.length === 0) {
          stdBag = shuffle(POOLS.standard, rngFor(`${userId}|stdbag|${bagRefills++}`));
        }
        task = stdBag.shift();
      } else if (slot.tier === "ultra") {
        const eligible = POOLS.ultra.filter(
          (t) => !(t.name in ultraLast) || m - ultraLast[t.name] >= 8
        );
        const pool = eligible.length ? eligible : POOLS.ultra;
        task = pool[Math.floor(rng() * pool.length)];
        ultraLast[task.name] = m;
      } else {
        const eligible = POOLS.high.filter(
          (t) => !(t.name in highLast) || m - highLast[t.name] >= 6
        );
        const pool = eligible.length ? eligible : POOLS.high;
        task = pool[Math.floor(rng() * pool.length)];
        highLast[task.name] = m;
      }
      return { day: slot.day, tier: slot.tier, xp: TIER_XP[slot.tier], task };
    });

    if (m === targetMonth) out = monthSchedule;
  }
  return out;
}

/* ------------------------------- public API --------------------------- */

/** All 7 bonus days for a user's given month (0-based). */
export function getMonthBonuses(userId, monthIndex) {
  return simulate(userId, Math.max(0, monthIndex));
}

/** The bonus for a specific day-of-month, or null if it isn't a bonus day. */
export function getBonusForDay(userId, monthIndex, day) {
  return getMonthBonuses(userId, monthIndex).find((b) => b.day === day) || null;
}
