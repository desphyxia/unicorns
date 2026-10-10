// All artwork is drawn in code (SVG strings), so nothing needs downloading.
import { RAINBOW } from './cast.js';

export const W = 1600;
export const H = 900;

// Castle rooms: 2 columns x 3 rows, drawn like a dollhouse cross-section.
export const ROOM_COLORS = ['#ffb3c7', '#ffcf9e', '#fff0a0', '#bfeabf', '#a9d8ff', '#d3bdff'];
export const ROOMS = [];
for (let row = 0; row < 3; row++) {
  for (let col = 0; col < 2; col++) {
    ROOMS.push({ i: row * 2 + col, x: 400 + col * 400, y: 220 + row * 180, w: 400, h: 180, color: ROOM_COLORS[row * 2 + col] });
  }
}

// Where characters may walk.
export const GROUND = { x0: 50, x1: 1550, y0: 815, y1: 880 };
export function roomBounds(r) {
  return { x0: r.x + 50, x1: r.x + r.w - 50, y0: r.y + r.h - 18, y1: r.y + r.h - 8 };
}

export function princessSVG(p) {
  return `<g class="body">
  <ellipse cx="-9" cy="-3" rx="9" ry="5" fill="${p.shoes}"/>
  <ellipse cx="9" cy="-3" rx="9" ry="5" fill="${p.shoes}"/>
  <rect x="-10" y="-22" width="6" height="20" rx="3" fill="${p.skin}"/>
  <rect x="4" y="-22" width="6" height="20" rx="3" fill="${p.skin}"/>
  <rect x="-24" y="-92" width="48" height="44" rx="16" fill="${p.hair}"/>
  <ellipse cx="0" cy="-92" rx="24" ry="25" fill="${p.hair}"/>
  <path d="M-12,-74 L12,-74 L32,-14 Q0,-2 -32,-14 Z" fill="${p.dress}"/>
  <path d="M-30,-18 Q0,-6 30,-18" stroke="#fff" stroke-width="4" fill="none" opacity=".6" stroke-linecap="round"/>
  <path d="M-8,-66 L8,-66 L10,-62 L-10,-62 Z" fill="#fff" opacity=".55"/>
  <path d="M-11,-70 Q-27,-58 -22,-42" stroke="${p.skin}" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M11,-70 Q27,-58 22,-42" stroke="${p.skin}" stroke-width="6" fill="none" stroke-linecap="round"/>
  <circle cx="0" cy="-90" r="17" fill="${p.skin}"/>
  <path d="M-17,-91 Q-9,-112 0,-103 Q9,-112 17,-91 Q9,-99 0,-95 Q-9,-99 -17,-91Z" fill="${p.hair}"/>
  <circle cx="-6" cy="-88" r="2.3" fill="#3b2a4a"/>
  <circle cx="6" cy="-88" r="2.3" fill="#3b2a4a"/>
  <circle cx="-10" cy="-83" r="3" fill="#ff8fa8" opacity=".5"/>
  <circle cx="10" cy="-83" r="3" fill="#ff8fa8" opacity=".5"/>
  <path d="M-4,-82 Q0,-78 4,-82" stroke="#c4476e" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <path d="M-13,-103 L-9,-114 L-4,-106 L0,-118 L4,-106 L9,-114 L13,-103 Z" fill="${p.tiara}" stroke="#e8b923" stroke-width="1"/>
  ${p.star ? '<circle cx="0" cy="-107" r="2.5" fill="#ff6b8b"/>' : ''}
</g>`;
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
  const bx = bedLeft ? r.x + 22 : r.x + r.w - 142;
  const wx = r.x + r.w / 2 - 28;
  const fy = r.y + r.h - 22;
  return `<g>
    <rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="${r.color}"/>
    <rect x="${r.x}" y="${fy}" width="${r.w}" height="22" fill="#ffffff" opacity=".45"/>
    <path d="M${wx},${r.y + 100} V${r.y + 56} a28,28 0 0 1 56,0 V${r.y + 100} Z" fill="#dff3ff" stroke="#fff" stroke-width="5"/>
    <path d="M${wx + 28},${r.y + 28} V${r.y + 100} M${wx},${r.y + 70} H${wx + 56}" stroke="#fff" stroke-width="3"/>
    <rect x="${bx}" y="${fy - 40}" width="120" height="40" rx="10" fill="#fff" opacity=".85"/>
    <rect x="${bx + (bedLeft ? 6 : 50)}" y="${fy - 52}" width="64" height="26" rx="12" fill="#fff"/>
    <rect x="${bx + (bedLeft ? 52 : 4)}" y="${fy - 34}" width="64" height="30" rx="8" fill="${RAINBOW[r.i]}" opacity=".85"/>
    <path d="M${bedLeft ? r.x + r.w - 40 : r.x + 40},${fy} v-46" stroke="#fff" stroke-width="4"/>
    <circle cx="${bedLeft ? r.x + r.w - 40 : r.x + 40}" cy="${fy - 54}" r="10" fill="#fff6a8"/>
  </g>`;
}

