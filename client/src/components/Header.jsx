import { useLayoutEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { PiSquaresFour, PiUsers, PiPlus, PiUser } from 'react-icons/pi';
import { useAuth } from '../lib/auth';
import { hueOf } from '../lib/format';
import Logo from './Logo';

export default function Header() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const bar = useRef(null);
  const [drop, setDrop] = useState({ x: 0, w: 0, on: false });

  const tabs = [
    { to: '/', label: '전체', Icon: PiSquaresFour, end: true },
    { to: '/sellers', label: '판매자', Icon: PiUsers },
    { to: user ? '/products/new' : '/login', label: '올리기', Icon: PiPlus, state: user ? undefined : { from: '/products/new' }, write: true },
    user ? { to: '/mypage', label: user.nickname, me: true } : { to: '/login', label: '로그인', Icon: PiUser },
  ];

  const place = (el) => {
    if (!el) return setDrop((d) => ({ ...d, on: false }));
    setDrop({ x: el.offsetLeft, w: el.offsetWidth, on: true });
  };

  useLayoutEffect(() => {
    const go = () => place(bar.current?.querySelector('a.active'));
    go();
    document.fonts?.ready.then(go);
    window.addEventListener('resize', go);
    return () => window.removeEventListener('resize', go);
  }, [pathname, user]);

  return (
    <header className="lg hdr">
      <Logo />
      <nav
        className="tabs"
        ref={bar}
        onMouseLeave={() => place(bar.current?.querySelector('a.active'))}
      >
        <span className={`drop ${drop.on ? 'on' : ''}`} style={{ transform: `translateX(${drop.x}px)`, width: drop.w }} />
        {tabs.map((t) => (
          <NavLink
            key={t.label}
            to={t.to}
            state={t.state}
            end={t.end}
           
            onMouseEnter={(e) => place(e.currentTarget)}
            className={({ isActive }) => {
              if (t.write && !user) return '';
              return isActive || (t.to === '/login' && pathname === '/signup') ? 'active' : '';
            }}
          >
            {t.me ? (
              <b className="av" style={{ '--av': hueOf(user.nickname) }}>{user.nickname.slice(0, 1)}</b>
            ) : (
              <t.Icon size={17} />
            )}
            <span>{t.label}</span>
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
