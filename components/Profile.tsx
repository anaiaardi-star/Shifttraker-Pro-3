
import React, { useEffect, useState } from 'react';
import { ApiService, User } from '../services/api';

interface ProfileProps {
  user: User | null;
}

export const Profile: React.FC<ProfileProps> = ({ user }) => {
  const [extraInfo, setExtraInfo] = useState<Partial<User>>({});
  
  useEffect(() => {
    // 3. Cargar Información Extra
    if (user?.email) {
      ApiService.getUserProfile(user.email).then(data => {
        setExtraInfo(data);
      });
    }
  }, [user]);

  const displayName = extraInfo.name || user?.name || 'Usuario';
  const displayRole = extraInfo.role || user?.role || 'User';
  const displayEmail = extraInfo.email || user?.email || 'usuario@empresa.com';
  const displayAvatar = extraInfo.avatar || user?.avatar || 'https://via.placeholder.com/200';
  const displayPhone = extraInfo.phone || '+1 (555) 000-0000';

  return (
    <div className="flex-1 w-full max-w-[960px] mx-auto py-10 px-6 md:px-10 lg:px-20">
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Mi Perfil</h1>
        <p className="text-slate-500 dark:text-slate-400 text-base font-normal">Gestiona tu información personal.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 mb-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <div className="relative group">
            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-32 border-4 border-white dark:border-slate-800 shadow-md" style={{ backgroundImage: `url("${displayAvatar}")` }}></div>
          </div>
          <div className="flex flex-col justify-center text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-1">
              <h2 className="text-slate-900 dark:text-white text-2xl font-bold leading-tight">{displayName}</h2>
              <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full border border-primary/20 uppercase tracking-widest">{displayRole}</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Empleado ID: #{user?.id || 'AR-1092'}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 gap-8 bg-slate-50/30 dark:bg-slate-800/20">
          <button className="border-b-[3px] border-primary text-primary pb-3 pt-4 font-bold text-sm">Información General</button>
        </div>

        <div className="p-8">
          <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-6">Detalles Personales</h3>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={e => e.preventDefault()}>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre Completo</label>
              <input className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white px-4 py-3 text-sm focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all" defaultValue={displayName} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Correo Electrónico</label>
              <input className="rounded-xl border-slate-100 bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700/50 text-slate-400 px-4 py-3 text-sm cursor-not-allowed" defaultValue={displayEmail} disabled />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Teléfono</label>
              <input className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white px-4 py-3 text-sm focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all" defaultValue={displayPhone} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rol de Usuario</label>
              <div className="rounded-xl border-slate-100 bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700/50 text-slate-400 px-4 py-3 text-sm flex items-center">{displayRole}</div>
            </div>
            <div className="md:col-span-2 pt-6 flex justify-end gap-4 border-t border-slate-100 dark:border-slate-800">
              <button className="px-6 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">Cancelar</button>
              <button className="px-8 py-3 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">Guardar Cambios</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
