import { AuthUser } from "../types";
import { API_URL } from "./config";

export async function loginApi(username: string, password: string, recaptchaToken?: string): Promise<{ success: boolean; user?: AuthUser; token?: string; error?: string }> {
  try {
    const u = (username ?? '').trim();
    const p = (password ?? '').trim();

    if (!u || !p) {
      return { success: false, error: 'Faltan credenciales' };
    }
    
    const formData = new FormData();
    formData.append("username", u);
    formData.append("password", p);
    formData.append("recaptcha_token", recaptchaToken || '' );

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 10000);

    const response = await fetch(`${API_URL}users/login`, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (response.status === 400) {
      let errorMsg = "Usuario o contraseña incorrectos";
      try {
        const err = await response.clone().json();
        if (err?.error) errorMsg = err.error;
      } catch {}
      return { success: false, error: errorMsg };
    }

    if (response.status === 500) {
      return { success: false, error: "Error interno del servidor" };
    }

    if (!response.ok) {
      return { success: false, error: "Error de conexión" };
    }

    const data = await response.json();
    const token = data.access_token;

    if (!token) {
      return { success: false, error: "Token no recibido" };
    }

    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    
    const userController = new AbortController();
    const userTimeoutId = setTimeout(() => {
      userController.abort();
    }, 10000);
    
    const userResponse = await fetch(`${API_URL}users/${tokenPayload.sub}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      signal: userController.signal,
    }).finally(() => clearTimeout(userTimeoutId));

    if (!userResponse.ok) {
      console.error('Error al obtener datos del usuario:', userResponse.status);
      return { success: false, error: "Error al obtener datos del usuario" };
    }

    const userData = await userResponse.json();
    
    // Obtener datos de la persona
    let personData = null;
    try {
      const personController = new AbortController();
      const personTimeoutId = setTimeout(() => {
        personController.abort();
      }, 10000);
      
      const personResponse = await fetch(`${API_URL}persons/${userData.username}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        signal: personController.signal,
      }).finally(() => clearTimeout(personTimeoutId));

      if (personResponse.ok) {
        personData = await personResponse.json();
      }
    } catch (personError) {
      // Continúa sin los datos de la persona
      console.warn('No se pudieron obtener datos de la persona');
    }

    const user: AuthUser = {
      id: userData.id,
      username: userData.username,
      permissions: userData.permissions || [],
      permisos: userData.permissions || [],
      persona: personData,
      personaDni: userData.personaDni || userData.username
    };

    return { success: true, user, token };

  } catch (error) {
    console.error("Error en login:", error);
    if (error instanceof Error && error.name === 'AbortError') {
      return { success: false, error: "Tiempo de espera agotado. Verifica tu conexión." };
    }
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
