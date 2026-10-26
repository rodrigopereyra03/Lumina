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

    const colors = ['bg-[#0ffcbe]', 'bg-[#ff78ac]', 'bg-[#106ebe]', 'bg-[#ffe600]', 'bg-[#a8d5e3]']

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
    csvContent += 'FÓRMULA 1370 - REPORTE EJECUTIVO DE VENTAS\n'
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
    link.setAttribute('download', `Reporte_Formula1370_${timeframeLabel}_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="py-20 text-center text-xs font-bold text-[#121314] bg-white rounded-2xl border-2 border-[#121314] shadow-[4px_4px_0px_#121314]">
        <div className="w-10 h-10 border-3 border-[#121314] border-t-[#0ffcbe] rounded-full animate-spin mx-auto mb-3"></div>
        <span className="uppercase tracking-wider">Calculando métricas y facturación en tiempo real...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8 font-dm text-[#121314]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#121314] tracking-tight uppercase">Resumen General</h1>
          <p className="text-xs sm:text-sm font-medium text-[#121314]/70 mt-1">
            Métricas de la tienda en vivo, volumen de ventas y facturación neta.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Timeframe Filter Pills */}
          <div className="flex bg-white border-2 border-[#121314] rounded-full p-1 shadow-[2px_2px_0px_#121314] text-xs font-black">
            <button
              onClick={() => setTimeframe('today')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer uppercase tracking-wider text-[11px] ${
                timeframe === 'today' ? 'bg-[#121314] text-white shadow-[1px_1px_0px_#ff78ac]' : 'text-[#121314] hover:bg-[#f6f4ee]'
              }`}
            >
              Hoy
            </button>
            <button
              onClick={() => setTimeframe('week')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer uppercase tracking-wider text-[11px] ${
                timeframe === 'week' ? 'bg-[#121314] text-white shadow-[1px_1px_0px_#ff78ac]' : 'text-[#121314] hover:bg-[#f6f4ee]'
              }`}
            >
              Esta Semana
            </button>
            <button
              onClick={() => setTimeframe('month')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer uppercase tracking-wider text-[11px] ${
                timeframe === 'month' ? 'bg-[#121314] text-white shadow-[1px_1px_0px_#ff78ac]' : 'text-[#121314] hover:bg-[#f6f4ee]'
              }`}
            >
              Este Mes
            </button>
          </div>

          {/* Export Report Button */}
          <button
            onClick={handleExportReport}
            className="px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider bg-[#0ffcbe] hover:bg-[#00eaad] text-[#121314] border-2 border-[#121314] shadow-[3px_3px_0px_#121314] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#121314] flex items-center gap-1.5 cursor-pointer transition-all"
            title="Descargar reporte en formato Excel / CSV"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Exportar (.csv)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Sales */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
          className="bg-white rounded-2xl p-6 border-2 border-[#121314] shadow-[4px_4px_0px_#121314] space-y-4"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs text-[#121314]/70 font-black uppercase tracking-wider">
              Ventas Totales
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#0ffcbe] border-2 border-[#121314] flex items-center justify-center text-[#121314] shadow-[2px_2px_0px_#121314]">
              <span className="material-symbols-outlined text-[20px]">payments</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2xl sm:text-3xl font-black text-[#121314] tracking-tight">
              ${totalSales.toFixed(2)}
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#121314] flex items-center gap-1 bg-[#a8d5e3] border border-[#121314] px-2 py-0.5 rounded-full">
              <span className="material-symbols-outlined text-[12px]">trending_up</span>
              {filteredOrders.length} {filteredOrders.length === 1 ? 'orden' : 'órdenes'}
            </span>
          </div>
        </motion.div>

        {/* Pending Orders */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          className="bg-white rounded-2xl p-6 border-2 border-[#121314] shadow-[4px_4px_0px_#121314] space-y-4"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs text-[#121314]/70 font-black uppercase tracking-wider">
              Órdenes Pendientes
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#ff78ac] border-2 border-[#121314] flex items-center justify-center text-[#121314] shadow-[2px_2px_0px_#121314]">
              <span className="material-symbols-outlined text-[20px]">hourglass_top</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2xl sm:text-3xl font-black text-[#121314] tracking-tight">
              {pendingOrdersCount}
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#121314] bg-[#ffe600] border border-[#121314] px-2 py-0.5 rounded-full">
              En Despacho
            </span>
          </div>
        </motion.div>

        {/* Total Customers */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.15 }}
          className="bg-white rounded-2xl p-6 border-2 border-[#121314] shadow-[4px_4px_0px_#121314] space-y-4"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs text-[#121314]/70 font-black uppercase tracking-wider">
              Clientes Registrados
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#a8d5e3] border-2 border-[#121314] flex items-center justify-center text-[#121314] shadow-[2px_2px_0px_#121314]">
              <span className="material-symbols-outlined text-[20px]">group</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2xl sm:text-3xl font-black text-[#121314] tracking-tight">
              {totalCustomersCount}
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#121314] flex items-center gap-0.5 bg-[#0ffcbe] border border-[#121314] px-2 py-0.5 rounded-full">
              Activos
            </span>
          </div>
        </motion.div>

        {/* Avg Order Value */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.2 }}
          className="bg-white rounded-2xl p-6 border-2 border-[#121314] shadow-[4px_4px_0px_#121314] space-y-4"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs text-[#121314]/70 font-black uppercase tracking-wider">
              Ticket Promedio
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#106ebe] border-2 border-[#121314] flex items-center justify-center text-white shadow-[2px_2px_0px_#121314]">
              <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2xl sm:text-3xl font-black text-[#121314] tracking-tight">
              ${averageTicket.toFixed(2)}
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#121314] flex items-center gap-0.5 bg-[#f6f4ee] border border-[#121314] px-2 py-0.5 rounded-full">
              ARS / orden
            </span>
          </div>
        </motion.div>
      </div>

      {/* Revenue Graph and Top Categories Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Revenue Performance Chart */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 sm:p-7 border-2 border-[#121314] shadow-[4px_4px_0px_#121314] space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <div>
              <h3 className="text-base font-black uppercase tracking-wider text-[#121314]">Rendimiento de Facturación</h3>
              <p className="text-xs font-medium text-[#121314]/70">
                Ingresos brutos reales por día ({timeframe === 'today' ? 'Hoy' : timeframe === 'week' ? 'Esta Semana' : 'Últimos 30 días'})
              </p>
            </div>
            <span className="text-xs font-black text-[#121314] bg-[#ff78ac] px-3 py-1 rounded-full border-2 border-[#121314] shadow-[2px_2px_0px_#121314]">
              Total periodo: ${totalSales.toFixed(2)} ARS
            </span>
          </div>

          {/* Bar Chart Bars */}
          <div className="h-64 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b-2 border-[#121314]/15">
            {revenueChartData.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <div className="text-[11px] font-black text-white opacity-0 group-hover:opacity-100 transition-opacity bg-[#121314] px-2 py-0.5 rounded border border-[#121314] shadow-[2px_2px_0px_#ff78ac]">
                  ${d.amount.toFixed(2)}
                </div>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: d.height }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className={`w-full max-w-[48px] rounded-t-xl transition-all cursor-pointer border-2 border-[#121314] ${
                    d.amount > 0
                      ? 'bg-[#106ebe] group-hover:bg-[#0ffcbe] shadow-[2px_0px_0px_#121314]'
                      : 'bg-[#f6f4ee]'
                  }`}
                />
                <span className="text-xs font-black text-[#121314] uppercase">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Categories */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 sm:p-7 border-2 border-[#121314] shadow-[4px_4px_0px_#121314] space-y-6">
          <div>
            <h3 className="text-base font-black uppercase tracking-wider text-[#121314]">Categorías Top</h3>
            <p className="text-xs font-medium text-[#121314]/70">Distribución de ingresos por ventas reales</p>
          </div>

          <div className="space-y-4">
            {topCategoriesData.map((cat) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-black text-[#121314] uppercase">
                  <span>{cat.name}</span>
                  <span className="text-[#106ebe]">
                    {cat.sales} ({cat.percentage}%)
                  </span>
                </div>
                <div className="w-full h-3 bg-[#f6f4ee] rounded-full overflow-hidden border-2 border-[#121314]">
                  <div
                    className={`h-full ${cat.color} rounded-full border-r border-[#121314] transition-all duration-500`}
                    style={{ width: `${Math.max(cat.percentage, cat.percentage > 0 ? 5 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-[#f6f4ee] border-2 border-[#121314] text-xs text-[#121314] space-y-1 shadow-[2px_2px_0px_#121314]">
            <span className="font-black uppercase tracking-wider block">Diagnóstico en Tiempo Real</span>
            <p className="font-medium text-[#121314]/80">
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
