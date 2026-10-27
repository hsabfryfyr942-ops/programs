/* ============================================================
   أطلس العتاد · تفاعلات الصفحة (بدون مكتبات)
   ============================================================ */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  ready(function () {
    /* ---------- شريط القراءة ---------- */
    var bar = document.getElementById("readBar");
    var doc = document.documentElement;
    function updateBar() {
      if (!bar) return;
      var max = doc.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      bar.style.width = (p * 100).toFixed(2) + "%";
    }

    /* ---------- قائمة الجوال ---------- */
    var toggle = document.querySelector(".menu-toggle");
    var mobile = document.getElementById("mobileNav");
    if (toggle && mobile) {
      toggle.addEventListener("click", function () {
        var open = mobile.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.classList.toggle("is-open", open);
      });
      mobile.addEventListener("click", function (e) {
        if (e.target.closest("a")) {
          mobile.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
          toggle.classList.remove("is-open");
        }
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && mobile.classList.contains("is-open")) {
          mobile.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
          toggle.classList.remove("is-open");
        }
      });
    }

    /* ---------- ظهور تدريجي ---------- */
    var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
    if (reveals.length && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
      reveals.forEach(function (el) { io.observe(el); });
    } else {
      reveals.forEach(function (el) { el.classList.add("in"); });
    }

    /* ---------- فهرس المقال ---------- */
    var toc = document.querySelector(".toc");
    var tocLinks = toc ? Array.prototype.slice.call(toc.querySelectorAll('a[href^="#"]')) : [];
    var targets = tocLinks.map(function (a) {
      return document.getElementById(a.getAttribute("href").slice(1));
    }).filter(Boolean);

    function spy() {
      var y = window.scrollY + 130;
      var current = null;
      targets.forEach(function (t) {
        if (t.getBoundingClientRect().top + window.scrollY <= y) current = t;
      });
      var best = current || targets[0];
      tocLinks.forEach(function (a) {
        a.classList.toggle("is-active", !!best && a.getAttribute("href") === "#" + best.id);
      });
    }

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        updateBar();
        spy();
        ticking = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    updateBar();
    spy();

    /* ---------- روابط الفهرس: إضافة إزاحة العنوان ---------- */
    tocLinks.forEach(function (a) {
      a.addEventListener("click", function () {
        var t = document.getElementById(a.getAttribute("href").slice(1));
        if (!t) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        setTimeout(function () { t.scrollIntoView({ behavior: "smooth", block: "start" }); }, 10);
      });
    });
  });
})();
