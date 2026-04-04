import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { getTheme } from '../context/theme'
import Navbar from '../components/Navbar'
import axios from 'axios'

export default function AiPrognoz() {
  const [prognoz, setPrognoz] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const { token } = useAuth()
  const { dark } = useTheme()
  const t = getTheme(dark)
  const navigate = useNavigate()

  const getPrognoz = async () => {
    setLoading(true)
    try {
     const res = await axios.post(
  'https://edutest-backend-x2qf.onrender.com/api/ai/prognoz',
  {},
  {
    headers: { Authorization: `Bearer ${token}` }
  }
)
      setPrognoz(res.data.prognoz)
      setDone(true)
    } catch (e) {
      setPrognoz('Xato: ' + (e.response?.data?.error || e.message))
      setDone(true)
    }
    setLoading(false)
  }

  return (
    <div style={{background:t.bg,minHeight:'100vh',transition:'all .3s'}}>
      <Navbar />
      <div style={{maxWidth:'700px',margin:'0 auto',padding:'32px 24px'}}>
        <h1 style={{color:t.text,fontSize:'24px',fontWeight:'800',marginBottom:'8px'}}>
          🤖 AI Prognoz
        </h1>
        <p style={{color:t.text2,marginBottom:'32px'}}>
          Test natijalaringiz asosida kelajak kasb tavsiyasi
        </p>

        {!done && (
          <div style={{
            background:dark
              ?'linear-gradient(135deg,rgba(79,70,229,0.15),rgba(139,92,246,0.1))'
              :'linear-gradient(135deg,rgba(79,70,229,0.06),rgba(139,92,246,0.04))',
            border:'1px solid rgba(99,102,241,0.35)',
            borderRadius:'20px',padding:'48px',textAlign:'center'}}>
            <div style={{fontSize:'72px',marginBottom:'20px'}}>🤖</div>
            <h2 style={{color:t.text,fontSize:'20px',fontWeight:'700',marginBottom:'12px'}}>
              AI sizning natijalaringizni tahlil qiladi
            </h2>
            <p style={{color:t.text2,fontSize:'14px',lineHeight:'1.7',marginBottom:'32px'}}>
              Test natijalaringiz asosida qaysi kasb mos kelishi,<br/>
              qaysi universitetga o'qishga kirish kerakligi haqida<br/>
              batafsil tavsiya beriladi
            </p>
            <button onClick={getPrognoz} disabled={loading}
              style={{padding:'14px 40px',
                background:'linear-gradient(135deg,#4F46E5,#6366F1)',
                border:'none',borderRadius:'12px',color:'#fff',
                fontSize:'16px',fontWeight:'600',cursor:'pointer',
                boxShadow:'0 4px 20px rgba(79,70,229,0.35)',
                opacity:loading?0.7:1,fontFamily:'inherit'}}>
              {loading ? '⏳ Tahlil qilinmoqda...' : '✨ Prognoz olish'}
            </button>
          </div>
        )}

        {loading && (
          <div style={{textAlign:'center',marginTop:'16px',padding:'16px',
            background:t.bg2,borderRadius:'12px',border:`1px solid ${t.border}`}}>
            <div style={{color:'#6366F1',fontSize:'14px',lineHeight:'2'}}>
              🧠 Natijalaringiz tahlil qilinmoqda...<br/>
              📊 Fanlar bo'yicha baholanmoqda...<br/>
              💼 Kasb tavsiyalari tayyorlanmoqda...
            </div>
          </div>
        )}

        {done && prognoz && (
          <div style={{background:t.bg2,border:`1px solid ${t.border}`,
            borderRadius:'20px',padding:'32px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'12px',
              marginBottom:'24px',paddingBottom:'16px',borderBottom:`1px solid ${t.border}`}}>
              <span style={{fontSize:'32px'}}>🤖</span>
              <div>
                <div style={{color:t.text,fontWeight:'700',fontSize:'16px'}}>
                  AI Tahlil natijalari
                </div>
                <div style={{color:t.text3,fontSize:'12px'}}>Shaxsiy karyera tavsiyasi</div>
              </div>
            </div>

            <div style={{color:t.text,fontSize:'14px',lineHeight:'1.9',
              whiteSpace:'pre-wrap',
              background:t.bg3,padding:'20px',borderRadius:'12px',
              border:`1px solid ${t.border}`}}>
              {prognoz}
            </div>

            <div style={{display:'flex',gap:'12px',marginTop:'24px'}}>
              <button onClick={() => { setDone(false); setPrognoz('') }}
                style={{padding:'11px 20px',background:t.bg3,
                  border:`1px solid ${t.border}`,borderRadius:'10px',
                  color:t.text2,cursor:'pointer',fontSize:'14px',fontFamily:'inherit'}}>
                🔄 Qayta olish
              </button>
              <button onClick={() => navigate('/results')}
                style={{padding:'11px 20px',background:t.bg3,
                  border:`1px solid ${t.border}`,borderRadius:'10px',
                  color:t.text2,cursor:'pointer',fontSize:'14px',fontFamily:'inherit'}}>
                📊 Natijalar
              </button>
              <button onClick={() => navigate('/dashboard')}
                style={{padding:'11px 20px',
                  background:'linear-gradient(135deg,#4F46E5,#6366F1)',
                  border:'none',borderRadius:'10px',color:'#fff',
                  cursor:'pointer',fontSize:'14px',fontWeight:'600',fontFamily:'inherit'}}>
                Bosh sahifa →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}