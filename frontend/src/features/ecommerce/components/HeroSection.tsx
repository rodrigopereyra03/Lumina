import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { productsApi, type BackendProductDTO } from '../../../api/productsApi'
import { useCartStore } from '../../../store/useCartStore'

interface HeroSectionProps {
  onProductClick: (id: string) => void
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onProductClick }) => {
  const [featuredProduct, setFeaturedProduct] = useState<BackendProductDTO | null>(null)
  const { addItem, openDrawer } = useCartStore()

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const res = await productsApi.getProducts('all')
        if (res.products && res.products.length > 0) {
          setFeaturedProduct(res.products[0])
        } else {
          setFeaturedProduct(null)
        }
      } catch (e) {
        setFeaturedProduct(null)
      }
    }
    loadFeatured()
  }, [])

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!featuredProduct) return
    addItem(
      {
        id: featuredProduct.id,
        title: featuredProduct.title,
        category: featuredProduct.category_name || 'Perfumes',
        price: featuredProduct.price,
        originalPrice: featuredProduct.original_price,
        image: featuredProduct.image,
        variant: 'Original',
      },
      1
    )
    openDrawer()
  }

  // If no products loaded yet, render a luxury fragrance teaser hero banner
  if (!featuredProduct) {
    return (
      <section className="relative w-full rounded-3xl overflow-hidden glass-card p-6 md:p-12 shadow-sm font-body border border-white/60">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#ffdad7]/30 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#e2e2e4]/40 rounded-full blur-3xl pointer-events-none -mb-20"></div>

        <div className="relative z-10 max-w-2xl flex flex-col gap-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#ffdad7]/70 border border-[#ffdad7] w-fit shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#FF4D4F] animate-pulse"></span>
            <span className="text-[11px] font-bold text-[#FF4D4F] uppercase tracking-wider">
              Alta Perfumería • Fragancias de Autor
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1b1c1c] tracking-tight leading-[1.1]">
            El Arte de Dejar una <span className="text-[#FF4D4F]">Huella</span>.
          </h1>

          <p className="text-xs md:text-sm text-[#5b403e] leading-relaxed">
            Descubre aromas cautivadores, notas refinadas y fijación excepcional. Explora nuestras selecciones exclusivas y encuentra la fragancia que define tu esencia.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="/admin"
              className="btn-primary px-7 py-3 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Cargar Nuevos Perfumes (Panel Admin)</span>
            </a>
          </div>
        </div>
      </section>
    )
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
              Destacado • {featuredProduct.category_name || 'Fragancias'}
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1b1c1c] tracking-tight leading-[1.1]">
            {featuredProduct.title}
          </h1>

          {/* Subtitle */}
          <p className="text-xs md:text-sm text-[#5b403e] leading-relaxed max-w-xl">
            {featuredProduct.subtitle || featuredProduct.description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={handleBuyNow}
              className="btn-primary px-8 py-3.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md"
            >
              <span>Comprar Ahora — ${featuredProduct.price.toFixed(2)}</span>
              <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
            </button>

            <button
              onClick={() => onProductClick(featuredProduct.id)}
              className="btn-secondary px-6 py-3.5 text-xs font-semibold flex items-center gap-2 cursor-pointer"
            >
              <span>Ver Detalles</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Right Floating Product Column */}
        <div
          onClick={() => onProductClick(featuredProduct.id)}
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
            {featuredProduct.image ? (
              <img
                src={featuredProduct.image}
                alt={featuredProduct.title}
                className="relative z-10 w-[85%] h-[85%] object-contain mix-blend-multiply drop-shadow-2xl group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="relative z-10 flex flex-col items-center justify-center text-[#5b403e]/40">
                <span className="material-symbols-outlined text-6xl">spa</span>
                <span className="text-xs font-bold mt-2">Sin imagen</span>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
