import React, { useState, useEffect } from 'react'
import { ordersApi } from '../../../api/ordersApi'

interface AdminOrderItem {
  id: string
  customer: string
  email: string
  phone: string
  address: string
  date: string
  status: 'Pagado' | 'En Proceso' | 'Enviado' | 'Entregado' | 'Cancelado'
  items: { title: string; variant: string; price: number; quantity: number; image: string }[]
  subtotal: number
  shipping: number
  total: number
}

const DEFAULT_ORDERS: AdminOrderItem[] = [
  {
    id: '#ORD-9482',
    customer: 'Juan Pérez',
    email: 'juan.perez@example.com',
    phone: '+54 9 11 4455-6677',
    address: 'Av. Santa Fe 2345, Depto 4B, Buenos Aires',
    date: '26 Ago, 2026',
    status: 'Pagado',
    items: [
      {
        title: 'Aura Studio Headphones',
        variant: 'Beige Cálido',
        price: 249.00,
        quantity: 1,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRMBqcSAOlGw8fva1sekJfFL1iyNxoOG30EYhsDenxyYzzAF04FxX1FgXEbZTU6SJvW2nVWHnGnBG7LopgiXjLXuwec6EUYzjEhi0vyeTA5_UyOCNKxM69zbbZiACDwI9KWpNKDEFd_KW2XBxPz1leGqc3w4m_9ye_DJiJdmIpiBESuU0NWnNtY1jzrcfkeSWfHS-wTW-dGKnwvrOmHslmo1tbHo2pGx5v07Ac0BaES2eb981u0_c0'
      },
      {
        title: 'Echo Hub Speaker',
        variant: 'Tela Gris Acústica',
        price: 129.00,
        quantity: 1,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGKYxdDdkhw23SLm86Jy80Xw3x-Ka-RX74-P1Aicq2ZMo4-UYh8vCQOQTEzkze35uAAu6_eEKH1Y73GIZNN8H07Eahu3JwdtkcljKHOl-K8Loo_rTuzL52pjsAQdyUBcX90Da4cnvE2F93-B3zfPoAXbsw14DRn5Zb0mAGaGMdi_5N8J7m6QArP8jfzMKlfoLpYt9Pja_iIMp55YheB6z8lqsLXl3FasrryoUUi65f-VWncHWYG-jB'
      }
    ],
    subtotal: 378.00,
    shipping: 0,
    total: 378.00
  },
  {
    id: '#ORD-9481',
    customer: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    phone: '+1 (555) 234-5678',
    address: '742 Evergreen Terrace, Apt 4B, San Francisco, CA 94102',
    date: '25 Ago, 2026',
    status: 'En Proceso',
    items: [
      {
        title: 'The Minimalist Tote',
        variant: 'Caramelo',
        price: 245.00,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=900&q=80'
      }
    ],
    subtotal: 245.00,
    shipping: 0,
    total: 245.00
  }
]

