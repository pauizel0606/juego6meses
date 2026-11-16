'use strict';
/* Motor: lienzo, utilidades, cielo, partículas y personajes */
const cv = document.getElementById('game');
const cx = cv.getContext('2d');
let W = innerWidth, H = innerHeight, DPR = 1, S = 1;
const TAU = Math.PI * 2;
const rand = (a, b) => a + Math.random() * (b - a);
const randi = (a, b) => Math.floor(rand(a, b + 1));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const easeOutBack = k => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
const isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
const FONT = 'Fredoka, system-ui, sans-serif';

/* ---------- dibujo básico ---------- */
function ell(c, x, y, rx, ry, col) { if (col) c.fillStyle = col; c.beginPath(); c.ellipse(x, y, Math.abs(rx), Math.abs(ry), 0, 0, TAU); c.fill(); }
function roundRect(c, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  c.beginPath(); c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
function heartPath(c, x, y, s) {
  c.beginPath();
  c.moveTo(x, y + s * 0.32);
  c.bezierCurveTo(x - s * 0.75, y - s * 0.12, x - s * 0.38, y - s * 0.68, x, y - s * 0.26);
  c.bezierCurveTo(x + s * 0.38, y - s * 0.68, x + s * 0.75, y - s * 0.12, x, y + s * 0.32);
  c.closePath();
}
function drawHeart(c, x, y, s, color, hi = true) {
  heartPath(c, x, y, s); c.fillStyle = color; c.fill();
  if (hi && s > 10) { c.fillStyle = 'rgba(255,255,255,0.45)'; ell(c, x - s * 0.2, y - s * 0.22, s * 0.09, s * 0.06); }
}
function glow(c, x, y, r, col) {
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
}
function sparkle(c, x, y, s, col) {
  c.fillStyle = col; c.beginPath();
  c.moveTo(x, y - s); c.quadraticCurveTo(x, y, x + s, y); c.quadraticCurveTo(x, y, x, y + s);
  c.quadraticCurveTo(x, y, x - s, y); c.quadraticCurveTo(x, y, x, y - s); c.fill();
}
function txt(c, str, x, y, size, color, o = {}) {
  c.save();
  c.font = `${o.weight || 600} ${Math.max(1, size)}px ${o.font || FONT}`;
  c.textAlign = o.align || 'center'; c.textBaseline = o.base || 'middle';
  if (o.stroke) { c.lineJoin = 'round'; c.lineWidth = o.lw || 4; c.strokeStyle = o.stroke; c.strokeText(str, x, y); }
  c.fillStyle = color; c.fillText(str, x, y);
  c.restore();
}
function drawMoon(c, x, y, r, f = 1, alpha = 1) {
  c.save(); c.globalAlpha = alpha;
  glow(c, x, y, r * 3, 'rgba(255,236,190,0.32)');
  c.beginPath(); c.arc(x, y, r, 0, TAU); c.clip();
  c.fillStyle = '#fff4d6'; c.fillRect(x - r, y - r, r * 2, r * 2);
  c.fillStyle = 'rgba(226,204,160,0.55)';
  ell(c, x - r * 0.3, y - r * 0.18, r * 0.2, r * 0.2); ell(c, x + r * 0.36, y + r * 0.3, r * 0.13, r * 0.13);
  ell(c, x + r * 0.12, y - r * 0.48, r * 0.09, r * 0.09); ell(c, x - r * 0.15, y + r * 0.5, r * 0.07, r * 0.07);
  if (f < 1) { c.fillStyle = 'rgba(24,16,54,0.94)'; c.beginPath(); c.arc(x - f * 2 * r, y, r * 1.03, 0, TAU); c.fill(); }
  c.restore();
}
function drawHill(c, y, col, amp = 30, ph = 0) {
  c.fillStyle = col; c.beginPath(); c.moveTo(0, H);
  for (let x = 0; x <= W + 20; x += 20) c.lineTo(x, y + Math.sin(x / W * Math.PI * 2 + ph) * amp * S - Math.sin(x / W * Math.PI) * amp * 1.5 * S);
  c.lineTo(W, H); c.closePath(); c.fill();
}

/* ---------- cielo ---------- */
const Sky = {
  stars: [],
  resize() {
    const n = clamp(Math.floor(W * H / 4500), 60, 380);
    this.stars = Array.from({ length: n }, () => ({ x: Math.random(), y: Math.random(), r: rand(0.4, 1.7), p: rand(0, TAU), s: rand(0.6, 2.4) }));
  },
  draw(c, t, o = {}) {
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, o.top || '#0c0a2c'); g.addColorStop(0.55, o.mid || '#2b1b58'); g.addColorStop(1, o.bot || '#6e2f6e');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    const sh = o.starH || 0.85;
    c.fillStyle = '#fff';
    for (const s of this.stars) {
      c.globalAlpha = (0.35 + 0.65 * Math.abs(Math.sin(t * s.s * 0.6 + s.p))) * (o.starA != null ? o.starA : 1);
      c.fillRect(s.x * W, s.y * H * sh, s.r * 1.4, s.r * 1.4);
    }
    c.globalAlpha = 1;
    if (o.moon !== false) drawMoon(c, o.mx != null ? o.mx : W * 0.82, o.my != null ? o.my : H * 0.15, o.mr || 38 * S, o.phase != null ? o.phase : 1);
  }
};

