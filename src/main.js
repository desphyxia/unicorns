import { PRINCESSES, UNICORNS, RAINBOW } from './cast.js';
import { sceneSVG, princessSVG, unicornSVG, ROOMS, GROUND, roomBounds } from './art.js';
import * as audio from './audio.js';

const NS = 'http://www.w3.org/2000/svg';
const svg = document.getElementById('stage');
svg.innerHTML = sceneSVG();
const layer = svg.querySelector('#chars');
const fx = svg.querySelector('#fx');
const highlights = [...svg.querySelectorAll('.room-hl')];

// ---------- saved state ----------
const KEY = 'elsas-castle-v1';
let saved = { homes: {}, hinted: false };
try { saved = { ...saved, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch (e) { /* private mode etc. */ }
function save() { try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) { /* ignore */ } }

// ---------- characters ----------
const rand = (a, b) => a + Math.random() * (b - a);
const chars = [];

function make(def, kind, index) {
  const g = document.createElementNS(NS, 'g');
  g.setAttribute('class', `char ${kind}`);
  const shadow = document.createElementNS(NS, 'ellipse');
  shadow.setAttribute('rx', kind === 'unicorn' ? 44 : 26);
  shadow.setAttribute('ry', 6);
  shadow.setAttribute('fill', 'rgba(80,40,100,.18)');
  const flip = document.createElementNS(NS, 'g');
  flip.innerHTML = kind === 'princess' ? princessSVG(def) : unicornSVG(def);
  const hit = document.createElementNS(NS, 'rect');
  if (kind === 'princess') { hit.setAttribute('x', -42); hit.setAttribute('y', -135); hit.setAttribute('width', 84); hit.setAttribute('height', 142); }
  else { hit.setAttribute('x', -70); hit.setAttribute('y', -160); hit.setAttribute('width', 170); hit.setAttribute('height', 168); }
  hit.setAttribute('fill', 'transparent');
  g.append(shadow, flip, hit);
  layer.appendChild(g);
  const c = {
    def, kind, index, el: g, flip, body: flip.querySelector('.body'), shadow,
    scale: kind === 'unicorn' ? 0.85 : 1,
    walk: kind === 'unicorn' ? rand(40, 60) : rand(45, 70),
    speed: 50, x: 0, y: 0, tx: 0, ty: 0, wait: rand(0, 2), face: 1,
    home: null, moving: false, dragging: false, hopT: -1, phase: rand(0, 6),
  };
  c.home = kind === 'princess' && Number.isInteger(saved.homes[def.id]) ? saved.homes[def.id] : null;
  const b = boundsOf(c);
  c.x = c.tx = rand(b.x0, b.x1);
  c.y = c.ty = rand(b.y0, b.y1);
  chars.push(c);
  g.addEventListener('pointerdown', (e) => onDown(e, c));
  return c;
}

PRINCESSES.forEach((p, i) => make(p, 'princess', i));
UNICORNS.forEach((u, i) => make(u, 'unicorn', i));

function boundsOf(c) {
  return c.home === null ? GROUND : roomBounds(ROOMS[c.home]);
}

function pickTarget(c) {
  const b = boundsOf(c);
  const far = c.kind === 'unicorn' ? 260 : 180;
  c.tx = Math.max(b.x0, Math.min(b.x1, c.x + rand(-far, far)));
  c.ty = rand(b.y0, b.y1);
  c.wait = rand(1, c.kind === 'unicorn' ? 5 : 3.5);
}

// ---------- sparkles ----------
const particles = [];
function sparkle(x, y, n = 10) {
  for (let i = 0; i < n; i++) {
    const s = document.createElementNS(NS, 'path');
    s.setAttribute('d', 'M0,-9 L2.5,-2.5 L9,0 L2.5,2.5 L0,9 L-2.5,2.5 L-9,0 L-2.5,-2.5Z');
    s.setAttribute('fill', RAINBOW[i % RAINBOW.length]);
    fx.appendChild(s);
    const a = rand(0, Math.PI * 2);
    const v = rand(60, 200);
    particles.push({ el: s, x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 80, life: 0, max: rand(0.7, 1.2), s: rand(0.7, 1.6) });
  }
}

// ---------- dragging ----------
const drags = new Map(); // pointerId -> { c, moved, sx, sy }
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
  for (const d of drags.values()) if (d.c.kind === 'princess' && d.moved && d.room) on.add(d.room.i);
  highlights.forEach((h) => h.classList.toggle('on', on.has(+h.dataset.room)));
}

function onDown(e, c) {
  idle = 0;
  const p = toSvg(e);
  drags.set(e.pointerId, { c, moved: false, sx: p.x, sy: p.y, room: null });
  c.dragging = true;
  e.preventDefault();
}

