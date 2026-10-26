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
        <div className="flex flex-col items-center gap-3 text-[#121314]">
          <div className="w-10 h-10 border-3 border-[#121314] border-t-[#FFE600] rounded-full animate-spin"></div>
          <p className="text-xs font-black uppercase tracking-wider">Cargando estado de Mercado Libre...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 font-dm text-[#121314]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#FFE600] border border-[#121314] shadow-[1px_1px_0px_#121314]"></span>
            <span className="text-[11px] font-black uppercase tracking-widest text-[#121314]">
              Integración Oficial
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#121314] tracking-tight uppercase mt-1">
            Mercado Libre & Sincronización
          </h1>
          <p className="text-xs sm:text-sm font-medium text-[#121314]/70 mt-1 max-w-2xl">
            Publica perfumes automáticamente en Mercado Libre y mantén el stock sincronizado bidireccionalmente en tiempo real.
          </p>
        </div>

        {/* Global Connection Badge */}
        <div className="flex items-center gap-3">
          {accountStatus?.is_connected ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0ffcbe] border-2 border-[#121314] shadow-[2px_2px_0px_#121314] text-[#121314] text-xs font-black uppercase tracking-wider">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>Conectado: {accountStatus.nickname || 'Cuenta Vendedor'}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFE600] border-2 border-[#121314] shadow-[2px_2px_0px_#121314] text-[#121314] text-xs font-black uppercase tracking-wider">
              <span className="material-symbols-outlined text-[16px]">warning</span>
              <span>No Vinculado</span>
            </div>
          )}

          <button
            onClick={fetchData}
            title="Refrescar Estado"
            className="p-2.5 rounded-xl bg-white border-2 border-[#121314] shadow-[2px_2px_0px_#121314] hover:bg-[#f6f4ee] text-[#121314] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-[#0ffcbe] border-2 border-[#121314] shadow-[4px_4px_0px_#121314] text-[#121314] text-xs font-black uppercase tracking-wider flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[20px]">task_alt</span>
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-[#ff78ac] border-2 border-[#121314] shadow-[4px_4px_0px_#121314] text-[#121314] text-xs font-black uppercase tracking-wider flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[20px]">error</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid: Credentials & Sync Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Credentials form */}
        <form
          onSubmit={handleSaveConfig}
          className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#121314] shadow-[4px_4px_0px_#121314] space-y-6"
        >
          <div className="flex items-center justify-between border-b-2 border-[#121314]/15 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#FFE600] border-2 border-[#121314] flex items-center justify-center shadow-[2px_2px_0px_#121314]">
                <span className="material-symbols-outlined text-[#121314] text-[26px]">handshake</span>
              </div>
              <div>
                <h3 className="text-base font-black uppercase tracking-wide text-[#121314]">
                  Credenciales de tu Aplicación MELI
                </h3>
                <p className="text-xs font-medium text-[#121314]/70">
                  Obtenidas en <span className="font-mono font-black text-[#106ebe]">developers.mercadolibre.com.ar</span>
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
              <div className="w-12 h-7 bg-[#f6f4ee] border-2 border-[#121314] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[#121314] after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-2 after:border-[#121314] after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0ffcbe]"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-black uppercase tracking-wider text-[#121314] block mb-1">
                App ID (Client ID)
              </label>
              <input
                type="text"
                placeholder="Ej. 2810037089837236"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                className="w-full bg-[#f6f4ee] border-2 border-[#121314] px-3.5 py-2.5 rounded-xl font-mono text-xs font-bold text-[#121314] outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="font-black uppercase tracking-wider text-[#121314] block mb-1">
                Client Secret
              </label>
              <input
                type="password"
                placeholder="••••••••••••••••••••••••"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                className="w-full bg-[#f6f4ee] border-2 border-[#121314] px-3.5 py-2.5 rounded-xl font-mono text-xs font-bold text-[#121314] outline-none focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-black uppercase tracking-wider text-[#121314] block mb-1">
                URL de Redirección (OAuth Redirect URI)
              </label>
              <input
                type="text"
                value={redirectUrl}
                onChange={(e) => setRedirectUrl(e.target.value)}
                className="w-full bg-[#f6f4ee] border-2 border-[#121314] px-3.5 py-2.5 rounded-xl font-mono text-xs font-bold text-[#121314] outline-none focus:bg-white"
              />
              <span className="text-[10px] font-bold text-[#121314]/60 mt-1 block">
                Copia esta misma URL en la configuración de tu aplicación en Mercado Libre Developers.
              </span>
            </div>
          </div>

          {/* Sync Options */}
          <div className="pt-2 border-t-2 border-[#121314]/15 grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div className="flex flex-col justify-center">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSyncStock}
                  onChange={(e) => setAutoSyncStock(e.target.checked)}
                  className="mt-0.5 rounded border-2 border-[#121314] text-[#121314]"
                />
                <div>
                  <span className="font-black uppercase tracking-wider text-[#121314] block">
                    Sincronización Automática
                  </span>
                  <span className="text-[11px] font-medium text-[#121314]/70">
                    Descuenta el inventario bidireccionalmente ante cualquier venta.
                  </span>
                </div>
              </label>
            </div>

            <div>
              <label className="font-black uppercase tracking-wider text-[#121314] block mb-1">
                Recargo Automático para ML (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={priceMarkup}
                  onChange={(e) => setPriceMarkup(e.target.value)}
                  className="w-28 bg-[#f6f4ee] border-2 border-[#121314] px-3.5 py-2.5 rounded-xl font-black text-[#106ebe] text-xs outline-none focus:bg-white"
                />
                <span className="text-[11px] font-medium text-[#121314]/70">
                  Compensa la comisión de Mercado Libre (ej. 15%).
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t-2 border-[#121314]/15">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleConnectMeli}
                disabled={processingAuth}
                className="px-5 py-2.5 rounded-full font-black text-xs uppercase tracking-wider bg-[#FFE600] text-[#121314] hover:bg-[#ebd300] flex items-center gap-2 border-2 border-[#121314] shadow-[3px_3px_0px_#121314] cursor-pointer transition-all disabled:opacity-60"
              >
                {processingAuth ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    <span>Vinculando...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">login</span>
                    <span>{accountStatus?.is_connected ? 'Reconectar con MELI' : 'Conectar con MELI'}</span>
                  </>
                )}
              </button>

              {accountStatus?.is_connected && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="px-4 py-2.5 rounded-full font-black text-xs uppercase tracking-wider bg-red-50 text-[#d92d20] hover:bg-red-100 border-2 border-[#d92d20] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">link_off</span>
                  <span>Desvincular</span>
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-full bg-[#0ffcbe] hover:bg-[#00eaad] text-[#121314] border-2 border-[#121314] shadow-[3px_3px_0px_#121314] text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>

        {/* Right: Webhook info */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-[#121314] shadow-[4px_4px_0px_#121314] flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h3 className="text-base font-black uppercase tracking-wide text-[#121314] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#106ebe] text-[20px]">webhook</span>
              <span>Webhook en Vivo</span>
            </h3>

            <p className="text-xs font-medium text-[#121314]/70 leading-relaxed">
              Configura este endpoint en Mercado Libre Developers para recibir notificaciones automáticas:
            </p>

            <div className="p-3.5 rounded-2xl bg-[#f6f4ee] border-2 border-[#121314] font-mono text-[11px] break-all text-[#106ebe] font-black shadow-[2px_2px_0px_#121314]">
              {window.location.origin}/api/v1/mercadolibre/webhook
            </div>

            <div className="space-y-2 text-xs font-bold text-[#121314]/80 pt-2">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#0ffcbe] mt-0.5">check_circle</span>
                <span>Tópico obligatorio: <b>orders_v2</b></span>
              </div>
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#0ffcbe] mt-0.5">check_circle</span>
                <span>Descuento de stock en tiempo real</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#0ffcbe] mt-0.5">check_circle</span>
                <span>Pausa automática cuando el stock es 0</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFE600] border-2 border-[#121314] text-[11px] text-[#121314] shadow-[2px_2px_0px_#121314]">
            <p className="font-black uppercase flex items-center gap-1.5 mb-1">
              <span className="material-symbols-outlined text-[16px]">info</span>
              <span>¿No tienes credenciales aún?</span>
            </p>
            <span className="font-medium text-[#121314]/80">
              Ingresa en developers.mercadolibre.com.ar, crea una aplicación de tipo <i>Vendedor</i> y pega aquí tu App ID y Client Secret.
            </span>
          </div>
        </div>
      </div>

      {/* Catalog & Publication Management */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#121314] shadow-[4px_4px_0px_#121314] space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-[#121314]/15 pb-5">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight text-[#121314]">
              Catálogo de Perfumes ({products.length})
            </h3>
            <p className="text-xs font-medium text-[#121314]/70 mt-0.5">
              Publica perfumes individuales o sincroniza el inventario hacia Mercado Libre.
            </p>
          </div>

          <div className="w-full sm:w-72">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-[#121314]/60">
                search
              </span>
              <input
                type="text"
                placeholder="Buscar perfume..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#f6f4ee] border-2 border-[#121314] pl-10 pr-4 py-2 rounded-full text-xs font-bold text-[#121314] outline-none focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b-2 border-[#121314] text-[11px] uppercase tracking-wider text-[#121314] font-black bg-[#f6f4ee]/70">
                <th className="py-3 px-3">Perfume</th>
                <th className="py-3 px-3">Stock Web</th>
                <th className="py-3 px-3">Precio Tienda</th>
                <th className="py-3 px-3">Precio ML (+{markupNum}%)</th>
                <th className="py-3 px-3">Estado MELI</th>
                <th className="py-3 px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#121314]/10">
              {filteredProducts.map((prod) => {
                const meliPriceCalculated = Math.round(prod.price * (1 + markupNum / 100))
                const isPublished = Boolean(prod.meli_id)
                const isCurrentlyPublishing = publishingId === prod.id
                const isCurrentlySyncing = syncingId === prod.id

                return (
                  <tr key={prod.id} className="hover:bg-[#f6f4ee]/60 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.image || 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=100&q=80'}
                          alt={prod.title}
                          className="w-10 h-10 rounded-xl object-contain bg-white p-1 border-2 border-[#121314] shadow-[2px_2px_0px_#121314]"
                        />
                        <div>
                          <p className="font-black text-[#121314] line-clamp-1 uppercase">{prod.title}</p>
                          <p className="text-[10px] font-bold text-[#121314]/60">
                            {prod.brand || prod.category_name || 'Fórmula 1370'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full font-black text-[10px] uppercase border border-[#121314] ${
                          prod.stock > 5
                            ? 'bg-[#0ffcbe] text-[#121314]'
                            : prod.stock > 0
                            ? 'bg-[#ffe600] text-[#121314]'
                            : 'bg-[#ff78ac] text-[#121314]'
                        }`}
                      >
                        {prod.stock} u.
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-bold text-[#121314]">
                      ${prod.price.toLocaleString('es-AR')}
                    </td>

                    <td className="py-3.5 px-3 font-black text-[#106ebe]">
                      ${(prod.meli_price || meliPriceCalculated).toLocaleString('es-AR')}
                    </td>

                    <td className="py-3.5 px-3">
                      {isPublished ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#0ffcbe] text-[#121314] border border-[#121314]">
                            Publicado
                          </span>
                          {prod.meli_permalink && (
                            <a
                              href={prod.meli_permalink}
                              target="_blank"
                              rel="noreferrer"
                              className="block text-[10px] font-mono font-bold text-[#106ebe] hover:underline"
                            >
                              {prod.meli_id} ↗
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#f6f4ee] text-[#121314]/60 border border-[#121314]/30">
                          No Publicado
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      {isPublished ? (
                        <button
                          onClick={() => handleSyncStock(prod)}
                          disabled={isCurrentlySyncing}
                          className="px-3.5 py-1.5 rounded-full border-2 border-[#121314] bg-white hover:bg-[#f6f4ee] text-xs font-black uppercase text-[#121314] shadow-[2px_2px_0px_#121314] flex items-center gap-1.5 ml-auto cursor-pointer disabled:opacity-50 transition-all"
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
                          className="px-3.5 py-1.5 rounded-full bg-[#FFE600] text-[#121314] hover:bg-[#ebd300] border-2 border-[#121314] shadow-[2px_2px_0px_#121314] text-xs font-black uppercase flex items-center gap-1.5 ml-auto cursor-pointer disabled:opacity-50 transition-all"
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
                  <td colSpan={6} className="text-center py-8 text-[#121314]/60 font-bold uppercase">
                    No se encontraron perfumes para los criterios de búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#121314] shadow-[4px_4px_0px_#121314] space-y-4">
        <h3 className="text-lg font-black uppercase tracking-tight text-[#121314] flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-[#106ebe]">history</span>
          <span>Historial de Sincronización y Webhooks</span>
        </h3>

        <div className="divide-y-2 divide-[#121314]/10">
          {(accountStatus?.recent_logs || []).slice(0, 8).map((log) => (
            <div key={log.id} className="py-3 flex items-start justify-between gap-4 text-xs">
              <div className="flex items-start gap-2.5">
                <span
                  className={`material-symbols-outlined text-[18px] mt-0.5 ${
                    log.status === 'success' ? 'text-[#0ffcbe]' : 'text-[#ff78ac]'
                  }`}
                >
                  {log.status === 'success' ? 'check_circle' : 'cancel'}
                </span>
                <div>
                  <p className="font-black text-[#121314]">{log.message}</p>
                  <p className="text-[10px] text-[#121314]/60 font-mono mt-0.5">
                    Evento: {log.event_type}
                  </p>
                </div>
              </div>

              <span className="text-[10px] text-[#121314]/60 font-mono whitespace-nowrap">
                {new Date(log.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}

          {(!accountStatus?.recent_logs || accountStatus.recent_logs.length === 0) && (
            <p className="text-center py-4 text-xs text-[#121314]/60 font-bold uppercase">
              No hay eventos registrados recientemente.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
