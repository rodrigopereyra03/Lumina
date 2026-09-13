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
  { id: 'perfumes', name: 'Perfumería', slug: 'perfumes' },
  { id: 'fragancias-masculinas', name: 'Fragancias Masculinas', slug: 'fragancias-masculinas' },
  { id: 'fragancias-femeninas', name: 'Fragancias Femeninas', slug: 'fragancias-femeninas' },
  { id: 'nicho-unisex', name: 'Nicho & Unisex', slug: 'nicho-unisex' },
  { id: 'decants-testers', name: 'Decants & Testers', slug: 'decants-testers' },
] as const

export const PRODUCTS: Product[] = []
