// Post-build step: writes a static HTML file per route with the correct
// <title>, meta description, canonical link and OG/Twitter tags baked in.
//
// Why this exists: this app is a client-rendered SPA. Every route previously
// served the SAME index.html, whose <link rel="canonical"> always pointed at
// the homepage. Crawlers/auditors that don't execute JS (or that only read
// the initial HTML) saw every URL canonicalizing to "/", which is the bug
// reported by the SEO audit ("canonical URL" column showing the homepage for
// every page). Baking the correct canonical into the actual HTML served for
// each route fixes this at the source, independent of client-side JS.

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '..', 'dist', 'public');
const templatePath = path.join(outDir, 'index.html');

const SITE_ORIGIN = 'https://www.taketypingtest.com';
const OG_IMAGE = `${SITE_ORIGIN}/og-image.png`;

const LESSON_SLUGS = [
  'home-row-basics',
  'top-row',
  'bottom-row',
  'numbers',
  'capitalization',
  'punctuation',
  'symbols',
  'common-bigrams',
  'speed-drill-1',
  'speed-drill-2',
];

const routes = [
  {
    path: '/',
    title: 'Free Typing Practice — Improve Your WPM & Accuracy | TakeTypingTest',
    description:
      'Free online typing practice and typing test. Pick your time, words or quotes, watch your live WPM and accuracy. No signup required.',
  },
  {
    path: '/typing-speed-test',
    title: 'Free Typing Speed Test — Check Your WPM Instantly | TakeTypingTest',
    description:
      'Take a free typing speed test and instantly see your words per minute and accuracy. No signup required.',
  },
  {
    path: '/1-minute-typing-test',
    title: '1 Minute Typing Test — Free WPM Speed Check | TakeTypingTest',
    description:
      'A quick 1 minute typing test to check your typing speed and accuracy. Free, no signup required.',
  },
  {
    path: '/3-minute-typing-test',
    title: '3 Minute Typing Test — Free WPM & Accuracy Check | TakeTypingTest',
    description:
      'A 3 minute typing test for a reliable daily check-in on your typing speed and accuracy. Free, no signup required.',
  },
  {
    path: '/5-minute-typing-test',
    title: '5 Minute Typing Test — Sustained WPM & Accuracy | TakeTypingTest',
    description:
      'A 5 minute typing test to measure sustained typing speed and accuracy. Free, no signup required.',
  },
  {
    path: '/10-minute-typing-test',
    title: '10 Minute Typing Test — Professional Endurance WPM | TakeTypingTest',
    description:
      'A 10 minute typing test that mirrors professional typing benchmarks for endurance and accuracy. Free, no signup required.',
  },
  {
    path: '/20-minute-typing-test',
    title: '20 Minute Typing Test — Elite Endurance WPM | TakeTypingTest',
    description:
      'A 20 minute typing test for elite-level endurance typing and accuracy tracking. Free, no signup required.',
  },
  {
    path: '/learn-typing',
    title: 'Learn Touch Typing Free — 10-Lesson Interactive Course | TakeTypingTest',
    description:
      'Learn touch typing from scratch with a free, interactive 10-lesson course. Build speed and accuracy step by step.',
  },
  {
    path: '/about',
    title: 'About TakeTypingTest — Free Typing Test & Touch Typing Course',
    description:
      'Learn about TakeTypingTest, a free typing practice and typing test platform with an interactive touch typing course.',
  },
  ...LESSON_SLUGS.map((slug) => ({
    path: `/lessons/${slug}`,
    title: `Typing Lesson: ${slug.replace(/-/g, ' ')} | TakeTypingTest`,
    description: 'Interactive touch typing lesson. Free, no signup required.',
  })),
];

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderRoute(template, route) {
  const canonicalUrl = `${SITE_ORIGIN}${route.path}`;
  const title = escapeHtml(route.title);
  const description = escapeHtml(route.description);

  let html = template;

  html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
  html = html.replace(
    /<meta name="description" content=".*?" \/>/,
    `<meta name="description" content="${description}" />`,
  );
  html = html.replace(
    /<link rel="canonical" href=".*?" \/>/,
    `<link rel="canonical" href="${canonicalUrl}" />`,
  );
  html = html.replace(
    /<meta property="og:title" content=".*?" \/>/,
    `<meta property="og:title" content="${title}" />`,
  );
  html = html.replace(
    /<meta property="og:description" content=".*?" \/>/,
    `<meta property="og:description" content="${description}" />`,
  );
  html = html.replace(
    /<meta property="og:image" content=".*?" \/>/,
    `<meta property="og:image" content="${OG_IMAGE}" />`,
  );
  html = html.replace(
    /<meta property="og:url" content=".*?" \/>/,
    `<meta property="og:url" content="${canonicalUrl}" />`,
  );
  html = html.replace(
    /<meta name="twitter:title" content=".*?" \/>/,
    `<meta name="twitter:title" content="${title}" />`,
  );
  html = html.replace(
    /<meta name="twitter:description" content=".*?" \/>/,
    `<meta name="twitter:description" content="${description}" />`,
  );
  html = html.replace(
    /<meta name="twitter:image" content=".*?" \/>/,
    `<meta name="twitter:image" content="${OG_IMAGE}" />`,
  );

  return html;
}

function main() {
  const template = readFileSync(templatePath, 'utf-8');

  for (const route of routes) {
    const html = renderRoute(template, route);
    const dir =
      route.path === '/' ? outDir : path.join(outDir, route.path.replace(/^\//, ''));
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, 'index.html'), html, 'utf-8');
  }

  console.log(`[prerender] Wrote ${routes.length} static route(s) with correct canonical/meta tags.`);
}

main();
