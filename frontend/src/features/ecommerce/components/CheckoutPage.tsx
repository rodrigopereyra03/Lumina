import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useCartStore } from '../../../store/useCartStore'
import { useAuthStore } from '../../../store/useAuthStore'
import { useUserDataStore } from '../../../store/useUserDataStore'
import { ordersApi } from '../../../api/ordersApi'
import { ShippingSection, type ShippingRate } from './ShippingSection'
import { paymentsApi } from '../../../api/paymentsApi'
import { mercadoPagoApi } from '../../../api/mercadoPagoApi'
import { settingsApi, type PaymentSettingsDTO, DEFAULT_PAYMENT_SETTINGS } from '../../../api/settingsApi'
import { OrderSuccess } from './OrderSuccess'

interface CheckoutPageProps {
  onBack: () => void
}

type PaymentMethodType = 'mercadopago' | 'card' | 'transfer'

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onBack }) => {
  const {
    items,
    clearCart,
    getSubtotal,
    getDiscountAmount,
    getTotal,
    discountCode,
  } = useCartStore()
  const { user, isAuthenticated } = useAuthStore()
  const { addresses, cards, loadUserData, addAddress, addCard, addOrder } = useUserDataStore()

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettingsDTO>(DEFAULT_PAYMENT_SETTINGS)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('mercadopago')

  const subtotal = getSubtotal()
  const discountAmount = getDiscountAmount()

  // Only consider account data for non-admin customers, never leak or prefill admin credentials
  const isCustomerAccount = Boolean(isAuthenticated && user && user.role !== 'admin')

  const [fullName, setFullName] = useState(isCustomerAccount ? (user?.full_name || '') : '')
  const [email, setEmail] = useState(isCustomerAccount ? (user?.email || '') : '')
  const [phone, setPhone] = useState(isCustomerAccount ? (user?.phone || '') : '')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [saveAddressOption, setSaveAddressOption] = useState(isCustomerAccount)
  const [saveCardOption, setSaveCardOption] = useState(false)

  // Direct Card Fields
  const [cardNum, setCardNum] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')

  const [loading, setLoading] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [mpRedirectUrl, setMpRedirectUrl] = useState<string | null>(null)
  
  // Track completed items for the success receipt
  const [completedItems, setCompletedItems] = useState<typeof items>([])
  const [completedSubtotal, setCompletedSubtotal] = useState(0)
  const [completedTotal, setCompletedTotal] = useState(0)

  // Load payment settings and adjust active method
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const s = await settingsApi.getPaymentSettings()
        if (s) {
          setPaymentSettings(s)
          if (s.mp_active) {
            setPaymentMethod('mercadopago')
          } else if (s.transfer_active) {
            setPaymentMethod('transfer')
          } else if (s.card_active) {
            setPaymentMethod('card')
          }
        }
      } catch (e) {
        // Fallback default
      }
    }
    fetchSettings()
  }, [])

  useEffect(() => {
    if (isCustomerAccount && user?.email) {
      loadUserData(user.email)
    }
  }, [isCustomerAccount, user?.email, loadUserData])

  // Populate first saved address if exists and field is empty
  useEffect(() => {
    if (isCustomerAccount && addresses.length > 0 && !address) {
      const defaultAddr = addresses.find((a) => a.is_default) || addresses[0]
      setAddress(defaultAddr.street_address)
      setCity(defaultAddr.city)
      if (defaultAddr.recipient_phone && !phone) {
        setPhone(defaultAddr.recipient_phone)
      }
    }
  }, [isCustomerAccount, addresses])

  const [shippingRate, setShippingRate] = useState<ShippingRate | null>(null)

  // Dynamic transfer discount from settings
  const transferDiscount =
    paymentMethod === 'transfer' && paymentSettings.transfer_active
      ? subtotal * ((paymentSettings.transfer_discount || 0) / 100)
      : 0
  const shippingCost = shippingRate ? shippingRate.cost : 0
  const total = Math.max(0, getTotal() - transferDiscount + shippingCost)

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16)
    const formatted = raw.replace(/(\d{4})/g, '$1 ').trim()
    setCardNum(formatted)
  }

  const handleSelectSavedAddress = (addr: typeof addresses[0]) => {
    setAddress(addr.street_address)
    setCity(addr.city)
    if (addr.recipient_phone) setPhone(addr.recipient_phone)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const currentOrderItems = [...items]
    const currentSubtotal = subtotal
    const currentTotal = total
    setCompletedItems(currentOrderItems)
    setCompletedSubtotal(currentSubtotal)
    setCompletedTotal(currentTotal)

    const generatedOrderId = '#LUM-' + Math.floor(100000 + Math.random() * 900000) + '-01'
    setOrderId(generatedOrderId)

    // Save address if user opted in
    if (isCustomerAccount && user?.email && saveAddressOption && address && city) {
      const alreadySaved = addresses.some(
        (a) => a.street_address.toLowerCase() === address.toLowerCase()
      )
      if (!alreadySaved) {
        addAddress(user.email, {
          title: 'Domicilio de Entrega',
          recipient_name: fullName.trim() || user.full_name || 'Cliente',
          recipient_phone: phone.trim() || '+54 9 11 ...',
          street_address: address,
          city: city,
          state: 'Buenos Aires',
          is_default: addresses.length === 0,
        })
      }
    }

    // Save card if user opted in
    if (isCustomerAccount && user?.email && saveCardOption && cardNum && cardExpiry && paymentMethod === 'card') {
      const rawNum = cardNum.replace(/\s+/g, '')
      const last4 = rawNum.slice(-4) || '4242'
      const brand = rawNum.startsWith('4') ? 'visa' : rawNum.startsWith('5') ? 'mastercard' : 'other'
      addCard(user.email, {
        cardholder_name: fullName.trim() || (user ? user.full_name : 'Titular'),
        brand,
        last4,
        expiry: cardExpiry,
        is_default: cards.length === 0,
      })
    }

    // Record order in user history
    if (isCustomerAccount && user?.email) {
      addOrder(user.email, {
        id: 'ord_' + Date.now(),
        order_number: generatedOrderId,
        date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
        items: currentOrderItems.map((it) => ({
          id: it.id,
          title: it.title,
          variant: it.variant,
          price: it.price,
          quantity: it.quantity,
          image: it.image,
        })),
        subtotal: currentSubtotal,
        total: currentTotal,
        payment_method: paymentMethod === 'mercadopago' ? 'Mercado Pago' : paymentMethod === 'transfer' ? 'Transferencia' : 'Tarjeta',
        status: paymentMethod === 'mercadopago' ? 'Aprobado' : 'En Proceso',
        status_color: paymentMethod === 'mercadopago' ? 'bg-[#0ffcbe] text-[#121314]' : 'bg-[#ff78ac] text-[#121314]',
      })
    }

    // 1. Create order in backend
    let createdBackendOrder: any = null
    try {
      const orderPayload = {
        customer_name: fullName.trim() || (isCustomerAccount ? user?.full_name : '') || 'Cliente',
        customer_email: email.trim() || (isCustomerAccount ? user?.email : '') || 'cliente@formula1370.com',
        customer_phone: phone.trim() || '+54 9 11 4455-6677',
        shipping_address: `${address}, ${city}`,
        items: currentOrderItems.map((it) => ({
          product_id: it.id,
          title: it.title,
          variant: it.variant,
          unit_price: it.price,
          quantity: it.quantity,
          image: it.image,
        })),
      }

      const res = await ordersApi.createOrder(orderPayload)
      if (res?.order) {
        createdBackendOrder = res.order
        if (res.order.order_number) {
          setOrderId(res.order.order_number)
        }
      }
    } catch (err) {
      console.warn('Backend order recording fallback:', err)
    }

    // 2. If paying with Mercado Pago
    if (paymentMethod === 'mercadopago') {
      const finalOrderId = createdBackendOrder?.order_number || createdBackendOrder?.id || generatedOrderId
      try {
        const pref = await mercadoPagoApi.createPreference({
          order_id: finalOrderId,
          items: currentOrderItems.map((it) => ({
            id: it.id,
            title: it.title,
            description: it.title,
            quantity: it.quantity,
            unit_price: it.price,
            currency_id: 'ARS',
            picture_url: it.image,
          })),
          payer: {
            name: (fullName || user?.full_name || 'Cliente').split(' ')[0],
            surname: (fullName || user?.full_name || 'Cliente').split(' ').slice(1).join(' ') || 'Fórmula 1370',
            email: email || user?.email || 'comprador@formula1370.com',
            phone: phone,
            address: address,
          },
          back_url: window.location.origin,
        })

        const targetUrl = paymentSettings.mp_sandbox && pref.sandbox_init_point ? pref.sandbox_init_point : pref.init_point
        if (targetUrl) {
          setMpRedirectUrl(targetUrl)
          clearCart()
          const mpWindow = window.open(targetUrl, '_blank')
          if (!mpWindow) {
            window.location.href = targetUrl
          }
          setOrderSuccess(true)
          setLoading(false)
          return
        }
      } catch (mpErr: any) {
        console.error('Mercado Pago Preference Error:', mpErr)
        alert('Error al conectar con Mercado Pago: ' + (mpErr.message || 'Intente nuevamente'))
        setLoading(false)
        return
      }
    }

    // 3. For Manual methods (transfer/card)
    if (paymentMethod !== 'mercadopago' && createdBackendOrder?.id) {
      try {
        await paymentsApi.processPayment({
          order_id: createdBackendOrder.id,
          payment_method: paymentMethod,
          amount: currentTotal,
          token: 'tok_manual_' + paymentMethod,
          installments: 1,
        })
      } catch (pErr) {}
    }

    setOrderSuccess(true)
    clearCart()
    setLoading(false)
  }

  if (orderSuccess) {
    return (
      <div className="space-y-6 font-dm text-[#121314]">
        <OrderSuccess
          orderId={orderId}
          items={completedItems}
          subtotal={completedSubtotal}
          total={completedTotal}
          onContinueShopping={onBack}
        />
        {mpRedirectUrl && (
          <div className="max-w-md mx-auto p-5 bg-white rounded-2xl border-2 border-[#121314] text-center space-y-3 shadow-[4px_4px_0px_#121314]">
            <div className="flex items-center justify-center gap-2 text-[#009EE3] font-black uppercase text-xs">
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
              <span>Pasarela de Pago Mercado Pago</span>
            </div>
            <p className="text-xs font-medium text-[#121314]/80">
              Si la ventana de Mercado Pago no se abrió automáticamente, haz clic en el siguiente botón:
            </p>
            <a
              href={mpRedirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#009EE3] hover:bg-[#0082ba] text-white rounded-full text-xs font-black uppercase tracking-wider border-2 border-[#121314] shadow-[3px_3px_0px_#121314] transition-all cursor-pointer"
            >
              <span>Continuar en Mercado Pago</span>
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            </a>
          </div>
        )}
      </div>
    )
  }

  const activeMethodsCount =
    (paymentSettings.mp_active ? 1 : 0) +
    (paymentSettings.card_active ? 1 : 0) +
    (paymentSettings.transfer_active ? 1 : 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto space-y-8 font-dm text-[#121314]"
    >
      {/* Header with Back Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-[#121314]/15 pb-4 gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-[#f6f4ee] border-2 border-[#121314] shadow-[2px_2px_0px_#121314] text-xs font-black uppercase tracking-wider text-[#121314] transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Volver al Carrito</span>
        </button>
        <span className="text-xs font-black tracking-wider text-[#121314]/70 uppercase flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-[#0ffcbe]">lock</span>
          <span>Pago Seguro Cifrado (SSL 256-bit)</span>
        </span>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Shipping & Payment Method Selection */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Información de Envío */}
            <div className="space-y-3.5 bg-white rounded-2xl p-6 border-2 border-[#121314] shadow-[4px_4px_0px_#121314]">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black uppercase tracking-wider text-[#121314] bg-[#ff78ac] px-3 py-1 rounded-full border border-[#121314] shadow-[1px_1px_0px_#121314]">
                  1. Información de Envío
                </span>
                {addresses.length > 0 && (
                  <span className="text-[10px] text-[#121314]/70 font-bold uppercase">
                    {addresses.length} {addresses.length === 1 ? 'dirección guardada' : 'direcciones guardadas'}
                  </span>
                )}
              </div>

              {/* Saved Addresses quick pills */}
              {addresses.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1 pb-1">
                  {addresses.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => handleSelectSavedAddress(a)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wide border-2 border-[#121314] transition-all cursor-pointer ${
                        address === a.street_address
                          ? 'bg-[#121314] text-white shadow-[2px_2px_0px_#0ffcbe]'
                          : 'bg-[#f6f4ee] hover:bg-white text-[#121314]'
                      }`}
                    >
                      📍 {a.title}: {a.street_address.split(',')[0]}
                    </button>
                  ))}
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-[#121314] block mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Mateo García"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#f6f4ee] border-2 border-[#121314] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#121314] placeholder:text-[#121314]/40 outline-none focus:bg-white focus:shadow-[2px_2px_0px_#121314] transition-all"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-[#121314] block mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    placeholder="mateo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#f6f4ee] border-2 border-[#121314] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#121314] placeholder:text-[#121314]/40 outline-none focus:bg-white focus:shadow-[2px_2px_0px_#121314] transition-all"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-[#121314] block mb-1">Dirección de Entrega</label>
                  <input
                    type="text"
                    required
                    placeholder="Calle y Número, Piso"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-[#f6f4ee] border-2 border-[#121314] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#121314] placeholder:text-[#121314]/40 outline-none focus:bg-white focus:shadow-[2px_2px_0px_#121314] transition-all"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-[#121314] block mb-1">Ciudad</label>
                  <input
                    type="text"
                    required
                    placeholder="Buenos Aires, CABA"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#f6f4ee] border-2 border-[#121314] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#121314] placeholder:text-[#121314]/40 outline-none focus:bg-white focus:shadow-[2px_2px_0px_#121314] transition-all"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-[#121314] block mb-1">Teléfono</label>
                  <input
                    type="text"
                    required
                    placeholder="+54 9 11..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#f6f4ee] border-2 border-[#121314] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#121314] placeholder:text-[#121314]/40 outline-none focus:bg-white focus:shadow-[2px_2px_0px_#121314] transition-all"
                  />
                </div>
              </div>

              {/* Save Address Checkbox */}
              {isAuthenticated && (
                <label className="flex items-center gap-2 pt-2 px-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={saveAddressOption}
                    onChange={(e) => setSaveAddressOption(e.target.checked)}
                    className="w-4 h-4 rounded border-2 border-[#121314] accent-[#121314]"
                  />
                  <span className="text-[11px] text-[#121314] font-bold">
                    Guardar esta dirección de entrega para mis próximas compras
                  </span>
                </label>
              )}
            </div>

            {/* 2. Método de Envío (Envíopack & WhatsApp) */}
            <div className="pt-1">
              <ShippingSection
                cartItems={items}
                subtotal={subtotal}
                selectedRate={shippingRate}
                onSelectShippingRate={setShippingRate}
                sellerWhatsAppPhone="5491122334455"
              />
            </div>

            {/* 3. Método de Pago */}
            <div className="space-y-4 bg-white rounded-2xl p-6 border-2 border-[#121314] shadow-[4px_4px_0px_#121314]">
              <span className="text-xs font-black uppercase tracking-wider text-[#121314] bg-[#a8d5e3] px-3 py-1 rounded-full border border-[#121314] shadow-[1px_1px_0px_#121314] inline-block">
                3. Método de Pago
              </span>
              
              {activeMethodsCount === 0 ? (
                <div className="p-4 rounded-2xl bg-[#ff78ac]/30 border-2 border-[#121314] text-[#121314] text-xs text-center font-black uppercase">
                  No hay medios de pago habilitados en este momento. Por favor contacte con administración.
                </div>
              ) : (
                /* Payment Tabs Selector based on Admin Settings */
                <div className={`grid ${
                  activeMethodsCount === 1 
                    ? 'grid-cols-1' 
                    : activeMethodsCount === 2 
                    ? 'grid-cols-2' 
                    : 'grid-cols-1 sm:grid-cols-3'
                } gap-2.5 p-2 bg-[#f6f4ee] rounded-2xl border-2 border-[#121314] shadow-[2px_2px_0px_#121314]`}>
                  {paymentSettings.mp_active && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('mercadopago')}
                      className={`py-3 px-2 rounded-xl text-xs font-black uppercase tracking-wider flex flex-col items-center gap-1 transition-all cursor-pointer border-2 ${
                        paymentMethod === 'mercadopago'
                          ? 'bg-[#009EE3] text-white border-[#121314] shadow-[2px_2px_0px_#121314]'
                          : 'bg-white text-[#121314] border-transparent hover:border-[#121314]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                      <span className="text-[11px] leading-tight text-center">Mercado Pago</span>
                    </button>
                  )}

                  {paymentSettings.card_active && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`py-3 px-2 rounded-xl text-xs font-black uppercase tracking-wider flex flex-col items-center gap-1 transition-all cursor-pointer border-2 ${
                        paymentMethod === 'card'
                          ? 'bg-[#ff78ac] text-[#121314] border-[#121314] shadow-[2px_2px_0px_#121314]'
                          : 'bg-white text-[#121314] border-transparent hover:border-[#121314]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">credit_card</span>
                      <span className="text-[11px] leading-tight text-center">Tarjeta Directa</span>
                    </button>
                  )}

                  {paymentSettings.transfer_active && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('transfer')}
                      className={`py-3 px-2 rounded-xl text-xs font-black uppercase tracking-wider flex flex-col items-center gap-1 transition-all cursor-pointer border-2 ${
                        paymentMethod === 'transfer'
                          ? 'bg-[#0ffcbe] text-[#121314] border-[#121314] shadow-[2px_2px_0px_#121314]'
                          : 'bg-white text-[#121314] border-transparent hover:border-[#121314]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">account_balance</span>
                      <span className="text-[11px] leading-tight text-center">Transferencia</span>
                    </button>
                  )}
                </div>
              )}

              {/* Dynamic Content Based on Payment Selection */}
              {paymentMethod === 'mercadopago' && paymentSettings.mp_active && (
                <div className="p-4 rounded-2xl bg-[#a8d5e3]/30 border-2 border-[#121314] shadow-[2px_2px_0px_#121314] space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#009EE3] text-white flex items-center justify-center font-black text-xs border-2 border-[#121314] shadow-[1px_1px_0px_#121314]">
                      MP
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wide text-[#121314]">Checkout Pro de Mercado Pago</h4>
                      <p className="text-[11px] font-medium text-[#121314]/80">
                        Paga con Dinero en Cuenta, Débito, Crédito o hasta {paymentSettings.mp_installments || 6} Cuotas sin interés.
                      </p>
                    </div>
                  </div>
                  <div className="text-[11px] text-[#106ebe] font-bold bg-white p-3 rounded-xl border-2 border-[#121314] shadow-[1px_1px_0px_#121314]">
                    💡 Al presionar el botón de abajo, serás redirigido de forma 100% segura a la aplicación o web de Mercado Pago.
                  </div>
                </div>
              )}

              {paymentMethod === 'card' && paymentSettings.card_active && (
                <div className="space-y-3.5 p-5 bg-[#f6f4ee] rounded-2xl border-2 border-[#121314] shadow-[2px_2px_0px_#121314]">
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-wider text-[#121314] block mb-1">Número de Tarjeta</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={cardNum}
                        onChange={handleCardNumberChange}
                        className="w-full bg-white border-2 border-[#121314] px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold text-[#121314] outline-none pl-9 focus:shadow-[2px_2px_0px_#121314]"
                        placeholder="4242 4242 4242 4242"
                      />
                      <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-[#121314]/60 text-[18px]">
                        credit_card
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-black uppercase tracking-wider text-[#121314] block mb-1">Vencimiento (MM/AA)</label>
                      <input
                        type="text"
                        required
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-white border-2 border-[#121314] px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold text-[#121314] outline-none focus:shadow-[2px_2px_0px_#121314]"
                        placeholder="MM/AA"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-black uppercase tracking-wider text-[#121314] block mb-1">CVV / Seguridad</label>
                      <input
                        type="text"
                        required
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full bg-white border-2 border-[#121314] px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold text-[#121314] outline-none focus:shadow-[2px_2px_0px_#121314]"
                        placeholder="123"
                      />
                    </div>
                  </div>

                  {isAuthenticated && (
                    <label className="flex items-center gap-2 pt-1 px-1 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={saveCardOption}
                        onChange={(e) => setSaveCardOption(e.target.checked)}
                        className="w-4 h-4 rounded border-2 border-[#121314] accent-[#121314]"
                      />
                      <span className="text-[11px] text-[#121314] font-bold">
                        Guardar esta tarjeta de forma segura para mis próximas compras
                      </span>
                    </label>
                  )}
                </div>
              )}

              {paymentMethod === 'transfer' && paymentSettings.transfer_active && (
                <div className="p-5 rounded-2xl bg-[#0ffcbe]/20 border-2 border-[#121314] shadow-[2px_2px_0px_#121314] space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-black uppercase tracking-wide text-[#121314] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px]">percent</span>
                      {paymentSettings.transfer_discount || 10}% de Descuento Inmediato
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-[#121314] text-white text-[10px] font-black uppercase">
                      Ahorras ${transferDiscount.toFixed(2)}
                    </span>
                  </div>
                  <div className="p-3.5 bg-white rounded-xl space-y-1.5 text-[#121314] text-[11px] font-mono border-2 border-[#121314] shadow-[2px_2px_0px_#121314]">
                    <p><b>Banco:</b> {paymentSettings.transfer_bank || 'Banco Santander'}</p>
                    <p><b>Titular:</b> {paymentSettings.transfer_holder || 'Fórmula 1370 Retail S.A.'}</p>
                    <p><b>CBU:</b> {paymentSettings.transfer_cbu || '0000003100010000849201'}</p>
                    <p><b>Alias:</b> <span className="text-[#106ebe] font-black">{paymentSettings.transfer_alias || 'FORMULA1370.PAGOS'}</span></p>
                  </div>
                  <p className="text-[11px] text-[#121314]/80 font-medium">
                    Envía el comprobante por WhatsApp o correo para despacho prioritario.
                  </p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || items.length === 0 || activeMethodsCount === 0}
              className={`w-full py-4 rounded-full text-xs font-black uppercase tracking-wider border-2 border-[#121314] shadow-[4px_4px_0px_#121314] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_#121314] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer disabled:opacity-50 mt-4 transition-all ${
                paymentMethod === 'mercadopago'
                  ? 'bg-[#009EE3] hover:bg-[#0089c7] text-white'
                  : paymentMethod === 'transfer'
                  ? 'bg-[#0ffcbe] hover:bg-[#00eaad] text-[#121314]'
                  : 'bg-[#ff78ac] hover:bg-[#ff629e] text-[#121314]'
              }`}
            >
              {loading ? (
                'Procesando...'
              ) : paymentMethod === 'mercadopago' ? (
                `Pagar con Mercado Pago $${total.toFixed(2)} ARS`
              ) : paymentMethod === 'transfer' ? (
                `Confirmar Transferencia $${total.toFixed(2)} ARS`
              ) : (
                `Pagar $${total.toFixed(2)} con Tarjeta`
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Order Summary Neo-Editorial Card */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-7 border-2 border-[#121314] shadow-[4px_4px_0px_#121314] space-y-5 sticky top-24">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#121314] pb-3 border-b-2 border-[#121314]/15">
            Resumen del Pedido ({items.length} {items.length === 1 ? 'producto' : 'productos'})
          </h3>

          {/* Items List */}
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3 items-center text-xs p-2 rounded-xl bg-[#f6f4ee] border-2 border-[#121314] shadow-[2px_2px_0px_#121314]">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-12 h-12 rounded-xl object-contain bg-white border border-[#121314] p-1 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-[#121314] truncate uppercase">{item.title}</h4>
                  <p className="text-[11px] font-bold text-[#121314]/60">
                    {item.variant ? `${item.variant} • ` : ''}Cant: {item.quantity}
                  </p>
                </div>
                <span className="font-black text-xs text-[#121314]">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="space-y-2 pt-3 border-t-2 border-[#121314]/15 text-xs text-[#121314]/80">
            <div className="flex justify-between font-bold">
              <span>Subtotal</span>
              <span className="font-black text-[#121314]">${subtotal.toFixed(2)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-[#106ebe] font-bold">
                <span>Descuento cupón ({discountCode})</span>
                <span className="font-black">-${discountAmount.toFixed(2)}</span>
              </div>
            )}

            {paymentMethod === 'transfer' && paymentSettings.transfer_active && transferDiscount > 0 && (
              <div className="flex justify-between text-[#106ebe] font-bold">
                <span>Descuento Transferencia ({paymentSettings.transfer_discount}%)</span>
                <span className="font-black">-${transferDiscount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between font-bold">
              <span>Costo de Envío</span>
              <span className={`font-black ${shippingCost > 0 ? 'text-[#106ebe]' : 'text-[#0ffcbe]'}`}>
                {shippingCost > 0 ? `$${shippingCost.toFixed(2)} ARS` : shippingRate === null ? 'A coordinar / WhatsApp' : 'Gratis'}
              </span>
            </div>

            <div className="flex justify-between items-baseline pt-3 border-t-2 border-[#121314] text-sm font-black text-[#121314]">
              <span className="uppercase">Total Final</span>
              <span className="text-2xl font-black text-[#121314]">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
