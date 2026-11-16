/* Los seis minijuegos */

class GameBase {
  constructor(o) {
    this.o = o || {}; this.t = 0; this.started = false; this.cd = 0; this.lastN = 4;
    this.ended = false; this.endT = 0; this.resolved = false;
    this.parts = new Particles(); this.hearts = 0; this.total = 0; this.fl = []; this.progress = null; this.done = null;
  }
  begin() { this.started = true; this.cd = 3.6; this.lastN = 4; }
  get playing() { return this.started && this.cd <= 0 && !this.ended; }
  update(dt) {
    this.t += dt; this.parts.update(dt);
    for (const f of this.fl) { f.y -= 45 * S * dt; f.life -= dt; }
    if (this.fl.length) this.fl = this.fl.filter(f => f.life > 0);
    if (this.started && this.cd > 0) {
      this.cd -= dt;
      const n = Math.max(0, Math.ceil(this.cd - 0.6));
      if (n !== this.lastN) { this.lastN = n; n > 0 ? Sound.tick() : Sound.go(); }
      if (this.cd <= 0 && this.onGo) this.onGo();
    }
    if (this.playing) this.step(dt);
    else if (this.ended) {
      this.endT += dt; if (this.ending) this.ending(dt);
      if (this.endT > (this.o.endWait || 3) && !this.resolved) { this.resolved = true; this.done && this.done(this.result()); }
    } else if (this.idle) this.idle(dt);
  }
  finish() { if (this.ended) return; this.ended = true; this.endT = 0; Sound.win(); }
  float(x, y, s, color) { this.fl.push({ x, y, s, color: color || '#fff', life: 1.1 }); }
  starsFrom(r) { return r >= 0.75 ? 3 : r >= 0.45 ? 2 : 1; }
  result() { const r = this.total ? this.hearts / this.total : 1; return { stars: this.starsFrom(r), hearts: this.hearts }; }
  drawHUD(c) {
    if (!this.started) return;
    const s = clamp(S, 0.75, 1.2), x = 12, y = 12;
    c.fillStyle = 'rgba(20,10,45,0.5)'; roundRect(c, x, y, 100 * s, 40 * s, 20 * s); c.fill();
    drawHeart(c, x + 21 * s, y + 21 * s, 26 * s, '#ff4d7d');
    txt(c, String(this.hearts), x + 42 * s, y + 21 * s, 21 * s, '#fff', { align: 'left', weight: 700 });
    if (this.progress != null) {
      const bw = Math.min(W - 260 * s, 300), bx = (W - bw) / 2, by = y + 14 * s, bh = 12 * s;
      if (bw > 60) {
        c.fillStyle = 'rgba(255,255,255,0.18)'; roundRect(c, bx, by, bw, bh, bh / 2); c.fill();
        const g = c.createLinearGradient(bx, 0, bx + bw, 0); g.addColorStop(0, '#ff8fab'); g.addColorStop(1, '#ff2d6a');
        c.fillStyle = g; roundRect(c, bx, by, Math.max(bh, bw * clamp(this.progress, 0, 1)), bh, bh / 2); c.fill();
        drawHeart(c, bx + bw + 4 * s, by + bh / 2, 22 * s, this.progress >= 1 ? '#ff2d6a' : '#ffc2d4');
      }
    }
    if (this.hud) this.hud(c, s);
  }
  drawFX(c) {
    this.parts.draw(c);
    for (const f of this.fl) {
      c.globalAlpha = clamp(f.life, 0, 1);
      txt(c, f.s, f.x, f.y, 22 * S, f.color, { weight: 700, stroke: 'rgba(50,10,40,0.7)', lw: 5 });
    }
    c.globalAlpha = 1;
    if (this.started && this.cd > 0) {
      const v = this.cd - 0.6, n = Math.ceil(v), fr = v - Math.floor(v);
      const str = n > 0 ? String(n) : '¡Ya!';
      txt(c, str, W / 2, H * 0.4, (n > 0 ? 96 : 76) * S * (0.85 + fr * 0.4), '#fff', { weight: 700, stroke: '#ff3d75', lw: 9 * S });
      const h = this.o.hint; if (h) {
        const str2 = isTouch ? h.touch : h.pc, fs = clamp(17 * S, 14, 22);
        c.font = `600 ${fs}px ${FONT}`;
        const tw = Math.min(c.measureText(str2).width, W - 40);
        c.fillStyle = 'rgba(20,10,45,0.65)'; roundRect(c, W / 2 - tw / 2 - 18, H * 0.58 - fs, tw + 36, fs * 2, fs); c.fill();
        txt(c, str2, W / 2, H * 0.58, fs, '#ffe3ec');
      }
    }
    if (this.ended) {
      const k = Math.min(1, this.endT * 2.2), sc = easeOutBack(k);
      const et = this.o.endText || '¡Lo lograste!';
      let fs = Math.min(56 * S, W / 9);
      c.font = `700 ${fs}px ${FONT}`; const tw = c.measureText(et).width;
      if (tw > W * 0.9) fs *= W * 0.9 / tw;
      txt(c, et, W / 2, H * 0.3, fs * sc, '#fff', { weight: 700, stroke: this.o.endStroke || '#ff3d75', lw: 9 * S });
    }
  }
}

