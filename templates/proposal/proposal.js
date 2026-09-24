// UnconstrainED proposal template v2: compare slider, journey tabs, scripted demo,
// reaction bars, scroll progress and reveal. No dependencies, no tracking.
(() => {
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  document.documentElement.classList.remove('no-js');
  const cfg = window.PROPOSAL || {};
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} },
  };

  // Compare slider: a range input drives --pos on the container.
  $$('[data-compare]').forEach((el) => {
    const input = el.querySelector('input[type=range]');
    const set = () => el.style.setProperty('--pos', `${input.value}%`);
    input.addEventListener('input', set); set();
  });

  // Journey: accessible tabs with arrow-key support.
  $$('[data-journey]').forEach((root) => {
    const tabs = $$('[role=tab]', root);
    const show = (tab, focus) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) tab.focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => show(t));
      t.addEventListener('keydown', (e) => {
        const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (d) { e.preventDefault(); show(tabs[(i + d + tabs.length) % tabs.length], true); }
        if (e.key === 'Home') { e.preventDefault(); show(tabs[0], true); }
        if (e.key === 'End') { e.preventDefault(); show(tabs[tabs.length - 1], true); }
      });
    });
  });

  // Scripted demo: each question button reveals its pre-written answer.
  $$('[data-demo]').forEach((root) => {
    const body = root.querySelector('.demo-body');
    const btns = $$('[data-q]', root);
    btns.forEach((b) => b.addEventListener('click', () => {
      btns.forEach((x) => x.setAttribute('aria-pressed', x === b));
      const tpl = root.querySelector(`template[data-a="${b.dataset.q}"]`);
      body.innerHTML = '';
      const q = document.createElement('div'); q.className = 'msg q'; q.textContent = b.textContent;
      body.append(q, tpl.content.cloneNode(true));
    }));
  });

  // Reaction bars: POST to cfg.feedbackEndpoint if set, otherwise open a pre-filled email.
  const send = async (payload) => {
    if (cfg.feedbackEndpoint) {
      try {
        const r = await fetch(cfg.feedbackEndpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ proposal: cfg.id, ...payload }) });
        return r.ok ? 'sent' : 'error';
      } catch { return 'error'; }
    }
    if (!payload.comment) return 'local';
    const subject = `${cfg.title || 'Proposal'}: ${payload.chapter} (${payload.reaction || 'comment'})`;
    location.href = `mailto:${(cfg.contacts || []).join(',')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(payload.comment)}`;
    return 'mail';
  };
  const labels = { love: 'I love this', idea: 'I have an idea', question: 'I have a question', concern: 'I have a concern' };
  const icons = { love: '❤', idea: '💡', question: '❓', concern: '⚠' };
  $$('[data-react]').forEach((bar) => {
    const chapter = bar.dataset.react;
    bar.innerHTML = `<span>How does this land for you?</span>${Object.keys(labels).map((k) => `<button type="button" class="r" data-r="${k}" aria-pressed="false"><span aria-hidden="true">${icons[k]}</span>${labels[k]}</button>`).join('')}
      <div class="react-more" hidden><label class="small" for="c-${chapter}">Tell us more (optional)</label><textarea id="c-${chapter}"></textarea><div><button type="button" class="uc-button uc-button--small" data-send>Send to ${cfg.sendTo || 'us'}</button></div></div>
      <p class="react-status" role="status" aria-live="polite"></p>`;
    const more = bar.querySelector('.react-more');
    const status = bar.querySelector('.react-status');
    const prev = store.get(`uc-react-${cfg.id}-${chapter}`);
    $$('[data-r]', bar).forEach((b) => {
      if (b.dataset.r === prev) b.setAttribute('aria-pressed', 'true');
      b.addEventListener('click', async () => {
        $$('[data-r]', bar).forEach((x) => x.setAttribute('aria-pressed', x === b));
        store.set(`uc-react-${cfg.id}-${chapter}`, b.dataset.r);
        more.hidden = false;
        const r = await send({ chapter, reaction: b.dataset.r });
        status.textContent = r === 'sent' ? 'Thank you. We see this.' : r === 'error' ? 'That didn’t send. Add a note below and we’ll get it by email.' : 'Noted. Add a line below if you want us to hear why.';
      });
    });
    bar.querySelector('[data-send]').addEventListener('click', async () => {
      const ta = more.querySelector('textarea'); const comment = ta.value.trim();
      if (!comment) { ta.focus(); return; }
      const reaction = bar.querySelector('[data-r][aria-pressed="true"]')?.dataset.r || null;
      const r = await send({ chapter, reaction, comment });
      status.textContent = r === 'sent' ? 'Thank you. Your note reached us.' : r === 'mail' ? 'Your email app should open with the note ready to send.' : 'That didn’t send. Please email us directly.';
      if (r === 'sent') ta.value = '';
    });
  });

  // Scroll progress + reveal on scroll.
  const bar = document.querySelector('.progress');
  if (bar) addEventListener('scroll', () => { const h = document.documentElement; bar.style.width = `${(h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100}%`; }, { passive: true });
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });
    $$('.reveal').forEach((el) => io.observe(el));
  } else $$('.reveal').forEach((el) => el.classList.add('in'));
})();
