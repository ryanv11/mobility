/* The stretch library. Each exercise:
     areas     focus areas it mainly works (used to pick it)
     also      areas it works a little (used to fill gaps)
     position  standing | kneeling | seated | lying  (sessions are ordered top to bottom so
               you only get down to the floor once)
     face      for lying: prone, side or supine
     kind      static (a hold) or dynamic (slow, controlled movement)
     sides     true when it's done on each side in turn
     fig       the demonstration figure; see figure.js for the pose format */
(function (root) {
  'use strict';
  const M = (root.Mobility = root.Mobility || {});

  M.AREAS = [
    { id: 'neck', label: 'Neck' },
    { id: 'shoulders', label: 'Shoulders' },
    { id: 'chest', label: 'Chest' },
    { id: 'upperBack', label: 'Upper back' },
    { id: 'lowerBack', label: 'Lower back' },
    { id: 'hipFlexors', label: 'Hip flexors' },
    { id: 'glutes', label: 'Glutes' },
    { id: 'innerThighs', label: 'Inner thighs' },
    { id: 'hamstrings', label: 'Hamstrings' },
    { id: 'quads', label: 'Quads' },
    { id: 'calves', label: 'Calves & ankles' },
    { id: 'wrists', label: 'Wrists & forearms' },
  ];

  M.PRESETS = [
    { id: 'desk', label: 'Desk reset', areas: ['neck', 'shoulders', 'chest', 'upperBack', 'hipFlexors', 'wrists'] },
    { id: 'lower', label: 'Lower body', areas: ['lowerBack', 'hipFlexors', 'glutes', 'innerThighs', 'hamstrings', 'quads', 'calves'] },
    { id: 'all', label: 'Full body', areas: M.AREAS.map((a) => a.id) },
  ];

  // Base poses.
  const ALLFOURS = { t1: 74, t2: 74, n: 95, uaN: 180, faN: 180, hN: 90, uaF: 180, faF: 180, hF: 90, thN: 180, shN: 270, ftN: 270, thF: 180, shF: 270, ftF: 270 };
  const SUPINE = { t1: 270, t2: 270, n: 270, uaN: 90, faN: 90, hN: 90, uaF: 90, faF: 90, hF: 90, thN: 90, shN: 90, thF: 90, shF: 90 };
  const PRONE = { t1: 90, t2: 90, n: 93, uaN: 270, faN: 270, hN: 270, uaF: 270, faF: 270, hF: 270, thN: 270, shN: 270, ftN: 270, thF: 270, shF: 270, ftF: 270 };
  const SEATED = { thN: 90, shN: 90, thF: 90, shF: 90 };
  const ON_HEELS = { thN: 109, shN: 270, ftN: 270, thF: 109, shF: 270, ftF: 270 };
  const TALL_KNEEL = { thN: 180, shN: 270, ftN: 270, thF: 180, shF: 270, ftF: 270 };
  const ARMS_FRONT = { uaN: 186, faN: 186, uaF: 174, faF: 174 };
  const BRIDGE_START = { ...SUPINE, thN: 40, shN: 200, ftN: 90, thF: 42, shF: 202, ftF: 90 };
  const DOWN_DOG = { t1: 130, t2: 130, n: 150, uaN: 130, faN: 130, hN: 90, uaF: 130, faF: 130, hF: 90, thN: 205, shN: 205, ftN: 90, thF: 205, shF: 205, ftF: 90 };

  M.EXERCISES = [
    // ---------- Neck ----------
    {
      id: 'neck-tilt', name: 'Neck side tilt', areas: ['neck'], also: ['shoulders'],
      position: 'standing', kind: 'static', sides: true,
      muscles: ['Upper trapezius', 'Scalenes', 'Levator scapulae'],
      steps: [
        'Stand or sit tall with your shoulders relaxed.',
        'Tilt your ear towards your shoulder until you feel a stretch along the opposite side of your neck.',
        'Reach the opposite hand down towards the floor to deepen it.',
        'Breathe slowly and hold, then lift your head back to centre.',
      ],
      tips: ['Keep your shoulders level; don’t lift the shoulder up to meet your ear.', 'A light hand on top of your head adds a little more, but never pull.'],
      fig: { view: 'front', anchor: 'ankleN', hi: ['neck'], cycle: 6, dwell: 0.45, frames: [{ ...ARMS_FRONT }, { n: -38, uaN: 186, faN: 186, uaF: 166, faF: 166 }] },
    },
    {
      id: 'chin-tuck', name: 'Chin tucks', areas: ['neck'], also: ['upperBack'],
      position: 'standing', kind: 'dynamic', sides: false,
      muscles: ['Deep neck flexors', 'Suboccipitals'],
      steps: [
        'Stand or sit tall and look straight ahead.',
        'Glide your chin straight back, as if making a double chin.',
        'Hold for two seconds, feeling a stretch at the base of your skull.',
        'Release slowly and repeat.',
      ],
      tips: ['Keep your eyes level; this is a slide backwards, not a nod.', 'Great for undoing “screen neck” after a long day at the desk.'],
      fig: { anchor: 'ankleN', hi: ['neck'], cycle: 3, dwell: 0.35, frames: [{ n: 20 }, { n: -8 }] },
    },
    {
      id: 'neck-nod', name: 'Neck nods', areas: ['neck'], also: [],
      position: 'standing', kind: 'dynamic', sides: false,
      muscles: ['Upper trapezius', 'Suboccipitals', 'Sternocleidomastoid'],
      steps: [
        'Stand or sit tall with your shoulders down and back.',
        'Slowly lower your chin towards your chest.',
        'Pause, then lift your gaze up towards the ceiling.',
        'Keep the movement slow and smooth, staying in a comfortable range.',
      ],
      tips: ['Move from the neck only; keep the rest of your spine still.', 'Skip the look-up part if it makes you dizzy.'],
      fig: { anchor: 'ankleN', hi: ['neck'], cycle: 5, dwell: 0.3, frames: [{ n: -28 }, { n: 52 }] },
    },
    {
      id: 'shoulder-rolls', name: 'Shoulder rolls', areas: ['neck', 'shoulders'], also: ['upperBack'],
      position: 'standing', kind: 'dynamic', sides: false,
      muscles: ['Upper trapezius', 'Rhomboids', 'Levator scapulae'],
      steps: [
        'Stand tall with your arms relaxed by your sides.',
        'Shrug your shoulders up towards your ears.',
        'Roll them back, squeezing your shoulder blades together, then down.',
        'Make slow, big circles; switch direction halfway through.',
      ],
      tips: ['Exhale as your shoulders drop.', 'Keep your neck long and your chin level.'],
      fig: {
        anchor: 'ankleN', cycle: 3, dwell: 0, ease: 'linear', mode: 'loop',
        frames: [{}, { s: { t2: 1.08 }, uaN: 176, uaF: 176 }, { s: { t2: 1.04 }, t2: -5, uaN: 192, uaF: 192 }, { s: { t2: 0.97 } }, {}],
      },
    },

    // ---------- Shoulders ----------
    {
      id: 'cross-body', name: 'Cross-body shoulder stretch', areas: ['shoulders'], also: ['upperBack'],
      position: 'standing', kind: 'static', sides: true,
      muscles: ['Posterior deltoid', 'Infraspinatus', 'Rhomboids'],
      steps: [
        'Stand tall and bring one arm straight across your chest.',
        'Hook the other forearm above the elbow, not on the joint.',
        'Gently draw the arm closer to your chest.',
        'Hold, breathing into the back of the shoulder.',
      ],
      tips: ['Keep the stretching shoulder down, away from your ear.', 'Turn your head away from the arm for a little extra.'],
      fig: { view: 'front', anchor: 'ankleN', hi: ['armN'], cycle: 6, dwell: 0.45, frames: [{ ...ARMS_FRONT }, { uaN: 92, faN: 92, uaF: 200, faF: 28 }] },
    },
    {
      id: 'arm-circles', name: 'Arm circles', areas: ['shoulders'], also: ['chest'],
      position: 'standing', kind: 'dynamic', sides: false,
      muscles: ['Deltoids', 'Rotator cuff', 'Pectorals'],
      steps: [
        'Stand tall with your feet hip-width apart.',
        'Swing both arms forward, up, back and down in big, slow circles.',
        'Keep your ribs down so your back doesn’t arch.',
        'Reverse the direction halfway through.',
      ],
      tips: ['Start small and let the circles grow as you warm up.', 'Keep it smooth; no flinging.'],
      fig: {
        anchor: 'ankleN', hi: ['armN', 'armF'], cycle: 3, dwell: 0, ease: 'linear', mode: 'loop',
        frames: [
          { uaN: 180, faN: 180, uaF: 180, faF: 180 },
          { uaN: 90, faN: 90, uaF: 90, faF: 90 },
          { uaN: 0, faN: 0, uaF: 0, faF: 0 },
          { uaN: -90, faN: -90, uaF: -90, faF: -90 },
          { uaN: -180, faN: -180, uaF: -180, faF: -180 },
        ],
      },
    },
    {
      id: 'triceps', name: 'Overhead triceps stretch', areas: ['shoulders'], also: ['upperBack'],
      position: 'standing', kind: 'static', sides: true,
      muscles: ['Triceps', 'Latissimus dorsi', 'Teres major'],
      steps: [
        'Reach one arm straight up, then bend the elbow so your hand drops behind your head.',
        'Hold that elbow with your other hand.',
        'Gently ease the elbow back and towards your head.',
        'Hold, then lower the arm slowly.',
      ],
      tips: ['Keep your head up; don’t let the arm push it forward.', 'Lean slightly away from the arm to reach into the side of your back.'],
      fig: { view: 'front', anchor: 'ankleN', hi: ['armN'], cycle: 6, dwell: 0.45, frames: [{ ...ARMS_FRONT }, { uaN: 345, faN: 160, uaF: 8, faF: 268 }] },
    },
    {
      id: 'thread-needle', name: 'Thread the needle', areas: ['upperBack', 'shoulders'], also: [],
      position: 'kneeling', kind: 'static', sides: true,
      muscles: ['Rhomboids', 'Posterior deltoid', 'Thoracic rotators'],
      steps: [
        'Start on hands and knees, hands under shoulders and knees under hips.',
        'Reach one arm up to the ceiling, opening your chest.',
        'Sweep that arm under your body and along the floor, lowering your shoulder and temple.',
        'Rest there and breathe; let your upper back unwind.',
      ],
      tips: ['Keep your hips over your knees rather than sitting back.', 'Press gently through the planted hand.'],
      fig: {
        anchor: 'kneeN', hi: ['armN', 'upper'], cycle: 7, dwell: 0.4,
        frames: [{ ...ALLFOURS, t2: 66, n: 40, uaN: -10, faN: -10, hN: -10 }, { ...ALLFOURS, t2: 100, n: 150, uaN: 215, faN: 250, hN: 250, uaF: 140, faF: 215, hF: 90 }],
      },
    },
    {
      id: 'puppy', name: 'Puppy pose', areas: ['shoulders', 'upperBack'], also: ['chest'],
      position: 'kneeling', kind: 'static', sides: false,
      muscles: ['Latissimus dorsi', 'Pectorals', 'Thoracic extensors'],
      steps: [
        'Start on hands and knees.',
        'Walk your hands forward, keeping your hips stacked over your knees.',
        'Lower your chest and forehead towards the floor with your arms long.',
        'Breathe into your upper back and armpits.',
      ],
      tips: ['A cushion under your forehead makes this more comfortable.', 'Keep a small bend in the elbows if your shoulders pinch.'],
      fig: {
        anchor: 'kneeN', hi: ['upper', 'armN'], cycle: 6, dwell: 0.45,
        frames: [{ ...ALLFOURS }, { ...TALL_KNEEL, t1: 118, t2: 122, n: 100, uaN: 96, faN: 93, hN: 93, uaF: 96, faF: 93, hF: 93 }],
      },
    },

    // ---------- Chest ----------
    {
      id: 'doorway', name: 'Doorway chest stretch', areas: ['chest'], also: ['shoulders'],
      position: 'standing', kind: 'static', sides: true,
      muscles: ['Pectoralis major', 'Pectoralis minor', 'Anterior deltoid'],
      steps: [
        'Stand in a doorway and place your forearm on the frame, elbow at shoulder height.',
        'Step forward with the leg on the same side.',
        'Lean gently through the doorway until you feel the front of the chest open.',
        'Hold, keeping your chest lifted.',
      ],
      tips: ['Move the elbow higher or lower to change where you feel it.', 'Keep your shoulder down; stop if you feel tingling in the arm.'],
      fig: {
        anchor: 'elbowN', hi: ['armN', 'upper'], cycle: 6, dwell: 0.45, wall: { at: 'wristN', dx: -3 },
        frames: [{ uaN: 270, faN: 0, hN: 0 }, { uaN: 270, faN: 0, hN: 0, t1: 6, t2: 8, thN: 165, shN: 185, thF: 195, shF: 195, ftF: 90 }],
      },
    },
    {
      id: 'clasp-chest', name: 'Clasped-hands chest opener', areas: ['chest'], also: ['shoulders'],
      position: 'standing', kind: 'static', sides: false,
      muscles: ['Pectorals', 'Anterior deltoids', 'Biceps'],
      steps: [
        'Stand tall and clasp your hands behind your back.',
        'Straighten your arms and draw your shoulder blades together.',
        'Lift your hands slightly away from your back as your chest rises.',
        'Hold and breathe into the front of your chest.',
      ],
      tips: ['Hold a towel between your hands if they don’t meet.', 'Keep your chin level; don’t crank your head back.'],
      fig: { anchor: 'ankleN', hi: ['upper', 'armN'], cycle: 6, dwell: 0.45, frames: [{}, { uaN: 215, faN: 208, uaF: 215, faF: 208, t2: -8, n: -12 }] },
    },
    {
      id: 'open-hug', name: 'Open-and-hug arm swings', areas: ['chest', 'upperBack'], also: ['shoulders'],
      position: 'standing', kind: 'dynamic', sides: false,
      muscles: ['Pectorals', 'Rhomboids', 'Trapezius'],
      steps: [
        'Stand tall with your arms out wide at shoulder height.',
        'Swing your arms in to hug yourself, crossing them in front of your chest.',
        'Swing them back out wide, opening your chest.',
        'Alternate which arm is on top each time.',
      ],
      tips: ['Let your shoulder blades spread on the hug and squeeze on the open.', 'Keep the movement relaxed and rhythmic.'],
      fig: {
        view: 'front', anchor: 'ankleN', hi: ['upper'], cycle: 3, dwell: 0.15,
        frames: [{ uaN: 275, faN: 278, uaF: 85, faF: 82 }, { uaN: 122, faN: 78, uaF: 238, faF: 282 }],
      },
    },

    // ---------- Upper back ----------
    {
      id: 'cat-cow', name: 'Cat–cow', areas: ['upperBack', 'lowerBack'], also: [],
      position: 'kneeling', kind: 'dynamic', sides: false,
      muscles: ['Erector spinae', 'Rhomboids', 'Abdominals'],
      steps: [
        'Start on hands and knees with a neutral spine.',
        'Breathe in: drop your belly, lift your chest and look forward (cow).',
        'Breathe out: round your back up to the ceiling and tuck your chin (cat).',
        'Flow slowly between the two with your breath.',
      ],
      tips: ['Move one vertebra at a time, starting from the tailbone.', 'Keep your arms straight and the movement in your spine.'],
      fig: { anchor: 'kneeN', hi: ['upper', 'lower'], cycle: 5, dwell: 0.25, frames: [{ ...ALLFOURS, t1: 95, t2: 52, n: 40 }, { ...ALLFOURS, t1: 55, t2: 90, n: 150 }] },
    },
    {
      id: 'open-book', name: 'Open book', areas: ['upperBack'], also: ['chest', 'shoulders'],
      position: 'lying', face: 'side', kind: 'dynamic', sides: true,
      muscles: ['Thoracic rotators', 'Pectorals', 'Obliques'],
      steps: [
        'Lie on your side with hips and knees bent to 90°, arms straight out in front.',
        'Keeping your knees together, lift the top arm up and over your body.',
        'Follow your hand with your eyes and let your chest open towards the ceiling.',
        'Pause, breathe out, then bring the arm back to meet the other.',
      ],
      tips: ['Keep your knees stacked; the twist should come from your upper back.', 'A pillow under your head keeps your neck comfortable.'],
      fig: {
        top: true, anchor: 'hip', hi: ['armN', 'upper'], cycle: 7, dwell: 0.35,
        frames: [
          { t1: 90, t2: 90, n: 90, thN: 180, shN: 270, ftN: 270, thF: 180, shF: 270, ftF: 270, s: { ftN: 0.5, ftF: 0.5 } },
          { t1: 90, t2: 90, n: 90, thN: 180, shN: 270, ftN: 270, thF: 180, shF: 270, ftF: 270, s: { ftN: 0.5, ftF: 0.5, uaN: 0.08, faN: 0.08, hN: 0.08 }, d: 0 },
          { t1: 90, t2: 90, n: 90, thN: 180, shN: 270, ftN: 270, thF: 180, shF: 270, ftF: 270, s: { ftN: 0.5, ftF: 0.5, uaN: 0.08, faN: 0.08, hN: 0.08 }, uaN: 0, faN: 0, d: 0, w: 0.15 },
          { t1: 90, t2: 90, n: 90, thN: 180, shN: 270, ftN: 270, thF: 180, shF: 270, ftF: 270, s: { ftN: 0.5, ftF: 0.5 }, uaN: 0, faN: 0 },
        ],
      },
    },
    {
      id: 'side-bend', name: 'Standing side bend', areas: ['upperBack'], also: ['lowerBack', 'shoulders'],
      position: 'standing', kind: 'static', sides: true,
      muscles: ['Latissimus dorsi', 'Obliques', 'Quadratus lumborum'],
      steps: [
        'Stand with your feet hip-width apart.',
        'Reach one arm overhead and slide the other hand down the side of your leg.',
        'Lean sideways, lengthening from your hip to your fingertips.',
        'Hold, breathing into the side ribs.',
      ],
      tips: ['Lean straight sideways, not forwards.', 'Keep both feet heavy on the floor.'],
      fig: {
        view: 'front', anchor: 'ankleN', hi: ['upper', 'armF'], cycle: 6, dwell: 0.45,
        frames: [{ ...ARMS_FRONT }, { t1: -6, t2: -22, n: -28, uaN: 192, faN: 196, uaF: -25, faF: -48 }],
      },
    },
    {
      id: 'backbend', name: 'Standing backbend', areas: ['lowerBack'], also: ['chest', 'hipFlexors'],
      position: 'standing', kind: 'static', sides: false,
      muscles: ['Abdominals', 'Hip flexors', 'Spinal extensors'],
      steps: [
        'Stand with your feet hip-width apart and your hands on your lower back, fingers pointing down.',
        'Lift your chest and gently lean back, pressing your hips forward.',
        'Go only as far as feels easy, then hold.',
        'Come back up slowly, leading with your chest.',
      ],
      tips: ['Squeeze your glutes lightly to protect your lower back.', 'Keep your neck in line rather than dropping your head back.'],
      fig: {
        anchor: 'ankleN', hi: ['lower', 'upper'], cycle: 6, dwell: 0.45,
        frames: [{ uaN: 205, faN: 172, hN: 150, uaF: 205, faF: 172, hF: 150 }, { uaN: 212, faN: 172, hN: 150, uaF: 212, faF: 172, hF: 150, t1: -8, t2: -22, n: -30, thN: 173, thF: 173, shN: 183, shF: 183 }],
      },
    },

    // ---------- Lower back ----------
    {
      id: 'knee-chest', name: 'Knee to chest', areas: ['lowerBack', 'glutes'], also: [],
      position: 'lying', face: 'supine', kind: 'static', sides: true,
      muscles: ['Gluteus maximus', 'Lumbar erectors', 'Hamstrings'],
      steps: [
        'Lie on your back with both knees bent and feet flat.',
        'Draw one knee up towards your chest.',
        'Hold behind the thigh or on top of the shin and gently pull it closer.',
        'Straighten the other leg along the floor if that’s comfortable.',
      ],
      tips: ['Keep your head and shoulders relaxed on the floor.', 'Hold behind the thigh if pressure on the knee is uncomfortable.'],
      fig: {
        anchor: 'hip', hi: ['lower', 'legN'], cycle: 6, dwell: 0.45,
        frames: [{ ...SUPINE, thN: 40, shN: 200, ftN: 90 }, { ...SUPINE, thN: -35, shN: 65, uaN: 55, faN: 20, uaF: 55, faF: 20 }],
      },
    },
    {
      id: 'double-knee', name: 'Double knee hug', areas: ['lowerBack'], also: ['glutes'],
      position: 'lying', face: 'supine', kind: 'static', sides: false,
      muscles: ['Lumbar erectors', 'Gluteus maximus', 'Quadratus lumborum'],
      steps: [
        'Lie on your back and draw both knees to your chest.',
        'Wrap your arms around your shins.',
        'Gently hug them closer as you breathe out.',
        'Rock slowly side to side if it feels good.',
      ],
      tips: ['Let your tailbone stay heavy on the floor.', 'Relax your jaw and shoulders.'],
      fig: {
        anchor: 'hip', hi: ['lower'], cycle: 5, dwell: 0.35,
        frames: [{ ...SUPINE, thN: -25, shN: 70, thF: -23, shF: 72, uaN: 55, faN: 22, uaF: 55, faF: 22 }, { ...SUPINE, thN: -42, shN: 55, thF: -40, shF: 57, uaN: 52, faN: 12, uaF: 52, faF: 12 }],
      },
    },
    {
      id: 'child-pose', name: 'Child’s pose', areas: ['lowerBack'], also: ['upperBack', 'shoulders', 'glutes'],
      position: 'kneeling', kind: 'static', sides: false,
      muscles: ['Lumbar erectors', 'Latissimus dorsi', 'Gluteus maximus'],
      steps: [
        'Kneel and sit back towards your heels, knees together or a little apart.',
        'Fold forward, walking your hands out in front.',
        'Rest your forehead on the floor and let your arms lie long.',
        'Breathe into your back and let your hips sink.',
      ],
      tips: ['Put a cushion between your hips and heels if they don’t meet.', 'Widen your knees to make room for your belly and hips.'],
      fig: {
        anchor: 'kneeN', hi: ['lower', 'upper'], cycle: 7, dwell: 0.45,
        frames: [{ ...ON_HEELS, uaN: 0, faN: 0, uaF: 0, faF: 0 }, { ...ON_HEELS, t1: 78, t2: 96, n: 110, uaN: 100, faN: 95, hN: 92, uaF: 100, faF: 95, hF: 92 }],
      },
    },
    {
      id: 'sphinx', name: 'Sphinx stretch', areas: ['lowerBack'], also: ['hipFlexors', 'chest'],
      position: 'lying', face: 'prone', kind: 'static', sides: false,
      muscles: ['Abdominals', 'Hip flexors', 'Spinal extensors'],
      steps: [
        'Lie on your front with your legs long.',
        'Bring your elbows under your shoulders, forearms flat and parallel.',
        'Press into your forearms to lift your chest, keeping your hips down.',
        'Hold, lengthening through the crown of your head.',
      ],
      tips: ['Relax your glutes and lower back; let the floor take your weight.', 'Slide your elbows further forward if it’s too intense.'],
      fig: {
        anchor: 'hip', hi: ['lower'], cycle: 6, dwell: 0.45,
        frames: [{ ...PRONE, uaN: 90, faN: 90, hN: 90, uaF: 90, faF: 90, hF: 90 }, { ...PRONE, t1: 78, t2: 45, n: 15, uaN: 180, faN: 90, hN: 90, uaF: 180, faF: 90, hF: 90 }],
      },
    },
    {
      id: 'supine-twist', name: 'Supine twist', areas: ['lowerBack'], also: ['glutes', 'upperBack', 'chest'],
      position: 'lying', face: 'supine', kind: 'static', sides: true,
      muscles: ['Obliques', 'Lumbar erectors', 'Gluteus medius'],
      steps: [
        'Lie on your back with your knees bent and feet flat, arms out in a T.',
        'Let both knees drop slowly to one side.',
        'Turn your head the other way if your neck is happy.',
        'Keep both shoulders heavy on the floor and breathe.',
      ],
      tips: ['Rest your knees on a cushion if they don’t reach the floor.', 'The aim is a gentle unwinding, not a forced twist.'],
      fig: {
        view: 'front', top: true, anchor: 'hip', hi: ['lower'], cycle: 7, dwell: 0.45,
        frames: [
          { t1: 270, t2: 270, n: 270, uaN: 180, faN: 180, uaF: 0, faF: 0, thN: 90, shN: 270, ftN: 270, thF: 90, shF: 270, ftF: 270, s: { thN: 0.75, shN: 0.35, thF: 0.75, shF: 0.35, ftN: 0.4, ftF: 0.4 } },
          { t1: 270, t2: 270, n: 270, uaN: 180, faN: 180, uaF: 0, faF: 0, thN: 140, shN: 232, ftN: 232, thF: 132, shF: 224, ftF: 224, s: { ftN: 0.4, ftF: 0.4 } },
        ],
      },
    },

    // ---------- Glutes ----------
    {
      id: 'glute-bridge', name: 'Glute bridge', areas: ['glutes', 'hipFlexors'], also: ['lowerBack'],
      position: 'lying', face: 'supine', kind: 'dynamic', sides: false,
      muscles: ['Gluteus maximus', 'Hip flexors', 'Hamstrings'],
      steps: [
        'Lie on your back, knees bent, feet flat and hip-width apart.',
        'Press through your heels and squeeze your glutes to lift your hips.',
        'Stop when your shoulders, hips and knees form a straight line.',
        'Pause, then lower slowly one vertebra at a time.',
      ],
      tips: ['Push the floor away with your heels, not your toes.', 'Keep your ribs down so the lift comes from your hips, not your lower back.'],
      fig: {
        anchor: 'ankleN', hi: ['lower', 'legN'], cycle: 4, dwell: 0.3,
        frames: [{ ...BRIDGE_START }, { ...BRIDGE_START, t1: 248, t2: 250, n: 272, thN: 80, shN: 198, thF: 82, shF: 200 }],
      },
    },
    {
      id: 'figure-four', name: 'Figure-4 stretch', areas: ['glutes'], also: ['lowerBack'],
      position: 'lying', face: 'supine', kind: 'static', sides: true,
      muscles: ['Piriformis', 'Gluteus maximus', 'Gluteus medius'],
      steps: [
        'Lie on your back with knees bent and feet flat.',
        'Cross one ankle over the opposite knee, letting the top knee fall open.',
        'Lift the bottom foot and hold behind that thigh.',
        'Gently draw the thigh towards you until you feel it in the glute of the crossed leg.',
      ],
      tips: ['Flex the foot of the crossed leg to protect the knee.', 'Keep your head and tailbone down on the floor.'],
      fig: {
        anchor: 'hip', hi: ['legN'], cycle: 6, dwell: 0.45,
        frames: [
          { ...SUPINE, thF: 40, shF: 200, ftF: 90, thN: 75, shN: 2, ftN: 92, s: { thN: 0.65, shN: 0.63 } },
          { ...SUPINE, thF: 0, shF: 90, thN: 30, shN: 328, ftN: 60, uaN: 70, faN: 50, uaF: 70, faF: 50, s: { thN: 0.6, shN: 0.6 } },
        ],
      },
    },
    {
      id: 'pigeon', name: 'Pigeon pose', areas: ['glutes'], also: ['hipFlexors'],
      position: 'kneeling', kind: 'static', sides: true,
      muscles: ['Piriformis', 'Gluteus maximus', 'Hip flexors (back leg)'],
      steps: [
        'From hands and knees, bring one knee forward behind your wrist, shin angled across the mat.',
        'Slide the other leg straight back, top of the foot on the floor.',
        'Square your hips and walk your hands forward.',
        'Lower onto your forearms or forehead and breathe into the front hip.',
      ],
      tips: ['Put a cushion under the front hip if it doesn’t reach the floor.', 'Ease out if you feel any pinching in the front knee.'],
      fig: {
        anchor: 'kneeN', hi: ['legN'], cycle: 7, dwell: 0.45,
        frames: [
          { thN: 95, shN: 200, ftN: 270, thF: 265, shF: 270, ftF: 270, uaN: 175, faN: 175, hN: 90, uaF: 175, faF: 175, hF: 90, s: { thN: 0.95, shN: 0.35, ftN: 0.5 } },
          { thN: 95, shN: 200, ftN: 270, thF: 265, shF: 270, ftF: 270, t1: 70, t2: 90, n: 110, uaN: 125, faN: 92, hN: 92, uaF: 125, faF: 92, hF: 92, s: { thN: 0.95, shN: 0.35, ftN: 0.5 } },
        ],
      },
    },
    {
      id: 'deep-squat', name: 'Deep squat hold', areas: ['glutes', 'innerThighs', 'calves'], also: ['lowerBack'],
      position: 'standing', kind: 'static', sides: false,
      muscles: ['Adductors', 'Gluteus maximus', 'Soleus', 'Lower back'],
      steps: [
        'Stand with your feet a little wider than your hips, toes turned slightly out.',
        'Sit your hips down between your heels, keeping your chest up.',
        'Bring your palms together and use your elbows to ease your knees apart.',
        'Hold, keeping your heels down and breathing slowly.',
      ],
      tips: ['Hold onto something solid in front of you, or put a book under your heels, if you tip backwards.', 'Let your back round slightly; you don’t have to stay bolt upright.'],
      fig: {
        anchor: 'ankleN', hi: ['legN', 'lower'], cycle: 7, dwell: 0.45,
        frames: [
          { uaN: 90, faN: 90, uaF: 90, faF: 90 },
          { thN: 80, shN: 215, ftN: 90, thF: 82, shF: 213, ftF: 90, t1: 40, t2: 30, n: 20, uaN: 150, faN: 10, hN: 10, uaF: 150, faF: 10, hF: 10 },
        ],
      },
    },

    // ---------- Hip flexors ----------
    {
      id: 'hip-flexor', name: 'Half-kneeling hip flexor stretch', areas: ['hipFlexors'], also: ['quads'],
      position: 'kneeling', kind: 'static', sides: true,
      muscles: ['Iliopsoas', 'Rectus femoris', 'Tensor fasciae latae'],
      steps: [
        'Kneel on one knee with the other foot flat in front, both knees at 90°.',
        'Tuck your tailbone under and squeeze the glute of the kneeling leg.',
        'Shift your hips forward until you feel the front of that hip stretch.',
        'Reach the arm on the kneeling side overhead for more.',
      ],
      tips: ['Pad the knee with a folded towel.', 'Keep your torso upright; don’t arch your lower back to go further.'],
      fig: {
        anchor: 'kneeN', hi: ['legN'], cycle: 6, dwell: 0.45,
        frames: [
          { thN: 190, shN: 270, ftN: 270, thF: 95, shF: 180, ftF: 90 },
          { thN: 215, shN: 270, ftN: 270, thF: 88, shF: 207, ftF: 90, uaN: -5, faN: -5, uaF: 175, faF: 175 },
        ],
      },
    },
    {
      id: 'leg-swings', name: 'Leg swings', areas: ['hipFlexors', 'hamstrings'], also: ['glutes'],
      position: 'standing', kind: 'dynamic', sides: true,
      muscles: ['Hip flexors', 'Hamstrings', 'Gluteus maximus'],
      steps: [
        'Stand side-on to a wall with a hand on it for balance.',
        'Swing your outside leg forward and back like a pendulum.',
        'Let the swings grow a little bigger each time.',
        'Keep your standing leg soft and your torso tall.',
      ],
      tips: ['Control the swing; you shouldn’t feel any jerk at the top.', 'Keep your hips facing forward.'],
      fig: {
        anchor: 'ankleF', hi: ['legN'], cycle: 2, dwell: 0.05, wall: { at: 'handF', dx: 4 },
        frames: [{ thN: 215, shN: 205, uaF: 90, faF: 90, hF: 0, uaN: 150, faN: 150 }, { thN: 110, shN: 122, uaF: 90, faF: 90, hF: 0, uaN: 205, faN: 205 }],
      },
    },
    {
      id: 'worlds-greatest', name: 'World’s greatest stretch', areas: ['hipFlexors', 'upperBack'], also: ['hamstrings', 'innerThighs'],
      position: 'kneeling', kind: 'dynamic', sides: true,
      muscles: ['Hip flexors', 'Adductors', 'Thoracic rotators', 'Hamstrings'],
      steps: [
        'Step into a long lunge, back leg straight, and place both hands on the floor inside your front foot.',
        'Sink your hips low and keep the back knee lifted.',
        'Rotate your chest and reach the inside arm up to the ceiling, eyes following your hand.',
        'Bring the hand back down and repeat slowly.',
      ],
      tips: ['Drop the back knee to the floor to make it easier.', 'Push the back heel away to keep the back leg active.'],
      fig: {
        anchor: 'ankleN', hi: ['legF', 'upper'], cycle: 5, dwell: 0.3,
        frames: [
          { thN: 100, shN: 195, ftN: 90, thF: 240, shF: 240, ftF: 250, t1: 75, t2: 75, n: 100, uaN: 180, faN: 180, hN: 90, uaF: 180, faF: 180, hF: 90 },
          { thN: 100, shN: 195, ftN: 90, thF: 240, shF: 240, ftF: 250, t1: 75, t2: 62, n: 25, uaN: -8, faN: -8, hN: -8, uaF: 180, faF: 180, hF: 90 },
        ],
      },
    },

    // ---------- Inner thighs ----------
    {
      id: 'butterfly', name: 'Butterfly stretch', areas: ['innerThighs'], also: ['glutes'],
      position: 'seated', kind: 'static', sides: false,
      muscles: ['Adductors', 'Gracilis', 'Hip external rotators'],
      steps: [
        'Sit tall and bring the soles of your feet together, knees falling out to the sides.',
        'Hold your feet or ankles.',
        'Let your knees sink towards the floor; don’t push them.',
        'For more, hinge forward from the hips with a long back.',
      ],
      tips: ['Sit on a folded towel if your back rounds.', 'Move your feet further away to ease off.'],
      fig: {
        view: 'front', anchor: 'hip', hi: ['legN', 'legF'], cycle: 7, dwell: 0.45,
        frames: [
          { thN: 285, shN: 118, ftN: 118, thF: 75, shF: 242, ftF: 242, uaN: 176, faN: 172, uaF: 184, faF: 188, s: { ftN: 0.5, ftF: 0.5 } },
          { thN: 265, shN: 93, ftN: 93, thF: 95, shF: 267, ftF: 267, uaN: 176, faN: 172, uaF: 184, faF: 188, s: { t1: 0.86, t2: 0.82, ftN: 0.5, ftF: 0.5 } },
        ],
      },
    },
    {
      id: 'side-lunge', name: 'Side lunge stretch', areas: ['innerThighs'], also: ['glutes'],
      position: 'standing', kind: 'static', sides: true,
      muscles: ['Adductors', 'Gracilis', 'Medial hamstrings'],
      steps: [
        'Stand with your feet wide, toes pointing forward.',
        'Bend one knee and sit your hips back over that heel.',
        'Keep the other leg straight with the foot flat until you feel its inner thigh stretch.',
        'Hold with your chest up, then shift slowly back to centre.',
      ],
      tips: ['Keep the bent knee tracking over your toes.', 'Rest your hands on the bent thigh for balance.'],
      fig: {
        view: 'front', anchor: 'ankleN', hi: ['legF'], cycle: 6, dwell: 0.45,
        frames: [
          { thN: 200, shN: 200, thF: 160, shF: 160, uaN: 210, faN: 130, uaF: 150, faF: 230 },
          { thN: 230, shN: 144, thF: 141.5, shF: 141.5, t1: -4, t2: -4, uaN: 210, faN: 130, uaF: 150, faF: 230, s: { thF: 0.92, shF: 0.92 } },
        ],
      },
    },
    {
      id: 'wide-fold', name: 'Wide-leg forward fold', areas: ['innerThighs', 'hamstrings'], also: ['lowerBack'],
      position: 'standing', kind: 'static', sides: false,
      muscles: ['Adductors', 'Hamstrings', 'Lower back'],
      steps: [
        'Stand with your feet wide and parallel.',
        'Hinge forward from the hips with a long spine.',
        'Let your hands come to the floor, your shins or a chair.',
        'Relax your head and let your upper body hang.',
      ],
      tips: ['Bend your knees a little if your lower back complains.', 'Come up slowly with a flat back to avoid a head rush.'],
      fig: {
        view: 'front', anchor: 'ankleN', hi: ['legN', 'legF'], cycle: 7, dwell: 0.45,
        frames: [
          { thN: 205, shN: 205, thF: 155, shF: 155, t1: 180, t2: 180, n: 180, uaN: 232, faN: 140, uaF: 128, faF: 220, s: { t1: 0.5, t2: 0.5 } },
          { thN: 205, shN: 205, thF: 155, shF: 155, t1: 180, t2: 180, n: 180, uaN: 240, faN: 135, uaF: 120, faF: 225, s: { t1: 0.62, t2: 0.62 } },
        ],
      },
    },
    {
      id: 'straddle', name: 'Seated straddle', areas: ['innerThighs', 'hamstrings'], also: ['lowerBack'],
      position: 'seated', kind: 'static', sides: false,
      muscles: ['Adductors', 'Hamstrings', 'Lower back'],
      steps: [
        'Sit with your legs out wide in a V, kneecaps pointing up.',
        'Sit up tall, hands on the floor in front of you.',
        'Walk your hands forward, hinging from the hips.',
        'Stop where you feel a good stretch and breathe.',
      ],
      tips: ['A folded towel under your hips helps you tilt forward.', 'Keep your toes pointing to the ceiling, not rolling in.'],
      fig: {
        view: 'front', anchor: 'hip', hi: ['legN', 'legF'], cycle: 7, dwell: 0.45,
        frames: [
          { thN: 258, shN: 258, ftN: 0, thF: 102, shF: 102, ftF: 0, uaN: 196, faN: 196, uaF: 164, faF: 164, s: { ftN: 0.8, ftF: 0.8 } },
          { thN: 258, shN: 258, ftN: 0, thF: 102, shF: 102, ftF: 0, uaN: 238, faN: 248, uaF: 122, faF: 112, s: { t1: 0.6, t2: 0.55, ftN: 0.8, ftF: 0.8 } },
        ],
      },
    },

    // ---------- Hamstrings ----------
    {
      id: 'forward-fold', name: 'Standing forward fold', areas: ['hamstrings'], also: ['lowerBack', 'calves'],
      position: 'standing', kind: 'static', sides: false,
      muscles: ['Hamstrings', 'Calves', 'Lower back'],
      steps: [
        'Stand with your feet hip-width apart and reach your arms up.',
        'Hinge at the hips and fold forward, letting your arms come down.',
        'Bend your knees as much as you need to let your belly rest towards your thighs.',
        'Let your head hang heavy and breathe.',
      ],
      tips: ['Shift your weight slightly towards your toes.', 'Roll up slowly, stacking one vertebra at a time.'],
      fig: {
        anchor: 'ankleN', hi: ['legN', 'lower'], cycle: 7, dwell: 0.45,
        frames: [{ uaN: 0, faN: 0, uaF: 0, faF: 0 }, { t1: 100, t2: 135, n: 160, uaN: 180, faN: 180, hN: 90, uaF: 180, faF: 180, hF: 90, thN: 168, thF: 168 }],
      },
    },
    {
      id: 'seated-fold', name: 'Seated forward fold', areas: ['hamstrings'], also: ['lowerBack', 'calves'],
      position: 'seated', kind: 'static', sides: false,
      muscles: ['Hamstrings', 'Calves', 'Lower back'],
      steps: [
        'Sit with your legs straight out in front, feet flexed.',
        'Reach your arms up and sit tall.',
        'Hinge forward from your hips, reaching towards your feet.',
        'Rest your hands wherever they land and breathe.',
      ],
      tips: ['Lead with your chest rather than rounding your head to your knees.', 'Bend your knees slightly if you feel it behind the knee.'],
      fig: {
        anchor: 'hip', hi: ['legN', 'lower'], cycle: 7, dwell: 0.45,
        frames: [{ ...SEATED, uaN: 0, faN: 0, uaF: 0, faF: 0 }, { ...SEATED, t1: 55, t2: 75, n: 100, uaN: 100, faN: 95, uaF: 100, faF: 95 }],
      },
    },
    {
      id: 'supine-hamstring', name: 'Lying hamstring stretch', areas: ['hamstrings'], also: ['calves'],
      position: 'lying', face: 'supine', kind: 'static', sides: true,
      muscles: ['Hamstrings', 'Gastrocnemius'],
      steps: [
        'Lie on your back with both legs long.',
        'Lift one leg and hold behind the thigh or calf (or loop a towel round the foot).',
        'Straighten the leg towards the ceiling until you feel the back of it stretch.',
        'Keep the other leg relaxed along the floor.',
      ],
      tips: ['A towel or strap lets you keep your shoulders on the floor.', 'Pull your toes towards you to include the calf.'],
      fig: {
        anchor: 'hip', hi: ['legN'], cycle: 6, dwell: 0.45,
        frames: [{ ...SUPINE, thN: 0, shN: 90, ftN: 0, uaN: 70, faN: 75, uaF: 70, faF: 75 }, { ...SUPINE, thN: -8, shN: -8, uaN: 55, faN: 58, uaF: 55, faF: 58 }],
      },
    },
    {
      id: 'runners-stretch', name: 'Half-kneeling hamstring stretch', areas: ['hamstrings'], also: ['calves'],
      position: 'kneeling', kind: 'static', sides: true,
      muscles: ['Hamstrings', 'Gastrocnemius'],
      steps: [
        'Kneel on one knee and straighten the other leg out in front, heel on the floor.',
        'Flex the front foot so your toes point up.',
        'Keep your back long and hinge forward over the straight leg.',
        'Rest your hands on the floor either side and hold.',
      ],
      tips: ['Sit your hips back to deepen it rather than rounding your back.', 'A little bend in the front knee is fine.'],
      fig: {
        anchor: 'kneeF', hi: ['legN'], cycle: 6, dwell: 0.45,
        frames: [
          { thF: 180, shF: 270, ftF: 270, thN: 121, shN: 121, t1: 10, t2: 10, n: 15, uaN: 150, faN: 110, uaF: 150, faF: 110 },
          { thF: 180, shF: 270, ftF: 270, thN: 121, shN: 121, t1: 60, t2: 80, n: 100, uaN: 160, faN: 160, hN: 90, uaF: 160, faF: 160, hF: 90 },
        ],
      },
    },
    {
      id: 'down-dog', name: 'Downward dog', areas: ['hamstrings', 'calves'], also: ['shoulders'],
      position: 'kneeling', kind: 'static', sides: false,
      muscles: ['Hamstrings', 'Calves', 'Latissimus dorsi', 'Shoulders'],
      steps: [
        'Start on hands and knees, then tuck your toes.',
        'Lift your hips up and back so your body makes an upside-down V.',
        'Press your hands into the floor and let your head hang between your arms.',
        'Pedal your feet, bending one knee then the other, then hold.',
      ],
      tips: ['Keep your knees bent if your back rounds; a long spine matters more than straight legs.', 'Spread your fingers wide to take pressure off your wrists.'],
      fig: {
        anchor: 'handN', hi: ['legN', 'legF'], cycle: 4, dwell: 0.3,
        frames: [{ ...DOWN_DOG, thN: 195, shN: 220, ftN: 110 }, { ...DOWN_DOG, thF: 195, shF: 220, ftF: 110 }],
      },
    },

    // ---------- Quads ----------
    {
      id: 'standing-quad', name: 'Standing quad stretch', areas: ['quads'], also: ['hipFlexors'],
      position: 'standing', kind: 'static', sides: true,
      muscles: ['Quadriceps', 'Hip flexors'],
      steps: [
        'Stand tall, holding a wall or chair if you need balance.',
        'Bend one knee and catch that ankle behind you.',
        'Draw your heel towards your glute, knees side by side.',
        'Tuck your tailbone under to feel it more at the front of the hip.',
      ],
      tips: ['Don’t let the knee drift forward or out to the side.', 'Loop a towel round your foot if you can’t reach it.'],
      fig: {
        anchor: 'ankleF', hi: ['legN'], cycle: 6, dwell: 0.45,
        frames: [{ uaF: 180, faF: 180 }, { thN: 185, shN: -12, uaN: 200, faN: 190, uaF: 100, faF: 95 }],
      },
    },
    {
      id: 'prone-quad', name: 'Lying quad stretch', areas: ['quads'], also: ['hipFlexors'],
      position: 'lying', face: 'prone', kind: 'static', sides: true,
      muscles: ['Quadriceps', 'Hip flexors'],
      steps: [
        'Lie on your front, propped on one forearm.',
        'Bend one knee and reach back with the same-side hand to hold the ankle.',
        'Gently draw your heel towards your glute.',
        'Press your hip into the floor to deepen it.',
      ],
      tips: ['Use a towel round the ankle if you can’t reach.', 'Keep both knees close together.'],
      fig: {
        anchor: 'hip', hi: ['legN'], cycle: 6, dwell: 0.45,
        frames: [
          { ...PRONE, t1: 85, t2: 72, n: 75, uaF: 180, faF: 90, hF: 90 },
          { ...PRONE, t1: 85, t2: 72, n: 75, uaN: 265, faN: 280, hN: 280, uaF: 180, faF: 90, hF: 90, thN: 268, shN: 420, ftN: 330 },
        ],
      },
    },
    {
      id: 'heel-sit', name: 'Kneeling heel sit', areas: ['quads', 'calves'], also: [],
      position: 'kneeling', kind: 'static', sides: false,
      muscles: ['Quadriceps', 'Tibialis anterior', 'Ankle extensors'],
      steps: [
        'Kneel with your knees together and the tops of your feet flat on the floor.',
        'Sit back slowly towards your heels.',
        'Place your hands on the floor behind you and lean back slightly.',
        'Hold, feeling the stretch along the front of your thighs and ankles.',
      ],
      tips: ['A cushion between your hips and heels reduces knee pressure.', 'Skip this one if your knees don’t like deep bending.'],
      fig: {
        anchor: 'kneeN', hi: ['legN'], cycle: 6, dwell: 0.45,
        frames: [{ ...TALL_KNEEL }, { ...ON_HEELS, t1: -6, t2: -6, n: -6, uaN: 200, faN: 190, hN: 270, uaF: 200, faF: 190, hF: 270 }],
      },
    },

    // ---------- Calves & ankles ----------
    {
      id: 'wall-calf', name: 'Wall calf stretch', areas: ['calves'], also: [],
      position: 'standing', kind: 'static', sides: true,
      muscles: ['Gastrocnemius', 'Soleus', 'Achilles tendon'],
      steps: [
        'Face a wall with your hands on it at shoulder height.',
        'Step one foot back, keeping the heel down and the leg straight.',
        'Bend the front knee and lean into the wall.',
        'Hold, then bend the back knee slightly to move the stretch lower.',
      ],
      tips: ['Point both feet straight at the wall.', 'Press the back heel firmly into the floor.'],
      fig: {
        anchor: 'ankleF', hi: ['legN'], cycle: 6, dwell: 0.45, wall: { at: 'handN', dx: 5 },
        frames: [
          { t1: 15, t2: 15, n: 15, uaN: 78, faN: 78, hN: 0, uaF: 78, faF: 78, hF: 0, thN: 200, shN: 200, ftN: 90, thF: 160, shF: 190, ftF: 90 },
          { t1: 20, t2: 20, n: 20, uaN: 73, faN: 73, hN: 0, uaF: 73, faF: 73, hF: 0, thN: 205, shN: 205, ftN: 90, thF: 155, shF: 195, ftF: 90 },
        ],
      },
    },
    {
      id: 'ankle-circles', name: 'Ankle circles', areas: ['calves'], also: [],
      position: 'standing', kind: 'dynamic', sides: true,
      muscles: ['Calves', 'Tibialis anterior', 'Peroneals'],
      steps: [
        'Stand on one leg, holding a wall if you need to, and lift the other foot.',
        'Draw slow, full circles with your toes.',
        'Make the circles as big as you can without moving your knee.',
        'Change direction halfway through.',
      ],
      tips: ['You can do these seated if balance is tricky.', 'Go slowly enough to feel every part of the circle.'],
      fig: {
        anchor: 'ankleF', hi: ['legN'], cycle: 3, dwell: 0, ease: 'linear', mode: 'loop',
        frames: [{ thN: 160, shN: 178, ftN: 40 }, { thN: 160, shN: 178, ftN: 85, s: { ftN: 0.55 } }, { thN: 160, shN: 178, ftN: 130 }, { thN: 160, shN: 178, ftN: 85, s: { ftN: 1.15 } }, { thN: 160, shN: 178, ftN: 40 }],
      },
    },
    {
      id: 'ankle-rocks', name: 'Kneeling ankle rocks', areas: ['calves'], also: [],
      position: 'kneeling', kind: 'dynamic', sides: true,
      muscles: ['Soleus', 'Gastrocnemius', 'Achilles tendon'],
      steps: [
        'Half-kneel with one foot flat in front of you.',
        'Keeping the heel down, drive the front knee forward over your toes.',
        'Pause at the end, then rock back.',
        'Repeat slowly and smoothly.',
      ],
      tips: ['Your heel must stay glued down.', 'Aim the knee over your second toe.'],
      fig: {
        anchor: 'kneeF', hi: ['legN'], cycle: 3, dwell: 0.25,
        frames: [
          { thN: 90, shN: 180, ftN: 90, thF: 180, shF: 270, ftF: 270, uaN: 150, faN: 120, uaF: 150, faF: 120 },
          { thN: 90, shN: 201, ftN: 90, thF: 200, shF: 270, ftF: 270, uaN: 150, faN: 120, uaF: 150, faF: 120 },
        ],
      },
    },
    {
      id: 'calf-raises', name: 'Calf raises', areas: ['calves'], also: [],
      position: 'standing', kind: 'dynamic', sides: false,
      muscles: ['Gastrocnemius', 'Soleus'],
      steps: [
        'Stand tall with your feet hip-width apart, a hand on a wall if needed.',
        'Rise up onto the balls of your feet.',
        'Pause at the top.',
        'Lower slowly all the way down, letting your heels settle.',
      ],
      tips: ['Lower for twice as long as you rise.', 'Keep your weight over your big and second toes.'],
      fig: { anchor: 'toeN', hi: ['legN', 'legF'], cycle: 2.5, dwell: 0.2, frames: [{}, { ftN: 130, ftF: 130 }] },
    },

    // ---------- Wrists & forearms ----------
    {
      id: 'wrist-flexor', name: 'Wrist flexor stretch', areas: ['wrists'], also: [],
      position: 'standing', kind: 'static', sides: true,
      muscles: ['Wrist flexors', 'Forearm flexors'],
      steps: [
        'Hold one arm straight out in front, palm facing away and fingers up.',
        'With your other hand, gently draw the fingers back towards you.',
        'Keep the elbow straight.',
        'Hold, feeling the stretch along the inside of the forearm.',
      ],
      tips: ['Include the thumb for a little extra.', 'Ease off if you feel tingling in your hand.'],
      fig: {
        anchor: 'ankleN', hi: ['armN'], cycle: 6, dwell: 0.45,
        frames: [{ uaN: 90, faN: 90, hN: 90 }, { uaN: 90, faN: 90, hN: -5, uaF: 110, faF: 60, hF: 30 }],
      },
    },
    {
      id: 'wrist-extensor', name: 'Wrist extensor stretch', areas: ['wrists'], also: [],
      position: 'standing', kind: 'static', sides: true,
      muscles: ['Wrist extensors', 'Forearm extensors'],
      steps: [
        'Hold one arm straight out in front, palm facing down.',
        'Let the hand drop so your fingers point to the floor.',
        'With your other hand, gently press the back of the hand towards you.',
        'Hold, feeling the stretch along the top of the forearm.',
      ],
      tips: ['Make a loose fist to feel it more.', 'Keep your shoulder relaxed and down.'],
      fig: {
        anchor: 'ankleN', hi: ['armN'], cycle: 6, dwell: 0.45,
        frames: [{ uaN: 90, faN: 90, hN: 120 }, { uaN: 90, faN: 90, hN: 188, uaF: 115, faF: 80, hF: 80 }],
      },
    },
    {
      id: 'wrist-circles', name: 'Wrist circles', areas: ['wrists'], also: [],
      position: 'standing', kind: 'dynamic', sides: false,
      muscles: ['Wrist flexors', 'Wrist extensors', 'Forearm rotators'],
      steps: [
        'Bend your elbows and bring your forearms out in front.',
        'Make slow, full circles with both hands.',
        'Keep your forearms still and move only from the wrists.',
        'Change direction halfway through.',
      ],
      tips: ['Interlace your fingers for a different feel.', 'Go big and slow rather than small and fast.'],
      fig: {
        anchor: 'ankleN', hi: ['armN'], cycle: 2.5, dwell: 0, ease: 'linear', mode: 'loop',
        frames: [
          { uaN: 172, faN: 90, hN: 90, uaF: 172, faF: 90, hF: 90 },
          { uaN: 172, faN: 90, hN: 30, uaF: 172, faF: 90, hF: 30 },
          { uaN: 172, faN: 90, hN: 90, uaF: 172, faF: 90, hF: 90, s: { hN: 0.4, hF: 0.4 } },
          { uaN: 172, faN: 90, hN: 150, uaF: 172, faF: 90, hF: 150 },
          { uaN: 172, faN: 90, hN: 90, uaF: 172, faF: 90, hF: 90 },
        ],
      },
    },
    {
      id: 'wrist-rocks', name: 'Kneeling wrist rocks', areas: ['wrists'], also: ['shoulders'],
      position: 'kneeling', kind: 'dynamic', sides: false,
      muscles: ['Wrist flexors', 'Forearm flexors'],
      steps: [
        'Start on hands and knees, hands flat under your shoulders, fingers pointing forward.',
        'Slowly rock your shoulders forward past your wrists.',
        'Keep your palms flat and rock back.',
        'Try it with fingers turned out to the sides, then pointing back towards your knees.',
      ],
      tips: ['Stay in a range that feels like a stretch, not a strain.', 'Press through the base of your fingers.'],
      fig: {
        anchor: 'handN', hi: ['armN'], cycle: 3, dwell: 0.25,
        frames: [{ ...ALLFOURS }, { ...ALLFOURS, uaN: 200, faN: 200, uaF: 200, faF: 200, thN: 208, thF: 208, t1: 72, t2: 72 }],
      },
    },
  ];

  M.byId = Object.fromEntries(M.EXERCISES.map((e) => [e.id, e]));
})(typeof window !== 'undefined' ? window : globalThis);
