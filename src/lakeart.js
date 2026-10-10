// The lake scene: where princesses and unicorns take their baths.
import { RAINBOW } from './cast.js';

export const WATER = { cx: 800, cy: 655, rx: 540, ry: 185 };
export const SHORE = { x0: 60, x1: 1540, y0: 856, y1: 886 };
export const MUD = { cx: 1450, cy: 872, rx: 100, ry: 20 };
export const SPONGE_REST = { x: 150, y: 742 };

export function inWater(x, y, k = 1) {
  const dx = (x - WATER.cx) / (WATER.rx * k), dy = (y - WATER.cy) / (WATER.ry * k);
  return dx * dx + dy * dy < 1;
}

// Pull a point back inside the water so nobody floats on the grass.
export function clampToWater(x, y) {
  const dx = (x - WATER.cx) / WATER.rx, dy = (y - WATER.cy) / WATER.ry;
  const d = Math.hypot(dx, dy);
  if (d < 0.92) return { x, y };
  return { x: WATER.cx + (dx / d) * WATER.rx * 0.92, y: WATER.cy + (dy / d) * WATER.ry * 0.92 };
}

export function duckSVG() {
  return `<g>
    <path d="M-18,-12 Q-30,-22 -26,-26 Q-18,-20 -10,-18Z" fill="#ffd84d"/>
    <ellipse cx="0" cy="-10" rx="21" ry="13" fill="#ffd84d"/>
    <ellipse cx="-3" cy="-9" rx="11" ry="6" fill="#ffc21a"/>
    <circle cx="15" cy="-26" r="11" fill="#ffd84d"/>
    <ellipse cx="28" cy="-24" rx="8" ry="3.8" fill="#ff9a5c"/>
    <circle cx="19" cy="-29" r="2" fill="#3b2a4a"/>
    <circle cx="12" cy="-22" r="3" fill="#ff8fa8" opacity=".5"/>
  </g>`;
}

function tree(x, y, c) {
  return `<g transform="translate(${x} ${y})"><rect x="-6" y="-10" width="12" height="46" rx="5" fill="#d9a77a"/><circle cx="0" cy="-34" r="38" fill="${c}"/><circle cx="-14" cy="-40" r="9" fill="#fff" opacity=".35"/></g>`;
}

