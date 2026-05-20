import { useEffect, useRef } from 'react';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
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
  const jsonLdRef = useRef(jsonLd);
  jsonLdRef.current = jsonLd;

  useEffect(() => {
    document.title = title;
    setMeta('meta[name="description"]', { name: 'description' }, description);

    if (keywords) {
      setMeta('meta[name="keywords"]', { name: 'keywords' }, keywords);
    }

    const canonicalUrl =
      canonical ?? `${window.location.origin}${window.location.pathname}`;
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonicalUrl);

    const absoluteOgImage = ogImage.startsWith('http')
      ? ogImage
      : `${window.location.origin}${ogImage}`;

    setMeta('meta[property="og:title"]', { property: 'og:title' }, title);
    setMeta('meta[property="og:description"]', { property: 'og:description' }, description);
    setMeta('meta[property="og:type"]', { property: 'og:type' }, ogType);
    setMeta('meta[property="og:image"]', { property: 'og:image' }, absoluteOgImage);
    setMeta('meta[property="og:url"]', { property: 'og:url' }, canonicalUrl);
    setMeta('meta[property="og:site_name"]', { property: 'og:site_name' }, 'TakeTypingTest');
    setMeta('meta[property="og:locale"]', { property: 'og:locale' }, 'en_US');

    setMeta('meta[name="twitter:card"]', { name: 'twitter:card' }, 'summary_large_image');
    setMeta('meta[name="twitter:title"]', { name: 'twitter:title' }, title);
    setMeta('meta[name="twitter:description"]', { name: 'twitter:description' }, description);
    setMeta('meta[name="twitter:image"]', { name: 'twitter:image' }, absoluteOgImage);

    document.querySelectorAll(`script[${SCHEMA_ATTR}]`).forEach((s) => s.remove());
    const schemas = jsonLdRef.current;
    if (schemas && schemas.length > 0) {
      schemas.forEach((schema) => {
        const script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        script.setAttribute(SCHEMA_ATTR, 'true');
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
      });
    }

    return () => {
      document.querySelectorAll(`script[${SCHEMA_ATTR}]`).forEach((s) => s.remove());
    };
  // jsonLd is stable per page — stored in ref to avoid serialization in deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, keywords, canonical, ogType, ogImage]);
}
