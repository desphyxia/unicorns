// Rainbow bridge (everyone!): the bridge has lost its colours. Drag each band to its place,
// then the whole herd gallops across in a parade and the gold coins rain down.
import { RAINBOW, rand, clamp, mk, cloud, heroSVG } from './tripkit.js';

const CX = 800, CY = 560, R0 = 500, STEP = 34, BAND = 28, K = 0.84; // K flattens the arch so the parade fits on screen
const arcD = (R) => `M${CX - R},${CY} A${R},${R * K} 0 0 1 ${CX + R},${CY}`;
const OFFS = [[-300, 250], [330, 190], [-140, 340], [170, 300], [-420, 140], [420, 320]];

export function start(host) {
  const { tsvg, fx, pairs, audio } = host;
  const defs = mk('defs', {}, tsvg);
  defs.innerHTML = '<linearGradient id="bsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9d4ff"/><stop offset="1" stop-color="#ffe3f1"/></linearGradient>';
  mk('rect', { width: 1600, height: 900, fill: 'url(#bsky)' }, tsvg);
  mk('g', { 'pointer-events': 'none' }, tsvg).innerHTML = `<circle cx="1380" cy="120" r="62" fill="#fff3a0"/><circle cx="1380" cy="120" r="86" fill="#fff3a0" opacity=".35"/>${cloud(240, 140, 1.4)}${cloud(900, 90, 1.1)}${cloud(560, 300, 1)}`;
  // sea of clouds under the gap, then the two cliffs
  mk('g', { 'pointer-events': 'none' }, tsvg).innerHTML = [[200, 820], [420, 850], [640, 810], [860, 850], [1080, 815], [1300, 850], [1500, 820]].map(([x, y]) => cloud(x, y, 2.4, 0.95)).join('');
  const cliff = (flip) => `<g transform="${flip ? 'translate(1600 0) scale(-1 1)' : ''}"><path d="M0,566 H300 Q336,576 322,612 L346,900 H0Z" fill="#d9c9b0"/><path d="M0,566 H300 Q336,576 322,612 L346,900 H0Z" fill="none" stroke="#fff" stroke-width="5"/><path d="M-10,546 H306 Q326,550 318,574 H-10Z" fill="#8fe39c"/><path d="M60,640 q40,10 70,0 M120,720 q40,10 80,0" stroke="#c4b296" stroke-width="6" fill="none" stroke-linecap="round"/></g>`;
  mk('g', {}, tsvg).innerHTML = cliff(false) + cliff(true);

  // faint colour hints where each band belongs
  const slotsG = mk('g', { 'pointer-events': 'none' }, tsvg);
  slotsG.innerHTML = RAINBOW.map((c, i) => `<path d="${arcD(R0 - i * STEP)}" stroke="${c}" stroke-width="${BAND}" stroke-dasharray="18 14" fill="none" opacity=".5"/>`).join('');
  const pot = mk('g', { style: 'display:none', 'pointer-events': 'none' }, tsvg);
  pot.innerHTML = `<g transform="translate(1470 548)"><path d="M-44,0 Q-52,-52 0,-56 Q52,-52 44,0Z" fill="#3b2a4a"/><ellipse cy="-56" rx="46" ry="11" fill="#5c4a73"/>${[-26, -8, 12, 30, 0, -16, 20].map((x, i) => `<circle cx="${x}" cy="${-66 - (i % 3) * 6}" r="11" fill="#ffd84d" stroke="#e8b923" stroke-width="2.5"/>`).join('')}</g>`;

  const piecesG = mk('g', {}, tsvg);
  const pieces = RAINBOW.map((c, i) => {
    const g = mk('g', { class: 'plank', style: 'cursor:grab' }, piecesG);
    const R = R0 - i * STEP;
    g.innerHTML = `<path d="${arcD(R)}" stroke="${c}" stroke-width="${BAND}" fill="none" stroke-linecap="round"/><path d="${arcD(R)}" stroke="#fff" stroke-width="5" fill="none" opacity=".4" transform="translate(0 -7)"/><path d="${arcD(R)}" stroke="transparent" stroke-width="80" fill="none"/>`;
    const o = OFFS[(i * 5) % 6];
    const p = { i, c, g, ox: o[0], oy: o[1], locked: false, snap: -1, ph: rand(0, 6) };
    g.addEventListener('pointerdown', (e) => { e.preventDefault(); if (p.locked || S.drag) return; const q = host.toLocal(e); S.drag = { p, sx: q.x - p.ox, sy: q.y - p.oy }; audio.pop(); });
    return p;
  });

  const potCoins = mk('g', {}, tsvg);
  const heroes = pairs.map((p, i) => {
    const g = mk('g', { 'pointer-events': 'none' }, tsvg);
    mk('g', { transform: 'scale(0.62)' }, g).innerHTML = heroSVG(p);
    return { g, i };
  });

  const S = { drag: null, locked: 0, phase: 'puzzle', t: 0, parade: 0, coins: [], got: 0, photo: false, endT: 0 };

  host.listen(window, 'pointermove', (e) => { if (!S.drag) return; const q = host.toLocal(e); S.drag.p.ox = q.x - S.drag.sx; S.drag.p.oy = q.y - S.drag.sy; });
  const drop = () => {
    const d = S.drag; S.drag = null;
    if (!d) return;
    const p = d.p;
    if (Math.hypot(p.ox, p.oy) < 150) {
      p.locked = true; p.snap = 0;
      audio.chime(3 + p.i);
      fx.burst(CX + (p.i % 2 ? 200 : -200), CY - (R0 - p.i * STEP) * K * 0.6, 8, [p.c, '#fff']);
      if (++S.locked >= RAINBOW.length) setTimeout(beginParade, 1100);
    }
  };
  host.listen(window, 'pointerup', drop);
  host.listen(window, 'pointercancel', drop);

  function beginParade() {
    S.phase = 'parade'; S.t = 0;
    slotsG.style.display = 'none';
    audio.moveIn();
    fx.confetti(800, 380, 40);
  }

  function spawnCoin() {
    const g = mk('g', { class: 'coin', style: 'cursor:pointer' }, potCoins);
    g.innerHTML = '<circle r="22" fill="#ffd84d" stroke="#e8b923" stroke-width="4"/><circle r="13" fill="none" stroke="#e8b923" stroke-width="3"/><path d="M-5,-6 L5,-6 M0,-6 V8" stroke="#e8b923" stroke-width="3"/><circle r="46" fill="transparent"/>';
    const c = { el: g, x: rand(560, 1500), y: -30, vy: rand(130, 200), ph: rand(0, 6) };
    g.addEventListener('pointerdown', (e) => { e.preventDefault(); pick(c); });
    S.coins.push(c);
  }
  function pick(c) {
    const i = S.coins.indexOf(c);
    if (i < 0) return;
    S.coins.splice(i, 1); c.el.remove();
    S.got++;
    audio.chime(4 + S.got % 7);
    fx.burst(c.x, c.y, 6, ['#ffd84d', '#fff', '#fff6a8']);
  }

  const place = (g, x, y, rot) => g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)})`);

  return {
    update(dt, t) {
      S.t += dt;
      pieces.forEach((p) => {
        if (p.locked) { p.ox *= 1 - Math.min(1, dt * 12); p.oy *= 1 - Math.min(1, dt * 12); }
        const bob = p.locked || S.drag?.p === p ? 0 : Math.sin(t * 2 + p.ph) * 8;
        p.g.setAttribute('transform', `translate(${p.ox.toFixed(1)} ${(p.oy + bob).toFixed(1)})`);
      });
      if (S.phase === 'puzzle') {
        // friends wait on the left cliff
        heroes.forEach((h, i) => place(h.g, 60 + i * 44, 556 + Math.sin(t * 3 + i) * 3, 0));
      } else {
        const done = S.t > 6 * 1.1 + 7.5;
        heroes.forEach((h, i) => {
          const s = clamp((S.t - 0.4 - i * 1.1) / 7, 0, 1);
          if (s <= 0) { place(h.g, 60 + i * 44, 556 + Math.sin(t * 3 + i) * 3, 0); return; }
          const th = s * Math.PI, Rr = R0 + 16;
          const gal = s < 1 ? Math.abs(Math.sin(t * 10 + i)) * 7 : 0;
          if (s < 1 && S.t % 0.1 < dt) fx.trail(CX - Math.cos(th) * Rr - 55, CY - Math.sin(th) * Rr * K - 40, RAINBOW[(i + Math.floor(S.t * 10)) % 6], 120);
          const rx = s >= 1 ? 1500 - (i % 3) * 60 : CX - Math.cos(th) * Rr;
          const ry = s >= 1 ? 548 : CY - Math.sin(th) * Rr * K;
          place(h.g, rx, ry - gal, s >= 1 ? 0 : (th - Math.PI / 2) * 57.3 * 0.3);
        });
        const first = clamp((S.t - 0.4) / 7, 0, 1);
        if (first > 0.85) pot.style.display = '';
        if (!S.photo && clamp((S.t - 0.4 - 2 * 1.1) / 7, 0, 1) > 0.5) { S.photo = true; host.photo(); }
        if (first > 0.9 && !done && Math.random() < dt * 2.2) spawnCoin();
        if (done && S.phase === 'parade') {
          S.phase = 'done';
          host.finish({ coins: 5 + S.got });
        }
      }
      // gold rains down; extras you catch are bonus coins
      for (let i = S.coins.length - 1; i >= 0; i--) {
        const c = S.coins[i];
        c.y += c.vy * dt;
        if (c.y > 930) { c.el.remove(); S.coins.splice(i, 1); continue; }
        c.el.setAttribute('transform', `translate(${c.x.toFixed(1)} ${c.y.toFixed(1)}) scale(${Math.cos(t * 4 + c.ph).toFixed(2)} 1)`);
      }
    },
    result: () => ({ coins: 0 }),
    destroy() {},
  };
}
