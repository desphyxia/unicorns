// All artwork is drawn in code (SVG strings), so nothing needs downloading.
import { RAINBOW } from './cast.js';
import { lakeSVG, duckSVG } from './lakeart.js';
import { stableSVG } from './stableart.js';

export const W = 1600;
export const H = 900;

// Castle rooms: a stepped dollhouse with 2 + 4 + 4 = 10 rooms.
export const ROOM_COLORS = ['#ffb3c7', '#ffcf9e', '#fff0a0', '#bfeabf', '#a9d8ff', '#d3bdff', '#ffc2e2', '#ffe0b8', '#c8f0ff', '#e0cfff'];
export const ROOMS = [];
[{ y: 220, cols: 2, x0: 590 }, { y: 400, cols: 4, x0: 380 }, { y: 580, cols: 4, x0: 380 }].forEach((row) => {
  for (let c = 0; c < row.cols; c++) {
    const i = ROOMS.length;
    ROOMS.push({ i, x: row.x0 + c * 210, y: row.y, w: 210, h: 180, color: ROOM_COLORS[i] });
  }
});

// Where characters may walk.
export const GROUND = { x0: 290, x1: 1330, y0: 815, y1: 880 };
export function roomBounds(r) {
  return { x0: r.x + 45, x1: r.x + r.w - 45, y0: r.y + r.h - 18, y1: r.y + r.h - 8 };
}

// ---- wardrobe pieces: 6 styles each, all recolourable ----
export const STYLE_COUNT = 6;

const star = (x, y, r, fill) =>
  `<path transform="translate(${x} ${y}) scale(${r / 9})" d="M0,-9 L2.5,-2.5 L9,0 L2.5,2.5 L0,9 L-2.5,2.5 L-9,0 L-2.5,-2.5Z" fill="${fill}"/>`;

const BODICE = `M-12,-74 L12,-74 L14,-58 L-14,-58 Z`;
const GOWN = `M-12,-74 L12,-74 L32,-14 Q0,-2 -32,-14 Z`;
const hem = `<path d="M-30,-18 Q0,-6 30,-18" stroke="#fff" stroke-width="4" fill="none" opacity=".6" stroke-linecap="round"/>`;
const sash = `<path d="M-13,-62 L13,-62 L14,-57 L-14,-57 Z" fill="#fff" opacity=".6"/>`;

export function dressSVG(style, c) {
  switch (style % STYLE_COUNT) {
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
    default: // classic ball gown
      return `<path d="${GOWN}" fill="${c}"/>${hem}${sash}`;
  }
}

// Foot drawn for the left foot at the origin; toes point to -x. The right foot is mirrored.
function foot(style, c) {
  switch (style % STYLE_COUNT) {
    case 1: return `<path d="M8,-1 Q8,-9 0,-8 Q-8,-8 -17,-1 Q-6,2 8,-1Z" fill="${c}"/><circle cx="-1" cy="-6" r="2" fill="#fff" opacity=".8"/>`;
    case 2: return `<rect x="-6" y="-27" width="12" height="25" rx="4" fill="${c}"/><ellipse cx="-2" cy="-3" rx="10" ry="5" fill="${c}"/><rect x="-7" y="-28" width="14" height="6" rx="3" fill="#fff" opacity=".8"/>`;
    case 3: return `<ellipse cx="0" cy="-3" rx="9" ry="5" fill="${c}"/><circle cx="-3" cy="-7" r="3" fill="#fff"/><circle cx="3" cy="-7" r="3" fill="#fff"/><circle cx="0" cy="-7" r="1.6" fill="${c}"/>`;
    case 4: return `<ellipse cx="0" cy="-3" rx="8" ry="4" fill="${c}"/><rect x="4" y="-7" width="4" height="7" rx="2" fill="${c}"/><path d="M-6,-5 Q0,-12 6,-5" stroke="#fff" stroke-width="2" fill="none"/>`;
    case 5: return `<ellipse cx="0" cy="-3" rx="9" ry="5" fill="${c}"/>${star(0, -4, 3.6, '#fff')}`;
    default: return `<ellipse cx="0" cy="-3" rx="9" ry="5" fill="${c}"/>`;
  }
}
export function shoesSVG(style, c) {
  return `<g transform="translate(-9 0)">${foot(style, c)}</g><g transform="translate(9 0) scale(-1 1)">${foot(style, c)}</g>`;
}

