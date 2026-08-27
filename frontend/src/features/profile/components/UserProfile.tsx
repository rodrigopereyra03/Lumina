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
  const userRole = user?.role === 'admin' ? '👑 Administrador' : 'Cliente'
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
      <div className="max-w-md mx-auto py-16 text-center space-y-6 font-body text-[#1b1c1c]">
        <div className="w-20 h-20 rounded-full bg-[#ffdad7]/50 text-[#FF4D4F] flex items-center justify-center mx-auto shadow-sm">
          <span className="material-symbols-outlined text-[40px]">person_off</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#1b1c1c]">Inicia Sesión para ver tu Cuenta</h2>
          <p className="text-xs text-[#5b403e] mt-1">
            Accede a tus datos personales, direcciones de envío y pedidos realizados.
          </p>
        </div>
        <Link
          to="/login"
          className="btn-primary py-3 px-8 rounded-full text-xs font-bold inline-block shadow-md"
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
      className="space-y-8 font-body text-[#1b1c1c] max-w-6xl mx-auto"
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
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1b1c1c] tracking-tight">
            Bienvenido de nuevo, {userName.split(' ')[0]}
          </h1>
          <p className="text-xs sm:text-sm text-[#5b403e] mt-0.5">
            Gestiona tus datos, domicilios de entrega y compras realizadas.
          </p>
        </div>

        <button
          onClick={clearAuth}
          className="px-4 py-2 rounded-full glass-button-secondary text-xs font-bold text-[#FF4D4F] hover:bg-[#ffdad7]/40 cursor-pointer transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>

      {/* Main Grid: Left Tabs & Right Content */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Tabs Nav */}
        <div className="lg:col-span-4 glass-panel rounded-2xl p-3 sm:p-4 shadow-sm space-y-1.5 border border-white/60">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-white text-[#FF4D4F] shadow-sm font-bold'
                : 'text-[#5b403e] hover:bg-white/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px]">person</span>
              <span>Datos del Perfil</span>
            </div>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'addresses'
                ? 'bg-white text-[#FF4D4F] shadow-sm font-bold'
                : 'text-[#5b403e] hover:bg-white/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px]">location_on</span>
              <span>Direcciones de Envío</span>
            </div>
            {addresses.length > 0 && (
              <span className="px-2 py-0.5 bg-[#FF4D4F]/10 text-[#FF4D4F] font-bold text-[10px] rounded-full">
                {addresses.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('payment')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'payment'
                ? 'bg-white text-[#FF4D4F] shadow-sm font-bold'
                : 'text-[#5b403e] hover:bg-white/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px]">credit_card</span>
              <span>Medios de Pago</span>
            </div>
            {cards.length > 0 && (
              <span className="px-2 py-0.5 bg-[#FF4D4F]/10 text-[#FF4D4F] font-bold text-[10px] rounded-full">
                {cards.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-white text-[#FF4D4F] shadow-sm font-bold'
                : 'text-[#5b403e] hover:bg-white/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px]">receipt_long</span>
              <span>Historial de Pedidos</span>
            </div>
            {orders.length > 0 && (
              <span className="px-2 py-0.5 bg-[#FF4D4F]/10 text-[#FF4D4F] font-bold text-[10px] rounded-full">
                {orders.length}
              </span>
            )}
          </button>

          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#FF6B5B] to-[#FF4D4F] shadow-md shadow-[#FF4D4F]/30 hover:scale-[1.02] transition-all mt-4 block"
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
                className="glass-panel rounded-2xl p-6 sm:p-7 shadow-sm space-y-6 border border-white/60"
              >
                <div className="flex justify-between items-center border-b border-white/60 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-[#1b1c1c]">Información Personal</h3>
                    <p className="text-xs text-[#5b403e]">Tus credenciales y datos de contacto registrados</p>
                  </div>
                  <button
                    onClick={() => setIsEditProfileOpen(true)}
                    className="text-xs font-bold text-[#FF4D4F] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                    <span>Editar Perfil</span>
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#FF6B5B] to-[#FF4D4F] text-white text-2xl font-bold flex items-center justify-center shadow-md border-2 border-white shrink-0">
                    {userName.charAt(0).toUpperCase()}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 text-xs w-full">
                    <div className="p-3 bg-white/50 rounded-xl border border-white/70">
                      <span className="text-[#5b403e] block font-medium text-[11px]">Nombre Completo</span>
                      <span className="font-bold text-[#1b1c1c] text-sm">{userName}</span>
                    </div>

                    <div className="p-3 bg-white/50 rounded-xl border border-white/70">
                      <span className="text-[#5b403e] block font-medium text-[11px]">Correo Electrónico</span>
                      <span className="font-bold text-[#1b1c1c] text-sm truncate block">{userEmail}</span>
                    </div>

                    <div className="p-3 bg-white/50 rounded-xl border border-white/70">
                      <span className="text-[#5b403e] block font-medium text-[11px]">Teléfono de Contacto</span>
                      <span className="font-bold text-[#1b1c1c] text-sm">{user?.phone || '+54 9 11 4455-6677'}</span>
                    </div>

                    <div className="p-3 bg-white/50 rounded-xl border border-white/70">
                      <span className="text-[#5b403e] block font-medium text-[11px]">Rol de Usuario</span>
                      <span className="font-bold text-[#FF4D4F] text-sm uppercase tracking-wider">{userRole}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/60 text-xs text-[#5b403e] flex justify-between items-center">
                  <span>Miembro desde: <b>{memberSince}</b></span>
                  <span className="px-2.5 py-1 rounded-full bg-[#E8F8F0] text-[#1E824C] font-bold text-[10px]">
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
                className="glass-panel rounded-2xl p-6 sm:p-7 shadow-sm space-y-6 border border-white/60"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/60 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-[#1b1c1c]">Direcciones de Envío</h3>
                    <p className="text-xs text-[#5b403e]">Gestiona tus domicilios de entrega para despachos rápidos</p>
                  </div>
                  <button
                    onClick={() => setIsAddAddressOpen(true)}
                    className="btn-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    <span>Agregar Dirección</span>
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-[#f0eded] text-[#5b403e] flex items-center justify-center mx-auto shadow-xs">
                      <span className="material-symbols-outlined text-[32px]">location_off</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#1b1c1c]">No tienes direcciones guardadas</h4>
                      <p className="text-xs text-[#5b403e] max-w-sm mx-auto mt-1">
                        Cuando realices tu primera compra podrás guardar tu domicilio, o puedes agregarlo ahora mismo.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsAddAddressOpen(true)}
                      className="px-5 py-2.5 bg-white/80 hover:bg-white text-[#FF4D4F] border border-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                    >
                      + Agregar Mi Domicilio
                    </button>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="p-4 rounded-2xl bg-white/70 border border-white shadow-xs space-y-2 relative group"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-[#1b1c1c] flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[18px] text-[#FF4D4F]">home</span>
                            {addr.title}
                          </span>
                          <button
                            onClick={() => removeAddress(userEmail, addr.id)}
                            className="text-[11px] text-red-500 hover:underline font-bold cursor-pointer"
                          >
                            Eliminar
                          </button>
                        </div>
                        <p className="text-xs text-[#1b1c1c] font-medium">{addr.street_address}</p>
                        <p className="text-xs text-[#5b403e]">{addr.city}, {addr.state}</p>
                        <p className="text-[11px] text-[#5b403e]">📞 {addr.recipient_phone}</p>
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
                className="glass-panel rounded-2xl p-6 sm:p-7 shadow-sm space-y-6 border border-white/60"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/60 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-[#1b1c1c]">Medios de Pago Guardados</h3>
                    <p className="text-xs text-[#5b403e]">Tus tarjetas autorizadas para compras directas</p>
                  </div>
                  <button
                    onClick={() => setIsAddCardOpen(true)}
                    className="btn-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    <span>Agregar Tarjeta</span>
                  </button>
                </div>

                {cards.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-[#f0eded] text-[#5b403e] flex items-center justify-center mx-auto shadow-xs">
                      <span className="material-symbols-outlined text-[32px]">credit_card_off</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#1b1c1c]">No tienes tarjetas guardadas</h4>
                      <p className="text-xs text-[#5b403e] max-w-sm mx-auto mt-1">
                        Por seguridad, solo guardamos los datos de tus tarjetas si seleccionas la opción al momento del checkout.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsAddCardOpen(true)}
                      className="px-5 py-2.5 bg-white/80 hover:bg-white text-[#FF4D4F] border border-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                    >
                      + Guardar una Tarjeta
                    </button>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {cards.map((c) => (
                      <div
                        key={c.id}
                        className="p-4 rounded-2xl bg-gradient-to-tr from-[#1b1c1c] to-[#3a3b3c] text-white shadow-md space-y-3"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-xs uppercase tracking-wider">{c.brand}</span>
                          <button
                            onClick={() => removeCard(userEmail, c.id)}
                            className="text-[10px] text-white/70 hover:text-red-400 font-bold cursor-pointer"
                          >
                            Eliminar
                          </button>
                        </div>
                        <p className="font-mono text-sm tracking-widest">•••• •••• •••• {c.last4}</p>
                        <div className="flex justify-between text-[10px] text-white/70 pt-1">
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
                className="glass-panel rounded-2xl p-6 sm:p-7 shadow-sm space-y-6 border border-white/60"
              >
                <div className="border-b border-white/60 pb-4">
                  <h3 className="text-base font-bold text-[#1b1c1c]">Historial de Pedidos</h3>
                  <p className="text-xs text-[#5b403e]">Tus compras realizadas y comprobantes de pago</p>
                </div>

                {orders.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-[#f0eded] text-[#5b403e] flex items-center justify-center mx-auto shadow-xs">
                      <span className="material-symbols-outlined text-[32px]">shopping_bag</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#1b1c1c]">Aún no has realizado pedidos</h4>
                      <p className="text-xs text-[#5b403e] max-w-sm mx-auto mt-1">
                        Cada vez que compres con Mercado Pago o transferencia, verás el estado en vivo de tu orden aquí.
                      </p>
                    </div>
                    <button
                      onClick={onBack}
                      className="btn-primary py-2.5 px-6 rounded-full text-xs font-bold shadow-md cursor-pointer"
                    >
                      Explorar Catálogo
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-4 rounded-2xl bg-white/70 border border-white shadow-xs space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-white/80 pb-2.5">
                          <div>
                            <span className="font-mono font-bold text-xs text-[#FF4D4F]">{ord.order_number}</span>
                            <span className="text-[11px] text-[#5b403e] ml-2">• {ord.date}</span>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${ord.status_color}`}>
                            {ord.status}
                          </span>
                        </div>

                        <div className="space-y-2">
                          {ord.items.map((it, idx) => (
                            <div key={it.id + idx} className="flex items-center gap-3 text-xs">
                              <img
                                src={it.image}
                                alt={it.title}
                                className="w-10 h-10 rounded-xl object-contain bg-white p-1 border border-white/80"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-[#1b1c1c] truncate">{it.title}</p>
                                <p className="text-[11px] text-[#5b403e]">Cant: {it.quantity}</p>
                              </div>
                              <span className="font-bold text-[#1b1c1c]">${(it.price * it.quantity).toFixed(2)} ARS</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-white/80 text-xs">
                          <span className="text-[#5b403e]">
                            Medio de Pago: <b className="capitalize text-[#009EE3]">{ord.payment_method}</b>
                          </span>
                          <span className="text-sm font-extrabold text-[#FF4D4F]">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs">
          <div className="glass-panel rounded-2xl p-6 sm:p-7 max-w-md w-full border border-white shadow-xl space-y-4 bg-white/90">
            <div className="flex justify-between items-center border-b border-white pb-3">
              <h3 className="text-base font-bold text-[#1b1c1c]">Editar Datos del Perfil</h3>
              <button
                onClick={() => setIsEditProfileOpen(false)}
                className="text-[#5b403e] hover:text-[#1b1c1c] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#5b403e] block mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#5b403e] block mb-1">Teléfono de Contacto</label>
                <input
                  type="text"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5b403e] hover:bg-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary px-5 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs">
          <div className="glass-panel rounded-2xl p-6 sm:p-7 max-w-md w-full border border-white shadow-xl space-y-4 bg-white/90">
            <div className="flex justify-between items-center border-b border-white pb-3">
              <h3 className="text-base font-bold text-[#1b1c1c]">Agregar Dirección de Envío</h3>
              <button
                onClick={() => setIsAddAddressOpen(false)}
                className="text-[#5b403e] hover:text-[#1b1c1c] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#5b403e] block mb-1">Identificador (ej. Casa, Oficina)</label>
                <input
                  type="text"
                  required
                  value={newAddrTitle}
                  onChange={(e) => setNewAddrTitle(e.target.value)}
                  className="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs outline-none"
                  placeholder="Mi Casa"
                />
              </div>

              <div>
                <label className="font-bold text-[#5b403e] block mb-1">Calle y Número, Piso / Dpto</label>
                <input
                  type="text"
                  required
                  value={newAddrStreet}
                  onChange={(e) => setNewAddrStreet(e.target.value)}
                  className="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs outline-none"
                  placeholder="Av. Santa Fe 1234, 4° A"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#5b403e] block mb-1">Ciudad</label>
                  <input
                    type="text"
                    required
                    value={newAddrCity}
                    onChange={(e) => setNewAddrCity(e.target.value)}
                    className="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs outline-none"
                    placeholder="Buenos Aires"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#5b403e] block mb-1">Provincia</label>
                  <input
                    type="text"
                    required
                    value={newAddrState}
                    onChange={(e) => setNewAddrState(e.target.value)}
                    className="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs outline-none"
                    placeholder="CABA"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#5b403e] block mb-1">Teléfono para Entrega</label>
                <input
                  type="text"
                  value={newAddrPhone}
                  onChange={(e) => setNewAddrPhone(e.target.value)}
                  className="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs outline-none"
                  placeholder="+54 9 11..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddAddressOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5b403e] hover:bg-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary px-5 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs">
          <div className="glass-panel rounded-2xl p-6 sm:p-7 max-w-md w-full border border-white shadow-xl space-y-4 bg-white/90">
            <div className="flex justify-between items-center border-b border-white pb-3">
              <h3 className="text-base font-bold text-[#1b1c1c]">Guardar Tarjeta</h3>
              <button
                onClick={() => setIsAddCardOpen(false)}
                className="text-[#5b403e] hover:text-[#1b1c1c] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveCard} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#5b403e] block mb-1">Titular de la Tarjeta</label>
                <input
                  type="text"
                  required
                  value={newCardHolder}
                  onChange={(e) => setNewCardHolder(e.target.value)}
                  className="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs outline-none"
                  placeholder="Como figura en el plástico"
                />
              </div>

              <div>
                <label className="font-bold text-[#5b403e] block mb-1">Número de Tarjeta</label>
                <input
                  type="text"
                  required
                  value={newCardNumber}
                  onChange={(e) => setNewCardNumber(e.target.value)}
                  className="glass-input w-full px-3.5 py-2.5 rounded-xl font-mono text-xs outline-none"
                  placeholder="4242 4242 4242 4242"
                />
              </div>

              <div>
                <label className="font-bold text-[#5b403e] block mb-1">Vencimiento (MM/AA)</label>
                <input
                  type="text"
                  required
                  value={newCardExpiry}
                  onChange={(e) => setNewCardExpiry(e.target.value)}
                  className="glass-input w-full px-3.5 py-2.5 rounded-xl font-mono text-xs outline-none"
                  placeholder="12/28"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCardOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5b403e] hover:bg-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary px-5 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer"
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
