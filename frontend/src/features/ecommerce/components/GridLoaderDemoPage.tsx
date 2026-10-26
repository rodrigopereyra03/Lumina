import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { GridLoader } from './GridLoader'
import { ProductGrid } from './ProductGrid'
import { RotateCcw, Sliders, ArrowLeft, Sparkles } from 'lucide-react'

export const GridLoaderDemoPage: React.FC = () => {
  const [key, setKey] = useState(0)
  const [hasCompleted, setHasCompleted] = useState(false)
  const [imageDuration, setImageDuration] = useState(2.0)
  const [imageStagger, setImageStagger] = useState(0.3)
  const [curtainDuration, setCurtainDuration] = useState(1.1)
  const [imageEase, setImageEase] = useState('power2.out')
  const [showControls, setShowControls] = useState(true)

  const handleReplay = () => {
    setHasCompleted(false)
    setKey((prev) => prev + 1)
  }

  return (
    <div className="min-h-screen bg-[#070709] text-white relative overflow-x-hidden selection:bg-amber-500/30 selection:text-amber-200">
      {/* GSAP Loading Screen (Unmounts itself after curtain falls) */}
      <GridLoader
        key={key}
        imageDuration={imageDuration}
        imageStagger={imageStagger}
        curtainDuration={curtainDuration}
        imageEase={imageEase}
        onComplete={() => setHasCompleted(true)}
      />

      {/* Main Content behind the curtains */}
      <div id="store-content" className="relative z-10 will-change-transform">
        {/* Top Navbar */}
        <header id="reveal-header" className="sticky top-0 z-30 border-b border-white/10 bg-[#09090b]/80 backdrop-blur-xl px-6 lg:px-14 py-4 flex items-center justify-between will-change-transform">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-2 text-xs uppercase tracking-widest text-amber-400 hover:text-amber-300 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a la tienda principal (Intro Video)</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 tracking-wider uppercase font-semibold">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>
              {hasCompleted ? 'GSAP Loader: Finalizado (Tienda visible)' : 'GSAP Loader: Animando...'}
            </span>
          </div>
        </header>

        {/* Hero Section */}
        <div className="max-w-[1440px] mx-auto px-6 lg:px-14 pt-12 pb-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span id="reveal-tag" className="inline-block text-[10px] tracking-[0.4em] text-amber-400 uppercase font-semibold will-change-transform">
              Curaduría Exclusiva
            </span>
            <h1 id="reveal-title" className="text-3xl sm:text-5xl font-black tracking-tight text-white mt-2 mb-4 will-change-transform">
              Colección Extrait de Parfum
            </h1>
            <p id="reveal-sub" className="text-sm text-gray-400 font-light leading-relaxed will-change-transform">
              Explorá nuestra selección de perfumes nicho y fragancias orientales de alta concentración.
            </p>
          </div>

          {/* Product Catalog */}
          <div id="reveal-catalog" className="will-change-transform">
            <ProductGrid
              selectedCategorySlug="all"
              onProductClick={() => {}}
              searchQuery=""
              onClearSearch={() => {}}
            />
          </div>
        </div>
      </div>

      {/* Floating Control Bar for Live Testing */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {showControls && (
          <div className="w-80 rounded-2xl bg-[#121217]/95 border border-white/15 backdrop-blur-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-xs text-gray-300 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="font-semibold text-white tracking-wide uppercase text-[11px] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                Calibración de Animación
              </span>
              <button
                onClick={() => setShowControls(false)}
                className="text-gray-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Stagger selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-gray-400 flex justify-between">
                <span>Stagger entre imágenes:</span>
                <span className="font-mono text-amber-400 font-bold">{imageStagger}s</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[0.15, 0.3, 0.5].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setImageStagger(s)
                      handleReplay()
                    }}
                    className={`py-1 rounded-lg border text-center transition cursor-pointer font-mono ${
                      imageStagger === s
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300'
                    }`}
                  >
                    {s}s
                  </button>
                ))}
              </div>
            </div>

            {/* Image Duration */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-gray-400 flex justify-between">
                <span>Duración de paso X (-100% a 100%):</span>
                <span className="font-mono text-amber-400 font-bold">{imageDuration}s</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[1.5, 2.0, 2.5].map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      setImageDuration(d)
                      handleReplay()
                    }}
                    className={`py-1 rounded-lg border text-center transition cursor-pointer font-mono ${
                      imageDuration === d
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300'
                    }`}
                  >
                    {d}s
                  </button>
                ))}
              </div>
            </div>

            {/* Curtain Duration */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-gray-400 flex justify-between">
                <span>Duración caída cortina:</span>
                <span className="font-mono text-amber-400 font-bold">{curtainDuration}s</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[0.8, 1.1, 1.5].map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setCurtainDuration(c)
                      handleReplay()
                    }}
                    className={`py-1 rounded-lg border text-center transition cursor-pointer font-mono ${
                      curtainDuration === c
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300'
                    }`}
                  >
                    {c}s
                  </button>
                ))}
              </div>
            </div>

            {/* Ease selection */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-gray-400">Curva de aceleración (Ease):</label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: 'Power2 Out (Suave)', val: 'power2.out' },
                  { label: 'Power3 InOut', val: 'power3.inOut' },
                  { label: 'Expo Out (Cinemático)', val: 'expo.out' },
                  { label: 'Power4 InOut', val: 'power4.inOut' },
                ].map((e) => (
                  <button
                    key={e.val}
                    onClick={() => {
                      setImageEase(e.val)
                      handleReplay()
                    }}
                    className={`py-1 px-2 rounded-lg border text-left text-[10px] transition cursor-pointer ${
                      imageEase === e.val
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-semibold'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300'
                    }`}
                  >
                    {e.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Action Buttons */}
        <div className="flex items-center gap-2">
          {!showControls && (
            <button
              onClick={() => setShowControls(true)}
              className="p-3 rounded-full bg-[#16161d] hover:bg-[#20202a] border border-white/15 text-gray-300 hover:text-white transition shadow-xl cursor-pointer"
              title="Ajustes de animación"
            >
              <Sliders className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleReplay}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold text-xs tracking-wider uppercase flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.5)] transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Repetir Animación GSAP</span>
          </button>
        </div>
      </div>
    </div>
  )
}
