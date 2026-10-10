// Tiny WebAudio toolbox: soft chimes, a splash of sparkle and gentle background music.
let ctx = null;
let master = null;
let enabled = true;
let musicTimer = null;
let step = 0;
let noteIdx = 4;

const SCALE = [0, 2, 4, 7, 9]; // major pentatonic: every note sounds nice together
const freq = (i) => 261.63 * Math.pow(2, (SCALE[((i % 5) + 5) % 5] + 12 * Math.floor(i / 5)) / 12);

export function start() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = enabled ? 0.8 : 0;
    master.connect(ctx.destination);
    // a little echo makes everything dreamy
    const delay = ctx.createDelay();
    delay.delayTime.value = 0.32;
    const fb = ctx.createGain();
    fb.gain.value = 0.35;
    const wet = ctx.createGain();
    wet.gain.value = 0.3;
    master.connect(delay);
    delay.connect(fb);
    fb.connect(delay);
    delay.connect(wet);
    wet.connect(ctx.destination);
    document.addEventListener('visibilitychange', () => {
      if (!ctx) return;
      if (document.hidden) ctx.suspend(); else ctx.resume();
    });
  }
  ctx.resume();
  if (!musicTimer) musicTimer = setInterval(musicTick, 650);
}

export function setEnabled(on) {
  enabled = on;
  if (master) master.gain.setTargetAtTime(on ? 0.8 : 0, ctx.currentTime, 0.05);
}

export function isEnabled() { return enabled; }

function tone(f, t0, dur, vol, type = 'sine') {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = f;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g);
  g.connect(master);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
}

function musicTick() {
  if (!ctx || ctx.state !== 'running' || !enabled) return;
  const t = ctx.currentTime + 0.05;
  noteIdx = Math.max(0, Math.min(9, noteIdx + [-2, -1, -1, 0, 1, 1, 2][Math.floor(Math.random() * 7)]));
  if (Math.random() < 0.8) tone(freq(noteIdx), t, 1.6, 0.05);
  if (step % 8 === 0) {
    const root = [0, 3, 2, 4][(step / 8) % 4];
    tone(freq(root - 5), t, 5, 0.04, 'triangle');
    tone(freq(root), t, 5, 0.025, 'triangle');
  }
  step++;
}

export function chime(i = Math.floor(Math.random() * 8) + 3) {
  if (!ctx || !enabled) return;
  const t = ctx.currentTime;
  tone(freq(i), t, 0.9, 0.18);
  tone(freq(i + 2), t + 0.09, 0.9, 0.12);
  tone(freq(i + 4), t + 0.18, 1.1, 0.1);
}

export function pop() {
  if (!ctx || !enabled) return;
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.frequency.setValueAtTime(380, t);
  o.frequency.exponentialRampToValueAtTime(900, t + 0.1);
  g.gain.setValueAtTime(0.2, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
  o.connect(g);
  g.connect(master);
  o.start(t);
  o.stop(t + 0.2);
}

export function neigh() {
  if (!ctx || !enabled) return;
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'triangle';
  o.frequency.setValueAtTime(500, t);
  o.frequency.linearRampToValueAtTime(900, t + 0.12);
  o.frequency.linearRampToValueAtTime(640, t + 0.3);
  o.frequency.linearRampToValueAtTime(820, t + 0.45);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.14, t + 0.04);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
  o.connect(g);
  g.connect(master);
  o.start(t);
  o.stop(t + 0.6);
  setTimeout(() => chime(8), 200);
}

// Welcome home fanfare: a rising rainbow of notes.
export function moveIn() {
  if (!ctx || !enabled) return;
  const t = ctx.currentTime;
  for (let i = 0; i < 6; i++) tone(freq(i + 3), t + i * 0.08, 0.8, 0.13);
}

// ---- lake sounds ----
export function splash() {
  if (!ctx || !enabled) return;
  const t = ctx.currentTime;
  const len = Math.floor(ctx.sampleRate * 0.4);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.setValueAtTime(1800, t);
  f.frequency.exponentialRampToValueAtTime(500, t + 0.35);
  const g = ctx.createGain();
  g.gain.value = 0.35;
  src.connect(f);
  f.connect(g);
  g.connect(master);
  src.start(t);
}

export function bubble() {
  if (!ctx || !enabled) return;
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  const base = 500 + Math.random() * 600;
  o.frequency.setValueAtTime(base, t);
  o.frequency.exponentialRampToValueAtTime(base * 1.8, t + 0.08);
  g.gain.setValueAtTime(0.12, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
  o.connect(g);
  g.connect(master);
  o.start(t);
  o.stop(t + 0.15);
}

export function quack() {
  if (!ctx || !enabled) return;
  const t = ctx.currentTime;
  [0, 0.17].forEach((dt) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(520, t + dt);
    o.frequency.exponentialRampToValueAtTime(300, t + dt + 0.12);
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 1400;
    g.gain.setValueAtTime(0.0001, t + dt);
    g.gain.exponentialRampToValueAtTime(0.15, t + dt + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dt + 0.14);
    o.connect(f);
    f.connect(g);
    g.connect(master);
    o.start(t + dt);
    o.stop(t + dt + 0.16);
  });
}

export function splat() {
  if (!ctx || !enabled) return;
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(220, t);
  o.frequency.exponentialRampToValueAtTime(70, t + 0.2);
  g.gain.setValueAtTime(0.3, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
  o.connect(g);
  g.connect(master);
  o.start(t);
  o.stop(t + 0.3);
}

// ---- extras: camera, munching, birthday song ----
function noiseBurst(t, dur, freq, vol, q = 1) {
  const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = freq;
  f.Q.value = q;
  const g = ctx.createGain();
  g.gain.value = vol;
  src.connect(f);
  f.connect(g);
  g.connect(master);
  src.start(t);
}

export function shutter() {
  if (!ctx || !enabled) return;
  const t = ctx.currentTime;
  noiseBurst(t, 0.05, 3000, 0.5, 2);
  noiseBurst(t + 0.09, 0.07, 1800, 0.4, 2);
  tone(1320, t + 0.16, 0.5, 0.1);
}

export function munch() {
  if (!ctx || !enabled) return;
  const t = ctx.currentTime;
  for (let i = 0; i < 4; i++) noiseBurst(t + i * 0.13, 0.08, 500 + Math.random() * 300, 0.5, 1.5);
}

// Happy Birthday in C major (semitones above middle C, seconds)
const BIRTHDAY = [[7, .3], [7, .15], [9, .45], [7, .45], [12, .45], [11, .9], [7, .3], [7, .15], [9, .45], [7, .45], [14, .45], [12, .9],
  [7, .3], [7, .15], [19, .45], [16, .45], [12, .45], [11, .45], [9, .6], [17, .3], [17, .15], [16, .45], [12, .45], [14, .45], [12, 1]];
export function birthday() {
  if (!ctx || !enabled) return;
  let t = ctx.currentTime + 0.1;
  for (const [semi, dur] of BIRTHDAY) {
    tone(261.63 * Math.pow(2, semi / 12), t, dur * 1.6, 0.14, 'triangle');
    t += dur * 1.05;
  }
}
