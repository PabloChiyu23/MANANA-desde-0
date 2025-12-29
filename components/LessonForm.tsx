
import React, { useState, useRef, useEffect } from 'react';
import { LessonParams, Grade, Duration, GroupStatus, LessonTone, GroupSize, NarrativeType, SUGGESTED_TOPICS } from '../types';

interface LessonFormProps {
  params: LessonParams;
  setParams: (params: LessonParams) => void;
  onSubmit: (e: React.FormEvent) => void;
  onUpgrade: () => void;
  isLoading: boolean;
  isPro: boolean;
}

const grades: Grade[] = [
  'Preescolar', '1° Primaria', '2° Primaria', '3° Primaria', 
  '4° Primaria', '5° Primaria', '6° Primaria', 
  '1° Secundaria', '2° Secundaria', '3° Secundaria'
];

const durations: Duration[] = ['30', '45', '50', '60', '90'];
const groupSizes: GroupSize[] = ['1-15', '16-30', '31-45', '45+'];

const narratives: { value: NarrativeType; label: string; icon: string }[] = [
  { value: 'Random', label: 'Sorpréndeme', icon: '✨' },
  { value: 'Misión Social', label: 'Misión Social', icon: '🤝' },
  { value: 'Expedición', label: 'Expedición', icon: '🧭' },
  { value: 'Viaje Histórico', label: 'Viaje Histórico', icon: '⏳' },
  { value: 'Gran Misterio', label: 'El Gran Misterio', icon: '🕵️' },
  { value: 'Eco-Aventura', label: 'Eco-Aventura', icon: '🌱' },
  { value: 'Taller de Inventores', label: 'Taller de Inventores', icon: '🛠️' },
  { value: 'Olimpiada', label: 'Olimpiada', icon: '🏅' },
  { value: 'Personalizada', label: 'Tu propia idea', icon: '✍️' }
];

const statuses: { value: GroupStatus; icon: string }[] = [
  { value: 'Activo', icon: '🔥' },
  { value: 'Cansado', icon: '😴' },
  { value: 'Disperso', icon: '🌪️' },
  { value: 'Mixto', icon: '🌓' },
  { value: 'Desmotivado', icon: '📉' },
  { value: 'Competitivo', icon: '🏆' },
  { value: 'Ruidoso', icon: '📢' },
  { value: 'Creativo', icon: '🎨' }
];

const tones: { value: LessonTone; label: string; icon: string }[] = [
  { value: 'Divertido', label: 'Divertido', icon: '🎨' },
  { value: 'Estricto', label: 'Estricto', icon: '📏' },
  { value: 'Gamificado', label: 'Gamificado', icon: '🎮' },
  { value: 'Tradicional', label: 'Tradicional', icon: '📖' },
  { value: 'Socioemocional', label: 'Socioemocional', icon: '❤️' },
  { value: 'Investigación', label: 'Investigación', icon: '🔍' },
  { value: 'Experimental', label: 'Práctico', icon: '🧪' },
  { value: 'Colaborativo', label: 'Equipos', icon: '🤝' }
];

