import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { categoriesApi } from '../../api/categoriesApi'
import { useCartStore } from '../../store/useCartStore'
import { useAuthStore } from '../../store/useAuthStore'
import { ThemeToggle } from './ThemeToggle'

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
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([
    { id: 'all', name: 'Todos los Productos', slug: 'all' },
    { id: 'perfumes', name: 'Perfumes', slug: 'perfumes' },
  ])
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoriesApi.getCategories()
        if (res.categories && res.categories.length > 0) {
          setCategories([
            { id: 'all', name: 'Todos los Productos', slug: 'all' },
            ...res.categories.map((c) => ({
              id: c.id || c.slug,
              name: c.name,
              slug: c.slug || c.name.toLowerCase(),
            })),
          ])
        }
      } catch (e) {
        // Fallback
      }
    }
    loadCategories()
  }, [])

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
    <header className="sticky top-0 z-30 border-b border-white/50 dark:border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)] bg-[#fbf9f8]/85 dark:bg-[#0e1015]/85 backdrop-blur-[20px] px-3.5 sm:px-6 md:px-12 py-2.5 sm:py-3.5 w-full font-body text-[#1b1c1c] dark:text-[#f9fafb] transition-colors">
      <div className="flex justify-between items-center gap-2 sm:gap-4 w-full">
        {/* Search Input */}
        <div className="relative flex-1 max-w-full md:max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#5b403e] dark:text-[#9ca3af] text-[18px]">
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
            placeholder="Buscar perfumes..."
            className="w-full bg-white/70 dark:bg-white/[0.05] border border-white/80 dark:border-white/10 rounded-full py-1.5 sm:py-2 pl-9 pr-8 text-xs placeholder:text-[#5b403e]/70 dark:placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#FF4D4F]/30 transition-all text-[#1b1c1c] dark:text-[#f9fafb]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5b403e] dark:text-[#9ca3af] hover:text-[#FF4D4F] text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center cursor-pointer transition-colors"
              title="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Pills (Desktop View) */}
        <div className="hidden md:flex items-center gap-1.5 mx-2 md:mx-4 overflow-x-auto py-1 scrollbar-none shrink-0">
          {categories.map((cat) => {
            const isActive = selectedCategorySlug === cat.slug

            return (
              <button
                key={cat.id}
                onClick={() => onCategorySelect(cat.slug)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#FF4D4F] text-white shadow-sm shadow-[#FF4D4F]/30'
                    : 'text-[#5b403e] dark:text-[#9ca3af] hover:bg-white/60 dark:hover:bg-white/10 hover:text-[#1b1c1c] dark:hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            )
          })}

          {/* Showcase 3D Link matching Stitch design */}
          <Link
            to="/hero-3d"
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-white/90 bg-neutral-900/80 dark:bg-white/10 hover:bg-neutral-800 border border-white/15 transition-all shadow-sm flex items-center gap-2"
          >
            <span>Showcase 3D</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></span>
          </Link>
        </div>

        {/* Right Controls: Theme, Cart & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Dark Mode Toggle */}
          <ThemeToggle />

          {/* Admin Quick Button (ONLY VISIBLE TO ADMINS) */}
          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-[#FF6B5B] to-[#FF4D4F] text-white font-bold text-xs rounded-full shadow-sm shadow-[#FF4D4F]/30 hover:scale-105 transition-all"
              title="Ir al Backoffice"
            >
              <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
              <span className="hidden xs:inline">Backoffice</span>
            </Link>
          )}

          {/* Cart Trigger */}
          <button
            onClick={openDrawer}
            className="relative p-2 sm:p-2.5 rounded-full bg-white/70 dark:bg-white/[0.05] hover:bg-white dark:hover:bg-white/10 border border-white/80 dark:border-white/10 shadow-2xs text-[#1b1c1c] dark:text-[#f9fafb] transition-all cursor-pointer hover:scale-105"
            title="Abrir Carrito"
          >
            <span className="material-symbols-outlined text-[18px] sm:text-[20px]">shopping_cart</span>
            {totalItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#FF4D4F] text-white font-bold text-[9px] sm:text-[10px] w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-xs">
                {totalItemsCount}
              </span>
            )}
          </button>

          {/* User Menu Trigger */}
          {isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="p-1 pr-1.5 sm:pr-2 rounded-full hover:ring-2 hover:ring-[#FF4D4F]/40 transition-all cursor-pointer flex items-center gap-1 sm:gap-1.5 bg-white/60 dark:bg-white/10 border border-white/80 dark:border-white/10 shadow-2xs"
                title={user?.full_name || 'Mi Cuenta'}
              >
                <div className="w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-full bg-gradient-to-tr from-[#FF6B5B] to-[#FF4D4F] text-white font-bold flex items-center justify-center text-xs shadow-2xs">
                  {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-xs font-semibold text-[#1b1c1c] dark:text-[#f9fafb] max-w-[80px] truncate hidden md:inline">
                  {user?.full_name?.split(' ')[0]}
                </span>
                <span className="material-symbols-outlined text-[#5b403e] dark:text-[#9ca3af] text-[16px]">
                  {isUserMenuOpen ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-1.5rem)] glass-panel dark:bg-[#12151c]/95 dark:border-white/10 rounded-2xl p-2 border border-white/80 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="space-y-1">
                    <div className="px-3 py-2 border-b border-white/60 dark:border-white/10 mb-1">
                      <p className="text-xs font-bold text-[#1b1c1c] dark:text-[#f9fafb] truncate">{user?.full_name}</p>
                      <p className="text-[10px] text-[#5b403e] dark:text-[#9ca3af] truncate">{user?.email}</p>
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
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#c0392b] dark:text-[#ff6b6b] hover:bg-red-50/60 dark:hover:bg-red-950/30 transition-colors cursor-pointer text-left border-t border-white/60 dark:border-white/10 mt-1 pt-1.5"
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
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full bg-white/70 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 border border-white/80 dark:border-white/10 text-xs font-bold text-[#1b1c1c] dark:text-[#f9fafb] hover:text-[#FF4D4F] shadow-2xs transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">login</span>
              <span className="hidden xs:inline">Ingresar</span>
            </Link>
          )}
        </div>
      </div>

      {/* Category Pills (Mobile Dedicated Row) */}
      <div className="flex md:hidden items-center gap-1.5 overflow-x-auto py-1.5 scrollbar-none w-full border-t border-white/40 dark:border-white/10 mt-2">
        {categories.map((cat) => {
          const isActive = selectedCategorySlug === cat.slug

          return (
            <button
              key={cat.id}
              onClick={() => onCategorySelect(cat.slug)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all duration-200 cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-[#FF4D4F] text-white shadow-sm shadow-[#FF4D4F]/30'
                  : 'text-[#5b403e] dark:text-[#9ca3af] hover:bg-white/60 dark:hover:bg-white/10 hover:text-[#1b1c1c] dark:hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          )
        })}
      </div>
    </header>
  )
}
