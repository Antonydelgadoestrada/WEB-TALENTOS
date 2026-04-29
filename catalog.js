/* ══════════════════════════════════════════
   catalog.js — Catálogo con Supabase
   • Categorías dinámicas
   • Buscador por nombre / descripción
   • Filtro por categoría
   • Fallback a products.json si Supabase no responde
══════════════════════════════════════════ */

let _sb          = null;
let allProducts  = [];      // todos los productos cargados
let activeCategory = 'todos';
let searchQuery  = '';

const DEFAULT_CATS = [
  { name: 'Guitarras',         slug: 'guitarra'  },
  { name: 'Baterías',          slug: 'bateria'   },
  { name: 'Pianos / Teclados', slug: 'teclado'   },
  { name: 'Vientos',           slug: 'viento'    },
  { name: 'Sonido / Consolas', slug: 'sonido'    },
  { name: 'Accesorios',        slug: 'accesorios'},
];

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

/* ══════════════════════════════════════════
   INIT
══════════════════════════════════════════ */
async function init() {
  /* Cargamos categorías y productos en paralelo */
  const [cats] = await Promise.all([
    fetchCategories(),
    fetchProducts(),
  ]);
  renderFilterButtons(cats);
}

/* ══════════════════════════════════════════
   CATEGORÍAS
══════════════════════════════════════════ */
async function fetchCategories() {
  try {
    const { data, error } = await getSB()
      .from('categories')
      .select('name, slug')
      .order('id', { ascending: true });

    if (error) throw error;
    return data && data.length ? data : DEFAULT_CATS;
  } catch {
    return DEFAULT_CATS;
  }
}

function renderFilterButtons(cats) {
  const bar = document.getElementById('filterBar');
  if (!bar) return;

  const catBtns = cats.map(c =>
    `<button class="ftab" onclick="filtrar(this,'${c.slug}')">${c.name}</button>`
  ).join('');

  bar.innerHTML =
    `<button class="ftab on" onclick="filtrar(this,'todos')">Todos</button>` + catBtns;
}

/* ══════════════════════════════════════════
   PRODUCTOS
══════════════════════════════════════════ */
async function fetchProducts() {
  const grid = document.getElementById('grid');

  try {
    const { data, error } = await getSB()
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    allProducts = data || [];
  } catch (err) {
    /* Fallback a products.json */
    console.warn('Supabase no disponible, usando products.json:', err.message);
    try {
      const res = await fetch('products.json');
      allProducts = await res.json();
    } catch {
      if (grid) grid.innerHTML =
        '<p class="catalog-no-results"><p>Error al cargar los productos.</p><span>Por favor recarga la página.</span></p>';
      return;
    }
  }

  applyFilters();
}

/* ══════════════════════════════════════════
   FILTROS + BÚSQUEDA
══════════════════════════════════════════ */
function filtrar(btn, cat) {
  activeCategory = cat;
  document.querySelectorAll('#filterBar .ftab').forEach(t => t.classList.remove('on'));
  btn.classList.add('on');
  applyFilters();
}

function handleSearch(value) {
  searchQuery = value.trim().toLowerCase();
  applyFilters();
}

function applyFilters() {
  const q = searchQuery;

  const filtered = allProducts.filter(p => {
    const catOk = activeCategory === 'todos' || p.category === activeCategory;
    const searchOk = !q ||
      p.name.toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q);
    return catOk && searchOk;
  });

  displayProducts(filtered);
}

/* ══════════════════════════════════════════
   RENDERIZADO
══════════════════════════════════════════ */
function displayProducts(products) {
  const grid = document.getElementById('grid');
  if (!grid) return;
  grid.innerHTML = '';

  if (!products.length) {
    grid.innerHTML = `
      <div class="catalog-no-results">
        <p>No se encontraron productos</p>
        <span>${searchQuery ? `para "${searchQuery}"` : 'en esta categoría'}</span>
      </div>`;
    return;
  }

  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'prod-card';
    card.setAttribute('data-cat', product.category);

    const tagHtml = product.tag
      ? `<span class="prod-tag${product.tag.toLowerCase() === 'nuevo' ? ' new' : ''}">${product.tag}</span>`
      : '';

    const hasPrice  = product.price && Number(product.price) > 0;
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

function getCategoryName(slug) {
  /* Intentar mapear el slug a un nombre legible */
  const map = {
    guitarra:   'Guitarra',
    bateria:    'Batería',
    teclado:    'Piano / Teclado',
    viento:     'Viento',
    sonido:     'Sonido',
    accesorios: 'Accesorios',
  };
  return map[slug] || slug;
}

/* ══════════════════════════════════════════
   INICIO
══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', init);
