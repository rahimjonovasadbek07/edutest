import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import axios from 'axios'

export default function TestPage() {
  const { subjectId } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [finished, setFinished] = useState(false)
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [subjectName, setSubjectName] = useState('')
  const [time, setTime] = useState(1200)

  useEffect(() => {
    axios.get(`https://edutest-backend-x2qf.onrender.com/api/tests/${subjectId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => { setQuestions(res.data); setLoading(false) })

    axios.get('https://edutest-backend-x2qf.onrender.com/api/subjects', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      const s = res.data.find(s => s.id == subjectId)
      if (s) setSubjectName(s.name)
    })
  }, [])

  useEffect(() => {
    if (finished || loading) return
    const t = setInterval(() => {
      setTime(prev => {
        if (prev <= 1) { clearInterval(t); handleFinish(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [finished, loading])

  const handleFinish = async () => {
    let s = 0
    questions.forEach((q, i) => { if (answers[i] === q.correct_answer) s++ })
    setScore(s)
    setFinished(true)
    try {
      await axios.post('https://edutest-backend-x2qf.onrender.com/api/results', {
        subject_id: subjectId, score: s, total: questions.length
      }, { headers: { Authorization: `Bearer ${token}` } })
    } catch (e) {}
  }

  const mins = String(Math.floor(time / 60)).padStart(2, '0')
  const secs = String(time % 60).padStart(2, '0')

  if (loading) return (
    <div style={{background:'#0F172A',minHeight:'100vh'}}>
      <Navbar />
      <div style={{textAlign:'center',color:'#94A3B8',marginTop:'100px',fontSize:'18px'}}>
        Testlar yuklanmoqda...
      </div>
    </div>
  )

  if (questions.length === 0) return (
    <div style={{background:'#0F172A',minHeight:'100vh'}}>
      <Navbar />
      <div style={{textAlign:'center',marginTop:'100px'}}>
        <div style={{fontSize:'48px',marginBottom:'16px'}}>📭</div>
        <p style={{color:'#94A3B8',fontSize:'18px',marginBottom:'20px'}}>Bu fanda hali testlar yo'q</p>
        <p style={{color:'#64748B',fontSize:'14px',marginBottom:'24px'}}>Admin test qo'shishi kerak</p>
        <button onClick={() => navigate('/dashboard')}
          style={{padding:'12px 24px',background:'#4F46E5',border:'none',borderRadius:'10px',color:'#fff',cursor:'pointer',fontSize:'14px'}}>
          Orqaga
        </button>
      </div>
    </div>
  )

  if (finished) {
    const pct = Math.round((score / questions.length) * 100)
    return (
      <div style={{background:'#0F172A',minHeight:'100vh'}}>
        <Navbar />
        <div style={{maxWidth:'500px',margin:'60px auto',padding:'24px'}}>
          <div style={{background:'#1E293B',border:'1px solid #334155',borderRadius:'20px',padding:'40px',textAlign:'center'}}>
            <div style={{fontSize:'64px',marginBottom:'16px'}}>
              {pct >= 80 ? '🏆' : pct >= 50 ? '👍' : '💪'}
            </div>
            <h2 style={{color:'#F1F5F9',fontSize:'24px',marginBottom:'8px'}}>Test yakunlandi!</h2>
            <p style={{color:'#64748B',marginBottom:'24px'}}>{subjectName}</p>
            <div style={{fontSize:'60px',fontWeight:'700',marginBottom:'8px',
              color: pct >= 80 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#EF4444'}}>
              {pct}%
            </div>
            <p style={{color:'#94A3B8',marginBottom:'32px'}}>
              {score} ta to'g'ri / {questions.length} ta savol
            </p>
            <div style={{display:'flex',gap:'12px',justifyContent:'center'}}>
              <button onClick={() => navigate('/dashboard')}
                style={{padding:'12px 24px',background:'#293548',border:'1px solid #334155',borderRadius:'10px',color:'#94A3B8',cursor:'pointer',fontSize:'14px'}}>
                Bosh sahifa
              </button>
              <button onClick={() => navigate('/results')}
                style={{padding:'12px 24px',background:'linear-gradient(135deg,#4F46E5,#6366F1)',border:'none',borderRadius:'10px',color:'#fff',cursor:'pointer',fontSize:'14px',fontWeight:'600'}}>
                Natijalar →
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const q = questions[current]
  const opts = [
    { l:'A', t: q.option_a },
    { l:'B', t: q.option_b },
    { l:'C', t: q.option_c },
    { l:'D', t: q.option_d },
  ]

  return (
    <div style={{background:'#0F172A',minHeight:'100vh'}}>
      <Navbar />
      <div style={{maxWidth:'700px',margin:'0 auto',padding:'32px 24px'}}>

        {/* Header */}
        <div style={{background:'#1E293B',border:'1px solid #334155',borderRadius:'14px',padding:'18px 20px',marginBottom:'20px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
            <span style={{color:'#F1F5F9',fontWeight:'600',fontSize:'16px'}}>{subjectName}</span>
            <span style={{background:'#293548',border:'1px solid #475569',borderRadius:'8px',
              padding:'6px 14px',color:'#F59E0B',fontWeight:'600',fontSize:'14px'}}>
              ⏱ {mins}:{secs}
            </span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
            <div style={{flex:1,height:'6px',background:'#293548',borderRadius:'3px'}}>
              <div style={{height:'6px',borderRadius:'3px',
                background:'linear-gradient(90deg,#4F46E5,#6366F1)',
                width:`${((current+1)/questions.length)*100}%`,transition:'width .3s'}} />
            </div>
            <span style={{color:'#64748B',fontSize:'13px',whiteSpace:'nowrap'}}>
              {current+1} / {questions.length}
            </span>
          </div>
        </div>

        {/* Question */}
        <div style={{background:'#1E293B',border:'1px solid #334155',borderRadius:'14px',padding:'28px',marginBottom:'16px'}}>
          <p style={{color:'#64748B',fontSize:'12px',fontWeight:'600',letterSpacing:'.5px',marginBottom:'12px'}}>
            SAVOL {current+1}
          </p>
          <p style={{color:'#F1F5F9',fontSize:'17px',fontWeight:'500',lineHeight:'1.6',marginBottom:'24px'}}>
            {q.question}
          </p>
          <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
            {opts.map(o => (
              <div key={o.l} onClick={() => setAnswers({...answers,[current]:o.l})}
                style={{display:'flex',alignItems:'center',gap:'14px',padding:'14px 16px',
                  borderRadius:'10px',cursor:'pointer',transition:'all .15s',
                  border: answers[current]===o.l ? '1.5px solid #4F46E5' : '1.5px solid #334155',
                  background: answers[current]===o.l ? 'rgba(79,70,229,0.15)' : '#293548'}}>
                <div style={{width:'30px',height:'30px',borderRadius:'8px',flexShrink:0,
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:'13px',fontWeight:'700',
                  background: answers[current]===o.l ? '#4F46E5' : '#1E293B',
                  border: answers[current]===o.l ? '1px solid #4F46E5' : '1px solid #475569',
                  color: answers[current]===o.l ? '#fff' : '#94A3B8'}}>
                  {o.l}
                </div>
                <span style={{color: answers[current]===o.l ? '#F1F5F9' : '#94A3B8',fontSize:'15px'}}>
                  {o.t}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div style={{display:'flex',justifyContent:'space-between',gap:'12px'}}>
          <button onClick={() => setCurrent(Math.max(0,current-1))} disabled={current===0}
            style={{padding:'11px 22px',background:'#293548',border:'1px solid #334155',
              borderRadius:'10px',color:'#94A3B8',cursor:'pointer',fontSize:'14px',
              opacity:current===0?0.4:1}}>
            ← Oldingi
          </button>
          {current < questions.length-1 ? (
            <button onClick={() => setCurrent(current+1)}
              style={{padding:'11px 22px',background:'linear-gradient(135deg,#4F46E5,#6366F1)',
                border:'none',borderRadius:'10px',color:'#fff',cursor:'pointer',fontSize:'14px',fontWeight:'600'}}>
              Keyingi →
            </button>
          ) : (
            <button onClick={handleFinish}
              style={{padding:'11px 22px',background:'linear-gradient(135deg,#10B981,#0D9488)',
                border:'none',borderRadius:'10px',color:'#fff',cursor:'pointer',fontSize:'14px',fontWeight:'600'}}>
              Yakunlash ✓
            </button>
          )}
        </div>
      </div>
    </div>
  )
}