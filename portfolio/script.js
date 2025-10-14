// AOS initialization for scroll animations
AOS.init({
  duration: 700,
  once: true,
  offset: 60
});

// Typed.js for hero section typing animation
new Typed('#typed', {
  strings: [
    "A Developer",
    "A Web Enthusiast",
    "A Problem Solver",
    "A Lifelong Learner"
  ],
  typeSpeed: 42,
  backSpeed: 30,
  loop: true,
  showCursor: false,
  smartBackspace: true
});

// Theme toggle with dark/light mode state in localStorage
const themeToggle = document.getElementById('theme-toggle');
const root = document.documentElement;

function setTheme(isDark) {
  if (isDark) {
    root.classList.add('dark');
    themeToggle.textContent = '☀️';
  } else {
    root.classList.remove('dark');
    themeToggle.textContent = '🌙';
  }
  try {
    localStorage.setItem('theme-dark', isDark ? '1' : '0');
  } catch (e) {}
}

// Initialize theme preference on load
(function () {
  const stored = localStorage.getItem('theme-dark');
  if (stored !== null) setTheme(stored === '1');
  else setTheme(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
})();
themeToggle.addEventListener('click', () => {
  setTheme(root.classList.toggle('dark'));
});

// Mobile hamburger menu toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.getElementById('nav-links');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', navLinks.classList.contains('open'));
});
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// Project card modals open/close
document.querySelectorAll('.view-details-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    document.querySelectorAll('.project-card.active').forEach(card => card.classList.remove('active'));
    e.target.closest('.project-card').classList.add('active');
  });
});
document.querySelectorAll('.close-overlay').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    e.target.closest('.project-card').classList.remove('active');
  });
});
// Close modal by Esc key or clicking overlay
document.addEventListener('keydown', e => {
  if (e.key === "Escape") {
    document.querySelectorAll('.project-card.active').forEach(card => card.classList.remove('active'));
  }
});
document.addEventListener('click', e => {
  if (e.target.classList.contains('overlay')) {
    e.target.closest('.project-card').classList.remove('active');
  }
});

// Simple contact form feedback message
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const feedback = contactForm.querySelector('.form-feedback');
    feedback.style.display = 'block';
    feedback.style.color = '#24b27a';
    feedback.textContent = "Thank you! Your message has been sent.";
    setTimeout(() => {
      feedback.textContent = "";
      feedback.style.display = 'none';
    }, 2800);
    contactForm.reset();
  });
}
