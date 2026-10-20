// The styling screens: wardrobe (clothes), hair salon, makeup room and unicorn styling.
// No words, just big pictures and colours.
import { princessSVG, defaultLook, unicornSVG, defaultUnicornLook, STYLE_COUNT } from './art.js';
import { PALETTE, TIARA_PALETTE, COAT_PALETTE, HAIR_PALETTE, LIP_PALETTE, EYE_PALETTE, CHEEK_PALETTE, RAINBOW } from './cast.js';
import * as audio from './audio.js';

const HEAD = '-40 -130 80 80';
const SECTIONS = {
  clothes: {
    art: princessSVG, base: defaultLook, preview: '-60 -135 120 145', princess: true,
    keys: ['dress', 'dressColor', 'shoes', 'shoesColor', 'tiara', 'tiaraColor'],
    cats: [
      { key: 'dress', color: 'dressColor', view: '-44 -102 88 104', palette: PALETTE },
      { key: 'shoes', color: 'shoesColor', view: '-34 -34 68 36', palette: PALETTE },
      { key: 'tiara', color: 'tiaraColor', view: '-34 -128 68 46', palette: TIARA_PALETTE },
    ],
  },
  hair: {
    art: princessSVG, base: defaultLook, preview: '-60 -146 120 112', princess: true,
    keys: ['hairStyle', 'hairColor', 'hairAcc', 'hairAccColor'],
    cats: [
      { key: 'hairStyle', color: 'hairColor', view: HEAD, palette: HAIR_PALETTE },
      { key: 'hairAcc', color: 'hairAccColor', view: HEAD, palette: PALETTE },
    ],
  },
  makeup: {
    art: princessSVG, base: defaultLook, preview: '-36 -126 72 66', princess: true,
    keys: ['lips', 'lipsColor', 'eyes', 'eyesColor', 'cheeks', 'cheeksColor'],
    cats: [
      { key: 'lips', color: 'lipsColor', view: '-20 -96 40 30', palette: LIP_PALETTE },
      { key: 'eyes', color: 'eyesColor', view: '-24 -104 48 30', palette: EYE_PALETTE },
      { key: 'cheeks', color: 'cheeksColor', view: '-26 -98 52 34', palette: CHEEK_PALETTE },
    ],
  },
  unicorn: {
    art: unicornSVG, base: defaultUnicornLook, preview: '-84 -166 196 176', princess: false,
    keys: null, // everything
    cats: [
      { key: 'coat', color: 'coatColor', view: '-84 -166 196 176', palette: COAT_PALETTE },   // coat pattern + colour
      { key: 'mane', color: null, view: '-84 -166 196 176', palette: null },                  // mane and tail colours
      { key: 'extra', color: 'extraColor', view: '-84 -166 196 176', palette: PALETTE },      // saddle, flowers, bow, ...
    ],
  },
};

// soft decorations behind the character in the two salons
const BACKDROPS = {
  hair: `<svg class="w-back" viewBox="0 0 200 200"><ellipse cx="100" cy="86" rx="84" ry="92" fill="#fff" stroke="#ffb3d9" stroke-width="7" opacity=".7"/><ellipse cx="100" cy="86" rx="73" ry="81" fill="#eaf6ff" opacity=".6"/><path d="M52,52 Q66,30 96,26" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round" opacity=".9"/><rect x="34" y="150" width="132" height="60" rx="30" fill="#ff8fc7" opacity=".8"/></svg>`,
  makeup: `<svg class="w-back" viewBox="0 0 200 200">${Array.from({ length: 16 }, (_, k) => `<circle cx="${(100 + Math.cos(k / 16 * Math.PI * 2) * 92).toFixed(1)}" cy="${(92 + Math.sin(k / 16 * Math.PI * 2) * 92).toFixed(1)}" r="6.5" fill="#fff3a0" stroke="#ffd96a" stroke-width="1.6"/>`).join('')}<circle cx="100" cy="92" r="82" fill="#fff" stroke="#ffd1e8" stroke-width="6" opacity=".75"/><circle cx="100" cy="92" r="71" fill="#eaf6ff" opacity=".6"/><path d="M48,62 Q62,40 92,34" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round" opacity=".9"/></svg>`,
};

const CHECK = '<svg viewBox="0 0 100 100"><path d="M24,52 L43,71 L78,30" stroke="#fff" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const RESET = '<svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="19" class="rr-track"/><circle cx="22" cy="22" r="19" class="rr"/><path d="M29,17 A9,9 0 1 0 31,23 M29,10 V17 H22" stroke="#fff" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 1)"/></svg>';

