/* ============================================================
   LIQUID / ABSTRACT ART — v2  Script
   Three.js WebGL (morphing blob + particles + bloom)
   GSAP ScrollTrigger · Lenis Smooth Scroll
   ============================================================ */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
gsap.registerPlugin(ScrollTrigger);

const root = document.documentElement;
const THEME_KEY = 'ra-theme-liquid';
const isMobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;

/* ───────── SIMPLEX NOISE GLSL ───────── */
const NOISE_GLSL = `
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.);
  const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.-g;
  vec3 i1=min(g,l.zxy);
  vec3 i2=max(g,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(
    i.z+vec4(0.,i1.z,i2.z,1.))
    +i.y+vec4(0.,i1.y,i2.y,1.))
    +i.x+vec4(0.,i1.x,i2.x,1.));
  float n_=1./7.;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.;
  vec4 s1=floor(b1)*2.+1.;
  vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
  m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

/* ───────── SHADERS ───────── */
const blobVertex = `
${NOISE_GLSL}
uniform float uTime;
uniform float uStrength;
uniform float uFreq;
varying vec3 vNormal;
varying vec3 vWorldPos;
varying float vDisp;
void main(){
  vec3 pos=position;
  float n1=snoise(pos*uFreq+uTime*0.25);
  float n2=snoise(pos*uFreq*2.0+uTime*0.4)*0.5;
  float disp=(n1+n2)*uStrength;
  pos+=normal*disp;
  vNormal=normalize(normalMatrix*normal);
  vWorldPos=(modelMatrix*vec4(pos,1.)).xyz;
  vDisp=disp;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(pos,1.);
}`;

const blobFragment = `
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
varying vec3 vNormal;
varying vec3 vWorldPos;
varying float vDisp;
void main(){
  vec3 viewDir=normalize(cameraPosition-vWorldPos);
  float fresnel=pow(1.-abs(dot(viewDir,vNormal)),3.0);
  vec3 col=mix(uColor1,uColor2,fresnel);
  col=mix(col,uColor3,smoothstep(-0.3,0.3,vDisp));
  col*=0.55;
  float alpha=0.30+fresnel*0.25;
  gl_FragColor=vec4(col,alpha);
}`;

const particleVertex = `
attribute float aSize;
attribute float aPhase;
uniform float uTime;
varying float vAlpha;
void main(){
  vec3 pos=position;
  pos.y+=sin(uTime*0.4+aPhase)*0.15;
  pos.x+=cos(uTime*0.3+aPhase*1.3)*0.1;
  vec4 mv=modelViewMatrix*vec4(pos,1.);
  gl_PointSize=aSize*(250./-mv.z);
  gl_Position=projectionMatrix*mv;
  vAlpha=0.4+0.3*sin(uTime+aPhase);
}`;

const particleFragment = `
uniform vec3 uColor;
varying float vAlpha;
void main(){
  float d=length(gl_PointCoord-vec2(.5));
  if(d>.5)discard;
  float a=1.-smoothstep(0.,.5,d);
  gl_FragColor=vec4(uColor,a*vAlpha);
}`;

/* ───────── GLOBALS ───────── */
let scene, camera, renderer, composer, blob, blobMat, particleMat, clock;
let mouseX = 0, mouseY = 0;
let scrollProgress = 0;
let lenis;

/* ───────── THEME ───────── */
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) root.setAttribute('data-theme', saved);

  const btn = document.getElementById('themeBtn');
  const picker = document.getElementById('themePicker');
  btn.addEventListener('click', () => picker.classList.toggle('theme-picker--open'));

  document.querySelectorAll('[data-set-theme]').forEach(s => {
    s.addEventListener('click', () => {
      root.setAttribute('data-theme', s.dataset.setTheme);
      localStorage.setItem(THEME_KEY, s.dataset.setTheme);
      picker.classList.remove('theme-picker--open');
      updateWebGLColors();
    });
  });
  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !picker.contains(e.target))
      picker.classList.remove('theme-picker--open');
  });
}

/* ───────── LENIS ───────── */
function initLenis() {
  if (typeof window.Lenis === 'undefined') return;
  lenis = new window.Lenis({ lerp: 0.08, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ───────── CUSTOM CURSOR ───────── */
function initCursor() {
  if (isMobile) return;
  const c = document.getElementById('cursor');
  const d = document.getElementById('cursorDot');
  document.addEventListener('mousemove', e => {
    gsap.to(c, { x: e.clientX, y: e.clientY, duration: 0.45, ease: 'power3.out' });
    gsap.to(d, { x: e.clientX, y: e.clientY, duration: 0.08 });
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });
  const hovers = document.querySelectorAll('a, button, [data-magnetic], .fluid-card, .pill');
  hovers.forEach(el => {
    el.addEventListener('mouseenter', () => { c.classList.add('cursor--hover'); d.classList.add('cursor-dot--hover'); });
    el.addEventListener('mouseleave', () => { c.classList.remove('cursor--hover'); d.classList.remove('cursor-dot--hover'); });
  });
}

/* ───────── TEXT SPLITTING ───────── */
function splitText() {
  document.querySelectorAll('.char-wrap').forEach(el => {
    const text = el.textContent;
    el.innerHTML = text.split('').map(c =>
      c === ' ' ? '<span class="split-char">&nbsp;</span>' : `<span class="split-char">${c}</span>`
    ).join('');
  });
}

/* ───────── THREE.JS SCENE ───────── */
function getThemeColor(prop) {
  const hex = getComputedStyle(root).getPropertyValue(prop).trim();
  return new THREE.Color(hex || '#c060ff');
}

function initWebGL() {
  const canvas = document.getElementById('webgl');
  clock = new THREE.Clock();

  /* Renderer */
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.8;

  /* Scene & Camera */
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 5;

  /* Blob */
  const geo = new THREE.IcosahedronGeometry(1.5, isMobile ? 4 : 5);
  blobMat = new THREE.ShaderMaterial({
    vertexShader: blobVertex,
    fragmentShader: blobFragment,
    uniforms: {
      uTime: { value: 0 },
      uStrength: { value: 0.35 },
      uFreq: { value: 1.2 },
      uColor1: { value: getThemeColor('--grad-1') },
      uColor2: { value: getThemeColor('--grad-2') },
      uColor3: { value: getThemeColor('--grad-3') },
    },
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  blob = new THREE.Mesh(geo, blobMat);
  scene.add(blob);

  /* Wireframe overlay */
  const wireMat = new THREE.MeshBasicMaterial({ color: getThemeColor('--accent'), wireframe: true, transparent: true, opacity: 0.04 });
  const wire = new THREE.Mesh(geo.clone(), wireMat);
  wire.scale.setScalar(1.01);
  blob.add(wire);
  blob.userData.wire = wire;
  blob.userData.wireMat = wireMat;

  /* Particles */
  const pCount = isMobile ? 800 : 2500;
  const positions = new Float32Array(pCount * 3);
  const sizes = new Float32Array(pCount);
  const phases = new Float32Array(pCount);
  for (let i = 0; i < pCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 2.5 + Math.random() * 5;
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
    sizes[i] = 0.5 + Math.random() * 2;
    phases[i] = Math.random() * Math.PI * 2;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  pGeo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  pGeo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
  particleMat = new THREE.ShaderMaterial({
    vertexShader: particleVertex,
    fragmentShader: particleFragment,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: getThemeColor('--accent') },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const particles = new THREE.Points(pGeo, particleMat);
  scene.add(particles);

  /* Post-processing (bloom) */
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    isMobile ? 0.25 : 0.4,   // strength
    0.6,                      // radius
    0.4                       // threshold
  );
  composer.addPass(bloomPass);
  scene.userData.bloomPass = bloomPass;

  /* Resize */
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
  });

  /* Scroll progress for blob fade */
  window.addEventListener('scroll', () => {
    scrollProgress = window.scrollY / window.innerHeight;
  }, { passive: true });

  /* Animation loop */
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    blobMat.uniforms.uTime.value = t;
    particleMat.uniforms.uTime.value = t;

    /* Blob rotation + mouse influence */
    blob.rotation.y = t * 0.12 + mouseX * 0.3;
    blob.rotation.x = Math.sin(t * 0.08) * 0.15 + mouseY * 0.2;

    /* Camera subtle parallax */
    camera.position.x += (mouseX * 0.4 - camera.position.x) * 0.02;
    camera.position.y += (mouseY * 0.3 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);

    /* Fade blob as scroll goes past hero */
    const fade = Math.max(0, 1 - scrollProgress * 0.8);
    blob.scale.setScalar(0.9 + fade * 0.1);
    blob.material.opacity = fade;
    blob.userData.wireMat.opacity = 0.04 * fade;

    /* Particles slow rotation */
    particles.rotation.y = t * 0.02;

    /* Adjust bloom for light theme */
    const isLight = root.getAttribute('data-theme') === 'light';
    scene.userData.bloomPass.strength = isLight ? 0.15 : (isMobile ? 0.25 : 0.4);

    composer.render();
  }
  animate();
}

function updateWebGLColors() {
  if (!blobMat) return;
  blobMat.uniforms.uColor1.value = getThemeColor('--grad-1');
  blobMat.uniforms.uColor2.value = getThemeColor('--grad-2');
  blobMat.uniforms.uColor3.value = getThemeColor('--grad-3');
  particleMat.uniforms.uColor.value = getThemeColor('--accent');
  if (blob.userData.wireMat) blob.userData.wireMat.color = getThemeColor('--accent');
}

/* ───────── LOADER ───────── */
function runLoader() {
  return new Promise(resolve => {
    const counter = document.getElementById('loaderCount');
    const fill = document.getElementById('loaderFill');
    const obj = { val: 0 };
    gsap.to(obj, {
      val: 100, duration: 2.2, ease: 'power2.inOut',
      onUpdate: () => {
        const v = Math.round(obj.val);
        counter.textContent = v;
        fill.style.width = v + '%';
      },
      onComplete: () => {
        gsap.to('#loader', {
          yPercent: -100, duration: 0.9, ease: 'power4.inOut', delay: 0.25,
          onComplete: () => { document.getElementById('loader').style.display = 'none'; resolve(); }
        });
      }
    });
  });
}

/* ───────── HERO ENTRANCE ───────── */
function animateHero() {
  const tl = gsap.timeline();
  tl.to('.hero__label', { opacity: 1, duration: 0.8, ease: 'power2.out' })
    .to('.split-char', {
      opacity: 1, y: 0, rotateX: 0,
      stagger: 0.025, duration: 0.9, ease: 'power4.out'
    }, '-=0.4')
    .to('.hero__role', { opacity: 1, duration: 0.7, ease: 'power2.out' }, '-=0.5')
    .to('.hero__cta .btn', { opacity: 1, stagger: 0.12, duration: 0.6, ease: 'power2.out' }, '-=0.4')
    .to('.hero__scroll', { opacity: 1, duration: 0.6 }, '-=0.2');
}

/* ───────── SCROLL ANIMATIONS ───────── */
function initScrollAnimations() {
  /* Section titles & labels */
  gsap.utils.toArray('.sec-title, .sec-label').forEach(el => {
    gsap.from(el, {
      opacity: 0, y: 40, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%' }
    });
  });

  /* Reveal lines (clip-path) */
  gsap.utils.toArray('.reveal-line').forEach((el, i) => {
    ScrollTrigger.create({
      trigger: el, start: 'top 80%',
      onEnter: () => {
        gsap.to(el, { delay: i * 0.15, onStart: () => el.classList.add('reveal-line--visible') });
      }
    });
  });

  /* Stat cards */
  gsap.utils.toArray('.stat-card').forEach((el, i) => {
    gsap.from(el, {
      opacity: 0, y: 40, scale: 0.95, duration: 0.7,
      delay: i * 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%' }
    });
  });

  /* Skill groups, edu cards, edu extras */
  gsap.utils.toArray('.skills__group, .edu__card, .edu__extra').forEach((el, i) => {
    gsap.from(el, {
      opacity: 0, y: 50, duration: 0.8, delay: (i % 4) * 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%' }
    });
  });

  /* Projects */
  gsap.utils.toArray('.proj').forEach((el, i) => {
    gsap.from(el, {
      opacity: 0, x: -60, duration: 0.8, delay: i * 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%' }
    });
  });

  /* Contact */
  gsap.from('.contact__box', {
    opacity: 0, y: 60, scale: 0.96, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: '.contact__box', start: 'top 80%' }
  });

  /* Language pills */
  gsap.utils.toArray('.about__lang .pill').forEach((el, i) => {
    gsap.from(el, {
      opacity: 0, x: -20, duration: 0.5, delay: i * 0.1, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%' }
    });
  });
}

/* ───────── HORIZONTAL SCROLL (EXPERIENCE) ───────── */
function initHorizontalScroll() {
  const track = document.getElementById('expTrack');
  if (!track) return;
  const totalScroll = track.scrollWidth - window.innerWidth + 100;

  const scrollTween = gsap.to(track, {
    x: -totalScroll,
    ease: 'none',
    scrollTrigger: {
      trigger: '.experience',
      start: 'top top',
      end: () => `+=${totalScroll}`,
      pin: true,
      scrub: 1,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    }
  });

  /* Animate cards as they enter horizontal viewport */
  document.querySelectorAll('.exp-card').forEach(card => {
    gsap.from(card, {
      opacity: 0.2, scale: 0.88, rotateY: -12,
      scrollTrigger: {
        trigger: card,
        containerAnimation: scrollTween,
        start: 'left 95%',
        end: 'left 55%',
        scrub: true,
      }
    });
  });
}

/* ───────── CARD INTERACTIONS ───────── */
function initCardEffects() {
  /* Spotlight follow */
  document.querySelectorAll('.fluid-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
      card.style.setProperty('--my', `${e.clientY - rect.top}px`);
    });
  });

  /* 3D Tilt on portfolio cards */
  document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(card, {
        rotateY: x * 8, rotateX: -y * 8,
        duration: 0.4, ease: 'power2.out',
        transformPerspective: 800
      });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.6, ease: 'elastic.out(1,0.6)' });
    });
  });
}

/* ───────── MAGNETIC BUTTONS ───────── */
function initMagnetic() {
  if (isMobile) return;
  document.querySelectorAll('[data-magnetic]').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(btn, { x: x * 0.25, y: y * 0.25, duration: 0.3, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.5)' });
    });
  });
}

/* ───────── COUNTERS ───────── */
function initCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count, 10);
    const obj = { val: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 82%', once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: target, duration: 2.2, ease: 'power2.out',
          onUpdate: () => { el.textContent = Math.round(obj.val).toLocaleString(); }
        });
      }
    });
  });
}

/* ───────── NAV ───────── */
function initNav() {
  const nav = document.getElementById('nav');
  const links = document.querySelectorAll('[data-nav]');
  const sections = document.querySelectorAll('.section, .experience');
  const burger = document.getElementById('burger');
  const mobile = document.getElementById('mobileMenu');
  const backTop = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('nav--scrolled', window.scrollY > 60);
    backTop.classList.toggle('back-to-top--visible', window.scrollY > 600);
    let cur = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 200) cur = s.id; });
    links.forEach(l => { l.classList.toggle('active', l.getAttribute('href') === '#' + cur); });
  }, { passive: true });

  backTop.addEventListener('click', () => {
    if (lenis) lenis.scrollTo(0); else window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  burger.addEventListener('click', () => {
    burger.classList.toggle('nav__burger--open');
    mobile.classList.toggle('mobile-menu--open');
  });
  mobile.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    burger.classList.remove('nav__burger--open');
    mobile.classList.remove('mobile-menu--open');
  }));

  /* Smooth scroll all anchor links */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        if (lenis) lenis.scrollTo(target); else target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/* ───────── INIT ───────── */
function init() {
  initTheme();
  splitText();
  initLenis();
  initWebGL();
  initCursor();
  initNav();

  runLoader().then(() => {
    animateHero();
    initScrollAnimations();
    initHorizontalScroll();
    initCardEffects();
    initMagnetic();
    initCounters();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
