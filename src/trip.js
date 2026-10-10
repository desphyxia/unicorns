// Trips: gallop through a scrolling, rainbow world. Steer by dragging, collect treats by touching or tapping them.
import { unicornSVG, riderSVG } from './art.js';
import { RAINBOW } from './cast.js';
import * as audio from './audio.js';

const NS = 'http://www.w3.org/2000/svg';
const tsvg = document.getElementById('trip');
const TILE = 1600;
const GROUND_Y = 738;
const STAR = 'M0,-9 L2.5,-2.5 L9,0 L2.5,2.5 L0,9 L-2.5,2.5 L-9,0 L-2.5,-2.5Z';
const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- scenery pieces ----------
// a candy swirl: an Archimedean spiral around the origin
const swirl = (r, turns = 2.5) => {
  let d = '';
  for (let i = 0; i <= 40; i++) { const a = (i / 40) * turns * Math.PI * 2, rr = (i / 40) * r; d += `${i ? 'L' : 'M'}${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`; }
  return d;
};
const PASTELS = ['#ff9ac8', '#9be5a3', '#c3a8ff', '#ffd48a', '#8fd8ff', '#ffb3c7'];
const cloud = (x, y, s, o = 0.9) => `<g transform="translate(${x} ${y}) scale(${s})" opacity="${o}"><ellipse rx="70" ry="26" fill="#fff"/><circle cx="-25" cy="-18" r="26" fill="#fff"/><circle cx="20" cy="-24" r="32" fill="#fff"/></g>`;
const tree = (x, c) => `<g transform="translate(${x} ${GROUND_Y})"><rect x="-7" y="-50" width="14" height="52" rx="5" fill="#d9a77a"/><circle cy="-80" r="44" fill="${c}"/><circle cx="-14" cy="-90" r="10" fill="#fff" opacity=".35"/></g>`;
const bush = (x, c) => `<g transform="translate(${x} ${GROUND_Y})"><circle cx="-16" cy="-12" r="18" fill="${c}"/><circle cx="12" cy="-14" r="22" fill="${c}"/></g>`;
const lollyTree = (x, c, s = 1) => `<g transform="translate(${x} ${GROUND_Y}) scale(${s})"><rect x="-6" y="-100" width="12" height="102" rx="5" fill="#fff"/><circle cy="-120" r="46" fill="${c}"/><path transform="translate(0 -120)" d="${swirl(40)}" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity=".85"/></g>`;
const mushroom = (x, s = 1) => `<g transform="translate(${x} ${GROUND_Y}) scale(${s})"><rect x="-8" y="-26" width="16" height="28" rx="6" fill="#fff6e8"/><path d="M-30,-24 Q0,-70 30,-24 Z" fill="#ff6b8b"/><circle cx="-10" cy="-38" r="5" fill="#fff"/><circle cx="8" cy="-44" r="4" fill="#fff"/><circle cx="16" cy="-32" r="3.5" fill="#fff"/></g>`;
const candyCane = (x) => `<g transform="translate(${x} ${GROUND_Y})"><path d="M0,0 V-70 a16,16 0 0 1 32,0" stroke="#fff" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M0,-10 V-70 a16,16 0 0 1 32,0" stroke="#ff6b8b" stroke-width="12" stroke-dasharray="12 12" fill="none"/></g>`;
const clump = (x, cols) => `<g transform="translate(${x} ${GROUND_Y})">${[-16, 0, 16].map((d, i) => `<line x1="${d}" y1="2" x2="${d}" y2="-${22 + i * 6}" stroke="#4fb86a" stroke-width="3"/><circle cx="${d}" cy="-${26 + i * 6}" r="9" fill="${cols[i % cols.length]}"/><circle cx="${d}" cy="-${26 + i * 6}" r="3.5" fill="#fff6a8"/>`).join('')}</g>`;
const rainbowArc = (cx, r, w = 22, op = 0.55) => RAINBOW.map((c, i) => `<path d="M${cx - r + i * w},900 A${r - i * w},${r - i * w} 0 0 1 ${cx + r - i * w},900" stroke="${c}" stroke-width="${w}" fill="none" opacity="${op}"/>`).join('');
const spark = (x, y, s, c = '#fff6a8') => `<path transform="translate(${x} ${y}) scale(${s})" d="${STAR}" fill="${c}"/>`;

