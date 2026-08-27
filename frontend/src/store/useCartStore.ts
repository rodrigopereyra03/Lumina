import { create } from 'zustand'

export interface CartItem {
  id: string
  title: string
  price: number
  originalPrice?: number
  quantity: number
  variant?: string
  image: string
  category?: string
}

interface CartState {
  items: CartItem[]
  isDrawerOpen: boolean
  discountCode: string | null
  discountPercent: number
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeItem: (id: string, variant?: string) => void
  updateQuantity: (id: string, quantity: number, variant?: string) => void
  clearCart: () => void
  openDrawer: () => void
  closeDrawer: () => void
  toggleDrawer: () => void
  applyCoupon: (code: string) => boolean
  removeCoupon: () => void
  getTotalItems: () => number
  getSubtotal: () => number
  getDiscountAmount: () => number
  getTotal: () => number
  getFreeShippingThreshold: () => number
}

const FREE_SHIPPING_THRESHOLD = 150

export const useCartStore = create<CartState>((set, get) => {
  // Initialize from localStorage
  const savedCart = typeof window !== 'undefined' ? localStorage.getItem('warm_glass_cart') : null
  const initialItems: CartItem[] = savedCart ? JSON.parse(savedCart) : []

  const persist = (items: CartItem[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('warm_glass_cart', JSON.stringify(items))
    }
  }

  return {
    items: initialItems,
    isDrawerOpen: false,
    discountCode: null,
    discountPercent: 0,

    addItem: (newItem, quantity = 1) => {
      const currentItems = get().items
      const existingIndex = currentItems.findIndex(
        (i) => i.id === newItem.id && (i.variant || '') === (newItem.variant || '')
      )

      let updatedItems: CartItem[]
      if (existingIndex > -1) {
        updatedItems = currentItems.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: item.quantity + quantity } : item
        )
      } else {
        updatedItems = [...currentItems, { ...newItem, quantity }]
      }

      set({ items: updatedItems, isDrawerOpen: true })
      persist(updatedItems)
    },

    removeItem: (id, variant) => {
      const updatedItems = get().items.filter(
        (i) => !(i.id === id && (i.variant || '') === (variant || ''))
      )
      set({ items: updatedItems })
      persist(updatedItems)
    },

    updateQuantity: (id, quantity, variant) => {
      if (quantity <= 0) {
        get().removeItem(id, variant)
        return
      }

      const updatedItems = get().items.map((item) => {
        if (item.id === id && (item.variant || '') === (variant || '')) {
          return { ...item, quantity }
        }
        return item
      })

      set({ items: updatedItems })
      persist(updatedItems)
    },

    clearCart: () => {
      set({ items: [], discountCode: null, discountPercent: 0 })
      persist([])
    },

    openDrawer: () => set({ isDrawerOpen: true }),
    closeDrawer: () => set({ isDrawerOpen: false }),
    toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

    applyCoupon: (code: string) => {
      const normalized = code.trim().toUpperCase()
      if (normalized === 'WARM10' || normalized === 'CORAL10') {
        set({ discountCode: normalized, discountPercent: 10 })
        return true
      }
      if (normalized === 'VIP20') {
        set({ discountCode: normalized, discountPercent: 20 })
        return true
      }
      return false
    },

    removeCoupon: () => set({ discountCode: null, discountPercent: 0 }),

    getTotalItems: () => {
      return get().items.reduce((sum, item) => sum + item.quantity, 0)
    },

    getSubtotal: () => {
      return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    },

    getDiscountAmount: () => {
      const subtotal = get().getSubtotal()
      return (subtotal * get().discountPercent) / 100
    },

    getTotal: () => {
      const subtotal = get().getSubtotal()
      const discount = get().getDiscountAmount()
      const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 15
      return Math.max(0, subtotal - discount + shipping)
    },

    getFreeShippingThreshold: () => FREE_SHIPPING_THRESHOLD,
  }
})
