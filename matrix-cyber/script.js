/* ==============================
   MATRIX / CYBER — Script
   Raining code canvas, glitch, CRT, holographic
   ============================== */
(function () {
  'use strict';
  const THEME_KEY = 'ra-theme-matrix';

  /* --- Theme --- */
  const root = document.documentElement;
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) root.setAttribute('data-theme', saved);

  const toggle = document.getElementById('themeToggle');
  const palette = document.getElementById('themePalette');
  toggle.addEventListener('click', () => palette.classList.toggle('theme-palette--open'));
  document.querySelectorAll('[data-set-theme]').forEach(btn => {
    btn.addEventListener('click', () => {
      const t = btn.dataset.setTheme;
      root.setAttribute('data-theme', t);
      localStorage.setItem(THEME_KEY, t);
      palette.classList.remove('theme-palette--open');
    });
  });
  document.addEventListener('click', e => {
    if (!toggle.contains(e.target) && !palette.contains(e.target))
      palette.classList.remove('theme-palette--open');
  });

  /* --- Mobile Menu --- */
  const menuBtn = document.getElementById('menuBtn');
  const mobile = document.getElementById('mobileMenu');
  menuBtn.addEventListener('click', () => { menuBtn.classList.toggle('nav__menu-btn--open'); mobile.classList.toggle('mobile-menu--open'); });
  mobile.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { menuBtn.classList.remove('nav__menu-btn--open'); mobile.classList.remove('mobile-menu--open'); }));

  /* --- Nav Scroll --- */
  const nav = document.getElementById('nav');
  const sections = document.querySelectorAll('.section');
  const navLinks = document.querySelectorAll('.nav__links a');
  const backTop = document.getElementById('backToTop');
  function onScroll() {
    nav.classList.toggle('nav--scrolled', window.scrollY > 60);
    backTop.classList.toggle('back-to-top--visible', window.scrollY > 600);
    let current = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 200) current = s.id; });
    navLinks.forEach(l => { l.classList.toggle('active', l.getAttribute('href') === '#' + current); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* --- Reveal --- */
  const reveals = document.querySelectorAll('.reveal');
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('reveal--visible'); revealObs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  reveals.forEach(el => revealObs.observe(el));

  /* --- Counter Animation --- */
  const counters = document.querySelectorAll('[data-count]');
  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.dataset.count, 10);
      const dur = 2000;
      const start = performance.now();
      function tick(now) {
        const p = Math.min((now - start) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * ease).toLocaleString();
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      counterObs.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(el => counterObs.observe(el));

  /* --- Matrix Rain Canvas --- */
  const canvas = document.getElementById('matrixCanvas');
  const ctx = canvas.getContext('2d');
  let cw, ch, columns, drops;

  const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';
  const fontSize = 14;

  function initRain() {
    cw = canvas.width = window.innerWidth;
    ch = canvas.height = window.innerHeight;
    columns = Math.floor(cw / fontSize);
    drops = new Array(columns).fill(1).map(() => Math.random() * ch / fontSize);
  }
  window.addEventListener('resize', initRain);
  initRain();

  function drawRain() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, cw, ch);

    const color = getComputedStyle(root).getPropertyValue('--rain-color').trim() || '#00ff41';
    ctx.fillStyle = color;
    ctx.font = fontSize + 'px "Share Tech Mono", monospace';
    ctx.shadowBlur = 3;
    ctx.shadowColor = color;

    for (let i = 0; i < columns; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;

      // Head character is brighter
      ctx.globalAlpha = 0.9;
      ctx.fillText(char, x, y);

      // Fade trail
      ctx.globalAlpha = 0.3;
      if (y > fontSize * 2) {
        const trailChar = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(trailChar, x, y - fontSize);
      }

      ctx.globalAlpha = 1;

      if (y > ch && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i] += 0.6 + Math.random() * 0.5;
    }

    ctx.shadowBlur = 0;
    requestAnimationFrame(drawRain);
  }
  requestAnimationFrame(drawRain);

  /* --- Holographic Card Tilt on Mouse --- */
  document.querySelectorAll('.holo-card').forEach(card => {
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

  /* --- Terminal Typing Effect --- */
  const lines = document.querySelectorAll('.terminal__line');
  lines.forEach((line, i) => {
    line.style.opacity = '0';
    setTimeout(() => {
      line.style.opacity = '1';
      line.style.transition = 'opacity 0.3s';
    }, 800 + i * 600);
  });

  /* --- Smooth Scroll --- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
    });
  });
})();
