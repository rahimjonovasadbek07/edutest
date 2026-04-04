import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { getTheme } from '../context/theme'
import { useNavigate, useLocation } from 'react-router-dom'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const t = getTheme(dark)
  const navigate = useNavigate()
  const location = useLocation()

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      if (!mobile) setMenuOpen(false)
    }

    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const links = [
    { path: '/dashboard', label: '🏠 Bosh sahifa' },
    { path: '/videos', label: '🎬 Videolar' },
    { path: '/results', label: '📊 Natijalar' },
    { path: '/ai', label: '🤖 AI Prognoz' },
    ...(user?.role === 'admin' ? [{ path: '/admin', label: '⚙️ Admin' }] : []),
  ]

  const navButtonStyle = (path) => ({
    padding: isMobile ? '10px 12px' : '7px 14px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: isMobile ? '14px' : '13px',
    fontWeight: '500',
    border: 'none',
    fontFamily: 'inherit',
    transition: 'all .2s',
    background:
      location.pathname === path
        ? dark
          ? 'rgba(79,70,229,0.2)'
          : 'rgba(79,70,229,0.1)'
        : 'transparent',
    color: location.pathname === path ? '#6366F1' : t.text2,
    textAlign: isMobile ? 'left' : 'center',
    width: isMobile ? '100%' : 'auto',
  })

  return (
    <nav
      style={{
        padding: isMobile ? '12px 14px' : '0 28px',
        minHeight: isMobile ? 'auto' : '62px',
        background: dark ? 'rgba(15,23,42,0.97)' : 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${t.border}`,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: dark
          ? '0 1px 20px rgba(0,0,0,0.3)'
          : '0 1px 20px rgba(0,0,0,0.07)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          minHeight: isMobile ? '52px' : '62px',
        }}
      >
        {/* Logo */}
        <div
          onClick={() => navigate('/dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            flexShrink: 0,
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg,#4F46E5,#0D9488)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              flexShrink: 0,
            }}
          >
            🎓
          </div>
          <span
            style={{
              fontSize: isMobile ? '16px' : '18px',
              fontWeight: '800',
              background: 'linear-gradient(135deg,#4F46E5,#0D9488)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              whiteSpace: 'nowrap',
            }}
          >
            EduTest.uz
          </span>
        </div>

        {/* Desktop nav */}
        {!isMobile && (
          <>
            <div style={{ display: 'flex', gap: '2px', alignItems: 'center', flexWrap: 'wrap' }}>
              {links.map((l) => (
                <button
                  key={l.path}
                  onClick={() => navigate(l.path)}
                  style={navButtonStyle(l.path)}
                >
                  {l.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <button
                onClick={toggle}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  border: `1px solid ${t.border}`,
                  background: t.bg3,
                  cursor: 'pointer',
                  fontSize: '17px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all .2s',
                }}
              >
                {dark ? '☀️' : '🌙'}
              </button>

              <div
                onClick={() => navigate('/profile')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  background:
                    location.pathname === '/profile'
                      ? dark
                        ? 'rgba(79,70,229,0.2)'
                        : 'rgba(79,70,229,0.1)'
                      : t.bg3,
                  border: `1px solid ${
                    location.pathname === '/profile' ? 'rgba(99,102,241,0.4)' : t.border
                  }`,
                  cursor: 'pointer',
                  transition: 'all .2s',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg,#4F46E5,#8B5CF6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#fff',
                  }}
                >
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: '500',
                    color: t.text,
                    maxWidth: '100px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user?.name?.split(' ')[0]}
                </span>
              </div>

              <button
                onClick={() => {
                  logout()
                  navigate('/')
                }}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500',
                  border: 'none',
                  fontFamily: 'inherit',
                  transition: 'all .2s',
                  background: 'rgba(239,68,68,0.12)',
                  color: '#EF4444',
                }}
              >
                Chiqish
              </button>
            </div>
          </>
        )}

        {/* Mobile right */}
        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={toggle}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                border: `1px solid ${t.border}`,
                background: t.bg3,
                cursor: 'pointer',
                fontSize: '17px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {dark ? '☀️' : '🌙'}
            </button>

            <button
              onClick={() => setMenuOpen((v) => !v)}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                border: `1px solid ${t.border}`,
                background: t.bg3,
                cursor: 'pointer',
                fontSize: '18px',
                color: t.text,
              }}
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {isMobile && menuOpen && (
        <div
          style={{
            marginTop: '10px',
            paddingTop: '10px',
            borderTop: `1px solid ${t.border}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {links.map((l) => (
            <button
              key={l.path}
              onClick={() => {
                navigate(l.path)
                setMenuOpen(false)
              }}
              style={navButtonStyle(l.path)}
            >
              {l.label}
            </button>
          ))}

          <div
            onClick={() => {
              navigate('/profile')
              setMenuOpen(false)
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '10px',
              background:
                location.pathname === '/profile'
                  ? dark
                    ? 'rgba(79,70,229,0.2)'
                    : 'rgba(79,70,229,0.1)'
                  : t.bg3,
              border: `1px solid ${
                location.pathname === '/profile' ? 'rgba(99,102,241,0.4)' : t.border
              }`,
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg,#4F46E5,#8B5CF6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '700',
                color: '#fff',
                flexShrink: 0,
              }}
            >
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <span
              style={{
                fontSize: '14px',
                fontWeight: '500',
                color: t.text,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.name}
            </span>
          </div>

          <button
            onClick={() => {
              logout()
              navigate('/')
              setMenuOpen(false)
            }}
            style={{
              padding: '10px 12px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              border: 'none',
              fontFamily: 'inherit',
              background: 'rgba(239,68,68,0.12)',
              color: '#EF4444',
              textAlign: 'left',
            }}
          >
            🚪 Chiqish
          </button>
        </div>
      )}
    </nav>
  )
}