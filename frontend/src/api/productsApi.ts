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
  volumes?: number[]
  accent_color?: string
  brand?: string
}

export interface ListProductsResponseContent {
  products: BackendProductDTO[]
  total: number
}

const MOCK_IDS = [
  'lumina-pro-camera',
  'aura-headphones',
  'lumina-smartwatch',
  'minimalist-tote',
  'echo-hub-speaker',
  'zenith-mechanical-board',
  'test-mp-10-ars',
  'c0000001-0000-0000-0000-000000000001',
  'c0000001-0000-0000-0000-000000000002',
  'c0000001-0000-0000-0000-000000000003',
  'c0000001-0000-0000-0000-000000000004',
  'c0000001-0000-0000-0000-000000000005',
  'c0000001-0000-0000-0000-000000000006',
]

const CUSTOM_PRODUCTS_KEY = 'lumina_custom_products'

const cleanProductList = (list: BackendProductDTO[]): BackendProductDTO[] => {
  return list.filter((p) => !MOCK_IDS.includes(p.id)).map((p) => ({
    ...p,
    volumes: p.volumes && p.volumes.length > 0 ? p.volumes : [50, 100],
    accent_color: p.accent_color || '#fb7185',
    brand: p.brand || p.category_name || 'Lumina',
  }))
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://dxxoxzaowyaxpxphqpsd.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_rGb_wzMIeOiBp2_qyrdvvg_TB5d4lff'

const fetchProductsFromSupabase = async (categorySlug?: string): Promise<BackendProductDTO[]> => {
  try {
    const url = `${SUPABASE_URL}/rest/v1/products?select=*,category:categories(id,name,slug)&deleted_at=is.null&order=price.asc`
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    })
    if (!res.ok) return []
    const data = await res.json()
    if (!Array.isArray(data)) return []

    const mapped: BackendProductDTO[] = data
      .filter((p: any) => !MOCK_IDS.includes(p.id))
      .map((p: any) => {
        let meta: any = {}
        let cleanSubtitle = p.subtitle || ''
        if (cleanSubtitle.includes('@@META@@')) {
          const parts = cleanSubtitle.split('@@META@@')
          cleanSubtitle = parts[0].trim()
          try {
            meta = JSON.parse(parts[1])
          } catch (e) {}
        }

        const catName = p.category?.name || p.category_name || meta.brand || 'Perfumes'
        const catSlug =
          p.category?.slug ||
          p.category_slug ||
          (meta.brand ? meta.brand.toLowerCase().replace(/\s+/g, '-') : 'perfumes')
        const brand = meta.brand || p.category?.name || p.brand || 'Lumina'

        return {
          id: p.id,
          title: p.title,
          subtitle: cleanSubtitle,
          description: p.description || '',
          price: p.price,
          original_price: p.original_price,
          stock: p.stock,
          image: p.image || '',
          rating: p.rating || 5.0,
          reviews_count: p.reviews_count || 0,
          category_name: catName,
          category_slug: catSlug,
          volumes: p.volumes || meta.volumes || [50, 100],
          accent_color: p.accent_color || meta.accent_color || '#fb7185',
          brand: brand,
        }
      })

    localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(mapped))

    if (categorySlug && categorySlug !== 'all') {
      const target = categorySlug.toLowerCase()
      return mapped.filter((p) => {
        const s = (p.category_slug || p.category_name || '').toLowerCase()
        const b = (p.brand || '').toLowerCase()
        return s.includes(target) || target.includes(s) || b.includes(target)
      })
    }

    return mapped
  } catch (err) {
    console.error('Failed to fetch from Supabase REST:', err)
    return []
  }
}

