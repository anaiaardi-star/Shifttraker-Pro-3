
import React, { useState, useEffect, useMemo } from 'react';
import { ApiService, Shift } from '../services/api';

export const Reports = () => {
    const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
    const [loading, setLoading] = useState(false);
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    
    // Estados para filtro de fecha
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await ApiService.fetchAllReports();
            const sorted = [...data].sort((a, b) => {
                const dateA = new Date(a.rawDate).getTime();
                const dateB = new Date(b.rawDate).getTime();
                return isNaN(dateB) ? 1 : dateB - dateA;
            });
            setShifts(sorted);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredShifts = useMemo(() => {
        return shifts.filter(s => {
            const matchesSearch = s.userName.toLowerCase().includes(searchTerm.toLowerCase());
            
            // Filtro de estado
            const matchesStatus = statusFilter === 'all' || 
                (statusFilter === 'active' ? s.isInProgress : !s.isInProgress);
            
            // Filtro de rango de fechas
            let matchesDate = true;
            if (s.rawDate) {
                const shiftDate = new Date(s.rawDate);
                shiftDate.setHours(0, 0, 0, 0); // Normalizar a medianoche para comparación exacta de días

                if (startDate) {
                    const start = new Date(startDate);
                    start.setHours(0, 0, 0, 0);
                    if (shiftDate < start) matchesDate = false;
                }
                if (endDate) {
                    const end = new Date(endDate);
                    end.setHours(0, 0, 0, 0);
                    if (shiftDate > end) matchesDate = false;
                }
            }

            return matchesSearch && matchesStatus && matchesDate;
        });
    }, [shifts, searchTerm, statusFilter, startDate, endDate]);

    const getPointLink = (lat?: number, lng?: number) => {
        if (!lat || !lng) return '';
        const cleanLat = String(lat).trim();
        const cleanLng = String(lng).trim();
        return `https://www.google.com/maps/@${cleanLat},${cleanLng},16z`;
    };

    // Función de exportación a CSV
    const handleExport = () => {
        if (filteredShifts.length === 0) {
            alert("No hay datos para exportar con los filtros actuales.");
            return;
        }

        const headers = [
            "Empleado", "Rol", "Email", "Fecha Inicio", "Hora Inicio", 
            "Fecha Fin", "Hora Fin", "Duracion", "Segundos", "Estado", 
            "Comentario Inicio", "Comentario Fin"
        ];

        const csvRows = filteredShifts.map(s => [
            `"${s.userName}"`,
            `"${s.userRole}"`,
            `"${s.userEmail}"`,
            `"${s.date}"`,
            `"${s.startTime}"`,
            `"${s.endDate}"`,
            `"${s.endTime}"`,
            `"${s.duration}"`,
            s.seconds,
            `"${s.status}"`,
            `"${(s.comment_start || "").replace(/"/g, '""')}"`,
            `"${(s.comment_end || "").replace(/"/g, '""')}"`
        ]);

        const csvContent = [
            headers.join(","),
            ...csvRows.map(row => row.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Reporte_ShiftTrack_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex-1 w-full max-w-[1200px] mx-auto px-6 md:px-10 py-8 relative animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-6 mb-8">
                <div className="flex min-w-72 flex-col gap-2">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">analytics</span>
                            Análisis Operativo
                        </span>
                    </div>
                    <p className="text-slate-900 dark:text-white text-4xl font-black tracking-tight">Reportes de Actividad</p>
                    <p className="text-slate-500 dark:text-slate-400 text-base font-normal">Historial centralizado con geolocalización.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleExport} 
                        className="flex items-center justify-center rounded-xl h-11 px-6 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-all"
                    >
                        <span className="material-symbols-outlined mr-2 text-xl">download</span>
                        Exportar CSV
                    </button>
                    <button onClick={loadData} disabled={loading} className="flex items-center justify-center rounded-xl h-11 px-6 bg-primary text-white text-sm font-bold shadow-lg hover:scale-105 transition-all">
                        <span className={`material-symbols-outlined mr-2 text-xl ${loading ? 'animate-spin' : ''}`}>refresh</span>
                        Actualizar
                    </button>
                </div>
            </div>

            {/* FILTROS AVANZADOS */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm mb-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Buscador de Usuario */}
                    <div className="md:col-span-2 relative">
                        <label className="text-[10px] font-bold uppercase text-slate-400 ml-1 mb-1 block tracking-widest">Buscar Empleado</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                            <input 
                                type="text" 
                                placeholder="Escribe un nombre..." 
                                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-4 focus:ring-primary/10 transition-all shadow-sm" 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                            />
                        </div>
                    </div>

                    {/* Selector de Estado */}
                    <div className="relative">
                        <label className="text-[10px] font-bold uppercase text-slate-400 ml-1 mb-1 block tracking-widest">Estado</label>
                        <select 
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm shadow-sm focus:ring-4 focus:ring-primary/10" 
                            value={statusFilter} 
                            onChange={e => setStatusFilter(e.target.value)}
                        >
                            <option value="all">Todos</option>
                            <option value="active">En curso</option>
                            <option value="completed">Finalizados</option>
                        </select>
                    </div>

                    {/* Botón para Limpiar */}
                    <div className="flex items-end">
                        <button 
                            onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('all');
                                setStartDate('');
                                setEndDate('');
                            }}
                            className="w-full py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
                        >
                            Limpiar Filtros
                        </button>
                    </div>
                </div>

                {/* Filtro de Fechas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400 ml-1 tracking-widest">Desde la Fecha</label>
                        <input 
                            type="date" 
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm shadow-sm focus:ring-4 focus:ring-primary/10" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400 ml-1 tracking-widest">Hasta la Fecha</label>
                        <input 
                            type="date" 
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm shadow-sm focus:ring-4 focus:ring-primary/10" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* LISTA DE REPORTES */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden mb-8">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 dark:bg-slate-950 text-[10px] uppercase text-slate-400 font-black">
                            <tr>
                                <th className="px-8 py-5">Nombre / Rol</th>
                                <th className="px-8 py-5 text-center">Inicio</th>
                                <th className="px-8 py-5 text-center">Fin</th>
                                <th className="px-8 py-5 text-right">Duración Total</th>
                                <th className="px-8 py-5 text-center">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr><td colSpan={5} className="py-24 text-center text-slate-400 animate-pulse font-bold tracking-widest">CARGANDO DATOS...</td></tr>
                            ) : filteredShifts.length === 0 ? (
                                <tr><td colSpan={5} className="py-24 text-center text-slate-400 font-bold italic">No se encontraron registros coincidentes.</td></tr>
                            ) : (
                                filteredShifts.map((s, i) => (
                                    <tr key={s.id || i} onClick={() => setSelectedShift(s)} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all group">
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-black text-slate-900 dark:text-white text-sm">{s.userName}</span>
                                                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{s.userRole}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-slate-900 dark:text-slate-200">{s.startTime}</span>
                                                <span className="text-[9px] text-slate-400 font-bold">{s.date}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-slate-900 dark:text-slate-200">{s.endTime || '---'}</span>
                                                {s.endDate !== '---' && <span className="text-[9px] text-slate-400 font-bold">{s.endDate}</span>}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right font-black text-xs text-primary">{s.duration}</td>
                                        <td className="px-8 py-5 text-center">
                                            {s.isInProgress ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success text-[10px] font-black uppercase">
                                                    <span className="size-1.5 bg-success rounded-full animate-pulse"></span>
                                                    En curso
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-black uppercase">
                                                    Finalizado
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* DETALLE DEL ITEM (MODAL) */}
            {selectedShift && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-8 bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined text-3xl">person</span>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-1">{selectedShift.userName}</h2>
                                    <p className="text-[10px] font-black uppercase text-primary tracking-widest">{selectedShift.userRole}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedShift(null)} className="size-12 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800 text-slate-400 hover:text-danger border border-slate-200 dark:border-slate-700 transition-all">
                                <span className="material-symbols-outlined text-2xl">close</span>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                            
                            {/* BLOQUE 1 - FECHA Y HORA DE INICIO */}
                            <div className="bg-slate-50 dark:bg-slate-800/30 rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden">
                                <div className="bg-primary px-8 py-4">
                                    <span className="text-white text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">login</span>
                                        BLOQUE 1 - FECHA Y HORA DE INICIO
                                    </span>
                                </div>
                                <div className="p-8 space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Fecha de inicio</label>
                                            <p className="text-sm font-black text-slate-900 dark:text-white">{selectedShift.date}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Hora de inicio</label>
                                            <p className="text-2xl font-black text-primary">{selectedShift.startTime}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">ISO Timestamp de Inicio</label>
                                        <p className="text-xs font-mono text-slate-600 dark:text-slate-300 break-all bg-white dark:bg-slate-950 p-3 rounded-xl border dark:border-slate-800">
                                            {selectedShift.rawDate}
                                        </p>
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        {getPointLink(selectedShift.latitude, selectedShift.longitude) !== '' && (
                                            <a href={getPointLink(selectedShift.latitude, selectedShift.longitude)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all shadow-sm">
                                                <span className="material-symbols-outlined text-lg">location_on</span>
                                                Ubicación de Inicio
                                            </a>
                                        )}
                                    </div>
                                    <div className="space-y-2 border-t dark:border-slate-700 pt-4">
                                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[12px]">chat</span> Comentario de inicio
                                        </label>
                                        <p className="text-sm italic text-slate-700 dark:text-slate-400 bg-white dark:bg-slate-900 p-4 rounded-xl border dark:border-slate-700 min-h-[60px]">
                                            {selectedShift.comment_start || "Sin comentarios registrados al iniciar."}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* BLOQUE 2 - FECHA Y HORA FINAL */}
                            <div className="bg-slate-50 dark:bg-slate-800/30 rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden">
                                <div className="bg-slate-900 dark:bg-slate-700 px-8 py-4">
                                    <span className="text-white text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">logout</span>
                                        BLOQUE 2 - FECHA Y HORA FINAL
                                    </span>
                                </div>
                                <div className="p-8 space-y-6">
                                    {selectedShift.isInProgress ? (
                                        <div className="py-12 text-center bg-success/5 border border-success/10 rounded-2xl flex flex-col items-center gap-3">
                                            <span className="material-symbols-outlined text-4xl text-success animate-pulse">timer</span>
                                            <span className="text-success text-xs font-black uppercase tracking-widest">Este turno se encuentra en curso actualmente</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Fecha de finalización</label>
                                                    <p className="text-sm font-black text-slate-900 dark:text-white">{selectedShift.endDate}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Hora final</label>
                                                    <p className="text-2xl font-black text-slate-900 dark:text-white">{selectedShift.endTime}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">ISO Timestamp de Finalización</label>
                                                <p className="text-xs font-mono text-slate-600 dark:text-slate-300 break-all bg-white dark:bg-slate-950 p-3 rounded-xl border dark:border-slate-800">
                                                    {selectedShift.rawEndTime || '---'}
                                                </p>
                                            </div>
                                            <div className="flex justify-end pt-2">
                                                {getPointLink(selectedShift.latitude_end, selectedShift.longitude_end) !== '' && (
                                                    <a href={getPointLink(selectedShift.latitude_end, selectedShift.longitude_end)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-slate-200 dark:bg-slate-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 hover:bg-slate-900 dark:hover:bg-white dark:hover:text-slate-900 transition-all shadow-sm">
                                                        <span className="material-symbols-outlined text-lg">pin_drop</span>
                                                        Ubicación de Salida
                                                    </a>
                                                )}
                                            </div>
                                            <div className="space-y-2 border-t dark:border-slate-700 pt-4">
                                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[12px]">chat</span> Comentario final
                                                </label>
                                                <p className="text-sm italic text-slate-700 dark:text-slate-400 bg-white dark:bg-slate-900 p-4 rounded-xl border dark:border-slate-700 min-h-[60px]">
                                                    {selectedShift.comment_end || "Sin comentarios registrados al finalizar."}
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* BLOQUE 3 - DURACIÓN Y ESTADO */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-primary p-6 rounded-[2rem] text-center shadow-lg shadow-primary/20 flex flex-col justify-center">
                                    <label className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1 block">Duración Total</label>
                                    <p className="text-3xl font-black text-white">{selectedShift.duration}</p>
                                </div>
                                <div className={`p-6 rounded-[2rem] text-center shadow-lg flex flex-col justify-center border-2 ${selectedShift.isInProgress ? 'bg-success/5 border-success text-success' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'}`}>
                                    <label className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1 block">Estado de Jornada</label>
                                    <p className="text-xl font-black uppercase tracking-tight">{selectedShift.status || (selectedShift.isInProgress ? 'En curso' : 'Cerrado')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-8 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
                            <button onClick={() => setSelectedShift(null)} className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl hover:bg-primary/90 transition-all uppercase text-xs tracking-widest">
                                Cerrar Registro Detallado
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <p className="mt-8 text-[11px] text-slate-400 text-center italic">Conectado a SmartTitan PostgreSQL Relay • Exportación disponible en formato estándar CSV</p>
        </div>
    );
};
