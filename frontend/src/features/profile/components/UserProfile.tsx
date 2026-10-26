import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../../store/useAuthStore'
import { useUserDataStore } from '../../../store/useUserDataStore'

interface UserProfileProps {
  onBack: () => void
}

export const UserProfile: React.FC<UserProfileProps> = ({ onBack }) => {
  const { user, isAuthenticated, clearAuth, updateUser } = useAuthStore()
  const {
    addresses,
    cards,
    orders,
    loadUserData,
    addAddress,
    removeAddress,
    addCard,
    removeCard,
  } = useUserDataStore()

  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'payment' | 'orders'>('profile')

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false)
  const [isAddCardOpen, setIsAddCardOpen] = useState(false)

  // Edit Profile Form State
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')

  // Add Address Form State
  const [newAddrTitle, setNewAddrTitle] = useState('Domicilio Principal')
  const [newAddrStreet, setNewAddrStreet] = useState('')
  const [newAddrCity, setNewAddrCity] = useState('')
  const [newAddrState, setNewAddrState] = useState('Buenos Aires')
  const [newAddrPhone, setNewAddrPhone] = useState('')

  // Add Card Form State
  const [newCardHolder, setNewCardHolder] = useState('')
  const [newCardNumber, setNewCardNumber] = useState('')
  const [newCardExpiry, setNewCardExpiry] = useState('')

  const userEmail = user?.email || ''

  useEffect(() => {
    if (userEmail) {
      loadUserData(userEmail)
    }
  }, [userEmail, loadUserData])

  useEffect(() => {
    if (user) {
      setEditName(user.full_name || '')
      setEditPhone(user.phone || '+54 9 11 4455-6677')
    }
  }, [user])

  const userName = user?.full_name || 'Usuario'
  const isAdmin = user?.role === 'admin'
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    : 'Reciente'

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    updateUser({
      full_name: editName.trim() || userName,
      phone: editPhone.trim(),
    })
    setIsEditProfileOpen(false)
  }

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAddrStreet || !newAddrCity) return

    addAddress(userEmail, {
      title: newAddrTitle || 'Domicilio',
      recipient_name: userName,
      recipient_phone: newAddrPhone || editPhone || '+54 9 11 ...',
      street_address: newAddrStreet,
      city: newAddrCity,
      state: newAddrState,
      is_default: addresses.length === 0,
    })

    setNewAddrStreet('')
    setNewAddrCity('')
    setIsAddAddressOpen(false)
  }

  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCardNumber || !newCardExpiry) return

    const rawNum = newCardNumber.replace(/\s+/g, '')
    const last4 = rawNum.slice(-4) || '4242'
    const brand = rawNum.startsWith('4') ? 'visa' : rawNum.startsWith('5') ? 'mastercard' : 'other'

    addCard(userEmail, {
      cardholder_name: newCardHolder || userName,
      brand,
      last4,
      expiry: newCardExpiry,
      is_default: cards.length === 0,
    })

    setNewCardNumber('')
    setNewCardExpiry('')
    setNewCardHolder('')
    setIsAddCardOpen(false)
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-6 font-dm text-[#121314]">
        <div className="w-20 h-20 rounded-2xl bg-white border-2 border-[#121314] neo-box-shadow flex items-center justify-center mx-auto text-[#121314]">
          <span className="material-symbols-outlined text-[40px]">person_off</span>
        </div>
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-[#121314]">Inicia Sesión para ver tu Cuenta</h2>
          <p className="text-xs text-[#55575a] font-medium mt-1">
            Accede a tus datos personales, domicilios de entrega y compras realizadas.
          </p>
        </div>
        <Link
          to="/login"
          className="bg-[#0ffcbe] hover:bg-[#00eaad] text-[#121314] font-black text-xs uppercase tracking-wider py-3.5 px-8 rounded-full inline-block border-2 border-[#121314] neo-box-shadow neo-box-shadow-hover transition cursor-pointer"
        >
          Iniciar Sesión
        </Link>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-8 font-dm text-[#121314] max-w-6xl mx-auto py-4 select-none"
    >
      {/* Breadcrumb & Welcome Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-[#121314] pb-6">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#121314] bg-white hover:bg-[#a8d5e3] border-2 border-[#121314] neo-box-shadow-sm transition cursor-pointer mb-2.5"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Volver a la Tienda</span>
          </button>
          <h1 className="text-3xl sm:text-4xl font-black uppercase text-[#121314] tracking-tight">
            Bienvenido de nuevo, {userName.split(' ')[0]}
          </h1>
          <p className="text-xs sm:text-sm text-[#55575a] font-medium mt-0.5">
            Gestiona tus datos, domicilios de entrega y compras realizadas.
          </p>
        </div>

        <button
          onClick={clearAuth}
          className="px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider text-[#121314] bg-white hover:bg-[#ff78ac] border-2 border-[#121314] neo-box-shadow-sm transition cursor-pointer"
        >
          Cerrar Sesión
        </button>
      </div>

      {/* Main Grid: Left Tabs & Right Content */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Tabs Nav */}
        <div className="lg:col-span-4 bg-white border-2 border-[#121314] neo-box-shadow rounded-2xl p-3 sm:p-4 flex lg:flex-col overflow-x-auto lg:overflow-visible gap-2 no-scrollbar">
          <button
            onClick={() => setActiveTab('profile')}
            className={`shrink-0 lg:w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-xs transition-all cursor-pointer whitespace-nowrap border-2 ${
              activeTab === 'profile'
                ? 'bg-[#121314] text-white border-[#121314] neo-box-shadow-sm font-black'
                : 'bg-white text-[#121314] border-transparent hover:bg-[#f6f4ee] font-bold'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[20px]">person</span>
              <span className="uppercase tracking-wider">Datos del Perfil</span>
            </div>
            <span className="material-symbols-outlined text-[16px] hidden lg:inline-block">chevron_right</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`shrink-0 lg:w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-xs transition-all cursor-pointer whitespace-nowrap border-2 ${
              activeTab === 'addresses'
                ? 'bg-[#121314] text-white border-[#121314] neo-box-shadow-sm font-black'
                : 'bg-white text-[#121314] border-transparent hover:bg-[#f6f4ee] font-bold'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[20px]">location_on</span>
              <span className="uppercase tracking-wider">Direcciones</span>
            </div>
            <div className="flex items-center gap-1.5">
              {addresses.length > 0 && (
                <span className="px-2 py-0.5 bg-[#a8d5e3] text-[#121314] font-black text-[10px] rounded-full border border-[#121314]">
                  {addresses.length}
                </span>
              )}
              <span className="material-symbols-outlined text-[16px] hidden lg:inline-block">chevron_right</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('payment')}
            className={`shrink-0 lg:w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-xs transition-all cursor-pointer whitespace-nowrap border-2 ${
              activeTab === 'payment'
                ? 'bg-[#121314] text-white border-[#121314] neo-box-shadow-sm font-black'
                : 'bg-white text-[#121314] border-transparent hover:bg-[#f6f4ee] font-bold'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[20px]">credit_card</span>
              <span className="uppercase tracking-wider">Medios de Pago</span>
            </div>
            <div className="flex items-center gap-1.5">
              {cards.length > 0 && (
                <span className="px-2 py-0.5 bg-[#a8d5e3] text-[#121314] font-black text-[10px] rounded-full border border-[#121314]">
                  {cards.length}
                </span>
              )}
              <span className="material-symbols-outlined text-[16px] hidden lg:inline-block">chevron_right</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`shrink-0 lg:w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-xs transition-all cursor-pointer whitespace-nowrap border-2 ${
              activeTab === 'orders'
                ? 'bg-[#121314] text-white border-[#121314] neo-box-shadow-sm font-black'
                : 'bg-white text-[#121314] border-transparent hover:bg-[#f6f4ee] font-bold'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[20px]">receipt_long</span>
              <span className="uppercase tracking-wider">Historial</span>
            </div>
            <div className="flex items-center gap-1.5">
              {orders.length > 0 && (
                <span className="px-2 py-0.5 bg-[#a8d5e3] text-[#121314] font-black text-[10px] rounded-full border border-[#121314]">
                  {orders.length}
                </span>
              )}
              <span className="material-symbols-outlined text-[16px] hidden lg:inline-block">chevron_right</span>
            </div>
          </button>

          {isAdmin && (
            <Link
              to="/admin"
              className="shrink-0 lg:w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-[#121314] bg-[#0ffcbe] hover:bg-[#00eaad] border-2 border-[#121314] neo-box-shadow neo-box-shadow-hover transition-all lg:mt-3 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
              <span>Panel de Administración</span>
            </Link>
          )}
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {/* TAB 1: DATOS DEL PERFIL */}
            {activeTab === 'profile' && (
              <motion.div
                key="tab-profile"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="bg-white border-2 border-[#121314] neo-box-shadow rounded-2xl p-6 sm:p-8 space-y-6"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b-2 border-[#121314] pb-4">
                  <div>
                    <h3 className="text-lg font-black uppercase text-[#121314] tracking-tight">Información Personal</h3>
                    <p className="text-xs text-[#55575a] font-medium">Tus credenciales y datos de contacto registrados</p>
                  </div>
                  <button
                    onClick={() => setIsEditProfileOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider text-[#121314] bg-white hover:bg-[#a8d5e3] border-2 border-[#121314] neo-box-shadow-sm transition cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                    <span>Editar Perfil</span>
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Monogram Avatar */}
                  <div className="w-20 h-20 rounded-2xl bg-[#106ebe] text-white text-3xl font-black flex items-center justify-center border-2 border-[#121314] neo-box-shadow shrink-0">
                    {userName.charAt(0).toUpperCase()}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 flex-1 text-xs w-full">
                    <div className="p-3.5 bg-[#f6f4ee] rounded-xl border-2 border-[#121314] neo-box-shadow-sm">
                      <span className="text-[#55575a] block font-bold text-[10px] uppercase tracking-wider mb-0.5">Nombre Completo</span>
                      <span className="font-black text-[#121314] text-sm">{userName}</span>
                    </div>

                    <div className="p-3.5 bg-[#f6f4ee] rounded-xl border-2 border-[#121314] neo-box-shadow-sm">
                      <span className="text-[#55575a] block font-bold text-[10px] uppercase tracking-wider mb-0.5">Correo Electrónico</span>
                      <span className="font-black text-[#121314] text-sm truncate block">{userEmail}</span>
                    </div>

                    <div className="p-3.5 bg-[#f6f4ee] rounded-xl border-2 border-[#121314] neo-box-shadow-sm">
                      <span className="text-[#55575a] block font-bold text-[10px] uppercase tracking-wider mb-0.5">Teléfono de Contacto</span>
                      <span className="font-black text-[#121314] text-sm">{user?.phone || '+54 9 11 4455-6677'}</span>
                    </div>

                    <div className="p-3.5 bg-[#f6f4ee] rounded-xl border-2 border-[#121314] neo-box-shadow-sm">
                      <span className="text-[#55575a] block font-bold text-[10px] uppercase tracking-wider mb-0.5">Rol de Usuario</span>
                      <span className={`inline-block font-black text-xs uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-[#121314] ${
                        isAdmin ? 'bg-[#ff78ac] text-[#121314]' : 'bg-[#a8d5e3] text-[#121314]'
                      }`}>
                        {isAdmin ? '👑 ADMINISTRADOR' : 'CLIENTE'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t-2 border-[#121314] text-xs font-bold text-[#55575a] flex justify-between items-center">
                  <span>Miembro desde: <b className="text-[#121314] font-black">{memberSince}</b></span>
                  <span className="px-3 py-1 rounded-full bg-[#0ffcbe] text-[#121314] border border-[#121314] font-black text-[10px] uppercase tracking-wider">
                    Cuenta Verificada
                  </span>
                </div>
              </motion.div>
            )}

            {/* TAB 2: DIRECCIONES DE ENVÍO */}
            {activeTab === 'addresses' && (
              <motion.div
                key="tab-addresses"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="bg-white border-2 border-[#121314] neo-box-shadow rounded-2xl p-6 sm:p-8 space-y-6"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b-2 border-[#121314] pb-4">
                  <div>
                    <h3 className="text-lg font-black uppercase text-[#121314] tracking-tight">Direcciones de Envío</h3>
                    <p className="text-xs text-[#55575a] font-medium">Gestiona tus domicilios de entrega para despachos rápidos</p>
                  </div>
                  <button
                    onClick={() => setIsAddAddressOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider text-[#121314] bg-[#0ffcbe] hover:bg-[#00eaad] border-2 border-[#121314] neo-box-shadow-sm transition cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    <span>Agregar Dirección</span>
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#f6f4ee] border-2 border-[#121314] neo-box-shadow-sm text-[#121314] flex items-center justify-center mx-auto">
                      <span className="material-symbols-outlined text-[32px]">location_off</span>
                    </div>
                    <div>
                      <h4 className="text-base font-black uppercase text-[#121314]">No tienes direcciones guardadas</h4>
                      <p className="text-xs text-[#55575a] font-medium max-w-sm mx-auto mt-1">
                        Cuando realices tu compra podrás guardar tu domicilio, o puedes agregarlo ahora mismo.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsAddAddressOpen(true)}
                      className="px-5 py-2.5 bg-white hover:bg-[#a8d5e3] text-[#121314] border-2 border-[#121314] neo-box-shadow-sm rounded-full text-xs font-black uppercase tracking-wider cursor-pointer"
                    >
                      + Agregar Mi Domicilio
                    </button>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="p-4 rounded-xl bg-[#f6f4ee] border-2 border-[#121314] neo-box-shadow-sm space-y-2 relative"
                      >
                        <div className="flex justify-between items-center border-b border-[#121314]/15 pb-2">
                          <span className="text-xs font-black uppercase text-[#121314] flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[18px] text-[#106ebe]">home</span>
                            {addr.title}
                          </span>
                          <button
                            onClick={() => removeAddress(userEmail, addr.id)}
                            className="text-[11px] text-red-600 hover:underline font-bold cursor-pointer"
                          >
                            Eliminar
                          </button>
                        </div>
                        <p className="text-xs text-[#121314] font-black">{addr.street_address}</p>
                        <p className="text-xs text-[#55575a] font-medium">{addr.city}, {addr.state}</p>
                        <p className="text-[11px] text-[#55575a] font-bold">📞 {addr.recipient_phone}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 3: MEDIOS DE PAGO */}
            {activeTab === 'payment' && (
              <motion.div
                key="tab-payment"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="bg-white border-2 border-[#121314] neo-box-shadow rounded-2xl p-6 sm:p-8 space-y-6"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b-2 border-[#121314] pb-4">
                  <div>
                    <h3 className="text-lg font-black uppercase text-[#121314] tracking-tight">Medios de Pago Guardados</h3>
                    <p className="text-xs text-[#55575a] font-medium">Tus tarjetas autorizadas para compras directas</p>
                  </div>
                  <button
                    onClick={() => setIsAddCardOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider text-[#121314] bg-[#0ffcbe] hover:bg-[#00eaad] border-2 border-[#121314] neo-box-shadow-sm transition cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    <span>Agregar Tarjeta</span>
                  </button>
                </div>

                {cards.length === 0 ? (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#f6f4ee] border-2 border-[#121314] neo-box-shadow-sm text-[#121314] flex items-center justify-center mx-auto">
                      <span className="material-symbols-outlined text-[32px]">credit_card_off</span>
                    </div>
                    <div>
                      <h4 className="text-base font-black uppercase text-[#121314]">No tienes tarjetas guardadas</h4>
                      <p className="text-xs text-[#55575a] font-medium max-w-sm mx-auto mt-1">
                        Por seguridad, solo guardamos los datos de tus tarjetas si seleccionas la opción al momento del checkout.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsAddCardOpen(true)}
                      className="px-5 py-2.5 bg-white hover:bg-[#a8d5e3] text-[#121314] border-2 border-[#121314] neo-box-shadow-sm rounded-full text-xs font-black uppercase tracking-wider cursor-pointer"
                    >
                      + Guardar una Tarjeta
                    </button>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {cards.map((c) => (
                      <div
                        key={c.id}
                        className="p-5 rounded-2xl bg-[#121314] text-white border-2 border-[#121314] neo-box-shadow space-y-3"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-black text-xs uppercase tracking-wider text-[#0ffcbe]">{c.brand}</span>
                          <button
                            onClick={() => removeCard(userEmail, c.id)}
                            className="text-[10px] text-gray-400 hover:text-red-400 font-bold cursor-pointer"
                          >
                            Eliminar
                          </button>
                        </div>
                        <p className="font-mono text-sm tracking-widest font-bold">•••• •••• •••• {c.last4}</p>
                        <div className="flex justify-between text-[11px] text-gray-300 font-bold pt-1 border-t border-white/15">
                          <span>{c.cardholder_name}</span>
                          <span>Vence {c.expiry}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 4: HISTORIAL DE PEDIDOS */}
            {activeTab === 'orders' && (
              <motion.div
                key="tab-orders"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="bg-white border-2 border-[#121314] neo-box-shadow rounded-2xl p-6 sm:p-8 space-y-6"
              >
                <div className="border-b-2 border-[#121314] pb-4">
                  <h3 className="text-lg font-black uppercase text-[#121314] tracking-tight">Historial de Pedidos</h3>
                  <p className="text-xs text-[#55575a] font-medium">Tus compras realizadas y comprobantes de pago</p>
                </div>

                {orders.length === 0 ? (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#f6f4ee] border-2 border-[#121314] neo-box-shadow-sm text-[#121314] flex items-center justify-center mx-auto">
                      <span className="material-symbols-outlined text-[32px]">shopping_bag</span>
                    </div>
                    <div>
                      <h4 className="text-base font-black uppercase text-[#121314]">Aún no has realizado pedidos</h4>
                      <p className="text-xs text-[#55575a] font-medium max-w-sm mx-auto mt-1">
                        Cada vez que compres con Mercado Pago o transferencia, verás el estado en vivo de tu orden aquí.
                      </p>
                    </div>
                    <button
                      onClick={onBack}
                      className="px-6 py-3 bg-[#0ffcbe] hover:bg-[#00eaad] text-[#121314] border-2 border-[#121314] neo-box-shadow neo-box-shadow-hover rounded-full text-xs font-black uppercase tracking-wider cursor-pointer"
                    >
                      Explorar Catálogo
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-5 rounded-2xl bg-[#f6f4ee] border-2 border-[#121314] neo-box-shadow-sm space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b-2 border-[#121314]/15 pb-3">
                          <div>
                            <span className="font-mono font-black text-xs text-[#106ebe]">{ord.order_number}</span>
                            <span className="text-[11px] text-[#55575a] font-bold ml-2">• {ord.date}</span>
                          </div>
                          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white border border-[#121314] text-[#121314]">
                            {ord.status}
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          {ord.items.map((it, idx) => (
                            <div key={it.id + idx} className="flex items-center gap-3 text-xs bg-white p-2.5 rounded-xl border border-[#121314]/15">
                              <img
                                src={it.image}
                                alt={it.title}
                                className="w-12 h-12 rounded-lg object-contain bg-[#f6f4ee] p-1 border border-[#121314]/20"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-black text-[#121314] truncate uppercase">{it.title}</p>
                                <p className="text-[11px] text-[#55575a] font-bold">Cant: {it.quantity}</p>
                              </div>
                              <span className="font-black text-[#121314] text-sm">${(it.price * it.quantity).toFixed(2)} ARS</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t-2 border-[#121314]/15 text-xs font-bold">
                          <span className="text-[#55575a]">
                            Medio de Pago: <b className="capitalize text-[#106ebe] font-black">{ord.payment_method}</b>
                          </span>
                          <span className="text-base font-black text-[#121314]">
                            Total: ${ord.total.toFixed(2)} ARS
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* MODAL: EDITAR PERFIL */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#121314]/50 backdrop-blur-xs">
          <div className="bg-white border-2 border-[#121314] neo-box-shadow rounded-2xl p-6 sm:p-7 max-w-md w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b-2 border-[#121314] pb-3">
              <h3 className="text-base font-black uppercase text-[#121314]">Editar Datos del Perfil</h3>
              <button
                onClick={() => setIsEditProfileOpen(false)}
                className="w-8 h-8 rounded-lg bg-[#f6f4ee] border border-[#121314] flex items-center justify-center text-[#121314] hover:bg-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-bold">
              <div>
                <label className="text-[#55575a] block mb-1 uppercase text-[10px] tracking-wider">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#f6f4ee] border-2 border-[#121314] rounded-xl px-3.5 py-2.5 text-xs text-[#121314] outline-none font-bold"
                />
              </div>

              <div>
                <label className="text-[#55575a] block mb-1 uppercase text-[10px] tracking-wider">Teléfono de Contacto</label>
                <input
                  type="text"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full bg-[#f6f4ee] border-2 border-[#121314] rounded-xl px-3.5 py-2.5 text-xs text-[#121314] outline-none font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#121314]/15">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-bold text-[#121314] bg-white hover:bg-[#f6f4ee] border-2 border-[#121314] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#0ffcbe] hover:bg-[#00eaad] text-[#121314] border-2 border-[#121314] neo-box-shadow-sm px-5 py-2 rounded-full text-xs font-black uppercase cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: AGREGAR DIRECCIÓN */}
      {isAddAddressOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#121314]/50 backdrop-blur-xs">
          <div className="bg-white border-2 border-[#121314] neo-box-shadow rounded-2xl p-6 sm:p-7 max-w-md w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b-2 border-[#121314] pb-3">
              <h3 className="text-base font-black uppercase text-[#121314]">Agregar Dirección de Envío</h3>
              <button
                onClick={() => setIsAddAddressOpen(false)}
                className="w-8 h-8 rounded-lg bg-[#f6f4ee] border border-[#121314] flex items-center justify-center text-[#121314] hover:bg-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-3 text-xs font-bold">
              <div>
                <label className="text-[#55575a] block mb-1 uppercase text-[10px] tracking-wider">Identificador (ej. Casa, Oficina)</label>
                <input
                  type="text"
                  required
                  value={newAddrTitle}
                  onChange={(e) => setNewAddrTitle(e.target.value)}
                  className="w-full bg-[#f6f4ee] border-2 border-[#121314] rounded-xl px-3.5 py-2.5 text-xs text-[#121314] outline-none font-bold"
                  placeholder="Mi Casa"
                />
              </div>

              <div>
                <label className="text-[#55575a] block mb-1 uppercase text-[10px] tracking-wider">Calle y Número, Piso / Dpto</label>
                <input
                  type="text"
                  required
                  value={newAddrStreet}
                  onChange={(e) => setNewAddrStreet(e.target.value)}
                  className="w-full bg-[#f6f4ee] border-2 border-[#121314] rounded-xl px-3.5 py-2.5 text-xs text-[#121314] outline-none font-bold"
                  placeholder="Av. Santa Fe 1234, 4° A"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#55575a] block mb-1 uppercase text-[10px] tracking-wider">Ciudad</label>
                  <input
                    type="text"
                    required
                    value={newAddrCity}
                    onChange={(e) => setNewAddrCity(e.target.value)}
                    className="w-full bg-[#f6f4ee] border-2 border-[#121314] rounded-xl px-3.5 py-2.5 text-xs text-[#121314] outline-none font-bold"
                    placeholder="Buenos Aires"
                  />
                </div>
                <div>
                  <label className="text-[#55575a] block mb-1 uppercase text-[10px] tracking-wider">Provincia</label>
                  <input
                    type="text"
                    required
                    value={newAddrState}
                    onChange={(e) => setNewAddrState(e.target.value)}
                    className="w-full bg-[#f6f4ee] border-2 border-[#121314] rounded-xl px-3.5 py-2.5 text-xs text-[#121314] outline-none font-bold"
                    placeholder="CABA"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#55575a] block mb-1 uppercase text-[10px] tracking-wider">Teléfono para Entrega</label>
                <input
                  type="text"
                  value={newAddrPhone}
                  onChange={(e) => setNewAddrPhone(e.target.value)}
                  className="w-full bg-[#f6f4ee] border-2 border-[#121314] rounded-xl px-3.5 py-2.5 text-xs text-[#121314] outline-none font-bold"
                  placeholder="+54 9 11..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#121314]/15">
                <button
                  type="button"
                  onClick={() => setIsAddAddressOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-bold text-[#121314] bg-white hover:bg-[#f6f4ee] border-2 border-[#121314] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#0ffcbe] hover:bg-[#00eaad] text-[#121314] border-2 border-[#121314] neo-box-shadow-sm px-5 py-2 rounded-full text-xs font-black uppercase cursor-pointer"
                >
                  Guardar Dirección
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: AGREGAR TARJETA */}
      {isAddCardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#121314]/50 backdrop-blur-xs">
          <div className="bg-white border-2 border-[#121314] neo-box-shadow rounded-2xl p-6 sm:p-7 max-w-md w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b-2 border-[#121314] pb-3">
              <h3 className="text-base font-black uppercase text-[#121314]">Guardar Tarjeta</h3>
              <button
                onClick={() => setIsAddCardOpen(false)}
                className="w-8 h-8 rounded-lg bg-[#f6f4ee] border border-[#121314] flex items-center justify-center text-[#121314] hover:bg-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveCard} className="space-y-3 text-xs font-bold">
              <div>
                <label className="text-[#55575a] block mb-1 uppercase text-[10px] tracking-wider">Titular de la Tarjeta</label>
                <input
                  type="text"
                  required
                  value={newCardHolder}
                  onChange={(e) => setNewCardHolder(e.target.value)}
                  className="w-full bg-[#f6f4ee] border-2 border-[#121314] rounded-xl px-3.5 py-2.5 text-xs text-[#121314] outline-none font-bold"
                  placeholder="Como figura en el plástico"
                />
              </div>

              <div>
                <label className="text-[#55575a] block mb-1 uppercase text-[10px] tracking-wider">Número de Tarjeta</label>
                <input
                  type="text"
                  required
                  value={newCardNumber}
                  onChange={(e) => setNewCardNumber(e.target.value)}
                  className="w-full bg-[#f6f4ee] border-2 border-[#121314] rounded-xl px-3.5 py-2.5 font-mono text-xs text-[#121314] outline-none font-bold"
                  placeholder="4242 4242 4242 4242"
                />
              </div>

              <div>
                <label className="text-[#55575a] block mb-1 uppercase text-[10px] tracking-wider">Vencimiento (MM/AA)</label>
                <input
                  type="text"
                  required
                  value={newCardExpiry}
                  onChange={(e) => setNewCardExpiry(e.target.value)}
                  className="w-full bg-[#f6f4ee] border-2 border-[#121314] rounded-xl px-3.5 py-2.5 font-mono text-xs text-[#121314] outline-none font-bold"
                  placeholder="12/28"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#121314]/15">
                <button
                  type="button"
                  onClick={() => setIsAddCardOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-bold text-[#121314] bg-white hover:bg-[#f6f4ee] border-2 border-[#121314] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#0ffcbe] hover:bg-[#00eaad] text-[#121314] border-2 border-[#121314] neo-box-shadow-sm px-5 py-2 rounded-full text-xs font-black uppercase cursor-pointer"
                >
                  Guardar Tarjeta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default UserProfile
