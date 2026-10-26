import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useCartStore } from '../../../store/useCartStore'
import { CartDrawer } from './CartDrawer'
import { productsApi } from '../../../api/productsApi'

interface PerfumeShowcaseItem {
  id: string
  brand: string
  title: string
  subtitle: string
  price: number
  imageUrl: string
  bgGradient: string
  accentColor: string
  tags: string[]
  volumeLabel: string
  availableVolumes: number[]
  stock?: number
  description: string
}

/**
 * Converts a HEX color string into HSL values.
 */
function hexToHsl(hexStr: string): { h: number; s: number; l: number } {
  let hex = (hexStr || '#106ebe').replace('#', '').trim()
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('')
  }
  const num = parseInt(hex, 16) || 0
  const r = ((num >> 16) & 255) / 255
  const g = ((num >> 8) & 255) / 255
  const b = (num & 255) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h = Math.round(h * 60)
  }
  return { h, s: Math.round(s * 100), l: Math.round(l * 100) }
}

export interface ShowcaseTheme {
  accentColor: string
  effectiveHue: number
  bgGradient: string
  spotlightGlow: string
  mandalaStroke: string
  mandalaOuterStart: string
  mandalaOuterMid: string
  mandalaInnerMid: string
}

export const getShowcaseTheme = (accent: string): ShowcaseTheme => {
  const { h, s } = hexToHsl(accent)
  // If low saturation (e.g. silver/black), use an elegant mineral slate hue
  const effectiveHue = s < 10 ? 215 : h
  const effectiveSat = s < 10 ? 28 : Math.min(Math.max(s, 52), 76)

  // Distinctive chromatic background per perfume (calibrated for high contrast with #121314 DM Sans)
  const bgGradient = `radial-gradient(circle at 50% 46%, hsl(${effectiveHue}, ${effectiveSat}%, 91%) 0%, hsl(${effectiveHue}, ${effectiveSat}%, 80%) 44%, hsl(${effectiveHue}, ${Math.round(effectiveSat * 0.9)}%, 70%) 100%)`
  const spotlightGlow = `radial-gradient(circle, hsla(${effectiveHue}, 85%, 58%, 0.45) 0%, hsla(${effectiveHue}, 75%, 68%, 0.22) 40%, transparent 70%)`
  const mandalaStroke = `hsla(${effectiveHue}, 50%, 20%, 0.18)`
  const mandalaOuterStart = `hsl(${effectiveHue}, ${effectiveSat}%, 96%)`
  const mandalaOuterMid = `hsla(${effectiveHue}, ${effectiveSat}%, 65%, 0.35)`
  const mandalaInnerMid = `hsla(${effectiveHue}, ${effectiveSat}%, 55%, 0.3)`

  return {
    accentColor: accent || '#106ebe',
    effectiveHue,
    bgGradient,
    spotlightGlow,
    mandalaStroke,
    mandalaOuterStart,
    mandalaOuterMid,
    mandalaInnerMid,
  }
}

const createShowcaseGradient = (accent: string): string => {
  return getShowcaseTheme(accent).bgGradient
}

