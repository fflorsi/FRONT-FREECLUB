import { fetchWithAuth } from "./auth";
import { API_URL } from "./config";


export interface RoleResponse {
  id: number;
  name: string;
}

export async function getRoles(): Promise<RoleResponse[]> {
  const response = await fetchWithAuth(`${API_URL}/roles`);
  if (!response.ok) throw new Error('No se pudieron obtener los roles');
  return response.json();
}

export async function fetchRoles() {
  const response = await fetchWithAuth(`${API_URL}/roles`);
  if (!response.ok) throw new Error('No se pudieron obtener los roles');
  return response.json();
}