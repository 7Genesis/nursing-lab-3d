import * as THREE from 'three';
import { h } from './ui.js';
import { BP_TRUTH, BP_FACTORS } from './content.js';
import { korotkoff, setVolume } from './audio.js';
import { SOURCES } from './data.js';

const NOTE = 'Simulação educacional. O sentido do erro de cada fator segue a literatura; o deslocamento em mmHg é ilustrativo do simulador. Não substitui treinamento supervisionado nem o protocolo do serviço.';
const INFLATE = 30, DEFLATE_SLOW = 2, DEFLATE_FAST = 40; // mmHg/s

// categorias ACC/AHA 2017 para adulto (didático); hipotensão = limite didático do módulo
export function classify(s, d) {
  if (s < 90 || d < 60) return 'Abaixo do limite didático (hipotensão)';
  if (s >= 140 || d >= 90) return 'Hipertensão estágio 2';
  if (s >= 130 || d >= 80) return 'Hipertensão estágio 1';
  if (s >= 120) return 'Elevada';
  return 'Normal';
}

export function mountPressao(ctx, el) {
  // braçadeira no braço direito do paciente (x negativo)
  const A = new THREE.Vector3(-0.2, 1.4, 0), B = new THREE.Vector3(-0.27, 1.13, 0);
  const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.058, 0.1, 24, 1, true), new THREE.MeshStandardMaterial({ color: 0x2f6fb5, side: THREE.DoubleSide, roughness: 0.8 }));
  cuff.position.copy(A).lerp(B, 0.55);
  cuff.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
  cuff.visible = false;
  ctx.scene.add(cuff);

  const choice = { truth: 'normo', cuff: 'ok', arm: 'ok', pos: 'ok' };
  const st = { P: 0, auto: false, fast: false, inflating: false, maxP: 0, fastIn: 0, beat: 0, sysU: null, diaU: null, showPhase: false };

  const truth = () => BP_TRUTH[choice.truth];
  const measured = () => {
    let ds = 0, dd = 0;
    for (const k of ['cuff', 'arm', 'pos']) { const o = BP_FACTORS[k].opts[choice[k]]; ds += o.ds; dd += o.dd; }
    const t = truth();
    return { sys: t.sys + ds, dia: t.dia + dd };
  };
  const phaseAt = (P) => {
    const { sys, dia } = measured();
    if (P >= sys || P <= dia) return 0;
    const f = (sys - P) / (sys - dia);
    return f < 0.15 ? 1 : f < 0.4 ? 2 : f < 0.75 ? 3 : 4;
  };

  // mostrador analógico
  const dial = h('canvas', { width: 240, height: 240, role: 'img', 'aria-label': 'Manômetro do esfigmomanômetro' });
  const dctx = dial.getContext('2d');
  function drawDial() {
    const c = dctx; c.clearRect(0, 0, 240, 240);
    c.fillStyle = '#0c1216'; c.beginPath(); c.arc(120, 120, 114, 0, 7); c.fill();
    c.strokeStyle = '#2b3d48'; c.lineWidth = 3; c.stroke();
    c.fillStyle = '#e6eef3'; c.font = '12px ui-monospace,monospace'; c.textAlign = 'center'; c.textBaseline = 'middle';
    for (let v = 0; v <= 300; v += 10) {
      const a = Math.PI * 0.75 + (v / 300) * Math.PI * 1.5, big = v % 50 === 0;
      c.strokeStyle = big ? '#e6eef3' : '#5b7280'; c.lineWidth = big ? 2 : 1;
      c.beginPath(); c.moveTo(120 + Math.cos(a) * (big ? 88 : 96), 120 + Math.sin(a) * (big ? 88 : 96)); c.lineTo(120 + Math.cos(a) * 104, 120 + Math.sin(a) * 104); c.stroke();
      if (big) c.fillText(String(v), 120 + Math.cos(a) * 72, 120 + Math.sin(a) * 72);
    }
    const a = Math.PI * 0.75 + (Math.min(st.P, 300) / 300) * Math.PI * 1.5;
    c.strokeStyle = '#ff6b6b'; c.lineWidth = 3; c.beginPath(); c.moveTo(120, 120); c.lineTo(120 + Math.cos(a) * 92, 120 + Math.sin(a) * 92); c.stroke();
    c.fillStyle = '#e6eef3'; c.font = '700 20px ui-monospace,monospace'; c.fillText(`${Math.round(st.P)} mmHg`, 120, 196);
  }

  const out = h('div', { class: 'card', 'aria-live': 'polite' }, 'Infle acima da pressão sistólica esperada e esvazie devagar, ouvindo os sons. Registre a PAS no primeiro som e a PAD quando os sons desaparecerem.');
  const phaseEl = h('p', { class: 'lbl' });
  const mk = (key) => h('label', { class: 'lbl' }, BP_FACTORS[key].label,
    h('select', { onchange: (e) => { choice[key] = e.target.value; reset(); } },
      Object.entries(BP_FACTORS[key].opts).map(([k, o]) => h('option', { value: k }, o.label))));
  const hold = (label, on, off) => h('button', { onpointerdown: (e) => { e.preventDefault(); on(); }, onpointerup: off, onpointerleave: off, onpointercancel: off, onkeydown: (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); on(); } }, onkeyup: (e) => { if (e.key === ' ' || e.key === 'Enter') off(); } }, label);
  const autoBtn = h('button', { 'aria-pressed': 'false', onclick: () => { st.auto = !st.auto; autoBtn.setAttribute('aria-pressed', String(st.auto)); } }, 'Esvaziar devagar (2 mmHg/s)');

  function register(which) {
    st[which] = Math.round(st.P);
    out.replaceChildren(h('div', {}, `Registrado: PAS ${st.sysU ?? '—'} · PAD ${st.diaU ?? '—'} mmHg`));
    if (st.sysU != null && st.diaU != null) evaluate();
  }
  function evaluate() {
    const m = measured(), t = truth(), tol = 4;
    const eS = st.sysU - m.sys, eD = st.diaU - m.dia;
    const notes = [];
    for (const k of ['cuff', 'arm', 'pos']) { const o = BP_FACTORS[k].opts[choice[k]]; if (o.ds || o.dd) notes.push(`${BP_FACTORS[k].label}: ${o.label}. ${o.why}`); }
    if (st.maxP < m.sys + 10) notes.push('Você insuflou pouco acima da PAS: pode perder o primeiro som. Insufle cerca de 30 mmHg acima da PAS estimada.');
    if (st.fastIn > 1) notes.push('Esvaziou rápido durante a medida: o ideal é cerca de 2 mmHg por segundo.');
    const ok = (e) => (Math.abs(e) <= tol ? 'dentro da tolerância (±4)' : `fora da tolerância: ${e > 0 ? '+' : ''}${e}`);
    out.replaceChildren(
      h('strong', {}, `Você registrou ${st.sysU}/${st.diaU} mmHg`),
      h('div', {}, `Valor simulado da medida: ${m.sys}/${m.dia} mmHg (PAS ${ok(eS)}; PAD ${ok(eD)}).`),
      h('div', {}, `Valor verdadeiro do paciente fictício: ${t.sys}/${t.dia} mmHg.`),
      h('div', {}, `Categoria da medida registrada (ACC/AHA 2017, adulto, didático): ${classify(st.sysU, st.diaU)}.`),
      ...notes.map((n) => h('div', { class: 'lbl' }, n)),
      h('div', { class: 'note' }, 'Uma única medida não fecha diagnóstico: a classificação exige medidas repetidas e avaliação profissional.'));
  }
  function reset() {
    Object.assign(st, { P: 0, maxP: 0, fastIn: 0, beat: 0, sysU: null, diaU: null, inflating: false, fast: false });
    out.replaceChildren('Nova medida. Infle acima da PAS esperada e esvazie devagar.');
    cuff.material.color.set(choice.cuff === 'small' ? 0xb5822f : choice.cuff === 'large' ? 0x7b2fb5 : 0x2f6fb5);
    cuff.scale.set(1, choice.cuff === 'small' ? 0.6 : choice.cuff === 'large' ? 1.5 : 1, 1);
  }

  const truthSel = h('select', { onchange: (e) => { choice.truth = e.target.value; reset(); } }, Object.entries(BP_TRUTH).map(([k, o]) => h('option', { value: k }, o.label)));
  el.append(
    h('h2', {}, 'Aferição da pressão arterial'), h('p', { class: 'latim' }, 'Método auscultatório, artéria braquial, sons de Korotkoff sintéticos.'),
    h('label', { class: 'lbl' }, 'Paciente fictício', truthSel), mk('cuff'), mk('arm'), mk('pos'),
    h('div', { class: 'dial' }, dial),
    h('div', { class: 'grp' }, hold('Inflar (segure)', () => { st.inflating = true; }, () => { st.inflating = false; }), autoBtn, hold('Esvaziar rápido (segure)', () => { st.fast = true; }, () => { st.fast = false; })),
    h('div', { class: 'grp' }, h('button', { onclick: () => register('sysU') }, 'Registrar PAS'), h('button', { onclick: () => register('diaU') }, 'Registrar PAD'), h('button', { onclick: reset }, 'Reiniciar')),
    h('label', { class: 'lbl' }, 'Volume dos sons', h('input', { type: 'range', min: 0, max: 100, value: 80, oninput: (e) => setVolume(e.target.value / 100) })),
    h('label', { class: 'lbl' }, h('input', { type: 'checkbox', onchange: (e) => { st.showPhase = e.target.checked; } }), ' Mostrar a fase de Korotkoff (ajuda didática)'),
    phaseEl, out, h('p', { class: 'note' }, NOTE), h('p', { class: 'src' }, `Fontes: ${SOURCES[4]} ${SOURCES[6]}`));
  reset(); drawDial();

  let active = false;
  ctx.onFrame((dt) => {
    if (!active) return;
    const rate = st.inflating ? INFLATE : st.fast ? -DEFLATE_FAST : st.auto ? -DEFLATE_SLOW : 0;
    st.P = Math.min(300, Math.max(0, st.P + rate * dt));
    st.maxP = Math.max(st.maxP, st.P);
    const m = measured();
    if (st.fast && st.P < m.sys + 10 && st.P > m.dia - 10) st.fastIn += dt;
    st.beat += dt;
    const iv = 60 / truth().hr;
    if (st.beat >= iv) { st.beat -= iv; if (phaseAt(st.P)) korotkoff(phaseAt(st.P)); }
    phaseEl.textContent = st.showPhase ? `Fase de Korotkoff agora: ${phaseAt(st.P) ? ['', 'I', 'II', 'III', 'IV'][phaseAt(st.P)] : 'sem som'}` : '';
    drawDial();
  });

  return {
    enter() { active = true; cuff.visible = true; reset(); ctx.fly([-0.85, 1.3, 1.25], [-0.22, 1.25, 0]); },
    leave() { active = false; cuff.visible = false; },
  };
}
