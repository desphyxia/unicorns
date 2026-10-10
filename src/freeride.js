// Free ride: the classic gallop. Steer by dragging and collect everything you touch.
import { RAINBOW, TILE, GROUND_Y, rand, clamp, scatter, tree, bush, clump, PASTELS, itemSVG, mk } from './tripkit.js';
import { heroSVG } from './tripkit.js';

const hills = (c1, c2) => [[150, 760, 380, 150, c1], [600, 790, 420, 190, c2], [1050, 770, 400, 160, c1], [1450, 780, 360, 170, c2]]
  .map(([cx, cy, rx, ry, c]) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${c}"/>`).join('');
const TYPES = ['flower', 'butterfly', 'star', 'heart', 'gem', 'candy'];

export function start(host) {
  const { tsvg, fx, pairs, audio } = host;
  const pair = pairs[0];
  const defs = mk('defs', {}, tsvg);
  defs.innerHTML = `<linearGradient id="fsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe3ff"/><stop offset="1" stop-color="#fff3d6"/></linearGradient>
    <linearGradient id="fground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fe39c"/><stop offset="1" stop-color="#6fd08c"/></linearGradient>`;
  mk('rect', { width: 1600, height: 900, fill: 'url(#fsky)' }, tsvg);
  mk('g', {}, tsvg).innerHTML = '<circle cx="1360" cy="140" r="60" fill="#fff3a0"/><circle cx="1360" cy="140" r="82" fill="#fff3a0" opacity=".35"/>';
  const tile = (html, f) => { const g = mk('g', {}, tsvg); g.innerHTML = `<g>${html}</g><g transform="translate(${TILE} 0)">${html}</g>`; return { g, f }; };
  const layers = [tile(hills('#b8efc0', '#aee9b8'), 0.12),
    tile(scatter(11, 130, (x, r) => { const k = r(); return k < 0.3 ? tree(x, PASTELS[Math.floor(r() * 6)]) : k < 0.75 ? clump(x, [RAINBOW[Math.floor(r() * 6)], '#fff', '#ff8fc7']) : bush(x, '#7fdc92'); }), 0.4)];
  mk('g', {}, tsvg).innerHTML = `<rect y="${GROUND_Y - 4}" width="1600" height="170" fill="url(#fground)"/><rect y="${GROUND_Y - 6}" width="1600" height="6" fill="#fff" opacity=".5"/>`;
  layers.push(tile(scatter(51, 70, (x, r) => `<path d="M${x},${GROUND_Y + 40 + r() * 100} q6,-18 12,0 M${x + 14},${GROUND_Y + 50 + r() * 90} q6,-18 12,0" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".5"/>`), 1));
  const itemsG = mk('g', {}, tsvg);
  const hero = mk('g', { 'pointer-events': 'none' }, tsvg);
  mk('g', { transform: 'scale(1.3)' }, hero).innerHTML = heroSVG(pair);

  const S = { off: 0, v: 240, objs: [], combo: 0, comboT: 0, got: 0, steering: false, px: 0, py: 0, hx: 380, hy: GROUND_Y, nextSpawn: 0.5, trailT: 0, trailI: 0 };
  const toLocal = host.toLocal;
  host.listen(tsvg, 'pointerdown', (e) => { e.preventDefault(); const p = toLocal(e); S.steering = true; S.px = p.x; S.py = p.y; });
  host.listen(window, 'pointermove', (e) => { if (!S.steering) return; const p = toLocal(e); S.px = p.x; S.py = p.y; });
  host.listen(window, 'pointerup', () => { S.steering = false; });
  host.listen(window, 'pointercancel', () => { S.steering = false; });

  function spawn() {
    const type = TYPES[Math.floor(Math.random() * TYPES.length)], c = RAINBOW[Math.floor(Math.random() * 6)];
    const g = mk('g', { class: 'treat' }, itemsG);
    g.innerHTML = `<g>${itemSVG(type, c)}</g><circle r="46" fill="transparent"/>`;
    const o = { el: g, c, x: 1720, y: rand(250, 650), ph: rand(0, 6) };
    g.addEventListener('pointerdown', () => collect(o));
    S.objs.push(o);
  }
  function collect(o) {
    const i = S.objs.indexOf(o);
    if (i < 0) return;
    S.objs.splice(i, 1); o.el.remove();
    fx.burst(o.x, o.y, 8, [o.c, '#fff', '#ffd84d']);
    audio.chime(3 + (S.combo % 7));
    S.combo++; S.comboT = 2; S.got++;
    if (S.got % 10 === 0) { audio.moveIn(); fx.burst(S.hx, S.hy - 100, 16); }
  }

  return {
    update(dt, t) {
      S.off += S.v * dt;
      layers.forEach((l) => l.g.setAttribute('transform', `translate(${(-(S.off * l.f) % TILE).toFixed(1)} 0)`));
      S.nextSpawn -= dt;
      if (S.nextSpawn <= 0) { spawn(); S.nextSpawn = rand(0.6, 1.3); }
      S.comboT -= dt; if (S.comboT <= 0) S.combo = 0;
      for (let i = S.objs.length - 1; i >= 0; i--) {
        const o = S.objs[i];
        o.x -= (S.v + 18) * dt;
        if (o.x < -80) { o.el.remove(); S.objs.splice(i, 1); continue; }
        o.el.setAttribute('transform', `translate(${o.x.toFixed(1)} ${(o.y + Math.sin(t * 2.5 + o.ph) * 10).toFixed(1)}) rotate(${(Math.sin(t * 2 + o.ph) * 12).toFixed(1)})`);
      }
      const tx = S.steering ? clamp(S.px, 250, 1150) : 380;
      const ty = S.steering ? clamp(S.py + 40, 300, GROUND_Y) : GROUND_Y;
      const k = 1 - Math.exp(-6 * dt), prevY = S.hy;
      S.hx += (tx - S.hx) * k; S.hy += (ty - S.hy) * k;
      const vy = (S.hy - prevY) / Math.max(dt, 0.001);
      const gallop = S.hy > GROUND_Y - 6 ? Math.abs(Math.sin(t * 11)) * 9 : Math.sin(t * 3) * 3;
      hero.setAttribute('transform', `translate(${S.hx.toFixed(1)} ${(S.hy - gallop).toFixed(1)}) rotate(${clamp(vy * 0.03, -14, 14).toFixed(1)})`);
      for (const o of S.objs.slice()) { const dx = o.x - (S.hx + 40), dy = o.y - (S.hy - 100); if (dx * dx + dy * dy < 95 * 95) collect(o); }
      S.trailT -= dt;
      if (S.trailT <= 0) { S.trailT = 0.05; host.trail(S.hx - 90, S.hy - 70 + rand(-8, 8), RAINBOW[S.trailI++ % 6], S.v); }
    },
    result: () => ({ coins: Math.floor(S.got / 6) }),
    destroy() {},
  };
}
