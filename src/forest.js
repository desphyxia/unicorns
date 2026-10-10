// Forest picnic (3 princesses + 3 unicorns): ride in, pick food from the trees,
// set the picnic blanket, then feed the little forest animals.
import { RAINBOW, TILE, GROUND_Y, rand, clamp, mk, scatter, lollyTree, mushroom, candyCane, PASTELS, itemSVG, heroSVG, unicornOnlySVG, princessOnlySVG, ANIMALS } from './tripkit.js';
import { foodSVG } from './stableart.js';

const BASKET = { x: 800, y: 842 };
const SPOTS = [[-190, -18], [0, -18], [190, -18], [-120, 32], [0, 32], [120, 32]];
const FOODS = ['apple', 'cupcake', 'lolly', 'berries'];

function foodArt(type) {
  if (type === 'lolly') return itemSVG('lolly', '#ff8fc7');
  if (type === 'berries') return '<circle cx="-9" cy="4" r="9" fill="#7a5cff"/><circle cx="9" cy="4" r="9" fill="#9a7cff"/><circle cx="0" cy="-8" r="9" fill="#6a4cef"/><circle cx="-12" cy="1" r="2.5" fill="#fff" opacity=".6"/>';
  return foodSVG(type);
}

export function start(host) {
  const { tsvg, fx, pairs, audio } = host;
  const defs = mk('defs', {}, tsvg);
  defs.innerHTML = `<linearGradient id="fosky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9f0ff"/><stop offset="1" stop-color="#f6e6ff"/></linearGradient>
    <linearGradient id="foground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a5e8a0"/><stop offset="1" stop-color="#7fd48c"/></linearGradient>`;
  mk('rect', { width: 1600, height: 900, fill: 'url(#fosky)' }, tsvg);
  mk('g', { opacity: '.35' }, tsvg).innerHTML = [200, 520, 900, 1250].map((x) => `<polygon points="${x},0 ${x + 90},0 ${x + 330},760 ${x + 120},760" fill="#fff"/>`).join('');
  const tile = (html, f) => { const g = mk('g', {}, tsvg); g.innerHTML = `<g>${html}</g><g transform="translate(${TILE} 0)">${html}</g>`; return { g, f }; };
  const layers = [
    tile(`<g opacity=".55">${scatter(31, 260, (x, r) => lollyTree(x, PASTELS[Math.floor(r() * 6)], 1.6 + r() * 0.6))}</g>`, 0.12),
    tile(scatter(32, 120, (x, r) => { const k = r(); return k < 0.4 ? lollyTree(x, PASTELS[Math.floor(r() * 6)], 0.9 + r() * 0.4) : k < 0.75 ? mushroom(x, 0.8 + r() * 0.5) : candyCane(x); }), 0.4)];
  mk('g', {}, tsvg).innerHTML = `<rect y="${GROUND_Y - 4}" width="1600" height="170" fill="url(#foground)"/><rect y="${GROUND_Y - 6}" width="1600" height="6" fill="#fff" opacity=".5"/>`;
  layers.push(tile(scatter(51, 70, (x, r) => `<path d="M${x},${GROUND_Y + 40 + r() * 100} q6,-18 12,0 M${x + 14},${GROUND_Y + 50 + r() * 90} q6,-18 12,0" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".5"/>`), 1));

  // big trees to pick from (appear when we arrive)
  const trees = mk('g', { style: 'display:none' }, tsvg);
  const bigTree = (x) => `<g transform="translate(${x} ${GROUND_Y + 30})"><rect x="-30" y="-330" width="60" height="340" rx="22" fill="#c98f5e"/><rect x="-8" y="-300" width="10" height="260" rx="5" fill="#b57a4c" opacity=".5"/>
    <circle cx="-110" cy="-410" r="130" fill="#7fdc92"/><circle cx="110" cy="-420" r="130" fill="#8fe39c"/><circle cx="0" cy="-500" r="140" fill="#9be5a3"/><circle cx="-60" cy="-470" r="40" fill="#fff" opacity=".18"/></g>`;
  trees.innerHTML = bigTree(300) + bigTree(1300);
  const foodsG = mk('g', {}, tsvg);

  // basket and the 9 slots at the top
  const basket = mk('g', { style: 'display:none' }, tsvg);
  basket.innerHTML = `<g transform="translate(${BASKET.x} ${BASKET.y})"><path d="M-70,0 L-56,-60 H56 L70,0Z" fill="#e0a874" stroke="#c78a55" stroke-width="4"/><path d="M-64,-20 H64 M-60,-40 H60" stroke="#c78a55" stroke-width="3"/><path d="M-56,-60 Q0,-130 56,-60" stroke="#c78a55" stroke-width="7" fill="none"/></g>`;
  const slots = mk('g', { style: 'display:none', 'pointer-events': 'none' }, tsvg);
  slots.innerHTML = Array.from({ length: 9 }, (_, i) => `<circle cx="${800 + (i - 4) * 58}" cy="56" r="24" fill="#fff" opacity=".75"/>`).join('');
  const slotIcons = mk('g', { 'pointer-events': 'none' }, tsvg);

  // the picnic blanket
  const blanket = mk('g', { style: 'display:none' }, tsvg);
  blanket.innerHTML = `<g transform="translate(800 770)"><rect x="-300" y="-64" width="600" height="140" rx="26" fill="#ff9ab5"/>${Array.from({ length: 36 }, (_, i) => ((i % 12) + Math.floor(i / 12)) % 2 ? '' : `<rect x="${-300 + (i % 12) * 50}" y="${-64 + Math.floor(i / 12) * 47}" width="50" height="47" fill="#fff" opacity=".85"/>`).join('')}<rect x="-300" y="-64" width="600" height="140" rx="26" fill="none" stroke="#fff" stroke-width="6"/>
    ${SPOTS.map(([x, y]) => `<ellipse cx="${x}" cy="${y + 6}" rx="40" ry="20" fill="#fff" stroke="#ffd1e8" stroke-width="4"/>`).join('')}</g>`;
  const placedG = mk('g', { 'pointer-events': 'none' }, tsvg);
  const tableG = mk('g', {}, tsvg);
  const animalsG = mk('g', {}, tsvg);

  // heroes: galloping group first, standing friends later
  const rideG = pairs.map((p) => { const g = mk('g', { 'pointer-events': 'none' }, tsvg); mk('g', { transform: 'scale(1.05)' }, g).innerHTML = heroSVG(p); return g; });
  const standPos = [[250, 836, 380, 846, 1], [1350, 836, 1220, 846, -1], [800, 700, 690, 708, 1]];
  const stand = pairs.map((p, i) => {
    const [ux, uy, px, py, face] = standPos[i] || standPos[0];
    const u = mk('g', { style: 'display:none', 'pointer-events': 'none' }, tsvg);
    mk('g', { transform: `scale(${face * 0.95} 0.95)` }, u).innerHTML = unicornOnlySVG(p);
    u.setAttribute('transform', `translate(${ux} ${uy})`);
    const pr = mk('g', { style: 'display:none', 'pointer-events': 'none' }, tsvg);
    mk('g', { transform: 'scale(1.1)' }, pr).innerHTML = princessOnlySVG(p);
    pr.setAttribute('transform', `translate(${px} ${py})`);
    return { u, pr, ux, uy, px, py };
  });

  const S = { phase: 'ride', t: 0, off: 0, v: 260, foods: [], flying: [], got: [], items: [], drag: null, animals: [], fed: 0, placed: 0, endT: 0 };

  function pickFood(f) {
    const i = S.foods.indexOf(f);
    if (i < 0 || S.got.length + S.flying.length >= 9) return;
    S.foods.splice(i, 1);
    f.el.classList.add('flying');
    S.flying.push({ el: f.el, sx: f.x, sy: f.y, t: 0, type: f.type });
    audio.pop();
  }

  function beginHarvest() {
    S.phase = 'harvest';
    rideG.forEach((g) => { g.style.display = 'none'; });
    stand.forEach((s) => { s.u.style.display = ''; s.pr.style.display = ''; });
    trees.style.display = ''; basket.style.display = ''; slots.style.display = '';
    [[300, GROUND_Y - 480], [1300, GROUND_Y - 480]].forEach(([cx, cy], k) => {
      [[-120, 0], [-50, -80], [60, -40], [120, 40], [-70, 60], [10, 10], [-150, 80]].forEach(([dx, dy], i) => {
        const type = FOODS[(i + k) % 4];
        const g = mk('g', { class: 'food' }, foodsG);
        g.innerHTML = `<g transform="scale(1.5)">${foodArt(type)}</g><circle r="50" fill="transparent"/>`;
        const f = { el: g, type, x: cx + dx * (k ? -1 : 1), y: cy + dy + 120, ph: rand(0, 6) };
        g.setAttribute('transform', `translate(${f.x} ${f.y})`);
        g.addEventListener('pointerdown', (e) => { e.preventDefault(); pickFood(f); });
        S.foods.push(f);
      });
    });
    audio.moveIn();
  }

  function beginTable() {
    S.phase = 'table';
    basket.style.display = 'none';
    S.foods.splice(0).forEach((f) => { fx.burst(f.x, f.y, 4); f.el.remove(); });
    blanket.style.display = '';
    S.got.slice(0, 6).forEach((type, i) => {
      const g = mk('g', { class: 'plate-food', style: 'cursor:grab' }, tableG);
      g.innerHTML = `<g transform="scale(1.6)">${foodArt(type)}</g><circle r="52" fill="transparent"/>`;
      const it = { el: g, type, x: 330 + i * 150, y: 600, ox: 330 + i * 150, oy: 600, spot: -1 };
      g.setAttribute('transform', `translate(${it.x} ${it.y})`);
      g.addEventListener('pointerdown', (e) => { e.preventDefault(); if (it.spot >= 0) return; S.drag = it; audio.pop(); });
      S.items.push(it);
    });
    audio.chime(8);
  }

  function beginGuests() {
    S.phase = 'guests';
    [['bunny', -120, 560, 860], ['squirrel', 1720, 1060, 860], ['hedgehog', -160, 800, 884]].forEach(([k, sx, tx, ty], i) => {
      const g = mk('g', { class: 'animal', style: 'cursor:pointer' }, animalsG);
      g.innerHTML = `<g transform="scale(${k === 'squirrel' ? -1.3 : 1.3} 1.3)">${ANIMALS[k]}</g><circle r="70" cy="-40" fill="transparent"/>`;
      const a = { el: g, k, x: sx, y: ty, tx, fed: false, hop: 0, flip: k === 'squirrel' ? -1 : 1 };
      g.addEventListener('pointerdown', (e) => { e.preventDefault(); feed(a); });
      S.animals.push(a);
    });
    audio.chime(10);
  }

  function feed(a) {
    if (a.fed || Math.abs(a.x - a.tx) > 6) return;
    a.fed = true; a.hop = 0.01;
    fx.hearts(a.x, a.y - 80, 6);
    audio.munch();
    const it = S.items.find((x) => x.spot >= 0 && !x.eaten);
    if (it) { it.eaten = true; it.el.style.display = 'none'; }
    if (++S.fed >= S.animals.length) {
      S.phase = 'done';
      setTimeout(() => { host.photo(); }, 700);
      host.finish({ coins: 3 });
      stand.forEach((s) => fx.hearts(s.px, s.py - 120, 3));
    }
  }

  host.listen(window, 'pointermove', (e) => { if (!S.drag) return; const p = host.toLocal(e); S.drag.x = p.x; S.drag.y = p.y; S.drag.el.setAttribute('transform', `translate(${p.x} ${p.y})`); });
  const drop = () => {
    const it = S.drag; S.drag = null;
    if (!it) return;
    let best = -1, bd = 95;
    SPOTS.forEach(([sx, sy], i) => {
      if (S.items.some((o) => o.spot === i)) return;
      const d = Math.hypot(it.x - (800 + sx), it.y - (770 + sy));
      if (d < bd) { bd = d; best = i; }
    });
    if (best < 0) { it.x = it.ox; it.y = it.oy; it.el.setAttribute('transform', `translate(${it.x} ${it.y})`); return; }
    it.spot = best;
    it.x = 800 + SPOTS[best][0]; it.y = 770 + SPOTS[best][1] - 10;
    it.el.setAttribute('transform', `translate(${it.x} ${it.y})`);
    it.el.style.cursor = 'default';
    audio.chime(3 + S.placed);
    fx.burst(it.x, it.y, 5);
    if (++S.placed >= S.items.length) setTimeout(beginGuests, 700);
  };
  host.listen(window, 'pointerup', drop);
  host.listen(window, 'pointercancel', drop);

  return {
    update(dt, t) {
      S.t += dt;
      // ride in
      if (S.phase === 'ride') {
        if (S.t > 6) S.v = Math.max(0, 260 * (1 - (S.t - 6) / 2));
        S.off += S.v * dt;
        layers.forEach((l) => l.g.setAttribute('transform', `translate(${(-(S.off * l.f) % TILE).toFixed(1)} 0)`));
        rideG.forEach((g, i) => {
          const gallop = S.v > 20 ? Math.abs(Math.sin(t * 11 + i)) * 8 : 0;
          g.setAttribute('transform', `translate(${360 + i * 150} ${GROUND_Y + 8 + (i % 2) * 22 - gallop})`);
        });
        if (S.t % 0.05 < dt && S.v > 20) rideG.forEach((_, i) => fx.trail(280 + i * 150, GROUND_Y - 55 + (i % 2) * 22, RAINBOW[(Math.floor(S.t * 20) + i) % 6], S.v));
        if (S.t >= 8) beginHarvest();
      }
      // fruit bob and fly into the basket
      S.foods.forEach((f) => f.el.setAttribute('transform', `translate(${f.x} ${(f.y + Math.sin(t * 2 + f.ph) * 5).toFixed(1)}) rotate(${(Math.sin(t * 1.6 + f.ph) * 8).toFixed(1)})`));
      for (let i = S.flying.length - 1; i >= 0; i--) {
        const f = S.flying[i];
        f.t += dt / 0.75;
        const e = Math.min(1, f.t), x = f.sx + (BASKET.x - f.sx) * e, y = f.sy + (BASKET.y - 70 - f.sy) * e - Math.sin(Math.PI * e) * 160;
        f.el.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${(1 - 0.4 * e).toFixed(2)})`);
        if (f.t >= 1) {
          S.flying.splice(i, 1); f.el.remove();
          S.got.push(f.type);
          const n = S.got.length - 1;
          const ic = mk('g', {}, slotIcons);
          ic.innerHTML = `<g transform="translate(${800 + (n - 4) * 58} 56) scale(.9)">${foodArt(f.type)}</g>`;
          audio.chime(3 + n % 7);
          fx.burst(BASKET.x, BASKET.y - 60, 5);
          if (S.got.length >= 9 && S.phase === 'harvest') { S.phase = 'wait'; setTimeout(beginTable, 900); }
        }
      }
      // standing friends sway
      stand.forEach((s, i) => { const b = Math.sin(t * 2 + i) * 1.5; s.u.firstChild.setAttribute('transform', `scale(${standPos[i][4] * 0.95} 0.95) translate(0 ${-b})`); s.pr.firstChild.setAttribute('transform', `scale(1.1) translate(0 ${-b})`); });
      // animals hop in
      S.animals.forEach((a, i) => {
        if (Math.abs(a.x - a.tx) > 4) {
          a.x += Math.sign(a.tx - a.x) * Math.min(Math.abs(a.tx - a.x), 340 * dt);
          a.el.setAttribute('transform', `translate(${a.x.toFixed(1)} ${(a.y - Math.abs(Math.sin(t * 12 + i)) * 24).toFixed(1)})`);
        } else {
          if (a.hop > 0) { a.hop += dt * 2.5; if (a.hop > 1) a.hop = 0; }
          const h = a.hop > 0 ? Math.sin(a.hop * Math.PI) * 40 : (a.fed ? 0 : Math.abs(Math.sin(t * 3 + i)) * 6);
          a.el.setAttribute('transform', `translate(${a.x.toFixed(1)} ${(a.y - h).toFixed(1)})`);
        }
      });
    },
    result: () => ({ coins: 0 }),
    destroy() {},
  };
}
