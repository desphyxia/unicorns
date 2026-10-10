// Runs the trips: builds the stage, gives each trip its tools, and tells the castle how it went.
import { RAINBOW, STAR, mk, rand, clamp, makeFx, cloud, lollyTree, clump, GROUND_Y } from './tripkit.js';
import * as audio from './audio.js';
import * as forest from './forest.js';
import * as garden from './garden.js';
import * as skypaint from './skypaint.js';
import * as bridge from './bridge.js';
import * as treasure from './treasure.js';
import * as freeride from './freeride.js';

const tsvg = document.getElementById('trip');

const TRIPS = {
  forest: { n: 3, mod: forest, muddy: true },
  garden: { n: 2, mod: garden, muddy: false },
  sky: { n: 1, mod: skypaint, muddy: false },
  bridge: { n: 6, mod: bridge, muddy: false },
  treasure: { n: 2, mod: treasure, muddy: true },
  free: { n: 1, mod: freeride, muddy: false },
};
export const DEST_IDS = ['forest', 'garden', 'sky', 'bridge', 'treasure', 'free'];
export const groupSize = (id) => TRIPS[id].n;

let cur = null;
export const isActive = () => !!cur;

export function startTrip({ dest, pairs, locked = [], onPhoto, onDone }) {
  tsvg.innerHTML = '';
  tsvg.style.display = '';
  const defs = mk('defs', {}, tsvg);
  defs.innerHTML = '<clipPath id="riderclipT"><rect x="-60" y="-200" width="120" height="184"/></clipPath>';
  const listeners = [];
  const host = {
    tsvg, pairs, locked, audio, mk, rand, clamp,
    listen(target, type, fn) { target.addEventListener(type, fn); listeners.push([target, type, fn]); },
    toLocal(e) {
      const pt = tsvg.createSVGPoint();
      pt.x = e.clientX; pt.y = e.clientY;
      return pt.matrixTransform(tsvg.getScreenCTM().inverse());
    },
    photo() { if (onPhoto) onPhoto(tsvg); },
    finish(result = {}) {
      if (cur.finished) return;
      cur.finished = true;
      cur.result = { finished: true, muddy: TRIPS[dest].muddy, ...result };
      cur.doneT = 9;
      audio.moveIn();
      setTimeout(() => audio.chime(10), 450);
      host.fx.confetti(800, 500, 70);
    },
  };
  const fx = makeFx(tsvg);
  host.fx = fx;
  host.trail = fx.trail;
  const ctrl = TRIPS[dest].mod.start(host);
  tsvg.appendChild(fx.g); // sparkles on top of everything
  cur = { dest, ctrl, host, listeners, finished: false, result: null, doneT: 0, notified: false, onDone };
}

export function updateTrip(dt, t) {
  if (!cur) return;
  cur.ctrl.update(dt, t);
  cur.host.fx.update(dt);
  if (cur.finished && !cur.notified) {
    cur.doneT -= dt;
    if (cur.doneT <= 0) { cur.notified = true; if (cur.onDone) cur.onDone(); }
  }
}

// leave the trip; returns what the castle should hand out
export function endTrip() {
  if (!cur) return { finished: false, coins: 0 };
  const c = cur;
  cur = null;
  c.listeners.forEach(([target, type, fn]) => target.removeEventListener(type, fn));
  if (c.ctrl.destroy) c.ctrl.destroy();
  c.host.fx.clear();
  tsvg.innerHTML = '';
  tsvg.style.display = 'none';
  if (c.finished) return c.result;
  return { finished: false, coins: 0, ...(c.ctrl.result ? c.ctrl.result() : {}) };
}

// ---------- picture buttons for the trip menu ----------
export function destIcon(id) {
  const frame = (bg, inner) => `<svg viewBox="0 0 160 120"><rect width="160" height="120" rx="18" fill="${bg}"/>${inner}</svg>`;
  const lift = `translate(0 ${100 - GROUND_Y})`;
  const arc = (r, w, c) => `<path d="M${-r},0 A${r},${r} 0 0 1 ${r},0" stroke="${c}" stroke-width="${w}" fill="none"/>`;
  switch (id) {
    case 'forest': return frame('#d9f3d0', `<rect y="92" width="160" height="28" rx="10" fill="#a5e8a0"/><g transform="${lift}">${lollyTree(40, '#ff9ac8', 0.5)}${lollyTree(120, '#c3a8ff', 0.42)}</g>
      <g transform="translate(78 100)"><path d="M-26,0 L-20,-26 H20 L26,0Z" fill="#e0a874" stroke="#c78a55" stroke-width="2"/><circle cx="-10" cy="-30" r="9" fill="#ff6b8b"/><circle cx="8" cy="-32" r="9" fill="#ff8fc7"/><circle cx="0" cy="-40" r="9" fill="#ffd23f"/></g>`);
    case 'garden': return frame('#cfeaff', `<circle cx="132" cy="26" r="13" fill="#fff6a8"/><ellipse cx="80" cy="108" rx="84" ry="26" fill="#b68a5e"/><ellipse cx="80" cy="102" rx="64" ry="14" fill="#c9a074"/>
      <g transform="translate(0 ${100 - GROUND_Y})">${clump(48, ['#ff6b8b', '#ffd23f', '#a98bff'])}${clump(112, ['#5cc8ff', '#fff', '#ff9a5c'])}</g><g transform="translate(40 30) scale(.55)">${cloud(0, 0, 1)}</g><path d="M30,48 l-4,10 M40,52 l-4,10 M50,48 l-4,10" stroke="#5cc8ff" stroke-width="3" stroke-linecap="round"/>`);
    case 'sky': return frame('#f7c8e6', `${RAINBOW.map((c, i) => `<path d="M10,${88 + i * 4} C50,${20 + i * 4} 90,${110 + i * 4} 146,${34 + i * 4}" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round"/>`).join('')}<path transform="translate(132 26) scale(2.2)" d="${STAR}" fill="#fff6a8"/><path transform="translate(28 30) scale(1.4)" d="${STAR}" fill="#fff"/>`);
    case 'bridge': return frame('#d8ecff', `<rect x="0" y="86" width="34" height="34" fill="#a5e8a0"/><rect x="126" y="86" width="34" height="34" fill="#a5e8a0"/><g transform="translate(80 104)">${RAINBOW.map((c, i) => arc(54 - i * 7, 7, c)).join('')}</g>`);
    case 'treasure': return frame('#9fdcf7', `<ellipse cx="80" cy="82" rx="62" ry="30" fill="#ffe6a8"/><path d="M60,66 l22,22 M82,66 l-22,22" stroke="#e0556f" stroke-width="7" stroke-linecap="round"/><g transform="translate(116 72)"><rect x="-16" y="-8" width="32" height="20" rx="4" fill="#c98f5e"/><path d="M-16,-8 a16,12 0 0 1 32,0Z" fill="#e0a874"/><rect x="-3" y="-4" width="6" height="8" fill="#ffd23f"/></g><path d="M24,40 q8,-10 16,0" stroke="#fff" stroke-width="3" fill="none"/>`);
    case 'free': return frame('#ffe3f4', `${RAINBOW.map((c, i) => `<path d="M12,${70 + i * 5} Q60,${40 + i * 3} 104,${58 + i * 4}" stroke="${c}" stroke-width="6" fill="none" stroke-linecap="round"/>`).join('')}<path transform="translate(118 50) scale(3.4)" d="${STAR}" fill="#ffd84d"/>`);
    default: return '';
  }
}
