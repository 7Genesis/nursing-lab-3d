import './style.css';
import * as THREE from 'three';
import gsap from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { buildBody } from './body.js';
import { createMonitor, SCENARIOS } from './monitor.js';
import { STRUCTURES, SOURCES, LAYERS } from './data.js';
import { mountAusculta } from './ausculta.js';
import { mountPressao } from './pressao.js';
import { mountQuiz, mountCases } from './avaliacao.js';

const $ = (id) => document.getElementById(id);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const canvas = $('gl');

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
} catch {
  $('loading').hidden = true; $('fail').hidden = false;
  throw new Error('WebGL indisponível');
}
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0f14);
const camera = new THREE.PerspectiveCamera(35, 1, 0.05, 50);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.minDistance = 0.5; controls.maxDistance = 7;
controls.listenToKeyEvents(canvas);

scene.add(new THREE.HemisphereLight(0xcfe3ff, 0x1a2430, 1.1));
const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(2, 3, 4); scene.add(key);
const rim = new THREE.DirectionalLight(0x4cd9a0, 1.2); rim.position.set(-3, 2, -3); scene.add(rim);
const floor = new THREE.Mesh(new THREE.CircleGeometry(1.6, 64), new THREE.MeshStandardMaterial({ color: 0x111b23, roughness: 1 }));
floor.rotation.x = -Math.PI / 2; scene.add(floor);

// paciente
const { root: body, layers, pickable } = buildBody();
scene.add(body);

// monitor com tela viva
const monitor = createMonitor(syncMonitorUi);
const MON = { pos: new THREE.Vector3(-1.05, 0, 0.45), rotY: 0.27 };
const monGroup = new THREE.Group();
monGroup.position.copy(MON.pos); monGroup.rotation.y = MON.rotY;
const shell = new THREE.MeshStandardMaterial({ color: 0x1a2229, roughness: 0.5, metalness: 0.3 });
const casing = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.5, 0.07), shell); casing.position.y = 1.25;
const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 0.425), new THREE.MeshBasicMaterial({ map: monitor.texture, toneMapped: false }));
screen.position.set(0, 1.25, 0.036);
const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.0, 12), shell); pole.position.y = 0.72;
const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.03, 24), shell); base.position.y = 0.015;
monGroup.add(casing, screen, pole, base);
scene.add(monGroup);

// vistas
const VIEWS = {
  anterior: { p: [0, 1.25, 4.2], t: [0, 1.0, 0] },
  posterior: { p: [0, 1.25, -4.2], t: [0, 1.0, 0] },
  lateral: { p: [4.2, 1.25, 0], t: [0, 1.0, 0] },
  // desloca a câmera para a direita do monitor, para o painel lateral não cobrir a tela
  tela: { p: [MON.pos.x + Math.sin(MON.rotY) * 1.7 + Math.cos(MON.rotY) * 0.3, 1.28, MON.pos.z + Math.cos(MON.rotY) * 1.7 - Math.sin(MON.rotY) * 0.3], t: [MON.pos.x + Math.cos(MON.rotY) * 0.3, 1.25, MON.pos.z - Math.sin(MON.rotY) * 0.3] },
};
function fly(p, t, d = 1) {
  const dur = reduce ? 0 : d;
  gsap.to(camera.position, { x: p[0], y: p[1], z: p[2], duration: dur, ease: 'power2.inOut' });
  gsap.to(controls.target, { x: t[0], y: t[1], z: t[2], duration: dur, ease: 'power2.inOut', onUpdate: () => controls.update() });
}
function view(name) { const w = VIEWS[name]; fly(w.p, w.t); }
camera.position.set(...VIEWS.anterior.p); controls.target.set(...VIEWS.anterior.t); controls.update();

// camadas
const layerBar = $('b-layers'), layerBtns = {};
function setLayer(k, on) {
  layerBtns[k].setAttribute('aria-pressed', String(on)); layers[k].visible = on;
  if (!on && sel && STRUCTURES[sel] && layers[k].children.some((m) => m.userData.id === sel)) select(null);
}
for (const [k, label] of LAYERS) {
  const b = document.createElement('button');
  b.textContent = label; b.setAttribute('aria-pressed', 'true');
  b.onclick = () => setLayer(k, b.getAttribute('aria-pressed') !== 'true');
  layerBtns[k] = b;
  layerBar.append(b);
}
$('b-op').oninput = (e) => layers.pele.children.forEach((m) => { m.material.opacity = e.target.value / 100; });
$('b-views').onclick = (e) => { if (e.target.dataset.view) view(e.target.dataset.view); };

// seleção
let sel = null;
const list = $('s-list');
list.append(new Option('— escolher —', ''));
for (const [id, s] of Object.entries(STRUCTURES)) list.append(new Option(`${s.n} (${s.s})`, id));
list.onchange = () => select(list.value || null, true);

