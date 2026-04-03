/* ══════════════════════════════════════════
   catalog.js — Carga y muestra productos desde products.json
══════════════════════════════════════════ */

// Usar el número de WhatsApp en main.js para evitar redeclaración global
const CATALOG_WA_NUMBER = '51962935852';

/* ── Construye un enlace de WhatsApp con mensaje ── */
function waLink(mensaje) {
  const number = typeof WA_NUMBER !== 'undefined' ? WA_NUMBER : CATALOG_WA_NUMBER;
  return `https://wa.me/${number}?text=${encodeURIComponent(mensaje)}`;
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(mensaje)}`;
}

/* ── Cargar productos desde JSON ── */
async function loadProducts() {
  try {
    const response = await fetch('products.json');
    const products = await response.json();
    displayProducts(products);
  } catch (error) {
    console.error('Error cargando productos:', error);
  }
}

/* ── Mostrar productos en el grid ── */
function displayProducts(products) {
  const grid = document.getElementById('grid');
  grid.innerHTML = ''; // Limpiar el grid

  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'prod-card';
    card.setAttribute('data-cat', product.category);

    const tagHtml = product.tag ? `<span class="prod-tag ${product.tag.toLowerCase() === 'nuevo' ? 'new' : ''}">${product.tag}</span>` : '';

    const mensajeWA = `HOLA, ME INTERESA SABER MAS INFORMACION HACERCA DEL PRODUCTO ${product.name}.`;
    const waUrl = waLink(mensajeWA);

    card.innerHTML = `
      <div class="prod-img"><img src="${product.image}" alt="${product.name}">${tagHtml}</div>
      <div class="prod-body">
        <div class="prod-cat">${getCategoryName(product.category)}</div>
        <div class="prod-name">${product.name}</div>
        <div class="prod-desc">${product.description}</div>
        <div class="prod-footer">
          <a class="btn-wa-prod" href="${waUrl}" target="_blank">🛒 Comprar</a>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}

/* ── Obtener nombre legible de la categoría ── */
function getCategoryName(cat) {
  const categories = {
    'guitarra': 'Guitarra',
    'bateria': 'Batería',
    'teclado': 'Piano / Teclado',
    'viento': 'Viento',
    'sonido': 'Sonido',
    'accesorios': 'Accesorios'
  };
  return categories[cat] || cat;
}

/* ── Filtrar productos por categoría ── */
function filtrar(btn, cat) {
  document.querySelectorAll('.ftab').forEach(t => t.classList.remove('on'));
  btn.classList.add('on');

  document.querySelectorAll('.prod-card').forEach(card => {
    card.style.display =
      (cat === 'todos' || card.dataset.cat === cat) ? 'block' : 'none';
  });
}

/* ── Inicializar cuando el DOM esté listo ── */
document.addEventListener('DOMContentLoaded', loadProducts);