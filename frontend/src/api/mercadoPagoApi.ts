import { axiosInstance } from './axiosInstance'

export interface CreateMPPreferenceItem {
  id?: string
  title: string
  quantity: number
  unit_price: number
  currency_id?: string
  description?: string
  picture_url?: string
}

export interface CreateMPPreferencePayer {
  name?: string
  surname?: string
  email: string
  phone?: string
  address?: string
}

export interface CreateMPPreferencePayload {
  order_id: string
  items: CreateMPPreferenceItem[]
  payer: CreateMPPreferencePayer
  back_url?: string
}

export interface MPPreferenceResponse {
  preference_id: string
  init_point: string
  sandbox_init_point: string
  public_key: string
}

const DEFAULT_MP_ACCESS_TOKEN = 'APP_USR-1887517460534002-082719-20e9045bc921801c6df09603e8ed153f-3644485241'
const DEFAULT_MP_PUBLIC_KEY = 'APP_USR-09e00df2-06bc-4d0e-b5de-13aaffd650d2'

export const mercadoPagoApi = {
  createPreference: async (payload: CreateMPPreferencePayload): Promise<MPPreferenceResponse> => {
    console.group('🔵 [MERCADO PAGO] Creando Preferencia de Pago')
    console.log('📦 Payload inicial recibido:', payload)

    // 1. Sanitize order ID by removing '#' to avoid URL hash fragment breaking Mercado Pago's router
    const cleanOrderId = (payload.order_id || '').replace(/#/g, '').trim()

    const sanitizedItems = payload.items.map((it, idx) => ({
      id: it.id || `item-${idx + 1}`,
      title: it.title || 'Producto Lumina',
      description: it.description || it.title || 'Producto de Lumina Store',
      picture_url: it.picture_url || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&q=80',
      quantity: Math.max(1, it.quantity || 1),
      unit_price: Number(it.unit_price) > 0 ? Number(it.unit_price) : 10.0,
      currency_id: it.currency_id || 'ARS',
    }))

    const sanitizedPayload = {
      ...payload,
      order_id: cleanOrderId,
      items: sanitizedItems,
    }

    console.log('✨ Payload sanitizado:', sanitizedPayload)

    // 2. First try calling our backend Go API
    try {
      console.log('🚀 Intentando crear preferencia mediante Backend Go (/api/v1/payments/mercadopago/preference)...')
      const res = await axiosInstance.post<{ content: MPPreferenceResponse }>(
        '/payments/mercadopago/preference',
        sanitizedPayload,
        { timeout: 4000 }
      )
      if (res.data?.content?.init_point) {
        console.log('✅ Preferencia generada por Backend Go:', res.data.content)
        console.groupEnd()
        return res.data.content
      }
    } catch (backendErr: any) {
      console.warn('⚠️ Fallback a API directa de Mercado Pago:', backendErr?.message || backendErr)
    }

    // 3. Direct Mercado Pago REST API call
    const baseUrl = payload.back_url || (typeof window !== 'undefined' ? window.location.origin : 'https://lumina-d31.pages.dev')

    const mpBody = {
      items: sanitizedItems,
      payer: {
        name: payload.payer.name || 'Cliente',
        surname: payload.payer.surname || 'Lumina',
        email: payload.payer.email || 'comprador@lumina.com',
      },
      back_urls: {
        success: `${baseUrl}/order-success?status=approved&order_id=${cleanOrderId}`,
        failure: `${baseUrl}/checkout?status=failure&order_id=${cleanOrderId}`,
        pending: `${baseUrl}/order-success?status=pending&order_id=${cleanOrderId}`,
      },
      auto_return: 'approved',
      external_reference: cleanOrderId,
      statement_descriptor: 'LUMINA STORE',
    }

    console.log('📡 Enviando petición directa a https://api.mercadopago.com/checkout/preferences:', mpBody)

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEFAULT_MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mpBody),
    })

    if (!response.ok) {
      const errData = await response.json()
      console.error('❌ Error devuelto por Mercado Pago API:', errData)
      console.groupEnd()
      throw new Error(errData.message || 'Error al comunicarse con Mercado Pago')
    }

    const data = await response.json()
    console.log('🎉 Preferencia creada con éxito en Mercado Pago:', {
      id: data.id,
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point,
    })
    console.groupEnd()

    return {
      preference_id: data.id,
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point,
      public_key: DEFAULT_MP_PUBLIC_KEY,
    }
  },

  refundPayment: async (
    paymentId: string
  ): Promise<{ success: boolean; message: string; refund_id?: string }> => {
    try {
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}/refunds`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DEFAULT_MP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.message || 'Error al procesar el reembolso en Mercado Pago')
      }

      const data = await response.json()
      return {
        success: true,
        message: 'Reembolso de $' + (data.amount || '') + ' procesado con éxito en Mercado Pago',
        refund_id: data.id ? data.id.toString() : undefined,
      }
    } catch (err: any) {
      console.error('Mercado Pago refund error:', err)
      return {
        success: false,
        message: err.message || 'No se pudo procesar el reembolso en Mercado Pago',
      }
    }
  },
}
