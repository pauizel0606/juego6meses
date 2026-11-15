/* Escenas: portada, mapa y final */

class FloatHearts {
  constructor(n) { this.a = Array.from({ length: n }, () => this.mk(true)); }
  mk(init) { return { x: Math.random(), y: init ? Math.random() : 1.1, s: rand(8, 22), v: rand(0.03, 0.08), p: rand(0, TAU), c: pick(['#ff4d7d', '#ff8fab', '#ffc2d4', '#c77dff']) }; }
  update(dt) { for (const h of this.a) { h.y -= h.v * dt; if (h.y < -0.1) Object.assign(h, this.mk(false)); } }
  draw(c, t) {
    for (const h of this.a) { c.globalAlpha = 0.55; drawHeart(c, h.x * W + Math.sin(t + h.p) * 18 * S, h.y * H, h.s * S, h.c, false); }
    c.globalAlpha = 1;
  }
}

function drawThread(c, x1, y1, x2, y2, t, k = 1) {
  const mx = (x1 + x2) / 2, sag = 40 * S + Math.sin(t * 1.5) * 10 * S;
  c.save();
  c.strokeStyle = 'rgba(255,40,90,0.35)'; c.lineWidth = 7 * S; c.lineCap = 'round';
  c.beginPath(); c.moveTo(x1, y1); c.bezierCurveTo(lerp(x1, mx, 0.6), y1 + sag, lerp(x2, mx, 0.6), y2 + sag, lerp(x1, x2, k), lerp(y1, y2, k)); c.stroke();
  c.strokeStyle = '#ff2d55'; c.lineWidth = 2.4 * S; c.stroke();
  c.restore();
}

class TitleScene {
  constructor() { this.t = 0; this.fh = new FloatHearts(26); this.parts = new Particles(); }
  update(dt) { this.t += dt; this.fh.update(dt); this.parts.update(dt); }
  down(x, y) {
    if (this.chi && Math.hypot(x - this.chi.x, y - this.chi.y) < this.chi.r) {
      Sound.bark(); vib(20); this.hopT = 0.5;
      this.parts.burst(this.chi.x, this.chi.y - this.chi.r * 0.6, 10, { colors: ['#3ccf6e', '#7dffa8', '#fff'], size: 14, up: 120 });
      return;
    }
    this.parts.burst(x, y, 8, { colors: ['#ff4d7d', '#ff8fab', '#fff'], size: 14 }); Sound.pop();
  }
  draw(c) {
    const t = this.t;
    this.hopT = Math.max(0, (this.hopT || 0) - 1 / 60);
    Sky.draw(c, t, { mx: W * 0.5, my: H * 0.5, mr: Math.min(W, H) * 0.2 });
    this.fh.draw(c, t);
    drawHill(c, H * 0.8, '#21153f', 20, 0.5);
    drawHill(c, H * 0.87, '#150d2b', 12, 2.2);
    const sz = clamp(150 * S, 100, 200), gy = H * 0.84, d = clamp(sz * 0.75, 60, 150);
    const u = sz / 100;
    drawThread(c, W / 2 - d + 15 * u, gy - 27 * u, W / 2 + d - 15 * u, gy - 27 * u, t);
    drawChar(c, 'pau', W / 2 - d, gy, sz, { tilt: 0.06 });
    drawChar(c, 'paula', W / 2 + d, gy, sz, { dir: -1, tilt: 0.06 });
    const ch = sz * 0.42, hop = Math.sin(this.hopT / 0.5 * Math.PI) * 30;
    drawChi(c, W / 2, gy + 6 * S, ch, { hop, happy: this.hopT > 0 });
    this.chi = { x: W / 2, y: gy - ch * 0.5, r: ch * 0.7 };
    const hb = 1 + Math.pow(Math.max(0, Math.sin(t * 3)), 8) * 0.25;
    drawHeart(c, W / 2, gy - sz * 1.25, 34 * S * hb, '#ff4d7d');
    this.parts.draw(c);
  }
}

