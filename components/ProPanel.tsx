
import React from 'react';
import { SavedLesson } from '../types';
import FavoriteLessons from './FavoriteLessons';

interface ProPanelProps {
  isPro: boolean;
  favorites: SavedLesson[];
  onBack: () => void;
  onUpgrade: () => void;
  onCancelSubscription: () => void;
  onSelectLesson: (lesson: SavedLesson) => void;
  onDeleteLesson: (id: string) => void;
  onRenameLesson: (id: string, newTitle: string) => void;
  onLogout: () => void;
}

const ProPanel: React.FC<ProPanelProps> = ({ 
  isPro, 
  favorites, 
  onBack, 
  onUpgrade, 
  onCancelSubscription,
  onSelectLesson,
  onDeleteLesson,
  onRenameLesson,
  onLogout
}) => {
  const classesGenerated = favorites.length + 5; // Simulación de uso
  const timeSaved = classesGenerated * 45; // 45 mins ahorrados por clase

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={onBack}
          className="text-green-600 font-bold flex items-center gap-2 hover:underline transition-all"
        >
          ← Volver al generador
        </button>
        <button 
          onClick={onLogout}
          className="text-xs font-bold text-red-500 hover:text-red-700 transition-all uppercase tracking-widest flex items-center gap-2"
        >
          Cerrar sesión
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="text-3xl mb-2">📚</div>
          <div className="text-2xl font-black text-gray-800">{classesGenerated}</div>
          <div className="text-sm text-gray-500 font-medium">Clases creadas</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="text-3xl mb-2">⚡</div>
          <div className="text-2xl font-black text-gray-800">{timeSaved} min</div>
          <div className="text-sm text-gray-500 font-medium">Tiempo recuperado</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="text-3xl mb-2">🇲🇽</div>
          <div className="text-2xl font-black text-gray-800">SEP/NEM</div>
          <div className="text-sm text-gray-500 font-medium">Fiel al programa</div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl mb-12 border border-green-500/20">
        {!isPro && (
          <div className="absolute top-4 right-4 rotate-12 z-20">
            <span className="bg-red-600 text-white text-[10px] font-black px-4 py-1 rounded-full shadow-lg">🎄 OFERTA NAVIDAD</span>
          </div>
        )}
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Tu Membresía</h2>
              <div className="flex flex-wrap items-center gap-4">
                <p className="text-gray-400">
                  Estatus: {isPro ? (
                    <span className="text-yellow-400 font-bold flex items-center gap-1 inline-flex">
                      👑 MIEMBRO PRO ACTIVO
                    </span>
                  ) : (
                    <span className="text-gray-500 font-bold italic">PLAN GRATUITO</span>
                  )}
                </p>
                {isPro && (
                  <button 
                    onClick={onCancelSubscription}
                    className="text-xs font-bold text-gray-500 hover:text-red-400 underline transition-colors uppercase tracking-widest"
                  >
                    Cancelar cuando quiera
                  </button>
                )}
              </div>
            </div>
            {!isPro && (
              <div className="flex flex-col items-center md:items-end gap-2">
                <button 
                  onClick={onUpgrade}
                  className="px-8 py-4 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-black rounded-xl transition-all shadow-lg shadow-yellow-400/20 transform active:scale-95"
                >
                  VOLVERSE PRO POR $29
                </button>
                <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest">
                  Promo válida hasta Reyes 🎁
                </p>
              </div>
            )}
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-200">¿Qué incluye ser PRO?</h3>
              <ul className="space-y-3">
                {[
                  "Generaciones ilimitadas (sin límites diarios)",
                  "Exportación a PDF profesional y limpio",
                  "Guarda todas tus clases para siempre"
                ].map((b, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                    <span className="text-green-400 font-bold">✓</span> {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
              <h3 className="text-lg font-bold mb-4">Costo de tu tranquilidad</h3>
              {isPro ? (
                <div>
                  <div className="text-2xl font-bold">$29.00 MXN</div>
                  <div className="text-sm text-gray-400">Próxima renovación: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</div>
                </div>
              ) : (
                <div>
                   <div className="flex items-center gap-2 mb-1">
                     <span className="text-sm text-gray-500 line-through">$49</span>
                     <span className="text-2xl font-bold text-green-400">$29.00 MXN</span>
                   </div>
                   <p className="text-xs text-gray-500 italic">Precio especial de lanzamiento navideño</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      </div>

      {/* Biblioteca en Perfil */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-2">
          <FavoriteLessons 
            favorites={favorites}
            isPro={isPro}
            onSelect={onSelectLesson}
            onDelete={onDeleteLesson}
            onRename={onRenameLesson}
            onUpgrade={onUpgrade}
          />
          {favorites.length === 0 && (
            <div className="p-12 text-center">
              <div className="text-4xl mb-4">📂</div>
              <h3 className="text-lg font-bold text-gray-800">Tu biblioteca está vacía</h3>
              <p className="text-gray-500 text-sm mt-2">Las clases que guardes aparecerán aquí para que nunca las pierdas.</p>
              <button 
                onClick={onBack}
                className="mt-6 px-6 py-2 bg-green-600 text-white font-bold rounded-xl"
              >
                Crear mi primera clase
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProPanel;
