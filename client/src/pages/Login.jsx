import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { PiEye, PiEyeSlash } from 'react-icons/pi';
import { useTitle } from '../lib/title';
import api, { errMsg } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useToast } from '../lib/toast';

export default function Login() {
  useTitle('로그인');
  const { login } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const loc = useLocation();
  const [f, setF] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post('/users/login', f);
      login(data.token, data.user);
      toast(`${data.user.nickname}님 환영합니다.`);
      nav(loc.state?.from || '/', { replace: true });
    } catch (err) {
      toast(errMsg(err), 'err');
    } finally { setBusy(false); }
  };

  return (
    <main className="page auth">
      <form className="auth-box" onSubmit={submit}>
        <h1 className="big">로그인</h1>
        <label className="fld">
          <span>이메일</span>
          <input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" autoFocus required />
        </label>
        <label className="fld">
          <span>비밀번호</span>
          <div className="with-unit">
            <input type={show ? 'text' : 'password'} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} autoComplete="current-password" required />
            <button type="button" className="eye" onClick={() => setShow(!show)} aria-label="비밀번호 보기">{show ? <PiEyeSlash size={18} /> : <PiEye size={18} />}</button>
          </div>
        </label>
        <button className="btn primary wide" disabled={busy}>{busy ? <i className="spin" /> : '로그인'}</button>
        <Link to="/signup" className="sub-link" state={loc.state}>회원가입</Link>
      </form>
    </main>
  );
}
