import gsap from 'gsap';

// DOM Elements
const introLayer = document.getElementById('intro-layer');
const contentLayer = document.getElementById('scroll-container');
const bgMusic = document.getElementById('bg-music');

// Map scenes to their respective backgrounds
const bgFrames = {
  'scene-smile': document.getElementById('iframe-heart'),
  'scene-eyes': document.getElementById('iframe-heart'),
  'scene-memories': document.getElementById('bg-photo1'),
  'scene-presence': document.getElementById('bg-photo2'),
  'scene-blessing': document.getElementById('bg-photo2'),
  'scene-ending': document.getElementById('bg-photo3')
};

let currentBg = null;

// ==========================================
// 1. Audio Unlocking for Mobile
// ==========================================
// Called synchronously from the iframe's pointerup event to unlock audio
window.unlockAudio = function() {
  if (bgMusic) {
    // robust iOS fix: start playing silently during the user gesture!
    bgMusic.volume = 0;
    bgMusic.play().catch(e => console.log('Audio unlock failed:', e));
  }
};

// ==========================================
// 2. Listen for Archery Completion
// ==========================================
window.addEventListener('message', (event) => {
  if (event.data === 'START_CINEMATIC') {
    startCinematic();
  }
});

function startCinematic() {
  // Play Background Music
  if (bgMusic) {
    if (bgMusic.paused) {
      bgMusic.volume = 1;
      bgMusic.play().catch(e => console.log('Autoplay blocked:', e));
    } else {
      // It was playing silently from unlockAudio, fade it up
      gsap.to(bgMusic, { volume: 1, duration: 2 });
    }
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
      
      // Reveal the scroll indicator
      const scrollInd = document.getElementById('scroll-indicator');
      if (scrollInd) gsap.to(scrollInd, { opacity: 1, duration: 1.5, delay: 0.5 });
      
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
          // Hide scroll indicator at the end
          const scrollInd = document.getElementById('scroll-indicator');
          if (scrollInd) gsap.to(scrollInd, { opacity: 0, duration: 1 });
        } else {
          gsap.to(card, { opacity: 1, y: 0, duration: 1.5, ease: 'power2.out' });
          // Show scroll indicator for other scenes
          const scrollInd = document.getElementById('scroll-indicator');
          if (scrollInd) gsap.to(scrollInd, { opacity: 1, duration: 1 });
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
