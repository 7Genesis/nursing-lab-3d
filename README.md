# Nursing Lab 3D

Laboratório virtual de enfermagem no navegador: anatomia 3D interativa e um monitor de sinais vitais simulado. Feito com Three.js, GSAP e Vite.

> Conteúdo didático. Todos os dados são fictícios. Não substitui treinamento supervisionado, protocolo institucional nem revisão profissional (revisão profissional: pendente).

## O que já funciona

- **Anatomia:** paciente virtual didático com rotação 360°, zoom, vistas anterior, posterior e lateral, 6 camadas (pele, músculos, ossos, órgãos, vasos, nervos), opacidade da pele, seleção por clique ou por lista (teclado) e ficha de cada estrutura (função, aplicação na enfermagem, riscos e fontes).
- **Isolar e explorar:** escolha o sistema (ossos, músculos, órgãos, nervos, vasos), busque por nome em português, latim ou inglês e percorra peça por peça com Anterior e Próxima: só a peça atual fica visível, com zoom e ficha. "Isolar grupo" mostra, por exemplo, os dois pulmões ou o coração inteiro, e "Mostrar tudo" volta ao corpo.
- **Tela (monitor):** monitor multiparamétrico no cenário, com a tela desenhada ao vivo numa textura de canvas. A câmera voa até ele pela aba, e as teclas de cenário são clicáveis na própria tela 3D. ECG e pletismografia animados, FC, SpO2, PA, FR, temperatura e dor, seis cenários (estável, taquicardia, bradicardia, hipoxemia, febre, hipotensão), congelar, alarmes e velocidade de varredura.

- **Ausculta:** 5 focos cardíacos e 8 pontos pulmonares marcados no corpo (frente e costas), achados simulados (bulhas normais, sopro sistólico, B3, murmúrio vesicular, sibilos, estertores finos, roncos, murmúrio diminuído) com sons sintéticos gerados por código, e modo Treino com pontuação.
- **Pressão arterial:** braçadeira no braço 3D, manômetro analógico, inflar e esvaziar (2 mmHg/s), sons de Korotkoff sintéticos por fase, registro de PAS e PAD, fatores de erro (braçadeira, braço, posição do paciente) e feedback com a categoria ACC/AHA 2017 (adulto, didático).
- **Avaliações:** quiz de 10 questões (identificar estrutura no 3D sem etiquetas, múltipla escolha, misto), níveis, explicação e fonte por questão, histórico no `localStorage`.
- **Casos clínicos:** 4 casos fictícios em dificuldade crescente ligados aos cenários do monitor (priorizar, escolher a ação, revisar as justificativas).

## Limitações

- O corpo é um atlas anatômico representativo (Z-Anatomy e BodyParts3D), sem textura de tecido e sem validação clínica. Peças sem ficha detalhada mostram só o nome (TA2) e a localização. Faltam peças: nervos periféricos (isquiático, axilar, mediano), artérias e veias além das principais, e a pele é um envoltório simples.
- Se o atlas não carregar, o app mostra o corpo de formas simples (`src/body.js`) como reserva.
- Os limites do monitor (FC 60–100, FR 12–20, SpO2 ≥ 95%, PAS ≥ 90, temperatura < 37,8 °C) são didáticos, para adulto.
- Ainda não implementados: injeção intramuscular, acesso venoso, lesão por pressão, módulo de segurança do paciente, cortes e vista explodida.
- Os sons são sintéticos. O deslocamento numérico dos erros de PA (mmHg) é ilustrativo; a literatura dá o sentido do erro. Casos e questões são didáticos e aguardam revisão profissional.

## Modelos 3D e licença

Os GLBs em `public/models/` são derivados de **Z-Anatomy (CC BY-SA 4.0)** e **BodyParts3D (CC BY-SA 2.1 Japão)**, então seguem CC BY-SA. Atribuição completa em `public/models/ATTRIBUTION.md`. O código do app (`src/`, `scripts/`) é separado dos modelos.

Para refazer os GLBs (os dados de origem ficam fora do repositório):

```bash
# 1) Blender (5.x) exporta as malhas do Z-Anatomy (Startup.blend do template)
blender -b Startup.blend --python scripts/zanatomy-dump.py -- dump/
# 2) converte, simplifica e comprime
node scripts/build-models.mjs --za dump --bp <pasta-bodyparts3d> --ta TA2.csv
```

## Rodar

```bash
npm install
npm run dev
npm run build
```

## Fontes

Listadas em `src/data.js` (Terminologia Anatomica, Moore, Tortora, diretriz EPUAP/NPIAP/PPIA 2019, AHA 2019, Potter & Perry).
