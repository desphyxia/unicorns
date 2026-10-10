// Day and night: a slow cycle you can also jump by tapping the sun or moon.
import { ROOMS } from './art.js';

const CYCLE = 240; // seconds: day, dusk, night, dawn
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function targetDark(c) {
  if (c < 110) return 0;
  if (c < 135) return (c - 110) / 25;
  if (c < 190) return 1;
  if (c < 215) return 1 - (c - 190) / 25;
  return 0;
}

let clock = 0;
let dark = 0;
let refs = null;

export const isNight = () => dark > 0.7;
export const getDark = () => dark;

export function toggleTime() {
  clock = dark > 0.5 ? 0 : 135;
}

export function initSky(ctx) {
  const { svg, layer, tools, el, audio, isBusy, getMode, sparkle } = ctx;
  const g = el('g', { id: 'sky', 'pointer-events': 'none' });
  svg.insertBefore(g, layer);

  const stars = Array.from({ length: 48 }, (_, i) => {
    const x = (i * 331) % 1600, y = 20 + ((i * 137) % 300), big = i % 4 === 0;
    return big
      ? `<path class="twinkle" style="animation-delay:${(i % 7) * 0.4}s" transform="translate(${x} ${y}) scale(${0.9 + (i % 3) * 0.3})" d="M0,-9 L2.5,-2.5 L9,0 L2.5,2.5 L0,9 L-2.5,2.5 L-9,0 L-2.5,-2.5Z" fill="#fff6c8"/>`
      : `<circle class="twinkle" style="animation-delay:${(i % 5) * 0.5}s" cx="${x}" cy="${y}" r="${2 + (i % 3)}" fill="#fff"/>`;
  }).join('');

  const arch = (wx, y) => `<path d="M${wx},${y + 100} V${y + 56} a24,24 0 0 1 48,0 V${y + 100} Z" fill="#fff2a8"/><path d="M${wx + 24},${y + 32} V${y + 100} M${wx},${y + 72} H${wx + 48}" stroke="#ffd96a" stroke-width="3"/>`;
  const wins = ROOMS.map((r) => {
    const bedLeft = r.i % 2 === 0;
    const lampX = bedLeft ? r.x + r.w - 28 : r.x + 28;
    const fy = r.y + r.h - 22;
    return `${arch(r.x + r.w / 2 - 24, r.y)}<circle cx="${r.x + r.w / 2}" cy="${r.y + 78}" r="62" fill="#ffe27a" opacity=".22"/><circle cx="${lampX}" cy="${fy - 54}" r="26" fill="#fff6a8" opacity=".5"/>`;
  }).join('')
    + [323, 1253].map((x) => [230, 420, 610].map((y) => `<path d="M${x},${y + 36} v-22 a12,12 0 0 1 24,0 v22 Z" fill="#fff2a8"/><circle cx="${x + 12}" cy="${y + 24}" r="26" fill="#ffe27a" opacity=".2"/>`).join('')).join('');

  g.innerHTML = `<rect id="tint" width="1600" height="900" fill="#ff9a5c" opacity="0"/>
    <rect id="shade" width="1600" height="900" fill="#1b2a6b" opacity="0"/>
    <g id="stars" opacity="0">${stars}</g>
    <g id="moon" opacity="0"><circle r="96" fill="#fff6c8" opacity=".14"/><circle r="64" fill="#fff6c8" opacity=".25"/><circle r="52" fill="#fff7d6"/><circle cx="-16" cy="-10" r="9" fill="#efe3b8"/><circle cx="14" cy="14" r="12" fill="#efe3b8"/><circle cx="18" cy="-22" r="6" fill="#efe3b8"/></g>
    <g id="wins" opacity="0" style="display:none">${wins}</g>`;
  refs = {
    tint: g.querySelector('#tint'), shade: g.querySelector('#shade'), stars: g.querySelector('#stars'),
    moon: g.querySelector('#moon'), wins: g.querySelector('#wins'),
    sunC: svg.querySelector('#sunC'), sunL: svg.querySelector('#sunL'),
  };

  // tap the sun (or the moon) to change the time of day
  const hits = [[1400, 130, 'castle'], [240, 120, 'lake']].map(([cx, cy, m]) => {
    const c = el('circle', { cx, cy, r: 90, fill: 'transparent', style: 'cursor:pointer;display:none' }, tools);
    c.addEventListener('pointerdown', (e) => {
      if (isBusy() || getMode() !== m) return;
      e.preventDefault();
      toggleTime();
      audio.chime(dark > 0.5 ? 5 : 9);
      sparkle(cx, cy, 14);
    });
    return { c, m };
  });
  refs.hits = hits;
}

export function updateSky(dt, mode) {
  if (!refs) return;
  clock = (clock + dt) % CYCLE;
  dark += (targetDark(clock) - dark) * Math.min(1, dt * 1.5);
  const showSky = mode === 'castle' || mode === 'lake';
  const k = mode === 'stable' ? 0.25 : 1; // the stable is indoors and stays cosy
  refs.shade.setAttribute('opacity', (0.5 * dark * k).toFixed(3));
  refs.tint.setAttribute('opacity', (0.3 * 4 * dark * (1 - dark) * k).toFixed(3));
  refs.stars.setAttribute('opacity', showSky ? clamp((dark - 0.3) / 0.5, 0, 1).toFixed(2) : 0);
  const moonOp = showSky ? clamp((dark - 0.4) / 0.4, 0, 1) : 0;
  refs.moon.setAttribute('opacity', moonOp.toFixed(2));
  refs.moon.setAttribute('transform', mode === 'lake' ? 'translate(240 120)' : 'translate(1400 130)');
  const sunOp = (1 - clamp(dark * 1.6, 0, 1)).toFixed(2);
  if (refs.sunC) refs.sunC.setAttribute('opacity', sunOp);
  if (refs.sunL) refs.sunL.setAttribute('opacity', sunOp);
  refs.wins.style.display = mode === 'castle' ? '' : 'none';
  refs.wins.setAttribute('opacity', clamp((dark - 0.2) / 0.5, 0, 1).toFixed(2));
  refs.hits.forEach((h) => { h.c.style.display = h.m === mode ? '' : 'none'; });
}
