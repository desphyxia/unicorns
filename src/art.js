// All artwork is drawn in code (SVG strings), so nothing needs downloading.
import { RAINBOW } from './cast.js';
import { lakeSVG, duckSVG } from './lakeart.js';
import { stableSVG } from './stableart.js';

export const W = 1600;
export const H = 900;

// Castle rooms: a stepped dollhouse with 2 + 4 + 2 = 8 bedrooms (the kitchen and the bathroom take the other two cells).
export const ROOM_COLORS = ['#ffb3c7', '#ffcf9e', '#fff0a0', '#bfeabf', '#a9d8ff', '#d3bdff', '#ffc2e2', '#ffe0b8', '#c8f0ff', '#e0cfff'];
export const ROOMS = [];
[{ y: 220, cols: 2, x0: 590 }, { y: 400, cols: 4, x0: 380 }, { y: 580, cols: 2, x0: 590 }].forEach((row) => {
  for (let c = 0; c < row.cols; c++) {
    const i = ROOMS.length;
    ROOMS.push({ i, x: row.x0 + c * 210, y: row.y, w: 210, h: 180, color: ROOM_COLORS[i] });
  }
});

// Where characters may walk.
export const GROUND = { x0: 290, x1: 1330, y0: 815, y1: 880 };
// where a sleeper lies in a room's bunk bed (slot 0 = lower bunk, 1 = upper bunk)
export function bedSpot(r, slot = 0) {
  const bedLeft = r.i % 2 === 0;
  const bx = bedLeft ? r.x + 26 : r.x + r.w - 126;
  const fy = r.y + r.h - 22;
  const y = fy - 18 - (slot ? 54 : 0);
  return bedLeft ? { x: bx + 96, y, rot: -90 } : { x: bx + 6, y, rot: 90 };
}
export function roomBounds(r) {
  return { x0: r.x + 45, x1: r.x + r.w - 45, y0: r.y + r.h - 18, y1: r.y + r.h - 8 };
}

// ---- wardrobe pieces: 6 styles each, all recolourable ----
export const STYLE_COUNT = 6;   // styles everyone starts with
export const TOTAL_STYLES = 9;  // the last three of each kind are found on Treasure island

const star = (x, y, r, fill) =>
  `<path transform="translate(${x} ${y}) scale(${r / 9})" d="M0,-9 L2.5,-2.5 L9,0 L2.5,2.5 L0,9 L-2.5,2.5 L-9,0 L-2.5,-2.5Z" fill="${fill}"/>`;

const BODICE = `M-12,-74 L12,-74 L14,-58 L-14,-58 Z`;
const GOWN = `M-12,-74 L12,-74 L32,-14 Q0,-2 -32,-14 Z`;
const hem = `<path d="M-30,-18 Q0,-6 30,-18" stroke="#fff" stroke-width="4" fill="none" opacity=".6" stroke-linecap="round"/>`;
const sash = `<path d="M-13,-62 L13,-62 L14,-57 L-14,-57 Z" fill="#fff" opacity=".6"/>`;

export function dressSVG(style, c) {
  switch (style % TOTAL_STYLES) {
    case 1: // puffy party dress
      return `<path d="${BODICE}" fill="${c}"/>
        <path d="M-13,-58 C-42,-58 -40,-24 -27,-27 Q-18,-20 -9,-27 Q0,-20 9,-27 Q18,-20 27,-27 C40,-24 42,-58 13,-58 Z" fill="${c}"/>
        <path d="M-27,-27 Q-18,-20 -9,-27 Q0,-20 9,-27 Q18,-20 27,-27" stroke="#fff" stroke-width="3" fill="none" opacity=".6"/>${sash}`;
    case 2: // mermaid gown
      return `<path d="M-12,-74 L12,-74 L14,-44 Q16,-28 40,-6 Q0,-1 -40,-6 Q-16,-28 -14,-44 Z" fill="${c}"/>
        <path d="M-36,-9 Q0,-1 36,-9" stroke="#fff" stroke-width="4" fill="none" opacity=".6" stroke-linecap="round"/>${sash}`;
    case 3: // layered tutu
      return `<ellipse cx="0" cy="-32" rx="35" ry="10" fill="${c}" opacity=".75"/>
        <ellipse cx="0" cy="-41" rx="29" ry="10" fill="${c}" opacity=".88"/>
        <ellipse cx="0" cy="-50" rx="23" ry="9" fill="${c}"/>
        <path d="${BODICE}" fill="${c}"/>${sash}`;
    case 4: // sleeves and a big bow
      return `<path d="${GOWN}" fill="${c}"/>${hem}
        <circle cx="-14" cy="-68" r="8" fill="${c}"/><circle cx="14" cy="-68" r="8" fill="${c}"/>
        <path d="M0,-60 L-12,-68 L-12,-52 Z M0,-60 L12,-68 L12,-52 Z" fill="#fff"/><circle cx="0" cy="-60" r="3.5" fill="#fff"/>`;
    case 5: // starry gown
      return `<path d="${GOWN}" fill="${c}"/>${hem}${sash}
        ${star(-9, -42, 5, '#fff')}${star(11, -32, 4.5, '#fff')}${star(2, -52, 4, '#fff')}${star(-19, -24, 4, '#fff')}${star(19, -46, 3.5, '#fff')}`;
    case 6: { // lemon dress
      const lemon = (x, y, r = 0) => `<g transform="translate(${x} ${y}) rotate(${r})"><ellipse rx="6.5" ry="4.6" fill="#ffe14d" stroke="#e8b923" stroke-width=".8"/><path d="M3,-3 q4,-5 8,-3 q-3,5 -8,3Z" fill="#6edc8c"/></g>`;
      return `<path d="${GOWN}" fill="${c}"/>${hem}${sash}${lemon(-10, -44, 20)}${lemon(11, -34, -15)}${lemon(0, -58, 5)}${lemon(-20, -26, -10)}${lemon(20, -50, 25)}`;
    }
    case 7: // ocean waves
      return `<path d="${GOWN}" fill="${c}"/>${hem}${sash}<path d="M-22,-46 q5.5,-6 11,0 t11,0 t11,0 M-26,-34 q6,-6 12,0 t12,0 t12,0 M-30,-22 q6.5,-6 13,0 t13,0 t13,0" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/><path transform="translate(0 -56) scale(.5)" d="M0,-9 L2.5,-2.5 L9,0 L2.5,2.5 L0,9 L-2.5,2.5 L-9,0 L-2.5,-2.5Z" fill="#ffe14d"/>`;
    case 8: { // rainbow gown
      const w = (y) => 12 + (y + 74) / 3;
      const slices = RAINBOW.map((col, k) => {
        const y0 = -74 + k * 10, y1 = y0 + 10;
        return k < 5
          ? `<path d="M${-w(y0)},${y0} L${w(y0)},${y0} L${w(y1)},${y1} L${-w(y1)},${y1}Z" fill="${col}"/>`
          : `<path d="M${-w(y0)},${y0} L${w(y0)},${y0} L${w(y1)},${y1} Q0,-2 ${-w(y1)},${y1}Z" fill="${col}"/>`;
      }).join('');
      return `${slices}${hem}<path d="M-13,-62 L13,-62 L14,-57 L-14,-57 Z" fill="#fff" opacity=".6"/>`;
    }
    default: // classic ball gown
      return `<path d="${GOWN}" fill="${c}"/>${hem}${sash}`;
  }
}

