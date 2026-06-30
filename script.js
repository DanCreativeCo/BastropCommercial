/* Bastrop Commercial, shared interactions
   Vanilla-JS port of the Claude Design DCLogic components. Every feature is
   guarded by element presence, so this one file serves all pages. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Current year ---- */
  document.querySelectorAll('[data-year]').forEach(function (n) {
    n.textContent = String(new Date().getFullYear());
  });

  /* ---- Scroll progress bar + hero parallax ---- */
  var bar = document.querySelector('[data-progress]');
  var parallax = document.querySelector('[data-parallax]');
  if (bar || parallax) {
    var onScroll = function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var p = max > 0 ? h.scrollTop / max : 0;
      if (bar) bar.style.transform = 'scaleX(' + p + ')';
      if (parallax && !reduceMotion) {
        parallax.style.transform = 'translateY(' + Math.min(window.scrollY * 0.12, 120) + 'px)';
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- Reveal on scroll ---- */
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      reveals.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add('is-visible');
            io.unobserve(en.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      reveals.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---- Count-up ---- */
  var counts = Array.prototype.slice.call(document.querySelectorAll('[data-count-to]'));
  if (counts.length) {
    var fmt = function (n, v) {
      n.textContent = (n.dataset.countPrefix || '') + v + (n.dataset.countSuffix || '');
    };
    var isDark = function (n) {
      return !!(n.closest('#market') || n.closest('[data-dark]') || n.closest('section[style*="1a1a17"]'));
    };
    if (reduceMotion || !('IntersectionObserver' in window)) {
      counts.forEach(function (n) { fmt(n, Number(n.dataset.countTo)); if (isDark(n)) n.style.color = '#d8aa63'; });
    } else {
      var seen = new WeakSet();
      var run = function (n) {
        if (seen.has(n)) return;
        seen.add(n);
        n.style.display = 'inline-block';
        n.style.animation = 'countPop .9s cubic-bezier(.16,1,.3,1) both';
        var target = Number(n.dataset.countTo);
        var dur = 950;
        var start = performance.now();
        var tick = function (now) {
          var prog = Math.min(Math.max((now - start) / dur, 0), 1);
          var eased = 1 - Math.pow(1 - prog, 4);
          fmt(n, Math.round(target * eased));
          if (prog < 1) requestAnimationFrame(tick);
          else { fmt(n, target); if (isDark(n)) n.style.color = '#d8aa63'; }
        };
        requestAnimationFrame(tick);
      };
      counts.forEach(function (n) { fmt(n, 0); });
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { run(en.target); cio.unobserve(en.target); } });
      }, { threshold: 0.6 });
      counts.forEach(function (n) { cio.observe(n); });
    }
  }

  /* ---- Properties carousel: buttons + drag ---- */
  var track = document.querySelector('[data-carousel]');
  if (track) {
    var step = function () { return Math.min(track.clientWidth * 0.85, 360); };
    var prev = document.querySelector('[data-prev]');
    var next = document.querySelector('[data-next]');
    if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
    var down = false, startX = 0, startScroll = 0, moved = false;
    track.addEventListener('pointerdown', function (e) { down = true; moved = false; startX = e.clientX; startScroll = track.scrollLeft; track.style.cursor = 'grabbing'; });
    track.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - startX; if (Math.abs(dx) > 4) moved = true; track.scrollLeft = startScroll - dx; });
    var up = function () { down = false; track.style.cursor = 'grab'; };
    track.addEventListener('pointerup', up);
    track.addEventListener('pointerleave', up);
    track.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
  }

  /* ---- Contact tabs (home) ---- */
  var tabs = document.querySelectorAll('[data-tab]');
  if (tabs.length) {
    tabs.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var name = btn.dataset.tab;
        tabs.forEach(function (b) { b.classList.toggle('is-active', b === btn); });
        document.querySelectorAll('[data-panel]').forEach(function (panel) {
          panel.hidden = panel.dataset.panel !== name;
        });
      });
    });
  }

  /* ---- Forms: show success state on submit (no backend yet) ---- */
  document.querySelectorAll('form[data-success]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var sent = document.getElementById(form.dataset.success);
      form.hidden = true;
      if (sent) sent.hidden = false;
    });
  });

  /* ---- Thoughts feed (home): render short Facebook posts from JSON ---- */
  var thoughtsHost = document.querySelector('[data-thoughts]');
  if (thoughtsHost) {
    var thoughtsSrc = thoughtsHost.getAttribute('data-src') || 'thoughts.json';
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var fmtThoughtDate = function (iso) {
      var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ''));
      return m ? months[Number(m[2]) - 1] + ' ' + Number(m[3]) + ', ' + m[1] : '';
    };
    var hideThoughts = function () {
      var sec = thoughtsHost.closest('section');
      if (sec) sec.hidden = true;
    };
    var buildThought = function (p) {
      var hasLink = !!p.url;
      var card = document.createElement(hasLink ? 'a' : 'article');
      if (hasLink) {
        card.href = p.url;
        card.target = '_blank';
        card.rel = 'noopener';
      }
      card.style.cssText = 'display:flex;flex-direction:column;border:1px solid #ddd5c7;border-radius:14px;background:#fffdfa;overflow:hidden;padding:1.5rem;';

      var head = document.createElement('div');
      head.style.cssText = 'display:flex;align-items:center;gap:.6rem;';
      var glyph = document.createElement('span');
      glyph.setAttribute('aria-hidden', 'true');
      glyph.style.cssText = 'width:1.9rem;height:1.9rem;flex:0 0 auto;display:grid;place-items:center;border-radius:6px;background:#14263f;color:#d8aa63;font-family:\'Spectral\',serif;font-weight:700;font-size:.95rem;';
      glyph.textContent = 'f';
      var meta = document.createElement('div');
      meta.style.cssText = 'display:flex;flex-direction:column;line-height:1.15;';
      var label = document.createElement('span');
      label.style.cssText = 'font-family:\'IBM Plex Mono\',monospace;font-size:.6rem;letter-spacing:.12em;text-transform:uppercase;color:#a8652d;';
      label.textContent = p.tag || 'Thought';
      var date = document.createElement('span');
      date.style.cssText = 'font-family:\'IBM Plex Mono\',monospace;font-size:.6rem;letter-spacing:.04em;color:#9a8f78;margin-top:.15rem;';
      date.textContent = fmtThoughtDate(p.date);
      meta.appendChild(label);
      if (date.textContent) meta.appendChild(date);
      head.appendChild(glyph);
      head.appendChild(meta);

      var body = document.createElement('p');
      body.style.cssText = 'font-family:\'Spectral\',serif;font-size:1.12rem;line-height:1.45;color:#3a3a34;margin-top:1rem;flex:1;';
      body.textContent = p.text;

      card.appendChild(head);
      card.appendChild(body);

      if (hasLink) {
        var cta = document.createElement('span');
        cta.style.cssText = 'margin-top:1.2rem;font-family:\'IBM Plex Mono\',monospace;font-size:.66rem;letter-spacing:.04em;font-weight:600;color:#a8652d;';
        cta.textContent = 'View on Facebook →';
        card.appendChild(cta);
      }
      return card;
    };

    fetch(thoughtsSrc, { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error('thoughts ' + r.status); return r.json(); })
      .then(function (data) {
        var posts = Array.isArray(data) ? data : (data && data.posts) || [];
        var frag = document.createDocumentFragment();
        posts.forEach(function (p) { if (p && p.text) frag.appendChild(buildThought(p)); });
        if (!frag.childNodes.length) { hideThoughts(); return; }
        thoughtsHost.appendChild(frag);
      })
      .catch(function () { hideThoughts(); });
  }

  /* ---- Filter chips (insights / marketing) ---- */
  document.querySelectorAll('[data-filters]').forEach(function (group) {
    var chips = group.querySelectorAll('[data-filter]');
    var scope = document.querySelector(group.dataset.filters); // container of filterable items
    if (!scope) return;
    var items = scope.querySelectorAll('[data-cat]');
    var featured = document.querySelectorAll('[data-featured]');
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var cat = chip.dataset.filter;
        chips.forEach(function (c) { c.classList.toggle('is-active', c === chip); });
        items.forEach(function (item) {
          item.hidden = !(cat === 'All' || item.dataset.cat === cat);
        });
        featured.forEach(function (f) { f.hidden = cat !== 'All'; });
      });
    });
  });
})();
