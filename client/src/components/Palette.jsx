import { useLayoutEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Glass from './Glass';
import { FAMILIES } from '../lib/colors';
import { spring } from '../lib/spring';

const STOPS = [{ key: null, label: '전체' }, ...FAMILIES];
const PAD = 30;
const H = 66;

export default function Palette({ value, onChange }) {
  const box = useRef(null), drop = useRef(null);
  const [bw, setBw] = useState(560);
  const xs = useCallback((w) => STOPS.map((_, i) => PAD + (i * (w - PAD * 2)) / (STOPS.length - 1)), []);
  const st = useRef({ xs: [], drag: null, placed: false });
  const idx = Math.max(0, STOPS.findIndex((s) => s.key === value));

  const sp = useRef(null);
  useLayoutEffect(() => {
    const o = {};
    const render = () => {
      const el = drop.current; if (!el) return;
      const v = o.x.velocity, sc = o.s.value;
      const sx = 1 + Math.min(0.4, Math.abs(v) / 2200), sy = 1 - Math.min(0.22, Math.abs(v) / 4000);
      el.style.transform = `translate(${o.x.value - 30}px, ${H / 2 - 30 - (sc - 0.78) * 9}px) scale(${sc * sx}, ${sc * sy})`;
    };
    o.x = spring({ damping: 0.78, response: 0.42, value: PAD, onUpdate: render });
    o.s = spring({ damping: 0.62, response: 0.42, value: 0.78, onUpdate: render });
    sp.current = o;
    return () => { o.x.stop(); o.s.stop(); };
  }, []);
  const X = xs(bw);

  useLayoutEffect(() => {
    const fit = () => setBw(Math.round(Math.min(560, window.innerWidth - 20)));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  useLayoutEffect(() => {
    st.current.xs = X;
    if (st.current.drag) return;
    if (!st.current.placed) { st.current.placed = true; sp.current.x.set(X[idx]); sp.current.s.set(0.78); }
    else sp.current.x.to(X[idx]);
  }, [bw, idx]);

  const nearest = (x) => st.current.xs.reduce((b, d, i, a) => (Math.abs(d - x) < Math.abs(a[b] - x) ? i : b), 0);
  const localX = (e) => e.clientX - box.current.getBoundingClientRect().left;

  const down = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const a = st.current.xs, x = Math.max(a[0], Math.min(a[a.length - 1], localX(e)));
    st.current.drag = { x0: e.clientX, moved: false, start: nearest(x) };
    sp.current.x.to(x); sp.current.s.to(1.32);
  };
  const move = (e) => {
    const d = st.current.drag; if (!d) return;
    if (Math.abs(e.clientX - d.x0) > 4) d.moved = true;
    const a = st.current.xs;
    sp.current.x.to(Math.max(a[0] - 12, Math.min(a[a.length - 1] + 12, localX(e))));
  };
  const up = (e) => {
    const d = st.current.drag; if (!d) return;
    st.current.drag = null;
    sp.current.s.to(0.78);
    let i = nearest(localX(e));
    if (!d.moved && i === idx && i > 0) i = 0;
    sp.current.x.to(st.current.xs[i]);
    if (i !== idx) onChange(STOPS[i].key);
  };
  const key = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); onChange(STOPS[Math.min(STOPS.length - 1, idx + 1)].key); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); onChange(STOPS[Math.max(0, idx - 1)].key); }
  };

  return createPortal(
    <div className="pal" ref={box} style={{ width: bw }}>
      <Glass className="pal-bar" radius={33} opts={{ bezel: 20, thick: 0.8 }} fopts={{ blur: 0.8, sat: 1.6 }}>
        {STOPS.map((s, i) => (
          <i key={s.label} className={`pal-dot ${s.key === null ? 'all' : ''} ${s.key === 'white' ? 'is-white' : ''}`} style={{ left: X[i], '--c': s.hex }} />
        ))}
      </Glass>
      <Glass ref={drop} className="pal-drop" radius={30} opts={{ bezel: 22, thick: 1, zoom: 0.22 }} fopts={{ blur: 0.2, aberr: 0.06, sat: 1.3, bright: 1.06 }} />
      <div
        className="pal-hit"
        role="slider"
        tabIndex={0}
        aria-label="색"
        aria-valuemin={1}
        aria-valuemax={STOPS.length}
        aria-valuenow={idx + 1}
        aria-valuetext={STOPS[idx].label}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onKeyDown={key}
      />
    </div>,
    document.body
  );
}
