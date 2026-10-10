import { PRINCESSES, UNICORNS, RAINBOW } from './cast.js';
import { sceneSVG, princessSVG, unicornSVG, riderSVG, ROOMS, GROUND, roomBounds, STYLE_COUNT, TOTAL_STYLES } from './art.js';
import { SHORE, MUD, SPONGE_REST, WATER, inWater, clampToWater, duckSVG } from './lakeart.js';
import { openWardrobe } from './wardrobe.js';
import { startTrip, endTrip, updateTrip, destIcon, DEST_IDS, groupSize } from './trips.js';
import { STALL_X, STALL_Y } from './stableart.js';
import { initSky, updateSky, isNight } from './sky.js';
import * as party from './party.js';
import { initPhotos, clearPhotos } from './photos.js';
import { initStable } from './stable.js';
import * as audio from './audio.js';

const NS = 'http://www.w3.org/2000/svg';
const svg = document.getElementById('stage');
svg.innerHTML = sceneSVG();
const layer = svg.querySelector('#chars');
const fx = svg.querySelector('#fx');
const tools = svg.querySelector('#tools');
const castleScene = svg.querySelector('#castleScene');
const lakeScene = svg.querySelector('#lakeScene');
const ducksG = svg.querySelector('#ducks');
const highlights = [...svg.querySelectorAll('.room-hl')];
const stash = document.createElementNS(NS, 'g'); // riders wait here while sitting on a unicorn
stash.setAttribute('style', 'display:none');
svg.appendChild(stash);
const fade = document.getElementById('fade');
const lakeHome = document.getElementById('lakeHome');
const picker = document.getElementById('picker');

