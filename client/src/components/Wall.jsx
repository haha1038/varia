import { useMemo, useState, useEffect, createElement } from 'react';
import { useProducts } from '../lib/products';
import { inkOn } from '../lib/colors';
import { iconOf } from '../lib/cats';

function measure() {
  const w = window.innerWidth, h = window.innerHeight;
  const t = w <= 640 ? 76 : Math.min(170, Math.max(104, Math.round(w / 15)));
  const g = Math.round(t * 0.163);
  const W = Math.ceil((w * 0.988 + h * 0.156) * 1.08);
  const H = Math.ceil((w * 0.156 + h * 0.988) * 1.08);
  return { W, H, t, g, cols: Math.ceil(W / (t + g)) + 1, rows: Math.ceil(H / (t + g)) + 1 };
}

export default function Wall() {
  const { items, focus } = useProducts();
  const [size, setSize] = useState(measure);

  useEffect(() => {
    let t;
    const on = () => { clearTimeout(t); t = setTimeout(() => setSize(measure()), 200); };
    window.addEventListener('resize', on);
    return () => { clearTimeout(t); window.removeEventListener('resize', on); };
  }, []);

  const rows = useMemo(() => {
    if (!items.length) return [];
    return Array.from({ length: size.rows }, (_, r) =>
      Array.from({ length: size.cols }, (_, i) => items[(r * size.cols + i * 7 + r * 3) % items.length])
    );
  }, [items, size]);

  return (
    <div className="wall" aria-hidden="true">
      <div className="wall-in" style={{ width: size.W, height: size.H, '--t': `${size.t}px`, '--g': `${size.g}px` }}>
        {rows.map((row, r) => (
          <div className="wall-row" key={r} style={{ '--d': `${(80 + (r % 6) * 14) * size.cols / 12}s` }}>
            {[...row, ...row].map((p, i) => {
              return (
                <i key={i} className={focus && focus !== p.color ? 'off' : ''} style={{ '--p': p.hex, '--pi': inkOn(p.hex) }}>
                  <b>{p.image_url && <img src={p.image_url} alt="" />}</b>
                  {!p.image_url && createElement(iconOf(p.category))}
                </i>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
