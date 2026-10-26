import React from 'react'
import { motion } from 'framer-motion'

interface AboutEditorialSectionProps {
  onGoToCatalog: () => void
}

export const AboutEditorialSection: React.FC<AboutEditorialSectionProps> = ({ onGoToCatalog }) => {
  const pillars = [
    {
      number: '01',
      title: 'Curaduría Auténtica de Dubái',
      badge: '100% Original',
      badgeBg: '#a8d5e3',
      description:
        'Seleccionamos directamente los lanzamientos más prestigiosos de las casas líderes de Oriente Medio (Lattafa, Afnan, Armaf, Al Haramain). Cada unidad ingresa con número de lote verificado y precinto de fábrica original.',
      colorAccent: '#a8d5e3',
    },
    {
      number: '02',
      title: 'Fijación y Proyección Extrema',
      badge: 'Extracto 12h+',
      badgeBg: '#ff78ac',
      description:
        'A diferencia de las fragancias comerciales diluidas, la perfumería árabe se distingue por su altísima concentración de aceites esenciales. Notas de oud, vainilla bourbon, ámbar y maderas preciosas que permanecen en tu piel de la mañana a la noche.',
      colorAccent: '#ff78ac',
    },
    {
      number: '03',
      title: 'Lujo Accesible y Sin Pretensiones',
      badge: 'Alta Perfumería',
      badgeBg: '#0ffcbe',
      description:
        'Creemos que una fragancia firma de nivel mundial no debería costar una fortuna injustificada. Te acercamos el lujo de la perfumería de nicho internacional con asesoramiento transparente y envíos rápidos a todo el país.',
      colorAccent: '#0ffcbe',
    },
  ]

  return (
    <section id="about-section" className="w-full py-16 lg:py-24 px-6 lg:px-14 bg-[#f2f0ea] border-b-2 border-[#121314]">
      <div className="max-w-[1380px] mx-auto space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b-2 border-[#121314]">
          <div className="space-y-3">
            <span className="inline-block px-3 py-1 bg-[#121314] text-white font-dm font-black text-xs uppercase tracking-wider rounded-md">
              Nosotros • Fórmula 1370
            </span>
            <h2 className="font-dm font-black text-3xl sm:text-5xl lg:text-6xl text-[#121314] uppercase tracking-tight">
              ¿Por qué elegir <br />
              <span className="text-[#106ebe]">perfumería árabe?</span>
            </h2>
          </div>

          <p className="font-dm text-[#55575a] max-w-md text-sm sm:text-base font-medium">
            Entendemos el perfume como una declaración personal. Nuestra misión es acercarte fragancias con presencia real, dejando atrás los aromas genéricos del mercado.
          </p>
        </div>

        {/* 3 Editorial Divided Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.number}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="bg-white border-2 border-[#121314] neo-box-shadow rounded-2xl p-7 flex flex-col justify-between space-y-6 hover:-translate-y-1 transition duration-200"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-dm font-black text-3xl text-[#121314]">
                    {pillar.number}
                  </span>
                  <span
                    style={{ backgroundColor: pillar.badgeBg }}
                    className="px-3 py-1 border-2 border-[#121314] font-dm font-black text-[11px] uppercase rounded-full text-[#121314]"
                  >
                    {pillar.badge}
                  </span>
                </div>

                <h3 className="font-dm font-black text-2xl text-[#121314] leading-tight">
                  {pillar.title}
                </h3>

                <p className="font-dm text-sm text-[#444648] leading-relaxed">
                  {pillar.description}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-dm font-bold text-[#55575a]">
                <span>Garantía Oficial</span>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: pillar.colorAccent }} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Banner with Action */}
        <div className="p-8 bg-[#ffffff] border-2 border-[#121314] neo-box-shadow rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-dm font-black text-xl text-[#121314] uppercase">
              ¿Listo para encontrar tu aroma definitivo?
            </h4>
            <p className="font-dm text-sm text-[#55575a]">
              Explorá nuestro catálogo clasificado por casas y notas aromáticas.
            </p>
          </div>

          <button
            onClick={onGoToCatalog}
            className="px-6 py-3 bg-[#106ebe] hover:bg-[#0c5899] text-white font-dm font-black text-sm uppercase tracking-wider border-2 border-[#121314] neo-box-shadow neo-box-shadow-hover neo-box-shadow-active transition-all cursor-pointer rounded-xl flex items-center gap-2 whitespace-nowrap"
          >
            <span>Ver Catálogo Completo</span>
            <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}
