import { API_URL, fetchWithAuth } from './auth';

export interface AsignacionResponse {
  id: number;
  dni: string;
  activity_id: number;
  role_id: number;
  day: string;
  start_time: string;
  end_time: string;
  role: string;
  person: string;
  activity: string;
}

// Sencillo cache en memoria con TTL y deduplicación de requests en vuelo
let asignacionesCache: AsignacionResponse[] | null = null;
let asignacionesCacheAt = 0;
const ASIGNACIONES_TTL_MS = 15000; // 15s
let inflightAsignaciones: Promise<AsignacionResponse[]> | null = null;

export function invalidateAsignacionesCache() {
  asignacionesCache = null;
  asignacionesCacheAt = 0;
}

// Obtener todas las asignaciones
export async function getAsignaciones(): Promise<AsignacionResponse[]> {
  const now = Date.now();
  if (asignacionesCache && now - asignacionesCacheAt < ASIGNACIONES_TTL_MS) {
    return asignacionesCache;
  }
  if (inflightAsignaciones) {
    return inflightAsignaciones;
  }
  inflightAsignaciones = (async () => {
    const response = await fetchWithAuth(`${API_URL}/asignations`);
    if (!response.ok) {
      inflightAsignaciones = null;
      throw new Error('Error al obtener asignaciones');
    }
    const data = await response.json();
    asignacionesCache = data;
    asignacionesCacheAt = Date.now();
    inflightAsignaciones = null;
    return data;
  })();
  return inflightAsignaciones;
}

// Obtener asignaciones por DNI de persona
export async function getAsignacionesByPersona(dni: string): Promise<AsignacionResponse[]> {
  const asignaciones = await getAsignaciones();
  return asignaciones.filter(a => a.dni === dni);
}

// Obtener asignaciones de alumnos para una actividad específica
export async function getAlumnosDeActividad(activityId: number): Promise<AsignacionResponse[]> {
  const asignaciones = await getAsignaciones();
  return asignaciones.filter(a => {
    if (a.activity_id !== activityId) return false;
    const r = a.role.toLowerCase();
    return r === 'socio' || r === 'no socio';
  });
}

// Obtener asignaciones por actividad
export async function getAsignacionesByActividad(activityId: number): Promise<AsignacionResponse[]> {
  const asignaciones = await getAsignaciones();
  return asignaciones.filter(a => a.activity_id === activityId);
}

// Crear nueva asignación
export async function createAsignacion(asignacion: {
  dni: string;
  activity_id: number;
  role_id: number;
  day: string;
  start_time: string;
  end_time: string;
}): Promise<AsignacionResponse> {
  // Backend espera datos en request.form, no JSON. Enviamos como FormData
  const toHHMMSS = (t: string) => (/^\d{2}:\d{2}$/.test(t) ? `${t}:00` : t);
  const formData = new FormData();
  formData.append('dni', asignacion.dni);
  formData.append('activity_id', String(asignacion.activity_id));
  formData.append('role_id', String(asignacion.role_id));
  formData.append('day', asignacion.day);
  formData.append('start_time', toHHMMSS(asignacion.start_time));
  formData.append('end_time', toHHMMSS(asignacion.end_time));

  const response = await fetchWithAuth(`${API_URL}/asignations/`, {
    method: 'POST',
    // No establecer Content-Type manualmente para que el navegador defina el boundary de multipart/form-data
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Error al crear asignación');
  }
  
  const created = await response.json();
  invalidateAsignacionesCache();
  return created;
}

// Eliminar todas las asignaciones de una actividad
export async function deleteAsignacionesByActividad(activityId: number): Promise<void> {
  const asignaciones = await getAsignacionesByActividad(activityId);
  
  for (const asignacion of asignaciones) {
    const response = await fetchWithAuth(`${API_URL}/asignations/${asignacion.id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Error al eliminar asignación');
    }
  }
  invalidateAsignacionesCache();
}