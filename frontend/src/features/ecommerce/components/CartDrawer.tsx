import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '../../../store/useCartStore'

interface CartDrawerProps {
  onProceedToCheckout: () => void
  accentColor?: string
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onProceedToCheckout,
  accentColor: _accentColor,
}) => {
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    removeItem,
    updateQuantity,
  } = useCartStore()

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
        <div className="fixed inset-0 z-50 overflow-hidden font-dm text-sm select-none">
          {/* 1. Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeDrawer}
            className="absolute inset-0 bg-[#121314]/50 backdrop-blur-xs cursor-pointer"
          />

          {/* 2. Slide-out Drawer Panel (Neo-Editorial Light Cream) */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10 pointer-events-none">
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="pointer-events-auto w-screen max-w-md bg-[#f6f4ee] border-l-2 border-[#121314] shadow-2xl flex flex-col justify-between text-[#121314] relative overflow-hidden"
            >
              {/* ================================================================= */}
              {/* DRAWER HEADER                                                     */}
              {/* ================================================================= */}
              <div className="p-5 sm:p-6 border-b-2 border-[#121314] flex justify-between items-center bg-white relative z-10">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0ffcbe] border border-[#121314]" />
                    <span className="text-[10px] tracking-[0.25em] uppercase font-dm font-black text-[#106ebe]">
                      CESTA DE COMPRA • FÓRMULA 1370
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-dm font-black uppercase text-[#121314] tracking-tight flex items-center gap-2">
                    <span>Tu Selección</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#a8d5e3] border border-[#121314] text-[#121314] font-bold">
                      {totalQuantity} {totalQuantity === 1 ? 'ítem' : 'ítems'}
                    </span>
                  </h2>
                </div>

                <button
                  onClick={closeDrawer}
                  className="w-10 h-10 rounded-xl bg-white hover:bg-[#f6f4ee] border-2 border-[#121314] neo-box-shadow-sm text-[#121314] flex items-center justify-center transition cursor-pointer active:scale-95"
                  title="Cerrar Carrito"
                  aria-label="Cerrar Carrito"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              {/* ================================================================= */}
              {/* ITEMS LIST / EMPTY STATE                                          */}
              {/* ================================================================= */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3.5 relative z-10">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
                    <div className="w-20 h-20 rounded-2xl bg-white border-2 border-[#121314] neo-box-shadow flex items-center justify-center text-[#121314]">
                      <span className="material-symbols-outlined text-4xl">shopping_bag</span>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-dm font-black uppercase text-[#121314] tracking-tight">Tu cesta está vacía</h3>
                      <p className="text-xs text-[#55575a] max-w-xs font-dm font-medium">
                        Aún no has añadido fragancias a tu pedido. Explora nuestro catálogo y descubre tu próximo aroma de autor.
                      </p>
                    </div>
                    <button
                      onClick={closeDrawer}
                      className="px-6 py-3 rounded-full bg-[#0ffcbe] hover:bg-[#00eaad] text-[#121314] font-dm font-black text-xs uppercase tracking-wider border-2 border-[#121314] neo-box-shadow neo-box-shadow-hover transition cursor-pointer mt-2"
                    >
                      Explorar Catálogo
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Free shipping benefit pill */}
                    <div className="p-3 rounded-xl bg-white border-2 border-[#121314] neo-box-shadow-sm flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#0ffcbe] border border-[#121314] flex items-center justify-center shrink-0 text-[#121314]">
                        <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                      </div>
                      <div className="text-xs font-dm font-bold text-[#121314]">
                        <span>Envío asegurado gratis</span> a todo el país incluido.
                      </div>
                    </div>

                    {/* Perfumes list */}
                    {items.map((item) => (
                      <div
                        key={item.id + (item.variant || '')}
                        className="group relative rounded-2xl p-3.5 bg-white border-2 border-[#121314] neo-box-shadow-sm flex gap-3.5 items-center"
                      >
                        {/* Flacon preview frame */}
                        <div className="w-18 h-22 rounded-xl bg-[#f6f4ee] border-2 border-[#121314] flex items-center justify-center p-2 shrink-0 relative overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="max-h-full max-w-full object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.15)] group-hover:scale-105 transition duration-300"
                          />
                        </div>

                        {/* Perfume info & actions */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
                          <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0">
                              <h3 className="text-sm font-dm font-black uppercase text-[#121314] tracking-tight truncate">
                                {item.title}
                              </h3>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="px-2 py-0.5 rounded-md bg-[#a8d5e3]/50 border border-[#121314] text-[10px] text-[#121314] font-bold">
                                  {item.variant || '100ml'}
                                </span>
                                {item.category && (
                                  <span className="text-[10px] text-[#55575a] uppercase font-bold">
                                    • {item.category}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Remove button */}
                            <button
                              onClick={() => removeItem(item.id, item.variant)}
                              className="text-[#55575a] hover:text-red-600 p-1 transition cursor-pointer"
                              title="Eliminar de la cesta"
                              aria-label="Eliminar de la cesta"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>

                          {/* Price & Quantity Controls */}
                          <div className="flex justify-between items-center mt-3 pt-2 border-t border-[#121314]/10">
                            {/* Quantity buttons */}
                            <div className="flex items-center gap-2 rounded-full border-2 border-[#121314] bg-[#f6f4ee] px-2 py-0.5">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1, item.variant)}
                                className="w-5 h-5 rounded-full flex items-center justify-center text-[#121314] hover:bg-white transition cursor-pointer text-xs font-black"
                                aria-label="Disminuir cantidad"
                              >
                                −
                              </button>
                              <span className="text-xs font-dm font-black text-[#121314] min-w-[16px] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1, item.variant)}
                                className="w-5 h-5 rounded-full flex items-center justify-center text-[#121314] hover:bg-white transition cursor-pointer text-xs font-black"
                                aria-label="Aumentar cantidad"
                              >
                                +
                              </button>
                            </div>

                            {/* Item total price */}
                            <span className="text-sm font-dm font-black text-[#121314] tracking-tight">
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
              {/* DRAWER FOOTER (Order Summary & Checkout CTA)                      */}
              {/* ================================================================= */}
              {items.length > 0 && (
                <div className="p-5 sm:p-6 border-t-2 border-[#121314] bg-white relative z-10">
                  <div className="flex flex-col gap-2 mb-4 text-xs font-dm font-bold text-[#55575a]">
                    <div className="flex justify-between items-center">
                      <span>Subtotal</span>
                      <span className="text-[#121314] font-black">{formatARS(subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Envío Asegurado Nacional</span>
                      <span className="text-[#106ebe] font-black flex items-center gap-1">
                        Gratis
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Packaging Haute Parfumerie</span>
                      <span className="text-[#121314] font-bold">Incluido</span>
                    </div>
                    <div className="flex justify-between items-baseline text-base font-dm font-black text-[#121314] mt-2 pt-3 border-t-2 border-[#121314]">
                      <span className="uppercase tracking-tight">Total Final</span>
                      <span className="text-2xl font-black text-[#121314] tracking-tight">
                        {formatARS(total)}
                      </span>
                    </div>
                  </div>

                  {/* Checkout CTA */}
                  <button
                    onClick={handleCheckoutClick}
                    className="w-full bg-[#0ffcbe] hover:bg-[#00eaad] text-[#121314] font-dm font-black text-xs tracking-wider uppercase py-4 rounded-full border-2 border-[#121314] neo-box-shadow neo-box-shadow-hover transition duration-200 active:scale-98 flex justify-center items-center gap-2 cursor-pointer"
                  >
                    <span>Finalizar Pedido</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>

                  {/* Security Reassurance */}
                  <div className="flex items-center justify-center gap-2 text-[11px] font-dm font-bold text-[#55575a] mt-3">
                    <span className="material-symbols-outlined text-[14px] text-[#106ebe]">lock</span>
                    <span>Pago Seguro • Hasta 6 cuotas sin interés</span>
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

export default CartDrawer
