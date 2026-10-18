// Nomes em português das peças do atlas (BodyParts3D usa nomes FMA em inglês).
// O que não está aqui aparece com o nome em inglês e um aviso. Latim (TA) só nas fichas revisadas de data.js.
const PT = {
  skin: 'Pele', 'body of sternum': 'Corpo do esterno', manubrium: 'Manúbrio do esterno', 'xiphoid process': 'Processo xifoide',
  clavicle: 'Clavícula', scapula: 'Escápula', humerus: 'Úmero', radius: 'Rádio', ulna: 'Ulna', femur: 'Fêmur', tibia: 'Tíbia', fibula: 'Fíbula', patella: 'Patela',
  'hip bone': 'Osso do quadril', sacrum: 'Sacro', rib: 'Costela', mandible: 'Mandíbula', maxilla: 'Maxila', 'frontal bone': 'Osso frontal', 'parietal bone': 'Osso parietal',
  'occipital bone': 'Osso occipital', 'temporal bone': 'Osso temporal', 'sphenoid bone': 'Osso esfenoide', 'nasal bone': 'Osso nasal', 'zygomatic bone': 'Osso zigomático',
  'hyoid bone': 'Osso hioide', calcaneus: 'Calcâneo', talus: 'Tálus', 'cervical vertebra': 'Vértebra cervical',
  'first thoracic vertebra': '1ª vértebra torácica', 'twelfth thoracic vertebra': '12ª vértebra torácica', 'first lumbar vertebra': '1ª vértebra lumbar', 'fifth lumbar vertebra': '5ª vértebra lumbar',
  liver: 'Fígado', stomach: 'Estômago', kidney: 'Rim', 'urinary bladder': 'Bexiga urinária', trachea: 'Traqueia', esophagus: 'Esôfago', spleen: 'Baço', pancreas: 'Pâncreas',
  gallbladder: 'Vesícula biliar', duodenum: 'Duodeno', colon: 'Cólon', 'small intestine': 'Intestino delgado', 'large intestine': 'Intestino grosso', diaphragm: 'Diafragma', ureter: 'Ureter', 'adrenal gland': 'Glândula suprarrenal', prostate: 'Próstata',
  heart: 'Coração', lung: 'Pulmão', brain: 'Encéfalo', 'spinal cord': 'Medula espinal',
  'gluteus maximus': 'Músculo glúteo máximo', 'gluteus medius': 'Músculo glúteo médio', 'gluteus minimus': 'Músculo glúteo mínimo', 'vastus lateralis': 'Músculo vasto lateral',
  'vastus medialis': 'Músculo vasto medial', 'vastus intermedius': 'Músculo vasto intermédio', 'rectus femoris': 'Músculo reto femoral', sartorius: 'Músculo sartório', gracilis: 'Músculo grácil',
  semimembranosus: 'Músculo semimembranoso', semitendinosus: 'Músculo semitendíneo', soleus: 'Músculo sóleo', popliteus: 'Músculo poplíteo', plantaris: 'Músculo plantar',
  'tibialis anterior': 'Músculo tibial anterior', 'tibialis posterior': 'Músculo tibial posterior', pectineus: 'Músculo pectíneo', piriformis: 'Músculo piriforme',
  'psoas major': 'Músculo psoas maior', iliacus: 'Músculo ilíaco', 'obturator internus': 'Músculo obturador interno', 'obturator externus': 'Músculo obturador externo',
  'quadratus femoris': 'Músculo quadrado femoral', 'serratus anterior': 'Músculo serrátil anterior', 'pectoralis minor': 'Músculo peitoral menor', 'pectoralis major': 'Músculo peitoral maior',
  'rhomboid major': 'Músculo romboide maior', 'rhomboid minor': 'Músculo romboide menor', 'levator scapulae': 'Músculo levantador da escápula', supraspinatus: 'Músculo supraespinal',
  'infraspinatus muscle': 'Músculo infraespinal', subscapularis: 'Músculo subescapular', 'teres major': 'Músculo redondo maior', 'teres minor': 'Músculo redondo menor',
  brachialis: 'Músculo braquial', brachioradialis: 'Músculo braquiorradial', coracobrachialis: 'Músculo coracobraquial', 'external oblique': 'Músculo oblíquo externo do abdome',
  sternocleidomastoid: 'Músculo esternocleidomastóideo', platysma: 'Músculo platisma', 'external intercostal muscle': 'Músculos intercostais externos',
  'internal intercostal muscle': 'Músculos intercostais internos', 'innermost intercostal muscle': 'Músculos intercostais íntimos', 'pronator quadratus': 'Músculo pronador quadrado',
  supinator: 'Músculo supinador', 'palmaris longus': 'Músculo palmar longo', 'flexor carpi radialis': 'Músculo flexor radial do carpo', 'extensor digitorum': 'Músculo extensor dos dedos',
  'flexor digitorum superficialis': 'Músculo flexor superficial dos dedos', 'flexor digitorum profundus': 'Músculo flexor profundo dos dedos', 'flexor hallucis longus': 'Músculo flexor longo do hálux',
  'muscle of arm': 'Músculos do braço (conjunto)', 'muscle of forearm': 'Músculos do antebraço (conjunto)', 'muscle of thigh': 'Músculos da coxa (conjunto)', 'gluteal muscle': 'Músculos glúteos (conjunto)',
  'pectoral muscle': 'Músculos peitorais (conjunto)', 'muscle of foot': 'Músculos do pé (conjunto)', 'muscle of pelvis': 'Músculos da pelve (conjunto)',
  'abdominal aorta': 'Aorta abdominal', 'ascending aorta': 'Aorta ascendente', 'descending aorta': 'Aorta descendente', 'descending thoracic aorta': 'Aorta torácica descendente',
  'common carotid artery': 'Artéria carótida comum', 'brachial artery': 'Artéria braquial', 'radial artery': 'Artéria radial', 'ulnar artery': 'Artéria ulnar', 'femoral artery': 'Artéria femoral',
  'popliteal artery': 'Artéria poplítea', 'posterior tibial artery': 'Artéria tibial posterior', 'dorsalis pedis artery': 'Artéria dorsal do pé', 'pulmonary trunk': 'Tronco pulmonar',
  'cephalic vein': 'Veia cefálica', 'basilic vein': 'Veia basílica', 'median cubital vein': 'Veia mediana do cotovelo', 'great saphenous vein': 'Veia safena magna',
  'inferior vena cava': 'Veia cava inferior', 'superior vena cava': 'Veia cava superior', arterias: 'Artérias (conjunto)', veias: 'Veias (conjunto)',
};

