// The bathroom: brush the princess's teeth. Drag the toothbrush over the sugar spots until they all sparkle away.
import { princessSVG, defaultLook } from './art.js';
import { RAINBOW } from './cast.js';
import * as audio from './audio.js';

const CHECK = '<svg viewBox="0 0 100 100"><path d="M24,52 L43,71 L78,30" stroke="#fff" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const REST = { x: 340, y: 262 };
const rnd = (a, b) => a + Math.random() * (b - a);

const teethSVG = () => {
  const upper = Array.from({ length: 6 }, (_, k) => `<rect x="${72 + k * 43}" y="62" width="40" height="66" rx="16" fill="#fff" stroke="#d9e8f5" stroke-width="3"/>`).join('');
  const lower = Array.from({ length: 6 }, (_, k) => `<rect x="${72 + k * 43}" y="172" width="40" height="62" rx="16" fill="#fff" stroke="#d9e8f5" stroke-width="3"/>`).join('');
  return `<ellipse cx="200" cy="150" rx="178" ry="124" fill="#ff8fa9" stroke="#fff" stroke-width="10"/>
    <ellipse cx="200" cy="150" rx="150" ry="96" fill="#c93a62"/>
    <ellipse cx="200" cy="214" rx="96" ry="34" fill="#ff7b9c"/>
    ${upper}${lower}<g id="spots"></g><g id="foam"></g><g id="stars"></g>`;
};

const brushSVG = '<rect x="-7" y="10" width="14" height="124" rx="7" fill="#ff8fc7" stroke="#fff" stroke-width="3"/><rect x="-18" y="-16" width="36" height="30" rx="9" fill="#fff" stroke="#fff" stroke-width="3"/><path d="M-12,-12 V8 M-4,-12 V8 M4,-12 V8 M12,-12 V8" stroke="#5cc8ff" stroke-width="5" stroke-linecap="round"/><circle cx="0" cy="62" r="4" fill="#fff"/>';

