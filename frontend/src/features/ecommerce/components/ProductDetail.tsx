import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()
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
                text: 'Construido bajo los más altos estándares de calidad y durabilidad Fórmula 1370.',
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
      <div className="py-24 text-center text-xs text-[#55575a] bg-white rounded-2xl border-2 border-[#121314] neo-box-shadow font-dm">
        <div className="w-10 h-10 border-4 border-[#121314] border-t-[#0ffcbe] rounded-full animate-spin mx-auto mb-3"></div>
        <span className="font-bold text-sm">Cargando detalles de la fragancia...</span>
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
      className="space-y-12 font-dm text-[#121314]"
    >
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-dm font-bold text-[#55575a]">
        <button
          onClick={onBack}
          className="hover:text-[#121314] hover:underline transition cursor-pointer flex items-center gap-1"
        >
          <span>←</span>
          <span>Volver al Catálogo</span>
        </button>
        <span>/</span>
        <span className="capitalize">{product.category}</span>
        <span>/</span>
        <span className="text-[#121314] font-black uppercase tracking-wider">{product.title}</span>
      </div>

      {/* Main Two-Column Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Multi-Photo Gallery Stage */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Main Selected Image Stage */}
          <div className="relative aspect-square sm:aspect-[4/3] lg:aspect-square w-full rounded-2xl bg-white border-2 border-[#121314] neo-box-shadow p-8 flex items-center justify-center overflow-hidden group">
            {isOutOfStock && (
              <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                <span className="px-5 py-2 rounded-xl bg-[#121314] border-2 border-[#121314] text-white font-dm font-black tracking-widest text-xs uppercase neo-box-shadow">
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
                ;(e.target as HTMLImageElement).src = '/hero-perfumes/odyssey-aqua.png'
              }}
              className={`max-h-full max-w-full object-contain rounded-xl select-none filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.18)] transition-transform duration-300 group-hover:scale-105 ${
                isOutOfStock ? 'opacity-60 grayscale-[35%]' : ''
              }`}
            />

            {/* Official Guarantee Badge */}
            <span className="absolute top-5 left-5 px-3.5 py-1.5 rounded-full text-[10px] font-dm font-black uppercase tracking-wider bg-[#ff78ac] text-[#121314] border-2 border-[#121314] neo-box-shadow-sm z-10">
              {product.tags?.[0] || 'Garantía Oficial'}
            </span>

            {/* Photo Counter Badge */}
            {product.gallery && product.gallery.length > 1 && (
              <span className="absolute top-5 right-5 px-3 py-1 rounded-full text-[10px] font-dm font-black uppercase tracking-wider bg-white text-[#121314] border-2 border-[#121314] neo-box-shadow-sm z-10">
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
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white hover:bg-[#f2f0ea] text-[#121314] border-2 border-[#121314] neo-box-shadow-sm flex items-center justify-center transition-all cursor-pointer z-20"
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white hover:bg-[#f2f0ea] text-[#121314] border-2 border-[#121314] neo-box-shadow-sm flex items-center justify-center transition-all cursor-pointer z-20"
                  title="Siguiente foto"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
              </>
            )}

            {/* Direct Floating 3D Badge on Image */}
            <button
              type="button"
              onClick={() => navigate(`/hero-3d?product=${product.id}`)}
              className="absolute bottom-5 right-5 z-20 px-4 py-2 rounded-xl bg-[#0ffcbe] hover:bg-[#00eaad] text-[#121314] text-xs font-dm font-black uppercase tracking-wider border-2 border-[#121314] neo-box-shadow-sm flex items-center gap-2 transition-all cursor-pointer active:scale-95"
              title="Ver perfume en Showcase 3D interactivo"
            >
              <span className="material-symbols-outlined text-[16px]">view_in_ar</span>
              <span>Showcase 3D</span>
              <span className="w-2 h-2 rounded-full bg-[#121314] animate-pulse" />
            </button>
          </div>

          {/* Interactive Thumbnails Selector */}
          {product.gallery && product.gallery.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 px-1">
              {product.gallery.map((img, idx) => {
                const isSelected = (selectedImage || product.image) === img
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-20 h-20 rounded-xl p-1.5 transition-all cursor-pointer shrink-0 border-2 overflow-hidden flex items-center justify-center ${
                      isSelected
                        ? 'bg-[#a8d5e3] border-[#121314] neo-box-shadow-sm scale-105'
                        : 'bg-white border-[#121314]/30 hover:border-[#121314]'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.title} vista ${idx + 1}`}
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src = '/hero-perfumes/odyssey-aqua.png'
                      }}
                      className="w-full h-full object-contain rounded-lg"
                    />
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
            <span className="text-xs font-dm font-black uppercase tracking-wider text-[#106ebe] block">
              Fórmula 1370 • {product.category}
            </span>
            <h1
              className={`text-3xl sm:text-5xl font-dm font-black tracking-tight uppercase leading-none ${
                isOutOfStock ? 'text-gray-400 line-through' : 'text-[#121314]'
              }`}
            >
              {product.title}
            </h1>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-2 text-xs font-dm font-bold text-[#55575a] pt-1">
              <div className="flex items-center text-[#f59e0b]">
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
              <span className="font-black text-[#121314]">{product.rating}</span>
              <span>•</span>
              <span className="font-semibold">{product.reviewsCount} valoraciones verificadas</span>
            </div>
          </div>

          {/* Price Tag with Neo-Editorial Styling */}
          <div className="space-y-2">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span
                className={`text-3xl sm:text-4xl font-dm font-black tracking-tight ${
                  isOutOfStock ? 'text-gray-400 line-through' : 'text-[#121314]'
                }`}
              >
                ${Math.round(product.price).toLocaleString('es-AR')} ARS
              </span>
              {isOutOfStock ? (
                <span className="text-xs font-dm font-black text-white bg-[#121314] px-3 py-1 rounded-md uppercase tracking-wider">
                  Sin Stock
                </span>
              ) : (
                product.originalPrice &&
                product.originalPrice > product.price && (
                  <span className="text-base line-through text-[#85888d] font-dm font-bold">
                    ${Math.round(product.originalPrice).toLocaleString('es-AR')} ARS
                  </span>
                )
              )}
            </div>

            {/* Installments Pill */}
            {!isOutOfStock && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#a8d5e3] border-2 border-[#121314] text-xs font-dm font-black text-[#121314] neo-box-shadow-sm">
                <span>💳</span>
                <span>Hasta 6 cuotas fijas sin interés</span>
              </div>
            )}
          </div>

          {/* Short Description */}
          <p className="text-sm text-[#444648] font-dm font-medium leading-relaxed">
            {product.description}
          </p>

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2.5 pt-2 border-t-2 border-[#121314]/15">
              <span className="text-xs font-dm font-black text-[#121314] uppercase tracking-wider block">
                Variante seleccionada: <span className="text-[#106ebe]">{selectedVariant}</span>
              </span>
              <div className="flex flex-wrap items-center gap-2.5">
                {product.variants.map((variant) => {
                  const isSelected = selectedVariant === variant.name
                  return (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant.name)}
                      className={`px-4 py-2 rounded-xl text-xs font-dm font-black flex items-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#ff78ac] text-[#121314] border-2 border-[#121314] neo-box-shadow-sm'
                          : 'bg-white text-[#55575a] border-2 border-[#121314]/30 hover:border-[#121314] hover:text-[#121314]'
                      }`}
                    >
                      <span
                        className={`w-3.5 h-3.5 rounded-full ${variant.colorClass} border border-[#121314]`}
                      />
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
              <div className="flex items-center border-2 border-[#121314] bg-white rounded-xl px-2 py-1 neo-box-shadow-sm shrink-0">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg font-dm font-black text-base flex items-center justify-center hover:bg-[#f2f0ea] text-[#121314] cursor-pointer transition"
                >
                  -
                </button>
                <span className="text-sm font-dm font-black min-w-[32px] text-center text-[#121314]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-lg font-dm font-black text-base flex items-center justify-center hover:bg-[#f2f0ea] text-[#121314] cursor-pointer transition"
                >
                  +
                </button>
              </div>

              {/* Add to Cart CTA */}
              <button
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className={`flex-1 py-4 px-6 rounded-xl font-dm font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  isOutOfStock
                    ? 'bg-gray-200 text-gray-400 border-2 border-gray-300 cursor-not-allowed shadow-none'
                    : 'bg-[#0ffcbe] hover:bg-[#00eaad] text-[#121314] border-2 border-[#121314] neo-box-shadow neo-box-shadow-hover neo-box-shadow-active cursor-pointer'
                }`}
              >
                <span>
                  {isOutOfStock ? 'Sin Stock' : isAdded ? '¡Añadido!' : 'Añadir al Carrito'}
                </span>
                <span className="material-symbols-outlined text-[18px]">
                  {isOutOfStock ? 'do_not_disturb_on' : 'shopping_bag'}
                </span>
              </button>
            </div>

            {/* Dedicated Action Button: View in 3D Showcase */}
            <button
              type="button"
              onClick={() => navigate(`/hero-3d?product=${product.id}`)}
              className="w-full py-3.5 px-6 rounded-xl font-dm font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all border-2 border-[#121314] bg-white hover:bg-[#f2f0ea] text-[#121314] neo-box-shadow-sm neo-box-shadow-hover cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">view_in_ar</span>
              <span>Ver en Showcase 3D</span>
              <span className="w-2 h-2 rounded-full bg-[#0ffcbe] border border-[#121314] animate-pulse"></span>
            </button>

            {/* Value Props Pill Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-dm font-bold text-[#121314] pt-2">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-white border-2 border-[#121314] neo-box-shadow-sm">
                <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                <span>Envío express asegurado</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-white border-2 border-[#121314] neo-box-shadow-sm">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>Garantía oficial y batch code</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Cards */}
      {product.detailsCards && (
        <div className="space-y-6 pt-6 border-t-2 border-[#121314]/15">
          <h2 className="text-2xl font-dm font-black text-[#121314] uppercase tracking-tight">
            Detalles del Producto
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {product.detailsCards.map((card, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 space-y-3 border-2 border-[#121314] neo-box-shadow"
              >
                <div className="w-10 h-10 rounded-xl bg-[#a8d5e3] border-2 border-[#121314] flex items-center justify-center text-[#121314] font-black neo-box-shadow-sm">
                  <span className="material-symbols-outlined text-[22px]">{card.icon}</span>
                </div>
                <h3 className="font-dm font-black text-base text-[#121314] uppercase">{card.title}</h3>
                <p className="text-xs text-[#55575a] font-dm font-medium leading-relaxed">{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Products Section */}
      {recommended.length > 0 && (
        <div className="space-y-6 pt-6 border-t-2 border-[#121314]/15">
          <h2 className="text-2xl font-dm font-black text-[#121314] uppercase tracking-tight">
            Fragancias Relacionadas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {recommended.map((item) => (
              <div
                key={item.id}
                onClick={() => onProductClick(item.id)}
                className="bg-white rounded-2xl p-4 flex items-center gap-4 hover:-translate-y-1 transition-all cursor-pointer border-2 border-[#121314] neo-box-shadow group"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-16 h-16 object-contain rounded-xl group-hover:scale-105 transition-transform bg-[#f6f4ee] p-1 border border-[#121314]/20"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-[#106ebe] uppercase font-dm font-black tracking-wider">
                    {item.category_name || 'Fórmula 1370'}
                  </span>
                  <h4 className="text-sm font-dm font-black text-[#121314] uppercase truncate">{item.title}</h4>
                  <span className="text-xs font-dm font-black text-[#121314]">${item.price.toLocaleString('es-AR')} ARS</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
