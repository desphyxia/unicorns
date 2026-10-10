// The stable: where the unicorns get fed and brushed.
import { RAINBOW } from './cast.js';

export const STALL_X = [190, 430, 670, 910, 1150, 1390];
export const STALL_Y = 774;
export const FOODS = ['apple', 'carrot', 'cupcake'];
export const BASKETS = [{ food: 'apple', x: 210, y: 296 }, { food: 'carrot', x: 380, y: 296 }, { food: 'cupcake', x: 550, y: 296 }];
export const BRUSH_REST = { x: 1470, y: 250 };

export function foodSVG(food) {
  switch (food) {
    case 'carrot': return `<polygon points="-12,-8 12,-8 0,30" fill="#ff9a5c" transform="rotate(-25)"/><g transform="rotate(-25)"><path d="M0,-8 l-9,-14 M0,-8 l0,-18 M0,-8 l9,-14" stroke="#6edc8c" stroke-width="5" stroke-linecap="round"/></g>`;
    case 'cupcake': return `<path d="M-16,0 L-12,22 H12 L16,0Z" fill="#a98bff"/><path d="M-12,2 V22 M-4,2 V22 M4,2 V22 M12,2 V22" stroke="#fff" stroke-width="2" opacity=".5"/><path d="M-18,2 Q-20,-14 -6,-14 Q-4,-26 6,-20 Q20,-20 18,2Z" fill="#ff8fc7"/><circle cx="0" cy="-26" r="4.5" fill="#ff6b8b"/>`;
    default: return `<circle cx="-5" cy="0" r="16" fill="#ff6b8b"/><circle cx="7" cy="0" r="16" fill="#ff6b8b"/><path d="M0,-14 q4,-14 14,-14" stroke="#7a4b2a" stroke-width="3" fill="none"/><path d="M4,-18 q10,-10 18,-2 q-8,8 -18,2Z" fill="#6edc8c"/><circle cx="-8" cy="-5" r="4" fill="#fff" opacity=".4"/>`;
  }
}

export function brushSVG() {
  return `<rect x="-14" y="-12" width="28" height="64" rx="12" fill="#e0a874" stroke="#c78a55" stroke-width="2" transform="rotate(8)"/>
    <rect x="-34" y="-46" width="68" height="40" rx="12" fill="#ff8fc7" transform="rotate(8)"/>
    <g transform="rotate(8)">${[-26, -17, -8, 1, 10, 19, 28].map((x, i) => `<line x1="${x}" y1="-44" x2="${x}" y2="-60" stroke="${RAINBOW[i % 6]}" stroke-width="5" stroke-linecap="round"/>`).join('')}</g>
    <rect x="-70" y="-70" width="140" height="130" fill="transparent"/>`;
}

const basket = (b) => `<g transform="translate(${b.x} ${b.y})">
  <path d="M-48,-4 L-40,-44 H40 L48,-4Z" fill="#e0a874" stroke="#c78a55" stroke-width="3"/>
  <path d="M-44,-18 H44 M-42,-32 H42" stroke="#c78a55" stroke-width="3"/>
  <g transform="translate(-22 -48) scale(.8)">${foodSVG(b.food)}</g><g transform="translate(18 -50) scale(.8)">${foodSVG(b.food)}</g><g transform="translate(-2 -62) scale(.8)">${foodSVG(b.food)}</g>
  <rect x="-60" y="-70" width="120" height="76" fill="transparent" class="basket" data-food="${b.food}"/></g>`;

export function stableSVG() {
  const planks = Array.from({ length: 32 }, (_, i) => `<line x1="${i * 50 + 25}" y1="0" x2="${i * 50 + 25}" y2="700" stroke="#f3c9a4" stroke-width="3" opacity=".7"/>`).join('');
  const flags = Array.from({ length: 16 }, (_, i) => {
    const x = 60 + i * 96, y = 36 + Math.sin(i / 15 * Math.PI) * 30;
    return `<polygon points="${x - 20},${y} ${x + 20},${y} ${x},${y + 44}" fill="${RAINBOW[i % 6]}"/>`;
  }).join('');
  const posts = STALL_X.map((x) => `<rect x="${x - 128}" y="500" width="16" height="274" rx="6" fill="#f2c79b" stroke="#fff" stroke-width="3"/>`).join('')
    + `<rect x="${STALL_X[5] + 112}" y="500" width="16" height="274" rx="6" fill="#f2c79b" stroke="#fff" stroke-width="3"/>`;
  const hearts = STALL_X.map((x, i) => `<path transform="translate(${x} 470)" d="M0,24 C-46,-6 -22,-42 0,-18 C22,-42 46,-6 0,24Z" fill="${RAINBOW[i]}" stroke="#fff" stroke-width="4"/>`).join('');
  const hay = Array.from({ length: 90 }, (_, i) => `<path d="M${(i * 37) % 1600},${720 + (i * 53) % 170} l14,-10 M${(i * 37) % 1600 + 6},${724 + (i * 53) % 170} l10,-14" stroke="#f5c542" stroke-width="3" stroke-linecap="round" opacity=".7"/>`).join('');
  return `<g id="stableScene" style="display:none">
    <rect width="1600" height="900" fill="#ffe3cc"/>
    ${planks}
    <rect width="1600" height="90" fill="#ffc7a1"/>
    ${flags}
    <g transform="translate(800 190)"><path d="M-90,120 V-10 a90,90 0 0 1 180,0 V120Z" fill="#bfe3ff" stroke="#fff" stroke-width="10"/><circle cx="20" cy="10" r="38" fill="#fff3a0"/><path d="M0,-100 V120 M-90,40 H90" stroke="#fff" stroke-width="6"/></g>
    <rect x="100" y="296" width="540" height="22" rx="8" fill="#e0a874" stroke="#fff" stroke-width="3"/>
    ${BASKETS.map(basket).join('')}
    <g transform="translate(${BRUSH_REST.x} ${BRUSH_REST.y - 36})"><circle r="9" fill="#fff"/><path d="M0,0 V-60" stroke="#fff" stroke-width="6"/></g>
    <rect y="700" width="1600" height="200" fill="#ffe9a8"/>
    <path d="M0,700 Q400,688 800,700 T1600,700" stroke="#fff6cf" stroke-width="8" fill="none"/>
    ${hay}
    ${posts}${hearts}
  </g>`;
}
