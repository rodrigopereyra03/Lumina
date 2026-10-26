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
      initial={{ scale: 0.96, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full max-w-2xl mx-auto py-8 px-4 flex flex-col items-center font-dm text-[#121314]"
    >
      {/* Header Section */}
      <div className="text-center mb-8 w-full flex flex-col items-center relative z-10">
        <div className="w-20 h-20 rounded-2xl bg-[#0ffcbe] border-2 border-[#121314] flex items-center justify-center mb-5 shadow-[4px_4px_0px_#121314]">
          <span
            className="material-symbols-outlined text-[#121314] text-[44px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-[#121314] mb-2 tracking-tight uppercase">
          ¡Pedido Confirmado!
        </h1>
        <p className="text-xs sm:text-sm font-medium text-[#121314]/70 max-w-md mx-auto">
          Muchas gracias por tu compra. Tus fragancias están siendo preparadas cuidadosamente para el despacho.
        </p>
      </div>

      {/* Order Details Neo-Editorial Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 w-full mb-8 relative z-10 border-2 border-[#121314] shadow-[6px_6px_0px_#121314] space-y-5">
        {/* Order ID & Date Header */}
        <div className="flex justify-between items-center pb-4 border-b-2 border-[#121314]/15 text-xs">
          <div>
            <p className="text-[10px] text-[#121314]/60 uppercase tracking-widest font-black">Número de Orden</p>
            <p className="font-mono font-black text-sm text-[#106ebe]">{orderId}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-[#121314]/60 uppercase tracking-widest font-black">Fecha</p>
            <p className="font-bold text-xs text-[#121314]">
              {new Date().toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Order Items Preview */}
        <div className="space-y-3 py-2 divide-y-2 divide-[#121314]/10">
          {displayItems.map((item, idx) => (
            <div key={item.id + idx} className="pt-3 first:pt-0 flex gap-4 items-center">
              <div className="w-14 h-14 rounded-xl bg-[#f6f4ee] border-2 border-[#121314] p-1 flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#121314]">
                <img
                  className="max-h-full max-w-full object-contain"
                  alt={item.title}
                  src={item.image || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&q=80'}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-black text-[#121314] uppercase truncate">{item.title}</h4>
                <p className="text-[11px] font-bold text-[#121314]/60">
                  {item.variant ? `${item.variant} • ` : ''}Cant: {item.quantity}
                </p>
              </div>
              <span className="text-xs font-black text-[#121314]">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Totals Breakdown */}
        <div className="space-y-2 pt-4 border-t-2 border-[#121314]/15 text-xs text-[#121314]/80">
          <div className="flex justify-between font-bold">
            <span>Subtotal</span>
            <span className="font-black text-[#121314]">${displaySubtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Envío</span>
            <span className="font-black text-[#0ffcbe]">Gratis</span>
          </div>
          <div className="flex justify-between items-baseline pt-2 border-t-2 border-[#121314] text-sm font-black text-[#121314]">
            <span className="uppercase">Total Pagado</span>
            <span className="text-2xl font-black text-[#121314]">${displayTotal.toFixed(2)} ARS</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 w-full relative z-10">
        <button
          onClick={onContinueShopping}
          className="flex-1 py-3.5 bg-[#0ffcbe] hover:bg-[#00eaad] text-[#121314] rounded-full text-xs font-black uppercase tracking-wider border-2 border-[#121314] shadow-[4px_4px_0px_#121314] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_#121314] flex items-center justify-center gap-1.5 cursor-pointer transition-all"
        >
          <span>Seguir Comprando</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>

        {onTrackOrder && (
          <button
            onClick={onTrackOrder}
            className="px-6 py-3.5 bg-white hover:bg-[#f6f4ee] text-[#121314] border-2 border-[#121314] shadow-[3px_3px_0px_#121314] rounded-full text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all"
          >
            <span>Rastrear Envío</span>
            <span className="material-symbols-outlined text-[16px]">local_shipping</span>
          </button>
        )}
      </div>
    </motion.div>
  )
}
