const header = document.getElementById("site-header");
const menuToggle = document.getElementById("menu-toggle");
const mobileNav = document.getElementById("mobile-nav");
const currentYear = String(new Date().getFullYear());
const stickyCta = document.querySelector(".sticky-cta");
const footer = document.querySelector(".footer");
const desktopCarouselMedia = window.matchMedia("(min-width: 900px)");
const customSelectMedia = window.matchMedia("(max-width: 639px)");
const reducedMotionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");

document.querySelectorAll(".footer-year").forEach((el) => {
  el.textContent = currentYear;
});

const syncHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 20);
};

syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });

const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);

document.querySelectorAll("[data-hero-exit]").forEach((hero) => {
  let heroFrame;

  const syncHeroExit = () => {
    heroFrame = undefined;

    if (reducedMotionMedia.matches) {
      hero.style.setProperty("--hero-exit", "0");
      return;
    }

    const rect = hero.getBoundingClientRect();
    const progress = clamp(-rect.top / Math.max(rect.height * 0.58, 1));

    hero.style.setProperty("--hero-exit", progress.toFixed(3));
  };

  const requestHeroExitSync = () => {
    if (heroFrame) return;
    heroFrame = window.requestAnimationFrame(syncHeroExit);
  };

  syncHeroExit();
  window.addEventListener("scroll", requestHeroExitSync, { passive: true });
  window.addEventListener("resize", requestHeroExitSync);
  reducedMotionMedia.addEventListener("change", requestHeroExitSync);
});

document.querySelectorAll("[data-listing-reveal]").forEach((section) => {
  const cards = Array.from(section.querySelectorAll(".listing-card"));
  let listingFrame;

  cards.forEach((card, index) => {
    card.style.setProperty("--card-index", String(index));
  });

  const syncListingReveal = () => {
    listingFrame = undefined;

    if (reducedMotionMedia.matches) {
      cards.forEach((card) => card.classList.add("is-scroll-revealed"));
      return;
    }

    const rect = section.getBoundingClientRect();
    const progress = clamp((window.innerHeight * 0.58 - rect.top) / Math.max(window.innerHeight * 0.72, 1));
    const visibleCount = Math.floor(progress * (cards.length + 1));

    cards.forEach((card, index) => {
      card.classList.toggle("is-scroll-revealed", index < visibleCount);
    });
  };

  const requestListingRevealSync = () => {
    if (listingFrame) return;
    listingFrame = window.requestAnimationFrame(syncListingReveal);
  };

  syncListingReveal();
  window.addEventListener("scroll", requestListingRevealSync, { passive: true });
  window.addEventListener("resize", requestListingRevealSync);
  reducedMotionMedia.addEventListener("change", requestListingRevealSync);
});

document.querySelectorAll("[data-corridor-reveal]").forEach((section) => {
  const boxes = Array.from(section.querySelectorAll(".corridor-strip article"));
  let corridorFrame;

  boxes.forEach((box, index) => {
    box.style.setProperty("--corridor-index", String(index));
  });

  const syncCorridorReveal = () => {
    corridorFrame = undefined;

    if (reducedMotionMedia.matches) {
      boxes.forEach((box) => box.classList.add("is-scroll-revealed"));
      return;
    }

    const rect = section.getBoundingClientRect();
    const progress = clamp((window.innerHeight * 0.82 - rect.top) / Math.max(window.innerHeight * 0.58, 1));
    const visibleCount = Math.floor(progress * (boxes.length + 1));

    boxes.forEach((box, index) => {
      box.classList.toggle("is-scroll-revealed", index < visibleCount);
    });
  };

  const requestCorridorRevealSync = () => {
    if (corridorFrame) return;
    corridorFrame = window.requestAnimationFrame(syncCorridorReveal);
  };

  syncCorridorReveal();
  window.addEventListener("scroll", requestCorridorRevealSync, { passive: true });
  window.addEventListener("resize", requestCorridorRevealSync);
  reducedMotionMedia.addEventListener("change", requestCorridorRevealSync);
});

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

document.querySelectorAll('select[name="interest"]').forEach((select, selectIndex) => {
  const trigger = document.createElement("button");
  const triggerText = document.createElement("span");
  const modal = document.createElement("div");
  const panel = document.createElement("div");
  const title = document.createElement("strong");
  const close = document.createElement("button");
  const list = document.createElement("div");

  trigger.type = "button";
  trigger.className = "custom-select-trigger";
  trigger.setAttribute("aria-haspopup", "dialog");
  trigger.setAttribute("aria-expanded", "false");
  triggerText.textContent = select.options[select.selectedIndex]?.textContent || "Select interest";
  trigger.append(triggerText);

  modal.className = "select-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-labelledby", `interest-modal-title-${selectIndex}`);
  modal.hidden = true;

  panel.className = "select-modal__panel";
  title.className = "select-modal__title";
  title.id = `interest-modal-title-${selectIndex}`;
  title.textContent = "Select interest";

  close.type = "button";
  close.className = "select-modal__close";
  close.setAttribute("aria-label", "Close interest picker");
  close.textContent = "Close";

  list.className = "select-modal__list";

  Array.from(select.options).forEach((option, optionIndex) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "select-modal__option";
    item.textContent = option.textContent;
    item.addEventListener("click", () => {
      select.selectedIndex = optionIndex;
      triggerText.textContent = option.textContent;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      closeModal();
    });
    list.append(item);
  });

  const syncSelected = () => {
    Array.from(list.children).forEach((item, optionIndex) => {
      item.classList.toggle("is-selected", optionIndex === select.selectedIndex);
      item.setAttribute("aria-pressed", String(optionIndex === select.selectedIndex));
    });
  };

  const openModal = () => {
    if (!customSelectMedia.matches) {
      select.focus();
      return;
    }

    syncSelected();
    modal.hidden = false;
    document.body.classList.add("select-modal-open");
    trigger.setAttribute("aria-expanded", "true");
    window.requestAnimationFrame(() => modal.classList.add("is-open"));
    list.children[select.selectedIndex]?.focus();
  };

  function closeModal() {
    modal.classList.remove("is-open");
    document.body.classList.remove("select-modal-open");
    trigger.setAttribute("aria-expanded", "false");
    window.setTimeout(() => {
      if (!modal.classList.contains("is-open")) modal.hidden = true;
    }, 220);
    trigger.focus();
  }

  close.addEventListener("click", closeModal);
  trigger.addEventListener("click", openModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
  modal.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
  });
  select.addEventListener("change", () => {
    triggerText.textContent = select.options[select.selectedIndex]?.textContent || "Select interest";
  });

  panel.append(title, close, list);
  modal.append(panel);
  select.after(trigger);
  document.body.append(modal);
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

document.querySelectorAll("main > section:not(.hero)").forEach((section) => {
  section.classList.add("section-transition");
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

  document
    .querySelectorAll(".reveal, .section-transition")
    .forEach((el) => observer.observe(el));
} else {
  document
    .querySelectorAll(".reveal, .section-transition")
    .forEach((el) => el.classList.add("is-visible"));
}
