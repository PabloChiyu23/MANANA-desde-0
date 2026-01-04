import React from 'react';

interface PrivacyPolicyProps {
  onClose?: () => void;
  isModal?: boolean;
}

export default function PrivacyPolicy({ onClose, isModal = false }: PrivacyPolicyProps) {
  const content = (
    <div className="prose prose-slate max-w-none">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Aviso de Privacidad</h1>
      <p className="text-sm text-gray-500 mb-6">Última actualización: Enero 2026</p>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">¿Quiénes somos?</h2>
        <p className="text-gray-600">
          MAÑANA es una plataforma digital diseñada para apoyar a docentes en México con la planeación de sus clases. 
          Este aviso de privacidad explica cómo recopilamos, usamos y protegemos tu información personal.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">¿Qué datos recopilamos?</h2>
        <ul className="list-disc pl-5 text-gray-600 space-y-1">
          <li><strong>Correo electrónico:</strong> Para crear tu cuenta y comunicarnos contigo</li>
          <li><strong>Datos de uso:</strong> Información sobre cómo usas la plataforma (lecciones generadas, preferencias)</li>
          <li><strong>Datos de pago:</strong> Procesados de forma segura por Mercado Pago (nosotros no almacenamos datos de tarjetas)</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">¿Para qué usamos tus datos?</h2>
        <ul className="list-disc pl-5 text-gray-600 space-y-1">
          <li>Crear y administrar tu cuenta</li>
          <li>Generar planeaciones personalizadas para tus clases</li>
          <li>Procesar pagos de suscripción</li>
          <li>Mejorar la plataforma basándonos en patrones de uso</li>
          <li>Enviarte información importante sobre tu cuenta (si lo autorizas, también novedades)</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Servicios de terceros</h2>
        <p className="text-gray-600 mb-2">Para brindarte el servicio, utilizamos:</p>
        <ul className="list-disc pl-5 text-gray-600 space-y-1">
          <li><strong>Supabase:</strong> Almacenamiento seguro de datos y autenticación</li>
          <li><strong>OpenAI:</strong> Generación de contenido educativo mediante inteligencia artificial</li>
          <li><strong>Mercado Pago:</strong> Procesamiento seguro de pagos</li>
          <li><strong>Vercel:</strong> Hospedaje de la plataforma</li>
        </ul>
        <p className="text-gray-600 mt-2">
          Estos servicios tienen sus propias políticas de privacidad y cumplen con estándares internacionales de seguridad.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">No vendemos tus datos</h2>
        <p className="text-gray-600">
          Tu información personal nunca será vendida, alquilada o compartida con terceros para fines publicitarios. 
          Solo compartimos datos con los servicios mencionados arriba, estrictamente para el funcionamiento de la plataforma.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Tus derechos</h2>
        <p className="text-gray-600 mb-2">
          De acuerdo con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP), tienes derecho a:
        </p>
        <ul className="list-disc pl-5 text-gray-600 space-y-1">
          <li><strong>Acceder</strong> a tus datos personales</li>
          <li><strong>Rectificar</strong> información incorrecta</li>
          <li><strong>Cancelar</strong> tu cuenta y eliminar tus datos</li>
          <li><strong>Oponerte</strong> al uso de tus datos para ciertos fines</li>
        </ul>
        <p className="text-gray-600 mt-3">
          Para ejercer cualquiera de estos derechos, envía un correo a: <strong>privacidad@manana.app</strong>
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Cambios a este aviso</h2>
        <p className="text-gray-600">
          Podemos actualizar este aviso ocasionalmente. Te notificaremos por correo electrónico si hay cambios importantes.
        </p>
      </section>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
          {content}
          <button
            onClick={onClose}
            className="mt-6 w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        {content}
      </div>
    </div>
  );
}
