const year = document.querySelector("[data-year]");

if (year) {
  year.textContent = String(new Date().getFullYear());
}

const countTargets = Array.from(document.querySelectorAll("[data-count-to]"));

if (countTargets.length) {
  const proofGrid = document.querySelector(".proof-grid");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const formatCount = (node, value) => {
    node.textContent = `${node.dataset.countPrefix || ""}${value}${node.dataset.countSuffix || ""}`;
  };
  const finishCounts = () => {
    countTargets.forEach((node) => {
      formatCount(node, Number(node.dataset.countTo));
      node.classList.remove("is-counting");
      node.classList.add("is-settled");
    });
    proofGrid?.classList.remove("is-counting");
  };

  if (reduceMotion) {
    finishCounts();
  } else {
    countTargets.forEach((node, index) => {
      formatCount(node, 0);
      node.style.setProperty("--count-delay", `${index * 80}ms`);
    });

    let hasCounted = false;
    const runCounts = () => {
      if (hasCounted) {
        return;
      }

      hasCounted = true;
      proofGrid?.classList.add("is-counting");
      proofGrid?.querySelectorAll(":scope > div").forEach((card, index) => {
        card.style.setProperty("--stat-index", index);
      });

      countTargets.forEach((node) => {
        node.classList.add("is-counting");
      });

      const duration = 980;
      const start = performance.now();

      const tick = (now) => {
        let hasActiveCount = false;

        countTargets.forEach((node, index) => {
          const delay = index * 80;
          const progress = Math.min(Math.max((now - start - delay) / duration, 0), 1);
          const eased = 1 - Math.pow(1 - progress, 4);
          const target = Number(node.dataset.countTo);

          formatCount(node, Math.round(target * eased));

          if (progress < 1) {
            hasActiveCount = true;
          }
        });

        if (hasActiveCount) {
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
