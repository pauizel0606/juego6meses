/* =========================================================
   ✏️  PERSONALIZA AQUÍ TU JUEGO
   Cambia los textos entre comillas. No hace falta tocar nada más.
   ========================================================= */
const CONFIG = {
  el: 'Pau',
  ella: 'Paula',

  // Día en que empezasteis (AAAA-MM-DD). Se usa para el contador de la carta.
  fechaInicio: '2026-05-17',

  // La carta final (cada línea es un párrafo)
  saludo: 'Hola, mi chulilla',
  carta: [
    'Ya son 6 meses a tu lado y parece que solo haya pasado uno.',
    'Espero que hayas jugado a todos los minijuegos y te lo hayas pasado muy bien.',
    'Aunque no se me da muy bien hacer cosas a mano, te he preparado algo que sí se me da bien: la informática y quererte. Así que lo he juntado todo con ayuda de Claude y ha salido esto.',
    'Espero que te haya gustado mucho, y recuerda que te quiero mucho, mi chiwawa 💚'
  ],
  firma: 'Pau 💚',

  // El vale que aparece al final, antes de la carta (se rasca para descubrirlo)
  vale: {
    icono: '🍝',
    titulo: 'Una cena para dos',
    detalle: 'Tú eliges el sitio, yo invito 😏',
    valido: 'Cuando tú quieras',
    letraPequena: 'Incluye postre compartido, mimos ilimitados y mirarte como un tonto toda la noche.'
  },

  pregunta: '¿Quieres seguir escribiendo nuestra historia conmigo?',
  respuestaSi: '¡Sabía que dirías que sí! Aquí empieza la luna número siete… y todas las que vengan. Te quiero, mi chiwawa. 💚',

  // Un recuerdo que se desbloquea al completar cada luna
  recuerdos: [
    { titulo: 'El primer encuentro', texto: 'Ese día no sabía que estaba conociendo a la persona más importante de mi vida.' },
    { titulo: 'Las mariposas', texto: 'Todavía me pongo nervioso cuando me escribes. Y me encanta que sea así.' },
    { titulo: 'Nuestras estrellas', texto: 'Contigo, hasta las noches más normales se convierten en algo especial.' },
    { titulo: 'Los pequeños momentos', texto: 'Los cafés, las risas, las tonterías… Todo es mejor si es contigo.' },
    { titulo: 'La carta', texto: 'Si tuviera que escribir todo lo que siento por ti, no habría papel suficiente en el mundo.' },
    { titulo: 'Nuestra canción', texto: 'Seis meses después, sigo eligiéndote cada día. Y lo seguiré haciendo.' }
  ],

  // Parejas del juego de memoria (emoji + frase al encontrarla)
  memoria: [
    ['🌹', 'Una flor para la flor más bonita.'],
    ['☕', 'Por mil cafés más contigo.'],
    ['🎬', 'Nuestras pelis (y tus comentarios en las pelis).'],
    ['🍕', 'Compartir pizza es amor verdadero.'],
    ['🌙', 'Seis lunas a tu lado.'],
    ['🎵', 'Esa canción que ya es nuestra.'],
    ['🧸', 'Abrazos de oso infinitos.'],
    ['💌', 'Cada mensaje tuyo me alegra el día.']
  ]
};
