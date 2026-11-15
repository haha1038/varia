import { useEffect, useRef } from 'react';

export default function MemberCard({ nickname, email, no, since }) {
  const el = useRef(null);

  useEffect(() => {
    const card = el.current;
    const cur = { x: 0.5, y: 0.5, on: 0 }, tgt = { x: 0.5, y: 0.5, on: 0 };
    let raf = 0, last = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const k = 1 - Math.exp(-dt * 9);
      cur.x += (tgt.x - cur.x) * k; cur.y += (tgt.y - cur.y) * k; cur.on += (tgt.on - cur.on) * k;
      const s = card.style;
      s.setProperty('--rx', `${(0.5 - cur.y) * 16 * cur.on}deg`);
      s.setProperty('--ry', `${(cur.x - 0.5) * 22 * cur.on}deg`);
      s.setProperty('--mx', `${cur.x * 100}%`);
      s.setProperty('--my', `${cur.y * 100}%`);
      s.setProperty('--ang', `${100 + (cur.x - 0.5) * 70 + (cur.y - 0.5) * 30}deg`);
      s.setProperty('--on', cur.on.toFixed(3));
      const still = Math.abs(tgt.x - cur.x) + Math.abs(tgt.y - cur.y) + Math.abs(tgt.on - cur.on) < 0.001;
      raf = still ? 0 : requestAnimationFrame(tick);
    };
    const wake = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); } };
    const move = (e) => {
      const b = card.getBoundingClientRect();
      tgt.x = Math.min(1, Math.max(0, (e.clientX - b.left) / b.width));
      tgt.y = Math.min(1, Math.max(0, (e.clientY - b.top) / b.height));
      tgt.on = 1; wake();
    };
    const leave = () => { tgt.x = 0.5; tgt.y = 0.5; tgt.on = 0; wake(); };
    card.addEventListener('pointermove', move);
    card.addEventListener('pointerleave', leave);
    tick(performance.now());
    return () => { cancelAnimationFrame(raf); card.removeEventListener('pointermove', move); card.removeEventListener('pointerleave', leave); };
  }, []);

  return (
    <div className="mcard" ref={el}>
      <div className="mcard-in">
        <i className="mcard-foil" />
        <div className="mcard-top">
          <span>MEMBER</span>
          <span>No. {String(no || 0).padStart(4, '0')}</span>
        </div>
        <b className="mcard-n">{nickname || '닉네임'}</b>
        <div className="mcard-bot">
          <span>{email || 'you@example.com'}</span>
          {since && <span>{since}</span>}
        </div>
      </div>
    </div>
  );
}
