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

const OLD_CAT_SLUGS = ['electronics', 'fashion', 'home', 'beauty', 'sports']

const DEFAULT_PERFUME_CATEGORIES: BackendCategoryDTO[] = [
  { id: 'lattafa', name: 'Lattafa', slug: 'lattafa', icon: 'spa' },
  { id: 'maison-alhambra', name: 'Maison Alhambra', slug: 'maison-alhambra', icon: 'spa' },
  { id: 'armaf', name: 'Armaf', slug: 'armaf', icon: 'spa' },
  { id: 'french-avenue', name: 'French Avenue', slug: 'french-avenue', icon: 'spa' },
  { id: 'afnan', name: 'Afnan', slug: 'afnan', icon: 'spa' },
  { id: 'paris-corner', name: 'Paris Corner', slug: 'paris-corner', icon: 'spa' },
  { id: 'rayhaan', name: 'Rayhaan', slug: 'rayhaan', icon: 'spa' },
  { id: 'rasasi', name: 'Rasasi', slug: 'rasasi', icon: 'spa' },
  { id: 'bharara', name: 'Bharara', slug: 'bharara', icon: 'spa' },
  { id: 'al-haramain', name: 'Al Haramain', slug: 'al-haramain', icon: 'spa' },
]

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://dxxoxzaowyaxpxphqpsd.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_rGb_wzMIeOiBp2_qyrdvvg_TB5d4lff'

const fetchCategoriesFromSupabase = async (): Promise<BackendCategoryDTO[]> => {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/categories?select=*&order=name.asc`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    })
    if (!res.ok) return []
    const data = await res.json()
    if (!Array.isArray(data)) return []
    return data
      .filter((c: any) => !OLD_CAT_SLUGS.includes(c.slug))
      .map((c: any) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        icon: c.icon || 'spa',
      }))
  } catch {
    return []
  }
}

export const categoriesApi = {
  getCategories: async (): Promise<ListCategoriesResponseContent> => {
    // 1. Fetch from backend API (if running locally)
    try {
      const res = await axiosInstance.get('/categories', { timeout: 1500 })
      const remote = res.data.content || res.data
      if (remote?.categories && Array.isArray(remote.categories)) {
        const cleanRemote = remote.categories
          .filter((c: BackendCategoryDTO) => !OLD_CAT_SLUGS.includes(c.slug))
        
        if (cleanRemote.length > 0) {
          localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(cleanRemote))
          return { categories: cleanRemote }
        }
      }
    } catch {
      // Backend unreachable or production environment
    }

    // 2. Fetch directly from Supabase REST API (works everywhere in production)
    const remoteSupabase = await fetchCategoriesFromSupabase()
    if (remoteSupabase.length > 0) {
      localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(remoteSupabase))
      return { categories: remoteSupabase }
    }

    // 3. Read local stored categories without old demo categories
    const stored = localStorage.getItem(CUSTOM_CATEGORIES_KEY)
    let localCategories: BackendCategoryDTO[] = stored
      ? JSON.parse(stored).filter((c: any) => !OLD_CAT_SLUGS.includes(c.slug))
      : DEFAULT_PERFUME_CATEGORIES

    if (localCategories.length === 0) {
      localCategories = DEFAULT_PERFUME_CATEGORIES
    }

    localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(localCategories))
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
