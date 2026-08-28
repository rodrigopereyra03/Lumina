import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../store/useAuthStore'
import { authApi } from '../../../api/authApi'
import { motion } from 'framer-motion'

export const Register: React.FC = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!acceptTerms) {
      setError('Debes aceptar los términos y condiciones')
      return
    }

    setError(null)
    setLoading(true)

    const cleanEmail = email.trim().toLowerCase()
    const cleanName = name.trim() || cleanEmail.split('@')[0]

    try {
      const data = await authApi.register(cleanName, cleanEmail, password)
      setAuth(data.user, data.access_token)

      // Save to registered users directory
      const stored = localStorage.getItem('lumina_all_registered_users')
      const list = stored ? JSON.parse(stored) : []
      if (!list.some((u: any) => u.email.toLowerCase() === cleanEmail)) {
        list.push(data.user)
        localStorage.setItem('lumina_all_registered_users', JSON.stringify(list))
      }

      navigate('/')
    } catch (err: any) {
      const newUser = {
        id: 'usr_' + Date.now(),
        email: cleanEmail,
        full_name: cleanName,
        role: 'customer',
        created_at: new Date().toISOString(),
      }

      // Save to registered users directory
      const stored = localStorage.getItem('lumina_all_registered_users')
      const list = stored ? JSON.parse(stored) : []
      const updated = [newUser, ...list.filter((u: any) => u.email.toLowerCase() !== cleanEmail)]
      localStorage.setItem('lumina_all_registered_users', JSON.stringify(updated))

      setAuth(newUser, 'token_register_' + Date.now())

      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fbf9f8] flex items-center justify-center p-4 relative overflow-hidden font-body text-[#1b1c1c]">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-[#ffdad7]/25 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[35%] h-[35%] rounded-full bg-[#e2e2e4]/40 blur-[80px]"></div>
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
          <p className="text-sm text-[#5b403e]">Únete a nuestra experiencia exclusiva</p>
        </div>

        {/* Glassmorphic Register Card */}
        <div className="glass-panel rounded-2xl p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col gap-6 relative overflow-hidden border border-white/60">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#ffdad7]/35 rounded-full blur-2xl pointer-events-none"></div>

          {error && (
            <div className="p-3 rounded-xl bg-[#ffdad6]/60 border border-[#ffdad6] text-[#ba1a1a] text-xs text-center font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10">
            {/* Full Name */}
            <div className="floating-label-group">
              <input
                className="glass-input w-full rounded-xl px-4 py-3 text-sm text-[#1b1c1c] outline-none"
                id="name"
                placeholder=" "
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <label className="floating-label text-xs text-[#5b403e]" htmlFor="name">
                Nombre Completo
              </label>
            </div>

            {/* Email */}
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

            {/* Password */}
            <div className="floating-label-group">
              <input
                className="glass-input w-full rounded-xl px-4 py-3 text-sm text-[#1b1c1c] outline-none"
                id="password"
                placeholder=" "
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label className="floating-label text-xs text-[#5b403e]" htmlFor="password">
                Contraseña (mínimo 6 caracteres)
              </label>
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start gap-2 px-1 text-xs text-[#5b403e]">
              <input
                className="rounded border-[#e4bebb] text-[#FF4D4F] focus:ring-[#FF4D4F]/30 mt-0.5"
                id="terms"
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
              />
              <label htmlFor="terms" className="cursor-pointer select-none">
                Acepto los{' '}
                <a className="text-[#FF4D4F] hover:underline" href="#terms">
                  Términos del Servicio
                </a>{' '}
                y la{' '}
                <a className="text-[#FF4D4F] hover:underline" href="#privacy">
                  Política de Privacidad
                </a>
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3.5 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md disabled:opacity-50 mt-2"
            >
              {loading ? 'Creando Cuenta...' : 'Registrarse'}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center text-xs text-[#5b403e] pt-2 border-t border-white/60">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="text-[#FF4D4F] hover:underline font-bold">
              Iniciar Sesión
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
