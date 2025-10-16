import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Calendar, User, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import { useAuth } from '../context/AuthContext';
import { getAsistencias, AsistenciaResponse } from '../api/asistencias';
import { getActividades, ActividadResponse } from '../api/actividades';
import { getAsignaciones, AsignacionResponse } from '../api/asignaciones';

const Asistencias: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [actividadFilter, setActividadFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [selectedAsistencia, setSelectedAsistencia] = useState<AsistenciaResponse | null>(null);
  const [asistencias, setAsistencias] = useState<AsistenciaResponse[]>([]);
  const [actividades, setActividades] = useState<ActividadResponse[]>([]);
  const [asignaciones, setAsignaciones] = useState<AsignacionResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // useEffect para cargar datos
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const [asistenciasData, actividadesData, asignacionesData] = await Promise.all([
          getAsistencias(),
          getActividades(),
          getAsignaciones()
        ]);
        
        setAsistencias(asistenciasData);
        setAsignaciones(asignacionesData);

        // Filtrar actividades según rol: Administrador ve todas; PROFESOR/A sólo las asignadas; otros ninguna
        const roles = user?.persona?.roles?.map(r => r.toLowerCase()) || [];
        const isAdmin = roles.includes('administrador');
        const isDocente = roles.includes('profesor/a') || roles.includes('ayudante');
        const dniUser = user?.personaDni;

        if (isAdmin) {
          setActividades(actividadesData);
        } else if (isDocente && dniUser) {
          const rolesDocentes = ['profesor/a', 'ayudante'];
          const misAsignacionesDocente = asignacionesData.filter(a => 
            a.dni === dniUser && rolesDocentes.includes(a.role.toLowerCase())
          );
          const idsPermitidos = new Set(misAsignacionesDocente.map(a => a.activity_id));
          const actividadesFiltradas = actividadesData.filter(act => idsPermitidos.has(act.id));
          setActividades(actividadesFiltradas);
        } else {
          setActividades([]);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [user]);

  const handleOpenModal = (asistencia: AsistenciaResponse) => {
    setSelectedAsistencia(asistencia);
    document.body.classList.add('modal-open');
  };

  const handleCloseModal = () => {
    setSelectedAsistencia(null);
    document.body.classList.remove('modal-open');
  };

  const getPersonaFromAsignacion = (dni: string) => {
    const asignacion = asignaciones.find(a => a.dni === dni);
    return asignacion ? { name: asignacion.person, dni } : null;
  };

  const getActividadById = (assignationId: number) => {
    // Buscar la asignación para obtener el activity_id
    const asignacion = asignaciones.find(a => a.id === assignationId);
    if (!asignacion) return null;
    
    return actividades.find(a => a.id === asignacion.activity_id);
  };

  const getEstadoFromStatus = (status: number): { presente: boolean, justificada: boolean } => {
    switch (status) {
      case 1: return { presente: true, justificada: false };
      case 2: return { presente: false, justificada: true };
      default: return { presente: false, justificada: false };
    }
  };

  const filteredAsistencias = useMemo(() => {
    // Normalizamos roles del usuario y precomputamos actividades permitidas si es PROFESOR/A
    const roles = user?.persona?.roles?.map(r => r.toLowerCase()) || [];
    const isAdmin = roles.includes('administrador');
    const isDocente = roles.includes('profesor/a') || roles.includes('ayudante');
    const dniUser = user?.personaDni;
    const actividadesPermitidasDocente = new Set<number>();
    if (!isAdmin && isDocente && dniUser) {
      const rolesDocentes = ['profesor/a', 'ayudante'];
      asignaciones
        .filter(a => a.dni === dniUser && rolesDocentes.includes(a.role.toLowerCase()))
        .forEach(a => actividadesPermitidasDocente.add(a.activity_id));
    }

    return asistencias.filter(asistencia => {
      const persona = getPersonaFromAsignacion(asistencia.person_dni);
      const actividad = getActividadById(asistencia.assignation_id);
      const estado = getEstadoFromStatus(asistencia.status);

      const matchesSearch = 
        persona?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        persona?.dni.includes(searchTerm) ||
        asistencia.person_dni.includes(searchTerm) ||
        actividad?.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesActividad = actividadFilter === '' || actividad?.id === parseInt(actividadFilter);
      
      const matchesEstado = estadoFilter === '' || 
        (estadoFilter === 'presente' && estado.presente) ||
        (estadoFilter === 'ausente' && !estado.presente && !estado.justificada) ||
        (estadoFilter === 'justificada' && !estado.presente && estado.justificada);
      
      const matchesFechaDesde = fechaDesde === '' || asistencia.day >= fechaDesde;
      const matchesFechaHasta = fechaHasta === '' || asistencia.day <= fechaHasta;

      // Si no hay actividad asociada a la asistencia, ocultar para usuarios no administradores
      if (!isAdmin && !actividad) {
        return false;
      }

      // Visibilidad según rol
      if (isAdmin) {
        return matchesSearch && matchesActividad && matchesEstado && matchesFechaDesde && matchesFechaHasta;
      }

      if (isDocente) {
        const actividadId = actividad?.id;
        const permitido = actividadId !== undefined && actividadesPermitidasDocente.has(actividadId);
        if (!permitido) return false;
        return matchesSearch && matchesActividad && matchesEstado && matchesFechaDesde && matchesFechaHasta;
      }

      // Otros roles: no ver asistencias
      return false;
    });
  }, [asistencias, searchTerm, actividadFilter, estadoFilter, fechaDesde, fechaHasta, user, asignaciones, actividades]);

  const getEstadoColor = (asistencia: AsistenciaResponse) => {
    const estado = getEstadoFromStatus(asistencia.status);
    if (estado.presente) return 'bg-emerald-100 text-emerald-800';
    if (estado.justificada) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getEstadoIcon = (asistencia: AsistenciaResponse) => {
    const estado = getEstadoFromStatus(asistencia.status);
    if (estado.presente) return <CheckCircle size={16} className="text-emerald-600" />;
    if (estado.justificada) return <AlertCircle size={16} className="text-yellow-600" />;
    return <XCircle size={16} className="text-red-600" />;
  };

  const getEstadoText = (asistencia: AsistenciaResponse) => {
    const estado = getEstadoFromStatus(asistencia.status);
    if (estado.presente) return 'Presente';
    if (estado.justificada) return 'Justificada';
    return 'Ausente';
  };

  const estadisticas = useMemo(() => {
    const estadosCalculados = filteredAsistencias.map(a => getEstadoFromStatus(a.status));
    
    return {
      total: filteredAsistencias.length,
      presentes: estadosCalculados.filter(e => e.presente).length,
      ausentes: estadosCalculados.filter(e => !e.presente && !e.justificada).length,
      justificadas: estadosCalculados.filter(e => !e.presente && e.justificada).length
    };
  }, [filteredAsistencias]);

  const porcentajeAsistencia = estadisticas.total > 0 
    ? Math.round((estadisticas.presentes / estadisticas.total) * 100)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando asistencias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Asistencias</h1>
          <p className="text-gray-600 mt-1">Registro y seguimiento de asistencias</p>
        </div>
        {/* Botón de exportación removido */}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Card className="bg-primary-50 border-primary-200">
          <div className="flex flex-col items-center text-center p-3">
            <Calendar className="text-primary-600 mb-2" size={20} />
            <p className="text-xs font-medium text-primary-700 mb-1">Total</p>
            <p className="text-xl font-bold text-primary-900">{estadisticas.total}</p>
          </div>
        </Card>
        
        <Card className="bg-emerald-50 border-emerald-200">
          <div className="flex flex-col items-center text-center p-3">
            <CheckCircle className="text-emerald-600 mb-2" size={20} />
            <p className="text-xs font-medium text-emerald-700 mb-1">Presentes</p>
            <p className="text-xl font-bold text-emerald-900">{estadisticas.presentes}</p>
          </div>
        </Card>
        
        <Card className="bg-red-50 border-red-200">
          <div className="flex flex-col items-center text-center p-3">
            <XCircle className="text-red-600 mb-2" size={20} />
            <p className="text-xs font-medium text-red-700 mb-1">Ausentes</p>
            <p className="text-xl font-bold text-red-900">{estadisticas.ausentes}</p>
          </div>
        </Card>
        
        <Card className="bg-yellow-50 border-yellow-200">
          <div className="flex flex-col items-center text-center p-3">
            <AlertCircle className="text-yellow-600 mb-2" size={20} />
            <p className="text-xs font-medium text-yellow-700 mb-1">Justificadas</p>
            <p className="text-xl font-bold text-yellow-900">{estadisticas.justificadas}</p>
          </div>
        </Card>
        
        <Card className="bg-gray-50 border-gray-200 col-span-2 lg:col-span-1">
          <div className="flex flex-col items-center text-center p-3">
            <User className="text-gray-600 mb-2" size={20} />
            <p className="text-xs font-medium text-gray-700 mb-1">% Asistencia</p>
            <p className="text-xl font-bold text-gray-900">{porcentajeAsistencia}%</p>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Buscar por nombre, DNI o actividad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <select
                value={actividadFilter}
                onChange={(e) => setActividadFilter(e.target.value)}
                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              >
                <option value="">Todas las actividades</option>
                {actividades.map(actividad => (
                  <option key={actividad.id} value={actividad.id}>
                    {actividad.name} - {actividad.category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              >
                <option value="">Todos los estados</option>
                <option value="presente">Presente</option>
                <option value="ausente">Ausente</option>
                <option value="justificada">Justificada</option>
              </select>
            </div>

            <div>
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                placeholder="Fecha desde"
              />
            </div>

            <div>
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                placeholder="Fecha hasta"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Lista de Asistencias */}
      <div className="space-y-4">
        {filteredAsistencias.map((asistencia) => {
          const persona = getPersonaFromAsignacion(asistencia.person_dni);
          const actividad = getActividadById(asistencia.assignation_id);
          const coach = getPersonaFromAsignacion(asistencia.supervisor_dni);
          
          return (
            <Card key={asistencia.id} className="hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-600">
                    {asistencia.day}
                  </div>
                  <div className="flex items-center space-x-2">
                    {getEstadoIcon(asistencia)}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getEstadoColor(asistencia)}`}>
                      {getEstadoText(asistencia)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-700 font-bold text-sm">
                      {persona?.name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-lg">
                      {persona?.name || 'Nombre no disponible'}
                    </p>
                    <p className="text-sm text-gray-600">DNI: {persona?.dni || 'N/A'}</p>
                  </div>
                  <button 
                    onClick={() => handleOpenModal(asistencia)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg flex-shrink-0"
                  >
                    <Eye size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Actividad</p>
                    <p className="font-medium text-gray-900">{actividad?.name || 'Actividad no disponible'}</p>
                    <p className="text-sm text-gray-600">{actividad?.category || 'Categoría no disponible'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Coach</p>
                    <p className="font-medium text-gray-900">{coach?.name || 'Coach no disponible'}</p>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
        
        {filteredAsistencias.length === 0 && (
          <Card>
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No se encontraron asistencias</p>
              <p className="text-gray-400">Intenta ajustar los filtros de búsqueda</p>
            </div>
          </Card>
        )}
      </div>

      {/* Modal de Detalle */}
      {selectedAsistencia && (
        <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-2xl w-full max-w-md mx-auto transform transition-all">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Detalle de Asistencia</h3>
                <button
                  onClick={handleCloseModal}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <XCircle size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-center mb-6">
                  <div className="flex items-center space-x-3">
                    {getEstadoIcon(selectedAsistencia)}
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${getEstadoColor(selectedAsistencia)}`}>
                      {getEstadoText(selectedAsistencia)}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Fecha</label>
                    <p className="text-gray-900 font-medium">{selectedAsistencia.day}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Persona</label>
                    <p className="text-gray-900 font-medium">
                      {getPersonaFromAsignacion(selectedAsistencia.person_dni)?.name || 'Nombre no disponible'}
                    </p>
                    <p className="text-sm text-gray-600">
                      DNI: {selectedAsistencia.person_dni}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Actividad</label>
                    <p className="text-gray-900 font-medium">
                      {getActividadById(selectedAsistencia.assignation_id)?.name || 'Actividad no disponible'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {getActividadById(selectedAsistencia.assignation_id)?.category || 'Categoría no disponible'}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Coach</label>
                    <p className="text-gray-900 font-medium">
                      {getPersonaFromAsignacion(selectedAsistencia.supervisor_dni)?.name || 'Coach no disponible'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-8">
                <Button 
                  variant="secondary" 
                  onClick={handleCloseModal}
                  className="w-full sm:w-auto"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Asistencias;