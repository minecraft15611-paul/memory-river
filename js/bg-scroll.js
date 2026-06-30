/**
 * bg-scroll.js
 * 全頁固定背景層，隨滾動在錨點色之間線性插值
 * 效果：光源從水面（頂部）緩緩沉入深海（底部）
 * 並疊加浮動發光粒子，越往深處越明顯，避免底部死黑
 */

(function () {
  // 建立固定背景層
  const bg = document.createElement('div');
  bg.id = 'bg-layer';
  document.body.prepend(bg);

  // 建立粒子畫布層（疊在 bg-layer 之上，仍在內容之下）
  const canvas = document.createElement('canvas');
  canvas.id = 'bg-particles';
  document.body.insertBefore(canvas, bg.nextSibling);
  const ctx = canvas.getContext('2d');

  /**
   * 錨點定義：[滾動比例 0~1, 背景色, radial 光暈色, 光暈中心 Y%]
   */
  const keyframes = [
    { t: 0.00, base: '#0b1d2e', glow: '#1a3a56', cx: 50, cy: 10 },
    { t: 0.20, base: '#091826', glow: '#163248', cx: 40, cy: 30 },
    { t: 0.42, base: '#080f1c', glow: '#0e2035', cx: 60, cy: 50 },
    { t: 0.62, base: '#060d18', glow: '#0a1a2e', cx: 45, cy: 65 },
    { t: 0.80, base: '#050b14', glow: '#081526', cx: 55, cy: 78 },
    { t: 1.00, base: '#030810', glow: '#060f1e', cx: 50, cy: 90 },
  ];

  function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function lerpColor(hexA, hexB, t) {
    const a = hexToRgb(hexA), b = hexToRgb(hexB);
    return `rgb(${Math.round(lerp(a[0], b[0], t))},${Math.round(lerp(a[1], b[1], t))},${Math.round(lerp(a[2], b[2], t))})`;
  }

  let currentProgress = 0;

  function update() {
    const scrollY   = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress  = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0;
    currentProgress = progress;

    let from = keyframes[0], to = keyframes[1];
    for (let i = 0; i < keyframes.length - 1; i++) {
      if (progress >= keyframes[i].t && progress <= keyframes[i + 1].t) {
        from = keyframes[i];
        to   = keyframes[i + 1];
        break;
      }
    }

    const span = to.t - from.t || 0.001;
    const local = (progress - from.t) / span;

    const base = lerpColor(from.base, to.base, local);
    const glow = lerpColor(from.glow, to.glow, local);
    const cx   = lerp(from.cx, to.cx, local).toFixed(1);
    const cy   = lerp(from.cy, to.cy, local).toFixed(1);

    bg.style.background = `
      radial-gradient(ellipse 70% 55% at ${cx}% ${cy}%, ${glow} 0%, transparent 70%),
      ${base}
    `;
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => { update(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });

  update();

  /* ---------- 浮動發光粒子（深海生物感） ---------- */

  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const PARTICLE_COUNT = 108; // 總粒子池，依深度決定有多少顆顯示
  const DRIFT_SPEED_MULTIPLIER = 0.48; // 飄移速度倍率，數字越大飄得越快（原為 0.05）

  function rand(min, max) { return Math.random() * (max - min) + min; }

  const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
    x: rand(0, 1),              // 相對位置 0~1（依視窗縮放）
    y: rand(0, 1),
    r: rand(0.6, 2.2),           // 半徑 px
    baseAlpha: rand(0.15, 0.55), // 基礎亮度
    phase: rand(0, Math.PI * 2), // 閃爍相位
    speed: rand(0.0015, 0.004),  // 閃爍速度
    driftX: rand(-0.04, 0.04),   // 每秒飄移量（相對位置）
    driftY: rand(-0.025, -0.06), // 緩慢向上飄（像氣泡）/ 負值=往上
    hue: Math.random() > 0.5 ? '197,224,255' : '197,160,89', // 多數冷白光，少數金光
  }));

  let lastTime = performance.now();

  function drawParticles(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 深度因子：越往下滾動，可見粒子越多、越亮（避免底部死黑）
    const depthFactor = 0.25 + currentProgress * 0.85; // 0.25 ~ 1.1
    const visibleCount = Math.round(PARTICLE_COUNT * Math.min(depthFactor, 1));

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // 緩慢飄移，超出邊界從另一側循環出現
      p.x += p.driftX * dt * DRIFT_SPEED_MULTIPLIER;
      p.y += p.driftY * dt * DRIFT_SPEED_MULTIPLIER;
      if (p.y < -0.05) p.y = 1.05;
      if (p.x < -0.05) p.x = 1.05;
      if (p.x > 1.05) p.x = -0.05;

      p.phase += p.speed * dt * 60;

      // 只渲染深度因子允許範圍內的粒子（依索引決定優先層級）
      if (i >= visibleCount) continue;

      const flicker = (Math.sin(p.phase) + 1) / 2; // 0~1
      const alpha = p.baseAlpha * (0.4 + flicker * 0.6) * Math.min(depthFactor, 1);

      const px = p.x * canvas.width;
      const py = p.y * canvas.height;

      const grad = ctx.createRadialGradient(px, py, 0, px, py, p.r * 4);
      grad.addColorStop(0, `rgba(${p.hue}, ${alpha})`);
      grad.addColorStop(1, `rgba(${p.hue}, 0)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, p.r * 4, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(drawParticles);
  }

  requestAnimationFrame(drawParticles);
})();