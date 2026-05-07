'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initScrollAnimations();
  initCounters();
  initScrollSpy();
  initAccordion();
  initContactForm();
  initSmoothScroll();
  initHeroParallax();
});

function initNav() {
  const nav = document.getElementById('main-nav');
  if (!nav) return;

  const hamburger = nav.querySelector('.nav__hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  let isOpen = false;
  let ticking = false;
  let savedScrollY = 0;

  function openMenu() {
    isOpen = true;
    savedScrollY = window.scrollY;
    // iOS-safe body scroll lock: position:fixed + top offset preserves scroll position
    document.body.style.top = `-${savedScrollY}px`;
    document.body.classList.add('menu-open');
    nav.classList.add('nav--open');
    mobileMenu.classList.add('menu--open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.setAttribute('aria-hidden', 'false');
  }

  function closeMenu() {
    isOpen = false;
    // Restore scroll position before removing the body lock
    document.body.classList.remove('menu-open');
    document.body.style.top = '';
    window.scrollTo(0, savedScrollY);
    nav.classList.remove('nav--open');
    mobileMenu.classList.remove('menu--open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
  }

  hamburger.addEventListener('click', (e) => {
    e.stopPropagation(); // prevent the document click handler firing on the same event
    isOpen ? closeMenu() : openMenu();
  });

  mobileMenu.querySelectorAll('.nav__mobile-link, .btn').forEach(el => {
    el.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closeMenu();
  });

  // Close when tapping outside both the nav bar and the menu overlay
  document.addEventListener('click', (e) => {
    if (isOpen && !nav.contains(e.target) && !mobileMenu.contains(e.target)) closeMenu();
  });

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        nav.classList.toggle('scrolled', window.scrollY > 20);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  if (window.scrollY > 20) nav.classList.add('scrolled');
}

function initScrollAnimations() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const elements = document.querySelectorAll('.animate-on-scroll, .animate-slide-left, .animate-scale');

  if (prefersReduced || !elements.length) {
    elements.forEach(el => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
}

function initCounters() {
  const counters = document.querySelectorAll('[data-target]');
  if (!counters.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function easeOutQuad(t) { return t * (2 - t); }

  function animateCounter(el, target, suffix) {
    if (prefersReduced) {
      el.textContent = target + suffix;
      return;
    }
    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.round(easeOutQuad(progress) * target);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target + suffix;
    }

    requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        animateCounter(el, parseInt(el.dataset.target, 10), el.dataset.suffix || '');
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

function initScrollSpy() {
  const path = window.location.pathname;
  const filename = path.split('/').pop() || 'index.html';

  document.querySelectorAll('.nav__link').forEach(link => {
    const href = link.getAttribute('href');
    const isHome = (href === 'index.html') && (filename === '' || filename === 'index.html' || filename === '/');
    const isMatch = (href !== 'index.html') && filename === href;

    if (isHome || isMatch) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });
}

function initAccordion() {
  const items = document.querySelectorAll('.accordion__item');
  if (!items.length) return;

  items.forEach(item => {
    const trigger = item.querySelector('.accordion__trigger');
    if (!trigger) return;

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      items.forEach(i => {
        i.classList.remove('open');
        const t = i.querySelector('.accordion__trigger');
        if (t) t.setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const successEl = document.getElementById('form-success');
  const generalError = document.getElementById('form-general-error');
  const submitBtn = document.getElementById('submit-btn');
  const btnText = submitBtn ? submitBtn.querySelector('.btn__text') : null;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setFieldError(id, show) {
    const field = document.getElementById(id);
    const errorEl = document.getElementById(id + '-error');
    if (!field || !errorEl) return;
    field.classList.toggle('error', show);
    errorEl.classList.toggle('visible', show);
  }

  function clearErrors() {
    ['name', 'email', 'message'].forEach(id => setFieldError(id, false));
    if (generalError) generalError.classList.remove('visible');
  }

  function validate() {
    let valid = true;
    let firstInvalid = null;

    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const message = document.getElementById('message');

    if (!name || name.value.trim().length < 2) {
      setFieldError('name', true);
      valid = false;
      if (!firstInvalid) firstInvalid = name;
    }

    if (!email || !emailRegex.test(email.value.trim())) {
      setFieldError('email', true);
      valid = false;
      if (!firstInvalid) firstInvalid = email;
    }

    if (!message || message.value.trim().length < 10) {
      setFieldError('message', true);
      valid = false;
      if (!firstInvalid) firstInvalid = message;
    }

    if (firstInvalid) firstInvalid.focus();
    return valid;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();
    if (!validate()) return;

    if (submitBtn) submitBtn.disabled = true;
    if (btnText) btnText.textContent = 'Sending…';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        form.style.display = 'none';
        if (successEl) successEl.classList.add('visible');
      } else {
        throw new Error('Submission failed');
      }
    } catch {
      if (submitBtn) submitBtn.disabled = false;
      if (btnText) btnText.textContent = 'Send Message';
      if (generalError) generalError.classList.add('visible');
    }
  });
}

function initSmoothScroll() {
  const navHeight = 72;

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

function initHeroParallax() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const content = hero.querySelector('.hero__content');
  const trajectory = hero.querySelector('.hero__trajectory');
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        if (content) content.style.transform = `translateY(${scrollY * 0.04}px)`;
        if (trajectory) trajectory.style.transform = `translateY(${scrollY * 0.07}px)`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}
