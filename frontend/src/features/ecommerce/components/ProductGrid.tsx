import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { Product } from '../data/productsData'
import { PRODUCTS } from '../data/productsData'
import { productsApi } from '../../../api/productsApi'
import { useCartStore } from '../../../store/useCartStore'

interface ProductGridProps {
  selectedCategorySlug: string
  onProductClick: (id: string) => void
  onViewAll?: () => void
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  selectedCategorySlug,
  onProductClick,
  onViewAll,
}) => {
  const { addItem, openDrawer } = useCartStore()
  const [productList, setProductList] = useState<Product[]>(PRODUCTS)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productsApi.getProducts(selectedCategorySlug)
        if (res.products && res.products.length > 0) {
          const mapped: Product[] = res.products.map((p: any) => ({
            id: p.id,
            title: p.title,
            subtitle: p.subtitle || '',
            category: p.category_name || 'Electrónica',
            categorySlug: ((p.category_name?.toLowerCase().includes('moda') ? 'fashion' : 'electronics') as any),
            price: p.price,
            originalPrice: p.original_price,
            rating: p.rating || 5.0,
            reviewsCount: p.reviews_count || 0,
            stock: p.stock,
            image: p.image,
            gallery: [p.image],
            tags: ['Nuevo'],
            description: p.description,
            variants: [{ id: 'std', name: 'Estándar', colorClass: 'bg-[#1b1c1c]' }],
            specs: [{ label: 'Garantía', value: '1 Año' }],
          }))
          setProductList(mapped)
        }
      } catch (e) {
        // Fallback to static mock products
      }
    }
    fetchProducts()
  }, [selectedCategorySlug])

  const displayedProducts = productList.filter((p) => {
    if (selectedCategorySlug === 'all') return true
    return p.categorySlug === selectedCategorySlug || p.category.toLowerCase().includes(selectedCategorySlug.toLowerCase())
  })

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation()
    const defaultVariant = product.variants?.[0]?.name || 'Estándar'
    addItem({ ...product, variant: defaultVariant }, 1)
    openDrawer()
  }

  return (
    <section className="space-y-6 font-body text-[#1b1c1c]">
      {/* Section Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#1b1c1c]">
            {selectedCategorySlug === 'all' ? 'Tendencias de Temporada' : 'Catálogo de Productos'}
          </h2>
          <p className="text-xs md:text-sm text-[#5b403e] mt-1">
            Selección exclusiva y piezas de diseño con garantía oficial.
          </p>
        </div>

        {selectedCategorySlug !== 'all' && onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-bold text-[#FF4D4F] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Ver Todo el Catálogo</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        )}
      </div>

      {/* Grid of Cards */}
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
    </section>
  )
}
