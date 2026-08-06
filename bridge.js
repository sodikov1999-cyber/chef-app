import { bus, emit, esc, db, spring } from './utils.js';
import * as D from './domain.js';

// Делаем доступным для старого кода
window._chef = { bus, emit, esc, db, spring, domain: D };

// Подписываемся на события и показываем тосты через старую функцию
bus.addEventListener('toast', e => { if (typeof toast === 'function') toast(e.detail.msg, e.detail.type); });
bus.addEventListener('cart:update', () => { if (typeof updateCartFab === 'function') updateCartFab(); });

console.log('✅ Новая архитектура подключена! Всё работает.');
