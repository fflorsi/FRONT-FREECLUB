import { fetchWithAuth } from './auth';
import { API_URL } from './config';

export interface ActividadResponse {
  id: number;
  name: string;
  category: string;
}

export type Actividad = ActividadResponse;

// Obtener todas las actividades
export async function getActividades(): Promise<ActividadResponse[]> {
  const response = await fetchWithAuth(`${API_URL}/activities`);
  if (!response.ok) {
    throw new Error('Error al obtener actividades');
  }
  return response.json();
}

// Obtener una actividad específica
export async function getActividad(id: number): Promise<ActividadResponse> {
  const response = await fetchWithAuth(`${API_URL}/activities/${id}`);
  if (!response.ok) {
    throw new Error('Error al obtener actividad');
  }
  return response.json();
}

export async function createActividad(actividad: Omit<Actividad, 'id'>): Promise<Actividad> {
  // Backend recibe request.form en POST /activities/
  const formData = new FormData();
  formData.append('name', actividad.name);
  formData.append('category', actividad.category);
  const response = await fetchWithAuth(`${API_URL}/activities/`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Error al crear actividad');
  }
  
  return response.json();
}

// Actualizar actividad
export async function updateActividad(id: number, actividad: Partial<Actividad>): Promise<Actividad> {
  // Backend lee request.args en PUT, por lo que enviamos datos como query string
  const params = new URLSearchParams();
  if (actividad.name) params.append('name', actividad.name);
  if (actividad.category) params.append('category', actividad.category);
  const url = `${API_URL}/activities/${id}?${params.toString()}`;
  const response = await fetchWithAuth(url, { method: 'PUT' });
  
  if (!response.ok) {
    throw new Error('Error al actualizar actividad');
  }
  
  return response.json();
}

// Eliminar actividad (baja lógica)
export async function deleteActividad(id: number): Promise<void> {
  const response = await fetchWithAuth(`${API_URL}/activities/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Error al eliminar actividad');
  }
}