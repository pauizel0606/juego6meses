/* Historia y diálogos. Formato: [quién, texto, ánimo]
   quién: 'pau' | 'paula' | 'narr'   ánimo opcional: 'happy'
   Las 12 lunas son las lunas reales (llenas y nuevas) entre el 17/05/2026 y el 17/11/2026. */
const EL = CONFIG.el, ELLA = CONFIG.ella;

const STORY_INTRO = [
  ['narr', 'Dicen que existe un hilo rojo invisible que une a las personas destinadas a encontrarse…'],
  ['narr', `El 17 de mayo de 2026, el hilo de ${EL} y ${ELLA} empezó a brillar.`],
  ['narr', 'Desde entonces han pasado seis meses… y doce lunas: seis llenas, seis nuevas… y hasta un eclipse.'],
  ['paula', `${EL}… ¿has visto el cielo? ¡Faltan todas nuestras lunas!`],
  ['pau', 'Se han escondido doce recuerdos, uno por cada luna que hemos vivido juntos.'],
  ['paula', '¡Pues vamos a recuperarlos todos, uno a uno!', 'happy'],
  ['pau', 'Contigo, hasta el fin del mundo. 💖', 'happy'],
  ['narr', '(Y un chiwawa muy curioso con un collar verde ha decidido acompañarles… 🐶💚)']
];

