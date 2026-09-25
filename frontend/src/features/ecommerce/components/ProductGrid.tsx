import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useCartStore } from '../../../store/useCartStore'
import { productsApi } from '../../../api/productsApi'

interface ProductGridProps {
  selectedCategorySlug: string
  onProductClick: (id: string) => void
  onViewAll?: () => void
  searchQuery?: string
  onClearSearch?: () => void
}

interface LuxuryCatalogItem {
  id: string
  brandTag: string
  brandHouse: 'Afnan' | 'Armaf' | 'Lattafa' | 'Al Haramain' | string
  title: string
  subtitle: string
  notesPills: string[]
  family: string
  glowClass: string
  dotClass: string
  accentTextColor: string
  flaconType: 'image' | 'noir' | 'cognac' | 'sapphire' | 'titanium'
  imageUrl?: string
  altText?: string
  availableVolumes: number[]
  defaultVolume: number
  basePrice: number // Price for default volume (usually 100ml)
  stock: number
  description: string
}

// 8 Chromatic Palette Facets for the 8 Lotus Petals (matching perfume families)
const LOTUS_CHROMA_PETALS = [
  { angle: 0, color: '#f43f5e', name: 'Rubí', desc: '9 PM Rebel' },
  { angle: 45, color: '#fbbf24', name: 'Champagne', desc: 'Lumina Gold' },
  { angle: 90, color: '#f59e0b', name: 'Ámbar Coñac', desc: 'Khamrah' },
  { angle: 135, color: '#c084fc', name: 'Amatista', desc: 'Nocturno' },
  { angle: 180, color: '#e2e8f0', name: 'Platino', desc: 'Club de Nuit' },
  { angle: 225, color: '#14b8a6', name: 'Teal Bosque', desc: 'Supremacy' },
  { angle: 270, color: '#38bdf8', name: 'Zafiro Azul', desc: 'Turathi & Amber Oud' },
  { angle: 315, color: '#10b981', name: 'Esmeralda', desc: 'Odyssey Aqua' },
]

// 8 Harmonic Blended Inner Petals (offset 22.5°)
const LOTUS_INNER_PETALS = [
  { angle: 22.5, color: '#fb7185' },
  { angle: 67.5, color: '#fcd34d' },
  { angle: 112.5, color: '#e879f9' },
  { angle: 157.5, color: '#a78bfa' },
  { angle: 202.5, color: '#94a3b8' },
  { angle: 247.5, color: '#2dd4bf' },
  { angle: 292.5, color: '#0ea5e9' },
  { angle: 337.5, color: '#34d399' },
]



const FAMILIES = [
  'Todas las Familias',
  'Amaderadas & Oud',
  'Orientales & Vainilla',
  'Acuáticas & Cítricas',
  'Gourmand Nocturno',
]

