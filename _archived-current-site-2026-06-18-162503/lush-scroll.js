const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const mobileScroll = window.matchMedia("(pointer: coarse), (max-width: 639px)");
const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);
const shouldUseLushMotion = () => !reducedMotion.matches && !mobileScroll.matches;

const initSmoothAnchors = () => {
  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;

    const hash = link.getAttribute("href");
    if (!hash || hash === "#") return;

    const target = document.querySelector(hash);
    if (!target) return;

    event.preventDefault();
    const headerHeight = document.getElementById("site-header")?.offsetHeight || 0;
    const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 12;

    window.scrollTo({
      top,
      behavior: reducedMotion.matches ? "auto" : "smooth",
    });
  });
};

const initLenis = async () => {
  if (!shouldUseLushMotion()) return;

  try {
    const { default: Lenis } = await import("https://cdn.jsdelivr.net/npm/lenis@1.3.4/+esm");
    const lenis = new Lenis({
      duration: 1.08,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
    });

    const raf = (time) => {
      lenis.raf(time);
      window.requestAnimationFrame(raf);
    };

    window.requestAnimationFrame(raf);
    const destroyOnMotionChange = () => lenis.destroy();
    reducedMotion.addEventListener("change", destroyOnMotionChange, { once: true });
    mobileScroll.addEventListener("change", destroyOnMotionChange, { once: true });
  } catch {
    document.documentElement.style.scrollBehavior = reducedMotion.matches ? "auto" : "smooth";
  }
};

const initReveals = () => {
  document.querySelectorAll(".reveal-stagger").forEach((group) => {
    Array.from(group.children).forEach((child, index) => {
      child.style.setProperty("--lush-delay", `${Math.min(index * 72, 432)}ms`);
    });
  });

  if (!("IntersectionObserver" in window)) {
    document.querySelectorAll(".reveal").forEach((element) => element.classList.add("lush-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("lush-visible", "is-visible");
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px 14% 0px" }
  );

  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
};

const initScrollEffects = () => {
  const heroSections = Array.from(document.querySelectorAll("[data-hero-exit]"));
  const parallaxItems = [
    ...document.querySelectorAll("[data-parallax]"),
    ...document.querySelectorAll(".listing-card img"),
  ];
  const corridorSections = Array.from(document.querySelectorAll("[data-corridor-reveal]"));
  let frame = 0;

  const sync = () => {
    frame = 0;

    if (!shouldUseLushMotion()) {
      heroSections.forEach((section) => {
        section.style.setProperty("--hero-exit", "0");
        section.classList.remove("is-hero-pinned", "is-hero-released");
      });
      parallaxItems.forEach((item) => item.style.setProperty("--lush-parallax", "0"));
      corridorSections.forEach((section) => {
        section.querySelector(".corridor-strip")?.style.setProperty("--corridor-shift-x", "0");
      });
      return;
    }

    const viewportHeight = window.innerHeight || 1;

    heroSections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const travel = Math.max(rect.height - viewportHeight, viewportHeight * 0.5);
      const progress = clamp(-rect.top / travel);
      section.style.setProperty("--hero-exit", progress.toFixed(3));
    });

    parallaxItems.forEach((item) => {
      const rect = item.getBoundingClientRect();
      if (rect.bottom < -80 || rect.top > viewportHeight + 80) return;

      const speed = Number.parseFloat(item.dataset.parallax || "0.22");
      const centerOffset = rect.top + rect.height / 2 - viewportHeight / 2;
      item.style.setProperty("--lush-parallax", (-centerOffset * speed).toFixed(2));
    });

    corridorSections.forEach((section) => {
      const strip = section.querySelector(".corridor-strip");
      if (!strip) return;

      const rect = section.getBoundingClientRect();
      const progress = clamp((viewportHeight * 0.82 - rect.top) / Math.max(viewportHeight + rect.height, 1));
      const maxShift = Math.max(strip.scrollWidth - strip.clientWidth, 0);
      strip.style.setProperty("--corridor-shift-x", `${(-maxShift * progress).toFixed(2)}`);
    });
  };

  const requestSync = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(sync);
  };

  sync();
  window.addEventListener("scroll", requestSync, { passive: true });
  window.addEventListener("resize", requestSync);
  reducedMotion.addEventListener("change", requestSync);
  mobileScroll.addEventListener("change", requestSync);
};

initSmoothAnchors();
initReveals();
initScrollEffects();
initLenis();
