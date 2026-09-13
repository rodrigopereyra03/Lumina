import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PERFUME_SUBCATEGORIES, GENDER_FILTERS, type Product } from '../data/productsData'
import { productsApi } from '../../../api/productsApi'
import { useCartStore } from '../../../store/useCartStore'

interface ProductGridProps {
  selectedCategorySlug: string
  onProductClick: (id: string) => void
  onViewAll?: () => void
  searchQuery?: string
  onClearSearch?: () => void
}

const normalizeText = (str: string) =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

export const ProductGrid: React.FC<ProductGridProps> = ({
  selectedCategorySlug,
  onProductClick,
  onViewAll,
  searchQuery = '',
  onClearSearch,
}) => {
  const { addItem, openDrawer } = useCartStore()
  const [productList, setProductList] = useState<Product[]>([])
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all')
  const [selectedGender, setSelectedGender] = useState<string>('all')

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productsApi.getProducts(selectedCategorySlug)
        if (res.products && res.products.length > 0) {
          const mapped: Product[] = res.products.map((p: any) => ({
            id: p.id,
            title: p.title,
            subtitle: p.subtitle || '',
            category: p.category_name || 'Perfumes',
            categorySlug: p.category_slug || 'perfumes',
            price: p.price,
            originalPrice: p.original_price,
            rating: p.rating || 5.0,
            reviewsCount: p.reviews_count || 0,
            stock: p.stock,
            image: p.image,
            gallery: [p.image],
            tags: ['Garantía Oficial'],
            description: p.description,
            variants: [{ id: 'std', name: 'Estándar', colorClass: 'bg-[#1b1c1c]' }],
            specs: [{ label: 'Garantía', value: '100% Original' }],
          }))
          setProductList(mapped)
        } else {
          setProductList([])
        }
      } catch (e) {
        // Handled
      }
    }
    fetchProducts()
  }, [selectedCategorySlug])

  const displayedProducts = productList.filter((p) => {
    // 1. Category match
    const categoryMatches =
      selectedCategorySlug === 'all' ||
      p.categorySlug === selectedCategorySlug ||
      normalizeText(p.category).includes(normalizeText(selectedCategorySlug))

    if (!categoryMatches) return false

    // 2. Subcategory match
    if (selectedSubcategory !== 'all') {
      const pText = normalizeText(`${p.subtitle} ${p.title} ${p.description}`)
      if (selectedSubcategory === 'arabes' && !pText.includes('arabe')) return false
      if (selectedSubcategory === 'disenador' && !pText.includes('disenador') && !pText.includes('importad')) return false
      if (selectedSubcategory === 'nicho' && !pText.includes('nicho')) return false
      if (selectedSubcategory === 'testers' && !pText.includes('tester')) return false
      if (selectedSubcategory === 'decants' && !pText.includes('decant')) return false
    }

    // 3. Gender filter match
    if (selectedGender !== 'all') {
      const pText = normalizeText(`${p.subtitle} ${p.title} ${p.description}`)
      if (selectedGender === 'hombre' && !pText.includes('hombre') && !pText.includes('masculin')) return false
      if (selectedGender === 'mujer' && !pText.includes('mujer') && !pText.includes('femenin')) return false
      if (selectedGender === 'unisex' && !pText.includes('unisex')) return false
    }

    // 4. Search query match
    if (!searchQuery || !searchQuery.trim()) return true

    const queryNorm = normalizeText(searchQuery.trim())
    const titleMatch = normalizeText(p.title).includes(queryNorm)
    const subtitleMatch = normalizeText(p.subtitle || '').includes(queryNorm)
    const descMatch = normalizeText(p.description || '').includes(queryNorm)
    const catMatch = normalizeText(p.category || '').includes(queryNorm)
    const tagsMatch = p.tags?.some((t) => normalizeText(t).includes(queryNorm))

    return titleMatch || subtitleMatch || descMatch || catMatch || tagsMatch
  })

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation()
    const defaultVariant = product.variants?.[0]?.name || 'Estándar'
    addItem({ ...product, variant: defaultVariant }, 1)
    openDrawer()
  }

  return (
    <section id="catalog-section" className="space-y-6 font-body text-[#1b1c1c]">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
        <div>
          {searchQuery ? (
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#1b1c1c]">
                  Resultados para "{searchQuery}"
                </h2>
                <span className="px-3 py-1 rounded-full bg-[#FF4D4F]/10 text-[#FF4D4F] font-bold text-xs">
                  {displayedProducts.length} {displayedProducts.length === 1 ? 'producto' : 'productos'}
                </span>
              </div>
              <p className="text-xs md:text-sm text-[#5b403e] mt-1">
                Explora los productos que coinciden con tu búsqueda.
              </p>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#1b1c1c]">
                {selectedCategorySlug === 'all' ? 'Tendencias de Temporada' : 'Catálogo de Productos'}
              </h2>
              <p className="text-xs md:text-sm text-[#5b403e] mt-1">
                Selección exclusiva y piezas de diseño con garantía oficial.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {searchQuery && onClearSearch && (
            <button
              onClick={onClearSearch}
              className="text-xs font-bold text-[#FF4D4F] hover:underline flex items-center gap-1 cursor-pointer bg-white/70 px-3 py-1.5 rounded-full border border-white"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
              <span>Limpiar búsqueda</span>
            </button>
          )}

          {selectedCategorySlug !== 'all' && onViewAll && !searchQuery && (
            <button
              onClick={onViewAll}
              className="text-xs font-bold text-[#FF4D4F] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Ver Todo el Catálogo</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          )}
        </div>
      </div>

      {/* Luxury Subcategories & Gender Filters Bar */}
      <div className="glass-panel p-4 md:p-5 rounded-3xl border border-white/80 shadow-xs space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Subcategories Scrollable Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 lg:pb-0 scrollbar-none">
            <span className="text-xs font-bold text-[#5b403e] whitespace-nowrap mr-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[17px] text-[#FF4D4F]">category</span>
              <span>Subcategoría:</span>
            </span>
            {PERFUME_SUBCATEGORIES.map((sub) => {
              const active = selectedSubcategory === sub.id
              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubcategory(sub.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    active
                      ? 'bg-[#1b1c1c] text-white shadow-sm'
                      : 'bg-white/70 text-[#5b403e] hover:bg-white hover:text-[#1b1c1c] border border-white/80'
                  }`}
                >
                  {sub.label}
                </button>
              )
            })}
          </div>

          {/* Gender Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-white/50">
            <span className="text-xs font-bold text-[#5b403e] whitespace-nowrap mr-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[17px] text-[#FF4D4F]">tune</span>
              <span>Público:</span>
            </span>
            {GENDER_FILTERS.map((g) => {
              const active = selectedGender === g.id
              return (
                <button
                  key={g.id}
                  onClick={() => setSelectedGender(g.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    active
                      ? 'bg-[#FF4D4F] text-white shadow-xs'
                      : 'bg-white/70 text-[#5b403e] hover:bg-white hover:text-[#1b1c1c] border border-white/80'
                  }`}
                >
                  {g.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Active Filters Summary if filtered */}
        {(selectedSubcategory !== 'all' || selectedGender !== 'all') && (
          <div className="flex items-center justify-between text-xs pt-2 border-t border-white/50">
            <div className="flex items-center gap-2 text-[#5b403e] flex-wrap">
              <span className="font-semibold">Filtros aplicados:</span>
              {selectedSubcategory !== 'all' && (
                <span className="px-2.5 py-0.5 rounded-md bg-[#1b1c1c]/10 font-bold text-[#1b1c1c]">
                  {PERFUME_SUBCATEGORIES.find((s) => s.id === selectedSubcategory)?.label}
                </span>
              )}
              {selectedGender !== 'all' && (
                <span className="px-2.5 py-0.5 rounded-md bg-[#FF4D4F]/10 font-bold text-[#FF4D4F]">
                  {GENDER_FILTERS.find((g) => g.id === selectedGender)?.label}
                </span>
              )}
            </div>
            <button
              onClick={() => {
                setSelectedSubcategory('all')
                setSelectedGender('all')
              }}
              className="text-[#FF4D4F] font-bold hover:underline cursor-pointer text-xs flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">refresh</span>
              <span>Restablecer</span>
            </button>
          </div>
        )}
      </div>

      {/* Empty State */}
      {displayedProducts.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto border border-white/70 shadow-sm my-8">
          <div className="w-16 h-16 rounded-full bg-[#ffdad7]/50 text-[#FF4D4F] flex items-center justify-center mx-auto shadow-xs">
            <span className="material-symbols-outlined text-[36px]">
              {searchQuery ? 'search_off' : 'inventory_2'}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1b1c1c]">
              {searchQuery
                ? `No encontramos productos para "${searchQuery}"`
                : 'Catálogo Listo para Nuevos Productos'}
            </h3>
            <p className="text-xs text-[#5b403e] mt-1.5 leading-relaxed">
              {searchQuery
                ? 'Verifica la ortografía o intenta con palabras más generales.'
                : 'Todos los datos de prueba han sido eliminados. Tu tienda está limpia para comenzar a publicar tus fragancias y perfumes reales.'}
            </p>
          </div>
          {searchQuery && onClearSearch ? (
            <button
              onClick={onClearSearch}
              className="btn-primary py-2.5 px-6 rounded-full text-xs font-bold shadow-md cursor-pointer inline-flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              <span>Ver todos los productos</span>
            </button>
          ) : (
            <a
              href="/admin"
              className="btn-primary py-2.5 px-6 rounded-full text-xs font-bold shadow-md cursor-pointer inline-flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span>Cargar Primer Producto en Admin</span>
            </a>
          )}
        </div>
      ) : (
        /* Grid of Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              onClick={() => onProductClick(product.id)}
              className="group glass-card rounded-3xl p-5 flex flex-col justify-between hover:shadow-xl hover:border-white/90 transition-all duration-300 cursor-pointer relative overflow-hidden"
            >
              {/* Tag Badge */}
              {product.tags?.[0] && (
                <span className="absolute top-4 left-4 z-10 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/80 text-[#FF4D4F] border border-white/80 shadow-2xs">
                  {product.tags[0]}
                </span>
              )}

              {/* Product Image Stage */}
              <div className="relative w-full aspect-square rounded-2xl bg-gradient-to-b from-white/40 to-white/80 flex items-center justify-center p-4 mb-4 overflow-hidden border border-white/60">
                <img
                  src={product.image}
                  alt={product.title}
                  className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-108 transition-transform duration-500"
                />
              </div>

              {/* Product Details */}
              <div className="space-y-1.5 mb-4">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] text-[#5b403e] uppercase font-bold tracking-wider">
                    {product.category}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-[#1b1c1c] font-bold">
                    <span
                      className="material-symbols-outlined text-[14px] text-[#FF4D4F]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                    <span>{product.rating}</span>
                  </div>
                </div>

                <h3 className="font-bold text-sm text-[#1b1c1c] group-hover:text-[#FF4D4F] transition-colors line-clamp-1">
                  {product.title}
                </h3>

                <p className="text-xs text-[#5b403e] line-clamp-2 leading-relaxed">
                  {product.subtitle}
                </p>
              </div>

              {/* Price & Action Row */}
              <div className="flex items-center justify-between pt-3 border-t border-white/60">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base font-bold text-[#1b1c1c]">${product.price.toFixed(2)}</span>
                  {product.originalPrice && (
                    <span className="text-xs line-through text-[#5b403e]">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                <button
                  onClick={(e) => handleAddToCart(e, product)}
                  className="p-2.5 rounded-full bg-white/80 hover:bg-[#FF4D4F] text-[#1b1c1c] hover:text-white border border-white shadow-2xs transition-all duration-200 cursor-pointer flex items-center justify-center hover:scale-105"
                  title="Añadir al Carrito"
                >
                  <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  )
}
