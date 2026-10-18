import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { aliasOf, describe } from './pt.js';

// Atlas anatômico: peças reais do BodyParts3D (CC BY-SA 2.1 Japão), convertidas por scripts/build-models.mjs.
// Ordem de carga: o que dá contexto primeiro; músculos e vasos em seguida.
const ORDER = ['pele', 'ossos', 'orgaos', 'nervos', 'musculos', 'vasos'];
const COLOR = { pele: 0xd9a88c, musculos: 0x9c4a3c, ossos: 0xe3dccb, orgaos: 0xc98378, vasos: 0xb53a35, nervos: 0xe8d36a };
const ORGAN_COLOR = { liver: 0x7a3b25, kidney: 0x8e2f3a, stomach: 0xd98c7a, spleen: 0x7b3b5a, pancreas: 0xe0b48a, colon: 0xc89f8d, duodenum: 0xd9a49a, 'urinary bladder': 0xe6d27a, trachea: 0xcfd8e0, esophagus: 0xd9908a, heart: 0xb23a33, lung: 0xe3a1a1, brain: 0xe2a2b4, diaphragm: 0xb86b5a };

const hash = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

export function baseMaterial(layer, en = '') {
  const base = en.replace(/^(right|left) /, '').toLowerCase();
  let color = COLOR[layer];
  if (layer === 'orgaos' && ORGAN_COLOR[base]) color = ORGAN_COLOR[base];
  if (layer === 'vasos' && /vein|vena|veias/.test(en)) color = 0x3a5fa5;
  const c = new THREE.Color(color);
  if (layer === 'musculos') c.offsetHSL(0, 0, ((hash(en) % 100) / 100 - 0.5) * 0.12); // variação leve para separar músculos vizinhos
  const m = new THREE.MeshStandardMaterial({ color: c, roughness: layer === 'ossos' ? 0.7 : 0.55, metalness: 0 });
  if (layer === 'pele') Object.assign(m, { transparent: true, opacity: 0.35, depthWrite: false, roughness: 0.6 });
  return m;
}

export async function loadAtlas({ layers, pickable, onStatus = () => {}, onLayer = () => {} }) {
  const index = await (await fetch('models/index.json')).json();
  const info = new Map();
  for (const p of index) info.set(p.id, p);
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const skinMat = baseMaterial('pele');
  const added = [];
  for (const layer of ORDER) {
    if (!index.some((p) => p.layer === layer)) continue;
    onStatus(`Carregando ${layer}…`);
    const gltf = await loader.loadAsync(`models/${layer}.glb`, (e) => e.total && onStatus(`Carregando ${layer}: ${Math.round((100 * e.loaded) / e.total)}%`));
    gltf.scene.updateMatrixWorld(true);
    const meshes = [];
    gltf.scene.traverse((o) => { if (o.isMesh) meshes.push(o); });
    for (const o of meshes) {
      const p = info.get(o.name) || info.get(o.parent?.name) || {};
      const en = p.en || o.name;
      o.material = layer === 'pele' ? skinMat : baseMaterial(layer, en);
      o.userData = { id: o.name, layer, en, side: p.side || '', pt: p.pt || '', latin: p.latin || '', key: aliasOf(en) || o.name, base: en };
      o.material.userData.base = o.material;
    }
    // remove as formas simples da camada e coloca as peças reais
    const old = layers[layer];
    for (const c of [...old.children]) { old.remove(c); c.geometry?.dispose(); c.material?.dispose(); }
    for (let i = pickable.length - 1; i >= 0; i--) if (pickable[i].userData.layer === layer && !pickable[i].userData.en) pickable.splice(i, 1);
    for (const o of meshes) { old.attach(o); pickable.push(o); added.push(o); }
    onLayer(layer);
  }
  // o atlas não traz nervos periféricos: as formas simples de nervos saem para não flutuar fora do corpo real
  const covered = new Set(added.map((m) => m.userData.layer));
  for (const layer of Object.keys(layers)) {
    if (covered.has(layer)) continue;
    for (const c of [...layers[layer].children]) { layers[layer].remove(c); c.geometry?.dispose(); c.material?.dispose(); }
    for (let i = pickable.length - 1; i >= 0; i--) if (pickable[i].userData.layer === layer) pickable.splice(i, 1);
  }
  onStatus('');
  return { info, skinMat, meshes: added, covered };
}

// extremos (cima/baixo) de uma peça em coordenadas do mundo
export function endpoints(mesh) {
  mesh.updateMatrixWorld(true);
  const pos = mesh.geometry.attributes.position, v = new THREE.Vector3();
  let top = null, bot = null;
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
    if (!top || v.y > top.y) top = v.clone();
    if (!bot || v.y < bot.y) bot = v.clone();
  }
  return { top, bot };
}
