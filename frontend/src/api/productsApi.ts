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
  images?: string[]
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
  return list.filter((p) => !MOCK_IDS.includes(p.id)).map((p) => {
    const imgs = p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : [])
    return {
      ...p,
      image: imgs[0] || p.image,
      images: imgs,
      volumes: p.volumes && p.volumes.length > 0 ? p.volumes : [50, 100],
      accent_color: p.accent_color || '#fb7185',
      brand: p.brand || p.category_name || 'Lumina',
    }
  })
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
        let cleanSubtitle = (p.subtitle || '').trim()
        let cleanDescription = (p.description || '').trim()

        if (cleanSubtitle.includes('@@META@@')) {
          const parts = cleanSubtitle.split('@@META@@')
          cleanSubtitle = parts[0].trim()
          try {
            meta = JSON.parse(parts[1])
          } catch (e) {}
        }

        if (cleanDescription.includes('@@META@@')) {
          const parts = cleanDescription.split('@@META@@')
          cleanDescription = parts[0].trim()
          try {
            meta = { ...meta, ...JSON.parse(parts[1]) }
          } catch (e) {}
        }

        const catName = p.category?.name || p.category_name || meta.brand || 'Perfumes'
        const catSlug =
          p.category?.slug ||
          p.category_slug ||
          (meta.brand ? meta.brand.toLowerCase().replace(/\s+/g, '-') : 'perfumes')
        const brand = meta.brand || p.category?.name || p.brand || 'Lumina'
        const imgs = meta.images && meta.images.length > 0 ? meta.images : (p.image ? [p.image] : [])

        return {
          id: p.id,
          title: p.title,
          subtitle: cleanSubtitle,
          description: cleanDescription,
          price: p.price,
          original_price: p.original_price,
          stock: p.stock,
          image: imgs[0] || p.image || '',
          images: imgs,
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
    // 1. Fetch directly from Supabase REST API (source of truth in cloud)
    const supabaseProducts = await fetchProductsFromSupabase(categorySlug)
    if (supabaseProducts.length > 0) {
      return {
        products: supabaseProducts,
        total: supabaseProducts.length,
      }
    }

    // 2. If configured with a custom backend URL (not localhost), try axios
    if (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('localhost')) {
      try {
        const url = categorySlug && categorySlug !== 'all' ? `/products?category=${categorySlug}` : '/products'
        const res = await axiosInstance.get(url, { timeout: 1500 })
        const remote = res.data.content || res.data
        if (remote && Array.isArray(remote.products) && remote.products.length > 0) {
          const mappedRemote = cleanProductList(remote.products)
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
        // Backend unreachable
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
    // 1. Fetch directly from Supabase
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
          let cleanSubtitle = (p.subtitle || '').trim()
          let cleanDescription = (p.description || '').trim()

          if (cleanSubtitle.includes('@@META@@')) {
            const parts = cleanSubtitle.split('@@META@@')
            cleanSubtitle = parts[0].trim()
            try {
              meta = JSON.parse(parts[1])
            } catch (e) {}
          }

          if (cleanDescription.includes('@@META@@')) {
            const parts = cleanDescription.split('@@META@@')
            cleanDescription = parts[0].trim()
            try {
              meta = { ...meta, ...JSON.parse(parts[1]) }
            } catch (e) {}
          }

          const imgs = meta.images && meta.images.length > 0 ? meta.images : (p.image ? [p.image] : [])
          return {
            id: p.id,
            title: p.title,
            subtitle: cleanSubtitle,
            description: cleanDescription,
            price: p.price,
            original_price: p.original_price,
            stock: p.stock,
            image: imgs[0] || p.image || '',
            images: imgs,
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

    // 2. If custom backend URL is configured, try axios
    if (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('localhost')) {
      try {
        const res = await axiosInstance.get(`/products/${id}`, { timeout: 1500 })
        const remote = res.data.content || res.data
        if (remote?.id) return remote
      } catch {}
    }

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
    images?: string[]
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

    const imgs = productData.images && productData.images.length > 0
      ? productData.images
      : (productData.image ? [productData.image] : [])
    const primaryImg = imgs[0] || productData.image || 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=500&q=80'

    const meta = {
      volumes: productData.volumes && productData.volumes.length > 0 ? productData.volumes : [50, 100],
      accent_color: productData.accent_color || '#fb7185',
      brand: productData.brand || productData.category_name || 'Lumina',
      images: imgs,
    }

    let rawDesc = (productData.description || 'Fragancia exclusiva de autor.').trim()
    if (rawDesc.includes('@@META@@')) {
      rawDesc = rawDesc.split('@@META@@')[0].trim()
    }
    const cleanDescription = rawDesc

    let rawSub = (productData.subtitle || 'Perfumes Árabes • Unisex').trim()
    if (rawSub.includes('@@META@@')) {
      rawSub = rawSub.split('@@META@@')[0].trim()
    }
    const cleanSubtitle = rawSub.slice(0, 240)
    const payloadDescription = `${cleanDescription} @@META@@${JSON.stringify(meta)}`

    const newProd: BackendProductDTO = {
      id: 'prod-' + Date.now(),
      title: productData.title,
      subtitle: cleanSubtitle,
      category_name: productData.category_name,
      category_slug: slug,
      price: productData.price,
      stock: productData.stock,
      description: cleanDescription,
      image: primaryImg,
      images: imgs,
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

    // Direct sync to Supabase Cloud
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/products`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          title: productData.title,
          subtitle: cleanSubtitle,
          description: payloadDescription,
          price: productData.price,
          stock: productData.stock,
          image: primaryImg,
        }),
      })
    } catch {}

    // Fallback sync to Go backend if configured
    if (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('localhost')) {
      try {
        const res = await axiosInstance.post(
          '/products',
          {
            ...productData,
            image: primaryImg,
            images: imgs,
            subtitle: cleanSubtitle,
            description: payloadDescription,
          },
          { timeout: 2500 }
        )
        if (res.data?.content?.id) {
          return {
            ...res.data.content,
            images: imgs,
            volumes: meta.volumes,
            accent_color: meta.accent_color,
            brand: meta.brand,
            subtitle: cleanSubtitle,
          }
        }
      } catch {}
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
      images?: string[]
      volumes?: number[]
      accent_color?: string
      brand?: string
    }>
  ): Promise<BackendProductDTO> => {
    const stored = localStorage.getItem(CUSTOM_PRODUCTS_KEY)
    const list: BackendProductDTO[] = stored ? cleanProductList(JSON.parse(stored)) : []
    const existing = list.find((p) => p.id === id)

    const imgs = productData.images ?? existing?.images ?? (productData.image ? [productData.image] : (existing?.image ? [existing.image] : []))
    const primaryImg = productData.image || imgs[0] || existing?.image || ''

    const meta = {
      volumes: productData.volumes || existing?.volumes || [50, 100],
      accent_color: productData.accent_color || existing?.accent_color || '#fb7185',
      brand: productData.brand || existing?.brand || productData.category_name || existing?.category_name || 'Lumina',
      images: imgs,
    }

    let rawDesc = (productData.description ?? existing?.description ?? 'Fragancia exclusiva de autor.').trim()
    if (rawDesc.includes('@@META@@')) {
      rawDesc = rawDesc.split('@@META@@')[0].trim()
    }
    const cleanDescription = rawDesc

    let rawSub = (productData.subtitle ?? existing?.subtitle ?? 'Perfumes Árabes • Unisex').trim()
    if (rawSub.includes('@@META@@')) {
      rawSub = rawSub.split('@@META@@')[0].trim()
    }
    const cleanSubtitle = rawSub.slice(0, 240)
    const payloadDescription = `${cleanDescription} @@META@@${JSON.stringify(meta)}`

    const updated = list.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          ...productData,
          image: primaryImg,
          images: imgs,
          subtitle: cleanSubtitle,
          description: cleanDescription,
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

    // Direct sync to Supabase Cloud
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: productData.title ?? existing?.title,
          subtitle: cleanSubtitle,
          description: payloadDescription,
          price: productData.price ?? existing?.price,
          stock: productData.stock ?? existing?.stock,
          image: primaryImg,
        }),
      })
    } catch {}

    // Fallback sync to Go backend if configured
    if (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('localhost')) {
      try {
        await axiosInstance.put(
          `/products/${id}`,
          {
            ...productData,
            image: primaryImg,
            images: imgs,
            subtitle: cleanSubtitle,
            description: payloadDescription,
          },
          { timeout: 2500 }
        )
      } catch {}
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
