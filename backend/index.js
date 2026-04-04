const express = require('express')
const cors = require('cors')
const path = require('path')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())

// Statik fayllar (video upload)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api/auth',     require('./routes/auth'))
app.use('/api/tests',    require('./routes/tests'))
app.use('/api/subjects', require('./routes/subjects'))
app.use('/api/results',  require('./routes/results'))
app.use('/api/admin',    require('./routes/admin'))
app.use('/api/ai',       require('./routes/ai'))
app.use('/api/videos',   require('./routes/videos'))

app.get('/', (req, res) => res.send('EduTest API ishlayapti ✅'))

app.listen(process.env.PORT, () => {
  console.log(`Server ${process.env.PORT} portda ishlamoqda 🚀`)
})