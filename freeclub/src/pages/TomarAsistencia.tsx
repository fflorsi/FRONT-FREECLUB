import React, { useState, useMemo } from 'react';
import { Save, CheckCircle, XCircle, AlertTriangle, Users2 } from 'lucide-react';
import { mockPersonas, mockActividades } from '../data/mockData';

interface AsistenciaTemp {
  personaDni: string;
  estado: 'presente' | 'ausente' | 'justificada';
}

const TomarAsistencia: React.FC = () => {
  const [actividadSeleccionada, setActividadSeleccionada] = useState('');
  const [asistenciasTemp, setAsistenciasTemp] = useState<AsistenciaTemp[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string>('');

  // Todas las actividades disponibles - simplificado para campo
  const actividadesDisponibles = useMemo(() => {
    return mockActividades;
  }, []);

  // Obtener alumnos de la actividad seleccionada
  const alumnosActividad = useMemo(() => {
    if (!actividadSeleccionada) return [];
    
    return mockPersonas.filter(p => 
      p.roles.includes('alumno')
    );
  }, [actividadSeleccionada]);

  // Inicializar asistencias cuando se selecciona una actividad
  React.useEffect(() => {
    if (actividadSeleccionada && alumnosActividad.length > 0) {
      const nuevasAsistencias = alumnosActividad.map(alumno => ({
        personaDni: alumno.dni,
        estado: 'ausente' as const
      }));
      setAsistenciasTemp(nuevasAsistencias);
    }
  }, [actividadSeleccionada, alumnosActividad]);

  const cambiarEstado = (personaDni: string, estado: 'presente' | 'ausente' | 'justificada') => {
    setAsistenciasTemp(prev => prev.map(a => 
      a.personaDni === personaDni ? { ...a, estado } : a
    ));
  };



  const guardarAsistencias = async () => {
    if (!actividadSeleccionada || asistenciasTemp.length === 0) return;

    setGuardando(true);
    try {
      // Simular guardado en la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMensaje('✅ Asistencias guardadas correctamente');
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      setMensaje('❌ Error al guardar las asistencias');
      setTimeout(() => setMensaje(''), 3000);
    } finally {
      setGuardando(false);
    }
  };

  const fechaHoy = new Date().toLocaleDateString('es-AR');

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
      {/* Header simple */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Tomar Asistencia</h1>
        <p className="text-sm sm:text-base text-gray-600">{fechaHoy}</p>
      </div>

      {/* Selector de actividad */}
      <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm mb-4 sm:mb-6">
        <label className="block text-base sm:text-lg font-medium text-gray-700 mb-2 sm:mb-3">
          Seleccionar Actividad
        </label>
        <select
          value={actividadSeleccionada}
          onChange={(e) => setActividadSeleccionada(e.target.value)}
          className="w-full p-3 sm:p-4 text-base sm:text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Elegir actividad...</option>
          {actividadesDisponibles.map(actividad => (
            <option key={actividad.id} value={actividad.id}>
              {actividad.nombre} - {actividad.horario}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de asistencia - Solo si hay actividad seleccionada */}
      {actividadSeleccionada && asistenciasTemp.length > 0 && (
        <>

          {/* Lista de alumnos */}
          <div className="space-y-3 sm:space-y-4 mb-20 sm:mb-24">
            {asistenciasTemp.map((asistencia) => {
              const persona = mockPersonas.find(p => p.dni === asistencia.personaDni);
              if (!persona) return null;

              return (
                <div key={persona.dni} className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-200">
                  {/* Nombre del alumno  */}
                  <div className="mb-3 sm:mb-4 text-center">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                      {persona.name} {persona.lastname}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500">DNI: {persona.dni}</p>
                  </div>

                  {/* Botones de estado */}
                  <div className="flex gap-1 sm:gap-2">
                    <button
                      onClick={() => cambiarEstado(persona.dni, 'presente')}
                      className={`flex-1 py-2 sm:py-3 px-1 sm:px-2 rounded-lg font-bold text-xs sm:text-sm transition-all ${
                        asistencia.estado === 'presente'
                          ? 'bg-green-600 text-white shadow-md'
                          : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-1">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>PRESENTE</span>
                      </div>
                    </button>

                    <button
                      onClick={() => cambiarEstado(persona.dni, 'ausente')}
                      className={`flex-1 py-2 sm:py-3 px-1 sm:px-2 rounded-lg font-bold text-xs sm:text-sm transition-all ${
                        asistencia.estado === 'ausente'
                          ? 'bg-red-600 text-white shadow-md'
                          : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-1">
                        <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>AUSENTE</span>
                      </div>
                    </button>

                    <button
                      onClick={() => cambiarEstado(persona.dni, 'justificada')}
                      className={`flex-1 py-2 sm:py-3 px-1 sm:px-2 rounded-lg font-bold text-xs sm:text-sm transition-all ${
                        asistencia.estado === 'justificada'
                          ? 'bg-yellow-600 text-white shadow-md'
                          : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-1">
                        <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>JUSTIFICADA</span>
                      </div>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Botón guardar - FIXED al fondo */}
          <div className="fixed bottom-0 left-0 right-0 sm:left-64 bg-white border-t border-gray-200 shadow-2xl z-50">
            <div className="p-3 sm:p-4 w-full">
              <button
                onClick={guardarAsistencias}
                disabled={guardando}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 sm:py-5 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg shadow-xl disabled:cursor-not-allowed transition-all duration-300 active:scale-[0.98] transform"
              >
                {guardando ? (
                  <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-2 border-white border-t-transparent"></div>
                    <span>Guardando...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                    <Save className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span>Guardar Asistencias</span>
                  </div>
                )}
              </button>
              
              {/* Indicador visual */}
              <div className="mt-2 sm:mt-3 flex justify-center">
                <div className="flex space-x-1">
                  {asistenciasTemp.map((_, index) => (
                    <div 
                      key={index} 
                      className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                        asistenciasTemp[index]?.estado === 'presente' 
                          ? 'bg-green-500' 
                          : asistenciasTemp[index]?.estado === 'justificada'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              {/* Resumen rápido */}
              <div className="mt-1 sm:mt-2 text-center">
                <p className="text-xs sm:text-sm text-gray-600">
                  {asistenciasTemp.filter(a => a.estado === 'presente').length} presentes • {' '}
                  {asistenciasTemp.filter(a => a.estado === 'ausente').length} ausentes • {' '}
                  {asistenciasTemp.filter(a => a.estado === 'justificada').length} justificadas
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Estado vacío */}
      {!actividadSeleccionada && (
        <div className="bg-white rounded-lg p-6 sm:p-8 text-center shadow-sm">
          <Users2 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
            Selecciona una actividad
          </h3>
          <p className="text-sm sm:text-base text-gray-600">
            Elige la actividad para comenzar a tomar asistencia
          </p>
        </div>
      )}

      {/* Toast/Mensaje flotante */}
      {mensaje && (
        <div className="fixed top-4 left-2 right-2 sm:left-4 sm:right-4 z-50">
          <div className="max-w-md mx-auto">
            <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-2xl border-l-4 backdrop-blur-sm ${
              mensaje.includes('✅') 
                ? 'bg-green-50/95 border-green-500 text-green-800' 
                : 'bg-red-50/95 border-red-500 text-red-800'
            }`}>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="text-lg sm:text-xl">
                  {mensaje.includes('✅') ? '✅' : '❌'}
                </div>
                <p className="font-medium text-sm sm:text-base">{mensaje.replace(/^[✅❌]\s*/, '')}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TomarAsistencia;