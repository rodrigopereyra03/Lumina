import { axiosInstance } from './axiosInstance'

export interface BackendOrderItemDTO {
  id?: string
  product_id?: string
  title: string
  variant?: string
  unit_price: number
  quantity: number
  image?: string
}

export interface BackendOrderDTO {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  shipping_address: string
  status: 'Pagado' | 'En Proceso' | 'Enviado' | 'Entregado' | 'Cancelado' | string
  subtotal: number
  shipping_cost: number
  total: number
  items?: BackendOrderItemDTO[]
  created_at: string
}

export interface CreateOrderPayload {
  customer_name: string
  customer_email: string
  customer_phone?: string
  shipping_address: string
  items: {
    product_id?: string
    title: string
    variant?: string
    unit_price: number
    quantity: number
    image?: string
  }[]
}

const SYSTEM_ORDERS_KEY = 'lumina_all_system_orders'

export const ordersApi = {
  createOrder: async (payload: CreateOrderPayload): Promise<{ order: BackendOrderDTO }> => {
    const subtotal = payload.items.reduce((acc, it) => acc + it.unit_price * it.quantity, 0)
    const newOrder: BackendOrderDTO = {
      id: 'ord_' + Date.now(),
      order_number: '#LUM-' + Math.floor(100000 + Math.random() * 900000) + '-01',
      customer_name: payload.customer_name || 'Cliente Lumina',
      customer_email: payload.customer_email || 'cliente@ejemplo.com',
      customer_phone: payload.customer_phone || '+54 9 11 4455-6677',
      shipping_address: payload.shipping_address || 'Dirección de Entrega',
      status: 'Pagado',
      subtotal: subtotal,
      shipping_cost: 0,
      total: subtotal,
      items: payload.items,
      created_at: new Date().toISOString(),
    }

    // Save locally to system orders cache
    const stored = localStorage.getItem(SYSTEM_ORDERS_KEY)
    const list: BackendOrderDTO[] = stored ? JSON.parse(stored) : []
    const updated = [newOrder, ...list.filter((o) => o.order_number !== newOrder.order_number)]
    localStorage.setItem(SYSTEM_ORDERS_KEY, JSON.stringify(updated))

    try {
      const res = await axiosInstance.post('/orders', payload, { timeout: 2500 })
      if (res.data?.content?.order) {
        return { order: res.data.content.order }
      }
    } catch (e) {
      // Return local order
    }

    return { order: newOrder }
  },

  getOrders: async (statusFilter?: string): Promise<{ orders: BackendOrderDTO[]; total: number }> => {
    const stored = localStorage.getItem(SYSTEM_ORDERS_KEY)
    let localOrders: BackendOrderDTO[] = stored ? JSON.parse(stored) : []

    // Also inspect any user specific orders that might have been recorded
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('lumina_orders_')) {
        try {
          const userOrdersRaw = localStorage.getItem(key)
          if (userOrdersRaw) {
            const userOrders = JSON.parse(userOrdersRaw)
            userOrders.forEach((uo: any) => {
              const existing = localOrders.find((lo) => lo.order_number === uo.order_number || lo.id === uo.id)
              if (!existing) {
                localOrders.push({
                  id: uo.id || 'ord_' + Date.now(),
                  order_number: uo.order_number,
                  customer_name: key.replace('lumina_orders_', '').split('@')[0],
                  customer_email: key.replace('lumina_orders_', ''),
                  customer_phone: '+54 9 11 4455-6677',
                  shipping_address: 'Domicilio Registrado',
                  status: uo.status === 'Aprobado' ? 'Pagado' : uo.status || 'Pagado',
                  subtotal: uo.subtotal || uo.total,
                  shipping_cost: 0,
                  total: uo.total,
                  items: uo.items?.map((it: any) => ({
                    title: it.title,
                    variant: it.variant || 'Estándar',
                    unit_price: it.price,
                    quantity: it.quantity,
                    image: it.image,
                  })),
                  created_at: new Date().toISOString(),
                })
              }
            })
          }
        } catch (err) {}
      }
    }

    try {
      const url = statusFilter && statusFilter !== 'Todas' && statusFilter !== 'All' ? `/orders?status=${statusFilter}` : '/orders'
      const res = await axiosInstance.get(url, { timeout: 2500 })
      const remote = res.data.content || res.data
      if (remote?.orders && Array.isArray(remote.orders)) {
        const mergedMap = new Map<string, BackendOrderDTO>()
        remote.orders.forEach((o: BackendOrderDTO) => mergedMap.set(o.order_number || o.id, o))
        localOrders.forEach((o: BackendOrderDTO) => {
          if (!mergedMap.has(o.order_number) && !mergedMap.has(o.id)) {
            mergedMap.set(o.order_number || o.id, o)
          }
        })
        const mergedList = Array.from(mergedMap.values())
        localStorage.setItem(SYSTEM_ORDERS_KEY, JSON.stringify(mergedList))
        localOrders = mergedList
      }
    } catch (e) {
      // Use local orders
    }

    // Save back unified list
    localStorage.setItem(SYSTEM_ORDERS_KEY, JSON.stringify(localOrders))

    const filtered = statusFilter && statusFilter !== 'Todas' && statusFilter !== 'All'
      ? localOrders.filter((o) => {
          const s = (o.status || '').toLowerCase()
          const f = statusFilter.toLowerCase()
          if (f === 'pagado') {
            return s === 'pagado' || s === 'aprobado'
          }
          return s === f
        })
      : localOrders

    return {
      orders: filtered,
      total: filtered.length,
    }
  },

  updateOrderStatus: async (orderId: string, newStatus: string): Promise<{ message: string; status: string }> => {
    // 1. Update in system orders
    const stored = localStorage.getItem(SYSTEM_ORDERS_KEY)
    if (stored) {
      const list: BackendOrderDTO[] = JSON.parse(stored)
      const updated = list.map((o) => {
        if (o.id === orderId || o.order_number === orderId) {
          return { ...o, status: newStatus }
        }
        return o
      })
      localStorage.setItem(SYSTEM_ORDERS_KEY, JSON.stringify(updated))
    }

    // 2. Sync to user specific order stores
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('lumina_orders_')) {
        try {
          const userOrdersRaw = localStorage.getItem(key)
          if (userOrdersRaw) {
            const userOrders = JSON.parse(userOrdersRaw)
            const updatedUserOrders = userOrders.map((uo: any) => {
              if (uo.order_number === orderId || uo.id === orderId) {
                return {
                  ...uo,
                  status: newStatus,
                  status_color:
                    newStatus === 'Entregado'
                      ? 'bg-[#E8F8F0] text-[#1E824C]'
                      : newStatus === 'Enviado'
                      ? 'bg-[#ffdad7]/60 text-[#FF4D4F]'
                      : newStatus === 'En Proceso'
                      ? 'bg-[#FFF0EB] text-[#D97757]'
                      : 'bg-white/80 text-[#5b403e]',
                }
              }
              return uo
            })
            localStorage.setItem(key, JSON.stringify(updatedUserOrders))
          }
        } catch (err) {}
      }
    }

    // 3. Update in backend Go API
    try {
      await axiosInstance.patch(`/orders/${orderId}/status`, { status: newStatus }, { timeout: 2500 })
    } catch (e) {
      // Handled locally
    }

    return { message: 'Updated', status: newStatus }
  },
}
