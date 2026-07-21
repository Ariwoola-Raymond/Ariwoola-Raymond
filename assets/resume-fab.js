/* ============================================================
   Floating Resume Download Button (FAB)
   Self-contained — auto-injects DOM, styles, and behavior.
   Reads page theme colors via CSS custom properties.
   ============================================================ */
(() => {
  'use strict';

  // Temporarily hide the resume download option across all portfolio themes.
  const RESUME_DOWNLOAD_ENABLED = false;
  if (!RESUME_DOWNLOAD_ENABLED) return;

  const RESUME_PATH = '/assets/Raymond-Ariwoola-Resume.pdf';

  /* ── Detect accent color from whichever CSS-variable convention the page uses ── */
  function getAccent() {
    const s = getComputedStyle(document.documentElement);
    return (
      s.getPropertyValue('--accent').trim() ||
      s.getPropertyValue('--accent-1').trim() ||
      '#7c6aef'
    );
  }

  function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const n = parseInt(hex, 16);
    return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
  }

  /* ── Inject scoped styles ── */
  const style = document.createElement('style');
  style.textContent = `
    /* --- Resume FAB --- */
    .resume-fab{
      position:fixed;bottom:2rem;left:2rem;z-index:9000;
      display:flex;align-items:center;
      text-decoration:none;
      cursor:pointer!important;
      -webkit-tap-highlight-color:transparent;
      outline:none;
      filter:drop-shadow(0 4px 12px rgba(0,0,0,.25));
      transition:filter .4s;
    }
    .resume-fab:hover{filter:drop-shadow(0 6px 24px rgba(0,0,0,.35))}

    /* Orb */
    .resume-fab__orb{
      width:50px;height:50px;
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      flex-shrink:0;
      transition:border-radius .45s cubic-bezier(.22,1,.36,1),
                 box-shadow .45s cubic-bezier(.22,1,.36,1),
                 transform .4s cubic-bezier(.22,1,.36,1);
      animation:rfab-breathe 3.5s ease-in-out infinite;
    }
    .resume-fab__orb svg{
      width:22px;height:22px;
      transition:transform .35s cubic-bezier(.22,1,.36,1);
    }
    .resume-fab:hover .resume-fab__orb{
      animation:none;
      border-radius:25px 0 0 25px;
      transform:translateY(-2px);
    }
    .resume-fab:hover .resume-fab__orb svg{transform:rotate(-8deg) scale(1.1)}

    /* Label slide-out */
    .resume-fab__label{
      overflow:hidden;max-width:0;
      white-space:nowrap;
      font-family:inherit;font-size:.8rem;font-weight:600;
      letter-spacing:.06em;
      color:#fff;
      padding:.75rem 0;
      border-radius:0 25px 25px 0;
      transition:max-width .45s cubic-bezier(.22,1,.36,1),
                 padding .45s cubic-bezier(.22,1,.36,1),
                 transform .4s cubic-bezier(.22,1,.36,1);
    }
    .resume-fab:hover .resume-fab__label{
      max-width:180px;
      padding:.75rem 1.4rem .75rem .55rem;
      transform:translateY(-2px);
    }

    /* Tooltip for non-hover devices */
    .resume-fab__tip{
      position:absolute;left:60px;bottom:0;
      background:rgba(0,0,0,.78);color:#fff;
      font-size:.72rem;padding:.35rem .7rem;border-radius:6px;
      white-space:nowrap;pointer-events:none;
      opacity:0;transform:translateX(-6px);
      transition:opacity .3s,transform .3s;
    }
    .resume-fab:active .resume-fab__tip{opacity:1;transform:translateX(0)}

    @keyframes rfab-breathe{
      0%,100%{transform:scale(1)}
      50%{transform:scale(1.08)}
    }
    @media(max-width:768px){
      .resume-fab{bottom:1.4rem;left:1.4rem}
      .resume-fab__orb{width:44px;height:44px}
      .resume-fab__orb svg{width:20px;height:20px}
      /* On mobile, always show mini label */
      .resume-fab__label{
        max-width:120px!important;
        padding:.65rem 1rem .65rem .4rem!important;
        font-size:.72rem;
        border-radius:0 22px 22px 0;
      }
      .resume-fab__orb{border-radius:22px 0 0 22px;animation:none}
    }
  `;
  document.head.appendChild(style);

  /* ── Build DOM ── */
  const fab = document.createElement('a');
  fab.href = RESUME_PATH;
  fab.download = 'Raymond-Ariwoola-Resume.pdf';
  fab.className = 'resume-fab';
  fab.setAttribute('aria-label', 'Download Resume');
  fab.innerHTML = `
    <div class="resume-fab__orb">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" fill="rgba(255,255,255,.15)" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M14 2v6h6" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 18v-6" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>
        <path d="m9 15.5 3 3 3-3" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <span class="resume-fab__label">Get Resume</span>
  `;

  /* ── Apply accent colors dynamically (works regardless of variable naming) ── */
  function applyColors() {
    const accent = getAccent();
    const rgb = hexToRgb(accent);
    const orb = fab.querySelector('.resume-fab__orb');
    const label = fab.querySelector('.resume-fab__label');
    orb.style.background = accent;
    orb.style.boxShadow = `0 0 22px rgba(${rgb},.35)`;
    label.style.background = accent;
  }

  /* Re-apply when theme changes (observe data-theme attribute) */
  const observer = new MutationObserver(() => setTimeout(applyColors, 50));
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  /* ── Insert into page ── */
  function mount() {
    document.body.appendChild(fab);
    applyColors();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
