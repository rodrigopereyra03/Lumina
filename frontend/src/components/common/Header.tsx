import React from 'react'
import { Link } from 'react-router-dom'
import { CATEGORIES } from '../../features/ecommerce/data/productsData'
import { useCartStore } from '../../store/useCartStore'

interface HeaderProps {
  selectedCategorySlug: string
  onCategorySelect: (slug: string) => void
}

export const Header: React.FC<HeaderProps> = ({
  selectedCategorySlug,
  onCategorySelect,
}) => {
  const { items, openDrawer } = useCartStore()
  const totalItemsCount = items.reduce((acc, item) => acc + item.quantity, 0)

  return (
    <header className="sticky top-0 z-30 border-b border-white/50 shadow-[0_10px_30px_rgba(0,0,0,0.03)] bg-[#fbf9f8]/85 backdrop-blur-[20px] flex justify-between items-center px-4 md:px-12 py-3.5 w-full font-body text-[#1b1c1c]">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5b403e] text-[18px]">
          search
        </span>
        <input
          type="text"
          placeholder="Buscar productos de alta gama, cámaras, audio..."
          className="w-full bg-white/70 border border-white/80 rounded-full py-2 pl-10 pr-4 text-xs placeholder:text-[#5b403e]/70 focus:outline-none focus:ring-2 focus:ring-[#FF4D4F]/30 transition-all"
        />
      </div>

      {/* Category Pills (Desktop) */}
      <div className="hidden xl:flex items-center gap-1.5 mx-4">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategorySlug === cat.slug

          return (
            <button
              key={cat.id}
              onClick={() => onCategorySelect(cat.slug)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-[#FF4D4F] text-white shadow-sm shadow-[#FF4D4F]/30'
                  : 'text-[#5b403e] hover:bg-white/60 hover:text-[#1b1c1c]'
              }`}
            >
              {cat.name}
            </button>
          )
        })}
      </div>

      {/* Right Controls: Cart & Profile */}
      <div className="flex items-center gap-3">
        {/* Cart Trigger */}
        <button
          onClick={openDrawer}
          className="relative p-2.5 rounded-full bg-white/70 hover:bg-white border border-white/80 shadow-2xs text-[#1b1c1c] transition-all cursor-pointer hover:scale-105"
          title="Abrir Carrito"
        >
          <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
          {totalItemsCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#FF4D4F] text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
              {totalItemsCount}
            </span>
          )}
        </button>

        {/* User Avatar link */}
        <Link
          to="/login"
          className="p-1 rounded-full hover:ring-2 hover:ring-[#FF4D4F]/40 transition-all cursor-pointer"
          title="Iniciar Sesión"
        >
          <img
            alt="Usuario"
            className="w-8 h-8 rounded-full object-cover border border-white shadow-2xs"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDsAngPk9rQZQjrTsirIfkWPnvlCngc9MZQOD_kJo2OHxteBApsxWzBFHZ_fqwFcjLlHiajiU3MbpxrVbUInX6XhkO3ZhM-Zm62bc8_t2j6hIGOiRkKoMOp2U2YX4M9kZVoLWnQ5mVwPFJqp_1-KZoZLotJNNwVdbcajfsMnFMiF020ITw-29dQXpxa2aCgTjujefQQV_K7k2m9xGfmgjkw8pRRbM9bGToT2Syl1OsHVbV-2182g32y"
          />
        </Link>
      </div>
    </header>
  )
}
