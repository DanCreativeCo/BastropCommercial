const year = document.querySelector("[data-year]");

if (year) {
  year.textContent = String(new Date().getFullYear());
}

const countTargets = Array.from(document.querySelectorAll("[data-count-to]"));

if (countTargets.length) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const formatCount = (node, value) => {
    node.textContent = `${node.dataset.countPrefix || ""}${value}${node.dataset.countSuffix || ""}`;
  };
  const finishCounts = () => {
    countTargets.forEach((node) => {
      formatCount(node, Number(node.dataset.countTo));
    });
  };

  if (reduceMotion) {
    finishCounts();
  } else {
    countTargets.forEach((node) => {
      formatCount(node, 0);
    });

    let hasCounted = false;
    const runCounts = () => {
      if (hasCounted) {
        return;
      }

      hasCounted = true;
      const duration = 650;
      const start = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);

        countTargets.forEach((node) => {
          const target = Number(node.dataset.countTo);
          formatCount(node, Math.round(target * eased));
        });

        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          finishCounts();
        }
      };

      requestAnimationFrame(tick);
    };

    ["scroll", "wheel", "touchmove"].forEach((eventName) => {
      window.addEventListener(eventName, runCounts, { once: true, passive: true });
    });
  }
}
