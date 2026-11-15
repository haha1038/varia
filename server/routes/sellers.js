import express from 'express';
import db from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.id, u.nickname, u.created_at AS joined_at,
             COUNT(p.id)                                   AS product_count,
             SUM(p.price)                                  AS total_price,
             MAX(p.created_at)                             AS last_posted,
             GROUP_CONCAT(p.hex ORDER BY p.created_at DESC) AS hexes
      FROM users u
      JOIN products p ON p.user_id = u.id
      GROUP BY u.id, u.nickname, u.created_at
      ORDER BY last_posted DESC
    `);
    return res.json(
      rows.map((r) => ({
        ...r,
        product_count: Number(r.product_count),
        total_price: Number(r.total_price),
        hexes: r.hexes ? r.hexes.split(',') : [],
      }))
    );
  } catch (error) {
    console.error('판매자 목록 에러:', error);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

export default router;
