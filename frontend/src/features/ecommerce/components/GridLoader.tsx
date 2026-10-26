import React, { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

// Registrar plugin de React para GSAP
gsap.registerPlugin(useGSAP)

export interface GridLoaderProps {
  /** 4 URLs de imágenes: exactamente una para cada una de las 4 columnas */
  images?: string[]
  /** Callback ejecutado cuando finaliza completamente la animación de la cortina */
  onComplete?: () => void
  /** Duración en segundos del desplazamiento de cada imagen (default: 2s) */
  imageDuration?: number
  /** Stagger entre cada imagen (default: 0.35s) */
  imageStagger?: number
  /** Duración en segundos de la caída de cada columna (default: 1.1s) */
  curtainDuration?: number
  /** Curva de aceleración para el desplazamiento (default: power3.out) */
  imageEase?: string
}

// 4 fotos de perfumería con fondo y color vivo del bucket de Supabase
const DEFAULT_FOUR_IMAGES: string[] = [
  // Columna 1: Odyssey Mandarin Sky Armaf (Supabase Bucket)
  'https://dxxoxzaowyaxpxphqpsd.supabase.co/storage/v1/object/public/product-images/Odyssey_Mandarin_Sky_Armaf_Eau_de_Parfum_con_fondo.webp',
  // Columna 2: Gemini Generated Perfume 1 (Supabase Bucket)
  'https://dxxoxzaowyaxpxphqpsd.supabase.co/storage/v1/object/public/product-images/Gemini_Generated_Image_nrps8wnrps8wnrps.jpg',
  // Columna 3: Gemini Generated Perfume 2 (Supabase Bucket)
  'https://dxxoxzaowyaxpxphqpsd.supabase.co/storage/v1/object/public/product-images/Gemini_Generated_Image_ldsua3ldsua3ldsu.webp',
  // Columna 4: Liam Blue Shine Lattafa (Supabase Bucket)
  'https://dxxoxzaowyaxpxphqpsd.supabase.co/storage/v1/object/public/product-images/100-liam-blue-shine-eau-de-parfum-lattafa-men-women-original-imahg2jbbsfwgecq.webp',
]

export const GridLoader: React.FC<GridLoaderProps> = ({
  images = DEFAULT_FOUR_IMAGES,
  onComplete,
  imageDuration = 2,
  imageStagger = 0.35,
  curtainDuration = 1.1,
  imageEase = 'power3.out',
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isRendered, setIsRendered] = useState(true)

  useGSAP(
    () => {
      // 0. Posicionamiento inicial manejado exclusivamente por GSAP
      gsap.set('.loader-img', { xPercent: -100, scale: 1.15, opacity: 1 })
      gsap.set('.liquid-curtain', {
        clipPath: 'polygon(0% 0%, 35% 0%, 75% 0%, 100% 0%, 100% 100%, 0% 100%)',
      })
      gsap.set('.liquid-wave-beam', { yPercent: -100, opacity: 0 })

      // Inicializar elementos de la web en estado previo (ocultos y desplazados para la cascada)
      const headerEl = document.getElementById('reveal-header')
      const tagEl = document.getElementById('reveal-tag')
      const titleEl = document.getElementById('reveal-title')
      const subEl = document.getElementById('reveal-sub')
      const catalogEl = document.getElementById('reveal-catalog')

      if (headerEl) gsap.set(headerEl, { y: -30, opacity: 0 })
      if (tagEl) gsap.set(tagEl, { y: 20, opacity: 0 })
      if (titleEl) gsap.set(titleEl, { y: 35, opacity: 0 })
      if (subEl) gsap.set(subEl, { y: 25, opacity: 0 })
      if (catalogEl) gsap.set(catalogEl, { y: 45, opacity: 0 })

      const tl = gsap.timeline({
        onComplete: () => {
          setIsRendered(false)
          // Asegurar interacción 100% nativa limpiando estilos inline
          const elementsToClear = [headerEl, tagEl, titleEl, subEl, catalogEl].filter(Boolean)
          if (elementsToClear.length > 0) {
            gsap.set(elementsToClear, { clearProps: 'all' })
          }
          onComplete?.()
        },
      })

      // 1. Movimiento de Cámara Interno: Las fotos entran con micro-zoom (1.15 -> 1.05) y se asientan
      tl.to('.loader-img', {
        xPercent: 0,
        scale: 1.05,
        duration: imageDuration,
        ease: imageEase || 'power3.out',
        stagger: {
          each: imageStagger,
          from: 'start',
        },
      })

      // Sutil movimiento de cámara continuo durante la pausa hacia scale 1.0
      tl.to(
        '.loader-img',
        {
          scale: 1.0,
          duration: 0.5,
          ease: 'power1.out',
        },
        '>-0.1'
      )

      // 2. OPCIÓN 4: CORTINA LÍQUIDA / ONDA DIAGONAL
      // La onda luminosa dorada se enciende y barre en diagonal por la pantalla
      tl.to(
        '.liquid-wave-beam',
        {
          opacity: 1,
          duration: 0.2,
          ease: 'power1.out',
        },
        '+=0.5' // En la pausa de 0.5s con los 4 perfumes vivos
      )

      tl.to(
        '.liquid-wave-beam',
        {
          yPercent: 1250,
          duration: curtainDuration,
          ease: 'power3.inOut',
        },
        '<'
      )

      // La cortina líquida se retrae desde arriba en una onda diagonal orgánica que barre las fotos:
      tl.to(
        '.liquid-curtain',
        {
          clipPath: 'polygon(0% 120%, 35% 135%, 75% 115%, 100% 108%, 100% 100%, 0% 100%)',
          duration: curtainDuration,
          ease: 'power3.inOut',
        },
        '<'
      )

      // 3. CASCADA COREOGRAFIADA DE LA WEB (Staggered Reveal)
      // La web se descubre siguiendo el descenso de la onda líquida
      if (headerEl) {
        tl.to(
          headerEl,
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: 'power3.out',
          },
          '<+0.15'
        )
      }

      if (tagEl) {
        tl.to(
          tagEl,
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: 'power3.out',
          },
          '<+0.08'
        )
      }

      if (titleEl) {
        tl.to(
          titleEl,
          {
            y: 0,
            opacity: 1,
            duration: 0.75,
            ease: 'power3.out',
          },
          '<+0.06'
        )
      }

      if (subEl) {
        tl.to(
          subEl,
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: 'power3.out',
          },
          '<+0.06'
        )
      }

      if (catalogEl) {
        tl.to(
          catalogEl,
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            ease: 'power3.out',
          },
          '<+0.1'
        )
      }
    },
    { scope: containerRef }
  )

  if (!isRendered) return null

  // Tomamos exactamente las 4 imágenes para las 4 columnas
  const fourImages = images.slice(0, 4)

  return (
    <aside
      ref={containerRef}
      className="fixed inset-0 w-screen h-screen z-[9999] overflow-hidden select-none pointer-events-none bg-transparent"
    >
      {/* Contenedor de la cortina líquida con clip-path orgánico */}
      <div
        className="liquid-curtain relative w-full h-full bg-black will-change-transform shadow-[0_30px_70px_rgba(0,0,0,0.95)]"
        style={{
          clipPath: 'polygon(0% 0%, 35% 0%, 75% 0%, 100% 0%, 100% 100%, 0% 100%)',
        }}
      >
        {/* Grilla de 4 columnas (las 4 fotos permanecen vivas y visibles sin fundirse a negro) */}
        <div className="grid grid-cols-4 w-full h-full">
          {fourImages.map((src, colIndex) => (
            <div
              key={colIndex}
              className="loader-col relative bg-black border-r border-white/[0.08] last:border-r-0 h-full w-full overflow-hidden shadow-2xl"
            >
              <div className="relative w-full h-full overflow-hidden">
                <img
                  className="loader-img w-full h-full object-cover block will-change-transform filter brightness-95 contrast-105"
                  src={src}
                  alt={`Columna ${colIndex + 1}`}
                  loading="eager"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Onda luminosa diagonal que viaja por la cresta del corte líquido */}
      <div
        className="liquid-wave-beam absolute -inset-x-[15vw] h-14 bg-gradient-to-b from-amber-400/40 via-yellow-300/25 to-transparent blur-md pointer-events-none z-30 opacity-0 will-change-transform -rotate-3"
      />
    </aside>
  )
}
