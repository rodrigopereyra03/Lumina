import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ordersApi, type BackendOrderDTO } from '../../../api/ordersApi'
import { usersApi } from '../../../api/usersApi'
import { categoriesApi, type BackendCategoryDTO } from '../../../api/categoriesApi'
import type { User } from '../../../store/useAuthStore'

type TimeFrame = 'today' | 'week' | 'month'

export const AdminDashboard: React.FC = () => {
  const [timeframe, setTimeframe] = useState<TimeFrame>('month')
  const [orders, setOrders] = useState<BackendOrderDTO[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [categories, setCategories] = useState<BackendCategoryDTO[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        const [ordersRes, usersRes, catsRes] = await Promise.all([
          ordersApi.getOrders('Todas'),
          usersApi.getUsers(),
          categoriesApi.getCategories(),
        ])

        if (ordersRes.orders) setOrders(ordersRes.orders)
        if (usersRes.users) setUsers(usersRes.users)
        if (catsRes.categories) setCategories(catsRes.categories)
      } catch (err) {
        console.error('Error loading dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  // Filter orders by timeframe
  const filteredOrders = useMemo(() => {
    const now = new Date()
    let startTime = 0

    if (timeframe === 'today') {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
      startTime = todayStart
    } else if (timeframe === 'week') {
      startTime = now.getTime() - 7 * 24 * 60 * 60 * 1000
    } else {
      // Month
      startTime = now.getTime() - 30 * 24 * 60 * 60 * 1000
    }

    return orders.filter((o) => {
      const orderTime = o.created_at ? new Date(o.created_at).getTime() : now.getTime()
      return orderTime >= startTime
    })
  }, [orders, timeframe])

  // Filter users by timeframe
  const filteredUsers = useMemo(() => {
    const now = new Date()
    let startTime = 0

    if (timeframe === 'today') {
      startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    } else if (timeframe === 'week') {
      startTime = now.getTime() - 7 * 24 * 60 * 60 * 1000
    } else {
      startTime = now.getTime() - 30 * 24 * 60 * 60 * 1000
    }

    return users.filter((u) => {
      const userTime = u.created_at ? new Date(u.created_at).getTime() : now.getTime()
      return userTime >= startTime
    })
  }, [users, timeframe])

  // Key KPI Calculations
  const totalSales = useMemo(() => {
    return filteredOrders
      .filter((o) => (o.status || '').toLowerCase() !== 'cancelado')
      .reduce((sum, o) => sum + (o.total || 0), 0)
  }, [filteredOrders])

  const pendingOrdersCount = useMemo(() => {
    return filteredOrders.filter(
      (o) => (o.status || '').toLowerCase() === 'en proceso' || (o.status || '').toLowerCase() === 'pendiente'
    ).length
  }, [filteredOrders])

  const totalCustomersCount = useMemo(() => {
    return timeframe === 'month' ? users.length : filteredUsers.length || users.length
  }, [users, filteredUsers, timeframe])

  const averageTicket = useMemo(() => {
    const paidOrders = filteredOrders.filter((o) => (o.status || '').toLowerCase() !== 'cancelado')
    if (paidOrders.length === 0) return 0
    return totalSales / paidOrders.length
  }, [filteredOrders, totalSales])

  // Daily Revenue Calculation for Chart
  const revenueChartData = useMemo(() => {
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    const dailyMap: { [key: string]: number } = {
      Lun: 0,
      Mar: 0,
      Mié: 0,
      Jue: 0,
      Vie: 0,
      Sáb: 0,
      Dom: 0,
    }

    filteredOrders
      .filter((o) => (o.status || '').toLowerCase() !== 'cancelado')
      .forEach((o) => {
        const d = o.created_at ? new Date(o.created_at) : new Date()
        const dayName = dayNames[d.getDay()]
        if (dailyMap[dayName] !== undefined) {
          dailyMap[dayName] += o.total || 0
        }
      })

    const orderedDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
    const maxAmount = Math.max(...Object.values(dailyMap), 1)

    return orderedDays.map((day) => {
      const amount = dailyMap[day]
      const heightPercent = amount > 0 ? Math.max(15, Math.round((amount / maxAmount) * 100)) : 6
      return {
        day,
        amount,
        height: `${heightPercent}%`,
      }
    })
  }, [filteredOrders])

  // Top Categories Distribution Calculation
  const topCategoriesData = useMemo(() => {
    const catRevenueMap: { [cat: string]: number } = {}
    let totalCatRevenue = 0

    filteredOrders
      .filter((o) => (o.status || '').toLowerCase() !== 'cancelado')
      .forEach((o) => {
        ;(o.items || []).forEach((it) => {
          const itemCat = (it.variant && it.variant !== 'Estándar' ? it.variant : null) || 'General'
          const revenue = (it.unit_price || 0) * (it.quantity || 1)
          catRevenueMap[itemCat] = (catRevenueMap[itemCat] || 0) + revenue
          totalCatRevenue += revenue
        })
      })

    const colors = ['bg-[#FF4D4F]', 'bg-[#FF8A80]', 'bg-[#D97757]', 'bg-[#1E824C]', 'bg-[#6C7A89]']

    if (totalCatRevenue === 0) {
      return categories.slice(0, 4).map((c, i) => ({
        name: c.name,
        percentage: 0,
        sales: '$0.00 ARS',
        color: colors[i % colors.length],
      }))
    }

    return Object.entries(catRevenueMap)
      .map(([name, revenue], idx) => {
        const percentage = Math.round((revenue / totalCatRevenue) * 100) || 0
        return {
          name,
          percentage,
          sales: `$${revenue.toFixed(2)} ARS`,
          color: colors[idx % colors.length],
        }
      })
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 4)
  }, [filteredOrders, categories])

  // Export CSV Report Function
  const handleExportReport = () => {
    const timeframeLabel = timeframe === 'today' ? 'Hoy' : timeframe === 'week' ? 'Esta_Semana' : 'Este_Mes'
    const now = new Date().toLocaleString('es-ES')

    // UTF-8 BOM for Excel
    let csvContent = '\uFEFF'

    // Header
    csvContent += '==================================================\n'
    csvContent += 'LUMINA E-COMMERCE - REPORTE EJECUTIVO DE VENTAS\n'
    csvContent += `Periodo: ${timeframeLabel} | Generado: ${now}\n`
    csvContent += '==================================================\n\n'

    // Summary Section
    csvContent += 'RESUMEN GENERAL\n'
    csvContent += 'Métrica;Valor\n'
    csvContent += `Ventas Totales;$${totalSales.toFixed(2)} ARS\n`
    csvContent += `Órdenes Totales;${filteredOrders.length}\n`
    csvContent += `Órdenes Pendientes;${pendingOrdersCount}\n`
    csvContent += `Clientes Totales;${totalCustomersCount}\n`
    csvContent += `Ticket Promedio;$${averageTicket.toFixed(2)} ARS\n\n`

    // Orders Detail Section
    csvContent += 'DETALLE DE ÓRDENES\n'
    csvContent += 'N° Orden;Fecha;Cliente;Email;Teléfono;Dirección;Estado;Total (ARS)\n'
    filteredOrders.forEach((o) => {
      const dateStr = o.created_at ? new Date(o.created_at).toLocaleDateString('es-ES') : 'Reciente'
      csvContent += `"${o.order_number || o.id}";"${dateStr}";"${o.customer_name || 'Cliente'}";"${o.customer_email || ''}";"${o.customer_phone || ''}";"${(o.shipping_address || '').replace(/"/g, '""')}";"${o.status || 'Pagado'}";$${(o.total || 0).toFixed(2)}\n`
    })

    csvContent += '\n'

    // Top Categories Section
    csvContent += 'RENDIMIENTO POR CATEGORÍA\n'
    csvContent += 'Categoría;Ventas (ARS);Participación (%)\n'
    topCategoriesData.forEach((c) => {
      csvContent += `"${c.name}";"${c.sales}";${c.percentage}%\n`
    })

    // Create Download Link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `Reporte_Lumina_${timeframeLabel}_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-[#5b403e] glass-panel rounded-2xl border border-white/70 shadow-sm">
        <div className="w-10 h-10 border-2 border-[#FF4D4F] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <span>Calculando métricas y facturación en tiempo real...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8 font-body text-[#1b1c1c]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1b1c1c] tracking-tight">Resumen General</h1>
          <p className="text-xs sm:text-sm text-[#5b403e] mt-0.5">
            Métricas de la tienda en tiempo real, volumen de ventas y facturación en vivo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Timeframe Filter Pills */}
          <div className="flex bg-white/70 border border-white/80 rounded-xl p-1 shadow-2xs text-xs font-semibold text-[#5b403e]">
            <button
              onClick={() => setTimeframe('today')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeframe === 'today' ? 'bg-[#FF4D4F] text-white font-bold shadow-xs' : 'hover:text-[#1b1c1c]'
              }`}
            >
              Hoy
            </button>
            <button
              onClick={() => setTimeframe('week')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeframe === 'week' ? 'bg-[#FF4D4F] text-white font-bold shadow-xs' : 'hover:text-[#1b1c1c]'
              }`}
            >
              Esta Semana
            </button>
            <button
              onClick={() => setTimeframe('month')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeframe === 'month' ? 'bg-[#FF4D4F] text-white font-bold shadow-xs' : 'hover:text-[#1b1c1c]'
              }`}
            >
              Este Mes
            </button>
          </div>

          {/* Export Report Button */}
          <button
            onClick={handleExportReport}
            className="btn-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer hover:brightness-105 active:scale-95 transition-all"
            title="Descargar reporte en formato Excel / CSV"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Exportar Reporte (.xlsx / .csv)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Sales */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="glass-panel rounded-2xl p-6 border border-white/70 shadow-sm space-y-3"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs text-[#5b403e] font-semibold uppercase tracking-wider">
              Ventas Totales
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#ffdad7]/50 flex items-center justify-center text-[#FF4D4F]">
              <span className="material-symbols-outlined text-[18px]">payments</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#1b1c1c] tracking-tight">
              ${totalSales.toFixed(2)}
            </span>
            <span className="text-[10px] font-bold text-[#1E824C] flex items-center gap-0.5 bg-[#E8F8F0] px-2 py-0.5 rounded-full">
              <span className="material-symbols-outlined text-[12px]">trending_up</span>
              {filteredOrders.length} {filteredOrders.length === 1 ? 'orden' : 'órdenes'}
            </span>
          </div>
        </motion.div>

        {/* Pending Orders */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="glass-panel rounded-2xl p-6 border border-white/70 shadow-sm space-y-3"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs text-[#5b403e] font-semibold uppercase tracking-wider">
              Órdenes Pendientes
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FFF0EB] flex items-center justify-center text-[#D97757]">
              <span className="material-symbols-outlined text-[18px]">hourglass_top</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#1b1c1c] tracking-tight">
              {pendingOrdersCount}
            </span>
            <span className="text-[10px] font-semibold text-[#D97757] bg-[#FFF0EB] px-2 py-0.5 rounded-full">
              {pendingOrdersCount === 1 ? 'En preparación' : 'En preparación'}
            </span>
          </div>
        </motion.div>

        {/* Total Customers */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="glass-panel rounded-2xl p-6 border border-white/70 shadow-sm space-y-3"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs text-[#5b403e] font-semibold uppercase tracking-wider">
              Clientes Registrados
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#e2e2e4]/70 flex items-center justify-center text-[#1b1c1c]">
              <span className="material-symbols-outlined text-[18px]">group</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#1b1c1c] tracking-tight">
              {totalCustomersCount}
            </span>
            <span className="text-[10px] font-bold text-[#1E824C] flex items-center gap-0.5 bg-[#E8F8F0] px-2 py-0.5 rounded-full">
              Activos
            </span>
          </div>
        </motion.div>

        {/* Avg Order Value */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="glass-panel rounded-2xl p-6 border border-white/70 shadow-sm space-y-3"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs text-[#5b403e] font-semibold uppercase tracking-wider">
              Ticket Promedio
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#ffdad7]/50 flex items-center justify-center text-[#FF4D4F]">
              <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#1b1c1c] tracking-tight">
              ${averageTicket.toFixed(2)}
            </span>
            <span className="text-[10px] font-bold text-[#1E824C] flex items-center gap-0.5 bg-[#E8F8F0] px-2 py-0.5 rounded-full">
              ARS / compra
            </span>
          </div>
        </motion.div>
      </div>

      {/* Revenue Graph and Top Categories Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Revenue Performance Chart */}
        <div className="lg:col-span-8 glass-panel rounded-2xl p-6 sm:p-7 border border-white/70 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-[#1b1c1c]">Rendimiento de Facturación</h3>
              <p className="text-xs text-[#5b403e]">
                Ingresos brutos reales por día ({timeframe === 'today' ? 'Hoy' : timeframe === 'week' ? 'Esta Semana' : 'Últimos 30 días'})
              </p>
            </div>
            <span className="text-xs font-bold text-[#FF4D4F] bg-[#ffdad7]/40 px-3 py-1 rounded-full border border-white/60">
              Total periodo: ${totalSales.toFixed(2)} ARS
            </span>
          </div>

          {/* Bar Chart Bars */}
          <div className="h-64 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-white/60">
            {revenueChartData.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <div className="text-[11px] font-bold text-[#FF4D4F] opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 px-1.5 py-0.5 rounded-md shadow-2xs border border-white">
                  ${d.amount.toFixed(2)}
                </div>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: d.height }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className={`w-full max-w-[48px] rounded-t-xl transition-all cursor-pointer ${
                    d.amount > 0
                      ? 'bg-gradient-to-t from-[#FF4D4F] to-[#FF8A80] shadow-sm group-hover:brightness-110'
                      : 'bg-white/40 border-t border-white/60'
                  }`}
                />
                <span className="text-xs font-semibold text-[#5b403e]">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Categories */}
        <div className="lg:col-span-4 glass-panel rounded-2xl p-6 sm:p-7 border border-white/70 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-[#1b1c1c]">Categorías Principales</h3>
            <p className="text-xs text-[#5b403e]">Distribución de facturación según pedidos reales</p>
          </div>

          <div className="space-y-4">
            {topCategoriesData.map((cat) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-[#1b1c1c]">
                  <span>{cat.name}</span>
                  <span className="text-[#FF4D4F]">
                    {cat.sales} ({cat.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-white/60 rounded-full overflow-hidden border border-white/80">
                  <div
                    className={`h-full ${cat.color} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.max(cat.percentage, cat.percentage > 0 ? 5 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-white/60 border border-white/80 text-xs text-[#5b403e] space-y-1">
            <span className="font-bold text-[#1b1c1c] block">Diagnóstico en Tiempo Real</span>
            <p>
              {filteredOrders.length > 0
                ? `Se han registrado ${filteredOrders.length} pedidos en este periodo con una facturación neta de $${totalSales.toFixed(2)} ARS.`
                : 'Aún no se registran compras en este periodo seleccionado.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
