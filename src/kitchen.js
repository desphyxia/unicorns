// The kitchen: tap or drag ingredients into the big bowl to make a salad, toss it with the spoons, then let the princess eat it.
import { princessSVG, defaultLook } from './art.js';
import { RAINBOW } from './cast.js';
import * as audio from './audio.js';

const CHECK = '<svg viewBox="0 0 100 100"><path d="M24,52 L43,71 L78,30" stroke="#fff" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const rnd = (a, b) => a + Math.random() * (b - a);
const MAX = 44;

// 24 ingredients, each drawn in a 40 x 40 box centred on 0,0
const dots = (pts, r, f) => pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}"/>`).join('');
const INGREDIENTS = [
  { id: 'lettuce', art: '<path d="M-17,6 Q-20,-8 -10,-14 Q-6,-20 0,-15 Q8,-20 12,-12 Q20,-8 16,6 Q8,16 0,14 Q-10,16 -17,6Z" fill="#7bdc6a" stroke="#4fb86a" stroke-width="1.5"/><path d="M0,13 V-10 M0,2 L-9,-6 M0,0 L9,-7" stroke="#d8f7c4" stroke-width="2" fill="none" stroke-linecap="round"/>' },
  { id: 'tomato', art: '<circle cx="0" cy="2" r="15" fill="#ff5a4d"/><ellipse cx="-5" cy="-5" rx="4" ry="2.5" fill="#fff" opacity=".5"/><path d="M-8,-12 L0,-8 L8,-12 L3,-15 L0,-19 L-3,-15Z" fill="#4fb86a"/>' },
  { id: 'cucumber', art: '<circle r="15" fill="#4fb86a"/><circle r="11.5" fill="#d9f5b8"/>' + dots([[-4, -3], [4, -4], [0, 4], [-5, 5], [6, 3]], 1.6, '#9fd57a') },
  { id: 'carrot', art: '<path d="M-14,-12 L16,-2 Q18,0 16,2 L-12,14 Q-18,0 -14,-12Z" fill="#ff9a3c" transform="rotate(-25)"/><path d="M-12,-8 q6,2 10,0 M-6,4 q6,2 10,0" stroke="#e07a1c" stroke-width="1.6" fill="none" transform="rotate(-25)"/><path d="M-17,-10 q-6,-8 -10,-2 M-17,-10 q-2,-10 4,-12" stroke="#4fb86a" stroke-width="3" fill="none" stroke-linecap="round" transform="rotate(-25) translate(2 0)"/>' },
  { id: 'redpepper', art: '<path d="M-14,-6 Q-14,-14 -4,-12 Q0,-16 4,-12 Q14,-14 14,-6 Q16,10 6,15 Q0,17 -6,15 Q-16,10 -14,-6Z" fill="#ff3d52"/><path d="M-3,-14 q3,-8 8,-8" stroke="#4fb86a" stroke-width="3.4" fill="none" stroke-linecap="round"/><ellipse cx="-7" cy="-3" rx="3" ry="5" fill="#fff" opacity=".4"/>' },
  { id: 'yellowpepper', art: '<path d="M-14,-6 Q-14,-14 -4,-12 Q0,-16 4,-12 Q14,-14 14,-6 Q16,10 6,15 Q0,17 -6,15 Q-16,10 -14,-6Z" fill="#ffd23f"/><path d="M-3,-14 q3,-8 8,-8" stroke="#4fb86a" stroke-width="3.4" fill="none" stroke-linecap="round"/><ellipse cx="-7" cy="-3" rx="3" ry="5" fill="#fff" opacity=".5"/>' },
  { id: 'corn', art: '<ellipse cx="0" cy="0" rx="9" ry="17" fill="#ffd84d"/>' + dots([[-4, -9], [3, -10], [-4, -2], [3, -3], [-4, 5], [3, 4], [-1, 11]], 2, '#ffb02e') + '<path d="M-9,16 Q-16,2 -6,-4 M9,16 Q16,2 6,-4" stroke="#7bdc6a" stroke-width="3.5" fill="none" stroke-linecap="round"/>' },
  { id: 'olive', art: '<ellipse rx="11" ry="14" fill="#4a4a3a"/><ellipse rx="4" ry="4.4" fill="#fff" opacity=".9"/><ellipse cx="-5" cy="-6" rx="2" ry="3.4" fill="#fff" opacity=".35"/>' },
  { id: 'avocado', art: '<path d="M0,-17 Q10,-10 14,4 Q16,16 0,16 Q-16,16 -14,4 Q-10,-10 0,-17Z" fill="#6aa84f" stroke="#3f7a38" stroke-width="1.5"/><path d="M0,-12 Q8,-6 10,4 Q12,12 0,12 Q-12,12 -10,4 Q-8,-6 0,-12Z" fill="#d6ee9a"/><circle cx="0" cy="5" r="6" fill="#9a6a3a"/>' },
  { id: 'strawberry', art: '<path d="M0,16 Q-17,4 -14,-6 Q-8,-12 0,-9 Q8,-12 14,-6 Q17,4 0,16Z" fill="#ff4d6a"/>' + dots([[-6, -2], [3, -4], [-2, 4], [7, 2], [-8, 6], [1, 10]], 1.2, '#ffe9a0') + '<path d="M-9,-10 L0,-6 L9,-10 L4,-14 L0,-19 L-4,-14Z" fill="#4fb86a"/>' },
  { id: 'blueberries', art: dots([[-7, 5], [7, 5], [0, -6]], 8.5, '#5a6bd8') + dots([[-7, 5], [7, 5], [0, -6]], 2.2, '#3a4ab0') + '<circle cx="-9" cy="2" r="2" fill="#fff" opacity=".4"/>' },
  { id: 'apple', art: '<path d="M0,-8 Q-8,-14 -14,-6 Q-18,6 -8,14 Q0,18 8,14 Q18,6 14,-6 Q8,-14 0,-8Z" fill="#ff5a5a"/><path d="M0,-8 q1,-6 4,-10" stroke="#8a5a2a" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M3,-13 q8,-6 12,0 q-6,4 -12,0Z" fill="#6edc8c"/><ellipse cx="-7" cy="-1" rx="2.6" ry="4.5" fill="#fff" opacity=".4"/>' },
  { id: 'cheese', art: '<path d="M-16,10 L16,10 L16,-2 Q0,-16 -16,-2Z" fill="#ffd84d" stroke="#e8b923" stroke-width="1.5"/>' + dots([[-7, 3], [5, 5], [8, -2], [-2, -3]], 2.6, '#ffb02e') },
  { id: 'egg', art: '<ellipse rx="16" ry="12" fill="#fff" stroke="#eadfcf" stroke-width="2"/><circle cx="0" cy="0" r="6.5" fill="#ffc42e"/><circle cx="-2" cy="-2" r="2" fill="#fff" opacity=".6"/>' },
  { id: 'radish', art: '<path d="M-3,-6 q-6,-8 -10,-6 M0,-6 q0,-10 -3,-14 M3,-6 q6,-8 10,-6" stroke="#4fb86a" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M-13,-3 Q-14,10 0,16 Q14,10 13,-3 Q0,-10 -13,-3Z" fill="#ff5c8a"/><path d="M-4,10 Q0,18 4,10Z" fill="#fff"/>' },
  { id: 'broccoli', art: '<rect x="-4" y="2" width="8" height="14" rx="3" fill="#a8d86a"/>' + dots([[-8, -2], [0, -7], [8, -2], [-4, 3], [5, 3], [0, -1]], 7.5, '#3f9a4a') + dots([[-6, -5], [3, -9]], 2.2, '#6edc8c') },
  { id: 'mushroom', art: '<path d="M-5,2 L5,2 L6,15 Q0,17 -6,15Z" fill="#f4e6d4"/><path d="M-17,3 Q-17,-16 0,-16 Q17,-16 17,3Z" fill="#c98a5a"/>' + dots([[-7, -7], [4, -9], [9, -2]], 2.3, '#f4e6d4') },
  { id: 'peas', art: '<path d="M-17,3 Q0,-14 17,-5 Q2,12 -17,3Z" fill="#6edc8c" stroke="#4fb86a" stroke-width="1.6"/>' + dots([[-9, 1], [-1, -2], [8, -3]], 4.4, '#a6ee7a') },
  { id: 'grapes', art: dots([[-7, -6], [1, -8], [8, -5], [-9, 2], [-1, 0], [7, 2], [-5, 9], [3, 8], [0, 15]], 5.2, '#8a5bd8') + '<path d="M0,-10 q2,-6 7,-8" stroke="#7a5a2a" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="-7" cy="-7" r="1.4" fill="#fff" opacity=".5"/>' },
  { id: 'orange', art: '<circle r="16" fill="#ff9a2e"/><circle r="12.5" fill="#ffcf6a"/>' + [0, 45, 90, 135].map((a) => `<path d="M0,-12.5 V12.5" stroke="#ff9a2e" stroke-width="1.6" transform="rotate(${a})"/>`).join('') },
  { id: 'beet', art: '<path d="M0,-8 q-4,-10 -9,-10 M0,-8 q2,-12 6,-12" stroke="#4fb86a" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M-14,0 Q-14,-10 0,-10 Q14,-10 14,0 Q12,12 0,18 Q-12,12 -14,0Z" fill="#b8325a"/><path d="M-6,-3 q3,6 0,12" stroke="#d96a8a" stroke-width="1.6" fill="none"/>' },
  { id: 'banana', art: '<path d="M-16,-6 Q-6,14 16,6 Q18,4 16,2 Q0,8 -12,-10Z" fill="#ffe14d" stroke="#e8b923" stroke-width="1.6"/><path d="M-16,-6 l-3,-4" stroke="#7a5a2a" stroke-width="3" stroke-linecap="round"/>' },
  { id: 'pineapple', art: '<path d="M-6,-8 q-2,-8 0,-12 M0,-8 q0,-10 0,-14 M6,-8 q2,-8 0,-12" stroke="#4fb86a" stroke-width="3.4" fill="none" stroke-linecap="round"/><ellipse cy="5" rx="11" ry="14" fill="#ffc42e"/><path d="M-9,-3 L9,13 M-10,5 L2,17 M9,-3 L-9,13 M10,5 L-2,17" stroke="#e08a1c" stroke-width="1.6"/>' },
  { id: 'nuts', art: '<path d="M-14,2 Q-10,-10 0,-8 Q10,-10 14,2 Q10,12 0,10 Q-10,12 -14,2Z" fill="#c98a5a" stroke="#9a6a3a" stroke-width="1.5"/><path d="M0,-8 V10" stroke="#9a6a3a" stroke-width="1.6"/>' },
];

