// Gera os GLBs do app (public/models/*.glb + index.json) a partir de duas fontes abertas:
//   Z-Anatomy (CC BY-SA 4.0): ossos, músculos, órgãos, cérebro e nervos  -> saída de scripts/zanatomy-dump.py
//   BodyParts3D (CC BY-SA 2.1 Japão): pele e vasos                        -> OBJ originais + listas de partes
// Uso: node scripts/build-models.mjs --za <pasta-dump> [--bp <pasta-bp3d>] [--ta <TA2.csv>] [--dry]
// Os dados de origem não entram no repositório; só os GLBs gerados.
import fs from 'node:fs';
import path from 'node:path';
import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { quantize, meshopt } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';

const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const ZA = arg('--za'), BP = arg('--bp'), TA = arg('--ta'), DRY = process.argv.includes('--dry');
if (!ZA) { console.error('uso: node scripts/build-models.mjs --za <dump> [--bp <bp3d>] [--ta TA2.csv] [--dry]'); process.exit(1); }
const OUT = path.resolve('public/models');
const RATIO = { pele: 0.1, musculos: 0.3, ossos: 0.25, orgaos: 0.3, vasos: 0.08, nervos: 0.2 };

// ---------- geometria (metros; saída: y para cima, z para a frente, direita do paciente = x negativo) ----------
function readBin(file) {
  const b = fs.readFileSync(file);
  const nv = b.readInt32LE(0), nt = b.readInt32LE(4);
  const pos = new Float32Array(nv * 3), idx = new Uint32Array(nt * 3);
  for (let i = 0; i < nv; i++) { // Blender: Z para cima, Y para trás
    pos[i * 3] = b.readFloatLE(8 + i * 12);
    pos[i * 3 + 1] = b.readFloatLE(8 + i * 12 + 8);
    pos[i * 3 + 2] = -b.readFloatLE(8 + i * 12 + 4);
  }
  const off = 8 + nv * 12;
  for (let i = 0; i < nt * 3; i++) idx[i] = b.readUInt32LE(off + i * 4);
  return { pos, idx };
}
function readObj(files, xf) {
  const pos = [], idx = [];
  let base = 0;
  for (const f of files) {
    let n = 0;
    for (const l of fs.readFileSync(f, 'utf8').split('\n')) {
      if (l[0] === 'v' && l[1] === ' ') { const p = l.split(' '); pos.push(...xf(+p[1] / 1000, +p[2] / 1000, +p[3] / 1000)); n++; }
      else if (l[0] === 'f') {
        const p = l.split(' ').slice(1).filter(Boolean).map((s) => parseInt(s, 10) - 1 + base);
        for (let i = 1; i + 1 < p.length; i++) idx.push(p[0], p[i], p[i + 1]);
      }
    }
    base += n;
  }
  return { pos: new Float32Array(pos), idx: new Uint32Array(idx) };
}
function weld({ pos, idx }) {
  const map = new Map(), np = [], remap = new Uint32Array(pos.length / 3);
  for (let i = 0; i < remap.length; i++) {
    const k = `${pos[i * 3].toFixed(5)},${pos[i * 3 + 1].toFixed(5)},${pos[i * 3 + 2].toFixed(5)}`;
    let m = map.get(k);
    if (m === undefined) { m = np.length / 3; map.set(k, m); np.push(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]); }
    remap[i] = m;
  }
  const ni = new Uint32Array(idx.length);
  let n = 0;
  for (let i = 0; i < idx.length; i += 3) {
    const a = remap[idx[i]], b = remap[idx[i + 1]], c = remap[idx[i + 2]];
    if (a !== b && b !== c && a !== c) { ni[n++] = a; ni[n++] = b; ni[n++] = c; }
  }
  return { pos: new Float32Array(np), idx: ni.slice(0, n) };
}
function simplify({ pos, idx }, layer) {
  const target = Math.max(60 * 3, Math.floor((idx.length / 3) * RATIO[layer]) * 3);
  if (idx.length <= target) return { pos, idx };
  const [out] = MeshoptSimplifier.simplify(idx, pos, 3, target, 0.15);
  return { pos, idx: out };
}
function compact({ pos, idx }) {
  const map = new Map(), np = [], ni = new Uint32Array(idx.length);
  for (let i = 0; i < idx.length; i++) {
    let m = map.get(idx[i]);
    if (m === undefined) { m = np.length / 3; map.set(idx[i], m); np.push(pos[idx[i] * 3], pos[idx[i] * 3 + 1], pos[idx[i] * 3 + 2]); }
    ni[i] = m;
  }
  return { pos: new Float32Array(np), idx: ni };
}
function normals({ pos, idx }) {
  const nr = new Float32Array(pos.length);
  for (let i = 0; i < idx.length; i += 3) {
    const [a, b, c] = [idx[i] * 3, idx[i + 1] * 3, idx[i + 2] * 3];
    const ux = pos[b] - pos[a], uy = pos[b + 1] - pos[a + 1], uz = pos[b + 2] - pos[a + 2];
    const vx = pos[c] - pos[a], vy = pos[c + 1] - pos[a + 1], vz = pos[c + 2] - pos[a + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    for (const k of [a, b, c]) { nr[k] += nx; nr[k + 1] += ny; nr[k + 2] += nz; }
  }
  for (let i = 0; i < nr.length; i += 3) { const l = Math.hypot(nr[i], nr[i + 1], nr[i + 2]) || 1; nr[i] /= l; nr[i + 1] /= l; nr[i + 2] /= l; }
  return nr;
}
const prep = (g, layer) => compact(simplify(weld(g), layer));

// ---------- nomes TA2 (inglês -> latim e português) ----------
const ta = new Map();
if (TA && fs.existsSync(TA)) {
  for (const l of fs.readFileSync(TA, 'utf8').split('\n').slice(2)) {
    const c = l.replace(/^"|"$/g, '').split(';');
    if (c[1]) ta.set(c[1].trim().toLowerCase(), { latin: c[2]?.trim(), pt: c[5]?.trim() });
  }
  console.log('TA2:', ta.size, 'termos');
}

// ---------- seleção Z-Anatomy ----------
const zaIndex = JSON.parse(fs.readFileSync(path.join(ZA, 'index.json'), 'utf8'));
const NOT_COMMON = /fascia|retinaculum|aponeurosis|tendinous|ligament|sheath|raphe|septum|capsule|bursa|node|joint|disc\b|disk|membrane|trochlea|tarsus|hairs?\b|dura\b|zonular|suspensory|ganglia|choroid|eyeball|lens\b|cornea|retina|vitreous|iris\b|sclera|ciliary|sulcus/i;
const NOT_VISC = /pleura|omentum|mesocolon|meso-appendix|mucosa|gingiva|uvula|penis|testis|seminal|epiglottis|segment of liver|sublingual|submandibular|nasal|pharyn/i;
const COLLECTIONS = [['1: Skeletal system', 'ossos'], ['4: Muscular system', 'musculos'], ['8: Visceral systems', 'orgaos'], ['5: Cardiovascular system', 'orgaos'], ['7: Nervous system & Sense organs', 'nervos']];
function classZA(o) {
  const m = o.name.match(/^(.*?)(?:\.([a-z0-9]+))?$/), base = m[1].trim(), suf = m[2] || '';
  if (suf && suf !== 'r' && suf !== 'l') return null;
  if (o.polys < 150 || /^\(/.test(base)) return null;
  const col = COLLECTIONS.find(([c]) => o.cols.includes(c));
  if (!col) return null;
  const layer = col[1];
  if (NOT_COMMON.test(base)) return null;
  if (layer === 'orgaos' && NOT_VISC.test(base)) return null;
  const side = suf === 'r' ? 'right' : suf === 'l' ? 'left' : '';
  const t = ta.get(base.toLowerCase().replace(/ muscle$/, '')) || ta.get(base.toLowerCase()) || {};
  return { layer, en: base, side, latin: t.latin || '', pt: t.pt || '' };
}
const parts = [];
const seen = new Set();
for (const o of zaIndex) {
  const c = classZA(o);
  if (!c) continue;
  const key = `${c.layer}|${c.en}|${c.side}`;
  if (seen.has(key)) continue;
  seen.add(key);
  parts.push({ ...c, id: `za${o.n}`, files: [path.join(ZA, `${o.n}.bin`)], src: 'za' });
}

// ---------- seleção BodyParts3D (pele e vasos) ----------
if (BP) {
  const tsv = (f) => fs.readFileSync(f, 'utf8').trim().split('\n').slice(1).map((l) => l.split('\t'));
  const sets = ['isa', 'partof'].filter((p) => fs.existsSync(path.join(BP, 'raw', `${p}_BP3D_4.0_obj_99`)));
  const KEEP = /^(right |left )?(common carotid artery|brachial artery|radial artery|ulnar artery|femoral artery|popliteal artery|posterior tibial artery|dorsalis pedis artery|cephalic vein|basilic vein|median cubital vein|great saphenous vein|inferior vena cava|superior vena cava|ascending aorta|aortic arch|descending thoracic aorta|abdominal aorta|descending aorta|pulmonary trunk|aorta)$/i;
  const cands = [];
  for (const p of sets) {
    const dir = path.join(BP, 'raw', `${p}_BP3D_4.0_obj_99`);
    const names = new Map(tsv(path.join(BP, `${p}_parts_list_e.txt`)).map((r) => [r[0], r[2]]));
    const files = new Map();
    for (const r of tsv(path.join(BP, `${p}_element_parts.txt`))) (files.get(r[0]) || files.set(r[0], []).get(r[0])).push(path.join(dir, r[2] + '.obj'));
    for (const [cid, name] of names) {
      const f = files.get(cid), n = name.toLowerCase();
      if (!f) continue;
      let layer = null, merge = false, en = name;
      if (n === 'skin') layer = 'pele';
      else if (KEEP.test(n)) layer = 'vasos';
      else if (/artery$/.test(n) && !/branch|tributary/.test(n)) { layer = 'vasos'; merge = true; en = 'arterias'; }
      else if (/vein$/.test(n) && !/branch|tributary/.test(n)) { layer = 'vasos'; merge = true; en = 'veias'; }
      if (layer) cands.push({ layer, cid, name, en, merge, files: f });
    }
  }
  const owner = new Map();
  for (const c of cands) for (const f of c.files) { const o = owner.get(f); if (!o || c.files.length < o.files.length) owner.set(f, c); }
  const bpParts = new Map();
  for (const c of cands) {
    const files = c.files.filter((f) => owner.get(f) === c);
    if (!files.length) continue;
    const key = c.merge ? `${c.layer}|${c.en}` : `${c.layer}|${c.cid}`;
    if (bpParts.has(key)) bpParts.get(key).files.push(...files);
    else {
      const m = c.en.match(/^(right|left) (.*)$/);
      bpParts.set(key, { layer: c.layer, en: m ? m[2] : c.en, side: m ? m[1] : '', latin: '', pt: '', id: `bp${c.cid}`, files: [...files], src: 'bp' });
    }
  }
  parts.push(...bpParts.values());
}
const byLayer = {};
for (const p of parts) (byLayer[p.layer] ||= []).push(p);
for (const [l, a] of Object.entries(byLayer)) console.log(l, a.length, 'peças', `(PT ${a.filter((p) => p.pt).length})`);
if (DRY) process.exit(0);

// ---------- referência do BodyParts3D: pés em y=0, centro do corpo em z ----------
let bpZmin = Infinity, bpYc = 0;
const bpXf = (x, y, z) => [x, z - bpZmin, -(y - bpYc)];
const skinPart = parts.find((p) => p.layer === 'pele');
if (skinPart) {
  const raw = readObj(skinPart.files, (x, y, z) => [x, y, z]);
  let lo = Infinity, hi = -Infinity;
  for (let i = 0; i < raw.pos.length; i += 3) { bpZmin = Math.min(bpZmin, raw.pos[i + 2]); lo = Math.min(lo, raw.pos[i + 1]); hi = Math.max(hi, raw.pos[i + 1]); }
  bpYc = (lo + hi) / 2;
}

await MeshoptSimplifier.ready; await MeshoptEncoder.ready;
fs.mkdirSync(OUT, { recursive: true });
const index = [];
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
for (const [layer, list] of Object.entries(byLayer)) {
  const doc = new Document(), buf = doc.createBuffer(), scene = doc.createScene(layer), mat = doc.createMaterial(layer);
  let tris = 0;
  for (const p of list) {
    const pieces = p.files.map((f) => prep(p.src === 'za' ? readBin(f) : readObj([f], bpXf), layer));
    let off = 0, po = 0, io2 = 0;
    const g = { pos: new Float32Array(pieces.reduce((a, q) => a + q.pos.length, 0)), idx: new Uint32Array(pieces.reduce((a, q) => a + q.idx.length, 0)) };
    for (const q of pieces) { g.pos.set(q.pos, po); for (let i = 0; i < q.idx.length; i++) g.idx[io2 + i] = q.idx[i] + off; off += q.pos.length / 3; po += q.pos.length; io2 += q.idx.length; }
    const prim = doc.createPrimitive().setMaterial(mat)
      .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(g.pos).setBuffer(buf))
      .setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(normals(g)).setBuffer(buf))
      .setIndices(doc.createAccessor().setType('SCALAR').setArray(g.idx).setBuffer(buf));
    scene.addChild(doc.createNode(p.id).setMesh(doc.createMesh(p.id).addPrimitive(prim)));
    tris += g.idx.length / 3;
    index.push({ id: p.id, en: p.en, side: p.side, latin: p.latin, pt: p.pt, layer });
  }
  await doc.transform(quantize({ quantizePosition: 14, quantizeNormal: 10 }), meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
  const file = path.join(OUT, `${layer}.glb`);
  await io.write(file, doc);
  console.log(layer, list.length, 'peças', tris, 'triângulos', (fs.statSync(file).size / 1e6).toFixed(2), 'MB');
}
fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(index));
