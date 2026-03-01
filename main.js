/* ══════════════════════════════════════════
   main.js — Casa Musical Talentos IM
   Sullana, Piura — +51 962 935 852
══════════════════════════════════════════ */

const WA_NUMBER = '51962935852';

/* ── Construye un enlace de WhatsApp con mensaje ── */
function waLink(mensaje) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(mensaje)}`;
}

/* ── Scroll Reveal ── */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('vis');
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* ── Sombra del Nav al hacer scroll ── */
window.addEventListener('scroll', () => {
  document.getElementById('navbar').style.boxShadow =
    window.scrollY > 50 ? '0 4px 30px rgba(0,0,0,.7)' : 'none';
});

/* ── Menú móvil (hamburguesa) ── */
function toggleNav() {
  const ul = document.querySelector('.nav-links');
  if (ul.style.display === 'flex') {
    ul.style.display = 'none';
  } else {
    ul.style.cssText =
      'display:flex;flex-direction:column;position:absolute;top:100%;' +
      'left:0;right:0;background:rgba(8,8,8,.98);padding:2rem 5%;' +
      'gap:1.5rem;border-bottom:1px solid rgba(200,168,75,.15);z-index:499;';
  }
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

/* ── Seleccionar plan de academia ── */
function selPlan(el) {
  document.querySelectorAll('.plan').forEach(p => p.classList.remove('sel'));
  el.classList.add('sel');
}

/* ── Formulario de contacto → WhatsApp ── */
function enviarForm(e) {
  e.preventDefault();

  const btn     = e.target.querySelector('.btn-enviar');
  const nombre  = e.target.querySelector('input[type=text]').value  || 'un cliente';
  const interes = e.target.querySelector('select').value            || 'información general';
  const mensaje = e.target.querySelector('textarea').value          || '';

  const texto =
    `Hola, soy ${nombre}. Me interesa: ${interes}.` +
    (mensaje ? ` Mensaje: ${mensaje}` : '');

  window.open(waLink(texto), '_blank');

  btn.textContent      = '✓ Redirigiendo a WhatsApp...';
  btn.style.background = '#25D366';

  setTimeout(() => {
    btn.textContent      = 'Enviar Consulta';
    btn.style.background = '';
    e.target.reset();
  }, 3000);
}
