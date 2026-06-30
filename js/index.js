const slides = document.querySelectorAll('.testimonial-slide');
const dots = document.querySelectorAll('.dot');
let current = 0;

window.addEventListener('scroll', () => {
    const nav = document.getElementById('mainNav');
    // 當頁面滾動超過 300px 時，顯示導覽列
    if (window.scrollY > 500) {
        nav.classList.add('visible');
    } else {
        nav.classList.remove('visible');
    }
});

function goTo(index) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = index;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
}

// 點擊 dot 切換
dots.forEach((dot, i) => {
    dot.addEventListener('click', () => goTo(i));
});

// 自動輪播
setInterval(() => {
    goTo((current + 1) % slides.length);
}, 5000);

const canvas = document.getElementById('heroCanvas');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}
resize();
window.addEventListener('resize', resize);

// 幾個大色塊，顏色在深藍系裡微微變化
const blobs = [
    { x: 0.2, y: 0.3, r: 0.55, vx: 0.00020, vy: 0.00015, color: [15, 55, 80]  },  // 偏藍綠
    { x: 0.7, y: 0.6, r: 0.65, vx: -0.00015, vy: 0.00020, color: [30, 20, 60]  },  // 偏深紫
    { x: 0.5, y: 0.8, r: 0.60, vx: 0.00010, vy: -0.00025, color: [8,  50, 65]  },  // 偏墨綠藍
    { x: 0.1, y: 0.7, r: 0.50, vx: 0.00025, vy: -0.00010, color: [20, 15, 50]  },  // 深紫
    { x: 0.8, y: 0.2, r: 0.55, vx: -0.00020, vy: 0.00015, color: [10, 45, 70]  },  // 深青藍
];

let t = 0;

function draw() {
    t++;
    const w = canvas.width;
    const h = canvas.height;

    // 深水底色
    ctx.fillStyle = '#0b1d2e';
    ctx.fillRect(0, 0, w, h);

    // 色塊漂移
    blobs.forEach(b => {
        b.x += b.vx;
        b.y += b.vy;

        // 邊界反彈
        if (b.x < 0 || b.x > 1) b.vx *= -1;
        if (b.y < 0 || b.y > 1) b.vy *= -1;

        const cx = b.x * w;
        const cy = b.y * h;
        const r = b.r * Math.min(w, h);

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        const [R, G, B] = b.color;
        grad.addColorStop(0, `rgba(${R},${G},${B},50)`);
        grad.addColorStop(1, `rgba(${R},${G},${B},-20)`);

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
    });

    requestAnimationFrame(draw);
}

draw();

