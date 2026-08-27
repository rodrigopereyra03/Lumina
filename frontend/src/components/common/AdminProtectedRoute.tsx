import React from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'

interface AdminProtectedRouteProps {
  children: React.ReactNode
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login?redirect=/admin" replace />
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#fbf9f8] font-body text-[#1b1c1c] flex items-center justify-center p-6">
        <div className="max-w-md w-full glass-panel rounded-3xl p-8 border border-white/60 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-[#FF4D4F]/10 text-[#FF4D4F] flex items-center justify-center mx-auto shadow-inner">
            <span className="material-symbols-outlined text-[36px]">gpp_maybe</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-[#1b1c1c] tracking-tight">Acceso Restringido</h2>
            <p className="text-xs text-[#5b403e] leading-relaxed">
              Esta sección es de uso exclusivo para <span className="font-bold text-[#FF4D4F]">Administradores de Lumina</span>. Tu cuenta actual (<span className="font-semibold text-[#1b1c1c]">{user?.email}</span>) tiene permisos de cliente.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              to="/"
              className="w-full py-3 btn-primary rounded-full text-xs font-bold text-center shadow-md cursor-pointer block"
            >
              Volver a la Tienda
            </Link>
            <Link
              to="/login?redirect=/admin"
              className="w-full py-2.5 bg-white/70 hover:bg-white text-[#5b403e] rounded-full text-xs font-bold border border-white text-center transition-colors block"
            >
              Iniciar Sesión con Cuenta Admin
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