/* ---------- partículas ---------- */
class Particles {
  constructor() { this.a = []; }
  add(p) { const q = Object.assign({ x: 0, y: 0, vx: 0, vy: 0, g: 0, life: 1, size: 8, color: '#ff6f91', type: 'heart', drag: 0 }, p); q.max = q.life; this.a.push(q); return q; }
  burst(x, y, n, o = {}) {
    for (let i = 0; i < n; i++) {
      const a = rand(0, TAU), sp = rand(o.min != null ? o.min : 60, o.max || 220) * S;
      this.add({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (o.up || 0) * S, g: (o.g != null ? o.g : 260) * S,
        life: rand(0.6, 1.2) * (o.life || 1), size: rand(0.6, 1.2) * (o.size || 12) * S,
        color: o.colors ? pick(o.colors) : (o.color || '#ff6f91'), type: o.type || 'heart', drag: o.drag || 0 });
    }
  }
  update(dt) {
    for (const p of this.a) {
      p.life -= dt; p.vy += p.g * dt;
      if (p.drag) { const k = Math.max(0, 1 - p.drag * dt); p.vx *= k; p.vy *= k; }
      p.x += p.vx * dt; p.y += p.vy * dt;
    }
    if (this.a.length) this.a = this.a.filter(p => p.life > 0);
  }
  draw(c) {
    for (const p of this.a) {
      const k = clamp(p.life / p.max, 0, 1);
      c.globalAlpha = Math.min(1, k * 1.5);
      if (p.type === 'heart') drawHeart(c, p.x, p.y, p.size * (0.5 + 0.5 * k), p.color, false);
      else if (p.type === 'star') sparkle(c, p.x, p.y, p.size * (0.4 + 0.6 * k), p.color);
      else { c.fillStyle = p.color; c.fillRect(p.x - p.size * 0.2, p.y - p.size * 0.2, p.size * 0.4, p.size * 0.4); }
    }
    c.globalAlpha = 1;
  }
}

