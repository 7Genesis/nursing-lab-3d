# Nursing Lab 3D

Laboratório virtual de enfermagem no navegador: anatomia 3D interativa e um monitor de sinais vitais simulado. Feito com Three.js, GSAP e Vite.

> Conteúdo didático. Todos os dados são fictícios. Não substitui treinamento supervisionado, protocolo institucional nem revisão profissional (revisão profissional: pendente).

## O que já funciona

- **Anatomia:** paciente virtual didático com rotação 360°, zoom, vistas anterior, posterior e lateral, 6 camadas (pele, músculos, ossos, órgãos, vasos, nervos), opacidade da pele, seleção por clique ou por lista (teclado) e ficha de cada estrutura (função, aplicação na enfermagem, riscos e fontes).
- **Tela (monitor):** monitor multiparamétrico no cenário, com a tela desenhada ao vivo numa textura de canvas. A câmera voa até ele pela aba, e as teclas de cenário são clicáveis na própria tela 3D. ECG e pletismografia animados, FC, SpO2, PA, FR, temperatura e dor, seis cenários (estável, taquicardia, bradicardia, hipoxemia, febre, hipotensão), congelar, alarmes e velocidade de varredura.

- **Ausculta:** 5 focos cardíacos e 8 pontos pulmonares marcados no corpo (frente e costas), achados simulados (bulhas normais, sopro sistólico, B3, murmúrio vesicular, sibilos, estertores finos, roncos, murmúrio diminuído) com sons sintéticos gerados por código, e modo Treino com pontuação.
- **Pressão arterial:** braçadeira no braço 3D, manômetro analógico, inflar e esvaziar (2 mmHg/s), sons de Korotkoff sintéticos por fase, registro de PAS e PAD, fatores de erro (braçadeira, braço, posição do paciente) e feedback com a categoria ACC/AHA 2017 (adulto, didático).
- **Avaliações:** quiz de 10 questões (identificar estrutura no 3D sem etiquetas, múltipla escolha, misto), níveis, explicação e fonte por questão, histórico no `localStorage`.
- **Casos clínicos:** 4 casos fictícios em dificuldade crescente ligados aos cenários do monitor (priorizar, escolher a ação, revisar as justificativas).

## Limitações

- O corpo é feito de formas simples, não é um modelo clínico validado. Para usar um GLB anatômico, carregue-o em `src/main.js` e mapeie os nomes das malhas para os ids de `src/data.js`.
- Os limites do monitor (FC 60–100, FR 12–20, SpO2 ≥ 95%, PAS ≥ 90, temperatura < 37,8 °C) são didáticos, para adulto.
- Ainda não implementados: injeção intramuscular, acesso venoso, lesão por pressão, módulo de segurança do paciente, cortes e vista explodida.
- Os sons são sintéticos. O deslocamento numérico dos erros de PA (mmHg) é ilustrativo; a literatura dá o sentido do erro. Casos e questões são didáticos e aguardam revisão profissional.

## Rodar

```bash
npm install
npm run dev
npm run build
```

## Fontes

Listadas em `src/data.js` (Terminologia Anatomica, Moore, Tortora, diretriz EPUAP/NPIAP/PPIA 2019, AHA 2019, Potter & Perry).
