// =========================================================
// voice.js - Reconocimiento de voz para armar el pedido
// =========================================================

// Diccionario de sinónimos: qué palabras puede decir el cliente
// y a qué ingrediente corresponden
const VOICE_COMMANDS = {
  // PAN
  "pan blanco": "pan-blanco",
  "blanco": "pan-blanco",
  "pan integral": "pan-integral",
  "integral": "pan-integral",
  "telera": "telera",
  "baguette": "baguette",
  "baguete": "baguette",
  
  // SALSAS
  "mayonesa": "mayonesa",
  "mayo": "mayonesa",
  "mostaza": "mostaza",
  "chipotle": "chipotle",
  "bbq": "bbq",
  "barbacoa": "bbq",
  
  // EMBUTIDOS
  "jamón": "jamon",
  "jamon": "jamon",
  "pavo": "pavo",
  "pechuga de pavo": "pavo",
  "salami": "salami",
  "salchichón": "salami",
  "tocino": "tocino",
  "bacon": "tocino",
  
  // PROTEÍNAS
  "pollo": "pollo",
  "pollo asado": "pollo",
  "res": "res",
  "carne": "res",
  "carne desmenuzada": "res",
  "queso": "queso-panela",
  "queso panela": "queso-panela",
  "panela": "queso-panela",
  "huevo": "huevo",
  
  // VERDURAS
  "lechuga": "lechuga",
  "tomate": "tomate",
  "jitomate": "tomate",
  "aguacate": "aguacate",
  "palta": "aguacate",
  "cebolla": "cebolla",
  "cebolla morada": "cebolla",
  
  // ACCIONES
  "sin": "REMOVE",
  "quita": "REMOVE",
  "quitar": "REMOVE",
  "sin nada": "CLEAR_ALL",
  "limpia": "CLEAR_ALL",
  "limpia todo": "CLEAR_ALL",
  "borra todo": "CLEAR_ALL",
  "cancelar": "CLEAR_ALL"
};

let recognition = null;
let isListening = false;
let voiceOrderBuffer = []; // Guarda las palabras reconocidas

// =========================================================
// Inicializar el reconocimiento de voz
// =========================================================
function initVoiceRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    console.warn("Reconocimiento de voz no soportado en este navegador");
    return null;
  }
  
  const rec = new SpeechRecognition();
  rec.lang = "es-MX"; // Español de México
  rec.continuous = false; // Se detiene al dejar de hablar
  rec.interimResults = true; // Muestra resultados parciales en tiempo real
  rec.maxAlternatives = 1;
  
  rec.onstart = () => {
    isListening = true;
    updateMicButton(true);
    voiceOrderBuffer = [];
  };
  
  rec.onresult = (event) => {
    let finalTranscript = "";
    let interimTranscript = "";
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript + " ";
      } else {
        interimTranscript += transcript;
      }
    }
    
    // Mostrar el texto parcial en el botón
    if (interimTranscript) {
      showVoicePreview(interimTranscript);
    }
    
    // Procesar el texto final
    if (finalTranscript.trim()) {
      processVoiceOrder(finalTranscript.trim());
    }
  };
  
  rec.onerror = (event) => {
    console.error("Error de reconocimiento:", event.error);
    isListening = false;
    updateMicButton(false);
    
    if (event.error === "no-speech") {
      showToast("No te escuché. Intenta de nuevo.", "remove");
    } else if (event.error === "not-allowed") {
      showToast("Permite el acceso al micrófono", "remove");
    } else {
      showToast("Error de micrófono: " + event.error, "remove");
    }
  };
  
  rec.onend = () => {
    isListening = false;
    updateMicButton(false);
    hideVoicePreview();
  };
  
  return rec;
}

// =========================================================
// Iniciar / detener la escucha
// =========================================================
function toggleVoiceRecognition() {
  if (!recognition) {
    recognition = initVoiceRecognition();
    if (!recognition) {
      showToast("Tu navegador no soporta reconocimiento de voz", "remove");
      return;
    }
  }
  
  if (isListening) {
    recognition.stop();
  } else {
    try {
      recognition.start();
      showToast("🎤 Escuchando...", "info");
    } catch (e) {
      // Si ya estaba iniciado, lo detenemos
      recognition.stop();
    }
  }
}

