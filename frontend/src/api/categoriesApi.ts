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

const CUSTOM_CATEGORIES_KEY = 'lumina_custom_categories'

export const categoriesApi = {
  getCategories: async (): Promise<ListCategoriesResponseContent> => {
    // 1. Check local custom categories
    const stored = localStorage.getItem(CUSTOM_CATEGORIES_KEY)
    let localCategories: BackendCategoryDTO[] = stored
      ? JSON.parse(stored)
      : CATEGORIES.filter((c) => c.slug !== 'all').map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          icon: (c as any).icon || 'category',
        }))

    try {
      const res = await axiosInstance.get('/categories', { timeout: 2500 })
      const remote = res.data.content || res.data
      if (remote?.categories && Array.isArray(remote.categories) && remote.categories.length > 0) {
        const mergedMap = new Map<string, BackendCategoryDTO>()
        remote.categories.forEach((c: BackendCategoryDTO) => mergedMap.set(c.slug || c.id, c))
        localCategories.forEach((c: BackendCategoryDTO) => {
          if (!mergedMap.has(c.slug) && !mergedMap.has(c.id)) {
            mergedMap.set(c.slug || c.id, c)
          }
        })
        const mergedList = Array.from(mergedMap.values())
        localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(mergedList))
        return { categories: mergedList }
      }
    } catch (e) {
      // Return local synchronized list
    }

    return { categories: localCategories }
  },

  createCategory: async (categoryData: {
    name: string
    slug?: string
    icon?: string
  }): Promise<BackendCategoryDTO> => {
    const slug =
      categoryData.slug ||
      categoryData.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')

    const newCategory: BackendCategoryDTO = {
      id: 'cat-' + Date.now(),
      name: categoryData.name,
      slug: slug,
      icon: categoryData.icon || 'category',
      products_count: 0,
    }

    const stored = localStorage.getItem(CUSTOM_CATEGORIES_KEY)
    const list: BackendCategoryDTO[] = stored
      ? JSON.parse(stored)
      : CATEGORIES.filter((c) => c.slug !== 'all').map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          icon: (c as any).icon || 'category',
        }))

    const updated = [...list, newCategory]
    localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(updated))

    try {
      await axiosInstance.post('/categories', {
        name: categoryData.name,
        slug: slug,
        icon: categoryData.icon || 'category',
      }, { timeout: 2500 })
    } catch (e) {
      // Handled locally
    }

    return newCategory
  },

  deleteCategory: async (id: string): Promise<{ success: boolean }> => {
    const stored = localStorage.getItem(CUSTOM_CATEGORIES_KEY)
    if (stored) {
      const list: BackendCategoryDTO[] = JSON.parse(stored)
      const updated = list.filter((c) => c.id !== id && c.slug !== id)
      localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(updated))
    }
    return { success: true }
  },
}
