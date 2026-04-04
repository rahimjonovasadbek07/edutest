const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/:subject_id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tests WHERE subject_id=$1 ORDER BY RANDOM() LIMIT 20',
      [req.params.subject_id]
    );
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;