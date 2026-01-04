import React from 'react';

interface FooterProps {
  onShowPrivacy: () => void;
  onShowTerms: () => void;
}

export default function Footer({ onShowPrivacy, onShowTerms }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-gray-400 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌅</span>
            <span className="text-white font-bold">MAÑANA</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <button
              onClick={onShowPrivacy}
              className="hover:text-white transition-colors"
            >
              Aviso de Privacidad
            </button>
            <button
              onClick={onShowTerms}
              className="hover:text-white transition-colors"
            >
              Términos y Condiciones
            </button>
            <a
              href="mailto:hola@manana.app"
              className="hover:text-white transition-colors"
            >
              Contacto
            </a>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-slate-800 text-center text-xs text-gray-500">
          © {currentYear} MAÑANA. Hecho con ❤️ para los maestros de México.
        </div>
      </div>
    </footer>
  );
}
