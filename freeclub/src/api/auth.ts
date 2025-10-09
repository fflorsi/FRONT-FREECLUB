import { AuthUser } from "../types";

export const API_URL = "http://localhost:5000";

export async function loginApi(username: string, password: string): Promise<{ success: boolean; user?: AuthUser; token?: string; error?: string }> {
  try {
    console.log('Iniciando login para usuario:', username);
    
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    const response = await fetch(`${API_URL}/users/login`, {
      method: "POST",
      body: formData,
    });

    console.log('Respuesta del servidor:', response.status, response.statusText);

    if (response.status === 400) {
      return { success: false, error: "Usuario o contraseña incorrectos" };
    }

    if (response.status === 500) {
      console.error('Error 500 del servidor');
      return { success: false, error: "Error interno del servidor" };
    }

    if (!response.ok) {
      console.error('Error de respuesta:', response.status);
      return { success: false, error: "Error de conexión" };
    }

    const data = await response.json();
    console.log('Datos de respuesta:', data);
    
    const token = data.access_token;

    if (!token) {
      return { success: false, error: "Token no recibido" };
    }

    // Decodificar el token para obtener información del usuario
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    console.log('Token payload:', tokenPayload);
    
    // Obtener datos completos del usuario
    const userResponse = await fetch(`${API_URL}/users/${tokenPayload.sub}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!userResponse.ok) {
      console.error('Error al obtener datos del usuario:', userResponse.status);
      return { success: false, error: "Error al obtener datos del usuario" };
    }

    const userData = await userResponse.json();
    console.log('Datos del usuario:', userData);
    
    // Obtener datos de la persona
    let personData = null;
    try {
      const personResponse = await fetch(`${API_URL}/persons/${userData.username}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (personResponse.ok) {
        personData = await personResponse.json();
      }
    } catch (personError) {
      console.warn('No se pudieron obtener los datos de la persona:', personError);
      // Continúa sin los datos de la persona
    }

    const user: AuthUser = {
      id: userData.id,
      username: userData.username,
      permissions: userData.permissions || [],
      permisos: userData.permissions || [],
      persona: personData,
      personaDni: userData.personaDni || userData.username
    };

    console.log('Usuario creado exitosamente:', user);
    return { success: true, user, token };

  } catch (error) {
    console.error("Error completo en login:", error);
    return { success: false, error: "Error de conexión al servidor" };
  }
}

// Función para hacer requests autenticadas
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('authToken');

  // Normalizar headers para evitar problemas al hacer spread de Headers
  const baseHeaders = new Headers(options.headers as HeadersInit | undefined);
  if (token) {
    baseHeaders.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers: baseHeaders,
    mode: options.mode ?? 'cors'
  });

  // Si el token expira o falta, propagamos un error claro
  if (response.status === 401) {
    // Opcional: limpiar sesión para forzar re-login
    // localStorage.removeItem('authToken');
    // localStorage.removeItem('currentUser');
    const err = new Error('UNAUTHORIZED');
    // @ts-expect-error attach status for consumers
    err.status = 401;
    throw err;
  }

  return response;
}
