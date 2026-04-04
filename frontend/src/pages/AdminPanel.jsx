import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { getTheme } from '../context/theme'
import Navbar from '../components/Navbar'
import axios from 'axios'

export default function AdminPanel() {
  const { token } = useAuth()
  const { dark } = useTheme()
  const t = getTheme(dark)

  const [users, setUsers] = useState([])
  const [subjects, setSubjects] = useState([])
  const [tests, setTests] = useState([])
  const [videos, setVideos] = useState([])
  const [tab, setTab] = useState('tests')
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState('success')
  const [uploading, setUploading] = useState(false)
  const [newSubject, setNewSubject] = useState({ name: '', emoji: '' })
  const [newVideo, setNewVideo] = useState({
    subject_id: '',
    title: '',
    description: '',
    video_url: '',
    duration: ''
  })
  const [videoType, setVideoType] = useState('url')
  const [videoFile, setVideoFile] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const h = { headers: { Authorization: `Bearer ${token}` } }

  const showMsg = (text, type = 'success') => {
    setMsg(text)
    setMsgType(type)
    setTimeout(() => setMsg(''), 3500)
  }

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    try {
      const [u, s, te, vi] = await Promise.all([
        axios.get('https://edutest-backend-x2qf.onrender.com/api/admin/users', h),
        axios.get('https://edutest-backend-x2qf.onrender.com/api/subjects', h),
        axios.get('https://edutest-backend-x2qf.onrender.com/api/admin/tests', h),
        axios.get('https://edutest-backend-x2qf.onrender.com/api/admin/videos', h),
      ])
      setUsers(u.data)
      setSubjects(s.data)
      setTests(te.data)
      setVideos(vi.data)
    } catch (e) {
      showMsg('❌ Maʼlumotlarni yuklashda xato', 'error')
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await axios.post(
        'https://edutest-backend-x2qf.onrender.com/api/admin/upload-tests',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      showMsg('✅ ' + res.data.message)
      loadAll()
    } catch (e) {
      showMsg('❌ ' + (e.response?.data?.error || 'Xato'), 'error')
    }

    setUploading(false)
    e.target.value = ''
  }

  const deleteTest = async (id) => {
    if (!confirm("Bu testni o'chirilsinmi?")) return
    try {
      await axios.delete(`https://edutest-backend-x2qf.onrender.com/api/admin/tests/${id}`, h)
      setTests(tests.filter(t => t.id !== id))
      showMsg("✅ Test o'chirildi")
    } catch (e) {
      showMsg('❌ Xato', 'error')
    }
  }

  const deleteVideo = async (id) => {
    if (!confirm("Bu videoni o'chirilsinmi?")) return
    try {
      await axios.delete(`https://edutest-backend-x2qf.onrender.com/api/admin/videos/${id}`, h)
      setVideos(videos.filter(v => v.id !== id))
      showMsg("✅ Video o'chirildi")
    } catch (e) {
      showMsg('❌ Xato', 'error')
    }
  }

  const deleteSubject = async (id, name) => {
    if (!confirm(`"${name}" fanini o'chirishni tasdiqlaysizmi?\n⚠️ Unga bog'liq barcha test, video va natijalar ham o'chadi!`)) return
    try {
      await axios.delete(`https://edutest-backend-x2qf.onrender.com/api/admin/subjects/${id}`, h)
      setSubjects(subjects.filter(s => s.id !== id))
      setTests(tests.filter(t => t.subject_id !== id))
      setVideos(videos.filter(v => v.subject_id !== id))
      showMsg("✅ Fan o'chirildi!")
    } catch (e) {
      showMsg('❌ Xato', 'error')
    }
  }

  const handleAddSubject = async () => {
    if (!newSubject.name) {
      showMsg('❌ Fan nomi kiriting!', 'error')
      return
    }

    try {
      const res = await axios.post(
        'https://edutest-backend-x2qf.onrender.com/api/admin/subjects',
        newSubject,
        h
      )
      setSubjects([...subjects, res.data])
      setNewSubject({ name: '', emoji: '' })
      showMsg("✅ Fan qo'shildi!")
    } catch (e) {
      showMsg('❌ Xato', 'error')
    }
  }

  const handleAddVideo = async () => {
    if (!newVideo.title || !newVideo.subject_id) {
      showMsg('❌ Fan va sarlavha majburiy!', 'error')
      return
    }

    if (videoType === 'url' && !newVideo.video_url) {
      showMsg('❌ YouTube URL kiriting!', 'error')
      return
    }

    if (videoType === 'file' && !videoFile) {
      showMsg('❌ Video fayl tanlang!', 'error')
      return
    }

    try {
      const formData = new FormData()
      formData.append('subject_id', newVideo.subject_id)
      formData.append('title', newVideo.title)
      formData.append('description', newVideo.description)
      formData.append('duration', newVideo.duration)

      if (videoType === 'url') {
        formData.append('video_url', newVideo.video_url)
      } else {
        formData.append('videoFile', videoFile)
        formData.append('video_url', '')
      }

      const res = await axios.post(
        'https://edutest-backend-x2qf.onrender.com/api/admin/videos',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      setVideos([res.data, ...videos])
      setNewVideo({
        subject_id: '',
        title: '',
        description: '',
        video_url: '',
        duration: ''
      })
      setVideoFile(null)
      setVideoType('url')
      showMsg("✅ Video qo'shildi!")
    } catch (e) {
      showMsg('❌ ' + (e.response?.data?.error || 'Xato'), 'error')
    }
  }

  const inp = {
    padding: '10px 14px',
    background: t.bg,
    border: `1px solid ${t.border}`,
    borderRadius: '10px',
    color: t.text,
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
    width: '100%',
    boxSizing: 'border-box'
  }

  const tabs = [
    { id: 'tests', label: '📄 Testlar', count: tests.length },
    { id: 'videos', label: '🎬 Videolar', count: videos.length },
    { id: 'subjects', label: '📚 Fanlar', count: subjects.length },
    { id: 'users', label: '👥 Foydalanuvchilar', count: users.length },
  ]

  return (
    <div style={{ background: t.bg, minHeight: '100vh', transition: 'all .3s' }}>
      <Navbar />

      <div
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
          padding: isMobile ? '20px 14px' : '32px 24px'
        }}
      >
        <h1
          style={{
            color: t.text,
            fontSize: isMobile ? '22px' : '26px',
            fontWeight: '800',
            marginBottom: '24px'
          }}
        >
          ⚙️ Admin Panel
        </h1>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '24px',
            flexWrap: isMobile ? 'nowrap' : 'wrap',
            overflowX: isMobile ? 'auto' : 'visible',
            paddingBottom: isMobile ? '6px' : '0',
            scrollbarWidth: 'none'
          }}
        >
          {tabs.map(tb => (
            <button
              key={tb.id}
              onClick={() => {
                setTab(tb.id)
                setMsg('')
              }}
              style={{
                padding: '10px 18px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                fontFamily: 'inherit',
                background: tab === tb.id
                  ? 'linear-gradient(135deg,#4F46E5,#6366F1)'
                  : t.bg2,
                color: tab === tb.id ? '#fff' : t.text2,
                border: `1px solid ${tab === tb.id ? 'transparent' : t.border}`,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all .2s',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              {tb.label}
              <span
                style={{
                  background: tab === tb.id ? 'rgba(255,255,255,0.25)' : t.bg3,
                  color: tab === tb.id ? '#fff' : t.text3,
                  borderRadius: '20px',
                  padding: '1px 8px',
                  fontSize: '12px'
                }}
              >
                {tb.count}
              </span>
            </button>
          ))}
        </div>

        {/* Message */}
        {msg && (
          <div
            style={{
              background: msgType === 'success'
                ? 'rgba(16,185,129,0.12)'
                : 'rgba(239,68,68,0.12)',
              border: `1px solid ${msgType === 'success'
                ? 'rgba(16,185,129,0.3)'
                : 'rgba(239,68,68,0.3)'}`,
              borderRadius: '10px',
              padding: '12px 16px',
              color: msgType === 'success' ? '#10B981' : '#EF4444',
              marginBottom: '20px',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {msg}
          </div>
        )}

        {/* TESTLAR */}
        {tab === 'tests' && (
          <div>
            <div
              style={{
                background: t.bg2,
                border: `1px solid ${t.border}`,
                borderRadius: '16px',
                padding: isMobile ? '18px' : '24px',
                marginBottom: '16px'
              }}
            >
              <h3
                style={{
                  color: t.text,
                  fontSize: '16px',
                  fontWeight: '700',
                  marginBottom: '8px'
                }}
              >
                📊 Excel fayl orqali testlarni yuklash
              </h3>

              <p
                style={{
                  color: t.text2,
                  fontSize: '13px',
                  marginBottom: '16px',
                  lineHeight: 1.5
                }}
              >
                Ustunlar:{' '}
                <span style={{ color: '#6366F1', fontWeight: '600' }}>
                  subject_id, question, option_a, option_b, option_c, option_d, correct_answer
                </span>
              </p>

              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '11px 24px',
                  background: uploading ? t.bg3 : 'linear-gradient(135deg,#4F46E5,#6366F1)',
                  borderRadius: '10px',
                  color: uploading ? t.text2 : '#fff',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                {uploading ? '⏳ Yuklanmoqda...' : '📁 Excel fayl tanlash'}
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  disabled={uploading}
                />
              </label>
            </div>

            <div
              style={{
                background: t.bg2,
                border: `1px solid ${t.border}`,
                borderRadius: '16px',
                overflow: 'hidden'
              }}
            >
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${t.border}` }}>
                <h3 style={{ color: t.text, fontSize: '15px', fontWeight: '700' }}>
                  Jami: {tests.length} ta test
                </h3>
              </div>

              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {tests.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: t.text3 }}>
                    Testlar yo'q — Excel fayl yuklang
                  </div>
                ) : tests.map((test, i) => (
                  <div
                    key={test.id}
                    style={{
                      padding: '14px 20px',
                      borderBottom: `1px solid ${t.border}33`,
                      display: 'flex',
                      alignItems: isMobile ? 'flex-start' : 'center',
                      flexDirection: isMobile ? 'column' : 'row',
                      gap: '12px',
                      background: i % 2 === 0 ? 'transparent' : t.bg3 + '22'
                    }}
                  >
                    <span style={{ fontSize: '18px', flexShrink: 0 }}>{test.emoji}</span>

                    <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
                      <div
                        style={{
                          color: t.text,
                          fontSize: '13px',
                          fontWeight: '500',
                          marginBottom: '3px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: isMobile ? 'normal' : 'nowrap',
                          lineHeight: 1.4
                        }}
                      >
                        {test.question}
                      </div>

                      <div style={{ color: t.text3, fontSize: '11px', lineHeight: 1.5 }}>
                        {test.subject_name} • A:{test.option_a} | B:{test.option_b} | C:{test.option_c} | D:{test.option_d} •
                        To'g'ri:{' '}
                        <span style={{ color: '#10B981', fontWeight: '700' }}>
                          {test.correct_answer}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteTest(test.id)}
                      style={{
                        padding: '6px 12px',
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        borderRadius: '8px',
                        color: '#EF4444',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontFamily: 'inherit',
                        flexShrink: 0,
                        alignSelf: isMobile ? 'flex-end' : 'center'
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIDEOLAR */}
        {tab === 'videos' && (
          <div>
            <div
              style={{
                background: t.bg2,
                border: `1px solid ${t.border}`,
                borderRadius: '16px',
                padding: isMobile ? '18px' : '24px',
                marginBottom: '16px'
              }}
            >
              <h3
                style={{
                  color: t.text,
                  fontSize: '16px',
                  fontWeight: '700',
                  marginBottom: '16px'
                }}
              >
                ➕ Yangi video qo'shish
              </h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: '12px',
                  marginBottom: '12px'
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      color: t.text3,
                      marginBottom: '5px',
                      fontWeight: '600'
                    }}
                  >
                    FAN *
                  </label>
                  <select
                    value={newVideo.subject_id}
                    onChange={e => setNewVideo({ ...newVideo, subject_id: e.target.value })}
                    style={inp}
                  >
                    <option value="">Fan tanlang</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.emoji} {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      color: t.text3,
                      marginBottom: '5px',
                      fontWeight: '600'
                    }}
                  >
                    DAVOMIYLIGI
                  </label>
                  <input
                    placeholder="10:30"
                    value={newVideo.duration}
                    onChange={e => setNewVideo({ ...newVideo, duration: e.target.value })}
                    style={inp}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    color: t.text3,
                    marginBottom: '5px',
                    fontWeight: '600'
                  }}
                >
                  SARLAVHA *
                </label>
                <input
                  placeholder="Video sarlavhasi"
                  value={newVideo.title}
                  onChange={e => setNewVideo({ ...newVideo, title: e.target.value })}
                  style={inp}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    color: t.text3,
                    marginBottom: '5px',
                    fontWeight: '600'
                  }}
                >
                  TAVSIF
                </label>
                <input
                  placeholder="Qisqa tavsif"
                  value={newVideo.description}
                  onChange={e => setNewVideo({ ...newVideo, description: e.target.value })}
                  style={inp}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    color: t.text3,
                    marginBottom: '8px',
                    fontWeight: '600'
                  }}
                >
                  VIDEO MANBAI *
                </label>

                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '10px',
                    flexDirection: isMobile ? 'column' : 'row'
                  }}
                >
                  {[
                    { id: 'url', label: '🔗 YouTube URL' },
                    { id: 'file', label: '📁 Fayl yuklash' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setVideoType(opt.id)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600',
                        fontFamily: 'inherit',
                        border: `1px solid ${videoType === opt.id ? 'transparent' : t.border}`,
                        background: videoType === opt.id
                          ? 'linear-gradient(135deg,#4F46E5,#6366F1)'
                          : t.bg3,
                        color: videoType === opt.id ? '#fff' : t.text2,
                        transition: 'all .2s'
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {videoType === 'url' ? (
                  <input
                    placeholder="https://www.youtube.com/embed/VIDEO_ID"
                    value={newVideo.video_url}
                    onChange={e => setNewVideo({ ...newVideo, video_url: e.target.value })}
                    style={inp}
                  />
                ) : (
                  <div>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        padding: '18px',
                        border: `2px dashed ${videoFile ? '#10B981' : t.border}`,
                        borderRadius: '10px',
                        cursor: 'pointer',
                        background: videoFile ? 'rgba(16,185,129,0.05)' : t.bg3,
                        transition: 'all .2s',
                        textAlign: 'center'
                      }}
                    >
                      <span style={{ fontSize: '24px' }}>
                        {videoFile ? '✅' : '📁'}
                      </span>
                      <span
                        style={{
                          color: videoFile ? '#10B981' : t.text2,
                          fontSize: '14px',
                          lineHeight: 1.4
                        }}
                      >
                        {videoFile ? videoFile.name : 'Video fayl tanlang (MP4, WebM, AVI)'}
                      </span>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={e => setVideoFile(e.target.files[0])}
                        style={{ display: 'none' }}
                      />
                    </label>

                    {videoFile && (
                      <div style={{ marginTop: '6px', fontSize: '12px', color: t.text3 }}>
                        Hajm: {(videoFile.size / 1024 / 1024).toFixed(1)} MB
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={handleAddVideo}
                style={{
                  width: isMobile ? '100%' : 'auto',
                  padding: '12px 28px',
                  background: 'linear-gradient(135deg,#4F46E5,#6366F1)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  fontFamily: 'inherit',
                  boxShadow: '0 4px 14px rgba(79,70,229,0.3)'
                }}
              >
                ➕ Video qo'shish
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {videos.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: t.text3,
                    background: t.bg2,
                    border: `1px solid ${t.border}`,
                    borderRadius: '12px'
                  }}
                >
                  Videolar yo'q
                </div>
              ) : videos.map(v => (
                <div
                  key={v.id}
                  style={{
                    background: t.bg2,
                    border: `1px solid ${t.border}`,
                    borderRadius: '12px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: '14px'
                  }}
                >
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg,rgba(79,70,229,0.2),rgba(13,148,136,0.15))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '22px',
                      flexShrink: 0
                    }}
                  >
                    {v.video_url?.startsWith('/uploads') ? '📁' : '▶'}
                  </div>

                  <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
                    <div
                      style={{
                        color: t.text,
                        fontWeight: '600',
                        fontSize: '14px',
                        marginBottom: '3px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: isMobile ? 'normal' : 'nowrap'
                      }}
                    >
                      {v.title}
                    </div>

                    <div style={{ color: t.text3, fontSize: '12px', lineHeight: 1.5 }}>
                      {v.emoji} {v.subject_name} • {v.duration || '--:--'} •{' '}
                      <span
                        style={{
                          color: v.video_url?.startsWith('/uploads') ? '#10B981' : '#6366F1'
                        }}
                      >
                        {v.video_url?.startsWith('/uploads') ? '📁 Fayl' : '🔗 YouTube'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteVideo(v.id)}
                    style={{
                      padding: '7px 14px',
                      background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.2)',
                      borderRadius: '8px',
                      color: '#EF4444',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontFamily: 'inherit',
                      flexShrink: 0,
                      width: isMobile ? '100%' : 'auto'
                    }}
                  >
                    🗑️ O'chirish
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FANLAR */}
        {tab === 'subjects' && (
          <div>
            <div
              style={{
                background: t.bg2,
                border: `1px solid ${t.border}`,
                borderRadius: '16px',
                padding: isMobile ? '18px' : '24px',
                marginBottom: '16px'
              }}
            >
              <h3
                style={{
                  color: t.text,
                  fontSize: '16px',
                  fontWeight: '700',
                  marginBottom: '16px'
                }}
              >
                Yangi fan qo'shish
              </h3>

              <div style={{ display: 'flex', gap: '10px', flexDirection: isMobile ? 'column' : 'row' }}>
                <input
                  placeholder="Fan nomi"
                  value={newSubject.name}
                  onChange={e => setNewSubject({ ...newSubject, name: e.target.value })}
                  style={{ ...inp, flex: 1 }}
                />

                <input
                  placeholder="😀"
                  value={newSubject.emoji}
                  onChange={e => setNewSubject({ ...newSubject, emoji: e.target.value })}
                  style={{
                    ...inp,
                    width: isMobile ? '100%' : '70px',
                    textAlign: 'center',
                    fontSize: '20px'
                  }}
                />

                <button
                  onClick={handleAddSubject}
                  style={{
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg,#4F46E5,#6366F1)',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    fontFamily: 'inherit',
                    whiteSpace: 'nowrap',
                    width: isMobile ? '100%' : 'auto'
                  }}
                >
                  ➕ Qo'shish
                </button>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)',
                gap: '12px'
              }}
            >
              {subjects.map(s => (
                <div
                  key={s.id}
                  style={{
                    background: t.bg2,
                    border: `1px solid ${t.border}`,
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '32px' }}>{s.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: t.text, fontWeight: '700', fontSize: '15px' }}>
                        {s.name}
                      </div>
                      <div style={{ color: t.text3, fontSize: '11px', marginTop: '3px' }}>
                        ID: {s.id}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      padding: '10px',
                      background: t.bg3,
                      borderRadius: '8px',
                      justifyContent: 'space-around'
                    }}
                  >
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: t.text, fontWeight: '700', fontSize: '16px' }}>
                        {tests.filter(te => te.subject_id == s.id).length}
                      </div>
                      <div style={{ color: t.text3, fontSize: '10px' }}>test</div>
                    </div>

                    <div style={{ width: '1px', background: t.border }} />

                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: t.text, fontWeight: '700', fontSize: '16px' }}>
                        {videos.filter(v => v.subject_id == s.id).length}
                      </div>
                      <div style={{ color: t.text3, fontSize: '10px' }}>video</div>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteSubject(s.id, s.name)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      background: 'rgba(239,68,68,0.08)',
                      border: '1px solid rgba(239,68,68,0.2)',
                      borderRadius: '8px',
                      color: '#EF4444',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '600',
                      fontFamily: 'inherit',
                      transition: 'all .2s'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(239,68,68,0.15)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(239,68,68,0.08)'
                    }}
                  >
                    🗑️ Fanni o'chirish
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FOYDALANUVCHILAR */}
        {tab === 'users' && (
          <div
            style={{
              background: t.bg2,
              border: `1px solid ${t.border}`,
              borderRadius: '16px',
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${t.border}` }}>
              <h3 style={{ color: t.text, fontSize: '15px', fontWeight: '700' }}>
                Jami: {users.length} ta foydalanuvchi
              </h3>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                <thead>
                  <tr style={{ background: t.bg3 }}>
                    {['#', 'Ism', 'Email', 'Telefon', 'Role', 'Sana'].map(col => (
                      <th
                        key={col}
                        style={{
                          padding: '12px 16px',
                          textAlign: 'left',
                          color: t.text3,
                          fontSize: '12px',
                          fontWeight: '600',
                          borderBottom: `1px solid ${t.border}`
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id} style={{ borderBottom: `1px solid ${t.border}33` }}>
                      <td style={{ padding: '12px 16px', color: t.text3, fontSize: '13px' }}>{i + 1}</td>
                      <td style={{ padding: '12px 16px', color: t.text, fontSize: '14px', fontWeight: '500' }}>{u.name}</td>
                      <td style={{ padding: '12px 16px', color: t.text2, fontSize: '13px' }}>{u.email}</td>
                      <td style={{ padding: '12px 16px', color: t.text2, fontSize: '13px' }}>{u.phone}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: '600',
                            background: u.role === 'admin'
                              ? 'rgba(79,70,229,0.15)'
                              : 'rgba(16,185,129,0.12)',
                            color: u.role === 'admin' ? '#6366F1' : '#10B981'
                          }}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: t.text3, fontSize: '12px' }}>
                        {new Date(u.created_at).toLocaleDateString('uz-UZ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}