/* type: 'full' (llena) | 'new' (nueva) | 'eclipse' */
const CHAPTERS = [
  {
    num: 'Luna 1', date: '31 de mayo', short: '31 may', moon: 'Luna Azul · llena', type: 'full', title: 'El Primer Encuentro', game: 'Runner',
    intro: [
      ['narr', '31 de mayo. Luna Azul: la segunda luna llena del mes, algo que casi nunca pasa… como lo vuestro.'],
      ['pau', `¡Llego tarde! ${ELLA} me está esperando al otro lado de la ciudad.`],
      ['paula', '(¿Vendrá…? Ojalá que sí…)'],
      ['narr', 'Ayuda a Pau a cruzar la ciudad y recoge corazones. ¡Los dorados valen 5! Tiene doble salto.']
    ],
    outro: [
      ['paula', '¡Has venido!', 'happy'],
      ['pau', 'Nunca me perdería un momento contigo.', 'happy']
    ]
  },
  {
    num: 'Luna 2', date: '15 de junio', short: '15 jun', moon: 'Luna nueva', type: 'new', title: 'Lluvia de Mariposas', game: 'Catch',
    intro: [
      ['narr', `15 de junio. Luna nueva. Esas primeras semanas, ${ELLA} sentía mariposas en el estómago…`],
      ['paula', '¡Se me han escapado todas las mariposas! ¡Y ahora llueven del cielo!'],
      ['pau', 'Atrápalas con el tarro… ¡pero cuidado con las gotas de tormenta!']
    ],
    outro: [
      ['paula', 'Creo que estas mariposas no se van a ir nunca…', 'happy'],
      ['pau', 'Las mías tampoco. 🦋', 'happy']
    ]
  },
  {
    num: 'Luna 3', date: '30 de junio', short: '30 jun', moon: 'Luna de Fresa · llena', type: 'full', title: 'La Tarta de Fresa', game: 'Stack',
    intro: [
      ['narr', '30 de junio. Luna de Fresa: la luna llena de junio, rosada y dulce.'],
      ['paula', '¡Hagamos una tarta de fresa para celebrar nuestro primer mes y medio!', 'happy'],
      ['pau', 'Yo pongo las capas… tú dime cuándo soltarlas.'],
      ['narr', 'Las capas se mueven de lado a lado. Suéltalas justo encima de la anterior: lo que sobresale, ¡se cae!']
    ],
    outro: [
      ['pau', 'Está un poco torcida… pero está hecha con amor.', 'happy'],
      ['paula', 'Es la tarta más bonita del mundo. 🍓', 'happy']
    ]
  },
  {
    num: 'Luna 4', date: '14 de julio', short: '14 jul', moon: 'Luna nueva', type: 'new', title: 'Constelaciones', game: 'Constel',
    intro: [
      ['narr', '14 de julio. Luna nueva: el cielo más oscuro del mes… y el mejor para ver estrellas.'],
      ['pau', `${ELLA}, si unes las estrellas forman cosas que te quiero decir.`],
      ['paula', '¿Ah, sí? ¡Enséñamelas!', 'happy'],
      ['narr', 'Toca las estrellas en orden (1, 2, 3…). La siguiente siempre brilla un poco más.']
    ],
    outro: [
      ['paula', 'Espera… ¿la última era un chiwawa? 😂', 'happy'],
      ['pau', 'Claro. Porque tú eres mi chiwawa. 💚', 'happy']
    ]
  },
  {
    num: 'Luna 5', date: '29 de julio', short: '29 jul', moon: 'Luna del Ciervo · llena', type: 'full', title: 'Caracolas de Verano', game: 'Simon',
    intro: [
      ['narr', '29 de julio. Luna del Ciervo: la luna llena del verano, reflejada en el mar.'],
      ['paula', '¡Mira! Cada caracola canta una nota distinta.', 'happy'],
      ['pau', 'Si repetimos su canción, nos regalarán un recuerdo.'],
      ['narr', 'Las caracolas tocarán una melodía. Repítela en el mismo orden. ¡Cada ronda es un poco más larga!']
    ],
    outro: [
      ['pau', 'Nuestras noches de verano suenan así.', 'happy'],
      ['paula', 'A olas, a risas… y a ti. 🐚', 'happy']
    ]
  },
  {
    num: 'Luna 6', date: '12 de agosto', short: '12 ago', moon: 'Luna nueva · ECLIPSE TOTAL DE SOL', type: 'eclipse', title: 'El Eclipse', game: 'Eclipse',
    intro: [
      ['narr', '12 de agosto de 2026. La Luna nueva se puso justo delante del Sol… y lo visteis juntos.'],
      ['paula', '¿Tienes las gafas? ¡Que empieza!', 'happy'],
      ['pau', 'Dicen que el Sol y la Luna solo se encuentran así una vez en mucho tiempo…'],
      ['paula', 'Como nosotros. 🌑☀️', 'happy'],
      ['narr', 'Toca justo cuando la Luna tape el Sol por completo. Cuanto más exacto, más totalidad.']
    ],
    outro: [
      ['paula', 'Se ha hecho de noche en pleno día…', 'happy'],
      ['pau', 'Y aun así lo más bonito que he visto ese día eras tú.', 'happy']
    ]
  },
  {
    num: 'Luna 7', date: '28 de agosto', short: '28 ago', moon: 'Luna del Esturión · llena + eclipse parcial', type: 'full', title: 'La Caja de Recuerdos', game: 'Memory',
    intro: [
      ['narr', '28 de agosto. Luna del Esturión… ¡y otro eclipse, esta vez de Luna! Agosto fue un mes de cielo mágico.'],
      ['paula', '¡Oh, no! Se ha volcado nuestra caja de recuerdos.'],
      ['pau', 'Tranquila, encontramos las parejas y los volvemos a guardar.']
    ],
    outro: [
      ['pau', 'Cada uno de estos momentos es un tesoro.'],
      ['paula', 'Y todavía nos quedan muchísimos por crear.', 'happy']
    ]
  },
  {
    num: 'Luna 8', date: '11 de septiembre', short: '11 sep', moon: 'Luna nueva', type: 'new', title: 'Estrellas Fugaces', game: 'Wishes',
    intro: [
      ['narr', '11 de septiembre. Luna nueva. Sin luna, el cielo se llena de estrellas fugaces.'],
      ['pau', 'Dicen que si atrapas una, se cumple un deseo.'],
      ['paula', '¡Pues yo las quiero todas!', 'happy'],
      ['narr', 'Toca (o desliza el dedo sobre) las estrellas fugaces antes de que desaparezcan. ¡Las doradas valen triple!']
    ],
    outro: [
      ['paula', '¿Y tú qué has pedido?'],
      ['pau', 'Nada. Lo que quería ya lo tengo al lado. 💚', 'happy']
    ]
  },
  {
    num: 'Luna 9', date: '26 de septiembre', short: '26 sep', moon: 'Luna de la Cosecha · llena', type: 'full', title: 'La Carta Voladora', game: 'Plane',
    intro: [
      ['narr', '26 de septiembre. Luna de la Cosecha: la luna llena más cercana al otoño.'],
      ['pau', 'He escrito una carta muy especial. La mandaré en un avión de papel hasta su ventana.'],
      ['paula', '¿Qué es eso que viene volando…?'],
      ['narr', 'Guía el avión entre las nubes de tormenta y recoge corazones por el camino.']
    ],
    outro: [
      ['paula', `"Para ${ELLA}, la persona que hace bonitos todos mis días"… 🥹`, 'happy'],
      ['pau', 'Y lo que pone dentro es todavía más verdad.', 'happy']
    ]
  },
  {
    num: 'Luna 10', date: '10 de octubre', short: '10 oct', moon: 'Luna nueva', type: 'new', title: 'Palabras Secretas', game: 'Words',
    intro: [
      ['narr', '10 de octubre. Luna nueva. El viento de otoño ha revuelto las letras de nuestras palabras favoritas.'],
      ['paula', '¡Están todas desordenadas!'],
      ['pau', 'Seguro que sabes cuáles son… te dejo una pista para cada una.'],
      ['narr', 'Toca las letras en orden para formar la palabra. Si te atascas, pide una pista 💡.']
    ],
    outro: [
      ['paula', 'Al final todas las palabras llevan a lo mismo…', 'happy'],
      ['pau', 'A nosotros. 💚', 'happy']
    ]
  },
  {
    num: 'Luna 11', date: '26 de octubre', short: '26 oct', moon: 'Luna del Cazador · llena', type: 'full', title: 'Turno de Noche', game: 'Burger',
    intro: [
      ['narr', '26 de octubre. Luna del Cazador. Este último mes ha llegado algo nuevo: ¡trabajar juntos en el McDonald\'s!'],
      ['pau', '¡Que se acumulan los pedidos! ¿Me echas una mano, compañera?', 'happy'],
      ['paula', '¡Marchando! Pan, carne, queso… ¡yo me sé todas!', 'happy'],
      ['narr', 'Mira el pedido y toca los ingredientes en orden, de abajo arriba. Si piden patatas 🍟, ¡no te olvides! Cuanto más rápido, más propina.']
    ],
    outro: [
      ['paula', 'Los turnos se pasan volando cuando estás tú.', 'happy'],
      ['pau', 'El mejor equipo de toda la cocina. 🍔', 'happy']
    ]
  },
  {
    num: 'Luna 12', date: '9 de noviembre', short: '9 nov', moon: 'Luna nueva', type: 'new', title: 'Nuestra Canción', game: 'Rhythm',
    intro: [
      ['narr', '9 de noviembre. La última luna nueva antes de los seis meses… y una canción que ya es solo vuestra.'],
      ['paula', '¿Bailamos?', 'happy'],
      ['pau', 'Toca tú la melodía, yo te sigo.', 'happy'],
      ['narr', 'Cada corazón que aciertes toca una nota. ¡Si los aciertas todos, sonará la canción entera!']
    ],
    outro: [
      ['narr', 'La duodécima luna vuelve al cielo…'],
      ['paula', `${EL}… mira. ¡Las doce lunas están brillando!`, 'happy'],
      ['pau', 'Y el 17 de noviembre… hacemos seis meses. 💚', 'happy']
    ]
  }
];