export function openTeeth({ cast, index = 0, brushedToday = () => false, onBrushed = () => {}, onClose }) {
  const root = document.getElementById('teeth');
  let idx = index;
  let spots = [];
  let down = null;

  function render(animate) {
    const c = cast[idx];
    const look = { ...defaultLook(c.def), ...c.look };
    root.innerHTML = `
      <div class="w-stage"><div class="w-preview ${animate ? 'twirl' : ''}"><svg viewBox="-60 -135 120 145">${princessSVG(c.def, look)}</svg></div>
        <div class="w-who">${cast.map((p, i) => `<button class="w-face ${i === idx ? 'sel' : ''}" data-who="${i}"><svg viewBox="-30 -128 60 56">${princessSVG(p.def, { ...defaultLook(p.def), ...p.look })}</svg></button>`).join('')}</div>
        ${c.name ? `<div class="w-name" style="color:#4fb0e8">${c.name}</div>` : ''}
      </div>
      <div class="t-side"><svg class="t-mouth" viewBox="0 0 400 300">${teethSVG()}<g id="brush" transform="translate(${REST.x} ${REST.y}) rotate(18)">${brushSVG}</g></svg></div>
      <button class="w-done" aria-label="Done">${CHECK}</button>`;
    if (brushedToday(c.def)) { spots = []; root.classList.add('shiny'); } else makeSpots();
  }

  const q = (s) => root.querySelector(s);
  function makeSpots() {
    spots = [];
    const g = q('#spots');
    for (let i = 0; i < 9; i++) {
      const upper = i % 2 === 0;
      const k = Math.floor(i / 2) + (i > 6 ? 1 : 0);
      const s = { x: 92 + ((k * 2 + (upper ? 0 : 1)) % 6) * 43 + rnd(-4, 4), y: upper ? rnd(84, 118) : rnd(184, 222), v: 1 };
      s.el = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      s.el.innerHTML = `<circle r="13" fill="#c98a3c"/><circle r="8" cx="-3" cy="-3" fill="#e0a95a"/><circle r="3" cx="5" cy="5" fill="#a56a24"/>`;
      s.el.setAttribute('transform', `translate(${s.x.toFixed(1)} ${s.y.toFixed(1)})`);
      g.appendChild(s.el);
      spots.push(s);
    }
    root.classList.remove('shiny');
  }

  function svgPoint(e) {
    const svg = q('.t-mouth');
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }
  function foam(x, y) {
    const f = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    f.setAttribute('cx', x + rnd(-14, 14)); f.setAttribute('cy', y + rnd(-14, 14)); f.setAttribute('r', rnd(5, 11));
    f.setAttribute('fill', '#fff'); f.setAttribute('stroke', '#bfe3ff'); f.setAttribute('stroke-width', '1.5');
    f.setAttribute('class', 'foam');
    q('#foam').appendChild(f);
    setTimeout(() => f.remove(), 900);
  }
  function star(x, y) {
    for (let i = 0; i < 5; i++) {
      const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t.textContent = '✦';
      t.setAttribute('x', x); t.setAttribute('y', y); t.setAttribute('font-size', '26'); t.setAttribute('text-anchor', 'middle');
      t.setAttribute('fill', RAINBOW[(i + Math.floor(x)) % 6]);
      t.style.setProperty('--dx', `${Math.cos(i * 1.26) * 40}px`); t.style.setProperty('--dy', `${Math.sin(i * 1.26) * 40}px`);
      t.setAttribute('class', 'tstar');
      q('#stars').appendChild(t);
      setTimeout(() => t.remove(), 800);
    }
  }
  function moveBrush(p) {
    q('#brush').setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(18)`);
  }
  function allClean() {
    root.classList.add('shiny');
    onBrushed(cast[idx].def);
    [0, 2, 4, 7].forEach((n, i) => setTimeout(() => audio.chime(n + 4), i * 140));
    const pv = q('.w-preview');
    pv.classList.remove('twirl'); void pv.offsetWidth; pv.classList.add('twirl');
    for (let i = 0; i < 10; i++) star(rnd(60, 340), rnd(50, 250));
  }

  root.onpointerdown = (e) => {
    const t = e.target.closest('button');
    if (t) {
      if (t.dataset.who !== undefined) { idx = +t.dataset.who; audio.chime(5 + idx); render(true); }
      else if (t.classList.contains('w-done')) { audio.moveIn(); root.hidden = true; root.innerHTML = ''; onClose(cast[idx].def); }
      return;
    }
    const svg = e.target.closest('.t-mouth');
    if (!svg) return;
    e.preventDefault();
    svg.setPointerCapture(e.pointerId);
    const p = svgPoint(e);
    down = { x: p.x, y: p.y, acc: 0 };
    moveBrush(p);
    audio.pop();
  };
  root.onpointermove = (e) => {
    if (!down) return;
    const p = svgPoint(e);
    const d = Math.hypot(p.x - down.x, p.y - down.y);
    down.x = p.x; down.y = p.y;
    moveBrush(p);
    down.acc += d;
    if (down.acc > 34) { down.acc = 0; foam(p.x, p.y); audio.bubble(); }
    let left = 0;
    spots.forEach((s) => {
      if (s.v <= 0) return;
      if (Math.hypot(s.x - p.x, s.y - p.y) < 42) {
        s.v -= d / 130;
        if (s.v <= 0) { s.el.remove(); star(s.x, s.y); audio.chime(3 + Math.floor(Math.random() * 6)); }
        else s.el.setAttribute('opacity', Math.max(0.15, s.v).toFixed(2));
      }
      if (s.v > 0) left++;
    });
    if (!left && spots.length) { spots = []; allClean(); }
  };
  const up = () => { down = null; };
  root.onpointerup = up;
  root.onpointercancel = up;

  root.hidden = false;
  render(true);
}
