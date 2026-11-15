import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { PiEye, PiEyeSlash } from 'react-icons/pi';
import { useTitle } from '../lib/title';
import api, { errMsg } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useToast } from '../lib/toast';
import { phoneFormat } from '../lib/format';
import MemberCard from '../components/MemberCard';

export default function Signup() {
  useTitle('회원가입');
  const { login } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const loc = useLocation();
  const [f, setF] = useState({ email: '', password: '', nickname: '', phone_number: '' });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: k === 'phone_number' ? phoneFormat(e.target.value) : e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post('/users/signup', f);
      login(data.token, data.user);
      toast(`${data.user.nickname}님 환영합니다.`);
      nav(loc.state?.from || '/', { replace: true });
    } catch (err) {
      toast(errMsg(err), 'err');
    } finally { setBusy(false); }
  };

  return (
    <main className="page auth">
      <div className="auth-wide">
        <MemberCard nickname={f.nickname} email={f.email} />
        <form className="auth-box" onSubmit={submit}>
          <h1 className="big">회원가입</h1>
          <label className="fld">
            <span>이메일</span>
            <input type="email" value={f.email} onChange={set('email')} autoComplete="email" autoFocus required />
          </label>
          <label className="fld">
            <span>닉네임</span>
            <input value={f.nickname} onChange={set('nickname')} maxLength={30} required />
          </label>
          <label className="fld">
            <span>연락처</span>
            <input inputMode="tel" value={f.phone_number} onChange={set('phone_number')} required />
          </label>
          <label className="fld">
            <span>비밀번호</span>
            <div className="with-unit">
              <input type={show ? 'text' : 'password'} value={f.password} onChange={set('password')} autoComplete="new-password" required />
              <button type="button" className="eye" onClick={() => setShow(!show)} aria-label="비밀번호 보기">{show ? <PiEyeSlash size={18} /> : <PiEye size={18} />}</button>
            </div>
          </label>
          <button className="btn primary wide" disabled={busy}>{busy ? <i className="spin" /> : '가입하기'}</button>
          <Link to="/login" className="sub-link" state={loc.state}>로그인</Link>
        </form>
      </div>
    </main>
  );
}
