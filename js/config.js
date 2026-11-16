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

  // Un recuerdo que se desbloquea al completar cada luna (12)
  recuerdos: [
    { titulo: 'La Luna Azul', texto: 'Dos semanas contigo y ya sabía que esto era especial. Tan raro y bonito como una Luna Azul.' },
    { titulo: 'Las mariposas', texto: 'Todavía me pongo nervioso cuando me escribes. Y me encanta que sea así.' },
    { titulo: 'Dulce como tú', texto: 'Contigo hasta los días normales saben a tarta de fresa.' },
    { titulo: 'Nuestras estrellas', texto: 'Contigo, hasta las noches más normales se convierten en algo especial.' },
    { titulo: 'Noches de verano', texto: 'El verano más bonito de mi vida tuvo tu nombre.' },
    { titulo: 'El eclipse', texto: '12 de agosto de 2026. El cielo se apagó en pleno día y yo solo podía pensar en la suerte de estar viéndolo a tu lado.' },
    { titulo: 'Los pequeños momentos', texto: 'Los cafés, las risas, las tonterías… Todo es mejor si es contigo.' },
    { titulo: 'Los deseos', texto: 'De todos los deseos que podría pedir, el que más se repite eres tú.' },
    { titulo: 'La carta', texto: 'Si tuviera que escribir todo lo que siento por ti, no habría papel suficiente en el mundo.' },
    { titulo: 'Nuestras palabras', texto: 'Hay palabras que ya solo suenan bien si las dices tú.' },
    { titulo: 'Compañeros de turno', texto: 'Hasta los turnos más largos se hacen cortos si al girarme estás tú.' },
    { titulo: 'Nuestra canción', texto: 'Seis meses y doce lunas después, sigo eligiéndote cada día. Y lo seguiré haciendo.' }
  ],


  // Palabras secretas (Luna 10): [PALABRA, pista]. Solo letras, sin espacios.
  palabras: [
    ['LUNA', 'Nos ha acompañado doce veces 🌙'],
    ['ABRAZO', 'Mi sitio favorito del mundo'],
    ['ECLIPSE', 'Lo que vimos juntos el 12 de agosto'],
    ['CHIWAWA', 'Lo que eres para mí 💚'],
    ['TEQUIERO', 'Lo que te diría cada minuto']
  ],

  // Deseos que salen al atrapar estrellas fugaces (Luna 8)
  deseos: ['Más viajes juntos ✈️', 'Mil abrazos más', 'Que nunca dejemos de reírnos', 'Una casita con un chiwawa 🐶', 'Muchas cenas juntos 🍝',
    'Bailar en la cocina', 'Ver otro eclipse contigo', 'Que siempre seas tú 💚', 'Despertar a tu lado', 'Más turnos juntos 🍔', 'Otras doce lunas', 'Tus besos de buenas noches'],

  // Nuestra canción (Luna 12). Suena el vídeo oficial de YouTube dentro del juego.
  // Si no se puede cargar (sin internet), suena una melodía propia del juego.
  cancion: {
    titulo: 'Happy Monday',
    artista: 'W Sound 10 · Hades66, Westcol, Ovy On The Drums',
    youtube: 'LYn4w3m3Pjo',   // id del vídeo oficial (canal W Sound)
    inicio: 0,                // segundo del vídeo donde empieza el juego
    duracion: 80,             // segundos que dura el minijuego
    bpm: 96,                  // pulsos por minuto (para que los corazones caigan al ritmo)
    desfase: 0                // ajuste fino en segundos si los corazones van adelantados (+) o atrasados (-)
  },

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