class MapScene {
  constructor(onPick) { this.onPick = onPick; this.t = 0; this.parts = new Particles(); this.fh = new FloatHearts(10); }
  resize() {
    const port = W < H * 0.9;
    this.r = clamp(32 * S, 24, 44);
    this.nodes = [];
    for (let i = 0; i < 6; i++) {
      let x, y;
      if (port) { const top = 120, bot = H - 120; y = bot - i * (bot - top) / 5; x = W / 2 + (i % 2 ? 1 : -1) * Math.min(W * 0.22, 140); }
      else { const l = Math.max(70, W * 0.1), r = W - l; x = l + i * (r - l) / 5; y = H * 0.52 + (i % 2 ? -1 : 1) * H * 0.12; }
      this.nodes.push({ x, y });
    }
  }
  update(dt) { this.t += dt; this.parts.update(dt); this.fh.update(dt); }
  down(x, y) {
    this.nodes.forEach((n, i) => {
      if (Math.hypot(n.x - x, n.y - y) < this.r * 1.5) {
        if (i < Save.data.unlocked) { this.parts.burst(n.x, n.y, 12, { colors: ['#ffd77a', '#fff'], type: 'star', g: 0 }); this.onPick(i); }
        else { Sound.wrong(); this.shakeI = i; this.shakeT = 0.4; }
      }
    });
  }
  draw(c) {
    const t = this.t, sd = Save.data;
    const done = sd.stars.filter(s => s > 0).length;
    const mr = Math.min(W, H) * 0.07;
    Sky.draw(c, t, { moon: true, mx: W - mr - 24, my: H - mr - 30 - (W < 520 ? 50 : 0), mr, phase: Math.max(0.08, done / 6), starA: 0.9 });
    this.fh.draw(c, t);
    // camino
    c.save(); c.setLineDash([6 * S, 10 * S]); c.lineDashOffset = -t * 20;
    c.strokeStyle = 'rgba(255,200,220,0.55)'; c.lineWidth = 3 * S;
    c.beginPath();
    this.nodes.forEach((n, i) => {
      if (!i) c.moveTo(n.x, n.y);
      else { const p = this.nodes[i - 1]; c.quadraticCurveTo((p.x + n.x) / 2 + (i % 2 ? 30 : -30) * S, (p.y + n.y) / 2, n.x, n.y); }
    });
    c.stroke(); c.restore();
    // lunas
    this.nodes.forEach((n, i) => {
      const open = i < sd.unlocked, st = sd.stars[i];
      let x = n.x;
      if (this.shakeI === i && this.shakeT > 0) { this.shakeT -= 1 / 60; x += Math.sin(this.shakeT * 60) * 5; }
      const r = this.r * (open && !st ? 1 + Math.sin(t * 3) * 0.06 : 1);
      if (open) drawMoon(c, x, n.y, r, st ? 1 : 0.55);
      else { drawMoon(c, x, n.y, r, 0.12, 0.45); txt(c, '🔒', x, n.y, r * 0.7, '#fff'); }
      if (open && !st) { c.strokeStyle = `rgba(255,120,170,${0.5 + 0.5 * Math.sin(t * 4)})`; c.lineWidth = 3 * S; c.beginPath(); c.arc(x, n.y, r + 7 * S, 0, TAU); c.stroke(); }
      const fs = clamp(13 * S, 11, 17);
      txt(c, CHAPTERS[i].num, x, n.y + r + fs * 1.1, fs, open ? '#ffe3ec' : 'rgba(255,255,255,0.4)', { weight: 700, stroke: 'rgba(20,10,40,0.8)', lw: 4 });
      txt(c, CHAPTERS[i].title, x, n.y + r + fs * 2.3, fs * 0.95, open ? '#ffc2d4' : 'rgba(255,255,255,0.35)', { weight: 500, stroke: 'rgba(20,10,40,0.8)', lw: 4 });
      if (st) for (let k = 0; k < 3; k++) txt(c, '★', x + (k - 1) * fs * 1.2, n.y - r - fs * 0.8, fs * 1.2, k < st ? '#ffc23d' : 'rgba(255,255,255,0.25)', { stroke: 'rgba(20,10,40,0.6)', lw: 3 });
    });
    // Pau y Paula junto a la luna actual
    const cur = Math.min(sd.unlocked - 1, 5), n = this.nodes[cur];
    if (n) {
      const sz = clamp(56 * S, 40, 70), side = n.x > W * 0.7 ? -1 : 1;
      const bx = n.x + side * (this.r + sz * 0.55), by = n.y + this.r * 0.6;
      drawChar(c, 'pau', bx - sz * 0.22, by, sz, { happy: true });
      drawChar(c, 'paula', bx + sz * 0.22, by, sz, { dir: -1, happy: true });
      drawChi(c, bx + sz * 0.55, by + 2, sz * 0.42, { dir: -1, hop: Math.abs(Math.sin(t * 3)) * 6 });
    }
    this.parts.draw(c);
  }
}

