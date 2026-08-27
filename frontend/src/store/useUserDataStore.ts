import { create } from 'zustand'

export interface UserAddress {
  id: string
  title: string
  recipient_name: string
  recipient_phone: string
  street_address: string
  city: string
  state: string
  postal_code?: string
  is_default: boolean
}

export interface SavedCard {
  id: string
  cardholder_name: string
  brand: 'visa' | 'mastercard' | 'amex' | 'other'
  last4: string
  expiry: string
  is_default: boolean
}

export interface UserOrder {
  id: string
  order_number: string
  date: string
  items: Array<{
    id: string
    title: string
    variant?: string
    price: number
    quantity: number
    image: string
  }>
  subtotal: number
  total: number
  payment_method: string
  status: 'Aprobado' | 'En Proceso' | 'Entregado' | 'Cancelado'
  status_color: string
}

interface UserDataState {
  addresses: UserAddress[]
  cards: SavedCard[]
  orders: UserOrder[]
  
  loadUserData: (userEmail: string) => void
  addAddress: (userEmail: string, address: Omit<UserAddress, 'id'>) => void
  removeAddress: (userEmail: string, id: string) => void
  addCard: (userEmail: string, card: Omit<SavedCard, 'id'>) => void
  removeCard: (userEmail: string, id: string) => void
  addOrder: (userEmail: string, order: UserOrder) => void
}

export const useUserDataStore = create<UserDataState>((set, get) => ({
  addresses: [],
  cards: [],
  orders: [],

  loadUserData: (userEmail: string) => {
    if (!userEmail) {
      set({ addresses: [], cards: [], orders: [] })
      return
    }

    const addrKey = `lumina_addresses_${userEmail}`
    const cardKey = `lumina_cards_${userEmail}`
    const orderKey = `lumina_orders_${userEmail}`

    const savedAddrs = localStorage.getItem(addrKey)
    const savedCards = localStorage.getItem(cardKey)
    const savedOrders = localStorage.getItem(orderKey)

    set({
      addresses: savedAddrs ? JSON.parse(savedAddrs) : [],
      cards: savedCards ? JSON.parse(savedCards) : [],
      orders: savedOrders ? JSON.parse(savedOrders) : [],
    })
  },

  addAddress: (userEmail: string, newAddr) => {
    const id = 'addr_' + Date.now()
    const item: UserAddress = { ...newAddr, id }
    const updated = [...get().addresses, item]
    if (userEmail) {
      localStorage.setItem(`lumina_addresses_${userEmail}`, JSON.stringify(updated))
    }
    set({ addresses: updated })
  },

  removeAddress: (userEmail: string, id: string) => {
    const updated = get().addresses.filter((a) => a.id !== id)
    if (userEmail) {
      localStorage.setItem(`lumina_addresses_${userEmail}`, JSON.stringify(updated))
    }
    set({ addresses: updated })
  },

  addCard: (userEmail: string, newCard) => {
    const id = 'card_' + Date.now()
    const item: SavedCard = { ...newCard, id }
    const updated = [...get().cards, item]
    if (userEmail) {
      localStorage.setItem(`lumina_cards_${userEmail}`, JSON.stringify(updated))
    }
    set({ cards: updated })
  },

  removeCard: (userEmail: string, id: string) => {
    const updated = get().cards.filter((c) => c.id !== id)
    if (userEmail) {
      localStorage.setItem(`lumina_cards_${userEmail}`, JSON.stringify(updated))
    }
    set({ cards: updated })
  },

  addOrder: (userEmail: string, newOrder: UserOrder) => {
    const updated = [newOrder, ...get().orders.filter((o) => o.id !== newOrder.id && o.order_number !== newOrder.order_number)]
    if (userEmail) {
      localStorage.setItem(`lumina_orders_${userEmail}`, JSON.stringify(updated))
    }
    set({ orders: updated })
  },
}))
