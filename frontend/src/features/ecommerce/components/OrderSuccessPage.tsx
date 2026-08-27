import React from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Header } from '../../../components/common/Header'
import { Footer } from '../../../components/common/Footer'

export const OrderSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const status = searchParams.get('status') || searchParams.get('collection_status') || 'approved'
  const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id') || '175009292359'
  const externalRef = searchParams.get('external_reference') || '#LUM-' + Math.floor(100000 + Math.random() * 900000) + '-01'
  const paymentType = searchParams.get('payment_type') || 'mercadopago'

  const isApproved = status === 'approved'

  return (
    <div className="bg-[#fbf9f8] text-[#1b1c1c] font-body min-h-screen antialiased flex flex-col justify-between">
      <Header />

      <main className="flex-1 p-4 md:p-12 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-2xl mx-auto py-6 px-4 flex flex-col items-center"
        >
          {/* Header Section */}
          <div className="text-center mb-8 w-full flex flex-col items-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-5 shadow-sm border border-white/60 ${
              isApproved ? 'bg-[#E8F8F0] text-[#1E824C]' : 'bg-[#FFF4E5] text-[#D97706]'
            }`}>
              <span
                className="material-symbols-outlined text-[44px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {isApproved ? 'check_circle' : 'pending'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-[#1b1c1c] mb-2 tracking-tight">
              {isApproved ? '¡Pago Aprobado por Mercado Pago!' : '¡Pedido en Proceso!'}
            </h1>
            <p className="text-xs sm:text-sm text-[#5b403e] max-w-md mx-auto">
              {isApproved
                ? 'Tu pago de $10.00 ARS fue acreditado con éxito a través de Mercado Pago y el pedido está listo para despacho.'
                : 'Estamos esperando la confirmación de pago de Mercado Pago.'}
            </p>
          </div>

          {/* Order Details Glass Card */}
          <div className="glass-panel rounded-2xl p-6 sm:p-8 w-full mb-8 border border-white/70 shadow-lg space-y-5">
            {/* Header with IDs */}
            <div className="flex justify-between items-center pb-4 border-b border-white/60 text-xs">
              <div>
                <p className="text-[10px] text-[#5b403e] uppercase tracking-widest font-bold">N° de Orden</p>
                <p className="font-mono font-bold text-sm text-[#FF4D4F]">{externalRef}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-[#5b403e] uppercase tracking-widest font-bold">Transacción Mercado Pago</p>
                <p className="font-mono font-semibold text-xs text-[#009EE3]">#{paymentId}</p>
              </div>
            </div>

            {/* Product Purchased */}
            <div className="py-2 space-y-3">
              <div className="flex gap-4 items-center">
                <div className="w-14 h-14 rounded-xl bg-white/70 border border-white p-1 flex items-center justify-center shrink-0 shadow-2xs">
                  <img
                    className="max-h-full max-w-full object-contain"
                    alt="Producto de Prueba Mercado Pago"
                    src="https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&q=80"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-[#1b1c1c] truncate">Producto de Prueba Mercado Pago</h4>
                  <p className="text-[11px] text-[#5b403e]">
                    Medio: <span className="capitalize font-semibold text-[#009EE3]">{paymentType.replace('_', ' ')}</span> • Cant: 1
                  </p>
                </div>
                <span className="text-xs font-bold text-[#1b1c1c]">$10.00 ARS</span>
              </div>
            </div>

            {/* Totals Breakdown */}
            <div className="space-y-2 pt-4 border-t border-white/60 text-xs text-[#5b403e]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-[#1b1c1c]">$10.00 ARS</span>
              </div>
              <div className="flex justify-between">
                <span>Estado de Pago</span>
                <span className="font-bold text-[#1E824C] uppercase text-[10px] px-2 py-0.5 bg-[#E8F8F0] rounded-full">
                  Acreditado
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-white/80 text-sm font-bold text-[#1b1c1c]">
                <span>Total Abonado</span>
                <span className="text-xl font-bold text-[#FF4D4F]">$10.00 ARS</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <button
              onClick={() => navigate('/')}
              className="flex-1 py-3.5 btn-primary rounded-full text-xs font-bold shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Volver a la Tienda Lumina</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
