// Navbar toggle (mobile)
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
navToggle && navToggle.addEventListener('click', () => {
  const expanded = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!expanded));
  navLinks.classList.toggle('mobile-open');
});

// Accordion behaviour
const accordions = document.querySelectorAll('.accordion-item');
accordions.forEach(item => {
  const btn = item.querySelector('.accordion-toggle');
  const panel = item.querySelector('.accordion-panel');
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    // close other open items (optional)
    document.querySelectorAll('.accordion-toggle[aria-expanded="true"]').forEach(openBtn => {
      if(openBtn !== btn){
        openBtn.setAttribute('aria-expanded','false');
        openBtn.nextElementSibling.classList.remove('show');
      }
    });
    btn.setAttribute('aria-expanded', String(!expanded));
    panel.classList.toggle('show');
  });
});

// Simple email form validation simulation
document.querySelectorAll('.email-form').forEach(form => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    if (!input || !input.value) return;
    // Minimal visual success feedback
    alert('Thanks! (This is a static clone — no real signup)\nEmail: ' + input.value);
  });
});

// Sticky nav effect (add shadow after scroll)
window.addEventListener('scroll', () => {
  const navWrap = document.querySelector('.nav-wrap');
  if(window.scrollY > 20)
    navWrap.classList.add('scrolled');
  else
    navWrap.classList.remove('scrolled');
});

// Accessible focus styles
(function(){
  function handleFirstTab(e){
    if(e.key === 'Tab')
      document.body.classList.add('show-focus-outline');
  }
  window.addEventListener('keydown', handleFirstTab, {once:true});
})();
