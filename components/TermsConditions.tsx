import React from 'react';

interface TermsConditionsProps {
  onClose?: () => void;
  isModal?: boolean;
}

export default function TermsConditions({ onClose, isModal = false }: TermsConditionsProps) {
  const content = (
    <div className="prose prose-slate max-w-none">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Términos y Condiciones</h1>
      <p className="text-sm text-gray-500 mb-6">Última actualización: Enero 2026</p>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">1. Sobre MAÑANA</h2>
        <p className="text-gray-600">
          MAÑANA es una herramienta de apoyo docente que utiliza inteligencia artificial para ayudarte a crear 
          planeaciones de clase alineadas al currículum de la Nueva Escuela Mexicana (NEM). 
          La plataforma está diseñada para facilitar tu trabajo, no para reemplazar tu criterio profesional.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">2. Contenido generado automáticamente</h2>
        <p className="text-gray-600 mb-2">
          Las planeaciones y actividades son generadas por inteligencia artificial. Esto significa que:
        </p>
        <ul className="list-disc pl-5 text-gray-600 space-y-1">
          <li>El contenido es una sugerencia que debe ser revisada y adaptada por ti</li>
          <li>Eres responsable de verificar que el contenido sea apropiado para tu grupo</li>
          <li>Te recomendamos siempre personalizar las actividades según las necesidades de tus estudiantes</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">3. Sin garantía de aceptación oficial</h2>
        <p className="text-gray-600">
          MAÑANA no está afiliada ni respaldada por la Secretaría de Educación Pública (SEP). 
          Las planeaciones generadas son herramientas de apoyo y <strong>no garantizamos</strong> que sean aceptadas 
          en revisiones oficiales o que cumplan con todos los requisitos específicos de tu zona escolar. 
          Siempre consulta los lineamientos vigentes de tu institución.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">4. Uso adecuado</h2>
        <p className="text-gray-600 mb-2">Al usar MAÑANA, te comprometes a:</p>
        <ul className="list-disc pl-5 text-gray-600 space-y-1">
          <li>Usar la plataforma únicamente para fines educativos legítimos</li>
          <li>No compartir tu cuenta con otras personas</li>
          <li>No intentar acceder a cuentas de otros usuarios</li>
          <li>No usar la plataforma para generar contenido inapropiado o ilegal</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">5. Mejora continua</h2>
        <p className="text-gray-600">
          MAÑANA está en constante evolución. Esto significa que podemos agregar, modificar o eliminar 
          funcionalidades en cualquier momento para mejorar la experiencia. Te notificaremos sobre 
          cambios importantes que afecten significativamente el servicio.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">6. Suscripción PRO</h2>
        <div className="text-gray-600 space-y-2">
          <p><strong>Pago:</strong> La suscripción PRO se cobra mensualmente a través de Mercado Pago.</p>
          <p><strong>Renovación:</strong> Se renueva automáticamente cada mes hasta que la canceles.</p>
          <p><strong>Cancelación:</strong> Puedes cancelar en cualquier momento desde tu cuenta. 
          Al cancelar, mantienes acceso PRO hasta el final del período pagado.</p>
          <p><strong>Reembolsos:</strong> No ofrecemos reembolsos por períodos parciales, pero puedes 
          seguir usando el servicio hasta que termine tu mes pagado.</p>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">7. Limitación de responsabilidad</h2>
        <p className="text-gray-600">
          MAÑANA se proporciona "tal cual". No garantizamos que el servicio esté disponible en todo momento 
          ni que esté libre de errores. No somos responsables por pérdidas o daños derivados del uso 
          de las planeaciones generadas o por interrupciones del servicio.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">8. Contacto</h2>
        <p className="text-gray-600">
          Si tienes dudas sobre estos términos, escríbenos a: <strong>plopezhelu@gmail.com</strong>
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
