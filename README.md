# Nursing Lab 3D

Laboratório virtual de enfermagem no navegador: anatomia 3D interativa e um monitor de sinais vitais simulado. Feito com Three.js, GSAP e Vite.

> Conteúdo didático. Todos os dados são fictícios. Não substitui treinamento supervisionado, protocolo institucional nem revisão profissional (revisão profissional: pendente).

## O que já funciona

- **Anatomia:** paciente virtual didático com rotação 360°, zoom, vistas anterior, posterior e lateral, 6 camadas (pele, músculos, ossos, órgãos, vasos, nervos), opacidade da pele, seleção por clique ou por lista (teclado) e ficha de cada estrutura (função, aplicação na enfermagem, riscos e fontes).
- **Tela (monitor):** monitor multiparamétrico no cenário, com a tela desenhada ao vivo numa textura de canvas. A câmera voa até ele pela aba, e as teclas de cenário são clicáveis na própria tela 3D. ECG e pletismografia animados, FC, SpO2, PA, FR, temperatura e dor, seis cenários (estável, taquicardia, bradicardia, hipoxemia, febre, hipotensão), congelar, alarmes e velocidade de varredura.

## Limitações

- O corpo é feito de formas simples, não é um modelo clínico validado. Para usar um GLB anatômico, carregue-o em `src/main.js` e mapeie os nomes das malhas para os ids de `src/data.js`.
- Os limites do monitor (FC 60–100, FR 12–20, SpO2 ≥ 95%, PAS ≥ 90, temperatura < 37,8 °C) são didáticos, para adulto.
- Ainda não implementados: procedimentos simulados, ausculta com som, aferição de PA, quizzes, casos clínicos e segurança do paciente.

## Rodar

```bash
npm install
npm run dev
npm run build
```

## Fontes

Listadas em `src/data.js` (Terminologia Anatomica, Moore, Tortora, diretriz EPUAP/NPIAP/PPIA 2019, AHA 2019, Potter & Perry).