export function sceneSVG() {
  const rainbowArcs = RAINBOW.map((c, i) => {
    const rad = 760 - i * 26;
    return `<path d="M${800 - rad},800 A${rad},${rad} 0 0 1 ${800 + rad},800" stroke="${c}" stroke-width="28" fill="none" opacity=".75"/>`;
  }).join('');
  const battlements = Array.from({ length: 21 }, (_, i) => `<rect x="${384 + i * 40}" y="186" width="24" height="18" rx="4" fill="#efe0ff"/>`).join('');
  const towerWin = (x, y) => `<path d="M${x},${y + 36} v-22 a12,12 0 0 1 24,0 v22 Z" fill="#a9d8ff" stroke="#fff" stroke-width="3"/>`;

  return `
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#bfe3ff"/><stop offset=".6" stop-color="#ffe3f4"/><stop offset="1" stop-color="#fff3d6"/>
    </linearGradient>
    <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#9ee6a6"/><stop offset="1" stop-color="#6fd08c"/>
    </linearGradient>
    <linearGradient id="roofbow" x1="0" y1="0" x2="0" y2="1">
      ${RAINBOW.map((c, i) => `<stop offset="${i / 5}" stop-color="${c}"/>`).join('')}
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <circle cx="1400" cy="130" r="64" fill="#fff3a0"/><circle cx="1400" cy="130" r="86" fill="#fff3a0" opacity=".35"/>
  ${rainbowArcs}
  ${cloud(220, 150, 1.1, 0)}${cloud(1180, 90, .9, -6)}${cloud(620, 70, .8, -12)}${cloud(1480, 300, .7, -3)}
  <ellipse cx="200" cy="800" rx="420" ry="130" fill="#b8efc0"/>
  <ellipse cx="1400" cy="810" rx="440" ry="140" fill="#aee9b8"/>

  <!-- castle -->
  <rect x="380" y="200" width="840" height="580" rx="10" fill="#f0e2ff" stroke="#fff" stroke-width="6"/>
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
  <path d="M600,220 V780 M800,220 V780 M1000,220 V780" stroke="none"/>
  <rect x="400" y="220" width="800" height="540" fill="none" stroke="#fff" stroke-width="8"/>
  <path d="M400,400 H1200 M400,580 H1200 M800,220 V760" stroke="#fff" stroke-width="8"/>
  <g id="hl">${ROOMS.map(r => `<rect class="room-hl" data-room="${r.i}" x="${r.x + 4}" y="${r.y + 4}" width="${r.w - 8}" height="${r.h - 8}" rx="6"/>`).join('')}</g>

  <!-- grounds -->
  <rect x="0" y="780" width="${W}" height="${H - 780}" fill="url(#grass)"/>
  <path d="M0,782 Q400,770 800,782 T1600,782" stroke="#c7f5cd" stroke-width="8" fill="none"/>
  <path d="M700,780 L900,780 L960,900 L640,900 Z" fill="#ffe9c9" opacity=".8"/>
  ${[[90, 840, '#ff6b8b'], [260, 870, '#ffd23f'], [520, 850, '#a98bff'], [1080, 862, '#ff9a5c'], [1330, 845, '#5cc8ff'], [1520, 872, '#ff8fc7'], [30, 880, '#fff']].map(f => flower(...f)).join('')}

  <!-- stable (left) -->
  <g transform="translate(20 640)">
    <rect x="10" y="60" width="230" height="136" rx="8" fill="#ffd9a8" stroke="#fff" stroke-width="4"/>
    <polygon points="-6,64 126,-10 258,64" fill="#ff9a5c" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>
    <path d="M126,22 c-14,-16 -34,4 -14,22 l14,12 l14,-12 c20,-18 0,-38 -14,-22Z" fill="#fff"/>
    <rect x="86" y="110" width="80" height="86" rx="10" fill="#fff0d6"/>
    <path d="M126,110 V196" stroke="#ffd9a8" stroke-width="4"/>
    <ellipse cx="200" cy="186" rx="34" ry="14" fill="#ffe27a"/>
  </g>

  <!-- pond (right): the lake trips come later -->
  <ellipse cx="1470" cy="800" rx="110" ry="34" fill="#8fd8ff" stroke="#fff" stroke-width="5"/>
  <ellipse cx="1440" cy="798" rx="46" ry="9" fill="#fff" opacity=".4"/>
  <circle cx="1500" cy="802" r="12" fill="#6edc8c"/><circle cx="1500" cy="802" r="5" fill="#ff8fc7"/>

  <g id="chars"></g>
  <g id="fx" pointer-events="none"></g>`;
}
