import { axiosInstance } from './axiosInstance'

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

const cleanProductList = (list: BackendProductDTO[]): BackendProductDTO[] => {
  return list.filter((p) => p.id !== 'test-mp-10-ars')
}

export const productsApi = {
  getProducts: async (categorySlug?: string): Promise<ListProductsResponseContent> => {
    try {
      const url = categorySlug && categorySlug !== 'all' ? `/products?category=${categorySlug}` : '/products'
      const res = await axiosInstance.get(url, { timeout: 3000 })
      const remote = res.data.content || res.data
      if (remote?.products && Array.isArray(remote.products) && remote.products.length > 0) {
        let mappedRemote: BackendProductDTO[] = remote.products
          .filter((p: any) => p.id !== 'test-mp-10-ars')
          .map((p: any) => ({
            id: p.id,
            title: p.title,
            subtitle: p.subtitle || '',
            description: p.description || '',
            price: p.price,
            original_price: p.original_price,
            stock: p.stock,
            image: p.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
            rating: p.rating || 5.0,
            reviews_count: p.reviews_count || 0,
            category_name: p.category_name || 'General',
            category_slug:
              p.category_slug ||
              (p.category_name
                ? p.category_name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-')
                : 'general'),
          }))

        // Save remote database products directly to local cache
        localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(mappedRemote))

        const filtered = categorySlug && categorySlug !== 'all'
          ? mappedRemote.filter((p) => {
              const s = (p.category_slug || p.category_name || '').toLowerCase()
              const target = categorySlug.toLowerCase()
              return s.includes(target) || target.includes(s)
            })
          : mappedRemote

        return {
          products: filtered,
          total: filtered.length,
        }
      }
    } catch (e) {
      console.info('Using local product cache...')
    }

    // Fallback to local cache only if backend is unreachable
    const stored = localStorage.getItem(CUSTOM_PRODUCTS_KEY)
    let localProducts: BackendProductDTO[] = stored ? cleanProductList(JSON.parse(stored)) : []

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
    try {
      const res = await axiosInstance.get(`/products/${id}`, { timeout: 2500 })
      const remote = res.data.content || res.data
      if (remote?.id) return remote
    } catch (e) {}

    const stored = localStorage.getItem(CUSTOM_PRODUCTS_KEY)
    const list: BackendProductDTO[] = stored ? cleanProductList(JSON.parse(stored)) : []
    const found = list.find((p) => p.id === id)
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

    const stored = localStorage.getItem(CUSTOM_PRODUCTS_KEY)
    const list: BackendProductDTO[] = stored ? cleanProductList(JSON.parse(stored)) : []
    const updated = [newProd, ...list.filter((p) => p.id !== newProd.id)]
    localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(updated))

    try {
      const res = await axiosInstance.post('/products', productData, { timeout: 2500 })
      if (res.data?.content?.id) {
        return res.data.content
      }
    } catch (e) {
      // Handled locally
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
    const stored = localStorage.getItem(CUSTOM_PRODUCTS_KEY)
    const list: BackendProductDTO[] = stored ? cleanProductList(JSON.parse(stored)) : []
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
    const stored = localStorage.getItem(CUSTOM_PRODUCTS_KEY)
    if (stored) {
      const list: BackendProductDTO[] = cleanProductList(JSON.parse(stored))
      const updated = list.filter((p) => p.id !== id)
      localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(updated))
    }

    try {
      await axiosInstance.delete(`/products/${id}`, { timeout: 2500 })
    } catch (e) {
      // Handled
    }

    return { message: 'Deleted', id }
  },
}
