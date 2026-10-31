/* ---- Business details --------------------------------------------------
   Put the state license number between the quotes, for example 'CBC1234567'.
   It then appears in the footer of every page and on the About page.
   ------------------------------------------------------------------------ */
const LICENSE_NUMBER = '';

/* Mobile menu */
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('site-nav');

function setMenu(open) {
  nav.classList.toggle('is-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  document.body.style.overflow = open ? 'hidden' : '';
}

toggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && nav.classList.contains('is-open')) {
    setMenu(false);
    toggle.focus();
  }
});

/* Leaving the mobile layout with the menu open must not leave the page locked */
window.matchMedia('(min-width: 1121px)').addEventListener('change', () => setMenu(false));

/* License number and copyright year */
if (LICENSE_NUMBER) {
  document.querySelectorAll('[data-license]').forEach((el) => {
    el.textContent = `License No. ${LICENSE_NUMBER}`;
    el.hidden = false;
  });
}

document.querySelectorAll('[data-year]').forEach((el) => {
  el.textContent = new Date().getFullYear();
});