/* ============ LUNA 1 · Carrera por la ciudad ============ */
class Runner extends GameBase {
  constructor() {
    super({ hint: { touch: 'Toca para saltar · ¡toca otra vez en el aire = doble salto!', pc: 'ESPACIO / ↑ / clic para saltar · ¡doble salto!' }, endText: '¡Por fin juntos!' });
    this.dist = 0; this.goal = 17500; this.mul = 1; this.py = 0; this.vy = 0; this.jumps = 0; this.inv = 0;
    this.obs = []; this.items = []; this.nextObs = 1300; this.nextItem = 700; this.met = false; this.progress = 0;
    this.cy = 0; this.cvy = 0; this.cJumpT = -1;
    this.bld = []; let x = 0;
    while (x < 2600) { const w = rand(80, 180), h = rand(150, 400); this.bld.push({ x, w, h, win: Array.from({ length: 60 }, () => Math.random() < 0.33) }); x += w + rand(10, 40); }
    this.cityLen = x;
  }
  resize() { this.gy = Math.round(H * (W < H ? 0.7 : 0.8)); this.px = Math.max(60, W * 0.18); }
  sx(wx) { return this.px + (wx - this.dist) * S; }
  jump() {
    if (!this.playing || this.jumps >= 2) return;
    this.vy = this.jumps === 0 ? 1000 : 900; this.jumps++; this.cJumpT = 0.14;
    Sound.jump(this.jumps);
    this.parts.burst(this.px, this.gy - this.py * S, 5, { type: 'spark', color: '#fff', max: 120, g: 0, life: 0.5, size: 10 });
  }
  down() { this.jump(); }
  key(k, d) { if (d && (k === 'Space' || k === 'ArrowUp' || k === 'KeyW')) this.jump(); }
  spawnObs(wx) {
    const r = Math.random();
    let o;
    if (this.dist > 2500 && r < 0.24) o = { type: 'bird', wx, y: rand(140, 170), w: 34, h: 22, vx: -90 };
    else if (r < 0.5) o = { type: 'box', wx, y: 0, w: 42, h: 42 };
    else if (r < 0.74) o = { type: 'puddle', wx, y: 0, w: 76, h: 10 };
    else o = { type: 'bench', wx, y: 0, w: 84, h: 36 };
    this.obs.push(o);
  }
  spawnItems(wx) {
    const pat = randi(0, 2), n = randi(3, 5);
    for (let i = 0; i < n; i++) {
      const y = pat === 0 ? 60 : pat === 1 ? 70 + Math.sin(i / (n - 1) * Math.PI) * 120 : 190;
      const gold = i === Math.floor(n / 2) && Math.random() < 0.18;
      this.items.push({ wx: wx + i * 55, y, got: false, ph: Math.random() * TAU, v: gold ? 5 : 1 });
      this.total += gold ? 5 : 1;
    }
  }
  step(dt) {
    this.mul = Math.min(1, this.mul + dt * 0.55);
    const sp = (380 + Math.min(this.dist * 0.011, 200)) * this.mul;
    this.dist += sp * dt;
    this.progress = this.dist / this.goal;
    this.vy -= 2900 * dt; this.py += this.vy * dt;
    if (this.py <= 0) { this.py = 0; this.vy = 0; this.jumps = 0; }
    this.inv = Math.max(0, this.inv - dt);
    this.chiStep(dt);
    const ahead = this.dist + W / S + 150;
    if (this.dist < this.goal - 2400)
      while (this.nextObs < ahead) { this.spawnObs(this.nextObs); this.nextObs += rand(560, 960) - Math.min(this.dist * 0.008, 160); }
    while (this.nextItem < ahead && this.nextItem < this.goal - 500) { this.spawnItems(this.nextItem); this.nextItem += rand(420, 700); }
    // colisiones
    const L = this.dist - 15, R = this.dist + 15, B = this.py, T = this.py + 92;
    for (const o of this.obs) {
      if (o.type === 'bird') o.wx += o.vx * dt;
      if (o.hit || this.inv > 0) continue;
      if (R > o.wx - o.w / 2 && L < o.wx + o.w / 2 && T > o.y && B < o.y + o.h) {
        o.hit = true; this.inv = 1.3; this.mul = 0.3;
        const lost = Math.min(this.hearts, 3); this.hearts -= lost;
        Engine.shake = 10 * S; Sound.hit();
        this.float(this.px, this.gy - 130 * S, lost ? `-${lost} 💔` : '¡Ay!', '#ffb3c1');
        if (o.type === 'puddle') this.parts.burst(this.px, this.gy, 10, { type: 'spark', color: '#8fd0ff', up: 200, g: 800 });
      }
    }
    for (const it of this.items) {
      if (it.got) continue;
      if (Math.abs(it.wx - this.dist) < 30 && Math.abs(it.y - (this.py + 50)) < 58) {
        it.got = true; this.hearts += it.v; Sound.coin(it.v > 1 ? 9 : this.hearts % 5);
        this.parts.burst(this.sx(it.wx), this.gy - it.y * S, it.v > 1 ? 14 : 6, { colors: it.v > 1 ? ['#ffd77a', '#fff3b0', '#fff'] : ['#ff4d7d', '#ff8fab', '#ffd6e0'], size: 10, type: it.v > 1 ? 'star' : 'heart' });
        if (it.v > 1) this.float(this.sx(it.wx), this.gy - it.y * S - 20 * S, '+5 ✨', '#ffd77a');
      }
    }
    this.obs = this.obs.filter(o => o.wx > this.dist - 300);
    this.items = this.items.filter(i => i.wx > this.dist - 300 && !i.got);
    if (this.dist > this.goal - 70) this.dist = this.goal - 70;
    if (this.dist >= this.goal - 70 && this.py === 0) {
      this.dist = this.goal - 70; this.met = true; this.finish();
      this.parts.burst(this.px + 35 * S, this.gy - 110 * S, 30, { colors: ['#ff4d7d', '#ff8fab', '#fff'], up: 150, size: 16 });
    }
  }
  chiStep(dt) {
    if (this.cJumpT > 0) { this.cJumpT -= dt; if (this.cJumpT <= 0) this.cvy = 820; }
    this.cvy -= 2900 * dt; this.cy += this.cvy * dt;
    if (this.cy <= 0) { this.cy = 0; this.cvy = 0; }
  }
  ending(dt) {
    this.chiStep(dt);
    if (this.cy === 0 && Math.random() < 0.03) this.cvy = 500;
    if (Math.random() < 0.15) this.parts.add({ x: this.px + 35 * S + rand(-20, 20) * S, y: this.gy - 120 * S, vy: -80 * S, vx: rand(-30, 30) * S, life: 1.5, size: rand(10, 18) * S, color: pick(['#ff4d7d', '#ff8fab']) });
  }
  draw(c) {
    const t = this.t;
    Sky.draw(c, t, { mx: W * 0.78, my: H * 0.16, bot: '#7a3470' });
    // ciudad lejana
    const f = 0.25, off = (this.dist * f) % this.cityLen, k0 = S * 0.9;
    for (let rep = 0; rep * this.cityLen * k0 < W + this.cityLen * k0; rep++) {
      for (const b of this.bld) {
        const x = (b.x - off + rep * this.cityLen) * k0;
        if (x > W || x + b.w * k0 < 0) continue;
        const bh = b.h * k0;
        c.fillStyle = '#251a46'; c.fillRect(x, this.gy - bh, b.w * k0, bh);
        const cols = Math.floor(b.w / 24), rows = Math.floor(b.h / 30);
        c.fillStyle = 'rgba(255,215,122,0.75)';
        for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++)
          if (b.win[(r * cols + q) % 60]) c.fillRect(x + (8 + q * 24) * k0, this.gy - bh + (12 + r * 30) * k0, 9 * k0, 12 * k0);
      }
    }
    // farolas
    const lampGap = 460, first = Math.floor((this.dist - this.px / S) / lampGap);
    for (let i = first; i < first + W / S / lampGap + 2; i++) {
      const x = this.sx(i * lampGap);
      c.strokeStyle = '#1a1230'; c.lineWidth = 5 * S; c.beginPath(); c.moveTo(x, this.gy); c.lineTo(x, this.gy - 170 * S); c.lineTo(x + 18 * S, this.gy - 175 * S); c.stroke();
      glow(c, x + 20 * S, this.gy - 168 * S, 70 * S, 'rgba(255,214,140,0.35)');
      ell(c, x + 20 * S, this.gy - 168 * S, 7 * S, 5 * S, '#ffe9b0');
    }
    // suelo
    c.fillStyle = '#2e2150'; c.fillRect(0, this.gy, W, H - this.gy);
    c.fillStyle = '#5b3f86'; c.fillRect(0, this.gy, W, 5 * S);
    c.strokeStyle = 'rgba(255,255,255,0.08)'; c.lineWidth = 2;
    const tg = 70, ofs = (this.dist % tg) * S;
    for (let x = -ofs; x < W; x += tg * S) { c.beginPath(); c.moveTo(x, this.gy + 5 * S); c.lineTo(x - 20 * S, H); c.stroke(); }
    // corazones
    for (const it of this.items) {
      const x = this.sx(it.wx); if (x < -40 || x > W + 40) continue;
      const y = this.gy - it.y * S + Math.sin(t * 4 + it.ph) * 5 * S;
      if (it.v > 1) { glow(c, x, y, 36 * S, 'rgba(255,215,90,0.55)'); drawHeart(c, x, y, 34 * S, '#ffc23d'); sparkle(c, x + 12 * S, y - 12 * S, 6 * S * (1 + Math.sin(t * 8) * 0.4), '#fff'); }
      else { glow(c, x, y, 26 * S, 'rgba(255,80,130,0.35)'); drawHeart(c, x, y, 28 * S, '#ff4d7d'); }
    }
    // obstáculos
    for (const o of this.obs) {
      const x = this.sx(o.wx); if (x < -100 || x > W + 100) continue;
      const w = o.w * S, h = o.h * S, y = this.gy - o.y * S;
      c.globalAlpha = o.hit ? 0.5 : 1;
      if (o.type === 'box') {
        c.fillStyle = '#c48a52'; c.fillRect(x - w / 2, y - h, w, h);
        c.fillStyle = '#a06c3c'; c.fillRect(x - w / 2, y - h, w, h * 0.16); c.fillRect(x - 3 * S, y - h, 6 * S, h);
        drawHeart(c, x + w * 0.22, y - h * 0.4, 12 * S, '#e8364f', false);
      } else if (o.type === 'puddle') {
        ell(c, x, y - 2 * S, w / 2, 7 * S, 'rgba(110,180,255,0.75)'); ell(c, x - w * 0.15, y - 4 * S, w * 0.2, 2 * S, 'rgba(255,255,255,0.5)');
      } else if (o.type === 'bench') {
        c.fillStyle = '#7a4b2a'; c.fillRect(x - w / 2, y - h, w, 7 * S); c.fillRect(x - w / 2, y - h * 0.55, w, 7 * S);
        c.fillStyle = '#3a2a2a'; c.fillRect(x - w / 2 + 6 * S, y - h * 0.5, 5 * S, h * 0.5); c.fillRect(x + w / 2 - 11 * S, y - h * 0.5, 5 * S, h * 0.5);
      } else {
        const fl = Math.sin(t * 16) * 8 * S, by = y - h / 2;
        ell(c, x, by, 17 * S, 10 * S, '#9aa3b8'); ell(c, x - 15 * S, by - 4 * S, 7 * S, 7 * S, '#8790a6');
        ell(c, x - 18 * S, by - 5 * S, 1.6 * S, 1.6 * S, '#111');
        c.fillStyle = '#f3a43b'; c.beginPath(); c.moveTo(x - 22 * S, by - 4 * S); c.lineTo(x - 28 * S, by - 2 * S); c.lineTo(x - 22 * S, by - 1 * S); c.fill();
        c.fillStyle = '#7b8399'; c.beginPath(); c.moveTo(x - 4 * S, by); c.lineTo(x + 8 * S, by - 14 * S - fl); c.lineTo(x + 12 * S, by); c.fill();
      }
      c.globalAlpha = 1;
    }
    // Paula esperando
    const pxl = this.sx(this.goal);
    if (pxl < W + 80) drawChar(c, 'paula', pxl, this.gy, 112 * S, { dir: -1, arms: this.met ? 'up' : 'wave', happy: this.met });
    // el chiwawa le sigue
    drawChi(c, this.px - 62 * S, this.gy - this.cy * S, 46 * S, { hop: this.playing && this.cy === 0 ? Math.abs(Math.sin(t * 14)) * 5 : 0, happy: this.met, noShadow: this.cy > 0 });
    // Pau
    const blink = this.inv > 0 && Math.floor(this.t * 14) % 2 === 0;
    drawChar(c, 'pau', this.px, this.gy - this.py * S, 110 * S, {
      run: this.playing && this.py === 0, jump: this.py > 0, arms: this.met ? 'up' : null, happy: this.met, alpha: blink ? 0.4 : 1, noShadow: this.py > 0
    });
    if (this.py > 0) ell(c, this.px, this.gy, 18 * S * (1 - Math.min(0.6, this.py / 300)), 4 * S, 'rgba(0,0,0,0.2)');
    this.drawFX(c); this.drawHUD(c);
  }
}

