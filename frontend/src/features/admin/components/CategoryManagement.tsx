import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { categoriesApi } from '../../../api/categoriesApi'
import { productsApi } from '../../../api/productsApi'

interface CategoryItem {
  id: string
  name: string
  slug: string
  icon: string
  productsCount: number
}

export const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatIcon, setNewCatIcon] = useState('category')

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [catRes, prodRes] = await Promise.all([
        categoriesApi.getCategories(),
        productsApi.getProducts('all'),
      ])

      const products = prodRes.products || []
      const cats = catRes.categories || []

      const mapped: CategoryItem[] = cats.map((c: any) => {
        const matchingCount = products.filter((p) => {
          const catName = (p.category_name || '').toLowerCase()
          const cName = (c.name || '').toLowerCase()
          const cSlug = (c.slug || '').toLowerCase()
          return catName.includes(cName) || catName.includes(cSlug) || cSlug.includes(catName)
        }).length

        return {
          id: c.id || c.slug,
          name: c.name,
          slug: c.slug || c.name.toLowerCase(),
          icon: c.icon || 'category',
          productsCount: matchingCount || c.products_count || 0,
        }
      })

      setCategories(mapped)
    } catch (e) {
      // Handled
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCatName.trim()) return

    try {
      await categoriesApi.createCategory({
        name: newCatName.trim(),
        icon: newCatIcon.trim() || 'category',
      })
      setNewCatName('')
      setNewCatIcon('category')
      setIsModalOpen(false)
      fetchAll()
    } catch (e) {
      // Handled
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar la categoría "${name}"?`)) {
      await categoriesApi.deleteCategory(id)
      fetchAll()
    }
  }

  return (
    <div className="space-y-6 font-body text-[#1b1c1c]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1b1c1c] tracking-tight">Categorías</h1>
          <p className="text-xs sm:text-sm text-[#5b403e] mt-0.5">
            Estructura y taxonomía del catálogo sincronizada con la base de datos.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Nueva Categoría</span>
        </button>
      </div>

      {loading ? (
        <div className="glass-panel rounded-2xl p-12 text-center text-xs text-[#5b403e]">
          Cargando categorías desde la base de datos...
        </div>
      ) : (
        /* Categories Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.id || cat.slug}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="glass-panel rounded-2xl p-6 border border-white/70 shadow-sm space-y-5 flex flex-col justify-between"
            >
              <div>
                {/* Category Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#ffdad7]/50 flex items-center justify-center text-[#FF4D4F] border border-white shadow-2xs">
                      <span className="material-symbols-outlined text-[24px]">{cat.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-[#1b1c1c]">{cat.name}</h3>
                      <p className="text-xs font-semibold text-[#FF4D4F] mt-0.5">
                        {cat.productsCount} {cat.productsCount === 1 ? 'producto activo' : 'productos activos'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="text-[#5b403e] hover:text-[#ba1a1a] p-1.5 rounded-xl hover:bg-white/80 transition-colors cursor-pointer border border-transparent hover:border-white shadow-2xs"
                    title="Eliminar categoría"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-white/50 border border-white/60 text-xs text-[#5b403e] flex justify-between items-center">
                  <span className="font-medium">Slug del sistema:</span>
                  <span className="font-mono font-bold text-[#1b1c1c]">/{cat.slug}</span>
                </div>
              </div>

              {/* Status Footer */}
              <div className="pt-3 border-t border-white/60 flex justify-between items-center text-xs">
                <span className="bg-[#E8F8F0] text-[#1E824C] px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                  Sincronizado
                </span>
                <span className="text-[11px] font-semibold text-[#5b403e]">Catálogo Lumina</span>
              </div>
            </motion.div>
          ))}

          {/* Create New Category Card (Dashed) */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsModalOpen(true)}
            className="rounded-2xl p-8 border-2 border-dashed border-[#FF4D4F]/30 bg-white/30 hover:bg-white/60 transition-all flex flex-col items-center justify-center gap-3 text-center min-h-[190px] cursor-pointer shadow-2xs group"
          >
            <div className="w-12 h-12 rounded-full bg-[#ffdad7]/60 flex items-center justify-center text-[#FF4D4F] group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[28px]">add</span>
            </div>
            <div>
              <span className="font-bold text-sm text-[#1b1c1c] block">Crear Nueva Categoría</span>
              <span className="text-xs text-[#5b403e]">Añadir taxonomías y filtros al catálogo</span>
            </div>
          </motion.button>
        </div>
      )}

      {/* New Category Modal */}
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
              className="relative w-full max-w-md bg-[#fbf9f8] glass-panel rounded-3xl p-7 shadow-2xl border border-white/80 space-y-5 z-10"
            >
              <div className="flex justify-between items-center border-b border-white/60 pb-3">
                <h3 className="text-lg font-bold text-[#1b1c1c]">Nueva Categoría</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-[#5b403e] hover:text-[#1b1c1c] rounded-lg cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleAddCategory} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-[#5b403e] block mb-1">Nombre de la Categoría</label>
                  <input
                    type="text"
                    required
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs outline-none"
                    placeholder="ej. Accesorios Gaming"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#5b403e] block mb-1">Icono (Material Symbol)</label>
                  <input
                    type="text"
                    value={newCatIcon}
                    onChange={(e) => setNewCatIcon(e.target.value)}
                    className="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs outline-none"
                    placeholder="sports_esports, devices, checkroom..."
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
                    Guardar Categoría
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
