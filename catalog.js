/* ══════════════════════════════════════════
   catalog.js — Carga productos desde Supabase
   Fallback a products.json si Supabase no responde
══════════════════════════════════════════ */

let _sb = null;

function getSB() {
  if (!_sb) {
    const { createClient } = window.supabase;
    _sb = createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return _sb;
}

function waLink(mensaje) {
  const number = typeof WA_NUMBER !== 'undefined' ? WA_NUMBER : '51962935852';
  return `https://wa.me/${number}?text=${encodeURIComponent(mensaje)}`;
}

/* ── Cargar productos desde Supabase ── */
async function loadProducts() {
  const grid = document.getElementById('grid');

  try {
    const { data, error } = await getSB()
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    displayProducts(data || []);
  } catch (err) {
    /* Fallback a products.json (desarrollo local o error) */
    console.warn('Supabase no disponible, usando products.json:', err.message);
    try {
      const res   = await fetch('products.json');
      const prods = await res.json();
      displayProducts(prods);
    } catch {
      if (grid) grid.innerHTML =
        '<p style="color:var(--texto-mid);text-align:center;grid-column:1/-1;padding:3rem">Error al cargar productos. Por favor recarga la página.</p>';
    }
  }
}

/* ── Renderizar tarjetas ── */
function displayProducts(products) {
  const grid = document.getElementById('grid');
  if (!grid) return;
  grid.innerHTML = '';

  if (!products.length) {
    grid.innerHTML = '<p style="color:var(--texto-mid);text-align:center;grid-column:1/-1;padding:3rem">No hay productos disponibles en este momento.</p>';
    return;
  }

  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'prod-card';
    card.setAttribute('data-cat', product.category);

    const tagHtml = product.tag
      ? `<span class="prod-tag${product.tag.toLowerCase() === 'nuevo' ? ' new' : ''}">${product.tag}</span>`
      : '';

    const hasPrice = product.price && Number(product.price) > 0;
    const priceHtml = hasPrice
      ? `<span class="prod-price">S/ ${Number(product.price).toLocaleString('es-PE')}</span>`
      : `<span class="prod-price-consultar">Consultar precio</span>`;

    const priceMsg  = hasPrice ? ` — Precio: S/ ${product.price}` : '';
    const mensajeWA = `Hola! Me interesa el producto: *${product.name}*${priceMsg}. ¿Está disponible?`;

    const imgHtml = product.image
      ? `<img src="${product.image}" alt="${product.name}" loading="lazy"
             onerror="this.style.display='none';this.nextElementSibling.style.removeProperty('display')">`
      : '';
    const placeholderStyle = product.image ? 'style="display:none"' : '';

    card.innerHTML = `
      <div class="prod-img">
        ${imgHtml}
        <div class="prod-img-fallback" ${placeholderStyle}>🎸</div>
        ${tagHtml}
      </div>
      <div class="prod-body">
        <div class="prod-cat">${getCategoryName(product.category)}</div>
        <div class="prod-name">${product.name}</div>
        ${product.description ? `<div class="prod-desc">${product.description}</div>` : ''}
        <div class="prod-footer">
          ${priceHtml}
          <a class="btn-wa-prod" href="${waLink(mensajeWA)}" target="_blank">🛒 Comprar</a>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}

/* ── Nombre legible de categoría ── */
function getCategoryName(cat) {
  const map = {
    guitarra:   'Guitarra',
    bateria:    'Batería',
    teclado:    'Piano / Teclado',
    viento:     'Viento',
    sonido:     'Sonido',
    accesorios: 'Accesorios'
  };
  return map[cat] || cat;
}

/* ── Filtrar por categoría ── */
function filtrar(btn, cat) {
  document.querySelectorAll('.ftab').forEach(t => t.classList.remove('on'));
  btn.classList.add('on');
  document.querySelectorAll('.prod-card').forEach(card => {
    card.style.display =
      (cat === 'todos' || card.dataset.cat === cat) ? 'block' : 'none';
  });
}

document.addEventListener('DOMContentLoaded', loadProducts);
