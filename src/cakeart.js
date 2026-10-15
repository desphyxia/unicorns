// The bakery: cupcake art. A cupcake is { liner, sponge, frost, style, tops: [{t, dx, dy, r}], spr: [{t, x, y, c, r}] }.
import { RAINBOW } from './cast.js';

export const LINERS = ['#ff8fc7', '#5cc8ff', '#ffd23f', '#6edc8c', '#a98bff', '#ff9a5c', '#ff6b8b', '#ffffff'];
export const SPONGES = ['#f6d9a0', '#7a4a2c', '#ffb3c7', '#fff06a', '#b9c8ff', '#b8ecc8'];
export const FROSTS = ['#ffffff', '#ff9fb8', '#8a5a3c', '#9fe8c8', '#8fa8ff', '#fff06a', '#ffb066', '#d9b3ff'];
export const STYLES = 3;
const topYs = [66, 96, 74];
const dots = (pts, r, f) => pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}"/>`).join('');
const darker = (c) => { const n = parseInt(c.slice(1), 16); const m = (sh) => Math.round(((n >> sh) & 255) * 0.84).toString(16).padStart(2, '0'); return `#${m(16)}${m(8)}${m(0)}`; };

export const CAKE_TOPS = [
  { id: 'cherry', art: '<circle cy="2" r="9" fill="#e8283c"/><ellipse cx="-3" cy="-1" rx="2.4" ry="3.4" fill="#fff" opacity=".5"/><path d="M1,-6 Q6,-16 12,-17" stroke="#4fb86a" stroke-width="2.4" fill="none" stroke-linecap="round"/>' },
  { id: 'strawberry', art: '<path d="M0,12 Q-13,2 -10,-5 Q-5,-10 0,-7 Q5,-10 10,-5 Q13,2 0,12Z" fill="#ff4d6a"/>' + dots([[-4, -1], [3, -2], [0, 5]], 1, '#ffe9a0') + '<path d="M-6,-8 L0,-5 L6,-8 L2,-11 L0,-15 L-2,-11Z" fill="#4fb86a"/>' },
  { id: 'star', art: '<path d="M0,-13 L4,-4 L13,-4 L6,2 L9,12 L0,6 L-9,12 L-6,2 L-13,-4 L-4,-4Z" fill="#ffd84d" stroke="#e8b923" stroke-width="1.5" stroke-linejoin="round"/>' },
  { id: 'heart', art: '<path d="M0,12 C-20,-2 -10,-18 0,-7 C10,-18 20,-2 0,12Z" fill="#ff5d8a" stroke="#e03c6a" stroke-width="1.5"/>' },
  { id: 'lollipop', art: '<rect x="-1.8" y="0" width="3.6" height="22" rx="1.8" fill="#fff" stroke="#e0d8e8" stroke-width="1"/><circle cy="-6" r="11" fill="#ff8fc7"/><path d="M0,-6 m-7,0 a7,7 0 1 1 7,7 M0,-6 m-3,0 a3,3 0 1 1 3,3" stroke="#fff" stroke-width="2.4" fill="none"/>' },
  { id: 'candle', art: '<rect x="-4" y="-10" width="8" height="30" rx="2" fill="#5cc8ff"/><path d="M-4,-2 l8,5 M-4,8 l8,5" stroke="#fff" stroke-width="2.4"/><path d="M0,-12 Q-7,-20 0,-30 Q7,-20 0,-12Z" fill="#ffb02e"/><path d="M0,-13 Q-3,-18 0,-24 Q3,-18 0,-13Z" fill="#fff6a8"/>' },
  { id: 'flower', art: [0, 72, 144, 216, 288].map((a) => `<circle cx="${(Math.cos(a * Math.PI / 180) * 7.5).toFixed(1)}" cy="${(Math.sin(a * Math.PI / 180) * 7.5).toFixed(1)}" r="6" fill="#ff9fb8"/>`).join('') + '<circle r="4.6" fill="#ffe27a"/>' },
  { id: 'macaron', art: '<ellipse cy="-4" rx="13" ry="6.5" fill="#d9b3ff"/><rect x="-12" y="-4" width="24" height="5" rx="2.5" fill="#fff"/><ellipse cy="3" rx="13" ry="6.5" fill="#b98cf0"/>' },
];

