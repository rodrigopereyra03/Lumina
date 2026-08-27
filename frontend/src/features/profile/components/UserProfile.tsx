import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../../store/useAuthStore'
import { addressesApi, type AddressDTO } from '../../../api/addressesApi'

interface UserProfileProps {
  onBack: () => void
}

export const UserProfile: React.FC<UserProfileProps> = ({ onBack }) => {
  const { user, isAuthenticated, clearAuth } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'payment' | 'orders'>('profile')
  const [userAddresses, setUserAddresses] = useState<AddressDTO[]>([])

  useEffect(() => {
    const fetchAddrs = async () => {
      try {
        const res = await addressesApi.getAddresses()
        if (res.addresses) {
          setUserAddresses(res.addresses)
        }
      } catch (e) {
        // fallback
      }
    }
    if (isAuthenticated) {
      fetchAddrs()
    }
  }, [isAuthenticated])

  const userName = isAuthenticated && user?.full_name ? user.full_name : 'Alex Morgan'
  const userEmail = isAuthenticated && user?.email ? user.email : 'alex.morgan@example.com'

  const orders = [
    {
      id: '#LUM-849325',
      date: '24 Oct, 2024',
      items: '180x Manta de Lino (Set de 2)',
      total: '$155.00',
      status: 'Entregado',
      statusColor: 'bg-[#E8F8F0] text-[#1E824C]',
    },
    {
      id: '#LUM-841932',
      date: '15 Nov, 2023',
      items: 'Jarrón Cerámico, Set Arena',
      total: '$85.00',
      status: 'Entregado',
      statusColor: 'bg-[#E8F8F0] text-[#1E824C]',
    },
    {
      id: '#LUM-839012',
      date: '02 Nov, 2023',
      items: 'Altavoz Acústico Euphoria',
      total: '$120.00',
      status: 'En Proceso',
      statusColor: 'bg-[#ffdad7]/60 text-[#FF4D4F]',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-8 font-body text-[#1b1c1c]"
    >
      {/* Breadcrumb & Welcome Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/60 pb-6">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1 text-xs text-[#5b403e] hover:text-[#FF4D4F] transition-colors mb-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Volver a la Tienda</span>
          </button>
          <h1 className="text-3xl font-bold text-[#1b1c1c] tracking-tight">
            Bienvenido de nuevo, {userName.split(' ')[0]}
          </h1>
          <p className="text-xs sm:text-sm text-[#5b403e] mt-0.5">
            Administra los datos de tu cuenta, direcciones y pedidos recientes.
          </p>
        </div>

        {isAuthenticated && (
          <button
            onClick={clearAuth}
            className="px-4 py-2 rounded-full glass-button-secondary text-xs font-semibold text-[#FF4D4F] hover:bg-[#ffdad7]/40 cursor-pointer"
          >
            Cerrar Sesión
          </button>
        )}
      </div>

      {/* Main Grid: Left Tabs & Right Content */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Tabs Nav */}
        <div className="lg:col-span-4 glass-panel rounded-2xl p-4 shadow-sm space-y-1.5 border border-white/60">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-white/80 text-[#FF4D4F] shadow-xs'
                : 'text-[#5b403e] hover:bg-white/40'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">person</span>
            <span>Datos del Perfil</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer ${
              activeTab === 'addresses'
                ? 'bg-white/80 text-[#FF4D4F] shadow-xs'
                : 'text-[#5b403e] hover:bg-white/40'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">location_on</span>
            <span>Direcciones de Envío</span>
          </button>

          <button
            onClick={() => setActiveTab('payment')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer ${
              activeTab === 'payment'
                ? 'bg-white/80 text-[#FF4D4F] shadow-xs'
                : 'text-[#5b403e] hover:bg-white/40'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">credit_card</span>
            <span>Medios de Pago</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-white/80 text-[#FF4D4F] shadow-xs'
                : 'text-[#5b403e] hover:bg-white/40'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            <span>Historial de Pedidos</span>
          </button>

          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#FF6B5B] to-[#FF4D4F] shadow-md shadow-[#FF4D4F]/30 hover:scale-[1.02] transition-all mt-3 block"
            >
              <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
              <span>Panel de Administración (Backoffice)</span>
            </Link>
          )}
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-8 space-y-6">
          {/* Profile Details Card */}
          <div className="glass-panel rounded-2xl p-6 sm:p-7 shadow-sm space-y-6 border border-white/60">
            <div className="flex justify-between items-center border-b border-white/60 pb-4">
              <div>
                <h3 className="text-base font-bold text-[#1b1c1c]">Información Personal</h3>
                <p className="text-xs text-[#5b403e]">Actualiza tus datos y credenciales</p>
              </div>
              <button className="text-xs font-bold text-[#FF4D4F] hover:underline cursor-pointer">
                Editar Perfil
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                <img
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover shadow-sm border-2 border-white"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDsAngPk9rQZQjrTsirIfkWPnvlCngc9MZQOD_kJo2OHxteBApsxWzBFHZ_fqwFcjLlHiajiU3MbpxrVbUInX6XhkO3ZhM-Zm62bc8_t2j6hIGOiRkKoMOp2U2YX4M9kZVoLWnQ5mVwPFJqp_1-KZoZLotJNNwVdbcajfsMnFMiF020ITw-29dQXpxa2aCgTjujefQQV_K7k2m9xGfmgjkw8pRRbM9bGToT2Syl1OsHVbV-2182g32y"
                />
                <button className="absolute bottom-0 right-0 p-1.5 rounded-full bg-white shadow-xs text-[#5b403e] hover:text-[#FF4D4F] cursor-pointer">
                  <span className="material-symbols-outlined text-[14px]">photo_camera</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 text-xs">
                <div>
                  <span className="text-[#5b403e] block font-medium">Nombre Completo</span>
                  <span className="font-bold text-[#1b1c1c] text-sm">{userName}</span>
                </div>
                <div>
                  <span className="text-[#5b403e] block font-medium">Correo Electrónico</span>
                  <span className="font-bold text-[#1b1c1c] text-sm truncate block">{userEmail}</span>
                </div>
                <div>
                  <span className="text-[#5b403e] block font-medium">Teléfono de Contacto</span>
                  <span className="font-bold text-[#1b1c1c]">+54 9 11 4455-6677</span>
                </div>
                <div>
                  <span className="text-[#5b403e] block font-medium">Membresía</span>
                  <span className="font-bold text-[#FF4D4F] uppercase tracking-wider">Miembro Premium</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2-Column: Addresses & Payment Methods */}
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Addresses */}
            <div className="glass-panel rounded-2xl p-6 shadow-sm space-y-3 border border-white/60">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-[#1b1c1c] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-[#FF4D4F]">home</span>
                  <span>Dirección Principal</span>
                </h4>
                <button className="text-xs text-[#FF4D4F] font-bold hover:underline cursor-pointer">Gestionar</button>
              </div>
              <div className="p-3.5 rounded-xl bg-white/60 text-xs text-[#5b403e] space-y-1">
                <span className="font-bold text-[#1b1c1c] block">{userAddresses[0]?.title || 'Domicilio Principal'}</span>
                <p>{userAddresses[0]?.street_address || 'Av. Libertador 2450, Piso 8'}</p>
                <p>{userAddresses[0]?.city || 'Buenos Aires'}, {userAddresses[0]?.state || 'CABA'}</p>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="glass-panel rounded-2xl p-6 shadow-sm space-y-3 border border-white/60">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-[#1b1c1c] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-[#FF4D4F]">credit_card</span>
                  <span>Tarjeta Guardada</span>
                </h4>
                <button className="text-xs text-[#FF4D4F] font-bold hover:underline cursor-pointer">Editar</button>
              </div>
              <div className="p-3.5 rounded-xl bg-white/60 text-xs text-[#5b403e] space-y-1">
                <span className="font-bold text-[#1b1c1c] block">Tarjeta Principal</span>
                <div className="flex items-center gap-2 font-mono font-bold text-[#1b1c1c]">
                  <span>•••• •••• •••• 4242</span>
                </div>
                <p className="text-[11px]">Vence 12/26</p>
              </div>
            </div>
          </div>

          {/* Recent Orders Section */}
          <div className="glass-panel rounded-2xl p-6 sm:p-7 shadow-sm space-y-4 border border-white/60">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-[#1b1c1c]">Pedidos Recientes</h3>
                <p className="text-xs text-[#5b403e]">Rastrea y gestiona tus compras anteriores</p>
              </div>
              <button className="text-xs font-bold text-[#FF4D4F] hover:underline cursor-pointer">
                Ver Todos
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/60 text-[#5b403e]">
                    <th className="pb-3 font-semibold">N° Orden</th>
                    <th className="pb-3 font-semibold">Fecha</th>
                    <th className="pb-3 font-semibold">Productos</th>
                    <th className="pb-3 font-semibold">Total</th>
                    <th className="pb-3 font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/50">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/30 transition-colors">
                      <td className="py-3 font-mono font-bold text-[#FF4D4F]">{order.id}</td>
                      <td className="py-3 text-[#5b403e]">{order.date}</td>
                      <td className="py-3 text-[#1b1c1c] font-medium truncate max-w-[180px]">{order.items}</td>
                      <td className="py-3 font-bold text-[#1b1c1c]">{order.total}</td>
                      <td className="py-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${order.statusColor}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
