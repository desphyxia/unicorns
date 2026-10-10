// Birthday parties: cake, candles to blow out, balloons to pop, confetti and a song.
import { RAINBOW } from './cast.js';
import { GROUND } from './art.js';

const CAKE_X = 800;
let P = null;            // the running party
const balloons = [];     // balloons keep floating away after a party ends
let ctx = null;
let balloonsG = null;
let cakeG = null;
let banner = null;
let spawnT = 0;
let confettiT = 0;

export const isActive = () => !!P;

export function initParty(c) {
  ctx = c;
  balloonsG = ctx.el('g', {}, ctx.tools);
  cakeG = ctx.svg.querySelector('#cake');
  banner = document.getElementById('banner');
}

const cake = () => `<g transform="translate(${CAKE_X} 884)">
  <ellipse cy="0" rx="120" ry="14" fill="#fff" opacity=".6"/>
  <rect x="-100" y="-56" width="200" height="56" rx="14" fill="#ffc2e2"/>
  <rect x="-72" y="-104" width="144" height="50" rx="14" fill="#fff"/>
  <rect x="-44" y="-146" width="88" height="44" rx="14" fill="#d3bdff"/>
  <path d="M-100,-52 q12,16 25,0 t25,0 t25,0 t25,0 t25,0 t25,0 t25,0 t25,0" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round"/>
  <path d="M-72,-100 q12,14 24,0 t24,0 t24,0 t24,0 t24,0 t24,0" stroke="#ffc2e2" stroke-width="8" fill="none" stroke-linecap="round"/>
  ${[[-70, -30], [-30, -22], [20, -34], [64, -26], [-50, -78], [10, -80], [48, -76], [-20, -122], [22, -118]].map(([x, y], i) => `<rect x="${x}" y="${y}" width="9" height="4" rx="2" fill="${RAINBOW[i % 6]}" transform="rotate(${i * 35} ${x} ${y})"/>`).join('')}
  ${[-30, -15, 0, 15, 30].map((x, i) => `<g class="candle" data-i="${i}"><rect x="${x - 3.5}" y="-176" width="7" height="30" rx="3" fill="${RAINBOW[i]}"/><rect x="${x - 3.5}" y="-170" width="7" height="5" fill="#fff" opacity=".6"/>
    <g class="flame" transform="translate(${x} -182)"><ellipse rx="6" ry="10" fill="#ffb02e"/><ellipse cy="2" rx="3" ry="6" fill="#fff3a0"/></g>
    <circle cx="${x}" cy="-184" r="22" fill="transparent"/></g>`).join('')}
</g>`;

function candleOut(i) {
  if (!P || P.out[i]) return;
  P.out[i] = true;
  const el = cakeG.querySelector(`.candle[data-i="${i}"] .flame`);
  if (el) el.style.display = 'none';
  const x = CAKE_X + (i - 2) * 15;
  ctx.puff(x, 884 - 184);
  ctx.audio.chime(3 + i * 2);
  if (P.out.every(Boolean)) celebrate();
}

function celebrate() {
  P.state = 'party';
  P.endT = 11;
  ctx.audio.moveIn();
  setTimeout(() => ctx.audio.chime(10), 450);
  ctx.confetti(CAKE_X, 700, 60);
  P.who.hopT = 0;
  ctx.chars.forEach((c) => { c.hopT = 0; });
}

