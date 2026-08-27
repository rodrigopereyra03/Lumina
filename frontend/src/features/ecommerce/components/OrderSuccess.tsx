import React from 'react'
import { motion } from 'framer-motion'

export interface OrderSuccessItem {
  id: string
  title: string
  variant?: string
  price: number
  quantity: number
  image?: string
}

interface OrderSuccessProps {
  orderId?: string
  items?: OrderSuccessItem[]
  subtotal?: number
  total?: number
  onContinueShopping: () => void
  onTrackOrder?: () => void
}

export const OrderSuccess: React.FC<OrderSuccessProps> = ({
  orderId = '#LUM-849325-01',
  items,
  subtotal,
  total,
  onContinueShopping,
  onTrackOrder,
}) => {
  const displayItems = items && items.length > 0 ? items : [
    {
      id: 'test-mp-10-ars',
      title: 'Producto de Prueba Mercado Pago',
      variant: 'Edición Estándar',
      price: 10.0,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&q=80',
    }
  ]

  const displaySubtotal = subtotal !== undefined ? subtotal : displayItems.reduce((acc, it) => acc + it.price * it.quantity, 0)
  const displayTotal = total !== undefined ? total : displaySubtotal

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-2xl mx-auto py-8 px-4 flex flex-col items-center font-body text-[#1b1c1c]"
    >
      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#ffdad7]/25 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-[#e2e2e4]/35 blur-[80px]"></div>
      </div>

      {/* Header Section */}
      <div className="text-center mb-8 w-full flex flex-col items-center relative z-10">
        <div className="w-20 h-20 rounded-full bg-[#f0eded] flex items-center justify-center mb-5 shadow-sm border border-white/60">
          <span
            className="material-symbols-outlined text-[#FF4D4F] text-[44px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-[#1b1c1c] mb-2 tracking-tight">
          ¡Pedido Confirmado!
        </h1>
        <p className="text-xs sm:text-sm text-[#5b403e] max-w-md mx-auto">
          Muchas gracias por tu compra. Tus artículos están siendo preparados cuidadosamente para el despacho.
        </p>
      </div>

      {/* Order Details Glass Card */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 w-full mb-8 relative z-10 border border-white/70 shadow-lg space-y-5">
        {/* Order ID & Date Header */}
        <div className="flex justify-between items-center pb-4 border-b border-white/60 text-xs">
          <div>
            <p className="text-[10px] text-[#5b403e] uppercase tracking-widest font-bold">Número de Orden</p>
            <p className="font-mono font-bold text-sm text-[#FF4D4F]">{orderId}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-[#5b403e] uppercase tracking-widest font-bold">Fecha</p>
            <p className="font-semibold text-xs text-[#1b1c1c]">
              {new Date().toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Order Items Preview */}
        <div className="space-y-4 py-2 divide-y divide-white/50">
          {displayItems.map((item, idx) => (
            <div key={item.id + idx} className="pt-3 first:pt-0 flex gap-4 items-center">
              <div className="w-14 h-14 rounded-xl bg-white/70 border border-white p-1 flex items-center justify-center shrink-0 shadow-2xs">
                <img
                  className="max-h-full max-w-full object-contain mix-blend-multiply"
                  alt={item.title}
                  src={item.image || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&q=80'}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-[#1b1c1c] truncate">{item.title}</h4>
                <p className="text-[11px] text-[#5b403e]">
                  {item.variant ? `${item.variant} • ` : ''}Cant: {item.quantity}
                </p>
              </div>
              <span className="text-xs font-bold text-[#1b1c1c]">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Totals Breakdown */}
        <div className="space-y-2 pt-4 border-t border-white/60 text-xs text-[#5b403e]">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-[#1b1c1c]">${displaySubtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Envío</span>
            <span className="font-semibold text-[#1E824C]">Gratis</span>
          </div>
          <div className="flex justify-between items-baseline pt-2 border-t border-white/80 text-sm font-bold text-[#1b1c1c]">
            <span>Total Pagado</span>
            <span className="text-xl font-bold text-[#FF4D4F]">${displayTotal.toFixed(2)} ARS</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 w-full relative z-10">
        <button
          onClick={onContinueShopping}
          className="flex-1 py-3.5 btn-primary rounded-full text-xs font-bold shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Seguir Comprando</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>

        {onTrackOrder && (
          <button
            onClick={onTrackOrder}
            className="px-6 py-3.5 glass-button-secondary rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Rastrear Envío</span>
            <span className="material-symbols-outlined text-[16px]">local_shipping</span>
          </button>
        )}
      </div>
    </motion.div>
  )
}
