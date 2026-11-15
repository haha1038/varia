import { useEffect, useState, useCallback } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { PiPencilSimpleLine, PiTrash, PiSignOut } from 'react-icons/pi';
import { useTitle } from '../lib/title';
import api, { errMsg } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useToast } from '../lib/toast';
import { useProducts } from '../lib/products';
import { won, ymd, phoneFormat } from '../lib/format';
import MemberCard from '../components/MemberCard';
import Tile from '../components/Tile';
import Modal from '../components/Modal';

export default function MyPage() {
  useTitle('마이페이지');
  const { user, login, logout } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const { reload } = useProducts();
  const [me, setMe] = useState(null);
  const [f, setF] = useState({ nickname: '', phone_number: '' });
  const [mine, setMine] = useState([]);
  const [busy, setBusy] = useState(false);
  const [del, setDel] = useState(null);
  const [leave, setLeave] = useState(false);

  const loadMine = useCallback(() => api.get('/products/mine').then(({ data }) => setMine(data)).catch(() => {}), []);

  useEffect(() => {
    if (!user) return;
    api.get('/users/me').then(({ data }) => {
      setMe(data);
      setF((x) => ({ ...x, nickname: data.nickname, phone_number: data.phone_number }));
    }).catch((e) => {
      if (e?.response?.status === 401 || e?.response?.status === 403 || e?.response?.status === 404) { logout(); nav('/login', { replace: true }); }
    });
    loadMine();
  }, [user, logout, nav, loadMine]);

  if (!user) return <Navigate to="/login" replace state={{ from: '/mypage' }} />;

  const dirty = me && (f.nickname !== me.nickname || f.phone_number !== me.phone_number);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.put('/users/me', f);
      login(data.token, data.user);
      setMe({ ...me, nickname: f.nickname, phone_number: f.phone_number });
      reload(); loadMine();
      toast('저장되었습니다.');
    } catch (err) { toast(errMsg(err), 'err'); } finally { setBusy(false); }
  };

  const removeProduct = async () => {
    try {
      await api.delete(`/products/${del.id}`);
      setMine(mine.filter((x) => x.id !== del.id));
      setDel(null);
      reload();
      toast('삭제되었습니다.');
    } catch (e) { toast(errMsg(e), 'err'); }
  };

  const withdraw = async () => {
    try {
      await api.delete('/users/me');
      logout();
      await reload();
      toast('탈퇴되었습니다.');
      nav('/', { replace: true });
    } catch (e) { toast(errMsg(e), 'err'); }
  };

  return (
    <main className="page my">
      <section className="my-top">
        <div className="my-card">
          <MemberCard nickname={f.nickname || user.nickname} email={user.email} no={user.id} since={me ? ymd(me.created_at) : ''} />
          <div className="my-act">
            <button className="btn ghost" onClick={() => { logout(); toast('로그아웃되었습니다.'); nav('/'); }}><PiSignOut size={17} />로그아웃</button>
            <button className="btn ghost danger" onClick={() => setLeave(true)}>탈퇴</button>
          </div>
        </div>

        <form className="my-form" onSubmit={save}>
          <h1 className="big">프로필 수정</h1>
          <label className="fld">
            <span>이메일</span>
            <input value={user.email} disabled />
          </label>
          <label className="fld">
            <span>닉네임</span>
            <input value={f.nickname} onChange={(e) => setF({ ...f, nickname: e.target.value })} maxLength={30} required />
          </label>
          <label className="fld">
            <span>연락처</span>
            <input inputMode="tel" value={f.phone_number} onChange={(e) => setF({ ...f, phone_number: phoneFormat(e.target.value) })} required />
          </label>
          <button className="btn primary wide" disabled={busy || !dirty}>{busy ? <i className="spin" /> : '저장'}</button>
        </form>
      </section>

      <section className="my-list">
        <h2 className="mid">내 상품</h2>
        <div className="rows">
          {mine.map((p) => (
            <div className="row" key={p.id}>
              <Link to={`/products/${p.id}`} className="row-l">
                <Tile p={p} size={26} />
                <div>
                  <strong>{p.title}</strong>
                  <span>{won(p.price)}</span>
                </div>
              </Link>
              <div className="row-b">
                <Link to={`/products/${p.id}/edit`} className="icon-b" aria-label="수정"><PiPencilSimpleLine size={18} /></Link>
                <button className="icon-b danger" aria-label="삭제" onClick={() => setDel(p)}><PiTrash size={18} /></button>
              </div>
            </div>
          ))}
          <Link to="/products/new" className="row add">+ 올리기</Link>
        </div>
      </section>

      <Modal open={!!del} onClose={() => setDel(null)}>
        <h2>삭제하시겠습니까?</h2>
        {del && <div className="modal-p"><Tile p={del} size={22} /><span>{del.title}</span></div>}
        <div className="modal-b">
          <button className="btn ghost" onClick={() => setDel(null)}>취소</button>
          <button className="btn danger-fill" onClick={removeProduct}>삭제</button>
        </div>
      </Modal>

      <Modal open={leave} onClose={() => setLeave(false)}>
        <h2>탈퇴하시겠습니까?</h2>
        <div className="modal-b">
          <button className="btn ghost" onClick={() => setLeave(false)}>취소</button>
          <button className="btn danger-fill" onClick={withdraw}>탈퇴</button>
        </div>
      </Modal>
    </main>
  );
}
