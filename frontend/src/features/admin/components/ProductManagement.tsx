import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Product } from '../../ecommerce/data/productsData'
import { PRODUCTS, CATEGORIES } from '../../ecommerce/data/productsData'
import { productsApi } from '../../../api/productsApi'

export const ProductManagement: React.FC = () => {
  const [productList, setProductList] = useState<Product[]>(PRODUCTS)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  useEffect(() => {
    const fetchLiveProducts = async () => {
      try {
        const res = await productsApi.getProducts()
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
        // fallback to mock products
      }
    }
    fetchLiveProducts()
  }, [])

  // Form states for new/edit product
  const [formTitle, setFormTitle] = useState('')
  const [formCategory, setFormCategory] = useState('Electrónica')
  const [formPrice, setFormPrice] = useState('199.00')
  const [formStock, setFormStock] = useState('20')
  const [formDesc, setFormDesc] = useState('')
  const [formImage, setFormImage] = useState('')

  const filtered = productList.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCat = selectedCategory === 'all' || p.categorySlug === selectedCategory
    return matchesSearch && matchesCat
  })

  const handleOpenAdd = () => {
    setEditingProduct(null)
    setFormTitle('')
    setFormCategory('Electrónica')
    setFormPrice('')
    setFormStock('15')
    setFormDesc('')
    setFormImage('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product)
    setFormTitle(product.title)
    setFormCategory(product.category)
    setFormPrice(product.price.toString())
    setFormStock(product.stock.toString())
    setFormDesc(product.description)
    setFormImage(product.image)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    setProductList(prev => prev.filter(p => p.id !== id))
    try {
      await productsApi.deleteProduct(id)
    } catch (e) {
      // Handled
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const targetSlug = (formCategory.toLowerCase().includes('moda') ? 'fashion' : 'electronics') as any
    if (editingProduct) {
      setProductList(prev => prev.map(p => p.id === editingProduct.id ? {
        ...p,
        title: formTitle,
        category: formCategory,
        categorySlug: targetSlug,
        price: parseFloat(formPrice) || p.price,
        stock: parseInt(formStock, 10) || p.stock,
        description: formDesc,
        image: formImage || p.image,
      } : p))

      try {
        await productsApi.updateProduct(editingProduct.id, {
          title: formTitle,
          category_name: formCategory,
          price: parseFloat(formPrice) || editingProduct.price,
          stock: parseInt(formStock, 10) || editingProduct.stock,
          description: formDesc,
          image: formImage || editingProduct.image,
        })
      } catch (e) {
        // Handled
      }
    } else {
      const newP: Product = {
        id: 'prod-' + Date.now(),
        title: formTitle,
        subtitle: 'Nuevo Ingreso',
        category: formCategory,
        categorySlug: targetSlug,
        price: parseFloat(formPrice) || 99,
        rating: 5.0,
        reviewsCount: 0,
        image: formImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
        gallery: [formImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'],
        tags: ['Nuevo'],
        description: formDesc || 'Producto de alta gama diseñado para un rendimiento óptimo.',
        stock: parseInt(formStock, 10) || 10,
        variants: [{ id: 'std', name: 'Estándar', colorClass: 'bg-[#1b1c1c]' }],
        specs: [{ label: 'Garantía', value: '1 Año' }],
      }
      setProductList(prev => [newP, ...prev])

      try {
        await productsApi.createProduct({
          title: formTitle,
          category_name: formCategory,
          price: parseFloat(formPrice) || 99,
          stock: parseInt(formStock, 10) || 10,
          description: formDesc || 'Producto nuevo',
          image: formImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
        })
      } catch (e) {
        // Handled
      }
    }
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-6 font-body text-[#1b1c1c]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1b1c1c] tracking-tight">Gestión de Productos</h1>
          <p className="text-xs sm:text-sm text-[#5b403e] mt-0.5">
            Administra el catálogo de la tienda, existencias y precios.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn-primary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Añadir Producto</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between glass-panel p-3.5 rounded-2xl border border-white/70 shadow-xs">
        <div className="relative w-full sm:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#5b403e] text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar productos por nombre o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/70 border border-white/80 rounded-xl py-2 pl-9 pr-4 text-xs text-[#1b1c1c] placeholder:text-[#5b403e]/70 outline-none focus:border-[#FF4D4F]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-[#5b403e] font-semibold whitespace-nowrap">Categoría:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white/70 border border-white/80 rounded-xl px-3 py-2 text-xs text-[#1b1c1c] outline-none cursor-pointer focus:border-[#FF4D4F]"
          >
            <option value="all">Todas las Categorías</option>
            {CATEGORIES.filter(c => c.slug !== 'all').map(c => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Table Card */}
      <div className="glass-panel rounded-2xl p-6 border border-white/70 shadow-sm space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/60 text-[#5b403e]">
                <th className="pb-3 font-semibold">Producto</th>
                <th className="pb-3 font-semibold">Categoría</th>
                <th className="pb-3 font-semibold">Precio</th>
                <th className="pb-3 font-semibold">Stock</th>
                <th className="pb-3 font-semibold">Estado</th>
                <th className="pb-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/50">
              {filtered.map((p) => {
                const stockStatus = p.stock > 10 ? 'En Stock' : p.stock > 0 ? 'Poco Stock' : 'Sin Stock'
                const badgeColor = p.stock > 10 
                  ? 'bg-[#E8F8F0] text-[#1E824C]' 
                  : p.stock > 0 
                  ? 'bg-[#ffdad7]/60 text-[#FF4D4F]' 
                  : 'bg-[#ffdad6] text-[#ba1a1a]'

                return (
                  <tr key={p.id} className="hover:bg-white/40 transition-colors">
                    {/* Product Name & Image */}
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.title}
                          className="w-11 h-11 rounded-xl object-contain bg-white/70 p-1 border border-white shrink-0 mix-blend-multiply"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-[#1b1c1c] text-xs truncate max-w-[200px]">{p.title}</p>
                          <p className="text-[11px] text-[#5b403e] truncate max-w-[200px]">{p.subtitle}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 text-[#5b403e] font-medium">{p.category}</td>

                    {/* Price */}
                    <td className="py-3 font-bold text-[#1b1c1c]">${p.price.toFixed(2)}</td>

                    {/* Stock Count */}
                    <td className="py-3 font-semibold text-[#1b1c1c]">{p.stock} unidades</td>

                    {/* Stock Status Badge */}
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${badgeColor}`}>
                        {stockStatus}
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 rounded-lg text-[#5b403e] hover:text-[#FF4D4F] hover:bg-white transition-colors cursor-pointer"
                          title="Editar producto"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 rounded-lg text-[#5b403e] hover:text-[#ba1a1a] hover:bg-white transition-colors cursor-pointer"
                          title="Eliminar producto"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="flex justify-between items-center text-xs text-[#5b403e] pt-3 border-t border-white/60">
          <span>Mostrando {filtered.length} de {productList.length} productos</span>
          <span className="font-semibold text-[#1b1c1c]">Catálogo Lumina</span>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-[#1b1c1c]/30 backdrop-blur-xs cursor-pointer"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-[#fbf9f8] glass-panel rounded-3xl p-7 shadow-2xl border border-white/80 space-y-5 z-10"
            >
              <div className="flex justify-between items-center border-b border-white/60 pb-3">
                <h3 className="text-lg font-bold text-[#1b1c1c]">
                  {editingProduct ? 'Editar Producto' : 'Añadir Nuevo Producto'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-[#5b403e] hover:text-[#1b1c1c] rounded-lg cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-[#5b403e] block mb-1">Título del Producto</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs outline-none"
                    placeholder="ej. Auriculares Lumina Pro"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#5b403e] block mb-1">Categoría</label>
                    <input
                      type="text"
                      required
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs outline-none"
                      placeholder="ej. Electrónica"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#5b403e] block mb-1">Precio ($ USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      className="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs outline-none"
                      placeholder="189.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#5b403e] block mb-1">Cantidad en Stock</label>
                    <input
                      type="number"
                      required
                      value={formStock}
                      onChange={(e) => setFormStock(e.target.value)}
                      className="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs outline-none"
                      placeholder="25"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#5b403e] block mb-1">URL de Imagen</label>
                    <input
                      type="text"
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      className="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs outline-none"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#5b403e] block mb-1">Descripción Detallada</label>
                  <textarea
                    rows={3}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="glass-input w-full px-3.5 py-2 rounded-xl text-xs outline-none"
                    placeholder="Describe las características y materiales del producto..."
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-white/60">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl glass-button-secondary font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary px-5 py-2.5 rounded-xl font-bold cursor-pointer shadow-md"
                  >
                    Guardar Producto
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
