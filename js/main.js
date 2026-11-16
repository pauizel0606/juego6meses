/* Flujo del juego */
const Game = { cur: null };

function hideAll() { ['#title', '#mapHud', '#finalUI', '#letter', '#voucher', '#panel', '#btnPause'].forEach(hide); }

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
  $('#mapSub').textContent = Save.data.stars[0] ? `★ ${tot} / ${CHAPTERS.length * 3} estrellas · ${Save.data.stars.filter(s => s).length}/${CHAPTERS.length} lunas` : 'Toca la luna que brilla para empezar';
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
  Save.data.unlocked = Math.max(Save.data.unlocked, Math.min(CHAPTERS.length, i + 2));
  Save.save();
  Sound.music('calm');
  const choice = await UI.result(i, res);
  if (choice === 'retry') return playChapter(i, true, first);
  if (first) await Dialog.play(ch.outro);
  busy = false;
  if (i === CHAPTERS.length - 1 && first) goFinal(); else goMap();
}

function runGame(i, game) {
  return new Promise(res => {
    Game.cur = { i, game, res: r => { hide('#btnPause'); Game.cur = null; res(r); } };
    game.done = r => Game.cur && Game.cur.res(r);
    show('#btnPause');
    Sound.music(['Rhythm', 'Song'].includes(CHAPTERS[i].game) ? null : 'play');
    game.begin();
  });
}