// ---------- saved state ----------
const KEY = 'elsas-castle-v1';
let saved = { homes: {}, looks: {}, dirt: {}, names: {}, birthdays: {}, partyDone: {}, coins: 0, unlocked: [], newItems: [], hinted: false, lakeHinted: false };
try { saved = { ...saved, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch (e) { /* private mode etc. */ }
function save() { try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) { /* ignore */ } }

const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
let mode = 'castle'; // 'castle' | 'lake' | 'trip' | 'stable'
const SLEEP = { x0: 70, x1: 250, y0: 830, y1: 880 }; // unicorns go to bed in front of the stable
const nameOf = (def) => saved.names[def.id] || def.name;
let busy = false;

// ---------- characters ----------
const chars = [];
const FOAM_N = 16;

function el(name, attrs = {}, parent) {
  const e = document.createElementNS(NS, name);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}

function make(def, kind, index) {
  const g = el('g', { class: `char ${kind}` });
  const shadow = el('ellipse', { class: 'shadow', rx: kind === 'unicorn' ? 44 : 26, ry: 6, fill: 'rgba(80,40,100,.18)' }, g);
  const flip = el('g', {}, g);
  const bodyWrap = el('g', {}, flip);
  const art = el('g', {}, bodyWrap);
  art.innerHTML = kind === 'princess' ? princessSVG(def, saved.looks[def.id]) : unicornSVG(def);
  const riderG = el('g', { style: 'display:none' }, bodyWrap);

  // mud spots and soap foam sit on top of the artwork
  const area = kind === 'princess' ? { x0: -22, x1: 22, y0: -112, y1: -22 } : { x0: -46, x1: 84, y0: -118, y1: -30 };
  const dirtG = el('g', { style: 'display:none' }, bodyWrap);
  for (let i = 0; i < 7; i++) {
    el('circle', { cx: rand(area.x0, area.x1).toFixed(1), cy: rand(area.y0, area.y1).toFixed(1), r: rand(3.5, 7).toFixed(1), fill: '#9b6a4a', opacity: '.88' }, dirtG);
  }
  const sleepG = el('g', { style: 'display:none' }, bodyWrap);
  sleepG.innerHTML = kind === 'princess'
    ? (def.hairStyle === 'wavy'
      ? `<circle cx="-6.3" cy="-88.6" r="4.4" fill="${def.skin}"/><circle cx="6.3" cy="-88.6" r="4.4" fill="${def.skin}"/><path d="M-9.6,-88.4 q3.3,3.4 6.6,0 M3,-88.4 q3.3,3.4 6.6,0" stroke="#33201a" stroke-width="1.6" fill="none" stroke-linecap="round"/>`
      : `<circle cx="-6" cy="-88" r="3.8" fill="${def.skin}"/><circle cx="6" cy="-88" r="3.8" fill="${def.skin}"/><path d="M-9.5,-88 q3.5,3.5 7,0 M2.5,-88 q3.5,3.5 7,0" stroke="#3b2a4a" stroke-width="1.7" fill="none" stroke-linecap="round"/>`)
    : `<circle cx="72" cy="-100" r="5.2" fill="${def.body}"/><path d="M66.5,-100 q5.5,4.5 11,0" stroke="#3b2a4a" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  const blanketG = el('g', { style: 'display:none' }, bodyWrap); // tucked in when she sleeps in her bed
  blanketG.innerHTML = '<rect x="-37" y="-58" width="74" height="64" rx="16" fill="#ff6b8b" opacity=".92"/><path d="M-37,-44 H37" stroke="#fff" stroke-width="5" opacity=".55"/>';
  const hatG = el('g', { style: 'display:none' }, bodyWrap);
  if (kind === 'princess') hatG.innerHTML = '<path d="M-13,-117 L2,-158 L15,-117Z" fill="#ff8fc7" stroke="#fff" stroke-width="2"/><path d="M-9,-128 L10,-128 M-6,-139 L7,-139" stroke="#fff" stroke-width="3" opacity=".8"/><circle cx="2" cy="-160" r="6" fill="#ffd84d"/>';
  const foamG = el('g', {}, bodyWrap);
  for (let i = 0; i < FOAM_N; i++) {
    const c = el('circle', { cx: rand(area.x0 - 6, area.x1 + 6).toFixed(1), cy: rand(area.y0 - 8, area.y1).toFixed(1), r: rand(6, 12).toFixed(1), fill: '#fff', stroke: '#bfe6ff', 'stroke-width': 2, style: 'display:none' }, foamG);
    c.setAttribute('opacity', '.95');
  }

  const hit = el('rect', { fill: 'transparent' }, g);
  if (kind === 'princess') { hit.setAttribute('x', -42); hit.setAttribute('y', -135); hit.setAttribute('width', 84); hit.setAttribute('height', 142); }
  else { hit.setAttribute('x', -70); hit.setAttribute('y', -160); hit.setAttribute('width', 170); hit.setAttribute('height', 168); }
  layer.appendChild(g);

  const c = {
    def, kind, index, el: g, flip, art, riderG, sleepG, blanketG, hatG, body: bodyWrap, shadow, dirtG, foamEls: [...foamG.children],
    scale: kind === 'unicorn' ? 0.85 : 1,
    walk: kind === 'unicorn' ? rand(40, 60) : rand(45, 70),
    speed: 50, x: 0, y: 0, tx: 0, ty: 0, wait: rand(0, 2), face: 1,
    home: null, moving: false, dragging: false, hopT: -1, phase: rand(0, 6),
    rider: null, mount: null, hidden: false, sleeping: false, lie: 0, lieRot: 0, lieShown: false, zzzT: 0, munch: 0, joy: 0, groom: 0, water: false, foam: 0, foamN: 0, dirt: !!saved.dirt[def.id], dirtShown: null, shine: 0, shineT: 0, cast: null,
  };
  c.home = kind === 'princess' && Number.isInteger(saved.homes[def.id]) ? saved.homes[def.id] : null;
  const b = boundsOf(c);
  c.x = c.tx = rand(b.x0, b.x1);
  c.y = c.ty = rand(b.y0, b.y1);
  chars.push(c);
  g.addEventListener('pointerdown', (e) => onDown(e, c));
  return c;
}

// where a princess lies down in her room's bed (head on the pillow)
function bedSpot(i) {
  const r = ROOMS[i];
  const bedLeft = r.i % 2 === 0;
  const bx = bedLeft ? r.x + 12 : r.x + r.w - 112;
  const fy = r.y + r.h - 22;
  return bedLeft ? { x: bx + 96, y: fy - 20, rot: -90 } : { x: bx + 6, y: fy - 20, rot: 90 };
}

function boundsOf(c) {
  if (mode === 'lake') return SHORE;
  if (mode === 'stable') { const x = STALL_X[c.index]; return { x0: x - 40, x1: x + 40, y0: STALL_Y - 4, y1: STALL_Y + 4 }; }
  if (party.isActive()) return party.boundsFor(c);
  return c.home === null ? GROUND : roomBounds(ROOMS[c.home]);
}

function pickTarget(c) {
  const b = boundsOf(c);
  const far = c.kind === 'unicorn' ? 260 : 180;
  c.tx = clamp(c.x + rand(-far, far), b.x0, b.x1);
  c.ty = rand(b.y0, b.y1);
  c.wait = rand(1, c.kind === 'unicorn' ? 5 : 3.5);
}

PRINCESSES.forEach((p, i) => make(p, 'princess', i));
UNICORNS.forEach((u, i) => make(u, 'unicorn', i));

// ---------- particles: sparkles, bubbles, mud, ripples ----------
const particles = [];
const STAR = 'M0,-9 L2.5,-2.5 L9,0 L2.5,2.5 L0,9 L-2.5,2.5 L-9,0 L-2.5,-2.5Z';
function addParticle(p) {
  if (particles.length > 260) { p.el.remove(); return; }
  fx.appendChild(p.el);
  particles.push(p);
}
function sparkle(x, y, n = 10) {
  for (let i = 0; i < n; i++) {
    const a = rand(0, Math.PI * 2);
    const v = rand(60, 200);
    addParticle({ kind: 'star', el: el('path', { d: STAR, fill: RAINBOW[i % RAINBOW.length] }), x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 80, g: 260, life: 0, max: rand(0.7, 1.2), s: rand(0.7, 1.6) });
  }
}
function bubbles(x, y, n = 6, spread = 40) {
  for (let i = 0; i < n; i++) {
    addParticle({ kind: 'bubble', el: el('circle', { r: rand(5, 13).toFixed(1), fill: 'rgba(255,255,255,.4)', stroke: '#fff', 'stroke-width': 2 }), x: x + rand(-spread, spread), y: y + rand(-spread / 2, spread / 2), vx: rand(-25, 25), vy: -rand(50, 130), g: -10, life: 0, max: rand(0.8, 1.6), s: 1, ph: rand(0, 6) });
  }
}
function splashFx(x, y, n = 12) {
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + rand(-1, 1);
    const v = rand(120, 320);
    addParticle({ kind: 'drop', el: el('circle', { r: rand(3, 7).toFixed(1), fill: '#bfe9ff' }), x: x + rand(-30, 30), y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 700, life: 0, max: rand(0.6, 1), s: 1 });
  }
  ripple(x, y);
}
function mudFx(x, y) {
  for (let i = 0; i < 14; i++) {
    const a = -Math.PI / 2 + rand(-1.2, 1.2);
    const v = rand(120, 300);
    addParticle({ kind: 'drop', el: el('circle', { r: rand(3, 8).toFixed(1), fill: '#9b6a4a' }), x: x + rand(-30, 30), y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 700, life: 0, max: rand(0.6, 1), s: 1 });
  }
}
const HEART = 'M0,9 C-16,-2 -8,-14 0,-6 C8,-14 16,-2 0,9Z';
function hearts(x, y, n = 5) {
  for (let i = 0; i < n; i++) {
    addParticle({ kind: 'heart', el: el('path', { d: HEART, fill: ['#ff6b8b', '#ff8fc7', '#ffb3c7'][i % 3] }), x: x + rand(-30, 30), y: y + rand(-10, 20), vx: rand(-30, 30), vy: -rand(70, 140), g: -10, life: 0, max: rand(1, 1.6), s: rand(1.1, 2) });
  }
}
function confetti(x, y, n = 20, colors = RAINBOW, rain = false) {
  for (let i = 0; i < n; i++) {
    const a = rain ? Math.PI / 2 + rand(-0.4, 0.4) : rand(0, Math.PI * 2);
    const v = rain ? rand(80, 180) : rand(120, 380);
    addParticle({ kind: 'confetti', el: el('rect', { x: -5, y: -3, width: 10, height: 6, fill: colors[i % colors.length] }), x: x + (rain ? 0 : rand(-20, 20)), y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (rain ? 0 : 160), g: rain ? 20 : 380, life: 0, max: rain ? rand(3, 5) : rand(1.4, 2.4), s: 1, spin: rand(-6, 6) });
  }
}
function puff(x, y) {
  for (let i = 0; i < 4; i++) {
    addParticle({ kind: 'bubble', el: el('circle', { r: rand(5, 9).toFixed(1), fill: 'rgba(200,200,220,.8)', stroke: 'none' }), x: x + rand(-6, 6), y, vx: rand(-14, 14), vy: -rand(30, 70), g: 0, life: 0, max: 0.9, s: 1, ph: rand(0, 6) });
  }
}
function zzz(x, y) {
  const t = el('text', { 'font-size': 30, 'font-weight': 800, fill: '#fff', stroke: '#7a6bb8', 'stroke-width': 2, 'paint-order': 'stroke', 'font-family': 'ui-rounded, system-ui, sans-serif' });
  t.textContent = 'z';
  addParticle({ kind: 'zzz', el: t, x, y, vx: 12, vy: -34, g: 0, life: 0, max: 2.4, s: 1, ph: rand(0, 6) });
}
function ripple(x, y) {
  addParticle({ kind: 'ripple', el: el('ellipse', { rx: 10, ry: 3, fill: 'none', stroke: '#fff', 'stroke-width': 3 }), x, y, vx: 0, vy: 0, g: 0, life: 0, max: 1, s: 1 });
}
function rainbowArc(x, y) {
  const g = el('g');
  RAINBOW.forEach((c, i) => el('path', { d: `M${-70 + i * 5},0 A${70 - i * 5},${70 - i * 5} 0 0 1 ${70 - i * 5},0`, stroke: c, 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }, g));
  addParticle({ kind: 'arc', el: g, x, y, vx: 0, vy: -30, g: 0, life: 0, max: 1.8, s: 1 });
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life += dt;
    if (p.life >= p.max) { p.el.remove(); particles.splice(i, 1); continue; }
    p.vy += p.g * dt;
    p.x += p.vx * dt; p.y += p.vy * dt;
    const k = 1 - p.life / p.max;
    const pos = `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`;
    if (p.kind === 'star') {
      p.el.setAttribute('transform', `${pos} rotate(${p.life * 200}) scale(${(p.s * k).toFixed(2)})`);
    } else if (p.kind === 'bubble') {
      p.el.setAttribute('transform', `translate(${(p.x + Math.sin(p.life * 6 + p.ph) * 6).toFixed(1)} ${p.y.toFixed(1)}) scale(${(1 + (1 - k) * 0.4).toFixed(2)})`);
      p.el.setAttribute('opacity', Math.min(1, k * 2).toFixed(2));
    } else if (p.kind === 'drop') {
      p.el.setAttribute('transform', `${pos} scale(${Math.min(1, k * 3).toFixed(2)})`);
    } else if (p.kind === 'ripple') {
      const s = 1 + p.life * 9;
      p.el.setAttribute('transform', `${pos} scale(${s.toFixed(2)})`);
      p.el.setAttribute('opacity', k.toFixed(2));
    } else if (p.kind === 'heart') {
      p.el.setAttribute('transform', `${pos} scale(${(p.s * Math.min(1, k * 2.5)).toFixed(2)})`);
    } else if (p.kind === 'confetti') {
      p.el.setAttribute('transform', `${pos} rotate(${(p.life * p.spin * 120).toFixed(0)})`);
      p.el.setAttribute('opacity', Math.min(1, k * 3).toFixed(2));
    } else if (p.kind === 'zzz') {
      p.el.setAttribute('transform', `translate(${(p.x + Math.sin(p.life * 3 + p.ph) * 8).toFixed(1)} ${p.y.toFixed(1)}) scale(${(0.7 + p.life * 0.35).toFixed(2)})`);
      p.el.setAttribute('opacity', Math.min(1, k * 2).toFixed(2));
    } else if (p.kind === 'arc') {
      p.el.setAttribute('transform', pos);
      p.el.setAttribute('opacity', Math.min(1, k * 2.5).toFixed(2));
    }
  }
}

// ---------- dragging (princesses, unicorns and the sponge) ----------
const drags = new Map(); // pointerId -> { c | tool, moved, sx, sy }
let idle = 0;

function toSvg(e) {
  const pt = svg.createSVGPoint();
  pt.x = e.clientX; pt.y = e.clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
}

function roomAt(x, y) {
  return ROOMS.find((r) => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h) || null;
}

function updateHighlights() {
  const on = new Set();
  for (const d of drags.values()) if (d.c && d.c.kind === 'princess' && d.moved && d.room) on.add(d.room.i);
  highlights.forEach((h) => h.classList.toggle('on', on.has(+h.dataset.room)));
}

function onDown(e, c) {
  if (busy) return;
  idle = 0;
  const p = toSvg(e);
  drags.set(e.pointerId, { c, moved: false, sx: p.x, sy: p.y, room: null });
  c.dragging = true;
  e.preventDefault();
}

// the sponge
const sponge = { x: SPONGE_REST.x, y: SPONGE_REST.y, dragging: false, wob: 0, lastSound: 0 };
const spongeEl = el('g', { style: 'display:none', class: 'sponge' }, tools);
spongeEl.innerHTML = `<rect x="-36" y="-24" width="72" height="48" rx="16" fill="#ffe27a" stroke="#f5c542" stroke-width="3"/>
  <rect x="-33" y="5" width="66" height="17" rx="8" fill="#6edc8c"/>
  <circle cx="-16" cy="-9" r="4.5" fill="#f5c542"/><circle cx="8" cy="-13" r="3.5" fill="#f5c542"/><circle cx="20" cy="-3" r="4.5" fill="#f5c542"/><circle cx="-3" cy="1" r="3" fill="#f5c542"/>
  <rect x="-70" y="-55" width="140" height="110" fill="transparent"/>`;
spongeEl.addEventListener('pointerdown', (e) => {
  if (busy || mode !== 'lake') return;
  idle = 0;
  const p = toSvg(e);
  drags.set(e.pointerId, { tool: 'sponge', moved: true, lx: p.x, ly: p.y });
  sponge.dragging = true;
  audio.pop();
  e.preventDefault();
});

function scrub(d, p) {
  const moved = Math.hypot(p.x - d.lx, p.y - d.ly);
  d.lx = p.x; d.ly = p.y;
  sponge.x = p.x; sponge.y = p.y;
  sponge.wob += moved * 0.05;
  const target = chars.find((c) => c.water && !c.dragging && Math.abs(p.x - c.x) < 75 * c.scale && p.y > c.y - 135 * c.scale && p.y < c.y + 10);
  if (!target || moved < 1) return;
  target.foam = Math.min(1, target.foam + moved * 0.0017);
  if (Math.random() < Math.min(0.6, moved / 40)) bubbles(p.x, p.y, 1, 20);
  const now = performance.now();
  if (now - sponge.lastSound > 120) { audio.bubble(); sponge.lastSound = now; }
  if (target.foam >= 1) wash(target);
}

window.addEventListener('pointermove', (e) => {
  const d = drags.get(e.pointerId);
  if (!d) return;
  idle = 0;
  const p = toSvg(e);
  if (d.tool === 'sponge') { scrub(d, p); return; }
  if (mode === 'stable') return; // unicorns stay in their stalls
  if (!d.moved && Math.hypot(p.x - d.sx, p.y - d.sy) > 12) {
    d.moved = true;
    audio.pop();
  }
  if (d.moved) {
    d.c.x = p.x;
    d.c.y = p.y + 55; // hold her around the middle
    d.c.tx = d.c.x; d.c.ty = d.c.y;
    d.px = p.x; d.py = p.y;
    d.room = mode === 'castle' && d.c.kind === 'princess' ? roomAt(p.x, p.y) : null;
    updateHighlights();
  }
});

function endDrag(e) {
  const d = drags.get(e.pointerId);
  if (!d) return;
  drags.delete(e.pointerId);
  if (d.tool === 'sponge') { sponge.dragging = false; return; }
  const c = d.c;
  c.dragging = false;
  if (!d.moved) { tap(c); updateHighlights(); return; }
  if (mode === 'lake') { dropInLake(c); updateHighlights(); return; }
  if (c.kind === 'princess') { // dropped onto a unicorn? hop on!
    const u = chars.find((k) => k.kind === 'unicorn' && !k.rider && !k.dragging && Math.abs(d.px - k.x) < 95 && d.py > k.y - 150 && d.py < k.y + 20);
    if (u) { mount(c, u); updateHighlights(); return; }
  }
  const room = c.kind === 'princess' ? d.room : null;
  if (c.kind === 'princess') {
    c.home = room ? room.i : null;
    saved.homes[c.def.id] = c.home;
    saved.hinted = true;
    save();
    if (room) { audio.moveIn(); sparkle(c.x, c.y - 60, 16); }
    else audio.chime(4);
  } else {
    audio.chime(6);
  }
  const b = boundsOf(c);
  c.x = clamp(c.x, b.x0, b.x1);
  c.tx = c.x;
  c.ty = rand(b.y0, b.y1);
  c.speed = 480; // drop down quickly
  c.wait = rand(0.5, 1.5);
  updateHighlights();
}
window.addEventListener('pointerup', endDrag);
window.addEventListener('pointercancel', endDrag);

function tap(c) {
  c.hopT = 0;
  if (mode === 'lake' && c.water) { // splash and soap her up
    splashFx(c.x, c.y - 22, 8);
    bubbles(c.x, c.y - 70, 5);
    audio.splash();
    c.foam = Math.min(1, c.foam + 0.25);
    if (c.foam >= 1) wash(c);
    return;
  }
  sparkle(c.x, c.y - (c.kind === 'unicorn' ? 90 : 70), 8);
  if (mode === 'stable') { hearts(c.x + 30, c.y - 120, 4); audio.neigh(); return; }
  if (c.kind === 'unicorn') {
    audio.neigh();
    if (c.rider && mode === 'castle') openPicker();
    return;
  }
  audio.chime(3 + (c.index * 2) % 7);
  if (mode === 'lake') return;
  // tapping a princess in the castle opens her wardrobe
  openWardrobe({
    def: c.def,
    name: nameOf(c.def),
    look: saved.looks[c.def.id],
    unlocked: unlockedMap(),
    fresh: saved.newItems.splice(0),
    onChange: (look) => {
      saved.looks[c.def.id] = look;
      save();
      c.art.innerHTML = princessSVG(c.def, look);
      c.body = c.art.parentNode;
    },
    onClose: () => { idle = 0; c.hopT = 0; sparkle(c.x, c.y - 70, 14); },
  });
}

// ---------- riding ----------
function mount(p, u) {
  p.mount = u;
  u.rider = p;
  stash.appendChild(p.el);
  u.riderG.innerHTML = riderSVG(p.def, saved.looks[p.def.id], 'riderclip', 0.95); // bigger in the castle, easy to see
  u.riderG.style.display = '';
  u.hopT = 0;
  u.wait = 3;
  sparkle(u.x, u.y - 110, 14);
  audio.moveIn();
}

function dismount(u) {
  const p = u.rider;
  if (!p) return;
  u.rider = null;
  p.mount = null;
  u.riderG.style.display = 'none';
  u.riderG.innerHTML = '';
  layer.appendChild(p.el);
  const b = boundsOf(p); // back to her own room if she has one, otherwise next to the unicorn
  if (p.home === null) { p.x = clamp(u.x + 70, b.x0, b.x1); p.y = u.y; } else { p.x = rand(b.x0, b.x1); p.y = rand(b.y0, b.y1); }
  p.tx = p.x; p.ty = p.y;
  p.hopT = 0;
  p.wait = rand(1, 2);
  sparkle(p.x, p.y - 70, 10);
}

const DOWN_ICON = '<svg viewBox="0 0 160 120"><rect width="160" height="120" rx="18" fill="#ffe3f4"/><path d="M80,18 v62 M52,56 l28,30 28,-30" stroke="#ff6b8b" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const BACK_ICON = '<svg viewBox="0 0 100 100"><path d="M60,24 l-28,26 28,26" stroke="#fff" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// ---------- rewards: clothes from the treasure chest, gold coins ----------
const CATS = ['dress', 'shoes', 'tiara'];
function lockedItems() {
  const list = [];
  CATS.forEach((cat) => { for (let idx = STYLE_COUNT; idx < TOTAL_STYLES; idx++) if (!saved.unlocked.includes(`${cat}:${idx}`)) list.push({ cat, idx }); });
  return list;
}
function unlockedMap() {
  const m = { dress: [], shoes: [], tiara: [] };
  saved.unlocked.forEach((k) => { const [cat, idx] = k.split(':'); if (m[cat]) m[cat].push(+idx); });
  Object.values(m).forEach((a) => a.sort((x, y) => x - y));
  return m;
}
const coinsEl = document.getElementById('coins');
const coinN = document.getElementById('coinN');
function showCoins(bump) {
  coinN.textContent = saved.coins;
  if (bump) { coinsEl.classList.remove('bump'); void coinsEl.offsetWidth; coinsEl.classList.add('bump'); }
}
showCoins(false);

// ---------- trips ----------
function openPicker() {
  const riding = chars.some((c) => c.kind === 'unicorn' && c.rider);
  picker.innerHTML = `<button class="round-btn pk-back" data-act="back" aria-label="Back">${BACK_ICON}</button>
    <div class="pk-grid" style="grid-template-columns:repeat(${riding ? 4 : 3},1fr);width:${riding ? 'min(92vw,170vh)' : 'min(80vw,118vh)'}">${DEST_IDS.map((id) => `<button class="pk-btn" data-dest="${id}">${destIcon(id)}</button>`).join('')}${riding ? `<button class="pk-btn" data-act="down">${DOWN_ICON}</button>` : ''}</div>`;
  picker.hidden = false;
}
picker.onpointerdown = (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  picker.hidden = true;
  if (b.dataset.act === 'down') { audio.pop(); chars.forEach((u) => { if (u.rider) dismount(u); }); return; }
  if (b.dataset.dest) { audio.moveIn(); goTo(() => beginTrip(b.dataset.dest)); }
};

// who comes along: riders already on a unicorn first, then Elsa, then friends, until the trip is full
let tripPairs = [];
function buildPairs(n) {
  const pairs = chars.filter((u) => u.kind === 'unicorn' && u.rider).map((u) => ({ u, p: u.rider }));
  pairs.sort((a, b) => (b.p.def.id === 'elsa') - (a.p.def.id === 'elsa'));
  const freeP = chars.filter((c) => c.kind === 'princess' && !c.mount).sort((a, b) => (b.def.id === 'elsa') - (a.def.id === 'elsa') || Math.random() - 0.5);
  const freeU = chars.filter((c) => c.kind === 'unicorn' && !c.rider);
  while (pairs.length < n && freeP.length && freeU.length) {
    const p = freeP.shift();
    freeU.sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y));
    const u = freeU.shift();
    mount(p, u);
    pairs.push({ u, p });
  }
  pairs.slice(n).forEach(({ u }) => dismount(u));
  return pairs.slice(0, n);
}

function beginTrip(dest) {
  party.stop(true);
  tripPairs = buildPairs(groupSize(dest));
  mode = 'trip';
  svg.style.display = 'none';
  lakeHome.hidden = false;
  startTrip({
    dest,
    pairs: tripPairs.map(({ u, p }) => ({ unicorn: u.def, princess: p.def, look: saved.looks[p.def.id] })),
    locked: lockedItems(),
    onPhoto: (source) => photosApi.savePhoto(source),
    onDone: () => { if (mode === 'trip' && !busy) { audio.moveIn(); goTo(endTripScene); } },
  });
}

function endTripScene() {
  const r = endTrip();
  mode = 'castle';
  svg.style.display = '';
  lakeHome.hidden = true;
  const pairs = tripPairs;
  tripPairs = [];
  pairs.forEach(({ u }) => dismount(u));
  if (r.coins) saved.coins += r.coins;
  if (r.finished) {
    if (r.muddy) pairs.forEach(({ u, p }) => [u, p].forEach((c) => { c.dirt = true; saved.dirt[c.def.id] = 1; }));
    if (r.unlock) {
      const key = `${r.unlock.cat}:${r.unlock.idx}`;
      if (!saved.unlocked.includes(key)) saved.unlocked.push(key);
      saved.newItems.push(key);
    }
    if (r.crowns) {
      pairs.forEach(({ p }, i) => { // the flower crowns stay on
        const look = { ...(saved.looks[p.def.id] || {}), tiara: 2, tiaraColor: RAINBOW[(i * 4) % 6] };
        saved.looks[p.def.id] = look;
        p.art.innerHTML = princessSVG(p.def, look);
        p.body = p.art.parentNode;
      });
    }
  }
  save();
  showCoins(true);
}

// ---------- the lake ----------
function dropInLake(c) {
  const wasWater = c.water;
  if (inWater(c.x, c.y)) {
    const q = clampToWater(c.x, c.y);
    c.x = c.tx = q.x; c.y = c.ty = q.y;
    c.water = true;
    c.speed = c.walk;
    saved.lakeHinted = true;
    if (!wasWater) { audio.splash(); splashFx(c.x, c.y - 22, 16); bubbles(c.x, c.y - 60, 6); }
    return;
  }
  if (wasWater) { c.foam = 0; audio.bubble(); bubbles(c.x, c.y - 60, 8); }
  c.water = false;
  if (c.x > MUD.cx - MUD.rx - 40 && c.y > 790) { // plop into the mud
    c.x = clamp(c.x, MUD.cx - 70, MUD.cx + 70);
    c.y = MUD.cy + rand(-4, 6);
    c.tx = c.x; c.ty = c.y;
    if (!c.dirt) { c.dirt = true; saved.dirt[c.def.id] = 1; save(); }
    audio.splat();
    mudFx(c.x, c.y - 10);
    c.wait = rand(1.5, 2.5);
    return;
  }
  c.x = clamp(c.x, SHORE.x0, SHORE.x1);
  c.tx = c.x;
  c.ty = rand(SHORE.y0, SHORE.y1);
  c.speed = 480;
  c.wait = rand(0.5, 1.5);
}

function wash(c) {
  c.foam = 0;
  if (c.dirt) { c.dirt = false; delete saved.dirt[c.def.id]; save(); }
  bubbles(c.x, c.y - 70, 14, 50);
  sparkle(c.x, c.y - 80, 18);
  rainbowArc(c.x, c.y - 135);
  c.shine = 2;
  c.hopT = 0;
  audio.moveIn();
  audio.splash();
}

// rubber ducks
const ducks = [0, 1, 2].map((i) => {
  const g = el('g', { class: 'duck' }, ducksG);
  g.innerHTML = `<ellipse class="duck-ring" cx="0" cy="-2" rx="30" ry="8" fill="none" stroke="#fff" stroke-width="3" opacity=".8"/><g class="duck-body">${duckSVG()}</g><rect x="-34" y="-50" width="76" height="56" fill="transparent"/>`;
  const d = { el: g, body: g.querySelector('.duck-body'), x: WATER.cx + (i - 1) * 260, y: WATER.cy + rand(-60, 60), tx: 0, ty: 0, face: 1, phase: rand(0, 6), hopT: -1 };
  d.tx = d.x; d.ty = d.y;
  g.addEventListener('pointerdown', (e) => {
    if (busy || mode !== 'lake') return;
    e.preventDefault();
    idle = 0;
    d.hopT = 0;
    audio.quack();
    bubbles(d.x, d.y - 30, 4);
    ripple(d.x, d.y);
  });
  return d;
});

function updateDucks(dt, t) {
  for (const d of ducks) {
    const dx = d.tx - d.x, dy = d.ty - d.y, dist = Math.hypot(dx, dy);
    if (dist < 4) {
      const q = clampToWater(WATER.cx + rand(-WATER.rx, WATER.rx) * 0.8, WATER.cy + rand(-WATER.ry, WATER.ry) * 0.7);
      d.tx = q.x; d.ty = q.y;
    } else {
      const step = Math.min(dist, 26 * dt);
      d.x += (dx / dist) * step; d.y += (dy / dist) * step;
      if (Math.abs(dx) > 4) d.face = dx > 0 ? 1 : -1;
    }
    let hop = 0;
    if (d.hopT >= 0) { d.hopT += dt * 2.5; if (d.hopT >= 1) d.hopT = -1; else hop = Math.sin(d.hopT * Math.PI) * 24; }
    const bob = Math.sin((t + d.phase) * 2.4) * 3;
    d.el.setAttribute('transform', `translate(${d.x.toFixed(1)} ${(d.y - hop + bob).toFixed(1)}) scale(${1.3 * d.face} 1.3)`);
  }
}

// tapping the water makes ripples
svg.querySelector('#water').addEventListener('pointerdown', (e) => {
  if (busy || mode !== 'lake') return;
  e.preventDefault();
  idle = 0;
  const p = toSvg(e);
  splashFx(p.x, p.y, 5);
  audio.splash();
});

// ---------- changing scenes ----------
function goTo(fn) {
  if (busy) return;
  busy = true;
  fade.classList.add('on');
  setTimeout(() => {
    fn();
    idle = 0;
    fade.classList.remove('on');
    setTimeout(() => { busy = false; }, 350);
  }, 350);
}

function enterLake() {
  party.stop(true);
  chars.forEach((u) => { if (u.rider) dismount(u); });
  mode = 'lake';
  for (const c of chars) {
    c.cast = { x: c.x, y: c.y };
    c.water = false;
    c.foam = 0;
    c.x = c.tx = rand(SHORE.x0, SHORE.x1);
    c.y = c.ty = rand(SHORE.y0, SHORE.y1);
    c.wait = rand(0, 2);
  }
  castleScene.style.display = 'none';
  lakeScene.style.display = '';
  spongeEl.style.display = '';
  sponge.x = SPONGE_REST.x; sponge.y = SPONGE_REST.y;
  lakeHome.hidden = false;
  highlights.forEach((h) => h.classList.remove('on'));
}

function leaveLake() {
  mode = 'castle';
  for (const c of chars) {
    c.water = false;
    c.foam = 0;
    c.x = c.tx = c.cast ? c.cast.x : rand(GROUND.x0, GROUND.x1);
    c.y = c.ty = c.cast ? c.cast.y : rand(GROUND.y0, GROUND.y1);
    c.speed = c.walk;
  }
  castleScene.style.display = '';
  lakeScene.style.display = 'none';
  spongeEl.style.display = 'none';
  lakeHome.hidden = true;
}

// ---------- the stable ----------
function enterStable() {
  party.stop(true);
  chars.forEach((u) => { if (u.rider) dismount(u); });
  mode = 'stable';
  for (const c of chars) {
    c.cast = { x: c.x, y: c.y };
    c.water = false; c.foam = 0; c.joy = 0; c.groom = 0;
    if (c.kind === 'princess') { c.hidden = true; stash.appendChild(c.el); continue; }
    c.x = c.tx = STALL_X[c.index];
    c.y = c.ty = STALL_Y;
    c.face = 1;
    c.wait = rand(0, 2);
  }
  castleScene.style.display = 'none';
  stableTools.setVisible(true);
  lakeHome.hidden = false;
  highlights.forEach((h) => h.classList.remove('on'));
}

function leaveStable() {
  mode = 'castle';
  for (const c of chars) {
    if (c.kind === 'princess') { c.hidden = false; layer.appendChild(c.el); }
    c.x = c.tx = c.cast ? c.cast.x : rand(GROUND.x0, GROUND.x1);
    c.y = c.ty = c.cast ? c.cast.y : rand(GROUND.y0, GROUND.y1);
    c.speed = c.walk;
    c.munch = 0;
  }
  castleScene.style.display = '';
  stableTools.setVisible(false);
  lakeHome.hidden = true;
}

svg.querySelector('#stable').addEventListener('pointerdown', (e) => {
  if (busy || mode !== 'castle') return;
  e.preventDefault();
  audio.neigh();
  goTo(enterStable);
});

svg.querySelector('#pond').addEventListener('pointerdown', (e) => {
  if (busy || mode !== 'castle') return;
  e.preventDefault();
  audio.splash();
  goTo(enterLake);
});
lakeHome.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  if (mode === 'lake') { audio.moveIn(); goTo(leaveLake); }
  else if (mode === 'trip') { audio.moveIn(); goTo(endTripScene); }
  else if (mode === 'stable') { audio.moveIn(); goTo(leaveStable); }
});

// ---------- hint: a little hand shows what to drag ----------
const hand = el('g', { style: 'display:none' }, fx);
hand.innerHTML = '<circle r="26" fill="#fff" opacity=".85"/><circle r="14" fill="#ff8fc7" opacity=".8"/>';
let hintT = 0;
function updateHint(dt) {
  idle += dt;
  const wanted = mode === 'castle' ? !saved.hinted : mode === 'lake' ? !saved.lakeHinted : false;
  const show = wanted && !busy && idle > 6 && drags.size === 0 && !party.isActive() && !isNight();
  hand.style.display = show ? '' : 'none';
  if (!show) { hintT = 0; return; }
  hintT += dt;
  const c = mode === 'castle'
    ? chars.find((k) => k.kind === 'princess' && k.home === null && !k.mount)
    : chars.find((k) => k.kind === 'princess' && !k.water);
  if (!c) return;
  const k = (hintT % 3.2) / 3.2;
  const e = k < 0.2 ? 0 : k > 0.8 ? 1 : (k - 0.2) / 0.6;
  const ease = e * e * (3 - 2 * e);
  const tx = mode === 'castle' ? ROOMS[0].x + 105 : WATER.cx, ty = mode === 'castle' ? ROOMS[0].y + 100 : WATER.cy - 40;
  const x = c.x + (tx - c.x) * ease;
  const y = c.y - 60 + (ty - (c.y - 60)) * ease;
  hand.setAttribute('transform', `translate(${x} ${y}) scale(${1 + Math.sin(k * 20) * 0.04})`);
  hand.style.opacity = k > 0.9 ? (1 - k) * 10 : 1;
}

// ---------- main loop ----------
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  const t = now / 1000;

  if (mode === 'trip') updateTrip(dt, t);
  updateSky(dt, mode);
  party.update(dt, t);
  stableTools.update(dt);
  const partyHidden = mode !== 'castle';
  if (partyBtn.hidden !== partyHidden) { partyBtn.hidden = partyHidden; tripBtn.hidden = partyHidden; coinsEl.hidden = partyHidden; }

  for (const c of chars) {
    if (c.mount || c.hidden) continue;
    let hop = 0;
    if (c.hopT >= 0) {
      c.hopT += dt * 2.2;
      if (c.hopT >= 1) c.hopT = -1; else hop = Math.sin(c.hopT * Math.PI) * 30;
    }
    const sleepNow = mode === 'castle' && !party.isActive() && isNight() && !c.dragging;
    if (sleepNow !== c.sleeping) {
      c.sleeping = sleepNow;
      c.sleepG.style.display = sleepNow ? '' : 'none';
      c.zzzT = rand(0.2, 1.5);
      if (sleepNow && c.kind === 'unicorn') { c.tx = rand(SLEEP.x0, SLEEP.x1); c.ty = rand(SLEEP.y0, SLEEP.y1); c.speed = c.walk; }
      if (sleepNow && c.kind === 'princess' && c.home !== null) { const b = bedSpot(c.home); c.tx = b.x; c.ty = b.y; c.speed = c.walk * 1.5; }
    }
    if (c.sleeping) {
      c.zzzT -= dt;
      if (c.zzzT <= 0) {
        c.zzzT = 2.4 + rand(0, 1);
        if (c.lie > 0.5) zzz(c.x + (c.lieRot < 0 ? -75 : 75), c.y - 34); else zzz(c.x + 22, c.y - (c.kind === 'unicorn' ? 140 : 125));
      }
    }
    // lie down once she has reached her bed, stand up again in the morning
    const bedNow = c.kind === 'princess' && c.sleeping && c.home !== null;
    const spot = bedNow ? bedSpot(c.home) : null;
    const inBed = !!spot && Math.hypot(c.x - spot.x, c.y - spot.y) < 4;
    if (spot) c.lieRot = spot.rot;
    c.lie += ((inBed ? 1 : 0) - c.lie) * Math.min(1, dt * (inBed ? 4 : 9));
    if (c.lie < 0.01) c.lie = 0;
    const showBlanket = c.lie > 0.6;
    if (showBlanket !== c.lieShown) {
      c.lieShown = showBlanket;
      c.blanketG.style.display = showBlanket ? '' : 'none';
      if (showBlanket) c.blanketG.firstChild.setAttribute('fill', RAINBOW[c.home % 6]);
    }
    if (c.munch > 0) c.munch -= dt;
    if (!c.dragging && !c.water) {
      const dx = c.tx - c.x, dy = c.ty - c.y, dist = Math.hypot(dx, dy);
      if (dist > 2) {
        const step = Math.min(dist, c.speed * dt);
        c.x += (dx / dist) * step;
        c.y += (dy / dist) * step;
        c.moving = true;
        if (Math.abs(dx) > 4) c.face = dx > 0 ? 1 : -1;
      } else {
        c.moving = false;
        c.speed = c.walk;
        c.wait -= dt;
        if (c.wait <= 0 && c.hopT < 0 && !c.sleeping) pickTarget(c);
      }
    } else if (c.water) {
      c.moving = false;
    }

    const inW = c.water && !c.dragging;
    if (inW !== c.wasWater) {
      c.wasWater = inW;
      c.el.classList.toggle('inwater', inW);
      if (inW) c.flip.setAttribute('clip-path', 'url(#waterclip)'); else c.flip.removeAttribute('clip-path');
    }
    const n = Math.floor(Math.min(1, c.foam) * FOAM_N);
    if (n !== c.foamN) {
      c.foamN = n;
      c.foamEls.forEach((f, i) => { f.style.display = i < n ? '' : 'none'; });
    }
    const showDirt = c.dirt && c.foam < 0.5;
    if (showDirt !== c.dirtShown) { c.dirtShown = showDirt; c.dirtG.style.display = showDirt ? '' : 'none'; }
    if (c.shine > 0) {
      c.shine -= dt;
      c.shineT -= dt;
      if (c.shineT <= 0) { c.shineT = 0.14; sparkle(c.x + rand(-30, 30), c.y - rand(20, 110) * c.scale, 1); }
    }

    const lift = c.dragging ? 14 : 0;
    const s = c.scale * (mode === 'stable' && c.kind === 'unicorn' ? 1.3 : 1) * (c.dragging ? 1.18 : 1) * (1 - 0.2 * c.lie);
    const wave = inW ? Math.sin((t + c.phase) * 2.2) * 3 : 0;
    const bob = (inW ? wave : c.moving && c.speed < 200 ? Math.abs(Math.sin((t + c.phase) * 9)) * 4 : Math.sin((t + c.phase) * 2) * 1.2) + (c.munch > 0 ? Math.sin(t * 28) * 3 * Math.min(1, c.munch) : 0);
    const sway = inW ? Math.sin((t + c.phase) * 1.3) * 4 : 0;
    c.el.setAttribute('transform', `translate(${(c.x + sway).toFixed(1)} ${(c.y - lift - hop).toFixed(1)}) scale(${s})`);
    c.flip.setAttribute('transform', c.lie > 0 ? `rotate(${(c.lieRot * c.lie).toFixed(1)}) scale(${c.face} 1)` : `scale(${c.face} 1)`);
    c.body.setAttribute('transform', `translate(0 ${(-bob * (1 - c.lie)).toFixed(2)})`);
    if (inW) c.shadow.setAttribute('transform', `translate(0 -22) scale(${(1.1 + Math.sin((t + c.phase) * 3) * 0.1).toFixed(2)} 1)`);
    else c.shadow.setAttribute('transform', `translate(0 ${lift + hop}) scale(${1 - (lift + hop) / 150})`);
  }

  // depth sorting: lower on screen = in front
  const sorted = chars.filter((c) => !c.mount && !c.hidden).sort((a, b) => (a.dragging ? 1e5 : a.y) - (b.dragging ? 1e5 : b.y));
  sorted.forEach((c, i) => { if (layer.children[i] !== c.el) layer.insertBefore(c.el, layer.children[i]); });

  if (mode === 'lake') {
    updateDucks(dt, t);
    if (!sponge.dragging) { sponge.x += (SPONGE_REST.x - sponge.x) * Math.min(1, dt * 9); sponge.y += (SPONGE_REST.y - sponge.y) * Math.min(1, dt * 9); }
    const rot = sponge.dragging ? Math.sin(sponge.wob) * 14 : 0;
    spongeEl.setAttribute('transform', `translate(${sponge.x.toFixed(1)} ${sponge.y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${sponge.dragging ? 1.15 : 1})`);
    if (Math.random() < dt * 0.6) bubbles(rand(WATER.cx - WATER.rx * 0.8, WATER.cx + WATER.rx * 0.8), WATER.cy + rand(-30, 90), 1, 4);
  }

  updateParticles(dt);
  updateHint(dt);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// ---------- extras: sky, party, photos, stable care ----------
const ctx = { svg, layer, tools, el, chars, audio, rand, clamp, toSvg, sparkle, hearts, confetti, puff, dismount, nameOf, boundsOf, getMode: () => mode, isBusy: () => busy };
initSky(ctx);
party.initParty(ctx);
const stableTools = initStable(ctx);
const photosApi = initPhotos({ audio, getSource: () => (mode === 'trip' ? document.getElementById('trip') : svg) });

const partyBtn = document.getElementById('partyBtn');
const tripBtn = document.getElementById('tripBtn');
// one tap opens the trip menu; whoever is needed for the chosen trip joins in automatically
tripBtn.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  if (busy || mode !== 'castle') return;
  party.stop(true);
  audio.neigh();
  openPicker();
});
function todayKey() {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function birthdayPrincess(ignoreDone) {
  const year = new Date().getFullYear();
  return chars.find((c) => c.kind === 'princess' && saved.birthdays[c.def.id] === todayKey() && (ignoreDone || saved.partyDone[c.def.id] !== year)) || null;
}
partyBtn.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  if (busy || mode !== 'castle') return;
  if (party.isActive()) party.stop(); else party.start(birthdayPrincess(true) || undefined);
});

// ---------- start screen ----------
const title = document.querySelector('#start h1');
"Elsa's Castle".split('').forEach((ch, i) => {
  const s = document.createElement('span');
  s.textContent = ch === ' ' ? ' ' : ch;
  s.style.color = RAINBOW[i % RAINBOW.length];
  s.style.animationDelay = `${i * 0.12}s`;
  title.appendChild(s);
});
document.getElementById('play').addEventListener('click', () => {
  audio.start();
  audio.moveIn();
  document.getElementById('start').classList.add('gone');
  setTimeout(() => { // a real birthday today? have the party
    const b = birthdayPrincess(false);
    if (b && party.start(b)) { saved.partyDone[b.def.id] = new Date().getFullYear(); save(); }
  }, 1800);
  setTimeout(() => document.getElementById('start').remove(), 700);
  idle = 0;
});

// ---------- parent corner: hold for 3 seconds ----------
const parentBtn = document.getElementById('parent');
const panel = document.getElementById('panel');
let holdTimer = null;
parentBtn.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  parentBtn.classList.add('holding');
  holdTimer = setTimeout(() => { panel.hidden = false; cancelHold(); }, 3000);
});
function cancelHold() { clearTimeout(holdTimer); parentBtn.classList.remove('holding'); }
['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => parentBtn.addEventListener(ev, cancelHold));
document.getElementById('close').addEventListener('click', () => { panel.hidden = true; });
const namesBox = document.getElementById('names');
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function buildNames() {
  namesBox.innerHTML = '<div class="pn-head">Names and birthdays</div>' + PRINCESSES.map((p) => `<div class="pn-row">
    <span class="pn-dot" style="background:${p.dress}"></span><input class="pn-name" data-id="${p.id}" maxlength="16">
    <select class="pn-m" data-id="${p.id}"><option value="">–</option>${MONTHS.map((m, i) => `<option value="${String(i + 1).padStart(2, '0')}">${m}</option>`).join('')}</select>
    <select class="pn-d" data-id="${p.id}"><option value="">–</option>${Array.from({ length: 31 }, (_, i) => `<option value="${String(i + 1).padStart(2, '0')}">${i + 1}</option>`).join('')}</select></div>`).join('');
  PRINCESSES.forEach((p) => {
    namesBox.querySelector(`.pn-name[data-id="${p.id}"]`).value = nameOf(p);
    const [m, d] = (saved.birthdays[p.id] || '-').split('-');
    namesBox.querySelector(`.pn-m[data-id="${p.id}"]`).value = m || '';
    namesBox.querySelector(`.pn-d[data-id="${p.id}"]`).value = d || '';
  });
}
buildNames();
namesBox.addEventListener('input', (e) => {
  if (!e.target.classList.contains('pn-name')) return;
  const v = e.target.value.trim();
  if (v) saved.names[e.target.dataset.id] = v; else delete saved.names[e.target.dataset.id];
  save();
});
namesBox.addEventListener('change', (e) => {
  const id = e.target.dataset.id;
  if (!id || e.target.classList.contains('pn-name')) return;
  const m = namesBox.querySelector(`.pn-m[data-id="${id}"]`).value, d = namesBox.querySelector(`.pn-d[data-id="${id}"]`).value;
  if (m && d) saved.birthdays[id] = `${m}-${d}`; else delete saved.birthdays[id];
  delete saved.partyDone[id];
  save();
});
document.getElementById('clearPhotos').addEventListener('click', () => { if (confirm('Delete all photos?')) clearPhotos(); });
const snd = document.getElementById('snd');
snd.addEventListener('change', () => audio.setEnabled(snd.checked));
document.getElementById('reset').addEventListener('click', () => {
  if (!confirm('Move everyone back out and start over?')) return;
  chars.forEach((u) => { if (u.rider && mode === 'castle') dismount(u); });
  saved = { ...saved, homes: {}, dirt: {}, hinted: false, lakeHinted: false };
  save();
  chars.forEach((c) => {
    c.dirt = false;
    c.water = false;
    c.foam = 0;
    if (c.kind !== 'princess') return;
    c.home = null;
    if (mode === 'castle') {
      c.x = c.tx = rand(GROUND.x0, GROUND.x1);
      c.y = c.ty = rand(GROUND.y0, GROUND.y1);
    }
  });
  panel.hidden = true;
});

// Reset all settings: rooms, outfits, names, birthdays, unlocked clothes and sound go back to the start. Coins (and photos) are kept.
document.getElementById('resetAll').addEventListener('click', () => {
  if (mode !== 'castle') { alert('Go back to the castle first, then try again.'); return; }
  if (!confirm('Reset all settings back to the start? Rooms, outfits, names, birthdays and unlocked clothes are cleared. Your gold coins are kept.')) return;
  party.stop(true);
  chars.forEach((u) => { if (u.rider) dismount(u); });
  saved = { homes: {}, looks: {}, dirt: {}, names: {}, birthdays: {}, partyDone: {}, coins: saved.coins, unlocked: [], newItems: [], hinted: false, lakeHinted: false };
  save();
  chars.forEach((c) => {
    c.dirt = false; c.water = false; c.foam = 0; c.sleeping = false; c.lie = 0;
    c.x = c.tx = rand(GROUND.x0, GROUND.x1);
    c.y = c.ty = rand(GROUND.y0, GROUND.y1);
    if (c.kind === 'princess') {
      c.home = null;
      c.art.innerHTML = princessSVG(c.def, undefined); // back to the starting outfit
      c.body = c.art.parentNode;
    }
  });
  audio.setEnabled(true);
  snd.checked = true;
  buildNames();
  showCoins(false);
  panel.hidden = true;
});

// ---------- offline support ----------
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
