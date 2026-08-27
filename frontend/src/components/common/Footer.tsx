import React from 'react'

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-white/50 bg-[#fbf9f8]/60 backdrop-blur-md py-8 px-6 md:px-12 font-body text-xs text-[#5b403e]">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#1b1c1c] text-sm tracking-tight">LUMINA</span>
          <span>•</span>
          <span>© {new Date().getFullYear()} Lumina Retail S.A. Todos los derechos reservados.</span>
        </div>

        <div className="flex items-center gap-6 font-medium">
          <a href="#terminos" className="hover:text-[#FF4D4F] transition-colors">Términos de Servicio</a>
          <a href="#privacidad" className="hover:text-[#FF4D4F] transition-colors">Privacidad</a>
          <a href="#envios" className="hover:text-[#FF4D4F] transition-colors">Envíos y Devoluciones</a>
          <a href="#soporte" className="hover:text-[#FF4D4F] transition-colors">Soporte al Cliente</a>
        </div>
      </div>
    </footer>
  )
}
