import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import db from '../db.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

const COLORS = ['red', 'orange', 'yellow', 'green', 'sky', 'blue', 'purple', 'pink', 'black', 'white'];

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`),
  }),
});

const removeFile = (url) => {
  if (!url) return;
  const file = path.join(uploadDir, path.basename(url));
  fs.existsSync(file) && fs.unlink(file, () => {});
};

const check = (b) => {
  if (!b.title || !b.title.trim() || !COLORS.includes(b.color) || !b.hex || b.price === undefined || b.price === '') return '필수 상품 정보를 입력해 주세요.';
  return null;
};

router.get('/', async (req, res) => {
  const { color } = req.query;
  let sql = `
    SELECT p.id, p.user_id, p.title, p.color, p.hex, p.category, p.price, p.image_url, p.created_at,
           u.nickname AS seller_nickname
    FROM products p
    JOIN users u ON p.user_id = u.id`;
  const where = [];
  const params = [];
  if (color && COLORS.includes(color)) { where.push('p.color = ?'); params.push(color); }
  if (where.length) sql += ' WHERE ' + where.join(' AND ');
  sql += ' ORDER BY p.created_at DESC, p.id DESC';
  try {
    const [rows] = await db.query(sql, params);
    return res.json(rows);
  } catch (error) {
    console.error('상품 목록 에러:', error);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

router.get('/mine', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.id, p.user_id, p.title, p.color, p.hex, p.category, p.price, p.image_url, p.created_at,
              u.nickname AS seller_nickname
       FROM products p JOIN users u ON p.user_id = u.id
       WHERE p.user_id = ? ORDER BY p.created_at DESC, p.id DESC`,
      [req.user.id]
    );
    return res.json(rows);
  } catch (error) {
    console.error('내 상품 에러:', error);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, u.nickname AS seller_nickname
       FROM products p JOIN users u ON p.user_id = u.id
       WHERE p.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: '존재하지 않는 상품입니다.' });
    return res.json(rows[0]);
  } catch (error) {
    console.error('상품 상세 에러:', error);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  const err = check(req.body);
  if (err) { removeFile(req.file && req.file.filename); return res.status(400).json({ message: err }); }
  const { title, color, hex, category, price, description } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;
  try {
    const [result] = await db.query(
      `INSERT INTO products (user_id, title, color, hex, category, price, description, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, title.trim(), color, hex.toUpperCase(), category || '기타', Number(price), description || '', image_url]
    );
    return res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error('상품 등록 에러:', error);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

router.put('/:id', authenticateToken, upload.single('image'), async (req, res) => {
  const err = check(req.body);
  if (err) { removeFile(req.file && req.file.filename); return res.status(400).json({ message: err }); }
  try {
    const [rows] = await db.query('SELECT user_id, image_url FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) { removeFile(req.file && req.file.filename); return res.status(404).json({ message: '존재하지 않는 상품입니다.' }); }
    if (rows[0].user_id !== req.user.id) { removeFile(req.file && req.file.filename); return res.status(403).json({ message: '본인이 등록한 상품만 수정할 수 있습니다.' }); }

    let image_url = rows[0].image_url;
    if (req.file) { removeFile(image_url); image_url = `/uploads/${req.file.filename}`; }
    else if (req.body.removeImage === '1') { removeFile(image_url); image_url = null; }

    const { title, color, hex, category, price, description } = req.body;
    await db.query(
      `UPDATE products SET title = ?, color = ?, hex = ?, category = ?, price = ?, description = ?, image_url = ?
       WHERE id = ?`,
      [title.trim(), color, hex.toUpperCase(), category || '기타', Number(price), description || '', image_url, req.params.id]
    );
    return res.json({ id: Number(req.params.id) });
  } catch (error) {
    console.error('상품 수정 에러:', error);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, image_url FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: '존재하지 않는 상품입니다.' });
    if (rows[0].user_id !== req.user.id) return res.status(403).json({ message: '본인이 등록한 상품만 삭제할 수 있습니다.' });
    await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    removeFile(rows[0].image_url);
    return res.json({ message: '상품이 삭제되었습니다.' });
  } catch (error) {
    console.error('상품 삭제 에러:', error);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

export default router;
