import React from 'react'
import { motion } from 'framer-motion'

interface CatalogBridgeSectionProps {
  onSelectFilter?: (filter: string) => void
  onScrollToGrid: () => void
}

export const CatalogBridgeSection: React.FC<CatalogBridgeSectionProps> = ({
  onSelectFilter,
  onScrollToGrid,
}) => {
  const houses = [
    { name: 'Lattafa', tag: 'Khamrah & Asad', bg: '#a8d5e3' },
    { name: 'Afnan', tag: '9 PM Rebel & Supremacy', bg: '#ff78ac' },
    { name: 'Armaf', tag: 'Club de Nuit & Odyssey', bg: '#0ffcbe' },
    { name: 'Al Haramain', tag: 'Amber Oud Edition', bg: '#f2f0ea' },
  ]

  const families = [
    { title: 'Orientales & Vainilla', desc: 'Dulces, cálidos y seductores', icon: '✨' },
    { title: 'Amaderadas & Oud', desc: 'Elegantes, profundos y con carácter', icon: '🪵' },
    { title: 'Acuáticas & Cítricas', desc: 'Frescos, energéticos e ideales para el día', icon: '🌊' },
    { title: 'Gourmand Nocturno', desc: 'Canela, licor, tabaco y praliné', icon: '🌙' },
  ]

  return (
    <section className="w-full py-14 px-6 lg:px-14 bg-[#f6f4ee] border-b-2 border-[#121314]">
      <div className="max-w-[1380px] mx-auto space-y-10">
        {/* Title bar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="font-dm font-black text-xs uppercase tracking-wider text-[#106ebe]">
              Curaduría por Notas &amp; Casas
            </span>
            <h3 className="font-dm font-black text-2xl sm:text-4xl text-[#121314] uppercase tracking-tight mt-1">
              Explorá por tu preferencia
            </h3>
          </div>

          <button
            onClick={onScrollToGrid}
            className="self-start sm:self-auto px-5 py-2.5 bg-[#121314] hover:bg-[#2b2c2e] text-white font-dm font-bold text-xs uppercase tracking-wider rounded-xl neo-box-shadow-sm cursor-pointer transition"
          >
            Ir al Catálogo Directo ↓
          </button>
        </div>

        {/* Brand Houses Row */}
        <div>
          <div className="font-dm font-black text-xs uppercase tracking-wider text-[#55575a] mb-3">
            Filtrar por Casa Perfumista
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {houses.map((house) => (
              <motion.button
                key={house.name}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (onSelectFilter) onSelectFilter(house.name)
                  onScrollToGrid()
                }}
                className="p-4 bg-white border-2 border-[#121314] neo-box-shadow rounded-xl text-left cursor-pointer transition hover:bg-[#fcfbf9] flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="font-dm font-black text-lg text-[#121314]">
                    {house.name}
                  </span>
                  <span
                    style={{ backgroundColor: house.bg }}
                    className="w-3 h-3 rounded-full border border-[#121314]"
                  />
                </div>
                <span className="font-dm text-xs text-[#55575a] mt-2 font-medium">
                  {house.tag}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Olfactory Families Cards */}
        <div>
          <div className="font-dm font-black text-xs uppercase tracking-wider text-[#55575a] mb-3">
            Familias Olfativas
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {families.map((fam) => (
              <div
                key={fam.title}
                onClick={onScrollToGrid}
                className="p-4 bg-white border-2 border-[#121314] neo-box-shadow-sm rounded-xl cursor-pointer hover:border-[#106ebe] transition group"
              >
                <div className="text-2xl mb-2">{fam.icon}</div>
                <div className="font-dm font-black text-sm text-[#121314] group-hover:text-[#106ebe] transition">
                  {fam.title}
                </div>
                <div className="font-dm text-xs text-[#55575a] mt-1">
                  {fam.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
