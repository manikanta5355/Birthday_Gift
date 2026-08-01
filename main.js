import gsap from 'gsap';

// DOM Elements
const introLayer = document.getElementById('intro-layer');
const contentLayer = document.getElementById('scroll-container');
const bgMusic = document.getElementById('bg-music');

// Map scenes to their respective backgrounds
const bgFrames = {
  'scene-smile': document.getElementById('iframe-heart'),
  'scene-eyes': document.getElementById('iframe-heart'),
  'scene-memories': document.getElementById('iframe-heart'),
  'scene-presence': document.getElementById('iframe-heart'),
  'scene-blessing': document.getElementById('iframe-heart'),
  'scene-ending': document.getElementById('bg-ghibli')
};

let currentBg = null;

// ==========================================
// 1. Listen for Archery Completion
// ==========================================
window.addEventListener('message', (event) => {
  if (event.data === 'START_CINEMATIC') {
    startCinematic();
  }
});

function startCinematic() {
  // Play Background Music
  if (bgMusic) {
    bgMusic.play().catch(e => console.log('Autoplay blocked:', e));
  }

  // Fade out the archery intro
  gsap.to(introLayer, {
    opacity: 0,
    duration: 1.5,
    ease: 'power2.out',
    onComplete: () => {
      introLayer.style.display = 'none';
      
      // Enable content layer
      contentLayer.style.opacity = '1';
      contentLayer.style.pointerEvents = 'auto';
      
      // Initialize scrolling observer
      initScrollAnimations();
    }
  });
}

// ==========================================
// 2. Cinematic Scroll Animations
// ==========================================
function initScrollAnimations() {
  const scenes = document.querySelectorAll('.scene');

  const observerOptions = {
    root: contentLayer,
    threshold: 0.5
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const card = entry.target.querySelector('.glass-card');
      
      if (entry.isIntersecting) {
        // Fade in text card
        if (card.classList.contains('glass-card--ending')) {
          gsap.to(card, { opacity: 1, scale: 1, duration: 1.5, ease: 'power3.out' });
        } else {
          gsap.to(card, { opacity: 1, y: 0, duration: 1.5, ease: 'power2.out' });
        }
        
        // Crossfade Backgrounds
        updateBackground(entry.target.id);
      } else {
        // Fade out text card when leaving
        if (card.classList.contains('glass-card--ending')) {
          gsap.to(card, { opacity: 0, scale: 0.9, duration: 1 });
        } else {
          gsap.to(card, { opacity: 0, y: 30, duration: 1 });
        }
      }
    });
  }, observerOptions);

  // Observe all scenes
  scenes.forEach(scene => {
    observer.observe(scene);
  });
}

function updateBackground(sceneId) {
  const nextBg = bgFrames[sceneId];
  if (nextBg && nextBg !== currentBg) {
    if (currentBg) gsap.to(currentBg, { opacity: 0, duration: 1.5 });
    gsap.to(nextBg, { opacity: 1, duration: 1.5 });
    currentBg = nextBg;
  }
}
