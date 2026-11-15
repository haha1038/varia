import { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Tile from './Tile';
import { won, ago } from '../lib/format';
import { useAuth } from '../lib/auth';
import { goWithTile } from '../lib/vt';

export default function ProductCard({ p, style }) {
  const { user } = useAuth();
  const nav = useNavigate();
  const tile = useRef(null);
  const to = `/products/${p.id}`;
  const open = (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    goWithTile(nav, to, tile.current);
  };
  return (
    <Link to={to} onClick={open} className="card" style={{ '--h': p.hex, ...style }}>
      <div className="card-t" ref={tile}>
        <Tile p={p} size={52} />
        <div className="badges">
          {user && user.id === p.user_id && <span className="mine">내 상품</span>}
        </div>
      </div>
      <div className="card-b">
        <h3>{p.title}</h3>
        <div className="card-m">
          <b>{won(p.price)}</b>
          <span>{p.seller_nickname} · {ago(p.created_at)}</span>
        </div>
      </div>
    </Link>
  );
}
