import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

interface HeroSectionProps {
  onProductClick: (id: string) => void
}

const PERFUME_BANNER_VIDEO_URL =
  'https://dxxoxzaowyaxpxphqpsd.supabase.co/storage/v1/object/public/product-images/A_luxury_PM_perfume_bottle_s.mp4'

export const HeroSection: React.FC<HeroSectionProps> = ({ onProductClick: _onProductClick }) => {
  const [isMuted, setIsMuted] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  const toggleSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const scrollToCatalog = () => {
    const catalogElement = document.getElementById('catalog-section')
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.scrollTo({ top: 600, behavior: 'smooth' })
    }
  }

  return (
    <section className="relative w-full rounded-3xl overflow-hidden shadow-2xl font-body border border-white/40 dark:border-white/10 min-h-[440px] md:min-h-[540px] flex items-center">
      {/* 1. Cinematic Background Video */}
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
        <video
          ref={videoRef}
          src={PERFUME_BANNER_VIDEO_URL}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="w-full h-full object-cover object-center scale-105 filter brightness-90 contrast-105"
        />

        {/* Cinematic Multi-layer Gradient Overlays for Luxury Contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/25"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30"></div>
      </div>

      {/* 2. Floating Ambient Glow Orbs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FF4D4F]/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* 3. Hero Content Container */}
      <div className="relative z-10 w-full p-5 sm:p-10 md:p-14 lg:p-16 flex flex-col justify-between h-full">
        <div className="max-w-2xl flex flex-col gap-4 sm:gap-5">
          {/* Luxury Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 w-fit shadow-lg"
          >
            <span className="w-2 h-2 rounded-full bg-[#FF4D4F] animate-pulse"></span>
            <span className="text-[10px] sm:text-[11px] font-bold text-white tracking-[0.15em] sm:tracking-[0.2em] uppercase">
              Alta Perfumería • Luxury Fragrances
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.08] drop-shadow-md"
          >
            La Esencia de la <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7875] via-[#FF4D4F] to-[#FF9C6E]">Distinción</span>.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xs sm:text-sm md:text-base text-gray-200 leading-relaxed font-normal max-w-xl drop-shadow-sm"
          >
            Fragancias de autor con notas envolventes, fijación duradera y acordes inolvidables. Una experiencia sensorial creada para quienes dejan su impronta en cada paso.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2 sm:pt-3 w-full sm:w-auto"
          >
            <button
              onClick={scrollToCatalog}
              className="bg-gradient-to-r from-[#FF4D4F] to-[#d9363e] hover:from-[#ff5e60] hover:to-[#e0434b] text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-[#FF4D4F]/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <span>Explorar Fragancias</span>
              <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
            </button>

            <Link
              to="/hero-3d"
              className="bg-gradient-to-r from-[#10b981]/20 to-[#38bdf8]/20 hover:from-[#10b981]/30 hover:to-[#38bdf8]/30 border border-[#38bdf8]/50 text-white px-5 sm:px-6 py-3 sm:py-3.5 rounded-full text-xs font-bold flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#38bdf8]/15 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-[#38bdf8]">view_in_ar</span>
              <span>Probar Hero 3D</span>
            </Link>
          </motion.div>

          {/* Features Highlights Row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 sm:pt-6 border-t border-white/20 max-w-lg mt-2 text-white"
          >
            <div>
              <span className="text-[9px] sm:text-[10px] text-gray-300 uppercase font-bold tracking-wider block">
                Fijación
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-white flex items-center gap-1">
                <span>Intensa 8-12h</span>
                <span className="material-symbols-outlined text-[13px] sm:text-[14px] text-[#FF4D4F]">timer</span>
              </span>
            </div>
            <div>
              <span className="text-[9px] sm:text-[10px] text-gray-300 uppercase font-bold tracking-wider block">
                Concentración
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-white">Eau de Parfum</span>
            </div>
            <div>
              <span className="text-[9px] sm:text-[10px] text-gray-300 uppercase font-bold tracking-wider block">
                Envíos
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-white flex items-center gap-1">
                <span>Todo el país</span>
                <span className="material-symbols-outlined text-[13px] sm:text-[14px] text-[#25D366]">local_shipping</span>
              </span>
            </div>
          </motion.div>
        </div>

        {/* 4. Controls: Audio Mute/Unmute toggle on bottom-right */}
        <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-20">
          <button
            type="button"
            onClick={toggleSound}
            className="p-2.5 sm:p-3 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/20 shadow-lg transition-all hover:scale-110 cursor-pointer flex items-center justify-center group"
            title={isMuted ? 'Activar sonido del video' : 'Silenciar video'}
          >
            <span className="material-symbols-outlined text-[18px] sm:text-[20px]">
              {isMuted ? 'volume_off' : 'volume_up'}
            </span>
          </button>
        </div>
      </div>
    </section>
  )
}
