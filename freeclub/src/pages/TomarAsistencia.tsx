import React, { useState, useEffect } from 'react';
import { Save, CheckCircle, XCircle, AlertTriangle, Users2 } from 'lucide-react';
import { getActividades, ActividadResponse } from '../api/actividades';
import { getAlumnosDeActividad, AsignacionResponse, getAsignaciones } from '../api/asignaciones';
import { createAsistencia, AsistenciaBackend } from '../api/asistencias';
import { useAuth } from '../context/AuthContext';

interface AsistenciaTemp {
  personaDni: string;
  estado: 'presente' | 'ausente' | 'justificada';
}

const TomarAsistencia: React.FC = () => {
  const [actividadSeleccionada, setActividadSeleccionada] = useState('');
  const [asistenciasTemp, setAsistenciasTemp] = useState<AsistenciaTemp[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string>('');
  const [actividades, setActividades] = useState<ActividadResponse[]>([]);
  const [asignacionesActividad, setAsignacionesActividad] = useState<AsignacionResponse[]>([]);
  const [loadingActividades, setLoadingActividades] = useState(true);
  const [loadingAlumnos, setLoadingAlumnos] = useState(false);
  
  const { user } = useAuth();

  useEffect(() => {
    const cargarActividades = async () => {
      try {
        setLoadingActividades(true);
        const [actividadesData, asignaciones] = await Promise.all([
          getActividades(),
          getAsignaciones()
        ]);

        // Si el usuario tiene permiso de TOMAR_ASISTENCIA, debe ver solo las actividades donde esté asignado como PROFESOR/A o AYUDANTE
        const dniUser = user?.personaDni; // en AuthContext guardamos personaDni
        let actividadesFiltradas = actividadesData;
        if (dniUser) {
          const misAsignaciones = asignaciones.filter(a => 
            a.dni === dniUser && ['profesor/a', 'ayudante'].includes(a.role.toLowerCase())
          );
          const idsPermitidos = new Set(misAsignaciones.map(a => a.activity_id));
          actividadesFiltradas = actividadesData.filter(act => idsPermitidos.has(act.id));
        }

        setActividades(actividadesFiltradas);
      } catch (error) {
        console.error('Error al cargar actividades:', error);
        setMensaje('Error al cargar actividades');
      } finally {
        setLoadingActividades(false);
      }
    };

    cargarActividades();
  }, [user]);

  // useEffect para cargar alumnos de la actividad
  useEffect(() => {
    const cargarAlumnos = async () => {
      if (!actividadSeleccionada) {
        setAsignacionesActividad([]);
        setAsistenciasTemp([]);
        return;
      }

      try {
        setLoadingAlumnos(true);
        const alumnosData = await getAlumnosDeActividad(parseInt(actividadSeleccionada));
        setAsignacionesActividad(alumnosData);
        
        // Inicializar asistencias temp
        const nuevasAsistencias = alumnosData.map(asignacion => ({
          personaDni: asignacion.dni,
          estado: 'ausente' as const
        }));
        setAsistenciasTemp(nuevasAsistencias);
      } catch (error) {
        console.error('Error al cargar alumnos:', error);
        setMensaje('❌ Error al cargar alumnos de la actividad');
      } finally {
        setLoadingAlumnos(false);
      }
    };

    cargarAlumnos();
  }, [actividadSeleccionada]);

  const cambiarEstado = (personaDni: string, nuevoEstado: 'presente' | 'ausente' | 'justificada') => {
    setAsistenciasTemp(prev => 
      prev.map(asistencia => 
        asistencia.personaDni === personaDni 
          ? { ...asistencia, estado: nuevoEstado }
          : asistencia
      )
    );
  };

  const guardarAsistencias = async () => {
    if (!actividadSeleccionada || asistenciasTemp.length === 0 || !user) return;

    setGuardando(true);
    try {
      const fechaHoy = new Date().toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      // Crear asistencias para cada alumno
      const promesasAsistencias = asistenciasTemp.map(async (asistenciaTemp) => {
        // Encontrar la asignación correspondiente
        const asignacion = asignacionesActividad.find(a => a.dni === asistenciaTemp.personaDni);
        if (!asignacion) {
          throw new Error(`No se encontró asignación para DNI: ${asistenciaTemp.personaDni}`);
        }

        // Mapear estado a número
        const statusMap = {
          'ausente': 0,
          'presente': 1,
          'justificada': 2
        };

        const asistenciaData: AsistenciaBackend = {
          person_dni: asistenciaTemp.personaDni,
          supervisor_dni: user.personaDni, // El coach que toma asistencia
          assignation_id: asignacion.id,
          user_id: user.id,
          status: statusMap[asistenciaTemp.estado],
          day: fechaHoy
        };

        return createAsistencia(asistenciaData);
      });

      await Promise.all(promesasAsistencias);
      
      setMensaje('✅ Asistencias guardadas correctamente');
      // Limpiar formulario
      setActividadSeleccionada('');
      setAsistenciasTemp([]);
      
      setTimeout(() => setMensaje(''), 3000);
    } catch (error: any) {
      console.error('Error al guardar asistencias:', error);
      setMensaje(`❌ Error al guardar: ${error.message}`);
      setTimeout(() => setMensaje(''), 5000);
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
          disabled={loadingActividades}
          className="w-full p-3 sm:p-4 text-base sm:text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">
            {loadingActividades ? 'Cargando actividades...' : 'Elegir actividad...'}
          </option>
          {actividades.map(actividad => (
            <option key={actividad.id} value={actividad.id.toString()}>
              {actividad.name} - {actividad.category}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de asistencia - Solo si hay actividad seleccionada */}
      {actividadSeleccionada && asistenciasTemp.length > 0 && (
        <>
          {/* Lista de alumnos */}
          <div className="space-y-3 sm:space-y-4 mb-20 sm:mb-24">
            {loadingAlumnos ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto"></div>
                <p className="mt-2 text-gray-600">Cargando alumnos...</p>
              </div>
            ) : (
              asistenciasTemp.map((asistencia) => {
                const asignacion = asignacionesActividad.find(a => a.dni === asistencia.personaDni);
                if (!asignacion) return null;
                
                return (
                  <div key={asignacion.dni} className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-200">
                    {/* Nombre del alumno */}
                    <div className="mb-3 sm:mb-4 text-center">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                        {asignacion.person}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500">DNI: {asignacion.dni}</p>
                    </div>

                    {/* Botones de estado */}
                    <div className="flex gap-1 sm:gap-2">
                      <button
                        onClick={() => cambiarEstado(asignacion.dni, 'presente')}
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
                        onClick={() => cambiarEstado(asignacion.dni, 'ausente')}
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
                        onClick={() => cambiarEstado(asignacion.dni, 'justificada')}
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
              })
            )}
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