/* =========================================================
   UNTUK KAMU — script.js  (Vanilla JS, tanpa framework)
   ========================================================= */
(function () {
  'use strict';

  var body = document.body;
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =======================================================
     1. OPENING → BUKA
     ===================================================== */
  var opening = document.getElementById('opening');
  var btnOpen = document.getElementById('btnOpen');

  function openLetter() {
    opening.classList.add('is-hidden');
    body.classList.remove('is-locked');
    // mulai floating hearts pelan-pelan setelah dibuka
    startHearts();
    // reveal hero segera
    setTimeout(revealCheck, 100);
  }
  if (btnOpen) btnOpen.addEventListener('click', openLetter);

  /* =======================================================
     2. GALLERY — muat foto otomatis dari folder /img
        Mencoba img1..imgN dengan beberapa ekstensi.
        Kalau kamu menambah img3.jpeg dst, otomatis muncul.
     ===================================================== */
  var galleryGrid = document.getElementById('galleryGrid');
  var exts = ['jpeg', 'jpg', 'png', 'webp', 'JPG', 'JPEG'];
  var MAX_PHOTOS = 20;

  function tryLoad(index, extPos, onDone) {
    if (extPos >= exts.length) { onDone(null); return; }
    var src = 'img/img' + index + '.' + exts[extPos];
    var probe = new Image();
    probe.onload = function () { onDone(src); };
    probe.onerror = function () { tryLoad(index, extPos + 1, onDone); };
    probe.src = src;
  }

  function buildGallery() {
    if (!galleryGrid) return;
    var found = [];
    var pending = MAX_PHOTOS;

    for (var i = 1; i <= MAX_PHOTOS; i++) {
      (function (idx) {
        tryLoad(idx, 0, function (src) {
          if (src) found.push({ idx: idx, src: src });
          if (--pending === 0) renderGallery(found);
        });
      })(i);
    }
  }

  function renderGallery(found) {
    found.sort(function (a, b) { return a.idx - b.idx; });
    galleryGrid.innerHTML = '';
    found.forEach(function (item) {
      var fig = document.createElement('figure');
      fig.className = 'gallery__item reveal';
      var img = document.createElement('img');
      img.src = item.src;
      img.alt = 'Momen kita';
      img.loading = 'lazy';
      fig.appendChild(img);
      fig.addEventListener('click', function () { openLightbox(item.src); });
      galleryGrid.appendChild(fig);
    });
    // grid 1 kolom kalau cuma 1 foto
    if (found.length === 1) galleryGrid.style.gridTemplateColumns = '1fr';
    revealCheck();
  }
  buildGallery();

  /* =======================================================
     3. LIGHTBOX / GALLERY POPUP
     ===================================================== */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxClose = document.getElementById('lightboxClose');

  function openLightbox(src) {
    lightboxImg.src = src;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
  }
  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
  }
  if (lightbox) {
    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  /* =======================================================
     4. REVEAL ON SCROLL (fade in)
     ===================================================== */
  var revealEls = null;
  var observer = null;

  if ('IntersectionObserver' in window && !prefersReduced) {
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
  }

  function revealCheck() {
    revealEls = document.querySelectorAll('.reveal:not(.is-visible)');
    if (observer) {
      revealEls.forEach(function (el) { observer.observe(el); });
    } else {
      // fallback: langsung tampilkan
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    }
  }
  revealCheck();

  /* =======================================================
     5. SCROLL PROGRESS + BACK TO TOP
     ===================================================== */
  var progress = document.getElementById('scrollProgress');
  var backTop = document.getElementById('backTop');

  function onScroll() {
    var st = window.pageYOffset || document.documentElement.scrollTop;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var pct = h > 0 ? (st / h) * 100 : 0;
    if (progress) progress.style.width = pct + '%';
    if (backTop) backTop.classList.toggle('show', st > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (backTop) {
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  }

  /* =======================================================
     6. RIPPLE BUTTON
     ===================================================== */
  document.querySelectorAll('.ripple').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      var rect = btn.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height);
      var ink = document.createElement('span');
      ink.className = 'ripple-ink';
      ink.style.width = ink.style.height = size + 'px';
      ink.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ink.style.top = (e.clientY - rect.top - size / 2) + 'px';
      btn.appendChild(ink);
      setTimeout(function () { ink.remove(); }, 650);
    });
  });

  /* =======================================================
     7. FLOATING HEARTS (ambient, lembut)
     ===================================================== */
  var heartsLayer = document.getElementById('heartsLayer');
  var hearts = ['🤍', '🩷', '💗', '🤍'];
  var heartsTimer = null;

  function spawnHeart(x, big) {
    if (!heartsLayer) return;
    var span = document.createElement('span');
    span.className = 'heart';
    span.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    var left = x != null ? x : Math.random() * 100;
    span.style.left = left + 'vw';
    var dur = (big ? 3.2 : 6 + Math.random() * 4);
    span.style.animationDuration = dur + 's';
    span.style.fontSize = (big ? 20 + Math.random() * 20 : 12 + Math.random() * 14) + 'px';
    heartsLayer.appendChild(span);
    setTimeout(function () { span.remove(); }, dur * 1000 + 200);
  }

  function startHearts() {
    if (prefersReduced || heartsTimer) return;
    heartsTimer = setInterval(function () {
      // hanya spawn kalau tab terlihat, biar hemat
      if (!document.hidden) spawnHeart();
    }, 2600);
  }

  /* =======================================================
     8. PELUK VIRTUAL 🤍
     ===================================================== */
  var btnHug = document.getElementById('btnHug');
  var hugMsg = document.getElementById('hugMsg');
  var hugMessages = [
    'Anggap ini pelukan hangat dariku ya. 🤍',
    'Kalau lagi capek, baca ini lagi. Aku selalu di sini.',
    'Sini, kupeluk dulu. Semua bakal baik-baik saja.',
    'Terima kasih sudah jadi kamu. Aku sayang kamu.',
    'Sekarang senyum dong sedikit. Iya, kamu yang lagi baca ini. 🤍'
  ];
  var hugIndex = 0;

  if (btnHug) {
    btnHug.addEventListener('click', function () {
      // ledakan hati dari tengah bawah tombol
      var rect = btnHug.getBoundingClientRect();
      var centerVw = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
      var burst = prefersReduced ? 6 : 22;
      for (var i = 0; i < burst; i++) {
        (function (n) {
          setTimeout(function () {
            spawnHeart(centerVw + (Math.random() * 40 - 20), true);
          }, n * 55);
        })(i);
      }
      // pesan bergantian
      hugMsg.textContent = hugMessages[hugIndex % hugMessages.length];
      hugMsg.classList.add('show');
      hugIndex++;
    });
  }

  /* =======================================================
     9. SMOOTH SCROLL untuk anchor (kalau ada nanti)
     ===================================================== */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length > 1) {
        var target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
        }
      }
    });
  });

})();
