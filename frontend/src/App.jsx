import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import PrivateRoute from './components/PrivateRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import TestPage from './pages/TestPage'
import Results from './pages/Results'
import AdminPanel from './pages/AdminPanel'
import AiPrognoz from './pages/AiPrognoz'
import Videos from './pages/Videos'
import Profile from './pages/Profile'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={
              <PrivateRoute><Dashboard /></PrivateRoute>
            } />
            <Route path="/test/:subjectId" element={
              <PrivateRoute><TestPage /></PrivateRoute>
            } />
            <Route path="/results" element={
              <PrivateRoute><Results /></PrivateRoute>
            } />
            <Route path="/ai" element={
              <PrivateRoute><AiPrognoz /></PrivateRoute>
            } />
            <Route path="/videos" element={
              <PrivateRoute><Videos /></PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute><Profile /></PrivateRoute>
            } />
            <Route path="/admin" element={
              <PrivateRoute adminOnly><AdminPanel /></PrivateRoute>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}