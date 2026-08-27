import { axiosInstance } from './axiosInstance'

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
    const url = categorySlug && categorySlug !== 'all' ? `/products?category=${categorySlug}` : '/products'
    const res = await axiosInstance.get(url)
    return res.data.content || res.data
  },

  getProductById: async (id: string): Promise<BackendProductDTO> => {
    const res = await axiosInstance.get(`/products/${id}`)
    return res.data.content || res.data
  },

  createProduct: async (productData: {
    title: string
    category_name: string
    price: number
    stock: number
    description: string
    image: string
  }): Promise<BackendProductDTO> => {
    const res = await axiosInstance.post('/products', productData)
    return res.data.content || res.data
  },

  updateProduct: async (id: string, productData: Partial<{
    title: string
    category_name: string
    price: number
    stock: number
    description: string
    image: string
  }>): Promise<BackendProductDTO> => {
    const res = await axiosInstance.put(`/products/${id}`, productData)
    return res.data.content || res.data
  },

  deleteProduct: async (id: string): Promise<{ message: string; id: string }> => {
    const res = await axiosInstance.delete(`/products/${id}`)
    return res.data.content || res.data
  },
}
