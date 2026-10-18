// Helpers de interface. Textos entram sempre como texto (nunca como HTML).
export function h(tag, props = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') e.className = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (v === true) e.setAttribute(k, '');
    else if (v !== false && v != null) e.setAttribute(k, v);
  }
  for (const c of kids.flat()) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(String(c)));
  return e;
}

export const shuffle = (a) => {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
};
export const pick = (a) => a[Math.floor(Math.random() * a.length)];

// Progresso só no navegador (localStorage); funciona sem ele.
export const store = {
  get(key, fallback) { try { return JSON.parse(localStorage.getItem('nl3d.' + key)) ?? fallback; } catch { return fallback; } },
  set(key, v) { try { localStorage.setItem('nl3d.' + key, JSON.stringify(v)); } catch { /* sem armazenamento */ } },
  del(key) { try { localStorage.removeItem('nl3d.' + key); } catch { /* sem armazenamento */ } },
};

export const srcText = (SOURCES, idx) => idx.map((i) => SOURCES[i]).join(' ');
