import { h, shuffle, pick, store } from './ui.js';
import { QUESTIONS, CASES } from './content.js';
import { STRUCTURES, SOURCES } from './data.js';

const NOTE = 'Questões e casos didáticos, com pacientes fictícios. Não substituem julgamento clínico, protocolo local nem revisão profissional.';
const LEVEL = { 1: 'Básico', 2: 'Intermediário', 3: 'Avançado' };
const srcLine = (idx) => h('p', { class: 'src' }, `Fontes: ${idx.map((i) => SOURCES[i]).join(' ')}`);

function history(key, label) {
  const hist = store.get(key, []);
  const box = h('div', { class: 'card' });
  const render = () => {
    box.replaceChildren(h('strong', {}, `Histórico local (${label})`),
      hist.length ? h('ul', {}, hist.slice(-6).reverse().map((x) => h('li', {}, `${new Date(x.t).toLocaleString('pt-BR')} · ${x.tag}: ${x.ok}/${x.n}`))) : h('div', {}, 'Ainda sem tentativas.'),
      hist.length ? h('button', { onclick: () => { hist.length = 0; store.del(key); render(); } }, 'Limpar histórico') : null);
  };
  render();
  return { box, add(tag, ok, n) { hist.push({ t: Date.now(), tag, ok, n }); store.set(key, hist.slice(-30)); render(); } };
}

// ---------- Quiz anatômico
export function mountQuiz(ctx, el) {
  const hist = history('quiz', 'quiz');
  const cfg = { mode: 'misto', lvl: 0 };
  const body = h('div', { class: 'card', 'aria-live': 'polite' });
  let run = null, savedSkin = null;

  const sel = (opts, key) => h('select', { onchange: (e) => { cfg[key] = key === 'lvl' ? Number(e.target.value) : e.target.value; } }, opts.map(([v, t]) => h('option', { value: v }, t)));
  const start = () => {
    const mc = shuffle(QUESTIONS.filter((q) => !cfg.lvl || q.lvl === cfg.lvl)).map((q) => ({ t: 'mc', q }));
    const ids = Object.keys(STRUCTURES).filter((k) => STRUCTURES[k].s !== 'Tegumentar' && ctx.has(k));
    const id3 = shuffle(ids).map((id) => ({ t: 'id', id }));
    let items = cfg.mode === 'mc' ? mc : cfg.mode === 'id' ? id3 : shuffle([...mc.slice(0, 6), ...id3.slice(0, 4)]);
    items = items.slice(0, 10);
    run = { items, i: 0, ok: 0, done: false };
    next();
  };
  const finish = () => {
    ctx.highlight(null); restoreSkin();
    hist.add(`${cfg.mode === 'id' ? 'Identificar' : cfg.mode === 'mc' ? 'Múltipla escolha' : 'Misto'}`, run.ok, run.items.length);
    body.replaceChildren(h('strong', {}, `Resultado: ${run.ok} de ${run.items.length}.`), h('div', {}, run.ok === run.items.length ? 'Excelente.' : 'Revise as explicações e tente de novo.'), h('button', { onclick: start }, 'Novo quiz'));
    run = null;
  };
  const hideSkin = () => { if (savedSkin == null) { savedSkin = ctx.layers.pele.visible; ctx.setLayer('pele', false); } };
  const restoreSkin = () => { if (savedSkin != null) { ctx.setLayer('pele', savedSkin); savedSkin = null; } };
  function next() {
    if (run.i >= run.items.length) return finish();
    const it = run.items[run.i];
    let prompt, opts, correct, why, src;
    if (it.t === 'mc') {
      restoreSkin(); ctx.highlight(null);
      prompt = it.q.q; correct = it.q.opts[it.q.a]; opts = shuffle(it.q.opts); why = it.q.why; src = it.q.src;
    } else {
      hideSkin();
      const s = STRUCTURES[it.id];
      ctx.highlight(it.id); ctx.zoomTo(it.id);
      const same = Object.keys(STRUCTURES).filter((k) => k !== it.id && STRUCTURES[k].n !== s.n && STRUCTURES[k].s === s.s);
      const others = shuffle(same.length >= 3 ? same : Object.keys(STRUCTURES).filter((k) => STRUCTURES[k].n !== s.n)).slice(0, 3).map((k) => STRUCTURES[k].n);
      prompt = 'Qual estrutura está destacada no corpo 3D? (sem etiquetas)'; correct = s.n; opts = shuffle([s.n, ...others]);
      why = `${s.n} (${s.l}). ${s.f}`; src = s.src;
    }
    let answered = false;
    const fb = h('div', { 'aria-live': 'polite' });
    body.replaceChildren(h('div', { class: 'lbl' }, `Questão ${run.i + 1} de ${run.items.length}`), h('strong', {}, prompt),
      h('div', { class: 'opts' }, opts.map((o) => h('button', { onclick: (e) => {
        if (answered) return; answered = true;
        const ok = o === correct; if (ok) run.ok++;
        e.target.classList.add(ok ? 'right' : 'wrong');
        fb.replaceChildren(h('strong', {}, ok ? 'Correto.' : `Resposta certa: ${correct}.`), h('div', {}, why), srcLine(src),
          h('button', { onclick: () => { run.i++; next(); } }, run.i + 1 >= run.items.length ? 'Ver resultado' : 'Próxima'));
      } }, o))), fb);
  }
  body.append('Escolha o tipo e o nível e comece.');
  el.append(h('h2', {}, 'Avaliações'), h('p', { class: 'latim' }, 'Quiz anatômico com 10 questões.'),
    h('label', { class: 'lbl' }, 'Tipo', sel([['misto', 'Misto'], ['id', 'Identificar no corpo 3D'], ['mc', 'Múltipla escolha']], 'mode')),
    h('label', { class: 'lbl' }, 'Nível', sel([[0, 'Todos'], [1, 'Básico'], [2, 'Intermediário']], 'lvl')),
    h('button', { onclick: start }, 'Começar'), body, hist.box, h('p', { class: 'note' }, NOTE));
  return { enter() { ctx.view('anterior'); }, leave() { if (run) { ctx.highlight(null); } restoreSkin(); run = null; body.replaceChildren('Escolha o tipo e o nível e comece.'); } };
}

