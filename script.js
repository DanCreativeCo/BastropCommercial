// Bastrop Commercial Real Estate — interactions (vanilla JS, no build).

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
