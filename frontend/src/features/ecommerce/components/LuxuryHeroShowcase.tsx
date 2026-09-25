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

const createShowcaseGradient = (accent: string): string => {
  let hex = (accent || '#e11d48').replace('#', '').trim()
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('')
  }
  const num = parseInt(hex, 16) || 0
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255

  // Special handling for Pure Black / Onyx Noir (#000000 or near-black)
  const isOnyxNoir = r < 20 && g < 20 && b < 20
  if (isOnyxNoir) {
    return `radial-gradient(circle at 52% 46%, rgba(65, 70, 82, 0.72) 0%, rgba(35, 38, 45, 0.5) 34%, #12141a 68%, #08090c 100%)`
  }

  // Adaptive luminosity for deeper colors (e.g. dark navy/midnight blue)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  const centerAlpha = brightness < 70 ? 0.8 : 0.65
  const midAlpha = brightness < 70 ? 0.48 : 0.38

  // Luxury chromatic night tones: keeps atmospheric ambiance at the borders
  // avoiding the dead pitch-black void (#06070a)
  const edgeR = Math.round(r * 0.12 + 14)
  const edgeG = Math.round(g * 0.12 + 16)
  const edgeB = Math.round(b * 0.12 + 20)

  const midR = Math.round(r * 0.28 + 16)
  const midG = Math.round(g * 0.28 + 18)
  const midB = Math.round(b * 0.28 + 24)

  return `radial-gradient(circle at 52% 46%, rgba(${r}, ${g}, ${b}, ${centerAlpha}) 0%, rgba(${r}, ${g}, ${b}, ${midAlpha}) 32%, rgb(${midR}, ${midG}, ${midB}) 65%, rgb(${edgeR}, ${edgeG}, ${edgeB}) 100%)`
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
    bgGradient: createShowcaseGradient('#94a3b8'),
    accentColor: '#94a3b8',
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
    bgGradient: createShowcaseGradient('#f59e0b'),
    accentColor: '#f59e0b',
    tags: ['Garantía Oficial', 'Batch Code', '100% Original'],
    volumeLabel: '50 ml • 100 ml',
    availableVolumes: [50, 100],
    description: 'Gourmand cálido y envolvente con canela, nuez moscada, praliné y haba tonka.',
  },
]