async function pauseMenu() {
  const cur = Game.cur;
  if (!cur || Engine.paused || Dialog.active || cur.game.ended || !cur.game.started) return;
  Engine.paused = true; Sound.hold(); if (cur.game.onPause) cur.game.onPause();
  const r = await UI.panel('<h2>Pausa</h2><p>Tómate tu tiempo 💕</p>', [['exit', 'Salir al mapa'], ['restart', '↻ Reiniciar'], ['resume', 'Continuar ▶', 'pink']]);
  Sound.release(); Engine.paused = false;
  if (Game.cur !== cur) return;
  if (r === 'resume' && cur.game.onResume) cur.game.onResume();
  if (r === 'restart') {
    const g = new GAMES[cur.i]();
    g.done = cur.game.done; cur.game = g;
    Engine.set(g); Sound.music(['Rhythm', 'Song'].includes(CHAPTERS[cur.i].game) ? null : 'play'); g.begin();
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
  refreshFinalUI();
  finalTimer = setTimeout(() => { if (Engine.scene instanceof FinalScene && $('#voucher').classList.contains('hidden') && $('#letter').classList.contains('hidden')) show('#finalUI'); }, 3500);
}
function refreshFinalUI() {
  const seen = !!Save.data.valeSeen;
  $('#btnGift').classList.toggle('hidden', seen);
  $('#btnVale').classList.toggle('hidden', !seen);
  $('#btnLetter').classList.toggle('hidden', !seen);
}
$('#btnGift').addEventListener('click', () => { Sound.click(); openVoucher(); });
$('#btnVale').addEventListener('click', () => { Sound.click(); openVoucher(); });
$('#btnLetter').addEventListener('click', () => { Sound.click(); openLetter(); });

/* ---------- El vale (rasca y gana) ---------- */
function openVoucher() {
  hide('#finalUI');
  const V = CONFIG.vale, el = $('#voucher'), seen = !!Save.data.valeSeen;
  el.innerHTML = `<div class="v-wrap">
    <p class="v-pre">${seen ? 'Tu vale 🎁' : 'Antes de la carta… ¡un regalo! 🎁'}</p>
    <div class="ticket">
      <div class="t-stub"><span>${esc(V.icono)}</span><small>Nº 6</small></div>
      <div class="t-body">
        <small class="t-tag">VALE POR</small>
        <h3>${esc(V.titulo)}</h3>
        <p class="t-det">${esc(V.detalle)}</p>
        <div class="t-row"><span><b>Para:</b> ${esc(CONFIG.ella)}</span><span><b>De:</b> ${esc(CONFIG.el)}</span></div>
        <p class="t-val"><b>Válido:</b> ${esc(V.valido)}</p>
        <p class="t-small">${esc(V.letraPequena)}</p>
        ${seen ? '' : '<canvas class="scratch"></canvas>'}
      </div>
    </div>
    <p class="v-hint" id="vHint">${seen ? 'Haz una captura de pantalla para canjearlo 📸' : (isTouch ? 'Rasca con el dedo' : 'Rasca con el ratón') + ' para descubrirlo ✨'}</p>
    <div class="v-actions">
      <button class="btn pink big ${seen ? '' : 'hidden'}" id="vNext">${seen ? 'Volver 💌' : 'Y ahora… la carta 💌'}</button>
    </div>
  </div>`;
  show('#voucher');
  $('#vNext').onclick = () => { Sound.click(); hide('#voucher'); if (seen) { refreshFinalUI(); show('#finalUI'); } else openLetter(); };
  if (seen) return;
  const reveal = () => {
    Save.data.valeSeen = true; Save.save();
    Sound.win(); if (Engine.scene && Engine.scene.celebrate) Engine.scene.celebrate();
    $('#vHint').textContent = '¡Es tuyo! Haz una captura para canjearlo cuando quieras 📸';
    $('#vNext').classList.remove('hidden');
  };
  requestAnimationFrame(() => {
    const finish = setupScratch(el.querySelector('.scratch'), reveal);
    setTimeout(() => {
      const h = $('#vHint'); if (!h || Save.data.valeSeen) return;
      h.innerHTML += ' · <a id="vSkip">descubrirlo sin rascar</a>';
      $('#vSkip').onclick = finish;
    }, 7000);
  });
}
function setupScratch(cvs, onDone) {
  const r = cvs.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
  cvs.width = Math.max(1, Math.round(r.width * d)); cvs.height = Math.max(1, Math.round(r.height * d));
  const g = cvs.getContext('2d'); g.scale(d, d);
  const gr = g.createLinearGradient(0, 0, r.width, r.height);
  gr.addColorStop(0, '#bfc0d4'); gr.addColorStop(0.45, '#f3f3fa'); gr.addColorStop(0.55, '#e4e4ef'); gr.addColorStop(1, '#a5a6bd');
  g.fillStyle = gr; g.fillRect(0, 0, r.width, r.height);
  for (let i = 0; i < 26; i++) { g.globalAlpha = 0.25; drawHeart(g, Math.random() * r.width, Math.random() * r.height, 14 + Math.random() * 14, i % 3 ? '#ff8fab' : '#3ccf6e', false); }
  g.globalAlpha = 1;
  txt(g, 'RASCA AQUÍ ✨', r.width / 2, r.height / 2 - 10, Math.min(26, r.width / 10), '#6d6e88', { weight: 700 });
  txt(g, '¿qué habrá debajo?', r.width / 2, r.height / 2 + 18, Math.min(15, r.width / 18), '#7f8099', { weight: 500 });
  g.globalCompositeOperation = 'destination-out';
  let down = false, last = null, done = false, n = 0;
  const pos = e => { const b = cvs.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
  const finish = () => {
    if (done) return; done = true;
    cvs.style.transition = 'opacity .7s'; cvs.style.opacity = 0; setTimeout(() => cvs.remove(), 800);
    onDone();
  };
  const check = () => {
    const data = g.getImageData(0, 0, cvs.width, cvs.height).data;
    let clear = 0, tot = 0;
    for (let i = 3; i < data.length; i += 4 * 37) { tot++; if (data[i] < 128) clear++; }
    if (clear / tot > 0.5) finish();
  };
  const scratch = (x, y) => {
    if (done) return;
    g.lineWidth = 38; g.lineCap = 'round';
    if (last) { g.beginPath(); g.moveTo(last[0], last[1]); g.lineTo(x, y); g.stroke(); }
    g.beginPath(); g.arc(x, y, 19, 0, TAU); g.fill();
    last = [x, y]; n++;
    if (n % 4 === 0) Sound.blip();
    if (n % 10 === 0) check();
  };
  cvs.addEventListener('pointerdown', e => { e.preventDefault(); Sound.init(); down = true; last = null; try { cvs.setPointerCapture(e.pointerId); } catch (er) {} scratch(...pos(e)); });
  cvs.addEventListener('pointermove', e => { if (down) { e.preventDefault(); scratch(...pos(e)); } });
  const stop = () => { down = false; last = null; if (!done) check(); };
  cvs.addEventListener('pointerup', stop); cvs.addEventListener('pointercancel', stop);
  return finish;
}

let cntTimer = null;
function openLetter() {
  hide('#finalUI');
  const L = $('#letter');
  L.innerHTML = `<div class="paper">
    <div class="seal">💌</div>
    <h2>${esc(CONFIG.saludo || 'Para ' + CONFIG.ella)},</h2>
    ${CONFIG.carta.map(p => `<p>${esc(p)}</p>`).join('')}
    <p class="sign">${esc(CONFIG.firma)}</p>
    <div class="counter" id="counterBox"><span>Llevamos juntos</span><b id="cnt"></b></div>
    <div class="question" id="qBox">
      <p>${esc(CONFIG.pregunta)}</p>
      <div class="qbtns"><button id="btnYes" class="btn pink big">Sí 💚</button><button id="btnNo" class="btn ghost">No</button></div>
    </div>
    <div class="letter-actions"><button class="btn" id="lVale">🎁 Ver el vale</button><button class="btn" id="lMap">🗺️ Volver al mapa</button></div>
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
      no.textContent = "Vale, vale… ¡SÍ! 💚"; no.className = 'btn pink'; return;
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
  $('#lVale').addEventListener('click', () => { Sound.click(); clearInterval(cntTimer); hide('#letter'); openVoucher(); });
}
function sayYes() {
  Sound.win();
  if (Engine.scene && Engine.scene.celebrate) Engine.scene.celebrate();
  const no = $('#btnNo'); if (no) no.remove();
  $('#qBox').innerHTML = `<div class="yay"><div class="big-heart">💚</div><p>${esc(CONFIG.respuestaSi)}</p></div>`;
  const L = $('#letter');
  setTimeout(() => { L.classList.add('hidden'); refreshFinalUI(); show('#finalUI'); $('#btnLetter').textContent = 'Releer la carta 💌'; }, 5000);
}

/* ---------- arranque ---------- */
Save.load();
resize();
requestAnimationFrame(t => { Engine.last = t; Engine.frame(t); });
goTitle();
if (location.hash === '#final') goFinal();
