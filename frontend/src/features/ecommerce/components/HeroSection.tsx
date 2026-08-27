import React from 'react'
import { motion } from 'framer-motion'
import { PRODUCTS } from '../data/productsData'
import { useCartStore } from '../../../store/useCartStore'

interface HeroSectionProps {
  onProductClick: (id: string) => void
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onProductClick }) => {
  const cameraProduct = PRODUCTS.find((p) => p.id === 'lumina-pro-camera') || PRODUCTS[0]
  const { addItem, openDrawer } = useCartStore()

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation()
    addItem({ ...cameraProduct, variant: 'Negro Mate' }, 1)
    openDrawer()
  }

  return (
    <section className="relative w-full rounded-3xl overflow-hidden glass-card p-6 md:p-12 shadow-sm font-body border border-white/60">
      {/* Background Soft Glow Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#ffdad7]/30 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#e2e2e4]/40 rounded-full blur-3xl pointer-events-none -mb-20"></div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Text Column */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffdad7]/60 border border-[#ffdad7] w-fit shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#FF4D4F] animate-pulse"></span>
            <span className="text-[11px] font-bold text-[#FF4D4F] uppercase tracking-wider">
              Nuevo Lanzamiento • Serie Pro
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1b1c1c] tracking-tight leading-[1.1]">
            Captura el <span className="text-[#FF4D4F]">Brillo</span> de la Vida.
          </h1>

          {/* Subtitle */}
          <p className="text-xs md:text-sm text-[#5b403e] leading-relaxed max-w-xl">
            Experimenta una claridad sin igual con la nueva Lumina Pro Camera. Cuenta con un sensor ultra amplio y enfoque inteligente impulsado por IA, diseñado para creadores que exigen la máxima perfección visual.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={handleBuyNow}
              className="btn-primary px-8 py-3.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md"
            >
              <span>Comprar Ahora — ${cameraProduct.price.toFixed(2)}</span>
              <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
            </button>

            <button
              onClick={() => onProductClick(cameraProduct.id)}
              className="btn-secondary px-6 py-3.5 text-xs font-semibold flex items-center gap-2 cursor-pointer"
            >
              <span>Ver Detalles</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

          {/* Mini Specs Row */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/60 max-w-lg">
            <div>
              <span className="text-[10px] text-[#5b403e] uppercase font-bold tracking-wider block">Sensor</span>
              <span className="text-xs font-bold text-[#1b1c1c]">45.7MP Full-Frame</span>
            </div>
            <div>
              <span className="text-[10px] text-[#5b403e] uppercase font-bold tracking-wider block">Video</span>
              <span className="text-xs font-bold text-[#1b1c1c]">8K ProRes RAW</span>
            </div>
            <div>
              <span className="text-[10px] text-[#5b403e] uppercase font-bold tracking-wider block">Enfoque</span>
              <span className="text-xs font-bold text-[#1b1c1c]">Dual Pixel IA</span>
            </div>
          </div>
        </div>

        {/* Right Floating Product Column */}
        <div
          onClick={() => onProductClick(cameraProduct.id)}
          className="lg:col-span-5 relative flex justify-center items-center cursor-pointer group"
        >
          <motion.div
            animate={{ y: [-8, 8, -8] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="relative w-full max-w-[420px] aspect-square flex items-center justify-center"
          >
            {/* Ambient Background Circle */}
            <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-white/80 to-white/20 backdrop-blur-xl border border-white/80 shadow-2xl"></div>

            {/* Product Image */}
            <img
              src={cameraProduct.image}
              alt={cameraProduct.title}
              className="relative z-10 w-[85%] h-[85%] object-contain mix-blend-multiply drop-shadow-2xl group-hover:scale-105 transition-transform duration-500"
            />

            {/* Floating Price Pill Tag */}
            <div className="absolute bottom-6 right-4 z-20 glass-card px-4 py-2 rounded-2xl shadow-lg border border-white/80 flex items-center gap-2">
              <span className="text-xs font-bold text-[#1b1c1c]">${cameraProduct.price}</span>
              <span className="text-[10px] line-through text-[#5b403e]">${cameraProduct.originalPrice}</span>
              <span className="bg-[#FF4D4F] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                -13%
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
