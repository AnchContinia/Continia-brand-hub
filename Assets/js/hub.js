/* Continia Brand Hub — navigation, search, copy-to-clipboard, lightbox */
(function () {
  "use strict";

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------- guide figures (pop-up window frame) ----------
     <figure class="popup" data-p="14" data-cap="Caption"></figure>
     renders page 14 of the brand guide inside the UI-element frame. */
  $$("figure.popup[data-p]").forEach(function (fig) {
    var p = fig.getAttribute("data-p");
    var num = ("0" + p).slice(-2);
    var cap = fig.getAttribute("data-cap") || "";
    var src = "Assets/guide/p" + num + ".webp";
    fig.innerHTML =
      '<div class="popup__bar"><img src="Assets/logos/continia-logomark-white.svg" alt="">continia' +
      '<span class="popup__dots" aria-hidden="true"><i></i><i></i><i></i></span></div>' +
      '<button type="button" class="zoom" aria-label="Enlarge: ' + cap.replace(/"/g, "&quot;") + '">' +
      '<img src="' + src + '" alt="' + cap.replace(/"/g, "&quot;") + '" loading="lazy" decoding="async" width="1600" height="901"></button>' +
      "<figcaption>" + cap + "<span>Brand guide p. " + p + "</span></figcaption>";
  });

  /* ---------- mobile nav ---------- */
  var body = document.body;
  var toggle = $("#nav-toggle");
  function closeNav() { body.classList.remove("nav-open"); if (toggle) toggle.setAttribute("aria-expanded", "false"); }
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) { var s = $("#search"); if (s) s.focus({ preventScroll: true }); }
    });
  }
  var scrim = $(".scrim");
  if (scrim) scrim.addEventListener("click", closeNav);
  $$(".nav a").forEach(function (a) { a.addEventListener("click", closeNav); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(); });

  /* ---------- scrollspy ---------- */
  var links = $$(".nav a[href^='#']");
  var byId = {};
  links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
  var sections = $$("[data-chapter]");
  function setActive(id) {
    links.forEach(function (a) { a.classList.remove("is-active"); a.removeAttribute("aria-current"); });
    var a = byId[id];
    if (a) {
      a.classList.add("is-active");
      a.setAttribute("aria-current", "true");
      var nav = $(".nav");
      var r = a.getBoundingClientRect(), n = nav.getBoundingClientRect();
      if (r.top < n.top || r.bottom > n.bottom) a.scrollIntoView({ block: "nearest" });
    }
  }
  function spy() {
    var line = window.innerHeight * 0.3;
    var current = sections[0] && sections[0].id;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].getBoundingClientRect().top - line <= 0) current = sections[i].id;
    }
    setActive(current);
  }
  var ticking = false;
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(function () { spy(); ticking = false; }); }
  }, { passive: true });
  spy();

  /* ---------- search ---------- */
  var input = $("#search");
  var results = $("#search-results");
  var index = [];
  sections.forEach(function (sec) {
    var chapter = sec.getAttribute("data-chapter");
    var h2 = $("h2", sec);
    index.push({ id: sec.id, title: h2 ? h2.textContent : chapter, chapter: chapter, text: sec.textContent.toLowerCase() });
    $$(".block[id]", sec).forEach(function (b) {
      var h3 = $("h3", b);
      index.push({ id: b.id, title: h3 ? h3.textContent : b.id, chapter: chapter, sub: true, text: b.textContent.toLowerCase() });
    });
  });

  var activeIdx = -1;
  function render(q) {
    q = q.trim().toLowerCase();
    if (!q) { results.hidden = true; input.setAttribute("aria-expanded", "false"); return; }
    var terms = q.split(/\s+/);
    var hits = index.filter(function (it) {
      return terms.every(function (t) { return it.text.indexOf(t) > -1 || it.title.toLowerCase().indexOf(t) > -1; });
    }).sort(function (a, b) {
      var at = a.title.toLowerCase().indexOf(q) > -1 ? 0 : 1;
      var bt = b.title.toLowerCase().indexOf(q) > -1 ? 0 : 1;
      return at - bt;
    }).slice(0, 8);
    activeIdx = -1;
    results.innerHTML = hits.length
      ? hits.map(function (h) {
          var icon = h.sub ? "fa-hashtag" : "fa-bookmark";
          return '<li><a href="#' + h.id + '"><i class="fa-light ' + icon + '" aria-hidden="true"></i><span><small>' + h.chapter + "</small>" + h.title + "</span></a></li>";
        }).join("")
      : '<li class="search__empty">No matches for “' + q.replace(/</g, "&lt;") + "”</li>";
    results.hidden = false;
    input.setAttribute("aria-expanded", "true");
  }
  if (input && results) {
    input.addEventListener("input", function () { render(input.value); });
    input.addEventListener("focus", function () { if (input.value) render(input.value); });
    input.addEventListener("keydown", function (e) {
      var items = $$("a", results);
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        if (!items.length) return;
        e.preventDefault();
        activeIdx = (activeIdx + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
        items.forEach(function (it, i) { it.classList.toggle("is-active", i === activeIdx); });
      } else if (e.key === "Enter") {
        var target = items[activeIdx] || items[0];
        if (target) { e.preventDefault(); target.click(); }
      } else if (e.key === "Escape") {
        input.value = ""; results.hidden = true;
      }
    });
    results.addEventListener("click", function (e) {
      if (e.target.closest("a")) { results.hidden = true; input.blur(); closeNav(); }
    });
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".search")) results.hidden = true;
    });
    document.addEventListener("keydown", function (e) {
      var tag = (document.activeElement && document.activeElement.tagName) || "";
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        if (window.matchMedia("(max-width: 960px)").matches && toggle) toggle.click();
        input.focus();
      }
    });
  }

  /* ---------- copy to clipboard ---------- */
  var toast = $("#toast");
  var toastTimer;
  function showToast(html) {
    if (!toast) return;
    toast.innerHTML = html;
    toast.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("is-on"); }, 1800);
  }
  function copy(text, label) {
    var done = function () { showToast("Copied <b>" + (label || text) + "</b>"); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else { fallback(); }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); done(); } catch (err) { showToast("Copy failed"); }
      document.body.removeChild(ta);
    }
  }
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-copy]");
    if (el) { copy(el.getAttribute("data-copy"), el.getAttribute("data-copy-label")); return; }
    var btn = e.target.closest(".copy-code");
    if (btn) {
      var pre = btn.parentNode.querySelector("pre");
      copy(pre.textContent, "code snippet");
    }
  });

  /* ---------- lightbox ---------- */
  var box = $("#lightbox");
  if (box && typeof box.showModal === "function") {
    var boxImg = document.createElement("img"), boxCap = $("p", box);
    box.insertBefore(boxImg, boxCap);
    document.addEventListener("click", function (e) {
      var z = e.target.closest("button.zoom");
      if (!z) return;
      var img = $("img", z);
      boxImg.src = img.currentSrc || img.src;
      boxImg.alt = img.alt;
      var fc = z.parentNode.querySelector("figcaption");
      boxCap.textContent = fc ? fc.textContent.replace(/Brand guide p\./, " · Brand guide p.") : "";
      box.showModal();
    });
    box.addEventListener("click", function (e) { if (e.target === box || e.target.closest(".lightbox__close")) box.close(); });
  }
})();
