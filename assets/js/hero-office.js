/* Home page hero: a time-lapse of an office building going up, following the
   same 8 steps listed on the New Construction page. Everything drawn on screen
   is a function of the time t, in seconds, so see render() for the sequence. */
(() => {
  const figure = document.getElementById('office-scene');
  if (!figure) return;

  const STEPS = [
    [0, 'Consultation & Planning'],
    [0.7, 'Architectural & Engineering Coordination'],
    [1.5, 'Permitting & Approvals'],
    [2.3, 'Site Preparation & Foundation Work'],
    [3, 'Framing & Structural Build Out'],
    [7.2, 'Electrical, Plumbing & Mechanical Systems'],
    [8, 'Interior & Exterior Finishes'],
    [10, 'Final Walkthrough & Completion'],
  ];
  const END = 12.6;

  const GROUND = 530;
  const LEFT = 226;
  const BAY = 48;
  const COLS = 6;
  const RIGHT = LEFT + BAY * COLS;
  const LOBBY = 62;
  const FLOOR = 44;
  const LEVELS = 9; // lobby plus 8 office floors
  const ANNEX_BAY = 40;
  const ANNEX_COLS = 4;
  const ANNEX_LEVELS = 3;
  const ANNEX_RIGHT = RIGHT + ANNEX_BAY * ANNEX_COLS;
  const ROOF = levelTop(LEVELS - 1);
  const ANNEX_ROOF = levelTop(ANNEX_LEVELS - 1);

  const FRAME_START = 3;
  const CYCLE = 0.47;

  const INK = '#0d2739';
  const ORANGE = '#f27a1a';
  const LINE = '#dce8f0';
  const FINE = '#8fb3cf';

  function levelTop(level) {
    return GROUND - LOBBY - level * FLOOR;
  }
  function levelBottom(level) {
    return level === 0 ? GROUND : levelTop(level - 1);
  }

  /* Helpers ---------------------------------------------------------------- */

  const clamp = (x) => Math.min(1, Math.max(0, x));
  const progress = (t, start, length) => clamp((t - start) / length);
  const smooth = (x) => x * x * (3 - 2 * x);
  const overshoot = (x) => 1 + 2.7 * (x - 1) ** 3 + 1.7 * (x - 1) ** 2;
  const lerp = (a, b, x) => a + (b - a) * x;

  let seed = 7;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  function el(name, attrs, parent, text) {
    const node = document.createElementNS('http://www.w3.org/2000/svg', name);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    if (text) node.textContent = text;
    if (parent) parent.appendChild(node);
    return node;
  }

  /* Skip DOM writes for values that did not change between frames */
  function set(node, attr, value) {
    const cache = node.cache || (node.cache = {});
    const next = typeof value === 'number' ? Math.round(value * 1000) / 1000 : value;
    if (cache[attr] !== next) {
      cache[attr] = next;
      node.setAttribute(attr, next);
    }
  }

  function line(d, attrs, parent) {
    return el('path', { d, pathLength: 1, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': 1, ...attrs }, parent);
  }

  function draw(node, amount) {
    set(node, 'stroke-dashoffset', 1 - amount);
    set(node, 'opacity', amount > 0 ? 1 : 0);
  }

  /* Build the scene -------------------------------------------------------- */

  const svg = el('svg', {
    viewBox: '0 0 760 600',
    role: 'img',
    'aria-label': 'Time-lapse animation of a Florida office building rising from a blueprint to a finished building lit up at dusk',
  });

  const defs = el('defs', {}, svg);
  const glassGradient = el('linearGradient', { id: 'glass', x1: 0, y1: 0, x2: 1, y2: 1 }, defs);
  el('stop', { offset: 0, 'stop-color': '#4f9cc7' }, glassGradient);
  el('stop', { offset: 1, 'stop-color': '#1b5379' }, glassGradient);
  const sunGradient = el('linearGradient', { id: 'sun', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  el('stop', { offset: 0, 'stop-color': '#ffd08a' }, sunGradient);
  el('stop', { offset: 1, 'stop-color': ORANGE }, sunGradient);
  const glow = el('filter', { id: 'glow', x: '-20%', y: '-60%', width: '140%', height: '220%' }, defs);
  el('feGaussianBlur', { stdDeviation: 5, result: 'blur' }, glow);
  const merge = el('feMerge', {}, glow);
  el('feMergeNode', { in: 'blur' }, merge);
  el('feMergeNode', { in: 'SourceGraphic' }, merge);
  el('rect', { x: 0, y: 0, width: 760, height: GROUND }, el('clipPath', { id: 'above-ground' }, defs));
  const buildingClip = el('clipPath', { id: 'building' }, defs);
  el('rect', { x: LEFT, y: ROOF, width: RIGHT - LEFT, height: GROUND - ROOF }, buildingClip);
  el('rect', { x: RIGHT, y: ANNEX_ROOF, width: ANNEX_RIGHT - RIGHT, height: GROUND - ANNEX_ROOF }, buildingClip);

  const stage = el('g', {}, svg);

  /* Evening sky */
  const sky = el('g', { class: 'scene-far', 'clip-path': 'url(#above-ground)' }, stage);
  const sun = el('circle', { cx: 628, cy: 300, r: 64, fill: 'url(#sun)' }, sky);
  const skyline = el('g', {}, sky);
  [[0, 96, 150], [58, 180, 74], [150, 120, 120], [500, 150, 92], [570, 210, 72], [660, 130, 100]].forEach(([x, height, width]) => {
    el('rect', { x, y: GROUND - height, width, height, fill: '#143450' }, skyline);
    for (let row = GROUND - height + 12; row < GROUND - 10; row += 18) {
      for (let col = x + 8; col < x + width - 8; col += 14) {
        if (random() > 0.62) el('rect', { x: col, y: row, width: 6, height: 8, fill: '#ffc67a', opacity: 0.55 }, skyline);
      }
    }
  });

  /* Blueprint */
  const plan = el('g', { stroke: FINE, 'stroke-width': 1 }, stage);
  const planGrid = line([LEFT, LEFT + BAY * 3, RIGHT, ANNEX_RIGHT].map((x) => `M${x} 74V${GROUND}`).join(''), {}, plan);
  const planOutline = line(`M${LEFT} ${GROUND}V${ROOF}H${RIGHT}V${ANNEX_ROOF}H${ANNEX_RIGHT}V${GROUND}`, { stroke: LINE, 'stroke-width': 1.6 }, plan);
  let planFloorPath = '';
  for (let level = 0; level < LEVELS - 1; level++) planFloorPath += `M${LEFT} ${levelTop(level)}H${level < ANNEX_LEVELS - 1 ? ANNEX_RIGHT : RIGHT}`;
  for (let col = 1; col < COLS; col++) planFloorPath += `M${LEFT + col * BAY} ${ROOF}V${GROUND}`;
  const planFloors = line(planFloorPath, {}, plan);
  const planDimension = line(`M196 ${ROOF}V${GROUND}M188 ${ROOF}H204M188 ${GROUND}H204`, { stroke: ORANGE, 'stroke-width': 1.5 }, plan);
  const planLabels = el('g', { 'font-family': 'var(--mono)', 'font-size': 12, 'letter-spacing': '.06em', fill: '#bcd2e2', stroke: 'none' }, plan);
  ['A', 'B', 'C', 'D'].forEach((letter, i) => {
    const x = [LEFT, LEFT + BAY * 3, RIGHT, ANNEX_RIGHT][i];
    el('circle', { cx: x, cy: 60, r: 14, fill: 'none', stroke: FINE }, planLabels);
    el('text', { x, y: 64, 'text-anchor': 'middle' }, planLabels, letter);
  });
  el('text', { x: 450, y: 586, 'text-anchor': 'middle' }, planLabels, 'OFFICE BUILDING: FRONT ELEVATION');

  const stamp = el('g', { opacity: 0 }, stage);
  el('rect', { x: -124, y: -38, width: 248, height: 76, rx: 6, fill: 'rgba(13,39,57,.82)', stroke: ORANGE, 'stroke-width': 5 }, stamp);
  el('text', { y: 18, 'text-anchor': 'middle', fill: ORANGE, 'font-family': 'var(--display)', 'font-size': 54, 'font-weight': 700, 'letter-spacing': '.06em' }, stamp, 'APPROVED');

  /* Foundation */
  const groundLine = line('M0 530H760', { stroke: LINE, 'stroke-width': 2.6 }, stage);
  const foundation = el('g', {}, stage);
  let pilePath = '';
  for (let x = LEFT + 8; x < ANNEX_RIGHT; x += 38) pilePath += `M${x} 538V580`;
  const piles = line(pilePath, { stroke: FINE, 'stroke-width': 2.4 }, foundation);
  const slab = el('rect', { x: LEFT - 14, y: 530, width: ANNEX_RIGHT - LEFT + 28, height: 9, fill: '#7f96a8' }, foundation);
  const dust = [];
  for (let i = 0; i < 8; i++) {
    dust.push({
      node: el('circle', { cx: 0, cy: 0, r: 8 + random() * 10, fill: '#c9b89b', opacity: 0 }, stage),
      x: LEFT + random() * (ANNEX_RIGHT - LEFT),
      drift: (random() - 0.5) * 50,
      delay: random() * 0.3,
    });
  }

  /* Structure behind the glass */
  const inner = el('g', {}, stage);
  const braces = [];
  for (let level = 1; level < LEVELS; level++) {
    const x = LEFT + (level % 2 ? BAY : BAY * 4);
    braces.push(line(`M${x} ${levelBottom(level)}L${x + BAY} ${levelTop(level)}M${x + BAY} ${levelBottom(level)}L${x} ${levelTop(level)}`, { stroke: FINE, 'stroke-width': 1 }, inner));
  }

  const trades = [[1, ORANGE], [3, '#57c7d4'], [5, '#ffffff']].map(([col, stroke], i) => {
    let d = `M${LEFT + col * BAY} ${GROUND}V${ROOF}`;
    for (let level = i; level < LEVELS; level += 2) d += `M${LEFT + col * BAY} ${levelTop(level) + 12 + i * 8}H${col === 5 ? RIGHT - 6 : LEFT + (col + 1.8) * BAY}`;
    return line(d, { stroke, 'stroke-width': 2 }, inner);
  });

  /* Windows */
  const windows = [];
  const glassLayer = el('g', {}, stage);
  const lightLayer = el('g', { class: 'scene-lights' }, stage);
  const WARM = ['#ffc67a', '#ffd9a0', '#ffb45e'];

  function addWindow(x, y, width, height, level, col) {
    const box = { x: x + 2, y: y + 2, width: width - 4, height: height - 4 };
    const lit = random() < 0.58;
    windows.push({
      glass: el('rect', { ...box, fill: 'url(#glass)', opacity: 0 }, glassLayer),
      light: el('rect', { ...box, fill: WARM[Math.floor(random() * 3)], opacity: 0 }, lightLayer),
      glassAt: 8 + level * 0.16 + col * 0.03,
      lightAt: 10.5 + (level === 0 ? 0 : level * 0.12 + random() * 0.8),
      lit: lit || level === 0,
      speed: 0.3 + random() * 0.5,
      phase: random() * 40,
    });
  }

  for (let level = 0; level < LEVELS; level++) {
    const height = level === 0 ? LOBBY : FLOOR;
    for (let col = 0; col < COLS; col++) addWindow(LEFT + col * BAY, levelTop(level), BAY, height, level, col);
    if (level < ANNEX_LEVELS) {
      for (let col = 0; col < ANNEX_COLS; col++) addWindow(RIGHT + col * ANNEX_BAY, levelTop(level), ANNEX_BAY, height, level, COLS + col);
    }
  }

  const shine = el('polygon', { points: '0,600 90,600 250,100 160,100', fill: '#fff', opacity: 0.2 }, el('g', { 'clip-path': 'url(#building)' }, stage));

  /* Steel frame, which reads as the window frames once the glass is in */
  const steel = [];
  for (let level = 0; level < LEVELS; level++) {
    const y1 = levelTop(level);
    const y2 = levelBottom(level);
    const annex = level < ANNEX_LEVELS;
    let d = `M${LEFT} ${y1}H${annex ? ANNEX_RIGHT : RIGHT}`;
    for (let col = 0; col <= COLS; col++) d += `M${LEFT + col * BAY} ${y1}V${y2}`;
    if (annex) for (let col = 1; col <= ANNEX_COLS; col++) d += `M${RIGHT + col * ANNEX_BAY} ${y1}V${y2}`;
    steel.push(line(d, { stroke: LINE, 'stroke-width': level === LEVELS - 1 ? 2.8 : 1.7 }, stage));
  }

  /* Finished details */
  const details = el('g', { opacity: 0 }, stage);
  el('rect', { x: LEFT + 66, y: ROOF - 20, width: 156, height: 20, fill: '#17405d', stroke: LINE }, details);
  el('rect', { x: LEFT - 8, y: ROOF, width: 8, height: GROUND - ROOF, fill: ORANGE }, details);
  el('rect', { x: LEFT + 88, y: 474, width: 112, height: 7, fill: ORANGE }, details);
  el('path', { d: `M${LEFT + 144} 484V530M${LEFT + 120} 484V530M${LEFT + 168} 484V530`, stroke: INK, 'stroke-width': 2 }, details);

  const signGroup = el('g', { filter: 'url(#glow)', opacity: 0 }, stage);
  el('text', {
    x: LEFT + 144,
    y: ROOF - 26,
    'text-anchor': 'middle',
    fill: ORANGE,
    'font-family': 'var(--display)',
    'font-size': 33,
    'font-weight': 700,
    'letter-spacing': '.07em',
  }, signGroup, 'EBEN CONSTRUCTION');

  const lobbyGlow = el('ellipse', { cx: LEFT + 144, cy: 542, rx: 190, ry: 16, fill: '#ffc67a', opacity: 0 }, stage);

  /* Tower crane, which climbs out of the ground and sinks back when done */
  const craneClip = el('g', { 'clip-path': 'url(#above-ground)' }, stage);
  const crane = el('g', {}, craneClip);
  const craneStyle = { stroke: ORANGE, 'stroke-width': 2, fill: 'none', 'stroke-linejoin': 'round' };
  let mast = 'M92 530V50M112 530V50';
  for (let y = 530; y > 50; y -= 24) mast += `M92 ${y}L112 ${y - 12}L92 ${y - 24}`;
  el('path', { d: mast, ...craneStyle }, crane);
  let jib = 'M38 38H548M38 50H548';
  for (let x = 38; x < 548; x += 24) jib += `M${x} 50L${x + 12} 38L${x + 24} 50`;
  el('path', { d: jib, ...craneStyle }, crane);
  el('path', { d: 'M102 38V6M102 6L38 38M102 6L440 38', ...craneStyle, 'stroke-width': 1.4 }, crane);
  el('rect', { x: 44, y: 50, width: 34, height: 18, fill: '#f2a15c' }, crane);
  el('rect', { x: 113, y: 52, width: 18, height: 18, fill: '#ffd9a0', stroke: ORANGE, 'stroke-width': 2 }, crane);
  const cable = el('path', { stroke: LINE, 'stroke-width': 1.2, fill: 'none' }, crane);
  const trolley = el('rect', { y: 50, width: 18, height: 6, fill: LINE }, crane);
  const load = el('rect', { width: 56, height: 6, fill: LINE }, crane);

  const sparks = el('g', { stroke: '#ffd08a', 'stroke-width': 2, 'stroke-linecap': 'round', opacity: 0 }, stage);
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    el('path', { d: `M${Math.cos(angle) * 5} ${Math.sin(angle) * 5}L${Math.cos(angle) * 18} ${Math.sin(angle) * 18}` }, sparks);
  }

  /* Street life */
  function palm(x, height, parent) {
    const base = el('g', {}, parent);
    const sway = el('g', { class: 'scene-sway' }, base);
    const top = GROUND - height;
    el('path', {
      d: `M${x} ${GROUND}C${x - 6} ${GROUND - height * 0.4} ${x + 8} ${top + height * 0.3} ${x} ${top}`,
      stroke: '#6a4b35',
      'stroke-width': 5,
      fill: 'none',
      'stroke-linecap': 'round',
    }, sway);
    el('path', {
      d: [[-44, 20], [44, 20], [-38, -12], [38, -12], [8, -30]]
        .map(([dx, dy]) => `M${x} ${top}Q${x + dx * 0.55} ${top + dy - 22} ${x + dx} ${top + dy + 6}`).join(''),
      stroke: '#2f8f74',
      'stroke-width': 4.5,
      fill: 'none',
      'stroke-linecap': 'round',
    }, sway);
    return { node: base, x };
  }

  const palms = [palm(166, 118, stage), palm(712, 96, stage), palm(58, 88, stage)];

  const road = el('g', { opacity: 0 }, stage);
  el('rect', { x: 0, y: 552, width: 760, height: 48, fill: '#0b1f2e' }, road);
  el('path', { d: 'M0 574H760', stroke: '#e0b45c', 'stroke-width': 2, 'stroke-dasharray': '22 18' }, road);

  function car(color) {
    const group = el('g', { opacity: 0 }, stage);
    el('polygon', { class: 'scene-beam', points: '62,8 150,-4 150,26', fill: '#ffe9b8', opacity: 0.34 }, group);
    el('path', { d: 'M0 16C0 6 8 6 14 6L24 -5H44L55 6C61 6 62 10 62 16Z', fill: color }, group);
    el('path', { d: 'M28 -1H34V6H21ZM38 -1H43L49 6H38Z', fill: '#ffd9a0' }, group);
    el('circle', { cx: 14, cy: 16, r: 5, fill: INK, stroke: LINE }, group);
    el('circle', { cx: 48, cy: 16, r: 5, fill: INK, stroke: LINE }, group);
    return group;
  }
  const carRight = car('#e6edf2');
  const carLeft = car(ORANGE);

  /* Status readout under the drawing */
  const status = document.createElement('div');
  status.className = 'scene-status';
  status.innerHTML = `
    <div class="scene-status-top">
      <span class="scene-step" aria-hidden="true"></span>
      <span class="scene-controls">
        <button type="button" data-action="pause">Pause</button>
        <button type="button" data-action="replay">Replay</button>
      </span>
    </div>
    <p class="scene-label" aria-hidden="true"></p>
    <div class="scene-bar" aria-hidden="true"><span></span></div>`;

  figure.append(svg, status);

  const stepText = status.querySelector('.scene-step');
  const labelText = status.querySelector('.scene-label');
  const bar = status.querySelector('.scene-bar span');
  const pauseButton = status.querySelector('[data-action="pause"]');
  const hero = figure.closest('.hero');

  /* The sequence ----------------------------------------------------------- */

  function renderFrame(t) {
    const level = Math.floor((t - FRAME_START) / CYCLE);
    const phase = (t - FRAME_START) / CYCLE - level;
    const framing = t >= FRAME_START && level < LEVELS;

    /* Steps 1 and 2: the plans */
    draw(planGrid, smooth(progress(t, 0, 0.5)));
    draw(planOutline, smooth(progress(t, 0.1, 0.6)));
    draw(planFloors, smooth(progress(t, 0.7, 0.6)));
    draw(planDimension, smooth(progress(t, 0.9, 0.5)));
    draw(groundLine, smooth(progress(t, 0, 0.5)));
    set(planLabels, 'opacity', progress(t, 0.7, 0.4));
    set(plan, 'opacity', lerp(1, 0, smooth(progress(t, 3, 2.5))));

    /* Step 3: the permit stamp lands and shakes the page */
    const stampIn = progress(t, 1.6, 0.16);
    set(stamp, 'opacity', stampIn * (1 - progress(t, 2.25, 0.25)));
    set(stamp, 'transform', `translate(${LEFT + 150} 320) rotate(-9) scale(${lerp(2.2, 1, stampIn * stampIn)})`);
    const shake = t > 1.76 && t < 2.1 ? Math.sin(t * 90) * 5 * (2.1 - t) : 0;
    set(stage, 'transform', `translate(0 ${shake})`);

    /* Step 4: foundation, dust and the crane climbing up */
    draw(piles, smooth(progress(t, 2.3, 0.45)));
    if (t > 7) set(piles, 'opacity', 1 - progress(t, 7, 1));
    const pour = smooth(progress(t, 2.6, 0.4));
    set(slab, 'width', (ANNEX_RIGHT - LEFT + 28) * pour);
    set(slab, 'opacity', pour > 0 ? 1 : 0);
    dust.forEach((puff) => {
      const life = progress(t, 2.3 + puff.delay, 0.8);
      set(puff.node, 'opacity', life > 0 && life < 1 ? 0.42 * (1 - life) : 0);
      set(puff.node, 'transform', `translate(${puff.x + puff.drift * life} ${530 - 36 * life}) scale(${0.5 + life * 1.5})`);
    });

    const craneUp = overshoot(progress(t, 2.3, 0.8));
    const craneDown = smooth(progress(t, 10, 1.3));
    set(crane, 'transform', `translate(0 ${(1 - craneUp) * 540 + craneDown * 540})`);
    set(crane, 'opacity', t < 2.3 || craneDown === 1 ? 0 : 1);

    /* Step 5: the crane lifts steel up, one level per cycle */
    let hookX = 170;
    let hookY = 500;
    let carrying = false;
    if (framing) {
      const top = levelTop(level);
      const targetX = LEFT + [144, 72, 216, 120][level % 4];
      if (phase < 0.35) {
        hookY = lerp(510, top - 54, smooth(phase / 0.35));
        carrying = true;
      } else if (phase < 0.65) {
        hookX = lerp(170, targetX, smooth((phase - 0.35) / 0.3));
        hookY = top - 54;
        carrying = true;
      } else if (phase < 0.8) {
        hookX = targetX;
        hookY = lerp(top - 54, top - 12, smooth((phase - 0.65) / 0.15));
        carrying = true;
      } else {
        const back = smooth((phase - 0.8) / 0.2);
        hookX = lerp(targetX, 170, back);
        hookY = lerp(top - 12, 510, back);
      }
      const spark = phase >= 0.78 ? (phase - 0.78) / 0.22 : 0;
      set(sparks, 'opacity', spark > 0 ? 1 - spark : 0);
      set(sparks, 'transform', `translate(${targetX} ${top}) scale(${0.5 + spark * 1.2})`);
    } else {
      set(sparks, 'opacity', 0);
    }

    set(trolley, 'x', hookX - 9);
    set(cable, 'd', `M${hookX} 56V${hookY}`);
    set(load, 'x', hookX - 28);
    set(load, 'y', hookY);
    set(load, 'opacity', carrying ? 1 : 0);

    steel.forEach((node, i) => {
      draw(node, smooth(progress(t, FRAME_START + CYCLE * (i + 0.7), CYCLE * 0.5)));
      if (t > 8) set(node, 'stroke', '#b9cfde');
    });
    braces.forEach((node, i) => draw(node, progress(t, FRAME_START + CYCLE * (i + 1.4), CYCLE * 0.5)));

    /* Step 6: the trades run services up through the frame */
    trades.forEach((node, i) => draw(node, smooth(progress(t, 7.2 + i * 0.12, 0.6))));

    /* Step 7: glass goes in from the bottom up */
    windows.forEach((pane) => set(pane.glass, 'opacity', progress(t, pane.glassAt, 0.22) * 0.96));
    set(details, 'opacity', smooth(progress(t, 9.5, 0.5)));

    const sweep = t < 13 ? progress(t, 9.7, 1.1) : ((t - 13) % 9) / 1.1;
    set(shine, 'transform', `translate(${lerp(LEFT - 260, ANNEX_RIGHT + 60, clamp(sweep))} 0)`);
    set(shine, 'opacity', sweep > 0 && sweep < 1 ? 0.2 : 0);

    /* Step 8: the crane leaves, palms go in and the sun goes down */
    const dusk = smooth(progress(t, 10.2, 1.8));
    hero.style.setProperty('--dusk', dusk);
    set(sky, 'opacity', dusk);
    set(sun, 'cy', lerp(330, 446, dusk));
    set(road, 'opacity', smooth(progress(t, 10, 0.8)));
    set(lobbyGlow, 'opacity', dusk * 0.24);

    palms.forEach((tree, i) => {
      const grow = overshoot(progress(t, 10.5 + i * 0.16, 0.6));
      set(tree.node, 'opacity', grow > 0 ? 1 : 0);
      set(tree.node, 'transform', `translate(${tree.x} ${GROUND}) scale(${Math.max(grow, 0.001)}) translate(${-tree.x} ${-GROUND})`);
    });

    windows.forEach((pane) => {
      let on = pane.lit && t >= pane.lightAt;
      /* Once the building is finished, offices come and go through the evening */
      if (t > END && Math.sin(t * pane.speed + pane.phase) > 0.96) on = !on;
      set(pane.light, 'opacity', on ? 0.88 : 0);
    });

    const sign = t - 11.8;
    set(signGroup, 'opacity', sign < 0 ? 0 : sign < 0.1 ? 1 : sign < 0.2 ? 0.1 : sign < 0.3 ? 1 : sign < 0.38 ? 0.2 : 1);

    const driving = t > 10.8 ? 1 : 0;
    const rightX = ((t - 10.8) * 74) % 980;
    const leftX = ((t - 10.8) * 56 + 420) % 980;
    set(carRight, 'opacity', driving);
    set(carRight, 'transform', `translate(${rightX - 150} 582)`);
    set(carLeft, 'opacity', driving);
    set(carLeft, 'transform', `translate(${830 - leftX} 558) scale(-1 1)`);

    /* Readout */
    let step = 0;
    while (step < STEPS.length - 1 && t >= STEPS[step + 1][0]) step++;
    const number = `Step ${String(step + 1).padStart(2, '0')} / 08`;
    if (stepText.textContent !== number) {
      stepText.textContent = number;
      labelText.textContent = STEPS[step][1];
    }
    bar.style.transform = `scaleX(${clamp(t / END)})`;
  }

  /* Playback --------------------------------------------------------------- */

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let time = 0;
  let lastFrame = null;
  let paused = false;
  let onScreen = false;
  let frameId = null;

  function tick(now) {
    /* Capped so a hidden tab picks up where it left off instead of jumping */
    if (lastFrame !== null) time += Math.min((now - lastFrame) / 1000, 0.05);
    lastFrame = now;
    renderFrame(time);
    frameId = requestAnimationFrame(tick);
  }

  function updatePlayback() {
    const run = onScreen && !paused;
    if (run && frameId === null) {
      lastFrame = null;
      frameId = requestAnimationFrame(tick);
    } else if (!run && frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
    figure.classList.toggle('is-paused', !run);
  }

  if (reducedMotion) {
    /* Show the finished building with no movement */
    renderFrame(END);
    status.querySelector('.scene-controls').hidden = true;
    return;
  }

  renderFrame(0);

  status.addEventListener('click', (event) => {
    const action = event.target.dataset.action;
    if (action === 'pause') {
      paused = !paused;
      pauseButton.textContent = paused ? 'Play' : 'Pause';
    } else if (action === 'replay') {
      time = 0;
      paused = false;
      pauseButton.textContent = 'Pause';
      renderFrame(0);
    }
    updatePlayback();
  });

  new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    updatePlayback();
  }, { threshold: 0.25 }).observe(figure);

  /* Gentle depth as the pointer moves across the hero */
  if (window.matchMedia('(hover: hover)').matches) {
    hero.addEventListener('pointermove', (event) => {
      const box = hero.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width - 0.5;
      const y = (event.clientY - box.top) / box.height - 0.5;
      figure.style.setProperty('--far-x', `${x * -16}px`);
      figure.style.setProperty('--far-y', `${y * -8}px`);
    });
  }
})();
