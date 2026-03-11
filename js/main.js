/* =====================================================
   NTSRY.com — main.js
   ===================================================== */

'use strict';

// ── Footer year ──
document.getElementById('year').textContent = new Date().getFullYear();

// ── Nav: blur on scroll ──
const nav = document.getElementById('nav');

function handleNavScroll() {
  nav.classList.toggle('nav--scrolled', window.scrollY > 20);
}
window.addEventListener('scroll', handleNavScroll, { passive: true });
handleNavScroll();

// ── Hamburger / mobile menu ──
const hamburger    = document.getElementById('hamburger');
const mobileMenu   = document.getElementById('mobileMenu');
const mobileLinks  = mobileMenu.querySelectorAll('.nav__mobile-link');

function openMenu() {
  hamburger.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
  mobileMenu.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  mobileMenu.classList.remove('open');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
  mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
});

mobileLinks.forEach(link => link.addEventListener('click', closeMenu));

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (mobileMenu.classList.contains('open'))  closeMenu();
    if (lightbox.classList.contains('open'))    closeLightbox();
  }
});

// ── Active nav via IntersectionObserver ──
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav__link[data-section]');

const sectionObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.dataset.section === id);
        });
      }
    });
  },
  {
    rootMargin: `-${Math.floor(window.innerHeight * 0.4)}px 0px -${Math.floor(window.innerHeight * 0.4)}px 0px`,
    threshold: 0,
  }
);
sections.forEach(s => sectionObserver.observe(s));

// ── Scroll Reveal ──
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);

revealEls.forEach(el => revealObserver.observe(el));

// ── Custom Cursor (pointer:fine devices only) ──
if (window.matchMedia('(pointer: fine)').matches) {
  const cursor    = document.getElementById('cursor');
  const cursorDot = document.getElementById('cursorDot');

  let mouseX = -100, mouseY = -100;
  let ringX  = -100, ringY  = -100;
  let visible = false;
  let raf;

  // Dot tracks mouse exactly; ring lerps behind for smooth feel
  function animateCursor() {
    ringX += (mouseX - ringX) * 0.14;
    ringY += (mouseY - ringY) * 0.14;
    cursor.style.left    = ringX + 'px';
    cursor.style.top     = ringY + 'px';
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top  = mouseY + 'px';
    raf = requestAnimationFrame(animateCursor);
  }

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!visible) {
      visible = true;
      cursor.classList.add('cursor--visible');
      cursorDot.classList.add('cursor--visible');
      raf = requestAnimationFrame(animateCursor);
    }
  });

  document.addEventListener('mouseleave', () => {
    visible = false;
    cursor.classList.remove('cursor--visible');
    cursorDot.classList.remove('cursor--visible');
    cancelAnimationFrame(raf);
  });

  // Grow ring on interactive elements
  document.querySelectorAll('a, button, [role="button"]').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('cursor--hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('cursor--hover'));
  });
}

// ── Gallery Lightbox ──
const galleryItems    = document.querySelectorAll('.gallery__item');
const lightbox        = document.getElementById('lightbox');
const lightboxImg     = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose   = document.getElementById('lightboxClose');
const lightboxPrev    = document.getElementById('lightboxPrev');
const lightboxNext    = document.getElementById('lightboxNext');

const galleryImages = Array.from(galleryItems).map(item => {
  const img = item.querySelector('img');
  return { src: img.src, alt: img.alt };
});

let currentIndex = 0;

function openLightbox(index) {
  currentIndex = index;
  showImage(currentIndex);
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
  lightboxClose.focus();
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  galleryItems[currentIndex].focus();
}

function showImage(index) {
  const { src, alt } = galleryImages[index];
  lightboxImg.src = src;
  lightboxImg.alt = alt;
  lightboxCaption.textContent = alt;
}

function prevImage() {
  currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
  showImage(currentIndex);
}

function nextImage() {
  currentIndex = (currentIndex + 1) % galleryImages.length;
  showImage(currentIndex);
}

galleryItems.forEach((item, i) => {
  item.addEventListener('click', () => openLightbox(i));
  item.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
  });
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', prevImage);
lightboxNext.addEventListener('click', nextImage);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'ArrowLeft')  prevImage();
  if (e.key === 'ArrowRight') nextImage();
});

// Touch swipe for lightbox
let touchStartX = 0;
lightbox.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });
lightbox.addEventListener('touchend', e => {
  const delta = touchStartX - e.changedTouches[0].screenX;
  if (Math.abs(delta) > 50) delta > 0 ? nextImage() : prevImage();
}, { passive: true });