export function cupcakeSVG(st, fresh) {
  const F = st.frost, S = SPONGES[st.sponge], L = LINERS[st.liner];
  const dk = darker(F);
  const drop = (k, inner) => `<g class="${fresh === k ? 'kdrop' : ''}">${inner}</g>`;
  let out = `<path d="M66,172 L194,172 L178,272 Q130,282 82,272Z" fill="${L}" stroke="${darker(L === '#ffffff' ? '#eeeeee' : L)}" stroke-width="3" stroke-linejoin="round"/>
    ${Array.from({ length: 9 }, (_, k) => `<path d="M${66 + k * 16},172 L${82 + k * 12},275" stroke="${darker(L === '#ffffff' ? '#e4e4e4' : L)}" stroke-width="2.4" opacity=".55"/>`).join('')}
    <path d="M62,178 Q58,138 130,136 Q202,138 198,178Z" fill="${S}" stroke="${darker(S)}" stroke-width="3" stroke-linejoin="round"/>`;
  const ty = topYs[st.style];
  if (st.style === 0) {
    out += `<g fill="${F}" stroke="${dk}" stroke-width="3" stroke-linejoin="round"><ellipse cx="130" cy="144" rx="72" ry="24"/><ellipse cx="130" cy="114" rx="54" ry="21"/><ellipse cx="130" cy="88" rx="38" ry="18"/><path d="M116,80 Q130,36 144,80Z"/></g>
      <path d="M86,138 Q100,128 118,132 M96,112 Q108,106 122,108" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".6"/>`;
  } else if (st.style === 1) {
    out += `<path d="M56,152 Q52,106 130,98 Q208,106 204,152 Q192,172 176,154 Q162,174 148,156 Q132,176 118,156 Q104,174 88,154 Q72,170 56,152Z" fill="${F}" stroke="${dk}" stroke-width="3" stroke-linejoin="round"/><path d="M80,124 Q96,110 120,108" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".6"/>`;
  } else {
    out += `<g fill="${F}" stroke="${dk}" stroke-width="3"><circle cx="78" cy="138" r="26"/><circle cx="182" cy="138" r="26"/><circle cx="130" cy="124" r="36"/><circle cx="102" cy="98" r="26"/><circle cx="158" cy="98" r="26"/><circle cx="130" cy="82" r="24"/></g><g fill="${F}"><circle cx="130" cy="124" r="33"/><circle cx="102" cy="98" r="23"/><circle cx="158" cy="98" r="23"/><circle cx="130" cy="82" r="21"/></g><path d="M112,76 Q122,66 136,68" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".6"/>`;
  }
  st.spr.forEach((b, k) => { out += drop(`p${k}`, b.svg); });
  st.tops.forEach((b, k) => {
    out += `<g transform="translate(${130 + b.dx} ${ty + 6 + b.dy}) rotate(${b.r})">${drop(`t${k}`, `<g transform="scale(1.5)">${CAKE_TOPS[b.t].art}</g>`)}</g>`;
  });
  return out;
}

export const topY = (st) => topYs[st.style];
export const newCupcake = () => ({ liner: 0, sponge: 0, frost: FROSTS[1], style: 0, tops: [], spr: [] });
export const linerIcon = (c) => `<svg viewBox="0 0 60 60"><path d="M10,22 L50,22 L44,54 Q30,58 16,54Z" fill="${c}" stroke="#d8c8e8" stroke-width="2.4" stroke-linejoin="round"/><path d="M18,22 L20,54 M26,22 L27,56 M34,22 L33,56 M42,22 L40,54" stroke="#d8c8e8" stroke-width="2" opacity=".7"/><path d="M12,24 Q30,8 48,24Z" fill="#fff" opacity=".5"/></svg>`;
export const spongeIcon = (c) => `<svg viewBox="0 0 60 60"><path d="M8,46 Q8,14 30,14 Q52,14 52,46Z" fill="${c}" stroke="${darker(c)}" stroke-width="3"/><circle cx="22" cy="34" r="2.4" fill="${darker(c)}" opacity=".6"/><circle cx="38" cy="30" r="2.4" fill="${darker(c)}" opacity=".6"/><circle cx="30" cy="40" r="2.4" fill="${darker(c)}" opacity=".6"/></svg>`;
export const frostIcon = (c, style) => `<svg viewBox="0 0 60 60">${style === 0 ? `<ellipse cx="30" cy="44" rx="22" ry="9" fill="${c}" stroke="${darker(c)}" stroke-width="2.4"/><ellipse cx="30" cy="30" rx="15" ry="8" fill="${c}" stroke="${darker(c)}" stroke-width="2.4"/><path d="M24,24 Q30,6 36,24Z" fill="${c}" stroke="${darker(c)}" stroke-width="2.4" stroke-linejoin="round"/>` : style === 1 ? `<path d="M6,36 Q6,16 30,14 Q54,16 54,36 Q48,48 42,38 Q36,50 30,40 Q24,50 18,38 Q12,48 6,36Z" fill="${c}" stroke="${darker(c)}" stroke-width="2.4" stroke-linejoin="round"/>` : `<g fill="${c}" stroke="${darker(c)}" stroke-width="2.4"><circle cx="16" cy="38" r="11"/><circle cx="44" cy="38" r="11"/><circle cx="30" cy="30" r="14"/><circle cx="30" cy="16" r="9"/></g><g fill="${c}"><circle cx="30" cy="30" r="12"/><circle cx="30" cy="16" r="7"/></g>`}</svg>`;
export const cakeTopIcon = (t) => `<svg viewBox="-24 -26 48 52"><g transform="scale(1.3)">${t.art}</g></svg>`;
export const miniCupcake = (st) => `<svg viewBox="30 10 200 290">${cupcakeSVG(st, null)}</svg>`;
export { RAINBOW };
