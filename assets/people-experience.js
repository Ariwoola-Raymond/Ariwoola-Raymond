/* ============================================================
   People Experience & Engagement
   Shared CV enrichment section for every portfolio theme.
   ============================================================ */
(() => {
  'use strict';

  if (document.getElementById('people-experience')) return;

  const style = document.createElement('style');
  style.textContent = `
    .pce-section {
      --pce-accent: var(--accent, var(--accent-1, #7c6aef));
      --pce-bg: var(--bg-alt, var(--bg-secondary, var(--bg-gradient-2, transparent)));
      --pce-card: var(--bg-card, var(--surface, var(--glass-bg, rgba(127, 127, 127, .08))));
      --pce-text: var(--text-primary, var(--text, var(--heading, inherit)));
      --pce-muted: var(--text-secondary, var(--text-2, var(--text-muted, var(--text-dim, currentColor))));
      --pce-border: var(--border-color, var(--border, var(--line, var(--glass-border, rgba(127, 127, 127, .2)))));
      position: relative;
      z-index: 3;
      padding: clamp(5rem, 8vw, 8rem) 1.5rem;
      background: var(--pce-bg);
      color: var(--pce-text);
      overflow: hidden;
    }
    .pce-section::before {
      content: '';
      position: absolute;
      width: 26rem;
      height: 26rem;
      top: -13rem;
      right: -8rem;
      border-radius: 50%;
      background: var(--pce-accent);
      opacity: .06;
      filter: blur(24px);
      pointer-events: none;
    }
    .pce-wrap {
      width: min(1160px, 100%);
      margin: 0 auto;
      position: relative;
    }
    .pce-header {
      max-width: 830px;
      margin-bottom: clamp(2.5rem, 5vw, 4rem);
    }
    .pce-kicker {
      margin: 0 0 .85rem;
      color: var(--pce-accent);
      font-size: .78rem;
      font-weight: 700;
      letter-spacing: .14em;
      line-height: 1.4;
      text-transform: uppercase;
    }
    .pce-title {
      margin: 0;
      color: var(--pce-text);
      font: inherit;
      font-size: clamp(2rem, 4.8vw, 4rem);
      font-weight: 700;
      letter-spacing: -.035em;
      line-height: 1.08;
    }
    .pce-lead {
      max-width: 760px;
      margin: 1.25rem 0 0;
      color: var(--pce-muted);
      font-size: clamp(1rem, 1.4vw, 1.12rem);
      line-height: 1.8;
    }
    .pce-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1rem;
    }
    .pce-card,
    .pce-foundation {
      border: 1px solid var(--pce-border);
      background: var(--pce-card);
      -webkit-backdrop-filter: blur(16px);
      backdrop-filter: blur(16px);
    }
    .pce-card {
      min-height: 220px;
      padding: clamp(1.5rem, 3vw, 2.15rem);
      border-radius: 18px;
      transition: transform .3s ease, border-color .3s ease, box-shadow .3s ease;
    }
    .pce-card:hover {
      transform: translateY(-4px);
      border-color: var(--pce-accent);
      box-shadow: 0 18px 45px rgba(0, 0, 0, .12);
    }
    .pce-card__number {
      display: inline-grid;
      width: 2.4rem;
      height: 2.4rem;
      place-items: center;
      margin-bottom: 1.25rem;
      border: 1px solid var(--pce-accent);
      border-radius: 999px;
      color: var(--pce-accent);
      font-size: .72rem;
      font-weight: 700;
      letter-spacing: .08em;
    }
    .pce-card h3,
    .pce-foundation h3 {
      margin: 0 0 .75rem;
      color: var(--pce-text);
      font: inherit;
      font-size: 1.1rem;
      font-weight: 700;
      line-height: 1.35;
    }
    .pce-card p,
    .pce-foundation p {
      margin: 0;
      color: var(--pce-muted);
      font-size: .94rem;
      line-height: 1.75;
    }
    .pce-foundation {
      display: grid;
      grid-template-columns: minmax(0, 1.45fr) minmax(280px, .75fr);
      gap: clamp(2rem, 5vw, 4.5rem);
      margin-top: 1rem;
      padding: clamp(1.75rem, 4vw, 3rem);
      border-radius: 18px;
    }
    .pce-learning p + p {
      margin-top: .85rem;
    }
    .pce-foundation strong {
      color: var(--pce-text);
      font-weight: 700;
    }
    .pce-development {
      padding-left: clamp(0rem, 2vw, 2rem);
      border-left: 1px solid var(--pce-border);
    }
    .pce-status {
      display: grid;
      gap: .75rem;
      margin-top: 1rem;
    }
    .pce-status__item {
      padding: .9rem 1rem;
      border: 1px solid var(--pce-border);
      border-radius: 12px;
      color: var(--pce-text);
      font-size: .85rem;
      font-weight: 600;
      line-height: 1.5;
    }
    .pce-status__item span {
      display: block;
      margin-top: .25rem;
      color: var(--pce-accent);
      font-size: .7rem;
      font-weight: 700;
      letter-spacing: .09em;
      text-transform: uppercase;
    }
    @media (max-width: 760px) {
      .pce-section { padding-inline: 1.1rem; }
      .pce-grid,
      .pce-foundation { grid-template-columns: 1fr; }
      .pce-card { min-height: 0; }
      .pce-development {
        padding: 1.5rem 0 0;
        border-top: 1px solid var(--pce-border);
        border-left: 0;
      }
    }
  `;

  const section = document.createElement('section');
  section.id = 'people-experience';
  section.className = 'pce-section';
  section.setAttribute('aria-labelledby', 'pce-title');
  section.innerHTML = `
    <div class="pce-wrap">
      <header class="pce-header">
        <p class="pce-kicker">People Experience &amp; Engagement</p>
        <h2 class="pce-title" id="pce-title">Turning people strategy into experiences that stick.</h2>
        <p class="pce-lead">I design and govern the platforms, journeys, and moments that help 10,000+ employees connect, learn, contribute, and thrive - combining human-centered design, applied behavioral psychology, and rigorous program governance.</p>
      </header>

      <div class="pce-grid" role="list" aria-label="People experience capabilities and outcomes">
        <article class="pce-card" role="listitem">
          <span class="pce-card__number">01</span>
          <h3>Employee voice to action</h3>
          <p>I conceived and led Think Space, a group-wide idea platform that enables employees to submit, track, and champion ideas, with structured review and direct ownership that closes the loop between employee voice and organizational action.</p>
        </article>
        <article class="pce-card" role="listitem">
          <span class="pce-card__number">02</span>
          <h3>Insight-led people decisions</h3>
          <p>I designed and now govern the People &amp; Culture Dashboard, bringing engagement, culture-health, and knowledge-performance measures into a central leadership view for data-informed decisions and executive reporting.</p>
        </article>
        <article class="pce-card" role="listitem">
          <span class="pce-card__number">03</span>
          <h3>Culture, values, and recognition</h3>
          <p>I led a culture transformation within the Group Knowledge Office, redesigning team rituals, feedback loops, and recognition practices to strengthen engagement and knowledge-sharing behaviors and inform wider interventions.</p>
        </article>
        <article class="pce-card" role="listitem">
          <span class="pce-card__number">04</span>
          <h3>Journey and behavior design</h3>
          <p>I apply journey mapping, moments-that-matter design, motivation theory, choice architecture, and habit-formation principles to improve adoption - building on experience delivering more than 100 end-to-end journeys.</p>
        </article>
      </div>

      <div class="pce-foundation">
        <div class="pce-learning">
          <h3>Psychology-informed practice</h3>
          <p>Behavioral and organizational psychology shape how I approach employee experience and sustained change: decision biases in adoption, autonomy and mastery in engagement, and habit-loop design in system rollouts.</p>
          <p><strong>Read and applied:</strong> <em>Thinking, Fast and Slow</em>, <em>Drive</em>, and <em>The Power of Habit</em>.</p>
          <p><strong>Currently building on:</strong> <em>Nudge</em>, <em>Your Brain at Work</em>, and <em>The Culture Code</em>.</p>
        </div>
        <aside class="pce-development" aria-label="Professional development">
          <h3>Professional development</h3>
          <div class="pce-status">
            <div class="pce-status__item">PROSCI Change Management Practitioner Certification<span>In progress · 2026</span></div>
            <div class="pce-status__item">CIPD Level 5 Diploma in People Management<span>In progress · 2026</span></div>
          </div>
        </aside>
      </div>
    </div>
  `;

  function mount() {
    const education = document.getElementById('education');
    const contact = document.getElementById('contact');
    const anchor = education || contact;

    document.head.appendChild(style);
    if (anchor) {
      anchor.parentNode.insertBefore(section, anchor);
    } else {
      document.body.appendChild(section);
    }

  }

  if (document.readyState === 'loading' && !document.getElementById('education')) {
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  } else {
    mount();
  }
})();
