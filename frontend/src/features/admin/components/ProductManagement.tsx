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
  const [formBrand, setFormBrand] = useState('Armaf')
  const [formCategory, setFormCategory] = useState('')
  const [formPrice, setFormPrice] = useState('')
  const [formStock, setFormStock] = useState('20')
  const [formDesc, setFormDesc] = useState('')
  const [formImage, setFormImage] = useState('')
  const [formImages, setFormImages] = useState<string[]>([])
  const [urlInput, setUrlInput] = useState('')
  const [formVolumes, setFormVolumes] = useState<number[]>([50, 100])
  const [formAccentColor, setFormAccentColor] = useState('#10b981')
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setUploadError(null)
    setUploadSuccess(false)

    const uploadedUrls: string[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      try {
        const publicUrl = await storageApi.uploadProductImage(file)
        uploadedUrls.push(publicUrl)
      } catch (err: any) {
        console.warn('Storage upload fallback:', err)
        await new Promise<void>((resolve) => {
          const reader = new FileReader()
          reader.onload = (event) => {
            if (event.target?.result) {
              uploadedUrls.push(event.target.result as string)
            }
            resolve()
          }
          reader.readAsDataURL(file)
        })
      }
    }

    if (uploadedUrls.length > 0) {
      setFormImages((prev) => [...prev, ...uploadedUrls])
      if (!formImage) {
        setFormImage(uploadedUrls[0])
      }
      setUploadSuccess(true)
    }
    setUploading(false)
  }

  const handleAddUrlImage = () => {
    if (!urlInput.trim()) return
    const url = urlInput.trim()
    setFormImages((prev) => [...prev, url])
    if (!formImage) {
      setFormImage(url)
    }
    setUrlInput('')
  }

  const handleRemoveImage = (indexToRemove: number) => {
    setFormImages((prev) => {
      const updated = prev.filter((_, idx) => idx !== indexToRemove)
      if (formImage === prev[indexToRemove]) {
        setFormImage(updated[0] || '')
      }
      return updated
    })
  }

  const handleSetPrimaryImage = (indexToPrimary: number) => {
    setFormImages((prev) => {
      const target = prev[indexToPrimary]
      const rest = prev.filter((_, idx) => idx !== indexToPrimary)
      const reordered = [target, ...rest]
      setFormImage(target)
      return reordered
    })
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
      (p.category_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.brand || '').toLowerCase().includes(searchTerm.toLowerCase())

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
    setFormBrand('Armaf')
    setFormCategory(categories[0]?.name || 'Perfumes')
    setFormPrice('145000.00')
    setFormStock('15')
    setFormDesc('')
    setFormImage('')
    setFormImages([])
    setUrlInput('')
    setFormVolumes([50, 100])
    setFormAccentColor('#10b981')
    setUploadSuccess(false)
    setUploadError(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (product: BackendProductDTO) => {
    setEditingProduct(product)
    setFormTitle(product.title)
    setFormBrand(product.brand || product.category_name || 'Armaf')
    setFormCategory(product.category_name || 'Perfumes')
    setFormPrice(product.price.toString())
    setFormStock(product.stock.toString())
    setFormDesc(product.description || '')
    const initialImgs = product.images && product.images.length > 0
      ? product.images
      : (product.image ? [product.image] : [])
    setFormImages(initialImgs)
    setFormImage(initialImgs[0] || product.image || '')
    setUrlInput('')
    setFormVolumes(product.volumes && product.volumes.length > 0 ? product.volumes : [50, 100])
    setFormAccentColor(product.accent_color || '#10b981')
    setUploadSuccess(false)
    setUploadError(null)
    setIsModalOpen(true)
  }

  const [statusActionMessage, setStatusActionMessage] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState<{ current: number; total: number; title: string } | null>(null)
  const [localOnlyCount, setLocalOnlyCount] = useState<number>(0)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('lumina_custom_products')
      if (stored) {
        const localList = JSON.parse(stored)
        if (Array.isArray(localList)) {
          const pending = localList.filter((p: any) => {
            const hasBase64Main = p.image && typeof p.image === 'string' && p.image.startsWith('data:')
            const hasBase64Gallery =
              Array.isArray(p.images) && p.images.some((img: string) => typeof img === 'string' && img.startsWith('data:'))
            return hasBase64Main || hasBase64Gallery
          })
          setLocalOnlyCount(pending.length)
        }
      }
    } catch {}
  }, [productList])

  const handleSyncLocalImagesToCloud = async () => {
    setSyncing(true)
    try {
      const stored = localStorage.getItem('lumina_custom_products')
      if (!stored) {
        setSyncing(false)
        return
      }
      const localList = JSON.parse(stored)
      if (!Array.isArray(localList)) {
        setSyncing(false)
        return
      }

      const pending = localList.filter((p: any) => {
        const hasBase64Main = p.image && typeof p.image === 'string' && p.image.startsWith('data:')
        const hasBase64Gallery =
          Array.isArray(p.images) && p.images.some((img: string) => typeof img === 'string' && img.startsWith('data:'))
        return hasBase64Main || hasBase64Gallery
      })

      if (pending.length === 0) {
        setStatusActionMessage('Todas tus fotos ya están sincronizadas en la nube de producción.')
        setTimeout(() => setStatusActionMessage(null), 4000)
        setSyncing(false)
        return
      }

      let count = 0
      for (const p of pending) {
        count++
        setSyncProgress({ current: count, total: pending.length, title: p.title })

        const uploadedImages: string[] = []
        const gallery = Array.isArray(p.images) && p.images.length > 0 ? p.images : (p.image ? [p.image] : [])

        for (let i = 0; i < gallery.length; i++) {
          const img = gallery[i]
          if (typeof img === 'string' && img.startsWith('data:')) {
            try {
              const arr = img.split(',')
              const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
              const bstr = atob(arr[1])
              let n = bstr.length
              const u8arr = new Uint8Array(n)
              while (n--) {
                u8arr[n] = bstr.charCodeAt(n)
              }
              const ext = mime.split('/')[1] || 'jpg'
              const file = new File([u8arr], `perfume_${p.id}_${i}_${Date.now()}.${ext}`, { type: mime })
              const cloudUrl = await storageApi.uploadProductImage(file)
              uploadedImages.push(cloudUrl)
            } catch (uploadErr) {
              console.error('Failed to upload image:', uploadErr)
              uploadedImages.push(img)
            }
          } else {
            uploadedImages.push(img)
          }
        }

        const primaryCloudImg = uploadedImages[0] || p.image

        await productsApi.updateProduct(p.id, {
          title: p.title,
          subtitle: p.subtitle,
          price: p.price,
          stock: p.stock,
          description: p.description,
          category_name: p.category_name,
          category_slug: p.category_slug,
          image: primaryCloudImg,
          images: uploadedImages,
          volumes: p.volumes,
          accent_color: p.accent_color,
          brand: p.brand,
        })
      }

      await fetchCatalog()
      setLocalOnlyCount(0)
      setStatusActionMessage(`¡Éxito! Se sincronizaron las fotos de ${pending.length} productos a la nube de producción.`)
      setTimeout(() => setStatusActionMessage(null), 5000)
    } catch (err: any) {
      console.error('Sync failed:', err)
      setStatusActionMessage('Error al sincronizar imágenes con Supabase: ' + (err?.message || ''))
      setTimeout(() => setStatusActionMessage(null), 5000)
    } finally {
      setSyncing(false)
      setSyncProgress(null)
    }
  }

  const handleQuickToggleStock = async (product: BackendProductDTO) => {
    const isCurrentlyOut = product.stock <= 0
    const newStock = isCurrentlyOut ? 10 : 0
    
    // Optimistic local update
    setProductList((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, stock: newStock } : p))
    )
    setStatusActionMessage(
      newStock === 0
        ? `"${product.title}" marcado como SIN STOCK (se mostrará tachado en la tienda)`
        : `"${product.title}" restablecido EN STOCK (${newStock} u.)`
    )
    setTimeout(() => setStatusActionMessage(null), 4000)

    try {
      await productsApi.updateProduct(product.id, {
        stock: newStock,
      })
    } catch (err: any) {
      console.error('Error toggling stock:', err)
      setProductList((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, stock: product.stock } : p))
      )
      setStatusActionMessage('Error al actualizar el stock en el servidor')
      setTimeout(() => setStatusActionMessage(null), 4000)
    }
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
    const volumesToSave = formVolumes.length > 0 ? formVolumes : [50, 100]
    const finalImgs = formImages.length > 0 ? formImages : (formImage ? [formImage] : [])
    const primaryImg = finalImgs[0] || formImage || 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=500&q=80'

    if (editingProduct) {
      // Optimistic update
      setProductList((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                title: formTitle.trim(),
                brand: formBrand.trim() || 'Lumina',
                category_name: formCategory,
                price: priceNum,
                stock: stockNum,
                description: formDesc.trim(),
                image: primaryImg,
                images: finalImgs,
                volumes: volumesToSave,
                accent_color: formAccentColor,
              }
            : p
        )
      )

      await productsApi.updateProduct(editingProduct.id, {
        title: formTitle.trim(),
        brand: formBrand.trim() || 'Lumina',
        category_name: formCategory,
        price: priceNum,
        stock: stockNum,
        description: formDesc.trim(),
        image: primaryImg,
        images: finalImgs,
        volumes: volumesToSave,
        accent_color: formAccentColor,
      })
    } else {
      const created = await productsApi.createProduct({
        title: formTitle.trim(),
        brand: formBrand.trim() || 'Lumina',
        subtitle: `${formBrand.trim()} • Haute Parfumerie`,
        category_name: formCategory || 'Perfumes',
        price: priceNum,
        stock: stockNum,
        description: formDesc.trim() || 'Fragancia exclusiva con garantía oficial.',
        image: primaryImg,
        images: finalImgs,
        volumes: volumesToSave,
        accent_color: formAccentColor,
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

      {/* Localhost to Cloud Sync Banner */}
      {localOnlyCount > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-amber-500/10 border border-amber-500/40 text-[#1b1c1c] dark:text-[#f9fafb] shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">cloud_upload</span>
            </div>
            <div>
              <h4 className="text-xs font-bold">
                {localOnlyCount} {localOnlyCount === 1 ? 'producto tiene fotos cargadas' : 'productos tienen fotos cargadas'} en tu navegador local
              </h4>
              <p className="text-[11px] text-[#5b403e] dark:text-[#9ca3af]">
                Sincronizalas ahora a la nube de Supabase para que se vean automáticamente en la URL de producción.
              </p>
            </div>
          </div>

          <button
            onClick={handleSyncLocalImagesToCloud}
            disabled={syncing}
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-black flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer shrink-0 disabled:opacity-50"
          >
            {syncing ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                <span>Sincronizando {syncProgress ? `(${syncProgress.current}/${syncProgress.total})` : '...'}</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">sync</span>
                <span>Subir Fotos a Producción</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Feedback Toast */}
      {statusActionMessage && (
        <div className="p-3.5 rounded-2xl bg-[#1b1c1c] text-white border border-[#FF4D4F]/40 shadow-xl flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="material-symbols-outlined text-[#FF4D4F] text-[20px]">info</span>
            <span>{statusActionMessage}</span>
          </div>
          <button
            onClick={() => setStatusActionMessage(null)}
            className="text-gray-400 hover:text-white p-1 rounded-lg"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

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
                            className="w-12 h-12 rounded-xl object-contain bg-white/70 dark:bg-white/10 p-1 border border-white dark:border-white/10 shrink-0 shadow-xs"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-[#1b1c1c] dark:text-[#f9fafb] text-xs truncate max-w-[220px]">{p.title}</p>
                            <p className="text-[11px] text-[#5b403e] dark:text-[#9ca3af] truncate max-w-[220px]">
                              {p.subtitle || p.description?.slice(0, 30) || 'Perfume Lumina'}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
                              {(p.volumes || [50, 100]).map((v) => (
                                <span
                                  key={v}
                                  className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#FF4D4F]/10 dark:bg-[#FF4D4F]/20 text-[#FF4D4F] border border-[#FF4D4F]/30"
                                >
                                  {v} ml
                                </span>
                              ))}
                              {p.brand && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-neutral-200/60 dark:bg-white/10 text-neutral-600 dark:text-neutral-300">
                                  {p.brand}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 text-[#5b403e] dark:text-[#9ca3af] font-semibold">{p.category_name || 'Perfumes'}</td>

                      {/* Price */}
                      <td className="py-3 font-bold text-[#1b1c1c] dark:text-[#f9fafb]">${p.price.toFixed(2)}</td>

                      {/* Stock Count */}
                      <td className="py-3 font-semibold text-[#1b1c1c] dark:text-[#f9fafb]">{p.stock} u.</td>

                      {/* Stock Status Badge & Quick Stock Action Button */}
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${badgeColor}`}>
                            {stockStatus}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuickToggleStock(p)}
                            title={p.stock > 0 ? 'Marcar inmediatamente como Sin Stock' : 'Restablecer En Stock (10 u.)'}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1 shadow-2xs hover:scale-105 active:scale-95 ${
                              p.stock > 0
                                ? 'border-red-500/30 text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20'
                                : 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[13px]">
                              {p.stock > 0 ? 'block' : 'check_circle'}
                            </span>
                            <span>{p.stock > 0 ? 'Agotar' : 'Activar'}</span>
                          </button>
                        </div>
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
                {/* Fragrance Title */}
                <div>
                  <label className="font-bold text-[#5b403e] dark:text-[#9ca3af] block mb-1">Nombre / Título de la Fragancia</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs outline-none"
                    placeholder="ej. Club de Nuit Intense Man Pure Parfum"
                  />
                </div>

                {/* Brand House Selector */}
                <div>
                  <label className="font-bold text-[#5b403e] dark:text-[#9ca3af] block mb-1">Casa / Marca</label>
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    {['Armaf', 'Afnan', 'Lattafa', 'Al Haramain', 'Lumina'].map((b) => (
                      <button
                        type="button"
                        key={b}
                        onClick={() => setFormBrand(b)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer border ${
                          formBrand === b
                            ? 'bg-[#FF4D4F] text-white border-[#FF4D4F] shadow-xs'
                            : 'bg-white dark:bg-[#181c26] text-[#5b403e] dark:text-[#9ca3af] border-black/10 dark:border-white/10 hover:border-[#FF4D4F]/40'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs outline-none"
                    placeholder="O escribe otra casa..."
                  />
                </div>

                {/* Volume Selector (50 ml / 90 ml / 100 ml / 150 ml) */}
                <div className="p-3.5 rounded-2xl bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-[#1b1c1c] dark:text-[#f9fafb] block">
                      Presentaciones Disponibles (Volumen)
                    </label>
                    <span className="text-[10px] text-[#FF4D4F] font-bold uppercase tracking-wider">
                      {formVolumes.length === 1 ? `${formVolumes[0]} ml único` : `${formVolumes.join(' & ')} ml`}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5b403e] dark:text-[#9ca3af]">
                    Selecciona las presentaciones activas del perfume (<strong>50 ml</strong>, <strong>90 ml</strong>, <strong>100 ml</strong>, <strong>120 ml</strong>, <strong>150 ml</strong>).
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                    {[50, 90, 100, 120, 150].map((vol) => {
                      const isSelected = formVolumes.includes(vol)
                      return (
                        <button
                          type="button"
                          key={vol}
                          onClick={() => {
                            if (isSelected) {
                              // Ensure at least one volume remains selected
                              if (formVolumes.length > 1) {
                                setFormVolumes(formVolumes.filter((v) => v !== vol))
                              }
                            } else {
                              setFormVolumes([...formVolumes, vol].sort((a, b) => a - b))
                            }
                          }}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                            isSelected
                              ? 'bg-[#FF4D4F] text-white border-[#FF4D4F] shadow-md shadow-[#FF4D4F]/20'
                              : 'bg-white dark:bg-[#181c26] text-[#5b403e] dark:text-[#9ca3af] border-black/10 dark:border-white/10 hover:border-[#FF4D4F]/50'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[15px]">
                            {isSelected ? 'check_circle' : 'radio_button_unchecked'}
                          </span>
                          <span>{vol} ml</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Aura / Accent Color (For Showcase 3D and Catalog Glow) */}
                <div className="p-3.5 rounded-2xl bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-bold text-[#1b1c1c] dark:text-[#f9fafb] block">
                        Tono Distintivo (Aura en Showcase 3D y Tarjeta)
                      </label>
                      <span className="text-[10px] text-[#5b403e] dark:text-[#9ca3af]">
                        Define el color de iluminación ambiental 3D y halo de la fragancia.
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/10 px-2 py-1 rounded-lg">
                      <span className="text-[10px] text-gray-400 font-mono font-bold">{formAccentColor}</span>
                      <input
                        type="color"
                        value={formAccentColor}
                        onChange={(e) => setFormAccentColor(e.target.value)}
                        className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
                        title="Elegir color personalizado"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {[
                      { color: '#f43f5e', label: 'Rubí Pasión' },
                      { color: '#be123c', label: 'Bordeaux Vino' },
                      { color: '#ec4899', label: 'Rose Gold' },
                      { color: '#f59e0b', label: 'Ámbar Cálido' },
                      { color: '#eab308', label: 'Oro Champagne' },
                      { color: '#ea580c', label: 'Coñac & Canela' },
                      { color: '#10b981', label: 'Esmeralda Árabe' },
                      { color: '#14b8a6', label: 'Turquesa Imperial' },
                      { color: '#38bdf8', label: 'Zafiro Océano' },
                      { color: '#6366f1', label: 'Azul Medianoche' },
                      { color: '#c084fc', label: 'Amatista Mística' },
                      { color: '#94a3b8', label: 'Platino / Titanio' },
                    ].map((swatch) => (
                      <button
                        type="button"
                        key={swatch.color}
                        onClick={() => setFormAccentColor(swatch.color)}
                        title={swatch.label}
                        className={`group relative w-8 h-8 rounded-full transition-all cursor-pointer border-2 flex items-center justify-center ${
                          formAccentColor === swatch.color
                            ? 'scale-115 border-white dark:border-white ring-2 ring-black/40 shadow-lg'
                            : 'border-transparent opacity-80 hover:opacity-100 hover:scale-105'
                        }`}
                        style={{ backgroundColor: swatch.color }}
                      >
                        {formAccentColor === swatch.color && (
                          <span className="w-2 h-2 rounded-full bg-white shadow-xs" />
                        )}
                      </button>
                    ))}
                  </div>
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
                    <label className="font-bold text-[#5b403e] dark:text-[#9ca3af] block mb-1">Precio Base ($ ARS)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      className="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs outline-none"
                      placeholder="145000.00"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-[#5b403e] dark:text-[#9ca3af] block">Cantidad en Stock</label>
                      <button
                        type="button"
                        onClick={() => setFormStock((prev) => (parseInt(prev, 10) > 0 ? '0' : '10'))}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors cursor-pointer border ${
                          parseInt(formStock, 10) === 0
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500/20'
                        }`}
                      >
                        {parseInt(formStock, 10) === 0 ? '📦 Activar (10 u.)' : '🚫 Marcar Sin Stock'}
                      </button>
                    </div>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formStock}
                      onChange={(e) => setFormStock(e.target.value)}
                      className={`glass-input w-full px-3.5 py-2.5 rounded-xl text-xs outline-none ${
                        parseInt(formStock, 10) === 0 ? 'border-red-500/50 bg-red-500/5' : ''
                      }`}
                      placeholder="20"
                    />
                    {parseInt(formStock, 10) === 0 && (
                      <p className="text-[10px] font-semibold text-red-500 dark:text-red-400 mt-1.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">visibility</span>
                        El producto se mostrará en la tienda tachado y marcado como "Sin Stock".
                      </p>
                    )}
                  </div>
                </div>

                {/* Product Images & Multi-Photo Gallery */}
                <div className="p-3.5 rounded-2xl bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-bold text-[#1b1c1c] dark:text-[#f9fafb] block">
                        Fotos del Producto (Galería Multi-Foto)
                      </label>
                      <span className="text-[10px] text-[#5b403e] dark:text-[#9ca3af]">
                        Puedes subir varias fotos. La primera foto será la principal en la tienda.
                      </span>
                    </div>
                    <span className="text-[10px] text-[#FF4D4F] font-bold uppercase tracking-wider">
                      {formImages.length} {formImages.length === 1 ? 'Foto' : 'Fotos'}
                    </span>
                  </div>

                  {/* Upload button (supports multiple files) */}
                  <div className="space-y-2">
                    <label className="flex items-center justify-center gap-2 px-3.5 py-3 rounded-xl border border-dashed border-[#FF4D4F]/40 bg-[#ffdad7]/20 dark:bg-[#FF4D4F]/10 hover:bg-[#ffdad7]/40 dark:hover:bg-[#FF4D4F]/20 text-[#FF4D4F] text-xs font-bold cursor-pointer transition-all">
                      <span className="material-symbols-outlined text-[20px] animate-pulse">
                        {uploading ? 'sync' : 'cloud_upload'}
                      </span>
                      <span>
                        {uploading ? 'Subiendo fotos al Bucket...' : 'Seleccionar Fotos (puedes elegir varias)'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>

                    {/* Add via URL directly */}
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddUrlImage()
                          }
                        }}
                        className="glass-input flex-1 px-3 py-2 rounded-xl text-[11px] outline-none font-mono"
                        placeholder="O pega una URL de foto y presiona Añadir..."
                      />
                      <button
                        type="button"
                        onClick={handleAddUrlImage}
                        disabled={!urlInput.trim()}
                        className="px-3.5 py-2 rounded-xl bg-black/10 dark:bg-white/10 hover:bg-[#FF4D4F] hover:text-white text-xs font-semibold cursor-pointer disabled:opacity-40 transition-all shrink-0"
                      >
                        Añadir Foto
                      </button>
                    </div>

                    {uploadSuccess && (
                      <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">verified</span>
                        <span>Fotos añadidas con éxito a la galería</span>
                      </div>
                    )}
                    {uploadError && <p className="text-[10px] text-amber-500">{uploadError}</p>}
                  </div>

                  {/* Gallery Thumbnails Grid */}
                  {formImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                      {formImages.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className={`relative rounded-xl border p-1.5 bg-white dark:bg-[#181c26] flex flex-col items-center justify-between gap-1 shadow-sm transition-all group ${
                            idx === 0
                              ? 'border-[#FF4D4F] ring-2 ring-[#FF4D4F]/30'
                              : 'border-white/80 dark:border-white/10 hover:border-gray-400'
                          }`}
                        >
                          {/* Image preview */}
                          <div className="w-full aspect-square rounded-lg overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-black/20">
                            <img
                              src={imgUrl}
                              alt={`Foto ${idx + 1}`}
                              className="max-h-full max-w-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/hero-perfumes/odyssey-aqua.png'
                              }}
                            />
                          </div>

                          {/* Badge Principal on first photo */}
                          {idx === 0 && (
                            <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-[#FF4D4F] text-white text-[9px] font-extrabold uppercase shadow-sm">
                              Principal
                            </span>
                          )}

                          {/* Actions */}
                          <div className="w-full flex items-center justify-between gap-1 pt-0.5">
                            {idx !== 0 ? (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(idx)}
                                className="text-[10px] text-[#FF4D4F] hover:underline font-bold cursor-pointer"
                                title="Hacer foto principal"
                              >
                                Hacer Principal
                              </button>
                            ) : (
                              <span className="text-[10px] text-gray-400 font-medium">Portada</span>
                            )}

                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="w-5 h-5 rounded flex items-center justify-center text-red-500 hover:bg-red-500/10 cursor-pointer"
                              title="Eliminar de la galería"
                            >
                              <span className="material-symbols-outlined text-[14px]">delete</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="font-bold text-[#5b403e] dark:text-[#9ca3af] block mb-1">Descripción Detallada</label>
                  <textarea
                    rows={3}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="glass-input w-full px-3.5 py-2 rounded-xl text-xs outline-none"
                    placeholder="Describe las notas olfativas, fijación y procedencia del perfume..."
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
