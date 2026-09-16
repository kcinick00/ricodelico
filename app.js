// =========================================================
// app.js - Versión con resumen general fusionado (eliminado el menú intermedio)
// =========================================================

const fmt = n => "$" + n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const quantities = {};
let pantallaActual = "pantalla-cantidad";
let cantidadTotalPanes = 1;
let panesArmados = [];
let ultimoPanArmado = null;
let ultimoPedido = null;
let panEnEdicion = null;

// =========================================================
// TOAST
// =========================================================
function showToast(message, type = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  const icon = type === "success" ? "✓" : type === "remove" ? "✕" : "ℹ";
  toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span>`;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("toast-visible"));
  setTimeout(() => {
    toast.classList.remove("toast-visible");
    toast.classList.add("toast-hiding");
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// =========================================================
// NAVEGACIÓN
// =========================================================
function mostrarPantalla(id) {
  document.querySelectorAll(".pantalla").forEach(p => p.classList.remove("activa"));
  const pantalla = document.getElementById(id);
  if (pantalla) pantalla.classList.add("activa");
  pantallaActual = id;
  actualizarBotonVolver();
}

function actualizarBotonVolver() {
  const btn = document.getElementById("btn-volver");
  if (["pantalla-combos", "pantalla-sandwich", "pantalla-resumen"].includes(pantallaActual)) {
    btn.style.display = "flex";
  } else {
    btn.style.display = "none";
  }
}

function volverAtras() {
  if (pantallaActual === "pantalla-sandwich" || pantallaActual === "pantalla-combos") {
    if (panEnEdicion !== null) {
      cancelarPan();
    } else {
      mostrarPantalla("pantalla-resumen");
      renderResumenGeneral();
    }
  } else if (pantallaActual === "pantalla-resumen") {
    if (panesArmados.length === 0) {
      mostrarPantalla("pantalla-cantidad");
    }
  }
}

// =========================================================
// PANTALLA 1: CANTIDAD INICIAL
// =========================================================
function cambiarCantidadInicial(delta) {
  const nueva = cantidadTotalPanes + delta;
  if (nueva < 1 || nueva > 20) return;
  cantidadTotalPanes = nueva;
  document.getElementById("cantidad-inicial-display").textContent = cantidadTotalPanes;
}

function confirmarCantidadInicial() {
  panesArmados = [];
  panEnEdicion = null;
  ultimoPanArmado = null;
  mostrarPantalla("pantalla-resumen");
  renderResumenGeneral();
}

// =========================================================
// PANTALLA 5: RESUMEN GENERAL (fusionada con las opciones)
// =========================================================
function renderResumenGeneral() {
  const items = document.getElementById("resumen-items");
  const cantidadEl = document.getElementById("resumen-cantidad");
  const combosEl = document.getElementById("resumen-combos-cantidad");
  const totalEl = document.getElementById("resumen-total");
  const progresoEl = document.getElementById("progreso-relleno");
  const contadorEl = document.getElementById("progreso-contador");
  const subtitulo = document.getElementById("resumen-subtitulo");
  const btnRepetir = document.getElementById("btn-repetir");
  
  items.innerHTML = "";
  let total = 0;
  let cantidadPanes = 0;
  let cantidadCombos = 0;
  
  const getNombre = (item) => item.nombre || item.name || "Sin nombre";
  
  panesArmados.forEach((pan, idx) => {
    total += pan.precio;
    const esCombo = pan.tipo === "combo";
    if (esCombo) cantidadCombos++; else cantidadPanes++;
    
    const div = document.createElement("div");
    div.className = "resumen-item";
    
    let detalleHTML = "";
    if (esCombo) {
      detalleHTML = `<div class="detalle">${pan.descripcion}</div>`;
    } else {
      const lineas = [];
      if (pan.pan) {
        lineas.push(`<span style="color: var(--accent);">🥖 ${getNombre(pan.pan)}</span>`);
      }
      const agregarLinea = (items, emoji) => {
        if (!items || !items.length) return;
        const texto = items.map(item => {
          const qty = item.qty || 1;
          return qty > 1 ? `${getNombre(item)} x${qty}` : getNombre(item);
        }).join(", ");
        lineas.push(`${emoji} ${texto}`);
      };
      agregarLinea(pan.embutidos, "🥓");
      agregarLinea(pan.proteinas, "🍖");
      agregarLinea(pan.verduras, "🥬");
      agregarLinea(pan.salsas, "🥫");
      detalleHTML = `<div class="detalle" style="margin-top: 6px;">${lineas.join("<br>")}</div>`;
    }
    
    div.innerHTML = `
      <div class="info">
        <div class="titulo">${esCombo ? "🎁 " + pan.nombre : "🥪 Pan " + (idx + 1)}</div>
        ${detalleHTML}
      </div>
      <div class="precio">${fmt(pan.precio)}</div>
      <div class="acciones">
        <button class="btn-accion eliminar" onclick="eliminarPan(${idx})" title="Eliminar">🗑</button>
      </div>
    `;
    items.appendChild(div);
  });
  
  if (panesArmados.length === 0) {
    items.innerHTML = `<div class="resumen-item" style="justify-content: center; color: var(--text-muted); font-style: italic; font-size: 14px;">Aún no has armado ningún pan</div>`;
  }
  
  // Actualizar totales
  cantidadEl.textContent = cantidadPanes;
  combosEl.textContent = cantidadCombos;
  totalEl.textContent = fmt(total);
  
  // Actualizar barra de progreso
  const totalActual = panesArmados.length;
  const porcentaje = (totalActual / cantidadTotalPanes) * 100;
  progresoEl.style.width = porcentaje + "%";
  contadorEl.textContent = `${totalActual} / ${cantidadTotalPanes}`;
  
  // Actualizar subtítulo
  subtitulo.innerHTML = `Vas a pedir <em>${cantidadTotalPanes} sándwich${cantidadTotalPanes > 1 ? "es" : ""}</em>`;
  
  // Habilitar/deshabilitar botón repetir
  btnRepetir.disabled = !ultimoPanArmado;
  
  // Actualizar total en la barra inferior
  document.getElementById("total-out").textContent = fmt(total);
}

// =========================================================
// ABRIR ARMA TU SÁNDWICH
// =========================================================
function abrirSandwich() {
  if (panesArmados.length >= cantidadTotalPanes) {
    showToast("Ya completaste todos los panes", "remove");
    return;
  }
  limpiarEditor();
  panEnEdicion = null;
  const firstPan = document.querySelector('input[name="pan"]');
  if (firstPan) { firstPan.checked = true; quantities[firstPan.value] = 1; }
  mostrarPantalla("pantalla-sandwich");
  document.getElementById("header-titulo").innerHTML = 'ARMA TU <span>SÁNDWICH</span>';
  document.getElementById("header-subtitulo").innerHTML = `Pan ${panesArmados.length + 1} de ${cantidadTotalPanes}`;
  renderSandwich();
  startAnimation();
  actualizarResumenPan();
}

function abrirCombos() {
  if (panesArmados.length >= cantidadTotalPanes) {
    showToast("Ya completaste todos los panes", "remove");
    return;
  }
  mostrarPantalla("pantalla-combos");
  document.getElementById("header-titulo").innerHTML = 'COMBOS <span>PREARMADOS</span>';
  document.getElementById("header-subtitulo").innerHTML = `Pan ${panesArmados.length + 1} de ${cantidadTotalPanes}`;
  renderCombos();
}

function renderCombos() {
  const grid = document.getElementById("combos-grid");
  if (!grid) return;
  grid.innerHTML = "";
  combos.forEach(combo => {
    const card = document.createElement("div");
    card.className = "combo-card";
    card.innerHTML = `
      <div class="combo-emoji">${combo.emoji}</div>
      <div class="combo-nombre">${combo.nombre}</div>
      <div class="combo-ingredientes">${combo.descripcion}</div>
      <div class="combo-precio">${fmt(combo.precio)}</div>
      <button class="combo-agregar" onclick="agregarComboAlPedido('${combo.id}')">Agregar al pedido</button>
    `;
    grid.appendChild(card);
  });
}

function agregarComboAlPedido(comboId) {
  const combo = combos.find(c => c.id === comboId);
  if (!combo) return;
  if (panesArmados.length >= cantidadTotalPanes) {
    showToast("Ya completaste todos los panes", "remove");
    return;
  }
  const panCombo = {
    tipo: "combo",
    id: combo.id,
    nombre: combo.nombre,
    emoji: combo.emoji,
    descripcion: combo.descripcion,
    precio: combo.precio
  };
  panesArmados.push(panCombo);
  ultimoPanArmado = JSON.parse(JSON.stringify(panCombo));
  showToast(`${combo.emoji} ${combo.nombre} agregado`, "success");
  mostrarPantalla("pantalla-resumen");
  renderResumenGeneral();
}

// =========================================================
// GUARDAR PAN
// =========================================================
function guardarPan() {
  const panSel = document.querySelector('input[name="pan"]:checked');
  if (!panSel) { showToast("Selecciona un pan primero", "remove"); return; }
  const panItem = ingredientsData.pan.items.find(i => i.id === panSel.value);
  if (!panItem) return;
  
  const simplificar = (items) => items.map(i => ({
    id: i.id,
    nombre: i.name || i.nombre || "Sin nombre",
    price: i.price || 0,
    qty: quantities[i.id] || 1
  }));
  
  const embutidos = simplificar(getSelectedItems("embutidos"));
  const proteinas = simplificar(getSelectedItems("proteinas"));
  const verduras = simplificar(getSelectedItems("verduras"));
  const salsas = simplificar(getSelectedItems("salsas"));
  
  let precio = panItem.price;
  [...embutidos, ...proteinas, ...verduras, ...salsas].forEach(item => {
    precio += item.price * item.qty;
  });
  
  const panData = {
    tipo: "personalizado",
    pan: {
      id: panItem.id,
      nombre: panItem.name || "Pan",
      price: panItem.price || 0,
      qty: 1
    },
    embutidos,
    proteinas,
    verduras,
    salsas,
    precio
  };
  
  if (panEnEdicion !== null) {
    panesArmados[panEnEdicion] = panData;
    panEnEdicion = null;
    showToast("Pan actualizado", "success");
  } else {
    panesArmados.push(panData);
    showToast("Pan guardado", "success");
  }
  
  ultimoPanArmado = JSON.parse(JSON.stringify(panData));
  limpiarEditor();
  mostrarPantalla("pantalla-resumen");
  renderResumenGeneral();
}

function cancelarPan() {
  if (panEnEdicion !== null) panEnEdicion = null;
  limpiarEditor();
  mostrarPantalla("pantalla-resumen");
  renderResumenGeneral();
}

function limpiarEditor() {
  document.querySelectorAll('input[type="checkbox"]').forEach(inp => inp.checked = false);
  document.querySelectorAll('input[name="pan"]').forEach(inp => inp.checked = false);
  Object.keys(quantities).forEach(k => delete quantities[k]);
  document.querySelectorAll('.qty-controls').forEach(c => c.classList.remove('visible'));
  animState.layers = {};
  renderSandwich();
  actualizarResumenPan();
}

function cargarPanEnEditor(pan) {
  limpiarEditor();
  if (pan.pan) {
    const panInput = document.querySelector(`input[value="${pan.pan.id}"]`);
    if (panInput) { panInput.checked = true; quantities[pan.pan.id] = 1; }
  }
  ["embutidos", "proteinas", "verduras", "salsas"].forEach(cat => {
    (pan[cat] || []).forEach(item => {
      const input = document.querySelector(`input[value="${item.id}"]`);
      if (input) {
        input.checked = true;
        quantities[item.id] = item.qty;
        updateCardControls(item.id, true);
      }
    });
  });
}

function eliminarPan(idx) {
  const pan = panesArmados[idx];
  if (!confirm(`¿Eliminar este ${pan.tipo === "combo" ? "combo" : "pan"}?`)) return;
  panesArmados.splice(idx, 1);
  showToast("Eliminado", "remove");
  renderResumenGeneral();
}

function repetirUltimoPan() {
  if (!ultimoPanArmado) { showToast("No hay pan para repetir", "remove"); return; }
  if (panesArmados.length >= cantidadTotalPanes) { showToast("Ya completaste todos los panes", "remove"); return; }
  const copia = JSON.parse(JSON.stringify(ultimoPanArmado));
  panesArmados.push(copia);
  showToast("Pan repetido", "success");
  renderResumenGeneral();
}

// =========================================================
// CONSTRUIR GRUPOS
// =========================================================
function buildGroup(key, cfg) {
  const container = document.getElementById(key + "-group");
  if (!container) return;
  cfg.items.forEach((item, idx) => {
    const row = document.createElement("label");
    row.className = "option";
    const input = document.createElement("input");
    input.type = cfg.type;
    input.name = key;
    input.value = item.id;
    input.addEventListener("change", () => {
      if (input.checked) {
        if (cfg.type === "radio") {
          Object.keys(quantities).forEach(k => {
            const otherInput = document.querySelector(`input[value="${k}"]`);
            if (otherInput && otherInput.type === "radio" && k !== item.id) delete quantities[k];
          });
          quantities[item.id] = 1;
        } else {
          quantities[item.id] = 1;
        }
      } else {
        if (cfg.type === "radio") return;
        delete quantities[item.id];
      }
      updateCardControls(item.id, input.checked);
      actualizarResumenPan();
      startAnimation();
    });
    row.appendChild(input);
    if (item.image) {
      const img = document.createElement("img");
      img.className = "option-img";
      img.src = item.image;
      img.alt = item.name;
      img.loading = "lazy";
      img.onerror = () => { img.style.display = "none"; };
      row.appendChild(img);
    }
    const label = document.createElement("span");
    label.className = "option-name";
    label.textContent = item.name;
    row.appendChild(label);
    const price = document.createElement("span");
    price.className = "price";
    price.textContent = item.price === 0 ? "Incluido" : "+" + fmt(item.price);
    row.appendChild(price);
    const qtyControls = document.createElement("div");
    qtyControls.className = "qty-controls";
    qtyControls.dataset.id = item.id;
    const btnMinus = document.createElement("button");
    btnMinus.type = "button";
    btnMinus.className = "qty-btn qty-minus";
    btnMinus.textContent = "−";
    btnMinus.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      const current = quantities[item.id] || 1;
      if (current > 1) {
        quantities[item.id] = current - 1;
        updateQtyDisplay(item.id);
        actualizarResumenPan();
        startAnimation();
      } else {
        if (cfg.type === "checkbox") {
          input.checked = false;
          delete quantities[item.id];
          updateCardControls(item.id, false);
          actualizarResumenPan();
          startAnimation();
        }
      }
    });
    const qtyDisplay = document.createElement("span");
    qtyDisplay.className = "qty-display";
    qtyDisplay.textContent = "1";
    const btnPlus = document.createElement("button");
    btnPlus.type = "button";
    btnPlus.className = "qty-btn qty-plus";
    btnPlus.textContent = "+";
    btnPlus.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      const current = quantities[item.id] || 1;
      if (current < 10) {
        quantities[item.id] = current + 1;
        updateQtyDisplay(item.id);
        actualizarResumenPan();
        startAnimation();
      }
    });
    qtyControls.appendChild(btnMinus);
    qtyControls.appendChild(qtyDisplay);
    qtyControls.appendChild(btnPlus);
    row.appendChild(qtyControls);
    container.appendChild(row);
  });
}

function updateQtyDisplay(id) {
  const display = document.querySelector(`.qty-controls[data-id="${id}"] .qty-display`);
  if (display) display.textContent = quantities[id] || 1;
}

function updateCardControls(id, isChecked) {
  const controls = document.querySelector(`.qty-controls[data-id="${id}"]`);
  if (!controls) return;
  if (isChecked) {
    controls.classList.add("visible");
    if (!quantities[id]) { quantities[id] = 1; updateQtyDisplay(id); }
  } else {
    controls.classList.remove("visible");
  }
}

function getSelectedItems(key) {
  const cfg = ingredientsData[key];
  if (!cfg) return [];
  const inputs = document.querySelectorAll('input[name="' + key + '"]:checked');
  return Array.from(inputs).map(inp => cfg.items.find(i => i.id === inp.value)).filter(Boolean);
}

function actualizarResumenPan() {
  const list = document.getElementById("summary-list");
  const subtotalOut = document.getElementById("subtotal-out");
  if (!list || !subtotalOut) return;
  list.innerHTML = "";
  let subtotal = 0;
  let count = 0;
  const panSel = document.querySelector('input[name="pan"]:checked');
  if (panSel) {
    const panItem = ingredientsData.pan.items.find(i => i.id === panSel.value);
    if (panItem) {
      subtotal += panItem.price;
      count++;
      const li = document.createElement("li");
      li.innerHTML = `<span class="item-name">${panItem.name}</span><span class="item-price">+${fmt(panItem.price)}</span>`;
      list.appendChild(li);
    }
  }
  ["salsas", "embutidos", "proteinas", "verduras"].forEach(key => {
    getSelectedItems(key).forEach(item => {
      const qty = quantities[item.id] || 1;
      const itemTotal = item.price * qty;
      subtotal += itemTotal;
      count++;
      const li = document.createElement("li");
      const suffix = qty > 1 ? ` x${qty}` : "";
      li.innerHTML = `<span class="item-name">${item.name}${suffix}</span><span class="item-price">+${fmt(itemTotal)}</span>`;
      list.appendChild(li);
    });
  });
  if (count === 0) {
    const li = document.createElement("li");
    li.className = "empty-msg";
    li.textContent = "Selecciona un pan para empezar";
    list.appendChild(li);
  }
  subtotalOut.textContent = fmt(subtotal);
}

// =========================================================
// ANIMACIÓN
// =========================================================
const animState = { layers: {}, requestId: null, isAnimating: false };

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = Math.min(255, Math.max(0, (n >> 16) + amt));
  let g = Math.min(255, Math.max(0, ((n >> 8) & 0xff) + amt));
  let b = Math.min(255, Math.max(0, (n & 0xff) + amt));
  return "rgb(" + r + "," + g + "," + b + ")";
}

const imageCache = {};
function loadImage(src) {
  if (!src) return null;
  if (imageCache[src]) return imageCache[src];
  const img = new Image();
  img.onload = () => { if (!animState.isAnimating) renderSandwich(); };
  img.onerror = () => { img.__failed = true; };
  img.src = src;
  imageCache[src] = img;
  return img;
}
function isReady(img) { return img && img.complete && img.naturalWidth > 0 && !img.__failed; }

function drawLayer(ctx, src, color, x, y, w, h, r, drawShadow = true) {
  const img = src ? loadImage(src) : null;
  if (drawShadow) {
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;
    drawRoundedRect(ctx, x, y, w, h, r);
    ctx.fillStyle = "rgba(0,0,0,0.01)";
    ctx.fill();
    ctx.restore();
  }
  if (isReady(img)) {
    ctx.save();
    drawRoundedRect(ctx, x, y, w, h, r);
    ctx.clip();
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();
  } else {
    ctx.fillStyle = color || "#CCCCCC";
    drawRoundedRect(ctx, x, y, w, h, r);
    ctx.fill();
  }
}

function getDPR() { return Math.min(window.devicePixelRatio || 1, 1.5); }

function getLayersWithQuantities() {
  const baseLayers = [...getSelectedItems("embutidos"), ...getSelectedItems("proteinas"), ...getSelectedItems("verduras")];
  const expandedLayers = [];
  baseLayers.forEach(item => {
    const qty = quantities[item.id] || 1;
    for (let i = 0; i < qty; i++) expandedLayers.push({ ...item, _qtyIndex: i, _qtyTotal: qty });
  });
  return expandedLayers.slice(0, 12);
}

function calculateTargets() {
  const panSel = document.querySelector('input[name="pan"]:checked');
  const panItem = panSel ? ingredientsData.pan.items.find(i => i.id === panSel.value) : null;
  const layers = getLayersWithQuantities();
  const salsas = getSelectedItems("salsas");
  const canvas = document.getElementById("sandwich-canvas");
  const dpr = getDPR();
  const W = canvas.width / dpr;
  const H = canvas.height / dpr;
  const cx = W / 2;
  const baseWidth = W * 0.85;
  const bunHeight = baseWidth * 0.18;
  const layerHeight = baseWidth * 0.10;
  const overlap = baseWidth * 0.03;
  const stepY = layerHeight - overlap;
  const totalHeight = bunHeight * 2 + layers.length * stepY + (salsas.length ? layerHeight * 0.6 : 0) + 30;
  let y = H - Math.max(20, (H - totalHeight) / 2) - bunHeight;
  const bottomY = y;
  y -= stepY;
  const layerTargets = {};
  layers.forEach((item, i) => {
    const variation = (i % 3 === 0) ? baseWidth * 0.02 : (i % 3 === 1) ? -baseWidth * 0.01 : 0;
    const w = baseWidth - baseWidth * 0.05 + variation;
    const key = item._qtyTotal > 1 ? `${item.id}_${item._qtyIndex}` : item.id;
    layerTargets[key] = { y, w, h: layerHeight, item, color: item.color, layerImage: item.layerImage, originalId: item.id };
    y -= stepY;
  });
  const salsaTargets = {};
  salsas.forEach((s, i) => {
    const w = baseWidth - baseWidth * 0.06 + (i % 2 === 0 ? baseWidth * 0.02 : -baseWidth * 0.02);
    const salsaHeight = layerHeight * 0.6;
    y -= (salsaHeight - 4);
    salsaTargets[s.id] = { y, w, h: salsaHeight, item: s, color: s.color, layerImage: s.layerImage };
    y -= 4;
  });
  const topY = y - 4;
  return { panItem, panColor: panItem ? panItem.color : "#E8C27A", baseWidth, bunHeight, layerHeight, cx, W, H, bottomY, topY, layerTargets, salsaTargets };
}

function renderSandwich() {
  const canvas = document.getElementById("sandwich-canvas");
  if (!canvas) return;
  const dpr = getDPR();
  const displayWidth = canvas.clientWidth || 220;
  const displayHeight = Math.round(displayWidth * (440 / 220));
  if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    canvas.style.height = displayHeight + "px";
  }
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "medium";
  const W = canvas.width / dpr;
  const H = canvas.height / dpr;
  ctx.clearRect(0, 0, W, H);
  const targets = calculateTargets();
  const { panItem, panColor, baseWidth, bunHeight, cx, bottomY, topY } = targets;
  ctx.beginPath();
  ctx.ellipse(cx, bottomY + bunHeight + 6, baseWidth / 2 + 15, 10, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.fill();
  drawBottomBun(ctx, panItem, panColor, cx - baseWidth / 2, bottomY, baseWidth, bunHeight);
  Object.keys(targets.layerTargets).forEach(key => {
    const t = targets.layerTargets[key];
    const state = animState.layers[key];
    const currentY = state ? state.currentY : t.y;
    drawLayer(ctx, t.layerImage, t.color, cx - t.w / 2, currentY, t.w, t.h, 10, true);
  });
  Object.keys(targets.salsaTargets).forEach(id => {
    const t = targets.salsaTargets[id];
    const state = animState.layers[id];
    const currentY = state ? state.currentY : t.y;
    drawSalsaWavy(ctx, t, cx, currentY);
  });
  drawTopBun(ctx, panItem, panColor, cx, topY, baseWidth, bunHeight);
}

function drawBottomBun(ctx, panItem, panColor, x, y, w, h) {
  const img = panItem && panItem.bottomImage ? loadImage(panItem.bottomImage) : null;
  const r = h * 0.45;
  const drawPath = () => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };
  if (isReady(img)) {
    ctx.save(); drawPath(); ctx.clip(); ctx.drawImage(img, x, y, w, h); ctx.restore();
  } else {
    drawPath(); ctx.fillStyle = panColor; ctx.fill();
  }
}

function drawTopBun(ctx, panItem, panColor, cx, y, baseWidth, bunHeight) {
  const img = panItem && panItem.topImage ? loadImage(panItem.topImage) : null;
  const domeWidth = baseWidth + 10;
  const domeHeight = domeWidth * 0.30;
  const startX = cx - domeWidth / 2;
  const startY = y - domeHeight;
  const drawDomePath = () => {
    ctx.beginPath();
    ctx.moveTo(startX, y);
    ctx.lineTo(startX, startY + domeHeight * 0.6);
    ctx.quadraticCurveTo(startX, startY, cx, startY);
    ctx.quadraticCurveTo(startX + domeWidth, startY, startX + domeWidth, startY + domeHeight * 0.6);
    ctx.lineTo(startX + domeWidth, y);
    ctx.closePath();
  };
  if (isReady(img)) {
    ctx.save(); drawDomePath(); ctx.clip(); ctx.drawImage(img, startX, startY, domeWidth, domeHeight + 10); ctx.restore();
  } else {
    drawDomePath(); ctx.fillStyle = panColor; ctx.fill();
  }
}

function drawSalsaWavy(ctx, t, cx, currentY) {
  const { w, h, color, layerImage } = t;
  const img = layerImage ? loadImage(layerImage) : null;
  const startX = cx - w / 2;
  const startY = currentY;
  ctx.save();
  ctx.beginPath();
  const steps = 10;
  const waveAmplitude = 4;
  const waveFrequency = 3;
  for (let j = 0; j <= steps; j++) {
    const px = startX + (j * w) / steps;
    const py = startY + Math.sin((j / steps) * Math.PI * waveFrequency) * waveAmplitude;
    if (j === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  for (let j = steps; j >= 0; j--) {
    const px = startX + (j * w) / steps;
    const py = startY + h + Math.sin((j / steps) * Math.PI * waveFrequency) * waveAmplitude;
    ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.clip();
  if (isReady(img)) {
    ctx.drawImage(img, startX, startY - waveAmplitude, w, h + waveAmplitude * 2);
  } else {
    ctx.fillStyle = color || "#CCCCCC";
    ctx.fillRect(startX, startY - waveAmplitude, w, h + waveAmplitude * 2);
  }
  ctx.restore();
}

function startAnimation() {
  const targets = calculateTargets();
  Object.keys(targets.layerTargets).forEach(key => {
    const t = targets.layerTargets[key];
    if (!animState.layers[key]) animState.layers[key] = { currentY: -100, targetY: t.y, velocity: 0 };
    else animState.layers[key].targetY = t.y;
  });
  Object.keys(targets.salsaTargets).forEach(id => {
    const t = targets.salsaTargets[id];
    if (!animState.layers[id]) animState.layers[id] = { currentY: -100, targetY: t.y, velocity: 0 };
    else animState.layers[id].targetY = t.y;
  });
  const activeIds = [...Object.keys(targets.layerTargets), ...Object.keys(targets.salsaTargets)];
  Object.keys(animState.layers).forEach(id => { if (!activeIds.includes(id)) delete animState.layers[id]; });
  if (!animState.isAnimating) { animState.isAnimating = true; animateLoop(); }
}

function animateLoop() {
  let allSettled = true;
  const damping = 0.75;
  const tolerance = 2.0;
  Object.values(animState.layers).forEach(layer => {
    const distance = layer.targetY - layer.currentY;
    if (Math.abs(distance) > tolerance || Math.abs(layer.velocity) > tolerance) {
      allSettled = false;
      layer.velocity += distance * 0.08;
      layer.velocity *= damping;
      layer.currentY += layer.velocity;
    } else {
      layer.currentY = layer.targetY;
      layer.velocity = 0;
    }
  });
  if (!allSettled) renderSandwich();
  if (allSettled) { animState.isAnimating = false; renderSandwich(); return; }
  animState.requestId = requestAnimationFrame(animateLoop);
}

// =========================================================
// MODAL ORDENAR
// =========================================================
function openOrderModal() {
  if (panesArmados.length < cantidadTotalPanes) {
    showToast(`Faltan ${cantidadTotalPanes - panesArmados.length} panes por armar`, "remove");
    return;
  }
  const now = new Date();
  document.getElementById("order-date").value = now.toISOString().split("T")[0];
  document.getElementById("order-time").value = now.toTimeString().slice(0, 5);
  fillModalSummary();
  document.getElementById("order-modal").classList.add("active");
}

function closeOrderModal() {
  document.getElementById("order-modal").classList.remove("active");
}

function fillModalSummary() {
  const list = document.getElementById("modal-summary-list");
  const totalOut = document.getElementById("modal-total");
  if (!list || !totalOut) return;
  list.innerHTML = "";
  let subtotal = 0;
  panesArmados.forEach((pan, idx) => {
    subtotal += pan.precio;
    const li = document.createElement("li");
    const esCombo = pan.tipo === "combo";
    const nombre = esCombo ? `${pan.emoji} ${pan.nombre}` : `🥪 Pan ${idx + 1}`;
    li.innerHTML = `<span>${nombre}</span><span class="item-price">${fmt(pan.precio)}</span>`;
    list.appendChild(li);
  });
  totalOut.textContent = fmt(subtotal);
}

// =========================================================
// GENERAR HTML DE CADA PAN PARA EL TICKET
// =========================================================
function generarDetallePanHTML(pan, idx) {
  const esCombo = pan.tipo === "combo";
  let html = "";
  const getNombre = (item) => item.nombre || item.name || "Sin nombre";
  
  if (esCombo) {
    html += `<div class="pan-bloque">`;
    html += `<div class="pan-titulo"><span>🎁 PAN ${idx + 1} - COMBO ${pan.nombre.toUpperCase()}</span><span class="pan-precio">${fmt(pan.precio)}</span></div>`;
    html += `<div class="pan-detalle">${pan.descripcion}</div>`;
    html += `</div>`;
  } else {
    const partes = [];
    if (pan.pan) partes.push(getNombre(pan.pan));
    const agregarItems = (items) => {
      if (!items || !items.length) return;
      items.forEach(item => {
        const qty = item.qty || 1;
        partes.push(qty > 1 ? `${getNombre(item)} x${qty}` : getNombre(item));
      });
    };
    agregarItems(pan.embutidos);
    agregarItems(pan.proteinas);
    agregarItems(pan.verduras);
    agregarItems(pan.salsas);
    const descripcion = partes.join(", ");
    html += `<div class="pan-bloque">`;
    html += `<div class="pan-titulo"><span>🥪 PAN ${idx + 1}</span><span class="pan-precio">${fmt(pan.precio)}</span></div>`;
    html += `<div class="pan-detalle">${descripcion}</div>`;
    html += `</div>`;
  }
  return html;
}

// =========================================================
// IMPRIMIR
// =========================================================
function printTicket() {
  const clientName = document.getElementById("client-name").value.trim();
  const paymentMethod = document.getElementById("payment-method").value;
  const date = document.getElementById("order-date").value;
  const time = document.getElementById("order-time").value;
  if (!clientName) { showToast("Escribe el nombre del cliente", "remove"); return; }
  if (!paymentMethod) { showToast("Selecciona un método de pago", "remove"); return; }
  const dateObj = new Date(date + "T" + time);
  const dateFormatted = dateObj.toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "numeric" });
  const pedidoCompleto = { clientName, paymentMethod, dateFormatted, time, panes: JSON.parse(JSON.stringify(panesArmados)) };
  ultimoPedido = JSON.parse(JSON.stringify(pedidoCompleto));
  imprimirPedido(pedidoCompleto);
  document.getElementById("btn-reimprimir").style.display = "flex";
  setTimeout(() => { limpiarTodoDespuesDeImprimir(); }, 1500);
}

function imprimirPedido(pedido) {
  const { clientName, paymentMethod, dateFormatted, time, panes } = pedido;
  let detalleHTML = "";
  let totalGeneral = 0;
  panes.forEach((pan, idx) => {
    detalleHTML += generarDetallePanHTML(pan, idx);
    totalGeneral += pan.precio;
  });
  const ticketHTML = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Ticket</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @page { size: 80mm auto; margin: 0; }
        html, body {
          width: 80mm;
          margin: 0;
          padding: 0;
          background: #fff;
          color: #000;
          font-family: 'Arial', 'Helvetica', sans-serif;
          font-size: 11pt;
          font-weight: bold;
          line-height: 1.3;
        }
        body { padding: 2mm 3mm; }
        .ticket { width: 100%; margin: 0 auto; }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 2mm; margin-bottom: 2mm; }
        .header h1 { font-size: 15pt; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; }
        .header p { font-size: 9pt; font-weight: bold; margin-top: 0.5mm; }
        .info { font-size: 10pt; font-weight: bold; margin-bottom: 2mm; }
        .info-row { display: flex; justify-content: space-between; padding: 0.3mm 0; }
        .info-row .label { font-weight: 900; }
        .info-row .value { text-align: right; }
        .separator { border-top: 1px dashed #000; margin: 2mm 0; }
        .pan-bloque { margin-bottom: 3mm; padding-bottom: 2mm; border-bottom: 1px dashed #999; }
        .pan-bloque:last-child { border-bottom: none; }
        .pan-titulo {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1.5px solid #000;
          padding-bottom: 1mm;
          margin-bottom: 1.5mm;
          font-size: 11pt;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .pan-titulo .pan-precio { font-size: 12pt; font-weight: 900; }
        .pan-detalle { font-size: 9pt; padding: 0.5mm 0; line-height: 1.4; font-weight: bold; }
        .total-general {
          display: flex; justify-content: space-between; align-items: center;
          font-size: 16pt; font-weight: 900; padding: 3mm 0;
          margin-top: 3mm; border-top: 3px solid #000; border-bottom: 3px solid #000;
        }
        .total-general span:first-child { text-transform: uppercase; letter-spacing: 1px; }
        .footer { text-align: center; font-size: 9pt; font-weight: bold; margin-top: 4mm; padding-top: 2mm; border-top: 1px dashed #000; }
        .footer p { margin: 1mm 0; }
        .gracias { font-size: 12pt; font-weight: 900; margin-top: 1.5mm; letter-spacing: 1px; }
      </style>
    </head>
    <body>
      <div class="ticket">
        <div class="header">
          <h1>ARMA TU SÁNDWICH</h1>
          <p>Ticket de pedido</p>
        </div>
        <div class="info">
          <div class="info-row"><span class="label">Cliente:</span><span class="value">${clientName}</span></div>
          <div class="info-row"><span class="label">Fecha:</span><span class="value">${dateFormatted}</span></div>
          <div class="info-row"><span class="label">Hora:</span><span class="value">${time}</span></div>
          <div class="info-row"><span class="label">Pago:</span><span class="value">${paymentMethod}</span></div>
        </div>
        <div class="separator"></div>
        ${detalleHTML}
        <div class="total-general">
          <span>TOTAL GENERAL</span>
          <span>${fmt(totalGeneral)}</span>
        </div>
        <div class="footer">
          <p>¡Gracias por tu pedido!</p>
          <p class="gracias">*** VUELVE PRONTO ***</p>
          <p>Conserve este ticket</p>
        </div>
      </div>
    </body>
    </html>
  `;
  const oldIframe = document.getElementById("print-iframe");
  if (oldIframe) oldIframe.remove();
  const iframe = document.createElement("iframe");
  iframe.id = "print-iframe";
  iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;";
  document.body.appendChild(iframe);
  const iframeDoc = iframe.contentWindow.document;
  iframeDoc.open();
  iframeDoc.write(ticketHTML);
  iframeDoc.close();
  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  }, 500);
}

