import React, { useState } from 'react';

interface CancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, feedback: string) => void;
}

const REASONS = [
  "Es muy caro",
  "No lo uso suficiente",
  "No encuentro mis temas",
  "Buscaba formatos oficiales (SEP)",
  "Prefiero hacerlo yo mismo",
  "Otro"
];

const CancellationModal: React.FC<CancellationModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(selectedReason, feedback);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
        <div className="p-5 sm:p-8 overflow-y-auto flex-1">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">Lamentamos que te vayas</h3>
              <p className="text-gray-500 mt-1 italic text-sm">Ayúdanos a mejorar MAÑANA.</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">¿Por qué deseas cancelar?</label>
              <div className="grid grid-cols-2 gap-2">
                {REASONS.map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setSelectedReason(reason)}
                    className={`text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-all ${
                      selectedReason === reason
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                ¿Alguna sugerencia? (opcional)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="¿Qué podríamos hacer mejor?"
                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all h-20 resize-none text-gray-700 text-sm"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-all text-sm"
              >
                ME QUEDO
              </button>
              <button
                type="submit"
                disabled={!selectedReason}
                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg shadow-red-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 text-sm"
              >
                CANCELAR
              </button>
            </div>
          </form>
        </div>
        <div className="bg-slate-50 p-3 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest border-t flex-shrink-0">
          Tu feedback es anónimo
        </div>
      </div>
    </div>
  );
};

export default CancellationModal;
