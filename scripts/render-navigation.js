import { renderSitemapLinks } from './render-footer.js';

export function renderNavLinks(path = '/') {
  return `<div class="nav-links"><a href="/podcast/"${path.startsWith('/podcast') ? ' aria-current="page"' : ''}>Listen</a><a href="/#apply">Apply</a><button class="nav-more" type="button" aria-label="Open site menu" aria-haspopup="dialog" aria-controls="site-menu" aria-expanded="false"><span aria-hidden="true"><i></i><i></i><i></i></span></button></div>`;
}

export function renderMenu() {
  return `<dialog class="site-menu" id="site-menu" aria-labelledby="site-menu-title">
    <div class="site-menu-top"><h2 id="site-menu-title">Sovereign Engineering</h2><button class="site-menu-close" type="button" autofocus>Close <span aria-hidden="true">×</span></button></div>
    <nav class="site-menu-links" aria-label="Site navigation">${renderSitemapLinks()}</nav>
    <p class="site-menu-location">Based in Madeira, operating worldwide.</p>
  </dialog>`;
}
