import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { getTheme } from '../context/theme'
import Navbar from '../components/Navbar'
import axios from 'axios'

export default function Dashboard() {
  const [subjects, setSubjects] = useState([])
  const [results, setResults] = useState([])
  const { token, user } = useAuth()
  const { dark } = useTheme()
  const t = getTheme(dark)
  const navigate = useNavigate()

  useEffect(() => {
    axios.get('https://edutest-backend-x2qf.onrender.com/api/subjects', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setSubjects(res.data))

    axios.get('https://edutest-backend-x2qf.onrender.com/api/results/my', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setResults(res.data)).catch(() => {})
  }, [])

  const colors = [
    {from:'#4F46E5',to:'#7C3AED'},
    {from:'#0D9488',to:'#059669'},
    {from:'#D97706',to:'#DC2626'},
    {from:'#10B981',to:'#0D9488'},
    {from:'#EC4899',to:'#8B5CF6'},
    {from:'#3B82F6',to:'#4F46E5'},
  ]

  const getScore = (subjectId) => {
    const r = results.find(r => r.subject_id == subjectId)
    return r ? r.percentage : null
  }

  const totalTests = results.length
  const avgScore = results.length
    ? Math.round(results.reduce((a,r) => a + r.percentage, 0) / results.length) : 0

  return (
    <div style={{background:t.bg, minHeight:'100vh', transition:'all .3s'}}>
      <Navbar />
      <div style={{maxWidth:'1000px',margin:'0 auto',padding:'32px 24px'}}>

        {/* Hero */}
        <div style={{background:`linear-gradient(135deg,rgba(79,70,229,0.15),rgba(13,148,136,0.1))`,
          border:`1px solid rgba(79,70,229,0.2)`,borderRadius:'20px',
          padding:'32px',marginBottom:'28px',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:-40,right:-40,width:'200px',height:'200px',
            background:'radial-gradient(circle,rgba(79,70,229,0.15),transparent)',borderRadius:'50%'}}/>
          <h1 style={{fontSize:'28px',fontWeight:'800',color:t.text,marginBottom:'6px'}}>
            Salom, {user?.name}! 👋
          </h1>
          <p style={{color:t.text2,fontSize:'15px',marginBottom:'24px'}}>
            Bugun qaysi fandan test yechmoqchisiz?
          </p>
          <div style={{display:'flex',gap:'16px',flexWrap:'wrap'}}>
            {[
              {icon:'📝', label:'Yechilgan testlar', val: totalTests},
              {icon:'📈', label:"O'rtacha ball", val: avgScore ? avgScore+'%' : '—'},
              {icon:'🎬', label:'Videolar mavjud', val: '4+'},
            ].map((s,i) => (
              <div key={i} style={{background:t.bg2,borderRadius:'12px',
                padding:'14px 20px',border:`1px solid ${t.border}`,minWidth:'140px'}}>
                <div style={{fontSize:'22px',marginBottom:'4px'}}>{s.icon}</div>
                <div style={{fontSize:'20px',fontWeight:'700',color:t.text}}>{s.val}</div>
                <div style={{fontSize:'11px',color:t.text3}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Fanlar */}
        <h2 style={{color:t.text,fontSize:'17px',fontWeight:'700',marginBottom:'16px'}}>
          📚 Fanlar
        </h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'14px',marginBottom:'28px'}}>
          {subjects.map((s,i) => {
            const score = getScore(s.id)
            const c = colors[i % colors.length]
            return (
              <div key={s.id}
                onClick={() => navigate(`/test/${s.id}`)}
                style={{background:t.bg2,border:`1px solid ${t.border}`,borderRadius:'16px',
                  padding:'22px',cursor:'pointer',transition:'all .25s',position:'relative',overflow:'hidden'}}
                onMouseEnter={e => {
                  e.currentTarget.style.transform='translateY(-4px)'
                  e.currentTarget.style.boxShadow=`0 12px 30px rgba(79,70,229,0.2)`
                  e.currentTarget.style.borderColor='rgba(99,102,241,0.4)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform='translateY(0)'
                  e.currentTarget.style.boxShadow='none'
                  e.currentTarget.style.borderColor=t.border
                }}>
                <div style={{position:'absolute',top:0,left:0,right:0,height:'3px',
                  background:`linear-gradient(90deg,${c.from},${c.to})`}}/>
                <div style={{fontSize:'38px',marginBottom:'12px'}}>{s.emoji}</div>
                <div style={{fontSize:'16px',fontWeight:'700',color:t.text,marginBottom:'6px'}}>
                  {s.name}
                </div>
                {score !== null ? (
                  <div>
                    <div style={{display:'flex',justifyContent:'space-between',
                      alignItems:'center',marginBottom:'6px'}}>
                      <span style={{fontSize:'11px',color:t.text3}}>Oxirgi natija</span>
                      <span style={{fontSize:'13px',fontWeight:'700',
                        color:score>=80?'#10B981':score>=50?'#F59E0B':'#EF4444'}}>
                        {score}%
                      </span>
                    </div>
                    <div style={{height:'4px',background:t.bg3,borderRadius:'2px'}}>
                      <div style={{height:'4px',borderRadius:'2px',
                        background:`linear-gradient(90deg,${c.from},${c.to})`,
                        width:`${score}%`,transition:'width .5s'}}/>
                    </div>
                  </div>
                ) : (
                  <div style={{fontSize:'12px',color:t.text3}}>Test yechilmagan →</div>
                )}
              </div>
            )
          })}
        </div>

        {/* Quick actions */}
        <h2 style={{color:t.text,fontSize:'17px',fontWeight:'700',marginBottom:'16px'}}>
          ⚡ Tez harakatlar
        </h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px'}}>
          {[
            {icon:'🎬',title:'Videolar',desc:'Fan bo\'yicha darslar',path:'/videos',
              color:'rgba(13,148,136,0.15)',border:'rgba(13,148,136,0.3)'},
            {icon:'📊',title:'Natijalar',desc:'Barcha test natijalari',path:'/results',
              color:'rgba(79,70,229,0.15)',border:'rgba(99,102,241,0.3)'},
            {icon:'🤖',title:'AI Prognoz',desc:'Kelajak kasb tavsiyasi',path:'/ai',
              color:'rgba(139,92,246,0.15)',border:'rgba(139,92,246,0.3)'},
          ].map((a,i) => (
            <div key={i} onClick={() => navigate(a.path)}
              style={{background:a.color,border:`1px solid ${a.border}`,borderRadius:'14px',
                padding:'20px',cursor:'pointer',transition:'all .2s'}}
              onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
              <div style={{fontSize:'28px',marginBottom:'8px'}}>{a.icon}</div>
              <div style={{fontSize:'15px',fontWeight:'600',color:t.text,marginBottom:'4px'}}>{a.title}</div>
              <div style={{fontSize:'12px',color:t.text2}}>{a.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}