/* ============ LUNA 2 · Lluvia de mariposas ============ */
class Catch extends GameBase {
  constructor() {
    super({ hint: { touch: 'Arrastra el dedo para mover a Paula', pc: '← → / A D o el ratón para mover a Paula' }, endText: '¡Tarro lleno de amor!' });
    this.dur = 45; this.time = 0; this.items = []; this.spawnT = 1; this.stun = 0; this.combo = 0; this.progress = 0;
    this.x = W / 2; this.tx = W / 2; this.dir = 1; this.pauX = -80;
    this.flowers = Array.from({ length: 26 }, () => ({ x: Math.random(), h: rand(20, 60), c: pick(['#ff8fab', '#ffd77a', '#c7a0ff', '#ff6f91', '#9fe3ff']), p: rand(0, TAU) }));
    this.flies = Array.from({ length: 18 }, () => ({ x: Math.random(), y: rand(0.45, 0.85), p: rand(0, TAU), s: rand(0.3, 0.8) }));
  }
  resize() { this.gy = Math.round(H * 0.9); this.ch = clamp(118 * S, 80, 150); this.x = clamp(this.x, 30, W - 30); this.tx = clamp(this.tx, 30, W - 30); }
  down(x) { this.tx = x; }
  move(x) { if (Input.down || !isTouch) this.tx = x; }
  jar() { return { x: this.x, y: this.gy - this.ch * 1.1 }; }
  result() { const r = this.total ? this.hearts / this.total : 1; return { stars: r >= 0.6 ? 3 : r >= 0.35 ? 2 : 1, hearts: this.hearts }; }
  spawn() {
    const r = Math.random(), x = rand(30 * S, W - 30 * S);
    let it;
    if (r < 0.48) it = { type: 'heart', v: 1, vy: rand(170, 230) };
    else if (r < 0.7) it = { type: 'fly', v: 3, vy: rand(105, 140), amp: rand(35, 70), f: rand(2, 3.5), col: pick(['#9fe3ff', '#ffd77a', '#c7a0ff', '#ff9fd0']) };
    else if (r < 0.77) it = { type: 'letter', v: 5, vy: rand(250, 290) };
    else it = { type: 'storm', v: -3, vy: rand(220, 290) + this.time * 2 };
    it.x = it.x0 = x; it.y = -30; it.t = rand(0, 5); it.done = false;
    if (it.v > 0) this.total += it.v;
    this.items.push(it);
  }
  step(dt) {
    this.time += dt; this.progress = this.time / this.dur;
    if (this.time >= this.dur) { this.finish(); return; }
    const k = Input.keys, d = (k.ArrowRight || k.KeyD ? 1 : 0) - (k.ArrowLeft || k.KeyA ? 1 : 0);
    if (d) this.tx = this.x + d * 120 * S;
    this.tx = clamp(this.tx, 30 * S, W - 30 * S);
    this.stun = Math.max(0, this.stun - dt);
    const nx = lerp(this.x, this.tx, Math.min(1, dt * (this.stun > 0 ? 2 : 11)));
    if (Math.abs(nx - this.x) > 0.5) this.dir = nx > this.x ? 1 : -1;
    this.x = nx;
    this.spawnT -= dt;
    if (this.spawnT <= 0) { this.spawn(); this.spawnT = Math.max(0.3, 0.8 - this.time * 0.011); }
    const j = this.jar();
    for (const it of this.items) {
      if (it.done) continue;
      it.t += dt; it.y += it.vy * S * dt;
      if (it.type === 'fly') it.x = clamp(it.x0 + Math.sin(it.t * it.f) * it.amp * S, 15, W - 15);
      if (Math.abs(it.x - j.x) < 40 * S && Math.abs(it.y - j.y) < 28 * S) this.catchIt(it);
      else if (it.y > H + 40) { it.done = true; if (it.v > 0) this.combo = 0; }
    }
    this.items = this.items.filter(i => !i.done);
  }
  catchIt(it) {
    it.done = true;
    const j = this.jar();
    if (it.v > 0) {
      this.combo++;
      const bonus = this.combo % 8 === 0 ? 3 : 0;
      this.hearts += it.v + bonus;
      Sound.coin(it.v === 1 ? 0 : it.v === 3 ? 4 : 7);
      this.parts.burst(j.x, j.y, 8, { colors: it.type === 'fly' ? [it.col, '#fff'] : ['#ff4d7d', '#ffd77a', '#fff'], type: it.type === 'heart' ? 'heart' : 'star', size: 12 });
      this.float(j.x, j.y - 30 * S, `+${it.v}` + (bonus ? ` ¡combo x${this.combo}!` : ''), it.v >= 5 ? '#ffd77a' : '#fff');
    } else {
      this.combo = 0; const lost = Math.min(3, this.hearts); this.hearts -= lost; this.stun = 0.8;
      Sound.hit(); Engine.shake = 8 * S;
      this.parts.burst(j.x, j.y, 12, { type: 'spark', color: '#8fd0ff', g: 600, up: 100 });
      this.float(j.x, j.y - 30 * S, lost ? `-${lost} ⛈️` : '⛈️', '#9fd0ff');
    }
  }
  ending(dt) {
    for (const it of this.items) it.y += it.vy * S * dt;
    this.pauX = lerp(this.pauX, this.x - 70 * S * (this.x > W / 2 ? 1 : -1), Math.min(1, dt * 2));
    if (Math.random() < 0.12) this.parts.add({ x: this.x + rand(-30, 30) * S, y: this.gy - this.ch, vy: -60 * S, vx: rand(-40, 40) * S, life: 1.6, size: 14 * S, color: '#ff6f91' });
  }
  drawFly(c, x, y, s, col, t) {
    const fl = Math.abs(Math.sin(t * 14));
    c.fillStyle = col;
    c.beginPath(); c.ellipse(x - 6 * s * fl, y - 3 * s, 8 * s * fl + 1, 9 * s, -0.4, 0, TAU); c.fill();
    c.beginPath(); c.ellipse(x + 6 * s * fl, y - 3 * s, 8 * s * fl + 1, 9 * s, 0.4, 0, TAU); c.fill();
    c.globalAlpha *= 0.8;
    c.beginPath(); c.ellipse(x - 5 * s * fl, y + 6 * s, 5 * s * fl + 1, 6 * s, 0.3, 0, TAU); c.fill();
    c.beginPath(); c.ellipse(x + 5 * s * fl, y + 6 * s, 5 * s * fl + 1, 6 * s, -0.3, 0, TAU); c.fill();
    c.globalAlpha = 1;
    ell(c, x, y + 1 * s, 2 * s, 9 * s, '#3a2440');
  }
  draw(c) {
    const t = this.t;
    Sky.draw(c, t, { top: '#130f3a', mid: '#3a2368', bot: '#9a4a7e', mx: W * 0.15, my: H * 0.14 });
    drawHill(c, H * 0.8, '#2a1b4d', 22, 1);
    drawHill(c, H * 0.86, '#1d1338', 14, 3);
    for (const f of this.flies) {
      const x = (f.x * W + Math.sin(t * f.s + f.p) * 40 * S), y = f.y * H + Math.cos(t * f.s * 1.3 + f.p) * 20 * S;
      c.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(t * 2 + f.p));
      glow(c, x, y, 9 * S, 'rgba(255,240,150,0.9)');
    }
    c.globalAlpha = 1;
    for (const f of this.flowers) {
      const x = f.x * W, by = this.gy + 6 * S, tp = by - f.h * S, sw = Math.sin(t * 1.5 + f.p) * 4 * S;
      c.strokeStyle = '#3d7a5a'; c.lineWidth = 2.5 * S; c.beginPath(); c.moveTo(x, by); c.quadraticCurveTo(x, tp + 10 * S, x + sw, tp); c.stroke();
      for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + t * 0.2; ell(c, x + sw + Math.cos(a) * 5 * S, tp + Math.sin(a) * 5 * S, 4.5 * S, 4.5 * S, f.c); }
      ell(c, x + sw, tp, 3 * S, 3 * S, '#fff3b0');
    }
    c.fillStyle = '#160e2c'; c.fillRect(0, this.gy + 4 * S, W, H);
    // objetos
    for (const it of this.items) {
      if (it.type === 'heart') { glow(c, it.x, it.y, 22 * S, 'rgba(255,80,130,0.35)'); drawHeart(c, it.x, it.y, 28 * S, '#ff4d7d'); }
      else if (it.type === 'fly') this.drawFly(c, it.x, it.y, 1.15 * S, it.col, it.t);
      else if (it.type === 'letter') {
        glow(c, it.x, it.y, 34 * S, 'rgba(255,215,90,0.5)');
        c.save(); c.translate(it.x, it.y); c.rotate(Math.sin(it.t * 3) * 0.25);
        c.fillStyle = '#ffd77a'; c.fillRect(-16 * S, -11 * S, 32 * S, 22 * S);
        c.strokeStyle = '#c99a2e'; c.lineWidth = 2 * S; c.beginPath(); c.moveTo(-16 * S, -11 * S); c.lineTo(0, 2 * S); c.lineTo(16 * S, -11 * S); c.stroke();
        drawHeart(c, 0, 3 * S, 10 * S, '#e8364f', false); c.restore();
      } else {
        ell(c, it.x - 12 * S, it.y - 14 * S, 14 * S, 11 * S, '#5d6688'); ell(c, it.x + 10 * S, it.y - 15 * S, 16 * S, 13 * S, '#5d6688'); ell(c, it.x, it.y - 22 * S, 13 * S, 12 * S, '#6a7499');
        c.fillStyle = '#7cc0ff';
        for (let i = -1; i <= 1; i++) { c.beginPath(); const dx = it.x + i * 11 * S, dy = it.y + 3 * S + (i === 0 ? 6 * S : 0); c.moveTo(dx, dy - 6 * S); c.quadraticCurveTo(dx + 5 * S, dy + 4 * S, dx, dy + 5 * S); c.quadraticCurveTo(dx - 5 * S, dy + 4 * S, dx, dy - 6 * S); c.fill(); }
        if (Math.sin(it.t * 9) > 0.85) { c.strokeStyle = '#fff59a'; c.lineWidth = 2.5 * S; c.beginPath(); c.moveTo(it.x + 2 * S, it.y - 10 * S); c.lineTo(it.x - 5 * S, it.y + 4 * S); c.lineTo(it.x + 3 * S, it.y + 4 * S); c.lineTo(it.x - 3 * S, it.y + 16 * S); c.stroke(); }
      }
    }
    drawChi(c, W - 40 * S, this.gy + 2 * S, 44 * S, { dir: -1, happy: this.ended, hop: this.ended ? Math.abs(Math.sin(t * 8)) * 12 : 0 });
    if (this.ended || this.pauX > -60) drawChar(c, 'pau', this.pauX, this.gy, this.ch * 0.95, { happy: true, arms: 'up', dir: this.pauX < this.x ? 1 : -1 });
    // Paula + tarro
    const blink = this.stun > 0 && Math.floor(t * 12) % 2 === 0;
    drawChar(c, 'paula', this.x, this.gy, this.ch, { arms: 'hold', dir: this.dir, happy: this.ended, alpha: blink ? 0.5 : 1, run: this.playing && Math.abs(this.tx - this.x) > 8 });
    const j = this.jar(), js = this.ch / 118;
    const fill = clamp(this.hearts / Math.max(30, this.total * 0.8), 0, 1);
    c.save(); c.translate(j.x, j.y + 6 * js);
    c.fillStyle = 'rgba(200,235,255,0.25)'; roundRect(c, -24 * js, -22 * js, 48 * js, 40 * js, 10 * js); c.fill();
    if (fill > 0) {
      c.save(); roundRect(c, -24 * js, -22 * js, 48 * js, 40 * js, 10 * js); c.clip();
      const g = c.createLinearGradient(0, 18 * js, 0, -22 * js); g.addColorStop(0, '#ff4d7d'); g.addColorStop(1, '#ffb3c8');
      c.fillStyle = g; c.fillRect(-24 * js, 18 * js - 40 * js * fill, 48 * js, 40 * js * fill);
      c.fillStyle = 'rgba(255,255,255,0.8)';
      for (let i = 0; i < 6; i++) sparkle(c, Math.sin(t * 2 + i * 2) * 15 * js, 14 * js - (i * 7 % 30) * js * fill, 2.5 * js, '#fff');
      c.restore();
    }
    c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = 2.5 * js; roundRect(c, -24 * js, -22 * js, 48 * js, 40 * js, 10 * js); c.stroke();
    c.fillStyle = '#c99a6a'; roundRect(c, -20 * js, -29 * js, 40 * js, 8 * js, 3 * js); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(-17 * js, -15 * js, 4 * js, 22 * js);
    c.restore();
    this.drawFX(c); this.drawHUD(c);
  }
}

