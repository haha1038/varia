import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export const SITE_NAME = 'varia';

const SPEED = 900;
const STOP = 0.8;

export default function Logo() {
  const dot = useRef(null);
  const st = useRef({ a: 0, v: 0, on: false, t0: 0, v0: 0, raf: 0, last: 0 });

  useEffect(() => () => cancelAnimationFrame(st.current.raf), []);

  const loop = (now) => {
    const s = st.current;
    const dt = Math.min(0.05, (now - s.last) / 1000); s.last = now;
    if (s.on) s.v = SPEED;
    else {
      const t = Math.min(1, (now - s.t0) / 1000 / STOP);
      s.v = s.v0 * (1 - t) * (1 - t);
    }
    s.a = (s.a + s.v * dt) % 360;
    if (dot.current) dot.current.style.transform = `rotate(${s.a}deg)`;
    if (!s.on && s.v < 1) { s.raf = 0; return; }
    s.raf = requestAnimationFrame(loop);
  };
  const go = (on) => {
    const s = st.current;
    s.on = on;
    if (!on) { s.t0 = performance.now(); s.v0 = s.v; }
    if (!s.raf) { s.last = performance.now(); s.raf = requestAnimationFrame(loop); }
  };

  return (
    <Link to="/" className="logo" onMouseEnter={() => go(true)} onMouseLeave={() => go(false)}>
      <i ref={dot} />
      {SITE_NAME}
    </Link>
  );
}