// Foot drawn for the left foot at the origin; toes point to -x. The right foot is mirrored.
function foot(style, c) {
  switch (style % TOTAL_STYLES) {
    case 1: return `<path d="M8,-1 Q8,-9 0,-8 Q-8,-8 -17,-1 Q-6,2 8,-1Z" fill="${c}"/><circle cx="-1" cy="-6" r="2" fill="#fff" opacity=".8"/>`;
    case 2: return `<rect x="-6" y="-27" width="12" height="25" rx="4" fill="${c}"/><ellipse cx="-2" cy="-3" rx="10" ry="5" fill="${c}"/><rect x="-7" y="-28" width="14" height="6" rx="3" fill="#fff" opacity=".8"/>`;
    case 3: return `<ellipse cx="0" cy="-3" rx="9" ry="5" fill="${c}"/><circle cx="-3" cy="-7" r="3" fill="#fff"/><circle cx="3" cy="-7" r="3" fill="#fff"/><circle cx="0" cy="-7" r="1.6" fill="${c}"/>`;
    case 4: return `<ellipse cx="0" cy="-3" rx="8" ry="4" fill="${c}"/><rect x="4" y="-7" width="4" height="7" rx="2" fill="${c}"/><path d="M-6,-5 Q0,-12 6,-5" stroke="#fff" stroke-width="2" fill="none"/>`;
    case 5: return `<ellipse cx="0" cy="-3" rx="9" ry="5" fill="${c}"/>${star(0, -4, 3.6, '#fff')}`;
    case 6: return `<rect x="-6" y="-27" width="12" height="25" rx="4" fill="${c}"/><ellipse cx="-2" cy="-3" rx="10" ry="5" fill="${c}"/><rect x="-7" y="-28" width="14" height="6" rx="3" fill="#fff" opacity=".8"/>${star(0, -13, 3.8, '#fff')}${star(-2, -5, 2.6, '#fff')}`;
    case 7: return `<ellipse cx="0" cy="-4" rx="10.5" ry="6" fill="#fff"/><path d="M-9,-6 Q0,-13 9,-6" stroke="${c}" stroke-width="3" fill="none"/><rect x="-10.5" y="-2" width="21" height="4.5" rx="2.2" fill="${c}"/><circle cx="-3" cy="-8" r="1.3" fill="${c}"/><circle cx="2" cy="-9" r="1.3" fill="${c}"/>`;
    case 8: return `<ellipse cx="0" cy="-3" rx="9.5" ry="5.2" fill="#cdeeff" opacity=".9" stroke="${c}" stroke-width="1.6"/>${star(3, -4, 3.2, '#fff')}<ellipse cx="-3" cy="-5" rx="3" ry="1.2" fill="#fff" opacity=".7"/>`;
    default: return `<ellipse cx="0" cy="-3" rx="9" ry="5" fill="${c}"/>`;
  }
}
export function shoesSVG(style, c) {
  return `<g transform="translate(-9 0)">${foot(style, c)}</g><g transform="translate(9 0) scale(-1 1)">${foot(style, c)}</g>`;
}

export function tiaraSVG(style, c) {
  switch (style % TOTAL_STYLES) {
    case 1: // band with a big gem
      return `<path d="M-17,-99 Q0,-112 17,-99 L17,-104 Q0,-117 -17,-104Z" fill="${c}" stroke="#e8b923" stroke-width="1"/>
        <circle cx="0" cy="-111" r="5" fill="#ff6b8b" stroke="#fff" stroke-width="1.5"/>`;
    case 2: // flower crown
      return [[-15, -98], [-8, -105], [0, -108], [8, -105], [15, -98]].map(([x, y]) =>
        `<circle cx="${x - 3}" cy="${y}" r="3.4" fill="${c}"/><circle cx="${x + 3}" cy="${y}" r="3.4" fill="${c}"/><circle cx="${x}" cy="${y - 3.4}" r="3.4" fill="${c}"/><circle cx="${x}" cy="${y + 2}" r="3.4" fill="${c}"/><circle cx="${x}" cy="${y}" r="2.4" fill="#fff6a8"/>`).join('');
    case 3: // heart
      return `<path d="M-17,-99 Q0,-110 17,-99" stroke="${c}" stroke-width="3" fill="none"/>
        <path d="M0,-103 C-14,-111 -7,-124 0,-115 C7,-124 14,-111 0,-103Z" fill="${c}" stroke="#fff" stroke-width="1.5"/>`;
    case 4: // big star
      return `<path d="M-17,-99 Q0,-110 17,-99" stroke="${c}" stroke-width="3" fill="none"/>${star(0, -112, 13, c)}<circle cx="0" cy="-112" r="3" fill="#fff"/>`;
    case 5: // bow headband
      return `<path d="M-18,-97 Q0,-114 18,-97" stroke="${c}" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M11,-107 L23,-115 L23,-99 Z M11,-107 L-1,-115 L-1,-99 Z" fill="${c}"/><circle cx="11" cy="-107" r="3.5" fill="#fff"/>`;
    case 6: // pearl crown
      return `<path d="M-13,-103 L-9,-114 L-4,-106 L0,-118 L4,-106 L9,-114 L13,-103 Z" fill="${c}" stroke="#e8b923" stroke-width="1"/><circle cx="-9" cy="-114.5" r="3" fill="#fff" stroke="#e8dcd2" stroke-width=".8"/><circle cx="0" cy="-118.5" r="3.2" fill="#fff" stroke="#e8dcd2" stroke-width=".8"/><circle cx="9" cy="-114.5" r="3" fill="#fff" stroke="#e8dcd2" stroke-width=".8"/>${[-8, 0, 8].map((x) => `<circle cx="${x}" cy="-104.5" r="2" fill="#ff8fc7"/>`).join('')}`;
    case 7: // butterfly
      return `<path d="M-17,-97 Q0,-110 17,-97" stroke="${c}" stroke-width="3" fill="none"/><g transform="translate(0 -110)"><ellipse cx="-9" cy="-4" rx="9" ry="6.5" fill="${c}" transform="rotate(-20 -9 -4)"/><ellipse cx="9" cy="-4" rx="9" ry="6.5" fill="${c}" transform="rotate(20 9 -4)"/><ellipse cx="-6" cy="4" rx="6" ry="4.5" fill="${c}" opacity=".8" transform="rotate(25 -6 4)"/><ellipse cx="6" cy="4" rx="6" ry="4.5" fill="${c}" opacity=".8" transform="rotate(-25 6 4)"/><rect x="-1.6" y="-8" width="3.2" height="16" rx="1.6" fill="#6b4a7a"/></g>`;
    case 8: // rainbow halo
      return RAINBOW.map((col, i) => `<path d="M${-18 + i * 2.6},-98 A${18 - i * 2.6},${18 - i * 2.6} 0 0 1 ${18 - i * 2.6},-98" stroke="${col}" stroke-width="3" fill="none" stroke-linecap="round"/>`).join('') + `<circle cx="0" cy="-101" r="2.6" fill="${c}"/>`;
    default: // classic crown
      return `<path d="M-13,-103 L-9,-114 L-4,-106 L0,-118 L4,-106 L9,-114 L13,-103 Z" fill="${c}" stroke="#e8b923" stroke-width="1"/>`;
  }
}

export function defaultLook(p) {
  return {
    dress: p.dressStyle || 0, dressColor: p.dress, shoes: 0, shoesColor: p.shoes, tiara: p.tiaraStyle || 0, tiaraColor: p.tiara,
    hairStyle: p.hairStyle || 0, hairColor: p.hair, hairAcc: 0, hairAccColor: '#ff8fc7',
    lips: 0, lipsColor: '#ff6b8b', eyes: 0, eyesColor: '#a98bff', cheeks: 0, cheeksColor: '#ff8f9f',
  };
}

// ---- hair: 6 styles in any colour ----
const blend = (a, b, k) => {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const m = (sh) => Math.round(((pa >> sh) & 255) * (1 - k) + ((pb >> sh) & 255) * k);
  return `#${[16, 8, 0].map((sh) => m(sh).toString(16).padStart(2, '0')).join('')}`;
};
const highlight = (c) => blend(c, '#fff0d8', 0.4);