function lily(x, y, s, flowerColor) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><ellipse rx="34" ry="11" fill="#6edc8c" stroke="#4fb86a" stroke-width="2"/><path d="M0,0 L34,-3" stroke="#bff1c8" stroke-width="2"/>${flowerColor ? `<circle cx="-4" cy="-8" r="8" fill="${flowerColor}"/><circle cx="-4" cy="-8" r="3.5" fill="#fff6a8"/>` : ''}</g>`;
}

function reeds(x, y) {
  return `<g transform="translate(${x} ${y})" class="sway">${[-10, 0, 11].map((d, i) => `<line x1="${d}" y1="0" x2="${d + (i - 1) * 6}" y2="-${60 + i * 12}" stroke="#4fb86a" stroke-width="4" stroke-linecap="round"/><ellipse cx="${d + (i - 1) * 6}" cy="-${68 + i * 12}" rx="5" ry="13" fill="#b5764a"/>`).join('')}</g>`;
}

export function lakeSVG() {
  const arcs = RAINBOW.map((c, i) => {
    const rad = 700 - i * 26;
    return `<path d="M${800 - rad},470 A${rad},${rad} 0 0 1 ${800 + rad},470" stroke="${c}" stroke-width="28" fill="none" opacity=".7"/>`;
  }).join('');
  const glints = [[430, 560], [620, 520], [900, 500], [1180, 590], [520, 740], [1020, 770], [760, 640], [1250, 700]]
    .map(([x, y], i) => `<path class="glint" style="animation-delay:${i * 0.4}s" d="M${x - 16},${y} Q${x},${y - 5} ${x + 16},${y}" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>`).join('');
  const flowers = [[100, 880, '#ff6b8b'], [330, 893, '#ffd23f'], [600, 889, '#a98bff'], [1010, 893, '#ff9a5c'], [1300, 884, '#5cc8ff'], [1560, 880, '#ff8fc7'], [30, 850, '#fff']]
    .map(([x, y, c]) => `<g transform="translate(${x} ${y})"><line y2="12" stroke="#4fb86a" stroke-width="3"/>${[0, 72, 144, 216, 288].map((a) => `<circle cx="${Math.cos(a * Math.PI / 180) * 6}" cy="${Math.sin(a * Math.PI / 180) * 6}" r="4.5" fill="${c}"/>`).join('')}<circle r="3.5" fill="#fff6a8"/></g>`).join('');

  return `<g id="lakeScene" style="display:none">
  <rect width="1600" height="900" fill="url(#sky)"/>
  <circle cx="240" cy="120" r="62" fill="#fff3a0"/><circle cx="240" cy="120" r="84" fill="#fff3a0" opacity=".35"/>
  ${arcs}
  <g class="cloud"><ellipse cx="1180" cy="120" rx="80" ry="28" fill="#fff" opacity=".9"/><circle cx="1150" cy="100" r="30" fill="#fff" opacity=".9"/><circle cx="1205" cy="92" r="36" fill="#fff" opacity=".9"/></g>
  <g class="cloud" style="animation-delay:-9s"><ellipse cx="520" cy="80" rx="70" ry="24" fill="#fff" opacity=".9"/><circle cx="495" cy="64" r="26" fill="#fff" opacity=".9"/><circle cx="545" cy="58" r="30" fill="#fff" opacity=".9"/></g>
  <ellipse cx="300" cy="480" rx="520" ry="140" fill="#b8efc0"/>
  <ellipse cx="1320" cy="486" rx="540" ry="130" fill="#aee9b8"/>

  <!-- tiny faraway castle -->
  <g transform="translate(722 352)">
    <rect x="30" y="40" width="96" height="62" rx="4" fill="#f0e2ff" stroke="#fff" stroke-width="3"/>
    <rect x="8" y="30" width="30" height="72" rx="3" fill="#f6e8ff" stroke="#fff" stroke-width="3"/>
    <rect x="118" y="30" width="30" height="72" rx="3" fill="#f6e8ff" stroke="#fff" stroke-width="3"/>
    <polygon points="4,32 42,32 23,-6" fill="#ff8fc7"/><polygon points="114,32 152,32 133,-6" fill="#5cc8ff"/>
    <polygon points="44,44 112,44 78,-18" fill="#ffd23f"/>
  </g>
  ${tree(120, 430, '#ff9ac8')}${tree(215, 450, '#9be5a3')}${tree(1390, 440, '#c3a8ff')}${tree(1480, 428, '#ffd48a')}${tree(1065, 450, '#9be5a3')}${tree(420, 455, '#ffb3c7')}

  <path d="M0,452 Q200,440 400,452 T800,452 T1200,452 T1600,452 V900 H0 Z" fill="url(#grass)"/>

  <ellipse cx="${WATER.cx}" cy="${WATER.cy + 8}" rx="${WATER.rx + 14}" ry="${WATER.ry + 10}" fill="#c9f5cf"/>
  <ellipse id="water" cx="${WATER.cx}" cy="${WATER.cy}" rx="${WATER.rx}" ry="${WATER.ry}" fill="url(#water)" stroke="#fff" stroke-width="8"/>
  <ellipse cx="${WATER.cx - 130}" cy="${WATER.cy - 78}" rx="260" ry="46" fill="#fff" opacity=".18" pointer-events="none"/>
  <g pointer-events="none">${glints}
    ${lily(430, 600, 1, '#ff8fc7')}${lily(1150, 560, .9, '')}${lily(980, 745, 1.1, '#fff')}${lily(570, 765, .8, '')}${lily(1240, 690, .7, '#ffd23f')}
  </g>
  ${reeds(250, 700)}${reeds(1370, 640)}${reeds(1325, 735)}

  <!-- mud puddle -->
  <ellipse cx="${MUD.cx}" cy="${MUD.cy}" rx="${MUD.rx}" ry="${MUD.ry}" fill="#b98a6a" stroke="#9a6b4b" stroke-width="4"/>
  <ellipse cx="${MUD.cx - 20}" cy="${MUD.cy - 4}" rx="48" ry="7" fill="#d7b093" opacity=".7"/>
  <circle cx="${MUD.cx + 40}" cy="${MUD.cy - 2}" r="6" fill="#d7b093"/><circle cx="${MUD.cx + 52}" cy="${MUD.cy + 4}" r="3.5" fill="#d7b093"/>

  <!-- soap stand -->
  <g transform="translate(60 776)">
    <rect x="10" y="0" width="190" height="86" rx="10" fill="#f2c79b" stroke="#fff" stroke-width="4"/>
    <path d="M10,28 H200 M10,56 H200" stroke="#e0a874" stroke-width="3"/>
    <circle cx="170" cy="-10" r="12" fill="#fff" opacity=".7" stroke="#cdeaff" stroke-width="2"/><circle cx="188" cy="-26" r="8" fill="#fff" opacity=".7" stroke="#cdeaff" stroke-width="2"/>
  </g>
  ${flowers}
  <g id="ducks"></g>
  </g>`;
}
