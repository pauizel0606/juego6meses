/* Música y efectos generados con Web Audio (sin archivos) */
const mf = m => 440 * Math.pow(2, (m - 69) / 12);

const Sound = {
  ctx: null, master: null, mus: null, fx: null,
  muted: (() => { try { return localStorage.getItem('pp6_mute') === '1'; } catch (e) { return false; } })(),
  want: null, style: null, timer: null, nextT: 0, stepN: 0,

  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended' && !this.held) this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const c = this.ctx = new AC();
    this.master = c.createGain(); this.master.gain.value = this.muted ? 0 : 0.9;
    const comp = c.createDynamicsCompressor();
    this.master.connect(comp); comp.connect(c.destination);
    this.mus = c.createGain(); this.mus.gain.value = 0.32; this.mus.connect(this.master);
    this.fx = c.createGain(); this.fx.gain.value = 0.6; this.fx.connect(this.master);
    if (this.want) this.music(this.want);
  },
  now() { return this.ctx ? this.ctx.currentTime : performance.now() / 1000; },
  setMute(m) {
    this.muted = m;
    try { localStorage.setItem('pp6_mute', m ? '1' : '0'); } catch (e) {}
    if (this.master) this.master.gain.setTargetAtTime(m ? 0 : 0.9, this.ctx.currentTime, 0.05);
  },
  hold() { this.held = true; if (this.ctx) this.ctx.suspend(); },
  release() { this.held = false; if (this.ctx) this.ctx.resume(); },

  tone(f, dur, o = {}) {
    if (!this.ctx) return null;
    const c = this.ctx, t = o.when != null ? o.when : c.currentTime;
    const osc = c.createOscillator(), g = c.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(f, t);
    if (o.slide) osc.frequency.exponentialRampToValueAtTime(o.slide, t + dur);
    const v = o.vol != null ? o.vol : 0.3, a = o.a || 0.01;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(o.dest || this.fx);
    osc.start(t); osc.stop(t + dur + 0.05);
    if (o.track) o.track.push(osc);
    return osc;
  },
  bell(m, when, vol = 0.3, dest, track) {
    const f = mf(m);
    this.tone(f, 1.1, { vol, when, dest, track });
    this.tone(f * 2, 0.5, { vol: vol * 0.25, when, dest, track });
    this.tone(f * 3, 0.25, { type: 'triangle', vol: vol * 0.06, when, dest, track });
  },

  // --- efectos ---
  click() { this.tone(760, 0.07, { vol: 0.12 }); },
  blip() { this.tone(1200 + Math.random() * 300, 0.03, { type: 'triangle', vol: 0.025 }); },
  jump(n) { this.tone(n === 2 ? 620 : 420, 0.2, { type: 'triangle', vol: 0.22, slide: n === 2 ? 1100 : 780 }); },
  coin(p = 0) {
    if (!this.ctx) return;
    const b = 880 * Math.pow(2, p / 12), t = this.ctx.currentTime;
    this.tone(b, 0.1, { type: 'square', vol: 0.05 });
    this.tone(b * 1.5, 0.28, { vol: 0.16, when: t + 0.06 });
  },
  hit() { this.tone(200, 0.35, { type: 'sawtooth', vol: 0.12, slide: 55 }); vib(70); },
  bark() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    for (const d of [0, 0.2]) { this.tone(900, 0.09, { type: 'square', vol: 0.07, slide: 420, when: t + d }); this.tone(1400, 0.07, { type: 'triangle', vol: 0.05, slide: 700, when: t + d }); }
  },
  wrong() { this.tone(230, 0.16, { type: 'square', vol: 0.05, slide: 180 }); },
  flip() { this.tone(480, 0.09, { type: 'triangle', vol: 0.14, slide: 820 }); },
  tick() { this.tone(660, 0.12, { vol: 0.22 }); },
  go() { this.tone(990, 0.4, { type: 'triangle', vol: 0.26 }); },
  win() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    [72, 76, 79, 84, 88].forEach((m, i) => this.bell(m, t + i * 0.11, 0.22));
    vib([30, 50, 30]);
  },
  pop() { this.tone(300 + Math.random() * 500, 0.25, { type: 'triangle', vol: 0.08, slide: 90 }); },

  // --- música ---
  music(style) {
    this.want = style;
    if (!style) { this.stopMusic(); return; }
    if (!this.ctx) return;
    this.style = style;
    if (!this.timer) {
      this.nextT = this.ctx.currentTime + 0.1; this.stepN = 0;
      this.timer = setInterval(() => this.sched(), 60);
    }
  },
  stopMusic() { clearInterval(this.timer); this.timer = null; },
  sched() {
    const c = this.ctx; if (!c || c.state !== 'running') return;
    const bpm = this.style === 'play' ? 116 : 76, st = 60 / bpm / 2;
    if (this.nextT < c.currentTime) this.nextT = c.currentTime + 0.05;
    while (this.nextT < c.currentTime + 0.25) { this.playStep(this.stepN, this.nextT, st); this.nextT += st; this.stepN++; }
  },
  playStep(i, t, st) {
    const prog = [[48, [60, 64, 67, 72]], [45, [57, 60, 64, 69]], [41, [57, 60, 65, 69]], [43, [55, 59, 62, 67]]];
    const [bass, ch] = prog[Math.floor(i / 8) % 4], s = i % 8, D = this.mus, play = this.style === 'play';
    if (s === 0) {
      this.tone(mf(bass), st * 7.5, { type: 'triangle', vol: 0.2, when: t, dest: D, a: 0.04 });
      for (const m of ch.slice(0, 3)) this.tone(mf(m), st * 8, { vol: 0.035, when: t, a: 0.5, dest: D });
    }
    if (play && s === 4) this.tone(mf(bass + 7), st * 3, { type: 'triangle', vol: 0.12, when: t, dest: D });
    const pat = [0, 1, 2, 3, 2, 1, 2, 3];
    this.tone(mf(ch[pat[s]] + 12), st * 1.8, { vol: s % 2 ? 0.045 : 0.07, when: t, dest: D });
    if (play && s % 4 === 0) this.tone(130, 0.14, { vol: 0.22, slide: 45, when: t, dest: D });
    if (play && s % 2 === 1) this.tone(5200, 0.03, { type: 'square', vol: 0.012, when: t, dest: D });
    if (!play && s === 6 && Math.random() < 0.45) this.bell(ch[Math.floor(Math.random() * 4)] + 24, t, 0.05, D);
  }
};
