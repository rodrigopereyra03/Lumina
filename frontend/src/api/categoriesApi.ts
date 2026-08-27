import { axiosInstance } from './axiosInstance'

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
    const res = await axiosInstance.get('/categories')
    return res.data.content || res.data
  },

  createCategory: async (categoryData: { name: string; slug?: string; icon?: string }): Promise<BackendCategoryDTO> => {
    const res = await axiosInstance.post('/categories', categoryData)
    return res.data.content || res.data
  },
}
