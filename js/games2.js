/* Minijuegos nuevos: tarta, caracolas, eclipse, deseos, palabras y hamburguesas */

/* ============ La tarta de fresa (apilar capas) ============ */
const CAKE = [
  { c: '#f3cf94', d: '#d4a463' },
  { c: '#fff6ee', d: '#ecd8cb' },
  { c: '#ff6f8a', d: '#d9435f' }
];
class Stack extends GameBase {
  constructor() {
    super({ hint: { touch: 'Toca para soltar cada capa justo encima de la anterior', pc: 'ESPACIO o clic para soltar cada capa' }, endText: '¡Tarta de fresa lista! 🍓' });
    this.goal = 12; this.layers = [{ x: 0, w: 1, t: 0 }]; this.mist = 0; this.acc = 0; this.cam = 0;
    this.falls = []; this.mv = null; this.nextT = 0; this.progress = 0; this.cheer = 0;
  }
  resize() { this.baseY = Math.round(H * 0.8); this.lh = clamp(24 * S, 16, 30); this.bw = Math.min(W * 0.6, 300 * S); }
  amp() { return Math.min(1.3, W / (2 * this.bw)); }
  ly(i) { return this.baseY - (i + 1) * this.lh + this.cam; }
  onGo() { this.spawn(); }
  spawn() {
    const top = this.layers[this.layers.length - 1], n = this.layers.length;
    const left = Math.random() < 0.5;
    const A = this.amp(); this.mv = { x: left ? -A : A, w: top.w, dir: left ? 1 : -1, t: n % 3, sp: (0.8 + n * 0.07) * A / 1.3 + 0.15 };
  }
  down() { this.drop(); }
  key(k, d) { if (d && (k === 'Space' || k === 'Enter' || k === 'ArrowDown')) this.drop(); }
  drop() {
    if (!this.playing || !this.mv) return;
    const top = this.layers[this.layers.length - 1], mv = this.mv, dx = mv.x - top.x, n = this.layers.length;
    const cx0 = W / 2 + mv.x * this.bw, y = this.ly(n);
    this.mv = null; this.total += 3; this.nextT = 0.3;
    if (Math.abs(dx) < 0.04) {
      this.layers.push({ x: top.x, w: Math.min(1, top.w + 0.03), t: mv.t });
      this.hearts += 3; this.acc += 1; this.cheer = 1;
      Sound.coin(9); this.float(W / 2, y - 24 * S, '¡Perfecto!', '#ffd77a');
      this.parts.burst(W / 2 + top.x * this.bw, y, 12, { type: 'star', colors: ['#ffd77a', '#fff'], g: 100, size: 12 });
    } else {
      const ov = top.w - Math.abs(dx);
      if (ov <= 0.03) {
        this.mist++; Sound.wrong(); Engine.shake = 6 * S;
        this.falls.push({ x: cx0, w: mv.w * this.bw, t: mv.t, y, vy: 0, r: 0, vr: rand(-2, 2) });
        this.float(cx0, y - 24 * S, '¡Ups!', '#ffb3c1');
        return;
      }
      const nx = top.x + dx / 2, cw = Math.abs(dx);
      this.layers.push({ x: nx, w: ov, t: mv.t });
      const cutX = dx > 0 ? nx + ov / 2 + cw / 2 : nx - ov / 2 - cw / 2;
      this.falls.push({ x: W / 2 + cutX * this.bw, w: cw * this.bw, t: mv.t, y, vy: 0, r: 0, vr: dx > 0 ? 2.5 : -2.5 });
      const q = ov / top.w; this.acc += q; this.hearts += q > 0.8 ? 2 : 1;
      Sound.coin(Math.round(q * 6)); if (q > 0.8) this.cheer = 0.6;
    }
    if (this.layers.length - 1 >= this.goal) {
      this.nextT = 0; this.finish();
      this.parts.burst(W / 2, this.ly(this.layers.length - 1), 40, { colors: ['#ff4d7d', '#ffd77a', '#fff', '#3ccf6e'], up: 150, size: 15 });
    }
  }
  step(dt) {
    if (this.mv) {
      this.mv.x += this.mv.dir * this.mv.sp * dt;
      const A = this.amp(); if (Math.abs(this.mv.x) > A) { this.mv.x = Math.sign(this.mv.x) * A; this.mv.dir *= -1; }
    } else if (this.nextT > 0) { this.nextT -= dt; if (this.nextT <= 0) this.spawn(); }
    this.progress = (this.layers.length - 1) / this.goal;
    this.common(dt);
  }
  common(dt) {
    const target = Math.max(0, (this.layers.length + 1) * this.lh - (this.baseY - H * 0.42));
    this.cam = lerp(this.cam, target, Math.min(1, dt * 4));
    for (const f of this.falls) { f.vy += 1600 * S * dt; f.y += f.vy * dt; f.r += f.vr * dt; }
    this.falls = this.falls.filter(f => f.y < H + 100);
    this.cheer = Math.max(0, this.cheer - dt);
  }
  ending(dt) { this.common(dt); if (Math.random() < 0.1) this.parts.add({ x: W / 2 + rand(-60, 60) * S, y: this.ly(this.layers.length - 1), vy: -70 * S, life: 1.4, size: 14 * S, color: pick(['#ff4d7d', '#3ccf6e']) }); }
  result() { const avg = this.acc / (this.goal + this.mist * 0.5); return { stars: avg >= 0.85 ? 3 : avg >= 0.65 ? 2 : 1, hearts: this.hearts }; }
  drawLayer(c, cx, y, w, t) {
    const k = CAKE[t], h = this.lh;
    c.fillStyle = k.c; roundRect(c, cx - w / 2, y, w, h, Math.min(7 * S, w / 4)); c.fill();
    c.fillStyle = k.d; c.fillRect(cx - w / 2 + 3, y + h - 4 * S, Math.max(0, w - 6), 3 * S);
    if (t === 1) { c.fillStyle = k.c; for (let x = cx - w / 2 + 8 * S; x < cx + w / 2 - 6 * S; x += 15 * S) ell(c, x, y + h, 4 * S, 5 * S); }
    if (t === 2) { c.fillStyle = 'rgba(255,240,200,0.8)'; for (let x = cx - w / 2 + 10 * S; x < cx + w / 2 - 6 * S; x += 18 * S) ell(c, x, y + h * 0.45, 1.5 * S, 1.2 * S); }
  }
  draw(c) {
    const t = this.t;
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2a1640'); g.addColorStop(1, '#6a2f5e');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    // ventana con la Luna de Fresa
    const wx = W * 0.14, wy = 70, ww = clamp(130 * S, 80, 170), wh = ww * 1.1;
    c.fillStyle = '#1a0f3a'; roundRect(c, wx - ww / 2, wy, ww, wh, 10); c.fill();
    c.save(); roundRect(c, wx - ww / 2, wy, ww, wh, 10); c.clip();
    for (let i = 0; i < 14; i++) ell(c, wx - ww / 2 + ((i * 53) % ww), wy + ((i * 37) % wh), 1.2, 1.2, '#fff');
    glow(c, wx, wy + wh * 0.45, ww * 0.6, 'rgba(255,170,170,0.45)');
    ell(c, wx, wy + wh * 0.45, ww * 0.22, ww * 0.22, '#ffc4bf');
    c.restore();
    c.strokeStyle = '#8a5a7a'; c.lineWidth = 6; roundRect(c, wx - ww / 2, wy, ww, wh, 10); c.stroke();
    c.beginPath(); c.moveTo(wx, wy); c.lineTo(wx, wy + wh); c.moveTo(wx - ww / 2, wy + wh / 2); c.lineTo(wx + ww / 2, wy + wh / 2); c.stroke();
    // banderines
    for (let i = 0; i < 12; i++) {
      const x = W * 0.3 + i * (W * 0.7 / 12), y = 64 + Math.sin(i * 0.9) * 6;
      c.fillStyle = ['#ff6f91', '#ffd77a', '#3ccf6e', '#c77dff'][i % 4];
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + 18 * S, y); c.lineTo(x + 9 * S, y + 20 * S); c.fill();
    }
    // personajes
    const side = this.bw / 2 + 70 * S, sz = clamp(120 * S, 70, 160), happy = this.cheer > 0 || this.ended;
    if (W / 2 - side > 30) {
      drawChar(c, 'pau', W / 2 - side, this.baseY + 30 * S, sz, { happy, arms: happy ? 'up' : null });
      drawChar(c, 'paula', W / 2 + side, this.baseY + 30 * S, sz, { dir: -1, happy, arms: happy ? 'up' : null });
    }
    // mesa
    c.fillStyle = '#7a4a32'; c.fillRect(0, this.baseY + this.cam, W, H);
    c.fillStyle = '#9a6446'; c.fillRect(0, this.baseY + this.cam, W, 8 * S);
    ell(c, W / 2, this.baseY + this.cam + 2 * S, this.bw * 0.62, 10 * S, '#f4f0ff');
    drawChi(c, W - 46 * S, this.baseY + this.cam + 2, clamp(48 * S, 34, 60), { dir: -1, happy, hop: happy ? Math.abs(Math.sin(t * 9)) * 10 : 0 });
    // capas
    this.layers.forEach((L, i) => this.drawLayer(c, W / 2 + L.x * this.bw, this.ly(i), L.w * this.bw, L.t));
    for (const f of this.falls) { c.save(); c.translate(f.x, f.y + this.lh / 2); c.rotate(f.r); this.drawLayer(c, 0, -this.lh / 2, f.w, f.t); c.restore(); }
    if (this.mv) {
      const y = this.ly(this.layers.length), x = W / 2 + this.mv.x * this.bw;
      c.globalAlpha = 0.18; c.fillStyle = '#fff'; c.fillRect(x - this.mv.w * this.bw / 2, y + this.lh, this.mv.w * this.bw, this.baseY + this.cam - y);
      c.globalAlpha = 1; this.drawLayer(c, x, y, this.mv.w * this.bw, this.mv.t);
    }
    if (this.ended) {
      const top = this.layers[this.layers.length - 1], y = this.ly(this.layers.length - 1), x = W / 2 + top.x * this.bw, w = top.w * this.bw;
      for (let i = 0; i < 5; i++) drawHeart(c, x - w * 0.35 + i * w * 0.175, y - 2 * S, 16 * S, '#e8364f');
      txt(c, '6', x, y - 30 * S, 44 * S, '#ff8fab', { weight: 700, stroke: '#fff', lw: 5 });
      glow(c, x, y - 64 * S, 14 * S, 'rgba(255,220,120,0.9)'); ell(c, x, y - 62 * S, 3 * S, 6 * S, '#ffd23f');
    }
    this.drawFX(c); this.drawHUD(c);
  }
}

