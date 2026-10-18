// Conteúdo didático. Casos fictícios. Não substitui julgamento clínico, protocolo local nem revisão profissional.
// src: índices em SOURCES (data.js). 0 TA · 1 Moore · 2 Tortora · 3 EPUAP/NPIAP · 4 Muntner 2019 · 5 Potter&Perry · 6 Whelton 2017 · 7 Bickley

// Pontos de ausculta: pos = [x, y] no modelo (x negativo = lado direito do paciente); back = face posterior.
export const AUSC_POINTS = [
  { id: 'ao', tipo: 'cardiaco', nome: 'Foco aórtico', loc: '2º espaço intercostal direito, junto à borda esternal', pos: [-0.035, 1.34] },
  { id: 'pu', tipo: 'cardiaco', nome: 'Foco pulmonar', loc: '2º espaço intercostal esquerdo, junto à borda esternal', pos: [0.035, 1.34] },
  { id: 'erb', tipo: 'cardiaco', nome: 'Ponto de Erb (3º foco)', loc: '3º espaço intercostal esquerdo, junto à borda esternal', pos: [0.035, 1.3] },
  { id: 'tri', tipo: 'cardiaco', nome: 'Foco tricúspide', loc: '4º–5º espaço intercostal, borda esternal esquerda', pos: [0.03, 1.23] },
  { id: 'mi', tipo: 'cardiaco', nome: 'Foco mitral (ápice)', loc: '5º espaço intercostal esquerdo, linha hemiclavicular', pos: [0.095, 1.21] },
  { id: 'ap_d', tipo: 'pulmonar', nome: 'Ápice direito', loc: 'região supraclavicular direita (anterior)', pos: [-0.07, 1.44] },
  { id: 'ap_e', tipo: 'pulmonar', nome: 'Ápice esquerdo', loc: 'região supraclavicular esquerda (anterior)', pos: [0.07, 1.44] },
  { id: 'me_d', tipo: 'pulmonar', nome: 'Campo médio direito', loc: '4º espaço intercostal, linha hemiclavicular direita', pos: [-0.105, 1.26] },
  { id: 'me_e', tipo: 'pulmonar', nome: 'Campo médio esquerdo', loc: '4º espaço intercostal, linha hemiclavicular esquerda', pos: [0.105, 1.26] },
  { id: 'ax_d', tipo: 'pulmonar', nome: 'Campo lateral direito', loc: 'linha axilar média direita, 5º–6º espaço intercostal', pos: [-0.165, 1.19] },
  { id: 'ax_e', tipo: 'pulmonar', nome: 'Campo lateral esquerdo', loc: 'linha axilar média esquerda, 5º–6º espaço intercostal', pos: [0.165, 1.19] },
  { id: 'po_d', tipo: 'pulmonar', nome: 'Base posterior direita', loc: 'face posterior, região inferior paravertebral direita', pos: [-0.08, 1.17], back: true },
  { id: 'po_e', tipo: 'pulmonar', nome: 'Base posterior esquerda', loc: 'face posterior, região inferior paravertebral esquerda', pos: [0.08, 1.17], back: true },
];

export const FINDINGS = {
  cardiaco: [
    { id: 'normal', label: 'Bulhas normais (B1 e B2)', desc: 'B1 e B2 bem definidas e ritmo regular. A sístole é mais curta que a diástole.' },
    { id: 'sopro', label: 'Sopro sistólico', desc: 'Som soproso entre B1 e B2 (sístole). Pode ser fisiológico ou patológico: a investigação é da equipe médica.' },
    { id: 'b3', label: 'Terceira bulha (B3)', desc: 'Som grave no início da diástole, logo após B2 (ritmo de galope). A interpretação depende do contexto clínico.' },
  ],
  pulmonar: [
    { id: 'mv', label: 'Murmúrio vesicular normal', desc: 'Som suave, com inspiração mais longa que a expiração, nos campos pulmonares periféricos.' },
    { id: 'sib', label: 'Sibilos', desc: 'Sons agudos e musicais, mais evidentes na expiração. Relacionados ao estreitamento das vias aéreas.' },
    { id: 'est', label: 'Estertores finos (crepitações)', desc: 'Estalidos curtos, em geral no fim da inspiração.' },
    { id: 'ron', label: 'Roncos', desc: 'Sons graves e contínuos, associados a secreção ou obstrução em vias aéreas maiores. Podem mudar com a tosse.' },
    { id: 'dim', label: 'Murmúrio vesicular diminuído', desc: 'Som de intensidade reduzida, com várias causas possíveis. Compare sempre os dois lados.' },
  ],
};

