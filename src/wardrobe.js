// The dress-up screen: no words, just big pictures and colours.
import { princessSVG, defaultLook, STYLE_COUNT } from './art.js';
import { PALETTE, TIARA_PALETTE, RAINBOW } from './cast.js';
import * as audio from './audio.js';

const CATS = [
  { key: 'dress', color: 'dressColor', view: '-44 -102 88 104', palette: PALETTE },
  { key: 'shoes', color: 'shoesColor', view: '-34 -34 68 36', palette: PALETTE },
  { key: 'tiara', color: 'tiaraColor', view: '-34 -128 68 46', palette: TIARA_PALETTE },
];

const CHECK = '<svg viewBox="0 0 100 100"><path d="M24,52 L43,71 L78,30" stroke="#fff" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const thumb = (def, look, view) => `<svg viewBox="${view}">${princessSVG(def, look)}</svg>`;

export function openWardrobe({ def, look: startLook, onChange, onClose }) {
  const root = document.getElementById('wardrobe');
  const look = { ...defaultLook(def), ...startLook };
  let cat = CATS[0];

  function sparkles(box) {
    for (let i = 0; i < 10; i++) {
      const s = document.createElement('i');
      s.className = 'w-spark';
      const a = (i / 10) * Math.PI * 2;
      s.style.setProperty('--dx', `${Math.cos(a) * (18 + Math.random() * 14)}vh`);
      s.style.setProperty('--dy', `${Math.sin(a) * (18 + Math.random() * 14)}vh`);
      s.style.color = RAINBOW[i % 6];
      s.textContent = '✦';
      box.appendChild(s);
      setTimeout(() => s.remove(), 900);
    }
  }

  function render(animate) {
    root.innerHTML = `
      <div class="w-stage"><div class="w-preview ${animate ? 'twirl' : ''}"><svg viewBox="-60 -135 120 145">${princessSVG(def, look)}</svg></div></div>
      <div class="w-side">
        <div class="w-tabs">${CATS.map((c, i) => `<button class="w-btn w-tab ${c === cat ? 'sel' : ''}" data-tab="${i}">${thumb(def, look, c.view)}</button>`).join('')}</div>
        <div class="w-styles">${Array.from({ length: STYLE_COUNT }, (_, i) => `<button class="w-btn ${look[cat.key] === i ? 'sel' : ''}" data-style="${i}">${thumb(def, { ...look, [cat.key]: i }, cat.view)}</button>`).join('')}</div>
        <div class="w-colors">${cat.palette.map((c) => `<button class="w-dot ${look[cat.color] === c ? 'sel' : ''}" data-color="${c}" style="background:${c}"></button>`).join('')}</div>
      </div>
      <button class="w-done" aria-label="Done">${CHECK}</button>`;
    if (animate) sparkles(root.querySelector('.w-preview'));
  }

  function changed(note) {
    audio.chime(note);
    onChange({ ...look });
    render(true);
  }

  root.onpointerdown = (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.dataset.tab !== undefined) { cat = CATS[+t.dataset.tab]; audio.pop(); render(false); }
    else if (t.dataset.style !== undefined) { look[cat.key] = +t.dataset.style; changed(3 + +t.dataset.style); }
    else if (t.dataset.color !== undefined) { look[cat.color] = t.dataset.color; changed(4 + cat.palette.indexOf(t.dataset.color) % 6); }
    else if (t.classList.contains('w-done')) { audio.moveIn(); root.hidden = true; root.innerHTML = ''; onClose(); }
  };

  root.hidden = false;
  render(true);
}
