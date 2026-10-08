// =========================================================
// combos.js - Los de la casa (combos prearmados de Ricodélico)
// =========================================================
// - Cada combo usa los "id" de tu menú (Google Sheets), por categoría.
// - El PRECIO se calcula solo: suma del pan + ingredientes con los precios
//   actuales del menú. Si cambias un precio en el Sheets, el combo se ajusta.
// - Si un ingrediente del combo no existe en el menú, el combo no se muestra.
//   Si está agotado, el combo aparece marcado y no se puede agregar.
// - Para poner la etiqueta "Más pedido" a un combo: masPedido: true
// - Todos llevan al menos un producto de la casa (delicateses).
// =========================================================

const combos = [
  {
    id: "italiano",
    emoji: "🇮🇹",
    nombre: "Italiano Ricodélico",
    masPedido: false,
    ingredientes: {
      pan: "baguette",
      salchichones: ["salami", "pepperoni"],
      delicateses: ["lomo-jalapeno"],
      quesos: ["mozzarella"],
      vegetales: ["tomate", "cebolla", "lechuga", "pepinillos"]
    }
  },
  {
    id: "club",
    emoji: "🥪",
    nombre: "Club Ricodélico",
    masPedido: false,
    ingredientes: {
      pan: "pan-blanco",
      embutidos: ["jamon"],
      delicateses: ["pavo-ahumado", "roast-beef"],
      quesos: ["queso-gouda"],
      vegetales: ["lechuga", "tomate", "cebolla"],
      salsas: ["mayonesa"]
    }
  },
  {
    id: "duo-ahumado",
    emoji: "🔥",
    nombre: "Dúo Ahumado",
    masPedido: false,
    ingredientes: {
      pan: "pan-blanco",
      embutidos: ["jamon-ahumado"],
      delicateses: ["pavo-ahumado"],
      quesos: ["queso-muster"],
      vegetales: ["lechuga", "tomate", "cebollablanca", "pepinillos"],
      salsas: ["mayonesa", "mostaza"]
    }
  },
  {
    id: "pollo-miel",
    emoji: "🍯",
    nombre: "Pollo Ahumado y Miel",
    masPedido: false,
    ingredientes: {
      pan: "pan-integral",
      delicateses: ["pollo-ahumado", "tocineta"],
      quesos: ["pasteurizado"],
      vegetales: ["lechuga", "tomate", "cebolla"],
      salsas: ["mostaza-miel"]
    }
  },
  {
    id: "philly-roast-beef",
    emoji: "🧀",
    nombre: "Philly de Roast Beef",
    masPedido: false,
    ingredientes: {
      pan: "baguette",
      delicateses: ["roast-beef"],
      quesos: ["queso-fundido"],
      vegetales: ["pimenton", "cebollablanca"],
      salsas: ["mayonesa"]
    }
  },
  {
    id: "picanha-bacon",
    emoji: "🥩",
    nombre: "Picanha Bacon",
    masPedido: false,
    ingredientes: {
      pan: "baguette",
      delicateses: ["selva-negra", "tocineta"],
      quesos: ["queso-gouda"],
      vegetales: ["cebolla", "pimenton", "tomate"],
      salsas: ["tartara"]
    }
  },
  {
    id: "burger",
    emoji: "🍔",
    nombre: "Burger Ricodélico",
    masPedido: false,
    ingredientes: {
      pan: "pan-blanco",
      proteinas: ["res"],
      delicateses: ["tocineta"],
      quesos: ["pasteurizado"],
      vegetales: ["pepinillos", "tomate", "lechuga", "cebolla"],
      salsas: ["salsatomate", "mostaza"]
    }
  },
  {
    id: "cubano",
    emoji: "🇨🇺",
    nombre: "Cubano Ricodélico",
    masPedido: false,
    ingredientes: {
      pan: "pan-blanco",
      embutidos: ["jamon"],
      delicateses: ["tender-sin-hueso"],
      quesos: ["queso-edam"],
      vegetales: ["pepinillos"],
      salsas: ["mostaza"]
    }
  },
  {
    id: "bbq-pierna",
    emoji: "🍖",
    nombre: "BBQ Pierna",
    masPedido: false,
    ingredientes: {
      pan: "pan-blanco",
      delicateses: ["tender-sin-hueso", "tocineta"],
      quesos: ["pasteurizado"],
      vegetales: ["cebolla", "pepinillos"],
      salsas: ["bbq"]
    }
  },
  {
    id: "lomo-picante",
    emoji: "🌶️",
    nombre: "Lomo Picante",
    masPedido: false,
    ingredientes: {
      pan: "pan-blanco",
      delicateses: ["lomo-jalapeno"],
      quesos: ["mozzarella"],
      vegetales: ["aguacate", "tomate", "lechuga", "cebolla"],
      salsas: ["mayonesa"]
    }
  }
];
