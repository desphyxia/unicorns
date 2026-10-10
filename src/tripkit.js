// Shared pieces for all the trips: scenery, animals, wings, particles and helpers.
import { unicornSVG, riderSVG, princessSVG } from './art.js';
import { RAINBOW } from './cast.js';

export { RAINBOW };
export const NS = 'http://www.w3.org/2000/svg';
export const TILE = 1600;
export const GROUND_Y = 738;
export const STAR = 'M0,-9 L2.5,-2.5 L9,0 L2.5,2.5 L0,9 L-2.5,2.5 L-9,0 L-2.5,-2.5Z';
export const rand = (a, b) => a + Math.random() * (b - a);
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- scenery pieces ----------
// a candy swirl: an Archimedean spiral around the origin
export const swirl = (r, turns = 2.5) => {
  let d = '';
  for (let i = 0; i <= 40; i++) { const a = (i / 40) * turns * Math.PI * 2, rr = (i / 40) * r; d += `${i ? 'L' : 'M'}${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`; }
  return d;
};
export const PASTELS = ['#ff9ac8', '#9be5a3', '#c3a8ff', '#ffd48a', '#8fd8ff', '#ffb3c7'];
export const cloud = (x, y, s, o = 0.9) => `<g transform="translate(${x} ${y}) scale(${s})" opacity="${o}"><ellipse rx="70" ry="26" fill="#fff"/><circle cx="-25" cy="-18" r="26" fill="#fff"/><circle cx="20" cy="-24" r="32" fill="#fff"/></g>`;
export const tree = (x, c) => `<g transform="translate(${x} ${GROUND_Y})"><rect x="-7" y="-50" width="14" height="52" rx="5" fill="#d9a77a"/><circle cy="-80" r="44" fill="${c}"/><circle cx="-14" cy="-90" r="10" fill="#fff" opacity=".35"/></g>`;
export const bush = (x, c) => `<g transform="translate(${x} ${GROUND_Y})"><circle cx="-16" cy="-12" r="18" fill="${c}"/><circle cx="12" cy="-14" r="22" fill="${c}"/></g>`;
export const lollyTree = (x, c, s = 1) => `<g transform="translate(${x} ${GROUND_Y}) scale(${s})"><rect x="-6" y="-100" width="12" height="102" rx="5" fill="#fff"/><circle cy="-120" r="46" fill="${c}"/><path transform="translate(0 -120)" d="${swirl(40)}" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity=".85"/></g>`;
export const mushroom = (x, s = 1) => `<g transform="translate(${x} ${GROUND_Y}) scale(${s})"><rect x="-8" y="-26" width="16" height="28" rx="6" fill="#fff6e8"/><path d="M-30,-24 Q0,-70 30,-24 Z" fill="#ff6b8b"/><circle cx="-10" cy="-38" r="5" fill="#fff"/><circle cx="8" cy="-44" r="4" fill="#fff"/><circle cx="16" cy="-32" r="3.5" fill="#fff"/></g>`;
export const candyCane = (x) => `<g transform="translate(${x} ${GROUND_Y})"><path d="M0,0 V-70 a16,16 0 0 1 32,0" stroke="#fff" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M0,-10 V-70 a16,16 0 0 1 32,0" stroke="#ff6b8b" stroke-width="12" stroke-dasharray="12 12" fill="none"/></g>`;
export const clump = (x, cols) => `<g transform="translate(${x} ${GROUND_Y})">${[-16, 0, 16].map((d, i) => `<line x1="${d}" y1="2" x2="${d}" y2="-${22 + i * 6}" stroke="#4fb86a" stroke-width="3"/><circle cx="${d}" cy="-${26 + i * 6}" r="9" fill="${cols[i % cols.length]}"/><circle cx="${d}" cy="-${26 + i * 6}" r="3.5" fill="#fff6a8"/>`).join('')}</g>`;
export const rainbowArc = (cx, r, w = 22, op = 0.55) => RAINBOW.map((c, i) => `<path d="M${cx - r + i * w},900 A${r - i * w},${r - i * w} 0 0 1 ${cx + r - i * w},900" stroke="${c}" stroke-width="${w}" fill="none" opacity="${op}"/>`).join('');
export const spark = (x, y, s, c = '#fff6a8') => `<path transform="translate(${x} ${y}) scale(${s})" d="${STAR}" fill="${c}"/>`;

