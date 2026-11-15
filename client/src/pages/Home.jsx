import { useEffect, useLayoutEffect, useState } from 'react';

let visited = false;
const last = { search: '', y: 0 };
export const homeUrl = () => '/' + last.search;
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { PiPlus } from 'react-icons/pi';
import ProductCard from '../components/ProductCard';
import Palette from '../components/Palette';
import { useProducts } from '../lib/products';
import { FAMILIES, familyOf } from '../lib/colors';
import { useTitle, setFavicon } from '../lib/title';

export default function Home() {
  const { items, loaded, setFocus } = useProducts();
  const [sp, setSp] = useSearchParams();
  const color = FAMILIES.some((f) => f.key === sp.get('color')) ? sp.get('color') : null;

  useEffect(() => {
    setFocus(color);
    setFavicon(color ? familyOf(color).hex : null);
    return () => { setFocus(null); setFavicon(null); };
  }, [color, setFocus]);
  useTitle(color ? familyOf(color).label : null);

  const loc = useLocation();
  const [animate, setAnimate] = useState(!visited);
  useEffect(() => { last.search = loc.search; }, [loc.search]);
  useEffect(() => {
    const save = () => { last.y = window.scrollY; };
    window.addEventListener('scroll', save, { passive: true });
    return () => window.removeEventListener('scroll', save);
  }, []);
  useLayoutEffect(() => {
    if (loc.state?.restore) { const y = last.y; window.scrollTo(0, y); requestAnimationFrame(() => window.scrollTo(0, y)); }
  }, []);
  useEffect(() => { visited = true; }, []);
  const pick = (c) => { setAnimate(true); setSp(c ? { color: c } : {}, { replace: true }); };
  const list = color ? items.filter((p) => p.color === color) : items;

  return (
    <main className="page home">
      <div className={`grid ${animate ? '' : 'still'}`} key={color || 'all'}>
        {!loaded && Array.from({ length: 8 }, (_, i) => (
          <div className="card skel-card" key={'s' + i} style={{ '--k': i }}>
            <div className="card-t"><div className="tile skel" /></div>
            <div className="card-b"><i /><i /></div>
          </div>
        ))}
        {list.map((p, i) => (
          <ProductCard key={p.id} p={p} style={{ '--k': Math.min(i, 14) }} />
        ))}
        {loaded && (
          <Link to={`/products/new${color ? `?color=${color}` : ''}`} className="card card-add" aria-label="올리기">
            <div className="card-t">
              <div className="tile add" style={color ? { '--h': FAMILIES.find((f) => f.key === color).hex } : undefined}>
                <PiPlus size={34} />
              </div>
            </div>
          </Link>
        )}
      </div>
      <Palette value={color} onChange={pick} />
    </main>
  );
}