function hairBack(style, c, king) {
  const c2 = highlight(c);
  if (king && style % 6 === 0) return `<ellipse cx="0" cy="-94" rx="23" ry="23" fill="${c}"/>`; // the King's short hair
  switch (style % 6) {
    case 1: // wavy curls with a little tied-back tuft (Elsa's own)
      return `<path d="M-19,-104 Q-42,-100 -38,-76 Q-36,-62 -28,-60 Q-30,-80 -22,-90Z" fill="${c}"/>
  <ellipse cx="0" cy="-92" rx="27" ry="27" fill="${c}"/>
  <path d="M-27,-92 L-30,-58 Q-33,-46 -24,-43 Q-16,-36 -9,-44 Q-2,-36 5,-44 Q12,-36 19,-43 Q31,-46 30,-58 L27,-92Z" fill="${c}"/>
  ${[[-29, -84], [-31, -72], [-29, -60], [-27, -49], [29, -84], [31, -72], [29, -60], [27, -49]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6.5" fill="${c}"/>`).join('')}
  <path d="M-20,-98 Q-25,-72 -21,-52 M18,-99 Q24,-72 21,-50 M-6,-102 Q-11,-82 -9,-60 M8,-101 Q13,-80 10,-58 M-34,-92 Q-37,-78 -32,-66" stroke="${c2}" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".75"/>`;
    case 2: // short bob
      return `<ellipse cx="0" cy="-92" rx="26" ry="26" fill="${c}"/>
  <path d="M-26,-92 L-29,-70 Q-30,-60 -20,-60 L20,-60 Q30,-60 29,-70 L26,-92Z" fill="${c}"/>
  <path d="M-21,-98 Q-25,-80 -23,-66 M21,-98 Q25,-80 23,-66" stroke="${c2}" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".7"/>`;
    case 3: // pigtails
      return `<ellipse cx="0" cy="-92" rx="24" ry="25" fill="${c}"/>
  <path d="M-22,-98 Q-50,-92 -46,-62 Q-44,-42 -34,-44 Q-38,-64 -26,-84Z" fill="${c}"/>
  <path d="M22,-98 Q50,-92 46,-62 Q44,-42 34,-44 Q38,-64 26,-84Z" fill="${c}"/>
  <path d="M-42,-80 Q-44,-64 -39,-52 M42,-80 Q44,-64 39,-52" stroke="${c2}" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".7"/>
  <circle cx="-28" cy="-92" r="4" fill="#ff8fc7"/><circle cx="28" cy="-92" r="4" fill="#ff8fc7"/>`;
    case 4: // high ponytail
      return `<ellipse cx="0" cy="-92" rx="24" ry="25" fill="${c}"/>
  <path d="M4,-112 Q44,-136 56,-98 Q62,-62 42,-48 Q46,-76 32,-94 Q22,-106 4,-106Z" fill="${c}"/>
  <path d="M30,-116 Q50,-108 52,-84" stroke="${c2}" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".7"/>
  <circle cx="7" cy="-111" r="4.2" fill="#ff8fc7"/>`;
    case 5: // top bun and long hair
      return `<circle cx="0" cy="-122" r="12.5" fill="${c}"/><circle cx="-4" cy="-125" r="4" fill="${c2}" opacity=".6"/><ellipse cx="0" cy="-112" rx="11" ry="3" fill="#ff8fc7"/>
  <rect x="-24" y="-92" width="48" height="44" rx="16" fill="${c}"/><ellipse cx="0" cy="-92" rx="24" ry="25" fill="${c}"/>`;
    default: // long and straight
      return `<rect x="-24" y="-92" width="48" height="44" rx="16" fill="${c}"/>
  <ellipse cx="0" cy="-92" rx="24" ry="25" fill="${c}"/>`;
  }
}
function fringe(style, c, king) {
  const c2 = highlight(c);
  if (king && style % 6 === 0) return `<path d="M-19,-92 Q-22,-114 0,-113 Q22,-114 19,-92 Q15,-102 8,-101 Q0,-107 -8,-101 Q-15,-102 -19,-92Z" fill="${c}"/><path d="M-10,-108 Q0,-111 10,-108" stroke="${c2}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>`;
  switch (style % 6) {
    case 1:
      return `<path d="M-21,-90 Q-21,-113 4,-111 Q23,-109 22,-92 Q13,-103 -1,-100 Q-9,-97 -14,-88 Q-18,-85 -21,-90Z" fill="${c}"/>
  <path d="M-14,-106 Q-3,-110 12,-103 M-17,-98 Q-12,-103 -6,-102" stroke="${c2}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".85"/>
  <path d="M-19.5,-97 Q-24,-82 -19.5,-69 Q-15.5,-78 -16.5,-93Z M19.5,-97 Q24,-82 19.5,-69 Q15.5,-78 16.5,-93Z" fill="${c}"/>
  <circle cx="-21" cy="-100" r="3.2" fill="#fff" stroke="#e8dcd2" stroke-width="1"/>`;
    case 2: case 3:
      return `<path d="M-19,-90 Q-21,-112 0,-112 Q21,-112 19,-90 Q10,-98 0,-98 Q-10,-98 -19,-90Z" fill="${c}"/>`;
    default:
      return `<path d="M-17,-91 Q-9,-112 0,-103 Q9,-112 17,-91 Q9,-99 0,-95 Q-9,-99 -17,-91Z" fill="${c}"/>`;
  }
}
function hairAccSVG(style, c) {
  switch (style % 6) {
    case 1: return `<g transform="translate(15 -108)"><path d="M0,0 L-13,-8 L-13,8Z M0,0 L13,-8 L13,8Z" fill="${c}"/><circle r="3.4" fill="#fff"/></g>`;
    case 2: return `<g transform="translate(-14 -103)">${[0, 72, 144, 216, 288].map((a) => `<circle cx="${(Math.cos(a * Math.PI / 180) * 4.6).toFixed(1)}" cy="${(Math.sin(a * Math.PI / 180) * 4.6).toFixed(1)}" r="3.4" fill="${c}"/>`).join('')}<circle r="2.4" fill="#fff6a8"/></g>`;
    case 3: return `<path d="M-19,-96 Q0,-116 19,-96" stroke="${c}" stroke-width="4.4" fill="none" stroke-linecap="round"/>`;
    case 4: return [[-16, -102, -20], [15, -105, 20]].map(([x, y, r]) => `<g transform="translate(${x} ${y}) rotate(${r})"><ellipse cx="-4.5" cy="-2" rx="4.6" ry="3.4" fill="${c}"/><ellipse cx="4.5" cy="-2" rx="4.6" ry="3.4" fill="${c}"/><ellipse cx="-3" cy="2.4" rx="3" ry="2.2" fill="${c}" opacity=".8"/><ellipse cx="3" cy="2.4" rx="3" ry="2.2" fill="${c}" opacity=".8"/><rect x="-.9" y="-4.5" width="1.8" height="9" rx=".9" fill="#6b4a7a"/></g>`).join('');
    case 5: return star(-15, -103, 5.5, c) + star(14, -105, 5.5, c);
    default: return '';
  }
}

// ---- face: eyes, mouth and cheeks, plus makeup ----
const faceGeom = (p) => (p.face === 'elsa' ? { ex: 6.3, ey: -88.6, my: -79.6, cx: 11.5, cy: -82.5 } : { ex: 6, ey: -88, my: -80.5, cx: 10, cy: -83 });

