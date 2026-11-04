# Mobility

A stretching app for staying on track with mobility. Pick focus areas and a session length
(5, 10, 15 or 30 minutes). It picks the stretches, sizes every hold so the session lasts exactly
that long, then runs a guided timer with transition time between stretches.

It's a web app with no build step and no server code. On iPhone, add it to the Home Screen and it
runs full screen and works offline.

## What it does

- **Focus areas**: 12 areas (neck, shoulders, chest, upper and lower back, hip flexors, glutes,
  inner thighs, hamstrings, quads, calves and ankles, wrists), plus quick picks for *Desk reset*,
  *Lower body* and *Full body*.
- **Session builder**: sessions start with standing and chair stretches and get down to the floor once,
  finishing lying down. It favours areas you haven't worked lately and avoids repeating last
  session's stretches. If your areas run out of stretches (for example 30 minutes of neck only),
  it adds stretches for nearby areas, marked "bonus". Tap ⇄ on any stretch to swap it, or Shuffle
  for a new session.
- **No floor work**: standing and chair stretches only, for the office.
- **Timer**: a get-ready countdown (your transition time) before each stretch, a 5 s switch
  between sides, countdown beeps and spoken cues. Back, pause and skip buttons. The screen stays on
  during a session.
- **During each stretch**: an animated demo figure with the working limbs in orange, the target
  muscles, steps, tips and a link to video demos on YouTube.
- **Mobility check**: a self-test per area gives a score, rates each area and suggests focus
  areas; the home screen's one-tap *Today's session* rotates through your tight areas.
- **Staying on track**: streak, this week's days against a weekly goal (Settings), and history.
  A session counts if you finish it or do at least a minute before ending it.

All data stays in the browser on each device (localStorage), so phone and Mac keep separate
history.

## Files

| Path | What it is |
|---|---|
| `index.html` | The page |
| `js/exercises.js` | The 71 stretches: areas, muscles, steps, tips and demo poses |
| `js/check.js` | The mobility check: one self-test per area |
| `js/figure.js` | Draws and animates the demo figure from joint angles, plus wall, chair, step and roller props (format notes at the top) |
| `js/planner.js` | Picks, orders and times the stretches for a session |
| `js/app.js` | Screens, session player, sounds, history |
| `css/style.css` | Styles (light and dark) |
| `sw.js`, `manifest.webmanifest`, `icons/` | Home Screen app and offline support |
| `tests/planner.test.js` | `node tests/planner.test.js`: checks 1,800 random sessions |
| `tests/flow.js` | `node tests/flow.js /tmp/shots [dark]`: clicks through the app and saves screenshots |
| `scripts/contact-sheet.html` | Shows every stretch's animation as stills, for checking poses |

The test scripts borrow Playwright from `../travel-tracker/node_modules` and drive Google Chrome
with sound muted.

## Changing things

- **Add a stretch**: add an entry to `js/exercises.js`, then check its poses with
  `node scripts/shoot.js "file://$PWD/scripts/contact-sheet.html?only=<id>" /tmp/cs.png` and run
  the planner test.
- **After any change to a hosted copy**: bump `VERSION` in `sw.js` so phones fetch the new files.
  The update shows the second time the app is opened.

## Running it

- **On the Mac**: open `index.html` in a browser. Everything works except offline caching.
- **On iPhone**: it needs to be served over HTTPS for offline use, eg free GitHub Pages. Open the
  URL in Safari → Share → Add to Home Screen.
