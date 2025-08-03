import { Usuario } from "../types/index.ts";
import { fetchWithAuth } from "./auth";

export const API_URL = "http://localhost:5000"; // o el puerto donde corre Flask


export async function fetchUsuarios() {
  const response = await fetchWithAuth(`${API_URL}/users`);
  if (!response.ok) throw new Error('No se pudieron obtener los usuarios');
  return response.json();
}

export async function fetchUsuarioPorUsername(username: string) {
  const usuarios = await fetchUsuarios();
  return usuarios.find((u: Usuario) => u.username === username);
}

export async function crearUsuario(usuario: {
  username: string; // DNI de la persona
  password: string;
  permissions: number[]; // IDs de permisos
}) {
  const formData = new FormData();
  formData.append("username", usuario.username);
  formData.append("password", usuario.password);
  if (usuario.permissions && usuario.permissions.length > 0) {
    formData.append("permissions", usuario.permissions.join(","));
  }

  const response = await fetchWithAuth(`${API_URL}/users/`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error('No se pudo crear el usuario');
  return response.json();
}

export async function updateUsuario(id: number, usuario: {
  username?: string;
  password?: string;
  permissions?: number[];
}) {
  const formData = new FormData();
  if (usuario.username) formData.append("username", usuario.username);
  if (usuario.password) formData.append("password", usuario.password);
  if (usuario.permissions && usuario.permissions.length > 0) {
    formData.append("permissions", usuario.permissions.join(","));
  }

  const response = await fetchWithAuth(`${API_URL}/users/${id}`, {
    method: 'PUT',
    body: formData,
  });
  if (!response.ok) throw new Error('No se pudo actualizar el usuario');
  return response.json();
}