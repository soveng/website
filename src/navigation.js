const menu = document.querySelector('#site-menu');
const trigger = document.querySelector('button.nav-more');

if (menu && trigger) {
  trigger.hidden = false;
  document.querySelector('.nav-menu-fallback').hidden = true;
  trigger.addEventListener('click', () => {
    menu.showModal();
    trigger.setAttribute('aria-expanded', 'true');
  });
  menu.querySelector('.site-menu-close').addEventListener('click', () => menu.close());
  menu.addEventListener('close', () => {
    trigger.setAttribute('aria-expanded', 'false');
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => menu.close()));
}