export function scatter(seed, step, fn) {
  const r = rng(seed);
  let s = '';
  for (let x = 50; x < TILE - 20; x += step * (0.7 + r() * 0.7)) s += fn(x, r);
  return s;
}

const hills = (c1, c2) => () => [[150, 760, 380, 150, c1], [600, 790, 420, 190, c2], [1050, 770, 400, 160, c1], [1450, 780, 360, 170, c2]]
  .map(([cx, cy, rx, ry, c]) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${c}"/>`).join('');
export function itemSVG(type, c) {
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


export const mk = (name, attrs = {}, parent) => {
  const e = document.createElementNS(NS, name);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
};

// ---------- characters ----------
export const wingsSVG = () => `<g class="uwings" transform="translate(-8 -78)">
  <g class="uwing"><path d="M0,0 C-30,-60 -80,-70 -96,-46 C-84,-44 -80,-34 -88,-26 C-76,-26 -70,-14 -74,-4 C-52,-8 -22,-6 0,0Z" fill="#fff" stroke="#ffd1e8" stroke-width="3"/></g>
  <g class="uwing" style="animation-delay:-.12s"><path d="M6,0 C20,-62 62,-78 84,-54 C72,-50 70,-40 78,-32 C66,-30 62,-18 66,-8 C44,-10 22,-6 6,0Z" fill="#fff" stroke="#ffd1e8" stroke-width="3" opacity=".85"/></g></g>`;

// a unicorn (facing right) with its princess on its back
export const heroSVG = (pair, { rider = true, wings = false } = {}) =>
  (wings ? wingsSVG() : '') + unicornSVG(pair.unicorn) + (rider ? riderSVG(pair.princess, pair.look, 'riderclipT') : '');
export const unicornOnlySVG = (pair) => unicornSVG(pair.unicorn);
export const princessOnlySVG = (pair) => princessSVG(pair.princess, pair.look);

// ---------- little forest animals (facing right, feet at y=0) ----------
export const ANIMALS = {
  bunny: `<ellipse cx="0" cy="-22" rx="24" ry="20" fill="#fff"/><circle cx="20" cy="-36" r="14" fill="#fff"/><ellipse cx="16" cy="-62" rx="5" ry="16" fill="#fff"/><ellipse cx="26" cy="-61" rx="5" ry="16" fill="#fff"/><ellipse cx="16" cy="-62" rx="2.5" ry="11" fill="#ffc2d6"/><circle cx="-24" cy="-24" r="8" fill="#fff"/><circle cx="25" cy="-39" r="2.4" fill="#3b2a4a"/><circle cx="33" cy="-34" r="2" fill="#ff8fa8"/><ellipse cx="10" cy="-4" rx="12" ry="5" fill="#fff"/>`,
  squirrel: `<path d="M-14,-18 C-60,-30 -56,-86 -22,-80 C-34,-62 -26,-50 -14,-44Z" fill="#c9783a"/><ellipse cx="0" cy="-24" rx="18" ry="22" fill="#d98a4a"/><circle cx="12" cy="-50" r="13" fill="#d98a4a"/><path d="M8,-60 l-3,-12 l9,6Z M18,-60 l3,-12 l-1,12Z" fill="#c9783a"/><ellipse cx="9" cy="-14" rx="8" ry="11" fill="#fff0d6"/><circle cx="17" cy="-52" r="2.3" fill="#3b2a4a"/><circle cx="24" cy="-48" r="2" fill="#3b2a4a"/>`,
  hedgehog: `<path d="M-30,-6 C-36,-50 -4,-62 22,-46 C34,-38 34,-12 26,-6Z" fill="#8a5a3a"/>${Array.from({ length: 9 }, (_, i) => `<path d="M${-26 + i * 6},${-20 - Math.sin(i / 8 * Math.PI) * 28} l-4,-12 l9,6Z" fill="#6b4328"/>`).join('')}<ellipse cx="26" cy="-18" rx="14" ry="12" fill="#f3d2b0"/><circle cx="34" cy="-20" r="2.2" fill="#3b2a4a"/><circle cx="40" cy="-16" r="3" fill="#3b2a4a"/>`,
};

// ---------- particles ----------
export function makeFx(parent) {
  const g = mk('g', { 'pointer-events': 'none' }, parent);
  const list = [];
  const add = (p) => { if (list.length > 280) { p.el.remove(); return; } g.appendChild(p.el); list.push(p); };
  return {
    g,
    burst(x, y, n = 10, colors = RAINBOW) {
      for (let i = 0; i < n; i++) {
        const a = rand(0, Math.PI * 2), v = rand(80, 260);
        add({ k: 'star', el: mk('path', { d: STAR, fill: colors[i % colors.length] }), x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, g: 300, life: 0, max: rand(0.6, 1.1), s: rand(0.8, 1.7) });
      }
    },
    hearts(x, y, n = 5) {
      for (let i = 0; i < n; i++) add({ k: 'heart', el: mk('path', { d: 'M0,9 C-16,-2 -8,-14 0,-6 C8,-14 16,-2 0,9Z', fill: ['#ff6b8b', '#ff8fc7', '#ffb3c7'][i % 3] }), x: x + rand(-25, 25), y, vx: rand(-25, 25), vy: -rand(70, 130), g: -10, life: 0, max: rand(1, 1.5), s: rand(1.2, 2) });
    },
    confetti(x, y, n = 20, rain = false) {
      for (let i = 0; i < n; i++) {
        const a = rain ? Math.PI / 2 + rand(-0.4, 0.4) : rand(0, Math.PI * 2), v = rain ? rand(80, 180) : rand(120, 380);
        add({ k: 'conf', el: mk('rect', { x: -5, y: -3, width: 10, height: 6, fill: RAINBOW[i % 6] }), x: rain ? rand(0, 1600) : x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (rain ? 0 : 160), g: rain ? 20 : 380, life: 0, max: rain ? rand(3, 5) : rand(1.4, 2.4), s: 1, spin: rand(-6, 6) });
      }
    },
    trail(x, y, color, v = 240) {
      add({ k: 'drop', el: mk('circle', { r: 9, fill: color, opacity: '.85' }), x, y, vx: -(v + 90), vy: rand(-12, 12), g: 0, life: 0, max: 0.9, s: 1 });
    },
    drops(x, y, n, color, spread = 1) {
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + rand(-spread, spread), v = rand(60, 220);
        add({ k: 'drop', el: mk('circle', { r: rand(2.5, 6), fill: color }), x: x + rand(-14, 14), y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 700, life: 0, max: rand(0.5, 0.9), s: 1 });
      }
    },
    update(dt) {
      for (let i = list.length - 1; i >= 0; i--) {
        const p = list[i];
        p.life += dt;
        if (p.life >= p.max) { p.el.remove(); list.splice(i, 1); continue; }
        p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt;
        const f = 1 - p.life / p.max, pos = `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`;
        if (p.k === 'star') p.el.setAttribute('transform', `${pos} rotate(${p.life * 220}) scale(${(p.s * f).toFixed(2)})`);
        else if (p.k === 'heart') p.el.setAttribute('transform', `${pos} scale(${(p.s * Math.min(1, f * 2.5)).toFixed(2)})`);
        else if (p.k === 'conf') { p.el.setAttribute('transform', `${pos} rotate(${(p.life * p.spin * 120).toFixed(0)})`); p.el.setAttribute('opacity', Math.min(1, f * 3).toFixed(2)); }
        else p.el.setAttribute('transform', `${pos} scale(${Math.min(1, f * 3).toFixed(2)})`);
      }
    },
    clear() { list.splice(0).forEach((p) => p.el.remove()); },
  };
}
