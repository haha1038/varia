import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PiArrowLeft, PiPencilSimpleLine, PiTrash } from 'react-icons/pi';
import api, { errMsg } from '../lib/api';
import Tile from '../components/Tile';
import Modal from '../components/Modal';
import { useAuth } from '../lib/auth';
import { useToast } from '../lib/toast';
import { useProducts } from '../lib/products';
import { won, ymd, hueOf, ago } from '../lib/format';
import { goWithTile } from '../lib/vt';
import { homeUrl } from './Home';
import { useTitle } from '../lib/title';

export default function ProductDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const { items, reload, setFocus } = useProducts();
  const [loadedP, setP] = useState(null);
  const [missing, setMissing] = useState(false);
  const [ask, setAsk] = useState(false);

  useEffect(() => {
    let alive = true;
    api.get(`/products/${id}`)
      .then(({ data }) => { if (alive) { setP(data); setFocus(data.color); } })
      .catch(() => alive && setMissing(true));
    return () => { alive = false; setFocus(null); };
  }, [id, setFocus]);

  const cached = items.find((x) => String(x.id) === id);
  const p = loadedP && String(loadedP.id) === id ? loadedP : cached || null;
  useTitle(p?.title);
  const cachedColor = cached?.color;
  useEffect(() => { if (cachedColor) setFocus(cachedColor); }, [cachedColor, id, setFocus]);
  const mine = p && user && user.id === p.user_id;

  const remove = async () => {
    try {
      await api.delete(`/products/${id}`);
      await reload();
      toast('삭제되었습니다.');
      nav('/', { replace: true });
    } catch (e) { toast(errMsg(e), 'err'); setAsk(false); }
  };

  if (missing) return (
    <main className="page narrow center-msg">
      <h1 className="big">존재하지 않는 상품입니다.</h1>
      <Link to="/" className="btn">전체로</Link>
    </main>
  );

  const near = p ? items.filter((x) => x.color === p.color && x.id !== p.id).slice(0, 8) : [];

  return (
    <main className="page detail">
      <button className="back" onClick={() => nav(homeUrl(), { state: { restore: true } })} aria-label="뒤로"><PiArrowLeft size={20} /></button>
      <div className="dt">
        <div className="dt-t" data-vt="tile">
          {p ? <Tile p={p} size={120} /> : <div className="tile skel" />}
        </div>
        {p && (
          <section className="dt-info">
            <div className="dt-top">
              <span className="muted">{p.category}</span>
            </div>
            <h1>{p.title}</h1>
            <div className="price">{won(p.price)}</div>

            <div className="seller">
              <b className="av lg" style={{ '--av': hueOf(p.seller_nickname) }}>{p.seller_nickname.slice(0, 1)}</b>
              <div><strong>{p.seller_nickname}</strong></div>
              <span className="muted">{ymd(p.created_at)}</span>
            </div>

            {p.description && <p className="desc">{p.description}</p>}

            {mine && (
              <div className="owner">
                <div className="owner-b">
                  <Link to={`/products/${p.id}/edit`} className="btn"><PiPencilSimpleLine size={17} />수정</Link>
                  <button className="btn ghost danger" onClick={() => setAsk(true)}><PiTrash size={17} />삭제</button>
                </div>
              </div>
            )}
          </section>
        )}
      </div>

      {near.length > 0 && (
        <div className="near">
          {near.map((x) => (
            <Link key={x.id} to={`/products/${x.id}`} className="near-i" onClick={(e) => { e.preventDefault(); goWithTile(nav, `/products/${x.id}`, e.currentTarget.querySelector('.tile')); }}>
              <Tile p={x} size={28} />
              <span>{x.title}</span>
              <small>{won(x.price)} · {ago(x.created_at)}</small>
            </Link>
          ))}
        </div>
      )}

      <Modal open={ask} onClose={() => setAsk(false)}>
        <h2>삭제하시겠습니까?</h2>
        <div className="modal-b">
          <button className="btn ghost" onClick={() => setAsk(false)}>취소</button>
          <button className="btn danger-fill" onClick={remove}>삭제</button>
        </div>
      </Modal>
    </main>
  );
}