const INITIAL_SHOWCASE_ITEMS: PerfumeShowcaseItem[] = [
  {
    id: 'lattafa-asad',
    brand: 'LATTAFA',
    title: 'Asad',
    subtitle: 'Lattafa • Haute Parfumerie',
    price: 65000,
    imageUrl: '/hero-perfumes/odyssey-aqua.png',
    bgGradient: createShowcaseGradient('#e11d48'),
    accentColor: '#e11d48',
    tags: ['Garantía Oficial', 'Batch Code', '100% Original'],
    volumeLabel: '50 ml • 100 ml',
    availableVolumes: [50, 100],
    description: 'Fragancia masculina icónica con notas especiadas, pimienta negra, café y vainilla.',
  },
  {
    id: 'armaf-club-de-nuit',
    brand: 'ARMAF',
    title: 'Club de Nuit Intense Man',
    subtitle: 'Armaf • Haute Parfumerie',
    price: 89000,
    imageUrl: '/hero-perfumes/odyssey-aqua.png',
    bgGradient: createShowcaseGradient('#106ebe'),
    accentColor: '#106ebe',
    tags: ['Garantía Oficial', 'Batch Code', '100% Original'],
    volumeLabel: '50 ml • 100 ml',
    availableVolumes: [50, 100],
    description: 'Apertura cítrica deslumbrante de bergamota y limón con fondo amaderado y ahumado.',
  },
  {
    id: 'lattafa-khamrah',
    brand: 'LATTAFA',
    title: 'Khamrah',
    subtitle: 'Lattafa • Haute Parfumerie',
    price: 78000,
    imageUrl: '/hero-perfumes/odyssey-aqua.png',
    bgGradient: createShowcaseGradient('#d97706'),
    accentColor: '#d97706',
    tags: ['Garantía Oficial', 'Batch Code', '100% Original'],
    volumeLabel: '50 ml • 100 ml',
    availableVolumes: [50, 100],
    description: 'Gourmand cálido y envolvente con canela, nuez moscada, praliné y haba tonka.',
  },
]

const getInitialShowcaseItems = (): PerfumeShowcaseItem[] => {
  try {
    const stored = localStorage.getItem('formula1370_custom_products') || localStorage.getItem('lumina_custom_products')
    if (stored) {
      const list = JSON.parse(stored)
      if (Array.isArray(list) && list.length > 0) {
        return list.map((p: any) => {
          const vols = p.volumes && p.volumes.length > 0 ? p.volumes : [50, 100]
          const accent = p.accent_color || '#38bdf8'
          const brand = (p.brand || p.category_name || 'FÓRMULA 1370').toUpperCase()
          return {
            id: p.id,
            brand,
            title: p.title,
            subtitle: p.subtitle || `${brand} • Private Collection`,
            price: p.price,
            imageUrl: p.image || '/hero-perfumes/odyssey-aqua.png',
            bgGradient: createShowcaseGradient(accent),
            accentColor: accent,
            tags: ['Garantía Oficial', 'Batch Code', '100% Original'],
            volumeLabel: vols.map((v: number) => `${v} ml`).join(' • '),
            availableVolumes: vols,
            stock: typeof p.stock === 'number' ? p.stock : 10,
            description: p.description || 'Fragancia exclusiva de alta concentración y fijación prolongada.',
          }
        })
      }
    }
  } catch {}
  return INITIAL_SHOWCASE_ITEMS
}

