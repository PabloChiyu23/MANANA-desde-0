
import React, { useState, useEffect, useCallback } from 'react';
import { LessonParams, SavedLesson } from './types';
import { supabase } from './lib/supabase';
import Header from './components/Header';
import LessonForm from './components/LessonForm';
import LessonResult from './components/LessonResult';
import FavoriteLessons from './components/FavoriteLessons';
import LandingPage from './components/LandingPage';
import ProPanel from './components/ProPanel';
import PaymentModal from './components/PaymentModal';
import CancellationModal from './components/CancellationModal';
import AuthModal from './components/AuthModal';
import ResetPasswordModal from './components/ResetPasswordModal';
import { generateLessonContent, generatePlanBContent } from './services/ai';

const FREE_WITHOUT_EMAIL_LIMIT = 1;
const FREE_WITH_EMAIL_LIMIT = 10;
const MAX_FREE_FAVORITES = 3;

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'generator' | 'pro'>('landing');
  const [isPro, setIsPro] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState<boolean>(false);
  const [isPendingGeneration, setIsPendingGeneration] = useState<boolean>(false);
  const [isPendingUpgrade, setIsPendingUpgrade] = useState<boolean>(false);
  const [totalGenerations, setTotalGenerations] = useState<number>(0);
  
  const [params, setParams] = useState<LessonParams>({
    grade: '1° Primaria',
    topic: '',
    duration: '60',
    status: 'Mixto',
    tone: 'Divertido',
    groupSize: '16-30',
    narrative: 'Random'
  });

  const [result, setResult] = useState<string | null>(null);
  const [planBResult, setPlanBResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlanBLoading, setIsPlanBLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<SavedLesson[]>([]);

  useEffect(() => {
    // Manejar retorno de Mercado Pago
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    
    if (paymentStatus === 'success') {
      console.log('PAYMENT SUCCESS DETECTED FROM URL');
      // Limpiar URL
      window.history.replaceState({}, '', window.location.pathname);
      // El webhook ya actualizó Supabase, solo mostrar mensaje
      alert('¡Pago exitoso! Tu cuenta PRO se activará en unos segundos.');
      // Recargar datos del usuario
      setTimeout(() => window.location.reload(), 1500);
    } else if (paymentStatus === 'failure') {
      console.log('PAYMENT FAILURE DETECTED FROM URL');
      window.history.replaceState({}, '', window.location.pathname);
      alert('El pago no se pudo completar. Por favor intenta de nuevo.');
    } else if (paymentStatus === 'pending') {
      console.log('PAYMENT PENDING DETECTED FROM URL');
      window.history.replaceState({}, '', window.location.pathname);
      alert('Tu pago está pendiente de confirmación. Te notificaremos cuando se complete.');
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      // Intentar cargar sesión de Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        setUserEmail(session.user.email ?? null);
        
        // Cargar lecciones desde Supabase
        const { data: lessons, error } = await supabase
          .from('saved_lessons')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (!error && lessons) {
          setFavorites(lessons.map(l => ({
            ...l,
            createdAt: new Date(l.created_at).getTime()
          })));
        }

        // Cargar datos de usuario (pro, generaciones)
        const { data: userData } = await supabase
          .from('users')
          .select('is_pro, total_generations')
          .eq('id', session.user.id)
          .single();
        
        if (userData) {
          setIsPro(userData.is_pro);
          setTotalGenerations(userData.total_generations);
        }
      } else {
        // Fallback a localStorage si no hay sesión
        const savedFavs = localStorage.getItem('manana_favorites');
        if (savedFavs) {
          try { setFavorites(JSON.parse(savedFavs)); } catch (e) {}
        }
        const savedEmail = localStorage.getItem('manana_user_email');
        if (savedEmail) setUserEmail(savedEmail);
        const savedPro = localStorage.getItem('manana_pro_status');
        if (savedPro === 'true') setIsPro(true);
        const savedGens = localStorage.getItem('manana_total_generations');
        if (savedGens) setTotalGenerations(parseInt(savedGens, 10));
      }
    };

    loadData();

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('AUTH STATE CHANGE:', _event, session?.user?.email);
      
      // Detectar cuando el usuario llega desde el link de recuperación de contraseña
      if (_event === 'PASSWORD_RECOVERY') {
        console.log('PASSWORD RECOVERY EVENT DETECTED');
        setIsResetPasswordModalOpen(true);
        return;
      }
      
      // Cerrar el modal de contraseña cuando se actualiza el usuario (respaldo)
      if (_event === 'USER_UPDATED') {
        console.log('USER_UPDATED EVENT - Closing password modal');
        setIsResetPasswordModalOpen(false);
      }
      
      // Cerrar el modal de login cuando el usuario inicia sesión
      if (_event === 'SIGNED_IN' && session?.user) {
        console.log('SIGNED_IN EVENT - Closing auth modal');
        setIsAuthModalOpen(false);
      }
      
      if (session?.user) {
        setUserId(session.user.id);
        setUserEmail(session.user.email ?? null);
        
        // Recargar datos del usuario desde Supabase al iniciar sesión
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('is_pro, total_generations')
          .eq('id', session.user.id)
          .single();
        
        console.log('USER DATA FROM SUPABASE:', userData, 'ERROR:', userError);
        
        if (userData) {
          setIsPro(userData.is_pro);
          setTotalGenerations(userData.total_generations);
          // Sincronizar localStorage con Supabase
          localStorage.setItem('manana_total_generations', userData.total_generations.toString());
          console.log('SET TOTAL GENERATIONS TO:', userData.total_generations);
        } else if (userError?.code === 'PGRST116') {
          // Usuario no existe en la tabla, crearlo con las generaciones de localStorage
          console.log('USER NOT FOUND, CREATING...');
          const localGens = parseInt(localStorage.getItem('manana_total_generations') || '0', 10);
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: session.user.id,
              email: session.user.email,
              is_pro: false,
              total_generations: localGens
            });
          console.log('INSERT RESULT:', insertError);
          if (!insertError) {
            setIsPro(false);
            setTotalGenerations(localGens);
          }
        } else if (userError) {
          // Otro error de Supabase - intentar usar localStorage como fallback temporal
          console.error('SUPABASE ERROR:', userError);
          const localGens = parseInt(localStorage.getItem('manana_total_generations') || '0', 10);
          setTotalGenerations(localGens);
        }

        // Cargar lecciones guardadas
        const { data: lessons } = await supabase
          .from('saved_lessons')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (lessons) {
          setFavorites(lessons.map(l => ({
            ...l,
            createdAt: new Date(l.created_at).getTime()
          })));
        }
      } else {
        // Al cerrar sesión, NO resetear totalGenerations para usuarios no logueados
        // Solo limpiar datos de sesión
        setUserId(null);
        setUserEmail(null);
        setIsPro(false);
        // Cargar desde localStorage para usuarios sin cuenta
        const localGens = parseInt(localStorage.getItem('manana_total_generations') || '0', 10);
        setTotalGenerations(localGens);
        setFavorites([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUpgradeClick = () => {
    if (!userEmail) {
      // Si no hay cuenta, primero obligamos a autenticarse
      setIsPendingUpgrade(true);
      setIsAuthModalOpen(true);
    } else {
      // Si ya hay cuenta, procedemos al pago
      setIsPaymentModalOpen(true);
    }
  };

  const executeGeneration = useCallback(async (currentParams: LessonParams) => {
    if (!currentParams.topic.trim()) {
      setError("Por favor ingresa un tema.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setPlanBResult(null);

    try {
      const content = await generateLessonContent(currentParams);
      setResult(content);
      
      const newTotal = totalGenerations + 1;
      setTotalGenerations(newTotal);
      localStorage.setItem('manana_total_generations', newTotal.toString());

      // Actualizar en Supabase si está logueado
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { error: updateError } = await supabase
          .from('users')
          .update({ total_generations: newTotal, updated_at: new Date().toISOString() })
          .eq('id', session.user.id);
        
        if (updateError) {
          console.error('ERROR UPDATING GENERATIONS IN SUPABASE:', updateError);
        } else {
          console.log('UPDATED GENERATIONS IN SUPABASE TO:', newTotal);
        }
      }

      setTimeout(() => {
        window.scrollTo({ top: 350, behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado.");
    } finally {
      setIsLoading(false);
    }
  }, [totalGenerations]);

  const handleAuthSuccess = (email: string) => {
    setUserEmail(email);
    localStorage.setItem('manana_user_email', email);
    setIsAuthModalOpen(false);
    
    // Si venía de un intento de upgrade, abrir el modal de pago inmediatamente
    if (isPendingUpgrade) {
      setIsPendingUpgrade(false);
      setIsPaymentModalOpen(true);
    } 
    // Si venía de un intento de generación gratuita bloqueada
    else if (isPendingGeneration) {
      executeGeneration(params);
      setIsPendingGeneration(false);
    }
  };

  const handleLogout = async () => {
    console.log('LOGOUT CLICKED - Starting logout process');
    
    // Limpiar estado local inmediatamente
    setUserId(null);
    setUserEmail(null);
    setIsPro(false);
    setTotalGenerations(0);
    setFavorites([]);
    localStorage.removeItem('manana_user_email');
    localStorage.removeItem('manana_pro_status');
    localStorage.removeItem('manana_total_generations');
    localStorage.removeItem('manana_favorites');
    setView('landing');
    console.log('LOCAL STATE CLEARED');
    
    // Intentar cerrar sesión en Supabase (con timeout)
    try {
      const signOutPromise = supabase.auth.signOut();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 3000)
      );
      
      await Promise.race([signOutPromise, timeoutPromise]);
      console.log('SUPABASE SIGN OUT COMPLETE');
    } catch (err) {
      console.log('SUPABASE SIGN OUT SKIPPED (timeout or error):', err);
    }
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    console.log('DEBUG handleGenerate:', { isPro, totalGenerations, userEmail, limit: FREE_WITHOUT_EMAIL_LIMIT });
    
    if (!isPro && totalGenerations >= FREE_WITHOUT_EMAIL_LIMIT && !userEmail) {
      console.log('DEBUG: Blocking - needs login');
      setIsPendingGeneration(true);
      setIsAuthModalOpen(true);
      return;
    }

    if (!isPro && totalGenerations >= FREE_WITH_EMAIL_LIMIT) {
      setError("Has llegado al límite de 10 planeaciones gratuitas.");
      handleUpgradeClick();
      return;
    }

    executeGeneration(params);
  };

  const handleGeneratePlanB = async () => {
    if (isPlanBLoading) return;
    
    if (!isPro && totalGenerations >= FREE_WITHOUT_EMAIL_LIMIT && !userEmail) {
      setIsPendingGeneration(true);
      setIsAuthModalOpen(true);
      return;
    }

    if (!isPro && totalGenerations >= FREE_WITH_EMAIL_LIMIT) {
      setError("Has llegado al límite de 10 planeaciones gratuitas.");
      handleUpgradeClick();
      return;
    }
    
    setIsPlanBLoading(true);
    try {
      const planB = await generatePlanBContent(params);
      setPlanBResult(planB);
    } catch (err: any) {
      alert(err.message || "No se pudo generar el Plan B.");
    } finally {
      setIsPlanBLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;

    if (!userEmail && !isPro) {
      setIsPendingGeneration(false);
      setIsAuthModalOpen(true);
      return;
    }

    if (!isPro && favorites.length >= MAX_FREE_FAVORITES) {
      alert(`Has llegado al límite de guardado gratuito (${MAX_FREE_FAVORITES} clases). Sube a PRO para biblioteca ilimitada.`);
      handleUpgradeClick();
      return;
    }

    const newFavorite: SavedLesson = {
      ...params,
      id: Date.now().toString(),
      content: result,
      createdAt: Date.now()
    };

    // Guardar en Supabase si hay sesión
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data, error } = await supabase
        .from('saved_lessons')
        .insert([{
          user_id: session.user.id,
          topic: params.topic,
          grade: params.grade,
          duration: params.duration,
          status: params.status,
          tone: params.tone,
          group_size: params.groupSize,
          narrative: params.narrative,
          custom_narrative: params.customNarrative,
          content: result
        }])
        .select()
        .single();
      
      if (!error && data) {
        newFavorite.id = data.id;
      }
    }

    const updated = [newFavorite, ...favorites];
    setFavorites(updated);
    localStorage.setItem('manana_favorites', JSON.stringify(updated));
    alert("¡Clase guardada en tu biblioteca!");
  };

  const handlePaymentSuccess = async () => {
    setIsPro(true);
    localStorage.setItem('manana_pro_status', 'true');
    
    // Guardar estado PRO en Supabase
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { error } = await supabase
        .from('users')
        .update({ is_pro: true, updated_at: new Date().toISOString() })
        .eq('id', session.user.id);
      
      if (error) {
        console.error('ERROR SAVING PRO STATUS:', error);
      } else {
        console.log('PRO STATUS SAVED TO SUPABASE');
      }
    }
    
    setIsPaymentModalOpen(false);
    alert("¡Bienvenido a MAÑANA PRO! 👑");
    setView('pro');
  };

  const handleCancelClick = () => setIsCancelModalOpen(true);

  const handleFinalCancel = async (reason: string, feedback: string) => {
    setIsPro(false);
    localStorage.setItem('manana_pro_status', 'false');
    
    // Guardar cancelación en Supabase
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { error } = await supabase
        .from('users')
        .update({ is_pro: false, updated_at: new Date().toISOString() })
        .eq('id', session.user.id);
      
      if (error) {
        console.error('ERROR CANCELING PRO STATUS:', error);
      } else {
        console.log('PRO STATUS CANCELED IN SUPABASE');
      }
    }
    
    setIsCancelModalOpen(false);
    alert("Suscripción cancelada.");
    setView('generator');
  };

  const handleSelectLesson = (l: SavedLesson) => {
    setParams({ 
      grade: l.grade, 
      topic: l.topic, 
      duration: l.duration, 
      status: l.status,
      tone: l.tone || 'Divertido',
      groupSize: l.groupSize || '16-30',
      narrative: l.narrative || 'Random',
      customNarrative: l.customNarrative
    });
    setResult(l.content);
    setPlanBResult(null);
    setView('generator');
    setTimeout(() => {
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }, 100);
  };

  const handleDeleteLesson = async (id: string) => {
    console.log('DELETE LESSON - before:', { totalGenerations, favoritesCount: favorites.length });
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase
        .from('saved_lessons')
        .delete()
        .eq('id', id);
    }
    const updated = favorites.filter(f => f.id !== id);
    setFavorites(updated);
    localStorage.setItem('manana_favorites', JSON.stringify(updated));
    console.log('DELETE LESSON - after:', { totalGenerations, favoritesCount: updated.length });
  };

  const handleRenameLesson = async (id: string, newTitle: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase
        .from('saved_lessons')
        .update({ topic: newTitle })
        .eq('id', id);
    }
    const updated = favorites.map(f => f.id === id ? { ...f, topic: newTitle } : f);
    setFavorites(updated);
    localStorage.setItem('manana_favorites', JSON.stringify(updated));
  };

  if (view === 'landing') {
    return <LandingPage onStart={() => setView('generator')} onUpgrade={handleUpgradeClick} />;
  }

  return (
    <div className="min-h-screen pb-20 bg-slate-50 font-sans">
      <Header 
        isPro={isPro} 
        userEmail={userEmail}
        onOpenPanel={() => setView('pro')} 
        onHome={() => setView('landing')} 
        onLogin={() => setIsAuthModalOpen(true)}
        onUpgrade={handleUpgradeClick}
      />
      
      {view === 'pro' ? (
        <ProPanel 
          isPro={isPro} 
          favorites={favorites}
          totalGenerations={totalGenerations}
          userEmail={userEmail}
          onBack={() => setView('generator')}
          onUpgrade={handleUpgradeClick}
          onCancelSubscription={handleCancelClick}
          onSelectLesson={handleSelectLesson}
          onDeleteLesson={handleDeleteLesson}
          onRenameLesson={handleRenameLesson}
          onLogout={handleLogout}
        />
      ) : (
        <main className="container mx-auto px-4 max-w-4xl py-8">
          <div className="grid grid-cols-1 gap-8">
            <div className="order-1">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight italic">MAÑANA</h2>
                <p className="text-gray-500 font-medium">Planeaciones rápidas alineadas a la NEM.</p>
                
                {!isPro && (
                  <div className="mt-4 inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {userEmail ? 'Clases Gratuitas:' : 'Tu primera clase es libre:'}
                    </span>
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${totalGenerations >= 8 ? 'bg-red-500' : 'bg-green-500'}`}
                        style={{ width: `${(totalGenerations / FREE_WITH_EMAIL_LIMIT) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-600">{totalGenerations}/{FREE_WITH_EMAIL_LIMIT}</span>
                  </div>
                )}
              </div>
              
              <LessonForm 
                params={params} 
                setParams={setParams} 
                onSubmit={handleGenerate}
                onUpgrade={handleUpgradeClick}
                isLoading={isLoading}
                isPro={isPro}
              />
              
              {error && (
                <div className={`mt-4 p-4 rounded-2xl text-center font-bold animate-shake border ${
                  error.includes("seguridad") ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-red-50 text-red-700 border-red-200"
                }`}>
                  <div className="text-lg mb-1">{error.includes("seguridad") ? "⚠️" : "❌"}</div>
                  {error}
                  {!error.includes("seguridad") && (
                    <button 
                      onClick={handleUpgradeClick}
                      className="block mx-auto mt-2 text-sm underline text-red-800"
                    >
                      Sube a PRO para planeaciones ilimitadas
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="order-2">
              {isLoading && (
                <div className="text-center py-16 animate-in fade-in duration-300">
                  <div className="relative w-16 h-16 mx-auto mb-6">
                    <div className="absolute inset-0 border-4 border-green-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-gray-900 font-black text-xl animate-pulse tracking-tight uppercase">GENERANDO PLANEACIÓN NEM...</p>
                  <p className="text-sm text-gray-400 mt-2 italic font-medium">Buscando el mejor enfoque docente en 60 segundos...</p>
                </div>
              )}

              {result && !isLoading && (
                <LessonResult 
                  content={result}
                  planBContent={planBResult}
                  params={params}
                  isPro={isPro}
                  onSave={handleSave} 
                  onRegenerate={() => handleGenerate()}
                  onUpgrade={handleUpgradeClick}
                  onGeneratePlanB={handleGeneratePlanB}
                  isLoading={isLoading}
                  isPlanBLoading={isPlanBLoading}
                />
              )}
            </div>

            <div className="order-3">
              <FavoriteLessons 
                favorites={favorites}
                isPro={isPro}
                onSelect={handleSelectLesson}
                onDelete={handleDeleteLesson}
                onRename={handleRenameLesson}
                onUpgrade={handleUpgradeClick}
              />
            </div>
          </div>
        </main>
      )}

      <PaymentModal 
        isOpen={isPaymentModalOpen}
        userId={userId}
        userEmail={userEmail}
        onClose={() => setIsPaymentModalOpen(false)} 
        onSuccess={handlePaymentSuccess} 
      />

      <CancellationModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleFinalCancel}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <ResetPasswordModal
        isOpen={isResetPasswordModalOpen}
        onClose={() => setIsResetPasswordModalOpen(false)}
        onSuccess={() => {
          setIsResetPasswordModalOpen(false);
        }}
      />

      <footer className="mt-20 py-12 text-center text-gray-400 text-sm border-t border-gray-100">
        <div className="mb-4 font-black text-green-600/50 uppercase tracking-widest text-lg">MAÑANA</div>
        <p>© {new Date().getFullYear()} MAÑANA - Hecho con ❤️ para maestros de México 🇲🇽</p>
      </footer>
    </div>
  );
};

export default App;
