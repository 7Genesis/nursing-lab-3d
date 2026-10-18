import * as THREE from 'three';

// Valores e traçados SIMULADOS, de adulto, para estudo. Não representam medições reais.
export const SCENARIOS = {
  estavel: { label: 'Estável', short: 'ESTÁVEL', fc: 75, fr: 16, pas: 120, pad: 80, spo2: 98, temp: 36.6, nota: 'Parâmetros dentro das faixas didáticas do módulo.' },
  taquicardia: { label: 'Taquicardia', short: 'TAQUI', fc: 128, fr: 20, pas: 118, pad: 76, spo2: 97, temp: 36.8, nota: 'Frequência cardíaca acima de 100 bpm em repouso.' },
  bradicardia: { label: 'Bradicardia', short: 'BRADI', fc: 48, fr: 14, pas: 108, pad: 68, spo2: 97, temp: 36.4, nota: 'Frequência cardíaca abaixo de 60 bpm.' },
  hipoxemia: { label: 'Hipoxemia', short: 'HIPOX', fc: 108, fr: 26, pas: 130, pad: 85, spo2: 86, temp: 36.7, nota: 'Saturação baixa com taquipneia e taquicardia compensatórias.' },
  febre: { label: 'Febre', short: 'FEBRE', fc: 104, fr: 21, pas: 118, pad: 74, spo2: 97, temp: 39.0, nota: 'Temperatura elevada; a frequência cardíaca costuma subir junto.' },
  hipotensao: { label: 'Hipotensão', short: 'HIPOT', fc: 110, fr: 21, pas: 82, pad: 50, spo2: 95, temp: 36.5, nota: 'Pressão sistólica baixa com taquicardia e pulso fino.' },
};
const ORDER = Object.keys(SCENARIOS);

// Limites didáticos usados só para colorir e sinalizar na tela do módulo.
const LIMITS = {
  fc: [60, 100, 'FC'], fr: [12, 20, 'FR'], spo2: [95, 101, 'SpO2'], pas: [90, 140, 'PA'], temp: [36, 37.8, 'TEMP'],
};
const out = (k, x) => x < LIMITS[k][0] || x > LIMITS[k][1];

const W = 1024, H = 640, PX = 200; // px/s de varredura a 1x
const g = (x, m, s) => Math.exp(-((x - m) ** 2) / (2 * s * s));

function ecg(ts, T) {
  const tt = 0.2 + 0.35 * (T - 0.2);
  return 0.12 * g(ts, 0.08, 0.022) - 0.1 * g(ts, 0.168, 0.007) + 1.0 * g(ts, 0.185, 0.009) - 0.22 * g(ts, 0.2, 0.009) + 0.3 * g(ts, tt, 0.04);
}
function ppg(ts, T) {
  const u = (ts - 0.2 + T) % T;
  return g(u, 0.15, 0.06) + 0.32 * g(u, 0.38, 0.07);
}

