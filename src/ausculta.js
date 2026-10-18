import * as THREE from 'three';
import { h, pick, shuffle, store } from './ui.js';
import { AUSC_POINTS, FINDINGS } from './content.js';
import { playHeart, playLung, stop, setVolume } from './audio.js';
import { SOURCES } from './data.js';

const NOTE = 'Sons sintéticos gerados por código, para estudo. Não são gravações clínicas. Pontos e nomenclatura variam entre escolas: siga o protocolo do seu serviço.';
// z da pele do tórax (elipsoide do modelo) para encostar o marcador na superfície
const surf = (x, y) => 0.105 * Math.sqrt(Math.max(1 - ((y - 1.2) / 0.27) ** 2 - (x / 0.18) ** 2, 0.02));

export function mountAusculta(ctx, el) {
  const group = new THREE.Group();
  group.visible = false;
  ctx.scene.add(group);
  const marks = {};
  const place = () => {
    for (const p of AUSC_POINTS) {
      const q = ctx.skinPoint(p.pos[0], p.pos[1], !!p.back);
      marks[p.id].position.copy(q || new THREE.Vector3(p.pos[0], p.pos[1], (surf(p.pos[0], p.pos[1]) + 0.008) * (p.back ? -1 : 1)));
    }
  };
  for (const p of AUSC_POINTS) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.014, 16, 12), new THREE.MeshBasicMaterial({ color: p.tipo === 'cardiaco' ? 0xff6b6b : 0x4dd0e1 }));
    group.add(m);
    marks[p.id] = m;
    ctx.clickables.set(m, () => choose(p.id));
  }
  place();
  ctx.onAtlas(place);

  let mode = 'explorar', sel = null, q = null;
  const heartF = { v: 'normal' }, lungF = { v: 'mv' };
  const score = store.get('ausc', { ok: 0, n: 0 });

  const info = h('div', { class: 'card', 'aria-live': 'polite' }, 'Escolha um ponto no corpo ou na lista para ouvir.');
  const sel1 = (obj, key) => h('select', { onchange: (e) => { obj.v = e.target.value; if (sel) choose(sel); } },
    FINDINGS[key].map((f) => h('option', { value: f.id }, f.label)));
  const list = h('div', { class: 'grp' }, AUSC_POINTS.map((p) => h('button', { 'data-p': p.id, onclick: () => choose(p.id) }, p.nome)));
  const explorar = h('div', {},
    h('label', { class: 'lbl' }, 'Achado cardíaco simulado'), sel1(heartF, 'cardiaco'),
    h('label', { class: 'lbl' }, 'Achado pulmonar simulado'), sel1(lungF, 'pulmonar'),
    h('label', { class: 'lbl' }, 'Volume'), h('input', { type: 'range', min: 0, max: 100, value: 80, oninput: (e) => setVolume(e.target.value / 100) }),
    h('div', { class: 'lbl' }, 'Pontos de ausculta'), list, info,
    h('button', { onclick: stop }, 'Parar som'));

  const optsBox = h('div', { class: 'opts' });
  const fb = h('div', { class: 'card', 'aria-live': 'polite' });
  const scoreEl = h('p', { class: 'note ok' });
  const treino = h('div', { hidden: true },
    h('p', { class: 'latim' }, 'Ouça o som no ponto destacado e identifique o achado.'),
    h('button', { onclick: novo }, 'Novo som'), h('button', { onclick: () => q && play(q.p, q.f.id) }, 'Ouvir de novo'),
    optsBox, fb, scoreEl);

  function play(p, fid) { (p.tipo === 'cardiaco' ? playHeart : playLung)(fid); }
  function mark(id) {
    for (const [k, m] of Object.entries(marks)) m.scale.setScalar(k === id ? 1.9 : 1);
    for (const b of list.children) b.setAttribute('aria-pressed', String(b.dataset.p === id));
  }
  function choose(id) {
    if (mode !== 'explorar') return;
    sel = id;
    const p = AUSC_POINTS.find((x) => x.id === id), f = FINDINGS[p.tipo].find((x) => x.id === (p.tipo === 'cardiaco' ? heartF : lungF).v);
    mark(id);
    info.replaceChildren(h('strong', {}, p.nome), h('div', {}, p.loc), h('div', { class: 'lbl' }, `Som: ${f.label}`), h('div', {}, f.desc));
    play(p, f.id);
  }
  function novo() {
    stop();
    const p = pick(AUSC_POINTS), f = pick(FINDINGS[p.tipo]);
    q = { p, f, done: false };
    mark(p.id);
    fb.replaceChildren();
    optsBox.replaceChildren(...shuffle(FINDINGS[p.tipo]).map((o) => h('button', { onclick: () => answer(o) }, o.label)));
    play(p, f.id);
  }
  function answer(o) {
    if (!q || q.done) return;
    q.done = true;
    const ok = o.id === q.f.id;
    score.n++; if (ok) score.ok++;
    store.set('ausc', score);
    showScore();
    fb.replaceChildren(h('strong', {}, ok ? 'Correto.' : `Não foi esse. Era: ${q.f.label}.`), h('div', {}, q.f.desc), h('div', { class: 'lbl' }, `Ponto: ${q.p.nome} — ${q.p.loc}`));
  }
  const showScore = () => { scoreEl.textContent = `Acertos neste navegador: ${score.ok} de ${score.n}.`; };
  showScore();

  const setMode = (m) => {
    mode = m; stop(); mark(null); sel = null;
    explorar.hidden = m !== 'explorar'; treino.hidden = m !== 'treino';
    for (const b of modes.children) b.setAttribute('aria-pressed', String(b.dataset.m === m));
    if (m === 'treino') novo();
  };
  const modes = h('div', { class: 'grp' },
    h('button', { 'data-m': 'explorar', 'aria-pressed': 'true', onclick: () => setMode('explorar') }, 'Explorar'),
    h('button', { 'data-m': 'treino', 'aria-pressed': 'false', onclick: () => setMode('treino') }, 'Treino'));
  const side = h('div', { class: 'grp' },
    h('button', { onclick: () => ctx.fly([0, 1.32, 1.55], [0, 1.25, 0]) }, 'Ver frente'),
    h('button', { onclick: () => ctx.fly([0, 1.32, -1.55], [0, 1.25, 0]) }, 'Ver costas'));

  el.append(h('h2', {}, 'Ausculta cardíaca e pulmonar'), h('p', { class: 'latim' }, 'Estetoscópio virtual com sons sintéticos.'),
    modes, side, explorar, treino, h('p', { class: 'note' }, NOTE),
    h('p', { class: 'src' }, `Fontes: ${SOURCES[7]} ${SOURCES[1]}`));

  return {
    enter() { group.visible = true; ctx.fly([0, 1.32, 1.55], [0, 1.25, 0]); },
    leave() { group.visible = false; stop(); },
  };
}
