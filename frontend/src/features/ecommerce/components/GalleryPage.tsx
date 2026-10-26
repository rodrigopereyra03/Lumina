import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { galleryApi, type GalleryItemDTO } from '../../../api/galleryApi'

type MediaFilter = 'all' | 'video' | 'photo'

interface MediaItem {
  id: string
  type: 'video' | 'photo'
  title: string
  subtitle?: string
  src: string
  poster?: string
  aspectRatio: string
}

export const GalleryPage: React.FC = () => {
  const [filter, setFilter] = useState<MediaFilter>('all')
  const [galleryItems, setGalleryItems] = useState<GalleryItemDTO[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({})

  // Fetch items from backoffice galleryApi (1:1 sync with Admin Backoffice)
  useEffect(() => {
    let isMounted = true

    galleryApi.getItems().then((items) => {
      if (isMounted) setGalleryItems(items)
    }).catch(() => {})

    return () => {
      isMounted = false
    }
  }, [])

  // 1:1 reflection of active items managed in Backoffice
  const allItems: MediaItem[] = useMemo(() => {
    return galleryItems
      .filter((i) => i.isActive)
      .map((i) => ({
        id: i.id,
        type: i.type,
        title: i.title,
        subtitle: i.subtitle,
        src: i.src,
        poster: i.poster,
        aspectRatio: i.aspectRatio || (i.type === 'video' ? 'aspect-[16/9]' : 'aspect-[4/5]'),
      }))
  }, [galleryItems])

  // Filter items
  const filteredItems = useMemo(() => {
    if (filter === 'video') return allItems.filter((i) => i.type === 'video')
    if (filter === 'photo') return allItems.filter((i) => i.type === 'photo')
    return allItems
  }, [allItems, filter])

  // Lightbox keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return
      if (e.key === 'Escape') {
        setSelectedIndex(null)
      } else if (e.key === 'ArrowRight') {
        setSelectedIndex((prev) => (prev !== null ? (prev + 1) % filteredItems.length : 0))
      } else if (e.key === 'ArrowLeft') {
        setSelectedIndex((prev) =>
          prev !== null ? (prev - 1 + filteredItems.length) % filteredItems.length : 0
        )
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedIndex, filteredItems.length])

  const currentItem = selectedIndex !== null ? filteredItems[selectedIndex] : null

  return (
    <div className="min-h-screen bg-[#f6f4ee] text-[#121314] font-dm selection:bg-[#ff78ac] selection:text-[#121314] flex flex-col justify-between">
      {/* ========================================================================= */}
      {/* 1. MINIMALIST TOP NAV                                                     */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-[#f6f4ee]/90 backdrop-blur-md border-b-2 border-[#121314] px-6 lg:px-14 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-dm font-black uppercase text-[#121314] bg-white hover:bg-[#a8d5e3] border-2 border-[#121314] neo-box-shadow-sm active:scale-95 transition cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Volver a la Tienda</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff78ac] border border-[#121314] animate-pulse" />
          <span className="font-dm font-black tracking-wider text-xs uppercase text-[#121314]">
            FÓRMULA 1370 • GALERÍA
          </span>
        </div>

        <Link
          to="/hero-3d"
          className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-dm font-black uppercase text-[#121314] bg-white hover:bg-[#0ffcbe] border-2 border-[#121314] neo-box-shadow-sm transition"
        >
          <span>Showcase 3D</span>
          <span className="w-2 h-2 rounded-full bg-[#121314]" />
        </Link>
      </header>

      {/* ========================================================================= */}
      {/* 2. AIRY EDITORIAL HEADER & FILTER BAR                                     */}
      {/* ========================================================================= */}
      <section className="max-w-[1520px] w-full mx-auto px-6 lg:px-14 pt-10 pb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-[#121314] pb-6">
          <div>
            <span className="inline-block text-[10px] font-black uppercase tracking-widest text-[#55575a] mb-2">
              LOOKBOOK &amp; MEDIA ARCHIVE
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-[#121314] leading-none">
              Galería Visual.
            </h1>
          </div>

          {/* Clean Segmented Filter */}
          <div className="inline-flex items-center p-1 rounded-full bg-white border-2 border-[#121314] neo-box-shadow-sm gap-1 self-start md:self-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                filter === 'all'
                  ? 'bg-[#121314] text-white'
                  : 'text-[#55575a] hover:text-[#121314]'
              }`}
            >
              ✦ Todo ({allItems.length})
            </button>
            <button
              onClick={() => setFilter('photo')}
              className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
                filter === 'photo'
                  ? 'bg-[#121314] text-white'
                  : 'text-[#55575a] hover:text-[#121314]'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">photo_camera</span>
              <span>Fotos</span>
            </button>
            <button
              onClick={() => setFilter('video')}
              className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
                filter === 'video'
                  ? 'bg-[#121314] text-white'
                  : 'text-[#55575a] hover:text-[#121314]'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">play_circle</span>
              <span>Motion &amp; Video</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. PURE VISUAL MASONRY WALL (No Cards, Pure Visuals)                      */}
      {/* ========================================================================= */}
      <main className="max-w-[1520px] w-full mx-auto px-6 lg:px-14 pb-20 flex-1">
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          {filteredItems.map((item, idx) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, delay: Math.min(idx * 0.04, 0.4) }}
              onClick={() => setSelectedIndex(idx)}
              className="break-inside-avoid group relative rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-[#121314] neo-box-shadow neo-box-shadow-hover bg-white cursor-pointer select-none"
            >
              {/* Media Element */}
              {item.type === 'video' ? (
                <div className={`relative w-full ${item.aspectRatio} bg-[#121314] overflow-hidden`}>
                  <video
                    ref={(el) => {
                      videoRefs.current[item.id] = el
                    }}
                    src={item.src}
                    poster={item.poster}
                    muted
                    autoPlay
                    playsInline
                    loop
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  {/* Subtle Video Badge Top-Right */}
                  <div className="absolute top-3 right-3 z-10">
                    <span className="w-8 h-8 rounded-full bg-[#121314]/80 backdrop-blur-sm border border-white/30 text-white flex items-center justify-center">
                      <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                    </span>
                  </div>
                </div>
              ) : (
                <div className={`relative w-full ${item.aspectRatio} bg-white flex items-center justify-center overflow-hidden p-3`}>
                  <img
                    src={item.src}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-700 ease-out"
                  />
                </div>
              )}

              {/* Minimalist Hover Overlay with Title ONLY (No descriptions, no prices) */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#121314]/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 text-white">
                  <span className="text-[10px] uppercase font-black tracking-widest text-[#0ffcbe] block">
                    {item.subtitle || (item.type === 'video' ? 'MOTION GRAPHIC' : 'FOTOGRAFÍA')}
                  </span>
                  <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-white leading-tight">
                    {item.title}
                  </h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 4. FULLSCREEN CINEMATIC LIGHTBOX                                          */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {currentItem && (
          <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 sm:p-8 select-none">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedIndex(null)}
              className="absolute inset-0 bg-[#121314]/90 backdrop-blur-md cursor-pointer"
            />

            {/* Lightbox Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="relative max-w-5xl max-h-[90vh] w-full bg-[#f6f4ee] border-2 border-[#121314] neo-box-shadow rounded-3xl overflow-hidden flex flex-col z-10 shadow-2xl"
            >
              {/* Lightbox Top Header */}
              <div className="px-6 py-4 bg-white border-b-2 border-[#121314] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#55575a]">
                    {currentItem.subtitle || (currentItem.type === 'video' ? 'VIDEO / MOTION' : 'FOTO')}
                  </span>
                  <h2 className="text-lg font-black uppercase text-[#121314] tracking-tight">
                    {currentItem.title}
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#55575a] hidden sm:inline-block">
                    {(selectedIndex ?? 0) + 1} de {filteredItems.length}
                  </span>
                  <button
                    onClick={() => setSelectedIndex(null)}
                    className="w-9 h-9 rounded-full bg-white hover:bg-[#ff78ac] border-2 border-[#121314] neo-box-shadow-sm flex items-center justify-center text-[#121314] transition cursor-pointer"
                    title="Cerrar (Esc)"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              </div>

              {/* Lightbox Media Viewport */}
              <div className="relative flex-1 bg-[#121314] flex items-center justify-center min-h-[350px] max-h-[70vh] overflow-hidden">
                {currentItem.type === 'video' ? (
                  <video
                    src={currentItem.src}
                    controls
                    autoPlay
                    playsInline
                    className="max-h-[70vh] w-full object-contain"
                  />
                ) : (
                  <img
                    src={currentItem.src}
                    alt={currentItem.title}
                    className="max-h-[70vh] w-auto max-w-full object-contain p-4"
                  />
                )}

                {/* Prev Arrow */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedIndex((prev) =>
                      prev !== null ? (prev - 1 + filteredItems.length) % filteredItems.length : 0
                    )
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 hover:bg-[#0ffcbe] border-2 border-[#121314] neo-box-shadow-sm flex items-center justify-center text-[#121314] transition cursor-pointer"
                  title="Anterior"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>

                {/* Next Arrow */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedIndex((prev) =>
                      prev !== null ? (prev + 1) % filteredItems.length : 0
                    )
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 hover:bg-[#0ffcbe] border-2 border-[#121314] neo-box-shadow-sm flex items-center justify-center text-[#121314] transition cursor-pointer"
                  title="Siguiente"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
              </div>

              {/* Lightbox Footer Bar */}
              <div className="px-6 py-3.5 bg-white border-t-2 border-[#121314] flex items-center justify-between text-xs font-bold text-[#55575a]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0ffcbe] border border-[#121314]" />
                  <span>FÓRMULA 1370 • Alta Fidelidad Visual</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-block">Usa las flechas ← → del teclado</span>
                  {currentItem.type === 'video' && (
                    <a
                      href={currentItem.src}
                      download
                      className="px-3.5 py-1 rounded-full bg-[#0ffcbe] border border-[#121314] text-[#121314] font-black uppercase text-[10px] tracking-wider hover:bg-[#00eaad] transition"
                    >
                      Descargar MP4
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 5. MINIMALIST FOOTER                                                      */}
      {/* ========================================================================= */}
      <footer className="w-full bg-[#f6f4ee] border-t-2 border-[#121314] py-8 px-6 lg:px-14">
        <div className="max-w-[1520px] mx-auto flex flex-col sm:flex-row items-center justify-between text-xs font-dm text-[#55575a] gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg border-2 border-[#121314] bg-white flex items-center justify-center font-black text-xs text-[#121314]">
              F
            </div>
            <span className="text-[#121314] font-black uppercase tracking-wider">
              FÓRMULA 1370 • LOOKBOOK &amp; MEDIA ARCHIVE
            </span>
          </div>
          <div>© 2025 FÓRMULA 1370 HAUTE PARFUMERIE. Todos los derechos reservados.</div>
        </div>
      </footer>
    </div>
  )
}

export default GalleryPage
