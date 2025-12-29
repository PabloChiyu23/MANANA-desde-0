
import React, { useState } from 'react';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
}

const EmailModal: React.FC<EmailModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes('@')) {
      setIsSubmitting(true);
      // Pequeño delay para asegurar que el feedback visual del botón se vea
      // antes de ejecutar la lógica pesada de App.tsx
      setTimeout(() => {
        onSubmit(email);
        // Reseteamos el estado interno para futuras aperturas
        setIsSubmitting(false);
      }, 50);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">📧</div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">¡Sigue planeando!</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Ingresa tu correo para desbloquear 10 planeaciones gratuitas y poder guardarlas en tu biblioteca.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required
              className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none font-medium transition-all"
              autoFocus
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-lg transition-all transform active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  PROCESANDO...
                </>
              ) : (
                "CONTINUAR GRATIS"
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full py-2 text-gray-400 text-xs font-bold uppercase tracking-widest hover:text-gray-600 transition-colors"
            >
              Cerrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmailModal;
