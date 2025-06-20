import React, { useState, useMemo } from 'react';
import { Save, Users, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import { mockPersonas, mockActividades, mockAsistencias, feriadosArgentinos2024 } from '../data/mockData';
import { Asistencia } from '../types';
import { useAuth } from '../context/AuthContext';

interface AsistenciaTemp {
  personaDni: string;
  presente: boolean;
  justificada: boolean;
  observaciones: string;
}

const TomarAsistencia: React.FC = () => {
  const { user } = useAuth();
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split('T')[0]);
  const [actividadSeleccionada, setActividadSeleccionada] = useState('');
  const [asistenciasTemp, setAsistenciasTemp] = useState<AsistenciaTemp[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  // Filtrar actividades del coach actual
  /* const actividadesDelCoach = useMemo(() => {
    if (user?.persona.roles.includes('superadmin')) {
      return mockActividades;
    }
    return mockActividades.filter(a => a.coachDni === user?.personaDni);
  }, [user]);
*/
const actividadesDelCoach = useMemo(() => {
  return mockActividades; // Todos ven todas las actividades
}, []);

  // Obtener alumnos de la actividad seleccionada
  const alumnosActividad = useMemo(() => {
    if (!actividadSeleccionada) return [];
    
    // Por ahora, simulamos que todos los alumnos activos pueden estar en cualquier actividad
    return mockPersonas.filter(p => 
      p.roles.includes('alumno') && 
      p.activo
    );
  }, [actividadSeleccionada]);

  // Verificar si ya existe asistencia para esta fecha y actividad
  const yaExisteAsistencia = useMemo(() => {
    return mockAsistencias.some(a => 
      a.fecha === fechaSeleccionada && 
      a.actividadId === actividadSeleccionada
    );
  }, [fechaSeleccionada, actividadSeleccionada]);

  // Verificar si es feriado
  const esFeriado = useMemo(() => {
    return feriadosArgentinos2024.find(f => f.fecha === fechaSeleccionada);
  }, [fechaSeleccionada]);

  // Inicializar asistencias temporales cuando se selecciona una actividad
  React.useEffect(() => {
    if (actividadSeleccionada && alumnosActividad.length > 0) {
      const asistenciasExistentes = mockAsistencias.filter(a => 
        a.fecha === fechaSeleccionada && 
        a.actividadId === actividadSeleccionada
      );

      const nuevasAsistencias = alumnosActividad.map(alumno => {
        const existente = asistenciasExistentes.find(a => a.personaDni === alumno.dni);
        return {
          personaDni: alumno.dni,
          presente: existente?.presente || false,
          justificada: existente?.justificada || false,
          observaciones: existente?.observaciones || ''
        };
      });

      setAsistenciasTemp(nuevasAsistencias);
    }
  }, [actividadSeleccionada, alumnosActividad, fechaSeleccionada]);

  const actualizarAsistencia = (personaDni: string, campo: keyof AsistenciaTemp, valor: any) => {
    setAsistenciasTemp(prev => prev.map(a => 
      a.personaDni === personaDni 
        ? { ...a, [campo]: valor }
        : a
    ));
  };

  const marcarTodosPresentes = () => {
    setAsistenciasTemp(prev => prev.map(a => ({ ...a, presente: true, justificada: false })));
  };

  const marcarTodosAusentes = () => {
    setAsistenciasTemp(prev => prev.map(a => ({ ...a, presente: false, justificada: false })));
  };

  const guardarAsistencias = async () => {
    if (!actividadSeleccionada || asistenciasTemp.length === 0) return;

    setGuardando(true);
    try {
      // Simular guardado en la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMensaje('Asistencias guardadas correctamente');
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      setMensaje('Error al guardar las asistencias');
    } finally {
      setGuardando(false);
    }
  };

  const actividadInfo = mockActividades.find(a => a.id === actividadSeleccionada);
  const estadisticas = {
    total: asistenciasTemp.length,
    presentes: asistenciasTemp.filter(a => a.presente).length,
    ausentes: asistenciasTemp.filter(a => !a.presente && !a.justificada).length,
    justificadas: asistenciasTemp.filter(a => !a.presente && a.justificada).length
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-900">Tomar Asistencia</h1>
          <p className="text-dark-600 mt-1">Registrar asistencia de alumnos</p>
        </div>
      </div>

      {/* Selección de Fecha y Actividad */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-2">
              <Calendar className="inline mr-2" size={16} />
              Fecha
            </label>
            <input
              type="date"
              value={fechaSeleccionada}
              onChange={(e) => setFechaSeleccionada(e.target.value)}
              className="w-full px-4 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {esFeriado && (
              <div className="mt-2 p-2 bg-cream-100 border border-cream-300 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle size={16} className="text-cream-600" />
                  <span className="text-sm text-cream-800">
                    Feriado: {esFeriado.nombre}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-700 mb-2">
              <Users className="inline mr-2" size={16} />
              Actividad
            </label>
            <select
              value={actividadSeleccionada}
              onChange={(e) => setActividadSeleccionada(e.target.value)}
              className="w-full px-4 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Seleccionar actividad</option>
              {actividadesDelCoach.map(actividad => (
                <option key={actividad.id} value={actividad.id}>
                  {actividad.nombre} - {actividad.horario}
                </option>
              ))}
            </select>
            {actividadInfo && (
              <p className="mt-1 text-sm text-dark-600">
                <Clock className="inline mr-1" size={14} />
                {actividadInfo.descripcion}
              </p>
            )}
          </div>
        </div>

        {yaExisteAsistencia && (
          <div className="mt-4 p-3 bg-cream-100 border border-cream-300 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle size={16} className="text-cream-600" />
              <span className="text-sm text-cream-800">
                Ya existe un registro de asistencia para esta fecha y actividad
              </span>
            </div>
          </div>
        )}
      </Card>

      {/* Estadísticas y Acciones Rápidas */}
      {actividadSeleccionada && asistenciasTemp.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-dark-900 mb-4">Estadísticas</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-primary-50 rounded-lg">
                <p className="text-2xl font-bold text-primary-900">{estadisticas.total}</p>
                <p className="text-sm text-primary-700">Total</p>
              </div>
              <div className="text-center p-3 bg-emerald-50 rounded-lg">
                <p className="text-2xl font-bold text-emerald-900">{estadisticas.presentes}</p>
                <p className="text-sm text-emerald-700">Presentes</p>
              </div>
              <div className="text-center p-3 bg-danger-50 rounded-lg">
                <p className="text-2xl font-bold text-danger-900">{estadisticas.ausentes}</p>
                <p className="text-sm text-danger-700">Ausentes</p>
              </div>
              <div className="text-center p-3 bg-cream-50 rounded-lg">
                <p className="text-2xl font-bold text-cream-900">{estadisticas.justificadas}</p>
                <p className="text-sm text-cream-700">Justificadas</p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-dark-900 mb-4">Acciones Rápidas</h3>
            <div className="space-y-3">
              <Button 
                onClick={marcarTodosPresentes}
                variant="success"
                className="w-full"
                icon={CheckCircle}
              >
                Marcar Todos Presentes
              </Button>
              <Button 
                onClick={marcarTodosAusentes}
                variant="secondary"
                className="w-full"
                icon={XCircle}
              >
                Marcar Todos Ausentes
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Lista de Asistencias */}
      {actividadSeleccionada && asistenciasTemp.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-dark-900">
              Lista de Asistencia - {actividadInfo?.nombre}
            </h3>
            <Button
              onClick={guardarAsistencias}
              disabled={guardando}
              icon={Save}
              variant="primary"
            >
              {guardando ? 'Guardando...' : 'Guardar Asistencias'}
            </Button>
          </div>

          <div className="space-y-4">
            {asistenciasTemp.map((asistencia) => {
              const persona = mockPersonas.find(p => p.dni === asistencia.personaDni);
              if (!persona) return null;

              return (
                <div key={persona.dni} className="border border-dark-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-700 font-semibold text-sm">
                          {persona.nombre.charAt(0)}{persona.apellido.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-dark-900">
                          {persona.nombre} {persona.apellido}
                        </p>
                        <p className="text-sm text-dark-500">
                          DNI: {persona.dni} | Faltas: {persona.faltas || 0}
                        </p>
                      </div>
                    </div>
                    
                    {(persona.faltas || 0) > 3 && (
                      <div className="bg-danger-100 text-danger-800 px-2 py-1 rounded-full text-xs font-medium">
                        +3 Faltas
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`asistencia-${persona.dni}`}
                          checked={asistencia.presente}
                          onChange={() => {
                            actualizarAsistencia(persona.dni, 'presente', true);
                            actualizarAsistencia(persona.dni, 'justificada', false);
                          }}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <CheckCircle size={16} className="text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-700">Presente</span>
                      </label>
                    </div>

                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`asistencia-${persona.dni}`}
                          checked={!asistencia.presente && !asistencia.justificada}
                          onChange={() => {
                            actualizarAsistencia(persona.dni, 'presente', false);
                            actualizarAsistencia(persona.dni, 'justificada', false);
                          }}
                          className="text-danger-600 focus:ring-danger-500"
                        />
                        <XCircle size={16} className="text-danger-600" />
                        <span className="text-sm font-medium text-danger-700">Ausente</span>
                      </label>
                    </div>

                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`asistencia-${persona.dni}`}
                          checked={!asistencia.presente && asistencia.justificada}
                          onChange={() => {
                            actualizarAsistencia(persona.dni, 'presente', false);
                            actualizarAsistencia(persona.dni, 'justificada', true);
                          }}
                          className="text-cream-600 focus:ring-cream-500"
                        />
                        <AlertCircle size={16} className="text-cream-600" />
                        <span className="text-sm font-medium text-cream-700">Justificada</span>
                      </label>
                    </div>
                  </div>

                  {(!asistencia.presente) && (
                    <div className="mt-3">
                      <textarea
                        placeholder="Observaciones (opcional)"
                        value={asistencia.observaciones}
                        onChange={(e) => actualizarAsistencia(persona.dni, 'observaciones', e.target.value)}
                        className="w-full px-3 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                        rows={2}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

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

      {/* Estado Vacío */}
      {!actividadSeleccionada && (
        <Card>
          <div className="text-center py-12">
            <Users size={48} className="text-dark-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-dark-900 mb-2">Selecciona una actividad</h3>
            <p className="text-dark-600">
              Elige la fecha y actividad para comenzar a tomar asistencia
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default TomarAsistencia;