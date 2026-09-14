import React, { useState } from 'react'
import { axiosInstance } from '../../../api/axiosInstance'

export interface CartItem {
  id: string
  title: string
  quantity: number
  price: number
}

export interface ShippingRate {
  courier_name: string
  service_name: string
  delivery_type: string
  cost: number
  estimated_days: number
}

interface ShippingSectionProps {
  cartItems: CartItem[]
  subtotal: number
  selectedRate: ShippingRate | null
  onSelectShippingRate: (rate: ShippingRate | null) => void
  sellerWhatsAppPhone?: string
}

export const ShippingSection: React.FC<ShippingSectionProps> = ({
  cartItems,
  subtotal,
  selectedRate,
  onSelectShippingRate,
  sellerWhatsAppPhone = '5491122334455',
}) => {
  const [shippingMethod, setShippingMethod] = useState<'enviopack' | 'whatsapp'>('enviopack')

  // Envíopack State
  const [postalCode, setPostalCode] = useState('')
  const [loadingQuotes, setLoadingQuotes] = useState(false)
  const [rates, setRates] = useState<ShippingRate[]>([])
  const [quoteError, setQuoteError] = useState<string | null>(null)

  // WhatsApp State
  const [customZone, setCustomZone] = useState('')

  // 1. Cotizar con Envíopack API
  const handleQuoteShipping = async () => {
    if (!postalCode.trim()) return

    setLoadingQuotes(true)
    setQuoteError(null)
    try {
      const res = await axiosInstance.post('/shipping/quote', {
        postal_code_dest: postalCode.trim(),
        province_code: 'B',
        packages: [
          {
            weight: 0.8,
            length: 20,
            width: 15,
            height: 10,
          },
        ],
      })

      const fetchedRates = res.data?.content?.rates || []
      setRates(fetchedRates)
      if (fetchedRates.length > 0) {
        onSelectShippingRate(fetchedRates[0])
      } else {
        setQuoteError('No se encontraron tarifas disponibles para ese código postal.')
      }
    } catch (err: any) {
      setQuoteError('Error al consultar las tarifas de envío. Intente nuevamente.')
    } finally {
      setLoadingQuotes(false)
    }
  }

  // 2. Coordinación por WhatsApp
  const handleOpenWhatsApp = () => {
    const itemsText = cartItems
      .map((item) => `• ${item.quantity}x ${item.title} ($${(item.price * item.quantity).toFixed(2)})`)
      .join('\n')

    const message = `👋 ¡Hola Bliss Goods! Quiero coordinar el envío de mi pedido:

🛍️ *Productos:*
${itemsText}

💰 *Subtotal:* $${subtotal.toFixed(2)} ARS
📍 *Mi Zona / Dirección:* ${customZone || 'A coordinar'}

¿Tienen disponibilidad para coordinar envío o punto de encuentro?`

    const encodedMessage = encodeURIComponent(message)
    const url = `https://wa.me/${sellerWhatsAppPhone}?text=${encodedMessage}`
    window.open(url, '_blank')
  }

  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/70 dark:border-white/10 shadow-sm space-y-6 text-[#1b1c1c] dark:text-[#f9fafb]">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-[#1b1c1c] dark:text-[#f9fafb]">Método de Envío</h3>
          <p className="text-xs text-[#5b403e] dark:text-[#9ca3af]">Selecciona cómo deseas recibir tu compra en Lumina</p>
        </div>
        <div className="w-8 h-8 rounded-xl bg-[#ffdad7]/50 dark:bg-[#FF4D4F]/20 flex items-center justify-center text-[#FF4D4F]">
          <span className="material-symbols-outlined text-[18px]">local_shipping</span>
        </div>
      </div>

      {/* Tabs / Selectores de Metodología */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1.5 bg-white/60 dark:bg-white/5 border border-white/80 dark:border-white/10 rounded-xl shadow-2xs">
        <button
          type="button"
          onClick={() => {
            setShippingMethod('enviopack')
            if (rates.length > 0) onSelectShippingRate(selectedRate || rates[0])
          }}
          className={`py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            shippingMethod === 'enviopack'
              ? 'bg-[#FF4D4F] text-white shadow-xs font-bold'
              : 'text-[#5b403e] dark:text-[#9ca3af] hover:text-[#1b1c1c] dark:hover:text-[#f9fafb]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">inventory_2</span>
          <span>Envío por Correo (Envíopack)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setShippingMethod('whatsapp')
            onSelectShippingRate(null)
          }}
          className={`py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            shippingMethod === 'whatsapp'
              ? 'bg-[#25D366] text-white shadow-xs font-bold'
              : 'text-[#5b403e] dark:text-[#9ca3af] hover:text-[#1b1c1c] dark:hover:text-[#f9fafb]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">chat</span>
          <span>Coordinar por WhatsApp</span>
        </button>
      </div>

      {/* Opción A: Envíopack */}
      {shippingMethod === 'enviopack' && (
        <div className="space-y-4">
          <div className="flex gap-2.5">
            <input
              type="text"
              placeholder="Ingresá tu Código Postal (ej: 1414, 1000)"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  e.stopPropagation()
                  handleQuoteShipping()
                }
              }}
              className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-white/80 dark:border-white/10 bg-white/70 dark:bg-white/5 text-[#1b1c1c] dark:text-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-[#FF4D4F]/30 shadow-2xs"
            />
            <button
              type="button"
              onClick={handleQuoteShipping}
              disabled={loadingQuotes || !postalCode.trim()}
              className="btn-primary px-5 py-2.5 rounded-xl text-xs font-bold disabled:opacity-50 transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              {loadingQuotes ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Cotizando...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">search</span>
                  <span>Calcular</span>
                </>
              )}
            </button>
          </div>

          {quoteError && <p className="text-xs text-red-500 font-medium">{quoteError}</p>}

          {/* Listado de Tarifas de Envíopack */}
          {rates.length > 0 && (
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5b403e] dark:text-[#9ca3af] block">
                Opciones de Correo Disponibles
              </span>
              <div className="space-y-2.5">
                {rates.map((rate, idx) => {
                  const isSelected =
                    selectedRate?.courier_name === rate.courier_name &&
                    selectedRate?.service_name === rate.service_name

                  return (
                    <div
                      key={idx}
                      onClick={() => onSelectShippingRate(rate)}
                      className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#FF4D4F] bg-white dark:bg-[#181c26] ring-2 ring-[#FF4D4F]/20 shadow-xs'
                          : 'border-white/70 dark:border-white/10 hover:border-white dark:hover:border-white/20 bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-[#FF4D4F] bg-[#FF4D4F]' : 'border-[#5b403e]/40 dark:border-white/20'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#1b1c1c] dark:text-[#f9fafb]">{rate.courier_name}</p>
                          <p className="text-[11px] text-[#5b403e] dark:text-[#9ca3af]">
                            {rate.service_name} • Entrega estimada: ~{rate.estimated_days} días hábiles
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-[#FF4D4F]">
                        ${rate.cost.toFixed(2)} ARS
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Opción B: WhatsApp */}
      {shippingMethod === 'whatsapp' && (
        <div className="space-y-4 p-5 rounded-2xl bg-[#E8F8F0]/70 dark:bg-[#25D366]/10 border border-[#25D366]/30">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#1b1c1c] dark:text-[#f9fafb] block">
              Coordinación personalizada por WhatsApp 💬
            </span>
            <p className="text-xs text-[#5b403e] dark:text-[#9ca3af]">
              Ideal para envíos en moto en el día, retiro en showroom o puntos de encuentro.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#5b403e] dark:text-[#9ca3af] block">Tu Zona / Barrio / Dirección de Retiro</label>
            <input
              type="text"
              placeholder="Ej: Palermo Soho, Belgrano, Recoleta o punto de entrega"
              value={customZone}
              onChange={(e) => setCustomZone(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-white/80 dark:border-white/10 bg-white dark:bg-[#181c26] text-[#1b1c1c] dark:text-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-[#25D366]/30 shadow-2xs"
            />
          </div>

          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-98"
          >
            <span>Coordinar con Lumina en WhatsApp</span>
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
          </button>
        </div>
      )}
    </div>
  )
}