export function tiaraSVG(style, c) {
  switch (style % STYLE_COUNT) {
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
    default: // classic crown
      return `<path d="M-13,-103 L-9,-114 L-4,-106 L0,-118 L4,-106 L9,-114 L13,-103 Z" fill="${c}" stroke="#e8b923" stroke-width="1"/>`;
  }
}

export function defaultLook(p) {
  return { dress: 0, dressColor: p.dress, shoes: 0, shoesColor: p.shoes, tiara: 0, tiaraColor: p.tiara };
}

export function princessSVG(p, look) {
  const l = { ...defaultLook(p), ...(look || {}) };
  return `<g class="body">
  <rect x="-10" y="-22" width="6" height="20" rx="3" fill="${p.skin}"/>
  <rect x="4" y="-22" width="6" height="20" rx="3" fill="${p.skin}"/>
  ${shoesSVG(l.shoes, l.shoesColor)}
  <rect x="-24" y="-92" width="48" height="44" rx="16" fill="${p.hair}"/>
  <ellipse cx="0" cy="-92" rx="24" ry="25" fill="${p.hair}"/>
  ${dressSVG(l.dress, l.dressColor)}
  <path d="M-11,-70 Q-27,-58 -22,-42" stroke="${p.skin}" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M11,-70 Q27,-58 22,-42" stroke="${p.skin}" stroke-width="6" fill="none" stroke-linecap="round"/>
  <circle cx="0" cy="-90" r="17" fill="${p.skin}"/>
  <path d="M-17,-91 Q-9,-112 0,-103 Q9,-112 17,-91 Q9,-99 0,-95 Q-9,-99 -17,-91Z" fill="${p.hair}"/>
  <circle cx="-6" cy="-88" r="2.3" fill="#3b2a4a"/>
  <circle cx="6" cy="-88" r="2.3" fill="#3b2a4a"/>
  <circle cx="-10" cy="-83" r="3" fill="#ff8fa8" opacity=".5"/>
  <circle cx="10" cy="-83" r="3" fill="#ff8fa8" opacity=".5"/>
  <path d="M-4,-82 Q0,-78 4,-82" stroke="#c4476e" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  ${tiaraSVG(l.tiara, l.tiaraColor)}
</g>`;
}

// A princess sitting on a unicorn's back (legs hidden by the clip, which the caller defines).
export function riderSVG(p, look, clipId = 'riderclip') {
  return `<g class="rider" transform="translate(-4 -40) scale(.66)" clip-path="url(#${clipId})">${princessSVG(p, look)}</g>`;
}

