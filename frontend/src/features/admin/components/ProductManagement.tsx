import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { productsApi, type BackendProductDTO } from '../../../api/productsApi'
import { categoriesApi, type BackendCategoryDTO } from '../../../api/categoriesApi'
import { storageApi } from '../../../api/storageApi'

export const ProductManagement: React.FC = () => {
  const [productList, setProductList] = useState<BackendProductDTO[]>([])
  const [categories, setCategories] = useState<BackendCategoryDTO[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState<boolean>(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<BackendProductDTO | null>(null)

  // Form states for new/edit product
  const [formTitle, setFormTitle] = useState('')
  const [formCategory, setFormCategory] = useState('')
  const [formPrice, setFormPrice] = useState('')
  const [formStock, setFormStock] = useState('20')
  const [formDesc, setFormDesc] = useState('')
  const [formImage, setFormImage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadError(null)
    try {
      const publicUrl = await storageApi.uploadProductImage(file)
      setFormImage(publicUrl)
    } catch (err: any) {
      console.warn('Storage upload notice:', err)
      // Read as base64 preview as resilient fallback
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormImage(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    } finally {
      setUploading(false)
    }
  }

  const fetchCatalog = async () => {
    setLoading(true)
    try {
      const [prodRes, catRes] = await Promise.all([
        productsApi.getProducts('all'),
        categoriesApi.getCategories(),
      ])

      if (prodRes.products) {
        setProductList(prodRes.products)
      }
      if (catRes.categories) {
        setCategories(catRes.categories)
      }
    } catch (e) {
      // Handled
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCatalog()
  }, [])

  const filtered = productList.filter((p) => {
    const matchesSearch =
      (p.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.category_name || '').toLowerCase().includes(searchTerm.toLowerCase())

    const pSlug = (p.category_slug || p.category_name || '').toLowerCase()
    const matchesCat =
      selectedCategory === 'all' ||
      pSlug === selectedCategory.toLowerCase() ||
      pSlug.includes(selectedCategory.toLowerCase())

    return matchesSearch && matchesCat
  })

  const handleOpenAdd = () => {
    setEditingProduct(null)
    setFormTitle('')
    setFormCategory(categories[0]?.name || 'Perfumes')
    setFormPrice('45000.00')
    setFormStock('15')
    setFormDesc('')
    setFormImage('')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (product: BackendProductDTO) => {
    setEditingProduct(product)
    setFormTitle(product.title)
    setFormCategory(product.category_name || 'Perfumes')
    setFormPrice(product.price.toString())
    setFormStock(product.stock.toString())
    setFormDesc(product.description || '')
    setFormImage(product.image || '')
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar el producto "${title}"?`)) {
      setProductList((prev) => prev.filter((p) => p.id !== id))
      await productsApi.deleteProduct(id)
      fetchCatalog()
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim()) return

    const priceNum = parseFloat(formPrice) || 0
    const stockNum = parseInt(formStock, 10) || 0

    if (editingProduct) {
      // Optimistic update
      setProductList((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                title: formTitle.trim(),
                category_name: formCategory,
                price: priceNum,
                stock: stockNum,
                description: formDesc.trim(),
                image: formImage.trim() || p.image,
              }
            : p
        )
      )

      await productsApi.updateProduct(editingProduct.id, {
        title: formTitle.trim(),
        category_name: formCategory,
        price: priceNum,
        stock: stockNum,
        description: formDesc.trim(),
        image: formImage.trim() || editingProduct.image,
      })
    } else {
      const created = await productsApi.createProduct({
        title: formTitle.trim(),
        subtitle: 'Perfume Original',
        category_name: formCategory || 'Perfumes',
        price: priceNum,
        stock: stockNum,
        description: formDesc.trim() || 'Fragancia exclusiva con garantía oficial.',
        image: formImage.trim() || 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=500&q=80',
      })

      setProductList((prev) => [created, ...prev])
    }

    setIsModalOpen(false)
    fetchCatalog()
  }

  return (
    <div className="space-y-6 font-body text-[#1b1c1c] dark:text-[#f9fafb]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1b1c1c] dark:text-[#f9fafb] tracking-tight">Gestión de Productos</h1>
          <p className="text-xs sm:text-sm text-[#5b403e] dark:text-[#9ca3af] mt-0.5">
            Administra el catálogo de la tienda, existencias y precios en tiempo real.
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
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between glass-panel p-3.5 rounded-2xl border border-white/70 dark:border-white/10 shadow-xs">
        <div className="relative w-full sm:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#5b403e] dark:text-[#9ca3af] text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar productos por nombre o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/70 dark:bg-white/5 border border-white/80 dark:border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-[#1b1c1c] dark:text-[#f9fafb] placeholder:text-[#5b403e]/70 dark:placeholder:text-[#9ca3af]/60 outline-none focus:border-[#FF4D4F]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-[#5b403e] dark:text-[#9ca3af] font-semibold whitespace-nowrap">Filtrar por Categoría:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white/70 dark:bg-[#181c26] border border-white/80 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-[#1b1c1c] dark:text-[#f9fafb] outline-none cursor-pointer focus:border-[#FF4D4F]"
          >
            <option value="all" className="dark:bg-[#181c26]">Todas las Categorías</option>
            {categories.map((c) => (
              <option key={c.id || c.slug} value={c.slug || c.name.toLowerCase()} className="dark:bg-[#181c26]">
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Table Card */}
      <div className="glass-panel rounded-2xl p-6 border border-white/70 dark:border-white/10 shadow-sm space-y-4">
        {loading ? (
          <div className="py-12 text-center text-xs text-[#5b403e] dark:text-[#9ca3af]">
            Cargando catálogo desde la base de datos...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#ffdad7]/40 dark:bg-[#FF4D4F]/20 text-[#FF4D4F] flex items-center justify-center mx-auto shadow-xs">
              <span className="material-symbols-outlined text-[28px]">inventory_2</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#1b1c1c] dark:text-[#f9fafb]">No se encontraron productos</h4>
              <p className="text-xs text-[#5b403e] dark:text-[#9ca3af] mt-1">
                {searchTerm || selectedCategory !== 'all'
                  ? 'No hay productos que coincidan con los filtros aplicados.'
                  : 'No hay productos en el catálogo todavía.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/60 dark:border-white/10 text-[#5b403e] dark:text-[#9ca3af]">
                  <th className="pb-3 font-semibold">Producto</th>
                  <th className="pb-3 font-semibold">Categoría</th>
                  <th className="pb-3 font-semibold">Precio</th>
                  <th className="pb-3 font-semibold">Stock</th>
                  <th className="pb-3 font-semibold">Estado</th>
                  <th className="pb-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/50 dark:divide-white/10">
                {filtered.map((p) => {
                  const stockStatus = p.stock > 10 ? 'En Stock' : p.stock > 0 ? 'Poco Stock' : 'Sin Stock'
                  const badgeColor =
                    p.stock > 10
                      ? 'bg-[#E8F8F0] dark:bg-[#4ade80]/15 text-[#1E824C] dark:text-[#4ade80]'
                      : p.stock > 0
                      ? 'bg-[#FFF0EB] dark:bg-[#D97757]/15 text-[#D97757]'
                      : 'bg-[#ffdad6] dark:bg-[#ff4d4f]/20 text-[#ba1a1a] dark:text-[#ff8a80]'

                  return (
                    <tr key={p.id} className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
                      {/* Product Name & Image */}
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.title}
                            className="w-11 h-11 rounded-xl object-contain bg-white/70 dark:bg-white/10 p-1 border border-white dark:border-white/10 shrink-0 mix-blend-multiply dark:mix-blend-normal"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-[#1b1c1c] dark:text-[#f9fafb] text-xs truncate max-w-[220px]">{p.title}</p>
                            <p className="text-[11px] text-[#5b403e] dark:text-[#9ca3af] truncate max-w-[220px]">
                              {p.subtitle || p.description?.slice(0, 30) || 'Perfume Lumina'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 text-[#5b403e] dark:text-[#9ca3af] font-semibold">{p.category_name || 'Perfumes'}</td>

                      {/* Price */}
                      <td className="py-3 font-bold text-[#1b1c1c] dark:text-[#f9fafb]">${p.price.toFixed(2)}</td>

                      {/* Stock Count */}
                      <td className="py-3 font-semibold text-[#1b1c1c] dark:text-[#f9fafb]">{p.stock} u.</td>

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
                            className="p-1.5 rounded-lg text-[#5b403e] dark:text-[#9ca3af] hover:text-[#FF4D4F] dark:hover:text-[#FF4D4F] hover:bg-white dark:hover:bg-white/10 transition-colors cursor-pointer"
                            title="Editar producto"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.title)}
                            className="p-1.5 rounded-lg text-[#5b403e] dark:text-[#9ca3af] hover:text-[#ba1a1a] dark:hover:text-[#ff8a80] hover:bg-white dark:hover:bg-white/10 transition-colors cursor-pointer"
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
        )}

        {/* Footer Summary */}
        <div className="flex justify-between items-center text-xs text-[#5b403e] dark:text-[#9ca3af] pt-3 border-t border-white/60 dark:border-white/10">
          <span>
            Mostrando {filtered.length} de {productList.length} productos
          </span>
          <span className="font-semibold text-[#1b1c1c] dark:text-[#f9fafb]">Catálogo Lumina</span>
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
              className="absolute inset-0 bg-[#0e1015]/70 backdrop-blur-xs cursor-pointer"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-[#fbf9f8] dark:bg-[#12151c] glass-panel rounded-3xl p-5 sm:p-7 shadow-2xl border border-white/80 dark:border-white/10 space-y-5 z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b border-white/60 dark:border-white/10 pb-3">
                <h3 className="text-lg font-bold text-[#1b1c1c] dark:text-[#f9fafb]">
                  {editingProduct ? 'Editar Producto' : 'Añadir Nuevo Producto'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-[#5b403e] dark:text-[#9ca3af] hover:text-[#1b1c1c] dark:hover:text-[#f9fafb] rounded-lg cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-[#5b403e] dark:text-[#9ca3af] block mb-1">Nombre / Título de la Fragancia</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs outline-none"
                    placeholder="ej. Club de Nuit Intense Man EDT 105ml"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-[#5b403e] dark:text-[#9ca3af] block mb-1">Categoría</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="bg-white dark:bg-[#181c26] text-[#1b1c1c] dark:text-[#f9fafb] border border-white/80 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs w-full outline-none focus:border-[#FF4D4F]"
                    >
                      {categories.map((c) => (
                        <option key={c.id || c.slug} value={c.name} className="dark:bg-[#181c26]">
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[#5b403e] dark:text-[#9ca3af] block mb-1">Precio ($ ARS)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      className="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs outline-none"
                      placeholder="45000.00"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#5b403e] dark:text-[#9ca3af] block mb-1">Cantidad en Stock</label>
                    <input
                      type="number"
                      required
                      value={formStock}
                      onChange={(e) => setFormStock(e.target.value)}
                      className="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs outline-none"
                      placeholder="20"
                    />
                  </div>
                </div>
                  <div>
                    <label className="font-bold text-[#5b403e] dark:text-[#9ca3af] block mb-1">Imagen del Producto</label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-[#FF4D4F]/40 bg-[#ffdad7]/20 dark:bg-[#FF4D4F]/10 hover:bg-[#ffdad7]/40 dark:hover:bg-[#FF4D4F]/20 text-[#FF4D4F] text-xs font-bold cursor-pointer transition-all">
                          <span className="material-symbols-outlined text-[18px]">
                            {uploading ? 'sync' : 'add_photo_alternate'}
                          </span>
                          <span>{uploading ? 'Subiendo a Supabase...' : 'Subir Foto de tu PC'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            disabled={uploading}
                            className="hidden"
                          />
                        </label>
                        {formImage && (
                          <div className="w-10 h-10 rounded-lg bg-white dark:bg-[#181c26] border border-white/80 dark:border-white/10 p-0.5 shrink-0 overflow-hidden shadow-2xs">
                            <img
                              src={formImage}
                              alt="Vista previa"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                      </div>
                      <input
                        type="text"
                        value={formImage}
                        onChange={(e) => setFormImage(e.target.value)}
                        className="glass-input w-full px-3 py-1.5 rounded-xl text-[11px] outline-none font-mono"
                        placeholder="O pega una URL: https://..."
                      />
                      {uploadError && <p className="text-[10px] text-red-500">{uploadError}</p>}
                    </div>
                  </div>

                <div>
                  <label className="font-bold text-[#5b403e] dark:text-[#9ca3af] block mb-1">Descripción Detallada</label>
                  <textarea
                    rows={3}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="glass-input w-full px-3.5 py-2 rounded-xl text-xs outline-none"
                    placeholder="Describe las características y materiales del producto..."
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-white/60 dark:border-white/10">
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
                    {editingProduct ? 'Guardar Cambios' : 'Añadir Producto'}
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
