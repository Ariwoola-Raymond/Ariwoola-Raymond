/* ===================================================================
   RAYMOND ARIWOOLA — Tech-Forward · Script
   =================================================================== */

(function () {
  'use strict';

  /* ---- Theme ---------------------------------------------------- */
  var html = document.documentElement;
  var themeToggle = document.getElementById('themeToggle');
  var palette = document.getElementById('palette');
  var swatches = document.querySelectorAll('[data-set-theme]');

  var saved = localStorage.getItem('ra-theme-tech') || 'dark';
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
      localStorage.setItem('ra-theme-tech', t);
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

  /* ---- Nav scroll ----------------------------------------------- */
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

  /* ---- Active nav link ------------------------------------------ */
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav__links a');

  var sectionObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var id = entry.target.getAttribute('id');
        navLinks.forEach(function (l) {
          l.classList.toggle('active', l.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { threshold: 0.25, rootMargin: '-80px 0px -50% 0px' });

  sections.forEach(function (s) { sectionObs.observe(s); });

  /* ---- Mobile menu ---------------------------------------------- */
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

  /* ---- Scroll reveal -------------------------------------------- */
  var reveals = document.querySelectorAll('.reveal');

  var revealObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });

  reveals.forEach(function (el) { revealObs.observe(el); });

  /* ---- Counter animation ---------------------------------------- */
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
    var duration = 2000;
    var start = null;

    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var ease = 1 - Math.pow(1 - progress, 3);
      var val = Math.floor(ease * target);
      el.textContent = (target >= 1000 ? val.toLocaleString() : val) + '+';
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  /* ---- Typing effect for hero name ------------------------------ */
  var heroName = document.getElementById('heroName');
  if (heroName) {
    var fullText = heroName.textContent;
    heroName.textContent = '';
    heroName.style.visibility = 'visible';
    var charIdx = 0;

    function typeChar() {
      if (charIdx < fullText.length) {
        heroName.textContent += fullText.charAt(charIdx);
        charIdx++;
        setTimeout(typeChar, 70 + Math.random() * 40);
      }
    }

    // Start typing after a small delay
    setTimeout(typeChar, 600);
  }

  /* ---- Smooth scroll -------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href === '#') return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

})();
