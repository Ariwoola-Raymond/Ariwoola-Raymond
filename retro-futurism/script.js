(() => {
  'use strict';
  const THEME_KEY = 'ra-theme-retro';
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) document.documentElement.setAttribute('data-theme', saved);

  const nav = document.getElementById('nav');
  const themeToggle = document.getElementById('themeToggle');
  const themePalette = document.getElementById('themePalette');
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const backToTop = document.getElementById('backToTop');

  /* Theme */
  themeToggle.addEventListener('click', () => themePalette.classList.toggle('theme-palette--open'));
  document.querySelectorAll('[data-set-theme]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.documentElement.setAttribute('data-theme', btn.dataset.setTheme);
      localStorage.setItem(THEME_KEY, btn.dataset.setTheme);
      themePalette.classList.remove('theme-palette--open');
    });
  });
  document.addEventListener('click', e => {
    if (!themeToggle.contains(e.target) && !themePalette.contains(e.target))
      themePalette.classList.remove('theme-palette--open');
  });

  /* Mobile */
  menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('nav__menu-btn--open');
    mobileMenu.classList.toggle('mobile-menu--open');
    document.body.style.overflow = mobileMenu.classList.contains('mobile-menu--open') ? 'hidden' : '';
  });
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    menuBtn.classList.remove('nav__menu-btn--open');
    mobileMenu.classList.remove('mobile-menu--open');
    document.body.style.overflow = '';
  }));

  /* Scroll */
  window.addEventListener('scroll', () => {
    nav.classList.toggle('nav--scrolled', window.scrollY > 60);
    backToTop.classList.toggle('back-to-top--visible', window.scrollY > 600);
  }, { passive: true });
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* Active nav */
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav__links a');
  const navObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navAnchors.forEach(a => a.classList.remove('active'));
        const l = document.querySelector(`.nav__links a[href="#${e.target.id}"]`);
        if (l) l.classList.add('active');
      }
    });
  }, { threshold: 0.3 });
  sections.forEach(s => navObs.observe(s));

  /* Reveal */
  const reveals = document.querySelectorAll('.reveal');
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal--visible');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  reveals.forEach(el => revealObs.observe(el));

  /* Counter */
  const counters = document.querySelectorAll('[data-count]');
  const counterObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { animateCounter(entry.target); counterObs.unobserve(entry.target); }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => counterObs.observe(c));
  function animateCounter(el) {
    const target = parseInt(el.dataset.count), duration = 2000, start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* Glitch on hover for neon-cards */
  document.querySelectorAll('.neon-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.animation = 'cardGlitch 0.3s ease';
      setTimeout(() => card.style.animation = '', 300);
    });
  });

  /* 3D perspective on mouse move for cards */
  document.querySelectorAll('.neon-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(600px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* Parallax sun */
  const sun = document.querySelector('.hero__sun');
  window.addEventListener('scroll', () => {
    if (sun) {
      const scrollY = window.scrollY;
      sun.style.transform = `translateX(-50%) translateY(${scrollY * 0.3}px)`;
    }
  }, { passive: true });

  /* Smooth scroll */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* Add CSS animation */
  const style = document.createElement('style');
  style.textContent = `
    @keyframes cardGlitch {
      0% { transform: translate(0); }
      20% { transform: translate(-2px, 1px); }
      40% { transform: translate(2px, -1px); }
      60% { transform: translate(-1px, 2px); }
      80% { transform: translate(1px, -2px); }
      100% { transform: translate(0); }
    }
  `;
  document.head.appendChild(style);
})();
