// Sky painting (1 princess + 1 winged unicorn): fly anywhere and paint rainbow ribbons in the sky,
// then connect the twinkling stars into a big heart.
import { RAINBOW, STAR, rand, clamp, mk, cloud, heroSVG } from './tripkit.js';

const PI2 = Math.PI * 2;
const HEART = [0, 0.62, 1.22, 1.85, 2.5, Math.PI, PI2 - 2.5, PI2 - 1.85, PI2 - 1.22, PI2 - 0.62].map((t) =>
  [800 + 16 * Math.pow(Math.sin(t), 3) * 12.5, 350 - (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 12.5]);
const NEED = 3000; // how much sky to paint before the stars come out

export function start(host) {
  const { tsvg, fx, pairs, audio } = host;
  const pair = pairs[0];
  const defs = mk('defs', {}, tsvg);
  defs.innerHTML = `<linearGradient id="ssky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fb8ff"/><stop offset=".55" stop-color="#ffc8e6"/><stop offset="1" stop-color="#ffe9c9"/></linearGradient>
    <linearGradient id="sbar" x1="0" y1="0" x2="1" y2="0">${RAINBOW.map((c, i) => `<stop offset="${i / 5}" stop-color="${c}"/>`).join('')}</linearGradient>`;
  mk('rect', { width: 1600, height: 900, fill: 'url(#ssky)' }, tsvg);
  const twinkles = mk('g', {}, tsvg);
  twinkles.innerHTML = Array.from({ length: 30 }, (_, i) => `<circle class="twinkle" style="animation-delay:${(i % 6) * 0.4}s" cx="${(i * 211) % 1600}" cy="${30 + (i * 97) % 420}" r="${2 + i % 3}" fill="#fff"/>`).join('');
  const clouds = [[200, 640, 2], [700, 760, 2.6], [1200, 620, 2.2], [1500, 800, 3], [450, 300, 1.4], [1050, 200, 1.6]].map(([x, y, s], i) => {
    const g = mk('g', { 'pointer-events': 'none' }, tsvg);
    g.innerHTML = cloud(0, 0, s, 0.85);
    return { g, x, y, v: 8 + i * 3 };
  });
  const paint = mk('g', { 'pointer-events': 'none' }, tsvg);
  const heartFill = mk('path', { d: `M${HEART.map((p) => p.join(',')).join(' L')} Z`, fill: '#ff8fc7', opacity: '0', stroke: 'none' }, tsvg);
  const lines = mk('g', { 'pointer-events': 'none' }, tsvg);
  const starsG = mk('g', {}, tsvg);
  const hero = mk('g', { 'pointer-events': 'none' }, tsvg);
  const body = mk('g', { transform: 'scale(1.25)' }, hero);
  body.innerHTML = heroSVG(pair, { wings: true });

  // progress ribbon at the top
  const ui = mk('g', { 'pointer-events': 'none' }, tsvg);
  ui.innerHTML = '<rect x="450" y="34" width="700" height="26" rx="13" fill="#fff" opacity=".7"/><rect id="sbarfill" x="454" y="38" width="10" height="18" rx="9" fill="url(#sbar)"/>';
  const bar = ui.querySelector('#sbarfill');

  const S = { x: 400, y: 450, tx: 400, ty: 450, steering: false, strokes: [], cur: null, len: 0, lastX: 0, lastY: 0, phase: 'paint', stars: [], next: 0, t: 0, fillT: 0 };

  function newStroke() {
    const paths = RAINBOW.map((c) => mk('path', { stroke: c, 'stroke-width': 8, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: '.92' }, paint));
    S.cur = { pts: [], paths };
    S.strokes.push(S.cur);
    if (S.strokes.length > 40) { S.strokes.shift().paths.forEach((p) => p.remove()); }
  }
  function drawStroke(st) {
    const pts = st.pts;
    if (pts.length < 2) return;
    st.paths.forEach((path, j) => {
      let d = '';
      pts.forEach((p, i) => {
        const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
        const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1;
        const o = (j - 2.5) * 8;
        d += `${i ? 'L' : 'M'}${(p.x - (dy / l) * o).toFixed(1)},${(p.y + (dx / l) * o).toFixed(1)}`;
      });
      path.setAttribute('d', d);
    });
  }

  host.listen(tsvg, 'pointerdown', (e) => { e.preventDefault(); const p = host.toLocal(e); S.steering = true; S.tx = p.x; S.ty = p.y; if (S.phase === 'paint') { newStroke(); S.lastX = S.x; S.lastY = S.y; } });
  host.listen(window, 'pointermove', (e) => { if (!S.steering) return; const p = host.toLocal(e); S.tx = p.x; S.ty = p.y; });
  const up = () => { S.steering = false; S.cur = null; };
  host.listen(window, 'pointerup', up);
  host.listen(window, 'pointercancel', up);

  function beginStars() {
    S.phase = 'stars';
    audio.chime(9);
    HEART.forEach(([x, y], k) => {
      const g = mk('g', { class: 'cstar', style: 'cursor:pointer' }, starsG);
      g.innerHTML = '<circle r="34" fill="#fff6a8" opacity=".35"/><path transform="scale(3.2)" d="' + STAR + '" fill="#ffd84d" stroke="#fff" stroke-width=".7"/><circle r="60" fill="transparent"/>';
      g.setAttribute('transform', `translate(${x} ${y})`);
      const s = { g, x, y, lit: false };
      g.addEventListener('pointerdown', (e) => { e.preventDefault(); light(s, k); });
      S.stars.push(s);
    });
    fx.burst(800, 340, 20);
  }

  function light(s, k) {
    if (S.phase !== 'stars' || k !== S.next || s.lit) return;
    s.lit = true;
    if (k > 0) addLine(S.stars[k - 1], s);
    audio.chime(3 + k % 8);
    fx.burst(s.x, s.y, 8, ['#fff6a8', '#fff', '#ffd84d']);
    S.next++;
    if (S.next >= S.stars.length) {
      addLine(s, S.stars[0]);
      S.phase = 'done';
      heartFill.setAttribute('opacity', '.55');
      fx.burst(800, 330, 40);
      audio.moveIn();
      setTimeout(() => host.photo(), 900);
      host.finish({ coins: 2 });
    }
  }
  function addLine(a, b) {
    mk('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: '#fff6a8', 'stroke-width': 6, 'stroke-linecap': 'round', opacity: '.9' }, lines);
  }

  return {
    update(dt, t) {
      S.t += dt;
      clouds.forEach((c) => { c.x -= c.v * dt; if (c.x < -300) c.x = 1900; c.g.setAttribute('transform', `translate(${c.x.toFixed(1)} ${(c.y + Math.sin(t * 0.6 + c.v) * 6).toFixed(1)})`); });
      // fly after the finger
      const idleY = 450 + Math.sin(t * 1.4) * 14;
      const tx = S.steering ? clamp(S.tx, 140, 1460) : S.x, ty = S.steering ? clamp(S.ty, 130, 780) : S.y + (idleY - S.y) * 0.002;
      const k = 1 - Math.exp(-7 * dt), px = S.x, py = S.y;
      S.x += (tx - S.x) * k; S.y += (ty - S.y) * k;
      const vy = (S.y - py) / Math.max(dt, 0.001);
      hero.setAttribute('transform', `translate(${S.x.toFixed(1)} ${(S.y + Math.sin(t * 4) * 5).toFixed(1)}) rotate(${clamp(vy * 0.03, -16, 16).toFixed(1)})`);
      if (S.phase === 'paint' && S.cur && S.steering && Math.hypot(S.x - S.lastX, S.y - S.lastY) > 9) {
        S.len += Math.hypot(S.x - S.lastX, S.y - S.lastY);
        S.lastX = S.x; S.lastY = S.y;
        S.cur.pts.push({ x: S.x - 70, y: S.y - 70 });
        if (S.cur.pts.length > 700) S.cur.pts.shift();
        drawStroke(S.cur);
        if (S.len > NEED) beginStars();
      }
      bar.setAttribute('width', (10 + clamp(S.len / NEED, 0, 1) * 682).toFixed(1));
      if (S.phase === 'stars') {
        S.stars.forEach((s, i) => {
          const isNext = i === S.next;
          s.g.setAttribute('transform', `translate(${s.x} ${s.y}) scale(${(s.lit ? 1.2 : isNext ? 1 + Math.sin(t * 6) * 0.22 : 0.85).toFixed(2)})`);
          s.g.setAttribute('opacity', s.lit || isNext ? 1 : 0.45);
        });
        const nx = S.stars[S.next];
        if (nx && Math.hypot(S.x - 20 - nx.x, S.y - 90 - nx.y) < 80) light(nx, S.next);
      }
    },
    result: () => ({ coins: 0 }),
    destroy() {},
  };
}
