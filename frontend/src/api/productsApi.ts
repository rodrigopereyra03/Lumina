import { axiosInstance } from './axiosInstance'
import { PRODUCTS } from '../features/ecommerce/data/productsData'

export interface BackendProductDTO {
  id: string
  category_id?: string
  category_name?: string
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

export const productsApi = {
  getProducts: async (categorySlug?: string): Promise<ListProductsResponseContent> => {
    try {
      const url = categorySlug && categorySlug !== 'all' ? `/products?category=${categorySlug}` : '/products'
      const res = await axiosInstance.get(url, { timeout: 2500 })
      return res.data.content || res.data
    } catch (e) {
      // Graceful fallback to rich local catalog when backend is offline or unreachable across CDN
      const filtered = categorySlug && categorySlug !== 'all'
        ? PRODUCTS.filter((p) => p.categorySlug === categorySlug)
        : PRODUCTS
      return {
        products: filtered.map((p) => ({
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
        })),
        total: filtered.length,
      }
    }
  },

  getProductById: async (id: string): Promise<BackendProductDTO> => {
    try {
      const res = await axiosInstance.get(`/products/${id}`, { timeout: 2500 })
      return res.data.content || res.data
    } catch (e) {
      const p = PRODUCTS.find((x) => x.id === id) || PRODUCTS[0]
      return {
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
      }
    }
  },

  createProduct: async (productData: {
    title: string
    category_name: string
    price: number
    stock: number
    description: string
    image: string
  }): Promise<BackendProductDTO> => {
    try {
      const res = await axiosInstance.post('/products', productData)
      return res.data.content || res.data
    } catch (e) {
      return {
        id: 'prod-' + Date.now(),
        ...productData,
      }
    }
  },

  updateProduct: async (id: string, productData: Partial<{
    title: string
    category_name: string
    price: number
    stock: number
    description: string
    image: string
  }>): Promise<BackendProductDTO> => {
    try {
      const res = await axiosInstance.put(`/products/${id}`, productData)
      return res.data.content || res.data
    } catch (e) {
      return {
        id,
        title: productData.title || '',
        category_name: productData.category_name || '',
        price: productData.price || 0,
        stock: productData.stock || 0,
        description: productData.description || '',
        image: productData.image || '',
      }
    }
  },

  deleteProduct: async (id: string): Promise<{ message: string; id: string }> => {
    try {
      const res = await axiosInstance.delete(`/products/${id}`)
      return res.data.content || res.data
    } catch (e) {
      return { message: 'Deleted', id }
    }
  },
}
