// Conteúdo didático. Não substitui protocolo institucional nem revisão profissional.
export const REVIEW = { autor: '2026-10-18', profissional: 'pendente' };

export const SOURCES = [
  'FIPAT. Terminologia Anatomica, 2ª ed., 2019.',
  'Moore KL, Dalley AF, Agur AMR. Anatomia Orientada para a Clínica (edição vigente).',
  'Tortora GJ, Derrickson B. Princípios de Anatomia e Fisiologia (edição vigente).',
  'EPUAP/NPIAP/PPIA. Prevention and Treatment of Pressure Ulcers/Injuries: Clinical Practice Guideline, 2019.',
  'Muntner P et al. Measurement of Blood Pressure in Humans: AHA Scientific Statement. Hypertension, 2019.',
  'Potter PA, Perry AG. Fundamentos de Enfermagem (edição vigente).',
  'Whelton PK et al. 2017 ACC/AHA Guideline for the Prevention, Detection, Evaluation, and Management of High Blood Pressure in Adults. Hypertension, 2018.',
  'Bickley LS. Bates: Propedêutica Médica (edição vigente).',
];

export const LAYERS = [
  ['pele', 'Pele'],
  ['musculos', 'Músculos'],
  ['ossos', 'Ossos'],
  ['orgaos', 'Órgãos'],
  ['vasos', 'Vasos'],
  ['nervos', 'Nervos'],
];

// n nome · l termo latino (TA) · s sistema · f função · e aplicação na enfermagem · r riscos e cuidados · src índices em SOURCES
const S = (n, l, s, f, e, r, src = [0, 1]) => ({ n, l, s, f, e, r, src });

