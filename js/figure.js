/* The demo figure: a stick figure posed by joint angles and animated between key poses.

   Angles are in degrees, clockwise from straight up: 0 up, 90 forward (screen right),
   180 down, 270 back. Every angle is absolute, not relative to the parent joint.
   Limbs ending in N are nearest the viewer (or screen-left in front view), F furthest.

   An exercise's `fig` holds:
     view    'side' (default) or 'front'
     frames  key poses; any angle left out takes the standing default
     mode    'pingpong' (default: there and back) or 'loop' (last frame must match the first)
     cycle   seconds for one full pass
     dwell   share of each move spent holding the start pose
     ease    'smooth' (default) or 'linear'
     anchor  point that stays still, eg 'ankleN', 'kneeF', 'hip', 'handN'
     hi      parts drawn in the highlight colour: armN armF legN legF lower upper neck
     wall    { at: point, dx } draws a wall or door frame through that point
     top     true for poses seen from above: a mat behind the figure, no floor line
     chair   true to draw a chair under the hip (pose the hip at seat height)
     step    point (eg 'toeN') standing on the edge of a step
     roller  point (eg 'mid') resting on a foam roller
   A frame may also carry s (length scales, to fake foreshortening), w (weight of the
   move into it) and d (dwell multiplier for the move out of it). */
