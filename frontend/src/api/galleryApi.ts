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
const DB_NAME = 'lumina_gallery_db'
const DB_VERSION = 1
const STORE_NAME = 'gallery_store'
const STORE_KEY = 'items'

// Lightweight IndexedDB helper for large assets (bypasses 5MB localStorage limit)
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB not supported in this environment'))
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function getStoredItems(): Promise<GalleryItemDTO[] | null> {
  // 1. Try IndexedDB first (huge quota: 50MB - 1GB+)
  try {
    const db = await openDB()
    const items = await new Promise<GalleryItemDTO[] | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const req = store.get(STORE_KEY)
      req.onsuccess = () => resolve(req.result ?? null)
      req.onerror = () => reject(req.error)
    })
    if (items && Array.isArray(items) && items.length > 0) {
      return items
    }
  } catch (e) {
    console.warn('[galleryApi] IndexedDB read error:', e)
  }

  // 2. Fallback: Check localStorage and migrate to IndexedDB if found
  try {
    const stored = localStorage.getItem(GALLERY_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) {
        saveStoredItems(parsed).catch(() => {})
        return parsed
      }
    }
  } catch (e) {
    console.warn('[galleryApi] localStorage read error:', e)
  }

  return null
}

async function saveStoredItems(items: GalleryItemDTO[]): Promise<void> {
  let idbSaved = false

  // 1. Save to IndexedDB
  try {
    const db = await openDB()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const req = store.put(items, STORE_KEY)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
    idbSaved = true
  } catch (e) {
    console.warn('[galleryApi] IndexedDB save error:', e)
  }

  // 2. Mirror to localStorage only if size is small enough (< 2MB)
  try {
    const serialized = JSON.stringify(items)
    if (serialized.length < 2 * 1024 * 1024) {
      localStorage.setItem(GALLERY_STORAGE_KEY, serialized)
    } else {
      // Clear large localStorage payload to prevent QuotaExceededError in future operations
      localStorage.removeItem(GALLERY_STORAGE_KEY)
    }
  } catch (e) {
    // If IndexedDB saved successfully, safely suppress localStorage quota errors
    if (!idbSaved) {
      console.error('[galleryApi] Storage failed:', e)
      throw new Error(
        'El almacenamiento del navegador está lleno. Usa una URL directa (/formula-perfume-ad.mp4 o https://...) para videos pesados.'
      )
    }
  }
}

// Default seed gallery items (Viral Reels + Flagship Videos + Curated Editorial Photos)
export const INITIAL_GALLERY_SEEDS: GalleryItemDTO[] = [
  {
    id: 'seed-vid-formula-ad',
    type: 'video',
    title: 'FORMULA • Colección Exclusiva',
    subtitle: 'Spot Publicitario 9:16 • Supabase Cloud 60 FPS',
    src: 'https://dxxoxzaowyaxpxphqpsd.supabase.co/storage/v1/object/public/product-images/videos/formula-perfume-ad.mp4',
    poster: '/hero-perfumes/odyssey-aqua.png',
    aspectRatio: 'aspect-[9/16]',
    isActive: true,
    createdAt: new Date().toISOString(),
    order: 0,
  },
  {
    id: 'seed-vid-reel-viral',
    type: 'video',
    title: 'Obsesión Árabe • Tendencia Viral',
    subtitle: 'Reel TikTok 9:16 • Supabase Cloud',
    src: 'https://dxxoxzaowyaxpxphqpsd.supabase.co/storage/v1/object/public/product-images/videos/reel-obsesion-arabe.mp4',
    poster: '/reel-obsesion-arabe-poster.jpg',
    aspectRatio: 'aspect-[9/16]',
    isActive: true,
    createdAt: new Date().toISOString(),
    order: 1,
  },
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
    order: 2,
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
    order: 3,
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
    order: 4,
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
    order: 5,
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
    order: 6,
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
    order: 7,
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
    order: 8,
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
    order: 9,
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
    order: 10,
  },
]

export const galleryApi = {
  // Get all items. If database products haven't been imported yet, imports up to 100 products.
  getItems: async (): Promise<GalleryItemDTO[]> => {
    let currentList: GalleryItemDTO[] = []

    const stored = await getStoredItems()
    if (stored && stored.length > 0) {
      currentList = stored
    }

    if (currentList.length === 0) {
      currentList = [...INITIAL_GALLERY_SEEDS]
    }

    // If only initial seeds are present, auto-import the product photos into the gallery
    if (currentList.length <= 12) {
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
          await saveStoredItems(currentList).catch(() => {})
        }
      } catch (err) {
        console.warn('Error syncing products into gallery:', err)
      }
    }

    // Ensure the new FORMULA commercial reel is present at the top (with Supabase Storage URL)
    const formulaAdIdx = currentList.findIndex((i) => i.src.includes('formula-perfume-ad.mp4'))
    if (formulaAdIdx === -1) {
      currentList = [INITIAL_GALLERY_SEEDS[0], ...currentList]
      await saveStoredItems(currentList).catch(() => {})
    } else if (currentList[formulaAdIdx].src.startsWith('/')) {
      // Upgrade local path to Supabase Cloud URL
      currentList[formulaAdIdx].src = INITIAL_GALLERY_SEEDS[0].src
      await saveStoredItems(currentList).catch(() => {})
    }

    // Ensure the viral TikTok reel is present (with Supabase Storage URL)
    const reelIdx = currentList.findIndex((i) => i.src.includes('reel-obsesion-arabe.mp4'))
    if (reelIdx === -1) {
      currentList = [INITIAL_GALLERY_SEEDS[1], ...currentList]
      await saveStoredItems(currentList).catch(() => {})
    } else if (currentList[reelIdx].src.startsWith('/')) {
      // Upgrade local path to Supabase Cloud URL
      currentList[reelIdx].src = INITIAL_GALLERY_SEEDS[1].src
      await saveStoredItems(currentList).catch(() => {})
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
        await saveStoredItems(updated)
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
    await saveStoredItems(updated)
    return newItem
  },

  // Update existing item
  updateItem: async (id: string, updates: Partial<GalleryItemDTO>): Promise<GalleryItemDTO | null> => {
    const current = await galleryApi.getItems()
    const idx = current.findIndex((i) => i.id === id)
    if (idx === -1) return null
    const updatedItem = { ...current[idx], ...updates }
    current[idx] = updatedItem
    await saveStoredItems(current)
    return updatedItem
  },

  // Toggle active/hidden
  toggleActive: async (id: string): Promise<boolean> => {
    const current = await galleryApi.getItems()
    const item = current.find((i) => i.id === id)
    if (!item) return false
    item.isActive = !item.isActive
    await saveStoredItems(current)
    return item.isActive
  },

  // Delete item
  deleteItem: async (id: string): Promise<boolean> => {
    const current = await galleryApi.getItems()
    const updated = current.filter((i) => i.id !== id)
    await saveStoredItems(updated)
    return true
  },

  // Reset to initial seeds + 100 products
  resetToDefaults: async (): Promise<GalleryItemDTO[]> => {
    try {
      localStorage.removeItem(GALLERY_STORAGE_KEY)
      const db = await openDB()
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)
        const req = store.delete(STORE_KEY)
        req.onsuccess = () => resolve()
        req.onerror = () => reject(req.error)
      })
    } catch (e) {
      console.warn('[galleryApi] resetToDefaults error:', e)
    }
    return galleryApi.getItems()
  },
}
