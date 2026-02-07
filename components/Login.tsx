
import React, { useState } from 'react';
import { ApiService, User } from '../services/api';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await ApiService.loginUser({ email, password });
      setIsLoading(false);
      onLogin(user);
    } catch (err: any) {
      setIsLoading(false);
      // Muestra el error específico lanzado por ApiService (mensaje del webhook)
      setError(err.message || 'Error de conexión con el servidor.');
      console.error("Login component caught error:", err);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center p-4">
      <div className="flex w-full max-w-[1100px] min-h-[650px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex-col md:flex-row border border-slate-100 dark:border-slate-800">
        
        {/* Lado Izquierdo: Marca */}
        <div className="hidden md:flex md:w-5/12 bg-primary relative overflow-hidden flex-col justify-between p-12 text-white">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg height="100%" width="100%">
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)"/>
            </svg>
          </div>
          
          <div className="relative z-10 flex items-center gap-3">
            <div className="size-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 48 48">
                <path d="M4 42.4379C4 42.4379 14.0962 36.0744 24 41.1692C35.0664 46.8624 44 42.2078 44 42.2078L44 7.01134C44 7.01134 35.068 11.6577 24.0031 5.96913C14.0971 0.876274 4 7.27094 4 7.27094L4 42.4379Z" fill="currentColor"></path>
              </svg>
            </div>
            <h2 className="text-xl font-bold tracking-tight">ShiftTrack Pro</h2>
          </div>

          <div className="relative z-10">
            <div className="w-full h-48 bg-white/10 rounded-2xl backdrop-blur-sm mb-8 flex items-center justify-center border border-white/20 overflow-hidden group">
               <span className="material-symbols-outlined text-[80px] opacity-30 group-hover:scale-110 transition-transform duration-500">lock_open</span>
            </div>
            <h1 className="text-4xl font-extrabold leading-tight mb-4">Acceso Seguro Centralizado</h1>
            <p className="text-lg text-white/80 font-medium">Autenticación segura contra SmartTitan Database para la gestión de personal.</p>
          </div>

          <div className="relative z-10 flex items-center gap-2">
            <div className="size-2 bg-success rounded-full animate-pulse"></div>
            <p className="text-xs text-white/60 italic uppercase tracking-widest font-bold">PostgreSQL Online</p>
          </div>
        </div>

        {/* Lado Derecho: Formulario */}
        <div className="w-full md:w-7/12 flex flex-col justify-center px-8 py-12 md:px-16 lg:px-24">
          <div className="max-w-[400px] w-full mx-auto">
            <div className="mb-10 text-center md:text-left">
              <h2 className="text-slate-900 dark:text-white text-3xl font-extrabold leading-tight mb-2">Bienvenido</h2>
              <p className="text-slate-500 dark:text-slate-400 text-base">Ingresa tus credenciales registradas en la plataforma.</p>
            </div>

            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-danger/10 border border-danger/20 text-danger text-xs p-4 rounded-xl font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
                  <span className="material-symbols-outlined text-sm">block</span>
                  {error}
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                <p className="text-slate-900 dark:text-slate-200 text-xs font-bold uppercase tracking-wider">Email Corporativo</p>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-4 text-slate-400">mail</span>
                  <input 
                    className="flex w-full rounded-2xl text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-primary focus:ring-4 focus:ring-primary/10 h-14 pl-12 pr-4 text-sm transition-all" 
                    placeholder="nombre@empresa.com"
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <p className="text-slate-900 dark:text-slate-200 text-xs font-bold uppercase tracking-wider">Contraseña</p>
                  <a className="text-primary text-xs font-bold hover:underline" href="#">¿Olvidaste tu contraseña?</a>
                </div>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-4 text-slate-400">lock</span>
                  <input 
                    className="flex w-full rounded-2xl text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-primary focus:ring-4 focus:ring-primary/10 h-14 pl-12 pr-12 text-sm transition-all" 
                    placeholder="••••••••" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className={`mt-2 flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl h-14 bg-primary text-white text-base font-bold shadow-lg shadow-primary/25 transition-all ${isLoading ? 'opacity-70 cursor-wait' : 'hover:bg-opacity-90 active:scale-[0.98]'}`}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                     <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                     <span>Verificando...</span>
                  </div>
                ) : 'Entrar al Sistema'}
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center gap-4 text-center">
              <p className="text-slate-400 text-xs">
                 El acceso a esta plataforma está restringido. Si no tienes cuenta, contacta a tu Administrador.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
