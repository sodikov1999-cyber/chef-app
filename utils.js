// === ШИНА СОБЫТИЙ (заменяет прямые вызовы) ===
export const bus = new EventTarget();
export function emit(name, detail = null) {
  bus.dispatchEvent(new CustomEvent(name, { detail }));
}

// === ЗАЩИТА ОТ XSS (вставляйте ВЕЗДЕ вместо innerHTML) ===
const MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export function esc(raw) {
  if (raw == null) return '';
  return String(raw).replace(/[&<>"']/g, ch => MAP[ch] || ch);
}

// === localStorage С ЗАЩИТОЙ ===
const PREF = 'chef_';
export const db = {
  get(name, fallback = null) {
    try { const r = localStorage.getItem(PREF + name); return r ? JSON.parse(r) : fallback; } 
    catch (e) { return fallback; }
  },
  set(name, value) {
    try { localStorage.setItem(PREF + name, JSON.stringify(value)); return true; } 
    catch (e) { alert('Память переполнена!'); return false; }
  }
};

// === ФИЗИКА (ваши пружины) ===
export function spring({ from, to, velocity = 0, onUpdate, onComplete, stiffness = 520, damping = 28 }) {
  let cur = from, vel = velocity, raf, last = performance.now(), run = true;
  function tick(now) {
    if (!run) return;
    const dt = Math.min((now - last) / 1000, 0.05); last = now;
    const disp = cur - to;
    const acc = (-stiffness * disp - damping * vel);
    vel += acc * dt; cur += vel * dt;
    onUpdate(cur);
    if (Math.abs(disp) < 0.5 && Math.abs(vel) < 0.5) { onUpdate(to); if (onComplete) onComplete(); return; }
    raf = requestAnimationFrame(tick);
  }
  raf = requestAnimationFrame(tick);
  return { cancel() { run = false; cancelAnimationFrame(raf); } };
}
