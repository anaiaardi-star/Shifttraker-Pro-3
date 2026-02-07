
import React, { useState, useEffect } from 'react';
import { ApiService, User } from '../services/api';

export const Users = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Analyst'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');
    const [recentUsers, setRecentUsers] = useState<User[]>([]);
    
    // Estados para eliminación
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Estados para edición
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [editFormData, setEditFormData] = useState({
        name: '',
        email: '',
        role: '',
        password: '' // Nuevo campo para la contraseña
    });

    const loadUsers = async () => {
        setIsFetching(true);
        try {
            const users = await ApiService.fetchUsers();
            setRecentUsers(users);
        } catch (e: any) {
            console.error("Error loading users", e);
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(false);
        try {
            const newUser = await ApiService.registerUserReal(formData);
            setSuccess(true);
            setStatusMsg('¡Usuario creado correctamente!');
            setFormData({ name: '', email: '', password: '', role: 'Analyst' });
            setRecentUsers(prev => [newUser, ...prev]);
        } catch (err: any) {
            setError(err.message || 'Error al crear usuario.');
        } finally {
            setIsLoading(false);
            setTimeout(() => setSuccess(false), 4000);
        }
    };

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;
        
        setIsDeleting(true);
        try {
            const ok = await ApiService.deleteUser(userToDelete);
            if (ok) {
                setRecentUsers(prev => prev.filter(u => u.id !== userToDelete.id));
                setUserToDelete(null);
            } else {
                alert("No se pudo eliminar el usuario. Intenta de nuevo.");
            }
        } catch (err) {
            console.error("Delete error", err);
            alert("Error de conexión al intentar eliminar.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleOpenEdit = (user: User) => {
        setUserToEdit(user);
        setEditFormData({
            name: user.name || '',
            email: user.email || '',
            role: user.role || 'Analyst',
            password: '' // Se inicializa vacío por seguridad
        });
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userToEdit) return;

        setIsUpdating(true);
        try {
            // Preparamos el objeto de actualización
            const updatePayload: any = {
                name: editFormData.name,
                email: editFormData.email,
                role: editFormData.role
            };

            // Solo enviamos la contraseña si el usuario escribió algo
            if (editFormData.password && editFormData.password.trim() !== '') {
                updatePayload.password = editFormData.password;
            }

            // Enviamos los datos al webhook
            const ok = await ApiService.updateUser(userToEdit, updatePayload);

            if (ok) {
                // Actualización local exitosa (sin incluir password en el estado local)
                setRecentUsers(prev => prev.map(u => 
                    u.id === userToEdit.id ? { ...u, name: editFormData.name, email: editFormData.email, role: editFormData.role } : u
                ));
                setUserToEdit(null);
            } else {
                alert("El servidor no pudo procesar la actualización. Revisa la configuración del webhook.");
            }
        } catch (err) {
            console.error("Update error", err);
            alert("Error de red al intentar conectar con el servidor de edición.");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="flex-1 w-full max-w-[1200px] mx-auto px-6 md:px-10 py-8 relative animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-6 mb-8">
                <div className="flex min-w-72 flex-col gap-2">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                            Gestión de Acceso
                        </span>
                    </div>
                    <p className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Usuarios del Sistema</p>
                    <p className="text-slate-500 dark:text-slate-400 text-base font-normal">Crea, edita y gestiona los roles de los empleados.</p>
                </div>
                <button onClick={loadUsers} className="flex items-center gap-2 text-primary font-bold text-sm hover:underline" disabled={isFetching}>
                    <span className={`material-symbols-outlined text-lg ${isFetching ? 'animate-spin' : ''}`}>refresh</span>
                    Actualizar Lista
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Formulario de Creación */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 sticky top-24">
                        <div className="mb-6 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div className="size-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined">person_add</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">Nuevo Usuario</h3>
                                <p className="text-xs text-slate-500">Registrar en base de datos</p>
                            </div>
                        </div>

                        {success && (
                            <div className="mb-4 p-3 bg-green-100 border border-green-200 text-green-700 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                {statusMsg}
                            </div>
                        )}
                        {error && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                                <span className="material-symbols-outlined text-sm">error</span>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Nombre Completo</label>
                                <input 
                                    className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm p-3 focus:ring-2 focus:ring-primary/20 transition-all" 
                                    placeholder="Ej: Maria Gonzalez" required 
                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} 
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Email Corporativo</label>
                                <input 
                                    className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm p-3 focus:ring-2 focus:ring-primary/20 transition-all" 
                                    placeholder="maria@empresa.com" type="email" required 
                                    value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} 
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Contraseña</label>
                                <input 
                                    className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm p-3 focus:ring-2 focus:ring-primary/20 transition-all" 
                                    placeholder="••••••••" type="password" required 
                                    value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} 
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Rol Asignado</label>
                                <select 
                                    className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm p-3 focus:ring-2 focus:ring-primary/20 transition-all" 
                                    value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="Analyst">Analista</option>
                                    <option value="Supervisor">Supervisor</option>
                                    <option value="Manager">Gerente</option>
                                    <option value="Admin">Administrador</option>
                                </select>
                            </div>
                            <button type="submit" disabled={isLoading} className="mt-2 w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2">
                                {isLoading ? <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <span className="material-symbols-outlined text-lg">save</span>}
                                Crear Usuario
                            </button>
                        </form>
                    </div>
                </div>

                {/* Lista de Usuarios */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm min-h-[500px] flex flex-col">
                        <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">Directorio de Empleados</h3>
                            <span className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded text-slate-500 font-bold">{recentUsers.length} Miembros</span>
                        </div>

                        {isFetching ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-20 animate-pulse">
                                <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                                <p className="text-slate-400 text-sm font-medium tracking-wide">Sincronizando con PostgreSQL...</p>
                            </div>
                        ) : recentUsers.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-20">
                                <span className="material-symbols-outlined text-slate-200 dark:text-slate-800 text-6xl mb-4">person_search</span>
                                <p className="text-slate-400 font-bold">No se encontraron usuarios activos.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-950 text-[10px] uppercase text-slate-400 font-black">
                                        <tr>
                                            <th className="px-6 py-4">Empleado</th>
                                            <th className="px-6 py-4">Rol</th>
                                            <th className="px-6 py-4 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {recentUsers.map((u, i) => (
                                            <tr key={u.id || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-800 bg-cover bg-center border border-slate-100 dark:border-slate-700 shadow-sm" style={{ backgroundImage: `url(${u.avatar})` }} />
                                                        <div>
                                                            <p className="font-bold text-slate-900 dark:text-white text-sm">{u.name}</p>
                                                            <p className="text-xs text-slate-500">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${u.role === 'Admin' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button 
                                                            onClick={() => handleOpenEdit(u)}
                                                            className="size-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"
                                                        >
                                                            <span className="material-symbols-outlined text-xl">edit</span>
                                                        </button>
                                                        <button 
                                                            onClick={() => setUserToDelete(u)}
                                                            className="size-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                                        >
                                                            <span className="material-symbols-outlined text-xl">delete</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de Edición de Usuario */}
            {userToEdit && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Editar Usuario</h2>
                            <button onClick={() => setUserToEdit(null)} className="size-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSaveEdit} className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-slate-500 ml-1 tracking-widest">Nombre del Empleado</label>
                                <input 
                                    className="w-full rounded-2xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm p-4 focus:ring-4 focus:ring-primary/10 transition-all" 
                                    value={editFormData.name} 
                                    onChange={e => setEditFormData({ ...editFormData, name: e.target.value })} 
                                    required 
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-slate-500 ml-1 tracking-widest">Email Corporativo</label>
                                <input 
                                    className="w-full rounded-2xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm p-4 focus:ring-4 focus:ring-primary/10 transition-all" 
                                    value={editFormData.email} 
                                    onChange={e => setEditFormData({ ...editFormData, email: e.target.value })} 
                                    type="email" 
                                    required 
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-slate-500 ml-1 tracking-widest">Nueva Contraseña (Opcional)</label>
                                <input 
                                    className="w-full rounded-2xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm p-4 focus:ring-4 focus:ring-primary/10 transition-all" 
                                    value={editFormData.password} 
                                    onChange={e => setEditFormData({ ...editFormData, password: e.target.value })} 
                                    type="password"
                                    placeholder="Dejar en blanco para mantener la actual"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-slate-500 ml-1 tracking-widest">Nivel de Acceso (Rol)</label>
                                <select 
                                    className="w-full rounded-2xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm p-4 focus:ring-4 focus:ring-primary/10 transition-all" 
                                    value={editFormData.role} 
                                    onChange={e => setEditFormData({ ...editFormData, role: e.target.value })}
                                >
                                    <option value="Analyst">Analista</option>
                                    <option value="Supervisor">Supervisor</option>
                                    <option value="Manager">Gerente</option>
                                    <option value="Admin">Administrador</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                                <button 
                                    type="button" 
                                    onClick={() => setUserToEdit(null)}
                                    className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                                >
                                    Descartar
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isUpdating}
                                    className="flex-1 py-4 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                >
                                    {isUpdating ? <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Confirmación de Eliminación */}
            {userToDelete && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 text-center animate-in zoom-in-95 duration-200">
                        <div className="size-20 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mb-6 mx-auto">
                            <span className="material-symbols-outlined text-4xl">warning</span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">¿Eliminar Usuario?</h2>
                        <p className="text-slate-500 text-sm mb-8">
                            Estás a punto de borrar a <strong>{userToDelete.name}</strong>. Esta acción no se puede deshacer y el usuario perderá acceso inmediato.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={handleConfirmDelete}
                                disabled={isDeleting}
                                className="w-full py-4 bg-red-500 text-white font-black rounded-2xl shadow-lg shadow-red-500/20 hover:bg-red-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                {isDeleting ? (
                                    <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-lg">delete_forever</span>
                                        Confirmar Eliminación
                                    </>
                                )}
                            </button>
                            <button 
                                onClick={() => setUserToDelete(null)}
                                disabled={isDeleting}
                                className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <p className="mt-8 text-[11px] text-slate-400 text-center italic">Conectado a SmartTitan PostgreSQL Relay • ID Subcuenta: g8s...bu</p>
        </div>
    );
};