function face(p) {
  if (p.face !== 'elsa') return `<circle cx="-6" cy="-88" r="2.3" fill="#3b2a4a"/>
  <circle cx="6" cy="-88" r="2.3" fill="#3b2a4a"/>
  <circle cx="-10" cy="-83" r="3" fill="#ff8fa8" opacity=".5"/>
  <circle cx="10" cy="-83" r="3" fill="#ff8fa8" opacity=".5"/>
  <path d="M-4,-82 Q0,-78 4,-82" stroke="#c4476e" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
  return `<path d="M-10,-96.4 Q-6.5,-98.4 -3,-96.6 M3,-96.6 Q6.5,-98.4 10,-96.4" stroke="#7a4a2c" stroke-width="1.5" fill="none" stroke-linecap="round" opacity=".85"/>
  <ellipse cx="-6.3" cy="-88.6" rx="3" ry="3.6" fill="#33201a"/><ellipse cx="6.3" cy="-88.6" rx="3" ry="3.6" fill="#33201a"/>
  <circle cx="-5.4" cy="-90" r="1.2" fill="#fff"/><circle cx="7.2" cy="-90" r="1.2" fill="#fff"/>
  <circle cx="-11.5" cy="-82.5" r="3.7" fill="#ff8f9f" opacity=".42"/><circle cx="11.5" cy="-82.5" r="3.7" fill="#ff8f9f" opacity=".42"/>
  <path d="M-1.3,-84 Q0,-82.6 1.3,-84" stroke="#d6967a" stroke-width="1.1" fill="none" stroke-linecap="round"/>
  <path d="M-3.4,-79.6 Q0,-77 3.4,-79.6" stroke="#c9566f" stroke-width="1.7" fill="none" stroke-linecap="round"/>`;
}

function lipsSVG(style, c, g) {
  const y = g.my;
  switch (style % 6) {
    case 1: return `<path d="M-4.8,${y} Q-2.4,${y - 2.8} 0,${y - 1.6} Q2.4,${y - 2.8} 4.8,${y} Q0,${y + 4.6} -4.8,${y}Z" fill="${c}"/>`;
    case 2: return `<path d="M-4.8,${y} Q-2.4,${y - 2.8} 0,${y - 1.6} Q2.4,${y - 2.8} 4.8,${y} Q0,${y + 4.6} -4.8,${y}Z" fill="${c}"/><ellipse cx="-1.6" cy="${y + 1}" rx="2" ry=".8" fill="#fff" opacity=".85"/>`;
    case 3: return `<path transform="translate(0 ${y + 0.6}) scale(.6)" d="M0,9 C-16,-2 -8,-14 0,-6 C8,-14 16,-2 0,9Z" fill="${c}"/>`;
    case 4: return `<path d="M-6.8,${y - 1.4} Q0,${y + 6} 6.8,${y - 1.4}" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    case 5: return `<ellipse cx="0" cy="${y + 0.6}" rx="3.2" ry="2.5" fill="${c}"/><ellipse cx="-.9" cy="${y - 0.2}" rx="1" ry=".6" fill="#fff" opacity=".75"/>`;
    default: return '';
  }
}
function eyesSVG(style, c, g) {
  const { ex, ey } = g;
  switch (style % 6) {
    case 1: return [-1, 1].map((sg) => `<ellipse cx="${sg * ex}" cy="${ey - 6.6}" rx="5.2" ry="2.5" fill="${c}" opacity=".65"/>`).join('');
    case 2: return [-1, 1].map((sg) => `<ellipse cx="${sg * ex}" cy="${ey - 6.6}" rx="5.2" ry="2.5" fill="${c}" opacity=".65"/>${[[-2.6, -7.2], [0, -8.4], [2.6, -7]].map(([dx, dy]) => `<circle cx="${sg * ex + dx}" cy="${ey + dy}" r=".8" fill="#fff"/>`).join('')}`).join('');
    case 3: return [-1, 1].map((sg) => `<path d="M${sg * (ex - 4.2)},${ey - 2.4} Q${sg * ex},${ey - 6.6} ${sg * (ex + 4)},${ey - 3.4} L${sg * (ex + 7.2)},${ey - 6.2}" stroke="${c}" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
    case 4: return [-1, 1].map((sg) => ['#ff6b8b', '#ffd23f', '#5cc8ff'].map((col, i) => `<ellipse cx="${sg * ex}" cy="${ey - 5.6 - i * 1.7}" rx="${5.2 - i * 0.5}" ry="1.1" fill="${col}" opacity=".85"/>`).join('')).join('');
    case 5: return [-1, 1].map((sg) => star(sg * (ex + 7), ey + 0.5, 3.4, c)).join('');
    default: return '';
  }
}
function cheeksSVG(style, c, g) {
  const { cx, cy } = g;
  switch (style % 6) {
    case 1: return [-1, 1].map((sg) => `<circle cx="${sg * cx}" cy="${cy}" r="5.4" fill="${c}" opacity=".55"/>`).join('');
    case 2: return [[-8, -83.8], [-4.8, -82.6], [-11.4, -80.8], [8, -83.8], [4.8, -82.6], [11.4, -80.8], [-7, -80.6], [7, -80.6]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1" fill="${c}" opacity=".9"/>`).join('');
    case 3: return [-1, 1].map((sg) => star(sg * (cx + 2), cy - 3, 3.4, c) + `<circle cx="${sg * (cx + 2) - 0.6}" cy="${cy - 3.6}" r=".7" fill="#fff"/>`).join('');
    case 4: return `<path transform="translate(${cx} ${cy}) scale(.55)" d="M0,9 C-16,-2 -8,-14 0,-6 C8,-14 16,-2 0,9Z" fill="${c}"/>`;
    case 5: return ['#ff6b8b', '#ffd23f', '#5cc8ff'].map((col, i) => `<path d="M${cx - 5 + i * 1.4},${cy + 3} A${5 - i * 1.4},${5 - i * 1.4} 0 0 1 ${cx + 5 - i * 1.4},${cy + 3}" stroke="${col}" stroke-width="1.5" fill="none" stroke-linecap="round"/>`).join('');
    default: return '';
  }
}

// the King's tunic with trousers (three styles: caped, striped, starry) and his beard; Sara's pearl necklace
const pearls = `<path d="M-9,-73 Q0,-65 9,-73" stroke="#fff" stroke-width="3.4" fill="none" stroke-dasharray="0.1 4.4" stroke-linecap="round"/>`;
const beard = (c) => `<path d="M-17,-88 Q-19,-66 0,-64 Q19,-66 17,-88 Q12,-77 0,-76.5 Q-12,-77 -17,-88Z" fill="${c}"/><path d="M-9,-83 Q-4,-86.5 0,-84 Q4,-86.5 9,-83 Q4,-81 0,-82.6 Q-4,-81 -9,-83Z" fill="${c}"/>`;
function kingOutfit(style, c) {
  const st = style % 3;
  const cape = st === 0 ? `<path d="M-14,-74 L-27,-16 Q0,-8 27,-16 L14,-74Z" fill="#d6455d"/>` : '';
  const extra = st === 1 ? [-60, -50, -40].map((y) => `<rect x="-16" y="${y}" width="32" height="4" fill="#fff" opacity=".55"/>`).join('')
    : st === 2 ? star(-8, -56, 4.5, '#fff') + star(9, -46, 4, '#fff') + star(-4, -38, 3.5, '#fff') : '';
  return `${cape}<rect x="-12" y="-32" width="11" height="29" rx="4" fill="#5a4a8c"/><rect x="1" y="-32" width="11" height="29" rx="4" fill="#5a4a8c"/>
    <path d="M-14,-74 L14,-74 L17,-30 L-17,-30Z" fill="${c}"/>${extra}
    <rect x="-17" y="-42" width="34" height="6" fill="#7a4a2c"/><rect x="-3.5" y="-43" width="7" height="8" rx="1.5" fill="#ffd84d"/>
    <path d="M-15,-74 Q0,-66 15,-74 L15,-69 Q0,-61 -15,-69Z" fill="#fff"/>${[-9, 0, 9].map((x) => `<circle cx="${x}" cy="${-67 + (x === 0 ? 1.5 : 0)}" r="1.1" fill="#4a3a5a"/>`).join('')}`;
}

