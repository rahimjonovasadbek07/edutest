import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { getTheme } from '../context/theme'
import Navbar from '../components/Navbar'
import axios from 'axios'

export default function Profile() {
  const { user, token, login } = useAuth()
  const { dark } = useTheme()
  const t = getTheme(dark)

  const [tab, setTab] = useState('info')
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [passwords, setPasswords] = useState({ old: '', new1: '', new2: '' })
  const [stats, setStats] = useState([])
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState('success')
  const [loading, setLoading] = useState(false)

  const showMsg = (text, type = 'success') => {
    setMsg(text); setMsgType(type)
    setTimeout(() => setMsg(''), 3000)
  }

  useEffect(() => {
    axios.get('https://edutest-backend-x2qf.onrender.com/api/results/my', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setStats(res.data)).catch(() => {})
  }, [])

  const handleUpdateInfo = async () => {
    if (!form.name) { showMsg('❌ Ism bo\'sh bo\'lmasin!', 'error'); return }
    setLoading(true)
    try {
      const res = await axios.put('https://edutest-backend-x2qf.onrender.com/api/auth/profile', form, {
        headers: { Authorization: `Bearer ${token}` }
      })
      login(res.data, token)
      showMsg('✅ Ma\'lumotlar yangilandi!')
    } catch (e) {
      showMsg('❌ ' + (e.response?.data?.error || 'Xato'), 'error')
    }
    setLoading(false)
  }

  const handleChangePassword = async () => {
    if (!passwords.old || !passwords.new1) {
      showMsg('❌ Barcha maydonlarni to\'ldiring!', 'error'); return
    }
    if (passwords.new1 !== passwords.new2) {
      showMsg('❌ Yangi parollar mos kelmadi!', 'error'); return
    }
    if (passwords.new1.length < 8) {
      showMsg('❌ Parol kamida 8 ta belgi!', 'error'); return
    }
    setLoading(true)
    try {
      await axios.put('https://edutest-backend-x2qf.onrender.com/api/auth/password', {
        oldPassword: passwords.old,
        newPassword: passwords.new1
      }, { headers: { Authorization: `Bearer ${token}` } })
      setPasswords({ old: '', new1: '', new2: '' })
      showMsg('✅ Parol muvaffaqiyatli o\'zgartirildi!')
    } catch (e) {
      showMsg('❌ ' + (e.response?.data?.error || 'Xato'), 'error')
    }
    setLoading(false)
  }

  const totalTests = stats.length
  const avgScore = stats.length
    ? Math.round(stats.reduce((a, r) => a + r.percentage, 0) / stats.length) : 0
  const bestScore = stats.length
    ? Math.max(...stats.map(r => r.percentage)) : 0

  const inp = {
    width: '100%', padding: '11px 14px',
    background: t.bg, border: `1px solid ${t.border}`,
    borderRadius: '10px', color: t.text,
    fontSize: '14px', outline: 'none',
    fontFamily: 'inherit', boxSizing: 'border-box'
  }

  return (
    <div style={{ background: t.bg, minHeight: '100vh', transition: 'all .3s' }}>
      <Navbar />
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Avatar va ism */}
        <div style={{
          background: t.bg2, border: `1px solid ${t.border}`,
          borderRadius: '20px', padding: '28px',
          display: 'flex', alignItems: 'center', gap: '20px',
          marginBottom: '24px'
        }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'linear-gradient(135deg,#4F46E5,#8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', fontWeight: '700', color: '#fff', flexShrink: 0
          }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ color: t.text, fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>
              {user?.name}
            </h2>
            <p style={{ color: t.text2, fontSize: '14px', marginBottom: '4px' }}>
              📧 {user?.email}
            </p>
            <span style={{
              padding: '3px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
              background: user?.role === 'admin' ? 'rgba(79,70,229,0.15)' : 'rgba(16,185,129,0.12)',
              color: user?.role === 'admin' ? '#6366F1' : '#10B981'
            }}>
              {user?.role === 'admin' ? '⚙️ Admin' : '🎓 O\'quvchi'}
            </span>
          </div>
        </div>

        {/* Statistika */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
          gap: '12px', marginBottom: '24px'
        }}>
          {[
            { label: 'Yechilgan testlar', val: totalTests, icon: '📝', color: '#6366F1' },
            { label: "O'rtacha ball", val: avgScore + '%', icon: '📈', color: avgScore >= 70 ? '#10B981' : '#F59E0B' },
            { label: 'Eng yuqori', val: bestScore + '%', icon: '🏆', color: '#10B981' },
          ].map((s, i) => (
            <div key={i} style={{
              background: t.bg2, border: `1px solid ${t.border}`,
              borderRadius: '14px', padding: '18px', textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>{s.icon}</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: s.color }}>{s.val}</div>
              <div style={{ fontSize: '11px', color: t.text3, marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {[
            { id: 'info', label: '👤 Ma\'lumotlar' },
            { id: 'password', label: '🔒 Parol' },
            { id: 'results', label: '📊 Natijalar' },
          ].map(tb => (
            <button key={tb.id} onClick={() => { setTab(tb.id); setMsg('') }}
              style={{
                padding: '9px 18px', borderRadius: '10px', cursor: 'pointer',
                fontSize: '13px', fontWeight: '600', fontFamily: 'inherit',
                background: tab === tb.id
                  ? 'linear-gradient(135deg,#4F46E5,#6366F1)' : t.bg2,
                color: tab === tb.id ? '#fff' : t.text2,
                border: `1px solid ${tab === tb.id ? 'transparent' : t.border}`,
                transition: 'all .2s'
              }}>
              {tb.label}
            </button>
          ))}
        </div>

        {/* Message */}
        {msg && (
          <div style={{
            background: msgType === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
            border: `1px solid ${msgType === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
            borderRadius: '10px', padding: '12px 16px',
            color: msgType === 'success' ? '#10B981' : '#EF4444',
            marginBottom: '16px', fontSize: '14px', fontWeight: '500'
          }}>
            {msg}
          </div>
        )}

        {/* MA'LUMOTLAR */}
        {tab === 'info' && (
          <div style={{
            background: t.bg2, border: `1px solid ${t.border}`,
            borderRadius: '16px', padding: '24px'
          }}>
            <h3 style={{ color: t.text, fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>
              Shaxsiy ma'lumotlar
            </h3>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: t.text3, marginBottom: '6px', fontWeight: '600' }}>
                TO'LIQ ISM
              </label>
              <input value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                style={inp} placeholder="To'liq ismingiz" />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: t.text3, marginBottom: '6px', fontWeight: '600' }}>
                EMAIL (o'zgartirib bo'lmaydi)
              </label>
              <input value={user?.email} disabled
                style={{ ...inp, opacity: 0.5, cursor: 'not-allowed' }} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: t.text3, marginBottom: '6px', fontWeight: '600' }}>
                TELEFON
              </label>
              <input value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                style={inp} placeholder="998901234567" />
            </div>
            <button onClick={handleUpdateInfo} disabled={loading}
              style={{
                padding: '12px 28px',
                background: 'linear-gradient(135deg,#4F46E5,#6366F1)',
                border: 'none', borderRadius: '10px', color: '#fff',
                fontSize: '14px', fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', opacity: loading ? 0.7 : 1
              }}>
              {loading ? 'Saqlanmoqda...' : '💾 Saqlash'}
            </button>
          </div>
        )}

        {/* PAROL */}
        {tab === 'password' && (
          <div style={{
            background: t.bg2, border: `1px solid ${t.border}`,
            borderRadius: '16px', padding: '24px'
          }}>
            <h3 style={{ color: t.text, fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>
              Parolni o'zgartirish
            </h3>
            {[
              { key: 'old', label: 'JORIY PAROL', ph: 'Hozirgi parolingiz' },
              { key: 'new1', label: 'YANGI PAROL', ph: 'Kamida 8 ta belgi' },
              { key: 'new2', label: 'YANGI PAROLNI TASDIQLANG', ph: 'Takrorlang' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: t.text3, marginBottom: '6px', fontWeight: '600' }}>
                  {f.label}
                </label>
                <input type="password" value={passwords[f.key]}
                  onChange={e => setPasswords({ ...passwords, [f.key]: e.target.value })}
                  style={inp} placeholder={f.ph} />
              </div>
            ))}
            <button onClick={handleChangePassword} disabled={loading}
              style={{
                marginTop: '6px', padding: '12px 28px',
                background: 'linear-gradient(135deg,#4F46E5,#6366F1)',
                border: 'none', borderRadius: '10px', color: '#fff',
                fontSize: '14px', fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', opacity: loading ? 0.7 : 1
              }}>
              {loading ? 'O\'zgartirilmoqda...' : '🔒 Parolni o\'zgartirish'}
            </button>
          </div>
        )}

        {/* NATIJALAR */}
        {tab === 'results' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {stats.length === 0 ? (
              <div style={{
                textAlign: 'center', background: t.bg2,
                border: `1px solid ${t.border}`, borderRadius: '16px', padding: '40px'
              }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📝</div>
                <p style={{ color: t.text2 }}>Hali test yechmadingiz</p>
              </div>
            ) : stats.map((r, i) => (
              <div key={i} style={{
                background: t.bg2, border: `1px solid ${t.border}`,
                borderRadius: '12px', padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: '14px'
              }}>
                <span style={{ fontSize: '26px' }}>{r.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: t.text, fontWeight: '600', fontSize: '14px' }}>
                    {r.subject_name}
                  </div>
                  <div style={{ color: t.text3, fontSize: '12px', marginTop: '2px' }}>
                    {new Date(r.created_at).toLocaleDateString('uz-UZ')}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: '20px', fontWeight: '700',
                    color: r.percentage >= 80 ? '#10B981' : r.percentage >= 50 ? '#F59E0B' : '#EF4444'
                  }}>
                    {r.percentage}%
                  </div>
                  <div style={{ fontSize: '12px', color: t.text3 }}>{r.score}/{r.total}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}