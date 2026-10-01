/* ============================================================
   Kushali Shah — Portfolio
   Interactive layer: reveals, cursor, tilt, journey, lightbox
   ============================================================ */

(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(pointer: fine)").matches;

  function initReveals() {
    var els = document.querySelectorAll(".reveal");
    if (!els.length) return;

    if (reducedMotion || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("in-view"); });
      return;
    }

    var groups = {};
    els.forEach(function (el) {
      var key = el.dataset.revealGroup || "solo-" + Math.random();
      groups[key] = groups[key] || [];
      groups[key].push(el);
    });

    Object.keys(groups).forEach(function (key) {
      groups[key].forEach(function (el, i) {
        el.style.transitionDelay = Math.min(i * 70, 350) + "ms";
      });
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    els.forEach(function (el) { io.observe(el); });
  }

  function initCursor() {
    if (reducedMotion || !fine) return;

    var dot = document.createElement("div");
    dot.className = "cursor-dot";
    document.body.appendChild(dot);
    document.body.classList.add("has-custom-cursor");

    var x = window.innerWidth / 2, y = window.innerHeight / 2;
    var cx = x, cy = y;

    window.addEventListener("mousemove", function (e) {
      x = e.clientX; y = e.clientY;
      var el = document.elementFromPoint(x, y);
      var onInk = el && el.closest(".cover");
      dot.classList.toggle("cursor-dot--on-ink", !!onInk);
    });

    function tick() {
      cx += (x - cx) * 0.22;
      cy += (y - cy) * 0.22;
      dot.style.transform = "translate(" + cx + "px, " + cy + "px)";
      requestAnimationFrame(tick);
    }
    tick();

    var hoverables = document.querySelectorAll("a, button, .journey-node, .gallery-item, .case, .work-row");
    hoverables.forEach(function (el) {
      el.addEventListener("mouseenter", function () { dot.classList.add("cursor-dot--big"); });
      el.addEventListener("mouseleave", function () { dot.classList.remove("cursor-dot--big"); });
    });
  }

  function initTilt() {
    if (reducedMotion || !fine) return;
    var cards = document.querySelectorAll(".tilt");

    cards.forEach(function (card) {
      var rect;
      card.addEventListener("mouseenter", function () { rect = card.getBoundingClientRect(); });
      card.addEventListener("mousemove", function (e) {
        if (!rect) rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width - 0.5;
        var py = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform =
          "perspective(900px) rotateX(" + (py * -3.2) + "deg) rotateY(" + (px * 3.2) + "deg) translateY(-2px)";
      });
      card.addEventListener("mouseleave", function () { card.style.transform = ""; });
    });
  }

  function initJourney() {
    var items = Array.prototype.slice.call(document.querySelectorAll(".journey-item"));
    var routePath = document.querySelector(".route-svg path");

    function setRouteProgress(fraction) {
      if (!routePath) return;
      var clamped = Math.max(0, Math.min(1, fraction));
      routePath.style.strokeDashoffset = (100 - clamped * 100).toFixed(1);
    }

    items.forEach(function (item, i) {
      var btn = item.querySelector(".journey-node");
      if (!btn) return;
      btn.addEventListener("click", function () {
        var expanded = item.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", expanded ? "true" : "false");
        setRouteProgress((i + 1) / items.length);
      });
    });

    if (routePath && items.length && "IntersectionObserver" in window) {
      var track = document.querySelector(".journey-track");
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            setRouteProgress(1 / items.length);
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      if (track) io.observe(track);
    }
  }

  function initHeroReveal() {
    var lines = document.querySelectorAll(".hero-line");
    if (!lines.length) return;
    var wordIndex = 0;
    lines.forEach(function (line) {
      line.querySelectorAll(".word").forEach(function (w) {
        w.style.transitionDelay = Math.min(wordIndex * 45, 420) + "ms";
        wordIndex++;
      });
    });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        lines.forEach(function (line) { line.classList.add("in-view"); });
      });
    });
  }

  function initHeroParallax() {
    if (reducedMotion) return;
    var photo = document.querySelector(".cover-photo img");
    var section = document.querySelector(".cover");
    if (!photo || !section) return;

    var ticking = false;
    function update() {
      ticking = false;
      var rect = section.getBoundingClientRect();
      var progress = 1 - Math.max(0, Math.min(1, rect.bottom / (rect.height + window.innerHeight)));
      var scale = 1 + progress * 0.08;
      var shift = progress * 18;
      photo.style.transform = "scale(" + scale.toFixed(3) + ") translateY(" + shift.toFixed(1) + "px)";
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  function initSmoothScroll() {
    if (reducedMotion || !fine) return;
    if (window.matchMedia && window.matchMedia("(max-width: 880px)").matches) return;

    var target = window.scrollY;
    var current = target;
    var ticking = false;
    var maxScroll = function () {
      return document.documentElement.scrollHeight - window.innerHeight;
    };

    window.addEventListener("wheel", function (e) {
      if (e.ctrlKey) return; // let pinch-zoom alone
      e.preventDefault();
      target = Math.max(0, Math.min(maxScroll(), target + e.deltaY));
      if (!ticking) { ticking = true; requestAnimationFrame(tick); }
    }, { passive: false });

    function tick() {
      current += (target - current) * 0.11;
      if (Math.abs(target - current) < 0.5) {
        current = target;
        window.scrollTo(0, current);
        ticking = false;
        return;
      }
      window.scrollTo(0, current);
      requestAnimationFrame(tick);
    }

    window.addEventListener("resize", function () { target = window.scrollY; current = target; });

    // Keyboard and touch scrolling stay native — just keep our target in sync afterwards.
    var resyncKeys = ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "];
    window.addEventListener("keydown", function (e) {
      if (resyncKeys.indexOf(e.key) === -1) return;
      requestAnimationFrame(function () { target = window.scrollY; current = target; });
    });
  }

  function initCountUp() {
    var stats = document.querySelectorAll(".impact-stat .num[data-count]");
    if (!stats.length || reducedMotion || !("IntersectionObserver" in window)) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var end = parseFloat(el.dataset.count);
        var prefix = el.dataset.prefix || "";
        var suffix = el.dataset.suffix || "";
        var decimals = el.dataset.decimals ? parseInt(el.dataset.decimals, 10) : 0;
        var duration = 900;
        var startTime = null;

        function step(ts) {
          if (!startTime) startTime = ts;
          var progress = Math.min((ts - startTime) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          var val = end * eased;
          el.textContent = prefix + val.toFixed(decimals) + suffix;
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        io.unobserve(el);
      });
    }, { threshold: 0.6 });

    stats.forEach(function (el) { io.observe(el); });
  }

  function initGallery() {
    var items = Array.prototype.slice.call(
      document.querySelectorAll(".gallery-item[data-full]")
    ).filter(function (el) { return el.dataset.full && el.dataset.full.trim() !== ""; });
    if (!items.length) return;

    var overlay = document.createElement("div");
    overlay.className = "lightbox";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.innerHTML =
      '<button class="lightbox-close" aria-label="Close">&times;</button>' +
      '<button class="lightbox-nav lightbox-prev" aria-label="Previous photo">&#8249;</button>' +
      '<div class="lightbox-frame"><img alt=""><p class="lightbox-caption"></p></div>' +
      '<button class="lightbox-nav lightbox-next" aria-label="Next photo">&#8250;</button>';
    document.body.appendChild(overlay);

    var imgEl = overlay.querySelector("img");
    var captionEl = overlay.querySelector(".lightbox-caption");
    var list = items;
    var current = 0;
    var lastFocused = null;

    function open(i) {
      current = (i + list.length) % list.length;
      var el = list[current];
      imgEl.src = el.dataset.full;
      imgEl.alt = el.dataset.caption || "";
      captionEl.textContent = el.dataset.caption || "";
      lastFocused = document.activeElement;
      overlay.classList.add("is-open");
      document.body.style.overflow = "hidden";
      overlay.querySelector(".lightbox-close").focus();
    }

    function close() {
      overlay.classList.remove("is-open");
      document.body.style.overflow = "";
      if (lastFocused) lastFocused.focus();
    }

    list.forEach(function (el, i) {
      el.addEventListener("click", function () { open(i); });
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(i); }
      });
    });

    overlay.querySelector(".lightbox-close").addEventListener("click", close);
    overlay.querySelector(".lightbox-prev").addEventListener("click", function () { open(current - 1); });
    overlay.querySelector(".lightbox-next").addEventListener("click", function () { open(current + 1); });
    overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });

    document.addEventListener("keydown", function (e) {
      if (!overlay.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") open(current - 1);
      if (e.key === "ArrowRight") open(current + 1);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initReveals();
    initCursor();
    initTilt();
    initJourney();
    initHeroReveal();
    initHeroParallax();
    initSmoothScroll();
    initCountUp();
    initGallery();
  });
})();
