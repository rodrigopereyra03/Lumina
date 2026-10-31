import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { galleryApi, type GalleryItemDTO } from '../../../api/galleryApi'
import { storageApi } from '../../../api/storageApi'

export const GalleryManagement: React.FC = () => {
  const [items, setItems] = useState<GalleryItemDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<'all' | 'video' | 'photo' | 'hidden'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<GalleryItemDTO | null>(null)

  // Upload progress to Supabase Storage
  const [isUploading, setIsUploading] = useState(false)
  const [uploadPercent, setUploadPercent] = useState<number | null>(null)

  // Form Fields
  const [formType, setFormType] = useState<'video' | 'photo'>('photo')
  const [formTitle, setFormTitle] = useState('')
  const [formSubtitle, setFormSubtitle] = useState('')
  const [formSrc, setFormSrc] = useState('')
  const [formPoster, setFormPoster] = useState('')
  const [formAspectRatio, setFormAspectRatio] = useState('aspect-[4/5]')
  const [formIsActive, setFormIsActive] = useState(true)
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null)

  const loadItems = async () => {
    setLoading(true)
    try {
      let data = await galleryApi.getItems()
      if (data.length <= 10) {
        data = await galleryApi.syncCatalogProducts(100)
      }
      setItems(data)
    } finally {
      setLoading(false)
    }
  }

  const handleSyncCatalog = async () => {
    setLoading(true)
    try {
      const updated = await galleryApi.syncCatalogProducts(100)
      setItems(updated)
      showToast(`✓ Catálogo sincronizado (${updated.length} piezas en total)`)
    } catch (e) {
      showToast('⚠️ Error al sincronizar catálogo')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [])

  const showToast = (msg: string) => {
    setFeedbackMsg(msg)
    setTimeout(() => setFeedbackMsg(null), 3000)
  }

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingItem(null)
    setFormType('photo')
    setFormTitle('')
    setFormSubtitle('')
    setFormSrc('')
    setFormPoster('')
    setFormAspectRatio('aspect-[4/5]')
    setFormIsActive(true)
    setIsModalOpen(true)
  }

  // Open modal for Edit
  const handleOpenEdit = (item: GalleryItemDTO) => {
    setEditingItem(item)
    setFormType(item.type)
    setFormTitle(item.title)
    setFormSubtitle(item.subtitle)
    setFormSrc(item.src)
    setFormPoster(item.poster || '')
    setFormAspectRatio(item.aspectRatio)
    setFormIsActive(item.isActive)
    setIsModalOpen(true)
  }

  // Handle local file upload directly to Supabase Storage Bucket
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!formTitle) {
      const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name
      setFormTitle(nameWithoutExt.replace(/[-_]/g, ' '))
    }

    setIsUploading(true)
    setUploadPercent(0)
    try {
      showToast('☁️ Subiendo archivo a Supabase Storage...')
      const folder = formType === 'video' ? 'videos' : 'photos'
      const cloudUrl = await storageApi.uploadMedia(file, folder, (percent) => {
        setUploadPercent(percent)
      })
      setFormSrc(cloudUrl)
      showToast('✓ Archivo subido con éxito al Bucket de Supabase')
    } catch (err: any) {
      console.error('Error al subir a Supabase:', err)
      showToast(`⚠️ Error al subir: ${err?.message || 'Fallo de conexión a Supabase'}`)
    } finally {
      setIsUploading(false)
      setUploadPercent(null)
      e.target.value = ''
    }
  }

  // Handle Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim() || !formSrc.trim()) {
      showToast('⚠️ Por favor completa el título y la imagen o video.')
      return
    }

    try {
      if (editingItem) {
        await galleryApi.updateItem(editingItem.id, {
          type: formType,
          title: formTitle.trim(),
          subtitle: formSubtitle.trim() || (formType === 'video' ? 'Motion Graphic' : 'Fotografía'),
          src: formSrc.trim(),
          poster: formPoster.trim() || undefined,
          aspectRatio: formAspectRatio,
          isActive: formIsActive,
        })
        showToast('✓ Pieza actualizada correctamente.')
      } else {
        await galleryApi.addItem({
          type: formType,
          title: formTitle.trim(),
          subtitle: formSubtitle.trim() || (formType === 'video' ? 'Motion Graphic' : 'Fotografía'),
          src: formSrc.trim(),
          poster: formPoster.trim() || undefined,
          aspectRatio: formAspectRatio,
          isActive: formIsActive,
        })
        showToast('✓ Nueva pieza agregada a la galería.')
      }

      setIsModalOpen(false)
      loadItems()
    } catch (err: any) {
      console.error('Error al guardar en galería:', err)
      showToast(`⚠️ Error al guardar: ${err?.message || 'Memoria excedida.'}`)
    }
  }

  // Toggle visibility
  const handleToggleActive = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newStatus = await galleryApi.toggleActive(id)
    showToast(newStatus ? '✓ Pieza visible en la galería' : '👁️ Pieza oculta de la galería')
    loadItems()
  }

  // Delete
  const handleDelete = async (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm(`¿Seguro que deseas eliminar "${title}" de la galería?`)) {
      await galleryApi.deleteItem(id)
      showToast('✓ Pieza eliminada.')
      loadItems()
    }
  }

  // Reset defaults
  const handleResetDefaults = async () => {
    if (window.confirm('¿Deseas restablecer la galería a las fotos y videos originales por defecto?')) {
      await galleryApi.resetToDefaults()
      showToast('✓ Galería restablecida a los valores por defecto.')
      loadItems()
    }
  }

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filterType === 'video' && item.type !== 'video') return false
      if (filterType === 'photo' && item.type !== 'photo') return false
      if (filterType === 'hidden' && item.isActive) return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = item.title.toLowerCase().includes(q)
        const matchSub = item.subtitle.toLowerCase().includes(q)
        return matchTitle || matchSub
      }
      return true
    })
  }, [items, filterType, searchQuery])

  const totalActive = items.filter((i) => i.isActive).length
  const totalHidden = items.filter((i) => !i.isActive).length

  return (
    <div className="space-y-6 font-dm text-[#121314] select-none">
      {/* Toast Notification */}
      <AnimatePresence>
        {feedbackMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-[#121314] text-white px-5 py-3 rounded-2xl border-2 border-[#121314] neo-box-shadow text-xs font-black uppercase tracking-wider flex items-center gap-2"
          >
            <span>{feedbackMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Bar */}
      <div className="bg-white border-2 border-[#121314] neo-box-shadow rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0ffcbe] border border-[#121314] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#55575a]">
              MÓDULO DE GESTIÓN MULTIMEDIA • {totalActive} PIEZAS ACTIVAS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#121314]">
            Galería Visual &amp; Motion Graphics
          </h1>
          <p className="text-xs text-[#55575a] font-medium mt-1">
            Administra, sube y oculta fotografías de frascos y piezas de video que se exhiben en la tienda pública.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSyncCatalog}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#a8d5e3] border-2 border-[#121314] neo-box-shadow-sm text-xs font-black uppercase text-[#121314] transition cursor-pointer flex items-center gap-1.5"
            title="Sincronizar e importar hasta 100 fotos del catálogo de productos"
          >
            <span className="material-symbols-outlined text-[16px]">sync</span>
            <span>Sincronizar Catálogo (100)</span>
          </button>

          <button
            onClick={handleResetDefaults}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#f6f4ee] border-2 border-[#121314] neo-box-shadow-sm text-xs font-black uppercase text-[#55575a] hover:text-[#121314] transition cursor-pointer"
            title="Restablecer piezas iniciales"
          >
            Restablecer
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 rounded-xl bg-[#0ffcbe] hover:bg-[#00eaad] border-2 border-[#121314] neo-box-shadow text-xs font-black uppercase tracking-wider text-[#121314] transition cursor-pointer flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Nueva Pieza</span>
          </button>
        </div>
      </div>

      {/* Stats Counter & Filter Bar */}
      <div className="bg-white border-2 border-[#121314] neo-box-shadow rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer border-2 ${
              filterType === 'all'
                ? 'bg-[#121314] text-white border-[#121314] neo-box-shadow-sm'
                : 'bg-white text-[#121314] border-transparent hover:bg-[#f6f4ee]'
            }`}
          >
            Todas ({items.length})
          </button>
          <button
            onClick={() => setFilterType('photo')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer border-2 ${
              filterType === 'photo'
                ? 'bg-[#121314] text-white border-[#121314] neo-box-shadow-sm'
                : 'bg-white text-[#121314] border-transparent hover:bg-[#f6f4ee]'
            }`}
          >
            📸 Fotos ({items.filter((i) => i.type === 'photo').length})
          </button>
          <button
            onClick={() => setFilterType('video')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer border-2 ${
              filterType === 'video'
                ? 'bg-[#121314] text-white border-[#121314] neo-box-shadow-sm'
                : 'bg-white text-[#121314] border-transparent hover:bg-[#f6f4ee]'
            }`}
          >
            🎬 Videos ({items.filter((i) => i.type === 'video').length})
          </button>
          <button
            onClick={() => setFilterType('hidden')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer border-2 ${
              filterType === 'hidden'
                ? 'bg-[#121314] text-white border-[#121314] neo-box-shadow-sm'
                : 'bg-white text-[#121314] border-transparent hover:bg-[#f6f4ee]'
            }`}
          >
            👁️ Ocultas ({totalHidden})
          </button>
        </div>

        {/* Search */}
        <div className="relative md:w-64">
          <input
            type="text"
            placeholder="Buscar por título o perfume..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#f6f4ee] border-2 border-[#121314] rounded-xl pl-9 pr-3.5 py-2 text-xs font-bold text-[#121314] placeholder:text-[#55575a] focus:outline-none"
          />
          <span className="material-symbols-outlined text-[17px] absolute left-2.5 top-1/2 -translate-y-1/2 text-[#55575a]">
            search
          </span>
        </div>
      </div>

      {/* Grid of Gallery Items */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-9 h-9 rounded-full border-4 border-[#121314] border-t-[#0ffcbe] animate-spin" />
          <span className="text-xs font-black uppercase text-[#55575a]">Cargando galería...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white border-2 border-[#121314] neo-box-shadow rounded-2xl p-12 text-center space-y-4">
          <span className="material-symbols-outlined text-[48px] text-[#55575a]">photo_library</span>
          <h3 className="text-lg font-black uppercase text-[#121314]">No hay piezas para este filtro</h3>
          <p className="text-xs text-[#55575a]">Haz clic en "Nueva Pieza" para cargar tu primera foto o video.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              layout
              className={`bg-white border-2 border-[#121314] neo-box-shadow rounded-2xl overflow-hidden flex flex-col justify-between transition-opacity ${
                !item.isActive ? 'opacity-50' : 'opacity-100'
              }`}
            >
              {/* Media Preview Box */}
              <div className="relative bg-[#f6f4ee] border-b-2 border-[#121314] aspect-square flex items-center justify-center overflow-hidden p-3 group">
                {item.type === 'video' ? (
                  <video
                    src={item.src}
                    poster={item.poster}
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover rounded-xl"
                    onMouseEnter={(e) => e.currentTarget.play()}
                    onMouseLeave={(e) => {
                      e.currentTarget.pause()
                      e.currentTarget.currentTime = 0
                    }}
                  />
                ) : (
                  <img
                    src={item.src}
                    alt={item.title}
                    className="w-full h-full object-contain p-2"
                  />
                )}

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border border-[#121314] ${
                      item.type === 'video' ? 'bg-[#ff78ac] text-[#121314]' : 'bg-[#a8d5e3] text-[#121314]'
                    }`}
                  >
                    {item.type === 'video' ? '🎬 VIDEO' : '📸 FOTO'}
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border border-[#121314] ${
                      item.isActive ? 'bg-[#0ffcbe] text-[#121314]' : 'bg-gray-300 text-gray-700'
                    }`}
                  >
                    {item.isActive ? 'VISIBLE' : 'OCULTO'}
                  </span>
                </div>
              </div>

              {/* Info & Admin Controls */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-[#55575a] block tracking-wider">
                    {item.subtitle}
                  </span>
                  <h4 className="text-base font-black uppercase text-[#121314] tracking-tight line-clamp-1">
                    {item.title}
                  </h4>
                  <span className="text-[10px] font-bold text-[#888] block mt-0.5">
                    Proporción: {item.aspectRatio.replace('aspect-', '').replace('[', '').replace(']', '')}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t-2 border-[#121314]/10 flex items-center gap-2">
                  <button
                    onClick={(e) => handleToggleActive(item.id, e)}
                    className={`flex-1 py-1.5 px-2 rounded-lg border-2 border-[#121314] text-[11px] font-black uppercase transition cursor-pointer flex items-center justify-center gap-1 ${
                      item.isActive
                        ? 'bg-white hover:bg-gray-100 text-[#121314]'
                        : 'bg-[#0ffcbe] hover:bg-[#00eaad] text-[#121314]'
                    }`}
                    title={item.isActive ? 'Ocultar de la tienda' : 'Mostrar en la tienda'}
                  >
                    <span className="material-symbols-outlined text-[15px]">
                      {item.isActive ? 'visibility_off' : 'visibility'}
                    </span>
                    <span>{item.isActive ? 'Ocultar' : 'Publicar'}</span>
                  </button>

                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded-lg bg-white hover:bg-[#a8d5e3] border-2 border-[#121314] text-[#121314] transition cursor-pointer"
                    title="Editar detalles"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>

                  <button
                    onClick={(e) => handleDelete(item.id, item.title, e)}
                    className="p-1.5 rounded-lg bg-white hover:bg-[#ff78ac] border-2 border-[#121314] text-[#121314] transition cursor-pointer"
                    title="Eliminar pieza"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT MODAL                                                          */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 select-none">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-[#121314]/75 backdrop-blur-xs cursor-pointer"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-xl bg-white border-2 border-[#121314] neo-box-shadow rounded-3xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-5 bg-[#f6f4ee] border-b-2 border-[#121314] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-[#55575a] tracking-widest block">
                    {editingItem ? 'MODIFICAR PIEZA' : 'NUEVA PIEZA MULTIMEDIA'}
                  </span>
                  <h3 className="text-xl font-black uppercase text-[#121314]">
                    {editingItem ? 'Editar Pieza de Galería' : 'Agregar a la Galería'}
                  </h3>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-9 h-9 rounded-full bg-white hover:bg-[#ff78ac] border-2 border-[#121314] neo-box-shadow-sm flex items-center justify-center text-[#121314] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              {/* Modal Form Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
                {/* 1. Type Switcher */}
                <div>
                  <label className="text-xs font-black uppercase text-[#121314] block mb-2">
                    Tipo de Pieza
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormType('photo')}
                      className={`p-3 rounded-xl border-2 border-[#121314] text-xs font-black uppercase flex items-center justify-center gap-2 cursor-pointer transition ${
                        formType === 'photo'
                          ? 'bg-[#a8d5e3] neo-box-shadow-sm'
                          : 'bg-white hover:bg-[#f6f4ee]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                      <span>Fotografía</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormType('video')}
                      className={`p-3 rounded-xl border-2 border-[#121314] text-xs font-black uppercase flex items-center justify-center gap-2 cursor-pointer transition ${
                        formType === 'video'
                          ? 'bg-[#ff78ac] neo-box-shadow-sm'
                          : 'bg-white hover:bg-[#f6f4ee]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">movie</span>
                      <span>Video / Motion</span>
                    </button>
                  </div>
                </div>

                {/* 2. Title & Subtitle */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black uppercase text-[#121314] block mb-1">
                      Título de la Pieza *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Khamrah • Edición Dubái"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full bg-[#f6f4ee] border-2 border-[#121314] rounded-xl px-3.5 py-2 text-xs font-bold text-[#121314] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black uppercase text-[#121314] block mb-1">
                      Casa / Marca o Subtítulo
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Lattafa Parfums"
                      value={formSubtitle}
                      onChange={(e) => setFormSubtitle(e.target.value)}
                      className="w-full bg-[#f6f4ee] border-2 border-[#121314] rounded-xl px-3.5 py-2 text-xs font-bold text-[#121314] focus:outline-none"
                    />
                  </div>
                </div>

                {/* 3. Media URL or Upload File */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-[#121314] block">
                    Archivo o URL del {formType === 'video' ? 'Video MP4' : 'Fotografía'} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      formType === 'video'
                        ? 'https://.../video.mp4 o /purchase-journey.mp4'
                        : 'https://.../foto.webp o /p3.webp'
                    }
                    value={formSrc}
                    onChange={(e) => setFormSrc(e.target.value)}
                    className="w-full bg-[#f6f4ee] border-2 border-[#121314] rounded-xl px-3.5 py-2 text-xs font-bold text-[#121314] focus:outline-none"
                  />

                  {/* Video Quick Presets */}
                  {formType === 'video' && (
                    <div className="pt-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-[#55575a]">Videos listos (Supabase):</span>
                        <button
                          type="button"
                          onClick={() => {
                            setFormSrc(
                              'https://dxxoxzaowyaxpxphqpsd.supabase.co/storage/v1/object/public/product-images/videos/formula-perfume-ad.mp4'
                            )
                            if (!formTitle) setFormTitle('FORMULA • Colección Exclusiva')
                            if (!formSubtitle) setFormSubtitle('Spot Comercial 9:16 • Supabase Cloud')
                            setFormAspectRatio('aspect-[9/16]')
                            setFormPoster('/hero-perfumes/odyssey-aqua.png')
                          }}
                          className="text-[11px] font-bold px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-lg cursor-pointer transition flex items-center gap-1"
                        >
                          <span>🎬 Spot FORMULA (Supabase)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormSrc(
                              'https://dxxoxzaowyaxpxphqpsd.supabase.co/storage/v1/object/public/product-images/videos/reel-obsesion-arabe.mp4'
                            )
                            if (!formTitle) setFormTitle('Obsesión Árabe • Tendencia Viral')
                            if (!formSubtitle) setFormSubtitle('Reel TikTok 9:16 • Supabase Cloud')
                            setFormAspectRatio('aspect-[9/16]')
                            setFormPoster('/reel-obsesion-arabe-poster.jpg')
                          }}
                          className="text-[11px] font-bold px-2 py-1 bg-teal-100 hover:bg-teal-200 text-teal-900 border border-teal-300 rounded-lg cursor-pointer transition flex items-center gap-1"
                        >
                          <span>✨ Reel Obsesión Árabe</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Supabase Storage file upload */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] font-bold text-[#55575a]">O subir archivo al Bucket:</span>
                    <label
                      className={`px-3 py-1 bg-white hover:bg-[#a8d5e3] border border-[#121314] rounded-lg text-xs font-black uppercase text-[#121314] cursor-pointer inline-flex items-center gap-1 transition ${
                        isUploading ? 'opacity-50 pointer-events-none' : ''
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {isUploading ? 'progress_activity' : 'cloud_upload'}
                      </span>
                      <span>{isUploading ? 'Subiendo...' : 'Examinar & Subir a Supabase'}</span>
                      <input
                        type="file"
                        disabled={isUploading}
                        accept={formType === 'video' ? 'video/mp4,video/webm' : 'image/*'}
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>

                    {isUploading && (
                      <span className="text-xs font-black text-[#121314] animate-pulse">
                        {uploadPercent !== null ? `${uploadPercent}%` : 'Procesando...'}
                      </span>
                    )}
                  </div>
                  {isUploading && (
                    <div className="w-full bg-[#121314]/10 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-[#0ffcbe] h-1.5 transition-all duration-300"
                        style={{ width: `${uploadPercent ?? 10}%` }}
                      />
                    </div>
                  )}
                  {formType === 'video' && (
                    <p className="text-[10px] text-[#55575a] italic leading-tight">
                      ☁️ Los videos subidos se alojan directamente en el bucket público de Supabase Storage para máxima velocidad y streaming global.
                    </p>
                  )}
                </div>

                {/* 4. Poster (only for video) */}
                {formType === 'video' && (
                  <div>
                    <label className="text-xs font-black uppercase text-[#121314] block mb-1">
                      Miniatura / Poster del Video (URL opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="https://.../poster.jpg o /hero_product.png"
                      value={formPoster}
                      onChange={(e) => setFormPoster(e.target.value)}
                      className="w-full bg-[#f6f4ee] border-2 border-[#121314] rounded-xl px-3.5 py-2 text-xs font-bold text-[#121314] focus:outline-none"
                    />
                  </div>
                )}

                {/* 5. Aspect Ratio */}
                <div>
                  <label className="text-xs font-black uppercase text-[#121314] block mb-1">
                    Proporción Visual en la Galería
                  </label>
                  <select
                    value={formAspectRatio}
                    onChange={(e) => setFormAspectRatio(e.target.value)}
                    className="w-full bg-[#f6f4ee] border-2 border-[#121314] rounded-xl px-3.5 py-2 text-xs font-bold text-[#121314] focus:outline-none cursor-pointer"
                  >
                    <option value="aspect-[4/5]">Vertical Clásica (4:5) — Ideal Frascos</option>
                    <option value="aspect-[3/4]">Vertical Compacta (3:4) — Tapa &amp; Botella</option>
                    <option value="aspect-square">Cuadrada (1:1) — Detalle / Atomizador</option>
                    <option value="aspect-[16/9]">Panorámica (16:9) — Video Horizontal / Estudio</option>
                    <option value="aspect-[9/16]">Reel Vertical (9:16) — Video Reel 4K</option>
                  </select>
                </div>

                {/* 6. Active Checkbox */}
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 rounded border-2 border-[#121314] text-[#0ffcbe] focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="isActive" className="text-xs font-black uppercase text-[#121314] cursor-pointer">
                    Publicar inmediatamente en la galería pública
                  </label>
                </div>

                {/* Preview Box */}
                {formSrc && (
                  <div className="pt-2">
                    <span className="text-[10px] font-black uppercase text-[#55575a] block mb-1">
                      Vista Previa
                    </span>
                    <div className="w-full max-h-48 bg-[#f6f4ee] border-2 border-[#121314] rounded-xl overflow-hidden flex items-center justify-center p-2">
                      {formType === 'video' ? (
                        <video src={formSrc} controls className="max-h-44 object-contain" />
                      ) : (
                        <img src={formSrc} alt="Preview" className="max-h-44 object-contain" />
                      )}
                    </div>
                  </div>
                )}

                {/* Submit Buttons */}
                <div className="pt-4 border-t-2 border-[#121314] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2 rounded-xl bg-white hover:bg-gray-100 border-2 border-[#121314] text-xs font-black uppercase text-[#121314] cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className={`px-6 py-2 rounded-xl bg-[#0ffcbe] hover:bg-[#00eaad] border-2 border-[#121314] neo-box-shadow text-xs font-black uppercase tracking-wider text-[#121314] cursor-pointer transition ${
                      isUploading ? 'opacity-50 pointer-events-none' : ''
                    }`}
                  >
                    {isUploading ? 'Subiendo archivo...' : editingItem ? 'Guardar Cambios' : 'Subir a la Galería'}
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

export default GalleryManagement