function scatter(seed, step, fn) {
  const r = rng(seed);
  let s = '';
  for (let x = 50; x < TILE - 20; x += step * (0.7 + r() * 0.7)) s += fn(x, r);
  return s;
}

const hills = (c1, c2) => () => [[150, 760, 380, 150, c1], [600, 790, 420, 190, c2], [1050, 770, 400, 160, c1], [1450, 780, 360, 170, c2]]
  .map(([cx, cy, rx, ry, c]) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${c}"/>`).join('');

const THEMES = {
  meadow: {
    sky: ['#bfe3ff', '#fff3d6'], ground: ['#8fe39c', '#6fd08c'], fly: false,
    items: ['flower', 'butterfly', 'star'],
    far: hills('#b8efc0', '#aee9b8'),
    mid: () => scatter(11, 130, (x, r) => { const k = r(); return k < 0.3 ? tree(x, PASTELS[Math.floor(r() * 6)]) : k < 0.75 ? clump(x, [RAINBOW[Math.floor(r() * 6)], '#fff', '#ff8fc7']) : bush(x, '#7fdc92'); }),
  },
  clouds: {
    sky: ['#8fcdfb', '#ffd6f1'], ground: ['#ffffff', '#e3eeff'], fly: true,
    items: ['star', 'heart', 'gem'],
    far: () => scatter(21, 330, (x, r) => cloud(x, 180 + r() * 380, 2.4 + r(), 0.5)),
    mid: () => scatter(22, 220, (x, r) => cloud(x, 300 + r() * 380, 1.1 + r() * 0.7, 0.85)) + rainbowArc(360, 150, 12, 0.7) + rainbowArc(1180, 120, 10, 0.7),
  },
  forest: {
    sky: ['#d5eeff', '#fbe3ff'], ground: ['#a5e8a0', '#7fd48c'], fly: false, muddy: true,
    items: ['candy', 'lolly', 'mushroom'],
    far: () => `<g opacity=".55">${scatter(31, 260, (x, r) => lollyTree(x, PASTELS[Math.floor(r() * 6)], 1.6 + r() * 0.6))}</g>`,
    mid: () => scatter(32, 120, (x, r) => { const k = r(); return k < 0.4 ? lollyTree(x, PASTELS[Math.floor(r() * 6)], 0.9 + r() * 0.4) : k < 0.75 ? mushroom(x, 0.8 + r() * 0.5) : candyCane(x); }),
  },
  bridge: {
    sky: ['#bfe0ff', '#ffe3f4'], ground: ['#ffd1e8', '#ffb3d9'], fly: true, stripes: true,
    items: ['heart', 'star', 'gem'],
    far: () => rainbowArc(380, 520) + rainbowArc(1250, 430),
    mid: () => scatter(41, 150, (x, r) => spark(x, 260 + r() * 400, 0.8 + r() * 1.2, r() < 0.5 ? '#fff6a8' : '#fff')) + scatter(42, 380, (x, r) => cloud(x, 560 + r() * 120, 1.2, 0.8)),
  },
};
THEMES.free = { ...THEMES.meadow, items: ['flower', 'butterfly', 'star', 'heart', 'gem', 'candy'] };

export const DEST_IDS = ['meadow', 'clouds', 'forest', 'bridge', 'free'];
export const isMuddy = (id) => !!(THEMES[id] && THEMES[id].muddy);

// ---------- landmarks at the end of a journey ----------
const LANDMARKS = {
  meadow: `<g><path d="M-170,0 V-200 a170,170 0 0 1 340,0 V0" stroke="#fff" stroke-width="30" fill="none"/>
    ${Array.from({ length: 14 }, (_, i) => { const a = Math.PI + (i / 13) * Math.PI; return `<circle cx="${Math.cos(a) * 170}" cy="${-200 + Math.sin(a) * 170}" r="17" fill="${RAINBOW[i % 6]}"/>`; }).join('')}
    ${[-170, 170].map((x) => Array.from({ length: 5 }, (_, i) => `<circle cx="${x}" cy="${-i * 40}" r="17" fill="${RAINBOW[(i + 2) % 6]}"/>`).join('')).join('')}
    <circle cx="0" cy="-80" r="40" fill="#fff6a8"/><circle cx="0" cy="-80" r="16" fill="#ff9a5c"/></g>`,
  clouds: `<g><ellipse cy="0" rx="230" ry="46" fill="#fff"/><circle cx="-120" cy="-30" r="50" fill="#fff"/><circle cx="130" cy="-34" r="56" fill="#fff"/>
    <rect x="-60" y="-190" width="120" height="150" rx="6" fill="#f0e2ff" stroke="#fff" stroke-width="4"/><polygon points="-76,-188 76,-188 0,-290" fill="#ff8fc7"/>
    <path d="M-20,-40 v-34 a20,20 0 0 1 40,0 v34Z" fill="#d3bdff"/><circle cx="0" cy="-140" r="14" fill="#a9d8ff"/>
    ${RAINBOW.map((c, i) => `<path d="M60,-60 Q230,-260 330,${-10 - i * 0}" transform="translate(0 ${i * 9})" stroke="${c}" stroke-width="9" fill="none" opacity=".9"/>`).join('')}</g>`,
  forest: `<g><rect x="-150" y="-170" width="300" height="170" rx="12" fill="#c98f5e"/>
    ${[-100, -40, 20, 80].map((x, i) => `<rect x="${x}" y="-170" width="30" height="170" fill="#b57a4c" opacity=".4"/>`).join('')}
    <polygon points="-185,-160 185,-160 0,-300" fill="#ff8fc7"/><path d="M-150,-166 Q-100,-130 -50,-166 T50,-166 T150,-166" stroke="#fff" stroke-width="14" fill="none"/>
    <path d="M-34,0 v-84 a34,34 0 0 1 68,0 v84Z" fill="#a9d8ff" stroke="#fff" stroke-width="6"/><circle cx="-100" cy="-100" r="24" fill="#ffd23f"/><circle cx="100" cy="-100" r="24" fill="#6edc8c"/>
    ${[[-200, '#ff6b8b'], [200, '#a98bff']].map(([x, c]) => `<g transform="translate(${x} 0)"><rect x="-5" y="-110" width="10" height="110" fill="#fff"/><circle cy="-130" r="34" fill="${c}"/></g>`).join('')}</g>`,
  bridge: `<g>${RAINBOW.map((c, i) => `<path d="M-260,0 A260,260 0 0 1 260,0" transform="scale(${1 - i * 0.07} ${1 - i * 0.07})" stroke="${c}" stroke-width="22" fill="none"/>`).join('')}
    <path d="M-80,0 Q-90,-70 0,-76 Q90,-70 80,0Z" fill="#3b2a4a"/><ellipse cy="-76" rx="80" ry="14" fill="#5c4a73"/>
    ${[-50, -20, 14, 44, 0, -34, 30].map((x, i) => `<circle cx="${x}" cy="${-92 - (i % 3) * 8}" r="15" fill="#ffd84d" stroke="#e8b923" stroke-width="3"/>`).join('')}</g>`,
};

// ---------- treats to collect ----------
function itemSVG(type, c) {
  switch (type) {
    case 'flower': return `${[0, 72, 144, 216, 288].map((a) => `<circle cx="${Math.cos(a * Math.PI / 180) * 14}" cy="${Math.sin(a * Math.PI / 180) * 14}" r="12" fill="${c}"/>`).join('')}<circle r="9" fill="#fff6a8"/>`;
    case 'butterfly': return `<g class="wing"><ellipse cx="-14" cy="-8" rx="15" ry="20" fill="${c}"/></g><g class="wing"><ellipse cx="14" cy="-8" rx="15" ry="20" fill="${c}"/></g><ellipse cx="-10" cy="12" rx="9" ry="12" fill="${c}" opacity=".8"/><ellipse cx="10" cy="12" rx="9" ry="12" fill="${c}" opacity=".8"/><rect x="-3" y="-14" width="6" height="34" rx="3" fill="#6b4a7a"/>`;
    case 'star': return `<path transform="scale(3.6)" d="${STAR}" fill="#ffd84d" stroke="#fff" stroke-width=".6"/>`;
    case 'heart': return `<path d="M0,26 C-46,-4 -22,-40 0,-16 C22,-40 46,-4 0,26Z" fill="${c}" stroke="#fff" stroke-width="3"/>`;
    case 'gem': return `<polygon points="-26,-8 -14,-26 14,-26 26,-8 0,28" fill="${c}" stroke="#fff" stroke-width="3"/><polygon points="-14,-26 -6,-8 6,-8 14,-26" fill="#fff" opacity=".45"/>`;
    case 'candy': return `<polygon points="-34,-16 -20,0 -34,16" fill="${c}"/><polygon points="34,-16 20,0 34,16" fill="${c}"/><ellipse rx="22" ry="16" fill="${c}"/><path d="M-10,-14 L10,14" stroke="#fff" stroke-width="6" opacity=".7"/>`;
    case 'lolly': return `<rect x="-3" y="4" width="6" height="34" rx="3" fill="#fff"/><circle cy="-8" r="24" fill="${c}"/><path transform="translate(0 -8)" d="${swirl(20, 2)}" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
    case 'mushroom': return `<rect x="-7" y="-2" width="14" height="26" rx="6" fill="#fff6e8"/><path d="M-26,0 Q0,-48 26,0Z" fill="#ff6b8b"/><circle cx="-8" cy="-14" r="4" fill="#fff"/><circle cx="8" cy="-20" r="3.5" fill="#fff"/>`;
    default: return '';
  }
}

export function destIcon(id) {
  const frame = (bg, inner) => `<svg viewBox="0 0 160 120"><rect width="160" height="120" rx="18" fill="${bg}"/>${inner}</svg>`;
  const lift = `translate(0 ${100 - GROUND_Y})`; // scenery pieces are drawn on the ground line; move them into the icon
  switch (id) {
    case 'meadow': return frame('#bfe3ff', `<ellipse cx="50" cy="118" rx="90" ry="38" fill="#8fe39c"/><ellipse cx="130" cy="122" rx="70" ry="34" fill="#aee9b8"/><circle cx="125" cy="28" r="14" fill="#fff6a8"/><g transform="${lift}">${clump(55, ['#ff6b8b', '#ffd23f', '#a98bff'])}${clump(115, ['#ff9a5c', '#fff', '#5cc8ff'])}</g>`);
    case 'clouds': return frame('#a5d4fb', `${cloud(50, 70, 0.9)}${cloud(115, 40, 0.6)}<path transform="translate(120 85) scale(2.2)" d="${STAR}" fill="#ffd84d"/>`);
    case 'forest': return frame('#e6f2ff', `<rect y="92" width="160" height="28" rx="10" fill="#a5e8a0"/><g transform="${lift}">${lollyTree(52, '#ff9ac8', 0.55)}${lollyTree(112, '#c3a8ff', 0.45)}</g>`);
    case 'bridge': return frame('#d8ecff', `<g transform="translate(80 108)">${RAINBOW.map((c, i) => `<path d="M${-66 + i * 9},0 A${66 - i * 9},${66 - i * 9} 0 0 1 ${66 - i * 9},0" stroke="${c}" stroke-width="9" fill="none"/>`).join('')}</g>`);
    case 'free': return frame('#ffe3f4', `${RAINBOW.map((c, i) => `<path d="M12,${70 + i * 5} Q60,${40 + i * 3} 104,${58 + i * 4}" stroke="${c}" stroke-width="6" fill="none" stroke-linecap="round"/>`).join('')}<path transform="translate(118 50) scale(3.4)" d="${STAR}" fill="#ffd84d"/>`);
    default: return '';
  }
}

// ---------- the ride ----------
let S = null;
const mk = (name, attrs = {}, parent) => {
  const e = document.createElementNS(NS, name);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
};
const tile = (parent, html, f) => {
  const g = mk('g', {}, parent);
  g.innerHTML = `<g>${html}</g><g transform="translate(${TILE} 0)">${html}</g>`;
  return { g, f };
};

export function isActive() { return !!S; }

export function startTrip({ dest, seconds = 28, unicorn, princess, look, onArrive }) {
  const th = THEMES[dest];
  tsvg.innerHTML = '';
  tsvg.style.display = '';
  const defs = mk('defs', {}, tsvg);
  defs.innerHTML = `<linearGradient id="tsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${th.sky[0]}"/><stop offset="1" stop-color="${th.sky[1]}"/></linearGradient>
    <linearGradient id="tground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${th.ground[0]}"/><stop offset="1" stop-color="${th.ground[1]}"/></linearGradient>
    <linearGradient id="tbar" x1="0" y1="0" x2="1" y2="0">${RAINBOW.map((c, i) => `<stop offset="${i / 5}" stop-color="${c}"/>`).join('')}</linearGradient>
    <clipPath id="riderclipT"><rect x="-60" y="-200" width="120" height="184"/></clipPath>`;
  mk('rect', { width: 1600, height: 900, fill: 'url(#tsky)' }, tsvg);
  const sun = mk('g', {}, tsvg);
  sun.innerHTML = '<circle cx="1360" cy="140" r="60" fill="#fff3a0"/><circle cx="1360" cy="140" r="82" fill="#fff3a0" opacity=".35"/>';
  const layers = [];
  layers.push(tile(tsvg, th.far(), 0.12));
  layers.push(tile(tsvg, th.mid(), 0.4));
  const ground = mk('g', {}, tsvg);
  ground.innerHTML = `<rect y="${GROUND_Y - 4}" width="1600" height="170" fill="url(#tground)"/>`
    + (th.stripes ? RAINBOW.map((c, i) => `<rect y="${GROUND_Y - 4 + i * 13}" width="1600" height="13" fill="${c}" opacity=".85"/>`).join('') : '')
    + `<rect y="${GROUND_Y - 6}" width="1600" height="6" fill="#fff" opacity=".5"/>`;
  layers.push(tile(tsvg, scatter(51, 70, (x, r) => `<path d="M${x},${GROUND_Y + 40 + r() * 100} q6,-18 12,0 M${x + 14},${GROUND_Y + 50 + r() * 90} q6,-18 12,0" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".5"/>`), 1));

  const items = mk('g', {}, tsvg);
  const landmark = mk('g', { style: 'display:none' }, tsvg);
  landmark.innerHTML = LANDMARKS[dest] || '';
  const hero = mk('g', { 'pointer-events': 'none' }, tsvg);
  mk('g', { transform: 'scale(1.3)' }, hero).innerHTML = unicornSVG(unicorn) + riderSVG(princess, look, 'riderclipT');
  const fxg = mk('g', { 'pointer-events': 'none' }, tsvg);

  const ui = mk('g', { 'pointer-events': 'none', style: dest === 'free' ? 'display:none' : '' }, tsvg);
  ui.innerHTML = `<rect x="330" y="34" width="940" height="26" rx="13" fill="#fff" opacity=".7"/><rect id="tbarfill" x="334" y="38" width="10" height="18" rx="9" fill="url(#tbar)"/>`;
  const bar = ui.querySelector('#tbarfill');
  const marker = mk('path', { d: STAR, fill: '#ffd84d', stroke: '#fff', 'stroke-width': 1 }, ui);

  S = {
    dest, th, layers, items, landmark, hero, fxg, bar, marker, onArrive,
    time: 0, off: 0, v: 240, state: 'ride', objs: [], parts: [], combo: 0, comboT: 0, got: 0, lx: 0,
    steering: false, px: 520, py: GROUND_Y, trailT: 0, trailI: 0, nextSpawn: 0.6, partyT: 0, partyBurst: 0,
    hx: 380, hy: th.fly ? 560 : GROUND_Y, phase: 0, T: seconds,
  };
  audio.moveIn();
}

export function endTrip() {
  S = null;
  tsvg.innerHTML = '';
  tsvg.style.display = 'none';
}

function toTrip(e) {
  const pt = tsvg.createSVGPoint();
  pt.x = e.clientX; pt.y = e.clientY;
  return pt.matrixTransform(tsvg.getScreenCTM().inverse());
}
tsvg.addEventListener('pointerdown', (e) => {
  if (!S) return;
  e.preventDefault();
  const p = toTrip(e);
  S.steering = true; S.px = p.x; S.py = p.y;
});
window.addEventListener('pointermove', (e) => {
  if (!S || !S.steering) return;
  const p = toTrip(e);
  S.px = p.x; S.py = p.y;
});
['pointerup', 'pointercancel'].forEach((ev) => window.addEventListener(ev, () => { if (S) S.steering = false; }));

function burst(x, y, n = 10, colors = RAINBOW) {
  for (let i = 0; i < n; i++) {
    const a = rand(0, Math.PI * 2), v = rand(80, 260);
    S.parts.push({ el: mk('path', { d: STAR, fill: colors[i % colors.length] }, S.fxg), x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, g: 300, life: 0, max: rand(0.6, 1.1), s: rand(0.8, 1.7), spin: 1 });
  }
}

function spawnItem() {
  const th = S.th;
  const type = th.items[Math.floor(Math.random() * th.items.length)];
  const c = RAINBOW[Math.floor(Math.random() * 6)];
  const g = mk('g', { class: 'treat' }, S.items);
  g.innerHTML = `<g>${itemSVG(type, c)}</g><circle r="46" fill="transparent"/>`;
  const o = { el: g, type, c, x: 1720, y: rand(250, th.fly ? 700 : 650), ph: rand(0, 6) };
  g.addEventListener('pointerdown', () => collect(o));
  S.objs.push(o);
}

function collect(o) {
  const i = S.objs.indexOf(o);
  if (i < 0) return;
  S.objs.splice(i, 1);
  o.el.remove();
  burst(o.x, o.y, 8, [o.c, '#fff', '#ffd84d']);
  audio.chime(3 + (S.combo % 7));
  S.combo++; S.comboT = 2; S.got++;
  if (S.got % 10 === 0) { audio.moveIn(); burst(S.hx, S.hy - 100, 16); }
}

export function updateTrip(dt, t) {
  if (!S) return;
  S.time += dt;
  const th = S.th;

  // speed and journey state
  if (S.state === 'ride' && S.dest !== 'free' && S.time >= S.T) {
    S.state = 'approach'; S.lx = 1950;
    S.landmark.style.display = '';
  }
  if (S.state === 'approach') {
    S.v = clamp((S.lx - 1000) * 0.8, 40, 240);
    S.lx -= S.v * dt;
    if (S.lx - 1000 < 3) {
      S.state = 'arrived'; S.v = 0; S.partyT = 6;
      audio.moveIn(); setTimeout(() => audio.chime(9), 400);
      burst(S.lx, GROUND_Y - 200, 24);
      if (S.onArrive) S.onArrive(S.dest);
    }
  }
  if (S.state === 'arrived') {
    S.partyT -= dt; S.partyBurst -= dt;
    if (S.partyT > 0 && S.partyBurst <= 0) { S.partyBurst = 0.3; burst(S.lx + rand(-200, 200), GROUND_Y - rand(100, 320), 8); }
  }
  S.off += S.v * dt;

  // scenery
  S.layers.forEach((l) => l.g.setAttribute('transform', `translate(${(-(S.off * l.f) % TILE).toFixed(1)} 0)`));
  if (S.state === 'approach' || S.state === 'arrived') {
    const bounce = S.state === 'arrived' ? 1 + Math.sin(t * 5) * 0.015 : 1;
    S.landmark.setAttribute('transform', `translate(${S.lx.toFixed(1)} ${GROUND_Y}) scale(${bounce})`);
  }

  // treats
  S.nextSpawn -= dt;
  if (S.nextSpawn <= 0 && S.state === 'ride') { spawnItem(); S.nextSpawn = rand(0.6, 1.3); }
  S.comboT -= dt; if (S.comboT <= 0) S.combo = 0;
  for (let i = S.objs.length - 1; i >= 0; i--) {
    const o = S.objs[i];
    o.x -= (S.v + 18) * dt;
    if (o.x < -80) { o.el.remove(); S.objs.splice(i, 1); continue; }
    const bob = Math.sin(t * 2.5 + o.ph) * 10;
    o.el.setAttribute('transform', `translate(${o.x.toFixed(1)} ${(o.y + bob).toFixed(1)}) rotate(${(Math.sin(t * 2 + o.ph) * 12).toFixed(1)})`);
  }

  // the unicorn follows your finger, or settles on the path
  const tx = S.steering ? clamp(S.px, 250, 1150) : 380;
  const ty = S.steering ? clamp(S.py + 40, 300, th.fly ? 740 : GROUND_Y) : (th.fly ? 560 + Math.sin(t * 1.6) * 14 : GROUND_Y);
  const k = 1 - Math.exp(-6 * dt);
  const prevY = S.hy;
  S.hx += (tx - S.hx) * k;
  S.hy += (ty - S.hy) * k;
  const vy = (S.hy - prevY) / Math.max(dt, 0.001);
  const onGround = !th.fly && S.hy > GROUND_Y - 6;
  const gallop = onGround && S.v > 20 ? Math.abs(Math.sin(t * 11)) * 9 : Math.sin(t * 3) * 3;
  const rot = clamp(vy * 0.03, -14, 14);
  S.hero.setAttribute('transform', `translate(${S.hx.toFixed(1)} ${(S.hy - gallop).toFixed(1)}) rotate(${rot.toFixed(1)}) `);

  for (const o of S.objs.slice()) {
    const dx = o.x - (S.hx + 40), dy = o.y - (S.hy - 100);
    if (dx * dx + dy * dy < 95 * 95) collect(o);
  }

  // rainbow trail
  S.trailT -= dt;
  if (S.trailT <= 0 && S.state !== 'arrived') {
    S.trailT = 0.05;
    const c = RAINBOW[S.trailI++ % 6];
    S.parts.push({ el: mk('circle', { r: 9, fill: c, opacity: '.85' }, S.fxg), x: S.hx - 90, y: S.hy - 70 + rand(-8, 8), vx: -(S.v + 90), vy: rand(-12, 12), g: 0, life: 0, max: 0.9, s: 1, spin: 0 });
  }

  for (let i = S.parts.length - 1; i >= 0; i--) {
    const p = S.parts[i];
    p.life += dt;
    if (p.life >= p.max) { p.el.remove(); S.parts.splice(i, 1); continue; }
    p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt;
    const f = 1 - p.life / p.max;
    p.el.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) ${p.spin ? `rotate(${p.life * 220}) ` : ''}scale(${(p.s * f).toFixed(2)})`);
  }

  // journey bar
  const prog = S.dest === 'free' ? 0 : clamp(S.time / S.T, 0, 1);
  S.bar.setAttribute('width', (10 + prog * 922).toFixed(1));
  S.marker.setAttribute('transform', `translate(${(344 + prog * 912).toFixed(1)} 47) scale(2.2)`);
}
