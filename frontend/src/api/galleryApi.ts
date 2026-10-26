import { productsApi } from './productsApi'

export interface GalleryItemDTO {
  id: string
  type: 'video' | 'photo'
  title: string
  subtitle: string
  src: string
  poster?: string
  aspectRatio: string // 'aspect-[4/5]' | 'aspect-[16/9]' | 'aspect-square' | 'aspect-[3/4]'
  isActive: boolean
  createdAt: string
  order?: number
}

const GALLERY_STORAGE_KEY = 'lumina_custom_gallery_items'

// Default seed gallery items (3 Flagship Videos + 6 Curated Editorial Photos)
export const INITIAL_GALLERY_SEEDS: GalleryItemDTO[] = [
  {
    id: 'seed-vid-1',
    type: 'video',
    title: 'Recorrido de Compra Editorial',
    subtitle: 'Motion Graphic 60 FPS',
    src: '/purchase-journey.mp4',
    poster: '/hero_product.png',
    aspectRatio: 'aspect-[16/10]',
    isActive: true,
    createdAt: new Date().toISOString(),
    order: 1,
  },
  {
    id: 'seed-photo-1',
    type: 'photo',
    title: 'Colección Privada Dubái',
    subtitle: 'Extractos de Autor',
    src: '/hero_product.png',
    aspectRatio: 'aspect-[4/5]',
    isActive: true,
    createdAt: new Date().toISOString(),
    order: 2,
  },
  {
    id: 'seed-vid-2',
    type: 'video',
    title: 'Khamrah • Cristal & Especias',
    subtitle: 'Reel Cinemático 4K',
    src: '/khamrah_intro.mp4',
    poster: '/p3.webp',
    aspectRatio: 'aspect-[9/16]',
    isActive: true,
    createdAt: new Date().toISOString(),
    order: 3,
  },
  {
    id: 'seed-photo-2',
    type: 'photo',
    title: 'Khamrah • Cristal Tallado',
    subtitle: 'Lattafa Parfums',
    src: '/p3.webp',
    aspectRatio: 'aspect-[3/4]',
    isActive: true,
    createdAt: new Date().toISOString(),
    order: 4,
  },
  {
    id: 'seed-photo-3',
    type: 'photo',
    title: '9 PM Rebel • Tapa Magnética',
    subtitle: 'Afnan Perfumes',
    src: '/hero-perfumes/9pm-rebel.png',
    aspectRatio: 'aspect-[4/5]',
    isActive: true,
    createdAt: new Date().toISOString(),
    order: 5,
  },
  {
    id: 'seed-vid-3',
    type: 'video',
    title: 'Khamrah • Iluminación de Estudio',
    subtitle: 'Cinema Panorámico 1080p',
    src: '/khamrah_intro_landscape.mp4',
    poster: '/p3.webp',
    aspectRatio: 'aspect-[16/9]',
    isActive: true,
    createdAt: new Date().toISOString(),
    order: 6,
  },
  {
    id: 'seed-photo-4',
    type: 'photo',
    title: 'Odyssey Aqua • Esmalte Marino',
    subtitle: 'Armaf Haute Parfumerie',
    src: '/hero-perfumes/odyssey-aqua.png',
    aspectRatio: 'aspect-square',
    isActive: true,
    createdAt: new Date().toISOString(),
    order: 7,
  },
  {
    id: 'seed-photo-5',
    type: 'photo',
    title: 'Amber Oud • Oro Espejado',
    subtitle: 'Al Haramain',
    src: '/hero-perfumes/amber-oud.png',
    aspectRatio: 'aspect-[4/5]',
    isActive: true,
    createdAt: new Date().toISOString(),
    order: 8,
  },
  {
    id: 'seed-photo-6',
    type: 'photo',
    title: 'Detalle de Maceración & Especias',
    subtitle: 'Batch Code Oficial',
    src: '/p2.webp',
    aspectRatio: 'aspect-[3/4]',
    isActive: true,
    createdAt: new Date().toISOString(),
    order: 9,
  },
]

