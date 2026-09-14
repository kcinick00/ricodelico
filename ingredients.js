// =========================================================
// Cada ingrediente tiene:
//  - "image"       -> foto cuadrada chica para el cuadro de selección
//  - "layerImage"  -> foto ancha y delgada (fondo transparente) para
//                       la capa apilada en la vista previa del sándwich
//  - "color"       -> se usa SOLO como respaldo si layerImage no existe
//                       o aún no la has subido
// Para el pan, en vez de "layerImage" hay dos:
//  - "bottomImage" -> foto del pan de abajo (recta, vista de perfil)
//  - "topImage"    -> foto del pan de arriba (con forma de domo, PNG
//                       con fondo transparente para que se vea bien)
// Todas estas fotos van dentro de la carpeta images/layers/
// Mientras no subas una foto, se sigue usando el color de respaldo,
// así que puedes ir agregando fotos poco a poco sin romper nada.
// =========================================================
const ingredientsData = {
  "pan": {
    "type": "radio",
    "items": [
      {
        "id": "pan-blanco",
        "color": "#F0D9A8",
        "name": "Pan blanco (30 cm)",
        "price": 3,
        "image": "images/pan-blanco.jpg",
        "topImage": "images/layers/pan-blanco-top.png",
        "bottomImage": "images/layers/pan-blanco-bottom.png"
      },
      {
        "id": "pan-integral",
        "color": "#B08454",
        "name": "Pan integral (30 cm)",
        "price": 3,
        "image": "images/pan-integral.jpg",
        "topImage": "images/layers/pan-integral-top.png",
        "bottomImage": "images/layers/pan-integral-bottom.png"
      },
      {
        "id": "telera",
        "color": "#E8C27A",
        "name": "Telera (30 cm)",
        "price": 3,
        "image": "images/telera.jpg",
        "topImage": "images/layers/telera-top.png",
        "bottomImage": "images/layers/telera-bottom.png"
      },
      {
        "id": "baguette",
        "color": "#D9A854",
        "name": "Baguette (30 cm)",
        "price": 3,
        "image": "images/baguette.jpg",
        "topImage": "images/layers/baguette-top.png",
        "bottomImage": "images/layers/baguette-bottom.png"
      }
    ]
  },
  "salsas": {
    "type": "checkbox",
    "items": [
      {
        "id": "mayonesa",
        "color": "#F5F0DC",
        "name": "Mayonesa",
        "price": 0.15,
        "image": "images/mayonesa.jpg",
        "layerImage": "images/layers/mayonesa.png"
      },
      {
        "id": "mostaza",
        "color": "#E8B923",
        "name": "Mostaza",
        "price": 0.15,
        "image": "images/mostaza.jpg",
        "layerImage": "images/layers/mostaza.png"
      },
      {
        "id": "salsatomate",
        "color": "#C4441E",
        "name": "Salsa de tomate",
        "price": 0.25,
        "image": "images/salsatomate.jpg",
        "layerImage": "images/layers/salsatomate.png"
      },
      {
        "id": "bbq",
        "color": "#7A3B1E",
        "name": "BBQ",
        "price": 0.25,
        "image": "images/bbq.jpg",
        "layerImage": "images/layers/bbq.png"
      }
    ]
  },
  "embutidos": {
    "type": "checkbox",
    "items": [
      {
        "id": "jamon",
        "color": "#E8A2A2",
        "name": "Jamón (3 rebanadas)",
        "price": 0.60,
        "image": "images/jamon.jpg",
        "layerImage": "images/layers/jamon.png"
      },
      {
        "id": "pavo",
        "color": "#E0C2A0",
        "name": "Pechuga de pavo (3 rebanadas)",
        "price": 0.75,
        "image": "images/pavo.jpg",
        "layerImage": "images/layers/pavo.png"
      },
      {
        "id": "salami",
        "color": "#B5453B",
        "name": "Salami (4 rebanadas)",
        "price": 0.80,
        "image": "images/salami.jpg",
        "layerImage": "images/layers/salami.png"
      },
      {
        "id": "tocino",
        "color": "#A63C2E",
        "name": "Tocino (2 tiras)",
        "price": 0.90,
        "image": "images/tocino.jpg",
        "layerImage": "images/layers/tocino.png"
      }
    ]
  },
  "proteinas": {
    "type": "checkbox",
    "items": [
      {
        "id": "pollo",
        "color": "#D9A85C",
        "name": "Pollo asado (80 g)",
        "price": 1.20,
        "image": "images/pollo.jpg",
        "layerImage": "images/layers/pollo.png"
      },
      {
        "id": "res",
        "color": "#8B4A3B",
        "name": "Res desmenuzada (80 g)",
        "price": 1.80,
        "image": "images/res.jpg",
        "layerImage": "images/layers/res.png"
      },
      {
        "id": "queso",
        "color": "#F5EAC8",
        "name": "Queso  (2 rebanadas)",
        "price": 0.80,
        "image": "images/queso.jpg",
        "layerImage": "images/layers/queso.png"
      },
      {
        "id": "huevo",
        "color": "#F2D774",
        "name": "Huevo (1 pieza)",
        "price": 0.35,
        "image": "images/huevo.jpg",
        "layerImage": "images/layers/huevo.png"
      }
    ]
  },
  "verduras": {
    "type": "checkbox",
    "items": [
      {
        "id": "lechuga",
        "color": "#7FA845",
        "name": "Lechuga (20 g)",
        "price": 0.15,
        "image": "images/lechuga.jpg",
        "layerImage": "images/layers/lechuga.png"
      },
      {
        "id": "tomate",
        "color": "#D6432E",
        "name": "Tomate (3 rodajas)",
        "price": 0.20,
        "image": "images/tomate.jpg",
        "layerImage": "images/layers/tomate.png"
      },
      {
        "id": "aguacate",
        "color": "#8FB84E",
        "name": "Aguacate (1/4 pieza)",
        "price": 0.45,
        "image": "images/aguacate.jpg",
        "layerImage": "images/layers/aguacate.png"
      },
      {
        "id": "cebolla",
        "color": "#9C4F7A",
        "name": "Cebolla morada (3 aros)",
        "price": 0.10,
        "image": "images/cebolla.jpg",
        "layerImage": "images/layers/cebolla.png"
      }
    ]
  }
};