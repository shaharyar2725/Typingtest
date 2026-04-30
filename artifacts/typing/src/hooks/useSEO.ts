import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  /** Optional structured data (JSON-LD) blocks to inject into <head>. */
  jsonLd?: Record<string, unknown>[];
}

const SCHEMA_ATTR = 'data-seo-jsonld';

function setMeta(selector: string, attrs: Record<string, string>, content: string) {
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function useSEO({
  title,
  description,
  keywords,
  canonical,
  ogType = 'website',
  ogImage = '/og-image.png',
  jsonLd,
}: SEOProps) {
  useEffect(() => {
    document.title = title;

    // Description
    setMeta('meta[name="description"]', { name: 'description' }, description);

    // Keywords
    if (keywords) {
      setMeta('meta[name="keywords"]', { name: 'keywords' }, keywords);
    }

    // Canonical — defaults to current URL (origin + pathname, no query/hash)
    const canonicalUrl =
      canonical ?? `${window.location.origin}${window.location.pathname}`;
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonicalUrl);

    // Absolute OG image URL
    const absoluteOgImage = ogImage.startsWith('http')
      ? ogImage
      : `${window.location.origin}${ogImage}`;

    // Open Graph
    setMeta('meta[property="og:title"]', { property: 'og:title' }, title);
    setMeta('meta[property="og:description"]', { property: 'og:description' }, description);
    setMeta('meta[property="og:type"]', { property: 'og:type' }, ogType);
    setMeta('meta[property="og:image"]', { property: 'og:image' }, absoluteOgImage);
    setMeta('meta[property="og:url"]', { property: 'og:url' }, canonicalUrl);
    setMeta('meta[property="og:site_name"]', { property: 'og:site_name' }, 'TypeFlow');
    setMeta('meta[property="og:locale"]', { property: 'og:locale' }, 'en_US');

    // Twitter Card
    setMeta('meta[name="twitter:card"]', { name: 'twitter:card' }, 'summary_large_image');
    setMeta('meta[name="twitter:title"]', { name: 'twitter:title' }, title);
    setMeta('meta[name="twitter:description"]', { name: 'twitter:description' }, description);
    setMeta('meta[name="twitter:image"]', { name: 'twitter:image' }, absoluteOgImage);

    // JSON-LD — remove any blocks we previously injected, then add the new ones.
    document.querySelectorAll(`script[${SCHEMA_ATTR}]`).forEach((s) => s.remove());
    if (jsonLd && jsonLd.length > 0) {
      jsonLd.forEach((schema) => {
        const script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        script.setAttribute(SCHEMA_ATTR, 'true');
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
      });
    }

    return () => {
      // Clean up only the JSON-LD we own — leave meta tags so the next page can overwrite them.
      document.querySelectorAll(`script[${SCHEMA_ATTR}]`).forEach((s) => s.remove());
    };
  }, [title, description, keywords, canonical, ogType, ogImage, JSON.stringify(jsonLd)]);
}