/* ---------- personajes ---------- */
const LOOK = {
  pau:   { hair: '#3a2416', hairHi: '#6a4630', top: '#4f7fe8', top2: '#3d67c9', legs: '#2c3557', shoe: '#f2f2f2', skin: '#ffdcc6' },
  paula: { hair: '#7a3f22', hairHi: '#a8653f', top: '#ff6f91', top2: '#e6507a', legs: '#ffd3bd', shoe: '#d63a5c', skin: '#ffdcc6', bow: '#e8364f' }
};
/* x,y = pies. h = altura total aprox. */
function drawChar(c, who, x, y, h, o = {}) {
  const L = LOOK[who], P = who === 'paula', u = h / 100;
  const t = o.t != null ? o.t : Engine.t;
  c.save();
  c.translate(x, y);
  if (o.alpha != null) c.globalAlpha = o.alpha;
  if (!o.noShadow) ell(c, 0, 0, 20 * u, 4.5 * u, 'rgba(0,0,0,0.22)');
  if (o.dir === -1) c.scale(-1, 1);
  const run = !!o.run, ph = t * 14, sw = run ? Math.sin(ph) : 0;
  const bob = o.bob != null ? o.bob * u : run ? -Math.abs(Math.cos(ph)) * 4 * u : Math.sin(t * 2.2 + (P ? 1.4 : 0)) * 1.1 * u;
  c.translate(0, bob);
  if (o.rot) c.rotate(o.rot);
  const hy = -72 * u;

  // pelo trasero (Paula)
  if (P) {
    c.fillStyle = L.hair; c.beginPath();
    c.moveTo(-21 * u, hy);
    c.bezierCurveTo(-31 * u, hy + 20 * u, -27 * u, hy + 38 * u, -16 * u, hy + 43 * u);
    c.quadraticCurveTo(0, hy + 47 * u, 16 * u, hy + 43 * u);
    c.bezierCurveTo(27 * u, hy + 38 * u, 31 * u, hy + 20 * u, 21 * u, hy);
    c.closePath(); c.fill();
  }
  // piernas
  c.lineCap = 'round'; c.strokeStyle = L.legs; c.lineWidth = 7 * u;
  let f1x = -5 * u, f1y = -3 * u, f2x = 5 * u, f2y = -3 * u;
  if (run) { f1x += sw * 8 * u; f2x -= sw * 8 * u; f1y -= Math.max(0, -sw) * 6 * u; f2y -= Math.max(0, sw) * 6 * u; }
  if (o.jump) { f1x = -8 * u; f1y = -9 * u; f2x = 6 * u; f2y = -5 * u; }
  c.beginPath(); c.moveTo(-5 * u, -20 * u); c.lineTo(f1x, f1y); c.moveTo(5 * u, -20 * u); c.lineTo(f2x, f2y); c.stroke();
  ell(c, f1x + 1.5 * u, f1y + 0.5 * u, 5 * u, 3.5 * u, L.shoe);
  ell(c, f2x + 1.5 * u, f2y + 0.5 * u, 5 * u, 3.5 * u, L.shoe);
  // cuerpo
  if (P) {
    c.fillStyle = L.top; c.beginPath();
    c.moveTo(-9 * u, -53 * u); c.lineTo(9 * u, -53 * u);
    c.quadraticCurveTo(13 * u, -36 * u, 19 * u, -17 * u);
    c.quadraticCurveTo(0, -12 * u, -19 * u, -17 * u);
    c.quadraticCurveTo(-13 * u, -36 * u, -9 * u, -53 * u); c.fill();
    c.fillStyle = L.top2; c.fillRect(-10 * u, -42 * u, 20 * u, 3.5 * u);
    c.fillStyle = 'rgba(255,255,255,0.55)';
    for (let i = -2; i <= 2; i++) ell(c, i * 6.5 * u, -19 * u + Math.abs(i) * 0.4 * u, 1.3 * u, 1.3 * u);
  } else {
    c.fillStyle = L.legs; roundRect(c, -11 * u, -27 * u, 22 * u, 10 * u, 3 * u); c.fill();
    c.fillStyle = L.top; roundRect(c, -13 * u, -54 * u, 26 * u, 32 * u, 9 * u); c.fill();
    c.fillStyle = L.top2; roundRect(c, -8 * u, -33 * u, 16 * u, 7 * u, 3 * u); c.fill();
    drawHeart(c, 0, -43 * u, 8 * u, '#ff6f91', false);
  }
  // brazos
  const arms = o.arms;
  let hands;
  if (arms === 'up') { const w = Math.sin(t * 9) * 3 * u; hands = [[-20 * u, -71 * u + w], [20 * u, -71 * u - w]]; }
  else if (arms === 'hold') hands = [[-9 * u, -88 * u], [9 * u, -88 * u]];
  else if (arms === 'reach') hands = [[-15 * u, -28 * u], [24 * u, -44 * u]];
  else if (arms === 'wave') { const w = Math.sin(t * 10) * 5 * u; hands = [[-15 * u, -27 * u], [21 * u + w, -70 * u]]; }
  else { const a = run ? Math.cos(ph) * 7 * u : Math.sin(t * 2) * u; hands = [[-15 * u - a, -27 * u], [15 * u + a, -27 * u]]; }
  c.strokeStyle = P ? L.skin : L.top; c.lineWidth = 6 * u;
  c.beginPath();
  c.moveTo(-10 * u, -48 * u); c.lineTo(hands[0][0], hands[0][1]);
  c.moveTo(10 * u, -48 * u); c.lineTo(hands[1][0], hands[1][1]); c.stroke();
  ell(c, hands[0][0], hands[0][1], 3.6 * u, 3.6 * u, L.skin);
  ell(c, hands[1][0], hands[1][1], 3.6 * u, 3.6 * u, L.skin);
  // cabeza
  if (o.tilt) { c.translate(0, hy); c.rotate(o.tilt); c.translate(0, -hy); }
  if (!P) { ell(c, -20 * u, hy + 3 * u, 4 * u, 5 * u, L.skin); ell(c, 20 * u, hy + 3 * u, 4 * u, 5 * u, L.skin); }
  ell(c, 0, hy, 21 * u, 20 * u, L.skin);
  // ojos
  const ey = hy + 2 * u;
  const blink = !o.happy && ((t + (P ? 1.7 : 0)) % 3.6) < 0.13;
  c.strokeStyle = '#3a2318'; c.lineWidth = 2.2 * u;
  if (o.happy) {
    for (const s of [-1, 1]) { c.beginPath(); c.arc(s * 7.5 * u, ey + 2 * u, 3.4 * u, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
  } else if (blink) {
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 7.5 * u - 3 * u, ey); c.lineTo(s * 7.5 * u + 3 * u, ey); c.stroke(); }
  } else {
    for (const s of [-1, 1]) { ell(c, s * 7.5 * u, ey, 2.9 * u, 3.7 * u, '#2b1a12'); ell(c, s * 7.5 * u + 1 * u, ey - 1.4 * u, 1.15 * u, 1.15 * u, '#fff'); }
    if (P) { c.lineWidth = 1.4 * u; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 10 * u, ey - 2.5 * u); c.lineTo(s * 12.3 * u, ey - 4.3 * u); c.stroke(); } }
  }
  c.fillStyle = 'rgba(255,110,140,0.45)';
  ell(c, -13 * u, hy + 8.5 * u, 4.2 * u, 2.6 * u); ell(c, 13 * u, hy + 8.5 * u, 4.2 * u, 2.6 * u);
  if (o.happy || o.open) { c.fillStyle = '#c2456a'; c.beginPath(); c.arc(0, hy + 8 * u, 3.8 * u, 0, Math.PI); c.fill(); }
  else { c.strokeStyle = '#8a3a3a'; c.lineWidth = 1.6 * u; c.beginPath(); c.arc(0, hy + 7 * u, 3.4 * u, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke(); }
  // pelo delantero
  c.fillStyle = L.hair; c.beginPath();
  c.moveTo(-22 * u, hy + 3 * u);
  c.bezierCurveTo(-25 * u, hy - 35 * u, 25 * u, hy - 35 * u, 22 * u, hy + 3 * u);
  if (P) {
    c.quadraticCurveTo(17 * u, hy - 12 * u, 6 * u, hy - 11 * u);
    c.quadraticCurveTo(1 * u, hy - 6 * u, -5 * u, hy - 12 * u);
    c.quadraticCurveTo(-15 * u, hy - 10 * u, -22 * u, hy + 3 * u);
  } else {
    c.lineTo(17 * u, hy - 8 * u); c.lineTo(12 * u, hy - 5 * u); c.lineTo(7 * u, hy - 12 * u); c.lineTo(1 * u, hy - 6 * u);
    c.lineTo(-5 * u, hy - 12 * u); c.lineTo(-11 * u, hy - 6 * u); c.lineTo(-16 * u, hy - 10 * u); c.lineTo(-22 * u, hy + 3 * u);
  }
  c.fill();
  if (P) {
    for (const s of [-1, 1]) {
      c.beginPath(); c.moveTo(s * 21 * u, hy - 5 * u);
      c.quadraticCurveTo(s * 26 * u, hy + 12 * u, s * 19 * u, hy + 23 * u);
      c.quadraticCurveTo(s * 17 * u, hy + 10 * u, s * 15.5 * u, hy - 7 * u); c.fill();
    }
    c.fillStyle = L.bow; c.beginPath();
    c.moveTo(13 * u, hy - 19 * u); c.lineTo(5 * u, hy - 27 * u); c.lineTo(6 * u, hy - 12 * u); c.closePath();
    c.moveTo(13 * u, hy - 19 * u); c.lineTo(22 * u, hy - 27 * u); c.lineTo(21 * u, hy - 12 * u); c.closePath(); c.fill();
    ell(c, 13 * u, hy - 19 * u, 2.8 * u, 2.8 * u, '#c21f3d');
  } else {
    c.strokeStyle = L.hair; c.lineWidth = 2.6 * u; c.beginPath();
    c.moveTo(0, hy - 25 * u); c.quadraticCurveTo(6 * u, hy - 34 * u, 10 * u, hy - 28 * u); c.stroke();
  }
  if (o.glasses) {
    c.fillStyle = '#ffd23f'; roundRect(c, -17 * u, ey - 5.5 * u, 34 * u, 11 * u, 3 * u); c.fill();
    c.fillStyle = '#111'; roundRect(c, -15 * u, ey - 4 * u, 13 * u, 8 * u, 2.5 * u); c.fill(); roundRect(c, 2 * u, ey - 4 * u, 13 * u, 8 * u, 2.5 * u); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(-13 * u, ey - 3 * u, 3 * u, 2 * u); c.fillRect(4 * u, ey - 3 * u, 3 * u, 2 * u);
  }
  if (o.cap) {
    c.fillStyle = o.cap; c.beginPath(); c.ellipse(0, hy - 9 * u, 22.5 * u, 17 * u, 0, Math.PI, 0); c.fill();
    c.fillRect(-22.5 * u, hy - 10 * u, 45 * u, 4 * u);
    c.beginPath(); c.ellipse(16 * u, hy - 7 * u, 15 * u, 3.6 * u, 0, 0, TAU); c.fill();
    c.fillStyle = '#ffc72c'; c.fillRect(-22.5 * u, hy - 8 * u, 45 * u, 2 * u);
    drawHeart(c, -2 * u, hy - 17 * u, 9 * u, '#ffc72c', false);
  } else {
    c.strokeStyle = L.hairHi; c.lineWidth = 2 * u; c.globalAlpha *= 0.7;
    c.beginPath(); c.arc(-4 * u, hy - 12 * u, 11 * u, Math.PI * 1.15, Math.PI * 1.45); c.stroke();
  }
  c.restore();
}

