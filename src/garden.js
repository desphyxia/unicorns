// Flower garden (2 princesses + 2 unicorns): plant seeds, drag the rain cloud to water them,
// watch the flowers bloom, say hello to the butterflies, and get flower crowns.
import { RAINBOW, TILE, GROUND_Y, rand, clamp, mk, scatter, tree, bush, cloud, itemSVG, unicornOnlySVG, princessOnlySVG } from './tripkit.js';
import { tiaraSVG } from './art.js';

const PATCHES = [[400, 600], [800, 580], [1200, 600], [300, 760], [800, 770], [1300, 760]];

const flowerHead = (c, r = 26) => `${[0, 60, 120, 180, 240, 300].map((a) => `<circle cx="${(Math.cos(a * Math.PI / 180) * r * 0.9).toFixed(1)}" cy="${(Math.sin(a * Math.PI / 180) * r * 0.9).toFixed(1)}" r="${r * 0.62}" fill="${c}"/>`).join('')}<circle r="${r * 0.55}" fill="#fff6a8"/><circle r="${r * 0.22}" fill="#ff9a5c"/>`;

export function start(host) {
  const { tsvg, fx, pairs, audio } = host;
  const defs = mk('defs', {}, tsvg);
  defs.innerHTML = `<linearGradient id="gsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe3ff"/><stop offset="1" stop-color="#fff6dc"/></linearGradient>
    <linearGradient id="gground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fe6a6"/><stop offset="1" stop-color="#6fd08c"/></linearGradient>`;
  mk('rect', { width: 1600, height: 900, fill: 'url(#gsky)' }, tsvg);
  mk('g', {}, tsvg).innerHTML = `<circle cx="1380" cy="130" r="64" fill="#fff3a0"/><circle cx="1380" cy="130" r="88" fill="#fff3a0" opacity=".35"/>
    <ellipse cx="260" cy="520" rx="480" ry="130" fill="#b8efc0"/><ellipse cx="1300" cy="530" rx="520" ry="140" fill="#aee9b8"/>
    ${scatter(77, 150, (x, r) => (r() < 0.5 ? tree(x, ['#ff9ac8', '#9be5a3', '#c3a8ff', '#ffd48a'][Math.floor(r() * 4)]) : bush(x, '#7fdc92'))).replace(new RegExp(String(GROUND_Y), 'g'), '540')}`;
  mk('rect', { y: 520, width: 1600, height: 380, fill: 'url(#gground)' }, tsvg);
  // picket fence
  mk('g', {}, tsvg).innerHTML = Array.from({ length: 27 }, (_, i) => `<rect x="${i * 62 + 8}" y="500" width="30" height="72" rx="8" fill="#fff"/>`).join('') + '<rect y="520" width="1600" height="12" fill="#fff"/><rect y="552" width="1600" height="10" fill="#fff"/>';

  const patchG = mk('g', {}, tsvg);
  const plants = PATCHES.map(([x, y], i) => {
    const g = mk('g', { class: 'patch', style: 'cursor:pointer' }, patchG);
    g.innerHTML = `<ellipse cx="${x}" cy="${y + 8}" rx="104" ry="38" fill="#a07448"/><ellipse cx="${x}" cy="${y}" rx="98" ry="34" fill="#b68a5e"/><ellipse cx="${x - 24}" cy="${y - 8}" rx="48" ry="9" fill="#c9a074" opacity=".7"/>
      <ellipse class="ring" cx="${x}" cy="${y}" rx="98" ry="34" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="14 10"/>`;
    const plant = mk('g', {}, patchG);
    const p = { i, x, y, g, plant, planted: false, w: 0, bloomed: false, ring: g.querySelector('.ring') };
    g.addEventListener('pointerdown', (e) => { e.preventDefault(); plantSeed(p); });
    return p;
  });

  const cloudG = mk('g', { class: 'raincloud', style: 'cursor:grab' }, tsvg);
  cloudG.innerHTML = `<g transform="scale(1.8)">${cloud(0, 0, 1, 1)}</g><circle r="150" fill="transparent"/>`;
  const C = { x: 260, y: 170, dragging: false, rainT: 0 };
  const rainG = mk('g', { 'pointer-events': 'none' }, tsvg);
  const rain = [];

  // friends watching from the sides
  const side = pairs.map((p, i) => {
    const left = i === 0;
    const u = mk('g', { 'pointer-events': 'none' }, tsvg);
    mk('g', { transform: `scale(${left ? 0.95 : -0.95} 0.95)` }, u).innerHTML = unicornOnlySVG(p);
    u.setAttribute('transform', `translate(${left ? 110 : 1490} 868)`);
    const pr = mk('g', { 'pointer-events': 'none' }, tsvg);
    const inner = mk('g', { transform: 'scale(1.3)' }, pr);
    inner.innerHTML = princessOnlySVG(p);
    pr.setAttribute('transform', `translate(${left ? 250 : 1350} 880)`);
    const crown = mk('g', { style: 'display:none' }, inner);
    crown.innerHTML = tiaraSVG(2, RAINBOW[left ? 0 : 4]);
    return { u, pr, inner, crown, left };
  });

  const S = { phase: 'plant', planted: 0, bloomed: 0, flies: [], flyTaps: 0, t: 0, crownT: -1, hint: 0 };

  function plantSeed(p) {
    if (p.planted || S.phase !== 'plant') return;
    p.planted = true;
    p.ring.style.display = 'none';
    p.g.style.cursor = 'default';
    p.plant.innerHTML = `<ellipse cx="${p.x}" cy="${p.y - 4}" rx="14" ry="9" fill="#6b4328"/>`;
    audio.pop();
    audio.chime(3 + S.planted);
    fx.burst(p.x, p.y - 10, 5, ['#b68a5e', '#8a5a3a', '#fff']);
    if (++S.planted >= PATCHES.length) { S.phase = 'water'; audio.chime(9); fx.burst(C.x, C.y, 12); }
  }

  host.listen(cloudG, 'pointerdown', (e) => { e.preventDefault(); C.dragging = true; audio.pop(); });
  host.listen(window, 'pointermove', (e) => { if (!C.dragging) return; const q = host.toLocal(e); C.x = clamp(q.x, 100, 1500); C.y = clamp(q.y, 110, 330); });
  const up = () => { C.dragging = false; };
  host.listen(window, 'pointerup', up);
  host.listen(window, 'pointercancel', up);

  function bloom(p) {
    p.bloomed = true;
    audio.chime(4 + S.bloomed * 2 % 8);
    fx.burst(p.x, p.y - 110, 12, [RAINBOW[p.i], '#fff', '#fff6a8']);
    if (++S.bloomed >= PATCHES.length) setTimeout(beginFriends, 900);
  }

  function beginFriends() {
    S.phase = 'friends';
    audio.chime(10);
    for (let i = 0; i < 5; i++) {
      const g = mk('g', { class: 'butterfly', style: 'cursor:pointer' }, tsvg);
      const c = RAINBOW[(i * 5) % 6];
      g.innerHTML = `<g transform="scale(1.7)">${itemSVG('butterfly', c)}</g><circle r="64" fill="transparent"/>`;
      const b = { el: g, x: rand(300, 1300), y: rand(280, 600), ph: rand(0, 6), tx: rand(300, 1300), ty: rand(280, 600), gone: false, away: false };
      g.addEventListener('pointerdown', (e) => { e.preventDefault(); greet(b); });
      S.flies.push(b);
    }
    tsvg.appendChild(cloudG); tsvg.appendChild(fx.g);
  }

  function greet(b) {
    if (b.away) return;
    b.away = true;
    b.el.classList.add('away');
    fx.hearts(b.x, b.y, 5);
    audio.chime(5 + S.flyTaps * 2 % 8);
    if (++S.flyTaps >= S.flies.length) setTimeout(beginCrowns, 1200);
  }

  function beginCrowns() {
    S.phase = 'crowns';
    S.crownT = 0;
    audio.moveIn();
    side.forEach((s) => { s.crown.style.display = ''; fx.burst(s.left ? 250 : 1350, 700, 18); });
    setTimeout(() => host.photo(), 900);
    host.finish({ coins: 2, crowns: true });
  }

  return {
    update(dt, t) {
      S.t += dt;
      // cloud
      const bob = C.dragging ? 0 : Math.sin(t * 1.5) * 8;
      cloudG.setAttribute('transform', `translate(${C.x.toFixed(1)} ${(C.y + bob).toFixed(1)})`);
      const raining = (S.phase === 'water' || S.phase === 'plant') && C.dragging;
      if (raining) {
        C.rainT -= dt;
        if (C.rainT <= 0) {
          C.rainT = 0.04;
          const d = mk('ellipse', { rx: 3.5, ry: 8, fill: '#7fd0ff' }, rainG);
          rain.push({ el: d, x: C.x + rand(-95, 95), y: C.y + 60, vy: rand(520, 700) });
        }
        if (S.phase === 'water' && Math.random() < dt * 4) audio.bubble();
      }
      for (let i = rain.length - 1; i >= 0; i--) {
        const d = rain[i];
        d.y += d.vy * dt;
        if (d.y > 880) { d.el.remove(); rain.splice(i, 1); continue; }
        d.el.setAttribute('cx', d.x.toFixed(1)); d.el.setAttribute('cy', d.y.toFixed(1));
      }
      // pulses for what to do next
      plants.forEach((p) => { if (!p.planted) p.ring.setAttribute('opacity', (0.5 + 0.5 * Math.sin(t * 4 + p.i)).toFixed(2)); });
      cloudG.firstChild.setAttribute('transform', `scale(${(1.8 + (S.phase === 'water' && !C.dragging ? Math.sin(t * 5) * 0.08 : 0)).toFixed(2)})`);
      // watering and growing
      plants.forEach((p) => {
        if (!p.planted) return;
        if (S.phase === 'water' && !p.bloomed && raining && Math.abs(C.x - p.x) < 110) {
          p.w = Math.min(1, p.w + dt * 0.5);
          if (p.w >= 1) bloom(p);
        }
        const h = p.bloomed ? 110 : 8 + p.w * 90;
        const sway = Math.sin(t * 2 + p.i) * (p.bloomed ? 5 : 2);
        const c = RAINBOW[p.i];
        p.plant.innerHTML = `<ellipse cx="${p.x}" cy="${p.y - 4}" rx="14" ry="9" fill="#6b4328"/>
          <path d="M${p.x},${p.y - 6} Q${p.x + sway},${p.y - h / 2} ${p.x + sway * 1.6},${p.y - h}" stroke="#4fb86a" stroke-width="7" fill="none" stroke-linecap="round"/>
          ${p.w > 0.15 ? `<ellipse cx="${p.x - 16}" cy="${p.y - h * 0.4}" rx="16" ry="8" fill="#6edc8c" transform="rotate(-25 ${p.x - 16} ${p.y - h * 0.4})"/><ellipse cx="${p.x + 18}" cy="${p.y - h * 0.55}" rx="16" ry="8" fill="#6edc8c" transform="rotate(25 ${p.x + 18} ${p.y - h * 0.55})"/>` : ''}
          ${p.bloomed ? `<g transform="translate(${p.x + sway * 1.6} ${p.y - h}) scale(${(1 + Math.sin(t * 3 + p.i) * 0.05).toFixed(2)})">${flowerHead(c)}</g>` : (p.w > 0.5 ? `<circle cx="${p.x + sway * 1.6}" cy="${p.y - h}" r="${6 + p.w * 6}" fill="${c}" opacity=".8"/>` : '')}`;
      });
      // butterflies
      S.flies.forEach((b, i) => {
        if (b.away) { b.y -= 260 * dt; b.x += Math.sin(t * 3 + i) * 80 * dt; if (b.y < -80 && !b.gone) { b.gone = true; b.el.remove(); } }
        else {
          if (Math.hypot(b.tx - b.x, b.ty - b.y) < 20) { b.tx = rand(250, 1350); b.ty = rand(260, 620); }
          b.x += (b.tx - b.x) * dt * 0.7; b.y += (b.ty - b.y) * dt * 0.7;
        }
        if (!b.gone) b.el.setAttribute('transform', `translate(${b.x.toFixed(1)} ${(b.y + Math.sin(t * 3 + b.ph) * 12).toFixed(1)})`);
      });
      side.forEach((s, i) => { const b = Math.sin(t * 2 + i * 2) * 1.5; s.inner.setAttribute('transform', `scale(1.3) translate(0 ${-b})`); });
    },
    result: () => ({ coins: 0 }),
    destroy() {},
  };
}
