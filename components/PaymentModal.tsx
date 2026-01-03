import React, { useState, useEffect, useRef } from 'react';

declare global {
  interface Window {
    MercadoPago: any;
  }
}

interface PaymentModalProps {
  isOpen: boolean;
  userId: string | null;
  userEmail: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, userId, userEmail, onClose, onSuccess }) => {
  const [step, setStep] = useState<'info' | 'payment' | 'loading' | 'success' | 'pending' | 'error'>('info');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const brickContainerRef = useRef<HTMLDivElement>(null);
  const brickControllerRef = useRef<any>(null);

  useEffect(() => {
    if (step === 'payment' && brickContainerRef.current) {
      initBrick();
    }
    
    return () => {
      if (brickControllerRef.current) {
        brickControllerRef.current.unmount();
        brickControllerRef.current = null;
      }
    };
  }, [step]);

  const initBrick = async () => {
    try {
      const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;
      
      if (!publicKey) {
        console.error('Missing VITE_MERCADOPAGO_PUBLIC_KEY');
        setErrorMessage('Error de configuración de pagos');
        setStep('error');
        return;
      }

      const mp = new window.MercadoPago(publicKey, {
        locale: 'es-MX'
      });

      const bricksBuilder = mp.bricks();
      
      if (brickContainerRef.current) {
        brickContainerRef.current.innerHTML = '';
      }

      brickControllerRef.current = await bricksBuilder.create('cardPayment', 'payment-brick-container', {
        initialization: {
          amount: 29
        },
        customization: {
          visual: {
            style: {
              theme: 'default',
              customVariables: {
                formBackgroundColor: '#ffffff',
                baseColor: '#16a34a'
              }
            }
          },
          paymentMethods: {
            maxInstallments: 1
          }
        },
        callbacks: {
          onReady: () => {
            console.log('Brick ready');
          },
          onSubmit: async (cardFormData: any) => {
            console.log('Payment submitted:', cardFormData);
            setStep('loading');
            
            try {
              const response = await fetch('/api/process-payment', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  ...cardFormData,
                  userId,
                  userEmail,
                  amount: 29,
                  description: 'MAÑANA PRO - Oferta Navidad'
                }),
              });

              const result = await response.json();
              
              if (result.status === 'approved') {
                setStep('success');
                setTimeout(() => {
                  onSuccess();
                  onClose();
                }, 2000);
              } else if (result.status === 'in_process' || result.status === 'pending') {
                setStep('pending');
              } else {
                setErrorMessage(result.message || 'El pago no pudo ser procesado');
                setStep('error');
              }
            } catch (error: any) {
              console.error('Payment error:', error);
              setErrorMessage(error.message || 'Error al procesar el pago');
              setStep('error');
            }
          },
          onError: (error: any) => {
            console.error('Brick error:', error);
            setErrorMessage('Error en el formulario de pago');
            setStep('error');
          }
        }
      });
    } catch (error: any) {
      console.error('Error initializing brick:', error);
      setErrorMessage('No se pudo cargar el formulario de pago');
      setStep('error');
    }
  };

  if (!isOpen) return null;

  const handleStartPayment = () => {
    if (!userId) {
      setErrorMessage('Debes iniciar sesión para continuar');
      setStep('error');
      return;
    }
    setStep('payment');
  };

  const handleClose = () => {
    if (brickControllerRef.current) {
      brickControllerRef.current.unmount();
      brickControllerRef.current = null;
    }
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
                <div className="flex justify-center mb-2">
                   <span className="bg-red-50 text-red-600 text-[10px] font-black px-3 py-1 rounded-full uppercase">Oferta de Navidad</span>
                </div>
                <h3 className="text-2xl font-black text-gray-800 mb-1 tracking-tight">MAÑANA PRO</h3>
                <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">Suscripción Mensual</p>
                
                <div className="mt-6 flex items-center justify-center gap-3">
                  <span className="text-xl text-gray-300 line-through font-bold">$49</span>
                  <div className="px-5 py-3 bg-green-50 text-green-700 rounded-2xl font-black text-3xl border border-green-100 shadow-sm">
                    $29.00 <span className="text-sm font-bold opacity-70">MXN</span>
                  </div>
                </div>
                <p className="mt-4 text-[11px] text-gray-500 font-medium">
                   ¡Acceso total ilimitado antes del 6 de enero!
                </p>
              </div>

              <div className="space-y-3 mb-8 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                  <span className="text-green-500 font-bold">✓</span> Generaciones ilimitadas
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                  <span className="text-green-500 font-bold">✓</span> Exportar a PDF profesional
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                  <span className="text-green-500 font-bold">✓</span> Biblioteca sin límites
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                  <span className="text-green-500 font-bold">✓</span> Copiar contenido
                </div>
              </div>

              <button
                onClick={handleStartPayment}
                className="w-full py-5 bg-[#009EE3] hover:bg-[#0089c7] text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                <span>PAGAR CON TARJETA $29</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
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

          {step === 'payment' && (
            <>
              <div className="text-center mb-6">
                <h3 className="text-xl font-black text-gray-800 mb-1">Pago con Tarjeta</h3>
                <p className="text-gray-500 text-sm">Total: <span className="font-bold text-green-600">$29.00 MXN</span></p>
              </div>
              <div id="payment-brick-container" ref={brickContainerRef} className="min-h-[300px]">
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
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
              <h3 className="text-2xl font-black text-gray-800 mb-2">PROCESANDO...</h3>
              <p className="text-gray-500 font-medium px-4">Estamos procesando tu pago de forma segura.</p>
              <p className="text-[10px] text-gray-400 mt-8 uppercase font-bold tracking-tighter italic">No cierres esta ventana</p>
            </div>
          )}

          {step === 'success' && (
            <div className="py-12 text-center">
              <div className="w-20 h-20 mx-auto mb-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-4xl">✅</span>
              </div>
              <h3 className="text-2xl font-black text-gray-800 mb-2">¡PAGO EXITOSO!</h3>
              <p className="text-gray-500 font-medium px-4 mb-6">Tu cuenta PRO ya está activa. ¡Disfruta de todas las funciones!</p>
            </div>
          )}

          {step === 'pending' && (
            <div className="py-12 text-center">
              <div className="w-20 h-20 mx-auto mb-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-4xl">⏳</span>
              </div>
              <h3 className="text-2xl font-black text-gray-800 mb-2">PAGO EN PROCESO</h3>
              <p className="text-gray-500 font-medium px-4 mb-4">Tu banco está verificando la transacción. Esto puede tardar unos minutos.</p>
              <p className="text-sm text-gray-400 px-4 mb-6">Tu cuenta PRO se activará automáticamente cuando el pago sea confirmado.</p>
              <button
                onClick={handleClose}
                className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-xl transition-all"
              >
                Entendido
              </button>
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
