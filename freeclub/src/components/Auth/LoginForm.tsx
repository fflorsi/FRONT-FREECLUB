import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../Common/Button';

const SITE_KEY = '6Lfc6uErAAAAAJRTi5-pj3chtdZghQmNh6x7FqJ2';

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
    } catch {
      setError('Error en el sistema. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  useEffect(() => {
    const tryRender = () => {
      if (window.grecaptcha && recaptchaContainerRef.current && recaptchaWidgetIdRef.current == null) {
        recaptchaWidgetIdRef.current = window.grecaptcha.render(recaptchaContainerRef.current, {
          sitekey: SITE_KEY,
          size: 'invisible',
          callback: (token: string) => {
            // Usa los valores actuales en el momento de la verificación
            doLogin(currentUsernameRef.current, currentPasswordRef.current, token);
            // Resetea para próximos intentos
            if (recaptchaWidgetIdRef.current != null) {
              window.grecaptcha.reset(recaptchaWidgetIdRef.current);
            }
          },
        });
      }
    };
    tryRender();
    const id = setInterval(tryRender, 300);
    return () => clearInterval(id);
  }, [doLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const u = username.trim();
    const p = password.trim();
    if (!u || !p) {
      setError('Ingresa usuario y contraseña');
      return;
    }
    // Normaliza estado para que el callback de reCAPTCHA lea los valores saneados
    if (u !== username) setUsername(u);
    if (p !== password) setPassword(p);
    currentUsernameRef.current = u;
    currentPasswordRef.current = p;
    if (window.grecaptcha && recaptchaWidgetIdRef.current !== null) {
      window.grecaptcha.execute(recaptchaWidgetIdRef.current);
      return;
    }
    // Fallback (sin reCAPTCHA)
    await doLogin(u, p);
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
              placeholder="Ingrese su usuario"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-dark-700 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 pr-12 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 
                ${!showPassword ? 'ios-password' : ''}`}
                placeholder="Ingrese su contraseña"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-500 hover:text-dark-700"
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

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4"
            icon={LogIn}
          >
            {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
          </Button>

          {/* Contenedor para reCAPTCHA invisible */}
          <div ref={recaptchaContainerRef} />
        </form>
      </div>
    </div>
  );
};

export default LoginForm;