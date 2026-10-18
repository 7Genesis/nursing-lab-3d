import * as THREE from 'three';

// Corpo didático feito de primitivas: não é um modelo clínico validado.
// Para usar um GLB anatômico, carregue-o em main.js e mapeie os nomes para os ids de data.js.
const Y = new THREE.Vector3(0, 1, 0);
const v = (a) => new THREE.Vector3(...a);

export function buildBody() {
  const layers = Object.fromEntries(['pele', 'musculos', 'ossos', 'orgaos', 'vasos', 'nervos'].map((k) => [k, new THREE.Group()]));
  const root = new THREE.Group();
  Object.values(layers).forEach((g) => root.add(g));
  const pickable = [];

  const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.55, metalness: 0, ...o });
  const put = (layer, id, geo, material, pos, scale) => {
    const m = new THREE.Mesh(geo, material);
    if (pos) m.position.set(...pos);
    if (scale) m.scale.set(...scale);
    m.userData = { id, layer };
    layers[layer].add(m);
    pickable.push(m);
    return m;
  };
  const ell = (layer, id, color, pos, scale, o) => put(layer, id, new THREE.SphereGeometry(1, 24, 16), mat(color, o), pos, scale);
  const cap = (layer, id, color, a, b, r, o) => {
    const A = v(a), B = v(b), d = B.clone().sub(A);
    const m = put(layer, id, new THREE.CapsuleGeometry(r, Math.max(d.length() - 2 * r, 0.001), 6, 14), mat(color, o));
    m.position.copy(A.clone().add(B).multiplyScalar(0.5));
    m.quaternion.setFromUnitVectors(Y, d.normalize());
    return m;
  };
  const tube = (layer, id, color, pts, r, o) =>
    put(layer, id, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(v)), 32, r, 8), mat(color, o));

  // pele (translúcida, mesmo id em todas as peças)
  const skin = { color: 0xe8b99a, transparent: true, opacity: 0.35, depthWrite: false };
  ell('pele', 'pele', skin.color, [0, 1.66, 0], [0.095, 0.115, 0.1], skin);
  cap('pele', 'pele', skin.color, [0, 1.5, 0], [0, 1.58, 0], 0.045, skin);
  ell('pele', 'pele', skin.color, [0, 1.2, 0], [0.18, 0.27, 0.105], skin);
  ell('pele', 'pele', skin.color, [0, 0.97, 0], [0.155, 0.2, 0.095], skin);
  for (const s of [-1, 1]) {
    cap('pele', 'pele', skin.color, [s * 0.2, 1.4, 0], [s * 0.27, 1.13, 0], 0.042, skin);
    cap('pele', 'pele', skin.color, [s * 0.27, 1.13, 0], [s * 0.3, 0.9, 0.02], 0.034, skin);
    ell('pele', 'pele', skin.color, [s * 0.305, 0.84, 0.02], [0.03, 0.06, 0.02], skin);
    cap('pele', 'pele', skin.color, [s * 0.08, 0.88, 0], [s * 0.095, 0.5, 0], 0.078, skin);
    cap('pele', 'pele', skin.color, [s * 0.095, 0.5, 0], [s * 0.09, 0.08, 0], 0.052, skin);
    ell('pele', 'pele', skin.color, [s * 0.09, 0.04, 0.05], [0.04, 0.03, 0.09], skin);
  }

  // músculos
  const mus = { color: 0xa23b32 };
  for (const s of [-1, 1]) {
    ell('musculos', 'deltoide', mus.color, [s * 0.225, 1.38, 0], [0.05, 0.07, 0.05]);
    ell('musculos', 'peitoral', mus.color, [s * 0.085, 1.33, 0.08], [0.085, 0.06, 0.03]);
    ell('musculos', 'reto_abdome', mus.color, [s * 0.03, 1.0, 0.085], [0.035, 0.11, 0.02]);
    ell('musculos', 'gluteo', mus.color, [s * 0.075, 0.9, -0.075], [0.08, 0.09, 0.05]);
    ell('musculos', 'vasto_lateral', mus.color, [s * 0.115, 0.7, 0.02], [0.045, 0.14, 0.05]);
  }

  // ossos
  const bone = 0xe9e4d4;
  ell('ossos', 'cranio', bone, [0, 1.67, 0], [0.085, 0.1, 0.09]);
  tube('ossos', 'coluna', bone, [[0, 1.5, -0.03], [0, 1.3, -0.055], [0, 1.1, -0.05], [0, 0.93, -0.06]], 0.014);
  for (let i = 0; i < 7; i++) {
    const t = new THREE.Mesh(new THREE.TorusGeometry(0.135 - Math.abs(i - 2) * 0.006, 0.006, 6, 28), mat(bone));
    t.rotation.x = Math.PI / 2;
    t.scale.set(1, 0.68, 1);
    t.position.set(0, 1.4 - i * 0.04, 0.0);
    t.userData = { id: 'costelas', layer: 'ossos' };
    layers.ossos.add(t);
    pickable.push(t);
  }
  put('ossos', 'esterno', new THREE.BoxGeometry(0.03, 0.18, 0.012), mat(bone), [0, 1.28, 0.088]);
  const pel = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.018, 8, 24), mat(bone));
  pel.rotation.x = Math.PI / 2; pel.scale.set(1, 0.7, 1); pel.position.set(0, 0.92, -0.01);
  pel.userData = { id: 'pelve', layer: 'ossos' }; layers.ossos.add(pel); pickable.push(pel);
  for (const s of [-1, 1]) {
    cap('ossos', 'clavicula', bone, [s * 0.02, 1.43, 0.05], [s * 0.19, 1.42, 0.03], 0.009);
    cap('ossos', 'umero', bone, [s * 0.2, 1.4, 0], [s * 0.27, 1.13, 0], 0.014);
    cap('ossos', 'radio', bone, [s * 0.27, 1.13, 0], [s * 0.3, 0.9, 0.02], 0.011);
    cap('ossos', 'femur', bone, [s * 0.08, 0.88, 0], [s * 0.095, 0.5, 0], 0.02);
    cap('ossos', 'tibia', bone, [s * 0.095, 0.5, 0], [s * 0.09, 0.08, 0], 0.016);
  }

  // órgãos
  ell('orgaos', 'coracao', 0xc0392b, [0.025, 1.27, 0.035], [0.05, 0.058, 0.045]);
  ell('orgaos', 'pulmoes', 0xe7a1a1, [-0.09, 1.28, 0], [0.07, 0.13, 0.075], { transparent: true, opacity: 0.8 });
  ell('orgaos', 'pulmoes', 0xe7a1a1, [0.09, 1.28, 0], [0.065, 0.125, 0.075], { transparent: true, opacity: 0.8 });
  cap('orgaos', 'traqueia', 0xd9e2ec, [0, 1.54, 0.005], [0, 1.37, 0.005], 0.011);
  ell('orgaos', 'diafragma', 0xb86b5a, [0, 1.12, 0], [0.16, 0.018, 0.095], { transparent: true, opacity: 0.7 });
  ell('orgaos', 'figado', 0x7a3b25, [-0.07, 1.06, 0.03], [0.09, 0.045, 0.06]);
  ell('orgaos', 'estomago', 0xd98c7a, [0.07, 1.07, 0.04], [0.05, 0.055, 0.04]);
  const gut = new THREE.Mesh(new THREE.TorusKnotGeometry(0.07, 0.016, 80, 8, 3, 4), mat(0xd9a49a));
  gut.position.set(0, 0.96, 0.02); gut.scale.set(1, 0.8, 0.6);
  gut.userData = { id: 'intestinos', layer: 'orgaos' }; layers.orgaos.add(gut); pickable.push(gut);
  ell('orgaos', 'rins', 0x8e2f3a, [-0.055, 1.02, -0.05], [0.024, 0.04, 0.02]);
  ell('orgaos', 'rins', 0x8e2f3a, [0.055, 1.04, -0.05], [0.024, 0.04, 0.02]);
  tube('orgaos', 'ureteres', 0xe6d27a, [[-0.05, 0.98, -0.045], [-0.04, 0.92, -0.03], [-0.015, 0.87, 0.0]], 0.004);
  tube('orgaos', 'ureteres', 0xe6d27a, [[0.05, 1.0, -0.045], [0.04, 0.92, -0.03], [0.015, 0.87, 0.0]], 0.004);
  ell('orgaos', 'bexiga', 0xe6d27a, [0, 0.85, 0.03], [0.04, 0.04, 0.04]);

  // vasos
  const art = 0xd62828, ven = 0x3a6ea5;
  tube('vasos', 'aorta', art, [[0.02, 1.31, 0], [0.03, 1.4, -0.005], [0, 1.4, -0.03], [0, 1.25, -0.035], [0, 1.0, -0.035], [0, 0.9, -0.02]], 0.012);
  tube('vasos', 'v_cava', ven, [[-0.02, 1.43, 0], [-0.02, 1.25, -0.01], [-0.02, 1.0, -0.03], [-0.02, 0.9, -0.02]], 0.013);
  for (const s of [-1, 1]) {
    tube('vasos', 'carotida', art, [[s * 0.025, 1.4, 0.01], [s * 0.03, 1.5, 0.02], [s * 0.035, 1.6, 0.02]], 0.007);
    tube('vasos', 'a_braquial', art, [[s * 0.2, 1.4, -0.01], [s * 0.245, 1.27, -0.012], [s * 0.27, 1.14, -0.01]], 0.007);
    tube('vasos', 'a_radial', art, [[s * 0.27, 1.14, -0.01], [s * 0.285, 1.0, 0.0], [s * 0.3, 0.9, 0.025]], 0.005);
    tube('vasos', 'a_femoral', art, [[s * 0.07, 0.9, 0.04], [s * 0.085, 0.7, 0.04], [s * 0.095, 0.52, 0.03]], 0.01);
    tube('vasos', 'v_cefalica', ven, [[s * 0.285, 0.92, 0.04], [s * 0.285, 1.1, 0.045], [s * 0.255, 1.28, 0.04], [s * 0.21, 1.4, 0.03]], 0.0045);
    tube('vasos', 'v_basilica', ven, [[s * 0.3, 0.92, 0.0], [s * 0.275, 1.12, 0.02], [s * 0.245, 1.27, 0.0]], 0.0045);
  }

  // nervos
  const nerve = 0xf1c40f;
  ell('nervos', 'encefalo', 0xe8a0b4, [0, 1.68, 0], [0.07, 0.075, 0.08]);
  tube('nervos', 'medula', nerve, [[0, 1.52, -0.045], [0, 1.3, -0.065], [0, 1.1, -0.06]], 0.006);
  for (const s of [-1, 1]) {
    tube('nervos', 'n_isquiatico', nerve, [[s * 0.07, 0.92, -0.06], [s * 0.085, 0.72, -0.05], [s * 0.095, 0.52, -0.04]], 0.005);
    tube('nervos', 'n_axilar', nerve, [[s * 0.19, 1.4, -0.035], [s * 0.225, 1.36, -0.03], [s * 0.245, 1.33, -0.015]], 0.004);
    tube('nervos', 'n_mediano', nerve, [[s * 0.245, 1.27, -0.012], [s * 0.272, 1.13, -0.014], [s * 0.29, 0.93, 0.0]], 0.004);
  }

  return { root, layers, pickable };
}