/* ============ LUNA 3 · Constelaciones ============ */
function normPts(pts, deco = []) {
  const all = pts.concat(deco);
  const xs = all.map(p => p[0]), ys = all.map(p => p[1]);
  const mx = Math.min(...xs), Mx = Math.max(...xs), my = Math.min(...ys), My = Math.max(...ys);
  const sc = Math.max(Mx - mx, My - my);
  const ox = (1 - (Mx - mx) / sc) / 2, oy = (1 - (My - my) / sc) / 2;
  return all.map(([x, y]) => ({ x: ox + (x - mx) / sc, y: oy + (y - my) / sc }));
}
const FIGURES = (() => {
  const heart = [];
  for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; heart.push([16 * Math.pow(Math.sin(a), 3), -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a))]); }
  const star = [];
  for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i / 5 * TAU; star.push([Math.cos(a), Math.sin(a)]); }
  const inf = [];
  for (let i = 0; i < 12; i++) { const a = (i + 0.5) / 12 * TAU, d = 1 + Math.sin(a) * Math.sin(a); inf.push([Math.cos(a) / d, Math.sin(a) * Math.cos(a) / d]); }
  const chiP = [[0.50, 0.30], [0.64, 0.31], [0.97, 0.0], [0.95, 0.24], [0.86, 0.48], [0.80, 0.70], [0.64, 0.86], [0.50, 0.92],
    [0.36, 0.86], [0.20, 0.70], [0.14, 0.48], [0.05, 0.24], [0.03, 0.0], [0.36, 0.31]];
  const chiAll = normPts(chiP, [[0.37, 0.56], [0.63, 0.56], [0.5, 0.74]]);
  const chi = { name: '¿Un chiwawa?', msg: '¡Porque tú eres mi chiwawa! 💚', pts: chiAll.slice(0, 14), deco: chiAll.slice(14), green: true,
    order: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 0] };
  const house = [[0.15, 1], [0.15, 0.45], [0.5, 0.08], [0.85, 0.45], [0.85, 1], [0.6, 1], [0.6, 0.7], [0.4, 0.7], [0.4, 1]];
  return [
    { name: 'Corazón', msg: 'Lo que siento por ti, escrito en el cielo.', pts: normPts(heart), order: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0] },
    { name: 'Estrella', msg: 'Brillas incluso en mis días más nublados.', pts: normPts(star), order: [0, 2, 4, 1, 3, 0] },
    { name: 'Infinito', msg: 'Así de largo quiero que sea lo nuestro.', pts: normPts(inf), order: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0] },
    { name: 'Nuestro hogar', msg: 'Algún día, nuestra casita. Juntos.', pts: normPts(house), order: [0, 1, 2, 3, 4, 5, 6, 7, 8, 0] },
    chi
  ];
})();