export const LuxuryHeroShowcase: React.FC = () => {
  const [searchParams] = useSearchParams()
  const targetProductId = searchParams.get('product') || searchParams.get('id')

  const [showcaseList, setShowcaseList] = useState<PerfumeShowcaseItem[]>(getInitialShowcaseItems)
  const [selectedIndex, setSelectedIndex] = useState<number>(() => {
    if (targetProductId) {
      const initial = getInitialShowcaseItems()
      const foundIdx = initial.findIndex(
        (item) => item.id === targetProductId || item.title.toLowerCase().trim() === targetProductId.toLowerCase().trim()
      )
      if (foundIdx !== -1) return foundIdx
    }
    return 0
  })

  useEffect(() => {
    if (targetProductId && showcaseList.length > 0) {
      const foundIdx = showcaseList.findIndex(
        (item) => item.id === targetProductId || item.title.toLowerCase().trim() === targetProductId.toLowerCase().trim()
      )
      if (foundIdx !== -1) {
        setSelectedIndex(foundIdx)
      }
    }
  }, [targetProductId, showcaseList])

  const [selectedSize, setSelectedSize] = useState<string>('100')
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [isAddedToast, setIsAddedToast] = useState<boolean>(false)

  const heroRef = useRef<HTMLDivElement>(null)
  const { addItem, openDrawer, items } = useCartStore()
  const navigate = useNavigate()

  // Handle Next / Previous Perfume
  const handleNext = () => {
    if (showcaseList.length === 0) return
    setSelectedIndex((prev) => (prev + 1) % showcaseList.length)
  }

  const handlePrev = () => {
    if (showcaseList.length === 0) return
    setSelectedIndex((prev) => (prev - 1 + showcaseList.length) % showcaseList.length)
  }

  // Load custom database products dynamically
  useEffect(() => {
    let isMounted = true
    const loadDynamicProducts = async () => {
      try {
        const res = await productsApi.getProducts('all')
        if (isMounted && res.products && res.products.length > 0) {
          const customItems: PerfumeShowcaseItem[] = res.products.map((p) => {
            const vols = p.volumes && p.volumes.length > 0 ? p.volumes : [50, 100]
            const accent = p.accent_color || '#38bdf8'
            const brand = (p.brand || p.category_name || 'FÓRMULA 1370').toUpperCase()
            return {
              id: p.id,
              brand,
              title: p.title,
              subtitle: p.subtitle || `${brand} • Private Collection`,
              price: p.price,
              imageUrl: p.image || '/hero-perfumes/odyssey-aqua.png',
              bgGradient: createShowcaseGradient(accent),
              accentColor: accent,
              tags: ['Garantía Oficial', 'Batch Code', '100% Original'],
              volumeLabel: vols.map((v) => `${v} ml`).join(' • '),
              availableVolumes: vols,
              stock: typeof p.stock === 'number' ? p.stock : 10,
              description: p.description || 'Fragancia exclusiva de alta concentración y fijación prolongada.',
            }
          })
          setShowcaseList(customItems)
          if (targetProductId) {
            const foundIdx = customItems.findIndex(
              (item) => item.id === targetProductId || item.title.toLowerCase().trim() === targetProductId.toLowerCase().trim()
            )
            if (foundIdx !== -1) {
              setSelectedIndex(foundIdx)
            }
          }
        }
      } catch (err) {
        console.warn('Showcase dynamic loading fallback:', err)
      }
    }
    loadDynamicProducts()
    return () => {
      isMounted = false
    }
  }, [targetProductId])

  const current = showcaseList[selectedIndex] || showcaseList[0] || INITIAL_SHOWCASE_ITEMS[0]
  const theme = getShowcaseTheme(current.accentColor)
  const totalCartCount = items.reduce((acc, item) => acc + item.quantity, 0)

  // Ensure selectedSize matches one of current perfume's available volumes
  useEffect(() => {
    if (current && current.availableVolumes && current.availableVolumes.length > 0) {
      const currentSizeNum = parseInt(selectedSize, 10)
      if (!current.availableVolumes.includes(currentSizeNum)) {
        const defaultVol = current.availableVolumes.includes(100) ? 100 : current.availableVolumes[0]
        setSelectedSize(String(defaultVol))
      }
    }
  }, [selectedIndex, current, selectedSize])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'ArrowLeft') handlePrev()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showcaseList.length])

  // Calculate dynamic price based on selected volume
  const sizeNum = parseInt(selectedSize, 10) || 100
  const defaultVol = current?.availableVolumes?.includes(100) ? 100 : current?.availableVolumes?.[0] || 100
  const currentPrice =
    current
      ? sizeNum === defaultVol
        ? current.price
        : sizeNum === 60 && defaultVol === 100
        ? Math.round((current.price * 0.78) / 1000) * 1000
        : sizeNum === 80 && defaultVol === 100
        ? Math.round((current.price * 0.85) / 1000) * 1000
        : sizeNum === 90 && defaultVol === 100
        ? Math.round((current.price * 0.92) / 1000) * 1000
        : sizeNum === 120 && defaultVol === 100
        ? Math.round((current.price * 1.15) / 1000) * 1000
        : sizeNum < defaultVol
        ? Math.round((current.price * 0.75) / 1000) * 1000
        : Math.round((current.price * 1.35) / 1000) * 1000
      : 0
  const isOutOfStock = typeof current?.stock === 'number' && current.stock <= 0

  // Handle 3D Tilt calculation
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return
    const rect = heroRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setMousePos({ x, y })
  }

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 })
  }

  // Handle Add to Cart
  const handleAddToCart = () => {
    addItem({
      id: `${current.id}-${selectedSize}ml`,
      title: `${current.title} (${selectedSize}ml)`,
      price: currentPrice,
      image: current.imageUrl,
      category: current.brand,
      variant: `${selectedSize}ml`,
    })
    setIsAddedToast(true)
    setTimeout(() => {
      setIsAddedToast(false)
      openDrawer()
    }, 1000)
  }

  return (
    <div
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        background: theme.bgGradient,
        transition: 'background 0.75s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className="w-full min-h-screen overflow-x-hidden overflow-y-auto lg:overflow-hidden text-[#121314] font-dm select-none relative flex flex-col justify-between py-5 px-4 sm:py-6 sm:px-12 xl:px-16"
    >
      {/* Subtle Ambient Radial Lighting Overlay */}
      <div className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.7)_0%,transparent_70%)]" />

      {/* ========================================================================= */}
      {/* 1. TOP NAVBAR (Neo-Editorial High Contrast)                               */}
      {/* ========================================================================= */}
      <header className="relative z-30 w-full flex items-center justify-between">
        
        {/* Left: Fórmula 1370 Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#121314] text-white font-dm font-black text-sm flex items-center justify-center border-2 border-[#121314] neo-box-shadow-sm group-hover:scale-105 transition-transform">
            F
          </div>
          <div className="flex flex-col">
            <span className="font-dm font-black text-base sm:text-lg tracking-wider text-[#121314] flex items-center gap-2">
              FÓRMULA 1370
            </span>
            <span className="text-[9px] uppercase tracking-[0.3em] text-[#55575a] -mt-0.5 font-bold">
              Haute Parfumerie
            </span>
          </div>
        </Link>

        {/* Center: Minimalist Capsule Tabs */}
        <div className="hidden sm:flex items-center gap-1.5 p-1 rounded-full bg-white border-2 border-[#121314] neo-box-shadow-sm">
          <Link
            to="/"
            className="px-5 py-1.5 rounded-full text-xs font-dm font-bold text-[#55575a] hover:text-[#121314] hover:bg-[#f6f4ee] transition-all"
          >
            Colección
          </Link>
          <button
            className="px-5 py-1.5 rounded-full text-xs font-dm font-black bg-[#a8d5e3] text-[#121314] border border-[#121314] cursor-default transition-all"
          >
            Showcase 3D
          </button>
        </div>

        {/* Right: User Icon & Cart Icon */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Back to Colección */}
          <Link
            to="/"
            className="sm:hidden flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-dm font-bold text-[#121314] bg-white border-2 border-[#121314] neo-box-shadow-sm active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[15px]">arrow_back</span>
            <span>Colección</span>
          </Link>

          <Link
            to="/?profile=true"
            className="w-10 h-10 rounded-full bg-white hover:bg-[#f6f4ee] border-2 border-[#121314] neo-box-shadow-sm flex items-center justify-center text-[#121314] transition-all"
            title="Mi Perfil"
          >
            <span className="material-symbols-outlined text-[19px]">person</span>
          </Link>

          <button
            onClick={() => openDrawer()}
            aria-label="Carrito de compras"
            className="relative w-10 h-10 rounded-full bg-white hover:bg-[#f6f4ee] border-2 border-[#121314] neo-box-shadow-sm flex items-center justify-center text-[#121314] transition-all cursor-pointer group"
            title="Carrito de Compras"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
            {totalCartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#ff78ac] text-[#121314] font-dm font-black text-[10px] rounded-full flex items-center justify-center border-2 border-[#121314] shadow-sm">
                {totalCartCount}
              </span>
            )}
          </button>

          <Link
            to="/"
            className="hidden lg:inline-flex items-center gap-1.5 text-xs font-dm font-black text-[#121314] bg-white hover:bg-[#0ffcbe] border-2 border-[#121314] neo-box-shadow-sm px-4 py-2 rounded-full transition-all ml-1"
          >
            <span>Volver a Tienda</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN SHOWCASE STAGE                                                    */}
      {/* ========================================================================= */}
      <main className="relative z-20 w-full flex-1 flex flex-col lg:flex-row items-center justify-between my-auto">
        
        {/* --- LEFT COLUMN: Brand, Title, Bullets, Tags & Description --- */}
        <div className="w-full lg:w-[380px] xl:w-[440px] shrink-0 z-20 flex flex-col justify-center space-y-4">
          
          <AnimatePresence mode="popLayout">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: -25, y: 15 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 25, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-3.5"
            >
              {/* Category Breadcrumb */}
              <div className="inline-flex items-center gap-2">
                <span
                  className="px-2.5 py-0.5 rounded-full text-white text-[10px] font-dm font-black tracking-wider uppercase border border-[#121314] shadow-xs transition-colors duration-500"
                  style={{ backgroundColor: current.accentColor }}
                >
                  {current.brand}
                </span>
                <span className="text-xs font-dm font-bold tracking-[0.2em] uppercase text-[#55575a]">
                  HAUTE PARFUMERIE
                </span>
              </div>

              {/* Perfume Main Title */}
              <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-dm font-black uppercase tracking-tight leading-[1.05] ${isOutOfStock ? 'text-[#55575a] line-through decoration-red-500' : 'text-[#121314]'}`}>
                {current.title}
              </h1>

              {/* Subtitle Bullets */}
              <p className="text-xs sm:text-sm text-[#55575a] font-dm font-bold tracking-wide">
                {current.subtitle}
              </p>

              {/* Characteristic Tags */}
              <div className="flex flex-wrap gap-2 pt-1">
                {isOutOfStock && (
                  <span className="text-[11px] font-dm font-black tracking-wider text-red-700 bg-red-100 border-2 border-red-500 px-3 py-1 rounded-full flex items-center gap-1.5 uppercase shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    SIN STOCK
                  </span>
                )}
                {current.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-dm font-bold text-[#121314] bg-white border-2 border-[#121314] neo-box-shadow-sm px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Volume / Weight Label */}
              <div className="pt-1">
                <span className="inline-block px-3 py-1 rounded-lg bg-[#a8d5e3]/40 border border-[#121314] text-[11px] font-dm font-black uppercase text-[#121314]">
                  {selectedSize} ML • {(Number(selectedSize) * 0.0338).toFixed(1)} FL. OZ.
                </span>
              </div>

              {/* Brief Description Card */}
              <div className="bg-white/90 backdrop-blur-sm border-2 border-[#121314] neo-box-shadow-sm rounded-2xl p-4 max-w-sm mt-2">
                <p className="text-xs text-[#121314] leading-relaxed font-dm font-medium line-clamp-3">
                  {current.description}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

        </div>

        {/* --- CENTER STAGE: Huge Mandala + Massive 3D Bottle --- */}
        <div className="flex-1 w-full flex flex-col items-center justify-center relative min-h-[460px] sm:min-h-[580px] lg:min-h-[640px] overflow-visible">
          
          {/* Dynamic Ambient Spotlight with Vibrant Luminous Color */}
          <div
            style={{
              background: theme.spotlightGlow,
            }}
            className="absolute w-[480px] sm:w-[650px] lg:w-[780px] h-[480px] sm:h-[650px] lg:h-[780px] rounded-full blur-[90px] opacity-75 pointer-events-none transition-all duration-700"
          />

          {/* 🌀 MANDALA DE FONDO 3D EMBOSSED (Watermark Architectural Blueprint) */}
          <AnimatePresence mode="popLayout">
            <motion.div
              key={`mandala-${current.id}`}
              initial={{ scale: 0.45, opacity: 0, rotate: -45 }}
              animate={{
                scale: [0.45, 1.15, 1],
                opacity: [0, 0.65, 0.5],
                rotate: 0,
              }}
              exit={{
                scale: 1.45,
                opacity: 0,
                rotate: 40,
                transition: { duration: 0.45 },
              }}
              transition={{
                duration: 0.9,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="absolute w-[520px] h-[520px] sm:w-[680px] sm:h-[680px] lg:w-[820px] lg:h-[820px] xl:w-[940px] xl:h-[940px] pointer-events-none select-none z-0 flex items-center justify-center"
            >
              <svg
                viewBox="-250 -250 500 500"
                className="w-full h-full filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.06)]"
              >
                <defs>
                  <radialGradient id={`mandala-glow-${current.id}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
                    <stop offset="50%" stopColor={theme.mandalaOuterMid} />
                    <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                  </radialGradient>
                  
                  {/* Outer Petal Gradient with Dynamic Architectural Tint */}
                  <linearGradient id={`lotus-outer-${current.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={theme.mandalaOuterStart} stopOpacity="0.85" />
                    <stop offset="50%" stopColor={theme.mandalaOuterMid} />
                    <stop offset="100%" stopColor="transparent" stopOpacity="0.05" />
                  </linearGradient>

                  {/* Inner Petal Gradient */}
                  <linearGradient id={`lotus-inner-${current.id}`} x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
                    <stop offset="50%" stopColor={theme.mandalaInnerMid} />
                    <stop offset="100%" stopColor="transparent" stopOpacity="0.05" />
                  </linearGradient>
                </defs>

                {/* 🌸 CAPA EXTERIOR: 8 Grandes Pétalos de Flor de Loto */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                  <g key={`outer-${i}`} transform={`rotate(${angle})`}>
                    <path
                      d="M 0 -85 C 58 -115 68 -180 0 -235 C -68 -180 -58 -115 0 -85 Z"
                      fill={`url(#lotus-outer-${current.id})`}
                      stroke={theme.mandalaStroke}
                      strokeWidth="1.2"
                    />
                    <path
                      d="M 0 -85 L 0 -235"
                      stroke={theme.mandalaStroke}
                      strokeWidth="1"
                    />
                  </g>
                ))}

                {/* 🌸 CAPA INTERIOR: 8 Pétalos Florales Escalonados (Offset 22.5°) */}
                {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((angle, i) => (
                  <g key={`inner-${i}`} transform={`rotate(${angle})`}>
                    <path
                      d="M 0 -60 C 44 -85 52 -135 0 -180 C -52 -135 -44 -85 0 -60 Z"
                      fill={`url(#lotus-inner-${current.id})`}
                      stroke={theme.mandalaStroke}
                      strokeWidth="0.9"
                    />
                  </g>
                ))}

                {/* Corola / Núcleo Central de la Flor de Loto */}
                <circle
                  r="75"
                  fill={`url(#mandala-glow-${current.id})`}
                  stroke={theme.mandalaStroke}
                  strokeWidth="1.5"
                />
                <circle
                  r="52"
                  fill="none"
                  stroke={theme.mandalaStroke}
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <circle
                  r="24"
                  fill="rgba(255,255,255,0.45)"
                />
              </svg>
            </motion.div>
          </AnimatePresence>

          {/* 🚀 PERFUME FLOTANTE: Caída Exagerada desde Arriba y Presencia Heroica */}
          <AnimatePresence mode="popLayout">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: -650, scale: 0.82, rotateX: 32 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, y: 500, scale: 0.82, rotateX: -28, transition: { duration: 0.35 } }}
              transition={{
                type: 'spring',
                damping: 14,
                stiffness: 90,
                mass: 1.15,
              }}
              style={{ transformStyle: 'preserve-3d' }}
              className="relative z-40 flex items-center justify-center pointer-events-none"
            >
              {/* Floating Idle + Movimiento 3D Exagerado al mover el mouse */}
              <motion.div
                animate={{
                  y: [0, -14, 0],
                  rotateY: mousePos.x * 52,
                  rotateX: mousePos.y * -38,
                  rotateZ: mousePos.x * 9,
                  x: mousePos.x * 45,
                }}
                transition={{
                  y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
                  rotateY: { type: 'spring', damping: 16, stiffness: 180, mass: 0.8 },
                  rotateX: { type: 'spring', damping: 16, stiffness: 180, mass: 0.8 },
                  rotateZ: { type: 'spring', damping: 16, stiffness: 180, mass: 0.8 },
                  x: { type: 'spring', damping: 16, stiffness: 180, mass: 0.8 },
                }}
                style={{ transformStyle: 'preserve-3d' }}
                className="relative flex items-center justify-center pointer-events-auto"
              >
                {isOutOfStock && (
                  <div className="absolute z-50 flex items-center justify-center pointer-events-none">
                    <span className="px-5 py-2 rounded-2xl bg-[#121314] border-2 border-red-500 text-red-400 font-dm font-black tracking-[0.25em] text-xs sm:text-sm uppercase shadow-2xl">
                      AGOTADO • SIN STOCK
                    </span>
                  </div>
                )}
                <img
                  src={current.imageUrl}
                  alt={current.title}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/hero-perfumes/odyssey-aqua.png'
                  }}
                  className={`max-h-[280px] sm:max-h-[400px] md:max-h-[500px] lg:max-h-[580px] xl:max-h-[630px] h-[34vh] sm:h-[46vh] lg:h-[55vh] w-auto object-contain filter drop-shadow-[0_25px_35px_rgba(18,19,20,0.35)] select-none pointer-events-none ${
                    isOutOfStock ? 'opacity-70 grayscale-[30%]' : ''
                  }`}
                />
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Dynamic Contact Shadow Under Bottle */}
          <div
            className="w-44 sm:w-72 lg:w-80 h-5 sm:h-8 bg-[#121314]/20 rounded-full blur-xl sm:blur-2xl pointer-events-none transition-transform duration-200 z-10"
            style={{
              transform: `translateX(${mousePos.x * 45}px) scaleX(${1 - Math.abs(mousePos.x) * 0.15}) scaleY(${1 - Math.abs(mousePos.y) * 0.1})`,
            }}
          />

        </div>

        {/* --- RIGHT COLUMN: Circular Size Buttons --- */}
        <div className="w-full lg:w-[380px] xl:w-[440px] shrink-0 z-20 flex flex-col items-center lg:items-end justify-center space-y-3 my-3 lg:my-0">
          
          <span className="text-xs text-[#55575a] font-dm font-bold uppercase tracking-wider text-center lg:text-right">
            Selecciona tu volumen
          </span>

          {/* Dynamic round size buttons */}
          <div className="flex items-center gap-3">
            {(current.availableVolumes || [50, 100]).map((vol) => {
              const sizeStr = String(vol)
              const isSelected = selectedSize === sizeStr
              return (
                <button
                  key={vol}
                  onClick={() => setSelectedSize(sizeStr)}
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl font-dm font-black text-xs transition-all duration-200 cursor-pointer flex flex-col items-center justify-center border-2 border-[#121314] ${
                    isSelected
                      ? 'bg-[#121314] text-white scale-105 neo-box-shadow'
                      : 'bg-white text-[#121314] hover:bg-[#a8d5e3] neo-box-shadow-sm'
                  }`}
                  title={`Tamaño ${vol} ml`}
                >
                  <span className="leading-none">{vol}</span>
                  <span className="text-[9px] font-bold opacity-80 leading-none mt-0.5">ML</span>
                </button>
              )
            })}
          </div>

          <div className="inline-flex items-center gap-1.5 text-[11px] font-dm font-bold text-[#121314] bg-white/85 border-2 border-[#121314] neo-box-shadow-sm px-3 py-1.5 rounded-full">
            <span className="material-symbols-outlined text-[15px]" style={{ color: current.accentColor }}>verified</span>
            <span>Concentración Eau de Parfum / Extract</span>
          </div>

        </div>

      </main>

      {/* ========================================================================= */}
      {/* 3. BOTTOM AREA (Price & Action Controls)                                  */}
      {/* ========================================================================= */}
      <footer className="relative z-30 w-full flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 sm:pt-2 pb-8 sm:pb-2 border-t border-[#121314]/10 mt-4 sm:mt-0">
        
        {/* Left Guarantees */}
        <div className="hidden sm:flex items-center gap-2 text-[#55575a] text-xs font-dm font-bold">
          <span className="flex items-center gap-1 text-[#121314]">
            <span className="material-symbols-outlined text-[15px] text-[#106ebe]">local_shipping</span>
            Envío gratis a todo el país
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-[#121314]">
            <span className="material-symbols-outlined text-[15px] text-[#ff78ac]">credit_card</span>
            Cuotas sin interés
          </span>
        </div>

        {/* CENTER: Price */}
        <div className="w-full sm:w-auto text-center sm:absolute sm:left-1/2 sm:-translate-x-1/2 flex items-center justify-center gap-3">
          <span className={`text-3xl sm:text-5xl font-dm font-black tracking-tight ${isOutOfStock ? 'text-gray-400 line-through decoration-red-500' : 'text-[#121314]'}`}>
            ${currentPrice.toLocaleString('es-AR')}
          </span>
          {isOutOfStock && (
            <span className="text-xs sm:text-sm font-dm font-black text-red-700 tracking-wider uppercase px-3 py-1 rounded-full bg-red-100 border-2 border-red-500">
              Sin Stock
            </span>
          )}
        </div>

        {/* RIGHT: Circular Prev/Next Controls & Pill "Añadir a la Cesta" Button */}
        <div className="flex items-center justify-center sm:justify-end gap-2.5 sm:gap-3 w-full sm:w-auto sm:ml-auto">
          
          {/* Circular Left Arrow Button */}
          <button
            onClick={handlePrev}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white hover:bg-[#a8d5e3] text-[#121314] border-2 border-[#121314] neo-box-shadow-sm transition-all flex items-center justify-center cursor-pointer active:scale-95"
            title="Perfume Anterior (←)"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>

          {/* Circular Right Arrow Button */}
          <button
            onClick={handleNext}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white hover:bg-[#a8d5e3] text-[#121314] border-2 border-[#121314] neo-box-shadow-sm transition-all flex items-center justify-center cursor-pointer active:scale-95"
            title="Perfume Siguiente (→)"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>

          {/* Pill "Añadir a la Cesta" Button */}
          <button
            disabled={isOutOfStock}
            onClick={() => {
              if (isOutOfStock) return
              handleAddToCart()
            }}
            className={`flex-1 sm:flex-initial px-6 sm:px-8 py-3.5 rounded-full font-dm font-black text-xs uppercase tracking-wider border-2 border-[#121314] transition-all flex items-center justify-center gap-2 ml-1 ${
              isOutOfStock
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-none'
                : 'bg-[#0ffcbe] hover:bg-[#00eaad] text-[#121314] neo-box-shadow neo-box-shadow-hover neo-box-shadow-active cursor-pointer'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isOutOfStock ? 'do_not_disturb_on' : 'shopping_bag'}
            </span>
            <span className={isOutOfStock ? 'line-through decoration-red-500' : ''}>
              {isOutOfStock ? 'Sin Stock' : isAddedToast ? '¡Añadido!' : 'Añadir a la Cesta'}
            </span>
          </button>

        </div>

      </footer>

      {/* Slide-over Side Cart Drawer */}
      <CartDrawer
        onProceedToCheckout={() => navigate('/?checkout=true')}
        accentColor={current.accentColor}
      />

    </div>
  )
}

export default LuxuryHeroShowcase