export const ProductGrid: React.FC<ProductGridProps> = ({
  selectedCategorySlug,
  onProductClick,
  onViewAll: _onViewAll,
  searchQuery = '',
  onClearSearch,
}) => {
  const { addItem, openDrawer } = useCartStore()

  // Filtering states
  const [selectedFamily, setSelectedFamily] = useState<string>('Todas las Familias')
  const [selectedHouse, setSelectedHouse] = useState<string>('Todas')
  const [sortBy, setSortBy] = useState<string>('relevance')
  const [currentPage, setCurrentPage] = useState<number>(1)

  // Per-product selected volume tracking: { [productId]: volumeNumber }
  const [selectedVolumes, setSelectedVolumes] = useState<{ [id: string]: number }>({})

  // Added to cart feedback toast state
  const [addedItemTitle, setAddedItemTitle] = useState<string | null>(null)

  // DB products from API / Supabase
  const [dbProducts, setDbProducts] = useState<LuxuryCatalogItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    let isMounted = true
    const fetchDbProducts = async () => {
      setIsLoading(true)
      try {
        const res = await productsApi.getProducts(selectedCategorySlug)
        if (isMounted) {
          if (res.products && res.products.length > 0) {
            const mapped: LuxuryCatalogItem[] = res.products.map((p) => {
              const volumes = p.volumes && p.volumes.length > 0 ? p.volumes : [50, 100]
              const defaultVol = volumes.includes(100) ? 100 : volumes[0]
              const brand = p.brand || p.category_name || 'Lumina'
              const accent = p.accent_color || '#fb7185'

              let glow = 'bg-rose-700/20 group-hover:bg-rose-600/30'
              let dot = 'bg-rose-400 shadow-[0_0_10px_#fb7185]'
              let textAccent = 'text-rose-400'

              if (accent === '#10b981' || accent === '#14b8a6') {
                glow = 'bg-emerald-700/20 group-hover:bg-emerald-600/30'
                dot = 'bg-emerald-400 shadow-[0_0_10px_#34d399]'
                textAccent = 'text-emerald-400'
              } else if (accent === '#00d2ff' || accent === '#00f0ff') {
                glow = 'bg-cyan-500/25 group-hover:bg-cyan-400/35'
                dot = 'bg-cyan-300 shadow-[0_0_12px_#00d2ff]'
                textAccent = 'text-cyan-400 font-semibold'
              } else if (accent === '#2563eb' || accent === '#1d4ed8') {
                glow = 'bg-blue-600/30 group-hover:bg-blue-500/40'
                dot = 'bg-blue-500 shadow-[0_0_12px_#2563eb]'
                textAccent = 'text-blue-400 font-semibold'
              } else if (accent === '#1e40af' || accent === '#1e3a8a' || accent === '#172554') {
                glow = 'bg-indigo-900/40 group-hover:bg-indigo-800/50'
                dot = 'bg-indigo-400 shadow-[0_0_10px_#3b82f6]'
                textAccent = 'text-indigo-400 font-semibold'
              } else if (accent === '#38bdf8' || accent === '#6366f1') {
                glow = 'bg-blue-700/20 group-hover:bg-blue-600/30'
                dot = 'bg-blue-400 shadow-[0_0_10px_#60a5fa]'
                textAccent = 'text-blue-400'
              } else if (accent === '#f59e0b' || accent === '#eab308') {
                glow = 'bg-amber-700/20 group-hover:bg-amber-600/30'
                dot = 'bg-amber-400 shadow-[0_0_10px_#fbbf24]'
                textAccent = 'text-amber-400'
              } else if (accent === '#ea580c') {
                glow = 'bg-orange-700/20 group-hover:bg-orange-600/30'
                dot = 'bg-orange-400 shadow-[0_0_10px_#fb923c]'
                textAccent = 'text-orange-400'
              } else if (accent === '#c084fc') {
                glow = 'bg-purple-700/20 group-hover:bg-purple-600/30'
                dot = 'bg-purple-400 shadow-[0_0_10px_#c084fc]'
                textAccent = 'text-purple-400'
              } else if (accent === '#be123c') {
                glow = 'bg-rose-950/40 group-hover:bg-rose-900/50'
                dot = 'bg-rose-600 shadow-[0_0_10px_#be123c]'
                textAccent = 'text-rose-400'
              } else if (accent === '#ec4899') {
                glow = 'bg-pink-700/20 group-hover:bg-pink-600/30'
                dot = 'bg-pink-400 shadow-[0_0_10px_#f472b6]'
                textAccent = 'text-pink-400'
              } else if (accent === '#94a3b8') {
                glow = 'bg-zinc-700/20 group-hover:bg-zinc-600/30'
                dot = 'bg-zinc-400 shadow-[0_0_10px_#e4e4e7]'
                textAccent = 'text-zinc-400'
              } else if (accent.toLowerCase() === '#ffffff' || accent.toLowerCase() === '#f8fafc') {
                glow = 'bg-white/20 group-hover:bg-white/30'
                dot = 'bg-white shadow-[0_0_10px_#ffffff]'
                textAccent = 'text-white font-bold'
              }

              return {
                id: p.id,
                brandTag: `${brand.toUpperCase()} • PRIVATE COLLECTION`,
                brandHouse: brand,
                title: p.title,
                subtitle: p.subtitle || 'Haute Fragrance • Luxury Seduction',
                notesPills: ['Garantía Oficial', 'Batch Code', '100% Original'],
                family: p.category_name || 'Amaderadas & Oud',
                glowClass: glow,
                dotClass: dot,
                accentTextColor: textAccent,
                flaconType: 'image',
                imageUrl: p.image || '/hero-perfumes/odyssey-aqua.png',
                altText: p.title,
                availableVolumes: volumes,
                defaultVolume: defaultVol,
                basePrice: p.price,
                stock: typeof p.stock === 'number' ? p.stock : 10,
                description: p.description || 'Fragancia exclusiva de alta concentración y fijación prolongada.',
              }
            })
            setDbProducts(mapped)
          } else {
            setDbProducts([])
          }
        }
      } catch {
        if (isMounted) setDbProducts([])
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    fetchDbProducts()
    return () => {
      isMounted = false
    }
  }, [selectedCategorySlug])

  // Catalog items strictly from Database
  const allCatalogItems = useMemo(() => {
    return dbProducts
  }, [dbProducts])

  // Dynamic list of perfume houses with product counts
  const availableHouses = useMemo(() => {
    const counts: { [brand: string]: number } = {}
    allCatalogItems.forEach((item) => {
      const b = item.brandHouse?.trim()
      if (b && b !== 'Lumina' && b !== 'General') {
        counts[b] = (counts[b] || 0) + 1
      }
    })
    const sorted = Object.keys(counts).sort((a, b) => counts[b] - counts[a])
    return [
      { name: 'Todas', brand: 'Todas', count: allCatalogItems.length },
      ...sorted.map((name) => ({ name, brand: name, count: counts[name] })),
    ]
  }, [allCatalogItems])

  // Synchronize with category slug if passed from navigation
  useEffect(() => {
    if (selectedCategorySlug && selectedCategorySlug !== 'all') {
      const slug = selectedCategorySlug.toLowerCase()
      const match = availableHouses.find(
        (h) =>
          h.brand.toLowerCase() === slug ||
          h.brand.toLowerCase().replace(/\s+/g, '-') === slug ||
          slug.includes(h.brand.toLowerCase().replace(/\s+/g, '-'))
      )
      if (match) {
        setSelectedHouse(match.brand)
      } else {
        setSelectedHouse('Todas')
      }
      setCurrentPage(1)
    } else if (selectedCategorySlug === 'all') {
      setSelectedHouse('Todas')
      setCurrentPage(1)
    }
  }, [selectedCategorySlug, availableHouses])

  // Volume price formula helper
  const calculatePrice = (basePrice: number, volume: number, defaultVol: number): number => {
    if (volume === defaultVol) return basePrice
    if (volume === 90 && defaultVol === 100) {
      return Math.round((basePrice * 0.92) / 1000) * 1000
    }
    if (volume === 120 && defaultVol === 100) {
      return Math.round((basePrice * 1.15) / 1000) * 1000
    }
    if (volume < defaultVol) {
      const ratio = Math.pow(volume / defaultVol, 0.75)
      return Math.round((basePrice * ratio) / 1000) * 1000
    }
    const ratio = Math.pow(volume / defaultVol, 0.85)
    return Math.round((basePrice * ratio) / 1000) * 1000
  }

  // Filtered and Sorted products
  const filteredProducts = useMemo(() => {
    let list = allCatalogItems.filter((item) => {
      // 1. Family filter
      if (selectedFamily !== 'Todas las Familias') {
        if (item.family !== selectedFamily) return false
      }

      // 2. House filter
      if (selectedHouse !== 'Todas') {
        if (!item.brandHouse.toLowerCase().includes(selectedHouse.toLowerCase())) return false
      }

      // 3. Category Slug fallback filter (if house wasn't matched)
      if (selectedCategorySlug && selectedCategorySlug !== 'all' && selectedHouse === 'Todas') {
        const slug = selectedCategorySlug.toLowerCase()
        const matchCat = (item.family || '').toLowerCase().includes(slug)
        const matchBrand = (item.brandHouse || '').toLowerCase().includes(slug)
        if (!matchCat && !matchBrand) return false
      }

      // 4. Search Query
      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchTitle = item.title.toLowerCase().includes(q)
        const matchSub = item.subtitle.toLowerCase().includes(q)
        const matchDesc = item.description.toLowerCase().includes(q)
        const matchBrand = item.brandTag.toLowerCase().includes(q) || item.brandHouse.toLowerCase().includes(q)
        const matchNotes = item.notesPills.some((n) => n.toLowerCase().includes(q))
        if (!matchTitle && !matchSub && !matchDesc && !matchBrand && !matchNotes) return false
      }

      return true
    })

    // Sorting
    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.basePrice - b.basePrice)
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.basePrice - a.basePrice)
    } else if (sortBy === 'new') {
      list.reverse()
    }

    return list
  }, [allCatalogItems, selectedFamily, selectedHouse, selectedCategorySlug, searchQuery, sortBy])

  // Pagination (12 items per page)
  const itemsPerPage = 12
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage))
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredProducts.slice(start, start + itemsPerPage)
  }, [filteredProducts, currentPage])

  // Helper for pagination numbers with ellipses
  const getPaginationItems = (current: number, total: number): (number | string)[] => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1)
    }
    if (current <= 4) {
      return [1, 2, 3, 4, 5, '...', total]
    }
    if (current >= total - 3) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
    }
    return [1, '...', current - 1, current, current + 1, '...', total]
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    const el = document.getElementById('catalog-section')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Handle Add to Cart
  const handleAddToCart = (e: React.MouseEvent, item: LuxuryCatalogItem) => {
    e.stopPropagation()
    const vol = selectedVolumes[item.id] || item.defaultVolume
    const finalPrice = calculatePrice(item.basePrice, vol, item.defaultVolume)

    // Map to Cart item
    addItem(
      {
        id: `${item.id}-${vol}ml`,
        title: `${item.title} (${vol}ml)`,
        price: finalPrice,
        image: item.imageUrl || '/hero-perfumes/odyssey-aqua.png',
        category: item.brandHouse,
        variant: `${vol}ml`,
      },
      1
    )

    setAddedItemTitle(`${item.title} (${vol}ml)`)
    setTimeout(() => setAddedItemTitle(null), 2500)
    openDrawer()
  }

  // Handle Volume selection
  const handleSelectVolume = (e: React.MouseEvent, itemId: string, volume: number) => {
    e.stopPropagation()
    setSelectedVolumes((prev) => ({
      ...prev,
      [itemId]: volume,
    }))
  }

  return (
    <div
      id="catalog-section"
      className="relative w-full min-h-screen text-white rounded-3xl overflow-hidden font-['Montserrat',sans-serif] selection:bg-white selection:text-black py-8 px-4 sm:px-8 lg:px-12 transition-all"
      style={{
        backgroundColor: '#070709',
        backgroundImage: `
          radial-gradient(circle at 50% -8%, rgba(68, 12, 28, 0.45) 0%, rgba(20, 6, 12, 0.75) 45%, #070709 85%),
          radial-gradient(circle at 90% 40%, rgba(5, 45, 35, 0.22) 0%, transparent 60%),
          radial-gradient(circle at 10% 70%, rgba(50, 10, 24, 0.22) 0%, transparent 60%)
        `,
      }}
    >
      {/* 🌸 AMBIENT BACKGROUND FLOR DE LOTO MULTICOLOR (8 Pétalos Cromáticos)      */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 flex items-center justify-center opacity-[0.45]">
        <div className="w-[1100px] h-[1100px] xl:w-[1450px] xl:h-[1450px]">
          <svg
            viewBox="-250 -250 500 500"
            className="w-full h-full filter drop-shadow-[0_20px_45px_rgba(0,0,0,0.9)]"
          >
            <defs>
              <radialGradient id="catalog-lotus-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fef08a" stopOpacity="0.45" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>

              {/* 8 Outer Petal Independent Soft Gradients */}
              {LOTUS_CHROMA_PETALS.map((petal, i) => (
                <linearGradient
                  key={`chroma-outer-${i}`}
                  id={`lotus-chroma-outer-${i}`}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor={petal.color} stopOpacity="0.45" />
                  <stop offset="45%" stopColor={petal.color} stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#070709" stopOpacity="0.30" />
                </linearGradient>
              ))}

              {/* 8 Inner Petal Harmonic Blend Gradients */}
              {LOTUS_INNER_PETALS.map((petal, i) => (
                <linearGradient
                  key={`chroma-inner-${i}`}
                  id={`lotus-chroma-inner-${i}`}
                  x1="0%"
                  y1="100%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor={petal.color} stopOpacity="0.55" />
                  <stop offset="50%" stopColor={petal.color} stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#070709" stopOpacity="0.25" />
                </linearGradient>
              ))}
            </defs>

            {/* 🌸 CAPA EXTERIOR: 8 Pétalos Cromáticos (Cada uno con el color de una fragancia) */}
            {LOTUS_CHROMA_PETALS.map((petal, i) => (
              <g key={`catalog-outer-${i}`} transform={`rotate(${petal.angle})`}>
                <path
                  d="M 0 -85 C 58 -115 68 -180 0 -235 C -68 -180 -58 -115 0 -85 Z"
                  fill={`url(#lotus-chroma-outer-${i})`}
                  stroke={petal.color}
                  strokeOpacity="0.35"
                  strokeWidth="1.2"
                />
                {/* Nervadura central 3D con el color del pétalo */}
                <path
                  d="M 0 -85 L 0 -235"
                  stroke={petal.color}
                  strokeOpacity="0.32"
                  strokeWidth="1.2"
                />
              </g>
            ))}

            {/* 🌸 CAPA INTERIOR: 8 Pétalos de Transición Armónica (Offset 22.5°) */}
            {LOTUS_INNER_PETALS.map((petal, i) => (
              <g key={`catalog-inner-${i}`} transform={`rotate(${petal.angle})`}>
                <path
                  d="M 0 -60 C 44 -85 52 -135 0 -180 C -52 -135 -44 -85 0 -60 Z"
                  fill={`url(#lotus-chroma-inner-${i})`}
                  stroke={petal.color}
                  strokeOpacity="0.38"
                  strokeWidth="1"
                />
              </g>
            ))}

            {/* Corola Central de Oro Champagne */}
            <circle
              r="75"
              fill="url(#catalog-lotus-glow)"
              stroke="rgba(254, 240, 138, 0.45)"
              strokeWidth="2"
            />
            <circle
              r="52"
              fill="none"
              stroke="rgba(255, 255, 255, 0.25)"
              strokeWidth="1.5"
              strokeDasharray="5 5"
            />
            <circle
              r="28"
              fill="none"
              stroke="rgba(254, 240, 138, 0.5)"
              strokeWidth="1.5"
            />
          </svg>
        </div>
      </div>

      {/* Added to cart Toast */}
      {addedItemTitle && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-6 right-6 z-50 bg-white text-black px-5 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-white/20"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="text-xs font-bold">{addedItemTitle} añadido a la cesta</span>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* 1. HERO CATALOG HEADER (Colección Exclusiva - Haute Parfumerie)           */}
      {/* ========================================================================= */}
      <section className="relative z-10 pt-2 pb-8">
        <div className="max-w-[1440px] mx-auto text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
          <div>
            {/* Breadcrumb Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] uppercase font-bold tracking-[0.25em] text-rose-300/90 mb-3 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]"></span>
              Haute Parfumerie • Dubái, París &amp; Oriente
            </div>

            {/* Main Title (Montserrat Bold 700) */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
              {searchQuery ? `Resultados: "${searchQuery}"` : 'Colección Exclusiva'}
            </h1>

            {/* Subtitle */}
            <p className="mt-3 text-xs md:text-sm text-gray-300 max-w-2xl font-light leading-relaxed">
              Extractos puros de concentración extrema, maderas preciosas, resinas orientales y notas nocturnas diseñadas para una estela inconfundible.
            </p>
          </div>

          {/* Quick Counter & Certifications */}
          <div className="flex items-center justify-center md:justify-end gap-3 text-xs text-gray-400">
            <span className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-gray-300 backdrop-blur-md">
              <strong className="text-white font-bold">{filteredProducts.length}</strong> Creaciones Disponibles
            </span>
            <span className="hidden sm:inline-block px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-gray-300 backdrop-blur-md">
              Autenticidad <strong className="text-emerald-400 font-bold">100% Certificada</strong>
            </span>

            {searchQuery && onClearSearch && (
              <button
                onClick={onClearSearch}
                className="px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:bg-rose-500 hover:text-white transition font-semibold cursor-pointer"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. FILTERS & CONTROLS BAR (Houses, Olfactive Families & Sort)             */}
      {/* ========================================================================= */}
      <section className="relative z-10 pb-8 space-y-4">
        <div className="max-w-[1440px] mx-auto space-y-4">
          {/* 2A. BRAND HOUSES (Full Visibility Multi-Row Wrap) */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] uppercase tracking-[0.2em] text-amber-400 font-bold px-3 py-1.5 rounded-xl bg-amber-400/10 border border-amber-400/20 shrink-0">
              Casas:
            </span>
            {availableHouses.map((house) => {
              const isActive = selectedHouse === house.brand
              return (
                <button
                  key={house.brand}
                  onClick={() => {
                    setSelectedHouse(house.brand)
                    setCurrentPage(1)
                  }}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                    isActive
                      ? 'bg-white text-black font-extrabold shadow-lg shadow-white/20 scale-[1.02]'
                      : 'bg-white/[0.04] border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <span>{house.brand}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-black/10 text-black' : 'bg-white/10 text-gray-400'
                    }`}
                  >
                    {house.count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* 2B. OLFACTIVE FAMILIES & SORT ROW */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
            {/* Families Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
              <span className="text-[11px] uppercase tracking-wider text-gray-500 font-medium mr-1 hidden sm:inline">
                Familias:
              </span>
              {FAMILIES.map((family) => {
                const isActive = selectedFamily === family
                return (
                  <button
                    key={family}
                    onClick={() => {
                      setSelectedFamily(family)
                      setCurrentPage(1)
                    }}
                    className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition cursor-pointer text-xs ${
                      isActive
                        ? 'bg-rose-500 text-white font-bold shadow-md shadow-rose-500/20'
                        : 'bg-white/[0.03] border border-white/10 text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {family}
                  </button>
                )
              })}
            </div>

            {/* Sort Select & Active Filter Reset */}
            <div className="flex items-center justify-between lg:justify-end gap-3 w-full lg:w-auto">
              {(selectedHouse !== 'Todas' || selectedFamily !== 'Todas las Familias' || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedHouse('Todas')
                    setSelectedFamily('Todas las Familias')
                    if (onClearSearch) onClearSearch()
                    setCurrentPage(1)
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 underline underline-offset-4 cursor-pointer whitespace-nowrap"
                >
                  Restablecer filtros
                </button>
              )}

              <div className="relative shrink-0">
                <select
                  aria-label="Ordenar fragancias"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-[#121217] border border-white/15 text-white text-xs rounded-xl px-4 py-2 pr-9 focus:outline-none focus:ring-1 focus:ring-white/40 cursor-pointer backdrop-blur-md"
                >
                  <option value="relevance" className="bg-[#121217] text-white">
                    Relevancia &amp; Prestigio
                  </option>
                  <option value="price-desc" className="bg-[#121217] text-white">
                    Precio: Mayor a Menor
                  </option>
                  <option value="price-asc" className="bg-[#121217] text-white">
                    Precio: Menor a Mayor
                  </option>
                  <option value="new" className="bg-[#121217] text-white">
                    Nuevos Lanzamientos
                  </option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-white/50">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. PRODUCT CATALOG GRID                                                   */}
      {/* ========================================================================= */}
      <main className="relative z-10 pb-16">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-10">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`skel-${i}`}
                className="relative rounded-3xl p-7 min-h-[500px] flex flex-col justify-between overflow-hidden border border-white/10 bg-white/[0.02] backdrop-blur-xl animate-pulse"
              >
                <div className="space-y-3">
                  <div className="h-3 w-28 bg-white/10 rounded-full" />
                  <div className="h-7 w-3/4 bg-white/10 rounded-lg" />
                  <div className="h-4 w-1/2 bg-white/5 rounded-lg" />
                  <div className="flex gap-2 pt-2">
                    <div className="h-5 w-16 bg-white/5 rounded-full" />
                    <div className="h-5 w-20 bg-white/5 rounded-full" />
                  </div>
                </div>
                <div className="my-auto flex items-center justify-center py-10">
                  <div className="w-36 h-48 bg-white/5 rounded-2xl border border-white/5" />
                </div>
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <div className="h-6 w-24 bg-white/10 rounded-lg" />
                    <div className="h-6 w-20 bg-white/5 rounded-lg" />
                  </div>
                  <div className="h-10 w-full bg-white/10 rounded-2xl" />
                </div>
              </div>
            ))
          ) : paginatedProducts.length === 0 ? (
            <div className="col-span-full py-20 text-center flex flex-col items-center justify-center">
              <span className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl text-gray-400 mb-4">
                ✨
              </span>
              <h3 className="text-xl font-bold text-white mb-2">No se encontraron fragancias</h3>
              <p className="text-xs text-gray-400 max-w-sm mb-6">
                No hay productos disponibles para los filtros seleccionados. Intenta restablecer los filtros para explorar todo el catálogo.
              </p>
              <button
                onClick={() => {
                  setSelectedHouse('Todas')
                  setSelectedFamily('Todas las Familias')
                  if (onClearSearch) onClearSearch()
                  setCurrentPage(1)
                }}
                className="px-6 py-2.5 rounded-full bg-white text-black font-bold text-xs hover:bg-gray-200 transition cursor-pointer shadow-lg shadow-white/10"
              >
                Restablecer y ver todo el catálogo
              </button>
            </div>
          ) : (
            paginatedProducts.map((item, index) => {
              const currentVolume = selectedVolumes[item.id] || item.defaultVolume
              const currentPrice = calculatePrice(item.basePrice, currentVolume, item.defaultVolume)
              const fluidOz = (currentVolume * 0.0338).toFixed(1)
              const isOutOfStock = typeof item.stock === 'number' && item.stock <= 0

              return (
                <motion.article
                  key={item.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: (index % 3) * 0.1 }}
                onClick={() => onProductClick(item.id)}
                className="group relative rounded-3xl p-7 flex flex-col justify-between overflow-hidden border border-white/15 hover:border-white/30 backdrop-blur-xl transition-all duration-500 cursor-pointer shadow-[0_20px_45px_-10px_rgba(0,0,0,0.5)] hover:shadow-[0_28px_55px_-12px_rgba(0,0,0,0.7)] hover:-translate-y-1.5"
                style={{
                  background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(13, 13, 17, 0.30) 100%)',
                }}
              >
                {/* Colored Ambient Glow Backing */}
                <div
                  className={`absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl pointer-events-none transition duration-700 ${item.glowClass}`}
                />

                {/* Card Top: Brand & Glowing Dot / Out of Stock Badge */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] tracking-[0.25em] uppercase font-bold ${item.accentTextColor}`}>
                      {item.brandTag}
                    </span>
                    {isOutOfStock ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-red-950/85 border border-red-500/60 text-red-300 text-[9px] font-black tracking-widest uppercase flex items-center gap-1 shadow-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                        SIN STOCK
                      </span>
                    ) : (
                      <span className={`w-2 h-2 rounded-full ${item.dotClass}`}></span>
                    )}
                  </div>

                  {/* Product Title (Montserrat Bold 700) */}
                  <h2 className={`text-2xl lg:text-3xl font-bold tracking-tight leading-tight ${isOutOfStock ? 'text-gray-400 line-through decoration-red-500/70' : 'text-white'}`}>
                    {item.title}
                  </h2>

                  {/* Olfactive Notes Descriptor */}
                  <p className="text-xs text-gray-300 mt-1 font-medium tracking-wide">
                    {item.subtitle}
                  </p>

                  {/* Note Pills */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {item.notesPills.map((pill, pIdx) => (
                      <span
                        key={pIdx}
                        className="px-3 py-1 rounded-full text-[10px] font-semibold bg-white/5 border border-white/10 text-gray-200 backdrop-blur-xs"
                      >
                        {pill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* ========================================================================= */}
                {/* Bottle Stage: Floral Rosette Halo & Sculpted Flacon                       */}
                {/* ========================================================================= */}
                <div className="relative py-8 flex items-center justify-center min-h-[290px]">
                  {/* Concentric floral rosette petals background */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-72 h-72 text-white/10 group-hover:scale-108 transition duration-700">
                    <svg className="w-full h-full" fill="currentColor" viewBox="0 0 400 400">
                      <g transform="translate(200, 200)">
                        <ellipse opacity="0.35" rx="42" ry="120" transform="rotate(0)" />
                        <ellipse opacity="0.35" rx="42" ry="120" transform="rotate(30)" />
                        <ellipse opacity="0.35" rx="42" ry="120" transform="rotate(60)" />
                        <ellipse opacity="0.35" rx="42" ry="120" transform="rotate(90)" />
                        <ellipse opacity="0.35" rx="42" ry="120" transform="rotate(120)" />
                        <ellipse opacity="0.35" rx="42" ry="120" transform="rotate(150)" />
                        <circle fill="none" opacity="0.25" r="60" stroke="currentColor" strokeWidth="1.5" />
                        <circle fill="none" opacity="0.2" r="95" stroke="currentColor" strokeDasharray="4 4" strokeWidth="1" />
                      </g>
                    </svg>
                  </div>

                  {/* Cutout Bottle Representation */}
                  <div className="relative z-10 w-48 h-64 flex items-center justify-center transform group-hover:scale-105 transition duration-500">
                    {isOutOfStock && (
                      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                        <span className="px-3.5 py-1.5 rounded-xl bg-black/85 border border-red-500/60 text-red-400 font-extrabold tracking-[0.2em] text-[11px] uppercase shadow-2xl backdrop-blur-md">
                          AGOTADO • SIN STOCK
                        </span>
                      </div>
                    )}
                    {item.flaconType === 'image' && item.imageUrl ? (
                      <img
                        alt={item.altText || item.title}
                        src={item.imageUrl}
                        className={`max-h-full max-w-full object-contain filter drop-shadow-[0_25px_35px_rgba(0,0,0,0.95)] ${
                          isOutOfStock ? 'opacity-70 grayscale-[35%]' : ''
                        }`}
                      />
                    ) : item.flaconType === 'noir' ? (
                      /* Club de Nuit Matte Noir Sculpted Flacon */
                      <div className="relative w-36 h-56 bg-gradient-to-b from-zinc-800 via-zinc-900 to-black rounded-2xl border border-zinc-700 shadow-[0_25px_35px_rgba(0,0,0,0.95)] flex flex-col items-center justify-between p-4">
                        <div className="w-14 h-9 bg-zinc-900 border border-zinc-600 rounded -mt-8 shadow-inner flex items-center justify-center">
                          <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 shadow-[0_0_6px_#ffffff]"></span>
                        </div>
                        <div className="text-center my-auto">
                          <p className="text-[9px] font-bold tracking-[0.25em] text-zinc-400 uppercase">ARMAF</p>
                          <h3 className="text-xs font-black tracking-widest text-white mt-1 uppercase">CLUB DE NUIT</h3>
                          <span className="text-[8px] tracking-[0.3em] text-zinc-400 block mt-0.5 font-semibold">INTENSE MAN</span>
                        </div>
                        <div className="w-full border-t border-zinc-800 pt-2 flex justify-between items-center text-[8px] text-zinc-400 font-mono">
                          <span>EAU DE PARFUM</span>
                          <span>105 ML</span>
                        </div>
                      </div>
                    ) : item.flaconType === 'cognac' ? (
                      /* Khamrah Lattafa Decanter Flacon */
                      <div className="relative w-36 h-52 bg-gradient-to-b from-amber-600/50 via-amber-800/80 to-stone-950 rounded-2xl border border-amber-400/40 shadow-[0_25px_35px_rgba(0,0,0,0.95)] flex flex-col items-center justify-between p-4 backdrop-blur-md">
                        <div className="w-16 h-8 bg-amber-200/70 border border-amber-300 rounded -mt-7 backdrop-blur-lg shadow-lg flex items-center justify-center">
                          <span className="w-3.5 h-1.5 bg-amber-600 rounded"></span>
                        </div>
                        <div className="text-center my-auto">
                          <p className="text-[9px] font-bold tracking-[0.25em] text-amber-300 uppercase">KHAMRAH</p>
                          <p className="text-[8px] tracking-[0.1em] text-amber-200/80 mt-1 font-medium">LATTAFA PERFUMES</p>
                        </div>
                        <div className="w-full border-t border-amber-500/30 pt-2 flex justify-between items-center text-[8px] text-amber-300 font-mono">
                          <span>EAU DE PARFUM</span>
                          <span>100 ML</span>
                        </div>
                      </div>
                    ) : item.flaconType === 'sapphire' ? (
                      /* Turathi Blue Sapphire Flacon */
                      <div className="relative w-34 h-54 bg-gradient-to-b from-blue-900/70 via-blue-950 to-neutral-950 rounded-2xl border border-blue-500/40 shadow-[0_25px_35px_rgba(0,0,0,0.95)] flex flex-col items-center justify-between p-4 backdrop-blur-md">
                        <div className="w-12 h-10 bg-gradient-to-b from-slate-200 to-slate-400 rounded-full -mt-8 shadow-md border border-white/50 flex items-center justify-center">
                          <span className="w-4 h-4 rounded-full bg-blue-900"></span>
                        </div>
                        <div className="text-center my-auto">
                          <p className="text-[9px] font-bold tracking-[0.25em] text-blue-300 uppercase">AFNAN</p>
                          <h3 className="text-xs font-black tracking-widest text-white mt-1 uppercase">TURATHI</h3>
                          <span className="text-[8px] tracking-[0.3em] text-blue-400 block mt-0.5 font-bold">BLUE</span>
                        </div>
                        <div className="w-full border-t border-blue-500/20 pt-2 flex justify-between items-center text-[8px] text-blue-300 font-mono">
                          <span>EAU DE PARFUM</span>
                          <span>90 ML</span>
                        </div>
                      </div>
                    ) : (
                      /* Supremacy Titanium Flacon */
                      <div className="relative w-36 h-52 bg-gradient-to-b from-zinc-700 via-zinc-900 to-black rounded-3xl border border-zinc-500/40 shadow-[0_25px_35px_rgba(0,0,0,0.95)] flex flex-col items-center justify-between p-4 backdrop-blur-md">
                        <div className="w-14 h-9 bg-zinc-400 border border-white/40 rounded-t-xl -mt-7 flex items-center justify-center shadow-lg">
                          <span className="w-3 h-3 rounded-full bg-zinc-900"></span>
                        </div>
                        <div className="text-center my-auto">
                          <p className="text-[8px] font-bold tracking-[0.2em] text-zinc-400 uppercase">AFNAN</p>
                          <h3 className="text-[11px] font-black tracking-widest text-white mt-1 uppercase leading-tight">SUPREMACY</h3>
                          <span className="text-[7px] tracking-[0.2em] text-teal-400 block mt-0.5 font-bold">NOT ONLY INTENSE</span>
                        </div>
                        <div className="w-full border-t border-zinc-800 pt-2 flex justify-between items-center text-[8px] text-zinc-400 font-mono">
                          <span>EXTRAIT DE PARFUM</span>
                          <span>100 ML</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ========================================================================= */}
                {/* Card Bottom: Volume Selector, Description, Price & CTA                    */}
                {/* ========================================================================= */}
                <div className="mt-2 pt-5 border-t border-white/10">
                  {/* Volume Selector Row */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 mr-1 font-semibold">
                        Vol:
                      </span>
                      {item.availableVolumes.map((vol) => {
                        const isSelected = currentVolume === vol
                        return (
                          <button
                            key={vol}
                            onClick={(e) => handleSelectVolume(e, item.id, vol)}
                            className={`w-7 h-7 rounded-full text-[10px] transition flex items-center justify-center cursor-pointer ${
                              isSelected
                                ? 'font-bold text-black bg-white shadow-md'
                                : 'font-medium text-gray-400 bg-white/5 hover:bg-white/15 border border-white/10'
                            }`}
                          >
                            {vol}
                          </button>
                        )
                      })}
                    </div>
                    <span className="text-[11px] text-gray-400 font-mono">
                      {currentVolume} ml / {fluidOz} FL. OZ.
                    </span>
                  </div>

                  {/* Description Snippet */}
                  <p className="text-xs text-gray-400 line-clamp-2 mb-5 font-light leading-relaxed">
                    {item.description}
                  </p>

                  {/* Price & Add to Cart Button */}
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-gray-400 font-medium">
                        Precio Oficial
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-2xl lg:text-3xl font-bold tracking-tight ${isOutOfStock ? 'text-gray-500 line-through decoration-red-500/80' : 'text-white'}`}>
                          ${currentPrice.toLocaleString('es-AR')}
                        </span>
                        {isOutOfStock && (
                          <span className="text-[10px] font-black text-red-400 tracking-wider uppercase px-2 py-0.5 rounded-md bg-red-500/15 border border-red-500/30">
                            Sin Stock
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      disabled={isOutOfStock}
                      onClick={(e) => {
                        if (isOutOfStock) {
                          e.stopPropagation()
                          return
                        }
                        handleAddToCart(e, item)
                      }}
                      className={`px-5 py-3 rounded-full font-bold text-xs transition duration-300 flex items-center gap-2 shrink-0 ${
                        isOutOfStock
                          ? 'bg-neutral-800 text-neutral-400 border border-neutral-700/80 cursor-not-allowed shadow-none'
                          : 'bg-white text-black hover:bg-gray-200 shadow-xl shadow-white/10 active:scale-95 cursor-pointer'
                      }`}
                    >
                      {isOutOfStock ? (
                        <>
                          <span className="material-symbols-outlined text-[16px] text-red-400">do_not_disturb_on</span>
                          <span className="line-through decoration-red-400">SIN STOCK</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                            />
                          </svg>
                          <span>AÑADIR A LA CESTA</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.article>
            )
          }))}
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 4. BOTTOM PAGINATION CONTROLS                                             */}
      {/* ========================================================================= */}
      {totalPages > 1 && (
        <section className="relative z-10 pb-8">
          <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-8">
            {/* Arrows */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                aria-label="Página anterior"
                className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/30 flex items-center gap-2 text-xs font-semibold text-gray-300 hover:text-white transition disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
                <span>Anterior</span>
              </button>
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                aria-label="Página siguiente"
                className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/30 flex items-center gap-2 text-xs font-semibold text-gray-300 hover:text-white transition disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Siguiente</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </button>
            </div>

            {/* Smart Page Numbers with Ellipses (Clean & Compact) */}
            <div className="flex items-center gap-1.5 text-xs font-semibold overflow-x-auto max-w-full py-1">
              {getPaginationItems(currentPage, totalPages).map((item, idx) => {
                if (typeof item === 'string') {
                  return (
                    <span
                      key={`dots-${idx}`}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 font-bold select-none text-sm tracking-widest"
                    >
                      …
                    </span>
                  )
                }
                const isActive = currentPage === item
                return (
                  <button
                    key={item}
                    onClick={() => handlePageChange(item)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition cursor-pointer text-xs font-bold ${
                      isActive
                        ? 'bg-white text-black font-extrabold shadow-lg shadow-white/20 scale-105'
                        : 'bg-white/[0.03] text-gray-400 hover:text-white hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    {item}
                  </button>
                )
              })}
            </div>

            {/* Secondary Page Info */}
            <div className="text-xs text-gray-400 font-medium">
              Página <span className="text-white font-semibold">{currentPage}</span> de{' '}
              <span className="text-white font-semibold">{totalPages}</span> ({filteredProducts.length} creaciones)
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
