// =========================================================
// vacio.js - Charcutería premium al vacío
// =========================================================
// Categorías con productos (como en el POS) y envío del pedido
// por WhatsApp en lugar de imprimir.
//
// CÓMO EDITAR:
//  - Cada categoría: id, nombre, emoji, imagen (opcional) y productos.
//  - "imagen": ruta de una foto, ej. "images/jamones.jpg".
//    Si la dejas vacía "" se muestra el emoji.
//  - Cada producto: id único, nombre y precio en $.
//      · Sin tamaños: detalle + precio.
//      · Con tamaños (categoría con "tamanos"): precio100 = precio por 100 g.
//  - Imagen de cada producto: por defecto se busca en images/<id>.jpg
//    (ej. images/roast-beef.jpg). Para otra ruta, agrega  imagen: "ruta.jpg"
//    al producto. Si no existe la foto, se muestra el emoji de la categoría.
//  ⚠️ Los productos y precios de abajo son EJEMPLOS: cámbialos por los tuyos.
// =========================================================

const charcuteriaVacio = [
  {
    id: "jamones",
    nombre: "Jamones artesanales",
    emoji: "🍖",
    imagen: "",
    // Tamaños de paquete en gramos. Si una categoría tiene "tamanos",
    // sus productos usan "precio100" (precio por cada 100 g).
    tamanos: [100, 200, 500],
    productos: [
      { id: "pollo-ahumado",    nombre: "Pollo ahumado",    precio100: 1.80 },
      { id: "roast-beef",       nombre: "Roast beef",       precio100: 2.80 },
      { id: "selva-negra",      nombre: "Selva negra",      precio100: 2.60 },
      { id: "lomo-jalapeno",    nombre: "Lomo jalapeño",    precio100: 2.50 },
      { id: "tender-con-hueso", nombre: "Tender con hueso", precio100: 2.00 },
      { id: "tender-sin-hueso", nombre: "Tender sin hueso", precio100: 2.40 },
      { id: "tocineta",         nombre: "Tocineta",         precio100: 2.20 },
      { id: "chorizo-ahumado",  nombre: "Chorizo ahumado",  precio100: 2.30 },
      { id: "chuleta-ahumada",  nombre: "Chuleta ahumada",  precio100: 2.10 }
      // Para fijar un precio distinto por tamaño (ej. descuento en 500 g):
      // { id: "...", nombre: "...", precios: { 100: 2.50, 200: 4.80, 500: 11.00 } }
    ]
  },
  {
    id: "quesos",
    nombre: "Quesos",
    emoji: "🧀",
    imagen: "",
    productos: [
      { id: "queso-gouda",   nombre: "Queso gouda",   detalle: "Cuña al vacío · 250 g", precio: 7.50 },
      { id: "queso-edam",    nombre: "Queso edam",    detalle: "Cuña al vacío · 250 g", precio: 7.50 },
      { id: "queso-ahumado", nombre: "Queso ahumado", detalle: "Cuña al vacío · 250 g", precio: 8.50 }
    ]
  },
  {
    id: "salamis",
    nombre: "Salamis y salchichones",
    emoji: "🥓",
    imagen: "",
    productos: [
      { id: "salami-italiano", nombre: "Salami italiano", detalle: "Paquete al vacío · 150 g", precio: 6.50 },
      { id: "salchichon",      nombre: "Salchichón",      detalle: "Paquete al vacío · 200 g", precio: 5.50 },
      { id: "pepperoni",       nombre: "Pepperoni",       detalle: "Paquete al vacío · 150 g", precio: 6.00 }
    ]
  },
  {
    id: "ahumados",
    nombre: "Ahumados",
    emoji: "🔥",
    imagen: "",
    productos: [
      { id: "tocino-ahumado", nombre: "Tocino ahumado",  detalle: "Paquete al vacío · 250 g", precio: 8.00 },
      { id: "lomo-ahumado",   nombre: "Lomo ahumado",    detalle: "Paquete al vacío · 200 g", precio: 9.50 }
    ]
  },
  {
    id: "mortadelas",
    nombre: "Mortadelas y patés",
    emoji: "🥪",
    imagen: "",
    productos: [
      { id: "mortadela", nombre: "Mortadela", detalle: "Paquete al vacío · 250 g", precio: 4.50 },
      { id: "pate",      nombre: "Paté",      detalle: "Unidad al vacío · 150 g",  precio: 5.00 }
    ]
  }
];