window.addEventListener('pointermove', (e) => {
  const d = drags.get(e.pointerId);
  if (!d) return;
  idle = 0;
  const p = toSvg(e);
  if (!d.moved && Math.hypot(p.x - d.sx, p.y - d.sy) > 12) {
    d.moved = true;
    audio.pop();
  }
  if (d.moved) {
    d.c.x = p.x;
    d.c.y = p.y + 55; // hold her around the middle
    d.c.tx = d.c.x; d.c.ty = d.c.y;
    d.room = d.c.kind === 'princess' ? roomAt(p.x, p.y) : null;
    updateHighlights();
  }
});

function endDrag(e) {
  const d = drags.get(e.pointerId);
  if (!d) return;
  drags.delete(e.pointerId);
  const c = d.c;
  c.dragging = false;
  if (!d.moved) { tap(c); updateHighlights(); return; }
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
  c.x = Math.max(b.x0, Math.min(b.x1, c.x));
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
  sparkle(c.x, c.y - (c.kind === 'unicorn' ? 90 : 70), 8);
  if (c.kind === 'unicorn') audio.neigh(); else audio.chime(3 + (c.index * 2) % 7);
}

// ---------- hint: a little hand shows how to move a princess in ----------
const hand = document.createElementNS(NS, 'g');
hand.innerHTML = '<circle r="26" fill="#fff" opacity=".85"/><circle r="14" fill="#ff8fc7" opacity=".8"/>';
hand.style.display = 'none';
fx.appendChild(hand);
let hintT = 0;
function updateHint(dt) {
  idle += dt;
  const show = !saved.hinted && idle > 6 && drags.size === 0;
  hand.style.display = show ? '' : 'none';
  if (!show) { hintT = 0; return; }
  hintT += dt;
  const c = chars.find((k) => k.kind === 'princess' && k.home === null);
  if (!c) return;
  const k = (hintT % 3.2) / 3.2;
  const e = k < 0.2 ? 0 : k > 0.8 ? 1 : (k - 0.2) / 0.6;
  const ease = e * e * (3 - 2 * e);
  const tx = ROOMS[0].x + 200, ty = ROOMS[0].y + 100;
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

  for (const c of chars) {
    let hop = 0;
    if (c.hopT >= 0) {
      c.hopT += dt * 2.2;
      if (c.hopT >= 1) c.hopT = -1; else hop = Math.sin(c.hopT * Math.PI) * 30;
    }
    if (!c.dragging) {
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
        if (c.wait <= 0 && c.hopT < 0) pickTarget(c);
      }
    }
    const lift = c.dragging ? 14 : 0;
    const s = c.scale * (c.dragging ? 1.18 : 1);
    const bob = c.moving && c.speed < 200 ? Math.abs(Math.sin((t + c.phase) * 9)) * 4 : Math.sin((t + c.phase) * 2) * 1.2;
    c.el.setAttribute('transform', `translate(${c.x.toFixed(1)} ${(c.y - lift - hop).toFixed(1)}) scale(${s})`);
    c.flip.setAttribute('transform', `scale(${c.face} 1)`);
    c.body.setAttribute('transform', `translate(0 ${-bob.toFixed(2)})`);
    c.shadow.setAttribute('transform', `translate(0 ${lift + hop}) scale(${1 - (lift + hop) / 150})`);
  }

  // depth sorting: lower on screen = in front
  const sorted = [...chars].sort((a, b) => (a.dragging ? 1e5 : a.y) - (b.dragging ? 1e5 : b.y));
  sorted.forEach((c, i) => { if (layer.children[i] !== c.el) layer.insertBefore(c.el, layer.children[i]); });

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life += dt;
    if (p.life >= p.max) { p.el.remove(); particles.splice(i, 1); continue; }
    p.vy += 260 * dt;
    p.x += p.vx * dt; p.y += p.vy * dt;
    const k = 1 - p.life / p.max;
    p.el.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.life * 200}) scale(${(p.s * k).toFixed(2)})`);
  }

  updateHint(dt);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

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
const snd = document.getElementById('snd');
snd.addEventListener('change', () => audio.setEnabled(snd.checked));
document.getElementById('reset').addEventListener('click', () => {
  if (!confirm('Move everyone back out and start over?')) return;
  saved = { homes: {}, hinted: false };
  save();
  chars.forEach((c) => {
    if (c.kind !== 'princess') return;
    c.home = null;
    c.x = c.tx = rand(GROUND.x0, GROUND.x1);
    c.y = c.ty = rand(GROUND.y0, GROUND.y1);
  });
  panel.hidden = true;
});

// ---------- offline support ----------
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
