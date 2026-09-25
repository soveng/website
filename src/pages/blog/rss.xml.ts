import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';

import { getBlogArticles } from '@/lib/blog';

export const GET: APIRoute = async ({ site }) => {
  if (!site) {
    throw new Error('RSS feed requires Astro site URL');
  }

  const articles = await getBlogArticles();
  const siteRoot = new URL('/', site).href;

  return rss({
    title: 'The Sovereign Engineering Blog',
    description: 'Notes from the frontier of freedom tech.',
    site,
    items: articles.map((article) => ({
      title: article.title,
      link: new URL(`/blog/${article.slug}`, site).href,
      pubDate: new Date(article.publishedAt * 1000),
      description: article.summary || article.title,
      content: article.html.replace(/((?:href|src)=")\/(?!\/)/g, `$1${siteRoot}`),
      categories: article.tags,
    })),
    customData: '<language>en</language>',
  });
};
