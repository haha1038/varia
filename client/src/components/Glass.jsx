import { useLayoutEffect, useRef, forwardRef } from 'react';
import { applyGlass, removeGlass } from '../lib/glass';

const Glass = forwardRef(function Glass({ radius = 30, opts, fopts, className = '', children, ...rest }, outer) {
  const ref = useRef(null);
  const o = JSON.stringify(opts || {}), fo = JSON.stringify(fopts || {});

  useLayoutEffect(() => {
    const el = ref.current;
    let t = 0, lastW = 0, lastH = 0;
    const run = () => {
      const w = Math.round(el.offsetWidth), h = Math.round(el.offsetHeight);
      if (!w || !h || (w === lastW && h === lastH)) return;
      lastW = w; lastH = h;
      applyGlass(el, w, h, Math.min(radius, h / 2, w / 2), JSON.parse(o), JSON.parse(fo));
    };
    run();
    const ro = new ResizeObserver(() => { clearTimeout(t); t = setTimeout(run, 140); });
    ro.observe(el);
    return () => { ro.disconnect(); clearTimeout(t); removeGlass(el); };
  }, [radius, o, fo]);

  return (
    <div
      ref={(el) => { ref.current = el; if (typeof outer === 'function') outer(el); else if (outer) outer.current = el; }}
      className={`lg ${className}`}
      {...rest}
    >
      <i className="lg-sp" />
      {children}
    </div>
  );
});

export default Glass;
