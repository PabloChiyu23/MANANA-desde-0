
import React from 'react';

interface LandingPageProps {
  onStart: () => void;
  onUpgrade: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart, onUpgrade }) => {
  return (
    <div className="bg-white min-h-screen selection:bg-green-100 selection:text-green-900">
      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-wider text-green-700 uppercase bg-green-100 rounded-full">
            🎄 REGALO DE NAVIDAD PARA DOCENTES
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
            Tu clase de mañana, lista antes de que <span className="text-green-600">se enfríe tu café</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Deja de buscar qué hacer a las 11 de la noche. MAÑANA genera actividades reales y alineadas a la NEM para que tú solo te encargues de enseñar (y de descansar).
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onStart}
              className="px-10 py-5 bg-green-600 hover:bg-green-700 text-white text-xl font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all w-full sm:w-auto"
            >
              🚀 Probar gratis ahora
            </button>
          </div>
          <p className="mt-4 text-gray-400 text-xs font-bold uppercase tracking-widest">
            Sin compromisos · Sin registrar tarjetas · 100% Docente
          </p>
        </div>
        
        <div className="absolute top-0 left-0 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-x-1/2 translate-y-1/2"></div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16 italic">Recupera tu tiempo en 3 pasos:</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="relative p-8 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6 shadow-lg shadow-green-200">1</div>
              <h3 className="text-xl font-bold mb-3">Escribe tu tema</h3>
              <p className="text-gray-600">Dinos qué te toca dar mañana de la forma más natural posible.</p>
            </div>
            <div className="relative p-8 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6 shadow-lg shadow-green-200">2</div>
              <h3 className="text-xl font-bold mb-3">Dinos cómo vienen</h3>
              <p className="text-gray-600">¿Están cansados? ¿Muy activos? Adaptamos la clase a su energía real.</p>
            </div>
            <div className="relative p-8 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6 shadow-lg shadow-green-200">3</div>
              <h3 className="text-xl font-bold mb-3">¡Y listo!</h3>
              <p className="text-gray-600">Recibes una secuencia didáctica lista para aplicar o descargar en PDF.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Example Preview Section */}
      <section className="py-24 px-6 bg-slate-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 text-left">
            <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight leading-tight">
              Así de fácil se ve tu clase lista
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Una planeación real que puedes imprimir o leer desde tu celular, sin vueltas ni formatos infinitos.
            </p>
            <ul className="space-y-6 mb-10">
              <li className="flex items-start gap-4">
                <div className="mt-1 flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-sm">✓</div>
                <div>
                  <h4 className="font-bold text-gray-800 text-lg">Pasos claros y directos</h4>
                  <p className="text-gray-500 text-sm">Inicio, desarrollo y cierre que fluyen solitos, sin complicaciones.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="mt-1 flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-sm">✓</div>
                <div>
                  <h4 className="font-bold text-gray-800 text-lg">Materiales que ya tienes</h4>
                  <p className="text-gray-500 text-sm">Nada de compras locas a última hora; usamos lo que hay en el salón.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="mt-1 flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-sm">✓</div>
                <div>
                  <h4 className="font-bold text-gray-800 text-lg">Sugerencias de qué decir</h4>
                  <p className="text-gray-500 text-sm">Incluimos un guion breve para que enganches a tus alumnos desde el minuto uno.</p>
                </div>
              </li>
            </ul>
          </div>
          
          <div className="flex-1 w-full max-w-md relative group">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform group-hover:-rotate-1 transition-transform duration-500">
              <div className="bg-green-600 h-2 w-full"></div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-6 border-b border-gray-50 pb-4">
                  <div>
                    <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">PLANEACIÓN NEM</div>
                    <div className="text-lg font-black text-gray-800 leading-tight italic">Aventura de Fracciones</div>
                  </div>
                  <div className="bg-green-50 text-green-600 text-[10px] font-bold px-3 py-1 rounded-full">4° PRIMARIA</div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <div className="text-[11px] font-bold text-green-600 uppercase mb-2">Objetivo</div>
                    <p className="text-xs text-gray-600 font-medium leading-relaxed">Que los alumnos identifiquen fracciones en situaciones de reparto cotidiano usando material concreto.</p>
                  </div>
                  
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[11px] font-bold text-gray-400 uppercase mb-2">Inicio (10 min)</div>
                    <p className="text-[10px] text-gray-600 italic">"Imaginen que tenemos 3 pizzas para 4 amigos..."</p>
                    <ul className="mt-2 space-y-1">
                      <li className="text-[10px] text-gray-500 flex items-center gap-2">
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span> Lluvia de ideas sobre repartos.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <div className="text-[11px] font-bold text-gray-400 uppercase mb-2">Actividad Central (30 min)</div>
                    <div className="w-full h-2 bg-gray-100 rounded-full mb-1"></div>
                    <div className="w-3/4 h-2 bg-gray-100 rounded-full mb-1"></div>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 text-center text-[8px] text-gray-400 border-t font-bold tracking-widest">
                LISTO PARA IMPRIMIR O DESCARGAR
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-yellow-400 rounded-2xl -z-10 rotate-12 flex items-center justify-center shadow-lg">
               <span className="text-3xl">📄</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-6 bg-white text-center">
        <div className="max-w-md mx-auto p-12 rounded-3xl bg-gray-900 text-white shadow-2xl relative overflow-hidden border-2 border-green-500/30">
          <div className="absolute top-0 right-0 p-4">
            <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full animate-pulse uppercase tracking-tighter">
              ¡Oferta de Temporada!
            </span>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500 rounded-full mix-blend-overlay filter blur-3xl opacity-30 translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="mb-4">
             <span className="text-4xl">🎁</span>
          </div>
          <h2 className="text-3xl font-bold mb-2">Membresía PRO</h2>
          <p className="text-green-400 font-bold text-sm mb-4">Regálate paz mental esta Navidad 🎄</p>
          
          <div className="flex items-center justify-center gap-3 my-8">
            <span className="text-2xl text-gray-500 line-through decoration-red-500">$49</span>
            <div className="text-6xl font-black">
              $29 <span className="text-xl font-normal text-gray-400">MXN / mes</span>
            </div>
          </div>
          
          <div className="text-left space-y-3 mb-10 max-w-[240px] mx-auto">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <span className="text-green-500">✔</span> Planeaciones ilimitadas
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <span className="text-green-500">✔</span> Exportación a PDF profesional
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <span className="text-green-500">✔</span> Biblioteca de clases guardadas
            </div>
          </div>
          
          <p className="text-gray-400 mb-10 text-xs leading-relaxed">
            Precio especial hasta el <span className="text-white font-bold">6 de enero</span>. <br/>
            Cancela en un clic cuando quieras.
          </p>
          
          <button 
            onClick={onUpgrade}
            className="w-full py-5 bg-green-500 hover:bg-green-400 text-gray-900 text-xl font-bold rounded-2xl transition-all transform active:scale-95 shadow-lg shadow-green-500/20"
          >
            🔥 Obtener acceso total
          </button>
          
          <p className="mt-6 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
            Activa tu tranquilidad hoy · Sin sorpresas
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6 bg-slate-50 border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-gray-900 mb-12 text-center tracking-tight">Antes de empezar</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h4 className="text-lg font-bold text-gray-800 mb-2 leading-tight">¿Necesito registrar tarjeta para probar?</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Para nada. Puedes generar tu primera clase sin poner un solo dato bancario. Queremos que veas lo útil que es primero.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h4 className="text-lg font-bold text-gray-800 mb-2 leading-tight">¿Esto sustituye mis planeaciones oficiales?</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                MAÑANA es una herramienta práctica para tu día a día. Te da actividades listas, no es el formato administrativo de dirección.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h4 className="text-lg font-bold text-gray-800 mb-2 leading-tight">¿Puedo cancelar cuando quiera?</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Sí, con un solo clic desde tu perfil. Sin letras chiquitas ni procesos complicados que te quiten tiempo.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h4 className="text-lg font-bold text-gray-800 mb-2 leading-tight">¿Para qué niveles sirve?</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Diseñado para Preescolar, Primaria y Secundaria en México, alineado a la Nueva Escuela Mexicana (NEM).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Human Phrase Section */}
      <section className="py-16 px-6 bg-white text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-3xl mb-4">🇲🇽</div>
          <p className="text-2xl font-medium text-gray-700 leading-relaxed">
            "MAÑANA no fue creado por una gran empresa. Fue diseñado por docentes que, como tú, buscaban recuperar sus domingos."
          </p>
          <p className="mt-4 text-sm text-gray-400 font-bold uppercase tracking-widest">Hecho con ❤️ por maestros mexicanos</p>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-6 bg-green-600 text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight leading-tight">Deja de planear, empieza a vivir.</h2>
          <p className="text-xl md:text-2xl opacity-90 mb-10 max-w-xl mx-auto">
            Únete a cientos de maestros que ya están usando MAÑANA para descansar más.
          </p>
          <button 
            onClick={onStart}
            className="px-12 py-5 bg-white text-green-700 text-xl font-bold rounded-2xl shadow-2xl hover:bg-green-50 transition-all transform active:scale-95"
          >
            EMPEZAR MI CLASE AHORA
          </button>
        </div>
        {/* Simple decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-slate-900 text-white text-center">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 font-extrabold text-3xl text-green-500 tracking-tighter">MAÑANA</div>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-12">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center group-hover:bg-green-500/20 transition-all">
                <span className="text-green-500">📱</span>
              </div>
              <div className="text-left">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-0.5">Soporte y dudas</p>
                <p className="text-lg font-bold">WhatsApp 2229816798</p>
              </div>
            </div>
          </div>
          <div className="h-px bg-white/5 w-full mb-8"></div>
          <p className="text-sm text-gray-500 font-medium">
            © {new Date().getFullYear()} MAÑANA. Una herramienta pensada para el docente mexicano 🇲🇽
          </p>
          <p className="mt-2 text-[10px] text-gray-600 uppercase font-black tracking-widest">Alineado a la Nueva Escuela Mexicana</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
