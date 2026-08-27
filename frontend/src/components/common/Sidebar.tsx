import React from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'

interface SidebarProps {
  currentTab: 'home' | 'categories' | 'favorites' | 'account'
  onTabChange: (tab: 'home' | 'categories' | 'favorites' | 'account') => void
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange }) => {
  const { user, isAuthenticated } = useAuthStore()
  const isAdmin = isAuthenticated && user?.role === 'admin'

  return (
    <aside className="h-screen w-64 left-0 top-0 fixed border-r border-white/40 hidden lg:flex flex-col p-6 gap-4 bg-[#f5f3f3]/60 backdrop-blur-[20px] z-40 font-body">
      {/* Brand Logo Header */}
      <div className="mb-8 flex items-center gap-3">
        <img
          className="w-10 h-10 rounded-full object-cover shadow-xs"
          alt="Lumina Logo"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBulvxzsc88ka2rhIvod-_Vy0QoT7AE_g5UWuh5ZXFp4NHO38ZscTvvwpRWJ9XIU5Fz_fhVXbEh-hKEJ4yXjdl9-7wLZHOpCCIfEDYhD6-0j-3-13HdMRP8GS8pqqBGnepWKBFRR0AB_w1505fUl0D4kha-qL92t3LKZi3QIt7IrqAWU0ChCaSwHBBT5BOIEGCyt0CZcGpORRfSfvSpgiErOc2gPt1NwOcPZ-IjsVsWSFnP8Mxy6eIq"
        />
        <h2 className="text-2xl font-bold text-[#FF4D4F] tracking-tight">Lumina</h2>
      </div>

      {/* Nav Menu */}
      <div className="flex flex-col gap-2 flex-grow">
        {/* Inicio */}
        <button
          onClick={() => onTabChange('home')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left cursor-pointer ${
            currentTab === 'home'
              ? 'text-[#FF4D4F] font-bold bg-white/60 shadow-2xs translate-x-1'
              : 'text-[#5b403e] hover:bg-white/30 font-medium'
          }`}
        >
          <span className="material-symbols-outlined" style={currentTab === 'home' ? { fontVariationSettings: "'FILL' 1" } : {}}>
            home
          </span>
          <span className="text-sm">Inicio</span>
        </button>

        {/* Categorías */}
        <button
          onClick={() => onTabChange('categories')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left cursor-pointer ${
            currentTab === 'categories'
              ? 'text-[#FF4D4F] font-bold bg-white/60 shadow-2xs translate-x-1'
              : 'text-[#5b403e] hover:bg-white/30 font-medium'
          }`}
        >
          <span className="material-symbols-outlined" style={currentTab === 'categories' ? { fontVariationSettings: "'FILL' 1" } : {}}>
            grid_view
          </span>
          <span className="text-sm">Categorías</span>
        </button>

        {/* Favoritos */}
        <button
          onClick={() => onTabChange('favorites')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left cursor-pointer ${
            currentTab === 'favorites'
              ? 'text-[#FF4D4F] font-bold bg-white/60 shadow-2xs translate-x-1'
              : 'text-[#5b403e] hover:bg-white/30 font-medium'
          }`}
        >
          <span className="material-symbols-outlined" style={currentTab === 'favorites' ? { fontVariationSettings: "'FILL' 1" } : {}}>
            favorite
          </span>
          <span className="text-sm">Favoritos</span>
        </button>

        {/* Mi Cuenta */}
        <button
          onClick={() => onTabChange('account')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left cursor-pointer ${
            currentTab === 'account'
              ? 'text-[#FF4D4F] font-bold bg-white/60 shadow-2xs translate-x-1'
              : 'text-[#5b403e] hover:bg-white/30 font-medium'
          }`}
        >
          <span className="material-symbols-outlined" style={currentTab === 'account' ? { fontVariationSettings: "'FILL' 1" } : {}}>
            person
          </span>
          <span className="text-sm">Mi Cuenta</span>
        </button>
      </div>

      {/* Admin Panel Access Link - ONLY VISIBLE TO ADMINS */}
      {isAdmin && (
        <Link
          to="/admin"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#FF6B5B] to-[#FF4D4F] shadow-sm shadow-[#FF4D4F]/30 hover:scale-[1.02] transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
          <span>Panel de Administración</span>
        </Link>
      )}

      {/* User Profile / Guest Card */}
      {isAuthenticated ? (
        <div className="flex items-center gap-3 p-3 bg-white/50 rounded-xl border border-white/70 shadow-2xs">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF6B5B] to-[#FF4D4F] text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#1b1c1c] truncate">
              {user?.full_name || 'Mi Cuenta'}
            </p>
            <p className="text-[10px] text-[#5b403e] truncate">
              {isAdmin ? '👑 Administrador' : 'Cliente'}
            </p>
          </div>
        </div>
      ) : (
        <Link
          to="/login"
          className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/70 hover:bg-white border border-white/80 text-xs font-bold text-[#1b1c1c] hover:text-[#FF4D4F] transition-all shadow-2xs"
        >
          <span className="material-symbols-outlined text-[18px]">login</span>
          <span>Iniciar Sesión</span>
        </Link>
      )}
    </aside>
  )
}
