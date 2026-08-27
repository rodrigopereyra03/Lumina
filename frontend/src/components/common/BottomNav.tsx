import React from 'react'
import { useCartStore } from '../../store/useCartStore'

interface BottomNavProps {
  currentTab: 'home' | 'categories' | 'favorites' | 'account'
  onTabChange: (tab: 'home' | 'categories' | 'favorites' | 'account') => void
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const { items, openDrawer } = useCartStore()
  const totalItemsCount = items.reduce((acc, item) => acc + item.quantity, 0)

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#fbf9f8]/90 backdrop-blur-[20px] border-t border-white/60 px-4 py-2 flex justify-around items-center font-body shadow-lg">
      <button
        onClick={() => onTabChange('home')}
        className={`flex flex-col items-center gap-1 cursor-pointer py-1 ${
          currentTab === 'home' ? 'text-[#FF4D4F]' : 'text-[#5b403e]'
        }`}
      >
        <span className="material-symbols-outlined text-[20px]">home</span>
        <span className="text-[10px] font-bold">Inicio</span>
      </button>

      <button
        onClick={() => onTabChange('categories')}
        className={`flex flex-col items-center gap-1 cursor-pointer py-1 ${
          currentTab === 'categories' ? 'text-[#FF4D4F]' : 'text-[#5b403e]'
        }`}
      >
        <span className="material-symbols-outlined text-[20px]">grid_view</span>
        <span className="text-[10px] font-bold">Categorías</span>
      </button>

      {/* Cart Button */}
      <button
        onClick={openDrawer}
        className="flex flex-col items-center gap-1 text-[#5b403e] relative cursor-pointer py-1"
      >
        <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
        <span className="text-[10px] font-bold">Carrito</span>
        {totalItemsCount > 0 && (
          <span className="absolute -top-0.5 right-1.5 bg-[#FF4D4F] text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
            {totalItemsCount}
          </span>
        )}
      </button>

      <button
        onClick={() => onTabChange('favorites')}
        className={`flex flex-col items-center gap-1 cursor-pointer py-1 ${
          currentTab === 'favorites' ? 'text-[#FF4D4F]' : 'text-[#5b403e]'
        }`}
      >
        <span className="material-symbols-outlined text-[20px]">favorite</span>
        <span className="text-[10px] font-bold">Favoritos</span>
      </button>

      <button
        onClick={() => onTabChange('account')}
        className={`flex flex-col items-center gap-1 cursor-pointer py-1 ${
          currentTab === 'account' ? 'text-[#FF4D4F]' : 'text-[#5b403e]'
        }`}
      >
        <span className="material-symbols-outlined text-[20px]">person</span>
        <span className="text-[10px] font-bold">Mi Cuenta</span>
      </button>
    </nav>
  )
}
