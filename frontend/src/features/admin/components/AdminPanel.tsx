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
import { MercadoLibreConfig } from './MercadoLibreConfig'

export type AdminTab = 'dashboard' | 'products' | 'categories' | 'orders' | 'users' | 'payments' | 'mercadolibre'

export const AdminPanel: React.FC = () => {
  const hasAuthCode = typeof window !== 'undefined' && (new URLSearchParams(window.location.search).has('code') || window.location.search.includes('code='))
  const [currentTab, setCurrentTab] = useState<AdminTab>(hasAuthCode ? 'mercadolibre' : 'dashboard')
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
    { id: 'mercadolibre', label: 'Mercado Libre', icon: 'handshake' },
  ] as const

  const handleLogout = () => {
    clearAuth()
    navigate('/')
  }

  return (
    <div className="bg-[#f6f4ee] text-[#121314] font-dm min-h-screen antialiased flex selection:bg-[#0ffcbe] selection:text-[#121314]">
      {/* Admin SideNavBar (Desktop) */}
      <aside className="h-screen w-64 left-0 top-0 fixed border-r-2 border-[#121314] hidden lg:flex flex-col p-6 gap-4 bg-white z-40">
        {/* Brand Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#121314] flex items-center justify-center text-white border-2 border-[#121314] shadow-[2px_2px_0px_#121314]">
            <span className="material-symbols-outlined text-[22px]">admin_panel_settings</span>
          </div>
          <div>
            <h2 className="text-base font-black text-[#121314] tracking-tight uppercase leading-none">Admin Panel</h2>
            <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-[#ff78ac] text-[#121314] border border-[#121314] tracking-wider mt-1 inline-block">
              Fórmula 1370
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex flex-col gap-2 flex-grow">
          {navItems.map((item) => {
            const isActive = currentTab === item.id

            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-150 text-left cursor-pointer border-2 ${
                  isActive
                    ? 'bg-[#121314] text-white font-black border-[#121314] shadow-[3px_3px_0px_#ff78ac] translate-x-1'
                    : 'bg-white text-[#121314] border-transparent hover:border-[#121314] hover:bg-[#f6f4ee] font-bold'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                <span className="text-xs uppercase tracking-wider">{item.label}</span>
              </button>
            )
          })}
        </div>

        {/* Bottom Actions: Storefront & Logout */}
        <div className="mt-auto space-y-2 pt-4 border-t-2 border-[#121314]/15">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-[#121314] bg-[#a8d5e3] hover:bg-[#96c8d7] border-2 border-[#121314] shadow-[2px_2px_0px_#121314] transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">storefront</span>
            <span>Ver Tienda</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-[#d92d20] hover:bg-red-50 border-2 border-transparent hover:border-[#d92d20] transition-colors cursor-pointer text-left"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 border-b-2 border-[#121314] bg-white flex justify-between items-center px-6 md:px-10 py-3.5 w-full">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="lg:hidden p-2 text-[#121314] border-2 border-[#121314] rounded-xl bg-[#f6f4ee] shadow-[2px_2px_0px_#121314] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">menu</span>
            </button>
            <span className="font-black text-sm uppercase tracking-wider text-[#121314]">
              Fórmula 1370 <span className="text-[#106ebe] font-medium">• Backoffice</span>
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-[#0ffcbe] hover:bg-[#00eaad] text-[#121314] border-2 border-[#121314] shadow-[2px_2px_0px_#121314] transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">visibility</span>
              <span>Ir a la Tienda</span>
            </Link>

            <div className="flex items-center gap-3 border-l-2 border-[#121314]/15 pl-3">
              <div className="text-right hidden md:block">
                <p className="text-xs font-black text-[#121314] uppercase leading-tight">{user?.full_name || 'Administrador'}</p>
                <p className="text-[10px] font-mono text-[#121314]/70 leading-tight">{user?.email || 'admin@formula1370.com'}</p>
              </div>
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"
                alt="Admin"
                className="w-9 h-9 rounded-full object-cover border-2 border-[#121314] shadow-[2px_2px_0px_#121314]"
              />
              <button
                onClick={handleLogout}
                title="Cerrar Sesión"
                className="p-1.5 text-[#121314] hover:text-[#d92d20] rounded-lg border-2 border-transparent hover:border-[#121314] hover:bg-red-50 transition-colors cursor-pointer"
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
              className="lg:hidden bg-white border-b-2 border-[#121314] p-4 space-y-2 z-40"
            >
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id)
                    setIsMobileNavOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-left transition-colors border-2 ${
                    currentTab === item.id
                      ? 'bg-[#121314] text-white border-[#121314] shadow-[2px_2px_0px_#ff78ac]'
                      : 'bg-white text-[#121314] border-transparent hover:border-[#121314]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}

              <div className="pt-2 border-t-2 border-[#121314]/15 space-y-2">
                <Link
                  to="/"
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-[#a8d5e3] text-[#121314] border-2 border-[#121314] shadow-[2px_2px_0px_#121314]"
                >
                  <span className="material-symbols-outlined text-[18px]">storefront</span>
                  <span>Volver a la Tienda</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-[#d92d20] bg-red-50 border-2 border-[#d92d20]"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Admin Canvas */}
        <main className="flex-1 p-4 md:p-8 lg:p-10 flex flex-col gap-8 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {currentTab === 'dashboard' && <AdminDashboard />}
              {currentTab === 'products' && <ProductManagement />}
              {currentTab === 'categories' && <CategoryManagement />}
              {currentTab === 'orders' && <OrderManagement />}
              {currentTab === 'users' && <UserDirectory />}
              {currentTab === 'payments' && <PaymentMethodsConfig />}
              {currentTab === 'mercadolibre' && <MercadoLibreConfig />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
