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

    const message = `👋 ¡Hola Fórmula 1370! Quiero coordinar el envío de mi pedido:

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
    <div className="bg-white rounded-2xl p-6 border-2 border-[#121314] shadow-[4px_4px_0px_#121314] space-y-6 text-[#121314]">
      <div className="flex items-center justify-between border-b-2 border-[#121314]/15 pb-4">
        <div>
          <h3 className="text-base font-black uppercase tracking-wide text-[#121314]">Método de Envío</h3>
          <p className="text-xs font-medium text-[#121314]/70">Selecciona cómo deseas recibir tu compra en Fórmula 1370</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#a8d5e3] border-2 border-[#121314] flex items-center justify-center text-[#121314] shadow-[2px_2px_0px_#121314]">
          <span className="material-symbols-outlined text-[20px]">local_shipping</span>
        </div>
      </div>

      {/* Tabs / Selectores de Metodología */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1.5 bg-[#f6f4ee] border-2 border-[#121314] rounded-2xl shadow-[2px_2px_0px_#121314]">
        <button
          type="button"
          onClick={() => {
            setShippingMethod('enviopack')
            if (rates.length > 0) onSelectShippingRate(selectedRate || rates[0])
          }}
          className={`py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border-2 ${
            shippingMethod === 'enviopack'
              ? 'bg-[#121314] text-white border-[#121314] shadow-[2px_2px_0px_#0ffcbe]'
              : 'bg-white text-[#121314] border-transparent hover:border-[#121314]'
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
          className={`py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border-2 ${
            shippingMethod === 'whatsapp'
              ? 'bg-[#0ffcbe] text-[#121314] border-[#121314] shadow-[2px_2px_0px_#121314]'
              : 'bg-white text-[#121314] border-transparent hover:border-[#121314]'
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
              className="flex-1 px-4 py-2.5 text-xs font-bold rounded-xl border-2 border-[#121314] bg-[#f6f4ee] text-[#121314] focus:outline-none focus:bg-white focus:shadow-[2px_2px_0px_#121314] shadow-[2px_2px_0px_#121314] transition-all"
            />
            <button
              type="button"
              onClick={handleQuoteShipping}
              disabled={loadingQuotes || !postalCode.trim()}
              className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-[#0ffcbe] hover:bg-[#00eaad] text-[#121314] border-2 border-[#121314] shadow-[3px_3px_0px_#121314] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#121314] disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              {loadingQuotes ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#121314] border-t-transparent rounded-full animate-spin"></div>
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

          {quoteError && <p className="text-xs font-bold text-[#d92d20]">{quoteError}</p>}

          {/* Listado de Tarifas de Envíopack */}
          {rates.length > 0 && (
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#121314] block">
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
                      className={`p-4 rounded-xl border-2 border-[#121314] flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#0ffcbe]/20 shadow-[3px_3px_0px_#121314] translate-x-0.5'
                          : 'bg-[#f6f4ee] hover:bg-white shadow-[2px_2px_0px_#121314]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-5 h-5 rounded-full border-2 border-[#121314] flex items-center justify-center ${
                          isSelected ? 'bg-[#121314]' : 'bg-white'
                        }`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-[#0ffcbe]"></div>}
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase text-[#121314]">{rate.courier_name}</p>
                          <p className="text-[11px] font-medium text-[#121314]/70">
                            {rate.service_name} • Entrega estimada: ~{rate.estimated_days} días hábiles
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-[#106ebe]">
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
        <div className="space-y-4 p-5 rounded-2xl bg-[#0ffcbe]/15 border-2 border-[#121314] shadow-[3px_3px_0px_#121314]">
          <div className="space-y-1">
            <span className="text-xs font-black uppercase text-[#121314] block">
              Coordinación personalizada por WhatsApp 💬
            </span>
            <p className="text-xs font-medium text-[#121314]/80">
              Ideal para envíos en moto en el día, retiro en showroom o puntos de encuentro en CABA y GBA.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-[#121314] block">
              Tu Zona / Barrio / Dirección de Retiro
            </label>
            <input
              type="text"
              placeholder="Ej: Palermo Soho, Belgrano, Recoleta o punto de entrega"
              value={customZone}
              onChange={(e) => setCustomZone(e.target.value)}
              className="w-full px-4 py-2.5 text-xs font-bold rounded-xl border-2 border-[#121314] bg-white text-[#121314] focus:outline-none focus:shadow-[2px_2px_0px_#121314] shadow-[2px_2px_0px_#121314]"
            />
          </div>

          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="w-full py-3 rounded-full text-xs font-black uppercase tracking-wider bg-[#121314] text-white hover:bg-neutral-800 flex items-center justify-center gap-2 border-2 border-[#121314] shadow-[3px_3px_0px_#0ffcbe] transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
            <span>Coordinar Despacho por WhatsApp</span>
          </button>
        </div>
      )}
    </div>
  )
}
