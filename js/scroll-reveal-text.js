/**
 * scroll-reveal-text.js
 * 文字段落在進入視窗時依序淡入浮現，顯示後永久保持（不再消失）
 */

(function () {
  const targets = document.querySelectorAll('.reveal-text');
  if (!targets.length) return;

  const STAGGER_MS = 600; // 每句之間錯開的時間

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const index = Array.from(targets).indexOf(el);
        setTimeout(() => {
          el.classList.add('is-visible');
        }, index * STAGGER_MS);

        // 顯示後就不再需要觀察，避免重複觸發
        observer.unobserve(el);
      }
    });
  }, {
    threshold: 0.7, // 元素進入視窗 70% 時觸發
  });

  targets.forEach((el) => observer.observe(el));
})();