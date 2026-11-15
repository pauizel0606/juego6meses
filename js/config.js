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
  carta: [
    'Hoy hace seis lunas que mi vida tiene otro color.',
    'Seis meses de risas tontas, de mensajes a deshoras, de abrazos que lo arreglan todo y de momentos que guardo como si fueran tesoros.',
    'Gracias por ser mi lugar favorito, por tu paciencia, por tu forma de mirarme y por hacer que hasta los días normales parezcan especiales.',
    'Este jueguito es mi manera de decirte que cada luna a tu lado es mi favorita… y que quiero muchas, muchísimas más.',
    'Te quiero muchísimo.'
  ],
  firma: 'Tuyo siempre, Pau 💖',

  pregunta: '¿Quieres seguir escribiendo nuestra historia conmigo?',
  respuestaSi: '¡Sabía que dirías que sí! Aquí empieza la luna número siete… y todas las que vengan. Te quiero, Paula. 💖',

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
