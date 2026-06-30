/**
 * char-reveal-text.js
 * 逐字從右側飄入的打字機效果
 * 進入視窗時自動將文字拆成單字 span，依序從右側淡入飄入
 * 顯示後永久保持（不再消失），保留原本的 <br> 換行
 */

(function () {
  const targets = document.querySelectorAll('.char-reveal');
  if (!targets.length) return;

  const CHAR_DELAY_MS = 200; // 每個字之間的間隔時間（縮短，減少行間停頓感）

  // 將元素內的文字節點拆成逐字 <span>，<br> 保留原樣
  // 空白字元（含縮排用空格）保留視覺呈現以維持排版，但不計入動畫延遲序列
  function wrapChars(node, container) {
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent;
        for (const ch of text) {
          const span = document.createElement('span');
          const isWhitespace = /\s/.test(ch);
          // char-space：純空白，立即顯示、不參與逐字延遲動畫
          // char-unit：實際文字，參與逐字飄入動畫
          span.className = isWhitespace ? 'char-space' : 'char-unit';
          span.textContent = ch;
          container.appendChild(span);
        }
      } else if (child.nodeName === 'BR') {
        container.appendChild(document.createElement('br'));
      } else {
        // 其他元素（理論上此處不會用到，保險起見直接搬移）
        container.appendChild(child.cloneNode(true));
      }
    });
  }

  targets.forEach((el) => {
    const original = el.cloneNode(true);
    el.innerHTML = '';
    wrapChars(original, el);
  });

  const allCharTargets = document.querySelectorAll('.char-reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        // 空白字元一律立即顯示（撐出排版用，不參與動畫節奏）
        el.querySelectorAll('.char-space').forEach((spaceEl) => {
          spaceEl.classList.add('is-visible');
        });
        // 只對實際文字字元計算逐字延遲，空白不佔用 index
        const chars = el.querySelectorAll('.char-unit');
        chars.forEach((charEl, i) => {
          setTimeout(() => {
            charEl.classList.add('is-visible');
          }, i * CHAR_DELAY_MS);
        });
        observer.unobserve(el);
      }
    });
  }, {
    threshold: 0.8, // 降低門檻，讓 h2 與 p 幾乎同時觸發，減少先後落差
  });

  allCharTargets.forEach((el) => observer.observe(el));
})();