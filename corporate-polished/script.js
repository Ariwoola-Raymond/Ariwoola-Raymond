/* ===================================================================
   RAYMOND ARIWOOLA — Corporate & Polished
   JavaScript: Interactivity, animations, theme switching
   =================================================================== */

(function () {
  'use strict';

  /* ----- Theme Switching ----- */
  var html = document.documentElement;
  var themeToggle = document.getElementById('themeToggle');
  var themePalette = document.getElementById('themePalette');
  var swatches = document.querySelectorAll('[data-set-theme]');

  var savedTheme = localStorage.getItem('ra-theme-corp') || 'navy';
  html.setAttribute('data-theme', savedTheme);
  updateActiveSwatch(savedTheme);

  themeToggle.addEventListener('click', function (e) {
    e.stopPropagation();
    themePalette.classList.toggle('open');
  });

  swatches.forEach(function (swatch) {
    swatch.addEventListener('click', function () {
      var theme = this.getAttribute('data-set-theme');
      html.setAttribute('data-theme', theme);
      localStorage.setItem('ra-theme-corp', theme);
      updateActiveSwatch(theme);
      themePalette.classList.remove('open');
    });
  });

  document.addEventListener('click', function (e) {
    if (!themePalette.contains(e.target) && e.target !== themeToggle) {
      themePalette.classList.remove('open');
    }
  });

  function updateActiveSwatch(theme) {
    swatches.forEach(function (s) {
      s.classList.toggle('active', s.getAttribute('data-set-theme') === theme);
    });
  }

  /* ----- Nav Scroll ----- */
  var nav = document.getElementById('nav');
  var backToTop = document.getElementById('backToTop');

  window.addEventListener('scroll', function () {
    var y = window.scrollY;
    nav.classList.toggle('nav--scrolled', y > 60);
    backToTop.classList.toggle('visible', y > 600);
  }, { passive: true });

  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ----- Active Nav Link ----- */
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav__links a');

  var sectionObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var id = entry.target.getAttribute('id');
        navLinks.forEach(function (link) {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { threshold: 0.25, rootMargin: '-80px 0px -50% 0px' });

  sections.forEach(function (s) { sectionObs.observe(s); });

  /* ----- Mobile Menu ----- */
  var menuBtn = document.getElementById('menuBtn');
  var mobileMenu = document.getElementById('mobileMenu');
  var mobileLinks = mobileMenu.querySelectorAll('a');

  menuBtn.addEventListener('click', function () {
    menuBtn.classList.toggle('active');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });

  mobileLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      menuBtn.classList.remove('active');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* ----- Scroll Reveal ----- */
  var reveals = document.querySelectorAll('.reveal, .reveal--left, .reveal--right');

  var revealObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  reveals.forEach(function (el) { revealObs.observe(el); });

  /* ----- Counter Animation ----- */
  var counters = document.querySelectorAll('[data-count]');

  var counterObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(function (c) { counterObs.observe(c); });

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var duration = 2200;
    var start = null;

    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.floor(eased * target);
      el.textContent = (target >= 1000 ? current.toLocaleString() : current) + '+';
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  /* ----- Smooth Scroll ----- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = this.getAttribute('href');
      if (id === '#') return;
      var target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

})();
