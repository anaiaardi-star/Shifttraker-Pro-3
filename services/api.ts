
import { Page } from '../App';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
  location?: string;
}

export interface Shift {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  userEmail: string;
  userAvatar?: string;
  date: string;
  endDate: string; // Nueva propiedad
  rawDate: string; 
  startTime: string;
  endTime: string;
  rawEndTime?: string;
  duration: string;
  seconds: number;
  status: string;
  isInProgress: boolean;
  color: string;
  comment_start?: string;
  comment_end?: string;
  latitude?: number;
  longitude?: number;
  latitude_end?: number;
  longitude_end?: number;
}

const AUTH_KEY = 'shifttrack_auth_user';
const ACTIVE_SESSION_KEY = 'shifttrack_active_session_v1';

const WEBHOOKS = {
  REGISTRO: 'https://n8n.smarttitan.pro/webhook/ShiftTrack-registro',
  LOGIN: 'https://n8n.smarttitan.pro/webhook/ShiftTrack-login',
  INFO_USUARIO: 'https://n8n.smarttitan.pro/webhook/ShiftTrack-cargadeinformacion',
  INICIO_TURNO: 'https://n8n.smarttitan.pro/webhook/ShiftTrack-horadeinicio',
  FIN_TURNO: 'https://n8n.smarttitan.pro/webhook/ShiftTrack-horafinal',
  HISTORIAL_DATOS: 'https://n8n.smarttitan.pro/webhook/ShiftTrack-cargadedatos',
  CARGAR_USUARIOS: 'https://n8n.smarttitan.pro/webhook/ShiftTrack-cargarusuario',
  ELIMINAR_USUARIO: 'https://n8n.smarttitan.pro/webhook/ShiftTrack-eliminarusuario',
  EDITAR_USUARIO: 'https://n8n.smarttitan.pro/webhook/ShiftTrack-editarusuario'
};

const normalizeListResponse = (rawData: any): any[] => {
  if (!rawData) return [];
  if (Array.isArray(rawData)) {
    return rawData.map(item => item.json || item);
  }
  const keys = ['data', 'rows', 'users', 'shifts', 'items', 'output'];
  for (const key of keys) {
    if (Array.isArray(rawData[key])) return rawData[key].map((item: any) => item.json || item);
  }
  return [];
};

