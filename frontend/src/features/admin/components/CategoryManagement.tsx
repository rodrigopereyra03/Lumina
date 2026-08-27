import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { categoriesApi } from '../../../api/categoriesApi'

interface CategoryItem {
  id: string
  name: string
  icon: string
  productsCount: number
  subcategories: { name: string; count: number }[]
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
  {
    id: 'cat-1',
    name: 'Electrónica',
    icon: 'devices',
    productsCount: 14,
    subcategories: [
      { name: 'Auriculares', count: 4 },
      { name: 'Smartwatches', count: 3 },
      { name: 'Altavoces', count: 4 },
      { name: 'Teclados', count: 3 },
    ],
  },
  {
    id: 'cat-2',
    name: 'Moda',
    icon: 'checkroom',
    productsCount: 12,
    subcategories: [
      { name: 'Ropa Masculina', count: 4 },
      { name: 'Bolsos y Carteras', count: 5 },
      { name: 'Accesorios', count: 3 },
    ],
  },
  {
    id: 'cat-3',
    name: 'Hogar & Confort',
    icon: 'home',
    productsCount: 8,
    subcategories: [
      { name: 'Accesorios de Escritorio', count: 3 },
      { name: 'Decoración Acústica', count: 3 },
      { name: 'Iluminación', count: 2 },
    ],
  },
  {
    id: 'cat-4',
    name: 'Belleza',
    icon: 'spa',
    productsCount: 6,
    subcategories: [
      { name: 'Cuidado Facial', count: 3 },
      { name: 'Fragancias', count: 3 },
    ],
  },
  {
    id: 'cat-5',
    name: 'Deportes',
    icon: 'fitness_center',
    productsCount: 8,
    subcategories: [
      { name: 'Ropa Deportiva', count: 4 },
      { name: 'Botellas Térmicas', count: 4 },
    ],
  },
]

export const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES)

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoriesApi.getCategories()
        if (res.categories && res.categories.length > 0) {
          const mapped: CategoryItem[] = res.categories.map((c: any) => ({
            id: c.id,
            name: c.name,
            icon: c.icon || 'category',
            productsCount: c.products_count || 4,
            subcategories: [
              { name: 'General', count: c.products_count || 4 }
            ]
          }))
          setCategories(mapped)
        }
      } catch (e) {
        // use default state
      }
    }
    fetchCats()
  }, [])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatIcon, setNewCatIcon] = useState('category')

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCatName.trim()) return

    const newCat: CategoryItem = {
      id: 'cat-' + Date.now(),
      name: newCatName,
      icon: newCatIcon || 'category',
      productsCount: 0,
      subcategories: [
        { name: 'General', count: 0 }
      ]
    }

    setCategories(prev => [...prev, newCat])
    setNewCatName('')
    setIsModalOpen(false)

    try {
      await categoriesApi.createCategory({
        name: newCatName,
        icon: newCatIcon || 'category',
      })
    } catch (e) {
      // Handled
    }
  }

  const handleDelete = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id))
  }

  return (
    <div className="space-y-6 font-body text-[#1b1c1c]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1b1c1c] tracking-tight">Categorías</h1>
          <p className="text-xs sm:text-sm text-[#5b403e] mt-0.5">
            Organiza los productos de tu tienda en secciones lógicas y jerárquicas.
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

      {/* Categories Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat, idx) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.06 }}
            className="glass-panel rounded-2xl p-6 border border-white/70 shadow-sm space-y-5 flex flex-col justify-between"
          >
            <div>
              {/* Category Header */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ffdad7]/50 flex items-center justify-center text-[#FF4D4F]">
                    <span className="material-symbols-outlined text-[22px]">{cat.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#1b1c1c]">{cat.name}</h3>
                    <p className="text-[11px] text-[#5b403e]">{cat.productsCount} productos activos</p>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(cat.id)}
                  className="text-[#5b403e] hover:text-[#ba1a1a] p-1 rounded-lg hover:bg-white/60 transition-colors cursor-pointer"
                  title="Eliminar categoría"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>

              {/* Subcategories List */}
              <div className="mt-5 space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#5b403e] block">
                  Subcategorías
                </span>
                <div className="space-y-1.5">
                  {cat.subcategories.map((sub, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center text-xs py-1.5 px-3 rounded-lg bg-white/50 border border-white/60"
                    >
                      <span className="font-medium text-[#1b1c1c]">{sub.name}</span>
                      <span className="text-[#5b403e] font-semibold text-[11px]">{sub.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-white/60 flex justify-between items-center text-xs">
              <button className="text-[#FF4D4F] font-bold hover:underline cursor-pointer">
                Gestionar Productos
              </button>
              <button className="text-[#5b403e] hover:text-[#1b1c1c] font-semibold cursor-pointer">
                Editar
              </button>
            </div>
          </motion.div>
        ))}

        {/* Create New Category Card (Dashed) */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsModalOpen(true)}
          className="rounded-2xl p-8 border-2 border-dashed border-white/80 bg-white/30 hover:bg-white/50 transition-all flex flex-col items-center justify-center gap-3 text-center min-h-[220px] cursor-pointer shadow-2xs"
        >
          <div className="w-12 h-12 rounded-full bg-[#ffdad7]/60 flex items-center justify-center text-[#FF4D4F]">
            <span className="material-symbols-outlined text-[28px]">add</span>
          </div>
          <div>
            <span className="font-bold text-sm text-[#1b1c1c] block">Crear Nueva Categoría</span>
            <span className="text-xs text-[#5b403e]">Añadir taxonomías y filtros personalizados</span>
          </div>
        </motion.button>
      </div>

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
                    placeholder="sports_esports"
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
