import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams, Navigate } from 'react-router-dom';
import { PiImage, PiX, PiArrowLeft } from 'react-icons/pi';
import { useTitle } from '../lib/title';
import api, { errMsg } from '../lib/api';
import Tile from '../components/Tile';
import { FAMILIES, shadesOf, familyOf } from '../lib/colors';
import { CATS } from '../lib/cats';
import { won } from '../lib/format';
import { useAuth } from '../lib/auth';
import { useToast } from '../lib/toast';
import { useProducts } from '../lib/products';

export default function ProductForm() {
  const { id } = useParams();
  const editing = !!id;
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const { user } = useAuth();
  const toast = useToast();
  const { reload, setFocus } = useProducts();
  const fileRef = useRef(null);
  useTitle(editing ? '수정' : '올리기');

  const startFam = familyOf(sp.get('color'))?.key || 'red';
  const [f, setF] = useState({ title: '', price: '', color: startFam, hex: familyOf(startFam).hex, category: '옷', description: '' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [oldImage, setOldImage] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(!editing);

  useEffect(() => {
    if (!editing) return;
    api.get(`/products/${id}`).then(({ data }) => {
      if (user && data.user_id !== user.id) { toast('본인이 등록한 상품만 수정할 수 있습니다.', 'err'); nav(`/products/${id}`, { replace: true }); return; }
      setF({ title: data.title, price: String(data.price), color: data.color, hex: data.hex, category: data.category, description: data.description || '' });
      setOldImage(data.image_url);
      setReady(true);
    }).catch(() => nav('/', { replace: true }));
  }, [editing, id, user, nav, toast]);

  useEffect(() => { if (!user) return; setFocus(f.color); return () => setFocus(null); }, [f.color, setFocus, user]);
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  if (!user) return <Navigate to="/login" replace state={{ from: editing ? `/products/${id}/edit` : '/products/new' }} />;

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const pickFam = (key) => setF({ ...f, color: key, hex: familyOf(key).hex });
  const onFile = (e) => {
    const x = e.target.files?.[0];
    if (!x) return;
    setFile(x);
    setPreview(URL.createObjectURL(x));
    setRemoveImage(false);
  };
  const clearImage = () => {
    setFile(null); setPreview(null);
    if (oldImage) setRemoveImage(true);
    if (fileRef.current) fileRef.current.value = '';
  };

  const shownImage = preview || (!removeImage ? oldImage : null);
  const view = { ...f, price: Number(f.price || 0), image_url: shownImage };

  const submit = async (e) => {
    e.preventDefault();
    if (!f.title.trim()) return toast('상품 이름을 입력해 주세요.', 'err');
    if (f.price === '') return toast('가격을 입력해 주세요.', 'err');
    const fd = new FormData();
    Object.entries(f).forEach(([k, v]) => fd.append(k, v));
    if (file) fd.append('image', file);
    if (removeImage && !file) fd.append('removeImage', '1');
    setBusy(true);
    try {
      const { data } = editing ? await api.put(`/products/${id}`, fd) : await api.post('/products', fd);
      await reload();
      toast(editing ? '수정되었습니다.' : '등록되었습니다.');
      nav(`/products/${data.id}`, { replace: true });
    } catch (err) {
      toast(errMsg(err), 'err');
    } finally { setBusy(false); }
  };

  return (
    <main className="page form-page">
      <button className="back" onClick={() => nav(-1)} aria-label="뒤로"><PiArrowLeft size={20} /></button>
      <form className="pf" onSubmit={submit}>
        <div className="pf-prev">
          <div className="pf-prev-t" data-vt={editing ? 'tile' : undefined}>
            {ready ? <Tile p={view} size={96} /> : <div className="tile skel" />}
            {shownImage && <button type="button" className="img-x" onClick={clearImage} aria-label="사진 빼기"><PiX size={16} /></button>}
          </div>
          <div className="pf-prev-b">
            <h3>{f.title || ' '}</h3>
            <b>{f.price !== '' ? won(f.price) : ' '}</b>
          </div>
        </div>

        <div className="pf-fields">
          <h1 className="big">{editing ? '수정' : '올리기'}</h1>

          <label className="fld">
            <span>이름</span>
            <input value={f.title} onChange={set('title')} maxLength={60} autoFocus={!editing} />
          </label>

          <label className="fld">
            <span>가격</span>
            <div className="with-unit">
              <input inputMode="numeric" value={f.price === '' ? '' : Number(f.price).toLocaleString('ko-KR')}
                onChange={(e) => setF({ ...f, price: e.target.value.replace(/\D/g, '').slice(0, 9) })} />
              <em>원</em>
            </div>
          </label>

          <div className="fld">
            <span>색</span>
            <div className="fam">
              {FAMILIES.map((x) => (
                <button type="button" key={x.key} aria-label={x.label} className={`${f.color === x.key ? 'on' : ''} ${x.key === 'white' ? 'is-white' : ''}`}
                  style={{ '--c': x.hex }} onClick={() => pickFam(x.key)} />
              ))}
            </div>
            <div className="shades" key={f.color}>
              {shadesOf(f.color).map((h, i) => (
                <button type="button" key={h} aria-label={`${i + 1}번째`} className={f.hex.toUpperCase() === h ? 'on' : ''}
                  style={{ '--c': h, '--k': i }} onClick={() => setF({ ...f, hex: h })} />
              ))}
            </div>
          </div>

          <div className="fld">
            <span>분류</span>
            <div className="cats">
              {CATS.map(({ key, Icon }) => (
                <button type="button" key={key} className={f.category === key ? 'on' : ''} onClick={() => setF({ ...f, category: key })}>
                  <Icon size={20} /><small>{key}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="fld">
            <span>사진</span>
            <button type="button" className="btn ghost file-b" onClick={() => fileRef.current?.click()}>
              <PiImage size={18} />{shownImage ? '바꾸기' : '고르기'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
          </div>

          <label className="fld">
            <span>설명</span>
            <textarea value={f.description} onChange={set('description')} rows={4} maxLength={1000} />
          </label>

          <button className="btn primary wide" disabled={busy || !ready}>{busy ? <i className="spin" /> : editing ? '수정하기' : '올리기'}</button>
        </div>
      </form>
    </main>
  );
}
