import { axiosInstance } from './axiosInstance'
import { PRODUCTS } from '../features/ecommerce/data/productsData'

export interface BackendProductDTO {
  id: string
  category_id?: string
  category_name?: string
  category_slug?: string
  title: string
  subtitle?: string
  description: string
  price: number
  original_price?: number
  stock: number
  image: string
  rating?: number
  reviews_count?: number
}

export interface ListProductsResponseContent {
  products: BackendProductDTO[]
  total: number
}

const CUSTOM_PRODUCTS_KEY = 'lumina_custom_products'

const getInitialCatalog = (): BackendProductDTO[] => {
  const stored = localStorage.getItem(CUSTOM_PRODUCTS_KEY)
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    } catch (e) {}
  }

  const initial = PRODUCTS.map((p) => ({
    id: p.id,
    title: p.title,
    subtitle: p.subtitle,
    description: p.description,
    price: p.price,
    original_price: p.originalPrice,
    stock: p.stock,
    image: p.image,
    rating: p.rating,
    reviews_count: p.reviewsCount,
    category_name: p.category,
    category_slug: p.categorySlug,
  }))
  localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(initial))
  return initial
}

export const productsApi = {
  getProducts: async (categorySlug?: string): Promise<ListProductsResponseContent> => {
    let localProducts = getInitialCatalog()

    try {
      const url = categorySlug && categorySlug !== 'all' ? `/products?category=${categorySlug}` : '/products'
      const res = await axiosInstance.get(url, { timeout: 2500 })
      const remote = res.data.content || res.data
      if (remote?.products && Array.isArray(remote.products) && remote.products.length > 0) {
        // Merge with remote
        const mergedMap = new Map<string, BackendProductDTO>()
        remote.products.forEach((p: BackendProductDTO) => mergedMap.set(p.id, p))
        localProducts.forEach((p: BackendProductDTO) => {
          if (!mergedMap.has(p.id)) {
            mergedMap.set(p.id, p)
          }
        })
        const mergedList = Array.from(mergedMap.values())
        localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(mergedList))
        localProducts = mergedList
      }
    } catch (e) {
      // Return local synchronized list
    }

    const filtered = categorySlug && categorySlug !== 'all'
      ? localProducts.filter((p) => {
          const s = (p.category_slug || p.category_name || '').toLowerCase()
          const target = categorySlug.toLowerCase()
          return s.includes(target) || target.includes(s)
        })
      : localProducts

    return {
      products: filtered,
      total: filtered.length,
    }
  },

  getProductById: async (id: string): Promise<BackendProductDTO> => {
    const list = getInitialCatalog()
    const found = list.find((p) => p.id === id)

    try {
      const res = await axiosInstance.get(`/products/${id}`, { timeout: 2500 })
      const remote = res.data.content || res.data
      if (remote?.id) return remote
    } catch (e) {}

    return found || list[0]
  },

  createProduct: async (productData: {
    title: string
    category_name: string
    category_slug?: string
    price: number
    stock: number
    description: string
    image: string
  }): Promise<BackendProductDTO> => {
    const slug =
      productData.category_slug ||
      productData.category_name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')

    const newProd: BackendProductDTO = {
      id: 'prod-' + Date.now(),
      title: productData.title,
      subtitle: 'Nuevo Ingreso',
      category_name: productData.category_name,
      category_slug: slug,
      price: productData.price,
      stock: productData.stock,
      description: productData.description,
      image: productData.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
      rating: 5.0,
      reviews_count: 0,
    }

    const list = getInitialCatalog()
    const updated = [newProd, ...list]
    localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(updated))

    try {
      await axiosInstance.post('/products', productData, { timeout: 2500 })
    } catch (e) {
      // Handled
    }

    return newProd
  },

  updateProduct: async (
    id: string,
    productData: Partial<{
      title: string
      category_name: string
      category_slug?: string
      price: number
      stock: number
      description: string
      image: string
    }>
  ): Promise<BackendProductDTO> => {
    const list = getInitialCatalog()
    const updated = list.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          ...productData,
          category_slug:
            productData.category_slug ||
            (productData.category_name
              ? productData.category_name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-')
              : p.category_slug),
        }
      }
      return p
    })
    localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(updated))

    try {
      await axiosInstance.put(`/products/${id}`, productData, { timeout: 2500 })
    } catch (e) {
      // Handled
    }

    const updatedItem = updated.find((p) => p.id === id)!
    return updatedItem
  },

  deleteProduct: async (id: string): Promise<{ message: string; id: string }> => {
    const list = getInitialCatalog()
    const updated = list.filter((p) => p.id !== id)
    localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(updated))

    try {
      await axiosInstance.delete(`/products/${id}`, { timeout: 2500 })
    } catch (e) {
      // Handled
    }

    return { message: 'Deleted', id }
  },
}
