const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  const { subject_id, score, total } = req.body;
  const percentage = Math.round((score / total) * 100);
  try {
    const result = await pool.query(
      'INSERT INTO results (user_id, subject_id, score, total, percentage) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [req.user.id, subject_id, score, total, percentage]
    );
    res.json(result.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/my', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, s.name as subject_name, s.emoji
       FROM results r JOIN subjects s ON r.subject_id = s.id
       WHERE r.user_id=$1 ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;