class Constel extends GameBase {
  constructor() {
    super({ hint: { touch: 'Toca las estrellas en orden: 1, 2, 3…', pc: 'Haz clic en las estrellas en orden: 1, 2, 3…' }, endText: '¡Porque eres mi chiwawa! 💚', endStroke: '#1f9a4d', endWait: 4.5 });
    this.fi = 0; this.stepI = 0; this.mist = 0; this.doneT = -1; this.progress = 0; this.hover = null;
    this.total = FIGURES.reduce((a, f) => a + f.order.length - 1, 0);
    this.bg = Array.from({ length: 60 }, () => ({ x: Math.random(), y: Math.random() * 0.75, r: rand(0.8, 2), p: rand(0, TAU) }));
    this.shoot = null;
  }
  resize() {
    const top = 70, bottom = H * 0.8;
    this.size = Math.min(W * 0.78, (bottom - top) * 0.9, 520);
    this.ox = (W - this.size) / 2; this.oy = top + (bottom - top - this.size) / 2;
  }
  get fig() { return FIGURES[this.fi]; }
  pos(i) { const p = this.fig.pts[i]; return { x: this.ox + p.x * this.size, y: this.oy + p.y * this.size }; }
  down(x, y) {
    this.hover = { x, y };
    if (!this.playing || this.doneT >= 0) return;
    const f = this.fig, R = Math.max(30 * S, 26);
    let best = -1, bd = R;
    f.pts.forEach((p, i) => { const q = this.pos(i), d = Math.hypot(q.x - x, q.y - y); if (d < bd) { bd = d; best = i; } });
    if (best < 0) return;
    const target = f.order[this.stepI === 0 ? 0 : this.stepI];
    if (this.stepI === 0) {
      if (best === f.order[0]) { this.stepI = 1; Sound.coin(0); const q = this.pos(best); this.parts.burst(q.x, q.y, 6, { type: 'star', color: '#fff3b0', g: 0, size: 10 }); }
      else this.wrong(best);
      return;
    }
    if (best === target) {
      this.stepI++; this.hearts++;
      const q = this.pos(best);
      Sound.coin(Math.min(12, this.stepI));
      this.parts.burst(q.x, q.y, 8, { type: 'star', colors: ['#fff3b0', '#ffc2d4'], g: 0, size: 12 });
      if (this.stepI >= f.order.length) {
        this.doneT = 0; Sound.win(); if (f.green) Sound.bark();
        this.parts.burst(W / 2, this.oy + this.size / 2, f.green ? 50 : 30, { colors: f.green ? ['#3ccf6e', '#7dffa8', '#fff'] : ['#ff4d7d', '#ffd77a', '#fff'], g: 60, size: 14 });
      }
    } else if (best !== f.order[this.stepI - 1]) this.wrong(best);
  }
  wrong(i) { this.mist++; Sound.wrong(); const q = this.pos(i); this.float(q.x, q.y - 20 * S, '✗', '#ffb3c1'); }
  move(x, y) { this.hover = { x, y }; }
  step(dt) {
    this.progress = (this.fi + (this.stepI / this.fig.order.length)) / FIGURES.length;
    if (this.doneT >= 0) {
      this.doneT += dt;
      if (this.doneT > 2.8) {
        if (this.fi < FIGURES.length - 1) { this.fi++; this.stepI = 0; this.doneT = -1; }
        else { this.progress = 1; this.finish(); }
      }
    }
    if (!this.shoot && Math.random() < dt * 0.15) this.shoot = { x: rand(0, W), y: rand(0, H * 0.3), l: 0 };
    if (this.shoot) { this.shoot.l += dt; if (this.shoot.l > 1) this.shoot = null; }
  }
  result() { return { stars: this.mist <= 2 ? 3 : this.mist <= 6 ? 2 : 1, hearts: this.hearts }; }
  hud(c, s) { txt(c, `${Math.min(this.fi + 1, FIGURES.length)}/${FIGURES.length}`, W / 2, 12 + 44 * s, 15 * s, 'rgba(255,255,255,0.8)'); }
  draw(c) {
    const t = this.t;
    Sky.draw(c, t, { top: '#070620', mid: '#1b1450', bot: '#3c2466', moon: true, mx: W * 0.88, my: H * 0.1, mr: 26 * S, starA: 0.7 });
    for (const b of this.bg) { c.globalAlpha = 0.3 + 0.5 * Math.abs(Math.sin(t + b.p)); ell(c, b.x * W, b.y * H, b.r, b.r, '#cfd8ff'); }
    c.globalAlpha = 1;
    if (this.shoot) {
      const s = this.shoot, x = s.x + s.l * 300 * S, y = s.y + s.l * 120 * S;
      const g = c.createLinearGradient(x, y, x - 80 * S, y - 32 * S); g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      c.strokeStyle = g; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 80 * S, y - 32 * S); c.stroke();
    }
    drawHill(c, H * 0.86, '#120c2a', 18, 2);
    // Pau y Paula mirando el cielo
    const bx = W < H ? W * 0.5 : W * 0.15, gy = H * 0.86 + 6 * S, sz = clamp(84 * S, 55, 110);
    drawChar(c, 'pau', bx - 20 * S, gy, sz, { tilt: -0.2, happy: this.doneT >= 0 || this.ended });
    drawChar(c, 'paula', bx + 20 * S, gy, sz, { dir: -1, tilt: -0.2, happy: this.doneT >= 0 || this.ended });
    const chiParty = (this.doneT >= 0 && this.fig.green) || this.ended;
    drawChi(c, bx + 52 * S, gy + 2, sz * 0.42, { dir: -1, happy: chiParty, hop: chiParty ? Math.abs(Math.sin(t * 8)) * 14 : 0 });
    if (!this.started) { this.drawFX(c); return; }
    if (this.ended) {
      // todas las figuras en miniatura
      FIGURES.forEach((f, k) => {
        const n = FIGURES.length, big = !!f.green;
        const sz2 = Math.min(W / (n + 1.5), H / 6), cxk = W / 2 + (k - (n - 1) / 2) * sz2 * 1.15, cy = H * 0.5;
        c.strokeStyle = big ? '#7dffa8' : 'rgba(255,215,150,0.85)'; c.lineWidth = big ? 3 : 2; c.beginPath();
        f.order.forEach((pi, j) => { const p = f.pts[pi], x = cxk - sz2 / 2 + p.x * sz2, y = cy - sz2 / 2 + p.y * sz2; j ? c.lineTo(x, y) : c.moveTo(x, y); });
        c.stroke();
        if (f.deco) for (const p of f.deco) sparkle(c, cxk - sz2 / 2 + p.x * sz2, cy - sz2 / 2 + p.y * sz2, 5, '#7dffa8');
      });
      this.drawFX(c); this.drawHUD(c); return;
    }
    const f = this.fig;
    // líneas hechas
    if (this.stepI > 1) {
      c.lineCap = 'round'; c.lineJoin = 'round';
      const path = () => { c.beginPath(); for (let j = 0; j < this.stepI; j++) { const q = this.pos(f.order[j]); j ? c.lineTo(q.x, q.y) : c.moveTo(q.x, q.y); } };
      if (this.doneT >= 0) {
        path(); c.fillStyle = f.green ? `rgba(80,220,130,${Math.min(0.28, this.doneT * 0.3)})` : `rgba(255,90,140,${Math.min(0.28, this.doneT * 0.3)})`; c.fill();
      }
      const gr = f.green && this.doneT >= 0;
      path(); c.strokeStyle = gr ? 'rgba(120,255,170,0.4)' : 'rgba(255,150,190,0.35)'; c.lineWidth = 10 * S; c.stroke();
      path(); c.strokeStyle = gr ? '#c8ffd9' : '#ffe9b0'; c.lineWidth = 2.6 * S; c.stroke();
      if (f.deco && this.doneT >= 0) {
        c.globalAlpha = clamp(this.doneT * 2, 0, 1);
        f.deco.forEach((p, i) => {
          const x = this.ox + p.x * this.size, y = this.oy + p.y * this.size;
          glow(c, x, y, 24 * S, 'rgba(140,255,180,0.6)');
          if (i < 2) sparkle(c, x, y, 11 * S, '#ffffff'); else ell(c, x, y, 9 * S, 6 * S, '#e8fff0');
        });
        c.globalAlpha = 1;
      }
    }
    // línea guía
    if (this.stepI > 0 && this.doneT < 0 && this.hover && (Input.down || !isTouch)) {
      const q = this.pos(f.order[this.stepI - 1]);
      c.setLineDash([6 * S, 8 * S]); c.strokeStyle = 'rgba(255,233,176,0.5)'; c.lineWidth = 2 * S;
      c.beginPath(); c.moveTo(q.x, q.y); c.lineTo(this.hover.x, this.hover.y); c.stroke(); c.setLineDash([]);
    }
    // estrellas
    const next = this.doneT < 0 ? f.order[this.stepI] : -1;
    const firstNum = {}; f.order.forEach((pi, j) => { if (!(pi in firstNum)) firstNum[pi] = j + 1; });
    f.pts.forEach((p, i) => {
      const q = this.pos(i), isNext = i === next;
      const pulse = isNext ? 1 + 0.35 * Math.sin(t * 6) : 1;
      glow(c, q.x, q.y, 22 * S * pulse, isNext ? 'rgba(255,220,140,0.6)' : 'rgba(200,210,255,0.35)');
      sparkle(c, q.x, q.y, 9 * S * pulse, isNext ? '#fff3b0' : '#ffffff');
      txt(c, String(firstNum[i]), q.x + 14 * S, q.y - 14 * S, 13 * S, 'rgba(255,255,255,0.75)', { weight: 500 });
    });
    if (this.doneT >= 0) {
      const k = easeOutBack(Math.min(1, this.doneT * 2));
      txt(c, `✨ ${f.name} ✨`, W / 2, this.oy - 6 * S + this.size + 18 * S, 34 * S * k, '#ffe3ec', { weight: 700, stroke: '#7a2a5a', lw: 6 });
      c.globalAlpha = clamp(this.doneT * 2 - 0.6, 0, 1);
      txt(c, f.msg, W / 2, this.oy + this.size + 52 * S, clamp(18 * S, 14, 22), '#fff');
      c.globalAlpha = 1;
    }
    this.drawFX(c); this.drawHUD(c);
  }
}