/* ---------- el chiwawa ---------- */
/* x,y = patas. h = altura hasta la punta de las orejas */
function drawChi(c, x, y, h, o = {}) {
  const u = h / 100, t = o.t != null ? o.t : Engine.t;
  const fur = '#e0ad72', furD = '#c48d52', light = '#f6dcb6';
  c.save(); c.translate(x, y);
  if (!o.noShadow) ell(c, 0, 0, 22 * u, 4 * u, 'rgba(0,0,0,0.22)');
  if (o.dir === -1) c.scale(-1, 1);
  const hop = o.hop != null ? o.hop : 0;
  c.translate(0, -hop * u);
  const wag = Math.sin(t * (o.happy ? 18 : 8)) * (o.happy ? 9 : 5) * u;
  // cola
  c.strokeStyle = furD; c.lineCap = 'round'; c.lineWidth = 5 * u;
  c.beginPath(); c.moveTo(16 * u, -12 * u); c.quadraticCurveTo(34 * u + wag * 0.3, -26 * u, 26 * u + wag, -42 * u); c.stroke();
  // cuerpo y patas
  ell(c, 0, -26 * u, 21 * u, 24 * u, fur);
  ell(c, 0, -24 * u, 11 * u, 16 * u, light);
  c.fillStyle = fur;
  for (const s of [-1, 1]) { roundRect(c, s * 9 * u - 3.5 * u, -20 * u, 7 * u, 20 * u, 3 * u); c.fill(); ell(c, s * 9 * u, -1.5 * u, 5 * u, 3 * u, light); }
  // orejas
  const earW = Math.sin(t * 3) * 1.5 * u;
  for (const s of [-1, 1]) {
    c.fillStyle = fur; c.beginPath(); c.moveTo(s * 8 * u, -76 * u); c.lineTo(s * 34 * u + s * earW, -100 * u); c.lineTo(s * 20 * u, -56 * u); c.closePath(); c.fill();
    c.fillStyle = '#ffb3b8'; c.beginPath(); c.moveTo(s * 11 * u, -73 * u); c.lineTo(s * 30 * u + s * earW, -93 * u); c.lineTo(s * 19 * u, -60 * u); c.closePath(); c.fill();
  }
  // cabeza
  ell(c, 0, -62 * u, 20 * u, 18 * u, fur);
  ell(c, 0, -54 * u, 10 * u, 7.5 * u, light);
  ell(c, 0, -69 * u, 5 * u, 7 * u, light);
  // ojos
  const blink = ((t + 0.7) % 4.1) < 0.12;
  for (const s of [-1, 1]) {
    if (blink || o.happy) { c.strokeStyle = '#2a1a12'; c.lineWidth = 2 * u; c.beginPath(); c.arc(s * 8.5 * u, -62 * u, 3.6 * u, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
    else { ell(c, s * 8.5 * u, -63 * u, 4.6 * u, 4.9 * u, '#1e130d'); ell(c, s * 8.5 * u + 1.5 * u, -64.8 * u, 1.6 * u, 1.6 * u, '#fff'); }
  }
  ell(c, 0, -57 * u, 3.3 * u, 2.4 * u, '#1e130d');
  c.fillStyle = 'rgba(255,120,140,0.4)'; ell(c, -13 * u, -55 * u, 3 * u, 2 * u); ell(c, 13 * u, -55 * u, 3 * u, 2 * u);
  if (o.happy) { c.fillStyle = '#ff7a90'; c.beginPath(); c.ellipse(0, -50 * u, 2.6 * u, 3.6 * u, 0, 0, Math.PI); c.fill(); }
  // collar verde con chapita
  c.strokeStyle = '#2fbf62'; c.lineWidth = 4 * u; c.beginPath(); c.ellipse(0, -46 * u, 12 * u, 4 * u, 0, 0.1, Math.PI - 0.1); c.stroke();
  drawHeart(c, 0, -40 * u, 8 * u, '#3ccf6e', false);
  c.restore();
}

/* ---------- vibración (móvil) ---------- */
function vib(p) { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) {} }

/* ---------- motor ---------- */
const Engine = {
  scene: null, paused: false, t: 0, last: 0, shake: 0,
  set(s) {
    if (this.scene && this.scene.destroy) this.scene.destroy();
    this.scene = s; this.paused = false;
    const f = document.getElementById('fade');
    if (f) { f.classList.remove('go'); void f.offsetWidth; f.classList.add('go'); }
    if (s && s.resize) s.resize();
  },
  frame(ts) {
    const dt = Math.min(0.05, Math.max(0, (ts - this.last) / 1000)); this.last = ts;
    this.t += dt;
    const s = this.scene;
    try {
      if (s && !this.paused && s.update) s.update(dt);
      cx.setTransform(DPR, 0, 0, DPR, 0, 0);
      cx.save();
      if (this.shake > 0.3) { cx.translate(rand(-1, 1) * this.shake, rand(-1, 1) * this.shake); this.shake *= 0.88; } else this.shake = 0;
      if (s && s.draw) s.draw(cx); else Sky.draw(cx, this.t);
      cx.restore();
    } catch (e) { console.error(e); }
    requestAnimationFrame(t => this.frame(t));
  }
};

function resize() {
  W = innerWidth; H = innerHeight; DPR = Math.min(devicePixelRatio || 1, 2);
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  cv.style.width = W + 'px'; cv.style.height = H + 'px';
  S = clamp(Math.min(W, H) / 600, 0.55, 1.5);
  Sky.resize();
  if (Engine.scene && Engine.scene.resize) Engine.scene.resize();
}
addEventListener('resize', resize);
addEventListener('orientationchange', () => setTimeout(resize, 200));

/* ---------- entrada ---------- */
const Input = { keys: {}, px: 0, py: 0, down: false, n: 0 };
cv.addEventListener('pointerdown', e => {
  e.preventDefault(); Sound.init();
  Input.down = true; Input.n++; Input.px = e.clientX; Input.py = e.clientY;
  if (!Engine.paused && Engine.scene && Engine.scene.down) Engine.scene.down(e.clientX, e.clientY, e);
});
cv.addEventListener('pointermove', e => {
  Input.px = e.clientX; Input.py = e.clientY;
  if (!Engine.paused && Engine.scene && Engine.scene.move) Engine.scene.move(e.clientX, e.clientY, e);
});
const pUp = e => {
  Input.n = Math.max(0, Input.n - 1); if (!Input.n) Input.down = false;
  if (Engine.scene && Engine.scene.up) Engine.scene.up(e.clientX, e.clientY, e);
};
addEventListener('pointerup', pUp);
addEventListener('pointercancel', pUp);
addEventListener('blur', () => { Input.down = false; Input.n = 0; Input.keys = {}; if (Engine.scene && Engine.scene.up) Engine.scene.up(0, 0); });
cv.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('gesturestart', e => e.preventDefault());

addEventListener('keydown', e => {
  const k = e.code;
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(k)) e.preventDefault();
  Sound.init();
  if (Dialog.active) { if (!e.repeat && (k === 'Space' || k === 'Enter')) Dialog.advance(); return; }
  if (k === 'Escape' || k === 'KeyP') { if (!e.repeat) onPauseKey(); return; }
  if (Input.keys[k]) return;
  Input.keys[k] = true;
  if (!Engine.paused && Engine.scene && Engine.scene.key) Engine.scene.key(k, true);
});
addEventListener('keyup', e => {
  Input.keys[e.code] = false;
  if (Engine.scene && Engine.scene.key) Engine.scene.key(e.code, false);
});