const ingSVG = (ing, size) => `<svg viewBox="-20 -20 40 40"${size ? ` width="${size}" height="${size}"` : ''}>${ing.art}</svg>`;

const SPOONS = '<svg viewBox="0 0 100 100"><g stroke="#fff" stroke-width="5" stroke-linecap="round"><path d="M30,84 L60,30" /><path d="M70,84 L40,30"/></g><ellipse cx="60" cy="24" rx="12" ry="16" transform="rotate(28 60 24)" fill="#fff"/><ellipse cx="40" cy="24" rx="12" ry="16" transform="rotate(-28 40 24)" fill="#fff"/></svg>';
const FORK = '<svg viewBox="0 0 100 100"><path d="M34,14 V38 Q34,48 50,48 Q66,48 66,38 V14 M50,14 V48 M50,48 V88" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';

export function openKitchen({ cast, index = 0, onClose }) {
  const root = document.getElementById('kitchen');
  let idx = index;
  let pieces = []; // what is in the bowl
  let drag = null;

  const bowlHTML = () => `<svg class="k-bowl" viewBox="0 0 400 220">
    <ellipse cx="200" cy="96" rx="168" ry="34" fill="#fff" stroke="#ffd1e8" stroke-width="6"/><ellipse cx="200" cy="98" rx="152" ry="28" fill="#f6e8ff"/>
    <g id="kpieces"></g>
    <path d="M32,96 A168,34 0 0 0 368,96 Q356,196 200,206 Q44,196 32,96Z" fill="#fff" stroke="#ffd1e8" stroke-width="6" stroke-linejoin="round"/>
    <path d="M52,118 Q60,176 120,192" stroke="#ffd1e8" stroke-width="8" fill="none" stroke-linecap="round" opacity=".7"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${96 + i * 42}" cy="${150 + Math.sin(i) * 6}" r="7" fill="${RAINBOW[i]}" opacity=".55"/>`).join('')}</svg>`;

  function render(animate) {
    const c = cast[idx];
    const look = { ...defaultLook(c.def), ...c.look };
    root.innerHTML = `
      <div class="w-stage"><div class="w-preview ${animate ? 'twirl' : ''}"><svg viewBox="-60 -135 120 145">${princessSVG(c.def, look)}</svg></div>
        <div class="w-who">${cast.map((p, i) => `<button class="w-face ${i === idx ? 'sel' : ''}" data-who="${i}"><svg viewBox="-30 -128 60 56">${princessSVG(p.def, { ...defaultLook(p.def), ...p.look })}</svg></button>`).join('')}</div>
        ${c.name ? `<div class="w-name" style="color:#ff9a2e">${c.name}</div>` : ''}
      </div>
      <div class="k-side">
        <div class="k-tray">${INGREDIENTS.map((g, i) => `<button class="k-ing" data-ing="${i}" aria-label="${g.id}">${ingSVG(g)}</button>`).join('')}</div>
        <div class="k-bowlrow"><button class="k-tool" data-tool="toss" aria-label="Toss the salad">${SPOONS}</button>${bowlHTML()}<button class="k-tool serve" data-tool="eat" aria-label="Eat the salad">${FORK}</button></div>
      </div>
      <button class="w-done" aria-label="Done">${CHECK}</button>`;
    pieces = [];
  }

  const q = (s) => root.querySelector(s);
  function addPiece(i, quiet) {
    const g = q('#kpieces');
    if (!g) return;
    if (pieces.length >= MAX) { const old = pieces.shift(); old.remove(); }
    const n = pieces.length;
    const a = rnd(0, Math.PI * 2), r = Math.sqrt(Math.random());
    const x = 200 + Math.cos(a) * r * 112, y = 94 + Math.sin(a) * r * 22 - Math.min(26, n * 0.7);
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    el.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rnd(-50, 50).toFixed(0)}) scale(1.05)`);
    el.dataset.x = x; el.dataset.y = y;
    el.innerHTML = `<g class="kdrop">${INGREDIENTS[i].art}</g>`;
    g.appendChild(el);
    pieces.push(el);
    if (!quiet) { audio.pop(); audio.chime(3 + (i % 8)); }
  }
  function sparkles(box, n = 10) {
    for (let i = 0; i < n; i++) {
      const s = document.createElement('i');
      s.className = 'w-spark';
      const a = (i / n) * Math.PI * 2;
      s.style.setProperty('--dx', `${Math.cos(a) * (16 + Math.random() * 14)}vh`);
      s.style.setProperty('--dy', `${Math.sin(a) * (16 + Math.random() * 14)}vh`);
      s.style.color = RAINBOW[i % 6];
      s.textContent = i % 3 ? '✦' : '♥';
      box.appendChild(s);
      setTimeout(() => s.remove(), 900);
    }
  }
  function toss() {
    const bowl = q('.k-bowl');
    bowl.classList.remove('shake'); void bowl.getBoundingClientRect(); bowl.classList.add('shake');
    pieces.forEach((el) => {
      const a = rnd(0, Math.PI * 2), r = Math.sqrt(Math.random());
      el.setAttribute('transform', `translate(${(200 + Math.cos(a) * r * 112).toFixed(1)} ${(94 + Math.sin(a) * r * 22 - 6).toFixed(1)}) rotate(${rnd(-90, 90).toFixed(0)}) scale(1.05)`);
    });
    [0, 1, 2].forEach((k) => setTimeout(() => audio.bubble(), k * 110));
  }
  function eat() {
    if (!pieces.length) { toss(); return; }
    const pv = q('.w-preview');
    sparkles(pv);
    pv.classList.remove('twirl'); void pv.offsetWidth; pv.classList.add('twirl');
    const left = pieces.splice(0);
    left.forEach((el, k) => setTimeout(() => { el.style.transition = 'opacity .25s'; el.style.opacity = '0'; setTimeout(() => el.remove(), 260); if (k % 3 === 0) audio.munch(); }, k * 55));
    setTimeout(() => audio.chime(9), left.length * 55);
  }

  // tap an ingredient, or drag it into the bowl
  root.onpointerdown = (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.dataset.who !== undefined) { idx = +t.dataset.who; audio.chime(5 + idx); render(true); return; }
    if (t.classList.contains('w-done')) { audio.moveIn(); root.hidden = true; root.innerHTML = ''; onClose(cast[idx].def); return; }
    if (t.dataset.tool === 'toss') { toss(); return; }
    if (t.dataset.tool === 'eat') { eat(); return; }
    if (t.dataset.ing !== undefined) {
      e.preventDefault();
      const i = +t.dataset.ing;
      const ghost = document.createElement('div');
      ghost.className = 'k-ghost';
      ghost.innerHTML = ingSVG(INGREDIENTS[i]);
      ghost.style.left = `${e.clientX}px`; ghost.style.top = `${e.clientY}px`;
      root.appendChild(ghost);
      drag = { i, ghost, x0: e.clientX, y0: e.clientY, moved: false };
    }
  };
  root.onpointermove = (e) => {
    if (!drag) return;
    drag.ghost.style.left = `${e.clientX}px`; drag.ghost.style.top = `${e.clientY}px`;
    if (Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) > 12) drag.moved = true;
  };
  const drop = (e) => {
    if (!drag) return;
    const d = drag; drag = null;
    d.ghost.remove();
    const b = q('.k-bowl').getBoundingClientRect();
    const over = e.clientX > b.left && e.clientX < b.right && e.clientY > b.top - b.height * 0.4 && e.clientY < b.bottom;
    if (!d.moved || over) addPiece(d.i);
  };
  root.onpointerup = drop;
  root.onpointercancel = () => { if (drag) { drag.ghost.remove(); drag = null; } };

  root.hidden = false;
  render(true);
}
