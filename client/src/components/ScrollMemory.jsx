import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const pos = new Map();

export default function ScrollMemory() {
  const loc = useLocation();
  const type = useNavigationType();
  const keyRef = useRef(loc.key);

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    const save = () => pos.set(keyRef.current, window.scrollY);
    window.addEventListener('scroll', save, { passive: true });
    return () => window.removeEventListener('scroll', save);
  }, []);

  useLayoutEffect(() => {
    keyRef.current = loc.key;
    if (type === 'POP' && pos.has(loc.key)) {
      const y = pos.get(loc.key);
      window.scrollTo(0, y);
      requestAnimationFrame(() => window.scrollTo(0, y));
    } else if (type === 'PUSH' && !loc.state?.restore) {
      window.scrollTo(0, 0);
    }
  }, [loc.key, type]);

  return null;
}