export const productsApi = {
  getProducts: async (categorySlug?: string): Promise<ListProductsResponseContent> => {
    // 1. Try local Go backend (if running)
    try {
      const url = categorySlug && categorySlug !== 'all' ? `/products?category=${categorySlug}` : '/products'
      const res = await axiosInstance.get(url, { timeout: 1500 })
      const remote = res.data.content || res.data
      if (remote && Array.isArray(remote.products) && remote.products.length > 0) {
        let mappedRemote: BackendProductDTO[] = remote.products
          .filter((p: any) => !MOCK_IDS.includes(p.id))
          .map((p: any) => {
            let parsedMeta: any = {}
            let cleanSubtitle = p.subtitle || ''
            if (cleanSubtitle.includes('@@META@@')) {
              const parts = cleanSubtitle.split('@@META@@')
              cleanSubtitle = parts[0].trim()
              try {
                parsedMeta = JSON.parse(parts[1])
              } catch (e) {}
            }

            return {
              id: p.id,
              title: p.title,
              subtitle: cleanSubtitle,
              description: p.description || '',
              price: p.price,
              original_price: p.original_price,
              stock: p.stock,
              image: p.image || '',
              rating: p.rating || 5.0,
              reviews_count: p.reviews_count || 0,
              category_name: p.category_name || 'General',
              category_slug:
                p.category_slug ||
                (p.category_name
                  ? p.category_name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-')
                  : 'general'),
              volumes: p.volumes || parsedMeta.volumes || [50, 100],
              accent_color: p.accent_color || parsedMeta.accent_color || '#fb7185',
              brand: p.brand || parsedMeta.brand || p.category_name || 'Lumina',
            }
          })

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
    } catch {
      // Backend unreachable or production environment
    }

    // 2. Fetch directly from Supabase REST API (production ready!)
    const supabaseProducts = await fetchProductsFromSupabase(categorySlug)
    if (supabaseProducts.length > 0) {
      return {
        products: supabaseProducts,
        total: supabaseProducts.length,
      }
    }

    // 3. Fallback to local cache only if completely offline
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
      const res = await axiosInstance.get(`/products/${id}`, { timeout: 1500 })
      const remote = res.data.content || res.data
      if (remote?.id) return remote
    } catch {}

    // Fallback: Fetch directly from Supabase
    try {
      const url = `${SUPABASE_URL}/rest/v1/products?id=eq.${id}&select=*,category:categories(id,name,slug)&limit=1`
      const res = await fetch(url, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      })
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          const p = data[0]
          let meta: any = {}
          let cleanSubtitle = p.subtitle || ''
          if (cleanSubtitle.includes('@@META@@')) {
            const parts = cleanSubtitle.split('@@META@@')
            cleanSubtitle = parts[0].trim()
            try {
              meta = JSON.parse(parts[1])
            } catch (e) {}
          }
          return {
            id: p.id,
            title: p.title,
            subtitle: cleanSubtitle,
            description: p.description || '',
            price: p.price,
            original_price: p.original_price,
            stock: p.stock,
            image: p.image || '',
            rating: p.rating || 5.0,
            reviews_count: p.reviews_count || 0,
            category_name: p.category?.name || 'Perfumes',
            category_slug: p.category?.slug || 'perfumes',
            volumes: p.volumes || meta.volumes || [50, 100],
            accent_color: p.accent_color || meta.accent_color || '#fb7185',
            brand: meta.brand || p.category?.name || 'Lumina',
          }
        }
      }
    } catch {}

    const stored = localStorage.getItem(CUSTOM_PRODUCTS_KEY)
    const list: BackendProductDTO[] = stored ? cleanProductList(JSON.parse(stored)) : []
    const found = list.find((p) => p.id === id)
    return found || list[0]
  },

  createProduct: async (productData: {
    title: string
    subtitle?: string
    category_name: string
    category_slug?: string
    price: number
    stock: number
    description: string
    image: string
    volumes?: number[]
    accent_color?: string
    brand?: string
  }): Promise<BackendProductDTO> => {
    const slug =
      productData.category_slug ||
      productData.category_name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')

    const meta = {
      volumes: productData.volumes && productData.volumes.length > 0 ? productData.volumes : [50, 100],
      accent_color: productData.accent_color || '#fb7185',
      brand: productData.brand || productData.category_name || 'Lumina',
    }

    const cleanSubtitle = productData.subtitle || 'Perfumes Árabes • Unisex'
    const payloadSubtitle = `${cleanSubtitle} @@META@@${JSON.stringify(meta)}`

    const newProd: BackendProductDTO = {
      id: 'prod-' + Date.now(),
      title: productData.title,
      subtitle: cleanSubtitle,
      category_name: productData.category_name,
      category_slug: slug,
      price: productData.price,
      stock: productData.stock,
      description: productData.description,
      image: productData.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
      rating: 5.0,
      reviews_count: 0,
      volumes: meta.volumes,
      accent_color: meta.accent_color,
      brand: meta.brand,
    }

    const stored = localStorage.getItem(CUSTOM_PRODUCTS_KEY)
    const list: BackendProductDTO[] = stored ? cleanProductList(JSON.parse(stored)) : []
    const updated = [newProd, ...list.filter((p) => p.id !== newProd.id)]
    localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(updated))

    try {
      const res = await axiosInstance.post(
        '/products',
        {
          ...productData,
          subtitle: payloadSubtitle,
        },
        { timeout: 2500 }
      )
      if (res.data?.content?.id) {
        return {
          ...res.data.content,
          volumes: meta.volumes,
          accent_color: meta.accent_color,
          brand: meta.brand,
          subtitle: cleanSubtitle,
        }
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
      subtitle: string
      category_name: string
      category_slug?: string
      price: number
      stock: number
      description: string
      image: string
      volumes?: number[]
      accent_color?: string
      brand?: string
    }>
  ): Promise<BackendProductDTO> => {
    const stored = localStorage.getItem(CUSTOM_PRODUCTS_KEY)
    const list: BackendProductDTO[] = stored ? cleanProductList(JSON.parse(stored)) : []
    const existing = list.find((p) => p.id === id)

    const meta = {
      volumes: productData.volumes || existing?.volumes || [50, 100],
      accent_color: productData.accent_color || existing?.accent_color || '#fb7185',
      brand: productData.brand || existing?.brand || productData.category_name || existing?.category_name || 'Lumina',
    }

    const cleanSubtitle = productData.subtitle ?? existing?.subtitle ?? 'Perfumes Árabes • Unisex'
    const payloadSubtitle = `${cleanSubtitle} @@META@@${JSON.stringify(meta)}`

    const updated = list.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          ...productData,
          subtitle: cleanSubtitle,
          volumes: meta.volumes,
          accent_color: meta.accent_color,
          brand: meta.brand,
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
      await axiosInstance.put(
        `/products/${id}`,
        {
          ...productData,
          subtitle: payloadSubtitle,
        },
        { timeout: 2500 }
      )
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
