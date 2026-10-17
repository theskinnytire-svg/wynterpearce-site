/* Wynter Pearce — portfolio interactions
   Dependency-free. No cookies, no tracking, no analytics. */
(function () {
  'use strict';

  var rm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- sticky bar state ---- */
  var bar = document.getElementById('topbar');
  var onScroll = function () {
    if (!bar) return;
    if (window.scrollY > 24) bar.classList.add('is-scrolled');
    else bar.classList.remove('is-scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- reveal on scroll ---- */
  var reveals = [].slice.call(document.querySelectorAll('.reveal'));
  if (rm || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); revObs.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { revObs.observe(el); });
  }

  /* ---- active section in the nav ---- */
  var links = [].slice.call(document.querySelectorAll('.nav a[href^="#"]'));
  var sections = links
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    var setActive = function (id) {
      links.forEach(function (a) {
        a.classList.toggle('is-active', a.getAttribute('href') === '#' + id);
      });
    };
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (s) { navObs.observe(s); });
  }

  /* ---- mobile menu ---- */
  var nav = document.getElementById('primaryNav');
  var btn = document.getElementById('menuBtn');
  if (nav && btn) {
    var setOpen = function (open) {
      nav.classList.toggle('is-open', open);
      bar.classList.toggle('is-menu', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    btn.addEventListener('click', function () {
      setOpen(!nav.classList.contains('is-open'));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') setOpen(false);
    });
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 820) setOpen(false);
    });
  }

  /* ---- keep a tapped nav link in view on small screens ---- */
  links.forEach(function (a) {
    a.addEventListener('click', function () {
      if (a.scrollIntoView) {
        try { a.scrollIntoView({ block: 'nearest', inline: 'center', behavior: rm ? 'auto' : 'smooth' }); } catch (e) {}
      }
    });
  });
})();