// nome em inglês (TA2 do Z-Anatomy / FMA do BodyParts3D) em minúsculas -> id da ficha detalhada em data.js
export const ALIAS = {
  skin: 'pele', 'body of sternum': 'esterno', sternum: 'esterno', manubrium: 'esterno', clavicle: 'clavicula', humerus: 'umero', radius: 'radio', ulna: 'radio', femur: 'femur', tibia: 'tibia', fibula: 'tibia',
  'hip bone': 'pelve', sacrum: 'pelve', skull: 'cranio', 'frontal bone': 'cranio', 'parietal bone': 'cranio', 'occipital bone': 'cranio', 'temporal bone': 'cranio',
  liver: 'figado', stomach: 'estomago', kidney: 'rins', ureter: 'ureteres', 'urinary bladder': 'bexiga', trachea: 'traqueia', diaphragm: 'diafragma',
  duodenum: 'intestinos', 'ascending colon': 'intestinos', 'transverse colon': 'intestinos', 'descending colon': 'intestinos', 'sigmoid colon': 'intestinos',
  'right ventricle': 'coracao', 'left ventricle': 'coracao', 'right atrium': 'coracao', 'left atrium': 'coracao', heart: 'coracao',
  'superior lobe of right lung': 'pulmoes', 'middle lobe of right lung': 'pulmoes', 'inferior lobe of right lung': 'pulmoes', 'superior lobe of left lung': 'pulmoes', 'inferior lobe of left lung': 'pulmoes',
  'spinal cord': 'medula', 'common carotid artery': 'carotida', 'brachial artery': 'a_braquial', 'radial artery': 'a_radial', 'femoral artery': 'a_femoral', 'cephalic vein': 'v_cefalica',
  'basilic vein': 'v_basilica', 'inferior vena cava': 'v_cava', 'superior vena cava': 'v_cava', 'ascending aorta': 'aorta', 'abdominal aorta': 'aorta', 'descending aorta': 'aorta', 'descending thoracic aorta': 'aorta', aorta: 'aorta',
  'gluteus maximus muscle': 'gluteo', 'gluteus medius muscle': 'gluteo', 'gluteus minimus muscle': 'gluteo', 'vastus lateralis muscle': 'vasto_lateral', 'pectoralis major muscle': 'peitoral',
  'rectus abdominis muscle': 'reto_abdome', 'acromial part of deltoid muscle': 'deltoide', 'clavicular part of deltoid muscle': 'deltoide', 'spinal part of deltoid muscle': 'deltoide',
  'sciatic nerve': 'n_isquiatico', 'axillary nerve': 'n_axilar', 'median nerve': 'n_mediano',
};
const VERT = /vertebra|atlas|axis/i;
export const aliasOf = (base) => ALIAS[base.toLowerCase()] || (VERT.test(base) && /vertebra|\(C|\(T|\(L/i.test(base) ? 'coluna' : / rib$/i.test(base) && !/costal/i.test(base) ? 'costelas' : null);

export function describe(en, side = '', pt = '', latin = '') {
  const p = pt || PT[en] || '';
  const s = side === 'right' ? ' (lado direito)' : side === 'left' ? ' (lado esquerdo)' : '';
  return { base: en, pt: p, latin, label: p ? p + s : `${en}${s} (nome em inglês)` };
}
