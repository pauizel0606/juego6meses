/* Interfaz: guardado, diálogos, paneles */
const $ = s => document.querySelector(s);
const show = s => $(s).classList.remove('hidden');
const hide = s => $(s).classList.add('hidden');
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

const Save = {
  KEY: 'pp6_save_v1',
  data: null,
  fresh() { return { intro: false, unlocked: 1, stars: [0, 0, 0, 0, 0, 0], best: [0, 0, 0, 0, 0, 0], finalSeen: false }; },
  load() { this.data = this.fresh(); try { const d = JSON.parse(localStorage.getItem(this.KEY)); if (d) Object.assign(this.data, d); } catch (e) {} },
  save() { try { localStorage.setItem(this.KEY, JSON.stringify(this.data)); } catch (e) {} },
  reset() { this.data = this.fresh(); this.save(); },
  allDone() { return this.data.stars.every(s => s > 0); }
};

const NAMES = { pau: CONFIG.el, paula: CONFIG.ella, narr: '✨' };

const Dialog = {
  active: false, lines: [], i: 0, tm: null, chars: [], n: 0, res: null,
  pctx: $('#dlgPortrait').getContext('2d'),
  play(lines) {
    return new Promise(res => {
      this.lines = lines; this.i = 0; this.res = res; this.active = true;
      show('#dialog'); this.showLine();
    });
  },
  showLine() {
    const [who, text, mood] = this.lines[this.i];
    const box = $('#dialog .dlg'), por = $('#dlgPortrait');
    box.classList.toggle('narr', who === 'narr'); por.classList.toggle('narr', who === 'narr');
    box.style.animation = 'none'; void box.offsetWidth; box.style.animation = '';
    $('#dlgName').textContent = NAMES[who] || '';
    if (who !== 'narr') {
      const p = this.pctx; p.clearRect(0, 0, 160, 160);
      drawChar(p, who, 80, 236, 225, { t: 0.4, happy: mood === 'happy', noShadow: true, bob: 0 });
    }
    this.chars = Array.from(text); this.n = 0;
    const el = $('#dlgText'); el.textContent = '';
    clearInterval(this.tm);
    this.tm = setInterval(() => {
      this.n++;
      el.textContent = this.chars.slice(0, this.n).join('');
      if (this.n % 3 === 0) Sound.blip();
      if (this.n >= this.chars.length) { clearInterval(this.tm); this.tm = null; }
    }, 24);
  },
  advance() {
    if (!this.active) return;
    if (this.tm) { clearInterval(this.tm); this.tm = null; $('#dlgText').textContent = this.chars.join(''); return; }
    Sound.click();
    this.i++;
    if (this.i >= this.lines.length) this.close(); else this.showLine();
  },
  close() { clearInterval(this.tm); this.tm = null; this.active = false; hide('#dialog'); const r = this.res; this.res = null; r && r(); }
};
$('#dialog').addEventListener('pointerdown', e => { if (e.target.id !== 'dlgSkip') { e.preventDefault(); Sound.init(); Dialog.advance(); } });
$('#dlgSkip').addEventListener('click', e => { e.stopPropagation(); Sound.click(); Dialog.close(); });

const UI = {
  panelRes: null,
  panel(html, buttons) {
    return new Promise(res => {
      $('#panel .content').innerHTML = html;
      const act = $('#panel .actions'); act.innerHTML = '';
      for (const [key, label, cls] of buttons) {
        const b = document.createElement('button');
        b.className = 'btn ' + (cls || ''); b.textContent = label;
        b.onclick = () => { Sound.click(); this.closePanel(key); };
        act.appendChild(b);
      }
      this.panelRes = res; show('#panel');
      const card = $('#panel .card'); card.style.animation = 'none'; void card.offsetWidth; card.style.animation = '';
    });
  },
  closePanel(key) { hide('#panel'); const r = this.panelRes; this.panelRes = null; r && r(key); },
  chapterCard(ch) {
    return new Promise(res => {
      const el = $('#chapterCard');
      el.querySelector('.cc-num').textContent = ch.num;
      el.querySelector('.cc-title').textContent = ch.title;
      el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
      show('#chapterCard');
      let done = false;
      const fin = () => { if (done) return; done = true; hide('#chapterCard'); el.onpointerdown = null; res(); };
      el.onpointerdown = () => { Sound.init(); fin(); };
      setTimeout(fin, 2300);
    });
  },
  starsHtml(n) { return `<div class="stars">${[0, 1, 2].map(i => `<span class="${i < n ? 'on' : ''}">★</span>`).join('')}</div>`; },
  result(i, res) {
    const ch = CHAPTERS[i], m = CONFIG.recuerdos[i];
    const msg = res.stars === 3 ? '¡Perfecto! 💕' : res.stars === 2 ? '¡Muy bien! 💗' : '¡Conseguido! 💓';
    return this.panel(`
      <h2>¡${ch.num} recuperada!</h2>
      ${this.starsHtml(res.stars)}
      <p class="res-hearts">${msg} &nbsp; 💖 ${res.hearts} ${res.label || 'corazones'}</p>
      <div class="memo"><div class="tag">Recuerdo desbloqueado</div><h3>${esc(m.titulo)}</h3><p>${esc(m.texto)}</p></div>`,
      [['retry', '↻ Repetir'], ['ok', 'Continuar ➜', 'pink']]);
  },
  album() {
    const cards = CONFIG.recuerdos.map((m, i) => {
      const ok = Save.data.stars[i] > 0;
      return `<div class="memo ${ok ? '' : 'locked'}"><div class="tag">${CHAPTERS[i].num} ${ok ? '★'.repeat(Save.data.stars[i]) : ''}</div>
        <h3>${ok ? esc(m.titulo) : '???'}</h3><p>${ok ? esc(m.texto) : 'Completa esta luna para desbloquear el recuerdo.'}</p></div>`;
    }).join('');
    return this.panel(`<h2>Nuestro álbum</h2><div class="album">${cards}</div>`, [['ok', 'Cerrar', 'pink']]);
  }
};

/* Sonido on/off */
function refreshSoundBtn() { $('#btnSound').textContent = Sound.muted ? '🔇' : '🔊'; }
$('#btnSound').addEventListener('click', () => { Sound.init(); Sound.setMute(!Sound.muted); refreshSoundBtn(); });
refreshSoundBtn();