// Unicorns face right; the caller flips them.
export function unicornSVG(u) {
  const tail = RAINBOW.map((c, i) => `<path d="M-40,-62 Q${-80 - i * 2},${-66 + i * 4} ${-72 + i * 3},${-18 + i * 3}" stroke="${c}" stroke-width="7" fill="none" stroke-linecap="round" opacity=".95"/>`).join('');
  const mane = RAINBOW.map((c, i) => `<circle cx="${52 - i * 4}" cy="${-108 + i * 11}" r="${9 - (i % 2)}" fill="${c}"/>`).join('');
  return `<g class="body">
  ${tail}
  <rect x="-36" y="-40" width="11" height="38" rx="5" fill="${u.body}" stroke="#e7d6f5" stroke-width="1.5"/>
  <rect x="-20" y="-38" width="11" height="36" rx="5" fill="${u.body}" stroke="#e7d6f5" stroke-width="1.5"/>
  <rect x="14" y="-38" width="11" height="36" rx="5" fill="${u.body}" stroke="#e7d6f5" stroke-width="1.5"/>
  <rect x="30" y="-40" width="11" height="38" rx="5" fill="${u.body}" stroke="#e7d6f5" stroke-width="1.5"/>
  <rect x="-36" y="-8" width="11" height="7" rx="3" fill="${u.hoof}"/>
  <rect x="-20" y="-8" width="11" height="7" rx="3" fill="${u.hoof}"/>
  <rect x="14" y="-8" width="11" height="7" rx="3" fill="${u.hoof}"/>
  <rect x="30" y="-8" width="11" height="7" rx="3" fill="${u.hoof}"/>
  <ellipse cx="0" cy="-54" rx="48" ry="25" fill="${u.body}" stroke="#e7d6f5" stroke-width="1.5"/>
  <path d="M28,-68 L48,-106 L70,-92 L50,-48 Z" fill="${u.body}"/>
  ${mane}
  <ellipse cx="68" cy="-98" rx="23" ry="17" fill="${u.body}" stroke="#e7d6f5" stroke-width="1.5" transform="rotate(-12 68 -98)"/>
  <ellipse cx="84" cy="-92" rx="10" ry="8" fill="#ffe9f3"/>
  <path d="M56,-110 L58,-128 L68,-113 Z" fill="${u.body}" stroke="#e7d6f5" stroke-width="1.5"/>
  <path d="M69,-112 L80,-152 L82,-108 Z" fill="#ffd84d" stroke="#e8b923" stroke-width="1.2"/>
  <path d="M72,-124 L80,-121 M71,-134 L80,-131 M74,-114 L81,-112" stroke="#fff3b0" stroke-width="2"/>
  <circle cx="72" cy="-100" r="3.2" fill="#3b2a4a"/>
  <circle cx="73" cy="-101" r="1.1" fill="#fff"/>
  <circle cx="86" cy="-92" r="1.6" fill="#d98aa8"/>
  <circle cx="62" cy="-90" r="4" fill="#ff8fa8" opacity=".4"/>
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

function room(r) {
  const bedLeft = r.i % 2 === 0;
  const bx = bedLeft ? r.x + 12 : r.x + r.w - 112;
  const wx = r.x + r.w / 2 - 24;
  const fy = r.y + r.h - 22;
  const lampX = bedLeft ? r.x + r.w - 28 : r.x + 28;
  return `<g>
    <rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="${r.color}"/>
    <rect x="${r.x}" y="${fy}" width="${r.w}" height="22" fill="#ffffff" opacity=".45"/>
    <path d="M${wx},${r.y + 100} V${r.y + 56} a24,24 0 0 1 48,0 V${r.y + 100} Z" fill="#dff3ff" stroke="#fff" stroke-width="5"/>
    <path d="M${wx + 24},${r.y + 32} V${r.y + 100} M${wx},${r.y + 72} H${wx + 48}" stroke="#fff" stroke-width="3"/>
    <rect x="${bx}" y="${fy - 36}" width="100" height="36" rx="10" fill="#fff" opacity=".85"/>
    <rect x="${bx + (bedLeft ? 6 : 46)}" y="${fy - 46}" width="48" height="24" rx="11" fill="#fff"/>
    <rect x="${bx + (bedLeft ? 44 : 4)}" y="${fy - 30}" width="52" height="26" rx="8" fill="${RAINBOW[r.i % 6]}" opacity=".85"/>
    <path d="M${lampX},${fy} v-46" stroke="#fff" stroke-width="4"/>
    <circle cx="${lampX}" cy="${fy - 54}" r="10" fill="#fff6a8"/>
    <rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="none" stroke="#fff" stroke-width="6"/>
  </g>`;
}

export function sceneSVG() {
  const rainbowArcs = RAINBOW.map((c, i) => {
    const rad = 760 - i * 26;
    return `<path d="M${800 - rad},800 A${rad},${rad} 0 0 1 ${800 + rad},800" stroke="${c}" stroke-width="28" fill="none" opacity=".75"/>`;
  }).join('');
  const merlon = (x, y) => `<rect x="${x}" y="${y}" width="24" height="18" rx="4" fill="#efe0ff"/>`;
  const battlements = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => merlon(584 + i * 40, 186)).join('')
    + [0, 1, 2, 3, 4].map((i) => merlon(384 + i * 40, 386) + merlon(1024 + i * 40, 386)).join('');
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
  <path d="M580,200 H1020 V400 H1220 V780 H380 V400 H580 Z" fill="#f0e2ff" stroke="#fff" stroke-width="6" stroke-linejoin="round"/>
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

  <g id="rooms">${ROOMS.map(room).join('')}</g>
  <g id="hl">${ROOMS.map(r => `<rect class="room-hl" data-room="${r.i}" x="${r.x + 4}" y="${r.y + 4}" width="${r.w - 8}" height="${r.h - 8}" rx="6"/>`).join('')}</g>

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
