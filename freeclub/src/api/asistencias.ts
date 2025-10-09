import { API_URL, fetchWithAuth } from './auth';

export interface AsistenciaBackend {
  id?: number;
  person_dni: string;
  supervisor_dni: string;
  assignation_id: number;
  user_id: number;
  status: number; // 0=ausente, 1=presente, 2=justificada
  day: string; // DD/MM/YYYY
}

export interface AsistenciaResponse {
  id: number;
  person_dni: string;
  supervisor_dni: string;
  assignation_id: number;
  user_id: number;
  status: number;
  day: string;
  person: string;
  supervisor: string;
  user: number;
  assignation: number;
}

// Obtener todas las asistencias
export async function getAsistencias(): Promise<AsistenciaResponse[]> {
  const response = await fetchWithAuth(`${API_URL}/attendancies`);
  if (!response.ok) {
    throw new Error('Error al obtener asistencias');
  }
  return response.json();
}

// Crear nueva asistencia
export async function createAsistencia(asistencia: AsistenciaBackend): Promise<AsistenciaResponse> {
  const formData = new FormData();
  formData.append('person_dni', asistencia.person_dni);
  formData.append('supervisor_dni', asistencia.supervisor_dni);
  formData.append('assignation_id', asistencia.assignation_id.toString());
  formData.append('user_id', asistencia.user_id.toString());
  formData.append('status', asistencia.status.toString());
  formData.append('day', asistencia.day);

  const response = await fetchWithAuth(`${API_URL}/attendancies/`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al crear asistencia');
  }
  
  return response.json();
}

// Actualizar asistencia existente
export async function updateAsistencia(id: number, asistencia: Partial<AsistenciaBackend>): Promise<AsistenciaResponse> {
  const formData = new FormData();
  
  if (asistencia.person_dni) formData.append('person_dni', asistencia.person_dni);
  if (asistencia.supervisor_dni) formData.append('supervisor_dni', asistencia.supervisor_dni);
  if (asistencia.assignation_id) formData.append('assignation_id', asistencia.assignation_id.toString());
  if (asistencia.user_id) formData.append('user_id', asistencia.user_id.toString());
  if (asistencia.status !== undefined) formData.append('status', asistencia.status.toString());

  const response = await fetchWithAuth(`${API_URL}/attendancies/${id}`, {
    method: 'PUT',
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al actualizar asistencia');
  }
  
  return response.json();
}