import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface PaymentModalProps {
  isOpen: boolean;
  userId: string | null;
  userEmail: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, userId, userEmail, onClose, onSuccess }) => {
  const [step, setStep] = useState<'info' | 'loading' | 'error'>('info');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [priceInfo, setPriceInfo] = useState<{price: number, isPromo: boolean, regularPrice: number} | null>(null);
  const [isReturningUser, setIsReturningUser] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/subscription-price')
        .then(res => res.json())
        .then(data => setPriceInfo(data))
        .catch(() => setPriceInfo({ price: 29, isPromo: true, regularPrice: 49 }));
      
      if (userId) {
        supabase
          .from('users')
          .select('cancellation_date, subscription_status')
          .eq('id', userId)
          .single()
          .then(({ data }) => {
            if (data?.cancellation_date || data?.subscription_status === 'cancelled') {
              setIsReturningUser(true);
            } else {
              setIsReturningUser(false);
            }
          });
      }
    }
  }, [isOpen, userId]);

  useEffect(() => {
    if (!isOpen) {
      setStep('info');
      setErrorMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubscription = async () => {
    if (!userId || !userEmail) {
      setErrorMessage('Debes iniciar sesión para continuar');
      setStep('error');
      return;
    }
    
    setStep('loading');
    
    try {
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          userEmail
        }),
      });

      const result = await response.json();
      
      if (result.init_point) {
        window.location.href = result.init_point;
      } else if (result.error) {
        setErrorMessage(result.error);
        setStep('error');
      } else {
        setErrorMessage('No se pudo conectar con Mercado Pago. Intenta de nuevo.');
        setStep('error');
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      setErrorMessage(error.message || 'Error al procesar la suscripción');
      setStep('error');
    }
  };

  const handleClose = () => {
    setStep('info');
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        <div className="bg-[#009EE3] p-6 text-white flex justify-between items-center sticky top-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-[#009EE3] font-bold text-xs italic">MP</span>
            </div>
            <span className="font-bold tracking-tight uppercase text-xs">Pago Seguro Mercado Pago</span>
          </div>
          <button onClick={handleClose} className="hover:rotate-90 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8">
          {step === 'info' && (
            <>
              <div className="text-center mb-8">
                {isReturningUser && (
                  <div className="flex justify-center mb-3">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-2">
                      <span>👋</span> ¡Bienvenido de vuelta!
                    </span>
                  </div>
                )}
                {priceInfo?.isPromo && !isReturningUser && (
                  <div className="flex justify-center mb-2">
                    <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full animate-pulse uppercase tracking-widest">
                      Oferta Navidad
                    </span>
                  </div>
                )}
                {isReturningUser && (
                  <p className="text-purple-600 font-bold text-sm mb-2">Te extrañamos en MAÑANA</p>
                )}
                <h2 className="text-4xl font-black text-gray-900 mb-2">
                  {priceInfo?.isPromo && <span className="line-through text-gray-400 text-2xl">${priceInfo.regularPrice}</span>}
                  {' '}${priceInfo?.price || 29}<span className="text-lg font-medium text-gray-500">/mes</span>
                </h2>
                <p className="text-gray-500 font-medium">Suscripción mensual automática</p>
              </div>
              
              <div className="space-y-3 mb-8">
                {[
                  'Clases ilimitadas',
                  'Todos los grados y niveles',
                  'Descarga en PDF',
                  'Actividades personalizadas',
                  'Plan B para imprevistos',
                  'Cancela cuando quieras'
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700 font-medium text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSubscription}
                className="w-full py-5 bg-[#009EE3] hover:bg-[#0089c7] text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                <span>SUSCRIBIRSE POR ${priceInfo?.price || 29}/MES</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              <p className="text-center text-xs text-gray-400 mt-4">
                Serás redirigido a Mercado Pago para completar el pago.
              </p>
              
              <div className="mt-6 flex flex-col items-center gap-2">
                 <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">
                   Procesado de forma segura por Mercado Pago
                 </p>
                 <div className="flex gap-2 opacity-30 grayscale">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" alt="Visa"/>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-4" alt="Mastercard"/>
                 </div>
              </div>
            </>
          )}

          {step === 'loading' && (
            <div className="py-12 text-center">
              <div className="relative w-20 h-20 mx-auto mb-8">
                <div className="absolute inset-0 border-4 border-blue-50 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-[#009EE3] border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-2xl font-black text-gray-800 mb-2">PREPARANDO...</h3>
              <p className="text-gray-500 font-medium px-4">Te estamos redirigiendo a Mercado Pago.</p>
              <p className="text-[10px] text-gray-400 mt-8 uppercase font-bold tracking-tighter italic">No cierres esta ventana</p>
            </div>
          )}

          {step === 'error' && (
            <div className="py-12 text-center">
              <div className="w-20 h-20 mx-auto mb-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-4xl">❌</span>
              </div>
              <h3 className="text-2xl font-black text-gray-800 mb-2">ERROR</h3>
              <p className="text-gray-500 font-medium px-4 mb-6">{errorMessage}</p>
              <button
                onClick={() => setStep('info')}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
              >
                Intentar de nuevo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