// =========================================================
// Procesar el texto reconocido
// =========================================================
function processVoiceOrder(text) {
  console.log("Texto reconocido:", text);
  
  const texto = text.toLowerCase()
    .replace(/[.,!?¿¡]/g, "")
    .trim();
  
  // Detectar acción de "sin X" (ej: "sin cebolla")
  const palabrasNegativas = ["sin", "quita", "quitar", "sácale", "sacale"];
  const tieneNegacion = palabrasNegativas.some(p => texto.includes(p));
  
  // Verificar si es "limpiar todo"
  if (texto.includes("limpia") || texto.includes("borra") || texto.includes("cancelar")) {
    clearAll();
    showToast("🗑 Pedido limpiado por voz", "info");
    return;
  }
  
  // Buscar ingredientes mencionados
  const encontrados = [];
  const ordenados = Object.keys(VOICE_COMMANDS).sort((a, b) => b.length - a.length);
  
  // Para cada palabra clave larga, ver si está en el texto
  ordenados.forEach(cmd => {
    if (texto.includes(cmd) && VOICE_COMMANDS[cmd] !== "REMOVE" && VOICE_COMMANDS[cmd] !== "CLEAR_ALL") {
      const id = VOICE_COMMANDS[cmd];
      if (!encontrados.includes(id)) {
        encontrados.push({ id, cmd });
      }
    }
  });
  
  if (encontrados.length === 0) {
    showToast("No reconocí ningún ingrediente", "remove");
    return;
  }
  
  // Aplicar cada ingrediente
  let cambios = 0;
  encontrados.forEach(({ id, cmd }) => {
    const input = document.querySelector(`input[value="${id}"]`);
    if (!input) return;
    
    // Si tiene negación ("sin cebolla"), desmarcamos
    if (tieneNegacion && texto.includes("sin " + cmd)) {
      if (input.checked) {
        input.checked = false;
        delete quantities[id];
        updateCardControls(id, false);
        cambios++;
      }
    } else {
      // Si no es radio (pan), marcamos como checkbox
      if (input.type === "radio") {
        if (!input.checked) {
          input.checked = true;
          Object.keys(quantities).forEach(k => {
            if (k !== id && document.querySelector(`input[value="${k}"]`)?.type === "radio") {
              delete quantities[k];
            }
          });
          quantities[id] = 1;
          cambios++;
        }
      } else {
        if (!input.checked) {
          input.checked = true;
          quantities[id] = 1;
          updateCardControls(id, true);
          cambios++;
        }
      }
    }
  });
  
  if (cambios > 0) {
    updateTotal();
    startAnimation();
    showToast(`✅ ${cambios} ingrediente(s) agregado(s)`, "success");
  } else {
    showToast("Ya estaban seleccionados", "info");
  }
}

// =========================================================
// Actualizar el botón del micrófono
// =========================================================
function updateMicButton(listening) {
  const btn = document.getElementById("voice-btn");
  if (!btn) return;
  
  if (listening) {
    btn.classList.add("listening");
    btn.innerHTML = "🎙️";
  } else {
    btn.classList.remove("listening");
    btn.innerHTML = "🎤";
  }
}

// =========================================================
// Mostrar texto parcial mientras hablas
// =========================================================
function showVoicePreview(text) {
  const preview = document.getElementById("voice-preview");
  if (!preview) return;
  preview.textContent = text;
  preview.classList.add("visible");
}

function hideVoicePreview() {
  const preview = document.getElementById("voice-preview");
  if (!preview) return;
  preview.classList.remove("visible");
  setTimeout(() => {
    preview.textContent = "";
  }, 300);
}

// =========================================================
// Inicializar el botón cuando carga la página
// =========================================================
window.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("voice-btn");
  if (btn) {
    btn.addEventListener("click", toggleVoiceRecognition);
  }
});
