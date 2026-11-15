/* Flujo del juego */
const Game = { cur: null };

function hideAll() { ['#title', '#mapHud', '#finalUI', '#letter', '#panel', '#btnPause'].forEach(hide); }

function goTitle() {
  hideAll(); Sound.music('calm');
  Engine.set(new TitleScene());
  $('#tEl').textContent = CONFIG.el; $('#tElla').textContent = CONFIG.ella;
  $('#btnStart').textContent = Save.data.intro ? 'Continuar ✨' : 'Empezar ✨';
  $('#btnReset').classList.toggle('hidden', !Save.data.intro);
  $('#titleTip').textContent = isTouch ? 'Consejo: sube el volumen y gira el móvil si quieres 💕' : 'Consejo: sube el volumen 🎶';
  show('#title');
}

$('#btnStart').addEventListener('click', async () => {
  Sound.init(); Sound.click(); Sound.music('calm'); hide('#title');
  if (!Save.data.intro) {
    await Dialog.play(STORY_INTRO);
    Save.data.intro = true; Save.save();
  }
  goMap();
});
$('#btnReset').addEventListener('click', async () => {
  Sound.click(); hide('#title');
  const r = await UI.panel('<h2>¿Empezar de nuevo?</h2><p>Se borrará el progreso y las estrellas.</p>', [['no', 'Mejor no'], ['yes', 'Sí, desde el principio', 'pink']]);
  if (r === 'yes') Save.reset();
  goTitle();
});

function goMap() {
  hideAll(); Sound.music('calm');
  Engine.set(new MapScene(i => playChapter(i)));
  const tot = Save.data.stars.reduce((a, b) => a + b, 0);
  $('#mapSub').textContent = Save.data.stars[0] ? `★ ${tot} / 18 estrellas` : 'Toca la luna que brilla para empezar';
  $('#btnFinal').classList.toggle('hidden', !Save.allDone());
  show('#mapHud');
}
$('#btnAlbum').addEventListener('click', async () => { Sound.click(); hide('#mapHud'); await UI.album(); show('#mapHud'); });
$('#btnFinal').addEventListener('click', () => { Sound.click(); goFinal(); });

let busy = false;
async function playChapter(i, again, wasFirst) {
  if (busy && !again) return; busy = true;
  hideAll(); Sound.click();
  const ch = CHAPTERS[i];
  const game = new GAMES[i]();
  Engine.set(game);
  if (!again) { await UI.chapterCard(ch); await Dialog.play(ch.intro); }
  const res = await runGame(i, game);
  if (!res) { busy = false; goMap(); return; }
  const first = wasFirst != null ? wasFirst : !Save.data.stars[i];
  Save.data.stars[i] = Math.max(Save.data.stars[i], res.stars);
  Save.data.best[i] = Math.max(Save.data.best[i], res.hearts);
  Save.data.unlocked = Math.max(Save.data.unlocked, Math.min(6, i + 2));
  Save.save();
  Sound.music('calm');
  const choice = await UI.result(i, res);
  if (choice === 'retry') return playChapter(i, true, first);
  if (first) await Dialog.play(ch.outro);
  busy = false;
  if (i === 5 && first) goFinal(); else goMap();
}

function runGame(i, game) {
  return new Promise(res => {
    Game.cur = { i, game, res: r => { hide('#btnPause'); Game.cur = null; res(r); } };
    game.done = r => Game.cur && Game.cur.res(r);
    show('#btnPause');
    Sound.music(i === 5 ? null : 'play');
    game.begin();
  });
}

async function pauseMenu() {
  const cur = Game.cur;
  if (!cur || Engine.paused || Dialog.active || cur.game.ended || !cur.game.started) return;
  Engine.paused = true; Sound.hold();
  const r = await UI.panel('<h2>Pausa</h2><p>Tómate tu tiempo 💕</p>', [['exit', 'Salir al mapa'], ['restart', '↻ Reiniciar'], ['resume', 'Continuar ▶', 'pink']]);
  Sound.release(); Engine.paused = false;
  if (Game.cur !== cur) return;
  if (r === 'restart') {
    const g = new GAMES[cur.i]();
    g.done = cur.game.done; cur.game = g;
    Engine.set(g); Sound.music(cur.i === 5 ? null : 'play'); g.begin();
  } else if (r === 'exit') cur.res(null);
}
function onPauseKey() {
  if (UI.panelRes && Engine.paused) { UI.closePanel('resume'); return; }
  pauseMenu();
}
$('#btnPause').addEventListener('click', () => { Sound.click(); pauseMenu(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && Game.cur && Game.cur.game.playing) pauseMenu(); });

