// The styling screen for princesses and unicorns: no words, just big pictures and colours.
import { princessSVG, defaultLook, unicornSVG, defaultUnicornLook, STYLE_COUNT } from './art.js';
import { PALETTE, TIARA_PALETTE, COAT_PALETTE, RAINBOW } from './cast.js';
import * as audio from './audio.js';

// what can be styled, for each kind of character
const KINDS = {
  princess: {
    art: princessSVG,
    base: defaultLook,
    preview: '-60 -135 120 145',
    cats: [
      { key: 'dress', color: 'dressColor', view: '-44 -102 88 104', palette: PALETTE },
      { key: 'shoes', color: 'shoesColor', view: '-34 -34 68 36', palette: PALETTE },
      { key: 'tiara', color: 'tiaraColor', view: '-34 -128 68 46', palette: TIARA_PALETTE },
    ],
  },
  unicorn: {
    art: unicornSVG,
    base: defaultUnicornLook,
    preview: '-84 -166 196 176',
    cats: [
      { key: 'coat', color: 'coatColor', view: '-84 -166 196 176', palette: COAT_PALETTE },   // coat pattern + colour
      { key: 'mane', color: null, view: '-84 -166 196 176', palette: null },                  // mane and tail colours
      { key: 'extra', color: 'extraColor', view: '-84 -166 196 176', palette: PALETTE },      // saddle, flowers, bow, ...
    ],
  },
};

const CHECK = '<svg viewBox="0 0 100 100"><path d="M24,52 L43,71 L78,30" stroke="#fff" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const RESET = '<svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="19" class="rr-track"/><circle cx="22" cy="22" r="19" class="rr"/><path d="M29,17 A9,9 0 1 0 31,23 M29,10 V17 H22" stroke="#fff" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 1)"/></svg>';

export function openWardrobe({ kind = 'princess', def, name, look: startLook, unlocked = {}, fresh = [], onChange, onReset, onClose }) {
  const K = KINDS[kind];
  const root = document.getElementById('wardrobe');
  const look = { ...K.base(def), ...startLook };
  let cat = K.cats[0];
  // everyone starts with 6 styles; treasure adds more
  const avail = (c) => [...Array.from({ length: STYLE_COUNT }, (_, i) => i), ...(unlocked[c.key] || [])];
  const thumb = (l, view) => `<svg viewBox="${view}">${K.art(def, l)}</svg>`;

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
    root.className = `kind-${kind}`;
    root.innerHTML = `
      <div class="w-stage"><div class="w-preview ${animate ? 'twirl' : ''}"><svg viewBox="${K.preview}">${K.art(def, look)}</svg></div></div>
      <div class="w-side">
        <div class="w-tabs">${K.cats.map((c, i) => `<button class="w-btn w-tab ${c === cat ? 'sel' : ''}" data-tab="${i}">${thumb(look, c.view)}</button>`).join('')}</div>
        <div class="w-styles ${avail(cat).length > 6 ? 'many' : ''}">${avail(cat).map((i) => `<button class="w-btn ${look[cat.key] === i ? 'sel' : ''} ${fresh.includes(`${cat.key}:${i}`) ? 'new' : ''}" data-style="${i}">${thumb({ ...look, [cat.key]: i }, cat.view)}</button>`).join('')}</div>
        ${cat.palette ? `<div class="w-colors">${cat.palette.map((c) => `<button class="w-dot ${look[cat.color] === c ? 'sel' : ''}" data-color="${c}" style="background:${c}"></button>`).join('')}</div>` : ''}
      </div>
      <button class="w-done" aria-label="Done">${CHECK}</button>
      <button class="w-reset" aria-label="Hold to start over">${RESET}</button>`;
    if (name !== null) {
      const tag = document.createElement('div');
      tag.className = 'w-name';
      tag.textContent = name || def.name || '';
      const c = look.dressColor || look.extraColor || '#a98bff';
      tag.style.color = c === '#ffffff' ? '#a98bff' : c;
      root.querySelector('.w-stage').appendChild(tag);
    }
    if (animate) sparkles(root.querySelector('.w-preview'));
  }

  function changed(note) {
    audio.chime(note);
    onChange({ ...look });
    render(true);
  }

  // holding the little circle-arrow for a moment puts this character's styling back to the start
  let holdTimer = null;
  const cancelHold = () => {
    clearTimeout(holdTimer);
    const r = root.querySelector('.w-reset');
    if (r) r.classList.remove('holding');
  };
  function doReset() {
    holdTimer = null;
    if (onReset) onReset();
    Object.keys(look).forEach((k) => delete look[k]);
    Object.assign(look, K.base(def));
    audio.moveIn();
    render(true);
  }

  root.onpointerdown = (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.classList.contains('w-reset')) { t.classList.add('holding'); holdTimer = setTimeout(doReset, 1600); return; }
    if (t.dataset.tab !== undefined) { cat = K.cats[+t.dataset.tab]; audio.pop(); render(false); }
    else if (t.dataset.style !== undefined) { look[cat.key] = +t.dataset.style; changed(3 + +t.dataset.style); }
    else if (t.dataset.color !== undefined) { look[cat.color] = t.dataset.color; changed(4 + cat.palette.indexOf(t.dataset.color) % 6); }
    else if (t.classList.contains('w-done')) { cancelHold(); audio.moveIn(); root.hidden = true; root.innerHTML = ''; onClose(); }
  };
  root.onpointerup = cancelHold;
  root.onpointercancel = cancelHold;
  root.onpointerleave = cancelHold;

  root.hidden = false;
  render(true);
}