/* ============ LUNA 4 · La caja de recuerdos (memoria) ============ */
class Memory extends GameBase {
  constructor() {
    super({ hint: { touch: 'Toca dos cartas para buscar parejas', pc: 'Haz clic en dos cartas para buscar parejas' }, endText: '¡Recuerdos a salvo!' });
    this.moves = 0; this.pairs = 0; this.first = null; this.lock = false;
    this.floatH = Array.from({ length: 16 }, () => ({ x: Math.random(), y: Math.random(), s: rand(10, 26), v: rand(10, 30), c: pick(['rgba(255,77,125,0.25)', 'rgba(255,190,210,0.2)', 'rgba(200,150,255,0.2)']) }));
  }
  onGo() {
    const el = this.el = document.createElement('div'); el.className = 'memory';
    const grid = document.createElement('div'); grid.className = 'grid';
    const deck = [];
    CONFIG.memoria.forEach((p, i) => { deck.push(i, i); });
    for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
    for (const k of deck) {
      const card = document.createElement('div'); card.className = 'mcard'; card.dataset.k = k;
      card.innerHTML = `<div class="in"><div class="f">♥</div><div class="b">${CONFIG.memoria[k][0]}</div></div>`;
      card.addEventListener('pointerdown', e => { e.preventDefault(); this.pick(card); });
      grid.appendChild(card);
    }
    const msg = this.msgEl = document.createElement('div'); msg.className = 'msg'; msg.textContent = 'Encuentra las 8 parejas 💞';
    el.appendChild(grid); el.appendChild(msg);
    $('#layer').appendChild(el);
  }
  pick(card) {
    if (!this.playing || Engine.paused || this.lock || card.classList.contains('flip') || card.classList.contains('ok')) return;
    Sound.init(); Sound.flip(); card.classList.add('flip');
    if (!this.first) { this.first = card; return; }
    this.moves++;
    const a = this.first, b = card; this.first = null;
    if (a.dataset.k === b.dataset.k) {
      setTimeout(() => {
        a.classList.add('ok'); b.classList.add('ok'); this.pairs++; this.hearts += 3; Sound.coin(this.pairs);
        const r = b.getBoundingClientRect();
        this.parts.burst(r.left + r.width / 2, r.top + r.height / 2, 10, { colors: ['#ff4d7d', '#ffd77a', '#fff'], size: 12 });
        this.msgEl.textContent = CONFIG.memoria[+a.dataset.k][0] + ' ' + CONFIG.memoria[+a.dataset.k][1];
        if (this.pairs === CONFIG.memoria.length) setTimeout(() => { if (this.el) this.el.classList.add('fade'); this.finish(); }, 900);
      }, 300);
    } else {
      this.lock = true;
      setTimeout(() => { a.classList.add('shake'); b.classList.add('shake'); Sound.wrong(); }, 450);
      setTimeout(() => { a.classList.remove('flip', 'shake'); b.classList.remove('flip', 'shake'); this.lock = false; }, 950);
    }
  }
  step() { this.progress = this.pairs / CONFIG.memoria.length; }
  result() { return { stars: this.moves <= 13 ? 3 : this.moves <= 19 ? 2 : 1, hearts: this.hearts }; }
  hud(c, s) { txt(c, `Movimientos: ${this.moves}`, W / 2, 12 + 44 * s, 15 * s, 'rgba(255,255,255,0.85)'); }
  destroy() { if (this.el) this.el.remove(); this.el = null; }
  draw(c) {
    const t = this.t;
    Sky.draw(c, t, { top: '#1a0f36', mid: '#3d1f5c', bot: '#7a3a6e', moon: false });
    for (const h of this.floatH) {
      const y = ((h.y * H - t * h.v * S) % (H + 60) + H + 60) % (H + 60) - 30;
      drawHeart(c, h.x * W + Math.sin(t + h.y * 9) * 10, y, h.s * S, h.c, false);
    }
    if (!this.el || this.ended) {
      const sz = clamp(110 * S, 70, 150);
      drawChar(c, 'pau', W / 2 - 40 * S, H * 0.82, sz, { happy: this.ended, arms: this.ended ? 'up' : null });
      drawChar(c, 'paula', W / 2 + 40 * S, H * 0.82, sz, { dir: -1, happy: this.ended, arms: this.ended ? 'up' : null });
      drawChi(c, W / 2 + 95 * S, H * 0.82, sz * 0.42, { dir: -1, happy: this.ended, hop: this.ended ? Math.abs(Math.sin(t * 8)) * 12 : 0 });
      // caja
      if (!this.ended) {
        const bx = W / 2, by = H * 0.82;
        c.fillStyle = '#c4527a'; roundRect(c, bx - 28 * S, by - 34 * S, 56 * S, 34 * S, 6 * S); c.fill();
        c.fillStyle = '#e8708f'; roundRect(c, bx - 31 * S, by - 42 * S, 62 * S, 12 * S, 4 * S); c.fill();
        drawHeart(c, bx, by - 18 * S, 18 * S, '#ffd6e0', false);
      }
    }
    this.drawFX(c); this.drawHUD(c);
  }
}

