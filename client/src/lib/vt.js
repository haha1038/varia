import { flushSync } from 'react-dom';

export function goWithTile(navigate, to, el) {
  if (!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return navigate(to);
  const others = [...document.querySelectorAll('[data-vt="tile"]')].filter((x) => x !== el);
  others.forEach((o) => (o.style.viewTransitionName = 'none'));
  if (el) el.style.viewTransitionName = 'tile';
  document.startViewTransition(() => {
    flushSync(() => navigate(to));
    others.forEach((o) => (o.style.viewTransitionName = ''));
    if (el && !el.dataset.vt) el.style.viewTransitionName = '';
  });
}
