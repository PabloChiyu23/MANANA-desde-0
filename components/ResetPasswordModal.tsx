import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // Función para cerrar y limpiar todo
  const handleClose = () => {
    console.log('MANUAL CLOSE CLICKED');
    setPassword('');
    setConfirmPassword('');
    setMessage(null);
    setIsSubmitting(false);
    setIsCompleted(false);
    onClose();
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    console.log('PASSWORD RESET SUBMIT CLICKED');

    if (password.length < 6) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres.' });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden.' });
      return;
    }

    setIsSubmitting(true);
    console.log('UPDATING PASSWORD...');

    try {
      const { data, error } = await supabase.auth.updateUser({
        password: password
      });

      console.log('UPDATE USER RESULT:', { data, error });

      if (error) {
        console.error('PASSWORD UPDATE ERROR:', error.message);
        setMessage({ type: 'error', text: `Error: ${error.message}` });
        setIsSubmitting(false);
      } else {
        console.log('PASSWORD UPDATED SUCCESSFULLY');
        setMessage({ type: 'success', text: '¡Contraseña actualizada con éxito!' });
        setPassword('');
        setConfirmPassword('');
        setIsSubmitting(false);
        setIsCompleted(true);
      }
    } catch (err: any) {
      console.error('PASSWORD UPDATE EXCEPTION:', err);
      setMessage({ type: 'error', text: `Error: ${err?.message || 'Intenta de nuevo.'}` });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-6 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black tracking-tight">
              {isCompleted ? '¡Listo!' : 'Nueva Contraseña'}
            </h2>
            <button onClick={handleClose} className="hover:rotate-90 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-white/80 text-sm mt-1">
            {isCompleted ? 'Tu contraseña ha sido actualizada' : 'Ingresa tu nueva contraseña'}
          </p>
        </div>

        <div className="p-6 space-y-4">
          {message && (
            <div className={`p-3 rounded-xl text-sm font-medium ${
              message.type === 'error' 
                ? 'bg-red-50 text-red-600 border border-red-100' 
                : 'bg-green-50 text-green-600 border border-green-100'
            }`}>
              {message.text}
            </div>
          )}

          {isCompleted ? (
            <button
              type="button"
              onClick={handleClose}
              className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition-all"
            >
              Continuar
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-amber-400 focus:ring-0 transition-colors text-gray-800"
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-amber-400 focus:ring-0 transition-colors text-gray-800"
                  placeholder="Repite la contraseña"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar Nueva Contraseña'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordModal;