export const STRUCTURES = {
  pele: S('Pele', 'Integumentum commune', 'Tegumentar',
    'Barreira física, termorregulação e sensibilidade.',
    'Avaliar integridade, cor, temperatura e umidade. Inspecionar as proeminências ósseas.',
    'Regiões de maior pressão em decúbito: occipital, escápulas, sacro, trocânteres, calcâneos. Pressão, fricção e cisalhamento causam lesão.', [3, 5]),
  cranio: S('Crânio', 'Cranium', 'Esquelético', 'Protege o encéfalo.', 'Referência na avaliação neurológica e de trauma.', 'Quedas podem causar trauma craniano: mantenha as medidas de prevenção de quedas.', [0, 1]),
  coluna: S('Coluna vertebral', 'Columna vertebralis', 'Esquelético', 'Sustenta o tronco e protege a medula espinal.', 'Alinhamento corporal no posicionamento e na mobilização.', 'Mobilizar com técnica e ajuda adequadas conforme o protocolo do serviço.', [0, 1]),
  costelas: S('Costelas', 'Costae', 'Esquelético', 'Protegem os órgãos torácicos e participam da mecânica ventilatória.', 'Os espaços intercostais são a referência dos pontos de ausculta.', 'Contar os espaços a partir do ângulo do esterno (2ª costela).', [0, 1]),
  esterno: S('Esterno', 'Sternum', 'Esquelético', 'Osso mediano do tórax; articula-se com as costelas.', 'O ângulo do esterno localiza o 2º espaço intercostal.', 'Referência anatômica, sem risco próprio nos cuidados rotineiros.', [0, 1]),
  clavicula: S('Clavícula', 'Clavicula', 'Esquelético', 'Une o membro superior ao esqueleto axial.', 'Referência para inspeção e palpação do ombro.', 'Fratura é comum em quedas sobre o ombro.', [0, 1]),
  pelve: S('Pelve', 'Pelvis', 'Esquelético', 'Sustenta o tronco, protege órgãos pélvicos, liga o tronco aos membros inferiores.', 'Sacro e trocânteres são regiões de risco para lesão por pressão.', 'Atenção ao posicionamento: alivie a pressão sobre as proeminências.', [1, 3]),
  umero: S('Úmero', 'Humerus', 'Esquelético', 'Osso do braço.', 'Referência para localizar o músculo deltoide.', 'Estruturas neurovasculares ficam próximas ao osso.', [0, 1]),
  radio: S('Rádio e ulna (antebraço)', 'Radius et ulna', 'Esquelético', 'Ossos do antebraço.', 'Referência do pulso radial e das veias do antebraço.', 'Ao puncionar, evite áreas de articulação.', [0, 1]),
  femur: S('Fêmur', 'Femur', 'Esquelético', 'Osso da coxa; o maior do corpo.', 'Referência para o músculo vasto lateral.', 'Fraturas aumentam o risco de imobilidade e de lesão por pressão.', [0, 1]),
  tibia: S('Tíbia e fíbula', 'Tibia et fibula', 'Esquelético', 'Ossos da perna.', 'Referência para pulsos distais (tibial posterior, dorsal do pé).', 'Calcâneos são região de risco para lesão por pressão.', [0, 3]),

  coracao: S('Coração', 'Cor', 'Cardiovascular', 'Bomba muscular que impulsiona o sangue pelas circulações pulmonar e sistêmica.', 'Pulso, pressão arterial e ausculta cardíaca avaliam sua função indiretamente.', 'Alterações de frequência, ritmo ou perfusão exigem comunicação à equipe.', [1, 2]),
  pulmoes: S('Pulmões', 'Pulmones', 'Respiratório', 'Trocas gasosas. O direito tem 3 lobos e o esquerdo, 2.', 'Ausculta comparativa entre os lados; frequência respiratória; saturação periférica.', 'A saturação periférica é um dado de apoio e não substitui a avaliação clínica completa.', [1, 2]),
  traqueia: S('Traqueia', 'Trachea', 'Respiratório', 'Via aérea que conduz o ar até os brônquios.', 'Observar permeabilidade e padrão respiratório.', 'Obstrução de via aérea é emergência: acione a equipe imediatamente.', [1, 2]),
  diafragma: S('Diafragma', 'Diaphragma', 'Respiratório', 'Principal músculo da inspiração; inervado pelo nervo frênico.', 'Observar o padrão respiratório e a expansão torácica.', 'Dor, distensão abdominal e posição afetam a mecânica ventilatória.', [1, 2]),
  figado: S('Fígado', 'Hepar', 'Digestório', 'Metabolismo, produção de bile e de proteínas plasmáticas.', 'Participa do metabolismo de muitos medicamentos.', 'Alterações hepáticas podem exigir ajustes de terapêutica prescrita.', [1, 2]),
  estomago: S('Estômago', 'Gaster', 'Digestório', 'Armazena e inicia a digestão do alimento.', 'Referência para avaliação abdominal e para dispositivos digestórios.', 'Dispositivos gástricos exigem protocolo e prescrição: este módulo não ensina o procedimento.', [1, 2]),
  intestinos: S('Intestinos', 'Intestinum', 'Digestório', 'Absorção de nutrientes e água; formação das fezes.', 'Registrar padrão de eliminação intestinal e avaliar o abdome.', 'Alterações do padrão de eliminação devem ser registradas e comunicadas.', [1, 2]),
  rins: S('Rins', 'Renes', 'Urinário', 'Filtram o sangue, regulam líquidos, eletrólitos e pressão arterial.', 'Balanço hídrico e débito urinário refletem a função renal.', 'Registrar volume e aspecto da diurese.', [1, 2]),
  ureteres: S('Ureteres', 'Ureteres', 'Urinário', 'Conduzem a urina dos rins até a bexiga.', 'Compõem o trato urinário superior, base para entender cuidados com dispositivos urinários.', 'Infecção urinária associada a dispositivos é um evento adverso evitável.', [1, 2]),
  bexiga: S('Bexiga urinária', 'Vesica urinaria', 'Urinário', 'Armazena a urina até a micção.', 'Avaliar distensão, eliminação e sinais de infecção.', 'A uretra difere entre pessoas de sexos diferentes: o modelo é didático e não representa todas as variações.', [1, 2]),

  encefalo: S('Encéfalo', 'Encephalon', 'Nervoso', 'Integra e controla funções motoras, sensitivas e cognitivas.', 'Avaliação neurológica: nível de consciência, pupilas, força e sensibilidade.', 'Mudança no nível de consciência é sinal de alerta: comunique de imediato.', [1, 2]),
  medula: S('Medula espinal', 'Medulla spinalis', 'Nervoso', 'Conduz impulsos entre encéfalo e corpo. No adulto termina por volta de L1–L2.', 'Base dos reflexos e da avaliação motora e sensitiva.', 'Lesões medulares exigem imobilização e manejo conforme protocolo.', [1, 2]),
  n_isquiatico: S('Nervo isquiático', 'Nervus ischiadicus', 'Nervoso', 'Inerva a face posterior da coxa, a perna e o pé.', 'Está próximo da região dorsoglútea.', 'Risco de lesão em injeção glútea mal localizada. Muitas diretrizes preferem outros locais.', [1, 5]),
  n_axilar: S('Nervo axilar', 'Nervus axillaris', 'Nervoso', 'Inerva o músculo deltoide e a pele sobre ele.', 'Fica próximo da região deltoidea.', 'Risco de lesão em injeção no deltoide fora da região recomendada.', [1, 5]),
  n_mediano: S('Nervo mediano', 'Nervus medianus', 'Nervoso', 'Inerva músculos da região anterior do antebraço e parte da mão.', 'Acompanha a artéria braquial na fossa cubital.', 'Cuidado com punções profundas na fossa cubital.', [1, 5]),

  aorta: S('Aorta', 'Aorta', 'Cardiovascular', 'Maior artéria; distribui o sangue oxigenado.', 'Referência para entender perfusão e pressão arterial.', 'Dor súbita intensa no tórax ou abdome é sinal de alerta: acione a equipe.', [1, 2]),
  carotida: S('Artéria carótida comum', 'Arteria carotis communis', 'Cardiovascular', 'Irriga a cabeça e o pescoço.', 'Local de pulso carotídeo central.', 'Palpar um lado por vez e sem pressão excessiva.', [1, 5]),
  a_braquial: S('Artéria braquial', 'Arteria brachialis', 'Cardiovascular', 'Principal artéria do braço.', 'Aferição da PA (ausculta na fossa cubital) e pulso braquial.', 'Braçadeira de tamanho adequado e braço na altura do coração.', [1, 4]),
  a_radial: S('Artéria radial', 'Arteria radialis', 'Cardiovascular', 'Irriga o antebraço lateral e a mão.', 'Local mais usado para o pulso periférico (lado do polegar, punho).', 'Palpar com os dedos indicador e médio, sem usar o polegar.', [1, 5]),
  a_femoral: S('Artéria femoral', 'Arteria femoralis', 'Cardiovascular', 'Principal artéria do membro inferior.', 'Pulso femoral na região inguinal.', 'Região próxima a vasos calibrosos: evitar manipulação sem indicação.', [1, 5]),
  v_cava: S('Veias cavas', 'Vena cava superior et inferior', 'Cardiovascular', 'Trazem o sangue venoso ao átrio direito.', 'Referência do retorno venoso.', 'Cateteres centrais exigem protocolo específico de prevenção de infecção.', [1, 2]),
  v_cefalica: S('Veia cefálica', 'Vena cephalica', 'Cardiovascular', 'Veia superficial do lado lateral do membro superior.', 'Uma das veias avaliadas para acesso venoso periférico.', 'Avaliar calibre, trajeto e sinais de flebite ou infiltração.', [1, 5]),
  v_basilica: S('Veia basílica', 'Vena basilica', 'Cardiovascular', 'Veia superficial do lado medial do membro superior.', 'Também avaliada para acesso venoso periférico.', 'Fica próxima a nervos e à artéria braquial: variações anatômicas são comuns.', [1, 5]),

  deltoide: S('Músculo deltoide', 'M. deltoideus', 'Musculoesquelético', 'Abduz o braço e dá o contorno do ombro.', 'Região usada para injeções intramusculares de pequeno volume.', 'Localizar pelas referências anatômicas do protocolo. Risco ao nervo axilar.', [1, 5]),
  peitoral: S('Músculo peitoral maior', 'M. pectoralis major', 'Musculoesquelético', 'Aduz e roda medialmente o braço.', 'Referência da parede torácica anterior.', 'Sem risco próprio nos cuidados rotineiros.', [1, 2]),
  reto_abdome: S('Músculo reto do abdome', 'M. rectus abdominis', 'Musculoesquelético', 'Flexiona o tronco e sustenta a parede abdominal.', 'Referência na avaliação abdominal.', 'Incisões e dor limitam a mobilização: apoie o paciente.', [1, 2]),
  gluteo: S('Região glútea', 'M. gluteus maximus', 'Musculoesquelético', 'Estende e roda o quadril.', 'A região dorsoglútea se associa ao risco do nervo isquiático.', 'Pressão prolongada sobre sacro e glúteos favorece lesão por pressão.', [1, 3]),
  vasto_lateral: S('Músculo vasto lateral', 'M. vastus lateralis', 'Musculoesquelético', 'Estende o joelho.', 'Região anterolateral da coxa usada em injeção intramuscular.', 'Localizar pelas referências do protocolo e do serviço.', [1, 5]),
};