class FinalScene {
  constructor() {
    this.t = 0; this.parts = new Particles(); this.rockets = []; this.next = 0.6; this.fh = new FloatHearts(30); this.party = 0;
  }
  heartBurst(x, y, s, col) {
    const n = 34;
    for (let i = 0; i < n; i++) {
      const a = i / n * TAU, hx = 16 * Math.pow(Math.sin(a), 3), hy = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a));
      this.parts.add({ x, y, vx: hx * s * S, vy: hy * s * S, g: 40 * S, drag: 1.2, life: rand(1.4, 1.9), size: 9 * S, color: col, type: 'star' });
    }
    this.parts.burst(x, y, 12, { colors: [col, '#fff'], type: 'spark', min: 30, max: 180, g: 60, drag: 1, life: 1.4, size: 10 });
  }
  celebrate() { this.party = 4; for (let i = 0; i < 5; i++) setTimeout(() => this.launch(), i * 180); }
  launch() { this.rockets.push({ x: rand(W * 0.15, W * 0.85), y: H, ty: rand(H * 0.12, H * 0.42), col: pick(['#ff4d7d', '#ffd77a', '#c77dff', '#7ee0ff', '#ff8fab', '#3ccf6e']) }); }
  update(dt) {
    this.t += dt; this.parts.update(dt); this.fh.update(dt);
    this.party = Math.max(0, this.party - dt);
    this.next -= dt;
    if (this.next <= 0) { this.launch(); this.next = this.party > 0 ? 0.25 : rand(0.7, 1.4); }
    for (const r of this.rockets) {
      r.y -= 520 * S * dt;
      if (Math.random() < 0.6) this.parts.add({ x: r.x, y: r.y, vy: 40 * S, life: 0.4, size: 6 * S, type: 'spark', color: '#ffe9b0' });
      if (r.y <= r.ty) { r.dead = true; this.heartBurst(r.x, r.y, rand(6, 9), r.col); Sound.pop(); }
    }
    this.rockets = this.rockets.filter(r => !r.dead);
  }
  down(x, y) { this.heartBurst(x, y, 6, pick(['#ff4d7d', '#ffd77a', '#c77dff'])); Sound.pop(); }
  draw(c) {
    const t = this.t;
    Sky.draw(c, t, { mx: W * 0.5, my: H * 0.42, mr: Math.min(W, H) * 0.16, top: '#0a0826', mid: '#2a1658', bot: '#7a2e6a' });
    this.fh.draw(c, t);
    this.parts.draw(c);
    for (const r of this.rockets) ell(c, r.x, r.y, 3 * S, 3 * S, '#fff');
    drawHill(c, H * 0.82, '#1d1238', 24, 0.3);
    drawHill(c, H * 0.9, '#120b26', 12, 2);
    const sz = clamp(150 * S, 100, 200), gy = H * 0.86, d = sz * 0.2;
    drawChar(c, 'pau', W / 2 - d, gy, sz, { happy: true, tilt: 0.12, arms: this.party > 0 ? 'up' : null });
    drawChar(c, 'paula', W / 2 + d, gy, sz, { dir: -1, happy: true, tilt: 0.12, arms: this.party > 0 ? 'up' : null });
    drawChi(c, W / 2 + d + sz * 0.42, gy + 4 * S, sz * 0.42, { dir: -1, happy: true, hop: this.party > 0 ? Math.abs(Math.sin(t * 8)) * 18 : 0 });
    const hb = 1 + Math.pow(Math.max(0, Math.sin(t * 3)), 8) * 0.3;
    drawHeart(c, W / 2, gy - sz * 1.15, 30 * S * hb, '#ff4d7d');
    const k = easeOutBack(clamp(t / 1.2, 0, 1));
    const fs = Math.min(84 * S, W / 5.2) * k;
    txt(c, '6 meses', W / 2, H * 0.15, fs, '#fff', { font: '"Dancing Script", cursive', weight: 700, stroke: 'rgba(255,60,120,0.8)', lw: 8 * S });
    c.globalAlpha = clamp(t - 1, 0, 1);
    txt(c, `${CONFIG.el} ♥ ${CONFIG.ella}`, W / 2, H * 0.15 + fs * 0.75, Math.min(30 * S, W / 13), '#ffd6e0', { weight: 600, stroke: 'rgba(40,10,50,0.6)', lw: 5 });
    c.globalAlpha = 1;
  }
}
