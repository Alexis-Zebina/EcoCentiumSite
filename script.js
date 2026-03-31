/* ============================================================
   EcoCentium — Landing Page Scripts
   - Navbar scroll behavior
   - Mobile menu
   - Scroll reveal animations
   - Animated counters
   - FAQ accordion
   - CTA form
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ──────────────────────────────────────────
     INTERNATIONALISATION (FR / EN)
  ────────────────────────────────────────── */
  let currentLang = localStorage.getItem('ec_lang') || 'fr';

  function applyTranslations(lang) {
    const t = translations[lang];
    if (!t) return;

    // Update html lang attribute
    document.documentElement.lang = lang;

    // Update page title
    document.title = t.meta_title || document.title;

    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && t.meta_description) metaDesc.setAttribute('content', t.meta_description);

    // Update all [data-i18n] → textContent
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (t[key] !== undefined) el.textContent = t[key];
    });

    // Update all [data-i18n-html] → innerHTML
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      if (t[key] !== undefined) el.innerHTML = t[key];
    });

    // Update all [data-i18n-placeholder] → placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (t[key] !== undefined) el.placeholder = t[key];
    });

    // Update toggle button label
    const toggle = document.getElementById('lang-toggle');
    if (toggle) toggle.textContent = lang === 'fr' ? 'EN' : 'FR';
  }

  function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('ec_lang', lang);
    applyTranslations(lang);
  }

  // Init
  applyTranslations(currentLang);

  // Toggle button
  const langToggle = document.getElementById('lang-toggle');
  if (langToggle) {
    langToggle.addEventListener('click', () => {
      setLanguage(currentLang === 'fr' ? 'en' : 'fr');
    });
  }


  /* ──────────────────────────────────────────
     NAVBAR — Scroll shadow + mobile burger
  ────────────────────────────────────────── */
  const navbar  = document.getElementById('navbar');
  const burger  = document.getElementById('nav-burger');
  const navMenu = document.getElementById('nav-links');
  const navLinksAll = document.querySelectorAll('.nav-link');

  // Add scrolled class for shadow
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  // Toggle mobile menu
  burger.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    burger.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', isOpen);
  });

  // Close mobile menu on link click
  navLinksAll.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', false);
    });
  });

  // Close menu on outside click
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) {
      navMenu.classList.remove('open');
      burger.classList.remove('open');
    }
  });


  /* ──────────────────────────────────────────
     SCROLL REVEAL ANIMATIONS
  ────────────────────────────────────────── */
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));


  /* ──────────────────────────────────────────
     FOUNDER NUMBER — numéro réel de membre
     Utilise localStorage pour persister le
     compteur sur la machine (démo locale).
     En production : remplacer par un appel API.
  ────────────────────────────────────────── */
  const founderCountEl = document.getElementById('founder-count');

  if (founderCountEl) {
    const stored = parseInt(localStorage.getItem('ec_founder_count') || '0', 10);
    if (stored > 0) {
      founderCountEl.textContent = stored;
    }
    // Will be updated on form submit (see CTA form below)
  }


  /* ──────────────────────────────────────────
     FAQ ACCORDION
  ────────────────────────────────────────── */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer   = item.querySelector('.faq-answer');

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all
      faqItems.forEach(other => {
        other.classList.remove('open');
        other.querySelector('.faq-answer').classList.remove('open');
        other.querySelector('.faq-question').setAttribute('aria-expanded', false);
      });

      // Open clicked (if it was closed)
      if (!isOpen) {
        item.classList.add('open');
        answer.classList.add('open');
        question.setAttribute('aria-expanded', true);
      }
    });
  });


  /* ──────────────────────────────────────────
     MULTISTEP FORM — 3 étapes
     Étape 1 : email → Étape 2 : profil → Étape 3 : succès
  ────────────────────────────────────────── */
  const form          = document.getElementById('cta-form');
  const emailInput    = document.getElementById('cta-email');
  const errorMsg      = document.getElementById('form-error');
  const step1         = document.getElementById('step-1');
  const step2         = document.getElementById('step-2');
  const step3         = document.getElementById('step-3');
  const profileCards  = document.querySelectorAll('.profile-card');
  const confirmBtn    = document.getElementById('confirm-profile');
  const shareBtn      = document.getElementById('share-btn');

  const profileLabels = {
    autodidacte:  'Autodidacte ambitieux',
    entrepreneur: 'Entrepreneur à impact',
    etudiant:     'Étudiant / en reconversion',
    citoyen:      'Citoyen engagé',
  };

  let capturedEmail   = '';
  let selectedProfile = '';

  const showStep = (hideEl, showEl) => {
    hideEl.classList.add('hidden');
    showEl.classList.remove('hidden');
    // Re-trigger animation
    showEl.style.animation = 'none';
    void showEl.offsetWidth;
    showEl.style.animation = '';
  };

  // ── Étape 1 : soumission email ──
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        emailInput.style.borderColor = 'var(--color-error)';
        if (errorMsg) errorMsg.textContent = currentLang === 'en'
          ? 'Please enter a valid email address.'
          : 'Entre une adresse email valide.';
        return;
      }

      emailInput.style.borderColor = '';
      if (errorMsg) errorMsg.textContent = '';
      capturedEmail = email;

      showStep(step1, step2);
      step2.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    emailInput.addEventListener('input', () => {
      emailInput.style.borderColor = '';
      if (errorMsg) errorMsg.textContent = '';
    });
  }

  // ── Étape 2 : sélection de profil ──
  profileCards.forEach(card => {
    card.addEventListener('click', () => {
      profileCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedProfile = card.getAttribute('data-profile');
      if (confirmBtn) confirmBtn.disabled = false;
    });
  });

  /* ── Envoi vers Brevo ── */
  async function addToBrevo(email, profile, founderNum, lang) {
    const BREVO_API_KEY = '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';
    const profileNames = {
      autodidacte:  'Autodidacte ambitieux',
      entrepreneur: 'Entrepreneur à impact',
      etudiant:     'Étudiant / en reconversion',
      citoyen:      'Citoyen engagé',
    };
    try {
      const res = await fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'api-key': BREVO_API_KEY
        },
        body: JSON.stringify({
          email: email,
          attributes: {
            FIRSTNAME: profileNames[profile] || profile,
            LASTNAME: `Fondateur #${founderNum}`
          },
          listIds: [2],
          updateEnabled: true
        })
      });
      if (!res.ok && res.status !== 204) {
        const errBody = await res.text();
        console.error('Brevo error', res.status, errBody);
      }
      return res.ok || res.status === 204;
    } catch (err) {
      console.error('Brevo sync failed:', err);
      return false;
    }
  }

  if (confirmBtn) {
    confirmBtn.addEventListener('click', async () => {
      // Désactiver le bouton pendant l'envoi
      confirmBtn.disabled = true;
      const originalBtnHTML = confirmBtn.innerHTML;
      const spinnerIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation:spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`;
      confirmBtn.innerHTML = spinnerIcon + (currentLang === 'en' ? ' Saving...' : ' Enregistrement...');

      // Assigner le numéro fondateur
      let founderNum = parseInt(localStorage.getItem('ec_founder_count') || '0', 10);
      founderNum += 1;
      localStorage.setItem('ec_founder_count', founderNum);

      // Mettre à jour l'affichage du numéro fondateur dans la section founders
      const founderEl = document.getElementById('founder-count');
      if (founderEl) founderEl.textContent = founderNum;

      // Envoyer à Brevo
      await addToBrevo(capturedEmail, selectedProfile, founderNum, currentLang);

      // Personnaliser l'étape 3 (avec traductions)
      const successNumber  = document.getElementById('success-number');
      const successTitle   = document.getElementById('success-title');
      const successMessage = document.getElementById('success-message');
      const t = translations[currentLang] || translations['fr'];

      if (successNumber) successNumber.textContent = `#${founderNum}`;
      if (successTitle)  successTitle.textContent  = t.success_title_default || 'Bienvenue dans le mouvement !';

      // Message personnalisé selon le profil
      const msgKey = `success_msg_${selectedProfile}`;
      if (successMessage) successMessage.textContent = t[msgKey] || t.success_msg_default || '';

      // Réactiver le bouton (au cas où l'utilisateur revient)
      confirmBtn.innerHTML = originalBtnHTML;
      confirmBtn.disabled = false;

      showStep(step2, step3);
      step3.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  // ── Partage ──
  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      const isEn = currentLang === 'en';
      const shareData = {
        title: 'EcoCentium — ' + (isEn ? 'Join the movement' : 'Rejoins le mouvement'),
        text: isEn
          ? 'I just joined EcoCentium, the platform reinventing education through collaboration. You should check it out.'
          : "Je viens de rejoindre EcoCentium, la plateforme qui réinvente l'éducation à travers la collaboration. Tu devrais y jeter un œil.",
        url: window.location.href,
      };
      if (navigator.share) {
        try { await navigator.share(shareData); } catch (_) {}
      } else {
        navigator.clipboard.writeText(window.location.href).then(() => {
          shareBtn.textContent = isEn ? '✓ Link copied!' : '✓ Lien copié !';
          setTimeout(() => {
            const t = translations[currentLang] || translations['fr'];
            shareBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg> ${t.share_btn || 'Partager le mouvement'}`;
          }, 2000);
        });
      }
    });
  }


  /* ──────────────────────────────────────────
     SMOOTH SCROLL for anchor links
  ────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const navHeight = navbar ? navbar.offsetHeight : 64;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 8;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });


  /* ──────────────────────────────────────────
     PROGRESS BAR ANIMATION in mockup
  ────────────────────────────────────────── */
  const progressFills = document.querySelectorAll('.progress-fill');

  const progressObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const targetWidth = el.style.width;
        el.style.width = '0%';
        // Trigger reflow
        void el.offsetWidth;
        el.style.transition = 'width 1.5s ease';
        el.style.width = targetWidth;
        progressObserver.unobserve(el);
      }
    });
  }, { threshold: 0.4 });

  progressFills.forEach(fill => progressObserver.observe(fill));


  /* ──────────────────────────────────────────
     ACTIVE NAV LINK on scroll (highlight)
  ────────────────────────────────────────── */
  const sections = document.querySelectorAll('section[id]');

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinksAll.forEach(link => {
          link.classList.toggle('active-link', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, {
    threshold: 0.35,
    rootMargin: '-64px 0px 0px 0px'
  });

  sections.forEach(section => navObserver.observe(section));

});
