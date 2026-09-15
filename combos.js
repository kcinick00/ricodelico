// =========================================================
// combos.js - Combos prearmados
// =========================================================
// 
// Cada combo tiene:
//  - id: identificador único
//  - nombre: nombre visible
//  - emoji: ícono
//  - descripcion: ingredientes del combo (texto)
//  - precio: precio del combo
//  - ingredientes: array con los IDs de los ingredientes que lleva
// 
// Puedes añadir más combos o editar los que están.
// =========================================================

const combos = [
  {
    id: "combo-clasico",
    nombre: "Clásico",
    emoji: "🥪",
    descripcion: "Pan blanco, jamón, queso, lechuga, tomate y mayonesa",
    precio: 8.50,
    ingredientes: {
      pan: "pan-blanco",
      embutidos: ["jamon"],
      proteinas: ["queso-panela"],
      verduras: ["lechuga", "tomate"],
      salsas: ["mayonesa"]
    }
  },
  {
    id: "combo-pavo",
    nombre: "Pavo Ligero",
    emoji: "🦃",
    descripcion: "Pan integral, pavo, queso, lechuga, aguacate y mostaza",
    precio: 9.50,
    ingredientes: {
      pan: "pan-integral",
      embutidos: ["pavo"],
      proteinas: ["queso-panela"],
      verduras: ["lechuga", "aguacate"],
      salsas: ["mostaza"]
    }
  },
  {
    id: "combo-mexicano",
    nombre: "Mexicano",
    emoji: "🌮",
    descripcion: "Telera, pollo, queso, jitomate, cebolla y chipotle",
    precio: 11.00,
    ingredientes: {
      pan: "telera",
      embutidos: [],
      proteinas: ["pollo", "queso-panela"],
      verduras: ["tomate", "cebolla"],
      salsas: ["chipotle"]
    }
  },
  {
    id: "combo-bbq",
    nombre: "BBQ Especial",
    emoji: "🔥",
    descripcion: "Baguette, res, tocino, queso, cebolla y salsa BBQ",
    precio: 13.50,
    ingredientes: {
      pan: "baguette",
      embutidos: ["tocino"],
      proteinas: ["res", "queso-panela"],
      verduras: ["cebolla"],
      salsas: ["bbq"]
    }
  },
  {
    id: "combo-vegetariano",
    nombre: "Vegetariano",
    emoji: "🥬",
    descripcion: "Pan integral, queso, huevo, lechuga, tomate, aguacate y mayonesa",
    precio: 8.00,
    ingredientes: {
      pan: "pan-integral",
      embutidos: [],
      proteinas: ["queso-panela", "huevo"],
      verduras: ["lechuga", "tomate", "aguacate"],
      salsas: ["mayonesa"]
    }
  }
];
