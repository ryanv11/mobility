// Checks the planner across many random sessions: node tests/planner.test.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ctx = {};
ctx.window = ctx;
vm.createContext(ctx);
for (const f of ['exercises.js', 'planner.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8'), ctx, { filename: f });
}
const { Planner, AREAS, EXERCISES } = ctx.Mobility;

let failures = 0;
const fail = (msg, extra) => {
  failures++;
  if (failures <= 10) console.error('FAIL', msg, extra ?? '');
};

// The library itself.
const ids = new Set();
for (const ex of EXERCISES) {
  if (ids.has(ex.id)) fail('duplicate id', ex.id);
  ids.add(ex.id);
  for (const a of [...ex.areas, ...ex.also]) if (!AREAS.some((x) => x.id === a)) fail('unknown area', ex.id + ' ' + a);
  if (!['standing', 'chair', 'kneeling', 'seated', 'lying'].includes(ex.position)) fail('bad position', ex.id);
  if (!ex.steps.length || !ex.tips.length || !ex.muscles.length) fail('missing text', ex.id);
  if (!ex.fig || !ex.fig.frames.length) fail('missing figure', ex.id);
}
for (const a of AREAS) {
  const n = EXERCISES.filter((e) => e.areas.includes(a.id)).length;
  if (n < 3) fail('area has fewer than 3 main stretches', a.id + ' ' + n);
}

// Random sessions.
const areaIds = AREAS.map((a) => a.id);
let runs = 0;
for (const minutes of [5, 10, 15, 30]) {
  for (const transition of [5, 10, 15]) {
    for (let r = 0; r < 150; r++) {
      const k = 1 + Math.floor(Math.random() * areaIds.length);
      const areas = areaIds.slice().sort(() => Math.random() - 0.5).slice(0, k);
      const standingOnly = Math.random() < 0.25;
      const p = Planner.plan({ areas, minutes, transition, standingOnly });
      const segs = Planner.timeline(p);
      const total = segs.reduce((s, x) => s + x.dur, 0);
      const tag = JSON.stringify({ minutes, transition, areas, standingOnly });
      runs++;
      if (total !== minutes * 60) fail('total ' + total + ' != ' + minutes * 60, tag);
      if (!p.items.length) fail('empty plan', tag);
      if (p.lead > 15) fail('long lead-in ' + p.lead, tag);
      for (const it of p.items) {
        if (it.hold < 20) fail('hold under 20 s', tag + ' ' + it.ex.id + ' ' + it.hold);
        if (standingOnly && !Planner.OFF_FLOOR.includes(it.ex.position)) fail('floor stretch in no-floor session', tag);
        if (Planner.score(it.ex, areas) === 0 && !it.extra) fail('off-target stretch not marked extra', tag + ' ' + it.ex.id);
      }
      const once = p.items.filter((it) => it.set === 1).map((it) => it.ex.id);
      if (new Set(once).size !== once.length) fail('repeated stretch', tag);
      // Floor only once: positions never go back up.
      const rank = { standing: 0, chair: 1, kneeling: 2, seated: 3, lying: 4 };
      for (let i = 1; i < p.items.length; i++) {
        if (rank[p.items[i].ex.position] < rank[p.items[i - 1].ex.position]) fail('goes back up from the floor', tag);
      }
      // Swapping keeps the length.
      if (p.items.length > 1) {
        Planner.swap(p, 0, { standingOnly });
        const t2 = Planner.timeline(p).reduce((s, x) => s + x.dur, 0);
        if (t2 !== minutes * 60) fail('swap changed total to ' + t2, tag);
      }
    }
  }
}

// Show a few examples.
for (const [areas, minutes] of [[['neck'], 30], [['wrists'], 15], [['hamstrings', 'hipFlexors'], 10], [areaIds, 5], [areaIds, 30]]) {
  const p = Planner.plan({ areas, minutes, transition: 10 });
  console.log(`\n${minutes} min, ${areas.length === 12 ? 'all areas' : areas.join(', ')} (lead ${p.lead}s):`);
  for (const it of p.items) console.log(`  ${it.ex.name}${it.set === 2 ? ' (set 2)' : ''}${it.extra ? ' [extra]' : ''} — ${it.hold}s${it.ex.sides ? ' each side' : ''}`);
}

console.log(`\n${runs} random sessions checked, ${failures} failures`);
process.exit(failures ? 1 : 0);
