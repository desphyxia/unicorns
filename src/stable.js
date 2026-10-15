// Caring for the unicorns: drag food to feed them, drag the brush to groom them.
import { BASKETS, BRUSH_REST, foodSVG, brushSVG } from './stableart.js';

export function initStable(ctx) {
  const { el, tools, svg, chars, audio, toSvg, sparkle, hearts, getMode, isBusy, award } = ctx;
  const scene = svg.querySelector('#stableScene');
  const active = new Map(); // pointerId -> { tool, ... }
  const brush = { x: BRUSH_REST.x, y: BRUSH_REST.y, dragging: false, wob: 0, lastSound: 0 };
  const brushEl = el('g', { style: 'display:none;cursor:grab' }, tools);
  brushEl.innerHTML = brushSVG();

  const unicornAt = (x, y) => chars.find((c) => c.kind === 'unicorn' && !c.mount && Math.abs(x - c.x) < 120 && y > c.y - 190 && y < c.y + 10);

  function happy(c) {
    c.joy = 0;
    c.shine = 2.2;
    c.hopT = 0;
    hearts(c.x + 20, c.y - 130, 10);
    sparkle(c.x + 10, c.y - 110, 16);
    audio.moveIn();
  }

  // food baskets
  scene.querySelectorAll('.basket').forEach((b) => {
    b.style.cursor = 'grab';
    b.addEventListener('pointerdown', (e) => {
      if (isBusy() || getMode() !== 'stable') return;
      e.preventDefault();
      const p = toSvg(e);
      const g = el('g', {}, tools);
      g.innerHTML = `<g transform="scale(1.7)">${foodSVG(b.dataset.food)}</g>`;
      g.setAttribute('transform', `translate(${p.x} ${p.y})`);
      active.set(e.pointerId, { tool: 'food', el: g, x: p.x, y: p.y });
      audio.pop();
    });
  });

  brushEl.addEventListener('pointerdown', (e) => {
    if (isBusy() || getMode() !== 'stable') return;
    e.preventDefault();
    const p = toSvg(e);
    active.set(e.pointerId, { tool: 'brush', lx: p.x, ly: p.y });
    brush.dragging = true;
    audio.pop();
  });

  window.addEventListener('pointermove', (e) => {
    const a = active.get(e.pointerId);
    if (!a) return;
    const p = toSvg(e);
    if (a.tool === 'food') {
      a.x = p.x; a.y = p.y;
      a.el.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
    } else {
      const moved = Math.hypot(p.x - a.lx, p.y - a.ly);
      a.lx = p.x; a.ly = p.y;
      brush.x = p.x; brush.y = p.y;
      brush.wob += moved * 0.06;
      const c = unicornAt(p.x, p.y);
      if (c && moved > 1) {
        c.groom = (c.groom || 0) + moved * 0.0016;
        if (Math.random() < Math.min(0.5, moved / 50)) sparkle(p.x, p.y, 1);
        const now = performance.now();
        if (now - brush.lastSound > 140) { audio.bubble(); brush.lastSound = now; }
        if (c.groom >= 1) { c.groom = 0; happy(c); award('brush'); }
      }
    }
  });

  function finish(e) {
    const a = active.get(e.pointerId);
    if (!a) return;
    active.delete(e.pointerId);
    if (a.tool === 'brush') { brush.dragging = false; return; }
    const c = unicornAt(a.x, a.y);
    a.el.remove();
    if (!c) { sparkle(a.x, a.y, 4); audio.pop(); return; }
    c.munch = 1.2;
    award('feed');
    c.hopT = 0;
    c.joy = (c.joy || 0) + 0.5;
    hearts(c.x + 40, c.y - 120, 4);
    audio.munch();
    setTimeout(() => audio.chime(7), 350);
    if (c.joy >= 1) setTimeout(() => happy(c), 500);
  }
  window.addEventListener('pointerup', finish);
  window.addEventListener('pointercancel', finish);

  return {
    setVisible(on) {
      scene.style.display = on ? '' : 'none';
      brushEl.style.display = on ? '' : 'none';
      if (!on) { active.forEach((a) => { if (a.el) a.el.remove(); }); active.clear(); brush.dragging = false; }
      brush.x = BRUSH_REST.x; brush.y = BRUSH_REST.y;
    },
    update(dt) {
      if (!brush.dragging) {
        brush.x += (BRUSH_REST.x - brush.x) * Math.min(1, dt * 9);
        brush.y += (BRUSH_REST.y - brush.y) * Math.min(1, dt * 9);
      }
      const rot = brush.dragging ? Math.sin(brush.wob) * 16 : 0;
      brushEl.setAttribute('transform', `translate(${brush.x.toFixed(1)} ${brush.y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${brush.dragging ? 1.2 : 1})`);
    },
  };
}