export function start(who) {
  if (P || ctx.getMode() !== 'castle') return false;
  ctx.chars.forEach((u) => { if (u.rider) ctx.dismount(u); });
  if (!who) { const ps = ctx.chars.filter((c) => c.kind === 'princess'); who = ps[Math.floor(Math.random() * ps.length)]; }
  P = { who, out: [false, false, false, false, false], state: 'candles', endT: 0 };
  cakeG.innerHTML = cake();
  cakeG.style.display = '';
  cakeG.querySelectorAll('.candle').forEach((c) => c.addEventListener('pointerdown', (e) => { e.preventDefault(); candleOut(+c.dataset.i); }));
  who.hatG.style.display = '';
  banner.textContent = `Happy Birthday, ${ctx.nameOf(who.def)}!`;
  banner.hidden = false;
  // everyone comes to the party
  ctx.chars.forEach((c) => {
    if (c.mount) return;
    const b = boundsFor(c);
    if (c.home !== null || c.y < GROUND.y0 - 5) { c.x = ctx.rand(b.x0, b.x1); c.y = ctx.rand(b.y0, b.y1); ctx.sparkle(c.x, c.y - 60, 6); }
    c.tx = c.x; c.ty = c.y; c.wait = ctx.rand(0, 1.5);
  });
  ctx.audio.birthday();
  ctx.confetti(CAKE_X, 600, 30);
  spawnT = 0;
  return true;
}

export function stop(instant = false) {
  if (instant) { balloons.splice(0).forEach((b) => b.el.remove()); }
  if (!P) return;
  const who = P.who;
  P = null;
  who.hatG.style.display = 'none';
  cakeG.style.display = 'none';
  cakeG.innerHTML = '';
  banner.hidden = true;
  if (instant) { balloons.splice(0).forEach((b) => b.el.remove()); return; }
  // guests who live in a room go back to it
  ctx.chars.forEach((c) => {
    if (c.mount || c.kind !== 'princess' || c.home === null) return;
    const b = ctx.boundsOf(c);
    c.x = c.tx = ctx.rand(b.x0, b.x1);
    c.y = c.ty = ctx.rand(b.y0, b.y1);
    ctx.sparkle(c.x, c.y - 60, 6);
  });
}

export function boundsFor(c) {
  const left = c.index % 2 === 0;
  return left ? { x0: 270, x1: 690, y0: GROUND.y0, y1: GROUND.y1 } : { x0: 910, x1: 1340, y0: GROUND.y0, y1: GROUND.y1 };
}

function spawnBalloon() {
  const color = RAINBOW[Math.floor(Math.random() * 6)];
  const g = ctx.el('g', { style: 'cursor:pointer' }, balloonsG);
  g.innerHTML = `<path d="M0,36 q-10,24 4,46 t-4,50" stroke="#fff" stroke-width="2.5" fill="none" opacity=".9"/>
    <ellipse rx="28" ry="34" fill="${color}"/><ellipse cx="-9" cy="-12" rx="6" ry="10" fill="#fff" opacity=".4" transform="rotate(20 -9 -12)"/>
    <path d="M-5,36 L5,36 L0,44Z" fill="${color}"/><circle r="40" cy="4" fill="transparent"/>`;
  const b = { el: g, color, x: ctx.rand(70, 1530), y: 980, vy: -ctx.rand(70, 120), ph: ctx.rand(0, 6) };
  g.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    const i = balloons.indexOf(b);
    if (i < 0) return;
    balloons.splice(i, 1);
    g.remove();
    ctx.confetti(b.x, b.y, 12, [b.color, '#fff', '#ffd84d']);
    ctx.audio.pop();
  });
  balloons.push(b);
}

export function update(dt, t) {
  if (P) {
    spawnT -= dt;
    if (spawnT <= 0 && balloons.length < 9) { spawnBalloon(); spawnT = ctx.rand(0.7, 1.4); }
    if (P.state === 'party') {
      P.endT -= dt;
      confettiT -= dt;
      if (confettiT <= 0) { confettiT = 0.12; ctx.confetti(ctx.rand(0, 1600), -10, 2, undefined, true); }
      if (P.endT <= 0) stop();
    }
  }
  for (let i = balloons.length - 1; i >= 0; i--) {
    const b = balloons[i];
    b.y += b.vy * dt;
    if (b.y < -120) { b.el.remove(); balloons.splice(i, 1); continue; }
    b.el.setAttribute('transform', `translate(${(b.x + Math.sin(t * 1.5 + b.ph) * 16).toFixed(1)} ${b.y.toFixed(1)})`);
  }
}
