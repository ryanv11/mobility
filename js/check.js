/* The mobility check: one quick self-test per focus area. Each answer scores
   0 (tight), 1 (getting there) or 2 (good). Figures reuse a stretch's demo or define their own. */
(function (root) {
  'use strict';
  const M = (root.Mobility = root.Mobility || {});

  M.LEVELS = ['Tight', 'Getting there', 'Good'];

  M.CHECKS = [
    {
      area: 'neck', name: 'Chin to chest', figure: 'neck-nod', position: 'standing',
      steps: ['Sit or stand tall with your mouth closed.', 'Slowly lower your chin towards your chest without rounding your back.'],
      options: ['More than two fingers’ gap', 'One or two fingers’ gap', 'Chin touches chest'],
    },
    {
      area: 'shoulders', name: 'Back scratch', position: 'standing',
      steps: ['Reach one hand over your shoulder and down your back.', 'Reach the other hand up your back from below.', 'Try both ways round and go by your harder side.'],
      options: ['Fingertips more than a hand apart', 'Fingertips within a hand of each other', 'Fingertips touch or overlap'],
      fig: { view: 'front', anchor: 'ankleN', hi: ['armN', 'armF'], frames: [{ uaN: 345, faN: 165, uaF: 160, faF: 320, hF: 320 }] },
    },
    {
      area: 'chest', name: 'Arms overhead at the wall', position: 'standing',
      steps: ['Stand with your heels, bottom and upper back against a wall.', 'Keeping your lower back flat to the wall, raise straight arms overhead.'],
      options: ['Hands stay well away from the wall', 'Thumbs touch only if my back arches', 'Thumbs touch, back stays flat'],
      fig: { anchor: 'ankleN', hi: ['armN', 'upper'], wall: { at: 'hip', dx: -14 }, frames: [{ uaN: -6, faN: -6, uaF: -6, faF: -6 }] },
    },
    {
      area: 'upperBack', name: 'Side-lying rotation', figure: 'open-book', position: 'lying',
      steps: ['Lie on your side, knees bent to 90° and together, arms straight out in front.', 'Open the top arm up and over to the other side, keeping your knees together.'],
      options: ['Top hand stays well off the floor', 'Hand gets close to the floor', 'Hand and shoulder blade reach the floor'],
    },
    {
      area: 'lowerBack', name: 'Side bend reach', position: 'standing',
      steps: ['Stand tall with your arms by your sides.', 'Lean straight sideways, sliding your hand down the outside of your leg. Don’t lean forward.', 'Go by your harder side.'],
      options: ['Fingertips stay above mid-thigh', 'Fingertips reach between mid-thigh and knee', 'Fingertips reach your knee or lower'],
      fig: { view: 'front', anchor: 'ankleN', hi: ['lower', 'upper'], frames: [{ t1: -8, t2: -24, n: -26, uaN: 196, faN: 192, uaF: 160, faF: 160 }] },
    },
    {
      area: 'hipFlexors', name: 'Knee hug, other leg flat', figure: 'knee-chest', position: 'lying',
      steps: ['Lie on your back on the floor or a firm bed.', 'Hug one knee to your chest.', 'Notice the other leg: does the back of the thigh stay on the floor?'],
      options: ['Thigh lifts well off the floor', 'Thigh lifts a little', 'Thigh stays flat'],
    },
    {
      area: 'glutes', name: 'Figure-4 pull', figure: 'figure-four', position: 'lying',
      steps: ['Lie on your back and cross one ankle over the other knee.', 'Hold behind the bottom thigh and draw it towards your chest.'],
      options: ['Can’t cross the ankle comfortably', 'Strong stretch before the thigh is upright', 'Bottom thigh comes upright easily'],
    },
    {
      area: 'innerThighs', name: 'Butterfly knee height', figure: 'butterfly', position: 'seated',
      steps: ['Sit tall with the soles of your feet together, heels about a foot from your hips.', 'Let your knees relax down; don’t push them.'],
      options: ['Knees higher than a hand-width off the floor', 'Knees about a hand-width off the floor', 'Knees within a fist of the floor'],
    },
    {
      area: 'hamstrings', name: 'Toe touch', figure: 'forward-fold', position: 'standing',
      steps: ['Stand with your feet together and knees straight.', 'Fold forward slowly and reach for the floor. Don’t bounce.'],
      options: ['Fingertips stay above my toes', 'Fingertips touch my toes or the floor', 'Palms flat on the floor'],
    },
    {
      area: 'quads', name: 'Lying heel to bottom', figure: 'prone-quad', position: 'lying',
      steps: ['Lie on your front.', 'Bend one knee and hold the ankle, drawing the heel towards your bottom.', 'Go by your harder side.'],
      options: ['Heel more than a hand away', 'Heel within a hand of your bottom', 'Heel touches your bottom'],
    },
    {
      area: 'calves', name: 'Knee to wall', figure: 'ankle-rocks', position: 'kneeling',
      steps: ['Half-kneel facing a wall with your front toes a hand-width (about 10 cm) from it.', 'Keeping the heel down, push the front knee forward to touch the wall.', 'Go by your harder side.'],
      options: ['Can’t touch even with toes closer', 'Can touch only with toes closer', 'Knee touches with the heel down'],
    },
    {
      area: 'wrists', name: 'Prayer hands', position: 'standing',
      steps: ['Press your palms together in front of your chest, fingers up.', 'Keeping the palms together, lower your hands until your forearms are level.'],
      options: ['Palms come apart well before level', 'Forearms nearly level, palms just together', 'Forearms level, palms flat together'],
      fig: { view: 'front', anchor: 'ankleN', hi: ['armN', 'armF'], frames: [{ uaN: 205, faN: 80, hN: 0, uaF: 155, faF: 280, hF: 0 }] },
    },
  ];

  // Something Figure.mount can draw for a check.
  M.checkFigure = (c) => {
    if (c.fig) return { name: c.name, position: c.position, fig: c.fig };
    const ex = M.byId[c.figure];
    return { name: c.name, position: ex.position, fig: ex.fig };
  };
})(typeof window !== 'undefined' ? window : globalThis);
