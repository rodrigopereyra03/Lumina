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
    <div className="space-y-6 font-dm text-[#121314]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#121314] tracking-tight uppercase">Categorías</h1>
          <p className="text-xs sm:text-sm font-medium text-[#121314]/70 mt-1">
            Estructura y taxonomía del catálogo sincronizada con la base de datos.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider bg-[#0ffcbe] hover:bg-[#00eaad] text-[#121314] border-2 border-[#121314] shadow-[3px_3px_0px_#121314] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#121314] flex items-center gap-1.5 cursor-pointer transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Nueva Categoría</span>
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-xs font-bold uppercase tracking-wider text-[#121314]/70 border-2 border-[#121314] shadow-[4px_4px_0px_#121314]">
          Cargando categorías desde la base de datos...
        </div>
      ) : (
        /* Categories Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.id || cat.slug}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.04 }}
              className="bg-white rounded-2xl p-6 border-2 border-[#121314] shadow-[4px_4px_0px_#121314] space-y-5 flex flex-col justify-between"
            >
              <div>
                {/* Category Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#ff78ac] flex items-center justify-center text-[#121314] border-2 border-[#121314] shadow-[2px_2px_0px_#121314]">
                      <span className="material-symbols-outlined text-[24px]">{cat.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-black text-base text-[#121314] uppercase tracking-wide">{cat.name}</h3>
                      <p className="text-xs font-bold text-[#106ebe] mt-0.5">
                        {cat.productsCount} {cat.productsCount === 1 ? 'producto activo' : 'productos activos'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="p-1.5 rounded-xl bg-white text-[#d92d20] border-2 border-[#121314] shadow-[2px_2px_0px_#121314] hover:bg-red-50 transition-colors cursor-pointer"
                    title="Eliminar categoría"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-[#f6f4ee] border-2 border-[#121314] text-xs text-[#121314] flex justify-between items-center shadow-[2px_2px_0px_#121314]">
                  <span className="font-bold uppercase tracking-wider text-[11px] text-[#121314]/70">Slug:</span>
                  <span className="font-mono font-black text-[#121314]">/{cat.slug}</span>
                </div>
              </div>

              {/* Status Footer */}
              <div className="pt-3 border-t-2 border-[#121314]/15 flex justify-between items-center text-xs">
                <span className="bg-[#0ffcbe] text-[#121314] border border-[#121314] px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                  Sincronizado
                </span>
                <span className="text-[11px] font-bold text-[#121314]/60 uppercase">Fórmula 1370</span>
              </div>
            </motion.div>
          ))}

          {/* Create New Category Card (Dashed) */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setIsModalOpen(true)}
            className="rounded-2xl p-8 border-2 border-dashed border-[#121314] bg-[#f6f4ee] hover:bg-white transition-all flex flex-col items-center justify-center gap-3 text-center min-h-[190px] cursor-pointer shadow-[3px_3px_0px_#121314] group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#0ffcbe] border-2 border-[#121314] flex items-center justify-center text-[#121314] shadow-[2px_2px_0px_#121314] group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[28px]">add</span>
            </div>
            <div>
              <span className="font-black text-sm text-[#121314] uppercase tracking-wide block">Crear Nueva Categoría</span>
              <span className="text-xs font-medium text-[#121314]/70">Añadir taxonomías al catálogo</span>
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
              className="absolute inset-0 bg-[#121314]/70 backdrop-blur-xs cursor-pointer"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-[8px_8px_0px_#121314] border-3 border-[#121314] space-y-5 z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b-2 border-[#121314] pb-3">
                <h3 className="text-xl font-black uppercase tracking-tight text-[#121314]">Nueva Categoría</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-[#121314] hover:bg-[#f6f4ee] rounded-xl border-2 border-transparent hover:border-[#121314] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleAddCategory} className="space-y-4 text-xs">
                <div>
                  <label className="font-black uppercase tracking-wider text-[#121314] block mb-1">Nombre de la Categoría</label>
                  <input
                    type="text"
                    required
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full bg-[#f6f4ee] border-2 border-[#121314] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#121314] outline-none focus:bg-white"
                    placeholder="ej. Árabes Exclusivos"
                  />
                </div>

                <div>
                  <label className="font-black uppercase tracking-wider text-[#121314] block mb-1">Icono (Material Symbol)</label>
                  <input
                    type="text"
                    value={newCatIcon}
                    onChange={(e) => setNewCatIcon(e.target.value)}
                    className="w-full bg-[#f6f4ee] border-2 border-[#121314] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#121314] outline-none focus:bg-white"
                    placeholder="category, diamond, star, local_florist..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t-2 border-[#121314]/15">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-full bg-white hover:bg-[#f6f4ee] text-[#121314] border-2 border-[#121314] shadow-[2px_2px_0px_#121314] font-black uppercase tracking-wider text-xs cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-[#0ffcbe] hover:bg-[#00eaad] text-[#121314] border-2 border-[#121314] shadow-[3px_3px_0px_#121314] font-black uppercase tracking-wider text-xs cursor-pointer"
                  >
                    Guardar
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
