import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

const makeToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, nickname: user.nickname }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/signup', async (req, res) => {
  const { email, password, nickname, phone_number } = req.body;
  if (!email || !password || !nickname || !phone_number) {
    return res.status(400).json({ message: '모든 필수 정보를 입력해 주세요.' });
  }
  try {
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (email, password, nickname, phone_number) VALUES (?, ?, ?, ?)',
      [email.trim(), hashed, nickname.trim(), phone_number]
    );
    const user = { id: result.insertId, email, nickname };
    return res.status(201).json({ token: makeToken(user), user });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: '이미 등록된 이메일입니다.' });
    console.error('회원가입 에러:', error);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: '이메일과 비밀번호를 입력해 주세요.' });
  try {
    const [rows] = await db.query('SELECT id, email, password, nickname FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(404).json({ message: '등록된 회원 정보가 없습니다.' });
    const ok = await bcrypt.compare(password, rows[0].password);
    if (!ok) return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
    const user = { id: rows[0].id, email: rows[0].email, nickname: rows[0].nickname };
    return res.json({ token: makeToken(user), user });
  } catch (error) {
    console.error('로그인 에러:', error);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, email, nickname, phone_number, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    return res.json(rows[0]);
  } catch (error) {
    console.error('프로필 조회 에러:', error);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

router.put('/me', authenticateToken, async (req, res) => {
  const { nickname, phone_number } = req.body;
  if (!nickname || !nickname.trim() || !phone_number) return res.status(400).json({ message: '모든 필수 정보를 입력해 주세요.' });
  try {
    await db.query('UPDATE users SET nickname = ?, phone_number = ? WHERE id = ?', [nickname.trim(), phone_number, req.user.id]);
    const user = { id: req.user.id, email: req.user.email, nickname: nickname.trim() };
    return res.json({ token: makeToken(user), user });
  } catch (error) {
    console.error('프로필 수정 에러:', error);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

router.delete('/me', authenticateToken, async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id = ?', [req.user.id]);
    return res.json({ message: '회원 탈퇴가 처리되었습니다.' });
  } catch (error) {
    console.error('회원 탈퇴 에러:', error);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

export default router;
