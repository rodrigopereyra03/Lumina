import React from 'react'
import { motion } from 'framer-motion'

interface HeroFullscreenSectionProps {
  onExploreCatalog: () => void
  onExploreShowcase: () => void
  onScrollToAbout: () => void
}

export const HeroFullscreenSection: React.FC<HeroFullscreenSectionProps> = ({
  onExploreCatalog,
  onExploreShowcase,
  onScrollToAbout,
}) => {
  return (
    <section className="relative w-full min-h-[92vh] flex flex-col justify-between px-6 lg:px-14 py-8 lg:py-12 bg-[#f6f4ee] text-[#121314] overflow-hidden border-b-2 border-[#121314]">
      {/* Decorative Neo-Editorial Background Shapes */}
      <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-[#a8d5e3]/30 blur-2xl pointer-events-none" />
      <div className="absolute bottom-10 -left-16 w-96 h-96 rounded-full bg-[#ff78ac]/20 blur-3xl pointer-events-none" />

      {/* Top Banner Tag */}
      <div className="relative z-10 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#a8d5e3] border-2 border-[#121314] neo-box-sm font-dm font-bold text-xs uppercase tracking-wider"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#121314] animate-ping" />
          <span>Colección Dubái 2025</span>
        </motion.div>

        <div className="hidden sm:flex items-center gap-3 font-dm text-xs font-bold uppercase tracking-wider text-[#55575a]">
          <span>Garantía de Origen</span>
          <span>•</span>
          <span>Extractos 12h+</span>
        </div>
      </div>

      {/* Center Hero Editorial Content */}
      <div className="relative z-10 max-w-[1380px] mx-auto w-full my-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Big Bold Headline & Description */}
          <div className="lg:col-span-8 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="font-dm font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[0.95] text-[#121314] uppercase">
                Perfumes de autor que <br />
                <span className="relative inline-block mt-2">
                  <span className="relative z-10 px-3 py-1 bg-[#ff78ac] text-[#121314] border-2 border-[#121314] neo-box-shadow inline-block transform -rotate-1">
                    dejan huella.
                  </span>
                </span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-dm text-base sm:text-xl text-[#3a3b3d] max-w-2xl font-medium leading-relaxed"
            >
              Curaduría exclusiva de fragancias de alta gama importadas directamente de los 
              Emiratos Árabes. Proyección bestial, maceración auténtica y sofisticación real para quienes buscan un aroma inolvidable.
            </motion.p>

            {/* The 2 Primary Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 pt-4"
            >
              {/* Button 1: Primary - Explore Catalog */}
              <button
                onClick={onExploreCatalog}
                className="px-8 py-4 bg-[#0ffcbe] hover:bg-[#00eaad] text-[#121314] font-dm font-black text-base uppercase tracking-wider border-2 border-[#121314] neo-box-shadow neo-box-shadow-hover neo-box-shadow-active transition-all cursor-pointer flex items-center gap-3 rounded-xl"
              >
                <span>Explorar Catálogo</span>
                <svg className="w-5 h-5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>

              {/* Button 2: Secondary - 3D Interactive Showcase */}
              <button
                onClick={onExploreShowcase}
                className="px-8 py-4 bg-[#ffffff] hover:bg-[#f2f0ea] text-[#121314] font-dm font-black text-base uppercase tracking-wider border-2 border-[#121314] neo-box-shadow neo-box-shadow-hover neo-box-shadow-active transition-all cursor-pointer flex items-center gap-3 rounded-xl"
              >
                <span>Showcase 3D</span>
                <span className="w-3 h-3 rounded-full bg-[#ff78ac] border border-[#121314]" />
              </button>
            </motion.div>
          </div>

          {/* Right Column: Editorial Visual Card / Badge */}
          <div className="lg:col-span-4 flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="w-full max-w-sm p-6 bg-white border-2 border-[#121314] neo-box-shadow rounded-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#121314]">
                <span className="font-dm font-black text-sm uppercase tracking-wider text-[#121314]">
                  Fórmula 1370 Privé
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#a8d5e3] border border-[#121314] font-dm font-bold text-[10px] uppercase">
                  100% Original
                </span>
              </div>

              <div className="space-y-2">
                <div className="text-2xl font-dm font-black uppercase text-[#121314]">
                  Casas de Prestigio
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['Lattafa', 'Afnan', 'Armaf', 'Al Haramain', 'Khamrah', '9 PM'].map((house) => (
                    <span
                      key={house}
                      className="px-2.5 py-1 bg-[#f2f0ea] border border-[#121314] font-dm font-bold text-xs text-[#121314] rounded-lg"
                    >
                      {house}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 text-xs font-dm text-[#55575a] border-t border-gray-200">
                ⭐ Envíos gratis a todo el país • 3 y 6 Cuotas sin interés • Despacho seguro en 24h
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Smooth Scroll Down Prompt to "Nosotros" */}
      <div className="relative z-10 flex items-center justify-between pt-4 border-t-2 border-[#121314]/15">
        <div className="flex items-center gap-6 font-dm text-xs font-bold uppercase tracking-wider text-[#55575a]">
          <span>Buenos Aires, Argentina</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">Alta Fijación Garantizada</span>
        </div>

        <button
          onClick={onScrollToAbout}
          className="group flex items-center gap-2 font-dm font-black text-xs uppercase tracking-wider text-[#121314] hover:text-[#ff78ac] transition cursor-pointer"
        >
          <span>Conocer Nuestra Esencia</span>
          <div className="w-8 h-8 rounded-full border-2 border-[#121314] bg-white group-hover:bg-[#a8d5e3] flex items-center justify-center transition neo-box-shadow-sm">
            <svg className="w-4 h-4 stroke-[2.5] transform group-hover:translate-y-0.5 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </button>
      </div>
    </section>
  )
}
