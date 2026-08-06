// === БИЗНЕС-ЛОГИКА: РЕЦЕПТЫ ===
export function filterRecipes(list, cat, query) {
  const q = (query || '').toLowerCase().trim();
  return list.filter(r => (cat === 'Все' || r.cat === cat) && (!q || r.name.toLowerCase().includes(q)));
}

export function scaleIngr(ingr, mult) {
  const m = Math.max(0.01, parseFloat(mult) || 1);
  return ingr.map(([n, b, net]) => [n, Math.round((b || 0) * m), Math.round((net || 0) * m)]);
}

// === БИЗНЕС-ЛОГИКА: КОРЗИНА ===
export function cartAdd(cart, supplier, item, qty) {
  const exists = cart.find(c => c.supplier === supplier && c.name === item.name);
  if (exists) { exists.qty = qty !== null ? qty : (item.limit || 1); return [...cart]; }
  return [...cart, { supplier, name: item.name, unit: item.unit || 'шт', qty: qty !== null ? qty : (item.limit || 1) }];
}

export function cartRemove(cart, supplier, name) {
  return cart.filter(c => !(c.supplier === supplier && c.name === name));
}

export function cartHas(cart, supplier, name) {
  return cart.some(c => c.supplier === supplier && c.name === name);
}

export function cartGroup(cart) {
  const g = {};
  for (const it of cart) { (g[it.supplier] ||= []).push(it); }
  return g;
}

export function cartText(cart) {
  if (!cart.length) return '';
  const date = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  const g = cartGroup(cart);
  let t = `📋 ЗАЯВКА НА ПОСТАВКУ\n${date}\n\n`;
  for (const [sup, items] of Object.entries(g)) {
    t += `📦 ${sup}\n`;
    items.forEach(i => t += `• ${i.name} — ${i.qty} ${i.unit}\n`);
    t += `\n`;
  }
  return t + `—\nОтправлено из ШефБук`;
}

// === БИЗНЕС-ЛОГИКА: ГРАФИК ===
export function parseCSV(text) {
  const rows = text.split('\n').map(row => {
    const res = []; let cell = '', q = false;
    for (const ch of row) {
      if (ch === '"') q = !q;
      else if (ch === ',' && !q) { res.push(cell.trim()); cell = ''; }
      else cell += ch;
    }
    res.push(cell.trim()); return res;
  }).filter(r => r.length > 2);

  const locs = []; let cur = null;
  for (const row of rows) {
    const f = (row[0] || '').trim().toLowerCase();
    if (f.includes('итого') || f.includes('дата') || f === '') continue;
    if ((row[1] || '').trim() === 'Должность') {
      if (row[0]) { cur = { name: row[0].trim(), staff: [] }; locs.push(cur); }
    } else if (cur) {
      const shifts = row.slice(2, 33).map(v => { const n = parseFloat((v || '').replace(',', '.')); return isNaN(n) ? 0 : n; });
      cur.staff.push({ name: row[0].trim(), role: row[1].trim(), shifts, total: shifts.reduce((a, b) => a + b, 0) });
    }
  }
  return locs.length ? { month: 'Август 2026', locations: locs } : null;
}