/* ============ Caracolas de verano (repetir la melodía) ============ */
const SHELLS = [
  { c: '#ff8fab', g: 'rgba(255,143,171,0.7)', m: 64 },
  { c: '#ffd166', g: 'rgba(255,209,102,0.7)', m: 67 },
  { c: '#7ee0ff', g: 'rgba(126,224,255,0.7)', m: 71 },
  { c: '#9dffb0', g: 'rgba(157,255,176,0.7)', m: 74 }
];
class Simon extends GameBase {
  constructor() {
    super({ hint: { touch: 'Escucha la melodía y repítela tocando las caracolas', pc: 'Escucha y repite (clic o teclas 1 2 3 4)' }, endText: '¡Qué oído tan bonito! 🐚' });
    this.goal = 7; this.seq = []; this.inp = 0; this.state = 'wait'; this.timer = 0; this.showI = 0; this.lit = [0, 0, 0, 0];
    this.mist = 0; this.progress = 0; this.total = 28; this.msg = '';
  }
  resize() {
    const s = this.s = Math.min(W * 0.34, H * 0.2, 170 * S);
    const cy = H * 0.46, gap = s * 0.62;
    this.pos = [[W / 2 - gap, cy - gap], [W / 2 + gap, cy - gap], [W / 2 - gap, cy + gap], [W / 2 + gap, cy + gap]];
  }
  onGo() { this.next(); }
  next() { this.seq.push(this.seq.length ? (this.seq[this.seq.length - 1] + randi(1, 3)) % 4 : randi(0, 3)); this.show(); }
  show() { this.state = 'show'; this.showI = 0; this.timer = 0.8; this.inp = 0; this.msg = 'Escucha…'; }
  light(i) { this.lit[i] = 1; Sound.bell(SHELLS[i].m, undefined, 0.32); }
  press(i) {
    if (!this.playing || this.state !== 'input') return;
    this.light(i);
    const [x, y] = this.pos[i];
    if (i === this.seq[this.inp]) {
      this.inp++;
      if (this.inp === this.seq.length) {
        this.hearts += this.seq.length; this.state = 'pause'; this.timer = 1;
        this.msg = ['¡Bien!', '¡Genial!', '¡Así se hace!', '¡Perfecto!'][randi(0, 3)];
        this.parts.burst(W / 2, H * 0.46, 14, { colors: ['#ff8fab', '#ffd166', '#7ee0ff', '#9dffb0'], size: 12, g: 100 });
      }
    } else {
      this.mist++; Sound.wrong(); Engine.shake = 6 * S; vib(60);
      this.state = 'retry'; this.timer = 1.3; this.msg = '¡Casi! Otra vez…';
      this.float(x, y - this.s * 0.5, '✗', '#ffb3c1');
    }
  }
  down(x, y) { this.pos.forEach(([px, py], i) => { if (Math.hypot(px - x, py - y) < this.s * 0.55) this.press(i); }); }
  key(k, d) { if (!d) return; const m = { Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3, Numpad1: 2, Numpad2: 3, Numpad4: 0, Numpad5: 1, KeyQ: 0, KeyW: 1, KeyA: 2, KeyS: 3 }; if (k in m) this.press(m[k]); }
  step(dt) {
    for (let i = 0; i < 4; i++) this.lit[i] = Math.max(0, this.lit[i] - dt * 3);
    this.progress = (this.seq.length - (this.state === 'pause' ? 0 : 1)) / this.goal;
    if (this.state === 'show') {
      this.timer -= dt;
      if (this.timer <= 0) {
        if (this.showI < this.seq.length) { this.light(this.seq[this.showI]); this.showI++; this.timer = Math.max(0.38, 0.68 - this.seq.length * 0.03); }
        else { this.state = 'input'; this.msg = '¡Tu turno!'; }
      }
    } else if (this.state === 'pause' || this.state === 'retry') {
      this.timer -= dt;
      if (this.timer <= 0) {
        if (this.state === 'retry') this.show();
        else if (this.seq.length >= this.goal) { this.progress = 1; this.finish(); }
        else this.next();
      }
    }
  }
  result() { return { stars: this.mist <= 1 ? 3 : this.mist <= 3 ? 2 : 1, hearts: this.hearts }; }
  hud(c, s) { txt(c, `Ronda ${Math.min(this.seq.length, this.goal)}/${this.goal}`, W / 2, 12 + 44 * s, 15 * s, 'rgba(255,255,255,0.85)'); }
  drawShell(c, x, y, s, k, lit) {
    c.save(); c.translate(x, y); const sc = 1 + lit * 0.1; c.scale(sc, sc);
    if (lit > 0.05) { c.globalAlpha = lit; glow(c, 0, 0, s * 0.95, k.g); c.globalAlpha = 1; }
    const r = s * 0.5, oy = s * 0.28, A0 = Math.PI * 1.08, A1 = Math.PI * 1.92, n = 7;
    c.beginPath(); c.moveTo(0, oy);
    for (let i = 0; i <= n; i++) {
      const a = lerp(A0, A1, i / n), px = Math.cos(a) * r * 1.25, py = oy + Math.sin(a) * r * 1.25;
      if (i === 0) c.lineTo(px, py);
      else { const am = lerp(A0, A1, (i - 0.5) / n); c.quadraticCurveTo(Math.cos(am) * r * 1.42, oy + Math.sin(am) * r * 1.42, px, py); }
    }
    c.closePath();
    const gr = c.createLinearGradient(0, -r, 0, oy);
    gr.addColorStop(0, lit > 0.05 ? '#ffffff' : k.c); gr.addColorStop(1, k.c);
    c.fillStyle = gr; c.fill();
    c.strokeStyle = 'rgba(80,40,60,0.25)'; c.lineWidth = 2;
    for (let i = 1; i < n; i++) { const a = lerp(A0, A1, i / n); c.beginPath(); c.moveTo(0, oy); c.lineTo(Math.cos(a) * r * 1.25, oy + Math.sin(a) * r * 1.25); c.stroke(); }
    c.fillStyle = k.c; roundRect(c, -r * 0.3, oy - r * 0.1, r * 0.6, r * 0.32, r * 0.1); c.fill();
    c.restore();
  }
  draw(c) {
    const t = this.t;
    Sky.draw(c, t, { top: '#0e1440', mid: '#2a2a6e', bot: '#5a3a7e', mx: W * 0.8, my: H * 0.13, mr: 34 * S, starH: 0.6 });
    // mar con reflejo
    const sea = H * 0.66;
    const g = c.createLinearGradient(0, sea, 0, H); g.addColorStop(0, '#1d2a6a'); g.addColorStop(1, '#2d3f8a');
    c.fillStyle = g; c.fillRect(0, sea, W, H - sea);
    for (let i = 0; i < 9; i++) {
      const y = sea + 6 + i * 10 * S, w = (60 - i * 4) * S * (1 + Math.sin(t * 2 + i) * 0.2);
      c.fillStyle = `rgba(255,240,200,${0.5 - i * 0.045})`; c.fillRect(W * 0.8 - w / 2, y, w, 2.5 * S);
    }
    // arena
    c.fillStyle = '#e8c48a'; c.beginPath(); c.moveTo(0, H);
    for (let x = 0; x <= W + 20; x += 20) c.lineTo(x, H * 0.84 + Math.sin(x / 90 + t * 0.8) * 4 * S);
    c.lineTo(W, H); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.5)';
    for (let x = 0; x < W; x += 30) ell(c, x + Math.sin(t + x) * 4, H * 0.84 + Math.sin(x / 90 + t * 0.8) * 4 * S - 2, 12 * S, 2 * S);
    const sz = clamp(90 * S, 60, 120), happy = this.state === 'pause' || this.ended;
    drawChar(c, 'pau', 40 * S + 20, H - 6, sz, { happy });
    drawChar(c, 'paula', W - 40 * S - 20, H - 6, sz, { dir: -1, happy });
    drawChi(c, 40 * S + 20 + sz * 0.5, H - 4, sz * 0.4, { happy, hop: happy ? Math.abs(Math.sin(t * 9)) * 10 : 0 });
    if (!this.started) { this.drawFX(c); return; }
    this.pos.forEach(([x, y], i) => this.drawShell(c, x, y, this.s, SHELLS[i], this.lit[i]));
    if (!isTouch) this.pos.forEach(([x, y], i) => txt(c, String(i + 1), x, y + this.s * 0.42, 13 * S, 'rgba(60,30,50,0.5)', { weight: 700 }));
    if (this.msg && this.cd <= 0 && !this.ended) txt(c, this.msg, W / 2, H * 0.46 + this.s * 1.35, clamp(22 * S, 16, 28), this.state === 'retry' ? '#ffb3c1' : '#fff', { weight: 700, stroke: 'rgba(20,10,50,0.6)', lw: 5 });
    this.drawFX(c); this.drawHUD(c);
  }
}

