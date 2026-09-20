import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
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
import { useCartStore } from './store/useCartStore'
import { useAuthStore } from './store/useAuthStore'

const queryClient = new QueryClient()

const LOTUS_CHROMA_PETALS = [
  { angle: 0, color: '#f43f5e' }, // Rubí (9 PM Rebel)
  { angle: 45, color: '#fbbf24' }, // Champagne (Lumina Gold)
  { angle: 90, color: '#f59e0b' }, // Ámbar Coñac (Khamrah)
  { angle: 135, color: '#c084fc' }, // Amatista (Nocturno)
  { angle: 180, color: '#e2e8f0' }, // Platino (Club de Nuit)
  { angle: 225, color: '#14b8a6' }, // Teal Bosque (Supremacy)
  { angle: 270, color: '#38bdf8' }, // Zafiro Azul (Turathi & Amber Oud)
  { angle: 315, color: '#10b981' }, // Esmeralda (Odyssey Aqua)
]

const LOTUS_INNER_PETALS = [
  { angle: 22.5, color: '#fb7185' },
  { angle: 67.5, color: '#fcd34d' },
  { angle: 112.5, color: '#e879f9' },
  { angle: 157.5, color: '#a78bfa' },
  { angle: 202.5, color: '#94a3b8' },
  { angle: 247.5, color: '#2dd4bf' },
  { angle: 292.5, color: '#0ea5e9' },
  { angle: 337.5, color: '#34d399' },
]

