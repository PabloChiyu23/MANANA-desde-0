
import React, { useState } from 'react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<'info' | 'loading'>('info');

  if (!isOpen) return null;

  const handlePay = () => {
    setStep('loading');
    // Simulate Mercado Pago Redirect / Process
    setTimeout(() => {
      onSuccess();
      setStep('info');
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-[#009EE3] p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-[#009EE3] font-bold text-xs italic">MP</span>
            </div>
            <span className="font-bold tracking-tight uppercase text-xs">Pago Seguro Mercado Pago</span>
          </div>
          <button onClick={onClose} className="hover:rotate-90 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8">
          {step === 'info' ? (
            <>
              <div className="text-center mb-8">
                <div className="flex justify-center mb-2">
                   <span className="bg-red-50 text-red-600 text-[10px] font-black px-3 py-1 rounded-full uppercase">🎄 Oferta de Navidad</span>
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
              </div>

              <button
                onClick={handlePay}
                className="w-full py-5 bg-[#009EE3] hover:bg-[#0089c7] text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                <span>PAGAR AHORA $29</span>
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
          ) : (
            <div className="py-12 text-center">
              <div className="relative w-20 h-20 mx-auto mb-8">
                <div className="absolute inset-0 border-4 border-blue-50 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-[#009EE3] border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-2xl font-black text-gray-800 mb-2">PROCESANDO...</h3>
              <p className="text-gray-500 font-medium px-4">Estamos conectando con Mercado Pago para activar tu cuenta PRO.</p>
              <p className="text-[10px] text-gray-400 mt-8 uppercase font-bold tracking-tighter italic">No cierres esta ventana</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
