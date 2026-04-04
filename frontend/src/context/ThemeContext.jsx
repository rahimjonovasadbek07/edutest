import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('theme') !== 'light'
  })

  useEffect(() => {
    document.body.style.background = dark ? '#0F172A' : '#F8FAFC'
    document.body.style.color = dark ? '#F1F5F9' : '#0F172A'
    document.body.style.transition = 'all 0.3s'
  }, [dark])

  const toggle = () => {
    setDark(prev => {
      localStorage.setItem('theme', prev ? 'light' : 'dark')
      return !prev
    })
  }

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)