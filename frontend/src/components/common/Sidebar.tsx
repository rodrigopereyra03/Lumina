import React from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { useSidebarStore } from '../../store/useSidebarStore'

interface SidebarProps {
  currentTab: 'home' | 'categories' | 'favorites' | 'account'
  onTabChange: (tab: 'home' | 'categories' | 'favorites' | 'account') => void
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange }) => {
  const { user, isAuthenticated } = useAuthStore()
  const { isCollapsed, toggleSidebar } = useSidebarStore()
  const isAdmin = isAuthenticated && user?.role === 'admin'

  return (
    <aside
      className={`h-screen left-0 top-0 fixed border-r border-white/40 dark:border-white/10 hidden lg:flex flex-col gap-4 bg-[#f5f3f3]/60 dark:bg-[#12151c]/95 backdrop-blur-[20px] z-40 font-body transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20 p-3' : 'w-64 p-6'
      }`}
    >
      {/* Brand Logo Header & Toggle Button */}
      <div className={`mb-6 flex items-center ${isCollapsed ? 'flex-col gap-3' : 'justify-between gap-2'}`}>
        <div
          className="flex items-center gap-3 min-w-0 cursor-pointer select-none"
          onClick={isCollapsed ? toggleSidebar : () => onTabChange('home')}
          title={isCollapsed ? 'Clic para expandir menú' : 'Lumina'}
        >
          <img
            className="w-10 h-10 rounded-full object-cover shadow-xs shrink-0 hover:scale-105 transition-transform"
            alt="Lumina Logo"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBulvxzsc88ka2rhIvod-_Vy0QoT7AE_g5UWuh5ZXFp4NHO38ZscTvvwpRWJ9XIU5Fz_fhVXbEh-hKEJ4yXjdl9-7wLZHOpCCIfEDYhD6-0j-3-13HdMRP8GS8pqqBGnepWKBFRR0AB_w1505fUl0D4kha-qL92t3LKZi3QIt7IrqAWU0ChCaSwHBBT5BOIEGCyt0CZcGpORRfSfvSpgiErOc2gPt1NwOcPZ-IjsVsWSFnP8Mxy6eIq"
          />
          {!isCollapsed && (
            <h2 className="text-2xl font-bold text-[#FF4D4F] tracking-tight">Lumina</h2>
          )}
        </div>

        {/* Toggle Collapse/Expand Button */}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-xl text-[#5b403e] dark:text-[#9ca3af] hover:text-[#FF4D4F] dark:hover:text-[#FF4D4F] hover:bg-white/60 dark:hover:bg-white/10 transition-all cursor-pointer shrink-0 flex items-center justify-center"
          title={isCollapsed ? 'Expandir menú lateral' : 'Ocultar menú lateral (solo iconos)'}
          aria-label={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          <span className="material-symbols-outlined text-[20px]">
            {isCollapsed ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>
      </div>

      {/* Nav Menu */}
      <div className="flex flex-col gap-2 flex-grow">
        {/* Inicio */}
        <button
          onClick={() => onTabChange('home')}
          title="Inicio"
          className={`flex items-center ${
            isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
          } rounded-xl transition-all duration-200 text-left cursor-pointer ${
            currentTab === 'home'
              ? 'text-[#FF4D4F] font-bold bg-white/60 dark:bg-white/10 shadow-2xs translate-x-0.5'
              : 'text-[#5b403e] dark:text-[#9ca3af] hover:bg-white/30 dark:hover:bg-white/5 font-medium'
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={currentTab === 'home' ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            home
          </span>
          {!isCollapsed && <span className="text-sm">Inicio</span>}
        </button>

        {/* Categorías */}
        <button
          onClick={() => onTabChange('categories')}
          title="Categorías"
          className={`flex items-center ${
            isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
          } rounded-xl transition-all duration-200 text-left cursor-pointer ${
            currentTab === 'categories'
              ? 'text-[#FF4D4F] font-bold bg-white/60 dark:bg-white/10 shadow-2xs translate-x-0.5'
              : 'text-[#5b403e] dark:text-[#9ca3af] hover:bg-white/30 dark:hover:bg-white/5 font-medium'
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={currentTab === 'categories' ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            grid_view
          </span>
          {!isCollapsed && <span className="text-sm">Categorías</span>}
        </button>

        {/* Favoritos */}
        <button
          onClick={() => onTabChange('favorites')}
          title="Favoritos"
          className={`flex items-center ${
            isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
          } rounded-xl transition-all duration-200 text-left cursor-pointer ${
            currentTab === 'favorites'
              ? 'text-[#FF4D4F] font-bold bg-white/60 dark:bg-white/10 shadow-2xs translate-x-0.5'
              : 'text-[#5b403e] dark:text-[#9ca3af] hover:bg-white/30 dark:hover:bg-white/5 font-medium'
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={currentTab === 'favorites' ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            favorite
          </span>
          {!isCollapsed && <span className="text-sm">Favoritos</span>}
        </button>

        {/* Mi Cuenta */}
        <button
          onClick={() => onTabChange('account')}
          title="Mi Cuenta"
          className={`flex items-center ${
            isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
          } rounded-xl transition-all duration-200 text-left cursor-pointer ${
            currentTab === 'account'
              ? 'text-[#FF4D4F] font-bold bg-white/60 dark:bg-white/10 shadow-2xs translate-x-0.5'
              : 'text-[#5b403e] dark:text-[#9ca3af] hover:bg-white/30 dark:hover:bg-white/5 font-medium'
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={currentTab === 'account' ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            person
          </span>
          {!isCollapsed && <span className="text-sm">Mi Cuenta</span>}
        </button>
      </div>

      {/* Admin Panel Access Link - ONLY VISIBLE TO ADMINS */}
      {isAdmin && (
        <Link
          to="/admin"
          title="Panel de Administración"
          className={`flex items-center ${
            isCollapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2.5'
          } rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#FF6B5B] to-[#FF4D4F] shadow-sm shadow-[#FF4D4F]/30 hover:scale-[1.03] transition-all`}
        >
          <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
          {!isCollapsed && <span>Panel de Administración</span>}
        </Link>
      )}

      {/* User Profile / Guest Card */}
      {isAuthenticated ? (
        <div
          onClick={() => onTabChange('account')}
          title={`${user?.full_name || 'Mi Cuenta'} (${isAdmin ? 'Administrador' : 'Cliente'})`}
          className={`flex items-center ${
            isCollapsed ? 'justify-center p-1.5' : 'gap-3 p-3'
          } bg-white/50 dark:bg-white/5 rounded-xl border border-white/70 dark:border-white/10 shadow-2xs cursor-pointer hover:bg-white/70 dark:hover:bg-white/10 transition-colors`}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF6B5B] to-[#FF4D4F] text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#1b1c1c] dark:text-[#f9fafb] truncate">
                {user?.full_name || 'Mi Cuenta'}
              </p>
              <p className="text-[10px] text-[#5b403e] dark:text-[#9ca3af] truncate">
                {isAdmin ? '👑 Administrador' : 'Cliente'}
              </p>
            </div>
          )}
        </div>
      ) : (
        <Link
          to="/login"
          title="Iniciar Sesión"
          className={`flex items-center ${
            isCollapsed ? 'justify-center p-2.5' : 'justify-center gap-2 p-3'
          } rounded-xl bg-white/70 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-white/80 dark:border-white/10 text-xs font-bold text-[#1b1c1c] dark:text-[#f9fafb] hover:text-[#FF4D4F] dark:hover:text-[#FF4D4F] transition-all shadow-2xs`}
        >
          <span className="material-symbols-outlined text-[20px]">login</span>
          {!isCollapsed && <span>Iniciar Sesión</span>}
        </Link>
      )}
    </aside>
  )
}
