import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { getTheme } from '../context/theme'
import Navbar from '../components/Navbar'
import axios from 'axios'

export default function Videos() {
  const [videos, setVideos] = useState([])
  const [subjects, setSubjects] = useState([])
  const [selected, setSelected] = useState(null)
  const [activeSubject, setActiveSubject] = useState('all')
  const [loading, setLoading] = useState(true)
  const { token } = useAuth()
  const { dark } = useTheme()
  const t = getTheme(dark)

  useEffect(() => {
    axios.get('https://edutest-backend-x2qf.onrender.com/api/videos', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => { setVideos(res.data); setLoading(false) })

    axios.get('https://edutest-backend-x2qf.onrender.com/api/subjects', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setSubjects(res.data))
  }, [])

  const filtered = activeSubject === 'all'
    ? videos
    : videos.filter(v => v.subject_id == activeSubject)

  const isYoutube = (url) => url && (url.includes('youtube') || url.includes('youtu.be'))

  return (
    <div style={{background:t.bg, minHeight:'100vh', transition:'all .3s'}}>
      <Navbar />
      <div style={{maxWidth:'1000px', margin:'0 auto', padding:'32px 24px'}}>
        <h1 style={{color:t.text, fontSize:'24px', fontWeight:'800', marginBottom:'6px'}}>
          🎬 Videodarslar
        </h1>
        <p style={{color:t.text2, marginBottom:'28px'}}>Fan bo'yicha o'quv videolari</p>

        {/* Filter */}
        <div style={{display:'flex', gap:'8px', marginBottom:'24px', flexWrap:'wrap'}}>
          {[{id:'all', name:'Hammasi', emoji:'🎬'}, ...subjects].map(s => (
            <button key={s.id}
              onClick={() => { setActiveSubject(s.id); setSelected(null) }}
              style={{
                padding:'8px 18px', borderRadius:'20px', cursor:'pointer',
                fontSize:'13px', fontWeight:'600', fontFamily:'inherit',
                border: `1px solid ${activeSubject==s.id ? 'transparent' : t.border}`,
                background: activeSubject==s.id
                  ? 'linear-gradient(135deg,#4F46E5,#6366F1)'
                  : t.bg2,
                color: activeSubject==s.id ? '#fff' : t.text2,
                transition:'all .2s'
              }}>
              {s.emoji} {s.name}
            </button>
          ))}
        </div>

        {/* Video player */}
        {selected && (
          <div style={{background:t.bg2, border:`1px solid ${t.border}`,
            borderRadius:'20px', overflow:'hidden', marginBottom:'24px',
            boxShadow:'0 8px 32px rgba(0,0,0,0.15)'}}>
            <div style={{position:'relative', paddingBottom:'56.25%', background:'#000'}}>
              {isYoutube(selected.video_url) ? (
                <iframe
                  src={selected.video_url}
                  style={{position:'absolute', top:0, left:0, width:'100%', height:'100%', border:'none'}}
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                  title={selected.title}
                />
              ) : (
                <video
                  src={`https://edutest-backend-x2qf.onrender.com${selected.video_url}`}
                  controls
                  autoPlay
                  style={{position:'absolute', top:0, left:0, width:'100%', height:'100%'}}
                />
              )}
            </div>
            <div style={{padding:'20px 24px', display:'flex',
              justifyContent:'space-between', alignItems:'center'}}>
              <div>
                <h3 style={{color:t.text, fontSize:'17px', fontWeight:'700', marginBottom:'4px'}}>
                  {selected.title}
                </h3>
                <p style={{color:t.text2, fontSize:'13px'}}>{selected.description}</p>
              </div>
              <button onClick={() => setSelected(null)}
                style={{padding:'8px 16px', background:t.bg3,
                  border:`1px solid ${t.border}`, borderRadius:'10px',
                  color:t.text2, cursor:'pointer', fontSize:'13px', fontFamily:'inherit',
                  flexShrink:0, marginLeft:'16px'}}>
                ✕ Yopish
              </button>
            </div>
          </div>
        )}

        {/* Videos grid */}
        {loading ? (
          <div style={{textAlign:'center', color:t.text2, marginTop:'60px', fontSize:'16px'}}>
            Yuklanmoqda...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{textAlign:'center', background:t.bg2,
            border:`1px solid ${t.border}`, borderRadius:'16px', padding:'60px'}}>
            <div style={{fontSize:'48px', marginBottom:'16px'}}>🎬</div>
            <p style={{color:t.text2}}>Bu bo'limda hali videolar yo'q</p>
          </div>
        ) : (
          <div style={{display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'16px'}}>
            {filtered.map(v => (
              <div key={v.id} onClick={() => setSelected(v)}
                style={{
                  background:t.bg2,
                  border:`1px solid ${selected?.id===v.id ? '#4F46E5' : t.border}`,
                  borderRadius:'16px', overflow:'hidden', cursor:'pointer',
                  transition:'all .25s',
                  boxShadow: selected?.id===v.id ? '0 0 0 2px rgba(79,70,229,0.3)' : 'none'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(79,70,229,0.15)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = selected?.id===v.id
                    ? '0 0 0 2px rgba(79,70,229,0.3)' : 'none'
                }}>
                {/* Thumbnail */}
                <div style={{position:'relative', paddingBottom:'56.25%',
                  background: dark ? '#0F172A' : '#1E293B'}}>
                  <div style={{position:'absolute', inset:0, display:'flex',
                    alignItems:'center', justifyContent:'center',
                    background:'linear-gradient(135deg,rgba(79,70,229,0.25),rgba(13,148,136,0.15))'}}>
                    {isYoutube(v.video_url) ? (
                      <img
                        src={`https://img.youtube.com/vi/${getYoutubeId(v.video_url)}/hqdefault.jpg`}
                        style={{position:'absolute', inset:0, width:'100%', height:'100%',
                          objectFit:'cover', opacity:0.7}}
                        onError={e => e.target.style.display='none'}
                        alt={v.title}
                      />
                    ) : null}
                    <div style={{position:'relative', zIndex:1,
                      width:'56px', height:'56px', borderRadius:'50%',
                      background:'rgba(255,255,255,0.2)',
                      backdropFilter:'blur(8px)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      border:'2px solid rgba(255,255,255,0.4)'}}>
                      <span style={{fontSize:'22px', marginLeft:'4px', color:'#fff'}}>▶</span>
                    </div>
                  </div>
                  <div style={{position:'absolute', bottom:'10px', right:'10px',
                    background:'rgba(0,0,0,0.75)', borderRadius:'6px',
                    padding:'3px 8px', fontSize:'11px', color:'#fff', fontWeight:'600'}}>
                    {v.duration || '--:--'}
                  </div>
                  <div style={{position:'absolute', top:'10px', left:'10px'}}>
                    <span style={{background:'rgba(79,70,229,0.85)',
                      borderRadius:'6px', padding:'3px 8px',
                      fontSize:'11px', color:'#fff', fontWeight:'600'}}>
                      {v.emoji} {v.subject_name}
                    </span>
                  </div>
                  {!isYoutube(v.video_url) && (
                    <div style={{position:'absolute', top:'10px', right:'10px'}}>
                      <span style={{background:'rgba(16,185,129,0.85)',
                        borderRadius:'6px', padding:'3px 8px',
                        fontSize:'11px', color:'#fff', fontWeight:'600'}}>
                        📁 Fayl
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div style={{padding:'16px'}}>
                  <h3 style={{color:t.text, fontSize:'15px', fontWeight:'600',
                    marginBottom:'6px', overflow:'hidden',
                    textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                    {v.title}
                  </h3>
                  <p style={{color:t.text2, fontSize:'12px', lineHeight:'1.5',
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                    {v.description || '—'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function getYoutubeId(url) {
  if (!url) return ''
  const match = url.match(/embed\/([^?&]+)/) ||
                url.match(/v=([^&]+)/) ||
                url.match(/youtu\.be\/([^?]+)/)
  return match ? match[1] : ''
}