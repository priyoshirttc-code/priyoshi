/* ==================================================================
   Lamia Thasen Priyoshi — Luxury Portfolio
   ================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
     Preloader
  ------------------------------------------------------------------ */
  function initPreloader() {
    var preloader = document.getElementById('preloader');
    if (!preloader) return;
    var started = Date.now();
    var MIN_TIME = 1200;
    var done = false;

    function lift() {
      if (done) return;
      done = true;
      var wait = Math.max(0, MIN_TIME - (Date.now() - started));
      setTimeout(function () {
        preloader.classList.add('is-hidden');
        document.body.style.overflow = '';
      }, wait);
    }

    document.body.style.overflow = 'hidden';
    if (document.readyState === 'complete') lift();
    else window.addEventListener('load', lift);
    setTimeout(lift, 4000); // safety net
  }

  /* ------------------------------------------------------------------
     Navigation
  ------------------------------------------------------------------ */
  function initNav() {
    var nav = document.getElementById('nav');
    var burger = document.getElementById('burger');
    var mobileMenu = document.getElementById('mobileMenu');
    if (!nav) return;

    var onScroll = function () {
      nav.classList.toggle('is-scrolled', window.scrollY > 30);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    if (burger && mobileMenu) {
      burger.addEventListener('click', function () {
        var open = mobileMenu.classList.toggle('is-open');
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      mobileMenu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          mobileMenu.classList.remove('is-open');
          burger.setAttribute('aria-expanded', 'false');
        });
      });
    }

    var links = Array.prototype.slice.call(document.querySelectorAll('.nav__link'));
    var sections = links
      .map(function (l) { return document.querySelector(l.getAttribute('href')); })
      .filter(Boolean);

    if ('IntersectionObserver' in window && sections.length) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            links.forEach(function (l) {
              l.classList.toggle('is-active', l.getAttribute('href') === '#' + entry.target.id);
            });
          }
        });
      }, { rootMargin: '-40% 0px -55% 0px' });
      sections.forEach(function (s) { observer.observe(s); });
    }
  }

  /* ------------------------------------------------------------------
     Gold particle canvas
  ------------------------------------------------------------------ */
  function initParticles() {
    var canvas = document.getElementById('particles');
    if (!canvas || !canvas.getContext) return;

    var ctx = canvas.getContext('2d');
    var W = 0;
    var H = 0;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var particles = [];
    var orbs = [];
    var rafId = null;
    var angle = 0;
    var mouse = { x: 0, y: 0 };
    var cam = { x: 0, y: 0 };
    var COUNT = window.innerWidth < 768 ? 120 : 230;
    var RANGE = 1000;
    var FOCAL = 500;
    var CAM_Z = 550;
    var golds = [
      [201, 169, 106],
      [232, 213, 168],
      [140, 109, 47],
      [201, 169, 106],
      [180, 148, 90]
    ];

    function resize() {
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function build() {
      particles = [];
      for (var i = 0; i < COUNT; i++) {
        particles.push({
          x: (Math.random() - 0.5) * 900,
          y: (Math.random() - 0.5) * 560,
          z: Math.random() * RANGE,
          r: Math.random() * 1.7 + 0.5,
          color: golds[(Math.random() * golds.length) | 0],
          tw: Math.random() * Math.PI * 2,
          sp: 0.35 + Math.random() * 0.55,
          a: Math.random() * 0.5 + 0.3
        });
      }
      orbs = [
        { x: -280, y: -140, z: 220, r: 280, c: [201, 169, 106] },
        { x: 320, y: 150, z: 560, r: 360, c: [140, 109, 47] },
        { x: 40, y: -230, z: 800, r: 300, c: [201, 169, 106] }
      ];
    }

    function drawGlow(sx, sy, rad, rgb, alpha) {
      var g = ctx.createRadialGradient(sx, sy, 0, sx, sy, rad);
      g.addColorStop(0, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + alpha + ')');
      g.addColorStop(1, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(sx, sy, rad, 0, Math.PI * 2);
      ctx.fill();
    }

    function render(t) {
      ctx.clearRect(0, 0, W, H);
      angle += reduceMotion ? 0 : 0.0006;

      // camera easing toward pointer + gentle scroll drift
      cam.x += (mouse.x - cam.x) * 0.04;
      cam.y += (mouse.y - cam.y) * 0.04;
      var scrollY = typeof window !== 'undefined' ? window.scrollY : 0;
      var cx = W / 2 + cam.x;
      var cy = H / 2 + cam.y + scrollY * 0.18;

      // moving golden sheen sweep (adds depth & luxury)
      if (!reduceMotion) {
        var sx = W * (0.5 + 0.34 * Math.sin(t * 0.00008));
        var sy = H * (0.32 + 0.22 * Math.cos(t * 0.00006));
        drawGlow(sx, sy, Math.max(W, H) * 0.55, [201, 169, 106], 0.055);
      }

      // large soft orbs behind the particles
      for (var o = 0; o < orbs.length; o++) {
        var ob = orbs[o];
        var osc = reduceMotion ? 0 : 1;
        var ox = cx + (ob.x + Math.sin(t * 0.0002 + o) * 46 * osc) * (FOCAL / (ob.z + CAM_Z));
        var oy = cy + (ob.y + Math.cos(t * 0.00015 + o) * 34 * osc) * (FOCAL / (ob.z + CAM_Z));
        var orad = ob.r * (FOCAL / (ob.z + CAM_Z));
        var oalpha = Math.min(0.5 * (FOCAL / (ob.z + CAM_Z)), 0.32);
        if (orad > 2) drawGlow(ox, oy, orad, ob.c, oalpha);
      }

      // 3D particle field
      var cosA = Math.cos(angle);
      var sinA = Math.sin(angle);
      var denom = RANGE + CAM_Z;
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        if (!reduceMotion) {
          p.z -= p.sp * 1.3;
          if (p.z < 0) {
            p.z = RANGE;
            p.x = (Math.random() - 0.5) * 900;
            p.y = (Math.random() - 0.5) * 560;
          }
        }
        var rx = p.x * cosA - p.z * sinA;
        var rz = p.x * sinA + p.z * cosA;
        var pz = rz + CAM_Z;
        if (pz < 40) continue;
        var sc = FOCAL / pz;
        var px = cx + rx * sc;
        var py = cy + p.y * sc;
        if (px < -60 || px > W + 60 || py < -60 || py > H + 60) continue;
        var depthAlpha = Math.max(0.12, 1 - pz / denom);
        var tw = reduceMotion ? 0.8 : 0.6 + 0.4 * Math.sin(t * 0.002 + p.tw);
        var size = Math.max(p.r * sc * 5, 0.3);
        ctx.beginPath();
        ctx.fillStyle = 'rgba(' + p.color[0] + ',' + p.color[1] + ',' + p.color[2] + ',' + (p.a * depthAlpha * tw).toFixed(3) + ')';
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!reduceMotion) rafId = requestAnimationFrame(render);
    }

    function start() {
      resize();
      build();
      if (!rafId) {
        if (reduceMotion) render(0);
        else rafId = requestAnimationFrame(render);
      }
    }

    window.addEventListener('mousemove', function (e) {
      mouse.x = (e.clientX / W - 0.5) * 46;
      mouse.y = (e.clientY / H - 0.5) * 34;
    }, { passive: true });

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        COUNT = window.innerWidth < 768 ? 120 : 230;
        build();
        if (reduceMotion) render(0);
      }, 200);
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            if (!rafId && !reduceMotion) rafId = requestAnimationFrame(render);
          } else if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
          }
        });
      }).observe(canvas);
    }
    start();
  }

  /* ------------------------------------------------------------------
     Scroll reveal
  ------------------------------------------------------------------ */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || reduceMotion) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { observer.observe(el); });
  }

  /* ------------------------------------------------------------------
     Gallery filtering
  ------------------------------------------------------------------ */
  function initGallery() {
    var filters = document.querySelectorAll('.filter');
    var items = document.querySelectorAll('.gallery__item');
    if (!filters.length || !items.length) return;

    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var cat = btn.getAttribute('data-filter');
        filters.forEach(function (f) {
          var active = f === btn;
          f.classList.toggle('is-active', active);
          f.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        items.forEach(function (item) {
          var show = cat === 'all' || item.getAttribute('data-category') === cat;
          item.classList.toggle('is-hidden', !show);
        });
      });
    });
  }

  /* ------------------------------------------------------------------
     Media modal (video cards + gallery images)
  ------------------------------------------------------------------ */
  function initModal() {
    var modal = document.getElementById('modal');
    var media = document.getElementById('modalMedia');
    var caption = document.getElementById('modalCaption');
    if (!modal || !media) return;
    var lastFocused = null;

    function open(src, isVideo, title) {
      lastFocused = document.activeElement;
      media.innerHTML = '';
      var el = document.createElement(isVideo ? 'video' : 'img');
      el.src = src;
      if (isVideo) { el.controls = true; el.autoplay = true; }
      media.appendChild(el);
      caption.textContent = title || '';
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      var close = modal.querySelector('.modal__close');
      if (close) close.focus();
    }
    function close() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      media.innerHTML = '';
      if (lastFocused) lastFocused.focus();
    }

    // Video cards
    document.querySelectorAll('.video-card[data-video]').forEach(function (card) {
      card.addEventListener('click', function () {
        open(card.getAttribute('data-video'), true, card.getAttribute('data-title'));
      });
      card.setAttribute('tabindex', '0');
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open(card.getAttribute('data-video'), true, card.getAttribute('data-title'));
        }
      });
    });

    // Gallery images
    document.querySelectorAll('.gallery__item').forEach(function (item) {
      item.addEventListener('click', function () {
        open(item.getAttribute('data-src'), false, item.getAttribute('data-caption'));
      });
    });

    modal.querySelectorAll('[data-close]').forEach(function (el) {
      el.addEventListener('click', close);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
    });
  }

  /* ------------------------------------------------------------------
     Testimonial carousel
  ------------------------------------------------------------------ */
  function initTestimonials() {
    var slides = document.querySelectorAll('.testimonial__slide');
    var dotsWrap = document.getElementById('tDots');
    var prev = document.getElementById('tPrev');
    var next = document.getElementById('tNext');
    if (!slides.length) return;

    var current = 0;
    var dots = [];

    slides.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.className = 'testimonial__dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
      dot.addEventListener('click', function () { go(i); });
      dotsWrap.appendChild(dot);
      dots.push(dot);
    });

    function go(i) {
      current = (i + slides.length) % slides.length;
      slides.forEach(function (s, idx) { s.classList.toggle('is-active', idx === current); });
      dots.forEach(function (d, idx) { d.classList.toggle('is-active', idx === current); });
    }

    if (prev) prev.addEventListener('click', function () { go(current - 1); });
    if (next) next.addEventListener('click', function () { go(current + 1); });

    // Auto-advance (paused on hover)
    var timer = null;
    function start() {
      if (reduceMotion) return;
      stop();
      timer = setInterval(function () { go(current + 1); }, 6000);
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    var wrap = document.querySelector('.testimonial');
    if (wrap) {
      wrap.addEventListener('mouseenter', stop);
      wrap.addEventListener('mouseleave', start);
    }
    start();
  }

  /* ------------------------------------------------------------------
     FAQ accordion
  ------------------------------------------------------------------ */
  function initFaq() {
    document.querySelectorAll('.faq__item').forEach(function (item) {
      var q = item.querySelector('.faq__q');
      var a = item.querySelector('.faq__a');
      if (!q || !a) return;
      q.addEventListener('click', function () {
        var isOpen = item.classList.contains('is-open');
        // close others
        document.querySelectorAll('.faq__item.is-open').forEach(function (other) {
          if (other !== item) {
            other.classList.remove('is-open');
            other.querySelector('.faq__a').style.maxHeight = '0px';
            other.querySelector('.faq__q').setAttribute('aria-expanded', 'false');
          }
        });
        item.classList.toggle('is-open', !isOpen);
        q.setAttribute('aria-expanded', String(!isOpen));
        a.style.maxHeight = isOpen ? '0px' : a.scrollHeight + 'px';
      });
    });
  }

  /* ------------------------------------------------------------------
     Contact form — validation + honest delivery behaviour
     Set window.LAMIA_CONTACT_ENDPOINT to a service (EmailJS/Formspree)
     to actually deliver messages. Without it, the form explains the
     setup and offers a mailto fallback instead of faking success.
  ------------------------------------------------------------------ */
  function initContactForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;
    var note = document.getElementById('contactNote');

    function setError(fieldId, message) {
      var input = document.getElementById(fieldId);
      var field = input.closest('.field');
      var err = field.querySelector('.field__error');
      field.classList.toggle('has-error', !!message);
      if (message) err.textContent = message;
      input.setAttribute('aria-invalid', message ? 'true' : 'false');
    }

    function validate(data) {
      var errors = {};
      if (data.name.trim().length < 2) errors.cName = 'Please enter your name.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) errors.cEmail = 'Please enter a valid email address.';
      if (!data.type) errors.cType = 'Please choose a collaboration type.';
      if (data.message.trim().length < 10) errors.cMessage = 'Please tell me a little more (at least 10 characters).';
      return errors;
    }

    // live clearing
    ['cName', 'cEmail', 'cType', 'cMessage'].forEach(function (id) {
      var el = document.getElementById(id);
      el.addEventListener('input', function () { setError(id, ''); });
      el.addEventListener('change', function () { setError(id, ''); });
    });

    function showNote(message, type) {
      note.textContent = message;
      note.className = 'contact__note is-visible ' + (type ? 'contact__note--' + type : '');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = {
        name: form.name.value,
        email: form.email.value,
        type: form.type.value,
        message: form.message.value
      };
      var errors = validate(data);
      setError('cName', errors.cName);
      setError('cEmail', errors.cEmail);
      setError('cType', errors.cType);
      setError('cMessage', errors.cMessage);
      if (Object.keys(errors).length) {
        showNote('Please fix the highlighted fields above.', 'error');
        return;
      }

      var endpoint = window.LAMIA_CONTACT_ENDPOINT || '';
      if (endpoint) {
        showNote('Sending…', 'ok');
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: data.name.trim(),
            email: data.email.trim(),
            type: data.type,
            message: data.message.trim()
          })
        })
          .then(function (r) { if (!r.ok) throw new Error('Request failed'); })
          .then(function () {
            form.reset();
            showNote('Message sent — thank you! Lamia will get back to you soon.', 'ok');
          })
          .catch(function () {
            showNote('Your message could not be delivered right now. Please try again in a moment.', 'error');
          });
        return;
      }

      // No backend configured — be honest.
      var subject = encodeURIComponent('Collaboration inquiry: ' + data.type);
      var body = encodeURIComponent('Name: ' + data.name + '\nEmail: ' + data.email + '\nType: ' + data.type + '\n\n' + data.message);
      showNote(
        'Your message is ready, but this site is not connected to a delivery service yet — so nothing was sent. ' +
        'To receive messages: 1) create a free account with EmailJS or Formspree, 2) set window.LAMIA_CONTACT_ENDPOINT ' +
        'to your endpoint, 3) reload. Until then, you can email directly: ',
        'ok'
      );
      var link = document.createElement('a');
      link.href = 'mailto:hello@lamiathasen.com?subject=' + subject + '&body=' + body;
      link.textContent = 'hello@lamiathasen.com';
      link.style.color = 'var(--gold)';
      link.style.textDecoration = 'underline';
      note.appendChild(link);
    });
  }

  /* ------------------------------------------------------------------
     Init
  ------------------------------------------------------------------ */
  function init() {
    initPreloader();
    initNav();
    initParticles();
    initReveal();
    initGallery();
    initModal();
    initTestimonials();
    initFaq();
    initContactForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