const LessonForm: React.FC<LessonFormProps> = ({ params, setParams, onSubmit, onUpgrade, isLoading, isPro }) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getSuggestions = () => {
    const input = params.topic.trim().toLowerCase();
    if (!input) return SUGGESTED_TOPICS.slice(0, 5);
    const filtered = SUGGESTED_TOPICS.filter(t => t.toLowerCase().includes(input)).slice(0, 5);
    if (filtered.length === 1 && filtered[0].toLowerCase() === input) return [];
    return filtered;
  };

  const currentSuggestions = getSuggestions();

  const handleChange = (name: keyof LessonParams, value: string) => {
    setParams({ ...params, [name]: value as any });
  };

  const handleSelectTopic = (topic: string) => {
    setParams({ ...params, topic });
    setShowSuggestions(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clase CSS común para botones seleccionados en la sección avanzada
  const selectedBtnClass = "bg-slate-800 border-slate-800 text-white shadow-md";
  const defaultBtnClass = "bg-white border-gray-200 text-gray-600 hover:border-gray-300";

  return (
    <form onSubmit={onSubmit} className="space-y-6 bg-white p-6 md:p-8 rounded-3xl shadow-2xl border border-gray-100 max-w-xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Grado</label>
          <select
            value={params.grade}
            onChange={(e) => handleChange('grade', e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-slate-50 text-sm font-medium"
            required
          >
            {grades.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Tiempo de clase</label>
          <select
            value={params.duration}
            onChange={(e) => handleChange('duration', e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-slate-50 text-sm font-medium"
            required
          >
            {durations.map(d => <option key={d} value={d}>{d} minutos</option>)}
          </select>
        </div>
      </div>

      <div className="relative" ref={dropdownRef}>
        <label className="block text-sm font-bold text-gray-700 mb-2">¿Cuál es el tema de mañana?</label>
        <input
          type="text"
          value={params.topic}
          onChange={(e) => handleChange('topic', e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Ej: Fracciones, Revolución Mexicana..."
          className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-slate-50 font-medium placeholder:text-gray-300"
          required
          autoComplete="off"
        />

        {showSuggestions && currentSuggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-2 bg-slate-50 border-b border-gray-100">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Sugerencias de temas</span>
            </div>
            {currentSuggestions.map((topic, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelectTopic(topic)}
                className="w-full text-left px-4 py-3 hover:bg-green-50 text-gray-600 text-sm font-medium border-b border-gray-50 last:border-0 transition-colors flex items-center gap-3 group"
              >
                <span className="text-gray-300 group-hover:text-green-500 transition-colors">✨</span>
                {topic}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-xs font-black text-gray-400 hover:text-green-600 transition-colors uppercase tracking-widest group"
        >
          <span className={`transform transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
          Ajustar ambiente y enfoque
        </button>
      </div>

      {showAdvanced && (
        <div className="space-y-6 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-tight">
              Tamaño del grupo (alumnos)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {groupSizes.map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleChange('groupSize', size)}
                  className={`p-2.5 rounded-xl text-[11px] font-bold border transition-all ${
                    params.groupSize === size ? selectedBtnClass : defaultBtnClass
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-tight">
              Enfoque pedagógico
            </label>
            <div className="grid grid-cols-2 gap-2">
              {tones.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => handleChange('tone', t.value)}
                  className={`p-3 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-2 ${
                    params.tone === t.value ? selectedBtnClass : defaultBtnClass
                  }`}
                >
                  <span>{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-tight">
              ¿Cómo está el grupo hoy?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {statuses.map(s => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => handleChange('status', s.value)}
                  className={`p-2.5 rounded-xl text-[10px] font-bold transition-all border flex items-center justify-center gap-1.5 ${
                    params.status === s.value ? selectedBtnClass : defaultBtnClass
                  }`}
                >
                  {s.icon} {s.value}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-tight">
              Narrativa Creativa (HILO CONDUCTOR)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {narratives.map(n => (
                <button
                  key={n.value}
                  type="button"
                  onClick={() => handleChange('narrative', n.value)}
                  className={`p-3 rounded-xl text-[10px] font-bold border transition-all flex items-center gap-2 ${
                    params.narrative === n.value ? selectedBtnClass : defaultBtnClass
                  }`}
                >
                  <span className="text-sm">{n.icon}</span>
                  {n.label}
                </button>
              ))}
            </div>
            
            {params.narrative === 'Personalizada' && (
              <div className="mt-3 animate-in slide-in-from-left-2 duration-200">
                <input
                  type="text"
                  value={params.customNarrative || ''}
                  onChange={(e) => handleChange('customNarrative', e.target.value)}
                  placeholder="Ej: Misión espacial para salvar a Marte..."
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none text-sm bg-green-50/30 placeholder:text-gray-400"
                />
              </div>
            )}
          </div>
          
          <div className="h-px bg-gray-100 w-full"></div>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-5 bg-green-600 hover:bg-green-700 text-white font-black rounded-2xl shadow-xl shadow-green-600/20 transform active:scale-95 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
      >
        {isLoading ? (
          <>
            <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
            CREANDO TU CLASE...
          </>
        ) : (
          "DAME MI CLASE"
        )}
      </button>
      
      <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
        Clases inteligentes alineadas a la NEM 🇲🇽
      </p>
    </form>
  );
};

export default LessonForm;
