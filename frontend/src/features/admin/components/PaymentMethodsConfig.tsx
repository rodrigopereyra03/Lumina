import React, { useState, useEffect } from 'react'
import { settingsApi } from '../../../api/settingsApi'

export const PaymentMethodsConfig: React.FC = () => {
  const [mpActive, setMpActive] = useState(true)
  const [mpPublicKey, setMpPublicKey] = useState('APP_USR-49281039-4821-4820-9102-849201849201')
  const [mpAccessToken, setMpAccessToken] = useState('APP_USR-948201948201948201948201-948201')
  const [mpSandbox, setMpSandbox] = useState(false)
  const [mpInstallments, setMpInstallments] = useState('6')

  const [transferActive, setTransferActive] = useState(true)
  const [transferCbu, setTransferCbu] = useState('0000003100010000849201')
  const [transferAlias, setTransferAlias] = useState('LUMINA.PAGOS.OFICIAL')
  const [transferBank, setTransferBank] = useState('Banco Santander')
  const [transferHolder, setTransferHolder] = useState('Lumina Retail S.A. (CUIT 30-71234567-9)')
  const [transferDiscount, setTransferDiscount] = useState('10')

  const [cardActive, setCardActive] = useState(true)
  const [savedSuccess, setSavedSuccess] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const s = await settingsApi.getPaymentSettings()
        if (s) {
          setMpActive(s.mp_active)
          setMpPublicKey(s.mp_public_key)
          setMpAccessToken(s.mp_access_token)
          setMpSandbox(s.mp_sandbox)
          setMpInstallments(s.mp_installments.toString())
          setTransferActive(s.transfer_active)
          setTransferCbu(s.transfer_cbu)
          setTransferAlias(s.transfer_alias)
          setTransferBank(s.transfer_bank)
          setTransferHolder(s.transfer_holder)
          setTransferDiscount(s.transfer_discount.toString())
          setCardActive(s.card_active)
        }
      } catch (e) {
        // use default state
      }
    }
    fetchSettings()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 2500)

    try {
      await settingsApi.updatePaymentSettings({
        mp_active: mpActive,
        mp_public_key: mpPublicKey,
        mp_access_token: mpAccessToken,
        mp_sandbox: mpSandbox,
        mp_installments: parseInt(mpInstallments, 10) || 6,
        transfer_active: transferActive,
        transfer_cbu: transferCbu,
        transfer_alias: transferAlias,
        transfer_bank: transferBank,
        transfer_holder: transferHolder,
        transfer_discount: parseFloat(transferDiscount) || 0,
        card_active: cardActive,
      })
    } catch (e) {
      // Handled
    }
  }

  return (
    <div className="space-y-6 font-body text-[#1b1c1c]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1b1c1c] tracking-tight">Medios de Pago</h1>
          <p className="text-xs sm:text-sm text-[#5b403e] mt-0.5 max-w-xl">
            Configura las opciones de pago que verán tus clientes durante el checkout. Activa pasarelas y define comisiones o instrucciones.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="btn-primary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          <span>{savedSuccess ? '¡Guardado con Éxito!' : 'Guardar Cambios'}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-[#E8F8F0] border border-[#B7E5CD] text-[#1E824C] text-xs font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>Configuración de pasarelas guardada correctamente.</span>
        </div>
      )}

      {/* Gateway 1: Mercado Pago */}
      <div className="glass-panel rounded-2xl p-6 sm:p-7 border border-white/70 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#009EE3]/15 flex items-center justify-center text-[#009EE3] shadow-xs">
              <span className="material-symbols-outlined text-[24px]">payments</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#1b1c1c]">Mercado Pago Checkout Pro</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F8F0] text-[#1E824C]">
                  Conectado y Listo
                </span>
              </div>
              <p className="text-xs text-[#5b403e]">Acepta tarjetas de crédito, débito, dinero en cuenta y cuotas sin interés.</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={mpActive}
              onChange={(e) => setMpActive(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF4D4F]"></div>
          </label>
        </div>

        {mpActive && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-[#5b403e] block mb-1">Public Key</label>
              <input
                type="text"
                value={mpPublicKey}
                onChange={(e) => setMpPublicKey(e.target.value)}
                className="glass-input w-full px-3.5 py-2.5 rounded-xl font-mono text-xs outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-[#5b403e] block mb-1">Access Token</label>
              <input
                type="password"
                value={mpAccessToken}
                onChange={(e) => setMpAccessToken(e.target.value)}
                className="glass-input w-full px-3.5 py-2.5 rounded-xl font-mono text-xs outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-[#5b403e] block mb-1">Cuotas sin Interés</label>
              <select
                value={mpInstallments}
                onChange={(e) => setMpInstallments(e.target.value)}
                className="bg-white/80 border border-white/80 rounded-xl px-3.5 py-2.5 text-xs w-full outline-none focus:border-[#FF4D4F]"
              >
                <option value="1">1 Pago</option>
                <option value="3">Hasta 3 Cuotas sin interés</option>
                <option value="6">Hasta 6 Cuotas sin interés</option>
                <option value="12">Hasta 12 Cuotas sin interés</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#5b403e]">
                <input
                  type="checkbox"
                  checked={mpSandbox}
                  onChange={(e) => setMpSandbox(e.target.checked)}
                  className="rounded text-[#FF4D4F] focus:ring-[#FF4D4F]/30"
                />
                <span>Modo Pruebas (Sandbox)</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Gateway 2: Transferencia Bancaria Directa */}
      <div className="glass-panel rounded-2xl p-6 sm:p-7 border border-white/70 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#1E824C]/15 flex items-center justify-center text-[#1E824C] shadow-xs">
              <span className="material-symbols-outlined text-[24px]">account_balance</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#1b1c1c]">Transferencia Bancaria / CVU</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F8F0] text-[#1E824C]">
                  Instrucciones Automáticas
                </span>
              </div>
              <p className="text-xs text-[#5b403e]">Muestra tus datos bancarios y aplica descuentos automáticos por pago inmediato.</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={transferActive}
              onChange={(e) => setTransferActive(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF4D4F]"></div>
          </label>
        </div>

        {transferActive && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-[#5b403e] block mb-1">CBU / CVU</label>
              <input
                type="text"
                value={transferCbu}
                onChange={(e) => setTransferCbu(e.target.value)}
                className="glass-input w-full px-3.5 py-2.5 rounded-xl font-mono text-xs outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-[#5b403e] block mb-1">Alias Bancario</label>
              <input
                type="text"
                value={transferAlias}
                onChange={(e) => setTransferAlias(e.target.value)}
                className="glass-input w-full px-3.5 py-2.5 rounded-xl font-mono text-xs outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-[#5b403e] block mb-1">Descuento Especial (%)</label>
              <input
                type="number"
                value={transferDiscount}
                onChange={(e) => setTransferDiscount(e.target.value)}
                className="glass-input w-full px-3.5 py-2.5 rounded-xl font-bold text-[#1E824C] text-xs outline-none"
                placeholder="10"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-[#5b403e] block mb-1">Titular de la Cuenta</label>
              <input
                type="text"
                value={transferHolder}
                onChange={(e) => setTransferHolder(e.target.value)}
                className="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-[#5b403e] block mb-1">Banco / Entidad</label>
              <input
                type="text"
                value={transferBank}
                onChange={(e) => setTransferBank(e.target.value)}
                className="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Gateway 3: Tarjeta de Crédito Directa */}
      <div className="glass-panel rounded-2xl p-6 sm:p-7 border border-white/70 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#ffdad7]/50 flex items-center justify-center text-[#FF4D4F] shadow-xs">
              <span className="material-symbols-outlined text-[24px]">credit_card</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1b1c1c]">Pasarela de Tarjetas Directa</h3>
              <p className="text-xs text-[#5b403e]">Formulario integrado de tarjeta con tokenización cifrada.</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={cardActive}
              onChange={(e) => setCardActive(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF4D4F]"></div>
          </label>
        </div>
      </div>
    </div>
  )
}
