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
          const mapped: Product = {
            id: currentProd.id,
            title: currentProd.title,
            subtitle: currentProd.subtitle || '',
            category: currentProd.category_name || 'Electrónica',
            categorySlug: (currentProd.category_slug || 'electronics') as any,
            price: currentProd.price,
            originalPrice: currentProd.original_price,
            rating: currentProd.rating || 5.0,
            reviewsCount: currentProd.reviews_count || 12,
            stock: currentProd.stock,
            image: currentProd.image,
            gallery: [currentProd.image],
            tags: ['Garantía Oficial', 'Original'],
            description: currentProd.description,
            variants: [
              { id: 'v1', name: 'Estándar', colorClass: 'bg-[#1b1c1c]' },
              { id: 'v2', name: 'Edición Premium', colorClass: 'bg-[#FF4D4F]' },
            ],
            specs: [
              { label: 'Garantía', value: '1 Año Oficial' },
              { label: 'Disponibilidad', value: `${currentProd.stock} unidades en stock` },
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
          setSelectedImage(mapped.gallery[0] || mapped.image)
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

  return (
    <motion.div
      key={product.id}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-12 font-body text-[#1b1c1c]"
    >
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-[#5b403e]">
        <button onClick={onBack} className="hover:text-[#FF4D4F] transition-colors cursor-pointer font-medium">
          Inicio
        </button>
        <span>/</span>
        <span className="capitalize">{product.category}</span>
        <span>/</span>
        <span className="text-[#1b1c1c] font-semibold">{product.title}</span>
      </div>

      {/* Main Two-Column Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Gallery */}
        <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
          {/* Thumbnails list */}
          {product.gallery && product.gallery.length > 1 && (
            <div className="flex md:flex-col gap-3 overflow-x-auto pb-2 md:pb-0">
              {product.gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-18 h-18 rounded-2xl p-1.5 glass-card border transition-all cursor-pointer shrink-0 ${
                    selectedImage === img
                      ? 'border-[#FF4D4F] ring-2 ring-[#FF4D4F]/30 bg-white'
                      : 'border-white/60 hover:bg-white/60'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.title} view ${idx}`}
                    className="w-full h-full object-contain rounded-xl"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main Selected Image Stage */}
          <div className="flex-1 aspect-[4/3] md:aspect-square rounded-3xl glass-panel p-6 flex items-center justify-center relative overflow-hidden border border-white/70 shadow-sm bg-white/40">
            <img
              src={selectedImage || product.image}
              alt={product.title}
              className="max-h-full max-w-full object-contain rounded-2xl transition-all duration-300 mix-blend-multiply"
            />
            {product.tags?.[0] && (
              <span className="absolute top-5 left-5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/85 text-[#FF4D4F] border border-white shadow-2xs">
                {product.tags[0]}
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Information, Variants & Actions */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Header info */}
          <div className="space-y-2">
            <span className="text-xs text-[#5b403e] font-bold uppercase tracking-widest block">
              Lumina • {product.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1b1c1c]">
              {product.title}
            </h1>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-2 text-xs text-[#5b403e] pt-1">
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
              <span className="font-bold text-[#1b1c1c]">{product.rating}</span>
              <span>•</span>
              <span className="text-[#5b403e] font-medium">{product.reviewsCount} valoraciones verificadas</span>
            </div>
          </div>

          {/* Price Tag */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-[#1b1c1c]">
              ${product.price.toFixed(2)} ARS
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-base line-through text-[#5b403e]">
                ${product.originalPrice.toFixed(2)} ARS
              </span>
            )}
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs font-bold text-[#FF4D4F] bg-[#ffdad7]/60 px-2 py-0.5 rounded-full">
                Ahorras ${(product.originalPrice - product.price).toFixed(2)}
              </span>
            )}
          </div>

          {/* Short Description */}
          <p className="text-xs md:text-sm text-[#5b403e] leading-relaxed">
            {product.description}
          </p>

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2.5 pt-2 border-t border-white/60">
              <span className="text-xs font-bold text-[#1b1c1c] block">
                Variante seleccionada: <span className="text-[#FF4D4F]">{selectedVariant}</span>
              </span>
              <div className="flex items-center gap-2.5">
                {product.variants.map((variant) => {
                  const isSelected = selectedVariant === variant.name
                  return (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant.name)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white text-[#1b1c1c] shadow-xs border-2 border-[#FF4D4F]'
                          : 'bg-white/50 text-[#5b403e] border border-white/70 hover:bg-white/80'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full ${variant.colorClass} border border-white shadow-2xs`}></span>
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
              <div className="flex items-center border border-white/80 bg-white/70 rounded-full px-3 py-1.5 shadow-2xs">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-[#5b403e] hover:text-[#FF4D4F] p-1 cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">remove</span>
                </button>
                <span className="text-xs font-bold min-w-[28px] text-center text-[#1b1c1c]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="text-[#5b403e] hover:text-[#FF4D4F] p-1 cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                </button>
              </div>

              {/* Add to Cart CTA */}
              <button
                onClick={handleAddToCart}
                className="flex-1 btn-primary py-3.5 px-6 rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>{isAdded ? '¡Añadido al Carrito!' : 'Añadir al Carrito'}</span>
                <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
              </button>
            </div>

            {/* Value Props Pill Row */}
            <div className="grid grid-cols-2 gap-3 text-xs text-[#5b403e] pt-3">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/40 border border-white/60">
                <span className="material-symbols-outlined text-[#FF4D4F] text-[18px]">local_shipping</span>
                <span>Envío express asegurado</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/40 border border-white/60">
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
          <h2 className="text-xl font-bold text-[#1b1c1c] tracking-tight">
            Detalles del Producto
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {product.detailsCards.map((card, idx) => (
              <div
                key={idx}
                className="glass-card rounded-2xl p-6 space-y-3 border border-white/70 shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-[#ffdad7]/50 flex items-center justify-center text-[#FF4D4F]">
                  <span className="material-symbols-outlined text-[22px]">{card.icon}</span>
                </div>
                <h3 className="font-bold text-sm text-[#1b1c1c]">{card.title}</h3>
                <p className="text-xs text-[#5b403e] leading-relaxed">{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended / Complete the Look Section */}
      {recommended.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-white/60">
          <h2 className="text-xl font-bold text-[#1b1c1c] tracking-tight">
            Productos Recomendados
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {recommended.map((item) => (
              <div
                key={item.id}
                onClick={() => onProductClick(item.id)}
                className="glass-card rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer border border-white/70 group"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-16 h-16 object-contain rounded-xl group-hover:scale-105 transition-transform bg-white/70 p-1 mix-blend-multiply"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-[#5b403e] uppercase font-bold tracking-wider">
                    {item.category_name || 'Lumina'}
                  </span>
                  <h4 className="text-xs font-bold text-[#1b1c1c] truncate">{item.title}</h4>
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
