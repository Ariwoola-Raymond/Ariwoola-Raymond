/* ==============================
   CINEMATIC DARK — Script
   Parallax, 3D cards, dramatic reveals
   ============================== */
(() => {
  'use strict';

  const THEME_KEY = 'ra-theme-cinema';
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) document.documentElement.setAttribute('data-theme', saved);

  /* --- DOM --- */
  const nav = document.getElementById('nav');
  const themeToggle = document.getElementById('themeToggle');
  const themePalette = document.getElementById('themePalette');
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const backToTop = document.getElementById('backToTop');
  const hero = document.querySelector('.hero');

  /* --- Theme --- */
  themeToggle.addEventListener('click', () => themePalette.classList.toggle('theme-palette--open'));
  document.querySelectorAll('[data-set-theme]').forEach(btn => {
    btn.addEventListener('click', () => {
      const t = btn.dataset.setTheme;
      document.documentElement.setAttribute('data-theme', t);
      localStorage.setItem(THEME_KEY, t);
      themePalette.classList.remove('theme-palette--open');
    });
  });
  document.addEventListener('click', e => {
    if (!themeToggle.contains(e.target) && !themePalette.contains(e.target))
      themePalette.classList.remove('theme-palette--open');
  });

  /* --- Mobile Menu --- */
  menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('nav__menu-btn--open');
    mobileMenu.classList.toggle('mobile-menu--open');
    document.body.style.overflow = mobileMenu.classList.contains('mobile-menu--open') ? 'hidden' : '';
  });
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      menuBtn.classList.remove('nav__menu-btn--open');
      mobileMenu.classList.remove('mobile-menu--open');
      document.body.style.overflow = '';
    });
  });

  /* --- Nav Scroll --- */
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    nav.classList.toggle('nav--scrolled', y > 60);

    // Back to top
    backToTop.classList.toggle('back-to-top--visible', y > 600);
    lastScroll = y;
  }, { passive: true });

  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* --- Active Nav Link --- */
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav__links a');
  const observerNav = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navAnchors.forEach(a => a.classList.remove('active'));
        const link = document.querySelector(`.nav__links a[href="#${e.target.id}"]`);
        if (link) link.classList.add('active');
      }
    });
  }, { threshold: 0.3 });
  sections.forEach(s => observerNav.observe(s));

  /* --- Cinematic Hero Load --- */
  window.addEventListener('load', () => {
    setTimeout(() => hero.classList.add('hero--loaded'), 400);
  });

  /* --- Parallax on Mouse Move (Hero) --- */
  const layers = document.querySelectorAll('.hero__layer');
  const spotlight = document.querySelector('.hero__spotlight');
  document.addEventListener('mousemove', e => {
    const cx = (e.clientX / window.innerWidth - 0.5) * 2;
    const cy = (e.clientY / window.innerHeight - 0.5) * 2;

    layers.forEach((layer, i) => {
      const depth = (i + 1) * 15;
      layer.style.transform = `translate(${cx * depth}px, ${cy * depth}px)`;
    });

    if (spotlight) {
      spotlight.style.left = `${e.clientX - 300}px`;
      spotlight.style.top = `${e.clientY - 300}px`;
    }
  });

  /* --- Scroll Reveal (parallax-up) --- */
  const reveals = document.querySelectorAll('.parallax-up');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => entry.target.classList.add('parallax-up--visible'), parseInt(delay));
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
  reveals.forEach(el => revealObserver.observe(el));

  /* --- Counter Animation --- */
  const counters = document.querySelectorAll('[data-count]');
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => counterObserver.observe(c));

  function animateCounter(el) {
    const target = parseInt(el.dataset.count);
    const duration = 2000;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(ease * target).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* --- 3D Tilt Effect --- */
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale(1.02)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateY(0) rotateX(0) scale(1)';
    });
  });

  /* --- 3D Card Flip for Timeline --- */
  document.querySelectorAll('.card-3d').forEach(card => {
    card.addEventListener('click', () => card.classList.toggle('flipped'));
  });

  /* --- Parallax on Scroll --- */
  const parallaxSections = document.querySelectorAll('.section');
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    parallaxSections.forEach(section => {
      const offset = section.offsetTop;
      const speed = 0.05;
      const yPos = (scrollY - offset) * speed;
      const header = section.querySelector('.section-header');
      if (header && Math.abs(scrollY - offset) < window.innerHeight * 1.5) {
        header.style.transform = `translateY(${yPos}px)`;
      }
    });
  }, { passive: true });

  /* --- Smooth Scroll --- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });
})();