/* ============ El eclipse (12/08/2026) ============ */
class Eclipse extends GameBase {
  constructor() {
    super({ hint: { touch: 'Toca justo cuando la Luna tape el Sol', pc: 'ESPACIO o clic cuando la Luna tape el Sol' }, endText: '¡Eclipse total! 🌑' });
    this.rounds = 5; this.r = 0; this.state = 'move'; this.mt = 0; this.res = []; this.showT = 0; this.last = 0; this.progress = 0; this.total = 25;
    this.sp = [0.42, 0.55, 0.62, 0.7, 0.85];
  }
  resize() { this.sx = W / 2; this.sy = H * 0.38; this.R = clamp(Math.min(W, H) * 0.12, 36, 100); this.span = Math.min(W * 0.42, 360 * S); }
  moonPos() {
    if (this.ended) return [this.sx, this.sy];
    if (this.state === 'show') return this.frozen;
    const r = Math.min(this.r, 4), ph = this.mt * this.sp[r];
    const tri = 2 * Math.abs((ph % 2) - 1) - 1;
    let x = this.sx + tri * this.span, y = this.sy;
    if (r === 2) y += tri * this.span * 0.35;
    if (r >= 3) y += Math.sin(ph * Math.PI * 2) * this.R * 0.9;
    return [x, y];
  }
  down() { this.tap(); }
  key(k, d) { if (d && (k === 'Space' || k === 'Enter')) this.tap(); }
  tap() {
    if (!this.playing || this.state !== 'move') return;
    const [x, y] = this.moonPos(), d = Math.hypot(x - this.sx, y - this.sy);
    const pct = Math.round(clamp(1 - d / (2 * this.R), 0, 1) * 100);
    this.frozen = [x, y]; this.res.push(pct); this.last = pct; this.state = 'show'; this.showT = 0;
    this.hearts += pct >= 97 ? 5 : pct >= 85 ? 3 : pct >= 60 ? 1 : 0;
    if (pct >= 97) { Sound.win(); this.parts.burst(this.sx + this.R * 0.7, this.sy - this.R * 0.7, 20, { type: 'star', colors: ['#fff', '#fff3b0'], g: 0, size: 14 }); }
    else if (pct >= 60) Sound.coin(Math.round(pct / 12)); else Sound.wrong();
  }
  step(dt) {
    this.progress = this.res.length / this.rounds;
    if (this.state === 'move') this.mt += dt;
    else {
      this.showT += dt;
      if (this.showT > 2.2) {
        this.r++;
        if (this.r >= this.rounds) this.finish();
        else { this.state = 'move'; this.mt = rand(0, 1.5); }
      }
    }
  }
  result() { const avg = this.res.reduce((a, b) => a + b, 0) / Math.max(1, this.res.length); return { stars: avg >= 90 ? 3 : avg >= 75 ? 2 : 1, hearts: this.hearts, label: `corazones · ${Math.round(avg)}% de totalidad media` }; }
  hud(c, s) { txt(c, `Intento ${Math.min(this.r + 1, this.rounds)}/${this.rounds}`, W / 2, 12 + 44 * s, 15 * s, 'rgba(255,255,255,0.85)'); }
  draw(c) {
    const t = this.t, [mx, my] = this.moonPos(), R = this.R;
    const cov = clamp(1 - Math.hypot(mx - this.sx, my - this.sy) / (2 * R), 0, 1);
    const dark = this.ended ? 1 : Math.pow(cov, 2.2);
    const lc = (a, b) => Math.round(lerp(a, b, dark));
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, `rgb(${lc(80, 8)},${lc(150, 8)},${lc(235, 34)})`);
    g.addColorStop(1, `rgb(${lc(255, 60)},${lc(214, 30)},${lc(170, 80)})`);
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.fillStyle = '#fff';
    if (dark > 0.4) { c.globalAlpha = (dark - 0.4) / 0.6; for (const s of Sky.stars) c.fillRect(s.x * W, s.y * H * 0.7, s.r * 1.3, s.r * 1.3); c.globalAlpha = 1; }
    // Sol
    const total = cov > 0.96;
    if (!total) { glow(c, this.sx, this.sy, R * 3.2, `rgba(255,230,140,${0.6 * (1 - dark)})`); ell(c, this.sx, this.sy, R, R, '#fff2a8'); }
    else {
      // corona
      c.save(); c.translate(this.sx, this.sy);
      for (let i = 0; i < 24; i++) {
        const a = i / 24 * TAU + t * 0.05, l = R * (1.5 + 0.5 * Math.sin(i * 7.3 + t));
        const gr = c.createLinearGradient(0, 0, Math.cos(a) * l, Math.sin(a) * l);
        gr.addColorStop(0, 'rgba(255,255,255,0.7)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
        c.strokeStyle = gr; c.lineWidth = 3; c.beginPath(); c.moveTo(Math.cos(a) * R, Math.sin(a) * R); c.lineTo(Math.cos(a) * l, Math.sin(a) * l); c.stroke();
      }
      c.restore();
      glow(c, this.sx, this.sy, R * 2.2, 'rgba(230,240,255,0.55)');
    }
    // Luna
    ell(c, mx, my, R * 1.01, R * 1.01, '#15112a');
    c.strokeStyle = 'rgba(200,200,255,0.25)'; c.lineWidth = 1.5; c.beginPath(); c.arc(mx, my, R, 0, TAU); c.stroke();
    // anillo de diamante
    if ((this.state === 'show' && this.last >= 97) || this.ended) {
      const k = 1 + Math.sin(t * 6) * 0.3, dx = this.sx + R * 0.72, dy = this.sy - R * 0.72;
      glow(c, dx, dy, R * 0.6 * k, 'rgba(255,255,255,0.9)'); sparkle(c, dx, dy, R * 0.45 * k, '#fff');
    }
    // horizonte y personajes con gafas
    c.fillStyle = `rgb(${lc(60, 12)},${lc(110, 10)},${lc(70, 30)})`;
    c.beginPath(); c.moveTo(0, H);
    for (let x = 0; x <= W + 20; x += 20) c.lineTo(x, H * 0.83 + Math.sin(x / W * 5) * 12 * S);
    c.lineTo(W, H); c.fill();
    const sz = clamp(110 * S, 70, 140), bx = W / 2;
    drawChar(c, 'pau', bx - 32 * S, H * 0.86, sz, { glasses: true, tilt: -0.15, happy: this.ended, arms: this.ended ? 'up' : null });
    drawChar(c, 'paula', bx + 32 * S, H * 0.86, sz, { dir: -1, glasses: true, tilt: -0.15, happy: this.ended, arms: this.ended ? 'up' : null });
    drawChi(c, bx + 80 * S, H * 0.86, sz * 0.4, { dir: -1, happy: this.ended });
    if (this.state === 'show' && !this.ended) {
      const p = this.last, col = p >= 97 ? '#fff3b0' : p >= 85 ? '#ffd6e0' : '#c9c0e0';
      const lab = p >= 97 ? '¡TOTALIDAD!' : p >= 85 ? '¡Casi total!' : p >= 60 ? 'Eclipse parcial' : 'Uy, casi ni lo tapa';
      txt(c, `${p}%`, W / 2, this.sy + R * 1.9, 44 * S, col, { weight: 700, stroke: 'rgba(10,5,30,0.7)', lw: 6 });
      txt(c, lab, W / 2, this.sy + R * 1.9 + 38 * S, 20 * S, '#fff', { weight: 600, stroke: 'rgba(10,5,30,0.7)', lw: 5 });
    }
    if (this.ended) txt(c, '12 · 08 · 2026', W / 2, this.sy + R * 2.1, 22 * S, '#fff', { weight: 600, stroke: 'rgba(10,5,30,0.7)', lw: 5 });
    this.drawFX(c); this.drawHUD(c);
  }
}