export const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrderItem[]>(DEFAULT_ORDERS)
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderItem>(DEFAULT_ORDERS[0])
  const [filterStatus, setFilterStatus] = useState<string>('Todas')

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await ordersApi.getOrders(filterStatus)
        if (res.orders && res.orders.length > 0) {
          const mapped: AdminOrderItem[] = res.orders.map((o) => ({
            id: o.order_number,
            customer: o.customer_name,
            email: o.customer_email,
            phone: o.customer_phone || '+54 9 11 4455-6677',
            address: o.shipping_address,
            date: new Date(o.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
            status: (o.status as any) || 'Pagado',
            items: (o.items || []).map((it) => ({
              title: it.title,
              variant: it.variant || 'Estándar',
              price: it.unit_price,
              quantity: it.quantity,
              image: it.image || 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=900&q=80',
            })),
            subtotal: o.subtotal,
            shipping: o.shipping_cost,
            total: o.total,
          }))
          setOrders(mapped)
          if (mapped.length > 0) setSelectedOrder(mapped[0])
        }
      } catch (e) {
        // use local state
      }
    }
    fetchOrders()
  }, [filterStatus])

  const filteredOrders = filterStatus === 'Todas'
    ? orders
    : orders.filter(o => o.status === filterStatus)

  const handleUpdateStatus = async (newStatus: AdminOrderItem['status']) => {
    setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: newStatus } : o))
    setSelectedOrder(prev => ({ ...prev, status: newStatus }))

    try {
      await ordersApi.updateOrderStatus(selectedOrder.id, newStatus)
    } catch (e) {
      // Handled gracefully
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pagado':
      case 'Entregado':
        return 'bg-[#E8F8F0] text-[#1E824C]'
      case 'En Proceso':
        return 'bg-[#FFF0EB] text-[#D97757]'
      case 'Enviado':
        return 'bg-[#ffdad7]/60 text-[#FF4D4F]'
      default:
        return 'bg-white/80 text-[#5b403e]'
    }
  }

  return (
    <div className="space-y-6 font-body text-[#1b1c1c]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1b1c1c] tracking-tight">Órdenes</h1>
          <p className="text-xs sm:text-sm text-[#5b403e] mt-0.5">
            Supervisa pedidos de clientes, despachos y facturación en tiempo real.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex bg-white/70 border border-white/80 rounded-xl p-1 shadow-2xs text-xs font-semibold text-[#5b403e] overflow-x-auto">
          {['Todas', 'Pagado', 'En Proceso', 'Enviado', 'Entregado'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filterStatus === status
                  ? 'bg-[#FF4D4F] text-white font-bold shadow-xs'
                  : 'hover:text-[#1b1c1c]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split View: Orders List & Order Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Orders Table */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-6 border border-white/70 shadow-sm space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/60 text-[#5b403e]">
                  <th className="pb-3 font-semibold">N° Orden</th>
                  <th className="pb-3 font-semibold">Cliente</th>
                  <th className="pb-3 font-semibold">Fecha</th>
                  <th className="pb-3 font-semibold">Total</th>
                  <th className="pb-3 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/50">
                {filteredOrders.map((ord) => {
                  const isSelected = ord.id === selectedOrder.id

                  return (
                    <tr
                      key={ord.id}
                      onClick={() => setSelectedOrder(ord)}
                      className={`cursor-pointer transition-all ${
                        isSelected ? 'bg-white/80 font-semibold' : 'hover:bg-white/40'
                      }`}
                    >
                      <td className="py-3.5 font-mono font-bold text-[#FF4D4F]">{ord.id}</td>
                      <td className="py-3.5 text-[#1b1c1c] font-medium">{ord.customer}</td>
                      <td className="py-3.5 text-[#5b403e]">{ord.date}</td>
                      <td className="py-3.5 font-bold text-[#1b1c1c]">${ord.total.toFixed(2)}</td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadge(ord.status)}`}>
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Order Detail Inspector */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 sm:p-7 border border-white/70 shadow-sm space-y-5 sticky top-24">
          <div className="flex justify-between items-center border-b border-white/60 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#5b403e]">Detalle de Orden</span>
              <h3 className="text-lg font-bold text-[#1b1c1c]">{selectedOrder.id}</h3>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(selectedOrder.status)}`}>
              {selectedOrder.status}
            </span>
          </div>

          {/* Customer & Shipping Details */}
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white/60 space-y-1">
              <span className="font-bold text-[#1b1c1c] block">Información del Cliente</span>
              <p className="font-semibold text-[#1b1c1c]">{selectedOrder.customer}</p>
              <p className="text-[#5b403e]">{selectedOrder.email}</p>
              <p className="text-[#5b403e]">{selectedOrder.phone}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/60 space-y-1">
              <span className="font-bold text-[#1b1c1c] block">Dirección de Entrega</span>
              <p className="text-[#5b403e]">{selectedOrder.address}</p>
            </div>
          </div>

          {/* Items Purchased */}
          <div className="space-y-3 pt-2 border-t border-white/60">
            <span className="font-bold text-xs text-[#1b1c1c] block">Productos del Pedido</span>
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 rounded-xl bg-white/50 border border-white/60">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-10 h-10 object-contain rounded-lg bg-white p-1 shrink-0 mix-blend-multiply"
                  />
                  <div className="flex-1 min-w-0 text-xs">
                    <p className="font-bold text-[#1b1c1c] truncate">{item.title}</p>
                    <p className="text-[11px] text-[#5b403e]">{item.variant} • Cant: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-xs text-[#1b1c1c]">${item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Breakdown */}
          <div className="space-y-1.5 pt-3 border-t border-white/60 text-xs text-[#5b403e]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-[#1b1c1c]">${selectedOrder.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Envío</span>
              <span className="font-semibold text-[#1E824C]">Gratis</span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-white/80 text-sm font-bold text-[#1b1c1c]">
              <span>Total</span>
              <span className="text-lg font-bold text-[#FF4D4F]">${selectedOrder.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Status Changer Actions */}
          <div className="pt-2 flex flex-col gap-2">
            <span className="text-[11px] font-bold text-[#5b403e]">Actualizar Estado:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleUpdateStatus('Enviado')}
                className="btn-primary py-2.5 rounded-xl text-xs font-bold text-center cursor-pointer shadow-xs"
              >
                Marcar como Enviado
              </button>
              <button
                onClick={() => handleUpdateStatus('Entregado')}
                className="glass-button-secondary py-2.5 rounded-xl text-xs font-semibold text-center cursor-pointer"
              >
                Marcar como Entregado
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
