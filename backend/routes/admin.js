const router = require('express').Router()
const pool = require('../db')
const auth = require('../middleware/auth')
const multer = require('multer')
const XLSX = require('xlsx')
const path = require('path')

const uploadExcel = multer({ dest: 'uploads/' })

const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `video_${Date.now()}${ext}`)
  }
})
const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['video/mp4','video/webm','video/ogg','video/avi','video/quicktime']
    if (allowed.includes(file.mimetype)) cb(null, true)
    else cb(new Error('Faqat video fayl!'))
  }
})

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ error: "Ruxsat yo'q" })
  next()
}

// ========== TESTLAR ==========

router.get('/tests', auth, adminOnly, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, s.name as subject_name, s.emoji
       FROM tests t JOIN subjects s ON t.subject_id = s.id
       ORDER BY t.subject_id, t.id`
    )
    res.json(result.rows)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.delete('/tests/:id', auth, adminOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM tests WHERE id=$1', [req.params.id])
    res.json({ message: "O'chirildi" })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.post('/upload-tests', auth, adminOnly, uploadExcel.single('file'), async (req, res) => {
  try {
    const workbook = XLSX.readFile(req.file.path)
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(sheet)
    let count = 0
    for (const row of rows) {
      if (!row.question || !row.subject_id) continue
      await pool.query(
        `INSERT INTO tests (subject_id, question, option_a, option_b, option_c, option_d, correct_answer)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [row.subject_id, row.question, row.option_a, row.option_b,
         row.option_c, row.option_d, row.correct_answer]
      )
      count++
    }
    res.json({ message: `${count} ta test qo'shildi` })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ========== VIDEOLAR ==========

router.get('/videos', auth, adminOnly, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT v.*, s.name as subject_name, s.emoji
       FROM videos v JOIN subjects s ON v.subject_id = s.id
       ORDER BY v.id DESC`
    )
    res.json(result.rows)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.post('/videos', auth, adminOnly, uploadVideo.single('videoFile'), async (req, res) => {
  try {
    const { subject_id, title, description, video_url, duration } = req.body
    let finalUrl = video_url || ''
    if (req.file) {
      finalUrl = `/uploads/${req.file.filename}`
    }
    if (!finalUrl) {
      return res.status(400).json({ error: 'Video URL yoki fayl kerak' })
    }
    const result = await pool.query(
      `INSERT INTO videos (subject_id, title, description, video_url, duration)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [subject_id, title, description, finalUrl, duration || '']
    )
    res.json(result.rows[0])
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.delete('/videos/:id', auth, adminOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM videos WHERE id=$1', [req.params.id])
    res.json({ message: "O'chirildi" })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ========== FANLAR ==========

router.get('/subjects', auth, adminOnly, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM subjects ORDER BY id')
    res.json(result.rows)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.post('/subjects', auth, adminOnly, async (req, res) => {
  const { name, emoji, description } = req.body
  try {
    const result = await pool.query(
      'INSERT INTO subjects (name, emoji, description) VALUES ($1,$2,$3) RETURNING *',
      [name, emoji, description || '']
    )
    res.json(result.rows[0])
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.delete('/subjects/:id', auth, adminOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM results WHERE subject_id=$1', [req.params.id])
    await pool.query('DELETE FROM tests WHERE subject_id=$1', [req.params.id])
    await pool.query('DELETE FROM videos WHERE subject_id=$1', [req.params.id])
    await pool.query('DELETE FROM subjects WHERE id=$1', [req.params.id])
    res.json({ message: "Fan va bog'liq ma'lumotlar o'chirildi" })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ========== FOYDALANUVCHILAR ==========

router.get('/users', auth, adminOnly, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC'
    )
    res.json(result.rows)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

module.exports = router