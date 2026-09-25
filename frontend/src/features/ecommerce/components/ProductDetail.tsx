import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { productsApi, type BackendProductDTO } from '../../../api/productsApi'
import { useCartStore } from '../../../store/useCartStore'
import type { Product } from '../data/productsData'

interface ProductDetailProps {
  productId: string
  onBack: () => void
  onProductClick: (id: string) => void
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  productId,
  onBack,
  onProductClick,
}) => {
  const [product, setProduct] = useState<Product | null>(null)
  const [recommended, setRecommended] = useState<BackendProductDTO[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const [selectedImage, setSelectedImage] = useState<string>('')
  const [selectedVariant, setSelectedVariant] = useState<string>('Estándar')
  const [quantity, setQuantity] = useState<number>(1)
  const [isAdded, setIsAdded] = useState<boolean>(false)

  const { addItem, openDrawer } = useCartStore()

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      try {
        const [currentProd, allProdsRes] = await Promise.all([
          productsApi.getProductById(productId),
          productsApi.getProducts('all'),
        ])

        if (currentProd) {
          const productGallery = currentProd.images && currentProd.images.length > 0
            ? currentProd.images
            : [currentProd.image || '/hero-perfumes/odyssey-aqua.png']

          const mapped: Product = {
            id: currentProd.id,
            title: currentProd.title,
            subtitle: currentProd.subtitle || '',
            category: currentProd.category_name || 'Perfumes',
            categorySlug: (currentProd.category_slug || 'perfumes') as any,
            price: currentProd.price,
            originalPrice: currentProd.original_price,
            rating: currentProd.rating || 5.0,
            reviewsCount: currentProd.reviews_count || 12,
            stock: currentProd.stock,
            image: productGallery[0] || currentProd.image || '/hero-perfumes/odyssey-aqua.png',
            gallery: productGallery,
            tags: ['Garantía Oficial', 'Original'],
            description: currentProd.description,
            variants: [
              { id: 'v1', name: 'Estándar', colorClass: 'bg-[#1b1c1c]' },
              { id: 'v2', name: 'Edición Premium', colorClass: 'bg-[#FF4D4F]' },
            ],
            specs: [
              { label: 'Garantía', value: '1 Año Oficial' },
              { label: 'Disponibilidad', value: currentProd.stock <= 0 ? 'Sin stock (Agotado)' : `${currentProd.stock} unidades en stock` },
              { label: 'Envío', value: 'Express asegurado a todo el país' },
            ],
            detailsCards: [
              {
                icon: 'verified',
                title: 'Calidad Premium',
                text: 'Construido bajo los más altos estándares de calidad y durabilidad Lumina.',
              },
              {
                icon: 'local_shipping',
                title: 'Despacho Rápido',
                text: 'Empaquetado y entregado al correo en menos de 24 horas hábiles.',
              },
              {
                icon: 'sync_alt',
                title: 'Garantía y Devolución',
                text: '30 días de cambio directo y soporte técnico personalizado.',
              },
            ],
          }
          setProduct(mapped)
          setSelectedImage(productGallery[0])
          setSelectedVariant(mapped.variants[0]?.name || 'Estándar')
        }

        if (allProdsRes.products) {
          const others = allProdsRes.products.filter((p) => p.id !== productId).slice(0, 3)
          setRecommended(others)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [productId])

  const currentImageIndex = product?.gallery ? Math.max(0, product.gallery.indexOf(selectedImage)) : 0

  const handleNextImage = () => {
    if (!product?.gallery || product.gallery.length <= 1) return
    const nextIdx = (currentImageIndex + 1) % product.gallery.length
    setSelectedImage(product.gallery[nextIdx])
  }

  const handlePrevImage = () => {
    if (!product?.gallery || product.gallery.length <= 1) return
    const prevIdx = (currentImageIndex - 1 + product.gallery.length) % product.gallery.length
    setSelectedImage(product.gallery[prevIdx])
  }

  const handleAddToCart = () => {
    if (!product) return
    addItem({ ...product, variant: selectedVariant }, quantity)
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
    openDrawer()
  }

  if (loading || !product) {
    return (
      <div className="py-24 text-center text-xs text-[#5b403e] glass-panel rounded-3xl border border-white/70 shadow-sm">
        <div className="w-10 h-10 border-2 border-[#FF4D4F] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <span>Cargando detalle del producto...</span>
      </div>
    )
  }

  const isOutOfStock = product.stock <= 0

  return (
    <motion.div
      key={product.id}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-12 font-body text-[#1b1c1c] dark:text-[#f9fafb]"
    >
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-[#5b403e] dark:text-[#9ca3af]">
        <button onClick={onBack} className="hover:text-[#FF4D4F] transition-colors cursor-pointer font-medium">
          Inicio
        </button>
        <span>/</span>
        <span className="capitalize">{product.category}</span>
        <span>/</span>
        <span className="text-[#1b1c1c] dark:text-[#f9fafb] font-semibold">{product.title}</span>
      </div>

      {/* Main Two-Column Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Multi-Photo Gallery Stage */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Main Selected Image Stage */}
          <div className="relative aspect-square sm:aspect-[4/3] lg:aspect-square w-full rounded-3xl glass-panel p-6 flex items-center justify-center overflow-hidden border border-white/70 dark:border-white/10 shadow-sm bg-white/40 dark:bg-white/5 group">
            {isOutOfStock && (
              <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                <span className="px-5 py-2 rounded-2xl bg-black/85 border border-red-500/60 text-red-400 font-extrabold tracking-[0.25em] text-xs sm:text-sm uppercase shadow-2xl backdrop-blur-md">
                  AGOTADO • SIN STOCK
                </span>
              </div>
            )}
            <motion.img
              key={selectedImage || product.image}
              src={selectedImage || product.image}
              alt={product.title}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/hero-perfumes/odyssey-aqua.png'
              }}
              className={`max-h-full max-w-full object-contain rounded-2xl select-none ${
                isOutOfStock ? 'opacity-70 grayscale-[30%]' : ''
              }`}
            />

            {/* Tag Badge */}
            {product.tags?.[0] && (
              <span className="absolute top-5 left-5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/85 dark:bg-[#181c26]/90 text-[#FF4D4F] border border-white dark:border-white/10 shadow-2xs z-10">
                {product.tags[0]}
              </span>
            )}

            {/* Photo Counter Badge */}
            {product.gallery && product.gallery.length > 1 && (
              <span className="absolute top-5 right-5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/20 shadow-2xs z-10">
                {currentImageIndex + 1} / {product.gallery.length}
              </span>
            )}

            {/* Prev / Next Arrows */}
            {product.gallery && product.gallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePrevImage()
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 z-20 opacity-80 group-hover:opacity-100"
                  title="Foto anterior"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleNextImage()
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 z-20 opacity-80 group-hover:opacity-100"
                  title="Siguiente foto"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
              </>
            )}
          </div>

          {/* Interactive Thumbnails Selector */}
          {product.gallery && product.gallery.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 px-1 scrollbar-thin">
              {product.gallery.map((img, idx) => {
                const isSelected = (selectedImage || product.image) === img
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-20 h-20 rounded-2xl p-1.5 transition-all cursor-pointer shrink-0 border-2 overflow-hidden flex items-center justify-center bg-white/50 dark:bg-white/5 ${
                      isSelected
                        ? 'border-[#FF4D4F] ring-4 ring-[#FF4D4F]/20 scale-105 shadow-md shadow-[#FF4D4F]/20'
                        : 'border-white/60 dark:border-white/10 hover:border-white/90 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.title} vista ${idx + 1}`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/hero-perfumes/odyssey-aqua.png'
                      }}
                      className="w-full h-full object-contain rounded-xl"
                    />
                    {isSelected && (
                      <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-[#FF4D4F] shadow-xs" />
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Column: Information, Variants & Actions */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Header info */}
          <div className="space-y-2">
            <span className="text-xs text-[#5b403e] dark:text-[#9ca3af] font-bold uppercase tracking-widest block">
              Lumina • {product.category}
            </span>
            <h1 className={`text-3xl md:text-4xl font-bold tracking-tight ${isOutOfStock ? 'text-gray-400 line-through decoration-red-500/70' : 'text-[#1b1c1c] dark:text-[#f9fafb]'}`}>
              {product.title}
            </h1>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-2 text-xs text-[#5b403e] dark:text-[#9ca3af] pt-1">
              <div className="flex items-center text-[#FF4D4F]">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className="material-symbols-outlined text-[16px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                ))}
              </div>
              <span className="font-bold text-[#1b1c1c] dark:text-[#f9fafb]">{product.rating}</span>
              <span>•</span>
              <span className="text-[#5b403e] dark:text-[#9ca3af] font-medium">{product.reviewsCount} valoraciones verificadas</span>
            </div>
          </div>

          {/* Price Tag with Clean Formatting */}
          <div className="flex items-baseline gap-3">
            <span className={`text-3xl font-extrabold ${isOutOfStock ? 'text-gray-400 line-through decoration-red-500/80' : 'text-[#1b1c1c] dark:text-[#f9fafb]'}`}>
              ${Math.round(product.price).toLocaleString('es-AR')} ARS
            </span>
            {isOutOfStock ? (
              <span className="text-xs font-bold text-red-500 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Sin Stock (Agotado)
              </span>
            ) : (
              product.originalPrice && product.originalPrice > product.price && (
                <span className="text-base line-through text-[#5b403e] dark:text-[#9ca3af]">
                  ${Math.round(product.originalPrice).toLocaleString('es-AR')} ARS
                </span>
              )
            )}
            {!isOutOfStock && product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs font-bold text-[#FF4D4F] bg-[#ffdad7]/60 dark:bg-[#FF4D4F]/20 px-2 py-0.5 rounded-full">
                Ahorras ${Math.round(product.originalPrice - product.price).toLocaleString('es-AR')}
              </span>
            )}
          </div>

          {/* Short Description */}
          <p className="text-xs md:text-sm text-[#5b403e] dark:text-[#9ca3af] leading-relaxed">
            {product.description}
          </p>

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2.5 pt-2 border-t border-white/60 dark:border-white/10">
              <span className="text-xs font-bold text-[#1b1c1c] dark:text-[#f9fafb] block">
                Variante seleccionada: <span className="text-[#FF4D4F]">{selectedVariant}</span>
              </span>
              <div className="flex flex-wrap items-center gap-2.5">
                {product.variants.map((variant) => {
                  const isSelected = selectedVariant === variant.name
                  return (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant.name)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white dark:bg-[#181c26] text-[#1b1c1c] dark:text-[#f9fafb] shadow-xs border-2 border-[#FF4D4F]'
                          : 'bg-white/50 dark:bg-white/5 text-[#5b403e] dark:text-[#9ca3af] border border-white/70 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full ${variant.colorClass} border border-white dark:border-white/10 shadow-2xs`}></span>
                      <span>{variant.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Quantity Selector & Add to Cart Action */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3">
              {/* Stepper */}
              <div className="flex items-center border border-white/80 dark:border-white/10 bg-white/70 dark:bg-white/5 rounded-full px-3 py-1.5 shadow-2xs shrink-0">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-[#5b403e] dark:text-[#9ca3af] hover:text-[#FF4D4F] p-1 cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">remove</span>
                </button>
                <span className="text-xs font-bold min-w-[28px] text-center text-[#1b1c1c] dark:text-[#f9fafb]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="text-[#5b403e] dark:text-[#9ca3af] hover:text-[#FF4D4F] p-1 cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                </button>
              </div>

              {/* Add to Cart CTA */}
              <button
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className={`flex-1 py-3.5 px-4 sm:px-6 rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all ${
                  isOutOfStock
                    ? 'bg-neutral-800 text-neutral-400 border border-neutral-700/80 cursor-not-allowed shadow-none'
                    : 'btn-primary cursor-pointer'
                }`}
              >
                <span className={isOutOfStock ? 'line-through decoration-red-400' : ''}>
                  {isOutOfStock ? 'Sin Stock' : isAdded ? '¡Añadido!' : 'Añadir al Carrito'}
                </span>
                <span className={`material-symbols-outlined text-[18px] ${isOutOfStock ? 'text-red-400' : ''}`}>
                  {isOutOfStock ? 'do_not_disturb_on' : 'shopping_bag'}
                </span>
              </button>
            </div>

            {/* Value Props Pill Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs text-[#5b403e] dark:text-[#9ca3af] pt-2 sm:pt-3">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10">
                <span className="material-symbols-outlined text-[#FF4D4F] text-[18px]">local_shipping</span>
                <span>Envío express asegurado</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10">
                <span className="material-symbols-outlined text-[#FF4D4F] text-[18px]">verified</span>
                <span>Garantía oficial de 1 año</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Cards */}
      {product.detailsCards && (
        <div className="space-y-6 pt-6">
          <h2 className="text-xl font-bold text-[#1b1c1c] dark:text-[#f9fafb] tracking-tight">
            Detalles del Producto
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {product.detailsCards.map((card, idx) => (
              <div
                key={idx}
                className="glass-card rounded-2xl p-6 space-y-3 border border-white/70 dark:border-white/10 shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-[#ffdad7]/50 dark:bg-[#FF4D4F]/20 flex items-center justify-center text-[#FF4D4F]">
                  <span className="material-symbols-outlined text-[22px]">{card.icon}</span>
                </div>
                <h3 className="font-bold text-sm text-[#1b1c1c] dark:text-[#f9fafb]">{card.title}</h3>
                <p className="text-xs text-[#5b403e] dark:text-[#9ca3af] leading-relaxed">{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended / Complete the Look Section */}
      {recommended.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-white/60 dark:border-white/10">
          <h2 className="text-xl font-bold text-[#1b1c1c] dark:text-[#f9fafb] tracking-tight">
            Productos Recomendados
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {recommended.map((item) => (
              <div
                key={item.id}
                onClick={() => onProductClick(item.id)}
                className="glass-card rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer border border-white/70 dark:border-white/10 group"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-16 h-16 object-contain rounded-xl group-hover:scale-105 transition-transform bg-white/70 dark:bg-white/10 p-1 mix-blend-multiply dark:mix-blend-normal border border-white dark:border-white/10"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-[#5b403e] dark:text-[#9ca3af] uppercase font-bold tracking-wider">
                    {item.category_name || 'Lumina'}
                  </span>
                  <h4 className="text-xs font-bold text-[#1b1c1c] dark:text-[#f9fafb] truncate">{item.title}</h4>
                  <span className="text-xs font-bold text-[#FF4D4F]">${item.price.toFixed(2)} ARS</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
