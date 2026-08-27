import { axiosInstance } from './axiosInstance'
import { CATEGORIES } from '../features/ecommerce/data/productsData'

export interface BackendCategoryDTO {
  id: string
  name: string
  slug: string
  icon: string
  products_count?: number
}

export interface ListCategoriesResponseContent {
  categories: BackendCategoryDTO[]
}

export const categoriesApi = {
  getCategories: async (): Promise<ListCategoriesResponseContent> => {
    try {
      const res = await axiosInstance.get('/categories', { timeout: 2500 })
      return res.data.content || res.data
    } catch (e) {
      return {
        categories: CATEGORIES.filter((c) => c.slug !== 'all').map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          icon: 'category',
        })),
      }
    }
  },

  createCategory: async (categoryData: { name: string; slug?: string; icon?: string }): Promise<BackendCategoryDTO> => {
    try {
      const res = await axiosInstance.post('/categories', categoryData)
      return res.data.content || res.data
    } catch (e) {
      return {
        id: 'cat-' + Date.now(),
        name: categoryData.name,
        slug: categoryData.slug || categoryData.name.toLowerCase(),
        icon: categoryData.icon || 'category',
      }
    }
  },
}