// ---------- Casos clínicos
export function mountCases(ctx, el) {
  const hist = history('casos', 'casos');
  const box = h('div', { class: 'card', 'aria-live': 'polite' });
  const listEl = h('div', { class: 'opts' });
  const showList = () => {
    box.replaceChildren(h('strong', {}, 'Escolha um caso (dificuldade crescente)'));
    listEl.replaceChildren(...CASES.map((c) => h('button', { onclick: () => open(c) }, `${LEVEL[c.lvl]} · ${c.titulo}`)));
  };
  function open(c) {
    ctx.monitor.setScenario(c.scen);
    const log = []; let i = 0, ok = 0;
    listEl.replaceChildren();
    const step = () => {
      if (i >= c.steps.length) return review();
      const s = c.steps[i], opts = shuffle(s.opts), right = s.opts[s.a];
      let done = false;
      const fb = h('div', { 'aria-live': 'polite' });
      box.replaceChildren(
        h('strong', {}, `${c.titulo} · ${LEVEL[c.lvl]}`), h('p', {}, c.pac),
        h('button', { onclick: () => ctx.goTab('tela') }, 'Ver sinais no monitor'),
        h('div', { class: 'lbl' }, `Etapa ${i + 1} de ${c.steps.length}`), h('strong', {}, s.q),
        h('div', { class: 'opts' }, opts.map((o) => h('button', { onclick: (e) => {
          if (done) return; done = true;
          const good = o === right; if (good) ok++;
          log.push({ q: s.q, mine: o, right, good, why: s.why });
          e.target.classList.add(good ? 'right' : 'wrong');
          fb.replaceChildren(h('strong', {}, good ? 'Correto.' : `Melhor resposta: ${right}`), h('div', {}, s.why),
            h('button', { onclick: () => { i++; step(); } }, i + 1 >= c.steps.length ? 'Revisar justificativas' : 'Próxima etapa'));
        } }, o))), fb);
    };
    const review = () => {
      hist.add(c.titulo, ok, c.steps.length);
      box.replaceChildren(h('strong', {}, `Revisão: ${ok} de ${c.steps.length} etapas.`),
        ...log.map((l) => h('div', { class: 'card' }, h('strong', {}, l.q), h('div', {}, `Sua resposta: ${l.mine} ${l.good ? '✓' : '✗'}`), l.good ? null : h('div', {}, `Melhor resposta: ${l.right}`), h('div', { class: 'lbl' }, l.why))),
        h('div', { class: 'note' }, 'Algoritmos educativos não substituem o julgamento clínico profissional.'), h('button', { onclick: showList }, 'Outro caso'));
    };
    step();
  }
  showList();
  el.append(h('h2', {}, 'Casos clínicos simulados'), h('p', { class: 'latim' }, 'Avalie, priorize, escolha a ação e revise as justificativas.'), box, listEl, hist.box,
    h('p', { class: 'note' }, NOTE), h('p', { class: 'src' }, `Fontes: ${SOURCES[5]} ${SOURCES[6]}`));
  return { enter() { ctx.view('anterior'); showList(); }, leave() {} };
}
