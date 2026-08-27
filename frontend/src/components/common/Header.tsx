import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CATEGORIES } from '../../features/ecommerce/data/productsData'
import { useCartStore } from '../../store/useCartStore'
import { useAuthStore } from '../../store/useAuthStore'

interface HeaderProps {
  selectedCategorySlug?: string
  onCategorySelect?: (slug: string) => void
  searchQuery?: string
  onSearchChange?: (query: string) => void
  onSearchSubmit?: () => void
}

export const Header: React.FC<HeaderProps> = ({
  selectedCategorySlug = 'all',
  onCategorySelect = () => {},
  searchQuery = '',
  onSearchChange = () => {},
  onSearchSubmit = () => {},
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
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSearchSubmit()
            }
          }}
          placeholder="Buscar productos de alta gama, cámaras, audio..."
          className="w-full bg-white/70 border border-white/80 rounded-full py-2 pl-10 pr-9 text-xs placeholder:text-[#5b403e]/70 focus:outline-none focus:ring-2 focus:ring-[#FF4D4F]/30 transition-all text-[#1b1c1c]"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5b403e] hover:text-[#FF4D4F] text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center cursor-pointer transition-colors"
            title="Limpiar búsqueda"
          >
            ✕
          </button>
        )}
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
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#FF6B5B] to-[#FF4D4F] text-white font-bold text-xs rounded-full shadow-sm shadow-[#FF4D4F]/30 hover:scale-105 transition-all"
            title="Ir al Backoffice"
          >
            <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
            <span className="hidden xs:inline">Backoffice</span>
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
        {isAuthenticated ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="p-1 pr-2 rounded-full hover:ring-2 hover:ring-[#FF4D4F]/40 transition-all cursor-pointer flex items-center gap-1.5 bg-white/60 border border-white/80 shadow-2xs"
              title={user?.full_name || 'Mi Cuenta'}
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#FF6B5B] to-[#FF4D4F] text-white font-bold flex items-center justify-center text-xs shadow-2xs">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="text-xs font-semibold text-[#1b1c1c] max-w-[80px] truncate hidden md:inline">
                {user?.full_name?.split(' ')[0]}
              </span>
              <span className="material-symbols-outlined text-[#5b403e] text-[16px]">
                {isUserMenuOpen ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl p-2 border border-white/80 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
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
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#c0392b] hover:bg-red-50/60 transition-colors cursor-pointer text-left border-t border-white/60 mt-1 pt-1.5"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/70 hover:bg-white border border-white/80 text-xs font-bold text-[#1b1c1c] hover:text-[#FF4D4F] shadow-2xs transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">login</span>
            <span>Ingresar</span>
          </Link>
        )}
      </div>
    </header>
  )
}
