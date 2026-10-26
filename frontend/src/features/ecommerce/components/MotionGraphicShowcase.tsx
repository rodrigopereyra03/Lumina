import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export const MotionGraphicShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'video' | 'interactive'>('video')

  return (
    <div className="min-h-screen bg-[#f6f4ee] text-[#121314] flex flex-col font-dm select-none">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-50 bg-white border-b-2 border-[#121314] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#121314] bg-white hover:bg-[#a8d5e3] border-2 border-[#121314] neo-box-shadow-sm transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Volver a la Tienda</span>
          </Link>
          <div className="h-4 w-[2px] bg-[#121314]/20 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="font-dm font-black tracking-wider text-sm uppercase text-[#121314]">
              FÓRMULA 1370
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0ffcbe] border border-[#121314] text-[#121314] font-black uppercase">
              OPENEDIT STUDIO
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Format Switcher */}
          <div className="flex items-center p-1 rounded-full bg-[#f6f4ee] border-2 border-[#121314] gap-1">
            <button
              onClick={() => setActiveTab('video')}
              className={`px-4 py-1.5 rounded-full text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'video'
                  ? 'bg-[#121314] text-white'
                  : 'text-[#55575a] hover:text-[#121314]'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">movie</span>
              <span>Video MP4</span>
            </button>
            <button
              onClick={() => setActiveTab('interactive')}
              className={`px-4 py-1.5 rounded-full text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'interactive'
                  ? 'bg-[#121314] text-white'
                  : 'text-[#55575a] hover:text-[#121314]'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">touch_app</span>
              <span>Interactivo (60 FPS)</span>
            </button>
          </div>

          <a
            href="/purchase-journey.mp4"
            download="Formula1370-Customer-Journey.mp4"
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black text-[#121314] bg-[#0ffcbe] hover:bg-[#00eaad] border-2 border-[#121314] neo-box-shadow-sm transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Descargar MP4</span>
          </a>

          <a
            href="/motion-graphic.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold text-[#121314] bg-white hover:bg-[#a8d5e3] border-2 border-[#121314] neo-box-shadow-sm transition"
            title="Abrir en pestaña nueva"
          >
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
          </a>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {/* Intro Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-[#121314] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#106ebe] text-white text-[10px] font-black uppercase tracking-wider border border-[#121314]">
                E-COMMERCE WALKTHROUGH
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#ff78ac] text-[#121314] text-[10px] font-black uppercase tracking-wider border border-[#121314]">
                NEO-EDITORIAL DESIGN
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-[#121314]">
              Flujo de Compra Real &bull; <span className="text-[#106ebe]">Fórmula 1370</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#55575a] font-medium mt-2 max-w-2xl leading-relaxed">
              Video cinemático renderizado con <strong>OpenEdit</strong> que muestra la experiencia de compra de principio a fin: exploración de catálogo por casas y familias, ficha con render 3D, slide-over del carrito con envío gratis y checkout express con Mercado Pago.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-[#121314] bg-white border-2 border-[#121314] neo-box-shadow-sm px-3.5 py-2 rounded-full">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0ffcbe] border border-[#121314] animate-pulse"></span>
            <span>Customer Journey Activo (24s)</span>
          </div>
        </div>

        {/* Video / Player Frame */}
        <div className="relative w-full aspect-[16/9] lg:aspect-[21/9] rounded-2xl overflow-hidden border-2 border-[#121314] bg-[#0d0f12] shadow-2xl">
          {activeTab === 'video' ? (
            <video
              src="/purchase-journey.mp4"
              controls
              autoPlay
              loop
              playsInline
              className="w-full h-full object-contain bg-black"
            >
              Tu navegador no soporta reproducción de video MP4.
            </video>
          ) : (
            <iframe
              src="/motion-graphic.html"
              title="Fórmula 1370 Customer Purchase Journey"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            />
          )}
        </div>

        {/* 5 Step Breakdown Showcase Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
          <motion.div
            whileHover={{ y: -3 }}
            className="p-4 rounded-2xl bg-white border-2 border-[#121314] neo-box-shadow-sm flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-[#106ebe] bg-[#106ebe]/15 border border-[#106ebe]/40 px-2 py-0.5 rounded-md">
                PASO 1 (0s-4s)
              </span>
              <span className="text-[10px] text-[#55575a] font-bold">HOVER 3D</span>
            </div>
            <h3 className="font-black text-sm text-[#121314] uppercase">Catálogo & Selección</h3>
            <p className="text-xs text-[#55575a] leading-relaxed font-medium">
              Filtro por casas (Armaf) y familias olfativas (Cítrico Marino). Hover sobre <em>Armaf Odyssey Aqua</em> y clic.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="p-4 rounded-2xl bg-white border-2 border-[#121314] neo-box-shadow-sm flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-[#121314] bg-[#a8d5e3] border border-[#121314] px-2 py-0.5 rounded-md">
                PASO 2 (4s-7.5s)
              </span>
              <span className="text-[10px] text-[#55575a] font-bold">SHOWCASE 3D</span>
            </div>
            <h3 className="font-black text-sm text-[#121314] uppercase">Detalle & Volumen</h3>
            <p className="text-xs text-[#55575a] leading-relaxed font-medium">
              Ficha con notas olfativas, selección de 100ml y clic físico en el botón mint <em>"Añadir a la Cesta"</em>.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="p-4 rounded-2xl bg-white border-2 border-[#121314] neo-box-shadow-sm flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-[#121314] bg-[#ff78ac] border border-[#121314] px-2 py-0.5 rounded-md">
                PASO 3 (7.5s-11.5s)
              </span>
              <span className="text-[10px] text-[#55575a] font-bold">DRAWER</span>
            </div>
            <h3 className="font-black text-sm text-[#121314] uppercase">Cesta de Compra</h3>
            <p className="text-xs text-[#55575a] leading-relaxed font-medium">
              El badge salta con rebote elástico. Se abre el Cart Drawer crema con envío asegurado gratis y clic en <em>"Finalizar Pedido"</em>.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="p-4 rounded-2xl bg-white border-2 border-[#121314] neo-box-shadow-sm flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-white bg-[#106ebe] border border-[#121314] px-2 py-0.5 rounded-md">
                PASO 4 (11.5s-17s)
              </span>
              <span className="text-[10px] text-[#55575a] font-bold">CHECKOUT</span>
            </div>
            <h3 className="font-black text-sm text-[#121314] uppercase">Mercado Pago</h3>
            <p className="text-xs text-[#55575a] leading-relaxed font-medium">
              Dirección validada en CABA, selección de cuotas sin interés y clic en el botón de pago seguro.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="p-4 rounded-2xl bg-[#0ffcbe]/20 border-2 border-[#121314] neo-box-shadow-sm flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-[#121314] bg-[#0ffcbe] border border-[#121314] px-2 py-0.5 rounded-md">
                PASO 5 (17s-24s)
              </span>
              <span className="text-[10px] text-[#121314] font-bold">CONFIRMACIÓN</span>
            </div>
            <h3 className="font-black text-sm text-[#121314] uppercase">Orden Confirmada</h3>
            <p className="text-xs text-[#121314] leading-relaxed font-bold">
              Sello verde con orden #F1370-98421, despacho en 24h y alejamiento cinemático en perspectiva 3D.
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

export default MotionGraphicShowcase
