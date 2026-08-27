import React from 'react'
import { motion } from 'framer-motion'

export const AdminDashboard: React.FC = () => {
  const revenueData = [
    { day: 'Lun', amount: 3200, height: '40%' },
    { day: 'Mar', amount: 4800, height: '55%' },
    { day: 'Mié', amount: 6100, height: '70%' },
    { day: 'Jue', amount: 5400, height: '62%' },
    { day: 'Vie', amount: 7800, height: '88%' },
    { day: 'Sáb', amount: 9200, height: '100%' },
    { day: 'Dom', amount: 6900, height: '78%' },
  ]

  const topCategories = [
    { name: 'Electrónica', percentage: 45, sales: '$11,200', color: 'bg-[#FF4D4F]' },
    { name: 'Moda', percentage: 28, sales: '$6,970', color: 'bg-[#FF8A80]' },
    { name: 'Hogar & Confort', percentage: 15, sales: '$3,730', color: 'bg-[#D97757]' },
    { name: 'Deportes', percentage: 12, sales: '$2,990', color: 'bg-[#9E9E9E]' },
  ]

  return (
    <div className="space-y-8 font-body text-[#1b1c1c]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1b1c1c] tracking-tight">Resumen General</h1>
          <p className="text-xs sm:text-sm text-[#5b403e] mt-0.5">
            Métricas de la tienda en tiempo real, volumen de ventas y conversión.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex bg-white/70 border border-white/80 rounded-xl p-1 shadow-2xs text-xs font-semibold text-[#5b403e]">
            <button className="px-3 py-1.5 rounded-lg bg-[#FF4D4F] text-white font-bold shadow-xs">
              Hoy
            </button>
            <button className="px-3 py-1.5 rounded-lg hover:text-[#1b1c1c] transition-colors">
              Esta Semana
            </button>
            <button className="px-3 py-1.5 rounded-lg hover:text-[#1b1c1c] transition-colors">
              Este Mes
            </button>
          </div>

          <button className="btn-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer">
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Exportar Reporte</span>
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
              $24,890
            </span>
            <span className="text-xs font-bold text-[#1E824C] flex items-center gap-0.5 bg-[#E8F8F0] px-2 py-0.5 rounded-full">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              +12.5%
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
            <div className="w-8 h-8 rounded-xl bg-[#ffdad7]/50 flex items-center justify-center text-[#FF4D4F]">
              <span className="material-symbols-outlined text-[18px]">inventory</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#1b1c1c] tracking-tight">
              142
            </span>
            <span className="text-[11px] font-semibold text-[#FF4D4F] bg-[#ffdad7]/40 px-2 py-0.5 rounded-full">
              12 Requieren Atención
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
              Clientes Totales
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#e2e2e4]/70 flex items-center justify-center text-[#1b1c1c]">
              <span className="material-symbols-outlined text-[18px]">group</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#1b1c1c] tracking-tight">
              1,840
            </span>
            <span className="text-xs font-bold text-[#1E824C] flex items-center gap-0.5 bg-[#E8F8F0] px-2 py-0.5 rounded-full">
              +85 este mes
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
              $175.28
            </span>
            <span className="text-xs font-bold text-[#1E824C] flex items-center gap-0.5 bg-[#E8F8F0] px-2 py-0.5 rounded-full">
              +4.2%
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
              <p className="text-xs text-[#5b403e]">Análisis de ingresos brutos diarios y semanales</p>
            </div>
            <span className="text-xs font-bold text-[#FF4D4F] bg-[#ffdad7]/40 px-3 py-1 rounded-full">
              Promedio: $6,340 / día
            </span>
          </div>

          {/* Bar Chart Bars */}
          <div className="h-64 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-white/60">
            {revenueData.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <div className="text-[11px] font-bold text-[#FF4D4F] opacity-0 group-hover:opacity-100 transition-opacity">
                  ${d.amount}
                </div>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: d.height }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="w-full max-w-[48px] rounded-t-xl bg-gradient-to-t from-[#FF4D4F] to-[#FF8A80] shadow-sm group-hover:brightness-110 transition-all cursor-pointer"
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
            <p className="text-xs text-[#5b403e]">Distribución de ventas por departamento</p>
          </div>

          <div className="space-y-4">
            {topCategories.map((cat) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-[#1b1c1c]">
                  <span>{cat.name}</span>
                  <span className="text-[#FF4D4F]">{cat.sales} ({cat.percentage}%)</span>
                </div>
                <div className="w-full h-2 bg-white/60 rounded-full overflow-hidden border border-white/80">
                  <div
                    className={`h-full ${cat.color} rounded-full`}
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-white/60 border border-white/80 text-xs text-[#5b403e] space-y-1">
            <span className="font-bold text-[#1b1c1c] block">Diagnóstico Automático</span>
            <p>La categoría de Electrónica lidera las ventas con el 45% del volumen total este mes.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
