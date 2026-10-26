import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate, useSearchParams, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'

import { Login } from './features/auth/components/Login'
import { Register } from './features/auth/components/Register'
import { AdminProtectedRoute } from './components/common/AdminProtectedRoute'
import { ProductGrid } from './features/ecommerce/components/ProductGrid'
import { ProductDetail } from './features/ecommerce/components/ProductDetail'
import { CheckoutPage } from './features/ecommerce/components/CheckoutPage'
import { CartDrawer } from './features/ecommerce/components/CartDrawer'
import { UserProfile } from './features/profile/components/UserProfile'
import { AdminPanel } from './features/admin/components/AdminPanel'
import { OrderSuccessPage } from './features/ecommerce/components/OrderSuccessPage'
import { LuxuryHeroShowcase } from './features/ecommerce/components/LuxuryHeroShowcase'
import { HeroFullscreenSection } from './features/ecommerce/components/HeroFullscreenSection'
import { AboutEditorialSection } from './features/ecommerce/components/AboutEditorialSection'
import { CatalogBridgeSection } from './features/ecommerce/components/CatalogBridgeSection'
import { PerfumeCinematicIntro } from './features/ecommerce/components/PerfumeCinematicIntro'
import { GridLoaderDemoPage } from './features/ecommerce/components/GridLoaderDemoPage'
import { MotionGraphicShowcase } from './features/ecommerce/components/MotionGraphicShowcase'
import { useCartStore } from './store/useCartStore'
import { useAuthStore } from './store/useAuthStore'

const queryClient = new QueryClient()



