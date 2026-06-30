/**
 * hero-char-reveal.js
 * Hero 區塊（標題「記憶之河」與副標「潛意識的深度覺察」）的逐字飄入動畫。
 * 與 char-reveal-text.js（滾動觸發版）邏輯相同，但這裡是頁面載入後立即播放，
 * 且標題與副標「接續」播放：標題逐字跑完才開始播副標。
 */

(function () {
  const targets = document.querySelectorAll('.char-reveal-hero');
  if (!targets.length) return;

  const CHAR_DELAY_MS = 300; // 每個字之間的間隔時間

  // 將元素內的文字節點拆成逐字 <span>，空白字元保留排版但不參與動畫
  function wrapChars(node, container) {
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent;
        for (const ch of text) {
          const span = document.createElement('span');
          const isWhitespace = /\s/.test(ch);
          span.className = isWhitespace ? 'char-space' : 'char-unit';
          span.textContent = ch;
          container.appendChild(span);
        }
      } else if (child.nodeName === 'BR') {
        container.appendChild(document.createElement('br'));
      } else {
        container.appendChild(child.cloneNode(true));
      }
    });
  }

  targets.forEach((el) => {
    const original = el.cloneNode(true);
    el.innerHTML = '';
    wrapChars(original, el);
  });

  // 依文件順序排列（title 在前，subtitle 在後），確保接續播放順序正確
  const orderedTargets = Array.from(targets);

  function revealElement(el, onDone) {
    el.querySelectorAll('.char-space').forEach((spaceEl) => {
      spaceEl.classList.add('is-visible');
    });

    const chars = el.querySelectorAll('.char-unit');
    chars.forEach((charEl, i) => {
      setTimeout(() => {
        charEl.classList.add('is-visible');
      }, i * CHAR_DELAY_MS);
    });

    // 該元素全部字元播放完畢後才呼叫 onDone，銜接下一個元素
    const totalDuration = chars.length * CHAR_DELAY_MS;
    setTimeout(onDone, totalDuration);
  }

  function playSequence(index) {
    if (index >= orderedTargets.length) return;
    revealElement(orderedTargets[index], () => playSequence(index + 1));
  }

  playSequence(0);
})();