function limpiarTodoDespuesDeImprimir() {
  closeOrderModal();
  panesArmados = [];
  panEnEdicion = null;
  ultimoPanArmado = null;
  limpiarEditor();
  cantidadTotalPanes = 1;
  document.getElementById("cantidad-inicial-display").textContent = "1";
  showToast("Pedido completado y limpiado", "success");
  setTimeout(() => { mostrarPantalla("pantalla-cantidad"); }, 800);
}

function reimprimirUltimoPedido() {
  if (!ultimoPedido) { showToast("No hay pedido para reimprimir", "remove"); return; }
  showToast("Reimprimiendo...", "info");
  imprimirPedido(ultimoPedido);
}

// =========================================================
// INICIALIZACIÓN
// =========================================================
if (typeof ingredientsData === "undefined") {
  document.querySelector("main").innerHTML = "<p style='color:#993C1D'>No se encontró ingredients.js.</p>";
} else {
  Object.entries(ingredientsData).forEach(([key, cfg]) => buildGroup(key, cfg));
  document.getElementById("total-out").textContent = "$0.00";
  const clearBtn = document.getElementById("clear-btn");
  if (clearBtn) clearBtn.addEventListener("click", () => {
    limpiarEditor();
    const firstPan = document.querySelector('input[name="pan"]');
    if (firstPan) { firstPan.checked = true; quantities[firstPan.value] = 1; }
    actualizarResumenPan();
    renderSandwich();
    showToast("Pan limpiado", "info");
  });
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => renderSandwich(), 250);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("order-modal");
  const closeBtn = document.getElementById("modal-close");
  const cancelBtn = document.getElementById("btn-cancel");
  const printBtn = document.getElementById("btn-print");
  const reprintBtn = document.getElementById("btn-reimprimir");
  if (closeBtn) closeBtn.addEventListener("click", closeOrderModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeOrderModal);
  if (printBtn) printBtn.addEventListener("click", printTicket);
  if (reprintBtn) reprintBtn.addEventListener("click", reimprimirUltimoPedido);
  if (modal) modal.addEventListener("click", (e) => { if (e.target === modal) closeOrderModal(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && modal.classList.contains("active")) closeOrderModal();
  });
});

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}