function MainStore() {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [isCheckout, setIsCheckout] = useState<boolean>(false)
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>('')

  const { items, openDrawer } = useCartStore()
  const { user, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  const totalCartCount = items.reduce((acc, item) => acc + item.quantity, 0)
  const isAdmin = isAuthenticated && user?.role === 'admin'

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

  return (
    <div
      className="min-h-screen relative font-['Montserrat',sans-serif] text-sm selection:bg-white selection:text-black text-[#f3f4f6] overflow-x-hidden flex flex-col justify-between"
      style={{
        backgroundColor: '#070709',
        backgroundImage: `
          radial-gradient(circle at 50% -8%, rgba(68, 12, 28, 0.45) 0%, rgba(20, 6, 12, 0.75) 45%, #070709 85%),
          radial-gradient(circle at 90% 40%, rgba(5, 45, 35, 0.22) 0%, transparent 60%),
          radial-gradient(circle at 10% 70%, rgba(50, 10, 24, 0.22) 0%, transparent 60%)
        `,
        backgroundAttachment: 'fixed',
      }}
    >
      {/* ========================================================================= */}
      {/* 🌸 AMBIENT BACKGROUND FLOR DE LOTO MULTICOLOR (Full screen fixed backdrop) */}
      {/* ========================================================================= */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 flex items-center justify-center opacity-[0.38]">
        <div className="w-[1200px] h-[1200px] xl:w-[1500px] xl:h-[1500px]">
          <svg viewBox="-250 -250 500 500" className="w-full h-full filter drop-shadow-[0_20px_45px_rgba(0,0,0,0.9)]">
            <defs>
              <radialGradient id="global-lotus-center" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fef08a" stopOpacity="0.45" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>

              {/* 8 Outer Petals Chromatic Gradients */}
              {LOTUS_CHROMA_PETALS.map((petal, i) => (
                <linearGradient
                  key={`global-outer-${i}`}
                  id={`global-lotus-outer-${i}`}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor={petal.color} stopOpacity="0.45" />
                  <stop offset="45%" stopColor={petal.color} stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#070709" stopOpacity="0.30" />
                </linearGradient>
              ))}

              {/* 8 Inner Petals Harmonic Transition Gradients */}
              {LOTUS_INNER_PETALS.map((petal, i) => (
                <linearGradient
                  key={`global-inner-${i}`}
                  id={`global-lotus-inner-${i}`}
                  x1="0%"
                  y1="100%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor={petal.color} stopOpacity="0.55" />
                  <stop offset="50%" stopColor={petal.color} stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#070709" stopOpacity="0.25" />
                </linearGradient>
              ))}
            </defs>

            {/* 🌸 Capa Exterior: 8 Pétalos Cromáticos */}
            {LOTUS_CHROMA_PETALS.map((petal, i) => (
              <g key={`ambient-outer-${i}`} transform={`rotate(${petal.angle})`}>
                <path
                  d="M 0 -85 C 58 -115 68 -180 0 -235 C -68 -180 -58 -115 0 -85 Z"
                  fill={`url(#global-lotus-outer-${i})`}
                  stroke={petal.color}
                  strokeOpacity="0.35"
                  strokeWidth="1.2"
                />
                <path
                  d="M 0 -85 L 0 -235"
                  stroke={petal.color}
                  strokeOpacity="0.30"
                  strokeWidth="1.2"
                />
              </g>
            ))}

            {/* 🌸 Capa Interior: 8 Pétalos de Transición Armónica (Offset 22.5°) */}
            {LOTUS_INNER_PETALS.map((petal, i) => (
              <g key={`ambient-inner-${i}`} transform={`rotate(${petal.angle})`}>
                <path
                  d="M 0 -60 C 44 -85 52 -135 0 -180 C -52 -135 -44 -85 0 -60 Z"
                  fill={`url(#global-lotus-inner-${i})`}
                  stroke={petal.color}
                  strokeOpacity="0.38"
                  strokeWidth="1"
                />
              </g>
            ))}

            <circle cx="0" cy="0" fill="url(#global-lotus-center)" r="75" stroke="rgba(254, 240, 138, 0.45)" strokeWidth="2" />
            <circle cx="0" cy="0" fill="none" r="140" stroke="rgba(255, 255, 255, 0.15)" strokeDasharray="8 8" strokeWidth="1" />
            <circle cx="0" cy="0" fill="none" r="210" stroke="rgba(255, 255, 255, 0.10)" strokeDasharray="12 12" strokeWidth="0.8" />
          </svg>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. MAIN NAVBAR (Full Screen Haute Parfumerie from Stitch)                 */}
      {/* ========================================================================= */}
      <header className="relative z-50 w-full px-6 lg:px-14 py-6 border-b border-white/[0.06]">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          {/* Brand Logo & Haute Parfumerie Subtitle */}
          <Link
            to="/"
            onClick={() => {
              setSelectedProductId(null)
              setIsCheckout(false)
              setIsProfileOpen(false)
            }}
            className="flex items-center gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-full border border-white/20 bg-white/5 backdrop-blur-md flex items-center justify-center text-base font-bold text-white tracking-widest transition group-hover:border-white/60 shadow-lg">
              L
            </div>
            <div className="flex flex-col">
              <span className="text-white font-extrabold text-base tracking-[0.2em] uppercase leading-none">
                LUMINA
              </span>
              <span className="text-[9px] text-white/50 tracking-[0.3em] font-medium uppercase mt-1">
                Haute Parfumerie
              </span>
            </div>
          </Link>

          {/* Center Navigation Pill Switcher */}
          <nav className="hidden md:flex items-center p-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-2xl">
            <button
              onClick={scrollToCatalog}
              className="px-6 py-2 rounded-full text-xs font-semibold text-black bg-white transition duration-200 shadow-md cursor-pointer"
            >
              Colección
            </button>
            <Link
              to="/hero-3d"
              className="px-6 py-2 rounded-full text-xs font-medium text-white/70 hover:text-white transition duration-200 flex items-center gap-2"
            >
              <span>Showcase 3D</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse"></span>
            </Link>
          </nav>

          {/* Right Action Icons & Button */}
          <div className="flex items-center gap-3">
            {/* Admin Quick Badge (if admin) */}
            {isAdmin && (
              <Link
                to="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-rose-300 bg-rose-950/60 border border-rose-800/50 hover:bg-rose-900 transition"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                <span>Admin</span>
              </Link>
            )}

            {/* User Profile */}
            <button
              onClick={handleUserIconClick}
              aria-label="Cuenta de usuario"
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:border-white/30 flex items-center justify-center text-white/80 hover:text-white transition backdrop-blur-md cursor-pointer"
              type="button"
              title={isAuthenticated ? user?.email : 'Iniciar Sesión'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
              </svg>
            </button>

            {/* Shopping Cart with Counter */}
            <button
              onClick={openDrawer}
              aria-label="Carrito de compras"
              className="relative w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:border-white/30 flex items-center justify-center text-white/80 hover:text-white transition backdrop-blur-md cursor-pointer"
              type="button"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
              </svg>
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-[9px] font-bold text-white flex items-center justify-center border border-black shadow">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Tienda CTA Pill (Hidden when already in the collection section) */}
            {(selectedProductId || isCheckout || isProfileOpen) && (
              <button
                onClick={scrollToCatalog}
                className="hidden sm:inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold text-white bg-white/10 border border-white/15 hover:bg-white hover:text-black transition duration-300 shadow-md cursor-pointer"
              >
                <span>Tienda</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Slide-over Side Cart Drawer */}
      <CartDrawer onProceedToCheckout={() => setIsCheckout(true)} />

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
              <CheckoutPage onBack={() => setIsCheckout(false)} />
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
              <UserProfile onBack={() => setIsProfileOpen(false)} />
            </motion.div>
          ) : (
            /* Full-Screen Haute Parfumerie Product Catalog */
            <motion.div
              key="catalog"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex-1"
            >
              <ProductGrid
                selectedCategorySlug="all"
                onProductClick={handleProductSelect}
                searchQuery={searchQuery}
                onClearSearch={() => setSearchQuery('')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ========================================================================= */}
      {/* 3. HAUTE FOOTER (From Stitch HTML)                                        */}
      {/* ========================================================================= */}
      <footer className="relative z-10 bg-[#0a0a0e] border-t border-white/10 px-6 lg:px-14 py-12">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand & Maison Bio */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-8 h-8 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-sm font-bold text-white tracking-widest">
                L
              </div>
              <span className="text-white font-bold tracking-[0.2em] text-sm uppercase">LUMINA</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed font-light">
              Maison dedicada a la curaduría y distribución exclusiva de alta perfumería oriental, extractos de nicho y botellas icónicas de autor.
            </p>
          </div>

          {/* Haute Guarantees */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-white mb-4">Garantías Lumina</h4>
            <ul className="space-y-2.5 text-xs text-gray-400 font-light">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Frascos 100% Originales con Batch Code
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Envío gratis de cortesía a todo el país
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Hasta 6 cuotas sin interés
              </li>
            </ul>
          </div>

          {/* Quick Nav Links */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-white mb-4">Maison &amp; Contacto</h4>
            <ul className="space-y-2.5 text-xs text-gray-400 font-light">
              <li>
                <Link to="/hero-3d" className="hover:text-white transition">
                  Showcase 3D Interactivo
                </Link>
              </li>
              <li>
                <button onClick={scrollToCatalog} className="hover:text-white transition cursor-pointer text-left">
                  Guía de Notas Olfativas
                </button>
              </li>
              <li>
                <button onClick={scrollToCatalog} className="hover:text-white transition cursor-pointer text-left">
                  Atención al Cliente Privé
                </button>
              </li>
              <li>
                <button onClick={scrollToCatalog} className="hover:text-white transition cursor-pointer text-left">
                  Boutique &amp; Salón Privado
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter for VIP Releases */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-white mb-4">Círculo Privado</h4>
            <p className="text-xs text-gray-400 mb-3 font-light">
              Acceso prioritario a lanzamientos limitados de Afnan, Armaf y Lattafa.
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                className="bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-white/40 flex-1"
                placeholder="correo@haute-parfumerie.com"
                type="email"
              />
              <button
                className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-gray-200 transition cursor-pointer"
                type="submit"
              >
                Unirse
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Copyright & Legal Line */}
        <div className="max-w-[1440px] mx-auto pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-400 gap-4">
          <div>© 2025 LUMINA HAUTE PARFUMERIE. Todos los derechos reservados.</div>
          <div className="flex items-center gap-6">
            <span>Envío gratis a todo el país</span>
            <span>•</span>
            <span>Cuotas sin interés</span>
            <span>•</span>
            <a className="hover:text-white transition" href="#catalog-section">
              Términos de Privacidad
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
          <Route path="/hero-3d" element={<LuxuryHeroShowcase />} />
          <Route path="/profile" element={<UserProfile onBack={() => window.history.back()} />} />
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
