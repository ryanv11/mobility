/* Builds a session: picks stretches for the chosen areas, orders them so you only get down
   to the floor once, and sizes every hold so the whole thing (transitions included) lasts
   exactly the chosen number of minutes. */
(function (root) {
  'use strict';
  const M = (root.Mobility = root.Mobility || {});

  const BASE_HOLD = { 5: 30, 10: 40, 15: 45, 30: 60 }; // seconds per side, before stretching to fit
  const SWITCH = 5; // seconds to change sides
  const MIN_HOLD = 20;
  const CAP = { static: 120, dynamic: 75 };
  const ORDER = { standing: 0, chair: 1, kneeling: 2, seated: 3, lying: 4 };
  const OFF_FLOOR = ['standing', 'chair'];
  const FACE = { prone: 0, side: 1, supine: 2 };

  const sides = (ex) => (ex.sides ? 2 : 1);

  function baseHold(ex, minutes) {
    const b = BASE_HOLD[minutes] || 45;
    return ex.kind === 'dynamic' ? Math.min(b, 45) : b;
  }

  function score(ex, areas) {
    let s = 0;
    for (const a of ex.areas) if (areas.includes(a)) s += 3;
    for (const a of ex.also) if (areas.includes(a)) s += 1;
    return s;
  }

  function cost(ex, hold, transition) {
    return transition + hold * sides(ex) + (ex.sides ? SWITCH : 0);
  }

  function weightedPick(list, weight, rand) {
    const total = list.reduce((s, x) => s + weight(x), 0);
    let r = rand() * total;
    for (const x of list) {
      r -= weight(x);
      if (r <= 0) return x;
    }
    return list[list.length - 1];
  }

  function eligible(opts) {
    return M.EXERCISES.filter((ex) => (!opts.standingOnly || OFF_FLOOR.includes(ex.position)) && !(opts.hidden || []).includes(ex.id));
  }

  // Where to look when the chosen areas run out of stretches.
  const NEIGHBOURS = {
    neck: ['shoulders', 'upperBack'],
    shoulders: ['neck', 'chest', 'upperBack'],
    chest: ['shoulders', 'upperBack'],
    upperBack: ['shoulders', 'chest', 'neck', 'lowerBack'],
    lowerBack: ['upperBack', 'glutes', 'hamstrings', 'hipFlexors'],
    hipFlexors: ['quads', 'glutes', 'lowerBack'],
    glutes: ['hipFlexors', 'lowerBack', 'innerThighs', 'hamstrings'],
    innerThighs: ['glutes', 'hamstrings', 'hipFlexors'],
    hamstrings: ['calves', 'lowerBack', 'glutes'],
    quads: ['hipFlexors', 'calves'],
    calves: ['hamstrings', 'quads'],
    wrists: ['shoulders', 'neck', 'chest'],
  };

  /* opts: areas, minutes, transition, standingOnly, recent (ids from last session),
           areaLastDone ({area: timestamp}), rand */
  function plan(opts) {
    const rand = opts.rand || Math.random;
    const T = opts.minutes * 60;
    const tr = opts.transition;
    const areas = opts.areas.length ? opts.areas.slice() : M.AREAS.map((a) => a.id);
    const recent = new Set(opts.recent || []);
    const last = opts.areaLastDone || {};
    const st = { chosen: [], used: new Set(), total: 0 };
    const baseCost = (ex) => cost(ex, baseHold(ex, opts.minutes), tr);
    // Most a stretch can comfortably take before we'd rather add another one.
    const roomy = () => st.chosen.reduce((s, ex) => s + cost(ex, Math.min(CAP[ex.kind], baseHold(ex, opts.minutes) * 1.5), tr), 0);

    // Round-robin over `targets`, least-covered first, adding stretches while `more()` holds.
    function pick(targets, more) {
      const pool = eligible(opts).filter((ex) => score(ex, targets) > 0);
      // Areas you haven't worked lately come first.
      const queue = targets
        .map((a) => ({ a, t: (last[a] || 0) + rand() * 1000 }))
        .sort((x, y) => x.t - y.t)
        .map((x) => x.a);
      const covered = Object.fromEntries(targets.map((a) => [a, 0]));
      for (const ex of st.chosen) for (const a of ex.areas) if (a in covered) covered[a] += 1;
      let misses = 0;
      while (misses < targets.length && more()) {
        const area = queue.slice().sort((x, y) => covered[x] - covered[y] || queue.indexOf(x) - queue.indexOf(y))[0];
        const fits = (ex) => !st.used.has(ex.id) && st.total + baseCost(ex) <= T;
        let candidates = pool.filter((ex) => fits(ex) && ex.areas.includes(area));
        if (!candidates.length) candidates = pool.filter((ex) => fits(ex) && ex.also.includes(area));
        if (!candidates.length) {
          covered[area] += 100; // nothing left for this area; stop asking for it
          misses++;
          continue;
        }
        const ex = weightedPick(candidates, (e) => (score(e, areas) + score(e, targets)) ** 2 * (recent.has(e.id) ? 0.4 : 1), rand);
        st.used.add(ex.id);
        st.chosen.push(ex);
        st.total += baseCost(ex);
        for (const a of ex.areas) if (a in covered) covered[a] += 1;
        for (const a of ex.also) if (a in covered) covered[a] += 0.34;
      }
    }

    pick(areas, () => true);
    const near = [...new Set(areas.flatMap((a) => NEIGHBOURS[a] || []))].filter((a) => !areas.includes(a));
    if (near.length) pick(near, () => roomy() < T);
    pick(M.AREAS.map((a) => a.id), () => roomy() < T);

    const items = order(st.chosen).map((ex) => ({ ex, set: 1, extra: score(ex, areas) === 0 }));
    return finish({ minutes: opts.minutes, transition: tr, areas, items });
  }

  function order(list) {
    const rank = (ex) => [ORDER[ex.position], FACE[ex.face] ?? 0, ex.kind === 'dynamic' ? 0 : 1];
    return list
      .map((ex, i) => ({ ex, i, r: rank(ex) }))
      .sort((a, b) => a.r[0] - b.r[0] || a.r[1] - b.r[1] || a.r[2] - b.r[2] || a.i - b.i)
      .map((x) => x.ex);
  }

  /* Size the holds to fill the session exactly. Holds grow evenly from their base, are capped,
     and are rounded to 5 s; any seconds left over go on the first "get ready". If capped holds
     still can't fill the time, the best stretch gets a second set. */
  function finish(p) {
    const T = p.minutes * 60;
    for (let guard = 0; guard < 20; guard++) {
      const rem = fit(p.items, T, p.transition, p.minutes);
      if (rem < 10 || !p.items.length) {
        p.lead = Math.max(0, rem);
        break;
      }
      const best = p.items
        .filter((it) => it.set === 1 && !p.items.some((o) => o.ex === it.ex && o.set === 2))
        .sort((a, b) => score(b.ex, p.areas) - score(a.ex, p.areas) || (a.ex.kind === 'static' ? -1 : 1))[0];
      if (!best) {
        p.lead = Math.max(0, rem);
        break;
      }
      p.items.splice(p.items.indexOf(best) + 1, 0, { ex: best.ex, set: 2 });
    }
    p.total = T;
    return p;
  }

  function fit(items, T, tr, minutes) {
    const fixed = items.reduce((s, it) => s + tr + (it.ex.sides ? SWITCH : 0), 0);
    const avail = T - fixed;
    for (const it of items) {
      it.base = baseHold(it.ex, minutes);
      it.cap = CAP[it.ex.kind];
    }
    let free = items.slice();
    let capped = [];
    for (let i = 0; i < 10 && free.length; i++) {
      const usedByCapped = capped.reduce((s, it) => s + it.cap * sides(it.ex), 0);
      const k = (avail - usedByCapped) / free.reduce((s, it) => s + it.base * sides(it.ex), 0);
      const over = free.filter((it) => it.base * k > it.cap);
      for (const it of free) it.hold = Math.min(it.cap, it.base * k);
      if (!over.length) break;
      capped = capped.concat(over);
      free = free.filter((it) => !over.includes(it));
    }
    for (const it of items) it.hold = Math.max(MIN_HOLD, Math.floor(it.hold / 5) * 5);
    let rem = T - fixed - items.reduce((s, it) => s + it.hold * sides(it.ex), 0);
    // Hand out the rounding leftovers 5 s at a time to whoever is furthest below their share.
    for (let guard = 0; rem >= 5 && guard < 1000; guard++) {
      const room = items.filter((it) => it.hold + 5 <= it.cap && 5 * sides(it.ex) <= rem);
      if (!room.length) break;
      room.sort((a, b) => a.hold / a.base - b.hold / b.base);
      room[0].hold += 5;
      rem -= 5 * sides(room[0].ex);
    }
    return rem;
  }

  // Replace item i with a different stretch for the same areas, keeping the session length.
  function swap(p, i, opts) {
    const cur = p.items[i].ex;
    const inPlan = new Set(p.items.map((it) => it.ex.id));
    const pool = eligible(opts).filter((ex) => !inPlan.has(ex.id) && score(ex, p.areas) > 0);
    const shares = (ex) => ex.areas.some((a) => cur.areas.includes(a) && p.areas.includes(a));
    let candidates = pool.filter((ex) => shares(ex) && ex.position === cur.position);
    if (!candidates.length) candidates = pool.filter(shares);
    if (!candidates.length) candidates = pool;
    if (!candidates.length) return false;
    const ex = weightedPick(candidates, (e) => score(e, p.areas), opts.rand || Math.random);
    // Second sets are worked out afresh by finish().
    p.items = p.items.filter((it) => it.set === 1);
    p.items[p.items.findIndex((it) => it.ex === cur)] = { ex, set: 1 };
    finish(p);
    return true;
  }

  // The session as a list of timed segments: get ready, hold (per side), switch sides.
  function timeline(p) {
    const segs = [];
    p.items.forEach((it, i) => {
      segs.push({ type: 'prep', i, dur: p.transition + (i === 0 ? p.lead : 0) });
      if (it.ex.sides) {
        segs.push({ type: 'work', i, side: 1, dur: it.hold });
        segs.push({ type: 'switch', i, dur: SWITCH });
        segs.push({ type: 'work', i, side: 2, dur: it.hold });
      } else {
        segs.push({ type: 'work', i, side: 0, dur: it.hold });
      }
    });
    return segs;
  }

  M.Planner = { plan, swap, timeline, score, SWITCH, OFF_FLOOR };
})(typeof window !== 'undefined' ? window : globalThis);
