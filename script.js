
(function () {
  const track   = document.getElementById("page-track");
  const pages   = Array.from(document.querySelectorAll(".magazine-page"));
  const btnPrev = document.getElementById("arrow-prev");
  const btnNext = document.getElementById("arrow-next");
  const counter = document.getElementById("page-counter");
  const total   = pages.length;
  let   current = 0;
  let   animating = false;

  // ── Scale each page to fit inside the viewport ──
  function scaleAll() {
    document.querySelectorAll(".page-clip").forEach(clip => {
      const vw = window.innerWidth  - 120;
      const vh = window.innerHeight -  40;
      const pw = parseFloat(clip.style.width);
      const ph = parseFloat(clip.style.height);
      const scale = Math.min(vw / pw, vh / ph, 1);
      clip.style.transform = "scale(" + scale + ")";
      clip.style.transformOrigin = "center center";
    });
  }

  // ── Navigate: each slot is exactly 100vw wide so adjacent pages are
  //    always a full screen away and never visible ──
  function goTo(idx, skipAnim) {
    if (idx < 0 || idx >= total || animating) return;
    current = idx;

    if (skipAnim) track.style.transition = "none";
    track.style.transform = "translateX(calc(" + (-idx) + " * 100vw))";
    if (skipAnim) requestAnimationFrame(() => { track.style.transition = ""; });

    btnPrev.classList.toggle("hidden", current === 0);
    btnNext.classList.toggle("hidden", current === total - 1);
    counter.textContent = (current + 1) + " / " + total;

    // Fire page animations once per session
    pages[current].querySelectorAll("[data-anim]").forEach(el => {
      if (!el.dataset.animFired) {
        el.style.animation = el.dataset.anim;
        el.dataset.animFired = "1";
      }
    });

    animating = true;
    setTimeout(() => { animating = false; }, 500);
  }

  // ── Arrow clicks ──
  btnPrev.addEventListener("click", () => goTo(current - 1));
  btnNext.addEventListener("click", () => goTo(current + 1));

  // ── Keyboard ──
  document.addEventListener("keydown", e => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") goTo(current + 1);
    if (e.key === "ArrowLeft"  || e.key === "ArrowUp")   goTo(current - 1);
  });

  // ── Swipe / mouse drag ──
  let startX = null, dragging = false;
  const SWIPE_THRESHOLD = 50;

  function onStart(x) { startX = x; dragging = true; }
  function onEnd(x) {
    if (!dragging) return;
    dragging = false;
    const dx = x - startX;
    if      (dx < -SWIPE_THRESHOLD) goTo(current + 1);
    else if (dx >  SWIPE_THRESHOLD) goTo(current - 1);
  }

  track.addEventListener("touchstart", e => onStart(e.touches[0].clientX), { passive: true });
  track.addEventListener("touchend",   e => onEnd(e.changedTouches[0].clientX), { passive: true });
  track.addEventListener("mousedown",  e => { onStart(e.clientX); e.preventDefault(); });
  window.addEventListener("mouseup",   e => onEnd(e.clientX));

  // ── Resize ──
  window.addEventListener("resize", () => { scaleAll(); goTo(current, true); });

  // ── Init ──
  scaleAll();
  goTo(0, true);
})();