const getInitialShowcaseItems = (): PerfumeShowcaseItem[] => {
  try {
    const stored = localStorage.getItem('lumina_custom_products')
    if (stored) {
      const list = JSON.parse(stored)
      if (Array.isArray(list) && list.length > 0) {
        return list.map((p: any) => {
          const vols = p.volumes && p.volumes.length > 0 ? p.volumes : [50, 100]
          const accent = p.accent_color || '#38bdf8'
          const brand = (p.brand || p.category_name || 'LUMINA').toUpperCase()
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
            const brand = (p.brand || p.category_name || 'LUMINA').toUpperCase()
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
  }, [])

  const current = showcaseList[selectedIndex] || showcaseList[0] || INITIAL_SHOWCASE_ITEMS[0]
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
  }, [selectedIndex, current])

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
        : sizeNum === 90 && defaultVol === 100
        ? Math.round((current.price * 0.92) / 1000) * 1000
        : sizeNum === 120 && defaultVol === 100
        ? Math.round((current.price * 1.15) / 1000) * 1000
        : sizeNum < defaultVol
        ? Math.round((current.price * 0.75) / 1000) * 1000
        : Math.round((current.price * 1.35) / 1000) * 1000
      : 0
  const isOutOfStock = typeof current?.stock === 'number' && current.stock <= 0

  // Handle 3D Tilt calculation (Skill: 3d-web-experience)
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
        background: createShowcaseGradient(current.accentColor),
        transition: 'background 0.75s cubic-bezier(0.16, 1, 0.3, 1)',
        fontFamily: "'Montserrat', sans-serif",
      }}
      className="w-full min-h-screen overflow-x-hidden overflow-y-auto lg:overflow-hidden text-white font-['Montserrat',sans-serif] select-none relative flex flex-col justify-between py-5 px-4 sm:py-6 sm:px-12 xl:px-16"
    >
      {/* Subtle Ambient Radial Lighting Overlay - Lightened to eliminate dark edges */}
      <div className="absolute inset-0 bg-radial from-white/5 via-transparent to-black/15 pointer-events-none z-0" />

      {/* ========================================================================= */}
      {/* 1. TOP NAVBAR (Minimalist, matching Nike Reference)                       */}
      {/* ========================================================================= */}
      <header className="relative z-30 w-full flex items-center justify-between">
        
        {/* Left: Lumina Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white font-bold text-base shadow-lg group-hover:scale-105 transition-transform">
            L
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg sm:text-xl tracking-tight text-white flex items-center gap-2">
              LUMINA
            </span>
            <span className="text-[9px] uppercase tracking-[0.3em] text-white/70 -mt-0.5 font-medium">
              Haute Parfumerie
            </span>
          </div>
        </Link>

        {/* Center: Minimalist Capsule Tabs (Products / Contact style) */}
        <div className="hidden sm:flex items-center gap-1.5 p-1 rounded-full bg-black/25 backdrop-blur-xl border border-white/15 shadow-xl">
          <Link
            to="/"
            className="px-5 py-1.5 rounded-full text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all"
          >
            Colección
          </Link>
          <button
            className="px-5 py-1.5 rounded-full text-xs font-bold bg-white text-black shadow-md cursor-pointer transition-all"
          >
            Showcase 3D
          </button>
        </div>

        {/* Right: User Icon & Cart Icon */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Back to Colección */}
          <Link
            to="/"
            className="sm:hidden flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md shadow-sm active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[15px]">arrow_back</span>
            <span>Colección</span>
          </Link>

          <Link
            to="/profile"
            className="w-10 h-10 rounded-full bg-black/25 hover:bg-white/20 border border-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all shadow-md"
            title="Mi Perfil"
          >
            <span className="material-symbols-outlined text-[19px]">person</span>
          </Link>

          <button
            onClick={() => openDrawer()}
            aria-label="Carrito de compras"
            className="relative w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all shadow-md cursor-pointer group"
            title="Carrito de Compras"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
            {totalCartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white font-bold text-[9px] rounded-full flex items-center justify-center border border-black shadow">
                {totalCartCount}
              </span>
            )}
          </button>

          <Link
            to="/"
            className="hidden lg:inline-flex items-center gap-1.5 text-xs font-bold text-white bg-black/20 hover:bg-white hover:text-black border border-white/20 px-4 py-2 rounded-full transition-all shadow-md ml-1"
          >
            <span>Tienda</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN SHOWCASE STAGE (Expansive, Zero Dead-Space Composition)           */}
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
              className="space-y-3.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
            >
              {/* Category Breadcrumb */}
              <span className="text-xs font-bold tracking-[0.25em] uppercase text-white/70 block">
                {current.brand} • HAUTE PARFUMERIE
              </span>

              {/* Perfume Main Title (Montserrat Bold 700) */}
              <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] ${isOutOfStock ? 'text-white/60 line-through decoration-red-500/70' : 'text-white'}`}>
                {current.title}
              </h1>

              {/* Subtitle Bullets */}
              <p className="text-xs sm:text-sm text-white/85 font-medium tracking-wide">
                {current.subtitle}
              </p>

              {/* Characteristic Tags */}
              <div className="flex flex-wrap gap-2 pt-1">
                {isOutOfStock && (
                  <span className="text-[11px] font-black tracking-widest text-red-300 bg-red-950/80 border border-red-500/60 px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                    SIN STOCK
                  </span>
                )}
                {current.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-semibold text-white/90 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full shadow-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Volume / Weight Label */}
              <span className="text-xs font-semibold text-white/70 tracking-widest block pt-1">
                {selectedSize} ml / {(Number(selectedSize) * 0.0338).toFixed(1)} FL. OZ.
              </span>

              {/* Brief Description */}
              <p className="text-xs text-white/70 leading-relaxed font-normal max-w-sm pt-2 line-clamp-3">
                {current.description}
              </p>
            </motion.div>
          </AnimatePresence>

        </div>

        {/* --- CENTER STAGE: Huge Mandala + Massive 3D Bottle (Fills the Center) --- */}
        <div className="flex-1 w-full flex flex-col items-center justify-center relative min-h-[460px] sm:min-h-[580px] lg:min-h-[640px] overflow-visible">
          
          {/* Dynamic Ambient Spotlight with Vibrant Luminous Glow */}
          <div
            style={{
              background:
                current.accentColor === '#000000' || current.accentColor === '#0a0a0a'
                  ? `radial-gradient(circle, rgba(95, 102, 118, 0.65) 0%, rgba(45, 48, 56, 0.45) 35%, transparent 70%)`
                  : `radial-gradient(circle, ${current.accentColor} 0%, ${current.accentColor}80 35%, transparent 70%)`,
            }}
            className="absolute w-[480px] sm:w-[650px] lg:w-[780px] h-[480px] sm:h-[650px] lg:h-[780px] rounded-full blur-[90px] opacity-60 pointer-events-none transition-all duration-700"
          />

          {/* 🌀 EXPANSIVE MANDALA DE FONDO 3D EMBOSSED (Grandiosa, ocupa todo el centro) */}
          <AnimatePresence mode="popLayout">
            <motion.div
              key={`mandala-${current.id}`}
              initial={{ scale: 0.45, opacity: 0, rotate: -45 }}
              animate={{
                scale: [0.45, 1.15, 1],
                opacity: [0, 0.65, 0.42],
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
              {(() => {
                const isBlack = current.accentColor === '#000000' || current.accentColor === '#0a0a0a'
                const effectiveAccent = isBlack ? '#94a3b8' : current.accentColor
                return (
                  <svg
                    viewBox="-250 -250 500 500"
                    className="w-full h-full filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.55)]"
                  >
                    <defs>
                      <radialGradient id={`mandala-glow-${current.id}`} cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
                        <stop offset="50%" stopColor={effectiveAccent} stopOpacity="0.38" />
                        <stop offset="100%" stopColor={effectiveAccent} stopOpacity="0" />
                      </radialGradient>
                      
                      {/* Outer Petal Gradient with 3D Embossed Lighting & Vibrant Aura */}
                      <linearGradient id={`lotus-outer-${current.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
                        <stop offset="35%" stopColor={effectiveAccent} stopOpacity="0.4" />
                        <stop offset="100%" stopColor={effectiveAccent} stopOpacity="0.12" />
                      </linearGradient>

                      {/* Inner Petal Gradient */}
                      <linearGradient id={`lotus-inner-${current.id}`} x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
                        <stop offset="40%" stopColor={effectiveAccent} stopOpacity="0.45" />
                        <stop offset="100%" stopColor={effectiveAccent} stopOpacity="0.15" />
                      </linearGradient>
                    </defs>

                {/* 🌸 CAPA EXTERIOR: 8 Grandes Pétalos de Flor de Loto */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                  <g key={`outer-${i}`} transform={`rotate(${angle})`}>
                    <path
                      d="M 0 -85 C 58 -115 68 -180 0 -235 C -68 -180 -58 -115 0 -85 Z"
                      fill={`url(#lotus-outer-${current.id})`}
                      stroke="rgba(255,255,255,0.28)"
                      strokeWidth="1.2"
                    />
                    {/* Nervadura central del pétalo para relieve 3D */}
                    <path
                      d="M 0 -85 L 0 -235"
                      stroke="rgba(255,255,255,0.22)"
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
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="0.9"
                    />
                  </g>
                ))}

                {/* Corola / Núcleo Central de la Flor de Loto */}
                <circle
                  r="75"
                  fill={`url(#mandala-glow-${current.id})`}
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="1.5"
                />
                <circle
                  r="52"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <circle
                  r="24"
                  fill="rgba(255,255,255,0.18)"
                />
              </svg>
                )
              })()}
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
                    <span className="px-5 py-2 rounded-2xl bg-black/85 border border-red-500/60 text-red-400 font-extrabold tracking-[0.25em] text-xs sm:text-sm uppercase shadow-2xl backdrop-blur-md">
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
                  className={`max-h-[280px] sm:max-h-[400px] md:max-h-[500px] lg:max-h-[580px] xl:max-h-[630px] h-[34vh] sm:h-[46vh] lg:h-[55vh] w-auto object-contain filter drop-shadow-[0_25px_40px_rgba(0,0,0,0.75)] select-none pointer-events-none ${
                    isOutOfStock ? 'opacity-70 grayscale-[30%]' : ''
                  }`}
                />
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Dynamic Contact Shadow Under Bottle */}
          <div
            className="w-44 sm:w-72 lg:w-80 h-5 sm:h-8 bg-black/65 rounded-full blur-xl sm:blur-2xl pointer-events-none transition-transform duration-200 z-10"
            style={{
              transform: `translateX(${mousePos.x * 45}px) scaleX(${1 - Math.abs(mousePos.x) * 0.15}) scaleY(${1 - Math.abs(mousePos.y) * 0.1})`,
            }}
          />

        </div>

        {/* --- RIGHT COLUMN: Circular Size Buttons (Dynamic from current.availableVolumes) --- */}
        <div className="w-full lg:w-[380px] xl:w-[440px] shrink-0 z-20 flex flex-col items-center lg:items-end justify-center space-y-2.5 my-3 lg:my-0">
          
          {/* Dynamic round size buttons */}
          <div className="flex items-center gap-3">
            {(current.availableVolumes || [50, 100]).map((vol) => {
              const sizeStr = String(vol)
              return (
                <button
                  key={vol}
                  onClick={() => setSelectedSize(sizeStr)}
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full font-bold text-xs transition-all duration-200 cursor-pointer flex items-center justify-center shadow-lg ${
                    selectedSize === sizeStr
                      ? 'bg-white text-black scale-110 shadow-white/20'
                      : 'bg-black/35 text-white/75 hover:text-white hover:bg-white/15 border border-white/20'
                  }`}
                  title={`Tamaño ${vol} ml`}
                >
                  {vol}
                </button>
              )
            })}
          </div>

          {/* Subtitle below buttons */}
          <span className="text-xs text-white/60 font-medium tracking-wide text-center lg:text-right">
            Selecciona tu volumen con confort
          </span>

        </div>

      </main>

      {/* ========================================================================= */}
      {/* 3. BOTTOM AREA (Price & Action Controls)                                  */}
      {/* ========================================================================= */}
      <footer className="relative z-30 w-full flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 sm:pt-2 pb-8 sm:pb-2 border-t sm:border-t-0 border-white/10 mt-4 sm:mt-0">
        
        {/* Left Spacer (Subtle luxury guarantees) */}
        <div className="hidden sm:flex items-center gap-2 text-white/45 text-xs font-medium">
          <span>Envío gratis a todo el país</span>
          <span>•</span>
          <span>Cuotas sin interés</span>
        </div>

        {/* CENTER: Price (Centered on mobile, laser aligned at 50% on desktop) */}
        <div className="w-full sm:w-auto text-center sm:absolute sm:left-1/2 sm:-translate-x-1/2 flex items-center justify-center gap-3">
          <span className={`text-3xl sm:text-5xl font-bold tracking-tight ${isOutOfStock ? 'text-white/40 line-through decoration-red-500/80' : 'text-white'}`}>
            ${currentPrice.toLocaleString('es-AR')}
          </span>
          {isOutOfStock && (
            <span className="text-xs sm:text-sm font-black text-red-400 tracking-widest uppercase px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 shadow-lg">
              Sin Stock
            </span>
          )}
        </div>

        {/* RIGHT: Circular Prev/Next Controls & Pill "Añadir a la Cesta" Button */}
        <div className="flex items-center justify-center sm:justify-end gap-2.5 sm:gap-3 w-full sm:w-auto sm:ml-auto">
          
          {/* Circular Left Arrow Button */}
          <button
            onClick={handlePrev}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/35 hover:bg-white hover:text-black text-white border border-white/20 transition-all flex items-center justify-center cursor-pointer shadow-lg active:scale-95"
            title="Perfume Anterior (←)"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>

          {/* Circular Right Arrow Button */}
          <button
            onClick={handleNext}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/35 hover:bg-white hover:text-black text-white border border-white/20 transition-all flex items-center justify-center cursor-pointer shadow-lg active:scale-95"
            title="Perfume Siguiente (→)"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>

          {/* Pill "Añadir a la Cesta" Button (Buy Now style - Bold 700) */}
          <button
            disabled={isOutOfStock}
            onClick={() => {
              if (isOutOfStock) return
              handleAddToCart()
            }}
            className={`flex-1 sm:flex-initial px-6 sm:px-8 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider shadow-2xl transition-all flex items-center justify-center gap-2 ml-1 ${
              isOutOfStock
                ? 'bg-neutral-800 text-neutral-400 border border-neutral-700/80 cursor-not-allowed shadow-none'
                : 'bg-white text-black hover:bg-neutral-100 hover:scale-[1.04] active:scale-[0.97] cursor-pointer'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isOutOfStock ? 'do_not_disturb_on' : 'shopping_cart'}
            </span>
            <span className={isOutOfStock ? 'line-through decoration-red-400' : ''}>
              {isOutOfStock ? 'Sin Stock' : isAddedToast ? '¡Añadido!' : 'Añadir a la Cesta'}
            </span>
          </button>

        </div>

      </footer>

      {/* Slide-over Side Cart Drawer (Transparent Frosted Glass with dynamic perfume accent) */}
      <CartDrawer
        onProceedToCheckout={() => navigate('/')}
        accentColor={current.accentColor}
      />

    </div>
  )
}

export default LuxuryHeroShowcase
