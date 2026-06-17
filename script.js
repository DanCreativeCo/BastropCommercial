const header = document.getElementById("site-header");
const menuToggle = document.getElementById("menu-toggle");
const mobileNav = document.getElementById("mobile-nav");
const currentYear = String(new Date().getFullYear());
const stickyCta = document.querySelector(".sticky-cta");
const footer = document.querySelector(".footer");
const parallaxLayers = Array.from(
  document.querySelectorAll(".hero__image, .listing-hero img, .subpage-hero__grid img:not(.about-portrait)")
);
const prefersReduceParallax = window.matchMedia("(prefers-reduced-motion: reduce)");
const desktopCarouselMedia = window.matchMedia("(min-width: 900px)");
const PARALLAX_SPEED_DEFAULT = 0.12;
const PARALLAX_SPEED_HERO = 0.2;
const PARALLAX_OFFSET_LIMIT = 24;

document.querySelectorAll(".footer-year").forEach((el) => {
  el.textContent = currentYear;
});

const syncHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 20);
};

syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });

if (parallaxLayers.length) {
  const layers = parallaxLayers.map((layer) => {
    layer.classList.add("parallax-layer");
    return {
      node: layer,
      speed: layer.classList.contains("hero__image")
        ? PARALLAX_SPEED_HERO
        : parseFloat(layer.dataset.parallaxSpeed) || PARALLAX_SPEED_DEFAULT,
    };
  });
  let parallaxFrame;

  const setParallaxOffsets = () => {
    if (prefersReduceParallax.matches) return;

    layers.forEach((entry) => {
      const top = entry.node.getBoundingClientRect().top;
      const offset = Math.max(
        -PARALLAX_OFFSET_LIMIT,
        Math.min(PARALLAX_OFFSET_LIMIT, -top * entry.speed)
      );
      entry.node.style.setProperty("--parallax-offset", `${offset}px`);
    });
  };

  const requestParallaxUpdate = () => {
    if (parallaxFrame) {
      window.cancelAnimationFrame(parallaxFrame);
    }
    parallaxFrame = window.requestAnimationFrame(setParallaxOffsets);
  };

  const handleParallaxPreference = () => {
    if (parallaxFrame) window.cancelAnimationFrame(parallaxFrame);
    if (prefersReduceParallax.matches) {
      layers.forEach((entry) =>
        entry.node.style.setProperty("--parallax-offset", "0px")
      );
      return;
    }
    requestParallaxUpdate();
  };

  window.addEventListener("scroll", requestParallaxUpdate, { passive: true });
  window.addEventListener("resize", requestParallaxUpdate);
  prefersReduceParallax.addEventListener("change", handleParallaxPreference);
  handleParallaxPreference();
  requestParallaxUpdate();
}

if (stickyCta && footer) {
  let ctaFrame;

  const syncStickyCta = () => {
    const ctaHeight = stickyCta.getBoundingClientRect().height || 52;
    const footerTop = footer.getBoundingClientRect().top;
    const overlapPoint = window.innerHeight - ctaHeight - 12;
    const shouldHide = footerTop < overlapPoint;

    stickyCta.classList.toggle("is-over-footer", shouldHide);
  };

  const requestStickySync = () => {
    if (ctaFrame) window.cancelAnimationFrame(ctaFrame);
    ctaFrame = window.requestAnimationFrame(syncStickyCta);
  };

  syncStickyCta();
  window.addEventListener("scroll", requestStickySync, { passive: true });
  window.addEventListener("resize", requestStickySync);
}

menuToggle?.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  header?.classList.toggle("menu-open", !isOpen);
  if (isOpen) {
    mobileNav?.classList.remove("is-open");
    window.setTimeout(() => {
      if (menuToggle.getAttribute("aria-expanded") === "false") {
        mobileNav?.setAttribute("hidden", "");
      }
    }, 260);
  } else {
    mobileNav?.removeAttribute("hidden");
    window.requestAnimationFrame(() => mobileNav?.classList.add("is-open"));
  }
});

mobileNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle?.setAttribute("aria-expanded", "false");
    header?.classList.remove("menu-open");
    mobileNav?.classList.remove("is-open");
    window.setTimeout(() => {
      if (menuToggle?.getAttribute("aria-expanded") === "false") {
        mobileNav?.setAttribute("hidden", "");
      }
    }, 260);
  });
});

document.querySelectorAll("[data-carousel]").forEach((carousel) => {
  const track = carousel.querySelector("[data-carousel-track]");
  const prev = carousel.querySelector("[data-carousel-prev]");
  const next = carousel.querySelector("[data-carousel-next]");

  if (!track || !prev || !next) return;

  const cards = Array.from(track.querySelectorAll(".listing-card"));

  const setActiveCard = () => {
    if (!cards.length) return;
    if (!desktopCarouselMedia.matches) {
      cards.forEach((card) => card.classList.remove("is-active"));
      return;
    }

    const trackCenter = track.scrollLeft + track.clientWidth / 2;
    let active = cards[0];
    let closestDistance = Infinity;

    cards.forEach((card) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(trackCenter - cardCenter);

      if (distance < closestDistance) {
        active = card;
        closestDistance = distance;
      }
    });

    cards.forEach((card) => card.classList.toggle("is-active", card === active));
  };

  let scrollFrame;
  const requestActiveCardUpdate = () => {
    window.cancelAnimationFrame(scrollFrame);
    scrollFrame = window.requestAnimationFrame(setActiveCard);
  };

  const scrollByCard = (direction) => {
    const card = track.querySelector(".listing-card");
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const distance = card ? card.getBoundingClientRect().width + gap : track.clientWidth;

    track.scrollBy({
      left: direction * distance,
      behavior: "smooth",
    });
  };

  setActiveCard();
  track.addEventListener("scroll", requestActiveCardUpdate, { passive: true });
  window.addEventListener("resize", requestActiveCardUpdate);
  desktopCarouselMedia.addEventListener("change", requestActiveCardUpdate);
  prev.addEventListener("click", () => scrollByCard(-1));
  next.addEventListener("click", () => scrollByCard(1));
});

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px 18% 0px" }
  );

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}
