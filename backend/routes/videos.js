const router = require('express').Router()
const pool = require('../db')
const auth = require('../middleware/auth')

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT v.*, s.name as subject_name, s.emoji
       FROM videos v JOIN subjects s ON v.subject_id = s.id
       ORDER BY v.created_at DESC`
    )
    res.json(result.rows)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.get('/:subject_id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM videos WHERE subject_id=$1 ORDER BY created_at DESC',
      [req.params.subject_id]
    )
    res.json(result.rows)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

module.exports = router