export function princessSVG(p, look) {
  const l = { ...defaultLook(p), ...(look || {}) };
  const g = faceGeom(p);
  return `<g class="body">
  <rect x="-10" y="-22" width="6" height="20" rx="3" fill="${p.skin}"/>
  <rect x="4" y="-22" width="6" height="20" rx="3" fill="${p.skin}"/>
  ${shoesSVG(l.shoes, l.shoesColor)}
  ${hairBack(l.hairStyle, l.hairColor, p.king)}
  ${p.king ? kingOutfit(l.dress, l.dressColor) : dressSVG(l.dress, l.dressColor)}${p.queen ? pearls : ''}
  <path d="M-11,-70 Q-27,-58 -22,-42" stroke="${p.skin}" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M11,-70 Q27,-58 22,-42" stroke="${p.skin}" stroke-width="6" fill="none" stroke-linecap="round"/>
  ${p.face === 'elsa' ? `<path d="M0,-107 C11,-107 18.5,-99 18.5,-89 C18.5,-79 12,-72 0,-71.5 C-12,-72 -18.5,-79 -18.5,-89 C-18.5,-99 -11,-107 0,-107Z" fill="${p.skin}"/>` : `<circle cx="0" cy="-90" r="17" fill="${p.skin}"/>`}
  ${fringe(l.hairStyle, l.hairColor, p.king)}
  ${face(p)}${p.king ? beard(l.hairColor) : ''}
  ${cheeksSVG(l.cheeks, l.cheeksColor, g)}${eyesSVG(l.eyes, l.eyesColor, g)}${lipsSVG(l.lips, l.lipsColor, g)}
  ${hairAccSVG(l.hairAcc, l.hairAccColor)}
  ${tiaraSVG(l.tiara, l.tiaraColor)}
</g>`;
}

// A princess sitting on a unicorn's back (legs hidden by the clip, which the caller defines).
export function riderSVG(p, look, clipId = 'riderclip', scale = 0.66) {
  return `<g class="rider" transform="translate(-4 ${(-40 + (scale - 0.66) * 20).toFixed(1)}) scale(${scale})" clip-path="url(#${clipId})">${princessSVG(p, look)}</g>`;
}

// Unicorns face right; the caller flips them.
// ---- unicorn styling: coat pattern + colour, mane/tail colours, and an extra ----
export const MANE_SETS = [
  RAINBOW,
  ['#ffb3d9', '#ff8fc7', '#c9b0ff', '#9fd8ff', '#c9b0ff', '#ff8fc7'],   // cotton candy
  ['#5cc8ff', '#4fd8c8', '#6edc8c', '#9fe8ff', '#5cc8ff', '#8fa8ff'],   // ocean
  ['#ffd23f', '#ffe27a', '#ffb02e', '#fff3a0', '#ffd23f', '#ffcc66'],   // golden
  ['#ff6b8b', '#ff9a5c', '#ffd23f', '#ff6b8b', '#ff9a5c', '#ffd23f'],   // fire
  ['#a98bff', '#7a6bd8', '#5c4ad0', '#c9b0ff', '#a98bff', '#8fa8ff'],   // night
];

export function defaultUnicornLook(u) {
  return { coat: 0, coatColor: u.body, mane: 0, extra: 0, extraColor: '#ff8fc7' };
}

