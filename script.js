// Bastrop Commercial Real Estate. Interactions (vanilla JS, no build).

// Solidify the header background once the user scrolls past the hero top.
const header = document.querySelector(".site-header");
const onScroll = () => {
  if (window.scrollY > 40) header?.classList.add("scrolled");
  else header?.classList.remove("scrolled");
};
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

// Mobile menu open/close.
const menu = document.getElementById("mobile-menu");
const toggle = document.getElementById("menu-toggle");
const close = document.getElementById("menu-close");

const openMenu = () => {
  menu?.removeAttribute("hidden");
  toggle?.setAttribute("aria-expanded", "true");
  document.body.style.overflow = "hidden";
};
const shutMenu = () => {
  menu?.setAttribute("hidden", "");
  toggle?.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
};

toggle?.addEventListener("click", openMenu);
close?.addEventListener("click", shutMenu);
menu?.querySelectorAll("a").forEach((a) => a.addEventListener("click", shutMenu));

// Keep the footer copyright year current.
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

// Reveal elements as they scroll into view. Progressive enhancement:
// the hiding class is only added when an observer is available, so the
// content stays visible if JS or IntersectionObserver is unsupported.
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

if ("IntersectionObserver" in window && !prefersReducedMotion) {
  const revealTargets = document.querySelectorAll(
    ".about, .listings__head, .card, .split__card, .affiliation, .agent, .contact, .feature, .form-card"
  );

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  revealTargets.forEach((el, i) => {
    el.classList.add("will-reveal");
    el.style.transitionDelay = `${Math.min(i % 6, 5) * 70}ms`;
    observer.observe(el);
  });
}
