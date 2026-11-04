/* Screens, the session player, sounds and history. */
(function () {
  'use strict';
  const { AREAS, PRESETS, EXERCISES, CHECKS, LEVELS, checkFigure, Figure, Planner } = window.Mobility;
  const app = document.getElementById('app');

  // ---------- helpers ----------
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const areaLabel = (id) => (AREAS.find((a) => a.id === id) || {}).label || id;
  const POSITION = { standing: 'Standing', chair: 'On a chair', kneeling: 'On the floor', seated: 'Seated on the floor', lying: 'Lying down' };
  const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
  const stretches = (n) => `${n} stretch${n === 1 ? '' : 'es'}`;

  function clock(sec) {
    const s = Math.max(0, Math.ceil(sec));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }
  const bigClock = (sec) => (sec < 60 ? String(Math.max(0, Math.ceil(sec))) : clock(sec));
  const holdText = (it) => `${it.hold}s${it.ex.sides ? ' each side' : ''}`;
  const videoUrl = (ex) => 'https://www.youtube.com/results?search_query=' + encodeURIComponent(ex.video || `${ex.name} stretch how to`);

  const ICON = {
    gear: '<svg viewBox="0 0 24 24"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg>',
    back: '<svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>',
    close: '<svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    swap: '<svg viewBox="0 0 24 24"><path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/></svg>',
    shuffle: '<svg viewBox="0 0 24 24"><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>',
    play: '<svg viewBox="0 0 24 24" class="solid"><path d="M7 4.5v15a1 1 0 0 0 1.5.9l12-7.5a1 1 0 0 0 0-1.8l-12-7.5A1 1 0 0 0 7 4.5Z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" class="solid"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>',
    next: '<svg viewBox="0 0 24 24" class="solid"><path d="M5 5.5v13a1 1 0 0 0 1.5.8l9.5-6.5a1 1 0 0 0 0-1.6L6.5 4.7A1 1 0 0 0 5 5.5Z"/><rect x="17" y="5" width="2.5" height="14" rx="1"/></svg>',
    prev: '<svg viewBox="0 0 24 24" class="solid"><path d="M19 5.5v13a1 1 0 0 1-1.5.8L8 12.8a1 1 0 0 1 0-1.6l9.5-6.5A1 1 0 0 1 19 5.5Z"/><rect x="4.5" y="5" width="2.5" height="14" rx="1"/></svg>',
    video: '<svg viewBox="0 0 24 24"><rect x="2" y="5" width="15" height="14" rx="2"/><path d="m17 10 5-3v10l-5-3"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>',
  };

  // ---------- storage ----------
  const store = {
    get(k, d) {
      try {
        const v = JSON.parse(localStorage.getItem('mobility.' + k));
        return v === null ? d : v;
      } catch {
        return d;
      }
    },
    set(k, v) {
      try {
        localStorage.setItem('mobility.' + k, JSON.stringify(v));
      } catch {
        /* private browsing: nothing is kept */
      }
    },
  };
  const DEFAULT_PREFS = {
    areas: ['neck', 'shoulders', 'upperBack', 'hipFlexors', 'hamstrings'],
    minutes: 10, transition: 10, standingOnly: false, voice: true, beeps: true, weeklyGoal: 5,
  };
  const prefs = Object.assign({}, DEFAULT_PREFS, store.get('prefs', {}));
  let history = store.get('history', []);
  const checks = store.get('checks', []);
  const savePrefs = () => store.set('prefs', prefs);

  // ---------- streaks ----------
  const dayKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const doneDays = () => new Set(history.map((h) => dayKey(new Date(h.ts))));

  function streak() {
    const days = doneDays();
    const d = new Date();
    if (!days.has(dayKey(d))) d.setDate(d.getDate() - 1); // today isn't over yet
    let n = 0;
    while (days.has(dayKey(d))) {
      n++;
      d.setDate(d.getDate() - 1);
    }
    return n;
  }

  function week() {
    const days = doneDays();
    const today = new Date();
    const monday = new Date(today);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    return 'MTWTFSS'.split('').map((label, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return { label, done: days.has(dayKey(d)), today: dayKey(d) === dayKey(today) };
    });
  }

  function trackCard() {
    const wk = week();
    const count = wk.filter((d) => d.done).length;
    const s = streak();
    return `
      <section class="card track">
        <div class="streak"><strong>${s}</strong><span>${s === 1 ? 'day' : 'days'} in a row</span></div>
        <div class="week">${wk.map((d) => `<div class="day${d.done ? ' done' : ''}${d.today ? ' today' : ''}"><i>${d.done ? ICON.check : ''}</i><span>${d.label}</span></div>`).join('')}</div>
        <p class="goal">${count} of ${prefs.weeklyGoal} days this week${count >= prefs.weeklyGoal ? ' · goal reached' : ''}</p>
      </section>`;
  }

  function relDay(ts) {
    const d = new Date(ts);
    const diff = Math.round((new Date(dayKey(new Date())) - new Date(dayKey(d))) / 864e5);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' });
  }

  function historyList(items) {
    if (!items.length) return '<p class="muted">No sessions yet.</p>';
    return `<ul class="history">${items.map((h) => `
      <li><b>${relDay(h.ts)}</b><span>${Math.round(h.work / 60) || '<1'} min stretching${h.complete ? '' : ' (stopped early)'}</span>
      <small>${h.areas.map(areaLabel).join(', ')}</small></li>`).join('')}</ul>`;
  }

  // ---------- screens ----------
  let figures = [];
  function show(html, handlers) {
    figures.forEach((f) => f.destroy());
    figures = [];
    app.innerHTML = html;
    app.onclick = (e) => {
      const t = e.target.closest('[data-act]');
      if (t && !t.disabled && handlers[t.dataset.act]) handlers[t.dataset.act](t, e);
    };
    app.onchange = (e) => handlers.change && handlers.change(e.target);
    window.scrollTo(0, 0);
  }

  function thumbs(list) {
    $$('[data-thumb]').forEach((el) => figures.push(Figure.still(el, list[+el.dataset.thumb])));
  }

  function renderHome() {
    const sameAs = (areas) => areas.length === prefs.areas.length && areas.every((a) => prefs.areas.includes(a));
    const seg = (key, values, unit) => `
      <div class="seg" role="radiogroup">${values.map((v) => `
        <button data-act="pref" data-key="${key}" data-val="${v}" role="radio" aria-checked="${prefs[key] === v}" class="${prefs[key] === v ? 'on' : ''}">${v}<small>${unit}</small></button>`).join('')}
      </div>`;
    const recent = history.slice(-3).reverse();
    show(`
      <div class="screen home">
        <header class="bar"><h1>Mobility</h1><button class="icon" data-act="settings" aria-label="Settings and history">${ICON.gear}</button></header>
        ${trackCard()}
        ${todayCard()}
        ${checkCard()}
        <section class="block">
          <div class="block-head"><h2>Or build your own: focus areas</h2><span class="hint">${prefs.areas.length ? `${prefs.areas.length} selected` : 'Pick at least one'}</span></div>
          <div class="presets">${PRESETS.map((p) => `<button class="preset${sameAs(p.areas) ? ' on' : ''}" data-act="preset" data-id="${p.id}">${p.label}</button>`).join('')}
            <button class="preset" data-act="preset" data-id="clear">Clear</button></div>
          <div class="chips">${AREAS.map((a) => `<button class="chip${prefs.areas.includes(a.id) ? ' on' : ''}" data-act="area" data-id="${a.id}" aria-pressed="${prefs.areas.includes(a.id)}">${a.label}</button>`).join('')}</div>
        </section>
        <section class="block"><h2>Session length</h2>${seg('minutes', [5, 10, 15, 30], 'min')}</section>
        <section class="block"><h2>Transition between stretches</h2>${seg('transition', [5, 10, 15], 'sec')}</section>
        <section class="block">
          <label class="switch"><input type="checkbox" data-key="standingOnly"${prefs.standingOnly ? ' checked' : ''}>
            <span class="switch-text"><b>No floor work</b><small>Standing and chair stretches only, handy at the office</small></span><span class="knob"></span></label>
        </section>
        <button class="primary big" data-act="build"${prefs.areas.length ? '' : ' disabled'}>Build my session</button>
        ${recent.length ? `<section class="block"><h2>Recent</h2>${historyList(recent)}</section>` : ''}
        <button class="link" data-act="library">Browse all ${EXERCISES.length} stretches</button>
      </div>`, {
      settings: renderSettings,
      library: () => renderLibrary(),
      today() {
        state.plan = buildPlan(todayPick().areas);
        startSession();
      },
      check: () => (checks.length ? renderResults(checks.length - 1) : renderCheckIntro()),
      preset(t) {
        const p = PRESETS.find((x) => x.id === t.dataset.id);
        prefs.areas = p ? p.areas.slice() : [];
        savePrefs();
        renderHome();
      },
      area(t) {
        const id = t.dataset.id;
        prefs.areas = prefs.areas.includes(id) ? prefs.areas.filter((a) => a !== id) : prefs.areas.concat(id);
        savePrefs();
        renderHome();
      },
      pref(t) {
        prefs[t.dataset.key] = +t.dataset.val;
        savePrefs();
        renderHome();
      },
      change(input) {
        prefs[input.dataset.key] = input.checked;
        savePrefs();
      },
      build() {
        state.plan = buildPlan();
        renderPreview();
      },
    });
  }

  const state = { plan: null };

  function lastTrained() {
    const when = {};
    for (const h of history) for (const a of h.areas) when[a] = Math.max(when[a] || 0, h.ts);
    return when;
  }

  function buildPlan(areas = prefs.areas) {
    const areaLastDone = lastTrained();
    const last = history[history.length - 1];
    return Planner.plan({
      areas, minutes: prefs.minutes, transition: prefs.transition,
      standingOnly: prefs.standingOnly, recent: last ? last.ex : [], areaLastDone,
    });
  }

  function planRow(it, i) {
    return `
      <li class="row">
        <button class="row-main" data-act="detail" data-i="${i}">
          <div class="thumb" data-thumb="${i}"></div>
          <div class="row-text">
            <b>${esc(it.ex.name)}${it.set === 2 ? ' <em>second set</em>' : ''}</b>
            <span>${holdText(it)}${it.ex.kind === 'dynamic' ? ' · moving' : ''}</span>
            <small>${it.ex.areas.map(areaLabel).join(', ')}${it.extra ? ' · bonus' : ''}</small>
          </div>
        </button>
        <button class="icon swap" data-act="swap" data-i="${i}" aria-label="Swap ${esc(it.ex.name)} for another stretch">${ICON.swap}</button>
      </li>`;
  }

  function renderPreview() {
    const p = state.plan;
    const floorAt = p.items.findIndex((it) => !Planner.OFF_FLOOR.includes(it.ex.position));
    show(`
      <div class="screen preview">
        <header class="bar"><button class="icon" data-act="home" aria-label="Back">${ICON.back}</button><h1>Your session</h1><span class="icon-spacer"></span></header>
        <p class="summary"><b>${p.minutes} minutes</b> · ${stretches(p.items.length)} · ${p.transition}s transitions</p>
        <p class="muted center">${p.areas.length === AREAS.length ? 'Full body' : p.areas.map(areaLabel).join(' · ')}</p>
        ${floorAt > 0 ? `<p class="note">Off the floor first, then down to the floor from stretch ${floorAt + 1}.</p>` : ''}
        <ol class="rows">${p.items.map(planRow).join('')}</ol>
        <div class="footer">
          <button class="secondary" data-act="shuffle">${ICON.shuffle}<span>Shuffle</span></button>
          <button class="primary" data-act="start">${ICON.play}<span>Start</span></button>
        </div>
      </div>`, {
      home: renderHome,
      detail: (t) => openDetail(p.items[+t.dataset.i].ex),
      swap(t) {
        Planner.swap(p, +t.dataset.i, { standingOnly: prefs.standingOnly });
        const y = window.scrollY;
        renderPreview();
        window.scrollTo(0, y);
      },
      shuffle() {
        state.plan = buildPlan();
        renderPreview();
      },
      start: startSession,
    });
    thumbs(p.items.map((it) => it.ex));
  }

  function renderLibrary(filter = null) {
    const list = EXERCISES.filter((ex) => !filter || ex.areas.includes(filter) || ex.also.includes(filter))
      .sort((a, b) => a.name.localeCompare(b.name));
    show(`
      <div class="screen library">
        <header class="bar"><button class="icon" data-act="home" aria-label="Back">${ICON.back}</button><h1>All stretches</h1><span class="icon-spacer"></span></header>
        <div class="chips scroll">
          <button class="chip${filter ? '' : ' on'}" data-act="filter" data-id="">All</button>
          ${AREAS.map((a) => `<button class="chip${filter === a.id ? ' on' : ''}" data-act="filter" data-id="${a.id}">${a.label}</button>`).join('')}
        </div>
        <ol class="rows">${list.map((ex, i) => `
          <li class="row"><button class="row-main" data-act="detail" data-i="${i}">
            <div class="thumb" data-thumb="${i}"></div>
            <div class="row-text"><b>${esc(ex.name)}</b><span>${POSITION[ex.position]}${ex.sides ? ' · both sides' : ''}${ex.kind === 'dynamic' ? ' · moving' : ''}</span>
            <small>${ex.areas.map(areaLabel).join(', ')}</small></div>
          </button></li>`).join('')}</ol>
      </div>`, {
      home: renderHome,
      filter: (t) => renderLibrary(t.dataset.id || null),
      detail: (t) => openDetail(list[+t.dataset.i]),
    });
    thumbs(list);
  }

  function renderSettings() {
    const toggle = (key, title, sub) => `
      <label class="switch"><input type="checkbox" data-key="${key}"${prefs[key] ? ' checked' : ''}>
        <span class="switch-text"><b>${title}</b><small>${sub}</small></span><span class="knob"></span></label>`;
    const totalMin = Math.round(history.reduce((s, h) => s + h.work, 0) / 60);
    show(`
      <div class="screen settings">
        <header class="bar"><button class="icon" data-act="home" aria-label="Back">${ICON.back}</button><h1>Settings</h1><span class="icon-spacer"></span></header>
        <section class="block">
          ${toggle('voice', 'Voice cues', 'Announces each stretch and when to switch sides')}
          ${toggle('beeps', 'Countdown beeps', 'Three beeps before each change')}
        </section>
        <section class="block"><h2>Weekly goal</h2>
          <div class="seg">${[3, 4, 5, 6, 7].map((v) => `<button data-act="goal" data-val="${v}" class="${prefs.weeklyGoal === v ? 'on' : ''}">${v}<small>days</small></button>`).join('')}</div>
        </section>
        <section class="block"><h2>History</h2>
          <p class="muted">${plural(history.length, 'session')} · ${totalMin} minutes in total · best streak ${plural(bestStreak(), 'day')}</p>
          ${historyList(history.slice().reverse().slice(0, 30))}
          ${history.length ? '<button class="link danger" data-act="clear">Clear history</button>' : ''}
        </section>
        <p class="small muted">Stretch gently and never into pain. If something hurts, skip it and check with a physio.</p>
      </div>`, {
      home: renderHome,
      change(input) {
        prefs[input.dataset.key] = input.checked;
        savePrefs();
      },
      goal(t) {
        prefs.weeklyGoal = +t.dataset.val;
        savePrefs();
        renderSettings();
      },
      clear() {
        if (!window.confirm('Clear all session history? Your streak will reset.')) return;
        history = [];
        store.set('history', history);
        renderSettings();
      },
    });
  }

  function bestStreak() {
    const days = [...doneDays()].sort();
    let best = 0;
    let run = 0;
    let prev = null;
    for (const k of days) {
      const d = new Date(k + 'T12:00:00');
      run = prev && Math.round((d - prev) / 864e5) === 1 ? run + 1 : 1;
      best = Math.max(best, run);
      prev = d;
    }
    return best;
  }

  // ---------- today's session & the mobility check ----------
  const DAY = 864e5;
  const checkScore = (c) => {
    const vals = Object.values(c.scores).filter((v) => v !== null);
    return vals.length ? Math.round((vals.reduce((s, v) => s + v, 0) / (vals.length * 2)) * 100) : 0;
  };

  // Three areas for today: tight ones from the latest check, the least recently worked first,
  // so each tight area gets its turn over the week.
  function todayPick() {
    const when = lastTrained();
    const check = checks[checks.length - 1];
    let pool;
    let why;
    if (check) {
      const scored = AREAS.map((a) => a.id).filter((a) => check.scores[a] !== null && check.scores[a] !== undefined);
      const tight = scored.filter((a) => check.scores[a] < 2);
      pool = tight.length >= 3 ? tight : scored;
      why = tight.length ? 'aimed at your tight areas' : 'you’re in good shape, so a mix';
    } else {
      pool = prefs.areas.length ? prefs.areas : AREAS.map((a) => a.id);
      why = 'from your focus areas';
    }
    const sc = (a) => (check ? check.scores[a] ?? 2 : 0);
    const areas = pool.slice().sort((a, b) => (when[a] || 0) - (when[b] || 0) || sc(a) - sc(b)).slice(0, 3);
    return { areas, why };
  }

  function todayCard() {
    const pick = todayPick();
    const doneToday = doneDays().has(dayKey(new Date()));
    return `
      <section class="card today-card">
        <div class="today-text">
          <h2>Today’s session${doneToday ? ' <span class="done-tag">done ✓</span>' : ''}</h2>
          <p class="today-areas">${pick.areas.map(areaLabel).join(' · ')}</p>
          <small>${prefs.minutes} min · ${pick.why}</small>
        </div>
        <button class="primary round today-go" data-act="today" aria-label="Start today’s session">${ICON.play}</button>
      </section>`;
  }

  function checkCard() {
    const c = checks[checks.length - 1];
    if (!c) {
      return `
        <button class="card check-card" data-act="check">
          <b>Take the mobility check</b>
          <span>12 quick self-tests, about 5 minutes. See where you’re tight and get daily sessions aimed at it.</span>
        </button>`;
    }
    const days = Math.floor((Date.now() - c.ts) / DAY);
    return `
      <button class="card check-card has-score" data-act="check">
        <strong>${checkScore(c)}<small>%</small></strong>
        <span><b>Mobility score</b><br>${days >= 28 ? '<em>Time for a retest</em>' : `Checked ${relDay(c.ts).toLowerCase()}`}</span>
        <i>${ICON.back}</i>
      </button>`;
  }

  function renderCheckIntro() {
    show(`
      <div class="screen check">
        <header class="bar"><button class="icon" data-act="home" aria-label="Back">${ICON.back}</button><h1>Mobility check</h1><span class="icon-spacer"></span></header>
        <div class="card intro">
          <p>Twelve quick self-tests, one for each area. For each one, try the position and pick the answer that matches what you can do comfortably.</p>
          <ul class="tips">
            <li>Warm up first: a short walk or a few arm circles and leg swings.</li>
            <li>Ease in and never force a position or bounce.</li>
            <li>Skip anything that hurts.</li>
          </ul>
          <p class="muted">Retake it every month or so to see what’s improving.</p>
        </div>
        <button class="primary big" data-act="go">Start the check</button>
      </div>`, { home: renderHome, go: () => renderCheckStep(0, {}) });
  }

  function renderCheckStep(i, answers) {
    const c = CHECKS[i];
    const pips = (n) => `<span class="pips">${[0, 1, 2].map((k) => `<i class="${k <= n ? 'on' : ''}"></i>`).join('')}</span>`;
    const next = (score) => {
      const a = Object.assign({}, answers, { [c.area]: score });
      if (i + 1 < CHECKS.length) renderCheckStep(i + 1, a);
      else saveCheck(a);
    };
    show(`
      <div class="screen check">
        <header class="p-top">
          <button class="icon" data-act="back" aria-label="Back">${ICON.back}</button>
          <div class="p-bar"><div class="p-bar-fill" style="width:${(i / CHECKS.length) * 100}%"></div></div>
          <span class="p-left">${i + 1} of ${CHECKS.length}</span>
        </header>
        <p class="eyebrow">${areaLabel(c.area)}</p>
        <h1 class="check-name">${esc(c.name)}</h1>
        <div class="stage check-stage" data-fig></div>
        <ol class="steps">${c.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
        <div class="options">${c.options.map((o, k) => `<button class="option" data-act="answer" data-score="${k}">${pips(k)}<span>${esc(o)}</span></button>`).join('')}</div>
        <button class="link" data-act="skip">Skip this one</button>
      </div>`, {
      back: () => (i ? renderCheckStep(i - 1, answers) : renderCheckIntro()),
      answer: (t) => next(+t.dataset.score),
      skip: () => next(null),
    });
    figures.push(Figure.still($('[data-fig]'), checkFigure(c)));
  }

  function saveCheck(scores) {
    checks.push({ ts: Date.now(), scores });
    store.set('checks', checks);
    renderResults(checks.length - 1);
  }

  function renderResults(idx) {
    const c = checks[idx];
    const prevCheck = checks[idx - 1];
    const score = checkScore(c);
    const delta = prevCheck ? score - checkScore(prevCheck) : null;
    const focus = AREAS.map((a) => a.id)
      .filter((a) => c.scores[a] !== null && c.scores[a] !== undefined && c.scores[a] < 2)
      .sort((a, b) => c.scores[a] - c.scores[b])
      .slice(0, 5);
    const arrow = (a) => {
      if (!prevCheck || prevCheck.scores[a] == null || c.scores[a] == null) return '';
      const d = c.scores[a] - prevCheck.scores[a];
      return d > 0 ? '<em class="up">▲ better</em>' : d < 0 ? '<em class="down">▼ tighter</em>' : '';
    };
    const usingFocus = focus.length && focus.length === prefs.areas.length && focus.every((a) => prefs.areas.includes(a));
    show(`
      <div class="screen results">
        <header class="bar"><button class="icon" data-act="home" aria-label="Back">${ICON.back}</button><h1>Your mobility</h1><span class="icon-spacer"></span></header>
        <section class="card score-card">
          <strong>${score}<small>%</small></strong>
          <span>mobility score · ${relDay(c.ts).toLowerCase()}</span>
          ${delta !== null ? `<em class="${delta >= 0 ? 'up' : 'down'}">${delta >= 0 ? '+' : ''}${delta} since ${relDay(prevCheck.ts).toLowerCase()}</em>` : ''}
        </section>
        <section class="block"><h2>By area</h2>
          <ul class="levels">${AREAS.map((a) => {
            const v = c.scores[a.id];
            return `<li class="lvl-${v ?? 'none'}"><b>${a.label}</b>${v == null ? '<span class="muted">skipped</span>' : `<span class="pips">${[0, 1, 2].map((k) => `<i class="${k <= v ? 'on' : ''}"></i>`).join('')}</span><span>${LEVELS[v]}</span>`}${arrow(a.id)}</li>`;
          }).join('')}</ul>
        </section>
        ${focus.length ? `
          <section class="block"><h2>Worth focusing on</h2>
            <div class="chips">${focus.map((a) => `<span class="chip on">${areaLabel(a)}</span>`).join('')}</div>
          </section>
          <button class="primary big" data-act="use"${usingFocus ? ' disabled' : ''}>${usingFocus ? 'These are your focus areas' : 'Make these my focus areas'}</button>`
        : '<p class="note">Good everywhere. Keep it up with a mix of everything.</p>'}
        <p class="note">Today’s session on the home screen now rotates through your tight areas.</p>
        <button class="link" data-act="retake">Retake the check</button>
      </div>`, {
      home: renderHome,
      use() {
        prefs.areas = focus.slice();
        savePrefs();
        renderResults(idx);
      },
      retake: renderCheckIntro,
    });
  }

  // ---------- exercise details ----------
  function exerciseInfo(ex) {
    return `
      <div class="info-block"><h3>Target muscles</h3><div class="tags">${ex.muscles.map((m) => `<span class="tag">${esc(m)}</span>`).join('')}</div></div>
      <div class="info-block"><h3>Steps</h3><ol class="steps">${ex.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></div>
      <div class="info-block"><h3>Tips</h3><ul class="tips">${ex.tips.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></div>
      <a class="video" href="${videoUrl(ex)}" target="_blank" rel="noopener">${ICON.video}<span>Watch a video demo</span></a>`;
  }

  function openDetail(ex) {
    const wrap = document.createElement('div');
    wrap.className = 'sheet-wrap';
    wrap.innerHTML = `
      <div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(ex.name)}">
        <button class="icon close" data-close aria-label="Close">${ICON.close}</button>
        <div class="stage" data-fig></div>
        <h2 class="ex-name">${esc(ex.name)}</h2>
        <p class="ex-meta">${POSITION[ex.position]} · ${ex.kind === 'dynamic' ? 'slow movement' : 'hold'}${ex.sides ? ' · both sides' : ''}</p>
        ${exerciseInfo(ex)}
      </div>`;
    document.body.appendChild(wrap);
    document.body.classList.add('locked');
    const fig = Figure.mount($('[data-fig]', wrap), ex);
    const close = () => {
      fig.destroy();
      wrap.remove();
      document.body.classList.remove('locked');
      document.removeEventListener('keydown', onKey);
    };
    const onKey = (e) => e.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    wrap.addEventListener('click', (e) => {
      if (e.target === wrap || e.target.closest('[data-close]')) close();
    });
    requestAnimationFrame(() => wrap.classList.add('open'));
  }

  // ---------- sound, voice, screen ----------
  const Sound = {
    ctx: null,
    unlock() {
      try {
        this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)();
        if (this.ctx.state === 'suspended') this.ctx.resume();
      } catch {
        this.ctx = null;
      }
    },
    beep(freq = 660, dur = 0.12, vol = 0.25) {
      if (!prefs.beeps || !this.ctx) return;
      const t = this.ctx.currentTime;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(this.ctx.destination);
      o.start(t);
      o.stop(t + dur + 0.05);
    },
  };

  const Voice = {
    say(text) {
      if (!prefs.voice || !('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1;
      window.speechSynthesis.speak(u);
    },
    stop() {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    },
  };

  const Wake = {
    lock: null,
    async on() {
      try {
        if ('wakeLock' in navigator && !this.lock) {
          this.lock = await navigator.wakeLock.request('screen');
          this.lock.addEventListener('release', () => (this.lock = null));
        }
      } catch {
        this.lock = null;
      }
    },
    off() {
      if (this.lock) this.lock.release();
      this.lock = null;
    },
  };

  // ---------- the session player ----------
  let P = null;

  function startSession() {
    Sound.unlock();
    const plan = state.plan;
    const segs = Planner.timeline(plan);
    P = {
      plan, segs, idx: -1, end: 0, segStart: 0, paused: false, left: 0, lastWhole: null,
      fig: null, figItem: null, work: 0, done: new Set(), total: segs.reduce((s, x) => s + x.dur, 0), timer: 0,
    };
    // Seconds left in the session after each segment.
    P.after = segs.map((_, i) => segs.slice(i + 1).reduce((s, x) => s + x.dur, 0));
    show(`
      <div class="screen player">
        <header class="p-top">
          <button class="icon" data-act="end" aria-label="End session">${ICON.close}</button>
          <div class="p-bar"><div class="p-bar-fill"></div></div>
          <span class="p-left"></span>
        </header>
        <div class="stage p-stage"></div>
        <div class="p-status">
          <div class="p-timer">
            <svg viewBox="0 0 120 120" class="ring" aria-hidden="true"><circle class="ring-bg" cx="60" cy="60" r="53"/><circle class="ring-fg" cx="60" cy="60" r="53" pathLength="100"/></svg>
            <div class="p-time" role="timer" aria-live="off"></div>
          </div>
          <div class="p-head">
            <p class="p-phase"><span class="p-phase-label"></span> · <span class="p-count"></span></p>
            <h1 class="p-name"></h1>
            <p class="p-side"></p>
          </div>
        </div>
        <p class="p-next"></p>
        <div class="p-info"></div>
        <nav class="p-controls">
          <button class="icon round" data-act="prev" aria-label="Back">${ICON.prev}</button>
          <button class="primary round big-round" data-act="pause" aria-label="Pause">${ICON.pause}</button>
          <button class="icon round" data-act="skip" aria-label="Skip">${ICON.next}</button>
        </nav>
      </div>`, {
      end: endEarly,
      pause: togglePause,
      skip,
      prev,
    });
    enter(0, Date.now());
    P.timer = setInterval(tick, 200);
    Wake.on();
    tick();
  }

  function sideName(n) {
    return n === 1 ? 'Right side' : 'Left side';
  }

  function enter(i, at) {
    P.idx = i;
    const seg = P.segs[i];
    const it = P.plan.items[seg.i];
    const ex = it.ex;
    P.segStart = at;
    P.end = at + seg.dur * 1000;
    P.lastWhole = null;
    const fresh = Date.now() - at < 1500;
    const screen = $('.player');

    if (P.figItem !== it) {
      if (P.fig) P.fig.destroy();
      P.fig = Figure.mount($('.p-stage'), ex, { paused: P.paused });
      P.figItem = it;
      $('.p-name').textContent = ex.name + (it.set === 2 ? ' (second set)' : '');
      $('.p-info').innerHTML = exerciseInfo(ex);
    }
    P.fig.setMirror(seg.side === 2 || (seg.type === 'switch'));

    const phase = seg.type === 'prep' ? 'Get ready' : seg.type === 'switch' ? 'Switch sides' : ex.kind === 'dynamic' ? 'Move' : 'Hold';
    screen.dataset.phase = seg.type;
    $('.p-phase-label').textContent = phase;
    $('.p-count').textContent = `${seg.i + 1} of ${P.plan.items.length}`;
    let side = '';
    if (seg.type === 'prep') side = ex.sides ? `${holdText(it)}, right side first` : holdText(it);
    else if (seg.type === 'switch') side = 'Left side next';
    else if (seg.side) side = sideName(seg.side);
    else side = ex.kind === 'dynamic' ? 'Slow and controlled' : 'Breathe and relax into it';
    $('.p-side').textContent = side;
    const nextItem = P.plan.items[seg.i + 1];
    $('.p-next').innerHTML = seg.type === 'prep' ? '' : nextItem ? `Up next: <b>${esc(nextItem.ex.name)}</b>` : '<b>Last one!</b>';

    if (!fresh) return;
    if (seg.type === 'prep') {
      Voice.say(`${i === 0 ? 'First up' : 'Next'}: ${ex.name}${ex.sides ? ', right side first' : ''}.`);
    } else if (seg.type === 'switch') {
      Voice.say('Switch sides.');
    } else {
      Sound.beep(990, 0.35);
      if (seg.side === 2) setTimeout(() => Voice.say('Left side.'), 350);
    }
  }

  function credit(seconds) {
    const seg = P.segs[P.idx];
    if (seg.type !== 'work') return;
    P.work += Math.max(0, Math.min(seg.dur, seconds));
    P.done.add(P.plan.items[seg.i].ex.id);
  }

  function tick() {
    if (!P || P.paused) return;
    const now = Date.now();
    while (now >= P.end) {
      credit(P.segs[P.idx].dur);
      if (P.idx + 1 >= P.segs.length) return finish(true);
      enter(P.idx + 1, P.end);
    }
    const seg = P.segs[P.idx];
    const left = (P.end - now) / 1000;
    const whole = Math.ceil(left);
    if (whole !== P.lastWhole) {
      if (P.lastWhole !== null && whole >= 1 && whole <= 3 && seg.dur >= 5) Sound.beep(660, 0.12);
      P.lastWhole = whole;
      $('.p-time').textContent = bigClock(left);
      $('.p-left').textContent = clock(left + P.after[P.idx]) + ' left';
    }
    $('.ring-fg').style.strokeDashoffset = String(100 - (left / seg.dur) * 100);
    $('.p-bar-fill').style.width = `${(1 - (left + P.after[P.idx]) / P.total) * 100}%`;
  }

  function togglePause() {
    const now = Date.now();
    P.paused = !P.paused;
    const btn = $('[data-act="pause"]');
    if (P.paused) {
      P.left = P.end - now;
      Voice.stop();
      Wake.off();
    } else {
      P.end = now + P.left;
      P.segStart = P.end - P.segs[P.idx].dur * 1000;
      Sound.unlock();
      Wake.on();
    }
    P.fig.setPaused(P.paused);
    $('.player').classList.toggle('paused', P.paused);
    btn.innerHTML = P.paused ? ICON.play : ICON.pause;
    btn.setAttribute('aria-label', P.paused ? 'Resume' : 'Pause');
    tick();
  }

  function elapsed() {
    return ((P.paused ? P.end - P.left : Date.now()) - P.segStart) / 1000;
  }

  function jump(i) {
    const now = Date.now();
    enter(i, now);
    if (P.paused) P.left = P.segs[i].dur * 1000;
    P.lastWhole = null;
    if (P.paused) {
      P.end = now + P.left;
      $('.p-time').textContent = bigClock(P.segs[i].dur);
      $('.p-left').textContent = clock(P.segs[i].dur + P.after[i]) + ' left';
      $('.ring-fg').style.strokeDashoffset = '0';
    }
    tick();
  }

  function skip() {
    credit(elapsed());
    if (P.idx + 1 >= P.segs.length) return finish(true);
    jump(P.idx + 1);
  }

  function prev() {
    jump(elapsed() > 3 || P.idx === 0 ? P.idx : P.idx - 1);
  }

  function endEarly() {
    const wasPaused = P.paused;
    if (!wasPaused) togglePause();
    if (!window.confirm('End this session? What you’ve done so far still counts.')) {
      if (!wasPaused) togglePause();
      return;
    }
    credit(elapsed());
    finish(false);
  }

  function finish(complete) {
    clearInterval(P.timer);
    Wake.off();
    if (P.fig) P.fig.destroy();
    const entry = {
      ts: Date.now(), minutes: P.plan.minutes, areas: P.plan.areas, ex: [...P.done],
      work: Math.round(P.work), complete,
    };
    const counts = complete || entry.work >= 60;
    if (counts) {
      history.push(entry);
      store.set('history', history);
    }
    if (complete) {
      Sound.beep(880, 0.15);
      setTimeout(() => Sound.beep(1320, 0.4), 180);
      Voice.say('Session complete. Nice work.');
    } else {
      Voice.stop();
    }
    const n = P.done.size;
    P = null;
    show(`
      <div class="screen finished">
        <div class="done-badge">${ICON.check}</div>
        <h1>${complete ? 'Session complete' : counts ? 'Nice effort' : 'Session ended'}</h1>
        <p class="muted center">${counts ? `${Math.max(1, Math.round(entry.work / 60))} min of stretching · ${stretches(n)}` : 'Less than a minute done, so this one isn’t logged.'}</p>
        ${trackCard()}
        <button class="primary big" data-act="home">Done</button>
      </div>`, { home: renderHome });
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && P && !P.paused) {
      Wake.on();
      tick();
    }
  });

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  renderHome();
})();
