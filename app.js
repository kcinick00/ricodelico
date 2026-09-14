// =========================================================
// app.js - Versión con ticket compacto y legible
// =========================================================

const fmt = n => "$" + n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const quantities = {};

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
// ANIMACIÓN
// =========================================================
const animState = {
  layers: {},
  requestId: null,
  isAnimating: false
};

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
    if (cfg.type === "radio" && idx === 0) input.checked = true;
    
    input.addEventListener("change", () => {
      if (input.checked) {
        if (cfg.type === "radio") {
          showToast(`${item.name} seleccionado`, "success");
          Object.keys(quantities).forEach(k => delete quantities[k]);
          quantities[item.id] = 1;
        } else {
          showToast(`${item.name} añadido`, "success");
          quantities[item.id] = 1;
        }
      } else {
        if (cfg.type === "radio") return;
        showToast(`${item.name} quitado`, "remove");
        delete quantities[item.id];
      }
      updateCardControls(item.id, input.checked);
      updateTotal();
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
      e.preventDefault();
      e.stopPropagation();
      const current = quantities[item.id] || 1;
      if (current > 1) {
        quantities[item.id] = current - 1;
        updateQtyDisplay(item.id);
        showToast(`${item.name} x${quantities[item.id]}`, "info");
        updateTotal();
        startAnimation();
      } else {
        if (cfg.type === "checkbox") {
          input.checked = false;
          delete quantities[item.id];
          updateCardControls(item.id, false);
          showToast(`${item.name} quitado`, "remove");
          updateTotal();
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
      e.preventDefault();
      e.stopPropagation();
      const current = quantities[item.id] || 1;
      if (current < 10) {
        quantities[item.id] = current + 1;
        updateQtyDisplay(item.id);
        showToast(`${item.name} x${quantities[item.id]}`, "info");
        updateTotal();
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
    if (!quantities[id]) {
      quantities[id] = 1;
      updateQtyDisplay(id);
    }
  } else {
    controls.classList.remove("visible");
  }
}

function getSelectedItems(key) {
  const cfg = ingredientsData[key];
  if (!cfg) return [];
  const inputs = document.querySelectorAll('input[name="' + key + '"]:checked');
  return Array.from(inputs)
    .map(inp => cfg.items.find(i => i.id === inp.value))
    .filter(Boolean);
}

function getLayersWithQuantities() {
  const baseLayers = [
    ...getSelectedItems("embutidos"),
    ...getSelectedItems("proteinas"),
    ...getSelectedItems("verduras")
  ];
  const expandedLayers = [];
  baseLayers.forEach(item => {
    const qty = quantities[item.id] || 1;
    for (let i = 0; i < qty; i++) {
      expandedLayers.push({ ...item, _qtyIndex: i, _qtyTotal: qty });
    }
  });
  return expandedLayers.slice(0, 12);
}

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
  img.onload = () => {
    if (!animState.isAnimating) renderSandwich();
  };
  img.onerror = () => { img.__failed = true; };
  img.src = src;
  imageCache[src] = img;
  return img;
}
function isReady(img) {
  return img && img.complete && img.naturalWidth > 0 && !img.__failed;
}

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

function getDPR() {
  return Math.min(window.devicePixelRatio || 1, 1.5);
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
    layerTargets[key] = {
      y: y, w: w, h: layerHeight,
      item: item, color: item.color, layerImage: item.layerImage,
      originalId: item.id
    };
    y -= stepY;
  });

  const salsaTargets = {};
  salsas.forEach((s, i) => {
    const w = baseWidth - baseWidth * 0.06 + (i % 2 === 0 ? baseWidth * 0.02 : -baseWidth * 0.02);
    const salsaHeight = layerHeight * 0.6;
    y -= (salsaHeight - 4);
    salsaTargets[s.id] = {
      y: y, w: w, h: salsaHeight,
      item: s, color: s.color, layerImage: s.layerImage
    };
    y -= 4;
  });

  const topY = y - 4;

  return {
    panItem, panColor: panItem ? panItem.color : "#E8C27A",
    baseWidth, bunHeight, layerHeight, cx, W, H,
    bottomY, topY, layerTargets, salsaTargets
  };
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
    ctx.save();
    drawPath();
    ctx.clip();
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();
  } else {
    drawPath();
    ctx.fillStyle = panColor;
    ctx.fill();
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
    ctx.save();
    drawDomePath();
    ctx.clip();
    ctx.drawImage(img, startX, startY, domeWidth, domeHeight + 10);
    ctx.restore();
  } else {
    drawDomePath();
    ctx.fillStyle = panColor;
    ctx.fill();
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
    if (j === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
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
    if (!animState.layers[key]) {
      animState.layers[key] = { currentY: -100, targetY: t.y, velocity: 0 };
    } else {
      animState.layers[key].targetY = t.y;
    }
  });
  Object.keys(targets.salsaTargets).forEach(id => {
    const t = targets.salsaTargets[id];
    if (!animState.layers[id]) {
      animState.layers[id] = { currentY: -100, targetY: t.y, velocity: 0 };
    } else {
      animState.layers[id].targetY = t.y;
    }
  });
  const activeIds = [
    ...Object.keys(targets.layerTargets),
    ...Object.keys(targets.salsaTargets)
  ];
  Object.keys(animState.layers).forEach(id => {
    if (!activeIds.includes(id)) delete animState.layers[id];
  });
  if (!animState.isAnimating) {
    animState.isAnimating = true;
    animateLoop();
  }
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

  if (!allSettled) {
    renderSandwich();
  }

  if (allSettled) {
    animState.isAnimating = false;
    renderSandwich();
    return;
  }
  animState.requestId = requestAnimationFrame(animateLoop);
}

