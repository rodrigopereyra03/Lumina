export interface ProductVariant {
  id: string
  name: string
  colorClass: string
  previewImage?: string
}

export interface Product {
  id: string
  title: string
  category: string
  categorySlug: string
  subtitle: string
  description: string
  longDescription?: string
  price: number
  originalPrice?: number
  rating: number
  reviewsCount: number
  image: string
  gallery: string[]
  tags: string[]
  isHeroFeatured?: boolean
  isTrending?: boolean
  isSale?: boolean
  stock: number
  variants: ProductVariant[]
  specs: { label: string; value: string }[]
  detailsCards?: { title: string; text: string; icon: string }[]
}

export const CATEGORIES = [
  { id: 'all', name: 'Todos los Productos', slug: 'all' },
  { id: 'perfumes', name: 'Perfumes', slug: 'perfumes' },
] as const

export const PERFUME_SUBCATEGORIES = [
  { id: 'all', label: 'Todos los Perfumes' },
  { id: 'arabes', label: 'Perfumes Árabes' },
  { id: 'disenador', label: 'Diseñador / Importados' },
  { id: 'nicho', label: 'Perfumería Nicho' },
  { id: 'testers', label: 'Testers' },
  { id: 'decants', label: 'Decants' },
] as const

export const GENDER_FILTERS = [
  { id: 'all', label: 'Todos los Géneros' },
  { id: 'hombre', label: 'Hombre' },
  { id: 'mujer', label: 'Mujer' },
  { id: 'unisex', label: 'Unisex' },
] as const

export const PRODUCTS: Product[] = []
