import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

export default function Register() {
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await axios.post('https://edutest-backend-x2qf.onrender.com/api/auth/register', form)
      login(res.data.user, res.data.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Xato yuz berdi')
    }
    setLoading(false)
  }

  return (
    <div style={{minHeight:'100vh',background:'#0F172A',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:'#1E293B',border:'1px solid #334155',borderRadius:'20px',padding:'40px 36px',width:'100%',maxWidth:'400px'}}>
        <div style={{fontSize:'22px',fontWeight:'700',color:'#F1F5F9',marginBottom:'20px',textAlign:'center'}}>🎓 EduTest.uz</div>
        <h2 style={{fontSize:'22px',fontWeight:'700',color:'#F1F5F9',marginBottom:'20px',textAlign:'center'}}>Ro'yxatdan o'tish</h2>
        {error && <div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:'8px',padding:'10px',color:'#EF4444',fontSize:'14px',marginBottom:'16px'}}>{error}</div>}
        <form onSubmit={handleSubmit}>
          {[
            {key:'name',label:"TO'LIQ ISM",type:'text',ph:'Ali Valiyev'},
            {key:'email',label:'EMAIL',type:'email',ph:'ali@mail.com'},
            {key:'phone',label:'TELEFON',type:'text',ph:'998901234567'},
            {key:'password',label:'PAROL',type:'password',ph:'Kamida 8 ta belgi'},
          ].map(f => (
            <div key={f.key} style={{marginBottom:'14px'}}>
              <label style={{display:'block',fontSize:'11px',fontWeight:'600',color:'#64748B',letterSpacing:'0.5px',marginBottom:'6px'}}>{f.label}</label>
              <input style={{width:'100%',padding:'12px 14px',background:'#0F172A',border:'1px solid #334155',borderRadius:'10px',color:'#F1F5F9',fontSize:'14px',outline:'none',boxSizing:'border-box'}}
                type={f.type} placeholder={f.ph} value={form[f.key]}
                onChange={e => setForm({...form,[f.key]:e.target.value})} required />
            </div>
          ))}
          <button style={{width:'100%',padding:'13px',background:'linear-gradient(135deg,#4F46E5,#6366F1)',border:'none',borderRadius:'10px',color:'#fff',fontSize:'15px',fontWeight:'600',cursor:'pointer',marginTop:'8px'}}
            type="submit" disabled={loading}>
            {loading ? 'Saqlanmoqda...' : "Ro'yxatdan o'tish →"}
          </button>
        </form>
        <p style={{textAlign:'center',fontSize:'13px',color:'#64748B',marginTop:'20px'}}>
          Hisobingiz bormi? <Link to="/" style={{color:'#6366F1'}}>Kirish</Link>
        </p>
      </div>
    </div>
  )
}