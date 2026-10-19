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

  /* ================= photo strip + lightbox ================= */
  (function () {
    var viewport = document.getElementById('photoStrip');
    var lightbox = document.getElementById('lightbox');
    if (!viewport || !lightbox) return;

    var track   = viewport.querySelector('.photostrip__track');
    var all     = [].slice.call(track.querySelectorAll('.photostrip__item'));
    var count   = all.length;
    if (!count) return;

    /* duplicate the set once so the slow drift can loop with no visible seam */
    var frag = document.createDocumentFragment();
    all.forEach(function (item) {
      var clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.setAttribute('tabindex', '-1');
      frag.appendChild(clone);
    });
    track.appendChild(frag);
    var every = [].slice.call(track.querySelectorAll('.photostrip__item'));

    var setWidth = 0;                          /* distance from the first real item to the first clone */
    var positioned = false, dragging = false, hovering = false, boxOpen = false;
    var slideUntil = 0;

    function measure() {
      if (every.length > count) {
        var w = every[count].offsetLeft - every[0].offsetLeft;
        if (w > 0) setWidth = w;
      }
      if (setWidth > 0 && !positioned) {
        /* start one set in, so there is room to browse in both directions */
        viewport.scrollLeft = setWidth;
        positioned = true;
      }
    }

    function wrap() {
      if (setWidth <= 0) return;
      if (viewport.scrollLeft >= setWidth) viewport.scrollLeft -= setWidth;
      else if (viewport.scrollLeft < 0) viewport.scrollLeft += setWidth;
    }

    function frame() {
      if (setWidth <= 0) measure();
      var busy = hovering || dragging || boxOpen || Date.now() < slideUntil;
      if (!busy) viewport.scrollLeft += 0.6;   /* about 36px a second */
      if (Date.now() >= slideUntil) wrap();
      requestAnimationFrame(frame);
    }

    measure();
    window.addEventListener('load', measure);
    window.addEventListener('resize', measure);
    /* images arrive at different times, so re-measure whenever the track changes size */
    if ('ResizeObserver' in window) {
      try { new ResizeObserver(measure).observe(track); } catch (err) {}
    }

    if (!rm) requestAnimationFrame(frame);

    /* pause while the pointer is over the strip, or while it holds focus */
    viewport.addEventListener('pointerenter', function () { hovering = true; });
    viewport.addEventListener('pointerleave', function () { hovering = false; });
    viewport.addEventListener('focusin', function () { hovering = true; });
    viewport.addEventListener('focusout', function () { hovering = false; });

    /* ---- drag to browse (mouse and pen; touch uses native scrolling) ---- */
    var startX = 0, startScroll = 0, moved = 0, down = false;
    viewport.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch' || e.button !== 0) return;
      down = true; moved = 0; startX = e.clientX; startScroll = viewport.scrollLeft;
      viewport.classList.add('is-dragging');
      try { viewport.setPointerCapture(e.pointerId); } catch (err) {}
    });
    viewport.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > moved) moved = Math.abs(dx);
      viewport.scrollLeft = startScroll - dx;
      if (e.cancelable) e.preventDefault();
    });
    function endDrag(e) {
      if (!down) return;
      down = false;
      viewport.classList.remove('is-dragging');
      try { viewport.releasePointerCapture(e.pointerId); } catch (err) {}
      wrap();
    }
    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);

    /* ---- arrow buttons ---- */
    function slide(dir) {
      var step = Math.max(280, viewport.clientWidth * 0.8) * dir;
      slideUntil = Date.now() + 620;
      try { viewport.scrollBy({ left: step, behavior: rm ? 'auto' : 'smooth' }); }
      catch (err) { viewport.scrollLeft += step; }
    }
    var prevBtn = document.querySelector('[data-strip-prev]');
    var nextBtn = document.querySelector('[data-strip-next]');
    if (prevBtn) prevBtn.addEventListener('click', function () { slide(-1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { slide(1); });

    /* ---- lightbox ---- */
    var lbImg = lightbox.querySelector('.lightbox__img');
    var lbCap = lightbox.querySelector('.lightbox__cap');
    var closeBtn = lightbox.querySelector('[data-lb-close]');
    var lbPrev = lightbox.querySelector('[data-lb-prev]');
    var lbNext = lightbox.querySelector('[data-lb-next]');
    var shots = every.slice(0, count).map(function (item) {
      var img = item.querySelector('img');
      return {
        full: item.getAttribute('data-full'),
        caption: item.getAttribute('data-caption') || '',
        alt: (img && img.getAttribute('alt')) || ''
      };
    });
    var current = 0, lastFocus = null;

    function show(i) {
      current = (i + shots.length) % shots.length;
      var s = shots[current];
      lbImg.setAttribute('src', s.full);
      lbImg.setAttribute('alt', s.alt);
      lbCap.textContent = s.caption + '  ·  ' + (current + 1) + ' / ' + shots.length;
    }

    function openBox(i) {
      lastFocus = document.activeElement;
      show(i);
      lightbox.hidden = false;
      boxOpen = true;
      document.body.classList.add('lb-open');
      if (closeBtn) closeBtn.focus();
    }

    function closeBox() {
      lightbox.hidden = true;
      boxOpen = false;
      document.body.classList.remove('lb-open');
      lbImg.removeAttribute('src');
      if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (err) {} }
    }

    viewport.addEventListener('click', function (e) {
      if (moved > 8) { moved = 0; return; }             /* that was a drag, not a click */
      var item = e.target.closest ? e.target.closest('.photostrip__item') : null;
      if (!item) return;
      var idx = every.indexOf(item);
      if (idx < 0) return;
      openBox(idx % count);
    });

    if (closeBtn) closeBtn.addEventListener('click', closeBox);
    if (lbPrev) lbPrev.addEventListener('click', function () { show(current - 1); });
    if (lbNext) lbNext.addEventListener('click', function () { show(current + 1); });
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeBox();            /* click the backdrop to close */
    });
    document.addEventListener('keydown', function (e) {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') closeBox();
      else if (e.key === 'ArrowRight') show(current + 1);
      else if (e.key === 'ArrowLeft') show(current - 1);
    });
  })();
})();