// cast: [{ def, look, name }]; with several princesses a row of little faces lets you pick who sits in the chair
export function openWardrobe({ section = 'clothes', cast, index = 0, unlocked = {}, fresh = [], onChange, onReset, onClose }) {
  const K = SECTIONS[section];
  const root = document.getElementById('wardrobe');
  const looks = cast.map((c) => ({ ...K.base(c.def), ...c.look }));
  let idx = index;
  let cat = K.cats[0];
  const cur = () => cast[idx];
  const look = () => looks[idx];
  // everyone starts with 6 styles; treasure adds more
  const avail = (c) => [...Array.from({ length: STYLE_COUNT }, (_, i) => i), ...(unlocked[c.key] || [])];
  const thumb = (l, view) => `<svg viewBox="${view}">${K.art(cur().def, l)}</svg>`;

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
    const L = look();
    root.className = `sec-${section} kind-${K.princess ? 'princess' : 'unicorn'}`;
    root.innerHTML = `
      <div class="w-stage">${BACKDROPS[section] || ''}<div class="w-preview ${animate ? 'twirl' : ''}"><svg viewBox="${K.preview}">${K.art(cur().def, L)}</svg></div>
        ${cast.length > 1 ? `<div class="w-who">${cast.map((c, i) => `<button class="w-face ${i === idx ? 'sel' : ''}" data-who="${i}"><svg viewBox="-30 -128 60 56">${princessSVG(c.def, looks[i])}</svg></button>`).join('')}</div>` : ''}
      </div>
      <div class="w-side">
        <div class="w-tabs">${K.cats.map((c, i) => `<button class="w-btn w-tab ${c === cat ? 'sel' : ''}" data-tab="${i}">${thumb(L, c.view)}</button>`).join('')}</div>
        <div class="w-styles ${avail(cat).length > 6 ? 'many' : ''}">${avail(cat).map((i) => `<button class="w-btn ${L[cat.key] === i ? 'sel' : ''} ${fresh.includes(`${cat.key}:${i}`) ? 'new' : ''}" data-style="${i}">${thumb({ ...L, [cat.key]: i }, cat.view)}</button>`).join('')}</div>
        ${cat.palette ? `<div class="w-colors">${cat.palette.map((c) => `<button class="w-dot ${L[cat.color] === c ? 'sel' : ''}" data-color="${c}" style="background:${c}"></button>`).join('')}</div>` : ''}
      </div>
      <button class="w-done" aria-label="Done">${CHECK}</button>
      <button class="w-reset" aria-label="Hold to start over">${RESET}</button>`;
    if (cur().name !== null && cur().name !== undefined) {
      const tag = document.createElement('div');
      tag.className = 'w-name';
      tag.textContent = cur().name;
      const c = L.dressColor || L.extraColor || '#a98bff';
      const n = parseInt(c.slice(1), 16);
      const lum = (((n >> 16) & 255) * 0.3 + ((n >> 8) & 255) * 0.59 + (n & 255) * 0.11) / 255;
      tag.style.color = lum > 0.72 ? '#e0709f' : c; // pale dresses would make the name hard to read
      root.querySelector('.w-stage').appendChild(tag);
    }
    if (animate) sparkles(root.querySelector('.w-preview'));
  }

  function changed(note) {
    audio.chime(note);
    onChange(cur().def, { ...look() });
    render(true);
  }

  // holding the little circle-arrow for a moment puts this character's styling (in this room) back to the start
  let holdTimer = null;
  const cancelHold = () => {
    clearTimeout(holdTimer);
    const r = root.querySelector('.w-reset');
    if (r) r.classList.remove('holding');
  };
  function doReset() {
    holdTimer = null;
    const base = K.base(cur().def);
    const keys = K.keys || Object.keys(base);
    if (onReset) onReset(cur().def, K.keys);
    keys.forEach((k) => { looks[idx][k] = base[k]; });
    audio.moveIn();
    render(true);
  }

  root.onpointerdown = (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.classList.contains('w-reset')) { t.classList.add('holding'); holdTimer = setTimeout(doReset, 1600); return; }
    if (t.dataset.who !== undefined) { idx = +t.dataset.who; audio.chime(5 + idx); render(true); return; }
    if (t.dataset.tab !== undefined) { cat = K.cats[+t.dataset.tab]; audio.pop(); render(false); }
    else if (t.dataset.style !== undefined) { looks[idx][cat.key] = +t.dataset.style; changed(3 + +t.dataset.style); }
    else if (t.dataset.color !== undefined) { looks[idx][cat.color] = t.dataset.color; changed(4 + cat.palette.indexOf(t.dataset.color) % 6); }
    else if (t.classList.contains('w-done')) { cancelHold(); audio.moveIn(); root.hidden = true; root.innerHTML = ''; root.className = ''; onClose(cur().def); }
  };
  root.onpointerup = cancelHold;
  root.onpointercancel = cancelHold;
  root.onpointerleave = cancelHold;

  root.hidden = false;
  render(true);
}