function clearAll() {
  showToast("Limpiando pedido...", "info");
  const targets = calculateTargets();
  const activeIds = [
    ...Object.keys(targets.layerTargets),
    ...Object.keys(targets.salsaTargets)
  ];
  activeIds.forEach(id => {
    if (animState.layers[id]) {
      animState.layers[id].targetY = -200;
      animState.layers[id].velocity = -15;
    }
  });
  if (!animState.isAnimating) {
    animState.isAnimating = true;
    animateLoop();
  }
  setTimeout(() => {
    document.querySelectorAll('input[type="checkbox"]').forEach(inp => {
      inp.checked = false;
    });
    const panRadios = document.querySelectorAll('input[name="pan"]');
    if (panRadios.length > 0) panRadios[0].checked = true;
    Object.keys(quantities).forEach(k => delete quantities[k]);
    document.querySelectorAll('.qty-controls').forEach(c => c.classList.remove('visible'));
    animState.layers = {};
    updateTotal();
    renderSandwich();
    setTimeout(() => showToast("Pedido limpio", "success"), 200);
  }, 600);
}

function renderSummary(selections) {
  const list = document.getElementById("summary-list");
  const subtotalOut = document.getElementById("subtotal-out");
  if (!list || !subtotalOut) return;
  list.innerHTML = "";
  let subtotal = 0;
  let count = 0;
  selections.forEach(item => {
    const qty = quantities[item.id] || 1;
    const itemSubtotal = item.price * qty;
    subtotal += itemSubtotal;
    count++;
    const li = document.createElement("li");
    const name = document.createElement("span");
    name.className = "item-name";
    name.textContent = qty > 1 ? `${item.name} x${qty}` : item.name;
    const price = document.createElement("span");
    price.className = "item-price";
    price.textContent = item.price === 0 ? "Incluido" : "+" + fmt(itemSubtotal);
    li.appendChild(name);
    li.appendChild(price);
    list.appendChild(li);
  });
  if (count === 0) {
    const li = document.createElement("li");
    li.className = "empty-msg";
    li.textContent = "Aún no has elegido ningún ingrediente.";
    list.appendChild(li);
  }
  subtotalOut.textContent = fmt(subtotal);
}

