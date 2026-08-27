import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'

import { Login } from './features/auth/components/Login'
import { Register } from './features/auth/components/Register'
import { Sidebar } from './components/common/Sidebar'
import { Header } from './components/common/Header'
import { Footer } from './components/common/Footer'
import { BottomNav } from './components/common/BottomNav'
import { AdminProtectedRoute } from './components/common/AdminProtectedRoute'
import { HeroSection } from './features/ecommerce/components/HeroSection'
import { ProductGrid } from './features/ecommerce/components/ProductGrid'
import { ProductDetail } from './features/ecommerce/components/ProductDetail'
import { CheckoutPage } from './features/ecommerce/components/CheckoutPage'
import { CartDrawer } from './features/ecommerce/components/CartDrawer'
import { UserProfile } from './features/profile/components/UserProfile'
import { AdminPanel } from './features/admin/components/AdminPanel'

const queryClient = new QueryClient()

function MainStore() {
  const [currentTab, setCurrentTab] = useState<'home' | 'categories' | 'favorites' | 'account'>('home')
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('all')
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [isCheckout, setIsCheckout] = useState<boolean>(false)

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [selectedProductId, isCheckout, currentTab])

  const handleTabChange = (tab: 'home' | 'categories' | 'favorites' | 'account') => {
    setCurrentTab(tab)
    setSelectedProductId(null)
    setIsCheckout(false)
    if (tab === 'home') {
      setSelectedCategorySlug('all')
    }
  }

  const handleCategorySelect = (slug: string) => {
    setSelectedCategorySlug(slug)
    setSelectedProductId(null)
    setIsCheckout(false)
    setCurrentTab('categories')
  }

  const handleProductSelect = (id: string) => {
    setSelectedProductId(id)
    setIsCheckout(false)
  }

  return (
    <div className="bg-[#fbf9f8] text-[#1b1c1c] font-body min-h-screen antialiased flex">
      {/* SideNavBar (Desktop Fixed Left) */}
      <Sidebar currentTab={currentTab} onTabChange={handleTabChange} />

      {/* Main Content Area (Offset on Desktop) */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* TopNavBar */}
        <Header
          selectedCategorySlug={selectedCategorySlug}
          onCategorySelect={handleCategorySelect}
        />

        {/* Slide-over Side Cart Drawer */}
        <CartDrawer onProceedToCheckout={() => setIsCheckout(true)} />

        {/* Main Canvas */}
        <main className="flex-1 p-4 md:p-12 flex flex-col gap-10">
          <AnimatePresence mode="wait">
            {isCheckout ? (
              /* Checkout Page */
              <motion.div
                key="checkout"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <CheckoutPage onBack={() => setIsCheckout(false)} />
              </motion.div>
            ) : selectedProductId ? (
              /* Product Detail Page (PDP) */
              <motion.div
                key="detail"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ProductDetail
                  productId={selectedProductId}
                  onBack={() => setSelectedProductId(null)}
                  onProductClick={handleProductSelect}
                />
              </motion.div>
            ) : currentTab === 'account' ? (
              /* User Profile Screen */
              <motion.div
                key="account"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <UserProfile onBack={() => handleTabChange('home')} />
              </motion.div>
            ) : (
              /* Home Discovery Canvas */
              <motion.div
                key="home"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-10"
              >
                {/* Hero Section (Capture Life's Brilliance) */}
                <HeroSection onProductClick={handleProductSelect} />

                {/* Trending Now Product Grid */}
                <ProductGrid
                  selectedCategorySlug={selectedCategorySlug}
                  onProductClick={handleProductSelect}
                  onViewAll={() => handleCategorySelect('all')}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Spacer for bottom nav on mobile */}
          <div className="h-20 lg:hidden"></div>
        </main>

        {/* Footer */}
        <Footer />
      </div>

      {/* BottomNavBar (Mobile Only) */}
      <BottomNav currentTab={currentTab} onTabChange={handleTabChange} />
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainStore />} />
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
