import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CATEGORIES } from '../../features/ecommerce/data/productsData'
import { useCartStore } from '../../store/useCartStore'
import { useAuthStore } from '../../store/useAuthStore'

interface HeaderProps {
  selectedCategorySlug: string
  onCategorySelect: (slug: string) => void
}

export const Header: React.FC<HeaderProps> = ({
  selectedCategorySlug,
  onCategorySelect,
}) => {
  const { items, openDrawer } = useCartStore()
  const { user, isAuthenticated, clearAuth } = useAuthStore()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const totalItemsCount = items.reduce((acc, item) => acc + item.quantity, 0)
  const isAdmin = isAuthenticated && user?.role === 'admin'

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    clearAuth()
    setIsUserMenuOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/50 shadow-[0_10px_30px_rgba(0,0,0,0.03)] bg-[#fbf9f8]/85 backdrop-blur-[20px] flex justify-between items-center px-4 md:px-12 py-3.5 w-full font-body text-[#1b1c1c]">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5b403e] text-[18px]">
          search
        </span>
        <input
          type="text"
          placeholder="Buscar productos de alta gama, cámaras, audio..."
          className="w-full bg-white/70 border border-white/80 rounded-full py-2 pl-10 pr-4 text-xs placeholder:text-[#5b403e]/70 focus:outline-none focus:ring-2 focus:ring-[#FF4D4F]/30 transition-all"
        />
      </div>

      {/* Category Pills (Desktop) */}
      <div className="hidden xl:flex items-center gap-1.5 mx-4">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategorySlug === cat.slug

          return (
            <button
              key={cat.id}
              onClick={() => onCategorySelect(cat.slug)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-[#FF4D4F] text-white shadow-sm shadow-[#FF4D4F]/30'
                  : 'text-[#5b403e] hover:bg-white/60 hover:text-[#1b1c1c]'
              }`}
            >
              {cat.name}
            </button>
          )
        })}
      </div>

      {/* Right Controls: Cart & Profile */}
      <div className="flex items-center gap-3">
        {/* Admin Quick Button (ONLY VISIBLE TO ADMINS) */}
        {isAdmin && (
          <Link
            to="/admin"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#FF4D4F]/10 hover:bg-[#FF4D4F]/20 text-[#FF4D4F] font-bold text-xs rounded-full border border-[#FF4D4F]/20 transition-all shadow-2xs"
            title="Ir al Backoffice"
          >
            <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
            <span>Backoffice</span>
          </Link>
        )}

        {/* Cart Trigger */}
        <button
          onClick={openDrawer}
          className="relative p-2.5 rounded-full bg-white/70 hover:bg-white border border-white/80 shadow-2xs text-[#1b1c1c] transition-all cursor-pointer hover:scale-105"
          title="Abrir Carrito"
        >
          <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
          {totalItemsCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#FF4D4F] text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
              {totalItemsCount}
            </span>
          )}
        </button>

        {/* User Menu Trigger */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="p-1 rounded-full hover:ring-2 hover:ring-[#FF4D4F]/40 transition-all cursor-pointer flex items-center gap-1.5 bg-white/60 border border-white/80 shadow-2xs"
            title={isAuthenticated ? user?.full_name : 'Iniciar Sesión'}
          >
            <img
              alt="Usuario"
              className="w-8 h-8 rounded-full object-cover border border-white shadow-2xs"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDsAngPk9rQZQjrTsirIfkWPnvlCngc9MZQOD_kJo2OHxteBApsxWzBFHZ_fqwFcjLlHiajiU3MbpxrVbUInX6XhkO3ZhM-Zm62bc8_t2j6hIGOiRkKoMOp2U2YX4M9kZVoLWnQ5mVwPFJqp_1-KZoZLotJNNwVdbcajfsMnFMiF020ITw-29dQXpxa2aCgTjujefQQV_K7k2m9xGfmgjkw8pRRbM9bGToT2Syl1OsHVbV-2182g32y"
            />
            <span className="material-symbols-outlined text-[#5b403e] text-[16px] pr-1">
              {isUserMenuOpen ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {/* Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl p-2 border border-white/80 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
              {isAuthenticated ? (
                <div className="space-y-1">
                  <div className="px-3 py-2 border-b border-white/60 mb-1">
                    <p className="text-xs font-bold text-[#1b1c1c] truncate">{user?.full_name}</p>
                    <p className="text-[10px] text-[#5b403e] truncate">{user?.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#FF4D4F]/10 text-[#FF4D4F]">
                      {isAdmin ? 'Administrador' : 'Cliente'}
                    </span>
                  </div>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#FF4D4F] hover:bg-[#FF4D4F]/10 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                      <span>Panel de Administración</span>
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false)
                      navigate('/profile')
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#5b403e] hover:bg-white/60 hover:text-[#1b1c1c] transition-colors cursor-pointer text-left"
                  >
                    <span className="material-symbols-outlined text-[18px]">person</span>
                    <span>Mi Perfil & Direcciones</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#c0392b] hover:bg-red-50/60 transition-colors cursor-pointer text-left border-t border-white/60 mt-1 pt-1.5"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-1 p-1">
                  <p className="text-[11px] text-[#5b403e] px-2 py-1">Accede a tu cuenta de Lumina</p>
                  <Link
                    to="/login"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="w-full py-2 btn-primary rounded-xl text-xs font-bold text-center block shadow-2xs"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="w-full py-2 bg-white/60 hover:bg-white text-[#5b403e] rounded-xl text-xs font-bold text-center block border border-white transition-colors"
                  >
                    Crear Cuenta
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
