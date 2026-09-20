import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '../../../store/useCartStore'

interface CartDrawerProps {
  onProceedToCheckout: () => void
  accentColor?: string
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onProceedToCheckout,
  accentColor = '#f43f5e',
}) => {
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    removeItem,
    updateQuantity,
  } = useCartStore()

  const activeAccent = accentColor

  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0)
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const total = subtotal

  const handleCheckoutClick = () => {
    closeDrawer()
    onProceedToCheckout()
  }

  const formatARS = (amount: number) => {
    return `$${Math.round(amount).toLocaleString('es-AR')}`
  }

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-['Montserrat',sans-serif] text-sm selection:bg-white selection:text-black">
          {/* 1. Backdrop Blur Overlay with Soft Vignette for 3D visibility */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeDrawer}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs cursor-pointer"
          />

          {/* 2. Slide-out Drawer Panel with Frosted Glass Transparency */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10 pointer-events-none">
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="pointer-events-auto w-screen max-w-md bg-[#0a0a0f]/70 backdrop-blur-3xl border-l border-white/15 shadow-[0_0_80px_rgba(0,0,0,0.8)] flex flex-col justify-between text-white relative overflow-hidden"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 80% 0%, ${activeAccent}33 0%, transparent 60%),
                  radial-gradient(circle at 10% 90%, rgba(255, 255, 255, 0.04) 0%, transparent 55%)
                `,
              }}
            >
              {/* Subtle Ambient Lotus Watermark in Drawer Background */}
              <div className="absolute -bottom-24 -right-24 w-96 h-96 pointer-events-none opacity-[0.03] text-white">
                <svg viewBox="-250 -250 500 500" className="w-full h-full" fill="currentColor">
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                    <g key={`drawer-lotus-${i}`} transform={`rotate(${angle})`}>
                      <path
                        d="M 0 -85 C 58 -115 68 -180 0 -235 C -68 -180 -58 -115 0 -85 Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                    </g>
                  ))}
                  <circle cx="0" cy="0" r="75" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>

              {/* ================================================================= */}
              {/* DRAWER HEADER                                                     */}
              {/* ================================================================= */}
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/30 backdrop-blur-xl relative z-10">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-1.5 h-1.5 rounded-full transition-all duration-500"
                      style={{
                        backgroundColor: activeAccent,
                        boxShadow: `0 0 10px ${activeAccent}`,
                      }}
                    />
                    <span
                      className="text-[10px] tracking-[0.25em] uppercase font-bold transition-colors duration-500"
                      style={{ color: activeAccent }}
                    >
                      Cesta Privada • LUMINA
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                    <span>Tu Selección</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-white/90 font-medium">
                      {totalQuantity} {totalQuantity === 1 ? 'ítem' : 'ítems'}
                    </span>
                  </h2>
                </div>

                <button
                  onClick={closeDrawer}
                  className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:border-white/30 text-white/70 hover:text-white flex items-center justify-center transition backdrop-blur-md cursor-pointer group"
                  title="Cerrar Carrito"
                  aria-label="Cerrar Carrito"
                >
                  <svg
                    className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                  </svg>
                </button>
              </div>

              {/* ================================================================= */}
              {/* ITEMS LIST / EMPTY STATE                                          */}
              {/* ================================================================= */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 relative z-10 scrollbar-thin scrollbar-thumb-white/10">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
                    <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 shadow-inner">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                        />
                      </svg>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-white tracking-tight">Tu cesta está vacía</h3>
                      <p className="text-xs text-gray-400 max-w-xs leading-relaxed font-light">
                        Aún no has añadido fragancias a tu selección privada. Explora nuestra Colección Exclusiva.
                      </p>
                    </div>
                    <button
                      onClick={closeDrawer}
                      className="px-6 py-2.5 rounded-full bg-white text-black text-xs font-bold hover:bg-neutral-200 transition shadow-lg shadow-white/5 active:scale-95 cursor-pointer mt-2"
                    >
                      Explorar Colección
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Free shipping benefit pill */}
                    <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors duration-500"
                        style={{
                          backgroundColor: `${activeAccent}20`,
                          color: activeAccent,
                        }}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                        </svg>
                      </div>
                      <div className="text-[11px] leading-tight text-gray-300">
                        <span className="font-semibold text-white">Envío asegurado de cortesía</span> incluido a todo el país.
                      </div>
                    </div>

                    {/* Perfumes list */}
                    {items.map((item) => (
                      <div
                        key={item.id + (item.variant || '')}
                        className="group relative rounded-2xl p-4 bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 hover:border-white/20 transition-all duration-300 flex gap-4 items-center"
                      >
                        {/* Flacon preview frame */}
                        <div className="w-20 h-24 rounded-xl bg-gradient-to-b from-white/5 to-black/60 border border-white/10 flex items-center justify-center p-2 shrink-0 relative overflow-hidden">
                          <div className="absolute inset-0 bg-radial from-rose-500/10 to-transparent pointer-events-none" />
                          <img
                            src={item.image}
                            alt={item.title}
                            className="max-h-full max-w-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] group-hover:scale-105 transition duration-300"
                          />
                        </div>

                        {/* Perfume info & actions */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
                          <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0">
                              <h3 className="text-sm font-bold text-white tracking-tight truncate">
                                {item.title}
                              </h3>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-gray-300 font-medium">
                                  {item.variant || '100ml'}
                                </span>
                                {item.category && (
                                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                                    • {item.category}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Remove button */}
                            <button
                              onClick={() => removeItem(item.id, item.variant)}
                              className="text-gray-500 hover:text-rose-400 p-1 transition cursor-pointer"
                              title="Eliminar de la cesta"
                              aria-label="Eliminar de la cesta"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="1.6"
                                />
                              </svg>
                            </button>
                          </div>

                          {/* Price & Quantity Controls */}
                          <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/[0.06]">
                            {/* Quantity buttons */}
                            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 backdrop-blur-xs">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1, item.variant)}
                                className="w-5 h-5 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer text-xs font-bold"
                                aria-label="Disminuir cantidad"
                              >
                                −
                              </button>
                              <span className="text-xs font-bold text-white min-w-[16px] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1, item.variant)}
                                className="w-5 h-5 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer text-xs font-bold"
                                aria-label="Aumentar cantidad"
                              >
                                +
                              </button>
                            </div>

                            {/* Item total price */}
                            <span className="text-sm font-bold text-white tracking-tight">
                              {formatARS(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* ================================================================= */}
              {/* DRAWER FOOTER (Order Summary & Haute Checkout CTA)               */}
              {/* ================================================================= */}
              {items.length > 0 && (
                <div className="p-6 border-t border-white/10 bg-black/60 backdrop-blur-2xl relative z-10">
                  <div className="flex flex-col gap-2 mb-5 text-xs text-gray-400">
                    <div className="flex justify-between items-center">
                      <span>Subtotal</span>
                      <span className="font-semibold text-white">{formatARS(subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Envío Asegurado Nacional</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        Gratis
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Packaging Haute Parfumerie</span>
                      <span className="text-gray-300 font-medium">Incluido</span>
                    </div>
                    <div className="flex justify-between items-baseline text-base font-bold text-white mt-2 pt-3 border-t border-white/10">
                      <span className="tracking-tight">Total Final</span>
                      <span className="text-2xl font-extrabold text-white tracking-tight">
                        {formatARS(total)}
                      </span>
                    </div>
                  </div>

                  {/* Checkout CTA */}
                  <button
                    onClick={handleCheckoutClick}
                    className="w-full bg-white text-black font-extrabold text-xs tracking-wider uppercase py-4 rounded-full shadow-2xl hover:bg-neutral-200 transition duration-300 active:scale-98 flex justify-center items-center gap-2 cursor-pointer"
                  >
                    <span>Finalizar Pedido</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>
                  </button>

                  {/* Security Reassurance */}
                  <div className="flex items-center justify-center gap-2 text-[10px] text-gray-500 mt-3.5">
                    <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Transacción segura cifrada • Hasta 6 cuotas sin interés</span>
                  </div>
                </div>
              )}
            </motion.aside>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
