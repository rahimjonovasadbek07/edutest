const router = require('express').Router()
const pool = require('../db')
const auth = require('../middleware/auth')

router.post('/prognoz', auth, async (req, res) => {
  try {
    const results = await pool.query(
      `SELECT r.*, s.name as subject_name
       FROM results r
       JOIN subjects s ON r.subject_id = s.id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`,
      [req.user.id]
    )

    const userResult = await pool.query(
      'SELECT name FROM users WHERE id = $1',
      [req.user.id]
    )

    const userName = userResult.rows[0]?.name || "O'quvchi"

    if (results.rows.length === 0) {
      return res.json({
        prognoz: `Assalomu alaykum, ${userName}! 👋

Hali hech qanday test yechmadingiz. Kamida 2-3 ta fan bo'yicha test yeching — shunda men sizga aniqroq kelajak tavsiya bera olaman! 🎯`
      })
    }

    const natijalarMatn = results.rows
      .map(r => `${r.subject_name}: ${r.percentage}% (${r.score}/${r.total} ta to'g'ri)`)
      .join('\n')

    const prompt = `Sen O'zbekiston maktab o'quvchilari uchun professional karyera maslahatchisisan.

O'quvchi ismi: ${userName}
Test natijalari:
${natijalarMatn}

Quyidagi aniq formatda o'zbek tilida yoz:

🎯 UMUMIY BAHO
(2-3 jumla — natijalarni baholab, o'quvchini rag'batlantir)

⭐ ENG KUCHLI FAN
(Qaysi fan kuchli, nima uchun — 2 jumla)

💼 SIZGA MOS KASBLAR
1. [Kasb nomi] — [qisqa izoh]
2. [Kasb nomi] — [qisqa izoh]
3. [Kasb nomi] — [qisqa izoh]
4. [Kasb nomi] — [qisqa izoh]

🎓 TAVSIYA ETILADIGAN UNIVERSITETLAR
1. [Universitet nomi] — [fakultet]
2. [Universitet nomi] — [fakultet]
3. [Universitet nomi] — [fakultet]

💡 AMALIY MASLAHATLAR
1. [Maslahat]
2. [Maslahat]
3. [Maslahat]

Faqat o'zbek tilida, samimiy va motivatsion ohangda yoz.`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: "Sen O'zbekiston maktab o'quvchilari uchun karyera maslahatchisisan. Faqat o'zbek tilida javob ber."
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 1500
      })
    })

    const rawText = await response.text()

    console.log('================ GROQ DEBUG ================')
    console.log('Status:', response.status)
    console.log('Raw response:', rawText)
    console.log('============================================')

    let data
    try {
      data = JSON.parse(rawText)
    } catch (err) {
      console.error('JSON parse xato:', err)
      throw new Error('Groq JSON qaytarmadi')
    }

    if (!response.ok) {
      console.error('Groq ERROR:', data)
      throw new Error(data?.error?.message || 'Groq xato')
    }

    const prognoz = data.choices?.[0]?.message?.content

    if (!prognoz) {
      console.error("Groq bo'sh javob:", data)
      throw new Error('Groq javob bermadi')
    }

    res.json({ prognoz, natijalar: results.rows })
  } catch (e) {
    console.error('AI xato:', e)

    try {
      const results = await pool.query(
        `SELECT r.*, s.name as subject_name
         FROM results r
         JOIN subjects s ON r.subject_id = s.id
         WHERE r.user_id = $1`,
        [req.user.id]
      )

      if (results.rows.length === 0) {
        return res.json({ prognoz: "Hali test yechmadingiz!" })
      }

      const natijalar = results.rows
      const engYaxshi = natijalar.reduce((a, b) =>
        a.percentage > b.percentage ? a : b
      )

      const ortacha = Math.round(
        natijalar.reduce((a, b) => a + b.percentage, 0) / natijalar.length
      )

      const kasbMap = {
        Matematika: ['Dasturchi 💻', 'Data Scientist 📊', 'Moliyachi 💰', 'Muhandis ⚙️'],
        Fizika: ['Muhandis ⚙️', 'Fizik 🔬', 'Elektrotexnik ⚡', 'Arxitektor 🏗️'],
        Kimyo: ['Kimyogar 🧪', 'Farmatsevt 💊', 'Shifokor 🏥', 'Texnolog 🍎'],
        Biologiya: ['Shifokor 🏥', 'Biologiyachi 🌿', 'Veterinar 🐾', 'Ekolog 🌍'],
        Tarix: ['Huquqshunos ⚖️', 'Diplomat 🤝', 'Jurnalist 📰', "O'qituvchi 📚"],
        'Ingliz tili': ['Tarjimon 🌐', 'Diplomat 🤝', 'IT mutaxassisi 💻', 'Biznesmen 💼']
      }

      const kasblar = kasbMap[engYaxshi.subject_name] || [
        'Mutaxassis 🎯',
        'Tadqiqotchi 🔬',
        "O'qituvchi 📚",
        'Menejer 📋'
      ]

      const prognoz = `📊 TEST NATIJALARI TAHLILI
━━━━━━━━━━━━━━━━━━━━

${natijalar.map(r => `• ${r.subject_name}: ${r.percentage}%`).join('\n')}

📈 O'rtacha ball: ${ortacha}%

⭐ ENG KUCHLI FAN: ${engYaxshi.subject_name} (${engYaxshi.percentage}%)

💼 SIZGA MOS KASBLAR:
${kasblar.map((k, i) => `${i + 1}. ${k}`).join('\n')}

💡 MASLAHAT:
${ortacha >= 80
  ? '🏆 Ajoyib natijalar! Olimpiadalarga qatnashing!'
  : ortacha >= 60
    ? '👍 Yaxshi! Har kuni mashq qiling!'
    : '💪 Davom eting, muvaffaqiyat sizniki!'
}`

      res.json({ prognoz, natijalar: results.rows })
    } catch (e2) {
      console.error('Fallback xato:', e2)
      res.status(500).json({ error: 'AI xizmatida xato' })
    }
  }
})

module.exports = router