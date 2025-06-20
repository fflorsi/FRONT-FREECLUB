import React, { useState } from 'react';
import { Settings, Database, Shield, Bell, Mail, Calendar, Save, RefreshCw } from 'lucide-react';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import { useAuth } from '../context/AuthContext';

const Configuracion: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [configuracion, setConfiguracion] = useState({
    general: {
      nombreClub: 'Fútbol Club',
      direccion: 'Av. Libertador 1234',
      telefono: '11-4444-5555',
      email: 'info@futbolclub.com',
      sitioWeb: 'www.futbolclub.com'
    },
    asistencias: {
      maxFaltasPermitidas: 3,
      notificarFaltas: true,
      requierirJustificacion: true,
      diasParaJustificar: 7
    },
    notificaciones: {
      emailAsistencias: true,
      emailFaltas: true,
      recordatoriosEntrenamiento: true,
      notificacionesMovil: false
    },
    sistema: {
      backupAutomatico: true,
      frecuenciaBackup: 'diario',
      mantenimientoAutomatico: true,
      logActividades: true
    }
  });

  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'asistencias', name: 'Asistencias', icon: Calendar },
    { id: 'notificaciones', name: 'Notificaciones', icon: Bell },
    { id: 'sistema', name: 'Sistema', icon: Database }
  ];

  const handleInputChange = (seccion: string, campo: string, valor: any) => {
    setConfiguracion(prev => ({
      ...prev,
      [seccion]: {
        ...prev[seccion as keyof typeof prev],
        [campo]: valor
      }
    }));
  };

  const guardarConfiguracion = async () => {
    setGuardando(true);
    try {
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMensaje('Configuración guardada correctamente');
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      setMensaje('Error al guardar la configuración');
    } finally {
      setGuardando(false);
    }
  };

  const realizarBackup = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setMensaje('Backup realizado correctamente');
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      setMensaje('Error al realizar el backup');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-900">Configuración</h1>
          <p className="text-dark-600 mt-1">Configuración del sistema y preferencias</p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <Button 
            variant="secondary" 
            icon={RefreshCw} 
            size="sm"
            onClick={realizarBackup}
          >
            Backup
          </Button>
          <Button 
            icon={Save} 
            size="sm"
            onClick={guardarConfiguracion}
            disabled={guardando}
          >
            {guardando ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navegación de Tabs */}
        <Card className="lg:col-span-1">
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-800 font-medium'
                      : 'text-dark-600 hover:bg-dark-50'
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </Card>

        {/* Contenido de Configuración */}
        <div className="lg:col-span-3">
          {activeTab === 'general' && (
            <Card title="Configuración General" subtitle="Información básica del club">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Nombre del Club
                  </label>
                  <input
                    type="text"
                    value={configuracion.general.nombreClub}
                    onChange={(e) => handleInputChange('general', 'nombreClub', e.target.value)}
                    className="w-full px-4 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={configuracion.general.telefono}
                    onChange={(e) => handleInputChange('general', 'telefono', e.target.value)}
                    className="w-full px-4 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={configuracion.general.direccion}
                    onChange={(e) => handleInputChange('general', 'direccion', e.target.value)}
                    className="w-full px-4 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={configuracion.general.email}
                    onChange={(e) => handleInputChange('general', 'email', e.target.value)}
                    className="w-full px-4 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Sitio Web
                  </label>
                  <input
                    type="url"
                    value={configuracion.general.sitioWeb}
                    onChange={(e) => handleInputChange('general', 'sitioWeb', e.target.value)}
                    className="w-full px-4 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'asistencias' && (
            <Card title="Configuración de Asistencias" subtitle="Reglas y políticas de asistencia">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Máximo de faltas permitidas
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={configuracion.asistencias.maxFaltasPermitidas}
                    onChange={(e) => handleInputChange('asistencias', 'maxFaltasPermitidas', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <p className="text-sm text-dark-500 mt-1">
                    Los alumnos con más faltas serán marcados en rojo
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Días para justificar ausencias
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={configuracion.asistencias.diasParaJustificar}
                    onChange={(e) => handleInputChange('asistencias', 'diasParaJustificar', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="notificarFaltas"
                      checked={configuracion.asistencias.notificarFaltas}
                      onChange={(e) => handleInputChange('asistencias', 'notificarFaltas', e.target.checked)}
                      className="rounded border-dark-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="notificarFaltas" className="text-sm text-dark-700">
                      Notificar automáticamente las faltas
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="requierirJustificacion"
                      checked={configuracion.asistencias.requierirJustificacion}
                      onChange={(e) => handleInputChange('asistencias', 'requierirJustificacion', e.target.checked)}
                      className="rounded border-dark-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="requierirJustificacion" className="text-sm text-dark-700">
                      Requerir justificación para ausencias
                    </label>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'notificaciones' && (
            <Card title="Configuración de Notificaciones" subtitle="Gestión de alertas y comunicaciones">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="emailAsistencias"
                    checked={configuracion.notificaciones.emailAsistencias}
                    onChange={(e) => handleInputChange('notificaciones', 'emailAsistencias', e.target.checked)}
                    className="rounded border-dark-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="emailAsistencias" className="text-sm text-dark-700">
                    Enviar resumen de asistencias por email
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="emailFaltas"
                    checked={configuracion.notificaciones.emailFaltas}
                    onChange={(e) => handleInputChange('notificaciones', 'emailFaltas', e.target.checked)}
                    className="rounded border-dark-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="emailFaltas" className="text-sm text-dark-700">
                    Notificar faltas excesivas por email
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="recordatoriosEntrenamiento"
                    checked={configuracion.notificaciones.recordatoriosEntrenamiento}
                    onChange={(e) => handleInputChange('notificaciones', 'recordatoriosEntrenamiento', e.target.checked)}
                    className="rounded border-dark-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="recordatoriosEntrenamiento" className="text-sm text-dark-700">
                    Recordatorios de entrenamientos
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="notificacionesMovil"
                    checked={configuracion.notificaciones.notificacionesMovil}
                    onChange={(e) => handleInputChange('notificaciones', 'notificacionesMovil', e.target.checked)}
                    className="rounded border-dark-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="notificacionesMovil" className="text-sm text-dark-700">
                    Notificaciones push móviles
                  </label>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'sistema' && (
            <Card title="Configuración del Sistema" subtitle="Mantenimiento y seguridad">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Frecuencia de backup automático
                  </label>
                  <select
                    value={configuracion.sistema.frecuenciaBackup}
                    onChange={(e) => handleInputChange('sistema', 'frecuenciaBackup', e.target.value)}
                    className="w-full px-4 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="diario">Diario</option>
                    <option value="semanal">Semanal</option>
                    <option value="mensual">Mensual</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="backupAutomatico"
                      checked={configuracion.sistema.backupAutomatico}
                      onChange={(e) => handleInputChange('sistema', 'backupAutomatico', e.target.checked)}
                      className="rounded border-dark-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="backupAutomatico" className="text-sm text-dark-700">
                      Backup automático habilitado
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="mantenimientoAutomatico"
                      checked={configuracion.sistema.mantenimientoAutomatico}
                      onChange={(e) => handleInputChange('sistema', 'mantenimientoAutomatico', e.target.checked)}
                      className="rounded border-dark-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="mantenimientoAutomatico" className="text-sm text-dark-700">
                      Mantenimiento automático de base de datos
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="logActividades"
                      checked={configuracion.sistema.logActividades}
                      onChange={(e) => handleInputChange('sistema', 'logActividades', e.target.checked)}
                      className="rounded border-dark-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="logActividades" className="text-sm text-dark-700">
                      Registrar log de actividades del sistema
                    </label>
                  </div>
                </div>

                <div className="bg-cream-50 border border-cream-200 rounded-lg p-4">
                  <h4 className="font-medium text-cream-800 mb-2">Información del Sistema</h4>
                  <div className="text-sm text-cream-700 space-y-1">
                    <p>Versión: 1.0.0</p>
                    <p>Último backup: {new Date().toLocaleDateString('es-AR')}</p>
                    <p>Usuarios activos: 4</p>
                    <p>Espacio utilizado: 125 MB</p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Mensaje de Estado */}
      {mensaje && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
          mensaje.includes('Error') 
            ? 'bg-danger-100 text-danger-800 border border-danger-300' 
            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
        }`}>
          {mensaje}
        </div>
      )}
    </div>
  );
};

export default Configuracion;