// Pressão arterial: fatores de erro. Direção do efeito conforme a literatura (Muntner 2019);
// o deslocamento numérico (mmHg) é apenas ilustrativo do simulador.
export const BP_TRUTH = {
  normo: { label: 'Normotenso (118/76)', sys: 118, dia: 76, hr: 72 },
  hiper: { label: 'Hipertenso (152/94)', sys: 152, dia: 94, hr: 78 },
  hipo: { label: 'Hipotenso (88/54)', sys: 88, dia: 54, hr: 92 },
};
export const BP_FACTORS = {
  cuff: {
    label: 'Braçadeira',
    opts: {
      ok: { label: 'Tamanho adequado', ds: 0, dd: 0, why: 'Largura e comprimento da bolsa adequados à circunferência do braço.' },
      small: { label: 'Pequena demais', ds: 8, dd: 8, why: 'Braçadeira pequena tende a superestimar a pressão.' },
      large: { label: 'Grande demais', ds: -5, dd: -5, why: 'Braçadeira grande tende a subestimar a pressão.' },
    },
  },
  arm: {
    label: 'Braço',
    opts: {
      ok: { label: 'Apoiado, no nível do coração', ds: 0, dd: 0, why: 'Braço apoiado na altura do coração (átrio direito).' },
      low: { label: 'Abaixo do nível do coração', ds: 6, dd: 6, why: 'Braço abaixo do coração tende a superestimar a pressão.' },
      high: { label: 'Acima do nível do coração', ds: -6, dd: -6, why: 'Braço acima do coração tende a subestimar a pressão.' },
    },
  },
  pos: {
    label: 'Paciente',
    opts: {
      ok: { label: 'Sentado, costas e pés apoiados, em repouso', ds: 0, dd: 0, why: 'Posição recomendada: repouso de alguns minutos, costas apoiadas, pés no chão, sem falar.' },
      legs: { label: 'Pernas cruzadas', ds: 6, dd: 3, why: 'Pernas cruzadas tendem a elevar a pressão medida.' },
      talk: { label: 'Conversando durante a medida', ds: 8, dd: 5, why: 'Falar durante a medida tende a elevar a pressão medida.' },
    },
  },
};