function highlight(id) {
  for (const m of pickable) m.material.emissive?.setHex(m.userData.id === id && id ? 0x2a6bff : 0x000000);
}
function select(id, focus) {
  sel = id; highlight(id); list.value = id || '';
  const s = id && STRUCTURES[id];
  $('s-info').hidden = $('s-focus').hidden = !s;
  $('s-nome').textContent = s ? s.n : 'Selecione uma estrutura';
  $('s-latim').textContent = s ? `${s.l} · Terminologia Anatomica` : 'Clique no corpo ou escolha na lista.';
  if (!s) return;
  $('s-sis').textContent = s.s; $('s-fun').textContent = s.f; $('s-enf').textContent = s.e; $('s-ris').textContent = s.r;
  $('s-src').textContent = s.src.map((i) => SOURCES[i]).join(' ');
  if (focus) zoomTo(id);
}
function zoomTo(id) {
  const box = new THREE.Box3();
  pickable.filter((m) => m.userData.id === id).forEach((m) => box.expandByObject(m));
  if (box.isEmpty()) return;
  const c = box.getCenter(new THREE.Vector3()), size = box.getSize(new THREE.Vector3()).length();
  const dir = camera.position.clone().sub(controls.target).normalize();
  const p = c.clone().add(dir.multiplyScalar(Math.max(0.6, size * 1.8)));
  fly(p.toArray(), c.toArray(), 0.9);
}
$('s-focus').onclick = () => sel && zoomTo(sel);

const clickables = new Map(), frameFns = new Set();
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
let down = null;
canvas.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
canvas.addEventListener('pointerup', (e) => {
  if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5 || performance.now() - down.t > 500) return;
  const r = canvas.getBoundingClientRect();
  ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const sh = ray.intersectObject(screen)[0];
  const hits = ray.intersectObjects(pickable.filter((m) => m.parent.visible));
  const ck = ray.intersectObjects([...clickables.keys()].filter((m) => m.parent.visible))[0];
  if (ck && (!hits[0] || ck.distance < hits[0].distance + 0.05) && (!sh || ck.distance < sh.distance)) { clickables.get(ck.object)(); return; }
  if (sh && (!hits[0] || sh.distance < hits[0].distance)) { monitor.press(sh.uv.x, sh.uv.y); return; }
  const h = hits.find((x) => x.object.userData.id !== 'pele') || hits[0];
  select(h ? h.object.userData.id : null);
});

// abas
const mods = {};
let current = 'anatomia';
function tab(name) {
  mods[current]?.leave?.();
  current = name;
  for (const b of document.querySelectorAll('[role=tab]')) b.setAttribute('aria-selected', String(b.dataset.tab === name));
  for (const p of document.querySelectorAll('[data-panel]')) p.hidden = p.dataset.panel !== name;
  $('side').classList.toggle('wide', ['pa', 'quiz', 'casos'].includes(name));
  if (mods[name]) mods[name].enter(); else view(name === 'tela' ? 'tela' : 'anterior');
}
document.querySelector('nav').onclick = (e) => e.target.dataset.tab && tab(e.target.dataset.tab);
const mctx = { scene, layers, fly, view, zoomTo, highlight, setLayer, monitor, clickables, goTab: tab, onFrame: (fn) => frameFns.add(fn) };
const mount = (name, fn) => { mods[name] = fn(mctx, document.querySelector(`[data-panel=${name}]`)); };
mount('ausculta', mountAusculta); mount('pa', mountPressao); mount('quiz', mountQuiz); mount('casos', mountCases);

// painel do monitor
const scen = $('m-scen');
for (const k of monitor.ORDER) {
  const b = document.createElement('button');
  b.textContent = SCENARIOS[k].label; b.dataset.k = k;
  b.onclick = () => monitor.setScenario(k);
  scen.append(b);
}
$('m-freeze').onclick = () => monitor.set({ frozen: !monitor.state.frozen });
$('m-alarm').onclick = () => monitor.set({ alarms: !monitor.state.alarms });
$('m-speed').onchange = (e) => monitor.set({ speed: Number(e.target.value) });
$('m-pain').oninput = (e) => monitor.set({ pain: Number(e.target.value) });
function syncMonitorUi(s) {
  for (const b of scen.children) b.setAttribute('aria-pressed', String(b.dataset.k === s.sc));
  $('m-freeze').setAttribute('aria-pressed', String(s.frozen));
  $('m-alarm').setAttribute('aria-pressed', String(s.alarms));
  $('m-alarm').textContent = s.alarms ? 'Alarmes ligados' : 'Alarmes silenciados';
  $('m-pain-out').textContent = s.pain;
}
syncMonitorUi(monitor.state);

// loop
function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
}
addEventListener('resize', resize); resize();
const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.1);
  monitor.update(dt);
  frameFns.forEach((fn) => fn(dt));
  controls.update();
  renderer.render(scene, camera);
  $('loading').classList.add('done');
});
