import { renderMenu, renderNavLinks } from "./scripts/render-navigation.js";
import { preserveLegacyFragments } from './scripts/legacy-fragments.js';
import { prepareRelease } from "./scripts/prepare-release.js";
import { existsSync, readFileSync } from "node:fs";
import { homeSocialPreview } from "./scripts/social-preview.js";
import { renderApply } from "./scripts/render-apply.js";
import { renderFooter } from "./scripts/render-footer.js";
import { defineConfig } from "vite";
import { renderTestimonials } from "./scripts/generate-projects.js";
import { generatePages } from "./scripts/generate-pages.js";

const pages = generatePages();
const homePreview = homeSocialPreview();
prepareRelease(pages);
const routes = new Set(pages.filter(path => path.endsWith("/index.html")).map(path => "/" + path.replace(/\/index\.html$/, "")));
const legacyRedirects = JSON.parse(readFileSync("content/legacy-redirects.json", "utf8"));
function canonicalRoutes(server) {
  server.middlewares.use((request, response, next) => {
    const url = new URL(request.url, "http://localhost");
    const legacy = legacyRedirects[url.pathname.replace(/\/$/, '')];
    if (legacy) { response.writeHead(308, {Location:legacy + (url.search && !legacy.includes('#') ? url.search : '')}); response.end(); return; }
    if (!routes.has(url.pathname)) return next();
    response.writeHead(308, { Location: url.pathname + "/" + url.search });
    response.end();
  });
}

export default defineConfig({
  appType: "mpa",
  plugins: [{
    name: "canonical-content-routes",
    transformIndexHtml: (html,ctx) => ctx.path !== "/index.html" && ctx.path !== "/" ? html : preserveLegacyFragments(html.replace("<!-- NAV_LINKS -->", renderNavLinks()).replace("<!-- SITE_MENU -->", renderMenu()).replace("<!-- SOCIAL_PREVIEW -->", homePreview).replace("<!-- TESTIMONIALS -->", renderTestimonials()).replace("<!-- FOOTER -->", renderFooter()).replace("<!-- APPLY -->", renderApply()), "/"),
    configureServer: canonicalRoutes,
    configurePreviewServer(server) {
      canonicalRoutes(server);
      return () => server.middlewares.use((request,response,next) => {
        const path = new URL(request.url, "http://localhost").pathname;
        if (existsSync(`dist${path}`)) return next();
        response.writeHead(404, {'Content-Type':'text/html; charset=utf-8'});
        response.end(readFileSync('dist/404.html'));
      });
    },
  }],
  build: { rollupOptions: { input: ["index.html", ...pages] } },
});