const Q = (lvl, q, opts, a, why, src) => ({ lvl, q, opts, a, why, src });
export const QUESTIONS = [
  Q(1, 'Qual artéria é a mais usada para palpar o pulso periférico no punho?', ['Radial', 'Braquial', 'Femoral', 'Carótida'], 0, 'O pulso radial é palpado na face lateral (lado do polegar) do punho, com os dedos indicador e médio.', [1, 5]),
  Q(1, 'Qual artéria é auscultada na fossa cubital durante a aferição da pressão arterial no braço?', ['Braquial', 'Radial', 'Axilar', 'Femoral'], 0, 'O estetoscópio fica sobre a artéria braquial, na fossa cubital, abaixo da braçadeira.', [4, 1]),
  Q(1, 'Onde fica o foco aórtico, na ausculta cardíaca?', ['2º espaço intercostal direito, junto ao esterno', '2º espaço intercostal esquerdo, junto ao esterno', '5º espaço intercostal esquerdo, linha hemiclavicular', '4º espaço intercostal direito'], 0, 'O foco aórtico fica no 2º espaço intercostal direito, na borda esternal.', [7]),
  Q(1, 'Onde fica o foco mitral (ápice)?', ['5º espaço intercostal esquerdo, linha hemiclavicular', '2º espaço intercostal direito', '3º espaço intercostal direito', 'Região supraclavicular'], 0, 'O foco mitral, ou ápice, fica no 5º espaço intercostal esquerdo, na linha hemiclavicular.', [7]),
  Q(1, 'Qual osso serve de referência para contar os espaços intercostais, a partir do ângulo do esterno?', ['2ª costela', '1ª costela', '5ª costela', 'Clavícula'], 0, 'O ângulo do esterno se liga à 2ª cartilagem costal. O espaço logo abaixo é o 2º espaço intercostal.', [1]),
  Q(1, 'Quais forças causam lesão por pressão?', ['Pressão, fricção e cisalhamento', 'Apenas calor', 'Apenas umidade', 'Apenas desnutrição'], 0, 'Pressão, fricção e cisalhamento atuam sobre a pele e os tecidos, em especial sobre proeminências ósseas.', [3]),
  Q(1, 'Qual região é de risco para lesão por pressão em decúbito dorsal?', ['Sacro e calcâneos', 'Palma da mão', 'Lóbulo da orelha', 'Dorso do nariz'], 0, 'Em decúbito dorsal, sacro, calcâneos e occipital estão sob maior pressão. Esses locais precisam de alívio e inspeção.', [3]),
  Q(1, 'Ao palpar o pulso carotídeo, o que se deve fazer?', ['Palpar um lado por vez, sem pressão excessiva', 'Palpar os dois lados juntos', 'Massagear a artéria', 'Usar o polegar com força'], 0, 'Palpar os dois lados ao mesmo tempo pode reduzir o fluxo cerebral. Palpe um lado por vez, com suavidade.', [5]),
  Q(1, 'Em um adulto em repouso, a FR de 26 irpm está em qual situação, segundo os limites didáticos do módulo (12–20)?', ['Acima do limite (taquipneia)', 'Dentro do limite', 'Abaixo do limite', 'Não se aplica'], 0, 'Acima de 20 irpm está fora dos limites didáticos do módulo e pede reavaliação.', [5]),
  Q(1, 'No método auscultatório, o primeiro som de Korotkoff (fase I) corresponde a qual valor?', ['Pressão sistólica', 'Pressão diastólica', 'Pressão arterial média', 'Pressão de pulso'], 0, 'O primeiro som claro marca a pressão sistólica.', [4]),
  Q(1, 'O desaparecimento dos sons (fase V) corresponde a qual valor?', ['Pressão diastólica', 'Pressão sistólica', 'Pressão de pulso', 'Frequência cardíaca'], 0, 'O desaparecimento dos sons marca a pressão diastólica.', [4]),
  Q(1, 'Uma braçadeira pequena demais tende a produzir qual efeito na medida?', ['Superestimar a pressão', 'Subestimar a pressão', 'Não alterar', 'Zerar a leitura'], 0, 'Braçadeira pequena tende a superestimar. Escolha o tamanho conforme a circunferência do braço.', [4]),
  Q(1, 'A veia cefálica fica em qual lado do membro superior?', ['Lateral (lado do polegar)', 'Medial (lado do dedo mínimo)', 'Posterior profunda', 'Somente no punho'], 0, 'A veia cefálica é superficial e corre pelo lado lateral do membro superior. A basílica corre pelo lado medial.', [1]),
  Q(1, 'Qual som respiratório é considerado normal nos campos pulmonares periféricos?', ['Murmúrio vesicular', 'Sibilos', 'Roncos', 'Estertores finos'], 0, 'O murmúrio vesicular é o som respiratório normal, suave, com inspiração mais longa que a expiração.', [7]),
  Q(2, 'Qual nervo está próximo da região dorsoglútea e preocupa na escolha do local de injeção intramuscular?', ['Nervo isquiático', 'Nervo mediano', 'Nervo frênico', 'Nervo axilar'], 0, 'O nervo isquiático passa perto da região dorsoglútea. Por isso muitas diretrizes preferem outros locais, como o ventroglúteo. Siga o protocolo do serviço.', [1, 5]),
  Q(2, 'Qual nervo está em risco em injeções no deltoide fora da região recomendada?', ['Nervo axilar', 'Nervo isquiático', 'Nervo femoral', 'Nervo vago'], 0, 'O nervo axilar inerva o deltoide e passa perto da região usada para injeção.', [1, 5]),
  Q(2, 'Qual é o ritmo de esvaziamento da braçadeira recomendado no método auscultatório?', ['Cerca de 2 mmHg por segundo', 'O mais rápido possível', 'Cerca de 20 mmHg por segundo', 'Sem regra definida'], 0, 'A literatura recomenda esvaziar devagar, cerca de 2 mmHg por segundo, para não perder os sons.', [4]),
  Q(2, 'Qual é a posição recomendada do paciente na aferição da pressão?', ['Sentado, costas e pés apoiados, braço apoiado na altura do coração', 'Em pé, falando', 'Pernas cruzadas', 'Braço pendente ao lado do corpo'], 0, 'Pernas cruzadas, braço pendente e fala elevam a pressão medida. Costas e pés apoiados e braço no nível do coração reduzem erros.', [4]),
  Q(2, 'Sibilos são descritos como sons...', ['Agudos e musicais, mais evidentes na expiração', 'Graves e roncantes que melhoram com a tosse', 'Estalidos no fim da inspiração', 'Ausência de som'], 0, 'Sibilos são sons agudos, musicais, em geral ligados ao estreitamento de vias aéreas.', [7]),
  Q(2, 'Estertores finos (crepitações) costumam ser ouvidos...', ['No fim da inspiração', 'Somente na expiração', 'Só com a boca aberta', 'Somente no ápice'], 0, 'Os estertores finos são estalidos curtos, em geral no fim da inspiração.', [7]),
  Q(2, 'Pressão de 82/50 mmHg com FC de 110 bpm em um paciente fictício. Qual é a leitura mais adequada?', ['Hipotensão com taquicardia: reavaliar a medida e comunicar a equipe', 'Valores normais', 'Hipertensão com bradicardia', 'Só a FC importa'], 0, 'PAS abaixo de 90 com FC acima de 100 sugere possível alteração de perfusão. Confirme a medida e comunique conforme o protocolo.', [5, 6]),
  Q(2, 'Quais sinais sugerem flebite no local de um acesso venoso?', ['Dor, calor e vermelhidão ao longo da veia', 'Apenas coceira', 'Pele pálida e fria sem dor', 'Ausência de sinais'], 0, 'Dor, calor, eritema e, às vezes, cordão palpável ao longo da veia são sinais de flebite.', [5]),
  Q(2, 'Qual a limitação da saturação periférica de oxigênio?', ['É um dado de apoio e não substitui a avaliação clínica completa', 'É sempre exata', 'Mede a pressão arterial', 'Substitui a ausculta'], 0, 'A leitura pode falhar por perfusão ruim, sensor mal posicionado ou movimento. Avalie sempre o paciente.', [5]),
];

