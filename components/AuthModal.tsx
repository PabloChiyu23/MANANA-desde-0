
import React, { useState } from 'react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (email: string) => void;
}

type AuthMode = 'login' | 'register' | 'forgot';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    // Simulación de persistencia local para el MVP
    const users = JSON.parse(localStorage.getItem('manana_mock_users') || '{}');

    setTimeout(() => {
      if (mode === 'register') {
        if (users[email]) {
          setMessage({ type: 'error', text: 'Este correo ya está registrado.' });
        } else {
          users[email] = password;
          localStorage.setItem('manana_mock_users', JSON.stringify(users));
          setMessage({ type: 'success', text: '¡Cuenta creada con éxito!' });
          setTimeout(() => onAuthSuccess(email), 1000);
        }
      } else if (mode === 'login') {
        if (users[email] && users[email] === password) {
          onAuthSuccess(email);
        } else {
          setMessage({ type: 'error', text: 'Correo o contraseña incorrectos.' });
        }
      } else if (mode === 'forgot') {
        if (users[email]) {
          setMessage({ type: 'success', text: 'Te hemos enviado un enlace para restablecer tu contraseña a ' + email });
          // En un entorno real, aquí se llamaría a la API de envío de correos
        } else {
          setMessage({ type: 'error', text: 'No encontramos ninguna cuenta con ese correo.' });
        }
      }
      setIsSubmitting(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">
              {mode === 'login' ? '🔑' : mode === 'register' ? '✍️' : '📩'}
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">
              {mode === 'login' ? 'Bienvenido de nuevo' : mode === 'register' ? 'Crea tu cuenta' : 'Recuperar contraseña'}
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              {mode === 'login' 
                ? 'Ingresa tus credenciales para continuar.' 
                : mode === 'register' 
                  ? 'Únete a la comunidad de docentes que ahorran tiempo.' 
                  : 'Dinos tu correo y te enviaremos ayuda.'}
            </p>
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded-xl text-xs font-bold text-center ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                required
                className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none font-medium transition-all"
              />
            </div>

            {mode !== 'forgot' && (
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none font-medium transition-all"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-lg transition-all transform active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                mode === 'login' ? 'ENTRAR' : mode === 'register' ? 'REGISTRARME' : 'ENVIAR AYUDA'
              )}
            </button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-3">
            {mode === 'login' ? (
              <>
                <button onClick={() => setMode('forgot')} className="text-xs font-bold text-gray-400 hover:text-green-600 transition-colors uppercase tracking-widest">
                  ¿Olvidaste tu contraseña?
                </button>
                <button onClick={() => setMode('register')} className="text-sm font-bold text-gray-900 transition-colors">
                  ¿No tienes cuenta? <span className="text-green-600 underline">Regístrate</span>
                </button>
              </>
            ) : mode === 'register' ? (
              <button onClick={() => setMode('login')} className="text-sm font-bold text-gray-900 transition-colors">
                ¿Ya tienes cuenta? <span className="text-green-600 underline">Inicia sesión</span>
              </button>
            ) : (
              <button onClick={() => setMode('login')} className="text-sm font-bold text-gray-900 transition-colors">
                Volver al <span className="text-green-600 underline">inicio de sesión</span>
              </button>
            )}
            
            <button
              onClick={onClose}
              className="mt-2 py-1 text-gray-400 text-[10px] font-bold uppercase tracking-widest hover:text-gray-600 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
