import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Shield, RefreshCw, Zap, Check, Sparkles } from 'lucide-react'
import { useCartStore } from '../../../store/useCartStore'

export interface AddonItem {
  id: string
  title: string
  price: number
  description: string
  icon: 'shield' | 'charge' | 'sound' | 'fit'
  tag?: string
  image: string
}

export const EcosystemAddons: React.FC = () => {
  const { addItem } = useCartStore()
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({})

  const addons: AddonItem[] = [
    {
      id: 'addon-warranty-pro',
      title: 'Protección Extendida +2 Años',
      price: 29.99,
      description: 'Cobertura integral contra caídas accidentales, derrame de líquidos y degradación prematura de batería.',
      icon: 'shield',
      tag: 'Recomendado',
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&q=80'
    },
    {
      id: 'addon-cushions-gel',
      title: 'Almohadillas CoolGel de Recambio',
      price: 34.99,
      description: 'Espuma viscoelástica termorreguladora con fijación magnética para CyberPulse Pro Audio X.',
      icon: 'fit',
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&q=80'
    },
    {
      id: 'addon-stand-mag',
      title: 'AeroCharge Stand Mag 15W',
      price: 64.99,
      description: 'Base magnética en madera de nogal con soporte de carga simultánea Qi y USB-C GaN.',
      icon: 'charge',
      tag: 'Nuevo',
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80'
    },
    {
      id: 'addon-dac-usbc',
      title: 'Ultra-Fi USB-C DAC Adapter',
      price: 28.99,
      description: 'Conversor digital-analógico de 32 bits para streaming de audio sin compresión.',
      icon: 'sound',
      image: 'https://images.unsplash.com/photo-1584679109597-c656b19974c9?w=500&q=80'
    }
  ]

  const getIcon = (type: string) => {
    switch (type) {
      case 'shield':
        return <Shield className="text-[#FF5E4D]" size={20} />
      case 'fit':
        return <RefreshCw className="text-[#D97757]" size={20} />
      case 'charge':
        return <Zap className="text-[#FF5E4D]" size={20} />
      default:
        return <Plus className="text-[#1E1B18]" size={20} />
    }
  }

  const handleAdd = (item: AddonItem) => {
    addItem({
      id: item.id,
      title: item.title,
      price: item.price,
      image: item.image,
      category: 'Accesorios',
    }, 1)

    setAddedMap((prev) => ({ ...prev, [item.id]: true }))
    setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [item.id]: false }))
    }, 1200)
  }

  return (
    <section id="addons" className="py-12 border-t border-[#EBE6DF] font-body relative">
      <div className="text-center max-w-xl mx-auto space-y-3 mb-10">
        <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[#FF5E4D]">
          <Sparkles size={13} />
          Ecosistema & Complementos
        </div>
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#1E1B18]">
          Accesorios <span className="text-[#FF5E4D]">Esenciales</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#635E59]">
          Maximiza tu rendimiento acústico y mantén tus dispositivos protegidos con accesorios originales.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addons.map((item, index) => {
          const isAdded = addedMap[item.id]

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.1 }}
              className="p-6 rounded-3xl warm-glass flex items-start gap-5 hover:border-white shadow-sm hover:shadow-xl transition-all duration-300 group"
            >
              {/* Icon Container */}
              <div className="p-3.5 rounded-2xl bg-white/90 border border-[#EBE6DF] group-hover:scale-105 transition-transform shrink-0 shadow-2xs">
                {getIcon(item.icon)}
              </div>

              {/* Content */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 truncate">
                    <h3 className="font-bold text-[#1E1B18] text-sm group-hover:text-[#FF5E4D] transition-colors truncate">
                      {item.title}
                    </h3>
                    {item.tag && (
                      <span className="text-[9px] font-black uppercase tracking-wider bg-[#FFE8E4] border border-[#FFD2CA] text-[#FF5E4D] px-2 py-0.5 rounded-md">
                        {item.tag}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-extrabold text-[#1E1B18] shrink-0">
                    ${item.price}
                  </span>
                </div>
                
                <p className="text-xs text-[#635E59] leading-relaxed">
                  {item.description}
                </p>

                <button
                  onClick={() => handleAdd(item)}
                  className={`mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                    isAdded 
                      ? 'text-[#1E824C] font-black' 
                      : 'text-[#FF5E4D] hover:text-[#E04938]'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check size={13} />
                      <span>¡Agregado al Carrito!</span>
                    </>
                  ) : (
                    <>
                      <Plus size={13} />
                      <span>Añadir al Carrito</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
