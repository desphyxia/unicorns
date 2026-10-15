// The sticker book: stickers are earned for doing things in the game. Pictures only, no words.
const KEY = 'elsas-castle-stickers';
const W = '#fff';
const dots = (pts, r, f) => pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}"/>`).join('');
const cone = (c) => `<path d="M-14,0 L14,0 L0,38Z" fill="#f0c27a" stroke="#d9a050" stroke-width="2.5" stroke-linejoin="round"/><circle cx="0" cy="-4" r="15" fill="${c}"/>`;
const cup = (c, top) => `<path d="M-18,4 L18,4 L14,32 Q0,36 -14,32Z" fill="${c}" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/><path d="M-20,6 Q-22,-14 0,-16 Q22,-14 20,6Z" fill="${top}"/><circle cx="0" cy="-20" r="5" fill="#e8283c"/>`;

// id, colour, picture (drawn in a -50..50 box), and what it is for (shown to parents in the README only)
export const STICKERS = [
  { id: 'trip-forest', bg: '#6edc8c', art: '<path d="M0,-34 L18,-6 H8 L22,16 H-22 L-8,-6 H-18Z" fill="#2f8f4a"/><rect x="-4" y="16" width="8" height="16" fill="#8a5a3c"/>' },
  { id: 'trip-garden', bg: '#ff9fb8', art: [0, 72, 144, 216, 288].map((a) => `<circle cx="${(Math.cos(a * Math.PI / 180) * 14).toFixed(1)}" cy="${(Math.sin(a * Math.PI / 180) * 14 - 4).toFixed(1)}" r="11" fill="#fff"/>`).join('') + '<circle cy="-4" r="9" fill="#ffd23f"/><path d="M0,10 V34" stroke="#2f8f4a" stroke-width="5"/>' },
  { id: 'trip-sky', bg: '#8fd0ff', art: '<path d="M-30,14 A30,30 0 0 1 30,14" stroke="#ff6b8b" stroke-width="7" fill="none"/><path d="M-22,14 A22,22 0 0 1 22,14" stroke="#ffd23f" stroke-width="7" fill="none"/><path d="M-14,14 A14,14 0 0 1 14,14" stroke="#6edc8c" stroke-width="7" fill="none"/><ellipse cx="-24" cy="20" rx="14" ry="9" fill="#fff"/><ellipse cx="24" cy="20" rx="14" ry="9" fill="#fff"/>' },
  { id: 'trip-bridge', bg: '#a98bff', art: '<path d="M-34,16 Q0,-34 34,16" stroke="#ff6b8b" stroke-width="8" fill="none"/><path d="M-34,26 Q0,-24 34,26" stroke="#5cc8ff" stroke-width="8" fill="none"/>' },
  { id: 'trip-treasure', bg: '#ffd23f', art: '<rect x="-26" y="-6" width="52" height="34" rx="5" fill="#a0642a"/><path d="M-26,-6 Q0,-34 26,-6Z" fill="#c98a4a"/><rect x="-5" y="2" width="10" height="12" rx="2" fill="#ffd84d"/><path d="M-26,8 H26" stroke="#7a4a1c" stroke-width="3"/>' },
  { id: 'trip-free', bg: '#c9b0ff', art: '<path d="M-8,26 Q-26,10 -18,-10 Q-10,-24 8,-22 L22,-4 Q18,6 6,8 Q4,20 -8,26Z" fill="#fff"/><path d="M8,-22 L18,-44 L22,-18Z" fill="#ffd23f"/><circle cx="2" cy="-8" r="3" fill="#4a3a6a"/>' },
  { id: 'salad', bg: '#9fe0a0', art: '<path d="M-30,0 Q-26,32 0,34 Q26,32 30,0Z" fill="#fff"/><circle cx="-12" cy="-4" r="11" fill="#6edc8c"/><circle cx="6" cy="-10" r="11" fill="#ff6b8b"/><circle cx="16" cy="-2" r="9" fill="#ffd23f"/>' },
  { id: 'bigsalad', bg: '#ffb066', art: '<circle cy="2" r="26" fill="#ff5a4d"/><path d="M-12,-20 L0,-14 L12,-20 L5,-26 L0,-34 L-5,-26Z" fill="#4fb86a"/><ellipse cx="-9" cy="-6" rx="6" ry="4" fill="#fff" opacity=".5"/>' },
  { id: 'ice', bg: '#ffc2e2', art: cone('#ff9fb8') },
  { id: 'ice3', bg: '#bfe0ff', art: `<path d="M-12,14 L12,14 L0,40Z" fill="#f0c27a"/><circle cy="2" r="13" fill="#8a5a3c"/><circle cy="-12" r="13" fill="#ff9fb8"/><circle cy="-26" r="12" fill="#fff3c4"/>` },
  { id: 'fancyice', bg: '#e0c8ff', art: cone('#9fe8c8') + '<circle cx="0" cy="-22" r="7" fill="#e8283c"/>' + dots([[-8, -8], [6, -12], [10, 0], [-4, 0]], 2.4, '#ffd23f') },
  { id: 'cupcake', bg: '#ffd1e8', art: cup('#ff8fc7', '#fff') },
  { id: 'tray', bg: '#fff0a0', art: `<g transform="translate(-20 6) scale(.5)">${cup('#5cc8ff', '#fff')}</g><g transform="translate(0 -2) scale(.5)">${cup('#ffd23f', '#ff9fb8')}</g><g transform="translate(20 6) scale(.5)">${cup('#a98bff', '#9fe8c8')}</g><rect x="-34" y="26" width="68" height="6" rx="3" fill="#fff"/>` },
  { id: 'candle', bg: '#bfe3ff', art: '<rect x="-7" y="-8" width="14" height="40" rx="3" fill="#ff8fc7"/><path d="M-7,2 l14,6 M-7,16 l14,6" stroke="#fff" stroke-width="3"/><path d="M0,-10 Q-12,-22 0,-38 Q12,-22 0,-10Z" fill="#ffb02e"/><path d="M0,-12 Q-5,-20 0,-29 Q5,-20 0,-12Z" fill="#fff6a8"/>' },
  { id: 'teeth', bg: '#8fe0ff', art: '<rect x="-26" y="2" width="52" height="12" rx="6" fill="#fff" transform="rotate(-35)"/><rect x="-3" y="-8" width="8" height="40" rx="4" fill="#ff8fc7" transform="rotate(-35)"/><path d="M-22,-22 l5,-9 l5,9 l9,5 l-9,5 l-5,9 l-5,-9 l-9,-5Z" fill="#fff6a8"/>' },
  { id: 'hair', bg: '#ffb3d9', art: '<circle cx="-12" cy="20" r="10" fill="none" stroke="#fff" stroke-width="5"/><circle cx="12" cy="20" r="10" fill="none" stroke="#fff" stroke-width="5"/><path d="M-8,12 L14,-26 M8,12 L-14,-26" stroke="#c9b0ff" stroke-width="6" stroke-linecap="round"/>' },
  { id: 'makeup', bg: '#d9b3ff', art: '<rect x="-9" y="2" width="18" height="30" rx="3" fill="#fff"/><rect x="-7" y="-14" width="14" height="18" rx="2" fill="#ff6b8b"/><path d="M-7,-14 L7,-14 L4,-30 L-4,-26Z" fill="#ff9fb8"/>' },
  { id: 'dress', bg: '#ffa8c8', art: '<path d="M-8,-30 L8,-30 L10,-8 Q36,16 38,36 Q0,42 -38,36 Q-36,16 -10,-8Z" fill="#fff"/><path d="M-9,-10 H9" stroke="#ff6b8b" stroke-width="6"/>' },
  { id: 'unicorn', bg: '#c4f0d0', art: '<path d="M-14,-10 Q-30,-24 -18,-30 Q0,-34 8,-18 L8,2 Q0,12 -14,-10Z" fill="#fff"/><path d="M-18,-30 L-6,-30" stroke="#ff6b8b" stroke-width="12" stroke-linecap="round"/><path d="M-6,-30 L2,-52" stroke="#ffd23f" stroke-width="7" stroke-linecap="round"/><rect x="-28" y="-6" width="56" height="14" rx="7" fill="#a98bff"/>' },
  { id: 'photo', bg: '#ff9fc7', art: '<rect x="-32" y="-14" width="64" height="42" rx="9" fill="#fff"/><rect x="-14" y="-24" width="28" height="14" rx="5" fill="#fff"/><circle cy="8" r="14" fill="#a98bff"/><circle cy="8" r="7" fill="#ffd1e8"/>' },
  { id: 'party', bg: '#ffd84d', art: '<rect x="-30" y="-2" width="60" height="32" rx="8" fill="#ffc2e2"/><rect x="-20" y="-16" width="40" height="18" rx="6" fill="#fff"/><rect x="-8" y="-34" width="5" height="18" fill="#5cc8ff"/><rect x="4" y="-34" width="5" height="18" fill="#6edc8c"/><path d="M-30,6 q8,10 15,0 t15,0 t15,0" stroke="#fff" stroke-width="5" fill="none"/>' },
  { id: 'splash', bg: '#7fd0ff', art: '<path d="M0,-32 Q22,-4 16,12 Q10,24 0,24 Q-10,24 -16,12 Q-22,-4 0,-32Z" fill="#fff"/><circle cx="-26" cy="20" r="6" fill="#fff"/><circle cx="26" cy="14" r="5" fill="#fff"/><circle cx="-8" cy="8" r="4" fill="#bfe8ff"/>' },
  { id: 'feed', bg: '#ffb27a', art: '<path d="M-24,-14 L26,-2 Q30,0 26,4 L-20,26 Q-34,0 -24,-14Z" fill="#ff9a3c"/><path d="M-26,-16 q-8,-14 -18,-8 M-26,-16 q-4,-18 8,-22" stroke="#4fb86a" stroke-width="5" fill="none" stroke-linecap="round"/>' },
  { id: 'brush', bg: '#d0c0ff', art: '<rect x="-24" y="-30" width="48" height="26" rx="8" fill="#fff"/><path d="M-14,-24 V-10 M-5,-24 V-10 M4,-24 V-10 M13,-24 V-10" stroke="#5cc8ff" stroke-width="5" stroke-linecap="round"/><rect x="-6" y="-6" width="12" height="38" rx="6" fill="#ff8fc7"/>' },
  { id: 'ride', bg: '#9fd8ff', art: '<path d="M-22,20 Q-34,-16 0,-24 Q34,-16 22,20 L12,20 Q14,-6 0,-8 Q-14,-6 -12,20Z" fill="#fff"/><circle cx="0" cy="-36" r="5" fill="#ffd23f"/>' },
  { id: 'sleep', bg: '#7a6bd8', art: '<path d="M10,-30 A28,28 0 1 0 28,12 A22,22 0 0 1 10,-30Z" fill="#fff6a8"/><path d="M-30,-14 h14 l-14,16 h14" stroke="#fff" stroke-width="5" fill="none" stroke-linejoin="round" stroke-linecap="round"/>' },
  { id: 'home', bg: '#ffcf9e', art: '<rect x="-24" y="-4" width="48" height="36" rx="3" fill="#fff"/><path d="M-30,-2 L0,-32 L30,-2Z" fill="#ff6b8b"/><rect x="-7" y="12" width="14" height="20" rx="7" fill="#a98bff"/>' },
  { id: 'coins', bg: '#ffe27a', art: '<circle r="28" fill="#ffd84d" stroke="#e8b923" stroke-width="5"/><circle r="17" fill="none" stroke="#e8b923" stroke-width="4"/><path d="M-6,-8 H6 M0,-8 V12" stroke="#e8b923" stroke-width="5" stroke-linecap="round"/>' },
];

