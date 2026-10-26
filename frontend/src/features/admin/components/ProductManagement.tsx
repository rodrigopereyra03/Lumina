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
                brand: formBrand.trim() || 'Fórmula 1370',
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
        brand: formBrand.trim() || 'Fórmula 1370',
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
        brand: formBrand.trim() || 'Fórmula 1370',
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
    <div className="space-y-6 font-dm text-[#121314]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#121314] tracking-tight uppercase">Gestión de Productos</h1>
          <p className="text-xs sm:text-sm font-medium text-[#121314]/70 mt-1">
            Administra el catálogo de perfumes, existencias en vivo y precios.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider bg-[#0ffcbe] hover:bg-[#00eaad] text-[#121314] border-2 border-[#121314] shadow-[3px_3px_0px_#121314] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#121314] flex items-center gap-1.5 cursor-pointer transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Añadir Producto</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border-2 border-[#121314] shadow-[4px_4px_0px_#121314]">
        <div className="relative w-full sm:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#121314]/60 text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar por fragancia, marca o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#f6f4ee] border-2 border-[#121314] rounded-full py-2 pl-9 pr-4 text-xs font-bold text-[#121314] placeholder:text-[#121314]/50 outline-none focus:bg-white focus:shadow-[2px_2px_0px_#121314] transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-black uppercase tracking-wider text-[#121314] whitespace-nowrap">Categoría:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#f6f4ee] border-2 border-[#121314] rounded-full px-4 py-2 text-xs font-bold text-[#121314] outline-none cursor-pointer focus:bg-white transition-all shadow-[2px_2px_0px_#121314]"
          >
            <option value="all">Todas las Categorías</option>
            {categories.map((c) => (
              <option key={c.id || c.slug} value={c.slug || c.name.toLowerCase()}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Localhost to Cloud Sync Banner */}
      {localOnlyCount > 0 && (
        <div className="p-5 rounded-2xl bg-[#ffe600] border-2 border-[#121314] text-[#121314] shadow-[4px_4px_0px_#121314] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border-2 border-[#121314] text-[#121314] flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#121314]">
              <span className="material-symbols-outlined text-[22px]">cloud_upload</span>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider">
                {localOnlyCount} {localOnlyCount === 1 ? 'producto tiene fotos cargadas' : 'productos tienen fotos cargadas'} en tu navegador local
              </h4>
              <p className="text-[11px] font-medium text-[#121314]/80">
                Sincronízalas ahora a la nube de Supabase para que se vean en producción.
              </p>
            </div>
          </div>

          <button
            onClick={handleSyncLocalImagesToCloud}
            disabled={syncing}
            className="px-5 py-2.5 rounded-full font-black text-xs uppercase tracking-wider bg-[#121314] text-white hover:bg-neutral-800 flex items-center gap-2 border-2 border-[#121314] shadow-[3px_3px_0px_#ffffff] transition-all cursor-pointer shrink-0 disabled:opacity-50"
          >
            {syncing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
        <div className="p-3.5 rounded-2xl bg-[#0ffcbe] text-[#121314] border-2 border-[#121314] shadow-[4px_4px_0px_#121314] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider">
            <span className="material-symbols-outlined text-[20px]">info</span>
            <span>{statusActionMessage}</span>
          </div>
          <button
            onClick={() => setStatusActionMessage(null)}
            className="text-[#121314] hover:bg-black/10 p-1 rounded-lg"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Product Table Card */}
      <div className="bg-white rounded-2xl p-6 border-2 border-[#121314] shadow-[4px_4px_0px_#121314] space-y-4">
        {loading ? (
          <div className="py-12 text-center text-xs font-bold uppercase tracking-wider text-[#121314]/70">
            Cargando catálogo desde la base de datos...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#ff78ac] border-2 border-[#121314] text-[#121314] flex items-center justify-center mx-auto shadow-[2px_2px_0px_#121314]">
              <span className="material-symbols-outlined text-[28px]">inventory_2</span>
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-wider text-[#121314]">No se encontraron productos</h4>
              <p className="text-xs font-medium text-[#121314]/70 mt-1">
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
                <tr className="border-b-2 border-[#121314] text-[#121314] bg-[#f6f4ee]/70">
                  <th className="py-3 px-3 font-black uppercase tracking-wider">Producto</th>
                  <th className="py-3 px-3 font-black uppercase tracking-wider">Categoría</th>
                  <th className="py-3 px-3 font-black uppercase tracking-wider">Precio</th>
                  <th className="py-3 px-3 font-black uppercase tracking-wider">Stock</th>
                  <th className="py-3 px-3 font-black uppercase tracking-wider">Estado</th>
                  <th className="py-3 px-3 font-black uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[#121314]/10">
                {filtered.map((p) => {
                  const stockStatus = p.stock > 10 ? 'En Stock' : p.stock > 0 ? 'Poco Stock' : 'Sin Stock'
                  const badgeColor =
                    p.stock > 10
                      ? 'bg-[#0ffcbe] text-[#121314] border border-[#121314]'
                      : p.stock > 0
                      ? 'bg-[#ffe600] text-[#121314] border border-[#121314]'
                      : 'bg-[#ff78ac] text-[#121314] border border-[#121314]'

                  return (
                    <tr key={p.id} className="hover:bg-[#f6f4ee]/60 transition-colors">
                      {/* Product Name & Image */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.title}
                            className="w-12 h-12 rounded-xl object-contain bg-white p-1 border-2 border-[#121314] shrink-0 shadow-[2px_2px_0px_#121314]"
                          />
                          <div className="min-w-0">
                            <p className="font-black text-[#121314] text-xs truncate max-w-[220px] uppercase tracking-wide">{p.title}</p>
                            <p className="text-[11px] font-medium text-[#121314]/70 truncate max-w-[220px]">
                              {p.subtitle || p.description?.slice(0, 30) || 'Perfume Fórmula 1370'}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
                              {(p.volumes || [50, 100]).map((v) => (
                                <span
                                  key={v}
                                  className="px-1.5 py-0.5 rounded text-[9px] font-black bg-[#a8d5e3] text-[#121314] border border-[#121314]"
                                >
                                  {v} ml
                                </span>
                              ))}
                              {p.brand && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#f6f4ee] text-[#121314] border border-[#121314]">
                                  {p.brand}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3 text-[#121314] font-bold uppercase text-[11px]">{p.category_name || 'Perfumes'}</td>

                      {/* Price */}
                      <td className="py-3.5 px-3 font-black text-[#121314] text-xs">${p.price.toFixed(2)}</td>

                      {/* Stock Count */}
                      <td className="py-3.5 px-3 font-black text-[#121314] text-xs">{p.stock} u.</td>

                      {/* Stock Status Badge & Quick Stock Action Button */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${badgeColor}`}>
                            {stockStatus}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuickToggleStock(p)}
                            title={p.stock > 0 ? 'Marcar inmediatamente como Sin Stock' : 'Restablecer En Stock (10 u.)'}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-black border-2 border-[#121314] transition-all cursor-pointer flex items-center gap-1 shadow-[2px_2px_0px_#121314] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#121314] ${
                              p.stock > 0
                                ? 'bg-[#ff78ac] text-[#121314]'
                                : 'bg-[#0ffcbe] text-[#121314]'
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
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 rounded-xl bg-white text-[#121314] border-2 border-[#121314] shadow-[2px_2px_0px_#121314] hover:bg-[#a8d5e3] transition-colors cursor-pointer"
                            title="Editar producto"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.title)}
                            className="p-1.5 rounded-xl bg-white text-[#d92d20] border-2 border-[#121314] shadow-[2px_2px_0px_#121314] hover:bg-red-50 transition-colors cursor-pointer"
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
        <div className="flex justify-between items-center text-xs font-bold text-[#121314]/70 pt-3 border-t-2 border-[#121314]/15">
          <span>
            Mostrando {filtered.length} de {productList.length} productos
          </span>
          <span className="font-black text-[#121314] uppercase">Catálogo Fórmula 1370</span>
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
              className="absolute inset-0 bg-[#121314]/70 backdrop-blur-xs cursor-pointer"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_#121314] border-3 border-[#121314] space-y-5 z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b-2 border-[#121314] pb-4">
                <h3 className="text-xl font-black uppercase tracking-tight text-[#121314]">
                  {editingProduct ? 'Editar Producto' : 'Añadir Nuevo Producto'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-[#121314] hover:bg-[#f6f4ee] rounded-xl border-2 border-transparent hover:border-[#121314] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                {/* Fragrance Title */}
                <div>
                  <label className="font-black uppercase tracking-wider text-[#121314] block mb-1">Nombre / Título de la Fragancia</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-[#f6f4ee] border-2 border-[#121314] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#121314] outline-none focus:bg-white focus:shadow-[2px_2px_0px_#121314] transition-all"
                    placeholder="ej. Club de Nuit Intense Man Pure Parfum"
                  />
                </div>

                {/* Brand House Selector */}
                <div>
                  <label className="font-black uppercase tracking-wider text-[#121314] block mb-1">Casa / Marca</label>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {['Armaf', 'Afnan', 'Lattafa', 'Al Haramain', 'Fórmula 1370'].map((b) => (
                      <button
                        type="button"
                        key={b}
                        onClick={() => setFormBrand(b)}
                        className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider transition cursor-pointer border-2 border-[#121314] ${
                          formBrand === b
                            ? 'bg-[#121314] text-white shadow-[2px_2px_0px_#ff78ac]'
                            : 'bg-[#f6f4ee] text-[#121314] hover:bg-white'
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
                    className="w-full bg-[#f6f4ee] border-2 border-[#121314] rounded-xl px-3 py-2 text-xs font-bold text-[#121314] outline-none focus:bg-white focus:shadow-[2px_2px_0px_#121314]"
                    placeholder="O escribe otra casa..."
                  />
                </div>

                {/* Volume Selector */}
                <div className="p-4 rounded-2xl bg-[#f6f4ee] border-2 border-[#121314] space-y-2 shadow-[2px_2px_0px_#121314]">
                  <div className="flex items-center justify-between">
                    <label className="font-black uppercase tracking-wider text-[#121314] block">
                      Presentaciones Disponibles (Volumen)
                    </label>
                    <span className="text-[10px] bg-[#ff78ac] text-[#121314] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#121314]">
                      {formVolumes.length === 1 ? `${formVolumes[0]} ml único` : `${formVolumes.join(' & ')} ml`}
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-[#121314]/70">
                    Selecciona las presentaciones activas del perfume.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1">
                    {[50, 60, 80, 90, 100, 120, 150].map((vol) => {
                      const isSelected = formVolumes.includes(vol)
                      return (
                        <button
                          type="button"
                          key={vol}
                          onClick={() => {
                            if (isSelected) {
                              if (formVolumes.length > 1) {
                                setFormVolumes(formVolumes.filter((v) => v !== vol))
                              }
                            } else {
                              setFormVolumes([...formVolumes, vol].sort((a, b) => a - b))
                            }
                          }}
                          className={`py-2 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer border-2 border-[#121314] ${
                            isSelected
                              ? 'bg-[#121314] text-white shadow-[2px_2px_0px_#0ffcbe]'
                              : 'bg-white text-[#121314] hover:bg-[#a8d5e3]'
                          }`}
                        >
                          <span>{vol} ml</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Aura / Accent Color (For Showcase 3D and Catalog Glow) */}
                <div className="p-4 rounded-2xl bg-[#f6f4ee] border-2 border-[#121314] space-y-3 shadow-[2px_2px_0px_#121314]">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-black uppercase tracking-wider text-[#121314] block">
                        Tono Distintivo (Aura en Showcase 3D y Tarjeta)
                      </label>
                      <span className="text-[11px] font-medium text-[#121314]/70">
                        Define la iluminación ambiental 3D dinámica y halo de la fragancia.
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white border-2 border-[#121314] px-2 py-1 rounded-lg shadow-[2px_2px_0px_#121314]">
                      <span className="text-[10px] text-[#121314] font-mono font-black">{formAccentColor}</span>
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
                      { color: '#ffffff', label: 'Blanco Cristal / Diamante' },
                      { color: '#000000', label: 'Negro Azabache / Onyx' },
                      { color: '#00d2ff', label: 'Celeste / Azul Eléctrico' },
                      { color: '#2563eb', label: 'Azul Francia / Bleu Royal' },
                      { color: '#1e40af', label: 'Azul Oscuro / Noche' },
                      { color: '#38bdf8', label: 'Zafiro Océano' },
                      { color: '#6366f1', label: 'Azul Medianoche' },
                      { color: '#10b981', label: 'Esmeralda Árabe' },
                      { color: '#14b8a6', label: 'Turquesa Imperial' },
                      { color: '#f43f5e', label: 'Rubí Pasión' },
                      { color: '#be123c', label: 'Bordeaux Vino' },
                      { color: '#ec4899', label: 'Rose Gold' },
                      { color: '#f59e0b', label: 'Ámbar Cálido' },
                      { color: '#eab308', label: 'Oro Champagne' },
                      { color: '#ea580c', label: 'Coñac & Canela' },
                      { color: '#783c1d', label: 'Marrón Chocolate / Madera Noble' },
                      { color: '#c084fc', label: 'Amatista Mística' },
                      { color: '#94a3b8', label: 'Platino / Titanio' },
                    ].map((swatch) => (
                      <button
                        type="button"
                        key={swatch.color}
                        onClick={() => setFormAccentColor(swatch.color)}
                        title={swatch.label}
                        className={`group relative w-8 h-8 rounded-full transition-all cursor-pointer border-2 border-[#121314] flex items-center justify-center shadow-[1px_1px_0px_#121314] ${
                          formAccentColor.toLowerCase() === swatch.color.toLowerCase()
                            ? 'scale-125 ring-2 ring-[#121314] shadow-[3px_3px_0px_#121314] z-10'
                            : 'hover:scale-110'
                        }`}
                        style={{ backgroundColor: swatch.color }}
                      >
                        {formAccentColor.toLowerCase() === swatch.color.toLowerCase() && (
                          <span
                            className={`w-2 h-2 rounded-full ${
                              swatch.color === '#ffffff' ? 'bg-black' : 'bg-white'
                            } shadow-xs`}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-black uppercase tracking-wider text-[#121314] block mb-1">Categoría</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="bg-[#f6f4ee] text-[#121314] border-2 border-[#121314] rounded-xl px-3 py-2.5 text-xs font-bold w-full outline-none focus:bg-white"
                    >
                      {categories.map((c) => (
                        <option key={c.id || c.slug} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-black uppercase tracking-wider text-[#121314] block mb-1">Precio ($ ARS)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      className="w-full bg-[#f6f4ee] border-2 border-[#121314] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#121314] outline-none focus:bg-white"
                      placeholder="145000.00"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-black uppercase tracking-wider text-[#121314] block">Stock</label>
                      <button
                        type="button"
                        onClick={() => setFormStock((prev) => (parseInt(prev, 10) > 0 ? '0' : '10'))}
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md transition-colors cursor-pointer border border-[#121314] ${
                          parseInt(formStock, 10) === 0
                            ? 'bg-[#0ffcbe] text-[#121314]'
                            : 'bg-[#ff78ac] text-[#121314]'
                        }`}
                      >
                        {parseInt(formStock, 10) === 0 ? 'Activar' : 'Agotar'}
                      </button>
                    </div>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formStock}
                      onChange={(e) => setFormStock(e.target.value)}
                      className="w-full bg-[#f6f4ee] border-2 border-[#121314] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#121314] outline-none focus:bg-white"
                      placeholder="20"
                    />
                  </div>
                </div>

                {/* Product Images & Multi-Photo Gallery */}
                <div className="p-4 rounded-2xl bg-[#f6f4ee] border-2 border-[#121314] space-y-3 shadow-[2px_2px_0px_#121314]">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-black uppercase tracking-wider text-[#121314] block">
                        Fotos del Producto (Galería Multi-Foto)
                      </label>
                      <span className="text-[11px] font-medium text-[#121314]/70">
                        La primera foto será la portada en la tienda.
                      </span>
                    </div>
                    <span className="text-[10px] text-[#121314] bg-[#a8d5e3] border border-[#121314] px-2 py-0.5 rounded-full font-black uppercase">
                      {formImages.length} {formImages.length === 1 ? 'Foto' : 'Fotos'}
                    </span>
                  </div>

                  {/* Upload button */}
                  <div className="space-y-2">
                    <label className="flex items-center justify-center gap-2 px-3.5 py-3 rounded-xl border-2 border-dashed border-[#121314] bg-white hover:bg-[#0ffcbe]/20 text-[#121314] text-xs font-black uppercase tracking-wider cursor-pointer transition-all shadow-[2px_2px_0px_#121314]">
                      <span className="material-symbols-outlined text-[20px]">
                        {uploading ? 'sync' : 'cloud_upload'}
                      </span>
                      <span>
                        {uploading ? 'Subiendo fotos...' : 'Seleccionar Fotos (Multi-Selección)'}
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
                    <div className="flex items-center gap-2">
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
                        className="flex-1 bg-white border-2 border-[#121314] px-3 py-2 rounded-xl text-xs font-bold text-[#121314] outline-none font-mono"
                        placeholder="O pega una URL de foto..."
                      />
                      <button
                        type="button"
                        onClick={handleAddUrlImage}
                        disabled={!urlInput.trim()}
                        className="px-4 py-2 rounded-xl bg-[#121314] text-white hover:bg-neutral-800 text-xs font-black uppercase border-2 border-[#121314] cursor-pointer disabled:opacity-40 transition-all shrink-0"
                      >
                        Añadir
                      </button>
                    </div>

                    {uploadSuccess && (
                      <div className="p-2.5 rounded-xl bg-[#0ffcbe] border-2 border-[#121314] text-[#121314] text-xs font-black uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#121314]">
                        <span className="material-symbols-outlined text-[16px]">verified</span>
                        <span>Fotos añadidas con éxito a la galería</span>
                      </div>
                    )}
                    {uploadError && <p className="text-[11px] font-bold text-[#d92d20]">{uploadError}</p>}
                  </div>

                  {/* Gallery Thumbnails Grid */}
                  {formImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                      {formImages.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className={`relative rounded-xl border-2 p-1.5 bg-white flex flex-col items-center justify-between gap-1 shadow-[2px_2px_0px_#121314] transition-all group ${
                            idx === 0 ? 'border-[#121314] ring-2 ring-[#0ffcbe]' : 'border-[#121314]'
                          }`}
                        >
                          <div className="w-full aspect-square rounded-lg overflow-hidden flex items-center justify-center bg-[#f6f4ee] border border-[#121314]/20">
                            <img
                              src={imgUrl}
                              alt={`Foto ${idx + 1}`}
                              className="max-h-full max-w-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/hero-perfumes/odyssey-aqua.png'
                              }}
                            />
                          </div>

                          {idx === 0 && (
                            <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-[#0ffcbe] text-[#121314] border border-[#121314] text-[9px] font-black uppercase">
                              Portada
                            </span>
                          )}

                          <div className="w-full flex items-center justify-between gap-1 pt-1">
                            {idx !== 0 ? (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(idx)}
                                className="text-[10px] text-[#106ebe] hover:underline font-black uppercase cursor-pointer"
                              >
                                Portada
                              </button>
                            ) : (
                              <span className="text-[10px] text-[#121314]/50 font-black uppercase">Principal</span>
                            )}

                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="w-5 h-5 rounded flex items-center justify-center text-[#d92d20] hover:bg-red-100 cursor-pointer"
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
                  <label className="font-black uppercase tracking-wider text-[#121314] block mb-1">Descripción Detallada</label>
                  <textarea
                    rows={3}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="w-full bg-[#f6f4ee] border-2 border-[#121314] rounded-xl px-3.5 py-2 text-xs font-bold text-[#121314] outline-none focus:bg-white"
                    placeholder="Describe las notas olfativas, fijación y procedencia del perfume..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t-2 border-[#121314]/15">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-full bg-white hover:bg-[#f6f4ee] text-[#121314] border-2 border-[#121314] shadow-[2px_2px_0px_#121314] font-black uppercase tracking-wider text-xs cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-[#0ffcbe] hover:bg-[#00eaad] text-[#121314] border-2 border-[#121314] shadow-[3px_3px_0px_#121314] font-black uppercase tracking-wider text-xs cursor-pointer transition-all"
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
