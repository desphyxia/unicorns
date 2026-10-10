// Treasure island (2 princesses + 2 unicorns): follow the footprints, tap the X to dig,
// and open the chest. Inside there is a brand-new piece of clothing!
import { RAINBOW, STAR, rand, clamp, mk, itemSVG, unicornOnlySVG, princessOnlySVG } from './tripkit.js';
import { princessSVG } from './art.js';

const SPOTS = [[640, 560], [990, 440], [1130, 660]];
const VIEWS = { dress: '-44 -102 88 104', shoes: '-34 -34 68 36', tiara: '-34 -128 68 46' };
const ISLAND = 'M300,500 C300,330 520,250 800,270 C1100,260 1340,360 1320,560 C1300,740 1040,820 780,810 C500,800 300,700 300,500Z';

const palm = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0,0 Q10,-60 -6,-120" stroke="#b9845a" stroke-width="14" fill="none" stroke-linecap="round"/>
  <g class="frond" transform="translate(-6 -120)">${[-70, -30, 10, 50, 90, 130].map((a) => `<ellipse cx="0" cy="-34" rx="14" ry="48" fill="#4fcf7a" transform="rotate(${a})"/>`).join('')}<circle r="9" fill="#8a5a3a"/><circle cx="-8" cy="8" r="7" fill="#8a5a3a"/></g></g>`;

export function start(host) {
  const { tsvg, fx, pairs, audio, locked } = host;
  const defs = mk('defs', {}, tsvg);
  defs.innerHTML = '<linearGradient id="tsea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fe0e8"/><stop offset="1" stop-color="#4fb8e8"/></linearGradient>';
  mk('rect', { width: 1600, height: 900, fill: 'url(#tsea)' }, tsvg);
  mk('g', { 'pointer-events': 'none' }, tsvg).innerHTML = Array.from({ length: 14 }, (_, i) => `<path class="wavy" style="animation-delay:${(i % 5) * 0.5}s" d="M${(i * 313) % 1500},${(i * 171) % 860 + 20} q20,-14 40,0 t40,0" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".5"/>`).join('');
  const island = mk('g', { 'pointer-events': 'none' }, tsvg);
  island.innerHTML = `<path d="${ISLAND}" fill="#fff" opacity=".85" transform="translate(800 540) scale(1.06) translate(-800 -540)"/><path d="${ISLAND}" fill="#ffe6a8"/>
    <path d="${ISLAND}" fill="#9fe6a6" transform="translate(800 540) scale(.8) translate(-800 -540)"/><path d="${ISLAND}" fill="#b8f0b0" transform="translate(800 520) scale(.55) translate(-800 -540)"/>
    ${palm(430, 470, 1.1)}${palm(1210, 410, 1)}${palm(1250, 720, 0.95)}${palm(420, 700, 1)}
    <ellipse cx="860" cy="690" rx="46" ry="26" fill="#cdbfa8"/><ellipse cx="880" cy="680" rx="30" ry="16" fill="#ddd0ba"/>`;
  const trailG = mk('g', { 'pointer-events': 'none' }, tsvg);
  const spotG = mk('g', {}, tsvg);
  const itemsG = mk('g', {}, tsvg);

  // two pairs of friends
  const crew = pairs.map((p, i) => {
    const g = mk('g', { 'pointer-events': 'none' }, tsvg);
    const u = mk('g', { transform: 'scale(0.62)' }, g); u.innerHTML = unicornOnlySVG(p);
    const pr = mk('g', { transform: 'translate(-70 6) scale(0.85)' }, g); pr.innerHTML = princessOnlySVG(p);
    return { g, x: 360 + i * 120, y: 620 + i * 36, tx: 360 + i * 120, ty: 620 + i * 36 };
  });

  // a crab to say hello to
  const crab = mk('g', { style: 'cursor:pointer' }, tsvg);
  crab.innerHTML = '<ellipse rx="28" ry="18" fill="#ff7a6b"/><circle cx="-10" cy="-18" r="6" fill="#fff"/><circle cx="12" cy="-18" r="6" fill="#fff"/><circle cx="-10" cy="-18" r="3" fill="#3b2a4a"/><circle cx="12" cy="-18" r="3" fill="#3b2a4a"/><path d="M-26,-4 q-24,-14 -14,-30 M26,-4 q24,-14 14,-30" stroke="#ff7a6b" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="-40" cy="-34" r="10" fill="#ff7a6b"/><circle cx="40" cy="-34" r="10" fill="#ff7a6b"/><circle r="50" fill="transparent"/>';
  const C = { x: 700, y: 760, dir: 1 };
  crab.addEventListener('pointerdown', (e) => { e.preventDefault(); fx.hearts(C.x, C.y - 30, 4); audio.chime(7); });

  const S = { n: 0, phase: 'walk', dig: 0, digT: 0, found: null, reveal: 0, pick: null, t: 0 };

  function showSpot() {
    spotG.innerHTML = '';
    trailG.innerHTML = '';
    const [x, y] = SPOTS[S.n];
    const from = S.n === 0 ? [crew[0].x, crew[0].y] : SPOTS[S.n - 1];
    const dist = Math.hypot(x - from[0], y - from[1]), steps = Math.floor(dist / 52);
    let prints = '';
    for (let i = 1; i < steps; i++) {
      const f = i / steps;
      prints += `<g transform="translate(${from[0] + (x - from[0]) * f + (i % 2 ? 9 : -9)} ${from[1] + (y - from[1]) * f}) rotate(${Math.atan2(y - from[1], x - from[0]) * 57.3 + 90})"><ellipse rx="9" ry="13" fill="#d6b87a"/><circle cx="-5" cy="-17" r="3" fill="#d6b87a"/><circle cx="5" cy="-17" r="3" fill="#d6b87a"/></g>`;
    }
    trailG.innerHTML = prints;
    const g = mk('g', { class: 'xspot', style: 'cursor:pointer' }, spotG);
    g.innerHTML = '<path d="M-34,-34 L34,34 M34,-34 L-34,34" stroke="#e0556f" stroke-width="16" stroke-linecap="round"/><circle r="80" fill="transparent"/>';
    g.setAttribute('transform', `translate(${x} ${y})`);
    S.xg = g;
    g.addEventListener('pointerdown', (e) => { e.preventDefault(); if (S.phase === 'walk') dig(); });
    crew.forEach((c, i) => { c.tx = x - 140 + i * 100; c.ty = y + 40 + i * 20; });
  }

  function dig() {
    S.phase = 'dig'; S.digT = 0;
    audio.pop();
  }

  function found() {
    const [x, y] = SPOTS[S.n];
    S.phase = 'found';
    spotG.innerHTML = `<ellipse cx="${x}" cy="${y}" rx="60" ry="30" fill="#b99a5e"/><ellipse cx="${x}" cy="${y - 4}" rx="48" ry="22" fill="#8a6a3a"/>`;
    const g = mk('g', { class: 'found', style: 'cursor:pointer' }, itemsG);
    const kind = ['shell', 'pouch', 'chest'][S.n];
    const art = {
      shell: '<path d="M0,26 Q-46,2 -30,-34 Q0,-52 30,-34 Q46,2 0,26Z" fill="#ffb3c7" stroke="#fff" stroke-width="3"/><path d="M0,26 L0,-40 M0,26 L-24,-34 M0,26 L24,-34" stroke="#fff" stroke-width="3" opacity=".7"/>',
      pouch: '<path d="M-30,24 Q-44,-14 -14,-24 L14,-24 Q44,-14 30,24Z" fill="#c98f5e" stroke="#a87444" stroke-width="3"/><path d="M-16,-24 Q0,-38 16,-24" stroke="#a87444" stroke-width="5" fill="none"/><circle cx="-8" cy="-34" r="9" fill="#ffd84d" stroke="#e8b923" stroke-width="2"/><circle cx="10" cy="-36" r="9" fill="#ffd84d" stroke="#e8b923" stroke-width="2"/>',
      chest: '<rect x="-56" y="-8" width="112" height="56" rx="8" fill="#c98f5e" stroke="#a87444" stroke-width="4"/><g class="lid"><path d="M-56,-8 Q-56,-52 0,-52 Q56,-52 56,-8Z" fill="#e0a874" stroke="#a87444" stroke-width="4"/></g><rect x="-8" y="-12" width="16" height="22" rx="3" fill="#ffd84d" stroke="#e8b923" stroke-width="2"/><path d="M-56,18 H56" stroke="#a87444" stroke-width="4"/>',
    }[kind];
    g.innerHTML = `<g class="inner">${art}</g><circle r="80" fill="transparent"/>`;
    g.setAttribute('transform', `translate(${x} ${y - 30})`);
    S.found = { g, kind, x, y: y - 30, opened: false };
    fx.burst(x, y - 30, 14);
    audio.chime(8);
    g.addEventListener('pointerdown', (e) => { e.preventDefault(); take(); });
  }

  function take() {
    const f = S.found;
    if (!f || f.opened || S.phase !== 'found') return;
    f.opened = true;
    if (f.kind !== 'chest') {
      fx.burst(f.x, f.y, 14, f.kind === 'pouch' ? ['#ffd84d', '#fff6a8'] : RAINBOW);
      audio.chime(6 + S.n);
      f.g.remove(); S.found = null;
      S.n++; S.phase = 'walk'; showSpot();
      return;
    }
    // the chest: open it and show what is inside
    S.phase = 'reveal'; S.reveal = 0;
    audio.moveIn();
    fx.burst(f.x, f.y, 30);
    const pick = locked && locked.length ? locked[Math.floor(Math.random() * locked.length)] : null;
    S.pick = pick;
    f.g.querySelector('.lid').setAttribute('transform', 'rotate(-70 -56 -8)');
    const pair = pairs[0];
    const ov = mk('g', { 'pointer-events': 'none' }, tsvg);
    const rays = Array.from({ length: 14 }, (_, i) => `<polygon points="0,0 -26,-380 26,-380" fill="#fff6a8" opacity=".55" transform="rotate(${i * (360 / 14)})"/>`).join('');
    const look = pick ? { ...pair.look, [pick.cat]: pick.idx } : null;
    ov.innerHTML = `<rect width="1600" height="900" fill="#3b2a6b" opacity=".45"/><g class="raysg" transform="translate(800 440)">${rays}</g>
      <circle cx="800" cy="440" r="230" fill="#fff" opacity=".92"/>
      ${pick ? `<svg x="620" y="270" width="360" height="340" viewBox="${VIEWS[pick.cat]}">${princessSVG(pair.princess, look)}</svg>` : `<g transform="translate(800 440) scale(6)">${itemSVG('gem', '#a98bff')}</g>`}
      <path transform="translate(1000 250) scale(5)" d="${STAR}" fill="#ffd84d" stroke="#fff" stroke-width=".8"/><path transform="translate(610 270) scale(3.4)" d="${STAR}" fill="#ff8fc7" stroke="#fff" stroke-width=".8"/>`;
    S.ov = ov;
    tsvg.appendChild(fx.g);
  }

  showSpot();

  return {
    update(dt, t) {
      S.t += dt;
      crew.forEach((c, i) => {
        const dx = c.tx - c.x, dy = c.ty - c.y, d = Math.hypot(dx, dy);
        if (d > 3) { const st = Math.min(d, 170 * dt); c.x += dx / d * st; c.y += dy / d * st; }
        const walk = d > 3 ? Math.abs(Math.sin(t * 9 + i)) * 5 : Math.sin(t * 2 + i) * 1.5;
        c.g.setAttribute('transform', `translate(${c.x.toFixed(1)} ${(c.y - walk).toFixed(1)})`);
      });
      if (S.xg) S.xg.setAttribute('transform', `translate(${SPOTS[S.n][0]} ${SPOTS[S.n][1]}) scale(${(1 + Math.sin(t * 6) * 0.14).toFixed(2)})`);
      if (S.phase === 'dig') {
        S.digT += dt;
        const [x, y] = SPOTS[S.n];
        if (S.digT % 0.12 < dt) fx.drops(x, y, 5, '#e6c887', 1.2);
        if (S.xg) S.xg.style.display = 'none';
        if (S.digT > 1.4) { S.xg = null; found(); }
      }
      if (S.found && !S.found.opened) S.found.g.firstChild.setAttribute('transform', `translate(0 ${(Math.sin(t * 4) * 6).toFixed(1)}) scale(${(1 + Math.sin(t * 5) * 0.05).toFixed(2)})`);
      if (S.phase === 'reveal') {
        S.reveal += dt;
        const rg = S.ov && S.ov.querySelector('.raysg');
        if (rg) rg.setAttribute('transform', `translate(800 440) rotate(${(S.reveal * 20).toFixed(1)})`);
        if (S.reveal > 4.5) {
          S.phase = 'done';
          S.ov.remove();
          setTimeout(() => host.photo(), 600);
          host.finish({ coins: S.pick ? 4 : 7, unlock: S.pick });
        }
      }
      // the crab strolls along the beach
      C.x += C.dir * 40 * dt;
      if (C.x > 900) C.dir = -1; if (C.x < 560) C.dir = 1;
      crab.setAttribute('transform', `translate(${C.x.toFixed(1)} ${(C.y + Math.sin(t * 8) * 2).toFixed(1)})`);
    },
    result: () => ({ coins: 0 }),
    destroy() {},
  };
}
