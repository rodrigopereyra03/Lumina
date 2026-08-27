import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '../../../store/useCartStore'

interface CartDrawerProps {
  onProceedToCheckout: () => void
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout }) => {
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    removeItem,
    updateQuantity,
    getSubtotal,
    getTotal,
  } = useCartStore()

  const subtotal = getSubtotal()
  const total = getTotal()
  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0)

  const handleCheckoutClick = () => {
    closeDrawer()
    onProceedToCheckout()
  }

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-body text-[#1b1c1c]">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeDrawer}
            className="absolute inset-0 bg-[#1b1c1c]/25 backdrop-blur-xs cursor-pointer"
          />

          {/* Slide-out Drawer Panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-screen max-w-md bg-[#fbf9f8]/95 backdrop-blur-[20px] border-l border-white/40 shadow-2xl flex flex-col justify-between"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-white/40 flex justify-between items-center bg-white/30">
                <h2 className="text-xl font-bold text-[#1b1c1c]">
                  Tu Carrito ({totalQuantity})
                </h2>
                <button
                  onClick={closeDrawer}
                  className="p-1.5 text-[#5b403e] hover:text-[#1b1c1c] hover:bg-white/60 rounded-full transition-colors cursor-pointer"
                  title="Cerrar Carrito"
                >
                  <span className="material-symbols-outlined text-[22px]">close</span>
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-16">
                    <div className="w-16 h-16 rounded-2xl bg-white/60 flex items-center justify-center text-[#5b403e]/60">
                      <span className="material-symbols-outlined text-[32px]">shopping_cart</span>
                    </div>
                    <h3 className="text-base font-bold text-[#1b1c1c]">Tu carrito está vacío</h3>
                    <p className="text-xs text-[#5b403e] max-w-xs">
                      Explora nuestros productos exclusivos y añade tus favoritos.
                    </p>
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.id + (item.variant || '')}
                      className="glass-item rounded-2xl p-4 flex gap-4 items-center border border-white/60"
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-20 h-20 object-contain rounded-xl bg-white/60 p-2 mix-blend-multiply shrink-0"
                      />

                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <div className="flex justify-between items-start">
                          <h3 className="text-xs font-bold text-[#1b1c1c] truncate pr-1">
                            {item.title}
                          </h3>
                          <span className="text-xs font-bold text-[#1b1c1c] shrink-0">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>

                        <p className="text-[11px] text-[#5b403e]">
                          {item.variant || 'Estándar'}
                        </p>

                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center gap-1.5 border border-white/80 rounded-full px-2.5 py-0.5 bg-white/70 shadow-2xs">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1, item.variant)}
                              className="text-[#5b403e] hover:text-[#FF4D4F] transition-colors cursor-pointer flex items-center"
                            >
                              <span className="material-symbols-outlined text-[16px]">remove</span>
                            </button>
                            <span className="text-xs font-bold text-[#1b1c1c] min-w-[20px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1, item.variant)}
                              className="text-[#5b403e] hover:text-[#FF4D4F] transition-colors cursor-pointer flex items-center"
                            >
                              <span className="material-symbols-outlined text-[16px]">add</span>
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.id, item.variant)}
                            className="text-[#5b403e] hover:text-[#ba1a1a] text-[11px] underline cursor-pointer"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Footer */}
              {items.length > 0 && (
                <div className="p-6 border-t border-white/40 bg-[#fbf9f8]/90 backdrop-blur-md">
                  <div className="flex flex-col gap-2 mb-4 text-xs text-[#5b403e]">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold text-[#1b1c1c]">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Envío</span>
                      <span>{subtotal >= 150 ? 'Gratis' : 'Calculado en el checkout'}</span>
                    </div>
                    <div className="flex justify-between items-baseline text-base font-bold text-[#1b1c1c] mt-1 pt-2 border-t border-white/60">
                      <span>Total</span>
                      <span className="text-xl font-bold text-[#FF4D4F]">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckoutClick}
                    className="w-full bg-[#FF4D4F] text-white text-xs font-bold py-3.5 rounded-xl shadow-md hover:bg-[#E04345] transition-all flex justify-center items-center gap-1.5 cursor-pointer"
                  >
                    <span>Proceder al Pago</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>

                  <p className="text-center text-[10px] text-[#5b403e] mt-2.5">
                    Impuestos y descuentos aplicados al finalizar la compra.
                  </p>
                </div>
              )}
            </motion.aside>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
