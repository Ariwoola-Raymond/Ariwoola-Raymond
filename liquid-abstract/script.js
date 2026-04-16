/* ==============================
   LIQUID / ABSTRACT ART — Script
   Fluid canvas simulation, blob parallax, morphing
   ============================== */
(function () {
  'use strict';
  const THEME_KEY = 'ra-theme-liquid';

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

  /* --- Fluid Canvas (metaball-like gradient simulation) --- */
  const canvas = document.getElementById('fluidCanvas');
  const ctx = canvas.getContext('2d');
  let cw, ch;
  function resize() { cw = canvas.width = window.innerWidth; ch = canvas.height = window.innerHeight; }
  window.addEventListener('resize', resize);
  resize();

  const orbs = [];
  const ORB_COUNT = 5;
  for (let i = 0; i < ORB_COUNT; i++) {
    orbs.push({
      x: Math.random() * cw,
      y: Math.random() * ch,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      radius: 150 + Math.random() * 200,
      phase: Math.random() * Math.PI * 2
    });
  }

  let mouseX = cw / 2, mouseY = ch / 2;
  document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

  function getAccentRGB() {
    const s = getComputedStyle(root).getPropertyValue('--accent-rgb').trim();
    if (s) {
      const parts = s.split(',').map(Number);
      if (parts.length === 3) return parts;
    }
    return [192, 96, 255];
  }

  function drawFluid(t) {
    ctx.clearRect(0, 0, cw, ch);

    const [r, g, b] = getAccentRGB();

    orbs.forEach((orb, i) => {
      // Movement
      orb.x += orb.vx + Math.sin(t * 0.0005 + orb.phase) * 0.5;
      orb.y += orb.vy + Math.cos(t * 0.0005 + orb.phase) * 0.5;

      // Mouse influence on first orb
      if (i === 0) {
        orb.x += (mouseX - orb.x) * 0.008;
        orb.y += (mouseY - orb.y) * 0.008;
      }

      // Boundary wrap
      if (orb.x < -orb.radius) orb.x = cw + orb.radius;
      if (orb.x > cw + orb.radius) orb.x = -orb.radius;
      if (orb.y < -orb.radius) orb.y = ch + orb.radius;
      if (orb.y > ch + orb.radius) orb.y = -orb.radius;

      // Breathing
      const br = orb.radius + Math.sin(t * 0.001 + orb.phase) * 30;

      // Draw gradient orb
      const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, br);
      const alpha = 0.06 + i * 0.01;
      const hueShift = i * 40;
      grad.addColorStop(0, `rgba(${Math.min(255, r + hueShift)}, ${Math.max(0, g - hueShift / 2)}, ${b}, ${alpha})`);
      grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, cw, ch);
    });

    requestAnimationFrame(drawFluid);
  }
  requestAnimationFrame(drawFluid);

  /* --- Blob Parallax on Scroll --- */
  const blobs = document.querySelectorAll('.blob');
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    blobs.forEach((blob, i) => {
      const speed = 0.03 + i * 0.015;
      blob.style.transform = `translateY(${y * speed}px)`;
    });
  }, { passive: true });

  /* --- Card Angle Follow Mouse (conic gradient) --- */
  document.querySelectorAll('.fluid-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const angle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
      card.style.setProperty('--card-angle', angle + 'deg');
    });
  });

  /* --- Smooth Scroll --- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
    });
  });
})();