// =========================================================
// LÓGICA (no necesitas tocar desde aquí)
// =========================================================
// Carrito: { clave: cantidad }
//  - producto con tamaños  -> clave "id@gramos"  (ej. "roast-beef@200")
//  - producto sin tamaños  -> clave "id"
const vacCarrito = {};
let vacCategoriaAbierta = null;
let vacProductoAbierto = null; // id del producto expandido en el acordeón

function vacEsc(t) {
  return String(t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function vacMoneda(n) { return "$" + n.toFixed(2); }
function vacClave(id, g) { return g ? id + "@" + g : id; }

// Precio de un producto (en el tamaño g, si aplica)
function vacPrecio(p, g) {
  if (!g) return p.precio;
  if (p.precios && p.precios[g] != null) return p.precios[g];
  return Math.round(p.precio100 * g) / 100; // precio100 * g / 100
}

function vacEtiquetaTamano(g) { return g >= 1000 ? (g / 1000) + " kg" : g + " g"; }

// A partir de una clave devuelve { cat, prod, g }
function vacBuscarClave(clave) {
  const [id, gTxt] = clave.split("@");
  const g = gTxt ? parseInt(gTxt, 10) : null;
  for (const cat of charcuteriaVacio) {
    const prod = cat.productos.find(x => x.id === id);
    if (prod) return { cat, prod, g };
  }
  return null;
}

function vacCantidadCategoria(cat) {
  let n = 0;
  for (const clave in vacCarrito) {
    const f = vacBuscarClave(clave);
    if (f && f.cat.id === cat.id) n += vacCarrito[clave];
  }
  return n;
}

function vacTotal() {
  let t = 0;
  for (const clave in vacCarrito) {
    const f = vacBuscarClave(clave);
    if (f) t += vacPrecio(f.prod, f.g) * vacCarrito[clave];
  }
  return Math.round(t * 100) / 100;
}

// ---------- Navegación ----------
function abrirCharcuteria() {
  mostrarPantalla("pantalla-charcuteria");
  document.getElementById("header-titulo").innerHTML = 'CHARCUTERÍA <span>AL VACÍO</span>';
  document.getElementById("header-subtitulo").innerHTML = 'Elige tu categoría y arma tu pedido <em>al final</em>';
  const tb = document.querySelector(".total-bar");
  if (tb) tb.style.display = "none";
  vacRenderCategorias();
  vacRenderPedido();
}

function salirCharcuteria() {
  vacCerrarModal();
  mostrarPantalla("pantalla-inicio");
  document.getElementById("header-titulo").innerHTML = '¿QUÉ DESEA <span>HOY?</span>';
  document.getElementById("header-subtitulo").innerHTML = 'Elige el servicio que buscas <em>para empezar</em>';
  const tb = document.querySelector(".total-bar");
  if (tb) tb.style.display = "flex";
}

// ---------- Imágenes ----------
function vacImgTag(p, cat) {
  const src = p.imagen || ("images/" + p.id + ".jpg");
  return `<img src="${vacEsc(src)}" alt="${vacEsc(p.nombre)}" data-emoji="${vacEsc(cat.emoji || "🍽️")}" loading="lazy" onerror="vacImgError(this)">`;
}
// Si la foto no existe, se reemplaza por un cuadro con el emoji
function vacImgError(img) {
  const d = document.createElement("div");
  d.className = "vac-ph-fb";
  d.textContent = img.dataset.emoji || "🍽️";
  img.replaceWith(d);
}
function vacDesde(cat, p) {
  const g = (cat.tamanos && cat.tamanos[0]) || null;
  return g ? vacEtiquetaTamano(g) + " · " + vacMoneda(vacPrecio(p, g)) : vacMoneda(p.precio);
}

// ---------- Categorías (tarjetas grandes con fotos deslizables) ----------
function vacRenderCategorias() {
  const grid = document.getElementById("vac-grid");
  if (!grid) return;
  grid.innerHTML = charcuteriaVacio.map(cat => {
    const n = vacCantidadCategoria(cat);
    const total = cat.productos.length;
    const fotos = cat.productos.map(p => `
      <div class="vac-ph">
        ${vacImgTag(p, cat)}
        <div class="vac-ph-label"><b>${vacEsc(p.nombre)}</b><span>${vacDesde(cat, p)}</span></div>
      </div>`).join("");
    return `
      <article class="platter-card vac-catcard">
        <span class="vac-tag">${total} producto${total !== 1 ? "s" : ""}</span>
        ${n > 0 ? `<span class="vac-cart-tag">🛒 ${n}</span>` : ""}
        <div class="platter-gallery vac-gallery" style="--n3:${Math.min(total, 3)};--n2:${Math.min(total, 2)}">${fotos}</div>
        <div class="vac-cap">
          <div>
            <h3>${vacEsc(cat.emoji || "")} ${vacEsc(cat.nombre)}</h3>
            <p>${total > 2 ? "Desliza para ver todos · " : ""}toca una foto para verla en grande</p>
          </div>
          <button type="button" class="vac-btn-elegir" onclick="vacAbrirCategoria('${cat.id}')">Elegir productos →</button>
        </div>
      </article>`;
  }).join("");
}

// ---------- Modal de productos ----------
function vacAbrirCategoria(id) {
  const cat = charcuteriaVacio.find(c => c.id === id);
  if (!cat) return;
  vacCategoriaAbierta = id;
  vacProductoAbierto = null; // Reinicia el acordeón al abrir una nueva categoría
  document.getElementById("vac-modal-titulo").textContent = (cat.emoji ? cat.emoji + " " : "") + cat.nombre;
  document.getElementById("vac-buscador").value = "";
  vacRenderProductos();
  document.getElementById("vac-modal").classList.add("abierto");
}

function vacCerrarModal() {
  const m = document.getElementById("vac-modal");
  if (m) m.classList.remove("abierto");
  vacCategoriaAbierta = null;
  vacProductoAbierto = null;
  vacRenderCategorias();
}

// Toggle: abre/cierra un producto del acordeón
function vacToggleProducto(id) {
  vacProductoAbierto = (vacProductoAbierto === id) ? null : id;
  vacRenderProductos();
}

// Celda de un tamaño: muestra "Agregar" o, si ya hay cantidad, un − n +
function vacCeldaTamano(p, g) {
  const clave = vacClave(p.id, g);
  const q = vacCarrito[clave] || 0;
  const control = q > 0
    ? `<div class="vac-mini-stepper">
         <button type="button" onclick="vacCambiar('${clave}',-1)" aria-label="Quitar">−</button>
         <span>${q}</span>
         <button type="button" onclick="vacCambiar('${clave}',1)" aria-label="Agregar">+</button>
       </div>`
    : `<button type="button" class="vac-size-add" onclick="vacCambiar('${clave}',1)">+ Agregar</button>`;
  return `
    <div class="vac-size ${q > 0 ? "sel" : ""}">
      <div class="vac-size-g">${vacEtiquetaTamano(g)}</div>
      <div class="vac-size-p">${vacMoneda(vacPrecio(p, g))}</div>
      ${control}
    </div>`;
}

function vacRenderProductos() {
  const cat = charcuteriaVacio.find(c => c.id === vacCategoriaAbierta);
  if (!cat) return;
  const q = document.getElementById("vac-buscador").value.trim().toLowerCase();
  const lista = cat.productos.filter(p => !q || p.nombre.toLowerCase().includes(q));
  const cont = document.getElementById("vac-lista");
  if (!lista.length) {
    cont.innerHTML = '<div class="vac-vacio-msg">No hay productos con ese nombre</div>';
    return;
  }

  cont.innerHTML = lista.map(p => {
    // Producto con tamaños: acordeón (nombre + "desde $X" + expandir)
    if (cat.tamanos && cat.tamanos.length) {
      const abierto = vacProductoAbierto === p.id;
      // Precio mínimo (del tamaño más pequeño)
      const precioMin = vacPrecio(p, cat.tamanos[0]);
      // Cuántas unidades hay en carrito para este producto (sumando todos los tamaños)
      let totalEnCarrito = 0;
      cat.tamanos.forEach(g => {
        totalEnCarrito += vacCarrito[vacClave(p.id, g)] || 0;
      });

      return `
        <div class="vac-prod-accordion ${abierto ? "abierto" : ""}">
          <button type="button" class="vac-acc-header" onclick="vacToggleProducto('${p.id}')">
            <div class="vac-thumb">${vacImgTag(p, cat)}</div>
            <div class="vac-acc-info">
              <div class="vac-acc-nombre">${vacEsc(p.nombre)}</div>
              <div class="vac-acc-desde">Desde <strong>${vacMoneda(precioMin)}</strong> / ${vacEtiquetaTamano(cat.tamanos[0])}</div>
            </div>
            ${totalEnCarrito > 0 ? `<span class="vac-acc-badge">${totalEnCarrito}</span>` : ""}
            <span class="vac-acc-arrow">${abierto ? "▾" : "▸"}</span>
          </button>
          ${abierto ? `
            <div class="vac-acc-body">
              <div class="vac-sizes">${cat.tamanos.map(g => vacCeldaTamano(p, g)).join("")}</div>
            </div>
          ` : ""}
        </div>`;
    }
    // Producto simple (sin tamaños)
    const q2 = vacCarrito[p.id] || 0;
    return `
      <div class="vac-prod">
        <div class="vac-thumb">${vacImgTag(p, cat)}</div>
        <div class="vac-prod-info">
          <div class="vac-prod-nombre">${vacEsc(p.nombre)}</div>
          <div class="vac-prod-detalle">${vacEsc(p.detalle || "")}</div>
          <div class="vac-prod-precio">${vacMoneda(p.precio)}</div>
        </div>
        <div class="vac-stepper">
          <button type="button" onclick="vacCambiar('${p.id}',-1)" ${q2 === 0 ? "disabled" : ""} aria-label="Quitar">−</button>
          <span>${q2}</span>
          <button type="button" onclick="vacCambiar('${p.id}',1)" aria-label="Agregar">+</button>
        </div>
      </div>`;
  }).join("");
}

function vacCambiar(clave, delta) {
  const nueva = (vacCarrito[clave] || 0) + delta;
  if (nueva < 0 || nueva > 50) return;
  if (nueva === 0) delete vacCarrito[clave]; else vacCarrito[clave] = nueva;
  vacRenderProductos();
  vacRenderPedido();
}

// ---------- Pedido actual ----------
// Lista ordenada de líneas del carrito: [{cat, prod, g, clave, q}]
function vacLineas() {
  const out = [];
  for (const cat of charcuteriaVacio) {
    for (const prod of cat.productos) {
      const gs = (cat.tamanos && cat.tamanos.length) ? cat.tamanos : [null];
      for (const g of gs) {
        const clave = vacClave(prod.id, g);
        if (vacCarrito[clave]) out.push({ cat, prod, g, clave, q: vacCarrito[clave] });
      }
    }
  }
  return out;
}

function vacRenderPedido() {
  const cont = document.getElementById("vac-pedido-items");
  const totalEl = document.getElementById("vac-total");
  const btn = document.getElementById("vac-btn-wa");
  if (!cont) return;

  const lineas = vacLineas();
  let html = "", catActual = null;
  lineas.forEach(l => {
    if (l.cat.id !== catActual) {
      catActual = l.cat.id;
      html += `<div class="vac-ped-cat">${vacEsc(l.cat.emoji || "")} ${vacEsc(l.cat.nombre)}</div>`;
    }
    const nombre = l.prod.nombre + (l.g ? " · " + vacEtiquetaTamano(l.g) : "");
    html += `
      <div class="vac-ped-linea">
        <span class="vac-ped-qty">${l.q}×</span>
        <span class="vac-ped-nombre">${vacEsc(nombre)}</span>
        <span class="vac-ped-precio">${vacMoneda(vacPrecio(l.prod, l.g) * l.q)}</span>
        <button type="button" class="vac-ped-x" onclick="vacQuitar('${l.clave}')" aria-label="Quitar">✕</button>
      </div>`;
  });
  cont.innerHTML = html || '<div class="vac-vacio-msg">Aún no has agregado productos. Toca una categoría 👆</div>';
  totalEl.textContent = vacMoneda(vacTotal());
  btn.disabled = !html;
}

function vacQuitar(clave) {
  delete vacCarrito[clave];
  vacRenderPedido();
  vacRenderCategorias();
  // Si el modal está abierto, refrescamos también la lista
  const m = document.getElementById("vac-modal");
  if (m && m.classList.contains("abierto")) vacRenderProductos();
}

function vacLimpiar() {
  if (!Object.keys(vacCarrito).length) return;
  if (!confirm("¿Vaciar el pedido actual?")) return;
  for (const c in vacCarrito) delete vacCarrito[c];
  vacRenderPedido();
  vacRenderCategorias();
  const m = document.getElementById("vac-modal");
  if (m && m.classList.contains("abierto")) vacRenderProductos();
}

// ---------- Envío por WhatsApp ----------
function vacEnviarWhatsApp() {
  const lineas = vacLineas();
  if (!lineas.length) return;

  const nombre = document.getElementById("vac-nombre").value.trim();
  const nota = document.getElementById("vac-nota").value.trim();

  let msg = "¡Hola Ricodélico! Quiero hacer este pedido de *charcutería al vacío*:\n";
  if (nombre) msg += `\n👤 Nombre: ${nombre}\n`;

  let catActual = null;
  lineas.forEach(l => {
    if (l.cat.id !== catActual) {
      catActual = l.cat.id;
      msg += `\n*${l.cat.nombre}*\n`;
    }
    const pres = l.g ? " " + vacEtiquetaTamano(l.g) : (l.prod.detalle ? " (" + l.prod.detalle + ")" : "");
    msg += `• ${l.q} x ${l.prod.nombre}${pres} — ${vacMoneda(vacPrecio(l.prod, l.g) * l.q)}\n`;
  });

  msg += `\n*TOTAL: ${vacMoneda(vacTotal())}*\n`;
  if (nota) msg += `\n📝 Nota: ${nota}\n`;
  msg += "\n¿Me confirman disponibilidad y forma de entrega? 🙏";

  const telefono = (typeof NEGOCIO !== "undefined" && NEGOCIO.whatsapp) ? NEGOCIO.whatsapp : "584146774332";
  window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(msg)}`, "_blank");
}

document.addEventListener("DOMContentLoaded", function () {
  const b = document.getElementById("vac-buscador");
  if (b) b.addEventListener("input", vacRenderProductos);
  const m = document.getElementById("vac-modal");
  if (m) m.addEventListener("click", function (e) { if (e.target === m) vacCerrarModal(); });
});
