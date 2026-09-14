import React from 'react'
import { motion } from 'framer-motion'
import { useThemeStore } from '../../store/useThemeStore'

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useThemeStore()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative p-2 rounded-full border transition-all duration-300 cursor-pointer flex items-center justify-center ${
        isDark
          ? 'bg-white/5 border-white/10 text-amber-300 hover:bg-white/10 hover:border-white/20 shadow-xs'
          : 'bg-white/80 border-white/80 text-[#5b403e] hover:text-[#1b1c1c] hover:bg-white shadow-xs'
      } ${className}`}
      title={isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro (Obsidian & Coral)'}
      aria-label="Toggle dark/light mode"
    >
      <motion.div
        key={theme}
        initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center justify-center"
      >
        <span
          className="material-symbols-outlined text-[19px]"
          style={isDark ? { fontVariationSettings: "'FILL' 1" } : { fontVariationSettings: "'FILL' 0" }}
        >
          {isDark ? 'light_mode' : 'dark_mode'}
        </span>
      </motion.div>
    </button>
  )
}