function MainStore() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [isCheckout, setIsCheckout] = useState<boolean>(() => searchParams.get('checkout') === 'true')
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(() => searchParams.get('profile') === 'true')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [showCinematicIntro, setShowCinematicIntro] = useState<boolean>(false)

  const { items, openDrawer } = useCartStore()
  const { user, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (searchParams.get('checkout') === 'true') {
      setIsCheckout(true)
      setSelectedProductId(null)
      setIsProfileOpen(false)
    } else if (searchParams.get('profile') === 'true') {
      setIsProfileOpen(true)
      setIsCheckout(false)
      setSelectedProductId(null)
    }
  }, [searchParams])

  const handleIntroComplete = () => {
    setShowCinematicIntro(false)
  }

  const totalCartCount = items.reduce((acc, item) => acc + item.quantity, 0)
  const isAdmin = Boolean(isAuthenticated && user?.role === 'admin')

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [selectedProductId, isCheckout, isProfileOpen])

  const handleProductSelect = (id: string) => {
    setSelectedProductId(id)
    setIsCheckout(false)
    setIsProfileOpen(false)
  }

  const handleUserIconClick = () => {
    if (isAuthenticated) {
      setIsProfileOpen(true)
      setSelectedProductId(null)
      setIsCheckout(false)
      setSearchParams({ profile: 'true' })
    } else {
      navigate('/login')
    }
  }

  const scrollToCatalog = () => {
    setSelectedProductId(null)
    setIsCheckout(false)
    setIsProfileOpen(false)
    const el = document.getElementById('catalog-section')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }


  const scrollToAbout = () => {
    setSelectedProductId(null)
    setIsCheckout(false)
    setIsProfileOpen(false)
    const el = document.getElementById('about-section')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen relative font-dm text-sm selection:bg-[#ff78ac] selection:text-[#121314] text-[#121314] overflow-x-hidden flex flex-col justify-between bg-[#f6f4ee]">
      {/* 🎬 Optional Cinematic Intro */}
      {showCinematicIntro && (
        <PerfumeCinematicIntro onComplete={handleIntroComplete} />
      )}

      {/* ========================================================================= */}
      {/* 1. MAIN NAVBAR (Neo-Editorial Fresh Cream & High Contrast)                */}
      {/* ========================================================================= */}
      <header className="relative z-50 w-full px-6 lg:px-14 py-4 bg-[#f6f4ee] border-b-2 border-[#121314]">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          {/* Brand Logo & Subtitle */}
          <Link
            to="/"
            onClick={() => {
              setSelectedProductId(null)
              setIsCheckout(false)
              setIsProfileOpen(false)
            }}
            className="flex items-center gap-3.5 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl border-2 border-[#121314] bg-white flex items-center justify-center font-dm font-black text-sm text-[#121314] neo-box-shadow-sm group-hover:-translate-y-0.5 transition">
              F
            </div>
            <div className="flex flex-col">
              <span className="text-[#121314] font-dm font-black text-sm sm:text-base tracking-wider uppercase leading-none">
                FÓRMULA 1370
              </span>
              <span className="text-[10px] text-[#55575a] font-dm font-bold tracking-widest uppercase mt-1">
                Haute Parfumerie • Dubái
              </span>
            </div>
          </Link>

          {/* Center Navigation Pill Switcher */}
          <nav className="hidden md:flex items-center p-1.5 rounded-xl bg-white border-2 border-[#121314] neo-box-shadow-sm gap-1">
            <button
              onClick={scrollToCatalog}
              className="px-4 py-1.5 rounded-lg text-xs font-dm font-black text-[#121314] bg-[#a8d5e3] border border-[#121314] transition cursor-pointer"
            >
              Colección
            </button>
            <button
              onClick={scrollToAbout}
              className="px-4 py-1.5 rounded-lg text-xs font-dm font-bold text-[#121314] hover:bg-[#f2f0ea] transition cursor-pointer"
            >
              Nosotros
            </button>
            <Link
              to="/hero-3d"
              className="px-4 py-1.5 rounded-lg text-xs font-dm font-bold text-[#121314] hover:bg-[#f2f0ea] transition flex items-center gap-1.5"
            >
              <span>Showcase 3D</span>
              <span className="w-2 h-2 rounded-full bg-[#0ffcbe] border border-[#121314] animate-pulse"></span>
            </Link>
            <Link
              to="/motion-graphic"
              className="px-4 py-1.5 rounded-lg text-xs font-dm font-bold text-[#121314] hover:bg-[#ff78ac]/20 transition flex items-center gap-1.5"
            >
              <span>Motion Graphic</span>
              <span className="w-2 h-2 rounded-full bg-[#ff78ac] border border-[#121314]"></span>
            </Link>
          </nav>

          {/* Right Action Icons & Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Direct Access to Motion Graphic */}
            <Link
              to="/motion-graphic"
              className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-dm font-bold text-[#121314] bg-[#ff78ac] border-2 border-[#121314] neo-box-shadow-sm active:scale-95 transition"
              title="Ver Motion Graphic 3D"
            >
              <span>Motion</span>
              <span className="w-2 h-2 rounded-full bg-[#121314] animate-pulse"></span>
            </Link>

            {/* Admin Quick Badge (if admin) */}
            {isAdmin && (
              <Link
                to="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-dm font-bold text-[#121314] bg-[#a8d5e3] border-2 border-[#121314] neo-box-shadow-sm hover:bg-[#8ec4d4] transition"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#121314]"></span>
                <span>Admin</span>
              </Link>
            )}

            {/* User Profile */}
            <button
              onClick={handleUserIconClick}
              aria-label="Cuenta de usuario"
              className="w-10 h-10 rounded-xl bg-white border-2 border-[#121314] neo-box-shadow-sm hover:bg-[#f2f0ea] flex items-center justify-center text-[#121314] transition cursor-pointer"
              type="button"
              title={isAuthenticated ? user?.email : 'Iniciar Sesión'}
            >
              <svg className="w-4 h-4 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Shopping Cart with Counter */}
            <button
              onClick={openDrawer}
              aria-label="Carrito de compras"
              className="relative w-10 h-10 rounded-xl bg-white border-2 border-[#121314] neo-box-shadow-sm hover:bg-[#0ffcbe] flex items-center justify-center text-[#121314] transition cursor-pointer"
              type="button"
            >
              <svg className="w-4 h-4 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#ff78ac] text-[10px] font-dm font-black text-[#121314] flex items-center justify-center border-2 border-[#121314]">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Tienda CTA Pill (Hidden when in collection) */}
            {(selectedProductId || isCheckout || isProfileOpen) && (
              <button
                onClick={scrollToCatalog}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-dm font-black text-[#121314] bg-[#0ffcbe] border-2 border-[#121314] neo-box-shadow-sm hover:bg-[#00eaad] transition cursor-pointer"
              >
                <span>Volver a Tienda</span>
                <svg className="w-3.5 h-3.5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Slide-over Side Cart Drawer */}
      <CartDrawer
        onProceedToCheckout={() => {
          setIsCheckout(true)
          setSearchParams({ checkout: 'true' })
        }}
      />

      {/* ========================================================================= */}
      {/* 2. MAIN FULL-SCREEN CONTENT AREA                                          */}
      {/* ========================================================================= */}
      <main className="flex-1 w-full relative z-10 flex flex-col">
        <AnimatePresence mode="wait">
          {isCheckout ? (
            /* Checkout View */
            <motion.div
              key="checkout"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-[1440px] mx-auto w-full px-6 lg:px-14 py-8"
            >
              <CheckoutPage
                onBack={() => {
                  setIsCheckout(false)
                  if (searchParams.get('checkout')) {
                    setSearchParams({}, { replace: true })
                  }
                }}
              />
            </motion.div>
          ) : selectedProductId ? (
            /* Product Detail View */
            <motion.div
              key="detail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-[1440px] mx-auto w-full px-6 lg:px-14 py-8"
            >
              <ProductDetail
                productId={selectedProductId}
                onBack={() => setSelectedProductId(null)}
                onProductClick={handleProductSelect}
              />
            </motion.div>
          ) : isProfileOpen ? (
            /* User Profile View */
            <motion.div
              key="profile"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-[1440px] mx-auto w-full px-6 lg:px-14 py-8"
            >
              <UserProfile
                onBack={() => {
                  setIsProfileOpen(false)
                  if (searchParams.get('profile')) {
                    setSearchParams({}, { replace: true })
                  }
                }}
              />
            </motion.div>
          ) : (
            /* Full Neo-Editorial Haute Parfumerie Flow */
            <motion.div
              key="catalog"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex-1"
            >
              {/* 1. Fullscreen Hero Section (100vh) */}
              <HeroFullscreenSection
                onExploreCatalog={scrollToCatalog}
                onExploreShowcase={() => navigate('/hero-3d')}
                onScrollToAbout={scrollToAbout}
              />

              {/* 2. Sección Nosotros (Dividida en 3 Pilares) */}
              <AboutEditorialSection onGoToCatalog={scrollToCatalog} />

              {/* 3. Puente al Catálogo por Notas & Casas */}
              <CatalogBridgeSection onScrollToGrid={scrollToCatalog} />

              {/* 4. Catálogo de Productos */}
              <div id="catalog-section" className="py-8 bg-[#f6f4ee]">
                <ProductGrid
                  selectedCategorySlug="all"
                  onProductClick={handleProductSelect}
                  searchQuery={searchQuery}
                  onClearSearch={() => setSearchQuery('')}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ========================================================================= */}
      {/* 3. HAUTE FOOTER (Neo-Editorial Fresh Cream & High Contrast)               */}
      {/* ========================================================================= */}
      <footer className="relative z-10 bg-[#f2f0ea] border-t-2 border-[#121314] px-6 lg:px-14 py-12 text-[#121314]">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand & Maison Bio */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl border-2 border-[#121314] bg-white flex items-center justify-center font-dm font-black text-xs text-[#121314] neo-box-shadow-sm">
                F
              </div>
              <span className="text-[#121314] font-dm font-black tracking-wider text-base uppercase">FÓRMULA 1370</span>
            </div>
            <p className="text-xs text-[#55575a] font-dm leading-relaxed">
              Maison dedicada a la curaduría y distribución exclusiva de alta perfumería oriental, extractos de nicho y botellas icónicas de autor directamente importadas de los Emiratos Árabes.
            </p>
          </div>

          {/* Haute Guarantees */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-dm font-black text-[#121314] mb-4">Garantías Oficiales</h4>
            <ul className="space-y-2.5 text-xs text-[#444648] font-dm font-medium">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0ffcbe] border border-[#121314]"></span>
                Frascos 100% Originales con Batch Code
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#a8d5e3] border border-[#121314]"></span>
                Envío gratis de cortesía a todo el país
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ff78ac] border border-[#121314]"></span>
                Hasta 6 cuotas sin interés
              </li>
            </ul>
          </div>

          {/* Quick Nav Links */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-dm font-black text-[#121314] mb-4">Navegación</h4>
            <ul className="space-y-2.5 text-xs text-[#55575a] font-dm font-medium">
              <li>
                <Link to="/hero-3d" className="hover:text-[#121314] hover:underline transition">
                  Showcase 3D Interactivo
                </Link>
              </li>
              <li>
                <button onClick={scrollToAbout} className="hover:text-[#121314] hover:underline transition cursor-pointer text-left">
                  Sobre Nosotros &amp; Garantía
                </button>
              </li>
              <li>
                <button onClick={scrollToCatalog} className="hover:text-[#121314] hover:underline transition cursor-pointer text-left">
                  Colección Completa
                </button>
              </li>
              <li>
                <Link to="/motion-graphic" className="hover:text-[#121314] hover:underline transition">
                  Motion Graphic 3D
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter for VIP Releases */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-dm font-black text-[#121314] mb-4">Círculo Privado</h4>
            <p className="text-xs text-[#55575a] font-dm mb-3">
              Acceso prioritario a lanzamientos limitados de Afnan, Armaf y Lattafa.
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                className="bg-white border-2 border-[#121314] rounded-xl px-3.5 py-2 text-xs text-[#121314] placeholder:text-gray-400 focus:outline-none flex-1 font-dm"
                placeholder="tu@email.com"
                type="email"
              />
              <button
                className="px-4 py-2 rounded-xl bg-[#0ffcbe] hover:bg-[#00eaad] text-[#121314] font-dm font-black text-xs uppercase border-2 border-[#121314] neo-box-shadow-sm cursor-pointer transition"
                type="submit"
              >
                Unirme
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Copyright & Legal Line */}
        <div className="max-w-[1440px] mx-auto pt-8 border-t-2 border-[#121314]/15 flex flex-col sm:flex-row items-center justify-between text-xs font-dm text-[#55575a] gap-4">
          <div>© 2025 FÓRMULA 1370 HAUTE PARFUMERIE. Todos los derechos reservados.</div>
          <div className="flex items-center gap-6 font-bold">
            <span>Envío gratis nacional</span>
            <span>•</span>
            <span>Cuotas sin interés</span>
            <span>•</span>
            <a className="hover:text-[#121314] transition" href="#catalog-section">
              Términos &amp; Condiciones
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainStore />} />
          <Route path="/checkout" element={<Navigate to="/?checkout=true" replace />} />
          <Route path="/motion-graphic" element={<MotionGraphicShowcase />} />
          <Route path="/loader-prototype" element={<GridLoaderDemoPage />} />
          <Route path="/grid-loader" element={<GridLoaderDemoPage />} />
          <Route path="/hero-3d" element={<LuxuryHeroShowcase />} />
          <Route path="/profile" element={<Navigate to="/?profile=true" replace />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminPanel />
              </AdminProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
