// Photo book: tap the camera to keep a picture of whatever is on screen.
const KEY = 'elsas-castle-photos';
const MAX = 12;
const NS = 'http://www.w3.org/2000/svg';

let photos = [];
try { photos = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { photos = []; }

function persist() {
  while (photos.length) {
    try { localStorage.setItem(KEY, JSON.stringify(photos)); return; } catch (e) { photos.shift(); } // storage full: drop the oldest
  }
  try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
}

export function clearPhotos() { photos = []; persist(); }
export const photoCount = () => photos.length;

function snapshot(source) {
  return new Promise((resolve) => {
    const clone = source.cloneNode(true);
    clone.querySelectorAll('.room-hl, .pond-ring').forEach((e) => e.remove());
    clone.setAttribute('xmlns', NS);
    clone.setAttribute('width', '960');
    clone.setAttribute('height', '540');
    clone.removeAttribute('style');
    const xml = new XMLSerializer().serializeToString(clone);
    const img = new Image();
    img.onload = () => {
      const cv = document.createElement('canvas');
      cv.width = 640; cv.height = 360;
      const g = cv.getContext('2d');
      g.fillStyle = '#fff';
      g.fillRect(0, 0, 640, 360);
      g.drawImage(img, 0, 0, 640, 360);
      try { resolve(cv.toDataURL('image/jpeg', 0.8)); } catch (e) { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
  });
}

export function initPhotos({ audio, getSource, onTaken = () => {} }) {
  const camBtn = document.getElementById('camBtn');
  const albumBtn = document.getElementById('albumBtn');
  const album = document.getElementById('album');
  const flash = document.getElementById('flash');
  let taking = false;

  camBtn.addEventListener('pointerdown', async (e) => {
    e.preventDefault();
    if (taking) return;
    taking = true;
    audio.shutter();
    flash.classList.remove('go'); void flash.offsetWidth; flash.classList.add('go');
    const url = await snapshot(getSource());
    if (url) {
      photos.push(url);
      if (photos.length > MAX) photos.shift();
      persist();
      onTaken();
      fly(url);
    }
    setTimeout(() => { taking = false; }, 500);
  });

  // the new photo flies into the photo book button
  function fly(url) {
    const img = document.createElement('img');
    img.src = url;
    img.className = 'fly-photo';
    document.body.appendChild(img);
    const to = albumBtn.getBoundingClientRect();
    requestAnimationFrame(() => requestAnimationFrame(() => {
      img.style.transform = `translate(${to.x + to.width / 2 - innerWidth / 2}px, ${to.y + to.height / 2 - innerHeight / 2}px) scale(.08) rotate(-8deg)`;
      img.style.opacity = '.2';
    }));
    setTimeout(() => img.remove(), 1100);
    albumBtn.classList.remove('pulse'); void albumBtn.offsetWidth; albumBtn.classList.add('pulse');
  }

  function openAlbum() {
    audio.pop();
    album.hidden = false;
    renderAlbum();
  }
  function renderAlbum() {
    const items = photos.slice().reverse();
    album.innerHTML = `<button class="round-btn al-back" aria-label="Back"><svg viewBox="0 0 100 100"><path d="M60,24 l-28,26 28,26" stroke="#fff" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      <div class="al-grid">${items.length ? items.map((u, i) => `<button class="al-item" data-i="${i}" style="--r:${((i * 7) % 5) - 2}deg"><img src="${u}" alt=""></button>`).join('') : '<div class="al-empty"><svg viewBox="0 0 120 100"><rect x="10" y="26" width="100" height="64" rx="14" fill="#fff"/><circle cx="60" cy="58" r="22" fill="#a98bff"/><circle cx="60" cy="58" r="12" fill="#ffd1e8"/><rect x="40" y="14" width="40" height="16" rx="6" fill="#fff"/></svg></div>'}</div>`;
  }
  album.addEventListener('pointerdown', (e) => {
    const full = album.querySelector('.al-full');
    if (full) { full.remove(); audio.pop(); return; }
    const t = e.target.closest('button');
    if (!t) return;
    if (t.classList.contains('al-back')) { album.hidden = true; album.innerHTML = ''; audio.pop(); return; }
    if (t.classList.contains('al-item')) {
      const url = photos.slice().reverse()[+t.dataset.i];
      const f = document.createElement('div');
      f.className = 'al-full';
      f.innerHTML = `<img src="${url}" alt="">`;
      album.appendChild(f);
      audio.chime(6);
    }
  });
  albumBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); openAlbum(); });

  // used by the trips: keep a picture without any flash or button press
  return {
    async savePhoto(source) {
      const url = await snapshot(source);
      if (!url) return;
      photos.push(url);
      if (photos.length > MAX) photos.shift();
      persist();
      albumBtn.classList.remove('pulse'); void albumBtn.offsetWidth; albumBtn.classList.add('pulse');
    },
  };
}