/* ============ LUNA 5 · La carta voladora ============ */
class Plane extends GameBase {
  constructor() {
    super({ hint: { touch: 'Mantén pulsado para subir · suelta para bajar', pc: 'Mantén ESPACIO o el clic para subir · suelta para bajar' }, endText: '¡Carta entregada!' });
    this.dist = 0; this.goal = 14500; this.y = null; this.vy = 0; this.obs = []; this.items = [];
    this.next = 1300; this.inv = 0; this.hold = false; this.progress = 0; this.trailT = 0; this.landed = false;
    this.bgc = Array.from({ length: 9 }, () => ({ x: Math.random() * 1800, y: Math.random(), s: rand(0.6, 1.3) }));
  }
  resize() { this.Hu = H / S; this.px = Math.max(70, W * 0.26); if (this.y == null) this.y = this.Hu * 0.45; this.y = clamp(this.y, 30, this.Hu - 30); }
  sx(wx) { return this.px + (wx - this.dist) * S; }
  down() { this.hold = true; }
  up() { this.hold = false; }
  key(k, d) { if (k === 'Space' || k === 'ArrowUp' || k === 'KeyW') this.hold = d; }
  spawnGate(wx) {
    const Hu = this.Hu, gap = clamp(Hu * 0.42, 240, 340), cy = rand(gap / 2 + 40, Hu - gap / 2 - 40);
    if (Math.random() < 0.68) {
      this.obs.push({ type: 'col', wx, top: -50, bot: cy - gap / 2, w: 92 });
      this.obs.push({ type: 'col', wx, top: cy + gap / 2, bot: Hu + 50, w: 92 });
    } else {
      const side = Math.random() < 0.5 ? -1 : 1;
      this.obs.push({ type: 'storm', wx, y: cy + side * gap * 0.55, r: 58 });
      this.obs.push({ type: 'bird', wx: wx + 320, y: rand(70, Hu - 70), vx: -130, ph: rand(0, TAU) });
    }
    for (let i = 0; i < 3; i++) { this.items.push({ wx: wx - 60 + i * 60, y: cy, got: false }); this.total++; }
  }
  step(dt) {
    const sp = 330 + Math.min(this.dist * 0.008, 110);
    this.dist += sp * dt; this.progress = this.dist / this.goal;
    const holding = this.hold || Input.keys.Space;
    this.vy += (holding ? -1750 : 1000) * dt;
    this.vy = clamp(this.vy, -430, 470);
    this.y += this.vy * dt;
    if (this.y < 26) { this.y = 26; this.vy = 40; }
    if (this.y > this.Hu - 26) { this.y = this.Hu - 26; this.vy = -160; }
    this.inv = Math.max(0, this.inv - dt);
    const ahead = this.dist + W / S + 150;
    if (this.dist < this.goal - 1800) while (this.next < ahead) { this.spawnGate(this.next); this.next += rand(560, 720); }
    const pxw = this.dist, r = 16;
    for (const o of this.obs) {
      if (o.type === 'bird') { o.wx += o.vx * dt; o.ph += dt * 3; o.y += Math.sin(o.ph) * 40 * dt; }
      if (this.inv > 0 || o.hit) continue;
      let hit = false;
      if (o.type === 'col') {
        const qx = clamp(pxw, o.wx - o.w / 2, o.wx + o.w / 2), qy = clamp(this.y, o.top, o.bot);
        hit = Math.hypot(qx - pxw, qy - this.y) < r;
      } else if (o.type === 'storm') hit = Math.hypot(o.wx - pxw, o.y - this.y) < o.r + r - 8;
      else hit = Math.hypot(o.wx - pxw, o.y - this.y) < 20 + r;
      if (hit) {
        this.inv = 1.4; const lost = Math.min(3, this.hearts); this.hearts -= lost;
        Sound.hit(); Engine.shake = 9 * S; this.vy = o.type === 'col' && this.y < (o.top + o.bot) / 2 ? -250 : 250;
        if (o.type === 'col' && o.top < 0) this.vy = 250; else if (o.type === 'col') this.vy = -250;
        this.float(this.px, this.y * S - 30 * S, lost ? `-${lost} 💔` : '¡Uy!', '#ffb3c1');
        this.parts.burst(this.px, this.y * S, 8, { type: 'spark', color: '#fff', g: 300 });
      }
    }
    for (const it of this.items) {
      if (!it.got && Math.abs(it.wx - pxw) < 30 && Math.abs(it.y - this.y) < 34) {
        it.got = true; this.hearts++; Sound.coin(this.hearts % 6);
        this.parts.burst(this.sx(it.wx), it.y * S, 6, { colors: ['#ff4d7d', '#ffd6e0'], size: 10 });
      }
    }
    this.trailT += dt;
    if (this.trailT > 0.05) { this.trailT = 0; this.parts.add({ x: this.px - 18 * S, y: this.y * S, vx: -120 * S, vy: rand(-10, 10) * S, life: 0.6, size: 8 * S, type: 'star', color: 'rgba(255,255,255,0.8)' }); }
    this.obs = this.obs.filter(o => o.wx > this.dist - 400);
    this.items = this.items.filter(i => i.wx > this.dist - 300 && !i.got);
    if (this.dist >= this.goal) this.finish();
  }
  ending(dt) {
    const tx = this.sx(this.goal + 260) - 16 * S, ty = (this.paulaY() - 98 * S) / S;
    this.pxEnd = lerp(this.pxEnd == null ? this.px : this.pxEnd, tx, Math.min(1, dt * 2));
    this.y = lerp(this.y, ty, Math.min(1, dt * 2));
    if (!this.landed && Math.abs(this.pxEnd - tx) < 6) { this.landed = true; this.parts.burst(tx, ty * S, 26, { colors: ['#ff4d7d', '#ff8fab', '#fff'], up: 100, size: 15 }); Sound.coin(12); }
  }
  paulaY() { return H * 0.62; }
  drawCloud(c, x, y, s, col) {
    c.fillStyle = col;
    ell(c, x, y, 46 * s, 30 * s); ell(c, x - 34 * s, y + 8 * s, 30 * s, 22 * s); ell(c, x + 34 * s, y + 8 * s, 32 * s, 22 * s); ell(c, x + 8 * s, y - 20 * s, 30 * s, 24 * s);
  }
  draw(c) {
    const t = this.t;
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#2d1a5c'); g.addColorStop(0.5, '#a24a8a'); g.addColorStop(1, '#ffb38a');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    glow(c, W * 0.75, H * 0.85, 200 * S, 'rgba(255,220,150,0.5)');
    ell(c, W * 0.75, H * 0.85, 60 * S, 60 * S, '#ffe0a8');
    for (const b of this.bgc) {
      const x = ((b.x - this.dist * 0.2) % 1800 + 1800) % 1800 * S - 100 * S;
      this.drawCloud(c, x, b.y * H * 0.8, b.s * S, 'rgba(255,220,235,0.18)');
    }
    // colinas
    c.fillStyle = 'rgba(70,30,80,0.55)'; c.beginPath(); c.moveTo(0, H);
    for (let x = 0; x <= W + 20; x += 20) c.lineTo(x, H * 0.9 + Math.sin((x + this.dist * 0.4 * S) / (140 * S)) * 16 * S);
    c.lineTo(W, H); c.fill();
    // casa de Paula
    const hx = this.sx(this.goal + 260);
    if (hx < W + 200) {
      const py = this.paulaY();
      c.fillStyle = '#3a2050'; c.fillRect(hx - 70 * S, py, 140 * S, H - py);
      c.fillStyle = '#5a2e66'; c.beginPath(); c.moveTo(hx - 85 * S, py); c.lineTo(hx, py - 70 * S); c.lineTo(hx + 85 * S, py); c.fill();
      c.fillStyle = '#ffd77a'; c.fillRect(hx - 40 * S, py + 30 * S, 26 * S, 30 * S); c.fillRect(hx + 14 * S, py + 30 * S, 26 * S, 30 * S);
      c.fillStyle = '#2a1640'; c.fillRect(hx - 80 * S, py - 4 * S, 160 * S, 8 * S);
      drawChar(c, 'paula', hx, py - 4 * S, 100 * S, { dir: -1, arms: this.landed ? 'up' : 'reach', happy: this.landed, noShadow: true });
    }
    // corazones
    for (const it of this.items) {
      const x = this.sx(it.wx); if (x < -30 || x > W + 30) continue;
      glow(c, x, it.y * S, 22 * S, 'rgba(255,80,130,0.35)');
      drawHeart(c, x, it.y * S + Math.sin(t * 4 + it.wx) * 3 * S, 26 * S, '#ff4d7d');
    }
    // obstáculos
    for (const o of this.obs) {
      const x = this.sx(o.wx); if (x < -150 || x > W + 150) continue;
      if (o.type === 'col') {
        const top = o.top * S, bot = o.bot * S;
        c.fillStyle = '#5b5080';
        for (let yy = top, i = 0; yy <= bot; yy += 40 * S, i++) ell(c, x + Math.sin(i * 1.7 + o.wx) * 10 * S, yy, 50 * S, 32 * S);
        c.fillStyle = '#6e6396';
        for (let yy = top, i = 0; yy <= bot; yy += 40 * S, i++) ell(c, x - 6 * S + Math.sin(i * 1.7 + o.wx) * 10 * S, yy - 6 * S, 34 * S, 20 * S);
      } else if (o.type === 'storm') {
        const y = o.y * S;
        this.drawCloud(c, x, y, o.r / 46 * S, '#4a4370');
        if (Math.sin(t * 7 + o.wx) > 0.7) {
          c.strokeStyle = '#fff59a'; c.lineWidth = 3 * S; c.beginPath();
          c.moveTo(x, y + 18 * S); c.lineTo(x - 10 * S, y + 40 * S); c.lineTo(x + 4 * S, y + 40 * S); c.lineTo(x - 6 * S, y + 64 * S); c.stroke();
        }
      } else {
        const y = o.y * S, fl = Math.sin(t * 14) * 10 * S;
        ell(c, x, y, 16 * S, 9 * S, '#3a2a4a');
        c.fillStyle = '#3a2a4a'; c.beginPath(); c.moveTo(x - 4 * S, y); c.lineTo(x + 6 * S, y - 14 * S - fl); c.lineTo(x + 12 * S, y); c.fill();
        c.fillStyle = '#f3a43b'; c.beginPath(); c.moveTo(x - 16 * S, y - 2 * S); c.lineTo(x - 24 * S, y); c.lineTo(x - 16 * S, y + 2 * S); c.fill();
      }
    }
    // avión
    const px = this.pxEnd != null ? this.pxEnd : this.px, py = this.y * S;
    if (!this.landed) {
      const blink = this.inv > 0 && Math.floor(t * 14) % 2 === 0;
      c.save(); c.translate(px, py); c.rotate(clamp(this.vy / 900, -0.45, 0.5)); c.globalAlpha = blink ? 0.4 : 1;
      const s = S * 1.1;
      c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(24 * s, 0); c.lineTo(-20 * s, -14 * s); c.lineTo(-10 * s, 0); c.closePath(); c.fill();
      c.fillStyle = '#e8e4f2'; c.beginPath(); c.moveTo(24 * s, 0); c.lineTo(-20 * s, 12 * s); c.lineTo(-10 * s, 0); c.closePath(); c.fill();
      c.fillStyle = '#d4cde6'; c.beginPath(); c.moveTo(24 * s, 0); c.lineTo(-10 * s, 0); c.lineTo(-14 * s, 6 * s); c.closePath(); c.fill();
      drawHeart(c, -6 * s, -4 * s, 9 * s, '#ff4d7d', false);
      c.restore();
    }
    if (!this.started) {
      const bx = Math.max(40, this.px - 60 * S);
      drawChar(c, 'pau', bx, H * 0.9, 100 * S, { arms: 'wave' });
    }
    this.drawFX(c); this.drawHUD(c);
  }
}

