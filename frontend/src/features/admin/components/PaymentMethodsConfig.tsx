import React, { useState, useEffect } from 'react'
import { settingsApi } from '../../../api/settingsApi'

export const PaymentMethodsConfig: React.FC = () => {
  const [mpActive, setMpActive] = useState(true)
  const [mpPublicKey, setMpPublicKey] = useState('APP_USR-09e00df2-06bc-4d0e-b5de-13aaffd650d2')
  const [mpAccessToken, setMpAccessToken] = useState('APP_USR-1887517460534002-082719-20e9045bc921801c6df09603e8ed153f-3644485241')
  const [mpSandbox, setMpSandbox] = useState(false)
  const [mpInstallments, setMpInstallments] = useState('6')

  const [transferActive, setTransferActive] = useState(true)
  const [transferCbu, setTransferCbu] = useState('0000003100010000849201')
  const [transferAlias, setTransferAlias] = useState('FORMULA1370.PAGOS.OFICIAL')
  const [transferBank, setTransferBank] = useState('Banco Santander')
  const [transferHolder, setTransferHolder] = useState('Fórmula 1370 Retail S.A. (CUIT 30-71234567-9)')
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
    <div className="space-y-6 font-dm text-[#121314]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#121314] tracking-tight uppercase">Medios de Pago</h1>
          <p className="text-xs sm:text-sm font-medium text-[#121314]/70 mt-1 max-w-xl">
            Configura las pasarelas activas para tus clientes en el checkout, cuotas y descuentos por transferencia.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider bg-[#0ffcbe] hover:bg-[#00eaad] text-[#121314] border-2 border-[#121314] shadow-[3px_3px_0px_#121314] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#121314] flex items-center gap-1.5 cursor-pointer transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          <span>{savedSuccess ? '¡Guardado con Éxito!' : 'Guardar Cambios'}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-[#0ffcbe] border-2 border-[#121314] shadow-[4px_4px_0px_#121314] text-[#121314] text-xs font-black uppercase tracking-wider flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>Configuración de pasarelas guardada correctamente.</span>
        </div>
      )}

      {/* Gateway 1: Mercado Pago */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border-2 border-[#121314] shadow-[4px_4px_0px_#121314] space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b-2 border-[#121314]/15 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#009EE3] border-2 border-[#121314] flex items-center justify-center text-white shadow-[2px_2px_0px_#121314]">
              <span className="material-symbols-outlined text-[24px]">payments</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black uppercase tracking-wide text-[#121314]">Mercado Pago Checkout Pro</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#0ffcbe] text-[#121314] border border-[#121314]">
                  Conectado
                </span>
              </div>
              <p className="text-xs font-medium text-[#121314]/70">Tarjetas de crédito, débito, dinero en cuenta y cuotas sin interés.</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={mpActive}
              onChange={(e) => setMpActive(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-12 h-7 bg-[#f6f4ee] border-2 border-[#121314] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[#121314] after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-2 after:border-[#121314] after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0ffcbe]"></div>
          </label>
        </div>

        {mpActive && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-black uppercase tracking-wider text-[#121314] block mb-1">Public Key</label>
              <input
                type="text"
                value={mpPublicKey}
                onChange={(e) => setMpPublicKey(e.target.value)}
                className="w-full bg-[#f6f4ee] border-2 border-[#121314] px-3.5 py-2.5 rounded-xl font-mono text-xs font-bold text-[#121314] outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="font-black uppercase tracking-wider text-[#121314] block mb-1">Access Token</label>
              <input
                type="password"
                value={mpAccessToken}
                onChange={(e) => setMpAccessToken(e.target.value)}
                className="w-full bg-[#f6f4ee] border-2 border-[#121314] px-3.5 py-2.5 rounded-xl font-mono text-xs font-bold text-[#121314] outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="font-black uppercase tracking-wider text-[#121314] block mb-1">Cuotas sin Interés</label>
              <select
                value={mpInstallments}
                onChange={(e) => setMpInstallments(e.target.value)}
                className="bg-[#f6f4ee] text-[#121314] border-2 border-[#121314] rounded-xl px-3.5 py-2.5 text-xs font-bold w-full outline-none focus:bg-white"
              >
                <option value="1">1 Pago</option>
                <option value="3">Hasta 3 Cuotas sin interés</option>
                <option value="6">Hasta 6 Cuotas sin interés</option>
                <option value="12">Hasta 12 Cuotas sin interés</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-black uppercase tracking-wider text-[#121314]">
                <input
                  type="checkbox"
                  checked={mpSandbox}
                  onChange={(e) => setMpSandbox(e.target.checked)}
                  className="rounded border-2 border-[#121314] text-[#121314]"
                />
                <span>Modo Pruebas (Sandbox)</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Gateway 2: Transferencia Bancaria Directa */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border-2 border-[#121314] shadow-[4px_4px_0px_#121314] space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b-2 border-[#121314]/15 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#0ffcbe] border-2 border-[#121314] flex items-center justify-center text-[#121314] shadow-[2px_2px_0px_#121314]">
              <span className="material-symbols-outlined text-[24px]">account_balance</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black uppercase tracking-wide text-[#121314]">Transferencia Bancaria / CVU</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#a8d5e3] text-[#121314] border border-[#121314]">
                  Automático
                </span>
              </div>
              <p className="text-xs font-medium text-[#121314]/70">Datos bancarios en checkout y bonificación por pago contado.</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={transferActive}
              onChange={(e) => setTransferActive(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-12 h-7 bg-[#f6f4ee] border-2 border-[#121314] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[#121314] after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-2 after:border-[#121314] after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0ffcbe]"></div>
          </label>
        </div>

        {transferActive && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-black uppercase tracking-wider text-[#121314] block mb-1">CBU / CVU</label>
              <input
                type="text"
                value={transferCbu}
                onChange={(e) => setTransferCbu(e.target.value)}
                className="w-full bg-[#f6f4ee] border-2 border-[#121314] px-3.5 py-2.5 rounded-xl font-mono text-xs font-bold text-[#121314] outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="font-black uppercase tracking-wider text-[#121314] block mb-1">Alias Bancario</label>
              <input
                type="text"
                value={transferAlias}
                onChange={(e) => setTransferAlias(e.target.value)}
                className="w-full bg-[#f6f4ee] border-2 border-[#121314] px-3.5 py-2.5 rounded-xl font-mono text-xs font-bold text-[#121314] outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="font-black uppercase tracking-wider text-[#121314] block mb-1">Descuento Especial (%)</label>
              <input
                type="number"
                value={transferDiscount}
                onChange={(e) => setTransferDiscount(e.target.value)}
                className="w-full bg-[#f6f4ee] border-2 border-[#121314] px-3.5 py-2.5 rounded-xl font-black text-[#106ebe] text-xs outline-none focus:bg-white"
                placeholder="10"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-black uppercase tracking-wider text-[#121314] block mb-1">Titular de la Cuenta</label>
              <input
                type="text"
                value={transferHolder}
                onChange={(e) => setTransferHolder(e.target.value)}
                className="w-full bg-[#f6f4ee] border-2 border-[#121314] px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#121314] outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="font-black uppercase tracking-wider text-[#121314] block mb-1">Banco / Entidad</label>
              <input
                type="text"
                value={transferBank}
                onChange={(e) => setTransferBank(e.target.value)}
                className="w-full bg-[#f6f4ee] border-2 border-[#121314] px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#121314] outline-none focus:bg-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Gateway 3: Tarjeta Directa */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border-2 border-[#121314] shadow-[4px_4px_0px_#121314] space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#ff78ac] border-2 border-[#121314] flex items-center justify-center text-[#121314] shadow-[2px_2px_0px_#121314]">
              <span className="material-symbols-outlined text-[24px]">credit_card</span>
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-wide text-[#121314]">Pasarela de Tarjetas Directa</h3>
              <p className="text-xs font-medium text-[#121314]/70">Formulario integrado de tarjeta con tokenización cifrada.</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={cardActive}
              onChange={(e) => setCardActive(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-12 h-7 bg-[#f6f4ee] border-2 border-[#121314] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[#121314] after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-2 after:border-[#121314] after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0ffcbe]"></div>
          </label>
        </div>
      </div>
    </div>
  )
}
