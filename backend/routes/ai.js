const router = require('express').Router()
const pool = require('../db')
const auth = require('../middleware/auth')

router.post('/prognoz', auth, async (req, res) => {
  try {
    const results = await pool.query(
      `SELECT r.*, s.name as subject_name
       FROM results r JOIN subjects s ON r.subject_id = s.id
       WHERE r.user_id = $1 ORDER BY r.created_at DESC`,
      [req.user.id]
    )

    const userResult = await pool.query(
      'SELECT name FROM users WHERE id=$1', [req.user.id]
    )
    const userName = userResult.rows[0]?.name || "O'quvchi"

    if (results.rows.length === 0) {
      return res.json({
        prognoz: `Assalomu alaykum, ${userName}! 👋\n\nHali hech qanday test yechmadingiz. Kamida 2-3 ta fan bo'yicha test yeching — shunda men sizga aniqroq kelajak tavsiya bera olaman! 🎯`
      })
    }

    const natijalarMatn = results.rows
      .map(r => `${r.subject_name}: ${r.percentage}% (${r.score}/${r.total} ta to'g'ri)`)
      .join('\n')

    const prompt = `Sen O'zbekiston maktab o'quvchilari uchun professional karyera va ta'lim maslahatchisissан.

O'quvchi ismi: ${userName}
Test natijalari:
${natijalarMatn}

Quyidagi aniq formatda o'zbek tilida yoz:

🎯 UMUMIY BAHO
(2-3 jumla — natijalarni baholab, o'quvchini rag'batlandir)

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

📚 TAVSIYA ETILADIGAN KITOBLAR VA ELEKTRON QO'LLANMALAR
(Faqat kuchli fanlariga mos kitoblar va resurslar)
1. [Kitob nomi] — [muallif] — [qisqa izoh]
2. [Kitob nomi] — [muallif] — [qisqa izoh]
3. [Onlayn resurs nomi] — [platform, masalan: Khan Academy, Coursera] — [qisqa izoh]
4. [Kitob yoki resurs] — [izoh]

💡 AMALIY MASLAHATLAR
1. [Maslahat]
2. [Maslahat]
3. [Maslahat]

Faqat o'zbek tilida, samimiy va motivatsion ohangda yoz.`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: "Sen O'zbekiston maktab o'quvchilari uchun karyera va ta'lim maslahatchisissан. Faqat o'zbek tilida javob ber. Kitoblar va onlayn resurslarni tavsiya qilishda real mavjud resurslarni ko'rsat."
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 2000,
      })
    })

    const data = await response.json()

    if (data.error) {
      console.error('Groq xato:', data.error)
      throw new Error(data.error.message)
    }

    const prognoz = data.choices?.[0]?.message?.content
    if (!prognoz) throw new Error('Groq javob bermadi')

    res.json({ prognoz, natijalar: results.rows })

  } catch (e) {
    console.error('AI xato:', e.message)

    // Fallback
    try {
      const results = await pool.query(
        `SELECT r.*, s.name as subject_name
         FROM results r JOIN subjects s ON r.subject_id = s.id
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
        'Matematika': ['Dasturchi 💻', 'Data Scientist 📊', 'Moliyachi 💰', 'Muhandis ⚙️'],
        'Fizika': ['Muhandis ⚙️', 'Fizik 🔬', 'Elektrotexnik ⚡', 'Arxitektor 🏗️'],
        'Kimyo': ['Kimyogar 🧪', 'Farmatsevt 💊', 'Shifokor 🏥', 'Texnolog 🍎'],
        'Biologiya': ['Shifokor 🏥', 'Biologiyachi 🌿', 'Veterinar 🐾', 'Ekolog 🌍'],
        'Tarix': ['Huquqshunos ⚖️', 'Diplomat 🤝', 'Jurnalist 📰', "O'qituvchi 📚"],
        'Ingliz tili': ['Tarjimon 🌐', 'Diplomat 🤝', 'IT mutaxassisi 💻', 'Biznesmen 💼'],
      }

      const kitobMap = {
        'Matematika': ['Algebra — I.F.Sharygin', 'Geometriya — A.V.Pogorelov', 'Khan Academy (khanacademy.org)'],
        'Fizika': ['Fizika — Irodov masalalari', 'Fizika — Savchenko', 'PhET Simulations (phet.colorado.edu)'],
        'Kimyo': ['Kimyo — Glinka', 'Organik kimyo — Morrison', 'ChemLibreTexts (chem.libretexts.org)'],
        'Biologiya': ['Biologiya — Campbell', 'Genetika asoslari — Levin', 'Khan Academy Biology'],
        'Tarix': ["O'zbekiston tarixi — Karimov", 'Jahon tarixi — Xrestomatiya', 'Britannica (britannica.com)'],
        'Ingliz tili': ['English Grammar in Use — Murphy', 'Duolingo (duolingo.com)', 'BBC Learning English'],
      }

      const kasblar = kasbMap[engYaxshi.subject_name] || ['Mutaxassis 🎯', 'Tadqiqotchi 🔬', "O'qituvchi 📚", 'Menejer 📋']
      const kitoblar = kitobMap[engYaxshi.subject_name] || ['Khan Academy', 'Coursera (coursera.org)', 'YouTube darsliklar']

      const prognoz = `📊 TEST NATIJALARI TAHLILI
━━━━━━━━━━━━━━━━━━━━

${natijalar.map(r => `• ${r.subject_name}: ${r.percentage}%`).join('\n')}

📈 O'rtacha ball: ${ortacha}%

⭐ ENG KUCHLI FAN: ${engYaxshi.subject_name} (${engYaxshi.percentage}%)

💼 SIZGA MOS KASBLAR:
${kasblar.map((k, i) => `${i+1}. ${k}`).join('\n')}

📚 TAVSIYA ETILADIGAN KITOBLAR:
${kitoblar.map((k, i) => `${i+1}. ${k}`).join('\n')}

💡 MASLAHAT:
${ortacha >= 80
  ? '🏆 Ajoyib natijalar! Olimpiadalarga qatnashing!'
  : ortacha >= 60
  ? '👍 Yaxshi! Har kuni mashq qiling!'
  : '💪 Davom eting, muvaffaqiyat sizniki!'
}`

      res.json({ prognoz, natijalar: results.rows })
    } catch (e2) {
      res.status(500).json({ error: 'AI xizmatida xato' })
    }
  }
})

module.exports = router