import { RoleResponse } from './roles';
import { fetchWithAuth } from "./auth";

const API_URL = "http://localhost:5000";
export interface PersonaResponse {
  dni: string;
  name: string;
  lastname: string;
  cuit?: string;
  email: string;
  phone?: string;
  address?: string;
  address_details?: string;
  birthdate?: string;
  medical_coverage?: string;
  blood_type?: string;
  medical_conditions?: string;
  emergency_phone?: string;
  emergency_relation?: string;
  join_date?: string;
  roles: string[];
  member: boolean;
}

export async function getPersonas(): Promise<PersonaResponse[]> {
  const response = await fetchWithAuth(`${API_URL}/persons`);
  if (!response.ok) throw new Error('No se pudieron obtener las personas');
  return response.json();
}

export async function fetchPersonas() {
  const response = await fetchWithAuth(`${API_URL}/persons`);
  if (!response.ok) throw new Error('No se pudieron obtener las personas');
  return response.json();
}

export async function fetchPersonaPorDni(dni: string) {
  const response = await fetchWithAuth(`${API_URL}/persons/${dni}`);
  if (!response.ok) throw new Error('No se pudo obtener la persona');
  return response.json();
}

export async function crearPersona(persona: {
  dni: string;
  name: string;
  lastname: string;
  cuit?: string;
  email: string;
  phone?: string;
  address?: string;
  address_details?: string;
  birthdate?: string;
  medical_coverage?: string;
  blood_type?: string;
  medical_conditions?: string;
  emergency_phone?: string;
  emergency_relation?: string;
  join_date?: string;
  roles: number[]; // id del rol
  member?: boolean;
}) {
   const formData = new FormData();
  Object.entries(persona).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (key === "roles" && Array.isArray(value)) {
        value.forEach((rol: number) => formData.append("roles", String(rol)));
      } else {
        formData.append(key, value as string);
      }
    }
  });

  const response = await fetchWithAuth(`${API_URL}/persons/`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error('No se pudo crear la persona');
  return response.json();
}

export async function editarPersona(dni: string, personaData: Record<string, unknown>): Promise<unknown> {
  const formData = new FormData();
  Object.entries(personaData).forEach(([key, value]) => {
    if (key === "roles" && Array.isArray(value)) {
      value.forEach((rol: number) => formData.append("roles", String(rol)));
    } else {
      formData.append(key, value !== undefined && value !== null ? String(value) : "");
    }
  });

  const response = await fetchWithAuth(`${API_URL}/persons/${dni}`, {
    method: "PUT",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Error al editar la persona");
  }

  return response.json();
}