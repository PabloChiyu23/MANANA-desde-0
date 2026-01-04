import React from 'react';

interface LegalCheckboxesProps {
  acceptedTerms: boolean;
  acceptedMarketing: boolean;
  onTermsChange: (accepted: boolean) => void;
  onMarketingChange: (accepted: boolean) => void;
  onShowPrivacy: () => void;
  onShowTerms: () => void;
}

export default function LegalCheckboxes({
  acceptedTerms,
  acceptedMarketing,
  onTermsChange,
  onMarketingChange,
  onShowPrivacy,
  onShowTerms,
}: LegalCheckboxesProps) {
  return (
    <div className="space-y-3 text-sm">
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) => onTermsChange(e.target.checked)}
          className="mt-0.5 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
          required
        />
        <span className="text-gray-600 leading-snug">
          He leído y acepto el{' '}
          <button
            type="button"
            onClick={onShowPrivacy}
            className="text-indigo-600 hover:text-indigo-800 underline font-medium"
          >
            Aviso de Privacidad
          </button>{' '}
          y los{' '}
          <button
            type="button"
            onClick={onShowTerms}
            className="text-indigo-600 hover:text-indigo-800 underline font-medium"
          >
            Términos y Condiciones
          </button>
          <span className="text-red-500 ml-1">*</span>
        </span>
      </label>

      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={acceptedMarketing}
          onChange={(e) => onMarketingChange(e.target.checked)}
          className="mt-0.5 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
        />
        <span className="text-gray-500 leading-snug">
          Quiero recibir novedades, consejos y nuevas funciones por correo electrónico (opcional)
        </span>
      </label>
    </div>
  );
}