export function createMonitor(onChange = () => {}) {
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  const st = { sc: 'estavel', frozen: false, speed: 1, alarms: true, pain: 0 };
  const val = { ...SCENARIOS.estavel };
  const cols = 640, ecgY = new Float32Array(cols), ppgY = new Float32Array(cols);
  let cur = 0, beatT = 0, acc = 0, clock = 0;
  const buttons = ORDER.map((k, i) => ({ k, x: 14 + i * 166, y: 578, w: 158, h: 48 }));

  const mono = 'ui-monospace, Menlo, Consolas, monospace';
  const sans = 'system-ui, -apple-system, Segoe UI, sans-serif';

  function setScenario(k) {
    if (!SCENARIOS[k]) return;
    st.sc = k; onChange(st);
  }
  function set(patch) { Object.assign(st, patch); onChange(st); }

  function step(dt) {
    clock += dt;
    const tgt = SCENARIOS[st.sc];
    const k = 1 - Math.exp(-dt * 1.5);
    for (const key of ['fc', 'fr', 'pas', 'pad', 'spo2', 'temp']) {
      val[key] += (tgt[key] - val[key]) * k;
    }
    if (st.frozen) return;
    const hr = Math.max(30, val.fc + Math.sin(clock * 0.8) * 1.2);
    const T = 60 / hr;
    const amp = Math.min(1, Math.max(0.35, (val.pas - 60) / 60));
    acc += dt * PX * st.speed;
    const n = Math.floor(acc);
    acc -= n;
    for (let i = 0; i < n; i++) {
      beatT += 1 / (PX * st.speed);
      if (beatT >= T) beatT -= T;
      ecgY[cur] = ecg(beatT, T);
      ppgY[cur] = ppg(beatT, T) * amp;
      cur = (cur + 1) % cols;
      for (let j = 1; j <= 8; j++) { ecgY[(cur + j) % cols] = NaN; ppgY[(cur + j) % cols] = NaN; }
    }
  }

  function trace(arr, x0, y0, w, h, color, scale, base) {
    ctx.strokeStyle = color; ctx.lineWidth = 2.4; ctx.beginPath();
    let pen = false;
    for (let i = 0; i < cols; i++) {
      const y = arr[i];
      if (Number.isNaN(y)) { pen = false; continue; }
      const px = x0 + (i / cols) * w, py = y0 + h * base - y * scale;
      if (pen) ctx.lineTo(px, py); else { ctx.moveTo(px, py); pen = true; }
    }
    ctx.stroke();
  }

  function tile(label, x, y, w, h, color, big, small, bad) {
    ctx.fillStyle = bad && Math.floor(clock * 2) % 2 && st.alarms ? '#4a1414' : '#0c1216';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = bad ? '#ff5252' : '#1e2b33'; ctx.lineWidth = 2; ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = color; ctx.font = `600 18px ${mono}`; ctx.textBaseline = 'top'; ctx.fillText(label, x + 12, y + 8);
    ctx.font = `700 48px ${mono}`; ctx.fillText(big, x + 12, y + 28);
    if (small) { ctx.font = `500 16px ${mono}`; ctx.fillStyle = '#8aa0ad'; ctx.fillText(small, x + w - 12 - ctx.measureText(small).width, y + h - 26); }
  }

  function draw() {
    ctx.fillStyle = '#05090c'; ctx.fillRect(0, 0, W, H);
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#101a20'; ctx.fillRect(0, 0, W, 40);
    ctx.fillStyle = '#e9f2f7'; ctx.font = `600 20px ${sans}`;
    ctx.fillText(`Paciente fictício · ${SCENARIOS[st.sc].label}`, 14, 10);
    ctx.fillStyle = '#ffcc4d'; ctx.font = `700 16px ${mono}`;
    const tag = 'SIMULADO · DADOS FICTÍCIOS';
    ctx.fillText(tag, W - 14 - ctx.measureText(tag).width, 12);

    // grade e traçados
    ctx.strokeStyle = '#0f1d22'; ctx.lineWidth = 1;
    for (let x = 0; x <= 680; x += 40) { ctx.beginPath(); ctx.moveTo(14 + x, 52); ctx.lineTo(14 + x, 410); ctx.stroke(); }
    for (let y = 52; y <= 410; y += 40) { ctx.beginPath(); ctx.moveTo(14, y); ctx.lineTo(694, y); ctx.stroke(); }
    ctx.fillStyle = '#4cd964'; ctx.font = `600 16px ${mono}`; ctx.fillText('ECG II', 22, 58);
    ctx.fillStyle = '#4dd0e1'; ctx.fillText('PLETISMOGRAFIA', 22, 238);
    trace(ecgY, 14, 52, 680, 170, '#4cd964', 110, 0.78);
    trace(ppgY, 14, 232, 680, 170, '#4dd0e1', 100, 0.85);
    if (st.frozen) { ctx.fillStyle = '#ffcc4d'; ctx.font = `700 22px ${mono}`; ctx.fillText('CONGELADO', 560, 58); }

    // nota e alarmes
    const alarms = [];
    if (out('fc', val.fc)) alarms.push(val.fc > 100 ? 'FC ALTA' : 'FC BAIXA');
    if (out('fr', val.fr)) alarms.push(val.fr > 20 ? 'FR ALTA' : 'FR BAIXA');
    if (out('spo2', val.spo2)) alarms.push('SpO2 BAIXA');
    if (out('pas', val.pas)) alarms.push(val.pas < 90 ? 'PA BAIXA' : 'PA ALTA');
    if (out('temp', val.temp)) alarms.push(val.temp > 37.8 ? 'TEMP ALTA' : 'TEMP BAIXA');
    ctx.fillStyle = '#8aa0ad'; ctx.font = `500 17px ${sans}`;
    wrap(SCENARIOS[st.sc].nota, 14, 422, 680, 22);
    ctx.fillStyle = '#6b8190'; ctx.font = `500 14px ${sans}`;
    wrap('Limites do módulo (didáticos, adulto): FC 60–100 · FR 12–20 · SpO2 ≥ 95% · PAS ≥ 90 · Temp < 37,8 °C. Siga o protocolo local.', 14, 468, 680, 19);
    if (alarms.length) {
      const on = !st.alarms || Math.floor(clock * 2) % 2 === 0;
      ctx.fillStyle = on ? '#ff5252' : '#7a2323'; ctx.font = `700 22px ${mono}`;
      ctx.fillText((st.alarms ? '⚠ ' : '(silenciado) ') + alarms.join(' · '), 14, 530);
    }

    // números
    const x = 712, w = 298, h = 82, gap = 6;
    tile('FC  bpm', x, 50, w, h, '#4cd964', String(Math.round(val.fc)), '', out('fc', val.fc));
    tile('SpO2  %', x, 50 + (h + gap), w, h, '#4dd0e1', String(Math.round(val.spo2)), '', out('spo2', val.spo2));
    tile('PA  mmHg', x, 50 + 2 * (h + gap), w, h, '#f5f5f5', `${Math.round(val.pas)}/${Math.round(val.pad)}`, `PAM ${Math.round((val.pas + 2 * val.pad) / 3)}`, out('pas', val.pas));
    tile('FR  irpm', x, 50 + 3 * (h + gap), w, h, '#ffd54f', String(Math.round(val.fr)), '', out('fr', val.fr));
    tile('TEMP  °C', x, 50 + 4 * (h + gap), w, h, '#ff9e57', val.temp.toFixed(1).replace('.', ','), '', out('temp', val.temp));
    tile('DOR  0–10', x, 50 + 5 * (h + gap), w, h - 8, '#d7a8ff', String(st.pain), '', false);

    // teclas de cenário (a tela é clicável no 3D)
    for (const b of buttons) {
      const on = b.k === st.sc;
      ctx.fillStyle = on ? '#1c6b4a' : '#14212a'; ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, 10); ctx.fill();
      ctx.strokeStyle = on ? '#4cd964' : '#2b3d48'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#e9f2f7'; ctx.font = `700 18px ${mono}`;
      ctx.fillText(SCENARIOS[b.k].short, b.x + (b.w - ctx.measureText(SCENARIOS[b.k].short).width) / 2, b.y + 15);
    }
    texture.needsUpdate = true;
  }

  function wrap(text, x, y, maxW, lh) {
    let line = '';
    for (const word of text.split(' ')) {
      const t = line ? line + ' ' + word : word;
      if (ctx.measureText(t).width > maxW && line) { ctx.fillText(line, x, y); y += lh; line = word; } else line = t;
    }
    ctx.fillText(line, x, y);
  }

  function press(u, v2) {
    const x = u * W, y = (1 - v2) * H;
    const b = buttons.find((q) => x >= q.x && x <= q.x + q.w && y >= q.y && y <= q.y + q.h);
    if (b) setScenario(b.k);
    return !!b;
  }

  let last = 0;
  function update(dt) {
    step(dt);
    last += dt;
    if (last > 1 / 30) { last = 0; draw(); }
  }
  draw();

  return { texture, state: st, setScenario, set, update, press, ORDER };
}