function updateTotal() {
  let total = 0;
  const allSelected = [];
  Object.entries(ingredientsData).forEach(([key, cfg]) => {
    const inputs = document.querySelectorAll('input[name="' + key + '"]:checked');
    inputs.forEach(inp => {
      const item = cfg.items.find(i => i.id === inp.value);
      if (item) {
        const qty = quantities[item.id] || 1;
        total += item.price * qty;
        allSelected.push(item);
      }
    });
  });
  document.getElementById("total-out").textContent = fmt(total);
  renderSummary(allSelected);
}

function openOrderModal() {
  const total = document.getElementById("total-out").textContent;
  if (total === "$0.00") {
    showToast("Añade al menos un ingrediente", "remove");
    return;
  }

  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const timeStr = now.toTimeString().slice(0, 5);
  document.getElementById("order-date").value = dateStr;
  document.getElementById("order-time").value = timeStr;

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

  const panSel = document.querySelector('input[name="pan"]:checked');
  if (panSel) {
    const panItem = ingredientsData.pan.items.find(i => i.id === panSel.value);
    if (panItem) {
      subtotal += panItem.price;
      const li = document.createElement("li");
      li.innerHTML = `<span>${panItem.name}</span><span class="item-price">${fmt(panItem.price)}</span>`;
      list.appendChild(li);
    }
  }

  const keys = ["salsas", "embutidos", "proteinas", "verduras"];
  keys.forEach(key => {
    const cfg = ingredientsData[key];
    if (!cfg) return;
    const inputs = document.querySelectorAll(`input[name="${key}"]:checked`);
    inputs.forEach(inp => {
      const item = cfg.items.find(i => i.id === inp.value);
      if (item) {
        const qty = quantities[item.id] || 1;
        const itemTotal = item.price * qty;
        subtotal += itemTotal;
        const li = document.createElement("li");
        const name = qty > 1 ? `${item.name} x${qty}` : item.name;
        li.innerHTML = `<span>${name}</span><span class="item-price">${fmt(itemTotal)}</span>`;
        list.appendChild(li);
      }
    });
  });
  totalOut.textContent = fmt(subtotal);
}