/* ============ LUNA 6 · Nuestra canción (ritmo) ============ */
function buildSong() {
  const P1 = [[0, 64], [1, 67], [2, 72], [3, 71], [4, 69], [5, 64], [6, 69], [7, 72], [8, 65], [9, 69], [10, 72], [11, 74], [12, 71], [13, 67], [14, 74]];
  const P2 = [[16, 72], [17, 71], [17.5, 72], [18, 76], [19, 74], [20, 72], [21, 69], [22, 64], [23, 69], [24, 65], [24.5, 69], [25, 72], [26, 77], [27, 76], [28, 74], [29, 71], [30, 67], [31, 71]];
  const P3 = [[32, 76], [33, 76], [34, 79], [35, 76], [36, 72], [37, 72], [38, 76], [39, 72], [40, 77], [41, 76], [42, 74], [43, 72], [44, 74], [45, 71], [46, 67]];
  const P4 = [[48, 76], [48.5, 77], [49, 79], [50, 84], [51, 79], [52, 76], [53, 72], [53.5, 76], [54, 81], [55, 79], [56, 77], [57, 76], [57.5, 74], [58, 72], [59, 69], [60, 71], [61, 74], [62, 79]];
  const P5 = P3.map(([b, m]) => [b + 32, m]);
  const P6 = [[80, 64], [81, 67], [82, 72], [83, 76], [84, 79], [86, 76], [88, 77], [89, 76], [90, 74], [91, 71], [92, 72]];
  return [...P1, ...P2, ...P3, ...P4, ...P5, ...P6];
}
class Rhythm extends GameBase {
  constructor() {
    super({ hint: { touch: 'Toca el carril cuando el corazón llegue al círculo', pc: 'Pulsa A S D (o ← ↓ →) cuando el corazón llegue al círculo' }, endText: '¡Qué bonita canción!', endWait: 3.5 });
    this.bpm = 96; this.spb = 60 / this.bpm; this.lead = 1.8; this.endBeat = 96;
    this.notes = buildSong().map(([b, m]) => ({ b, m, lane: m < 69 ? 0 : m < 74 ? 1 : 2, t: b * this.spb, state: 0 }));
    this.total = this.notes.length; this.pts = 0; this.combo = 0; this.maxCombo = 0; this.perfect = 0; this.good = 0;
    this.songStart = null; this.track = []; this.flash = [0, 0, 0]; this.judge = null; this.progress = 0;
  }
  resize() { this.lw = Math.min(W * 0.92, 460 * S); this.left = (W - this.lw) / 2; this.laneW = this.lw / 3; this.hitY = H * 0.8; this.topY = 60; }
  onGo() {
    this.songStart = Sound.now() + this.lead;
    if (!Sound.ctx) return;
    const prog = [[48, [60, 64, 67]], [45, [57, 60, 64]], [41, [57, 60, 65]], [43, [55, 59, 62]]], D = Sound.mus;
    for (let bar = 0; bar < 24; bar++) {
      const t0 = this.songStart + bar * 4 * this.spb, [bass, ch] = bar === 23 ? prog[0] : prog[bar % 4];
      Sound.tone(mf(bass), this.spb * 3.8, { type: 'triangle', vol: 0.22, when: t0, dest: D, a: 0.03, track: this.track });
      Sound.tone(mf(bass + 7), this.spb * 1.8, { type: 'triangle', vol: 0.12, when: t0 + 2 * this.spb, dest: D, track: this.track });
      for (const m of ch) Sound.tone(mf(m), this.spb * 4, { vol: 0.04, when: t0, a: 0.3, dest: D, track: this.track });
      for (let b = 0; b < 4; b++) {
        Sound.tone(120, 0.12, { vol: b % 2 ? 0.08 : 0.18, slide: 45, when: t0 + b * this.spb, dest: D, track: this.track });
        Sound.tone(mf(ch[(b + 1) % 3] + 12), this.spb * 0.5, { vol: 0.03, when: t0 + (b + 0.5) * this.spb, dest: D, track: this.track });
      }
    }
  }
  songTime() { return this.songStart == null ? -99 : Sound.now() - this.songStart; }
  hitLane(l) {
    if (!this.playing) return;
    this.flash[l] = 1;
    const st = this.songTime();
    let best = null, bd = 1;
    for (const n of this.notes) {
      if (n.t > st + 0.3) break;
      if (n.state || n.lane !== l) continue;
      const d = Math.abs(st - n.t); if (d < bd) { bd = d; best = n; }
    }
    if (best && bd <= 0.17) {
      const perf = bd <= 0.075;
      best.state = perf ? 1 : 2; perf ? this.perfect++ : this.good++;
      this.pts += perf ? 100 : 60; this.combo++; this.maxCombo = Math.max(this.maxCombo, this.combo); this.hearts++;
      this.hitSound(best);
      const x = this.left + (l + 0.5) * this.laneW;
      this.parts.burst(x, this.hitY, perf ? 10 : 6, { colors: perf ? ['#ffd77a', '#ff4d7d', '#fff'] : ['#ff8fab', '#fff'], size: 12, g: 100 });
      this.judge = { s: perf ? '¡Perfecto!' : '¡Bien!', c: perf ? '#ffd77a' : '#ffc2d4', t: 0.7 };
    }
  }
  hitSound(n) { Sound.bell(n.m, undefined, 0.3); }
  down(x) { const l = Math.floor((x - this.left) / this.laneW); this.hitLane(clamp(l, 0, 2)); }
  key(k, d) {
    if (!d) return;
    const map = { KeyA: 0, KeyS: 1, KeyD: 2, ArrowLeft: 0, ArrowDown: 1, ArrowRight: 2, KeyJ: 0, KeyK: 1, KeyL: 2, Digit1: 0, Digit2: 1, Digit3: 2, Space: 1 };
    if (k in map) this.hitLane(map[k]);
  }
  step(dt) {
    const st = this.songTime();
    this.progress = clamp(st / (this.endBeat * this.spb), 0, 1);
    for (const n of this.notes) {
      if (n.t > st) break;
      if (n.state === 0 && st - n.t > 0.18) { n.state = 3; this.combo = 0; this.judge = { s: 'Ups…', c: '#b9a8d0', t: 0.5 }; }
    }
    for (let i = 0; i < 3; i++) this.flash[i] = Math.max(0, this.flash[i] - dt * 4);
    if (this.judge) { this.judge.t -= dt; if (this.judge.t <= 0) this.judge = null; }
    if (st > this.endBeat * this.spb - 1) this.finish();
  }
  result() {
    const r = this.pts / (this.total * 100);
    return { stars: r >= 0.8 ? 3 : r >= 0.55 ? 2 : 1, hearts: this.hearts, label: `notas de ${this.total}` };
  }
  hud(c, s) { if (this.combo >= 3) txt(c, `Combo x${this.combo}`, W / 2, 12 + 46 * s, 17 * s, '#ffd77a', { weight: 700 }); }
  destroy() { for (const o of this.track) { try { o.stop(); } catch (e) {} } this.track = []; }
  draw(c) {
    const t = this.t, st = this.songTime(), beat = st / this.spb;
    Sky.draw(c, t, { top: '#140a36', mid: '#3b1a5e', bot: '#8a3070', mx: W * 0.5, my: H * 0.12, mr: 32 * S });
    // pista de baile
    const pulse = this.playing ? Math.pow(1 - (beat - Math.floor(beat)), 3) : 0;
    glow(c, W / 2, this.hitY, Math.max(W, H) * 0.5, `rgba(255,80,140,${0.08 + pulse * 0.1})`);
    // personajes bailando
    const wide = this.left > 120 * S;
    const sz = wide ? clamp(130 * S, 90, 170) : clamp(70 * S, 50, 90);
    const bx1 = wide ? this.left / 2 : 34 * S + 10, bx2 = wide ? W - this.left / 2 : W - 34 * S - 10, by = wide ? H * 0.86 : H - 4;
    const dance = this.playing || this.ended;
    const bob = dance ? -Math.abs(Math.sin(beat * Math.PI)) * 6 : null;
    const up = dance && Math.floor(beat / 2) % 2 === 0;
    drawChar(c, 'pau', bx1, by, sz, { bob, arms: this.ended ? 'up' : up ? 'up' : 'wave', happy: this.combo >= 5 || this.ended });
    drawChar(c, 'paula', bx2, by, sz, { dir: -1, bob, arms: this.ended ? 'up' : up ? 'wave' : 'up', happy: this.combo >= 5 || this.ended });
    drawChi(c, W / 2, H - 6, clamp(52 * S, 36, 64), { happy: this.combo >= 5 || this.ended, hop: dance ? Math.abs(Math.sin(beat * Math.PI)) * 10 : 0 });
    // carriles
    const cols = ['#ff6f91', '#c77dff', '#ffb347'];
    for (let l = 0; l < 3; l++) {
      const x = this.left + l * this.laneW;
      const g = c.createLinearGradient(0, this.topY, 0, H);
      g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, `rgba(255,255,255,${0.07 + this.flash[l] * 0.18})`);
      c.fillStyle = g; c.fillRect(x + 3, this.topY, this.laneW - 6, H - this.topY);
    }
    for (let l = 0; l < 3; l++) {
      const x = this.left + (l + 0.5) * this.laneW, r = Math.min(this.laneW * 0.34, 34 * S);
      c.strokeStyle = cols[l]; c.lineWidth = 3 * S; c.globalAlpha = 0.6 + this.flash[l] * 0.4;
      c.beginPath(); c.arc(x, this.hitY, r * (1 + this.flash[l] * 0.15), 0, TAU); c.stroke();
      c.globalAlpha = 1;
      if (!isTouch) txt(c, ['A', 'S', 'D'][l], x, this.hitY + r + 16 * S, 14 * S, 'rgba(255,255,255,0.6)');
    }
    // notas
    const span = this.hitY - this.topY;
    for (const n of this.notes) {
      const dtn = n.t - st;
      if (dtn > this.lead + 0.1) break;
      if (n.state === 1 || n.state === 2) continue;
      if (dtn < -0.5) continue;
      const y = this.hitY - dtn / this.lead * span, x = this.left + (n.lane + 0.5) * this.laneW;
      const s = Math.min(this.laneW * 0.55, 46 * S);
      c.globalAlpha = n.state === 3 ? 0.3 : 1;
      if (n.state !== 3) glow(c, x, y, s * 0.8, 'rgba(255,255,255,0.25)');
      drawHeart(c, x, y, s, cols[n.lane]);
      c.globalAlpha = 1;
    }
    if (this.judge) { c.globalAlpha = clamp(this.judge.t * 2, 0, 1); txt(c, this.judge.s, W / 2, this.hitY - 90 * S, 28 * S, this.judge.c, { weight: 700, stroke: 'rgba(40,10,50,0.7)', lw: 5 }); c.globalAlpha = 1; }
    this.drawFX(c); this.drawHUD(c);
  }
}