(function (root) {
  'use strict';
  const M = (root.Mobility = root.Mobility || {});

  const LEN = { t1: 24, t2: 26, n: 11, ua: 27, fa: 24, h: 9, th: 37, sh: 35, ft: 12 };
  const HEAD_R = 10;
  const WIDTH = { torso: 15, limb: 10, neck: 7 };
  const FAR_SHIFT = [3, -2];
  const BOX_W = 240;
  const BOX_H = 190;
  const DEFAULTS = { t1: 0, t2: 0, uaN: 180, faN: 180, uaF: 180, faF: 180, thN: 180, shN: 180, thF: 180, shF: 180 };
  const SVGNS = 'http://www.w3.org/2000/svg';

  const rad = (a) => (a * Math.PI) / 180;
  const step = (p, a, len) => [p[0] + Math.sin(rad(a)) * len, p[1] - Math.cos(rad(a)) * len];

  function fill(raw, view) {
    const { w, d, s, ...angles } = raw;
    const p = Object.assign({}, DEFAULTS, angles);
    if (p.n === undefined) p.n = p.t2;
    for (const X of ['N', 'F']) {
      if (p['h' + X] === undefined) p['h' + X] = p['fa' + X];
      if (p['ft' + X] === undefined) {
        p['ft' + X] = view === 'front' ? p['sh' + X] + (X === 'N' ? 90 : -90) : p['sh' + X] - 90;
      }
    }
    p.s = Object.assign({}, s);
    return p;
  }

  function lerpPose(a, b, u) {
    const out = { s: {} };
    for (const k in a) if (k !== 's') out[k] = a[k] + (b[k] - a[k]) * u;
    const keys = new Set([...Object.keys(a.s), ...Object.keys(b.s)]);
    for (const k of keys) {
      const x = a.s[k] ?? 1;
      const y = b.s[k] ?? 1;
      out.s[k] = x + (y - x) * u;
    }
    return out;
  }

  // Forward kinematics: joint positions with the hip at the origin.
  function solve(p, view) {
    const L = (k) => LEN[k.replace(/[NF]$/, '')] * (p.s[k] ?? 1);
    const P = {};
    P.hip = [0, 0];
    P.mid = step(P.hip, p.t1, L('t1'));
    P.shoulder = step(P.mid, p.t2, L('t2'));
    P.neck = step(P.shoulder, p.n, L('n'));
    P.head = step(P.neck, p.n, HEAD_R);
    // Front view: shoulders and hips have width. Folding towards the viewer keeps left on the left.
    const lateral = (a) => step([0, 0], a + (Math.cos(rad(a)) >= -0.01 ? 90 : -90), 1);
    const latS = lateral(p.t2);
    const latH = lateral(p.t1);
    for (const X of ['N', 'F']) {
      let s0;
      let h0;
      if (view === 'front') {
        const k = X === 'N' ? -1 : 1;
        s0 = [P.shoulder[0] + latS[0] * 10 * k, P.shoulder[1] + latS[1] * 10 * k];
        h0 = [latH[0] * 6 * k, latH[1] * 6 * k];
      } else {
        const o = X === 'F' ? FAR_SHIFT : [0, 0];
        s0 = [P.shoulder[0] + o[0], P.shoulder[1] + o[1]];
        h0 = [o[0], o[1]];
      }
      P['shoulder' + X] = s0;
      P['hip' + X] = h0;
      P['elbow' + X] = step(s0, p['ua' + X], L('ua' + X));
      P['wrist' + X] = step(P['elbow' + X], p['fa' + X], L('fa' + X));
      P['hand' + X] = step(P['wrist' + X], p['h' + X], L('h' + X));
      P['knee' + X] = step(h0, p['th' + X], L('th' + X));
      P['ankle' + X] = step(P['knee' + X], p['sh' + X], L('sh' + X));
      P['toe' + X] = step(P['ankle' + X], p['ft' + X], L('ft' + X) * (view === 'front' ? 0.6 : 1));
    }
    return P;
  }

  function radius(key) {
    if (key === 'head') return HEAD_R;
    if (key === 'hip' || key === 'mid' || key === 'shoulder') return WIDTH.torso / 2;
    return WIDTH.limb / 2;
  }

  function makeTimeline(fig) {
    const frames = fig.frames.map((f) => fill(f, fig.view));
    const meta = fig.frames.map((f) => ({ w: f.w ?? 1, d: f.d ?? 1 }));
    const seq = frames.map((_, i) => i);
    if (fig.mode !== 'loop') for (let i = frames.length - 2; i >= 0; i--) seq.push(i);
    const segs = [];
    for (let i = 0; i < seq.length - 1; i++) {
      const a = seq[i];
      const b = seq[i + 1];
      segs.push({ a, b, w: meta[Math.max(a, b)].w, d: meta[a].d });
    }
    return { frames, segs, total: segs.reduce((s, g) => s + g.w, 0) };
  }

  function poseAt(tl, fig, time) {
    if (!tl.segs.length) return tl.frames[0];
    const cycle = fig.cycle || 4;
    let x = ((time % cycle) / cycle) * tl.total;
    for (const g of tl.segs) {
      if (x <= g.w) {
        let u = x / g.w;
        const dw = Math.min(0.9, (fig.dwell ?? 0.3) * g.d);
        u = u < dw ? 0 : (u - dw) / (1 - dw);
        if (fig.ease !== 'linear') u = u * u * (3 - 2 * u);
        return lerpPose(tl.frames[g.a], tl.frames[g.b], u);
      }
      x -= g.w;
    }
    return tl.frames[tl.segs[tl.segs.length - 1].b];
  }

  // Positions for a pose, shifted so the anchor point never moves.
  function placer(fig, tl) {
    const anchor = fig.anchor || 'hip';
    const home = solve(tl.frames[0], fig.view)[anchor];
    return (pose) => {
      const P = solve(pose, fig.view);
      const dx = home[0] - P[anchor][0];
      const dy = home[1] - P[anchor][1];
      for (const k in P) P[k] = [P[k][0] + dx, P[k][1] + dy];
      return P;
    };
  }

  function layout(fig, tl, place) {
    const pts = [];
    for (let i = 0; i <= 48; i++) pts.push(place(poseAt(tl, fig, (i / 48) * (fig.cycle || 4))));
    for (const f of tl.frames) pts.push(place(f));
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const P of pts) {
      for (const k in P) {
        const r = radius(k);
        minX = Math.min(minX, P[k][0] - r);
        maxX = Math.max(maxX, P[k][0] + r);
        minY = Math.min(minY, P[k][1] - r);
        maxY = Math.max(maxY, P[k][1] + r);
      }
    }
    const first = place(tl.frames[0]);
    let ground = -Infinity;
    for (const k in first) ground = Math.max(ground, first[k][1] + radius(k));
    // Standing on a step: the real floor is lower than the feet.
    const floor = ground + (fig.step ? 18 : 0);
    const bottom = fig.top ? maxY : floor;
    const scale = Math.max(1, (maxX - minX + 28) / BOX_W, (bottom - minY + 28) / BOX_H);
    const vw = BOX_W * scale;
    const vh = BOX_H * scale;
    const cx = (minX + maxX) / 2;
    const vy = fig.top ? (minY + maxY) / 2 - vh / 2 : floor + 12 * scale - vh;
    return { vx: cx - vw / 2, vy, vw, vh, cx, ground, floor, minX, maxX, minY, maxY, first };
  }

  function el(name, attrs, parent) {
    const node = document.createElementNS(SVGNS, name);
    for (const k in attrs) node.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(node);
    return node;
  }

  const SIDE_PARTS = ['armF', 'legF', 'lower', 'upper', 'neck', 'head', 'legN', 'armN'];
  const FRONT_PARTS = ['legN', 'legF', 'hips', 'lower', 'upper', 'shoulders', 'neck', 'head', 'armN', 'armF'];

  function build(host, ex, box) {
    const fig = ex.fig;
    const svg = el('svg', {
      viewBox: `${box.vx.toFixed(1)} ${box.vy.toFixed(1)} ${box.vw.toFixed(1)} ${box.vh.toFixed(1)}`,
      class: 'figure',
      role: 'img',
      'aria-label': `Demonstration of ${ex.name}`,
    });
    const onFloor = ex.position !== 'standing';
    if (fig.top) {
      el('rect', {
        x: box.minX - 10, y: box.minY - 10, width: box.maxX - box.minX + 20, height: box.maxY - box.minY + 20,
        rx: 10, class: 'fig-mat-top',
      }, svg);
    } else {
      el('line', { x1: box.vx, x2: box.vx + box.vw, y1: box.floor + 1, y2: box.floor + 1, class: 'fig-ground' }, svg);
      if (onFloor && !fig.chair) {
        el('rect', { x: box.minX - 8, y: box.ground - 1, width: box.maxX - box.minX + 16, height: 4, rx: 2, class: 'fig-mat' }, svg);
      }
    }
    const g = el('g', {}, svg);
    if (fig.chair) {
      const [hx, hy] = box.first.hip;
      const seat = hy + WIDTH.torso / 2;
      el('rect', { x: hx - 18, y: seat, width: 40, height: 5, rx: 2, class: 'fig-wall' }, g);
      el('rect', { x: hx + 17, y: seat, width: 4, height: box.floor - seat, class: 'fig-wall' }, g);
      el('rect', { x: hx - 18, y: seat, width: 4, height: box.floor - seat, class: 'fig-wall' }, g);
      el('rect', { x: hx - 22, y: seat - 46, width: 5, height: 51, rx: 2, class: 'fig-wall' }, g);
    }
    if (fig.step) {
      const x = box.first[fig.step][0] - 8;
      el('rect', { x, y: box.ground, width: box.vx + box.vw - x + 5, height: box.floor - box.ground, class: 'fig-wall' }, g);
    }
    if (fig.roller) {
      el('circle', { cx: box.first[fig.roller][0], cy: box.ground - 9, r: 9, class: 'fig-wall' }, g);
    }
    if (fig.wall) {
      const x = box.first[fig.wall.at][0] + (fig.wall.dx || 0);
      el('rect', { x: x, y: box.vy - 5, width: 6, height: box.ground - box.vy + 5, class: 'fig-wall' }, g);
    }
    const hi = new Set(fig.hi || []);
    const parts = {};
    for (const name of fig.view === 'front' ? FRONT_PARTS : SIDE_PARTS) {
      const far = fig.view !== 'front' && name.endsWith('F');
      const cls = ['fig-part', hi.has(name) ? 'fig-hi' : 'fig-ink', far ? 'fig-far' : ''].join(' ').trim();
      if (name === 'head') {
        parts.head = el('circle', { r: HEAD_R, class: (hi.has('neck') ? 'fig-hi-fill' : 'fig-ink-fill') }, g);
        continue;
      }
      const width = name === 'lower' || name === 'upper' ? WIDTH.torso : name === 'neck' ? WIDTH.neck : WIDTH.limb;
      parts[name] = el('path', { class: cls, 'stroke-width': width }, g);
    }
    host.replaceChildren(svg);
    return { svg, g, parts };
  }

  const f1 = (n) => n.toFixed(1);
  const line = (...pts) => 'M' + pts.map((p) => f1(p[0]) + ' ' + f1(p[1])).join('L');

  function draw(parts, P) {
    for (const name in parts) {
      const node = parts[name];
      switch (name) {
        case 'head':
          node.setAttribute('cx', f1(P.head[0]));
          node.setAttribute('cy', f1(P.head[1]));
          break;
        case 'lower': node.setAttribute('d', line(P.hip, P.mid)); break;
        case 'upper': node.setAttribute('d', line(P.mid, P.shoulder)); break;
        case 'neck': node.setAttribute('d', line(P.shoulder, P.neck)); break;
        case 'hips': node.setAttribute('d', line(P.hipN, P.hipF)); break;
        case 'shoulders': node.setAttribute('d', line(P.shoulderN, P.shoulderF)); break;
        default: {
          const X = name.slice(-1);
          node.setAttribute('d', name.startsWith('arm')
            ? line(P['shoulder' + X], P['elbow' + X], P['wrist' + X], P['hand' + X])
            : line(P['hip' + X], P['knee' + X], P['ankle' + X], P['toe' + X]));
        }
      }
    }
  }

  const reducedMotion = () => root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function peakIndex(fig) {
    if (fig.peak !== undefined) return fig.peak;
    return fig.mode === 'loop' ? 1 : fig.frames.length - 1;
  }

  // Animated figure inside `host`. Returns controls for the player.
  function mount(host, ex, opts = {}) {
    const fig = ex.fig;
    const tl = makeTimeline(fig);
    const place = placer(fig, tl);
    const box = layout(fig, tl, place);
    const { g, parts } = build(host, ex, box);
    const setMirror = (on) => g.setAttribute('transform', on ? `translate(${f1(2 * box.cx)} 0) scale(-1 1)` : '');
    setMirror(!!opts.mirror);
    if (opts.at !== undefined) {
      draw(parts, place(poseAt(tl, fig, opts.at)));
      return { setMirror, setPaused() {}, destroy() {} };
    }
    const still =opts.still || reducedMotion() || !tl.segs.length;
    if (still) {
      draw(parts, place(tl.frames[Math.min(peakIndex(fig), tl.frames.length - 1)]));
      return { setMirror, setPaused() {}, destroy() {} };
    }
    let paused = !!opts.paused;
    let t = 0;
    let last = null;
    let raf = 0;
    const tick = (now) => {
      if (last !== null && !paused) t += (now - last) / 1000;
      last = now;
      draw(parts, place(poseAt(tl, fig, t)));
      raf = root.requestAnimationFrame(tick);
    };
    draw(parts, place(tl.frames[0]));
    raf = root.requestAnimationFrame(tick);
    return {
      setMirror,
      setPaused(p) { paused = p; },
      destroy() { root.cancelAnimationFrame(raf); },
    };
  }

  M.Figure = { mount, still: (host, ex) => mount(host, ex, { still: true }) };
})(typeof window !== 'undefined' ? window : globalThis);
