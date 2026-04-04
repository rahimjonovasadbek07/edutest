import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { getTheme } from '../context/theme'
import Navbar from '../components/Navbar'
import axios from 'axios'

export default function Results() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const { token } = useAuth()
  const { dark } = useTheme()
  const t = getTheme(dark)
  const navigate = useNavigate()

  useEffect(() => {
    axios.get('https://edutest-backend-x2qf.onrender.com/api/results/my', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => { setResults(res.data); setLoading(false) })
  }, [])

  const avg = results.length ? Math.round(results.reduce((a,r) => a+r.percentage,0)/results.length) : 0
  const best = results.length ? Math.max(...results.map(r=>r.percentage)) : 0

  return (
    <div style={{background:t.bg,minHeight:'100vh',transition:'all .3s'}}>
      <Navbar />
      <div style={{maxWidth:'800px',margin:'0 auto',padding:'32px 24px'}}>
        <h1 style={{color:t.text,fontSize:'24px',fontWeight:'800',marginBottom:'6px'}}>
          Natijalarim 📊
        </h1>
        <p style={{color:t.text2,marginBottom:'28px'}}>Barcha test natijalari</p>

        {results.length > 0 && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'24px'}}>
            {[
              {label:'Jami testlar', val:results.length, color:'#6366F1'},
              {label:"O'rtacha ball", val:avg+'%', color:avg>=70?'#10B981':'#F59E0B'},
              {label:'Eng yaxshi', val:best+'%', color:'#10B981'},
            ].map((s,i) => (
              <div key={i} style={{background:t.bg2,border:`1px solid ${t.border}`,
                borderRadius:'14px',padding:'20px',textAlign:'center'}}>
                <div style={{fontSize:'28px',fontWeight:'700',color:s.color}}>{s.val}</div>
                <div style={{fontSize:'12px',color:t.text3,marginTop:'4px'}}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{textAlign:'center',color:t.text2,marginTop:'60px'}}>Yuklanmoqda...</div>
        ) : results.length === 0 ? (
          <div style={{textAlign:'center',background:t.bg2,border:`1px solid ${t.border}`,
            borderRadius:'16px',padding:'60px'}}>
            <div style={{fontSize:'48px',marginBottom:'16px'}}>📝</div>
            <p style={{color:t.text2,marginBottom:'20px'}}>Hali test yechmadingiz</p>
            <button onClick={() => navigate('/dashboard')}
              style={{padding:'12px 24px',background:'linear-gradient(135deg,#4F46E5,#6366F1)',
                border:'none',borderRadius:'10px',color:'#fff',cursor:'pointer',fontSize:'14px'}}>
              Test yechish →
            </button>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:'10px',marginBottom:'24px'}}>
            {results.map((r,i) => (
              <div key={i} style={{background:t.bg2,border:`1px solid ${t.border}`,
                borderRadius:'12px',padding:'16px 20px',
                display:'flex',alignItems:'center',gap:'16px'}}>
                <span style={{fontSize:'28px'}}>{r.emoji}</span>
                <div style={{flex:1}}>
                  <div style={{color:t.text,fontWeight:'600',fontSize:'15px'}}>{r.subject_name}</div>
                  <div style={{color:t.text3,fontSize:'12px',marginTop:'2px'}}>
                    {new Date(r.created_at).toLocaleDateString('uz-UZ')}
                  </div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:'20px',fontWeight:'700',
                    color:r.percentage>=80?'#10B981':r.percentage>=50?'#F59E0B':'#EF4444'}}>
                    {r.percentage}%
                  </div>
                  <div style={{fontSize:'12px',color:t.text3}}>{r.score}/{r.total}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div onClick={() => navigate('/ai')}
          style={{background:dark?'linear-gradient(135deg,rgba(79,70,229,0.2),rgba(139,92,246,0.1))':'linear-gradient(135deg,rgba(79,70,229,0.08),rgba(139,92,246,0.05))',
            border:'1px solid rgba(99,102,241,0.35)',borderRadius:'14px',padding:'20px 24px',
            cursor:'pointer',display:'flex',alignItems:'center',gap:'16px'}}>
          <span style={{fontSize:'32px'}}>🤖</span>
          <div>
            <div style={{fontSize:'15px',fontWeight:'600',color:t.text}}>AI prognoz olish</div>
            <div style={{fontSize:'12px',color:t.text2}}>Natijalaringiz asosida kelajak kasb tavsiyasi</div>
          </div>
          <span style={{marginLeft:'auto',color:'#6366F1',fontSize:'20px'}}>→</span>
        </div>
      </div>
    </div>
  )
}