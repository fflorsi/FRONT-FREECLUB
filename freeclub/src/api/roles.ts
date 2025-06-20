export const API_URL = "http://localhost:5000";

export async function fetchRoles() {
  const response = await fetch(`${API_URL}/roles`);
  if (!response.ok) throw new Error('No se pudieron obtener los roles');
  return response.json();
}