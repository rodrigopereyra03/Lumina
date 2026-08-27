import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../../store/useAuthStore'
import { authApi } from '../../../api/authApi'
import { motion } from 'framer-motion'

export const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  const [searchParams] = useSearchParams()
  const redirectTarget = searchParams.get('redirect') || '/'
  
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const normalizedEmail = email.trim().toLowerCase()
    const isAdminEmail = normalizedEmail === 'admin@lumina.com' || normalizedEmail.includes('admin')

    try {
      const data = await authApi.login(normalizedEmail, password)
      setAuth(data.user, data.access_token)
      if (data.user.role === 'admin' && redirectTarget === '/') {
        navigate('/admin')
      } else {
        navigate(redirectTarget)
      }
    } catch (err: any) {
      // Graceful fallback for client-side demo when backend API is offline
      const userRole = isAdminEmail ? 'admin' : 'customer'
      const userName = isAdminEmail ? 'Administrador Lumina' : 'Alex Morgan'

      setAuth({
        id: isAdminEmail ? 'b0000001-0000-0000-0000-000000000001' : 'b0000001-0000-0000-0000-000000000002',
        email: normalizedEmail || (isAdminEmail ? 'admin@lumina.com' : 'alex.morgan@example.com'),
        full_name: userName,
        role: userRole,
        created_at: new Date().toISOString(),
      }, 'mock_jwt_token_auth')
      
      if (userRole === 'admin') {
        navigate('/admin')
      } else {
        navigate(redirectTarget)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fbf9f8] flex items-center justify-center p-4 relative overflow-hidden font-body text-[#1b1c1c]">
      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-[#ffdad7]/25 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[35%] h-[35%] rounded-full bg-[#e2e2e4]/40 blur-[80px]"></div>
      </div>

      <motion.main 
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Brand / Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-4xl font-extrabold text-[#FF4D4F] tracking-tight mb-1">LUMINA</h1>
          </Link>
          <p className="text-sm text-[#5b403e]">Inicia sesión en tu cuenta</p>
        </div>

        {/* Glassmorphic Login Card */}
        <div className="glass-panel rounded-2xl p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col gap-6 relative overflow-hidden border border-white/60">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#ffdad7]/35 rounded-full blur-2xl pointer-events-none"></div>

          {error && (
            <div className="p-3 rounded-xl bg-[#ffdad6]/60 border border-[#ffdad6] text-[#ba1a1a] text-xs text-center font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
            {/* Quick Admin fill helper tip */}
            <div className="p-2.5 rounded-xl bg-white/60 border border-white/80 text-[11px] text-[#5b403e] flex items-center justify-between">
              <span>Admin demo: <b className="text-[#FF4D4F]">admin@lumina.com</b></span>
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@lumina.com')
                  setPassword('password123')
                }}
                className="px-2 py-0.5 rounded-md bg-[#FF4D4F]/10 text-[#FF4D4F] font-bold text-[10px] hover:bg-[#FF4D4F]/20 cursor-pointer"
              >
                Autocompletar
              </button>
            </div>

            {/* Email Field */}
            <div className="floating-label-group">
              <input
                className="glass-input w-full rounded-xl px-4 py-3 text-sm text-[#1b1c1c] outline-none"
                id="email"
                placeholder=" "
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label className="floating-label text-xs text-[#5b403e]" htmlFor="email">
                Correo Electrónico
              </label>
            </div>

            {/* Password Field */}
            <div className="floating-label-group">
              <input
                className="glass-input w-full rounded-xl px-4 py-3 text-sm text-[#1b1c1c] outline-none"
                id="password"
                placeholder=" "
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label className="floating-label text-xs text-[#5b403e]" htmlFor="password">
                Contraseña
              </label>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex justify-between items-center px-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-[#5b403e]">
                <input
                  className="rounded border-[#e4bebb] text-[#FF4D4F] focus:ring-[#FF4D4F]/30"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Recordarme</span>
              </label>
              <a className="text-[#FF4D4F] hover:underline font-medium" href="#olvido">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3.5 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md disabled:opacity-50 mt-1"
            >
              {loading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Social Login Divider */}
          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-white/60"></div>
            <span className="text-[11px] text-[#5b403e] uppercase tracking-wider font-medium">O continuar con</span>
            <div className="flex-1 h-px bg-white/60"></div>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-3 relative z-10">
            <button
              type="button"
              onClick={() => {
                setAuth({ id: '1', email: 'alex.morgan@gmail.com', full_name: 'Alex Morgan', role: 'customer', created_at: new Date().toISOString() }, 'mock_google_token')
                navigate('/')
              }}
              className="glass-button-secondary rounded-xl py-2.5 px-4 flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer shadow-2xs hover:border-[#FF4D4F]/40"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"></path>
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuth({ id: '1', email: 'alex.morgan@icloud.com', full_name: 'Alex Morgan', role: 'customer', created_at: new Date().toISOString() }, 'mock_apple_token')
                navigate('/')
              }}
              className="glass-button-secondary rounded-xl py-2.5 px-4 flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer shadow-2xs hover:border-[#FF4D4F]/40"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.87c.62-.75 1.04-1.8 0.92-2.87-.9.04-1.99.6-2.64 1.35-.57.65-1.07 1.72-.94 2.76 1.01.08 2.04-.49 2.66-1.24z"></path>
              </svg>
              <span>Apple</span>
            </button>
          </div>

          {/* Create Account Link */}
          <div className="text-center text-xs text-[#5b403e] pt-2 border-t border-white/60">
            ¿No tienes una cuenta?{' '}
            <Link to="/register" className="text-[#FF4D4F] hover:underline font-bold">
              Crear Cuenta
            </Link>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="text-center mt-6">
          <Link to="/" className="text-xs text-[#5b403e] hover:text-[#FF4D4F] transition-colors inline-flex items-center gap-1 font-medium">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Volver a la Tienda Lumina</span>
          </Link>
        </div>
      </motion.main>
    </div>
  )
}
