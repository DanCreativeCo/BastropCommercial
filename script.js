const header = document.getElementById("site-header");
const menuToggle = document.getElementById("menu-toggle");
const mobileNav = document.getElementById("mobile-nav");
const currentYear = String(new Date().getFullYear());
const stickyCta = document.querySelector(".sticky-cta");
const footer = document.querySelector(".footer");
const parallaxLayers = Array.from(
  document.querySelectorAll(
    ".hero__image, .listing-hero img, .subpage-hero__grid img:not(.about-portrait), .listing-card img, .agent__media img, .insight-card img"
  )
);
const prefersReduceParallax = window.matchMedia("(prefers-reduced-motion: reduce)");
const mobileParallaxMedia = window.matchMedia("(max-width: 639px)");
const desktopCarouselMedia = window.matchMedia("(min-width: 900px)");
const PARALLAX_SPEED_DEFAULT = 0.12;
const PARALLAX_SPEED_HERO = 0.16;
const PARALLAX_SPEED_CONTENT = 0.06;
const PARALLAX_OFFSET_LIMIT = 32;
const PARALLAX_MOBILE_OFFSET_LIMIT = 12;

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
      isVisible: true,
      speed: layer.classList.contains("hero__image")
        ? PARALLAX_SPEED_HERO
        : layer.closest(".listing-card, .agent__media, .insight-card")
          ? PARALLAX_SPEED_CONTENT
          : parseFloat(layer.dataset.parallaxSpeed) || PARALLAX_SPEED_DEFAULT,
    };
  });
  let parallaxFrame;

  const setParallaxOffsets = () => {
    if (prefersReduceParallax.matches) return;
    const limit = mobileParallaxMedia.matches
      ? PARALLAX_MOBILE_OFFSET_LIMIT
      : PARALLAX_OFFSET_LIMIT;

    layers.forEach((entry) => {
      if (!entry.isVisible) return;
      const top = entry.node.getBoundingClientRect().top;
      const offset = Math.max(
        -limit,
        Math.min(limit, -top * entry.speed)
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

  if ("IntersectionObserver" in window) {
    const parallaxObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const layer = layers.find((item) => item.node === entry.target);
          if (!layer) return;
          layer.isVisible = entry.isIntersecting;
          if (entry.isIntersecting) requestParallaxUpdate();
        });
      },
      { rootMargin: "20% 0px" }
    );

    layers.forEach((entry) => parallaxObserver.observe(entry.node));
  }

  window.addEventListener("scroll", requestParallaxUpdate, { passive: true });
  window.addEventListener("resize", requestParallaxUpdate);
  prefersReduceParallax.addEventListener("change", handleParallaxPreference);
  mobileParallaxMedia.addEventListener("change", requestParallaxUpdate);
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
