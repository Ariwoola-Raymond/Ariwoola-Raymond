/* ============================================================
   Projects Launcher — shared FAB + modal + redirect confirm
   Pair with /assets/projects-launcher.css

   To add/remove a project, edit the PROJECTS array below.
   To disable on a page, simply remove the <script>/<link> tags.
   Shortcuts: Shift + P (open/close) · Esc (close/cancel) · Enter (proceed)
   ============================================================ */
(() => {
    'use strict';
    if (window.__projectsLauncherLoaded) return;
    window.__projectsLauncherLoaded = true;

    /* ── Config ── */
    const REDIRECT_SECONDS = 10;

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
        },
            { 
            title: 'Little Learners',
            desc: 'A progressive web app for toddlers and early learners (ages 2–6). Hoot the owl guides children through interactive lessons in letters, numbers, colours, animals, shapes, and more.',
            url: 'https://raymondariwoola.github.io/LittleLearners/',
            icon: '🦉'
        },
            { 
            title: 'Psych Lab',
            desc: 'Interactive experiments from game theory, behavioural economics and cognitive psychology and a profile built from how you actually play',
            url: 'https://lab.raymondariwoola.com/',
            icon: '🎮'
        },
            { 
            title: 'StackFall',
            desc: 'A one-tap precision stacking game where you drop shifting-color floors as fast and clean as you can — miss the edge and the tower falls.',
            url: 'https://raymondariwoola.github.io/StackFall/',
            icon: '☰'
        }
    ];

    /* ── Sync accent color into our namespaced var ── */
    const FALLBACK_ACCENT = '#7c6aef';

    function parseColor(str) {
        if (!str) return null;
        str = str.trim();
        // #rgb / #rrggbb
        const hex = str.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
        if (hex) {
            let h = hex[1];
            if (h.length === 3) h = h.split('').map(c => c + c).join('');
            const n = parseInt(h, 16);
            return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
        }
        // rgb(a)
        const rgb = str.match(/rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/i);
        if (rgb) return { r: +rgb[1], g: +rgb[2], b: +rgb[3] };
        return null;
    }

    // Relative luminance per WCAG
    function luminance({ r, g, b }) {
        const c = [r, g, b].map(v => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    }

    function syncAccent() {
        const s = getComputedStyle(document.documentElement);
        const raw =
            s.getPropertyValue('--accent').trim() ||
            s.getPropertyValue('--accent-1').trim() ||
            s.getPropertyValue('--primary').trim() ||
            FALLBACK_ACCENT;
        const rgb = parseColor(raw);
        // If the theme accent is too dark (luminance < 0.18), fall back so it
        // stays visible on the modal's dark panel.
        const accent = (rgb && luminance(rgb) >= 0.18) ? raw : FALLBACK_ACCENT;
        document.documentElement.style.setProperty('--pl-accent', accent);
        // Choose a readable text color for the primary button (dark text on
        // light accents, white text on darker accents).
        const accentRgb = parseColor(accent) || parseColor(FALLBACK_ACCENT);
        const onAccent = luminance(accentRgb) > 0.55 ? '#0b0b10' : '#ffffff';
        document.documentElement.style.setProperty('--pl-on-accent', onAccent);
    }

    /* ── Build floating button ── */
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

    /* ── Build modal (grid view + confirm view) ── */
    function buildModal() {
        const overlay = document.createElement('div');
        overlay.className = 'pl-modal';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', 'pl-modal-title');

        const cards = PROJECTS.map((p, i) => `
      <a class="pl-card" href="${p.url}" data-pl-index="${i}"
         target="_blank" rel="noopener noreferrer">
        <span class="pl-card__icon" aria-hidden="true">${p.icon || '↗'}</span>
        <h3 class="pl-card__title">${p.title}</h3>
        <p class="pl-card__desc">${p.desc || ''}</p>
      </a>
    `).join('');

        overlay.innerHTML = `
      <div class="pl-modal__panel" role="document">
        <div class="pl-view pl-view--grid">
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

        <div class="pl-view pl-view--confirm" aria-hidden="true">
          <div class="pl-confirm">
            <div class="pl-confirm__ring" aria-hidden="true">
              <svg viewBox="0 0 80 80">
                <circle class="pl-ring__track" cx="40" cy="40" r="34"></circle>
                <circle class="pl-ring__bar"   cx="40" cy="40" r="34"></circle>
              </svg>
              <span class="pl-confirm__count">${REDIRECT_SECONDS}</span>
            </div>
            <h3 class="pl-confirm__title">Heading to <span data-pl-name>this project</span></h3>
            <p class="pl-confirm__desc">
              You're about to leave this page and head to
              <a class="pl-confirm__url" data-pl-url href="#" rel="noopener noreferrer">the destination</a>.
              Redirecting in <strong data-pl-count>${REDIRECT_SECONDS}</strong>s.
            </p>
            <div class="pl-confirm__actions">
              <button type="button" class="pl-btn pl-btn--ghost" data-pl-cancel>Cancel</button>
              <button type="button" class="pl-btn pl-btn--primary" data-pl-proceed>Proceed now</button>
            </div>
            <p class="pl-confirm__hint">
              <kbd>Esc</kbd> to cancel · <kbd>Enter</kbd> to proceed
            </p>
          </div>
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

        const closeBtn = modal.querySelector('.pl-modal__close');
        const gridView = modal.querySelector('.pl-view--grid');
        const confirmView = modal.querySelector('.pl-view--confirm');
        const nameEl = confirmView.querySelector('[data-pl-name]');
        const urlEl = confirmView.querySelector('[data-pl-url]');
        const countEl = confirmView.querySelector('[data-pl-count]');
        const countBig = confirmView.querySelector('.pl-confirm__count');
        const ringBar = confirmView.querySelector('.pl-ring__bar');
        const cancelBtn = confirmView.querySelector('[data-pl-cancel]');
        const proceedBtn = confirmView.querySelector('[data-pl-proceed]');
        const ringCirc = 2 * Math.PI * 34; // r=34
        ringBar.style.strokeDasharray = ringCirc.toFixed(2);

        let lastFocus = null;
        let countdownTimer = null;
        let pendingProject = null;

        const stopCountdown = () => {
            if (countdownTimer) {
                clearInterval(countdownTimer);
                countdownTimer = null;
            }
        };

        const showGrid = () => {
            stopCountdown();
            modal.classList.remove('is-confirming');
            gridView.removeAttribute('aria-hidden');
            confirmView.setAttribute('aria-hidden', 'true');
            pendingProject = null;
        };

        const open = () => {
            lastFocus = document.activeElement;
            modal.classList.add('is-open');
            showGrid();
            const firstCard = modal.querySelector('.pl-card');
            (firstCard || closeBtn).focus({ preventScroll: true });
            document.documentElement.style.overflow = 'hidden';
        };

        const close = () => {
            stopCountdown();
            modal.classList.remove('is-open');
            modal.classList.remove('is-confirming');
            document.documentElement.style.overflow = '';
            if (lastFocus && typeof lastFocus.focus === 'function') {
                lastFocus.focus({ preventScroll: true });
            }
        };

        const toggle = () => {
            modal.classList.contains('is-open') ? close() : open();
        };

        const performRedirect = () => {
            const proj = pendingProject;
            stopCountdown();
            if (!proj) return;
            // Navigate the current tab — reliable from both user click and
            // the auto-countdown (popup blockers reject window.open after
            // a delayed timer with no fresh user gesture).
            window.location.assign(proj.url);
        };

        const showConfirm = (proj) => {
            pendingProject = proj;
            nameEl.textContent = proj.title;
            urlEl.textContent = proj.url;
            urlEl.href = proj.url;
            modal.classList.add('is-confirming');
            gridView.setAttribute('aria-hidden', 'true');
            confirmView.removeAttribute('aria-hidden');

            let remaining = REDIRECT_SECONDS;
            const render = () => {
                countEl.textContent = remaining;
                countBig.textContent = remaining;
                const progress = (REDIRECT_SECONDS - remaining) / REDIRECT_SECONDS;
                ringBar.style.strokeDashoffset = (ringCirc * (1 - progress)).toFixed(2);
            };
            render();
            proceedBtn.focus({ preventScroll: true });

            stopCountdown();
            countdownTimer = setInterval(() => {
                remaining -= 1;
                if (remaining <= 0) {
                    render();
                    performRedirect();
                    return;
                }
                render();
            }, 1000);
        };

        /* ── Card click → confirmation ── */
        gridView.addEventListener('click', (e) => {
            const card = e.target.closest('.pl-card');
            if (!card) return;
            // Allow modifier-clicks (open in new tab/window) to bypass confirm
            if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;
            e.preventDefault();
            const idx = Number(card.dataset.plIndex);
            const proj = PROJECTS[idx];
            if (proj) showConfirm(proj);
        });

        cancelBtn.addEventListener('click', showGrid);
        proceedBtn.addEventListener('click', performRedirect);

        fab.addEventListener('click', open);
        closeBtn.addEventListener('click', close);
        modal.addEventListener('click', (e) => {
            if (e.target !== modal) return;
            // Backdrop click: cancel confirm first, then close
            if (modal.classList.contains('is-confirming')) showGrid();
            else close();
        });

        /* ── Keyboard ── */
        document.addEventListener('keydown', (e) => {
            const isOpen = modal.classList.contains('is-open');
            const isConfirming = modal.classList.contains('is-confirming');

            // Esc: cancel confirm if active, else close modal
            if (e.key === 'Escape' && isOpen) {
                e.preventDefault();
                if (isConfirming) showGrid();
                else close();
                return;
            }
            // Enter while confirming: proceed
            if (isConfirming && e.key === 'Enter') {
                e.preventDefault();
                performRedirect();
                return;
            }
            // Ignore launcher shortcut when typing
            const t = e.target;
            const isTyping = t && (
                t.tagName === 'INPUT' ||
                t.tagName === 'TEXTAREA' ||
                t.tagName === 'SELECT' ||
                t.isContentEditable
            );
            if (isTyping) return;
            // Shift + P (without Ctrl/Cmd/Alt)
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
