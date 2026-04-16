/* ===================================================================
   RAYMOND ARIWOOLA — Creative & Dynamic
   JavaScript: Interactivity, animations, theme switching
   =================================================================== */

(function () {
  'use strict';

  /* ----- Theme Switching ----- */
  const html = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const themePalette = document.getElementById('themePalette');
  const swatches = document.querySelectorAll('[data-set-theme]');

  // Load saved theme
  const savedTheme = localStorage.getItem('ra-theme') || 'dark';
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
      localStorage.setItem('ra-theme', theme);
      updateActiveSwatch(theme);
      themePalette.classList.remove('open');
    });
  });

  // Close palette on outside click
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

  /* ----- Navigation Scroll Effect ----- */
  var nav = document.getElementById('nav');
  var backToTop = document.getElementById('backToTop');
  var lastScroll = 0;

  window.addEventListener('scroll', function () {
    var scrollY = window.scrollY;

    // Nav background
    if (scrollY > 50) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }

    // Back to top button
    if (scrollY > 600) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }

    lastScroll = scrollY;
  }, { passive: true });

  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ----- Active Nav Link Highlighting ----- */
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav__links a');

  var sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var id = entry.target.getAttribute('id');
        navLinks.forEach(function (link) {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { threshold: 0.3, rootMargin: '-80px 0px -50% 0px' });

  sections.forEach(function (section) {
    sectionObserver.observe(section);
  });

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

  /* ----- Typing Effect ----- */
  var titles = [
    'People & Culture Leader',
    'Digital Transformation Expert',
    'Knowledge Management Strategist',
    'Learning & Development Innovator',
    'Customer Experience Architect'
  ];
  var typingEl = document.getElementById('typingText');
  var titleIndex = 0;
  var charIndex = 0;
  var isDeleting = false;
  var typingSpeed = 70;
  var deletingSpeed = 35;
  var pauseTime = 2200;

  function typeEffect() {
    var currentTitle = titles[titleIndex];

    if (isDeleting) {
      charIndex--;
      typingEl.textContent = currentTitle.substring(0, charIndex);
    } else {
      charIndex++;
      typingEl.textContent = currentTitle.substring(0, charIndex);
    }

    if (!isDeleting && charIndex === currentTitle.length) {
      setTimeout(function () {
        isDeleting = true;
        typeEffect();
      }, pauseTime);
      return;
    }

    if (isDeleting && charIndex === 0) {
      isDeleting = false;
      titleIndex = (titleIndex + 1) % titles.length;
    }

    setTimeout(typeEffect, isDeleting ? deletingSpeed : typingSpeed);
  }

  typeEffect();

  /* ----- Scroll Reveal ----- */
  var revealElements = document.querySelectorAll('.reveal, .reveal--left, .reveal--right, .reveal--scale');

  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(function (el) {
    revealObserver.observe(el);
  });

  /* ----- Counter Animation ----- */
  var counters = document.querySelectorAll('[data-count]');

  var counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(function (counter) {
    counterObserver.observe(counter);
  });

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var duration = 2000;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out cubic
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.floor(eased * target);

      if (target >= 1000) {
        el.textContent = current.toLocaleString() + '+';
      } else {
        el.textContent = current + '+';
      }

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  /* ----- Smooth scroll for nav links ----- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

})();