/* ---------- Final y carta ---------- */
let finalTimer = null;
function goFinal() {
  hideAll(); Sound.music('calm');
  Engine.set(new FinalScene());
  Save.data.finalSeen = true; Save.save();
  clearTimeout(finalTimer);
  finalTimer = setTimeout(() => { if (Engine.scene instanceof FinalScene) show('#finalUI'); }, 3500);
}
$('#btnLetter').addEventListener('click', () => { Sound.click(); openLetter(); });

let cntTimer = null;
function openLetter() {
  hide('#finalUI');
  const L = $('#letter');
  L.innerHTML = `<div class="paper">
    <div class="seal">💌</div>
    <h2>Para ${esc(CONFIG.ella)}</h2>
    ${CONFIG.carta.map(p => `<p>${esc(p)}</p>`).join('')}
    <p class="sign">${esc(CONFIG.firma)}</p>
    <div class="counter" id="counterBox"><span>Llevamos juntos</span><b id="cnt"></b></div>
    <div class="question" id="qBox">
      <p>${esc(CONFIG.pregunta)}</p>
      <div class="qbtns"><button id="btnYes" class="btn pink big">Sí 💖</button><button id="btnNo" class="btn ghost">No</button></div>
    </div>
    <div class="letter-actions"><button class="btn" id="lMap">🗺️ Volver al mapa</button></div>
  </div>`;
  show('#letter'); L.scrollTop = 0;
  const start = new Date(CONFIG.fechaInicio + 'T00:00:00');
  const tick = () => {
    const ms = Date.now() - start.getTime();
    if (!(ms > 0)) { $('#counterBox').classList.add('hidden'); return; }
    const d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60, s = Math.floor(ms / 1e3) % 60;
    $('#cnt').textContent = `${d} días, ${h} h, ${m} min y ${s} s 💞`;
  };
  tick(); clearInterval(cntTimer); cntTimer = setInterval(tick, 1000);

  let dodges = 0;
  const no = $('#btnNo');
  const dodge = e => {
    if (dodges >= 6) return;
    e.preventDefault(); dodges++; Sound.pop();
    if (dodges >= 6) {
      no.style.position = ''; no.style.left = ''; no.style.top = '';
      no.textContent = 'Vale, vale… ¡SÍ! 💖'; no.className = 'btn pink'; return;
    }
    const r = no.getBoundingClientRect();
    no.style.position = 'fixed';
    no.style.left = rand(10, innerWidth - r.width - 10) + 'px';
    no.style.top = rand(60, innerHeight - r.height - 20) + 'px';
    no.textContent = ['No', '¿Seguro?', 'Piénsalo…', '¡Que no te dejo!', 'Jeje 😜', 'Último intento'][dodges] || 'No';
  };
  no.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') dodge(e); });
  no.addEventListener('pointerdown', dodge);
  no.addEventListener('click', e => { if (dodges >= 6) sayYes(); else dodge(e); });
  $('#btnYes').addEventListener('click', sayYes);
  $('#lMap').addEventListener('click', () => { Sound.click(); clearInterval(cntTimer); goMap(); });
}
function sayYes() {
  Sound.win();
  if (Engine.scene && Engine.scene.celebrate) Engine.scene.celebrate();
  const no = $('#btnNo'); if (no) no.remove();
  $('#qBox').innerHTML = `<div class="yay"><div class="big-heart">💖</div><p>${esc(CONFIG.respuestaSi)}</p></div>`;
  const L = $('#letter');
  setTimeout(() => { L.classList.add('hidden'); show('#finalUI'); $('#btnLetter').textContent = 'Releer la carta 💌'; }, 4200);
}

/* ---------- arranque ---------- */
Save.load();
resize();
requestAnimationFrame(t => { Engine.last = t; Engine.frame(t); });
goTitle();
if (location.hash === '#final') goFinal();