export const stickerSVG = (st) => `<svg viewBox="-60 -60 120 120"><circle r="55" fill="#fff"/><circle r="49" fill="${st.bg}"/><g>${st.art}</g><path d="M-30,-40 Q-10,-52 14,-46" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity=".55"/></svg>`;

let got = [];
let seen = [];
try { const d = JSON.parse(localStorage.getItem(KEY) || '{}'); got = d.got || []; seen = d.seen || []; } catch (e) { got = []; seen = []; }
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify({ got, seen })); } catch (e) { /* ignore */ } };

export function initStickers({ audio }) {
  const btn = document.getElementById('stickerBtn');
  const book = document.getElementById('stickers');
  const pop = document.getElementById('stickerPop');
  const queue = [];
  let showing = false;

  const unseen = () => got.some((id) => !seen.includes(id));
  const mark = () => btn.classList.toggle('new', unseen());
  mark();

  function next() {
    if (showing || !queue.length) return;
    showing = true;
    const id = queue.shift();
    const st = STICKERS.find((s) => s.id === id);
    pop.innerHTML = `<div class="sp-card">${stickerSVG(st)}</div>`;
    pop.hidden = false;
    pop.classList.remove('go'); void pop.offsetWidth; pop.classList.add('go');
    [0, 4, 7, 9].forEach((n, i) => setTimeout(() => audio.chime(n + 3), i * 130));
    btn.classList.remove('pulse'); void btn.offsetWidth; btn.classList.add('pulse');
    setTimeout(() => { pop.hidden = true; showing = false; next(); }, 2100);
  }

  function award(id) {
    if (got.includes(id) || !STICKERS.some((s) => s.id === id)) return false;
    got.push(id);
    persist(); mark();
    queue.push(id);
    setTimeout(next, 500);
    return true;
  }

  function render(bounce) {
    book.innerHTML = `<button class="round-btn al-back" aria-label="Back"><svg viewBox="0 0 100 100"><path d="M60,24 l-28,26 28,26" stroke="#fff" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      <div class="sb-count"><svg viewBox="-12 -12 24 24"><path d="M0,-11 L3.2,-3.6 L11,-3.6 L4.8,1.4 L7,9.5 L0,5 L-7,9.5 L-4.8,1.4 L-11,-3.6 L-3.2,-3.6Z" fill="#ffd23f" stroke="#e8b923" stroke-width="1.2"/></svg><span>${got.length} / ${STICKERS.length}</span></div>
      <div class="sb-grid">${STICKERS.map((st, i) => (got.includes(st.id)
        ? `<button class="sb-slot got ${bounce && !seen.includes(st.id) ? 'fresh' : ''}" data-id="${st.id}" style="--r:${((i * 7) % 9) - 4}deg">${stickerSVG(st)}</button>`
        : '<div class="sb-slot empty"><svg viewBox="-60 -60 120 120"><circle r="50" fill="none" stroke="#fff" stroke-width="6" stroke-dasharray="10 10" opacity=".8"/></svg></div>')).join('')}</div>`;
  }

  btn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    audio.pop();
    book.hidden = false;
    render(true);
    got.forEach((id) => { if (!seen.includes(id)) seen.push(id); });
    persist(); mark();
  });
  book.addEventListener('pointerdown', (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.classList.contains('al-back')) { book.hidden = true; book.innerHTML = ''; audio.pop(); return; }
    if (t.dataset.id) {
      audio.chime(3 + Math.floor(Math.random() * 8));
      t.classList.remove('boing'); void t.offsetWidth; t.classList.add('boing');
    }
  });
  return { award, count: () => got.length };
}
