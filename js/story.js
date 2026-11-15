/* Historia y diálogos. Formato: [quién, texto, ánimo]
   quién: 'pau' | 'paula' | 'narr'   ánimo opcional: 'happy' */
const EL = CONFIG.el, ELLA = CONFIG.ella;

const STORY_INTRO = [
  ['narr', 'Dicen que existe un hilo rojo invisible que une a las personas destinadas a encontrarse…'],
  ['narr', `El de ${EL} y ${ELLA} lleva seis lunas brillando más fuerte que nunca.`],
  ['paula', `${EL}… ¿has visto el cielo? ¡Le faltan trozos a la luna!`],
  ['pau', 'Es verdad… La Luna ha escondido seis de nuestros recuerdos por el cielo.'],
  ['paula', '¡Pues vamos a recuperarlos! Uno por cada mes juntos.', 'happy'],
  ['pau', 'Contigo, hasta el fin del mundo. 💖', 'happy']
];

const CHAPTERS = [
  {
    num: 'Luna 1', title: 'El Primer Encuentro',
    intro: [
      ['narr', 'Luna 1. Todo empezó con un encuentro…'],
      ['pau', `¡Llego tarde! ${ELLA} me está esperando al otro lado de la ciudad.`],
      ['paula', '(¿Vendrá…? Ojalá que sí…)'],
      ['narr', 'Ayuda a Pau a cruzar la ciudad y recoge todos los corazones que puedas. ¡Puedes hacer doble salto!']
    ],
    outro: [
      ['paula', '¡Has venido!', 'happy'],
      ['pau', 'Nunca me perdería un momento contigo.', 'happy'],
      ['narr', 'El primer trozo de luna vuelve al cielo. 🌙']
    ]
  },
  {
    num: 'Luna 2', title: 'Lluvia de Mariposas',
    intro: [
      ['narr', `Luna 2. Esas primeras semanas, ${ELLA} sentía mariposas en el estómago…`],
      ['paula', '¡Se me han escapado todas las mariposas! ¡Y ahora llueven del cielo!'],
      ['pau', 'Atrápalas con el tarro… ¡pero cuidado con las gotas de tormenta!'],
      ['narr', 'Las mariposas valen más que los corazones, y las cartas doradas… ¡todavía más!']
    ],
    outro: [
      ['paula', 'Creo que estas mariposas no se van a ir nunca…', 'happy'],
      ['pau', 'Las mías tampoco. 🦋', 'happy']
    ]
  },
  {
    num: 'Luna 3', title: 'Constelaciones',
    intro: [
      ['narr', 'Luna 3. Las noches tumbados mirando las estrellas…'],
      ['pau', `${ELLA}, si unes las estrellas forman cosas que te quiero decir.`],
      ['paula', '¿Ah, sí? ¡Enséñamelas!', 'happy'],
      ['narr', 'Toca las estrellas en orden (1, 2, 3…) para dibujar cada constelación. La siguiente siempre brilla un poco más.']
    ],
    outro: [
      ['paula', 'El cielo entero habla de nosotros.', 'happy'],
      ['pau', 'Es que no hay nada que me guste más contar.']
    ]
  },
  {
    num: 'Luna 4', title: 'La Caja de Recuerdos',
    intro: [
      ['narr', 'Luna 4. Cuatro meses llenos de pequeños momentos…'],
      ['paula', '¡Oh, no! Se ha volcado nuestra caja de recuerdos.'],
      ['pau', 'Tranquila, encontramos las parejas y los volvemos a guardar.'],
      ['narr', 'Da la vuelta a dos cartas. Si son iguales, ¡recuerdo recuperado! Intenta hacerlo en pocos movimientos.']
    ],
    outro: [
      ['pau', 'Cada uno de estos momentos es un tesoro.'],
      ['paula', 'Y todavía nos quedan muchísimos por crear.', 'happy']
    ]
  },
  {
    num: 'Luna 5', title: 'La Carta Voladora',
    intro: [
      ['narr', 'Luna 5. Pau escribió una carta muy, muy especial…'],
      ['pau', 'La mandaré en un avión de papel hasta su ventana.'],
      ['paula', '¿Qué es eso que viene volando…?'],
      ['narr', 'Guía el avión entre las nubes de tormenta y recoge corazones por el camino.']
    ],
    outro: [
      ['paula', `"Para ${ELLA}, la persona que hace bonitos todos mis días"… 🥹`, 'happy'],
      ['pau', 'Y lo que pone dentro es todavía más verdad.', 'happy']
    ]
  },
  {
    num: 'Luna 6', title: 'Nuestra Canción',
    intro: [
      ['narr', 'Luna 6. Seis meses… y una canción que ya es solo vuestra.'],
      ['paula', '¿Bailamos?', 'happy'],
      ['pau', 'Toca tú la melodía, yo te sigo.', 'happy'],
      ['narr', 'Cada corazón que aciertes toca una nota. ¡Si los aciertas todos, sonará la canción entera!']
    ],
    outro: [
      ['narr', 'La última luna vuelve al cielo…'],
      ['paula', `${EL}… mira. ¡La luna está completa!`, 'happy'],
      ['pau', 'Igual que yo cuando estoy contigo.', 'happy']
    ]
  }
];
