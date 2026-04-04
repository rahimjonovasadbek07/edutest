import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await axios.post('https://edutest-backend-x2qf.onrender.com/api/auth/login', form)
      login(res.data.user, res.data.token)
      navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Xato yuz berdi')
    }
    setLoading(false)
  }

  return (
    <div style={{minHeight:'100vh',background:'#0F172A',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:'#1E293B',border:'1px solid #334155',borderRadius:'20px',padding:'40px 36px',width:'100%',maxWidth:'400px'}}>
        <div style={{fontSize:'22px',fontWeight:'700',color:'#F1F5F9',marginBottom:'20px',textAlign:'center'}}>🎓 EduTest.uz</div>
        <h2 style={{fontSize:'24px',fontWeight:'700',color:'#F1F5F9',marginBottom:'20px',textAlign:'center'}}>Kirish</h2>
        {error && <div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:'8px',padding:'10px',color:'#EF4444',fontSize:'14px',marginBottom:'16px'}}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{marginBottom:'16px'}}>
            <label style={{display:'block',fontSize:'11px',fontWeight:'600',color:'#64748B',letterSpacing:'0.5px',marginBottom:'6px'}}>EMAIL</label>
            <input style={{width:'100%',padding:'12px 14px',background:'#0F172A',border:'1px solid #334155',borderRadius:'10px',color:'#F1F5F9',fontSize:'14px',outline:'none',boxSizing:'border-box'}}
              type="email" placeholder="email@mail.com" value={form.email}
              onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div style={{marginBottom:'16px'}}>
            <label style={{display:'block',fontSize:'11px',fontWeight:'600',color:'#64748B',letterSpacing:'0.5px',marginBottom:'6px'}}>PAROL</label>
            <input style={{width:'100%',padding:'12px 14px',background:'#0F172A',border:'1px solid #334155',borderRadius:'10px',color:'#F1F5F9',fontSize:'14px',outline:'none',boxSizing:'border-box'}}
              type="password" placeholder="••••••••" value={form.password}
              onChange={e => setForm({...form, password: e.target.value})} required />
          </div>
          <button style={{width:'100%',padding:'13px',background:'linear-gradient(135deg,#4F46E5,#6366F1)',border:'none',borderRadius:'10px',color:'#fff',fontSize:'15px',fontWeight:'600',cursor:'pointer',marginTop:'8px'}}
            type="submit" disabled={loading}>
            {loading ? 'Kirilmoqda...' : 'Kirish →'}
          </button>
        </form>
        <p style={{textAlign:'center',fontSize:'13px',color:'#64748B',marginTop:'20px'}}>
          Hisob yo'qmi? <Link to="/register" style={{color:'#6366F1'}}>Ro'yxatdan o'ting</Link>
        </p>
      </div>
    </div>
  )
}