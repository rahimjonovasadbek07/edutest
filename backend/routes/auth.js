const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const pool = require('../db')
const authMiddleware = require('../middleware/auth')

// Ro'yxatdan o'tish
router.post('/register', async (req, res) => {
  const { name, email, phone, password } = req.body

  try {
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: "Barcha maydonlarni to'ldiring" })
    }

    const hash = await bcrypt.hash(password, 10)

    const result = await pool.query(
      'INSERT INTO users (name, email, phone, password) VALUES ($1,$2,$3,$4) RETURNING id, name, email, phone, role',
      [name, email, phone, hash]
    )

    const user = result.rows[0]

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({ token, user })
  } catch (e) {
    console.error('REGISTER ERROR:', e)
    res.status(500).json({ error: e.message })
  }
})

// Kirish
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  try {
    if (!email || !password) {
      return res.status(400).json({ error: "Email va parol kerak" })
    }

    const result = await pool.query(
      'SELECT * FROM users WHERE email=$1',
      [email]
    )

    const user = result.rows[0]

    if (!user) {
      return res.status(400).json({ error: 'Foydalanuvchi topilmadi' })
    }

    const match = await bcrypt.compare(password, user.password)

    if (!match) {
      return res.status(400).json({ error: "Parol noto'g'ri" })
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    })
  } catch (e) {
    console.error('LOGIN ERROR:', e)
    res.status(500).json({ error: e.message })
  }
})

// Profil yangilash
router.put('/profile', authMiddleware, async (req, res) => {
  const { name, phone } = req.body

  try {
    const result = await pool.query(
      `UPDATE users SET name=$1, phone=$2 WHERE id=$3
       RETURNING id, name, email, phone, role`,
      [name, phone, req.user.id]
    )

    res.json(result.rows[0])
  } catch (e) {
    console.error('PROFILE ERROR:', e)
    res.status(500).json({ error: e.message })
  }
})

// Parol o'zgartirish
router.put('/password', authMiddleware, async (req, res) => {
  const { oldPassword, newPassword } = req.body

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE id=$1',
      [req.user.id]
    )

    const user = result.rows[0]

    if (!user) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi' })
    }

    const match = await bcrypt.compare(oldPassword, user.password)

    if (!match) {
      return res.status(400).json({ error: "Joriy parol noto'g'ri!" })
    }

    const hash = await bcrypt.hash(newPassword, 10)

    await pool.query(
      'UPDATE users SET password=$1 WHERE id=$2',
      [hash, req.user.id]
    )

    res.json({ message: "Parol o'zgartirildi" })
  } catch (e) {
    console.error('PASSWORD ERROR:', e)
    res.status(500).json({ error: e.message })
  }
})

module.exports = router