export const galleryApi = {
  // Get all items. If database products haven't been imported yet, imports up to 100 products.
  getItems: async (): Promise<GalleryItemDTO[]> => {
    let currentList: GalleryItemDTO[] = []

    try {
      const stored = localStorage.getItem(GALLERY_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          currentList = parsed
        }
      }
    } catch (e) {
      console.warn('Error reading gallery items from storage:', e)
    }

    if (currentList.length === 0) {
      currentList = [...INITIAL_GALLERY_SEEDS]
    }

    // If only the 9 initial seeds are present, auto-import the 100 product photos into the admin gallery
    if (currentList.length <= 10) {
      try {
        const res = await productsApi.getProducts()
        if (res.products && res.products.length > 0) {
          const seenSrcs = new Set(currentList.map((i) => i.src))
          const validProducts = res.products
            .filter((p) => p.image && !p.image.includes('placeholder'))
            .slice(0, 100)

          const importedItems: GalleryItemDTO[] = []
          validProducts.forEach((p, idx) => {
            if (!seenSrcs.has(p.image)) {
              seenSrcs.add(p.image)
              importedItems.push({
                id: `gallery-prod-${p.id}`,
                type: 'photo',
                title: p.title,
                subtitle: p.brand || p.category_name || 'Fórmula 1370',
                src: p.image,
                aspectRatio: idx % 3 === 0 ? 'aspect-[3/4]' : idx % 2 === 0 ? 'aspect-[4/5]' : 'aspect-square',
                isActive: true,
                createdAt: new Date().toISOString(),
              })
            }
          })

          currentList = [...currentList, ...importedItems]
          localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(currentList))
        }
      } catch (err) {
        console.warn('Error syncing products into gallery:', err)
      }
    }

    return currentList
  },

  // Explicitly import / re-sync up to 100 products from the catalog
  syncCatalogProducts: async (maxLimit = 100): Promise<GalleryItemDTO[]> => {
    const current = await galleryApi.getItems()
    const seenSrcs = new Set(current.map((i) => i.src))

    try {
      const res = await productsApi.getProducts()
      if (res.products && res.products.length > 0) {
        const validProducts = res.products
          .filter((p) => p.image && !p.image.includes('placeholder'))
          .slice(0, maxLimit)

        const newItems: GalleryItemDTO[] = []
        validProducts.forEach((p, idx) => {
          if (!seenSrcs.has(p.image)) {
            seenSrcs.add(p.image)
            newItems.push({
              id: `gallery-prod-${p.id}`,
              type: 'photo',
              title: p.title,
              subtitle: p.brand || p.category_name || 'Fórmula 1370',
              src: p.image,
              aspectRatio: idx % 3 === 0 ? 'aspect-[3/4]' : idx % 2 === 0 ? 'aspect-[4/5]' : 'aspect-square',
              isActive: true,
              createdAt: new Date().toISOString(),
            })
          }
        })

        const updated = [...current, ...newItems]
        localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(updated))
        return updated
      }
    } catch (err) {
      console.warn('Error syncing catalog products:', err)
    }

    return current
  },

  // Save new item
  addItem: async (itemData: Omit<GalleryItemDTO, 'id' | 'createdAt'>): Promise<GalleryItemDTO> => {
    const current = await galleryApi.getItems()
    const newItem: GalleryItemDTO = {
      ...itemData,
      id: 'gallery_' + Date.now(),
      createdAt: new Date().toISOString(),
    }
    const updated = [newItem, ...current]
    localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(updated))
    return newItem
  },

  // Update existing item
  updateItem: async (id: string, updates: Partial<GalleryItemDTO>): Promise<GalleryItemDTO | null> => {
    const current = await galleryApi.getItems()
    const idx = current.findIndex((i) => i.id === id)
    if (idx === -1) return null
    const updatedItem = { ...current[idx], ...updates }
    current[idx] = updatedItem
    localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(current))
    return updatedItem
  },

  // Toggle active/hidden
  toggleActive: async (id: string): Promise<boolean> => {
    const current = await galleryApi.getItems()
    const item = current.find((i) => i.id === id)
    if (!item) return false
    item.isActive = !item.isActive
    localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(current))
    return item.isActive
  },

  // Delete item
  deleteItem: async (id: string): Promise<boolean> => {
    const current = await galleryApi.getItems()
    const updated = current.filter((i) => i.id !== id)
    localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(updated))
    return true
  },

  // Reset to initial seeds + 100 products
  resetToDefaults: async (): Promise<GalleryItemDTO[]> => {
    localStorage.removeItem(GALLERY_STORAGE_KEY)
    return galleryApi.getItems()
  },
}
