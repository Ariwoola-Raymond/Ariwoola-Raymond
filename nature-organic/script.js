/* ==============================
   NATURE / ORGANIC — Script
   Leaf particles, parallax, organic animations
   ============================== */
(function () {
  'use strict';
  const THEME_KEY = 'ra-theme-nature';

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

  /* --- Reveal (grow) --- */
  const reveals = document.querySelectorAll('.reveal-grow');
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('reveal-grow--visible'); revealObs.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
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

  /* --- Leaf Particle System --- */
  const canvas = document.getElementById('leafCanvas');
  const ctx = canvas.getContext('2d');
  let cw, ch;
  function resize() { cw = canvas.width = window.innerWidth; ch = canvas.height = window.innerHeight; }
  window.addEventListener('resize', resize);
  resize();

  const LEAF_COUNT = 35;
  const leaves = [];
  function randRange(a, b) { return a + Math.random() * (b - a); }

  class Leaf {
    constructor() { this.reset(true); }
    reset(init) {
      this.x = Math.random() * cw;
      this.y = init ? Math.random() * ch : -20;
      this.size = randRange(8, 18);
      this.speedY = randRange(0.3, 1.2);
      this.speedX = randRange(-0.3, 0.3);
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = randRange(-0.02, 0.02);
      this.opacity = randRange(0.15, 0.45);
      this.drift = randRange(0.5, 2);
      this.driftOffset = Math.random() * Math.PI * 2;
    }
    update(t) {
      this.y += this.speedY;
      this.x += this.speedX + Math.sin(t * 0.001 + this.driftOffset) * this.drift * 0.3;
      this.rotation += this.rotSpeed;
      if (this.y > ch + 20) this.reset(false);
      if (this.x < -30) this.x = cw + 20;
      if (this.x > cw + 30) this.x = -20;
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = this.opacity;
      const color = getComputedStyle(root).getPropertyValue('--leaf-color').trim() || '#3a7a2a';
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, -this.size);
      ctx.bezierCurveTo(this.size * 0.8, -this.size * 0.5, this.size * 0.6, this.size * 0.6, 0, this.size);
      ctx.bezierCurveTo(-this.size * 0.6, this.size * 0.6, -this.size * 0.8, -this.size * 0.5, 0, -this.size);
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(0, -this.size); ctx.lineTo(0, this.size); ctx.stroke();
      ctx.restore();
    }
  }
  for (let i = 0; i < LEAF_COUNT; i++) leaves.push(new Leaf());

  let animId;
  function animate(t) {
    ctx.clearRect(0, 0, cw, ch);
    leaves.forEach(l => { l.update(t); l.draw(); });
    animId = requestAnimationFrame(animate);
  }
  animId = requestAnimationFrame(animate);

  /* --- Parallax on scroll (hero waves) --- */
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const w1 = document.querySelector('.hero__wave--1');
    const w2 = document.querySelector('.hero__wave--2');
    if (w1) w1.style.transform = `translateY(${y * 0.15}px)`;
    if (w2) w2.style.transform = `translateY(${y * 0.08}px)`;
  }, { passive: true });

  /* --- Smooth Scroll --- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
    });
  });
})();