/* ============ Estrellas fugaces (deseos) ============ */
class Wishes extends GameBase {
  constructor() {
    super({ hint: { touch: 'Toca o desliza el dedo sobre las estrellas fugaces', pc: 'Haz clic (o pasa con el botón pulsado) sobre las estrellas fugaces' }, endText: '¡Todos los deseos pedidos! ✨' });
    this.dur = 40; this.time = 0; this.stars = []; this.spawnT = 0.5; this.progress = 0; this.combo = 0;
  }
  spawn() {
    const fromLeft = Math.random() < 0.5, gold = Math.random() < 0.13;
    const sp = rand(260, 400) * S * (1 + this.time * 0.008);
    const a = rand(0.35, 0.7);
    const x = fromLeft ? rand(-40, W * 0.5) : rand(W * 0.5, W + 40), y = rand(-30, H * 0.25);
    this.stars.push({ x, y, vx: (fromLeft ? 1 : -1) * Math.cos(a) * sp, vy: Math.sin(a) * sp, gold, v: gold ? 3 : 1, dead: false });
    this.total += gold ? 3 : 1;
  }
  hit(x, y) {
    if (!this.playing) return;
    for (const s of this.stars) {
      if (s.dead) continue;
      if (Math.hypot(s.x - x, s.y - y) < Math.max(44 * S, 34)) {
        s.dead = true; this.hearts += s.v; this.combo++;
        Sound.bell(76 + (this.combo % 5) * 2 + (s.gold ? 7 : 0), undefined, 0.25);
        this.parts.burst(s.x, s.y, s.gold ? 16 : 9, { type: 'star', colors: s.gold ? ['#ffd77a', '#fff'] : ['#fff', '#cfe3ff', '#ffc2d4'], g: 40, size: 12 });
        this.float(clamp(s.x, 90, W - 90), s.y, pick(CONFIG.deseos), s.gold ? '#ffd77a' : '#fff');
      }
    }
  }
  down(x, y) { this.hit(x, y); }
  move(x, y) { if (Input.down) this.hit(x, y); }
  step(dt) {
    this.time += dt; this.progress = this.time / this.dur;
    if (this.time >= this.dur) { this.finish(); return; }
    this.spawnT -= dt;
    if (this.spawnT <= 0) { this.spawn(); this.spawnT = Math.max(0.42, 0.95 - this.time * 0.013); }
    for (const s of this.stars) {
      s.x += s.vx * dt; s.y += s.vy * dt;
      if (!s.dead && (s.y > H * 0.8 || s.x < -80 || s.x > W + 80)) { s.dead = true; this.combo = 0; }
    }
    this.stars = this.stars.filter(s => !s.dead);
  }
  result() { const r = this.total ? this.hearts / this.total : 1; return { stars: r >= 0.6 ? 3 : r >= 0.35 ? 2 : 1, hearts: this.hearts }; }
  draw(c) {
    const t = this.t;
    Sky.draw(c, t, { top: '#03031a', mid: '#13104a', bot: '#3a1d5e', moon: false, starH: 0.9 });
    c.save(); c.globalAlpha = 0.07; c.fillStyle = '#cfd8ff';
    c.beginPath(); c.ellipse(W * 0.55, H * 0.35, W * 0.7, H * 0.08, -0.5, 0, TAU); c.fill(); c.restore();
    for (const s of this.stars) {
      const len = 90 * S, n = Math.hypot(s.vx, s.vy), ux = s.vx / n, uy = s.vy / n;
      const gr = c.createLinearGradient(s.x, s.y, s.x - ux * len, s.y - uy * len);
      gr.addColorStop(0, s.gold ? 'rgba(255,215,120,1)' : 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      c.strokeStyle = gr; c.lineWidth = (s.gold ? 5 : 3.5) * S; c.lineCap = 'round';
      c.beginPath(); c.moveTo(s.x, s.y); c.lineTo(s.x - ux * len, s.y - uy * len); c.stroke();
      glow(c, s.x, s.y, 22 * S, s.gold ? 'rgba(255,215,120,0.8)' : 'rgba(220,235,255,0.8)');
      sparkle(c, s.x, s.y, (s.gold ? 11 : 8) * S, '#fff');
    }
    drawHill(c, H * 0.84, '#0d0a24', 16, 1.3);
    const sz = clamp(90 * S, 60, 120), bx = W * 0.5;
    drawChar(c, 'pau', bx - 24 * S, H * 0.88, sz, { tilt: -0.25, happy: this.combo >= 3 || this.ended });
    drawChar(c, 'paula', bx + 24 * S, H * 0.88, sz, { dir: -1, tilt: -0.25, happy: this.combo >= 3 || this.ended });
    drawChi(c, bx + 66 * S, H * 0.88, sz * 0.42, { dir: -1, happy: this.combo >= 3 || this.ended });
    this.drawFX(c); this.drawHUD(c);
  }
}

/* ============ Palabras secretas ============ */
class Words extends GameBase {
  constructor() {
    super({ hint: { touch: 'Toca las letras en orden para formar la palabra', pc: 'Toca las letras o escríbelas con el teclado' }, endText: '¡Palabras descubiertas! 💌' });
    this.wi = 0; this.mist = 0; this.hints = 0; this.progress = 0; this.busy = false;
    this.total = CONFIG.palabras.reduce((a, p) => a + p[0].length, 0);
    this.leaves = Array.from({ length: 22 }, () => ({ x: Math.random(), y: Math.random(), s: rand(8, 16), v: rand(20, 50), p: rand(0, TAU), c: pick(['#e8833a', '#d9542b', '#f2b134', '#b5452b']) }));
  }
  onGo() {
    const el = this.el = document.createElement('div'); el.className = 'words';
    el.innerHTML = `<div class="w-num"></div><div class="w-hint"></div><div class="w-slots"></div><div class="w-tiles"></div>
      <div class="w-btns"><button class="btn small" data-a="del">⌫ Borrar</button><button class="btn small" data-a="hint">💡 Pista</button></div>`;
    el.querySelector('[data-a=del]').onclick = () => this.del();
    el.querySelector('[data-a=hint]').onclick = () => this.hint();
    $('#layer').appendChild(el);
    this.load();
  }
  load() {
    const [word, hint] = CONFIG.palabras[this.wi];
    this.word = word.toUpperCase(); this.ans = []; this.wErr = 0;
    let letters = Array.from(this.word);
    do { for (let i = letters.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [letters[i], letters[j]] = [letters[j], letters[i]]; } }
    while (letters.join('') === this.word && this.word.length > 1);
    this.el.querySelector('.w-num').textContent = `Palabra ${this.wi + 1} de ${CONFIG.palabras.length}`;
    this.el.querySelector('.w-hint').textContent = hint;
    const slots = this.el.querySelector('.w-slots'); slots.innerHTML = '';
    this.slotEls = Array.from(this.word, () => { const d = document.createElement('div'); d.className = 'w-slot'; slots.appendChild(d); return d; });
    const tiles = this.el.querySelector('.w-tiles'); tiles.innerHTML = '';
    this.tiles = letters.map((ch, i) => {
      const b = document.createElement('button'); b.className = 'w-tile'; b.textContent = ch;
      b.addEventListener('pointerdown', e => { e.preventDefault(); this.pick(i); });
      tiles.appendChild(b); return { ch, el: b, used: false };
    });
    const n = this.word.length;
    this.el.style.setProperty('--tile', `min(${Math.floor(88 / Math.max(n, 5))}vw, 56px)`);
  }
  pick(i) {
    const tl = this.tiles[i];
    if (!this.playing || this.busy || Engine.paused || tl.used) return;
    Sound.init(); Sound.flip();
    tl.used = true; tl.el.classList.add('used'); this.ans.push(i);
    this.slotEls[this.ans.length - 1].textContent = tl.ch; this.slotEls[this.ans.length - 1].classList.add('full');
    if (this.ans.length === this.word.length) this.check();
  }
  del() {
    if (!this.playing || this.busy || !this.ans.length) return;
    Sound.click();
    const i = this.ans.pop(); this.tiles[i].used = false; this.tiles[i].el.classList.remove('used');
    const s = this.slotEls[this.ans.length]; s.textContent = ''; s.classList.remove('full', 'hinted');
  }
  hint() {
    if (!this.playing || this.busy) return;
    let k = 0; while (k < this.ans.length && this.tiles[this.ans[k]].ch === this.word[k]) k++;
    while (this.ans.length > k) this.del();
    if (k >= this.word.length) return;
    const i = this.tiles.findIndex(t => !t.used && t.ch === this.word[k]);
    if (i < 0) return;
    this.hints++; this.wErr++;
    this.pick(i); this.slotEls[k].classList.add('hinted');
  }
  check() {
    this.busy = true;
    const got = this.ans.map(i => this.tiles[i].ch).join('');
    if (got === this.word) {
      this.slotEls.forEach((s, i) => setTimeout(() => { s.classList.add('ok'); Sound.coin(i); }, i * 70));
      this.hearts += Math.max(1, this.word.length - this.wErr);
      const r = this.el.querySelector('.w-slots').getBoundingClientRect();
      this.parts.burst(r.left + r.width / 2, r.top + r.height / 2, 24, { colors: ['#ff4d7d', '#ffd77a', '#3ccf6e', '#fff'], size: 13 });
      setTimeout(() => {
        this.busy = false; this.wi++;
        this.progress = this.wi / CONFIG.palabras.length;
        if (this.wi >= CONFIG.palabras.length) { this.el.classList.add('fade'); this.finish(); }
        else this.load();
      }, 1400);
    } else {
      this.mist++; this.wErr++; Sound.wrong(); vib(60);
      this.el.querySelector('.w-slots').classList.add('shake');
      setTimeout(() => {
        this.el.querySelector('.w-slots').classList.remove('shake');
        this.busy = false; while (this.ans.length) this.del();
      }, 650);
    }
  }
  key(k, d) {
    if (!d || !this.el) return;
    if (k === 'Backspace') { this.del(); return; }
    const m = /^Key([A-Z])$/.exec(k); if (!m) return;
    const i = this.tiles.findIndex(t => !t.used && t.ch === m[1]); if (i >= 0) this.pick(i);
  }
  step() {}
  result() { const e = this.mist + this.hints; return { stars: e <= 1 ? 3 : e <= 4 ? 2 : 1, hearts: this.hearts }; }
  destroy() { if (this.el) this.el.remove(); this.el = null; }
  draw(c) {
    const t = this.t;
    Sky.draw(c, t, { top: '#140b2a', mid: '#3a1a3e', bot: '#7a3a3a', moon: false });
    for (const l of this.leaves) {
      const y = ((l.y * H + t * l.v * S) % (H + 40)) - 20, x = l.x * W + Math.sin(t + l.p) * 30 * S;
      c.save(); c.translate(x, y); c.rotate(t * 1.5 + l.p); c.fillStyle = l.c;
      c.beginPath(); c.ellipse(0, 0, l.s * S, l.s * 0.5 * S, 0, 0, TAU); c.fill(); c.restore();
    }
    drawHill(c, H * 0.88, '#1a0e22', 10, 2);
    if (!this.el || this.ended) {
      const sz = clamp(100 * S, 70, 130);
      drawChar(c, 'pau', W / 2 - 34 * S, H * 0.9, sz, { happy: this.ended, arms: this.ended ? 'up' : null });
      drawChar(c, 'paula', W / 2 + 34 * S, H * 0.9, sz, { dir: -1, happy: this.ended, arms: this.ended ? 'up' : null });
      drawChi(c, W / 2 + 84 * S, H * 0.9, sz * 0.4, { dir: -1, happy: this.ended });
    }
    this.drawFX(c); this.drawHUD(c);
  }
}

/* ============ Turno de noche: hamburguesas ============ */
const ING = {
  pan: { name: 'Pan', h: 0.2 },
  carne: { name: 'Carne', h: 0.16 },
  queso: { name: 'Queso', h: 0.07 },
  lechuga: { name: 'Lechuga', h: 0.08 },
  tomate: { name: 'Tomate', h: 0.07 },
  pepino: { name: 'Pepinillo', h: 0.05 },
  top: { name: 'Pan', h: 0.34 }
};
/* Dibuja una capa: (x, y) = centro de la base de la capa, w = ancho. Devuelve la altura. */
function drawIng(c, type, x, y, w) {
  const h = ING[type].h * w;
  if (type === 'pan') {
    c.fillStyle = '#e3a356'; roundRect(c, x - w / 2, y - h, w, h, h * 0.45); c.fill();
    c.fillStyle = '#f2c27e'; c.fillRect(x - w * 0.42, y - h, w * 0.84, h * 0.3);
  } else if (type === 'carne') {
    c.fillStyle = '#6b3a1f'; roundRect(c, x - w * 0.53, y - h, w * 1.06, h, h / 2); c.fill();
    c.strokeStyle = '#4a2512'; c.lineWidth = Math.max(1, w * 0.02);
    for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(x + i * w * 0.16 - w * 0.04, y - h * 0.75); c.lineTo(x + i * w * 0.16 + w * 0.04, y - h * 0.25); c.stroke(); }
  } else if (type === 'queso') {
    c.fillStyle = '#ffc928'; c.fillRect(x - w * 0.5, y - h, w, h);
    c.beginPath(); c.moveTo(x - w * 0.3, y); c.lineTo(x - w * 0.22, y + h * 1.6); c.lineTo(x - w * 0.14, y); c.fill();
    c.beginPath(); c.moveTo(x + w * 0.18, y); c.lineTo(x + w * 0.26, y + h * 1.3); c.lineTo(x + w * 0.34, y); c.fill();
  } else if (type === 'lechuga') {
    c.fillStyle = '#5cc34a'; c.beginPath(); c.moveTo(x - w * 0.55, y);
    for (let i = 0; i <= 8; i++) c.lineTo(x - w * 0.55 + i * w * 1.1 / 8, y - h * (i % 2 ? 1 : 0.35));
    c.lineTo(x + w * 0.55, y); c.closePath(); c.fill();
  } else if (type === 'tomate') {
    for (let i = -1; i <= 1; i++) { c.fillStyle = '#e8433a'; roundRect(c, x + i * w * 0.32 - w * 0.17, y - h, w * 0.34, h, h / 2); c.fill(); }
    c.fillStyle = 'rgba(255,200,180,0.6)'; for (let i = -1; i <= 1; i++) ell(c, x + i * w * 0.32, y - h / 2, w * 0.05, h * 0.2);
  } else if (type === 'pepino') {
    for (let i = -1; i <= 1; i++) ell(c, x + i * w * 0.3, y - h / 2, w * 0.12, h * 0.5, '#7a9a2e');
  } else if (type === 'top') {
    c.fillStyle = '#eba95a'; c.beginPath(); c.ellipse(x, y, w * 0.5, h, 0, Math.PI, TAU); c.fill();
    c.fillStyle = '#d58f42'; c.fillRect(x - w * 0.5, y - h * 0.12, w, h * 0.12);
    c.fillStyle = '#fff7e0';
    for (let i = 0; i < 7; i++) { const a = Math.PI + 0.35 + i * 0.4; c.beginPath(); c.ellipse(x + Math.cos(a) * w * 0.33, y + Math.sin(a) * h * 0.62, w * 0.03, w * 0.015, a, 0, TAU); c.fill(); }
  }
  return h;
}
function drawFries(c, x, y, s) {
  c.fillStyle = '#ffd23f';
  for (let i = -2; i <= 2; i++) { c.save(); c.translate(x + i * s * 0.12, y - s * 0.55); c.rotate(i * 0.12); c.fillRect(-s * 0.05, -s * 0.35, s * 0.1, s * 0.5); c.restore(); }
  c.fillStyle = '#e8283c'; c.beginPath(); c.moveTo(x - s * 0.38, y - s * 0.62); c.lineTo(x + s * 0.38, y - s * 0.62); c.lineTo(x + s * 0.3, y); c.lineTo(x - s * 0.3, y); c.closePath(); c.fill();
  drawHeart(c, x, y - s * 0.3, s * 0.3, '#ffd23f', false);
}
class Burger extends GameBase {
  constructor() {
    super({ hint: { touch: 'Toca los ingredientes en el orden del pedido (de abajo arriba)', pc: 'Clic en los ingredientes (o teclas 1-8) en el orden del pedido' }, endText: '¡Turno terminado! 🍔' });
    this.dur = 75; this.time = 0; this.orders = 0; this.lost = 0; this.mist = 0; this.placed = []; this.fries = false;
    this.order = null; this.nextT = 0; this.serveT = 0; this.flashB = -1; this.flashT = 0; this.progress = 0; this.drop = 0; this.msg = null; this.num = 100;
    this.buttons = ['pan', 'carne', 'queso', 'lechuga', 'tomate', 'pepino', 'fries', 'bin'];
  }
  resize() {
    const cols = W > H * 1.25 ? 8 : 4, rows = 8 / cols;
    const gap = 8, bw = Math.min((W - 20 - gap * (cols - 1)) / cols, 120), bh = Math.min(bw * 0.88, 92, H * 0.12);
    const totalW = cols * bw + (cols - 1) * gap, x0 = (W - totalW) / 2, y0 = H - 12 - rows * bh - (rows - 1) * gap;
    this.btn = this.buttons.map((k, i) => ({ k, x: x0 + (i % cols) * (bw + gap), y: y0 + Math.floor(i / cols) * (bh + gap), w: bw, h: bh }));
    this.trayY = y0 - 22; this.bw = Math.min(W * (W < H ? 0.5 : 0.36), 220, (this.trayY - H * 0.36) * 1.3);
    this.tkW = Math.min(W - 24, 380); this.tkX = (W - this.tkW) / 2; this.tkY = 64;
  }
  onGo() { this.newOrder(); }
  newOrder() {
    const pool = ['carne', 'queso', 'lechuga', 'tomate', 'pepino'];
    const n = randi(2, Math.min(5, 3 + Math.floor(this.orders / 3)));
    const mid = Array.from({ length: n }, () => pick(pool));
    if (!mid.includes('carne')) mid[randi(0, n - 1)] = 'carne';
    this.order = { recipe: ['pan', ...mid, 'top'], fries: Math.random() < 0.35, pat: Math.max(9, 15 - this.orders * 0.5) };
    this.order.left = this.order.pat; this.order.err = 0;
    this.placed = []; this.fries = false; this.num++;
  }
  press(k) {
    if (!this.playing || !this.order || this.serveT > 0) return;
    const bi = this.buttons.indexOf(k); this.flashB = bi; this.flashT = 0.15;
    if (k === 'bin') { this.placed = []; this.fries = false; Sound.pop(); return; }
    if (k === 'fries') {
      if (this.order.fries && !this.fries) { this.fries = true; Sound.coin(3); this.checkDone(); }
      else this.wrong(this.order.fries ? '¡Ya tiene patatas!' : '¡No ha pedido patatas!');
      return;
    }
    const need = this.order.recipe[this.placed.length];
    if (!need) { if (this.order.fries && !this.fries) this.wrong('¡Faltan las patatas! 🍟'); return; }
    const kk = (k === 'pan' && this.placed.length > 0) ? 'top' : k;
    if (kk === need) { this.placed.push(kk); this.drop = 1; Sound.coin(this.placed.length); this.checkDone(); }
    else this.wrong(need === 'top' ? '¡Ahora va el pan de arriba!' : '¡Ese no toca!');
  }
  wrong(m) { this.mist++; this.order.err++; Sound.wrong(); vib(50); this.msg = { s: m, t: 1.1, c: '#ffb3c1' }; }
  checkDone() {
    const o = this.order;
    if (this.placed.length < o.recipe.length) return;
    if (o.fries && !this.fries) { this.msg = { s: '¡Y las patatas! 🍟', t: 1.2, c: '#ffd77a' }; return; }
    const tip = o.left / o.pat > 0.55 ? 3 : o.left / o.pat > 0.25 ? 1 : 0;
    this.hearts += o.recipe.length - 2 + (o.fries ? 2 : 0) + tip; this.orders++;
    this.msg = { s: o.err === 0 ? (tip === 3 ? '¡Pedido perfecto! +propina' : '¡Pedido perfecto!') : '¡Pedido servido!', t: 1.2, c: '#ffd77a' };
    Sound.win(); this.serveT = 0.7;
    this.parts.burst(W / 2, this.trayY - this.bw * 0.4, 18, { colors: ['#ffd23f', '#e8283c', '#fff', '#3ccf6e'], size: 13, up: 120 });
  }
  down(x, y) { for (const b of this.btn) if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) this.press(b.k); }
  key(k, d) { if (!d) return; const m = /^(Digit|Numpad)([1-8])$/.exec(k); if (m) this.press(this.buttons[+m[2] - 1]); }
  step(dt) {
    this.time += dt; this.progress = this.time / this.dur;
    this.flashT = Math.max(0, this.flashT - dt); this.drop = Math.max(0, this.drop - dt * 6);
    if (this.msg) { this.msg.t -= dt; if (this.msg.t <= 0) this.msg = null; }
    if (this.time >= this.dur) { this.finish(); return; }
    if (this.serveT > 0) { this.serveT -= dt; if (this.serveT <= 0) this.newOrder(); return; }
    if (this.order) {
      this.order.left -= dt;
      if (this.order.left <= 0) { this.lost++; Sound.hit(); this.msg = { s: 'Se ha cansado de esperar… 😢', t: 1.3, c: '#c9c0e0' }; this.newOrder(); }
    }
  }
  result() { return { stars: this.orders >= 9 ? 3 : this.orders >= 5 ? 2 : 1, hearts: this.hearts, label: `corazones · ${this.orders} pedidos servidos` }; }
  draw(c) {
    const t = this.t;
    // cocina
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2b2340'); g.addColorStop(1, '#43355e');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.fillStyle = 'rgba(255,255,255,0.04)';
    for (let x = 0; x < W; x += 40) for (let y = 0; y < H; y += 40) if ((x + y) / 40 % 2 === 0) c.fillRect(x, y, 40, 40);
    // ventanita con la Luna del Cazador
    ell(c, W - 60 * S, H * 0.3, 26 * S, 26 * S, '#140f30'); drawMoon(c, W - 60 * S, H * 0.3, 16 * S, 1, 0.9);
    c.strokeStyle = '#8f88aa'; c.lineWidth = 4; c.beginPath(); c.arc(W - 60 * S, H * 0.3, 26 * S, 0, TAU); c.stroke();
    // mostrador
    c.fillStyle = '#c8c3d8'; c.fillRect(0, this.trayY, W, H - this.trayY);
    c.fillStyle = '#e8e4f2'; c.fillRect(0, this.trayY, W, 6);
    // personajes con gorra
    const sz = clamp(Math.min(H * 0.15, W * 0.3), 64, 140), side = this.bw / 2 + sz * 0.5;
    if (W / 2 - side > 10) {
      const happy = this.serveT > 0 || this.ended;
      drawChar(c, 'pau', W / 2 - side, this.trayY + sz * 0.25, sz, { cap: '#d62828', happy, arms: happy ? 'up' : null });
      drawChar(c, 'paula', W / 2 + side, this.trayY + sz * 0.25, sz, { dir: -1, cap: '#d62828', happy, arms: happy ? 'up' : null });
      c.fillStyle = '#c8c3d8'; c.fillRect(0, this.trayY + 6, W, H);
    }
    // bandeja + hamburguesa
    const tw = this.bw * 1.5;
    c.fillStyle = '#d62828'; roundRect(c, W / 2 - tw / 2, this.trayY - 8, tw, 12, 5); c.fill();
    let y = this.trayY - 8;
    const off = this.serveT > 0 ? (0.7 - this.serveT) * 600 * S : 0;
    c.save(); c.translate(0, -off); c.globalAlpha = this.serveT > 0 ? clamp(this.serveT / 0.7, 0, 1) : 1;
    this.placed.forEach((k, i) => { const dy = i === this.placed.length - 1 ? -this.drop * 30 * S : 0; y -= drawIng(c, k, W / 2, y + dy, this.bw) * 0.92; });
    if (this.fries) drawFries(c, W / 2 + tw * 0.38, this.trayY - 8, this.bw * 0.5);
    c.restore(); c.globalAlpha = 1;
    // ticket del pedido
    if (this.order && this.started) {
      const o = this.order, lines = o.recipe.length + (o.fries ? 1 : 0), lh = clamp(17 * S, 14, 20);
      const th = 44 + lines * lh, x = this.tkX, ty = this.tkY;
      c.fillStyle = '#fffdf6'; roundRect(c, x, ty, this.tkW, th, 10); c.fill();
      c.fillStyle = '#d62828'; roundRect(c, x, ty, this.tkW, 26, 10); c.fill(); c.fillRect(x, ty + 16, this.tkW, 10);
      txt(c, `PEDIDO #${this.num}  ·  🍔 ${this.orders} servidos`, x + 12, ty + 13, 13, '#fff', { align: 'left', weight: 700 });
      const pr = clamp(o.left / o.pat, 0, 1);
      c.fillStyle = 'rgba(255,255,255,0.35)'; roundRect(c, x + this.tkW - 110, ty + 8, 98, 10, 5); c.fill();
      c.fillStyle = pr > 0.5 ? '#3ccf6e' : pr > 0.25 ? '#ffd23f' : '#ff8f8f'; roundRect(c, x + this.tkW - 110, ty + 8, Math.max(10, 98 * pr), 10, 5); c.fill();
      // mini hamburguesa
      const mw = Math.min(70, this.tkW * 0.22); let my = ty + th - 12;
      o.recipe.forEach(k => { my -= drawIng(c, k, x + 16 + mw / 2, my, mw) * 0.92; });
      if (o.fries) drawFries(c, x + 16 + mw + 10, ty + th - 12, 28);
      // lista (de abajo arriba)
      const lx = x + 16 + mw + 44, list = [...o.recipe.map((k, i) => ({ k, i })), ...(o.fries ? [{ k: 'fries', i: -1 }] : [])];
      list.forEach((it, j) => {
        const done = it.k === 'fries' ? this.fries : it.i < this.placed.length, nextI = it.i === this.placed.length;
        const name = it.k === 'fries' ? '🍟 Patatas' : (it.i === 0 ? 'Pan (abajo)' : it.k === 'top' ? 'Pan (arriba)' : ING[it.k].name);
        txt(c, `${done ? '✓' : nextI ? '➜' : '·'} ${name}`, lx, ty + 36 + (lines - 1 - j) * lh, lh * 0.82, done ? '#3a9a5a' : nextI ? '#d62828' : '#6a5a6a', { align: 'left', weight: nextI ? 700 : 500 });
      });
    }
    // botones
    for (let i = 0; i < this.btn.length; i++) {
      const b = this.btn[i], fl = this.flashB === i && this.flashT > 0;
      c.fillStyle = b.k === 'bin' ? '#5a5070' : fl ? '#fff3c4' : '#fffaf2';
      roundRect(c, b.x, b.y + (fl ? 2 : 0), b.w, b.h, 12); c.fill();
      c.strokeStyle = b.k === 'bin' ? '#3a3050' : '#e0c9a6'; c.lineWidth = 2; c.stroke();
      const cx2 = b.x + b.w / 2, iw = Math.min(b.w * 0.55, b.h * 0.9);
      if (b.k === 'fries') drawFries(c, cx2, b.y + b.h * 0.68, iw * 0.9);
      else if (b.k === 'bin') txt(c, '🗑️', cx2, b.y + b.h * 0.45, b.h * 0.38, '#fff');
      else { const ih = ING[b.k === 'pan' ? 'top' : b.k].h * iw; if (b.k === 'pan') drawIng(c, 'top', cx2, b.y + b.h * 0.52, iw); else drawIng(c, b.k, cx2, b.y + b.h * 0.42 + ih / 2, iw); }
      const lab = b.k === 'fries' ? 'Patatas' : b.k === 'bin' ? 'Tirar' : ING[b.k].name;
      txt(c, lab, cx2, b.y + b.h - 11, clamp(b.h * 0.17, 10, 14), b.k === 'bin' ? '#fff' : '#6a4a3a', { weight: 600 });
      if (!isTouch) txt(c, String(i + 1), b.x + 10, b.y + 11, 10, b.k === 'bin' ? '#ccc' : '#b09a8a', { weight: 600 });
    }
    if (this.msg) { c.globalAlpha = clamp(this.msg.t * 2, 0, 1); txt(c, this.msg.s, W / 2, this.trayY - this.bw * 0.95 - 10, clamp(20 * S, 15, 26), this.msg.c, { weight: 700, stroke: 'rgba(30,15,40,0.75)', lw: 5 }); c.globalAlpha = 1; }
    this.drawFX(c); this.drawHUD(c);
  }
}

/* Tabla de juegos por nombre (ver CHAPTERS[i].game en story.js) */
const GAME_CLASSES = { Runner, Catch, Constel, Memory, Plane, Rhythm, Stack, Simon, Eclipse, Wishes, Words, Burger };
const GAMES = CHAPTERS.map(ch => GAME_CLASSES[ch.game]);
