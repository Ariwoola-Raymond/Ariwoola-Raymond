/* ============================================================
   Projects Launcher — shared FAB + modal
   Pair with /assets/projects-launcher.css

   To add/remove a project, edit the PROJECTS array below.
   To disable on a page, simply remove the <script>/<link> tags.
   Keyboard shortcut: Shift + P  (Esc to close)
   ============================================================ */
(() => {
    'use strict';
    if (window.__projectsLauncherLoaded) return;
    window.__projectsLauncherLoaded = true;

    /* ── Edit this list to manage launcher entries ── */
    const PROJECTS = [
        {
            title: 'The Clock Game',
            desc: 'A reflex-based timing challenge — stop the clock at the right moment.',
            url: 'https://raymondariwoola.github.io/TheClockGame/GameMode/index.html',
            icon: '⏱️'
        },
        {
            title: 'Clock Quest',
            desc: 'A beautifully gamified, voice-interactive clock-learning suite for young children, designed to make learning to tell time fun and engaging.',
            url: 'https://raymondariwoola.github.io/TheClockGame/',
            icon: '🕰️'
        }
        // Add more: { title, desc, url, icon }
    ];

    /* ── Sync accent color into our namespaced var ── */
    function syncAccent() {
        const s = getComputedStyle(document.documentElement);
        const accent =
            s.getPropertyValue('--accent').trim() ||
            s.getPropertyValue('--accent-1').trim() ||
            s.getPropertyValue('--primary').trim() ||
            '#7c6aef';
        document.documentElement.style.setProperty('--pl-accent', accent);
    }

    /* ── Build DOM ── */
    function buildFab() {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'pl-fab';
        btn.setAttribute('aria-label', 'Open projects launcher (Shift + P)');
        btn.setAttribute('aria-haspopup', 'dialog');
        btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
           aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
        <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
        <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
        <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
      </svg>
      <span class="pl-fab__hint">Projects &nbsp;<kbd>Shift</kbd>+<kbd>P</kbd></span>
    `;
        return btn;
    }

    function buildModal() {
        const overlay = document.createElement('div');
        overlay.className = 'pl-modal';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', 'pl-modal-title');
        overlay.hidden = false;

        const cards = PROJECTS.map(p => `
      <a class="pl-card" href="${p.url}" target="_blank" rel="noopener noreferrer">
        <span class="pl-card__icon" aria-hidden="true">${p.icon || '↗'}</span>
        <h3 class="pl-card__title">${p.title}</h3>
        <p class="pl-card__desc">${p.desc || ''}</p>
      </a>
    `).join('');

        overlay.innerHTML = `
      <div class="pl-modal__panel" role="document">
        <div class="pl-modal__head">
          <div>
            <h2 class="pl-modal__title" id="pl-modal-title">Other Projects</h2>
            <p class="pl-modal__subtitle">Quick links to live experiments and side projects.</p>
          </div>
          <button type="button" class="pl-modal__close" aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"
                 aria-hidden="true">
              <line x1="5" y1="5" x2="19" y2="19"></line>
              <line x1="19" y1="5" x2="5" y2="19"></line>
            </svg>
          </button>
        </div>
        <div class="pl-grid">${cards}</div>
        <div class="pl-modal__foot">
          <span>Press <kbd>Esc</kbd> to close</span>
          <span>Shortcut: <kbd>Shift</kbd> + <kbd>P</kbd></span>
        </div>
      </div>
    `;
        return overlay;
    }

    /* ── Mount ── */
    function init() {
        syncAccent();
        const fab = buildFab();
        const modal = buildModal();
        document.body.appendChild(fab);
        document.body.appendChild(modal);

        const panel = modal.querySelector('.pl-modal__panel');
        const closeBtn = modal.querySelector('.pl-modal__close');
        let lastFocus = null;

        const open = () => {
            lastFocus = document.activeElement;
            modal.classList.add('is-open');
            // Focus first card (or close button if no cards)
            const firstCard = modal.querySelector('.pl-card');
            (firstCard || closeBtn).focus({ preventScroll: true });
            document.documentElement.style.overflow = 'hidden';
        };

        const close = () => {
            modal.classList.remove('is-open');
            document.documentElement.style.overflow = '';
            if (lastFocus && typeof lastFocus.focus === 'function') {
                lastFocus.focus({ preventScroll: true });
            }
        };

        const toggle = () => {
            modal.classList.contains('is-open') ? close() : open();
        };

        fab.addEventListener('click', open);
        closeBtn.addEventListener('click', close);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) close();
        });

        /* ── Keyboard shortcut ── */
        document.addEventListener('keydown', (e) => {
            // Esc always closes
            if (e.key === 'Escape' && modal.classList.contains('is-open')) {
                e.preventDefault();
                close();
                return;
            }
            // Ignore when typing in inputs
            const t = e.target;
            const isTyping = t && (
                t.tagName === 'INPUT' ||
                t.tagName === 'TEXTAREA' ||
                t.tagName === 'SELECT' ||
                t.isContentEditable
            );
            if (isTyping) return;
            // Shift + P (not when Ctrl/Cmd/Alt also held)
            if (e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey &&
                (e.key === 'P' || e.key === 'p')) {
                e.preventDefault();
                toggle();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
