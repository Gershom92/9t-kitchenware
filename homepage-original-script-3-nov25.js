(() => {
  'use strict';
  const section = document.getElementById('flash');
  const body = document.getElementById('flash-live');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const unavailable = 'No verified flash-sale offers are available right now. Browse the catalogue or contact us to confirm prices and stock.';
  let data = null, index = 0, paused = false, hovering = false, focused = false;
  let serverAnchor = 0, monoAnchor = 0, wallAnchor = 0, requestVersion = 0;
  let currentController = null;
  function clear() {
    data = null;
    body.replaceChildren();
    const p = document.createElement('p'); p.textContent = unavailable; body.append(p);
  }
  function tag(name, className, text) {
    const e = document.createElement(name); if (className) e.className = className;
    if (text !== undefined) e.textContent = text; return e;
  }
  function kampala(ms) {
    // Kampala is UTC+03:00 year-round; UTC getters avoid the visitor's timezone.
    return new Date(ms + 3 * 60 * 60 * 1000).toISOString().slice(0, 10);
  }
  function strictISO(s) {
    if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(s)) return NaN;
    const n = Date.parse(s); if (!Number.isFinite(n)) return NaN;
    return new Date(n).toISOString() === (s.length === 20 ? s.slice(0, -1) + '.000Z' : s) ? n : NaN;
  }
  function safeURL(raw, type) {
    if (typeof raw !== 'string' || raw.length > 2048) return null;
    try {
      const u = new URL(raw);
      if (u.protocol !== 'https:' || u.username || u.password || u.port || u.hash) return null;
      if (type === 'image') {
        if (!(((u.hostname === 'cdn3.take.app' || u.hostname === 'cdn.take.app') && /^\/media\/[a-z0-9_-]+\.(?:png|jpe?g|webp)$/i.test(u.pathname)) || (u.hostname === 'storage.googleapis.com' && /^\/takeapp\/media\/[a-z0-9_-]+\.(?:png|jpe?g|webp)$/i.test(u.pathname)))) return null;
        if ([...u.searchParams.keys()].some(k => k !== 'width') || (u.search && (!/^\?width=\d{1,4}$/.test(u.search) || +u.searchParams.get('width') > 3840))) return null;
      } else if (u.hostname !== 'take.app' || !/^\/gershommuwanguzi92\/p\/[a-z0-9_-]+\/?$/i.test(u.pathname) || u.search) return null;
      return u.href;
    } catch (_) { return null; }
  }
  function validate(obj, now) {
    if (!obj || Array.isArray(obj) || typeof obj !== 'object' || Object.keys(obj).some(k => !['day','expiresAt','products','verifiedAt','availabilityNotice','selectionHistory'].includes(k))) return null;
    if (typeof obj.day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(obj.day) || obj.day !== kampala(now)) return null;
    const verified = strictISO(obj.verifiedAt), expires = strictISO(obj.expiresAt);
    if (!Number.isFinite(verified) || !Number.isFinite(expires) || verified > now || expires <= now || expires <= verified || expires - verified > 45 * 60000 || kampala(verified) !== obj.day) return null;
    if (!Array.isArray(obj.products) || obj.products.length !== 3) return null;
    const ids = new Set(), names = new Set(), urls = new Set();
    const products = [];
    for (const p of obj.products) {
      if (!p || Array.isArray(p) || typeof p !== 'object' || Object.keys(p).sort().join(',') !== 'id,image,name,price,productUrl,salePrice') return null;
      if (typeof p.id !== 'string' || !/^[a-z0-9_-]{1,100}$/i.test(p.id) || typeof p.name !== 'string' || !p.name.trim() || p.name !== p.name.trim() || p.name.length > 180 || /[\u0000-\u001f\u007f]/.test(p.name)) return null;
      if (!Number.isSafeInteger(p.price) || p.price < 10 || p.price > 1000000000 || !Number.isSafeInteger(p.salePrice) || p.salePrice !== Math.floor((9 * p.price + 9) / 10) || p.salePrice >= p.price) return null;
      const image = safeURL(p.image, 'image'), productUrl = safeURL(p.productUrl, 'product');
      if (!image || !productUrl || new URL(productUrl).pathname.replace(/\/$/, '').split('/').pop().toLowerCase() !== p.id.toLowerCase() || ids.has(p.id.toLowerCase()) || names.has(p.name.toLowerCase()) || urls.has(productUrl)) return null;
      ids.add(p.id.toLowerCase()); names.add(p.name.toLowerCase()); urls.add(productUrl);
      products.push({id:p.id, name:p.name, price:p.price, salePrice:p.salePrice, image, productUrl});
    }
    return {day:obj.day, verified, expires, products};
  }
  function safeNow() {
    const elapsed = performance.now() - monoAnchor;
    if (!Number.isFinite(elapsed) || elapsed < 0 || Math.abs((Date.now() - wallAnchor) - elapsed) > 5000) return NaN;
    return Math.max(serverAnchor + elapsed, Date.now());
  }
  function valid() {
    if (!data || document.hidden || !navigator.onLine) return false;
    const now = safeNow();
    return Number.isFinite(now) && now < data.expires && kampala(now) === data.day;
  }
  function money(n) { return 'UGX ' + n.toLocaleString('en-US'); }
  function show() {
    if (!valid()) { clear(); return; }
    const p = data.products[index], content = tag('div', 'flash-deal');
    const image = tag('img', 'flash-photo'); image.src = p.image; image.alt = p.name; image.referrerPolicy = 'no-referrer';
    image.addEventListener('error', () => { requestVersion++; if (currentController) currentController.abort(); clear(); });
    const info = tag('div', 'flash-info');
    info.append(tag('p', 'flash-count', `Deal ${index + 1} of 3 · ${data.day} Kampala`));
    info.append(tag('h2', '', p.name));
    const prices = tag('p', 'flash-prices');
    prices.append(tag('span', '', 'Current price: '), tag('s', '', money(p.price)), document.createElement('br'), tag('strong', '', 'Flash price: ' + money(p.salePrice)));
    info.append(prices, tag('p', 'flash-note', 'Price and stock subject to confirmation. Flash discount is not automatically applied in the catalogue; order on WhatsApp.'));
    const actions = tag('div', 'flash-actions');
    const order = tag('button', 'flash-order', 'Order now on WhatsApp'); order.type = 'button';
    order.addEventListener('click', () => {
      if (!valid() || data.products[index].id !== p.id) { clear(); return; }
      const msg = `Hello Kitchenware and Bar Accessories Kampala, I would like to order ${p.name} at the flash-sale price of ${money(p.salePrice)} (current price ${money(p.price)}) for ${data.day} Kampala. Subject to stock confirmation; please confirm availability and delivery. Product: ${p.productUrl}`;
      window.open('https://wa.me/256784891092?text=' + encodeURIComponent(msg), '_blank', 'noopener,noreferrer');
    });
    const source = tag('button', 'flash-source', 'View catalogue product'); source.type = 'button';
    source.addEventListener('click', () => { if (!valid() || data.products[index].id !== p.id) { clear(); return; } window.open(p.productUrl, '_blank', 'noopener,noreferrer'); });
    actions.append(order, source); info.append(actions); content.append(image, info);
    const controls = tag('div', 'flash-controls');
    const prev = tag('button', '', '← Previous'), pause = tag('button', '', paused ? 'Resume' : 'Pause'), next = tag('button', '', 'Next →');
    for (const b of [prev,pause,next]) b.type = 'button';
    prev.setAttribute('aria-label', 'Previous flash deal'); next.setAttribute('aria-label', 'Next flash deal');
    pause.setAttribute('aria-pressed', String(paused));
    prev.addEventListener('click', () => { if (!valid()) return clear(); index = (index + 2) % 3; showAndFocus('prev'); });
    next.addEventListener('click', () => { if (!valid()) return clear(); index = (index + 1) % 3; showAndFocus('next'); });
    pause.addEventListener('click', () => { if (!valid()) return clear(); paused = !paused; showAndFocus('pause'); });
    prev.dataset.control = 'prev'; pause.dataset.control = 'pause'; next.dataset.control = 'next';
    controls.append(prev, pause, next); body.replaceChildren(content, controls);
  }
  function showAndFocus(control) { show(); const b = body.querySelector('[data-control="' + control + '"]'); if (b) b.focus(); }
  function preload(url) {
    return new Promise((resolve, reject) => {
      const img = new Image(); const timer = setTimeout(() => { img.src = ''; reject(new Error('Image timeout')); }, 8000);
      img.onload = () => { clearTimeout(timer); resolve(); }; img.onerror = () => { clearTimeout(timer); reject(new Error('Image unavailable')); };
      img.referrerPolicy = 'no-referrer'; img.src = url;
    });
  }
  async function refresh() {
    const version = ++requestVersion;
    if (currentController) currentController.abort();
    if (!valid()) clear();
    if (document.hidden || !navigator.onLine) return;
    const controller = new AbortController(); currentController = controller;
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const url = new URL('flash-sales.json', document.baseURI); url.searchParams.set('_', String(Date.now()) + '-' + version);
      const response = await fetch(url.href, {cache:'no-store', credentials:'same-origin', redirect:'error', signal:controller.signal});
      const received = performance.now(), wall = Date.now();
      if (!response.ok || !response.headers.get('Date') || !/^(?:0|[1-9]\d*)$/.test(response.headers.get('Age') || '0')) throw new Error('Untrusted response');
      const server = Date.parse(response.headers.get('Date')) + 1000;
      if (!Number.isFinite(server) || Math.abs(wall - server) > 120000) throw new Error('Clock mismatch');
      const text = await response.text(); if (text.length > 30000) throw new Error('Too large');
      const parsed = validate(JSON.parse(text), Math.max(wall, server)); if (!parsed) throw new Error('Invalid offers');
      await Promise.all(parsed.products.map(p => preload(p.image)));
      if (version !== requestVersion || document.hidden || !navigator.onLine) return;
      const focusControl = body.contains(document.activeElement) ? document.activeElement.dataset.control : null;
      serverAnchor = server; monoAnchor = received; wallAnchor = wall; data = parsed; index = Math.min(index, parsed.products.length - 1);
      if (!valid()) throw new Error('Stale');
      show(); if (focusControl) body.querySelector('[data-control="' + focusControl + '"]')?.focus();
    } catch (_) { if (version === requestVersion) clear(); }
    finally { clearTimeout(timer); if (version === requestVersion) currentController = null; }
  }
  section.addEventListener('mouseenter', () => { hovering = true; });
  section.addEventListener('mouseleave', () => { hovering = false; });
  section.addEventListener('focusin', () => { focused = true; });
  section.addEventListener('focusout', () => { setTimeout(() => { focused = section.contains(document.activeElement); }, 0); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { requestVersion++; if (currentController) currentController.abort(); clear(); } else refresh(); });
  window.addEventListener('offline', () => { requestVersion++; if (currentController) currentController.abort(); clear(); });
  window.addEventListener('online', refresh);
  window.addEventListener('pageshow', e => { if (e.persisted) refresh(); });
  setInterval(() => { if (data && !valid()) clear(); }, 500);
  setInterval(() => { if (data && valid() && !paused && !hovering && !focused && !reduced.matches) { index = (index + 1) % 3; show(); } }, 2000);
  setInterval(refresh, 60000);
  refresh();
})();