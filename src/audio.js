// Sons SINTÉTICOS gerados por código, só para fins didáticos. Não são gravações clínicas.
const SR = 22050;
let ac;
function ctx() {
  ac ||= new (window.AudioContext || window.webkitAudioContext)();
  if (ac.state === 'suspended') ac.resume();
  return ac;
}

function buffer(seconds, fill) {
  const b = ctx().createBuffer(1, Math.floor(SR * seconds), SR);
  const d = b.getChannelData(0);
  fill(d);
  let peak = 0;
  for (const x of d) peak = Math.max(peak, Math.abs(x));
  if (peak > 0) for (let i = 0; i < d.length; i++) d[i] *= 0.8 / peak;
  return b;
}
const damped = (d, t0, f, tau, amp) => {
  const s = Math.floor(t0 * SR);
  for (let i = 0; i < SR * tau * 6 && s + i < d.length; i++) {
    const t = i / SR;
    d[s + i] += amp * Math.exp(-t / tau) * Math.sin(2 * Math.PI * f * t);
  }
};
// ruído passa-baixa (a maior = mais agudo)
const noise = (n, a) => {
  const out = new Float32Array(n);
  let y = 0;
  for (let i = 0; i < n; i++) { y += a * (Math.random() * 2 - 1 - y); out[i] = y; }
  return out;
};

const HEART = (kind) => buffer(0.8, (d) => {
  damped(d, 0, 55, 0.03, 1); damped(d, 0, 85, 0.025, 0.7);
  damped(d, 0.32, 110, 0.022, 0.8); damped(d, 0.32, 150, 0.018, 0.5);
  if (kind === 'sopro') {
    const n = noise(d.length, 0.25);
    for (let i = Math.floor(0.05 * SR); i < 0.3 * SR; i++) d[i] += 3.2 * n[i] * Math.sin((Math.PI * (i / SR - 0.05)) / 0.25);
  }
  if (kind === 'b3') { damped(d, 0.47, 40, 0.05, 0.6); damped(d, 0.47, 62, 0.03, 0.3); }
});

const LUNG = (kind) => buffer(4, (d) => {
  const N = d.length, n = noise(N, kind === 'ron' ? 0.03 : 0.12);
  const insp = (t) => (t > 0 && t < 1.6 ? Math.sin((Math.PI * t) / 1.6) : 0);
  const exp = (t) => (t > 1.9 && t < 3.2 ? 0.55 * Math.sin((Math.PI * (t - 1.9)) / 1.3) : 0);
  const amp = kind === 'dim' ? 0.25 : kind === 'est' ? 0.5 : 1;
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    let env = insp(t) + exp(t);
    if (kind === 'ron') env *= 0.6 + 0.4 * Math.sin(2 * Math.PI * 28 * t);
    d[i] = n[i] * env * amp * (kind === 'ron' ? 6 : 3);
    if (kind === 'sib') {
      const e = exp(t) * 0.9 + insp(t) * 0.25;
      d[i] += e * 0.35 * (Math.sin(2 * Math.PI * (560 + 60 * Math.sin(t * 3)) * t) + 0.5 * Math.sin(2 * Math.PI * (780 + 40 * Math.sin(t * 2)) * t));
    }
  }
  if (kind === 'est') for (let k = 0; k < 14; k++) damped(d, 0.95 + Math.random() * 0.65, 500 + Math.random() * 500, 0.004, 0.9);
});

// Korotkoff: tapinha por fase (1 a 4); fase 5 = silêncio
const KOROT = (phase) => buffer(0.25, (d) => {
  const f = [0, 62, 55, 70, 40][phase];
  damped(d, 0.01, f, phase === 4 ? 0.02 : 0.03, phase === 4 ? 0.5 : 1);
  damped(d, 0.01, f * 1.9, 0.015, phase === 4 ? 0.2 : 0.7);
  if (phase === 2) { const n = noise(d.length, 0.3); for (let i = Math.floor(0.04 * SR); i < 0.14 * SR; i++) d[i] += 0.6 * n[i]; }
});

const cache = {};
const get = (key, make) => (cache[key] ||= make());

let current = null;
let volume = 0.8;
export const setVolume = (v) => { volume = v; if (current) current.gain.gain.value = v; };
export function stop() { if (current) { try { current.src.stop(); } catch { /* já parado */ } current = null; } }
function play(buf, loop) {
  stop();
  const a = ctx(), src = a.createBufferSource(), gain = a.createGain();
  src.buffer = buf; src.loop = loop; gain.gain.value = volume;
  src.connect(gain).connect(a.destination); src.start();
  current = { src, gain };
}
export const playHeart = (kind) => play(get('h' + kind, () => HEART(kind)), true);
export const playLung = (kind) => play(get('l' + kind, () => LUNG(kind)), true);
export function korotkoff(phase) {
  if (phase < 1 || phase > 4) return;
  const a = ctx(), src = a.createBufferSource(), gain = a.createGain();
  src.buffer = get('k' + phase, () => KOROT(phase)); gain.gain.value = volume;
  src.connect(gain).connect(a.destination); src.start();
}