// =========================================================
// IMPRIMIR TICKET (compacto y legible)
// =========================================================
function printTicket() {
  const clientName = document.getElementById("client-name").value.trim();
  const paymentMethod = document.getElementById("payment-method").value;
  const date = document.getElementById("order-date").value;
  const time = document.getElementById("order-time").value;

  if (!clientName) {
    showToast("Escribe el nombre del cliente", "remove");
    return;
  }
  if (!paymentMethod) {
    showToast("Selecciona un método de pago", "remove");
    return;
  }

  const dateObj = new Date(date + "T" + time);
  const dateFormatted = dateObj.toLocaleDateString("es-MX", {
    day: "2-digit", month: "2-digit", year: "numeric"
  });

  let ticketItems = "";
  let total = 0;

  const panSel = document.querySelector('input[name="pan"]:checked');
  if (panSel) {
    const panItem = ingredientsData.pan.items.find(i => i.id === panSel.value);
    if (panItem) {
      total += panItem.price;
      ticketItems += `<tr><td>${panItem.name}</td><td class="qty">1</td><td class="price">${fmt(panItem.price)}</td></tr>`;
    }
  }

  const keys = ["salsas", "embutidos", "proteinas", "verduras"];
  keys.forEach(key => {
    const cfg = ingredientsData[key];
    if (!cfg) return;
    const inputs = document.querySelectorAll(`input[name="${key}"]:checked`);
    inputs.forEach(inp => {
      const item = cfg.items.find(i => i.id === inp.value);
      if (item) {
        const qty = quantities[item.id] || 1;
        const itemTotal = item.price * qty;
        total += itemTotal;
        ticketItems += `<tr><td>${item.name}</td><td class="qty">${qty}</td><td class="price">${fmt(itemTotal)}</td></tr>`;
      }
    });
  });

  const ticketHTML = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Ticket - ${clientName}</title>
      <style>
        @page { size: 80mm auto; margin: 0; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Arial', 'Helvetica', sans-serif;
          font-size: 13px;
          font-weight: bold;
          color: #000;
          background: #fff;
          width: 80mm;
          line-height: 1.2;
          padding: 4px 6px;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #000;
          padding-bottom: 4px;
          margin-bottom: 4px;
        }
        .header h1 {
          font-size: 18px;
          font-weight: 900;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        .header p {
          font-size: 11px;
          font-weight: bold;
        }
        .info {
          font-size: 12px;
          font-weight: bold;
          margin-bottom: 4px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 1px 0;
        }
        .info-row .label { font-weight: 900; }
        .info-row .value { text-align: right; font-weight: bold; }
        .separator {
          border-top: 1px dashed #000;
          margin: 4px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 2px 0;
        }
        table th {
          font-size: 12px;
          font-weight: 900;
          text-align: left;
          border-bottom: 1px solid #000;
          padding: 2px 0;
          text-transform: uppercase;
        }
        table th.qty { text-align: center; width: 28px; }
        table th.price { text-align: right; width: 60px; }
        table td {
          padding: 1px 0;
          font-size: 12px;
          font-weight: bold;
          vertical-align: top;
        }
        table td.qty { text-align: center; font-weight: 900; }
        table td.price { text-align: right; font-weight: 900; }
        .total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 18px;
          font-weight: 900;
          padding: 4px 0;
          margin-top: 4px;
          border-top: 2px solid #000;
          border-bottom: 2px solid #000;
        }
        .total span:first-child { text-transform: uppercase; letter-spacing: 1px; }
        .footer {
          text-align: center;
          font-size: 11px;
          font-weight: bold;
          margin-top: 6px;
          padding-top: 4px;
          border-top: 1px dashed #000;
        }
        .footer p { margin: 1px 0; }
        .gracias {
          font-size: 14px;
          font-weight: 900;
          margin-top: 2px;
          letter-spacing: 1px;
        }
      </style>
    </head>
    <body>
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
      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th class="qty">Cant</th>
            <th class="price">Importe</th>
          </tr>
        </thead>
        <tbody>
          ${ticketItems}
        </tbody>
      </table>
      <div class="total">
        <span>TOTAL</span>
        <span>${fmt(total)}</span>
      </div>
      <div class="footer">
        <p>¡Gracias por tu pedido!</p>
        <p class="gracias">*** VUELVE PRONTO ***</p>
        <p>Conserve este ticket</p>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open("", "_blank", "width=400,height=600");
  printWindow.document.write(ticketHTML);
  printWindow.document.close();

  closeOrderModal();
  showToast("Ticket generado correctamente", "success");
}

// =========================================================
// INICIALIZACIÓN
// =========================================================
if (typeof ingredientsData === "undefined") {
  document.querySelector("main").innerHTML =
    "<p style='color:#993C1D'>No se encontró ingredients.js.</p>";
} else {
  Object.entries(ingredientsData).forEach(([key, cfg]) => buildGroup(key, cfg));

  const panRadios = document.querySelectorAll('input[name="pan"]');
  if (panRadios.length > 0) quantities[panRadios[0].value] = 1;

  updateTotal();

  const targets = calculateTargets();
  Object.keys(targets.layerTargets).forEach(key => {
    animState.layers[key] = {
      currentY: targets.layerTargets[key].y,
      targetY: targets.layerTargets[key].y,
      velocity: 0
    };
  });
  renderSandwich();

  const clearBtn = document.getElementById("clear-btn");
  if (clearBtn) clearBtn.addEventListener("click", clearAll);

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

  if (closeBtn) closeBtn.addEventListener("click", closeOrderModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeOrderModal);
  if (printBtn) printBtn.addEventListener("click", printTicket);

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeOrderModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && modal.classList.contains("active")) {
      closeOrderModal();
    }
  });
});

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}
