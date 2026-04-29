/* ══════════════════════════════════════════
   catalog.js — Carga y muestra productos
   Lee primero del localStorage (cambios del admin),
   luego del archivo products.json como fallback.
══════════════════════════════════════════ */

const CATALOG_WA_NUMBER = '51962935852';
const STORAGE_KEY       = 'talentos_products_v2';

function waLink(mensaje) {
  const number = typeof WA_NUMBER !== 'undefined' ? WA_NUMBER : CATALOG_WA_NUMBER;
  return `https://wa.me/${number}?text=${encodeURIComponent(mensaje)}`;
}

/* ── Cargar productos ── */
async function loadProducts() {
  try {
    /* Si el admin guardó cambios en localStorage, usarlos */
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      displayProducts(JSON.parse(stored));
      return;
    }
    /* Si no, cargar desde el archivo */
    const response = await fetch('products.json');
    const products = await response.json();
    displayProducts(products);
  } catch (error) {
    console.error('Error cargando productos:', error);
    const grid = document.getElementById('grid');
    if (grid) grid.innerHTML = '<p style="color:var(--texto-mid);text-align:center;grid-column:1/-1;padding:3rem">Error al cargar productos. Intente de nuevo más tarde.</p>';
  }
}

/* ── Mostrar productos en el grid ── */
function displayProducts(products) {
  const grid = document.getElementById('grid');
  if (!grid) return;
  grid.innerHTML = '';

  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'prod-card';
    card.setAttribute('data-cat', product.category);

    /* Tag */
    const tagHtml = product.tag
      ? `<span class="prod-tag${product.tag.toLowerCase() === 'nuevo' ? ' new' : ''}">${product.tag}</span>`
      : '';

    /* Precio */
    const hasPrice = product.price && Number(product.price) > 0;
    const priceHtml = hasPrice
      ? `<span class="prod-price">S/ ${Number(product.price).toLocaleString('es-PE')}</span>`
      : `<span class="prod-price-consultar">Consultar precio</span>`;

    /* Mensaje WhatsApp */
    const priceMsg  = hasPrice ? ` — Precio: S/ ${product.price}` : '';
    const mensajeWA = `Hola! Me interesa el producto: *${product.name}*${priceMsg}. ¿Está disponible?`;
    const waUrl     = waLink(mensajeWA);

    /* Imagen con fallback */
    const imgHtml = product.image
      ? `<img src="${product.image}" alt="${product.name}" loading="lazy"
             onerror="this.style.display='none';this.nextElementSibling.style.removeProperty('display')">`
      : '';
    const placeholderStyle = product.image ? 'style="display:none"' : '';
    const placeholder = `<div class="prod-img-fallback" ${placeholderStyle}>🎸</div>`;

    card.innerHTML = `
      <div class="prod-img">
        ${imgHtml}${placeholder}${tagHtml}
      </div>
      <div class="prod-body">
        <div class="prod-cat">${getCategoryName(product.category)}</div>
        <div class="prod-name">${product.name}</div>
        ${product.description ? `<div class="prod-desc">${product.description}</div>` : ''}
        <div class="prod-footer">
          ${priceHtml}
          <a class="btn-wa-prod" href="${waUrl}" target="_blank">🛒 Comprar</a>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}

/* ── Nombre legible de la categoría ── */
function getCategoryName(cat) {
  const categories = {
    guitarra:   'Guitarra',
    bateria:    'Batería',
    teclado:    'Piano / Teclado',
    viento:     'Viento',
    sonido:     'Sonido',
    accesorios: 'Accesorios'
  };
  return categories[cat] || cat;
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
