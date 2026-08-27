import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../../store/useAuthStore'

import { AdminDashboard } from './AdminDashboard'
import { ProductManagement } from './ProductManagement'
import { CategoryManagement } from './CategoryManagement'
import { OrderManagement } from './OrderManagement'
import { UserDirectory } from './UserDirectory'
import { PaymentMethodsConfig } from './PaymentMethodsConfig'

export type AdminTab = 'dashboard' | 'products' | 'categories' | 'orders' | 'users' | 'payments'

export const AdminPanel: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<AdminTab>('dashboard')
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'products', label: 'Productos', icon: 'inventory_2' },
    { id: 'categories', label: 'Categorías', icon: 'category' },
    { id: 'orders', label: 'Órdenes', icon: 'receipt_long' },
    { id: 'users', label: 'Usuarios', icon: 'group' },
    { id: 'payments', label: 'Medios de Pago', icon: 'credit_card' },
  ] as const

  const handleLogout = () => {
    clearAuth()
    navigate('/')
  }

  return (
    <div className="bg-[#fbf9f8] text-[#1b1c1c] font-body min-h-screen antialiased flex">
      {/* Admin SideNavBar (Desktop) */}
      <aside className="h-screen w-64 left-0 top-0 fixed border-r border-white/40 hidden lg:flex flex-col p-6 gap-4 bg-[#f5f3f3]/60 backdrop-blur-[20px] z-40">
        {/* Brand Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF6B5B] to-[#FF4D4F] flex items-center justify-center text-white shadow-md shadow-[#FF4D4F]/20">
            <span className="material-symbols-outlined text-[22px]">admin_panel_settings</span>
          </div>
          <div>
            <h2 className="text-lg font-black text-[#1b1c1c] tracking-tight leading-none">Admin Panel</h2>
            <span className="text-[10px] uppercase font-bold text-[#FF4D4F] tracking-wider">Ecommerce Admin</span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex flex-col gap-1.5 flex-grow">
          {navItems.map((item) => {
            const isActive = currentTab === item.id

            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-left cursor-pointer ${
                  isActive
                    ? 'text-[#FF4D4F] font-bold bg-white/80 shadow-2xs translate-x-1'
                    : 'text-[#5b403e] hover:bg-white/40 font-medium'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                <span className="text-xs">{item.label}</span>
              </button>
            )
          })}
        </div>

        {/* Bottom Actions: Storefront & Logout */}
        <div className="mt-auto space-y-2 pt-4 border-t border-white/60">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#5b403e] hover:text-[#FF4D4F] hover:bg-white/50 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">storefront</span>
            <span>Volver a la Tienda</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#c0392b] hover:bg-red-50/60 transition-colors cursor-pointer text-left"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 border-b border-white/50 shadow-[0_10px_30px_rgba(0,0,0,0.03)] bg-[#fbf9f8]/85 backdrop-blur-[20px] flex justify-between items-center px-6 md:px-12 py-3.5 w-full">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="lg:hidden p-2 text-[#5b403e] hover:text-[#1b1c1c] rounded-xl hover:bg-white/60 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[22px]">menu</span>
            </button>
            <span className="font-extrabold text-sm text-[#1b1c1c] tracking-tight">
              Lumina <span className="text-[#FF4D4F] font-normal">Backoffice</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#5b403e] hover:text-[#FF4D4F] transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">visibility</span>
              <span>Ver Tienda en Vivo</span>
            </Link>

            <div className="flex items-center gap-3 border-l border-white/60 pl-3">
              <div className="text-right hidden md:block">
                <p className="text-xs font-bold text-[#1b1c1c] leading-tight">{user?.full_name || 'Administrador'}</p>
                <p className="text-[10px] text-[#5b403e] leading-tight">{user?.email || 'admin@lumina.com'}</p>
              </div>
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"
                alt="Admin"
                className="w-8 h-8 rounded-full object-cover border border-white shadow-2xs"
              />
              <button
                onClick={handleLogout}
                title="Cerrar Sesión"
                className="p-1.5 text-[#5b403e] hover:text-[#c0392b] rounded-lg hover:bg-red-50/60 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileNavOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-[#fbf9f8]/95 backdrop-blur-xl border-b border-white/60 p-4 space-y-1 z-40"
            >
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id)
                    setIsMobileNavOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-left ${
                    currentTab === item.id
                      ? 'text-[#FF4D4F] font-bold bg-white/80'
                      : 'text-[#5b403e]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}

              <div className="pt-2 border-t border-white/60 space-y-1">
                <Link
                  to="/"
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#5b403e]"
                >
                  <span className="material-symbols-outlined text-[18px]">storefront</span>
                  <span>Volver a la Tienda</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#c0392b]"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Admin Canvas */}
        <main className="flex-1 p-4 md:p-10 flex flex-col gap-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {currentTab === 'dashboard' && <AdminDashboard />}
              {currentTab === 'products' && <ProductManagement />}
              {currentTab === 'categories' && <CategoryManagement />}
              {currentTab === 'orders' && <OrderManagement />}
              {currentTab === 'users' && <UserDirectory />}
              {currentTab === 'payments' && <PaymentMethodsConfig />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
