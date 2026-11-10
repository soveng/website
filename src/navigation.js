const menu = document.querySelector('#site-menu');
const trigger = document.querySelector('.nav-more');

if (menu && trigger) {
  let previousOverflow;
  trigger.addEventListener('click', () => {
    previousOverflow = document.documentElement.style.overflow;
    menu.showModal();
    trigger.setAttribute('aria-expanded', 'true');
    document.documentElement.style.overflow = 'hidden';
  });
  menu.querySelector('.site-menu-close').addEventListener('click', () => menu.close());
  menu.addEventListener('close', () => {
    document.documentElement.style.overflow = previousOverflow;
    trigger.setAttribute('aria-expanded', 'false');
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => menu.close()));
}