function coatPattern(style) {
  switch (style % STYLE_COUNT) {
    case 1: return [[-26, -60, 6], [0, -46, 5], [24, -62, 6.5], [-8, -70, 4.5], [18, -44, 5], [-34, -46, 4]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffb3d9" opacity=".75"/>`).join('');
    case 2: return [[-28, -58], [-4, -66], [20, -52], [-16, -44], [32, -66], [4, -50]].map(([x, y], i) => star(x, y, 5.5 - (i % 2), '#ffd23f')).join('');
    case 3: return RAINBOW.slice(0, 5).map((c, i) => `<path d="M${-34 + i * 15},-72 L${-24 + i * 15},-38" stroke="${c}" stroke-width="5" stroke-linecap="round" opacity=".6"/>`).join('');
    case 4: return [[-26, -58], [2, -64], [24, -50], [-8, -46]].map(([x, y]) => `<path transform="translate(${x} ${y}) scale(.8)" d="M0,9 C-16,-2 -8,-14 0,-6 C8,-14 16,-2 0,9Z" fill="#ff6b8b" opacity=".8"/>`).join('');
    case 5: return [[-30, -52, '#a98bff'], [-14, -68, '#ffd23f'], [4, -52, '#5cc8ff'], [18, -66, '#ff8fc7'], [32, -50, '#ffd23f'], [-4, -42, '#6edc8c']].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="${c}"/>`).join('');
    default: return '';
  }
}

function unicornExtra(style, c) {
  switch (style % STYLE_COUNT) {
    case 1: // saddle blanket
      return { over: `<path d="M-32,-78 Q-4,-90 24,-78 L26,-48 Q-4,-40 -34,-48Z" fill="${c}"/><path d="M-32,-52 q6,8 12,0 t12,0 t12,0 t12,0 t12,0" stroke="#fff" stroke-width="3.5" fill="none" opacity=".8"/>${star(-4, -66, 6, '#fff')}` };
    case 2: // flower garland
      return { top: [[30, -58], [38, -70], [46, -82], [54, -94], [60, -104]].map(([x, y]) => `<g transform="translate(${x} ${y})">${[0, 72, 144, 216, 288].map((a) => `<circle cx="${(Math.cos(a * Math.PI / 180) * 5).toFixed(1)}" cy="${(Math.sin(a * Math.PI / 180) * 5).toFixed(1)}" r="3.6" fill="${c}"/>`).join('')}<circle r="2.6" fill="#fff6a8"/></g>`).join('') };
    case 3: // big bow on the tail
      return { top: `<g transform="translate(-44 -64)"><path d="M0,0 L-16,-9 L-16,9Z M0,0 L16,-9 L16,9Z" fill="${c}"/><circle r="4.5" fill="#fff"/></g>` };
    case 4: // jewelled horn ring
      return { top: `<g transform="rotate(-12 73 -112)"><ellipse cx="73" cy="-112" rx="10" ry="3.4" fill="#ffd84d" stroke="#e8b923" stroke-width="1.2"/><circle cx="73" cy="-113" r="3.4" fill="${c}" stroke="#fff" stroke-width="1"/></g>` };
    case 5: // sparkly anklets
      return { legs: [-36, -20, 14, 30].map((x) => `<rect x="${x - 1}" y="-18" width="13" height="5" rx="2.5" fill="${c}"/>`).join('') };
    default: return {};
  }
}

export function unicornSVG(u, look) {
  const l = { ...defaultUnicornLook(u), ...(look || {}) };
  const bc = l.coatColor;
  const hoof = bc === u.body ? u.hoof : '#ffc9e6';
  const cols = MANE_SETS[l.mane % MANE_SETS.length];
  const ex = unicornExtra(l.extra, l.extraColor);
  const tail = cols.map((c, i) => `<path d="M-40,-62 Q${-80 - i * 2},${-66 + i * 4} ${-72 + i * 3},${-18 + i * 3}" stroke="${c}" stroke-width="7" fill="none" stroke-linecap="round" opacity=".95"/>`).join('');
  const mane = cols.map((c, i) => `<circle cx="${52 - i * 4}" cy="${-108 + i * 11}" r="${9 - (i % 2)}" fill="${c}"/>`).join('');
  return `<g class="body">
  ${tail}
  <rect x="-36" y="-40" width="11" height="38" rx="5" fill="${bc}" stroke="#e7d6f5" stroke-width="1.5"/>
  <rect x="-20" y="-38" width="11" height="36" rx="5" fill="${bc}" stroke="#e7d6f5" stroke-width="1.5"/>
  <rect x="14" y="-38" width="11" height="36" rx="5" fill="${bc}" stroke="#e7d6f5" stroke-width="1.5"/>
  <rect x="30" y="-40" width="11" height="38" rx="5" fill="${bc}" stroke="#e7d6f5" stroke-width="1.5"/>
  <rect x="-36" y="-8" width="11" height="7" rx="3" fill="${hoof}"/>
  <rect x="-20" y="-8" width="11" height="7" rx="3" fill="${hoof}"/>
  <rect x="14" y="-8" width="11" height="7" rx="3" fill="${hoof}"/>
  <rect x="30" y="-8" width="11" height="7" rx="3" fill="${hoof}"/>
  ${ex.legs || ''}
  <ellipse cx="0" cy="-54" rx="48" ry="25" fill="${bc}" stroke="#e7d6f5" stroke-width="1.5"/>
  ${coatPattern(l.coat)}
  ${ex.over || ''}
  <path d="M28,-68 L48,-106 L70,-92 L50,-48 Z" fill="${bc}"/>
  ${mane}
  <ellipse cx="68" cy="-98" rx="23" ry="17" fill="${bc}" stroke="#e7d6f5" stroke-width="1.5" transform="rotate(-12 68 -98)"/>
  <ellipse cx="84" cy="-92" rx="10" ry="8" fill="#ffe9f3"/>
  <path d="M56,-110 L58,-128 L68,-113 Z" fill="${bc}" stroke="#e7d6f5" stroke-width="1.5"/>
  <path d="M69,-112 L80,-152 L82,-108 Z" fill="#ffd84d" stroke="#e8b923" stroke-width="1.2"/>
  <path d="M72,-124 L80,-121 M71,-134 L80,-131 M74,-114 L81,-112" stroke="#fff3b0" stroke-width="2"/>
  <circle cx="72" cy="-100" r="3.2" fill="#3b2a4a"/>
  <circle cx="73" cy="-101" r="1.1" fill="#fff"/>
  <circle cx="86" cy="-92" r="1.6" fill="#d98aa8"/>
  <circle cx="62" cy="-90" r="4" fill="#ff8fa8" opacity=".4"/>
  ${ex.top || ''}
</g>`;
}

function cloud(x, y, s, d) {
  return `<g class="cloud" style="animation-delay:${d}s" transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="0" cy="0" rx="70" ry="26" fill="#fff" opacity=".9"/>
    <circle cx="-25" cy="-18" r="26" fill="#fff" opacity=".9"/>
    <circle cx="20" cy="-24" r="32" fill="#fff" opacity=".9"/></g>`;
}

function flower(x, y, c) {
  return `<g transform="translate(${x} ${y})"><line x1="0" y1="0" x2="0" y2="14" stroke="#4fb86a" stroke-width="3"/>
    ${[0, 72, 144, 216, 288].map(a => `<circle cx="${Math.cos(a * Math.PI / 180) * 6}" cy="${Math.sin(a * Math.PI / 180) * 6}" r="4.5" fill="${c}"/>`).join('')}
    <circle r="3.5" fill="#fff6a8"/></g>`;
}

// a bunk bed, 100 wide: two mattresses with rainbow blankets, pillows, posts and a little ladder
function bunk(bx, fy, bedLeft, i) {
  const pil = bedLeft ? bx + 8 : bx + 46;
  const blk = bedLeft ? bx + 44 : bx + 6;
  const lad = bedLeft ? bx - 16 : bx + 105;
  const bed = (y, col) => `<rect x="${bx + 4}" y="${y}" width="92" height="14" rx="6" fill="#fff"/><rect x="${pil}" y="${y - 9}" width="46" height="14" rx="7" fill="#fff" stroke="#f0e6f6" stroke-width="1.5"/><rect x="${blk}" y="${y - 4}" width="50" height="16" rx="6" fill="${col}" opacity=".9"/>`;
  return `<rect x="${bx}" y="${fy - 112}" width="7" height="112" rx="3" fill="#d9b48f"/><rect x="${bx + 93}" y="${fy - 112}" width="7" height="112" rx="3" fill="#d9b48f"/>
    ${bed(fy - 30, RAINBOW[i % 6])}${bed(fy - 84, RAINBOW[(i + 3) % 6])}
    <rect x="${bx + 2}" y="${fy - 100}" width="96" height="5" rx="2.5" fill="#e8c9a6"/>
    <path d="M${lad},${fy - 86} V${fy} M${lad + 11},${fy - 86} V${fy}" stroke="#d9b48f" stroke-width="4" stroke-linecap="round"/>${[-70, -50, -30, -10].map((dy) => `<path d="M${lad},${fy + dy} H${lad + 11}" stroke="#d9b48f" stroke-width="3.5" stroke-linecap="round"/>`).join('')}`;
}

function room(r) {
  const bedLeft = r.i % 2 === 0;
  const bx = bedLeft ? r.x + 26 : r.x + r.w - 126;
  const wx = r.x + r.w / 2 - 24;
  const fy = r.y + r.h - 22;
  const lampX = bedLeft ? r.x + r.w - 28 : r.x + 28;
  return `<g>
    <rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="${r.color}"/>
    <rect x="${r.x}" y="${fy}" width="${r.w}" height="22" fill="#ffffff" opacity=".45"/>
    <path d="M${wx},${r.y + 100} V${r.y + 56} a24,24 0 0 1 48,0 V${r.y + 100} Z" fill="#dff3ff" stroke="#fff" stroke-width="5"/>
    <path d="M${wx + 24},${r.y + 32} V${r.y + 100} M${wx},${r.y + 72} H${wx + 48}" stroke="#fff" stroke-width="3"/>
    ${bunk(bx, fy, bedLeft, r.i)}
    <path d="M${lampX},${fy} v-46" stroke="#fff" stroke-width="4"/>
    <circle cx="${lampX}" cy="${fy - 54}" r="10" fill="#fff6a8"/>
    <rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="none" stroke="#fff" stroke-width="6"/>
  </g>`;
}

// The special rooms: hairdressing and makeup in the top corners, the bathroom (teeth brushing) bottom right and the kitchen (salads) bottom left.
export const SALONS = [
  { i: 'hair', salon: true, x: 380, y: 220, w: 210, h: 180 },
  { i: 'makeup', salon: true, x: 1010, y: 220, w: 210, h: 180 },
  { i: 'bath', salon: true, x: 1010, y: 580, w: 210, h: 180 },
  { i: 'kitchen', salon: true, x: 380, y: 580, w: 210, h: 180 },
];

function salonRoom(r) {
  const fy = r.y + r.h - 22;
  const cx = r.x + r.w / 2;
  const hair = r.i === 'hair';
  const bath = r.i === 'bath';
  const kitchen = r.i === 'kitchen';
  const props = kitchen
    ? `<path d="M${r.x + 120},${r.y + 100} V${r.y + 50} a30,30 0 0 1 60,0 V${r.y + 100} Z" fill="#dff3ff" stroke="#fff" stroke-width="5"/><path d="M${r.x + 150},${r.y + 20} V${r.y + 100}" stroke="#fff" stroke-width="3"/>
       <rect x="${r.x + 14}" y="${r.y + 22}" width="86" height="40" rx="6" fill="#ffd9a8" stroke="#fff" stroke-width="3"/><circle cx="${r.x + 57}" cy="${r.y + 42}" r="4" fill="#fff"/><path d="M${r.x + 57},${r.y + 22} v40" stroke="#fff" stroke-width="2"/>
       <rect x="${r.x + 8}" y="${fy - 54}" width="194" height="54" rx="6" fill="#ffc78a"/><rect x="${r.x + 4}" y="${fy - 60}" width="202" height="10" rx="5" fill="#fff"/>
       <rect x="${r.x + 120}" y="${fy - 46}" width="64" height="40" rx="5" fill="#8a7bd8"/>
       <circle cx="${r.x + 134}" cy="${fy - 38}" r="5" fill="#fff"/><circle cx="${r.x + 152}" cy="${fy - 38}" r="5" fill="#fff"/><circle cx="${r.x + 170}" cy="${fy - 38}" r="5" fill="#fff"/>
       <g transform="translate(${r.x + 52} ${fy - 60})"><path d="M-26,0 q0,-20 26,-20 q26,0 26,20Z" fill="#fff" stroke="#6edc8c" stroke-width="3"/><circle cx="-10" cy="-14" r="7" fill="#6edc8c"/><circle cx="6" cy="-17" r="7" fill="#ff6b8b"/><circle cx="16" cy="-9" r="6" fill="#ffd23f"/><circle cx="-2" cy="-6" r="5" fill="#a98bff"/></g>
       <g transform="translate(${r.x + 152} ${fy - 60})"><rect x="-20" y="-20" width="40" height="20" rx="4" fill="#ff8fc7"/><rect x="-24" y="-24" width="48" height="6" rx="3" fill="#fff"/></g>
       <path d="M${r.x + 24},${r.y + 82} v14 M${r.x + 50},${r.y + 82} v14 M${r.x + 76},${r.y + 82} v14" stroke="#c9a0ff" stroke-width="3"/>`
    : bath
    ? `<rect x="${r.x + 18}" y="${r.y + 26}" width="76" height="86" rx="10" fill="#fff" stroke="#8fd3ff" stroke-width="5"/><rect x="${r.x + 26}" y="${r.y + 34}" width="60" height="70" rx="6" fill="#eaf6ff"/><path d="M${r.x + 34},${r.y + 48} L${r.x + 52},${r.y + 40}" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
       <rect x="${r.x + 22}" y="${fy - 54}" width="68" height="20" rx="8" fill="#fff"/><rect x="${r.x + 30}" y="${fy - 36}" width="52" height="36" rx="6" fill="#bfe3ff"/>
       <g transform="translate(${r.x + 128} ${fy})"><rect x="-4" y="-76" width="8" height="76" rx="3" fill="#c9a0ff"/><rect x="-28" y="-72" width="56" height="12" rx="6" fill="#fff"/><g transform="translate(-14 -72) rotate(-14)"><rect x="-3" y="-34" width="6" height="34" rx="3" fill="#ff6b8b"/><rect x="-5" y="-42" width="10" height="12" rx="3" fill="#fff"/></g><g transform="translate(14 -72) rotate(12)"><rect x="-3" y="-34" width="6" height="34" rx="3" fill="#5cc8ff"/><rect x="-5" y="-42" width="10" height="12" rx="3" fill="#fff"/></g></g>
       <g transform="translate(${r.x + 176} ${fy})"><rect x="-10" y="-52" width="20" height="52" rx="6" fill="#ff8fc7"/><rect x="-6" y="-60" width="12" height="10" rx="3" fill="#fff"/><rect x="-8" y="-36" width="16" height="12" rx="3" fill="#fff"/></g>
       ${Array.from({ length: 4 }, (_, k) => `<circle cx="${r.x + 110 + k * 22}" cy="${r.y + 40 + (k % 2) * 14}" r="${6 - k}" fill="#fff" stroke="#bfe3ff" stroke-width="1.5"/>`).join('')}`
    : hair
    ? `<ellipse cx="${cx}" cy="${r.y + 74}" rx="52" ry="60" fill="#fff" stroke="#ffb3d9" stroke-width="5"/><ellipse cx="${cx}" cy="${r.y + 74}" rx="44" ry="52" fill="#eaf6ff"/><path d="M${cx - 28},${r.y + 52} Q${cx - 16},${r.y + 36} ${cx},${r.y + 34}" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity=".9"/>
       <g transform="translate(${r.x + 36} ${r.y + 40})"><circle cx="-9" cy="14" r="8" fill="none" stroke="#ff6b8b" stroke-width="4"/><circle cx="9" cy="14" r="8" fill="none" stroke="#ff6b8b" stroke-width="4"/><path d="M-6,8 L12,-16 M6,8 L-12,-16" stroke="#c9b0ff" stroke-width="5" stroke-linecap="round"/></g>
       <rect x="${cx - 34}" y="${fy - 40}" width="68" height="18" rx="9" fill="#ff8fc7"/><rect x="${cx - 30}" y="${fy - 96}" width="60" height="58" rx="18" fill="#ff8fc7"/><rect x="${cx - 24}" y="${fy - 90}" width="48" height="46" rx="14" fill="#ffb3d9"/><rect x="${cx - 5}" y="${fy - 24}" width="10" height="24" fill="#c9a0ff"/><ellipse cx="${cx}" cy="${fy}" rx="26" ry="6" fill="#c9a0ff"/>
       <g transform="translate(${r.x + 168} ${fy - 14})"><rect x="-6" y="-34" width="12" height="34" rx="4" fill="#5cc8ff"/><rect x="10" y="-26" width="12" height="26" rx="4" fill="#6edc8c"/><rect x="-22" y="-22" width="12" height="22" rx="4" fill="#ffd23f"/></g>`
    : `<circle cx="${cx}" cy="${r.y + 70}" r="46" fill="#fff" stroke="#ffd1e8" stroke-width="4"/><circle cx="${cx}" cy="${r.y + 70}" r="38" fill="#eaf6ff"/><path d="M${cx - 22},${r.y + 56} Q${cx - 12},${r.y + 44} ${cx + 2},${r.y + 42}" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity=".9"/>
       ${Array.from({ length: 12 }, (_, k) => `<circle cx="${(cx + Math.cos(k / 12 * Math.PI * 2) * 52).toFixed(1)}" cy="${(r.y + 70 + Math.sin(k / 12 * Math.PI * 2) * 52).toFixed(1)}" r="4.2" fill="#fff3a0" stroke="#ffd96a" stroke-width="1.2"/>`).join('')}
       <rect x="${r.x + 16}" y="${fy - 40}" width="178" height="12" rx="6" fill="#fff"/><rect x="${r.x + 28}" y="${fy - 28}" width="8" height="28" fill="#fff"/><rect x="${r.x + 174}" y="${fy - 28}" width="8" height="28" fill="#fff"/>
       <g transform="translate(${r.x + 44} ${fy - 40})"><rect x="-4" y="-26" width="8" height="26" rx="2" fill="#ff6b8b"/><path d="M-4,-26 L4,-26 L2,-36 L-2,-36Z" fill="#ffb3c7"/></g>
       <g transform="translate(${r.x + 66} ${fy - 40})"><rect x="-4" y="-22" width="8" height="22" rx="2" fill="#a98bff"/><path d="M-4,-22 L4,-22 L2,-31 L-2,-31Z" fill="#dcc9ff"/></g>
       <g transform="translate(${r.x + 148} ${fy - 40})"><rect x="-9" y="-16" width="18" height="16" rx="4" fill="#fff6a8" stroke="#ffd96a" stroke-width="2"/><path d="M-5,-16 V-34 M0,-16 V-38 M5,-16 V-33" stroke="#ff9a5c" stroke-width="3.4" stroke-linecap="round"/></g>
       <ellipse cx="${r.x + 110}" cy="${fy - 40}" rx="17" ry="7" fill="#ffd1e8" stroke="#fff" stroke-width="2"/><circle cx="${r.x + 110}" cy="${fy - 43}" r="6" fill="#ff8fc7"/>`;
  return `<g class="salon" data-salon="${r.i}" style="cursor:pointer">
    <rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="${kitchen ? '#fff0c8' : bath ? '#cdeeff' : hair ? '#ffd0e6' : '#e0d2ff'}"/>
    <rect x="${r.x}" y="${fy}" width="${r.w}" height="22" fill="#ffffff" opacity=".45"/>
    ${props}
    <rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="none" stroke="#fff" stroke-width="6"/>
    <rect class="salon-glow" x="${r.x + 4}" y="${r.y + 4}" width="${r.w - 8}" height="${r.h - 8}" rx="6" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="14 10"/>
    <rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="transparent"/>
  </g>`;
}

export function sceneSVG() {
  const rainbowArcs = RAINBOW.map((c, i) => {
    const rad = 760 - i * 26;
    return `<path d="M${800 - rad},800 A${rad},${rad} 0 0 1 ${800 + rad},800" stroke="${c}" stroke-width="28" fill="none" opacity=".75"/>`;
  }).join('');
  const merlon = (x, y) => `<rect x="${x}" y="${y}" width="24" height="18" rx="4" fill="#efe0ff"/>`;
  const battlements = Array.from({ length: 21 }, (_, i) => merlon(384 + i * 40, 186)).join('');
  const towerWin = (x, y) => `<path d="M${x},${y + 36} v-22 a12,12 0 0 1 24,0 v22 Z" fill="#a9d8ff" stroke="#fff" stroke-width="3"/>`;

  return `
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#bfe3ff"/><stop offset=".6" stop-color="#ffe3f4"/><stop offset="1" stop-color="#fff3d6"/>
    </linearGradient>
    <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#9ee6a6"/><stop offset="1" stop-color="#6fd08c"/>
    </linearGradient>
    <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#9fe3ff"/><stop offset="1" stop-color="#6fc3f5"/>
    </linearGradient>
    <clipPath id="riderclip"><rect x="-60" y="-200" width="120" height="184"/></clipPath>
    <clipPath id="waterclip"><rect x="-150" y="-300" width="300" height="278"/></clipPath>
    <linearGradient id="roofbow" x1="0" y1="0" x2="0" y2="1">
      ${RAINBOW.map((c, i) => `<stop offset="${i / 5}" stop-color="${c}"/>`).join('')}
    </linearGradient>
  </defs>
  <g id="castleScene">
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <g id="sunC"><circle cx="1400" cy="130" r="64" fill="#fff3a0"/><circle cx="1400" cy="130" r="86" fill="#fff3a0" opacity=".35"/></g>
  ${rainbowArcs}
  ${cloud(220, 150, 1.1, 0)}${cloud(1180, 90, .9, -6)}${cloud(620, 70, .8, -12)}${cloud(1480, 300, .7, -3)}
  <ellipse cx="200" cy="800" rx="420" ry="130" fill="#b8efc0"/>
  <ellipse cx="1400" cy="810" rx="440" ry="140" fill="#aee9b8"/>

  <!-- castle -->
  <path d="M380,200 H1220 V780 H380 Z" fill="#f0e2ff" stroke="#fff" stroke-width="6" stroke-linejoin="round"/>
  ${battlements}
  <g>
    <rect x="290" y="170" width="90" height="610" rx="8" fill="#f6e8ff" stroke="#fff" stroke-width="5"/>
    <polygon points="276,172 394,172 335,30" fill="#ff8fc7"/>
    <line x1="335" y1="30" x2="335" y2="-6" stroke="#fff" stroke-width="4"/><polygon points="335,-6 372,6 335,18" fill="#ffd23f"/>
    ${towerWin(323, 230)}${towerWin(323, 420)}${towerWin(323, 610)}
    <rect x="1220" y="170" width="90" height="610" rx="8" fill="#f6e8ff" stroke="#fff" stroke-width="5"/>
    <polygon points="1206,172 1324,172 1265,30" fill="#5cc8ff"/>
    <line x1="1265" y1="30" x2="1265" y2="-6" stroke="#fff" stroke-width="4"/><polygon points="1265,-6 1228,6 1265,18" fill="#ff6b8b"/>
    ${towerWin(1253, 230)}${towerWin(1253, 420)}${towerWin(1253, 610)}
  </g>
  <polygon points="560,204 1040,204 800,40" fill="url(#roofbow)" stroke="#fff" stroke-width="5" stroke-linejoin="round"/>
  <line x1="800" y1="40" x2="800" y2="-10" stroke="#fff" stroke-width="5"/><polygon points="800,-10 850,6 800,22" fill="#ffd23f"/>
  <circle cx="800" cy="120" r="22" fill="#fff" opacity=".85"/><path d="M800,106 l4,9 10,1 -8,7 3,10 -9,-6 -9,6 3,-10 -8,-7 10,-1Z" fill="#ffd84d"/>

  <g id="rooms">${ROOMS.map(room).join('')}${SALONS.map(salonRoom).join('')}</g>
  <g id="hl">${[...ROOMS, ...SALONS].map(r => `<rect class="room-hl" data-room="${r.i}" x="${r.x + 4}" y="${r.y + 4}" width="${r.w - 8}" height="${r.h - 8}" rx="6"/>`).join('')}</g>

  <!-- grounds -->
  <rect x="0" y="780" width="${W}" height="${H - 780}" fill="url(#grass)"/>
  <path d="M0,782 Q400,770 800,782 T1600,782" stroke="#c7f5cd" stroke-width="8" fill="none"/>
  <path d="M700,780 L900,780 L960,900 L640,900 Z" fill="#ffe9c9" opacity=".8"/>
  ${[[90, 840, '#ff6b8b'], [260, 870, '#ffd23f'], [520, 850, '#a98bff'], [1080, 862, '#ff9a5c'], [1330, 845, '#5cc8ff'], [1520, 872, '#ff8fc7'], [30, 880, '#fff']].map(f => flower(...f)).join('')}

  <!-- stable (left) -->
  <g id="stable" class="pond" transform="translate(20 640)">
    <rect x="10" y="60" width="230" height="136" rx="8" fill="#ffd9a8" stroke="#fff" stroke-width="4"/>
    <polygon points="-6,64 126,-10 258,64" fill="#ff9a5c" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>
    <path d="M126,22 c-14,-16 -34,4 -14,22 l14,12 l14,-12 c20,-18 0,-38 -14,-22Z" fill="#fff"/>
    <rect x="86" y="110" width="80" height="86" rx="10" fill="#fff0d6"/>
    <path d="M126,110 V196" stroke="#ffd9a8" stroke-width="4"/>
    <ellipse cx="200" cy="186" rx="34" ry="14" fill="#ffe27a"/>
  </g>

  <!-- pond (right): tap it to visit the lake -->
  <g id="pond" class="pond">
    <ellipse cx="1470" cy="800" rx="110" ry="34" fill="#8fd8ff" stroke="#fff" stroke-width="5"/>
    <ellipse cx="1440" cy="798" rx="46" ry="9" fill="#fff" opacity=".4"/>
    <ellipse class="pond-ring" cx="1470" cy="800" rx="110" ry="34" fill="none" stroke="#fff" stroke-width="4"/>
    <circle cx="1520" cy="806" r="12" fill="#6edc8c"/><circle cx="1520" cy="806" r="5" fill="#ff8fc7"/>
    <g transform="translate(1440 802) scale(.85)" class="duck-bob">${duckSVG()}</g>
    <ellipse cx="1470" cy="795" rx="140" ry="62" fill="transparent"/>
  </g>
  <g id="cake" style="display:none"></g>
  </g>
  ${lakeSVG()}
  ${stableSVG()}

  <g id="chars"></g>
  <g id="tools"></g>
  <g id="fx" pointer-events="none"></g>`;
}
