
import React, { useState } from 'react';
import { SavedLesson } from '../types';

interface FavoriteLessonsProps {
  favorites: SavedLesson[];
  isPro: boolean;
  onSelect: (lesson: SavedLesson) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onUpgrade: () => void;
}

const FavoriteLessons: React.FC<FavoriteLessonsProps> = ({ favorites, isPro, onSelect, onDelete, onRename, onUpgrade }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  if (favorites.length === 0) return null;

  const FREE_LIMIT = 3;
  const visibleFavorites = isPro ? favorites : favorites.slice(0, FREE_LIMIT);
  const lockedCount = Math.max(0, favorites.length - FREE_LIMIT);

  const startEditing = (e: React.MouseEvent, lesson: SavedLesson) => {
    e.stopPropagation();
    setEditingId(lesson.id);
    setEditValue(lesson.topic);
  };

  const handleSaveRename = (id: string) => {
    if (editValue.trim() && editValue !== favorites.find(f => f.id === id)?.topic) {
      onRename(id, editValue.trim());
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') handleSaveRename(id);
    if (e.key === 'Escape') setEditingId(null);
  };

  return (
    <div className="mt-16 max-w-xl mx-auto px-4">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h3 className="text-xl font-black text-gray-800 tracking-tight">TU BIBLIOTECA</h3>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Clases guardadas anteriormente</p>
        </div>
        {!isPro && (
          <span className="text-[10px] font-black text-gray-400">{favorites.length}/{FREE_LIMIT} LIBRES</span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {visibleFavorites.map((lesson) => (
          <div 
            key={lesson.id}
            className="flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group animate-in slide-in-from-left-2"
          >
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase">{lesson.grade}</span>
                <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-bold uppercase">{lesson.tone}</span>
              </div>
              
              {editingId === lesson.id ? (
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => handleSaveRename(lesson.id)}
                  onKeyDown={(e) => handleKeyDown(e, lesson.id)}
                  className="w-full font-bold text-gray-800 text-lg leading-tight p-1 border-b-2 border-green-500 outline-none bg-green-50 rounded"
                  autoFocus
                />
              ) : (
                <button 
                  onClick={() => onSelect(lesson)}
                  className="w-full text-left flex items-center gap-2 group/title"
                >
                  <div className="font-bold text-gray-800 text-lg leading-tight truncate">{lesson.topic}</div>
                  <button 
                    onClick={(e) => startEditing(e, lesson)}
                    className="opacity-0 group-hover/title:opacity-100 p-1 text-gray-400 hover:text-green-600 transition-all"
                    title="Renombrar clase"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </button>
              )}
              
              <div className="text-xs text-gray-400 font-medium mt-1">Guardada el {new Date(lesson.createdAt).toLocaleDateString()}</div>
            </div>
            
            <div className="flex items-center gap-1">
              <button 
                onClick={() => onDelete(lesson.id)}
                className="p-3 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                title="Eliminar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v2m3 4s-1 1" />
                </svg>
              </button>
            </div>
          </div>
        ))}

        {!isPro && lockedCount > 0 && (
          <button 
            onClick={onUpgrade}
            className="relative group overflow-hidden p-6 bg-slate-100 rounded-3xl border-2 border-dashed border-slate-200 transition-all hover:border-green-400 hover:bg-slate-50 text-center"
          >
            <div className="relative z-10">
              <div className="text-2xl mb-2">🔒</div>
              <div className="font-black text-slate-400 group-hover:text-green-600 transition-colors uppercase tracking-tight text-sm">
                Tienes {lockedCount} {lockedCount === 1 ? 'clase' : 'clases'} bloqueadas
              </div>
              <div className="text-[10px] text-slate-400 font-bold mt-1">Sube a PRO para desbloquear tu historial ilimitado</div>
            </div>
          </button>
        )}
      </div>
    </div>
  );
};

export default FavoriteLessons;
