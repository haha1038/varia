import { useEffect } from 'react';
import { SITE_NAME } from '../components/Logo';

export function useTitle(t) {
  useEffect(() => {
    document.title = t ? `${t} · ${SITE_NAME}` : SITE_NAME;
  }, [t]);
}

export function setFavicon(hex) {
  const fill = hex
    ? `<circle cx="16" cy="16" r="14" fill="${hex}"/>`
    : `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF7A21"/><stop offset=".5" stop-color="#FF7DBE"/><stop offset="1" stop-color="#2F55EE"/></linearGradient></defs><circle cx="16" cy="16" r="14" fill="url(#g)"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">${fill}</svg>`;
  let link = document.querySelector('link[rel="icon"]');
  if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
  link.type = 'image/svg+xml';
  link.href = 'data:image/svg+xml,' + encodeURIComponent(svg);
}
