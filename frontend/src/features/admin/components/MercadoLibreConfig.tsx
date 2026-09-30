import React, { useState, useEffect } from 'react'
import { mercadoLibreApi, type MeliAccountStatusDTO } from '../../../api/mercadoLibreApi'
import { productsApi, type BackendProductDTO } from '../../../api/productsApi'

export const MercadoLibreConfig: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Status & Credentials
  const [accountStatus, setAccountStatus] = useState<MeliAccountStatusDTO | null>(null)
  const [appId, setAppId] = useState('2810037089837236')
  const [clientSecret, setClientSecret] = useState('')
  const [redirectUrl, setRedirectUrl] = useState('')
  const [autoSyncStock, setAutoSyncStock] = useState(true)
  const [priceMarkup, setPriceMarkup] = useState('15')
  const [isActive, setIsActive] = useState(true)
  const [processingAuth, setProcessingAuth] = useState(false)

  // Products catalog
  const [products, setProducts] = useState<BackendProductDTO[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [publishingId, setPublishingId] = useState<string | null>(null)
  const [syncingId, setSyncingId] = useState<string | null>(null)

  useEffect(() => {
    fetchData()

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'lumina_meli_account_config') {
        mercadoLibreApi.getStatus().then((st) => setAccountStatus(st))
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [status, prodsRes] = await Promise.all([
        mercadoLibreApi.getStatus(),
        productsApi.getProducts(),
      ])

      setAccountStatus(status)
      setAppId(status.app_id || '2810037089837236')
      setClientSecret(status.client_secret || '')
      const initialRedirect = (!status.redirect_url || status.redirect_url.includes('localhost'))
        ? 'https://lumina-d31.pages.dev/admin'
        : status.redirect_url
      setRedirectUrl(initialRedirect)
      setAutoSyncStock(status.sync_stock_automatically)
      setPriceMarkup((status.price_markup_percent ?? 15).toString())
      setIsActive(status.is_active)
      setProducts(prodsRes.products || [])

      // Detect OAuth authorization code in URL query string
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      if (code) {
        setProcessingAuth(true)
        try {
          const res = await mercadoLibreApi.handleOAuthCallback(code, 'https://lumina-d31.pages.dev/admin')
          if (res.success) {
            setSuccessMsg(`¡Conexión exitosa! Cuenta vinculada con Mercado Libre (${res.nickname || 'Formula 1370'})`)
            const refreshed = await mercadoLibreApi.getStatus()
            setAccountStatus(refreshed)
            // Remove code from address bar without reloading
            window.history.replaceState({}, document.title, window.location.pathname)
          }
        } catch (authErr: any) {
          setErrorMsg('Error al intercambiar autorización: ' + (authErr.message || authErr))
        } finally {
          setProcessingAuth(false)
        }
      }
    } catch (err: any) {
      setErrorMsg('No se pudo cargar la información de Mercado Libre')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccessMsg(null)
    setErrorMsg(null)

    try {
      let cleanRedirect = redirectUrl.trim()
      if (!cleanRedirect || cleanRedirect.includes('localhost')) {
        cleanRedirect = 'https://lumina-d31.pages.dev/admin'
      }
      await mercadoLibreApi.updateConfig({
        app_id: appId.trim() || '2810037089837236',
        client_secret: clientSecret.trim(),
        redirect_url: cleanRedirect,
        is_active: isActive,
        sync_stock_automatically: autoSyncStock,
        price_markup_percent: parseFloat(priceMarkup) || 0,
      })
      setSuccessMsg('Configuración y credenciales de Mercado Libre guardadas correctamente')
      setTimeout(() => setSuccessMsg(null), 3500)
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar la configuración')
    } finally {
      setSaving(false)
    }
  }

  const handleConnectMeli = async () => {
    const cleanAppId = appId.trim() || '2810037089837236'
    let cleanRedirectUrl = redirectUrl.trim()
    if (!cleanRedirectUrl || cleanRedirectUrl.includes('localhost') || !cleanRedirectUrl.startsWith('https://')) {
      cleanRedirectUrl = 'https://lumina-d31.pages.dev/admin'
    }

    if (!cleanAppId) {
      setErrorMsg('Por favor ingresa tu App ID (Client ID)')
      return
    }

    try {
      await mercadoLibreApi.updateConfig({
        app_id: cleanAppId,
        client_secret: clientSecret.trim(),
        redirect_url: cleanRedirectUrl,
        is_active: isActive,
        sync_stock_automatically: autoSyncStock,
        price_markup_percent: parseFloat(priceMarkup) || 0,
      })
    } catch (e) {}

    const authUrl = `https://auth.mercadolibre.com.ar/authorization?response_type=code&client_id=${cleanAppId}&redirect_uri=${encodeURIComponent(cleanRedirectUrl)}`
    window.location.href = authUrl
  }

  const handleDisconnect = async () => {
    if (!confirm('¿Seguro que deseas desvincular la cuenta de Mercado Libre?')) return
    await mercadoLibreApi.disconnect()
    const st = await mercadoLibreApi.getStatus()
    setAccountStatus(st)
    setSuccessMsg('Cuenta de Mercado Libre desvinculada')
    setTimeout(() => setSuccessMsg(null), 3000)
  }

  const handlePublish = async (prod: BackendProductDTO) => {
    setPublishingId(prod.id)
    setErrorMsg(null)

    try {
      const markupVal = parseFloat(priceMarkup) || 0
      const calculatedMeliPrice = Math.round(prod.price * (1 + markupVal / 100))

      const res = await mercadoLibreApi.publishProduct(prod.id, calculatedMeliPrice)

      // Update product locally in table
      setProducts((prev) =>
        prev.map((p) =>
          p.id === prod.id
            ? {
                ...p,
                meli_id: res.meli_id,
                meli_permalink: res.meli_permalink,
                meli_status: res.status,
                meli_price: res.price,
              }
            : p
        )
      )

      setSuccessMsg(`¡"${prod.title}" publicado con éxito en Mercado Libre (${res.meli_id})!`)
      setTimeout(() => setSuccessMsg(null), 4000)
    } catch (err: any) {
      setErrorMsg(`Error al publicar: ${err.message || err}`)
    } finally {
      setPublishingId(null)
    }
  }

  const handleSyncStock = async (prod: BackendProductDTO) => {
    setSyncingId(prod.id)
    setErrorMsg(null)

    try {
      await mercadoLibreApi.syncStock(prod.id)
      setSuccessMsg(`Stock de "${prod.title}" (${prod.stock} uds) sincronizado con Mercado Libre`)
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err: any) {
      setErrorMsg(`Error al sincronizar stock: ${err.message || err}`)
    } finally {
      setSyncingId(null)
    }
  }

  const filteredProducts = products.filter((p) =>
    (p.title + ' ' + (p.category_name || '') + ' ' + (p.brand || '')).toLowerCase().includes(searchQuery.toLowerCase())
  )

  const markupNum = parseFloat(priceMarkup) || 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[350px]">
        <div className="flex flex-col items-center gap-3 text-[#5b403e] dark:text-[#9ca3af]">
          <span className="material-symbols-outlined text-4xl animate-spin text-[#FF4D4F]">progress_activity</span>
          <p className="text-xs font-semibold">Cargando estado de Mercado Libre...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 font-body text-[#1b1c1c] dark:text-[#f9fafb]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFE600] animate-pulse"></span>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#2D3277] dark:text-[#FFE600]">
              Integración Oficial
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#1b1c1c] dark:text-white tracking-tight mt-0.5">
            Mercado Libre & Sincronización
          </h1>
          <p className="text-xs sm:text-sm text-[#5b403e] dark:text-[#9ca3af] mt-1 max-w-2xl">
            Publica tus perfumes automáticamente en Mercado Libre y mantén el stock sincronizado en ambos sentidos: si se vende por acá o por allá, el inventario se descuenta solo.
          </p>
        </div>

        {/* Global Connection Badge */}
        <div className="flex items-center gap-3">
          {accountStatus?.is_connected ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8F8F0] dark:bg-[#4ade80]/15 border border-[#B7E5CD] dark:border-[#4ade80]/30 text-[#1E824C] dark:text-[#4ade80] text-xs font-bold">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>Conectado: {accountStatus.nickname || 'Cuenta Vendedor'}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold">
              <span className="material-symbols-outlined text-[16px]">warning</span>
              <span>No Vinculado</span>
            </div>
          )}

          <button
            onClick={fetchData}
            title="Refrescar Estado"
            className="p-2 rounded-xl border border-white/60 dark:border-white/10 hover:bg-white/40 dark:hover:bg-white/5 text-[#5b403e] dark:text-[#9ca3af] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-[#E8F8F0] dark:bg-[#4ade80]/15 border border-[#B7E5CD] dark:border-[#4ade80]/30 text-[#1E824C] dark:text-[#4ade80] text-xs font-bold flex items-center gap-2.5 shadow-sm animate-fade-in">
          <span className="material-symbols-outlined text-[20px]">task_alt</span>
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs font-bold flex items-center gap-2.5 shadow-sm animate-fade-in">
          <span className="material-symbols-outlined text-[20px]">error</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid: Credentials & Sync Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Credentials form */}
        <form
          onSubmit={handleSaveConfig}
          className="lg:col-span-2 glass-panel rounded-3xl p-6 sm:p-8 border border-white/70 dark:border-white/10 shadow-sm space-y-6"
        >
          <div className="flex items-center justify-between border-b border-white/60 dark:border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FFE600] flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-[#2D3277] text-[26px]">handshake</span>
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#1b1c1c] dark:text-white">
                  Credenciales de tu Aplicación MELI
                </h3>
                <p className="text-xs text-[#5b403e] dark:text-[#9ca3af]">
                  Obtenidas en <span className="font-mono text-[#FF4D4F]">developers.mercadolibre.com.ar</span>
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF4D4F]"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-[#5b403e] dark:text-[#9ca3af] block mb-1">
                App ID (Client ID)
              </label>
              <input
                type="text"
                placeholder="Ej. 1827401928374"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                className="glass-input w-full px-3.5 py-2.5 rounded-xl font-mono text-xs outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-[#5b403e] dark:text-[#9ca3af] block mb-1">
                Client Secret
              </label>
              <input
                type="password"
                placeholder="••••••••••••••••••••••••"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                className="glass-input w-full px-3.5 py-2.5 rounded-xl font-mono text-xs outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-[#5b403e] dark:text-[#9ca3af] block mb-1">
                URL de Redirección (OAuth Redirect URI)
              </label>
              <input
                type="text"
                value={redirectUrl}
                onChange={(e) => setRedirectUrl(e.target.value)}
                className="glass-input w-full px-3.5 py-2.5 rounded-xl font-mono text-xs outline-none"
              />
              <span className="text-[10px] text-[#5b403e]/70 dark:text-[#9ca3af]/70 mt-1 block">
                Copia esta misma URL en la configuración de tu aplicación en Mercado Libre Developers.
              </span>
            </div>
          </div>

          {/* Sync Options */}
          <div className="pt-2 border-t border-white/60 dark:border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div className="flex flex-col justify-center">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSyncStock}
                  onChange={(e) => setAutoSyncStock(e.target.checked)}
                  className="mt-0.5 rounded text-[#FF4D4F] focus:ring-[#FF4D4F]/30"
                />
                <div>
                  <span className="font-bold text-[#1b1c1c] dark:text-white block">
                    Sincronización Automática de Stock
                  </span>
                  <span className="text-[11px] text-[#5b403e] dark:text-[#9ca3af]">
                    Si se vende un perfume por la web, descuenta el stock en Mercado Libre. Si se vende por Mercado Libre, lo descuenta en Lumina.
                  </span>
                </div>
              </label>
            </div>

            <div>
              <label className="font-bold text-[#5b403e] dark:text-[#9ca3af] block mb-1">
                Recargo Automático para Mercado Libre (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={priceMarkup}
                  onChange={(e) => setPriceMarkup(e.target.value)}
                  className="glass-input w-28 px-3.5 py-2.5 rounded-xl font-bold text-xs outline-none"
                />
                <span className="text-[11px] text-[#5b403e] dark:text-[#9ca3af]">
                  Absorbe la comisión por venta de ML (ej. 15%).
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/60 dark:border-white/10">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleConnectMeli}
                disabled={processingAuth}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-[#FFE600] text-[#2D3277] hover:bg-[#ffe000] flex items-center gap-2 shadow-sm cursor-pointer transition-all hover:scale-[1.02] disabled:opacity-60"
              >
                {processingAuth ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    <span>Vinculando cuenta...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">login</span>
                    <span>{accountStatus?.is_connected ? 'Reconectar con Mercado Libre' : 'Conectar con Mercado Libre'}</span>
                  </>
                )}
              </button>

              {accountStatus?.is_connected && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 border border-red-200 dark:border-red-900/50 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">link_off</span>
                  <span>Desvincular</span>
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>

        {/* Right: Webhook info & Quick Guide */}
        <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-white/70 dark:border-white/10 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-[#1b1c1c] dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#FF4D4F] text-[20px]">webhook</span>
              <span>Webhook de Compras en Vivo</span>
            </h3>

            <p className="text-xs text-[#5b403e] dark:text-[#9ca3af] leading-relaxed">
              Configura este endpoint en Mercado Libre Developers para que tu tienda reciba notificaciones cuando alguien te compra:
            </p>

            <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/60 dark:border-white/10 font-mono text-[11px] break-all text-[#FF4D4F] font-bold">
              {window.location.origin}/api/v1/mercadolibre/webhook
            </div>

            <div className="space-y-2 text-xs text-[#5b403e] dark:text-[#9ca3af] pt-2">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-emerald-500 mt-0.5">check</span>
                <span>Tópico obligatorio: <b>orders_v2</b></span>
              </div>
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-emerald-500 mt-0.5">check</span>
                <span>Descuento de stock en tiempo real</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-emerald-500 mt-0.5">check</span>
                <span>Pausa automática cuando el stock es 0</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFE600]/10 dark:bg-[#FFE600]/5 border border-[#FFE600]/20 text-[11px] text-[#2D3277] dark:text-[#FFE600]">
            <p className="font-bold flex items-center gap-1.5 mb-1">
              <span className="material-symbols-outlined text-[16px]">info</span>
              <span>¿No tienes credenciales aún?</span>
            </p>
            <span>
              Ingresa en developers.mercadolibre.com.ar, crea una aplicación de tipo <i>Vendedor</i> y pega aquí tu App ID y Client Secret.
            </span>
          </div>
        </div>
      </div>

      {/* Catalog & Publication Management */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/70 dark:border-white/10 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/60 dark:border-white/10 pb-5">
          <div>
            <h3 className="text-xl font-extrabold text-[#1b1c1c] dark:text-white tracking-tight">
              Catálogo de Perfumes ({products.length})
            </h3>
            <p className="text-xs text-[#5b403e] dark:text-[#9ca3af] mt-0.5">
              Publica perfumes individuales o fuerza la sincronización de inventario hacia Mercado Libre.
            </p>
          </div>

          <div className="w-full sm:w-72">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-[#5b403e] dark:text-[#9ca3af]">
                search
              </span>
              <input
                type="text"
                placeholder="Buscar perfume..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input w-full pl-10 pr-4 py-2 rounded-xl text-xs outline-none"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/60 dark:border-white/10 text-[11px] uppercase tracking-wider text-[#5b403e] dark:text-[#9ca3af] font-bold">
                <th className="pb-3 px-3">Perfume</th>
                <th className="pb-3 px-3">Stock Web</th>
                <th className="pb-3 px-3">Precio Tienda</th>
                <th className="pb-3 px-3">Precio ML (+{markupNum}%)</th>
                <th className="pb-3 px-3">Estado Mercado Libre</th>
                <th className="pb-3 px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40 dark:divide-white/5">
              {filteredProducts.map((prod) => {
                const meliPriceCalculated = Math.round(prod.price * (1 + markupNum / 100))
                const isPublished = Boolean(prod.meli_id)
                const isCurrentlyPublishing = publishingId === prod.id
                const isCurrentlySyncing = syncingId === prod.id

                return (
                  <tr key={prod.id} className="hover:bg-white/40 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.image || 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=100&q=80'}
                          alt={prod.title}
                          className="w-10 h-10 rounded-xl object-cover border border-white/60 dark:border-white/10 shadow-2xs"
                        />
                        <div>
                          <p className="font-extrabold text-[#1b1c1c] dark:text-white line-clamp-1">{prod.title}</p>
                          <p className="text-[10px] text-[#5b403e] dark:text-[#9ca3af]">
                            {prod.brand || prod.category_name || 'Lumina'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md font-bold text-[11px] ${
                          prod.stock > 5
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : prod.stock > 0
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                            : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                        }`}
                      >
                        {prod.stock} unidades
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-semibold text-[#1b1c1c] dark:text-white">
                      ${prod.price.toLocaleString('es-AR')}
                    </td>

                    <td className="py-3.5 px-3 font-bold text-[#FF4D4F]">
                      ${(prod.meli_price || meliPriceCalculated).toLocaleString('es-AR')}
                    </td>

                    <td className="py-3.5 px-3">
                      {isPublished ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F8F0] dark:bg-[#4ade80]/15 text-[#1E824C] dark:text-[#4ade80]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#1E824C] dark:bg-[#4ade80]"></span>
                            Publicado
                          </span>
                          {prod.meli_permalink && (
                            <a
                              href={prod.meli_permalink}
                              target="_blank"
                              rel="noreferrer"
                              className="block text-[10px] font-mono text-[#2D3277] dark:text-[#FFE600] hover:underline"
                            >
                              {prod.meli_id} ↗
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400">
                          No Publicado
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      {isPublished ? (
                        <button
                          onClick={() => handleSyncStock(prod)}
                          disabled={isCurrentlySyncing}
                          className="px-3 py-1.5 rounded-xl border border-white/80 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10 text-xs font-bold text-[#1b1c1c] dark:text-white flex items-center gap-1.5 ml-auto cursor-pointer disabled:opacity-50"
                        >
                          <span className={`material-symbols-outlined text-[16px] ${isCurrentlySyncing ? 'animate-spin' : ''}`}>
                            sync
                          </span>
                          <span>{isCurrentlySyncing ? 'Sincronizando...' : 'Sincronizar Stock'}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePublish(prod)}
                          disabled={isCurrentlyPublishing}
                          className="px-3.5 py-1.5 rounded-xl bg-[#FFE600] text-[#2D3277] hover:bg-[#ffe000] text-xs font-bold flex items-center gap-1.5 ml-auto shadow-xs cursor-pointer disabled:opacity-50"
                        >
                          <span className={`material-symbols-outlined text-[16px] ${isCurrentlyPublishing ? 'animate-spin' : ''}`}>
                            upload
                          </span>
                          <span>{isCurrentlyPublishing ? 'Publicando...' : 'Publicar en ML'}</span>
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-[#5b403e] dark:text-[#9ca3af]">
                    No se encontraron perfumes para los criterios de búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/70 dark:border-white/10 shadow-sm space-y-4">
        <h3 className="text-lg font-extrabold text-[#1b1c1c] dark:text-white tracking-tight flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-[#2D3277] dark:text-[#FFE600]">history</span>
          <span>Historial de Sincronización y Webhooks en Vivo</span>
        </h3>

        <div className="divide-y divide-white/40 dark:divide-white/5">
          {(accountStatus?.recent_logs || []).slice(0, 8).map((log) => (
            <div key={log.id} className="py-3 flex items-start justify-between gap-4 text-xs">
              <div className="flex items-start gap-2.5">
                <span
                  className={`material-symbols-outlined text-[18px] mt-0.5 ${
                    log.status === 'success' ? 'text-emerald-500' : 'text-red-500'
                  }`}
                >
                  {log.status === 'success' ? 'check_circle' : 'cancel'}
                </span>
                <div>
                  <p className="font-bold text-[#1b1c1c] dark:text-white">{log.message}</p>
                  <p className="text-[10px] text-[#5b403e] dark:text-[#9ca3af] font-mono mt-0.5">
                    Evento: {log.event_type}
                  </p>
                </div>
              </div>

              <span className="text-[10px] text-[#5b403e] dark:text-[#9ca3af] whitespace-nowrap">
                {new Date(log.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}

          {(!accountStatus?.recent_logs || accountStatus.recent_logs.length === 0) && (
            <p className="text-center py-4 text-xs text-[#5b403e] dark:text-[#9ca3af]">
              No hay eventos registrados recientemente.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
