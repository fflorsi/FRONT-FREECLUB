import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../Common/Button';

const SITE_KEY = '6LcTyBAsAAAAAGgRPdslbHoQqazTYXeealrAxIGg';

declare global {
  interface Window {
    grecaptcha?: any;
  }
}

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const recaptchaContainerRef = useRef<HTMLDivElement | null>(null);
  const recaptchaWidgetIdRef = useRef<number | null>(null);
  const passwordInputRef = useRef<HTMLInputElement | null>(null);
  const [recaptchaReady, setRecaptchaReady] = useState(false);

  // Mantener valores actuales para que el callback de reCAPTCHA no use valores antiguos
  const currentUsernameRef = useRef('');
  const currentPasswordRef = useRef('');

  const doLogin = useCallback(async (u: string, p: string, recaptchaToken?: string) => {
    setError('');
    setIsLoading(true);
    try {
      const success = await login(u, p, recaptchaToken);
      if (!success) {
        setError('Usuario o contraseña incorrectos');
      }
    } catch (err) {
      console.error('Error en login:', err);
      setError('Error en el sistema. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  // Configurar reCAPTCHA cuando esté listo
  useEffect(() => {
    let mounted = true;
    let intervalId: number | null = null;

    const setupRecaptcha = () => {
      if (!mounted) return;
      
      if (window.grecaptcha && window.grecaptcha.render && recaptchaContainerRef.current && recaptchaWidgetIdRef.current === null) {
        try {
          recaptchaWidgetIdRef.current = window.grecaptcha.render(recaptchaContainerRef.current, {
            sitekey: SITE_KEY,
            size: 'normal',
            callback: () => {
              // Token será obtenido en handleSubmit
            },
            'error-callback': () => {
              setError('Error con la verificación. Intenta nuevamente.');
              setIsLoading(false);
            },
            'expired-callback': () => {
              if (recaptchaWidgetIdRef.current != null) {
                try {
                  window.grecaptcha.reset(recaptchaWidgetIdRef.current);
                } catch (e) {
                  console.error('Error al resetear reCAPTCHA:', e);
                }
              }
            }
          });
          setRecaptchaReady(true);
          if (intervalId) clearInterval(intervalId);
        } catch (err) {
          console.error('Error al configurar reCAPTCHA:', err);
        }
      }
    };

    // Intentar configurar inmediatamente
    setupRecaptcha();
    
    // Reintentar cada 500ms hasta que se configure
    intervalId = setInterval(setupRecaptcha, 500);

    // Limpiar después de 10 segundos
    const timeoutId = setTimeout(() => {
      if (intervalId) clearInterval(intervalId);
    }, 10000);

    return () => {
      mounted = false;
      if (intervalId) clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [doLogin]);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const u = username.trim();
    const p = password.trim();
    if (!u || !p) {
      setError('Ingresa usuario y contraseña');
      return;
    }
    
    currentUsernameRef.current = u;
    currentPasswordRef.current = p;
    
    // Obtener token de reCAPTCHA (OBLIGATORIO)
    if (window.grecaptcha && recaptchaWidgetIdRef.current !== null) {
      try {
        const recaptchaToken = window.grecaptcha.getResponse(recaptchaWidgetIdRef.current);
        
        // Validar que el reCAPTCHA esté completado
        if (!recaptchaToken) {
          setError('Por favor completa la verificación de seguridad');
          return;
        }
        
        await doLogin(u, p, recaptchaToken);
        
        // Resetear reCAPTCHA después del intento
        try {
          window.grecaptcha.reset(recaptchaWidgetIdRef.current);
        } catch (e) {
          console.error('Error al resetear reCAPTCHA:', e);
        }
        return;
      } catch (err) {
        console.error('Error al obtener token de reCAPTCHA:', err);
        setError('Error con la verificación. Intenta nuevamente.');
        return;
      }
    }
    
    // Si reCAPTCHA no está disponible, mostrar error
    setError('Verificación de seguridad no disponible. Recarga la página.');
  };

  // Mantener los refs sincronizados con la entrada del usuario
  useEffect(() => {
    currentUsernameRef.current = username;
  }, [username]);

  useEffect(() => {
    currentPasswordRef.current = password;
  }, [password]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-primary-50 to-dark-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-dark-900 p-8 text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-600 font-bold text-2xl">FC</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Fútbol Club</h1>
          <p className="text-primary-100">Sistema de Gestión</p>
        </div>

        <form id="login-form" onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-dark-700 mb-2">
              Usuario
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              style={{ 
                fontSize: '16px',
                minHeight: '48px',
              } as React.CSSProperties}
              placeholder="Ingrese su usuario"
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-dark-700 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <input
                ref={passwordInputRef}
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                style={{ 
                  fontSize: '16px',
                  minHeight: '48px',
                  WebkitAppearance: 'none',
                  appearance: 'none'
                } as React.CSSProperties}
                placeholder="Ingrese su contraseña"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowPassword(!showPassword);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-500 hover:text-dark-700 z-10 pointer-events-auto"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-danger-50 border border-danger-200 text-danger-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Contenedor para reCAPTCHA checkbox */}
          <div className="flex justify-center">
            <div ref={recaptchaContainerRef} />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4"
            icon={LogIn}
          >
            {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;