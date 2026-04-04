import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// ===== HIMOYA =====

// Right click o'chirish
document.addEventListener('contextmenu', e => e.preventDefault())

// Keyboard himoya
document.addEventListener('keydown', e => {
  // PrintScreen
  if (e.key === 'PrintScreen') {
    navigator.clipboard?.writeText('').catch(() => {})
    e.preventDefault()
  }
  // Ctrl+P (print)
  if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
    e.preventDefault()
  }
  // Ctrl+U (source ko'rish)
  if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
    e.preventDefault()
  }
  // F12 (DevTools)
  if (e.key === 'F12') {
    e.preventDefault()
  }
  // Ctrl+Shift+I (DevTools)
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
    e.preventDefault()
  }
  // Ctrl+Shift+J (Console)
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'J') {
    e.preventDefault()
  }
  // Ctrl+S (saqlash)
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault()
  }
})

// Print himoya
const printStyle = document.createElement('style')
printStyle.innerHTML = `
  @media print {
    body { display: none !important; }
  }
`
document.head.appendChild(printStyle)

// CSS copy himoya
const selectStyle = document.createElement('style')
selectStyle.innerHTML = `
  * {
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    -ms-user-select: none !important;
    user-select: none !important;
  }
  input, textarea {
    -webkit-user-select: text !important;
    -moz-user-select: text !important;
    user-select: text !important;
  }
`
document.head.appendChild(selectStyle)

// ===== APP =====
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)