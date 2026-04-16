/* ===================================================================
   RAYMOND ARIWOOLA — Minimal & Elegant
   =================================================================== */

(function () {
  'use strict';

  /* Theme */
  var html = document.documentElement;
  var themeToggle = document.getElementById('themeToggle');
  var palette = document.getElementById('palette');
  var swatches = document.querySelectorAll('[data-set-theme]');

  var saved = localStorage.getItem('ra-theme-min') || 'light';
  html.setAttribute('data-theme', saved);
  markActive(saved);

  themeToggle.addEventListener('click', function (e) {
    e.stopPropagation();
    palette.classList.toggle('open');
  });

  swatches.forEach(function (s) {
    s.addEventListener('click', function () {
      var t = this.getAttribute('data-set-theme');
      html.setAttribute('data-theme', t);
      localStorage.setItem('ra-theme-min', t);
      markActive(t);
      palette.classList.remove('open');
    });
  });

  document.addEventListener('click', function (e) {
    if (!palette.contains(e.target) && e.target !== themeToggle) {
      palette.classList.remove('open');
    }
  });

  function markActive(t) {
    swatches.forEach(function (s) {
      s.classList.toggle('active', s.getAttribute('data-set-theme') === t);
    });
  }

  /* Nav scroll */
  var nav = document.getElementById('nav');
  var btt = document.getElementById('btt');

  window.addEventListener('scroll', function () {
    var y = window.scrollY;
    nav.classList.toggle('nav--scrolled', y > 60);
    btt.classList.toggle('visible', y > 600);
  }, { passive: true });

  btt.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* Active link */
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav__links a');

  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var id = entry.target.getAttribute('id');
        navLinks.forEach(function (l) {
          l.classList.toggle('active', l.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { threshold: 0.25, rootMargin: '-80px 0px -50% 0px' });

  sections.forEach(function (s) { obs.observe(s); });

  /* Mobile menu */
  var menuBtn = document.getElementById('menuBtn');
  var mob = document.getElementById('mobileMenu');

  menuBtn.addEventListener('click', function () {
    menuBtn.classList.toggle('active');
    mob.classList.toggle('open');
    document.body.style.overflow = mob.classList.contains('open') ? 'hidden' : '';
  });

  mob.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      menuBtn.classList.remove('active');
      mob.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* Reveal */
  var reveals = document.querySelectorAll('.reveal');

  var rObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        rObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });

  reveals.forEach(function (el) { rObs.observe(el); });

  /* Counters */
  var counters = document.querySelectorAll('[data-count]');

  var cObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animate(entry.target);
        cObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(function (c) { cObs.observe(c); });

  function animate(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var dur = 2000;
    var start = null;

    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var e = 1 - Math.pow(1 - p, 3);
      var v = Math.floor(e * target);
      el.textContent = (target >= 1000 ? v.toLocaleString() : v) + '+';
      if (p < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  /* Smooth scroll */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = this.getAttribute('href');
      if (id === '#') return;
      var t = document.querySelector(id);
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
    });
  });

})();
