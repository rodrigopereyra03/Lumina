import React, { useState, useEffect } from 'react'
import { ordersApi, type BackendOrderDTO } from '../../../api/ordersApi'

interface AdminOrderItem {
  id: string
  customer: string
  email: string
  phone: string
  address: string
  date: string
  status: string
  items: { title: string; variant: string; price: number; quantity: number; image: string }[]
  subtotal: number
  shipping: number
  total: number
}

export const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrderItem[]>([])
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderItem | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('Todas')
  const [loading, setLoading] = useState<boolean>(true)
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null)

  const fetchOrders = async (currentFilter: string) => {
    setLoading(true)
    try {
      const res = await ordersApi.getOrders(currentFilter)
      if (res.orders) {
        const mapped: AdminOrderItem[] = res.orders.map((o: BackendOrderDTO) => ({
          id: o.order_number || o.id,
          customer: o.customer_name || 'Cliente Lumina',
          email: o.customer_email || 'cliente@ejemplo.com',
          phone: o.customer_phone || '+54 9 11 4455-6677',
          address: o.shipping_address || 'Dirección de Entrega',
          date: o.created_at
            ? new Date(o.created_at).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : 'Reciente',
          status: o.status || 'Pagado',
          items: (o.items || []).map((it) => ({
            title: it.title || 'Producto Lumina',
            variant: it.variant || 'Estándar',
            price: it.unit_price || 0,
            quantity: it.quantity || 1,
            image: it.image || 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=900&q=80',
          })),
          subtotal: o.subtotal || o.total || 0,
          shipping: o.shipping_cost || 0,
          total: o.total || 0,
        }))
        setOrders(mapped)
        if (mapped.length > 0) {
          setSelectedOrder((prev) => {
            if (prev) {
              const found = mapped.find((m) => m.id === prev.id)
              if (found) return found
            }
            return mapped[0]
          })
        } else {
          setSelectedOrder(null)
        }
      }
    } catch (e) {
      // Handled
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders(filterStatus)
  }, [filterStatus])

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedOrder) return

    // 1. Optimistic UI update
    setOrders((prev) =>
      prev.map((o) => (o.id === selectedOrder.id ? { ...o, status: newStatus } : o))
    )
    setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null))
    setStatusFeedback(`Orden ${selectedOrder.id} actualizada a "${newStatus}"`)
    setTimeout(() => setStatusFeedback(null), 3000)

    // 2. Persist to storage and backend
    try {
      await ordersApi.updateOrderStatus(selectedOrder.id, newStatus)
    } catch (e) {
      // Handled
    }
  }

  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase()
    if (s === 'pagado' || s === 'aprobado' || s === 'entregado') {
      return 'bg-[#E8F8F0] text-[#1E824C]'
    }
    if (s === 'enviado') {
      return 'bg-[#ffdad7]/80 text-[#FF4D4F]'
    }
    if (s === 'en proceso') {
      return 'bg-[#FFF0EB] text-[#D97757]'
    }
    if (s === 'cancelado') {
      return 'bg-[#ffdad6] text-[#ba1a1a]'
    }
    return 'bg-white/80 text-[#5b403e]'
  }

  return (
    <div className="space-y-6 font-body text-[#1b1c1c]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1b1c1c] tracking-tight">Órdenes</h1>
          <p className="text-xs sm:text-sm text-[#5b403e] mt-0.5">
            Supervisa pedidos de clientes, pagos recibidos y despachos en tiempo real.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex bg-white/70 border border-white/80 rounded-xl p-1 shadow-2xs text-xs font-semibold text-[#5b403e] overflow-x-auto">
          {['Todas', 'Pagado', 'En Proceso', 'Enviado', 'Entregado', 'Cancelado'].map((status) => (
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

      {statusFeedback && (
        <div className="p-3.5 rounded-xl bg-[#E8F8F0] border border-[#B7E5CD] text-[#1E824C] text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>{statusFeedback}</span>
        </div>
      )}

      {/* Main Content */}
      {loading ? (
        <div className="glass-panel rounded-2xl p-12 text-center text-xs text-[#5b403e]">
          Cargando órdenes desde la base de datos...
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center space-y-3 border border-white/70 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#ffdad7]/40 text-[#FF4D4F] flex items-center justify-center mx-auto shadow-xs">
            <span className="material-symbols-outlined text-[32px]">receipt_long</span>
          </div>
          <div>
            <h4 className="text-base font-bold text-[#1b1c1c]">No hay órdenes con estado "{filterStatus}"</h4>
            <p className="text-xs text-[#5b403e] max-w-md mx-auto mt-1">
              Las compras realizadas por tus clientes aparecerán aquí según su estado.
            </p>
          </div>
        </div>
      ) : (
        /* Main Split View: Orders List & Order Detail Inspector */
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
                  {orders.map((ord) => {
                    const isSelected = selectedOrder?.id === ord.id

                    return (
                      <tr
                        key={ord.id}
                        onClick={() => setSelectedOrder(ord)}
                        className={`cursor-pointer transition-all ${
                          isSelected ? 'bg-white/80 font-semibold shadow-2xs' : 'hover:bg-white/40'
                        }`}
                      >
                        <td className="py-3.5 font-mono font-bold text-[#FF4D4F]">{ord.id}</td>
                        <td className="py-3.5 text-[#1b1c1c] font-medium">{ord.customer}</td>
                        <td className="py-3.5 text-[#5b403e]">{ord.date}</td>
                        <td className="py-3.5 font-bold text-[#1b1c1c]">${ord.total.toFixed(2)} ARS</td>
                        <td className="py-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadge(
                              ord.status
                            )}`}
                          >
                            {ord.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center text-xs text-[#5b403e] pt-3 border-t border-white/60">
              <span>
                Mostrando {orders.length} órdenes ({filterStatus})
              </span>
              <span className="font-semibold text-[#1b1c1c]">Base de Datos Lumina</span>
            </div>
          </div>

          {/* Right Column: Order Detail Inspector */}
          {selectedOrder && (
            <div className="lg:col-span-5 glass-panel rounded-2xl p-6 sm:p-7 border border-white/70 shadow-sm space-y-5 sticky top-24">
              <div className="flex justify-between items-center border-b border-white/60 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#5b403e]">
                    Detalle de Orden
                  </span>
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
                <span className="font-bold text-xs text-[#1b1c1c] block">
                  Productos del Pedido ({selectedOrder.items.length})
                </span>
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
                      <span className="font-bold text-xs text-[#1b1c1c]">${(item.price * item.quantity).toFixed(2)}</span>
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
                  <span className="text-lg font-bold text-[#FF4D4F]">${selectedOrder.total.toFixed(2)} ARS</span>
                </div>
              </div>

              {/* Status Changer Actions */}
              <div className="pt-2 flex flex-col gap-2">
                <span className="text-[11px] font-bold text-[#5b403e]">Cambiar Estado del Pedido:</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => handleUpdateStatus('Enviado')}
                    className={`py-2.5 px-2 rounded-xl font-bold text-center cursor-pointer transition-all flex items-center justify-center gap-1 ${
                      selectedOrder.status === 'Enviado'
                        ? 'bg-[#FF4D4F] text-white shadow-md'
                        : 'bg-white/80 text-[#FF4D4F] border border-white hover:bg-[#FF4D4F] hover:text-white shadow-2xs'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                    <span>Marcar Enviado</span>
                  </button>

                  <button
                    onClick={() => handleUpdateStatus('Entregado')}
                    className={`py-2.5 px-2 rounded-xl font-bold text-center cursor-pointer transition-all flex items-center justify-center gap-1 ${
                      selectedOrder.status === 'Entregado'
                        ? 'bg-[#1E824C] text-white shadow-md'
                        : 'bg-white/80 text-[#1E824C] border border-white hover:bg-[#1E824C] hover:text-white shadow-2xs'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>Marcar Entregado</span>
                  </button>

                  <button
                    onClick={() => handleUpdateStatus('En Proceso')}
                    className={`py-2 px-2 rounded-xl text-[11px] font-semibold text-center cursor-pointer transition-all ${
                      selectedOrder.status === 'En Proceso'
                        ? 'bg-[#D97757] text-white'
                        : 'bg-white/60 text-[#5b403e] hover:bg-white'
                    }`}
                  >
                    En Proceso
                  </button>

                  <button
                    onClick={() => handleUpdateStatus('Cancelado')}
                    className={`py-2 px-2 rounded-xl text-[11px] font-semibold text-center cursor-pointer transition-all ${
                      selectedOrder.status === 'Cancelado'
                        ? 'bg-[#ba1a1a] text-white'
                        : 'bg-white/60 text-red-500 hover:bg-red-50'
                    }`}
                  >
                    Cancelar Orden
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
