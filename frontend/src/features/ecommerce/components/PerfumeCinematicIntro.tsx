import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface PerfumeCinematicIntroProps {
  onComplete: () => void
  onSkip?: () => void
}

export const PerfumeCinematicIntro: React.FC<PerfumeCinematicIntroProps> = ({
  onComplete,
}) => {
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<'playing' | 'fading' | 'done'>('playing')
  const [isMuted] = useState(true)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  // Start video playback
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.play().catch((err) => {
      console.log('Autoplay muted fallback:', err)
    })
  }, [])

  // Track video playback progress and trigger luxury crossfade near the climax
  const handleTimeUpdate = () => {
    const video = videoRef.current
    if (!video || phase !== 'playing') return

    const duration = video.duration || 4
    const current = video.currentTime
    const p = Math.min(100, Math.round((current / duration) * 100))
    setProgress(p)

    // Trigger clean editorial crossfade right as the mist sprays towards the viewer
    if (current >= duration - 0.45 || p >= 92) {
      triggerCrossfade()
    }
  }

  const triggerCrossfade = () => {
    if (phase !== 'playing') return
    setPhase('fading')

    // Clean dissolve into the store
    setTimeout(() => {
      setPhase('done')
      onComplete()
    }, 850)
  }

  const handleEnded = () => {
    triggerCrossfade()
  }

  const handleSkip = () => {
    setPhase('done')
    onComplete()
  }

  if (phase === 'done') return null

  return (
    <motion.div
      onClick={handleSkip}
      initial={{ opacity: 1 }}
      animate={
        phase === 'fading'
          ? {
              opacity: 0,
              transition: { duration: 0.85, ease: [0.25, 0.1, 0.25, 1] },
            }
          : { opacity: 1 }
      }
      className="fixed inset-0 z-[9999] overflow-hidden select-none cursor-pointer bg-black flex items-center justify-center pointer-events-auto"
    >
      {/* Top subtle centered brand indicator */}
      <motion.div
        animate={{ opacity: phase === 'fading' ? 0 : 0.6 }}
        transition={{ duration: 0.3 }}
        className="absolute top-8 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center pointer-events-none"
      >
        <span className="text-[10px] tracking-[0.35em] text-white uppercase font-medium">
          FÓRMULA 1370
        </span>
      </motion.div>

      {/* ========================================================================= */}
      {/* CINEMATIC VIDEO (High-end Crossfade with Subtle Motion Flow)               */}
      {/* ========================================================================= */}
      <motion.div
        initial={{ scale: 1 }}
        animate={
          phase === 'fading'
            ? {
                scale: 1.04,
                transition: { duration: 0.85, ease: [0.25, 0.1, 0.25, 1] },
              }
            : { scale: 1 }
        }
        className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden"
      >
        {/* Fullscreen Video Player */}
        <video
          ref={videoRef}
          src="/khamrah_intro_landscape.mp4"
          muted={isMuted}
          autoPlay
          playsInline
          preload="auto"
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          className="w-full h-full object-cover object-center"
        />

        {/* Sleek Minimal Progress Bar floating near the bottom */}
        <motion.div
          animate={{ opacity: phase === 'fading' ? 0 : 1 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2 z-20 w-48 sm:w-64 h-[2.5px] rounded-full bg-white/20 backdrop-blur-sm overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.8)] pointer-events-none"
        >
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.9)]"
            style={{ width: `${progress}%` }}
            transition={{ ease: 'linear' }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