export const ApiService = {
  getCurrentUser: (): User | null => {
    try {
      const data = localStorage.getItem(AUTH_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) { return null; }
  },

  logout: () => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(ACTIVE_SESSION_KEY);
  },

  loginUser: async (credentials: { email: string; password: string }): Promise<User> => {
    const response = await fetch(WEBHOOKS.LOGIN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...credentials, id_subcuenta: 'g8sHsrNpqDlOhgAtQLbu' }),
    });

    const rawData = await response.json();
    console.log('RESPUESTA_LOGIN', rawData);

    if (rawData.status === 'error' || rawData.error === true) {
      throw new Error(rawData.message || "Credenciales inválidas.");
    }

    const list = normalizeListResponse(rawData);
    const data = list.length > 0 ? list[0] : rawData;

    if (!data || (!data.id && !data.user_id && !data.email)) {
       if (!data.email && !credentials.email) {
         throw new Error("Respuesta del servidor incompleta.");
       }
    }

    const user: User = {
      id: (data.id || data.user_id || Date.now().toString()).toString(),
      name: data.nombre || data.name || data.user_name || credentials.email.split('@')[0],
      email: data.email || credentials.email,
      role: data.rol || data.role || 'User',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.nombre || data.name || 'User')}&background=random`
    };

    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    return user;
  },

  registerUserReal: async (userData: any): Promise<User> => {
    const response = await fetch(WEBHOOKS.REGISTRO, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...userData, id_subcuenta: 'g8sHsrNpqDlOhgAtQLbu' }),
    });
    const rawData = await response.json();
    const list = normalizeListResponse(rawData);
    const data = list[0] || rawData;
    
    const user: User = {
      id: (data.id || data.user_id || Date.now().toString()).toString(),
      name: data.nombre || data.name || data.user_name || userData.name || 'Usuario',
      email: data.email || userData.email,
      role: data.rol || data.role || userData.role || 'User',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.nombre || userData.name || 'User')}&background=random`
    };
    
    if (!localStorage.getItem(AUTH_KEY)) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    }
    
    return user;
  },

  startShift: async (user: User, locationData?: { lat: number; lng: number }, comment?: string) => {
    const now = new Date();
    await fetch(WEBHOOKS.INICIO_TURNO, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        email: user.email,
        timestamp_start: now.toISOString(),
        id_subcuenta: 'g8sHsrNpqDlOhgAtQLbu',
        latitude: locationData?.lat || null,
        longitude: locationData?.lng || null,
        comentario_inicio: comment || ""
      }),
    });
    const result = { 
      iso: now.toISOString(), 
      displayTime: now.toLocaleTimeString("en-US", { timeZone: "America/New_York", hour12: false }), 
      displayDate: now.toLocaleDateString("en-US", { timeZone: "America/New_York" }) 
    };
    localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(result));
    return { ...result, miamiDisplayTime: result.displayTime, miamiDisplayDate: result.displayDate, iso: now };
  },

  getActiveSession: () => {
    const data = localStorage.getItem(ACTIVE_SESSION_KEY);
    try { return data ? JSON.parse(data) : null; } catch (e) { return null; }
  },

  endShift: async (shiftData: any, locationData?: { lat: number; lng: number }, commentEnd?: string) => {
    await fetch(WEBHOOKS.FIN_TURNO, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        ...shiftData, 
        latitude_end: locationData?.lat || null,
        longitude_end: locationData?.lng || null,
        comentario_final: commentEnd || "",
        id_subcuenta: 'g8sHsrNpqDlOhgAtQLbu' 
      }),
    });
    localStorage.removeItem(ACTIVE_SESSION_KEY);
    return true;
  },

  fetchAllReports: async (): Promise<Shift[]> => {
    try {
      const response = await fetch(WEBHOOKS.HISTORIAL_DATOS, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request: 'get_all', id_subcuenta: 'g8sHsrNpqDlOhgAtQLbu' }) 
      });
      const rawData = await response.json();
      const list = normalizeListResponse(rawData);
      
      return list.map((data: any) => {
         const startRaw = data.start_time || data.timestamp_start || data.fecha;
         const endRaw = data.end_time || data.timestamp_end || null;
         const status = data.status || "";
         const isCerrado = status.toLowerCase() === 'cerrado' || status.toLowerCase() === 'completed';

         const formatTime = (val: any) => {
            if (!val || val === "0" || val === "") return "";
            if (typeof val === 'string' && /^\d{2}:\d{2}/.test(val) && val.length < 10) {
                return val.substring(0, 5);
            }
            const d = new Date(val);
            if (isNaN(d.getTime())) {
                const match = String(val).match(/\d{2}:\d{2}/);
                return match ? match[0] : "";
            }
            return d.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit', 
              hour12: false, 
              timeZone: 'America/New_York' 
            });
         };

         const startTimeFormatted = formatTime(startRaw);
         const endTimeFormatted = (isCerrado && isNaN(Number(endRaw))) ? formatTime(endRaw) : (isCerrado ? "Cerrado" : "");

         const formatDate = (val: any) => {
            if (!val || isNaN(new Date(val).getTime())) return "";
            return new Date(val).toLocaleDateString('es-ES');
         };

         const name = data.user_name || data.nombre || data.name || 'Sin nombre';

         return {
            id: (data.id || Math.random().toString(36).substr(2, 9)).toString(),
            userId: (data.user_id || '').toString(),
            userName: name,
            userRole: data.user_role || data.rol || data.role || 'Sin rol',
            userEmail: data.user_email || data.email || '',
            userAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
            date: formatDate(startRaw) || (data.fecha || '---'),
            endDate: isCerrado ? (formatDate(endRaw) || '---') : '---',
            rawDate: startRaw, 
            startTime: startTimeFormatted,
            endTime: endTimeFormatted,
            rawEndTime: endRaw,
            duration: data.duration || '00:00:00',
            seconds: Number(data.seconds) || 0,
            status: status,
            isInProgress: !isCerrado,
            color: 'bg-primary/10 text-primary',
            comment_start: data.comentario_inicio || "",
            comment_end: data.comentario_fin || "",
            latitude: Number(data.latidude || data.latitude) || undefined,
            longitude: Number(data.longitude) || undefined,
            latitude_end: Number(data.latidude_final || data.latitude_end) || undefined,
            longitude_end: Number(data.longitude_final || data.longitude_end) || undefined
         };
      });
    } catch (e) { 
        console.error("Error fetching reports", e);
        return []; 
    }
  },

  fetchUsers: async (): Promise<User[]> => {
     try {
       const response = await fetch(WEBHOOKS.CARGAR_USUARIOS, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ request: 'get_all_users', id_subcuenta: 'g8sHsrNpqDlOhgAtQLbu' })
       });
       const rawData = await response.json();
       const list = normalizeListResponse(rawData);
       return list.map((data: any, index: number) => {
         const name = data.nombre || data.name || data.user_name || data.email || `Usuario ${index + 1}`;
         return {
            id: (data.id || data.user_id || `u-${index}`).toString(),
            name,
            email: data.email || data.user_email || '',
            role: data.rol || data.role || 'Analyst',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
         };
       });
     } catch (e) { return []; }
  },

  deleteUser: async (user: User): Promise<boolean> => {
    try {
      const response = await fetch(WEBHOOKS.ELIMINAR_USUARIO, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...user, action: 'delete', id_subcuenta: 'g8sHsrNpqDlOhgAtQLbu' })
      });
      return response.ok;
    } catch (error) { return false; }
  },

  updateUser: async (user: User, newValues: any): Promise<boolean> => {
    try {
      const response = await fetch(WEBHOOKS.EDITAR_USUARIO, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: user.id,
          user_id: user.id,
          ...newValues, 
          id_subcuenta: 'g8sHsrNpqDlOhgAtQLbu' 
        })
      });
      return response.ok;
    } catch (error) { 
      return false; 
    }
  },

  getUserProfile: async (email: string): Promise<Partial<User>> => {
    try {
      const response = await fetch(WEBHOOKS.INFO_USUARIO, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, id_subcuenta: 'g8sHsrNpqDlOhgAtQLbu' })
      });
      const rawData = await response.json();
      const list = normalizeListResponse(rawData);
      const data = list[0] || rawData;
      return {
        id: (data.id || data.user_id || '').toString(),
        name: data.nombre || data.name || data.user_name,
        email: data.email || email,
        role: data.rol || data.role,
        avatar: data.avatar,
        phone: data.phone || data.telefono
      };
    } catch (e) { return {}; }
  },

  getEndpoints: () => WEBHOOKS
};