const C = (id, titulo, lvl, scen, pac, steps) => ({ id, titulo, lvl, scen, pac, steps });
export const CASES = [
  C('c1', 'Falta de ar', 1, 'hipoxemia',
    'Paciente fictício, 64 anos, internado por infecção respiratória. Refere falta de ar e está inquieto. Os sinais vitais estão no monitor.',
    [
      { q: 'Qual conjunto de alterações é o mais relevante?', opts: ['SpO2 baixa com taquipneia e taquicardia', 'Apenas a pressão arterial', 'Temperatura elevada', 'Nenhuma alteração relevante'], a: 0, why: 'SpO2 abaixo de 95%, FR acima de 20 e FC acima de 100 estão fora dos limites didáticos do módulo. A pressão não é a prioridade aqui.' },
      { q: 'Qual é a prioridade de avaliação?', opts: ['Via aérea, respiração e esforço respiratório', 'Higiene da pele', 'Conferir a dieta', 'Avaliar a dor no joelho'], a: 0, why: 'Em queixa respiratória, a avaliação começa pela via aérea e pela respiração.' },
      { q: 'Qual conduta de enfermagem, dentro do protocolo didático?', opts: ['Permanecer com o paciente, checar o sensor, reavaliar e comunicar a equipe de imediato conforme o protocolo', 'Registrar e reavaliar só na próxima rotina', 'Administrar um medicamento por conta própria', 'Orientar o paciente a andar'], a: 0, why: 'Reconhecer e comunicar a deterioração é parte da segurança do paciente. Checar o sensor descarta falha de leitura. Oxigenoterapia depende de prescrição e protocolo local.' },
    ]),
  C('c2', 'Pressão baixa no pós-operatório', 2, 'hipotensao',
    'Paciente fictício, 52 anos, no pós-operatório. Está sonolento e com a pele fria. Os sinais vitais estão no monitor.',
    [
      { q: 'Qual conjunto de alterações é o mais relevante?', opts: ['PA baixa com taquicardia', 'FC baixa com PA alta', 'Febre isolada', 'SpO2 muito baixa'], a: 0, why: 'PAS de 82 mmHg, abaixo de 90, com FC de 110 sugere possível alteração de perfusão.' },
      { q: 'Qual é a prioridade de avaliação?', opts: ['Confirmar a medida (braçadeira e posição) e avaliar a perfusão: consciência, pele e diurese', 'Pedir que o paciente caminhe', 'Esperar a próxima rotina', 'Trocar o lençol'], a: 0, why: 'Erros de técnica alteram a medida, mas não se deve atrasar a avaliação de perfusão.' },
      { q: 'Qual conduta de enfermagem, dentro do protocolo didático?', opts: ['Manter a monitorização e comunicar a equipe sem atraso, seguindo as prescrições e o protocolo', 'Apenas registrar', 'Dar líquidos por conta própria', 'Desligar o alarme'], a: 0, why: 'A comunicação rápida é central. Condutas como reposição de líquidos dependem de prescrição.' },
    ]),
  C('c3', 'Febre', 2, 'febre',
    'Paciente fictício, 30 anos, com calafrios e mal-estar desde a manhã. Os sinais vitais estão no monitor.',
    [
      { q: 'Qual conjunto de alterações é o mais relevante?', opts: ['Temperatura elevada com taquicardia e FR acima do limite', 'PA muito baixa', 'SpO2 muito baixa', 'Bradicardia'], a: 0, why: 'Temperatura de 39 °C, FC de 104 e FR de 21 estão acima dos limites didáticos do módulo.' },
      { q: 'Qual é a prioridade de avaliação?', opts: ['Avaliar o paciente de forma global, reaferir a temperatura e buscar outros sinais e sintomas', 'Tratar só o número da temperatura', 'Ignorar a taquicardia', 'Esperar a febre passar'], a: 0, why: 'Febre é um sinal, não um diagnóstico. A avaliação global ajuda a equipe a investigar a causa.' },
      { q: 'Qual conduta de enfermagem, dentro do protocolo didático?', opts: ['Registrar, comunicar a equipe, aplicar as medidas prescritas e reavaliar após cada intervenção', 'Dar um antitérmico por conta própria', 'Cobrir com vários cobertores', 'Não registrar'], a: 0, why: 'Medicamentos antitérmicos exigem prescrição. Registrar e reavaliar permite acompanhar a resposta.' },
    ]),
  C('c4', 'Frequência cardíaca baixa', 3, 'bradicardia',
    'Paciente fictício, 70 anos, em uso de vários medicamentos. Refere cansaço leve. Os sinais vitais estão no monitor.',
    [
      { q: 'Qual conjunto de alterações é o mais relevante?', opts: ['FC abaixo de 60 bpm, com os demais sinais dentro dos limites didáticos', 'Taquipneia', 'Hipoxemia', 'Febre'], a: 0, why: 'FC de 48 bpm está abaixo do limite didático. PA, FR, SpO2 e temperatura estão dentro das faixas.' },
      { q: 'Qual é a prioridade de avaliação?', opts: ['Avaliar sintomas (tontura, síncope, dor no peito, confusão) e perfusão antes de interpretar só o número', 'Ignorar, pois o número isolado nunca importa', 'Medir só a temperatura', 'Orientar jejum'], a: 0, why: 'A relevância da bradicardia depende dos sintomas e da perfusão. A lista de medicamentos em uso também importa.' },
      { q: 'Qual conduta de enfermagem, dentro do protocolo didático?', opts: ['Comunicar a equipe com os dados e o estado clínico, com mais urgência se houver sintomas, e seguir o protocolo', 'Aguardar sem avisar', 'Suspender medicamentos por conta própria', 'Estimular o paciente a se exercitar'], a: 0, why: 'Suspender ou alterar medicamentos é decisão da equipe médica. A comunicação clara dos dados e dos sintomas apoia a decisão.' },
    ]),
];
