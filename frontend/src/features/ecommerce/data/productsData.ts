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
  categorySlug: 'electronics' | 'fashion' | 'home' | 'beauty' | 'sports' | 'all'
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
  { id: 'electronics', name: 'Electrónica', slug: 'electronics' },
  { id: 'fashion', name: 'Moda', slug: 'fashion' },
  { id: 'home', name: 'Hogar', slug: 'home' },
  { id: 'beauty', name: 'Belleza', slug: 'beauty' },
  { id: 'sports', name: 'Deportes', slug: 'sports' },
] as const

export const PRODUCTS: Product[] = [
  {
    id: 'lumina-pro-camera',
    title: 'Lumina Pro Camera',
    category: 'Electrónica',
    categorySlug: 'electronics',
    subtitle: "Captura el Brillo de la Vida",
    description: 'Experimenta una claridad sin igual con la nueva Lumina Pro Camera. Cuenta con un sensor ultra amplio y enfoque inteligente impulsado por IA, diseñado para creadores que exigen la máxima perfección.',
    price: 1299.00,
    originalPrice: 1499.00,
    rating: 5.0,
    reviewsCount: 89,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJbw2mevdwZr1ggkqBSUar06BQd1rYytNLYe6m4zMhXXVf3Ms8J5-ZoVEbtZ7rulS0VuYDUK6Hkv0N720qnsiIayqSDmcCDsyPzMjGzUf8rwCntgX_oysVpfXwRwlDRFxqOAdzzZC6FOw29EuYfdnxvuUOgscWqzeX0DdHsZ-VE6kpSTcDK5CClnk5vFpzHElAnQA_xeema7pTbaQchKD6nhAoiDMCNZjtZDPXFb58vQVs-VBDxKWf',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCJbw2mevdwZr1ggkqBSUar06BQd1rYytNLYe6m4zMhXXVf3Ms8J5-ZoVEbtZ7rulS0VuYDUK6Hkv0N720qnsiIayqSDmcCDsyPzMjGzUf8rwCntgX_oysVpfXwRwlDRFxqOAdzzZC6FOw29EuYfdnxvuUOgscWqzeX0DdHsZ-VE6kpSTcDK5CClnk5vFpzHElAnQA_xeema7pTbaQchKD6nhAoiDMCNZjtZDPXFb58vQVs-VBDxKWf'
    ],
    tags: ['Novedad', 'Enfoque IA', '4K 120fps'],
    isHeroFeatured: true,
    stock: 12,
    variants: [
      { id: 'matte-black', name: 'Negro Mate', colorClass: 'bg-[#1b1c1c]' },
      { id: 'brushed-silver', name: 'Plata Cepillada', colorClass: 'bg-[#d2d2d2]' },
    ],
    specs: [
      { label: 'Sensor', value: '45.7MP Full-Frame BSI CMOS' },
      { label: 'Video', value: '8K 30p / 4K 120p ProRes RAW' },
      { label: 'Enfoque Automático', value: 'Seguimiento por IA de Aprendizaje Profundo' },
      { label: 'Estabilización', value: '5 Ejes en el Cuerpo hasta 6.5 Pasos' },
    ]
  },
  {
    id: 'aura-headphones',
    title: 'Aura Studio Headphones',
    category: 'Electrónica',
    categorySlug: 'electronics',
    subtitle: 'Auriculares circumaurales premium con cancelación activa de ruido y almohadillas de cuero suave.',
    description: 'Acústica perfectamente equilibrada con cancelación activa de ruido y almohadillas de cuero con memoria viscoelástica.',
    price: 249.00,
    rating: 4.9,
    reviewsCount: 230,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRMBqcSAOlGw8fva1sekJfFL1iyNxoOG30EYhsDenxyYzzAF04FxX1FgXEbZTU6SJvW2nVWHnGnBG7LopgiXjLXuwec6EUYzjEhi0vyeTA5_UyOCNKxM69zbbZiACDwI9KWpNKDEFd_KW2XBxPz1leGqc3w4m_9ye_DJiJdmIpiBESuU0NWnNtY1jzrcfkeSWfHS-wTW-dGKnwvrOmHslmo1tbHo2pGx5v07Ac0BaES2eb981u0_c0',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDRMBqcSAOlGw8fva1sekJfFL1iyNxoOG30EYhsDenxyYzzAF04FxX1FgXEbZTU6SJvW2nVWHnGnBG7LopgiXjLXuwec6EUYzjEhi0vyeTA5_UyOCNKxM69zbbZiACDwI9KWpNKDEFd_KW2XBxPz1leGqc3w4m_9ye_DJiJdmIpiBESuU0NWnNtY1jzrcfkeSWfHS-wTW-dGKnwvrOmHslmo1tbHo2pGx5v07Ac0BaES2eb981u0_c0'
    ],
    tags: ['Hi-Fi', 'Cancelación de Ruido'],
    isTrending: true,
    stock: 25,
    variants: [
      { id: 'beige', name: 'Beige Cálido', colorClass: 'bg-[#EAE4DC]' },
      { id: 'espresso', name: 'Espresso', colorClass: 'bg-[#2E2824]' }
    ],
    specs: [
      { label: 'Drivers', value: '40mm Bio-Celulosa Personalizados' },
      { label: 'Batería', value: 'Hasta 38 horas de reproducción continua' }
    ]
  },
  {
    id: 'lumina-smartwatch',
    title: 'Lumina Smartwatch Pro',
    category: 'Electrónica',
    categorySlug: 'electronics',
    subtitle: 'Reloj inteligente circular minimalista con correa de silicona coral suave.',
    description: 'Pantalla AMOLED de alta resolución, monitoreo continuo de salud y resistencia al agua hasta 50 metros.',
    price: 189.00,
    originalPrice: 229.00,
    rating: 4.7,
    reviewsCount: 165,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrMSU5FZSvEqRWGIPha8njwkDy9chq80vFltrL1uM8oUJ5_Yzz_89eJXVHQK5-r9c0lvT40Z9JaosqoL7gmwesL-zuTzng5rc6IqwOFk2spMDwnr9w2Vy-g8FhmXsVFiPshXvdNIWPGlTtoEO_e7hJh5u9HQYc730H-vcOski1mVKy08cbwKgHrbBFZmQoT9viQ3EMrG0ODI_JP4Mr0jvBB7pYEPe0FnjvJvEnsJLJvWqv6Ith5APe',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDrMSU5FZSvEqRWGIPha8njwkDy9chq80vFltrL1uM8oUJ5_Yzz_89eJXVHQK5-r9c0lvT40Z9JaosqoL7gmwesL-zuTzng5rc6IqwOFk2spMDwnr9w2Vy-g8FhmXsVFiPshXvdNIWPGlTtoEO_e7hJh5u9HQYc730H-vcOski1mVKy08cbwKgHrbBFZmQoT9viQ3EMrG0ODI_JP4Mr0jvBB7pYEPe0FnjvJvEnsJLJvWqv6Ith5APe'
    ],
    tags: ['Oferta', 'Smartwatch', 'AMOLED'],
    isTrending: true,
    isSale: true,
    stock: 18,
    variants: [
      { id: 'coral-pink', name: 'Rosa Coral', colorClass: 'bg-[#FF8A80]' },
      { id: 'chalk-white', name: 'Blanco Tiza', colorClass: 'bg-[#F5F5F5]' }
    ],
    specs: [
      { label: 'Pantalla', value: '1.4" AMOLED Always-On 454x454' },
      { label: 'Sensores', value: 'ECG, SpO2, Frecuencia Cardíaca, GPS' }
    ]
  },
  {
    id: 'echo-hub-speaker',
    title: 'Echo Hub Speaker',
    category: 'Hogar',
    categorySlug: 'home',
    subtitle: 'Altavoz inteligente minimalista recubierto en tela acústica gris premium.',
    description: 'Difusión acústica omnidireccional de 360 grados con asistente de voz integrado y controles táctiles.',
    price: 129.00,
    rating: 4.8,
    reviewsCount: 94,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGKYxdDdkhw23SLm86Jy80Xw3x-Ka-RX74-P1Aicq2ZMo4-UYh8vCQOQTEzkze35uAAu6_eEKH1Y73GIZNN8H07Eahu3JwdtkcljKHOl-K8Loo_rTuzL52pjsAQdyUBcX90Da4cnvE2F93-B3zfPoAXbsw14DRn5Zb0mAGaGMdi_5N8J7m6QArP8jfzMKlfoLpYt9Pja_iIMp55YheB6z8lqsLXl3FasrryoUUi65f-VWncHWYG-jB',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAGKYxdDdkhw23SLm86Jy80Xw3x-Ka-RX74-P1Aicq2ZMo4-UYh8vCQOQTEzkze35uAAu6_eEKH1Y73GIZNN8H07Eahu3JwdtkcljKHOl-K8Loo_rTuzL52pjsAQdyUBcX90Da4cnvE2F93-B3zfPoAXbsw14DRn5Zb0mAGaGMdi_5N8J7m6QArP8jfzMKlfoLpYt9Pja_iIMp55YheB6z8lqsLXl3FasrryoUUi65f-VWncHWYG-jB'
    ],
    tags: ['Acústico', 'Hogar Inteligente'],
    isTrending: true,
    stock: 30,
    variants: [
      { id: 'grey-fabric', name: 'Tela Gris Acústica', colorClass: 'bg-[#9E9E9E]' },
      { id: 'cream-fabric', name: 'Tela Crema', colorClass: 'bg-[#EAE4DC]' }
    ],
    specs: [
      { label: 'Audio', value: '30W RMS con Radiadores Pasivos Dobles' },
      { label: 'Conectividad', value: 'Wi-Fi 6, Bluetooth 5.3, AirPlay 2' }
    ]
  },
  {
    id: 'zenith-keyboard',
    title: 'Zenith Mechanical Board',
    category: 'Electrónica',
    categorySlug: 'electronics',
    subtitle: 'Teclado mecánico ultra delgado con switches táctiles de perfil bajo.',
    description: 'Chasis de aluminio mecanizado CNC de alta precisión, interruptores intercambiables en caliente y conectividad inalámbrica dual.',
    price: 159.00,
    rating: 5.0,
    reviewsCount: 78,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDeIZeqUJDzgGM9e0qQZbs_gsCUzaeQphL3RXNTJsrB_7bz6xOZtf1bMVu2uaJLvHYxLTCpw_IZWONbhrEdysIXo570FTJls4r6ZbwvDSssFn5wxfdhRx_pQk5GL1HZ3ormMJjhT0VkwcV9OMhUUHyZdiUjfY6MW5sAa0liTOXNsJi-a380RKEPWx2pXOAG_C87cBJhPAv11OcRWVIdNEuwYuL4N8Gz9tYD3Z-L5y8QNfiYpRegho2p',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDeIZeqUJDzgGM9e0qQZbs_gsCUzaeQphL3RXNTJsrB_7bz6xOZtf1bMVu2uaJLvHYxLTCpw_IZWONbhrEdysIXo570FTJls4r6ZbwvDSssFn5wxfdhRx_pQk5GL1HZ3ormMJjhT0VkwcV9OMhUUHyZdiUjfY6MW5sAa0liTOXNsJi-a380RKEPWx2pXOAG_C87cBJhPAv11OcRWVIdNEuwYuL4N8Gz9tYD3Z-L5y8QNfiYpRegho2p'
    ],
    tags: ['Mecánico', 'Perfil Bajo'],
    isTrending: true,
    stock: 14,
    variants: [
      { id: 'chalk-grey', name: 'Tiza y Gris', colorClass: 'bg-[#DCDCDC]' },
      { id: 'coral-edition', name: 'Edición Coral', colorClass: 'bg-[#FF4D4F]' }
    ],
    specs: [
      { label: 'Formato', value: '75% Compacto (84 Teclas)' },
      { label: 'Interruptores', value: 'Gateron Low-Profile Mecánicos Táctiles' }
    ]
  },
  {
    id: 'minimalist-tote',
    title: 'The Minimalist Tote',
    category: 'Moda',
    categorySlug: 'fashion',
    subtitle: 'Bolso de Cuero Vacuno Auténtico de Primera Calidad',
    description: 'Diseñado para el profesional contemporáneo, este bolso combina una elegancia desestructurada con durabilidad funcional. Cuenta con un amplio compartimento principal, funda dedicada para laptop y costuras artesanales hechas a mano.',
    longDescription: 'Diseñado para el profesional contemporáneo, este bolso combina una elegancia desestructurada con durabilidad funcional. Cuenta con un amplio compartimento principal, funda dedicada para laptop y costuras artesanales hechas a mano.',
    price: 245.00,
    originalPrice: 295.00,
    rating: 4.8,
    reviewsCount: 124,
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=900&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=900&q=80',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=900&q=80',
      'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=900&q=80',
    ],
    tags: ['Cuero Auténtico de Primera', 'Hecho a Mano'],
    stock: 22,
    variants: [
      { id: 'caramel', name: 'Caramelo', colorClass: 'bg-[#C1824E]' },
      { id: 'black', name: 'Negro', colorClass: 'bg-[#1C1B1B]' },
      { id: 'cream', name: 'Crema', colorClass: 'bg-[#E8DFC8]' }
    ],
    specs: [
      { label: 'Material', value: '100% Cuero Vacuno Italiano Auténtico' },
      { label: 'Forro Interior', value: 'Gamuza de Microfibra Suave' },
      { label: 'Herrajes', value: 'Latón Macizo con Acabado Mate' }
    ],
    detailsCards: [
      {
        title: 'Dimensiones',
        text: '38 cm Ancho x 29 cm Alto x 13 cm Prof. Aloja cómodamente laptops de hasta 14 pulgadas junto a tus elementos esenciales diarios.',
        icon: 'straighten'
      },
      {
        title: 'Materiales Nobles',
        text: 'Cuero italiano de origen responsable que adquiere una pátina única y elegante con el paso del tiempo.',
        icon: 'spa'
      },
      {
        title: 'Organización Óptima',
        text: 'Cuenta con un bolsillo interior con cremallera amplia, dos compartimentos abiertos y un práctico mosquetón para llaves.',
        icon: 'shopping_bag'
      }
    ]
  }
]

export const COMPLETE_THE_LOOK_ITEMS = [
  {
    id: 'leather-wallet-look',
    title: 'Billetera Slim de Cuero Plegable',
    price: 65.00,
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&q=80',
    category: 'Moda'
  },
  {
    id: 'leather-keyfob-look',
    title: 'Llavero de Latón & Cuero',
    price: 35.00,
    image: 'https://images.unsplash.com/photo-1614179689702-355944cd0918?w=500&q=80',
    category: 'Accesorios'
  },
  {
    id: 'leather-journal-look',
    title: 'Funda de Cuero para Libreta de Viaje',
    price: 48.00,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&q=80',
    category: 'Lifestyle'
  }
]
