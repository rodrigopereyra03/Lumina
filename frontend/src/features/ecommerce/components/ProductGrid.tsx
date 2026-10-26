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
              const brand = p.brand || p.category_name || 'Fórmula 1370'
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
              } else if (accent === '#783c1d' || accent === '#6d3b1e') {
                glow = 'bg-amber-950/40 group-hover:bg-amber-900/50'
                dot = 'bg-amber-700 shadow-[0_0_10px_#783c1d]'
                textAccent = 'text-amber-600 font-semibold'
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
              } else if (accent === '#000000' || accent === '#0a0a0a') {
                glow = 'bg-neutral-800/40 group-hover:bg-neutral-700/50'
                dot = 'bg-neutral-400 shadow-[0_0_10px_#a1a1aa]'
                textAccent = 'text-neutral-300 font-bold'
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
      if (b && b !== 'Fórmula 1370' && b !== 'Lumina' && b !== 'General') {
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
    if (volume === 60 && defaultVol === 100) {
      return Math.round((basePrice * 0.78) / 1000) * 1000
    }
    if (volume === 80 && defaultVol === 100) {
      return Math.round((basePrice * 0.85) / 1000) * 1000
    }
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
      className="relative w-full min-h-screen text-[#121314] font-dm selection:bg-[#ff78ac] selection:text-[#121314] py-8 px-4 sm:px-8 lg:px-12 bg-[#f6f4ee] transition-all"
    >
      {/* Added to cart Toast */}
      {addedItemTitle && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-6 right-6 z-50 bg-[#0ffcbe] text-[#121314] border-2 border-[#121314] neo-box-shadow px-5 py-3 rounded-xl flex items-center gap-3 font-dm font-black text-xs"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#121314] animate-ping"></span>
          <span>{addedItemTitle} añadido a la cesta</span>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* 1. HERO CATALOG HEADER (Colección Exclusiva - Haute Parfumerie)           */}
      {/* ========================================================================= */}
      <section className="relative z-10 pt-2 pb-8">
        <div className="max-w-[1440px] mx-auto text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b-2 border-[#121314]/15">
          <div>
            {/* Breadcrumb Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#ff78ac] border-2 border-[#121314] text-[11px] uppercase font-dm font-black tracking-wider text-[#121314] mb-3 neo-box-shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#121314]"></span>
              Haute Parfumerie • Dubái &amp; Oriente
            </div>

            {/* Main Title (DM Sans Black) */}
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-dm font-black text-[#121314] tracking-tight leading-tight uppercase">
              {searchQuery ? `Resultados: "${searchQuery}"` : 'Colección de Fragancias'}
            </h2>

            {/* Subtitle */}
            <p className="mt-3 text-xs md:text-sm text-[#55575a] max-w-2xl font-dm font-medium leading-relaxed">
              Extractos puros de concentración extrema, maderas preciosas, resinas orientales y notas nocturnas diseñadas para una estela inconfundible.
            </p>
          </div>

          {/* Quick Counter & Certifications */}
          <div className="flex items-center justify-center md:justify-end gap-3 text-xs font-dm">
            <span className="px-4 py-2 rounded-xl bg-white border-2 border-[#121314] text-[#121314] font-bold neo-box-shadow-sm">
              <strong className="text-[#106ebe] font-black">{filteredProducts.length}</strong> Creaciones
            </span>
            <span className="hidden sm:inline-block px-4 py-2 rounded-xl bg-white border-2 border-[#121314] text-[#121314] font-bold neo-box-shadow-sm">
              Autenticidad <strong className="text-[#121314] font-black">100% Original</strong>
            </span>

            {searchQuery && onClearSearch && (
              <button
                onClick={onClearSearch}
                className="px-4 py-2 rounded-xl bg-[#ff78ac] border-2 border-[#121314] text-[#121314] hover:bg-[#ff5f9c] transition font-black cursor-pointer neo-box-shadow-sm"
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
          {/* 2A. BRAND HOUSES (Neo-Editorial Multi-Pills) */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] uppercase tracking-wider text-[#121314] font-dm font-black px-3 py-1.5 rounded-xl bg-[#a8d5e3] border-2 border-[#121314] neo-box-shadow-sm shrink-0">
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
                  className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all duration-150 cursor-pointer flex items-center gap-2 text-xs font-dm font-bold ${
                    isActive
                      ? 'bg-[#0ffcbe] text-[#121314] font-black border-2 border-[#121314] neo-box-shadow-sm scale-[1.02]'
                      : 'bg-white border-2 border-[#121314] text-[#121314] hover:bg-[#f2f0ea]'
                  }`}
                >
                  <span>{house.brand}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-[#121314] text-white' : 'bg-[#f2f0ea] text-[#121314] border border-[#121314]'
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
            <div className="flex flex-wrap items-center gap-2 text-xs font-dm font-bold">
              <span className="text-[11px] uppercase tracking-wider text-[#55575a] font-bold mr-1 hidden sm:inline">
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
                    className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition cursor-pointer text-xs font-dm font-bold ${
                      isActive
                        ? 'bg-[#ff78ac] text-[#121314] font-black border-2 border-[#121314] neo-box-shadow-sm'
                        : 'bg-white border-2 border-[#121314]/30 text-[#55575a] hover:border-[#121314] hover:text-[#121314]'
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
                  className="text-xs text-[#ff78ac] hover:text-[#e0568c] font-dm font-black underline underline-offset-4 cursor-pointer whitespace-nowrap"
                >
                  Restablecer filtros
                </button>
              )}

              <div className="relative shrink-0">
                <select
                  aria-label="Ordenar fragancias"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border-2 border-[#121314] text-[#121314] text-xs font-dm font-bold rounded-xl px-4 py-2 pr-9 neo-box-shadow-sm focus:outline-none cursor-pointer"
                >
                  <option value="relevance" className="bg-white text-[#121314]">
                    Relevancia &amp; Prestigio
                  </option>
                  <option value="price-desc" className="bg-white text-[#121314]">
                    Precio: Mayor a Menor
                  </option>
                  <option value="price-asc" className="bg-white text-[#121314]">
                    Precio: Menor a Mayor
                  </option>
                  <option value="new" className="bg-white text-[#121314]">
                    Nuevos Lanzamientos
                  </option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#121314]">
                  <svg className="w-3.5 h-3.5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
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
                className="relative rounded-2xl p-7 min-h-[500px] flex flex-col justify-between overflow-hidden border-2 border-[#121314]/20 bg-white neo-box-shadow animate-pulse"
              >
                <div className="space-y-3">
                  <div className="h-3 w-28 bg-[#121314]/10 rounded-full" />
                  <div className="h-7 w-3/4 bg-[#121314]/10 rounded-lg" />
                  <div className="h-4 w-1/2 bg-[#121314]/5 rounded-lg" />
                  <div className="flex gap-2 pt-2">
                    <div className="h-5 w-16 bg-[#121314]/5 rounded-full" />
                    <div className="h-5 w-20 bg-[#121314]/5 rounded-full" />
                  </div>
                </div>
                <div className="my-auto flex items-center justify-center py-10">
                  <div className="w-36 h-48 bg-[#121314]/5 rounded-2xl border-2 border-[#121314]/10" />
                </div>
                <div className="space-y-3 pt-4 border-t-2 border-[#121314]/10">
                  <div className="flex justify-between items-center">
                    <div className="h-6 w-24 bg-[#121314]/10 rounded-lg" />
                    <div className="h-6 w-20 bg-[#121314]/10 rounded-lg" />
                  </div>
                  <div className="h-10 w-full bg-[#121314]/10 rounded-xl" />
                </div>
              </div>
            ))
          ) : paginatedProducts.length === 0 ? (
            <div className="col-span-full py-20 text-center flex flex-col items-center justify-center">
              <span className="w-16 h-16 rounded-2xl bg-white border-2 border-[#121314] neo-box-shadow flex items-center justify-center text-3xl mb-4">
                ✨
              </span>
              <h3 className="text-2xl font-dm font-black text-[#121314] uppercase mb-2">No se encontraron fragancias</h3>
              <p className="text-sm text-[#55575a] font-dm max-w-sm mb-6">
                No hay productos disponibles para los filtros seleccionados. Intenta restablecer los filtros para explorar todo el catálogo.
              </p>
              <button
                onClick={() => {
                  setSelectedHouse('Todas')
                  setSelectedFamily('Todas las Familias')
                  if (onClearSearch) onClearSearch()
                  setCurrentPage(1)
                }}
                className="px-6 py-3 rounded-xl bg-[#0ffcbe] hover:bg-[#00eaad] text-[#121314] font-dm font-black text-xs uppercase border-2 border-[#121314] neo-box-shadow cursor-pointer transition"
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
                  className="group relative rounded-2xl p-7 flex flex-col justify-between overflow-hidden bg-white border-2 border-[#121314] neo-box-shadow hover:-translate-y-1.5 transition-all duration-300 cursor-pointer"
                >
                  {/* Card Top: Brand & Glowing Dot / Out of Stock Badge */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs tracking-wider uppercase font-dm font-black text-[#106ebe]">
                        {item.brandTag}
                      </span>
                      {isOutOfStock ? (
                        <span className="px-2.5 py-0.5 rounded-md bg-[#121314] border-2 border-[#121314] text-white text-[9px] font-dm font-black tracking-wider uppercase flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                          SIN STOCK
                        </span>
                      ) : (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#0ffcbe] border border-[#121314]"></span>
                      )}
                    </div>

                    {/* Product Title (DM Sans Black) */}
                    <h3 className={`text-2xl lg:text-3xl font-dm font-black tracking-tight leading-tight uppercase group-hover:text-[#106ebe] transition ${isOutOfStock ? 'text-gray-400 line-through' : 'text-[#121314]'}`}>
                      {item.title}
                    </h3>

                    {/* Olfactive Notes Descriptor */}
                    <p className="text-xs text-[#55575a] mt-1 font-dm font-semibold tracking-wide">
                      {item.subtitle}
                    </p>

                    {/* Note Pills */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {item.notesPills.map((pill, pIdx) => (
                        <span
                          key={pIdx}
                          className="px-2.5 py-0.5 rounded-md text-[10px] font-dm font-bold bg-[#f2f0ea] border border-[#121314] text-[#121314]"
                        >
                          {pill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottle Stage: Halo & Flacon */}
                  <div className="relative py-8 flex items-center justify-center min-h-[290px]">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-72 h-72 text-[#121314]/08 group-hover:scale-105 transition duration-500">
                      <svg className="w-full h-full" fill="currentColor" viewBox="0 0 400 400">
                        <g transform="translate(200, 200)">
                          <ellipse opacity="0.4" rx="42" ry="120" transform="rotate(0)" />
                          <ellipse opacity="0.4" rx="42" ry="120" transform="rotate(30)" />
                          <ellipse opacity="0.4" rx="42" ry="120" transform="rotate(60)" />
                          <ellipse opacity="0.4" rx="42" ry="120" transform="rotate(90)" />
                          <ellipse opacity="0.4" rx="42" ry="120" transform="rotate(120)" />
                          <ellipse opacity="0.4" rx="42" ry="120" transform="rotate(150)" />
                          <circle fill="none" opacity="0.3" r="60" stroke="currentColor" strokeWidth="1.5" />
                          <circle fill="none" opacity="0.2" r="95" stroke="currentColor" strokeDasharray="4 4" strokeWidth="1" />
                        </g>
                      </svg>
                    </div>

                    {/* Bottle Image or Sculpted Flacon */}
                    <div className="relative z-10 w-48 h-64 flex items-center justify-center transform group-hover:scale-105 transition duration-500">
                      {isOutOfStock && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                          <span className="px-3.5 py-1.5 rounded-xl bg-[#121314] border-2 border-[#121314] text-white font-dm font-black tracking-wider text-[11px] uppercase neo-box-shadow">
                            AGOTADO
                          </span>
                        </div>
                      )}
                      {item.flaconType === 'image' && item.imageUrl ? (
                        <img
                          alt={item.altText || item.title}
                          src={item.imageUrl}
                          className={`max-h-full max-w-full object-contain filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.18)] ${
                            isOutOfStock ? 'opacity-60 grayscale-[40%]' : ''
                          }`}
                        />
                      ) : item.flaconType === 'noir' ? (
                        <div className="relative w-36 h-56 bg-[#121314] rounded-2xl border-2 border-[#121314] neo-box-shadow flex flex-col items-center justify-between p-4 text-white">
                          <div className="w-14 h-9 bg-zinc-800 border border-zinc-600 rounded -mt-8 flex items-center justify-center">
                            <span className="w-2.5 h-2.5 rounded-full bg-zinc-300"></span>
                          </div>
                          <div className="text-center my-auto">
                            <p className="text-[9px] font-dm font-bold tracking-wider text-zinc-400 uppercase">ARMAF</p>
                            <h4 className="text-xs font-dm font-black tracking-widest text-white mt-1 uppercase">CLUB DE NUIT</h4>
                            <span className="text-[8px] tracking-wider text-zinc-400 block mt-0.5 font-bold">INTENSE MAN</span>
                          </div>
                          <div className="w-full border-t border-zinc-800 pt-2 flex justify-between items-center text-[8px] text-zinc-400 font-mono">
                            <span>EDP</span>
                            <span>105 ML</span>
                          </div>
                        </div>
                      ) : item.flaconType === 'cognac' ? (
                        <div className="relative w-36 h-52 bg-gradient-to-b from-amber-600 via-amber-800 to-amber-950 rounded-2xl border-2 border-[#121314] neo-box-shadow flex flex-col items-center justify-between p-4 text-white">
                          <div className="w-16 h-8 bg-amber-200 border-2 border-[#121314] rounded -mt-7 flex items-center justify-center">
                            <span className="w-3.5 h-1.5 bg-amber-800 rounded"></span>
                          </div>
                          <div className="text-center my-auto">
                            <p className="text-[9px] font-dm font-black tracking-wider text-amber-200 uppercase">KHAMRAH</p>
                            <p className="text-[8px] font-dm text-amber-300 mt-1 font-bold">LATTAFA</p>
                          </div>
                          <div className="w-full border-t border-amber-500/40 pt-2 flex justify-between items-center text-[8px] text-amber-200 font-mono">
                            <span>EDP</span>
                            <span>100 ML</span>
                          </div>
                        </div>
                      ) : (
                        <div className="relative w-34 h-54 bg-gradient-to-b from-blue-700 via-blue-900 to-blue-950 rounded-2xl border-2 border-[#121314] neo-box-shadow flex flex-col items-center justify-between p-4 text-white">
                          <div className="w-12 h-10 bg-slate-200 border-2 border-[#121314] rounded-full -mt-8 flex items-center justify-center">
                            <span className="w-3 h-3 rounded-full bg-blue-900"></span>
                          </div>
                          <div className="text-center my-auto">
                            <p className="text-[9px] font-dm font-black tracking-wider text-blue-200 uppercase">TURATHI</p>
                            <h4 className="text-xs font-dm font-black tracking-widest text-white mt-1 uppercase">BLUE</h4>
                          </div>
                          <div className="w-full border-t border-blue-400/30 pt-2 flex justify-between items-center text-[8px] text-blue-200 font-mono">
                            <span>EDP</span>
                            <span>90 ML</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom: Volume, Description, Price & CTA */}
                  <div className="mt-2 pt-5 border-t-2 border-[#121314]/15">
                    {/* Volume Selector Row */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase tracking-wider text-[#55575a] mr-1 font-dm font-bold">
                          Vol:
                        </span>
                        {item.availableVolumes.map((vol) => {
                          const isSelected = currentVolume === vol
                          return (
                            <button
                              key={vol}
                              onClick={(e) => handleSelectVolume(e, item.id, vol)}
                              className={`w-7 h-7 rounded-lg text-[10px] font-dm transition flex items-center justify-center cursor-pointer ${
                                isSelected
                                  ? 'font-black text-[#121314] bg-[#a8d5e3] border-2 border-[#121314] neo-box-shadow-sm'
                                  : 'font-bold text-[#55575a] bg-white border border-[#121314]/40 hover:border-[#121314]'
                              }`}
                            >
                              {vol}
                            </button>
                          )
                        })}
                      </div>
                      <span className="text-[11px] text-[#55575a] font-dm font-bold">
                        {currentVolume} ml / {fluidOz} FL. OZ.
                      </span>
                    </div>

                    {/* Description Snippet */}
                    <p className="text-xs text-[#55575a] font-dm line-clamp-2 mb-5 font-normal leading-relaxed">
                      {item.description}
                    </p>

                    {/* Price & Add to Cart Button */}
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <span className="block text-[10px] uppercase tracking-wider text-[#55575a] font-dm font-bold">
                          Precio Oficial
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className={`text-2xl lg:text-3xl font-dm font-black tracking-tight ${isOutOfStock ? 'text-gray-400 line-through' : 'text-[#121314]'}`}>
                            ${currentPrice.toLocaleString('es-AR')}
                          </span>
                          {isOutOfStock && (
                            <span className="text-[10px] font-dm font-black text-white tracking-wider uppercase px-2 py-0.5 rounded-md bg-[#121314]">
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
                        className={`px-5 py-3 rounded-xl font-dm font-black text-xs uppercase tracking-wider transition-all duration-150 flex items-center gap-2 shrink-0 ${
                          isOutOfStock
                            ? 'bg-gray-200 text-gray-400 border-2 border-gray-300 cursor-not-allowed shadow-none'
                            : 'bg-[#0ffcbe] hover:bg-[#00eaad] text-[#121314] border-2 border-[#121314] neo-box-shadow-sm neo-box-shadow-hover neo-box-shadow-active cursor-pointer'
                        }`}
                      >
                        {isOutOfStock ? (
                          <span>SIN STOCK</span>
                        ) : (
                          <>
                            <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <span>Añadir</span>
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
          <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 border-t-2 border-[#121314]/15 pt-8">
            {/* Arrows */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                aria-label="Página anterior"
                className="px-4 py-2 rounded-xl bg-white border-2 border-[#121314] neo-box-shadow-sm hover:bg-[#f2f0ea] flex items-center gap-2 text-xs font-dm font-bold text-[#121314] transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Anterior</span>
              </button>
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                aria-label="Página siguiente"
                className="px-4 py-2 rounded-xl bg-white border-2 border-[#121314] neo-box-shadow-sm hover:bg-[#f2f0ea] flex items-center gap-2 text-xs font-dm font-bold text-[#121314] transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Siguiente</span>
                <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
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
                      className="w-8 h-8 flex items-center justify-center text-[#55575a] font-dm font-bold select-none text-sm tracking-widest"
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
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition cursor-pointer text-xs font-dm ${
                      isActive
                        ? 'bg-[#ff78ac] text-[#121314] font-black border-2 border-[#121314] neo-box-shadow-sm scale-105'
                        : 'bg-white text-[#121314] font-bold border-2 border-[#121314]/30 hover:border-[#121314] hover:bg-[#f2f0ea]'
                    }`}
                  >
                    {item}
                  </button>
                )
              })}
            </div>

            {/* Secondary Page Info */}
            <div className="text-xs font-dm text-[#55575a] font-medium">
              Página <span className="text-[#121314] font-black">{currentPage}</span> de{' '}
              <span className="text-[#121314] font-black">{totalPages}</span> ({filteredProducts.length} creaciones)
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
