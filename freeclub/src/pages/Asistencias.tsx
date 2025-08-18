import React, { useState, useMemo } from 'react';
import { Search, Filter, Calendar, User, CheckCircle, XCircle, AlertCircle, Download, Eye } from 'lucide-react';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import { mockAsistencias, mockPersonas, mockActividades } from '../data/mockData';
import { Asistencia } from '../types';
import { useAuth } from '../context/AuthContext';

const Asistencias: React.FC = () => {
  const { user } = useAuth();
  const [asistencias] = useState<Asistencia[]>(mockAsistencias);
  const [searchTerm, setSearchTerm] = useState('');
  const [actividadFilter, setActividadFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [selectedAsistencia, setSelectedAsistencia] = useState<Asistencia | null>(null);

  const handleOpenModal = (asistencia: Asistencia) => {
    setSelectedAsistencia(asistencia);
    // Prevenir scroll del body
    document.body.classList.add('modal-open');
  };

  const handleCloseModal = () => {
    setSelectedAsistencia(null);
    // Restaurar scroll del body
    document.body.classList.remove('modal-open');
  };

  const filteredAsistencias = useMemo(() => {
    return asistencias.filter(asistencia => {
      const persona = mockPersonas.find(p => p.dni === asistencia.personaDni);
      const actividad = mockActividades.find(a => a.id === asistencia.actividadId);
      
      const matchesSearch = 
        persona?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        persona?.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        persona?.dni.includes(searchTerm) ||
        actividad?.nombre.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesActividad = actividadFilter === '' || asistencia.actividadId === actividadFilter;
      
      const matchesEstado = estadoFilter === '' || 
        (estadoFilter === 'presente' && asistencia.presente) ||
        (estadoFilter === 'ausente' && !asistencia.presente && !asistencia.justificada) ||
        (estadoFilter === 'justificada' && !asistencia.presente && asistencia.justificada);
      
      const matchesFechaDesde = fechaDesde === '' || asistencia.fecha >= fechaDesde;
      const matchesFechaHasta = fechaHasta === '' || asistencia.fecha <= fechaHasta;
      
      // Si es coach, solo ver sus asistencias
      if (user?.persona.roles.includes('coach') && !user?.persona.roles.includes('superadmin')) {
        const matchesCoach = asistencia.coach === user.personaDni;
        return matchesSearch && matchesActividad && matchesEstado && matchesFechaDesde && matchesFechaHasta && matchesCoach;
      }
      
      return matchesSearch && matchesActividad && matchesEstado && matchesFechaDesde && matchesFechaHasta;
    });
  }, [asistencias, searchTerm, actividadFilter, estadoFilter, fechaDesde, fechaHasta, user]);

  const getEstadoColor = (asistencia: Asistencia) => {
    if (asistencia.presente) return 'bg-emerald-100 text-emerald-800';
    if (asistencia.justificada) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getEstadoIcon = (asistencia: Asistencia) => {
    if (asistencia.presente) return <CheckCircle size={16} className="text-emerald-600" />;
    if (asistencia.justificada) return <AlertCircle size={16} className="text-yellow-600" />;
    return <XCircle size={16} className="text-red-600" />;
  };

  const getEstadoText = (asistencia: Asistencia) => {
    if (asistencia.presente) return 'Presente';
    if (asistencia.justificada) return 'Justificada';
    return 'Ausente';
  };

  const estadisticas = {
    total: filteredAsistencias.length,
    presentes: filteredAsistencias.filter(a => a.presente).length,
    ausentes: filteredAsistencias.filter(a => !a.presente && !a.justificada).length,
    justificadas: filteredAsistencias.filter(a => !a.presente && a.justificada).length
  };

  const porcentajeAsistencia = estadisticas.total > 0 
    ? Math.round((estadisticas.presentes / estadisticas.total) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4 space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Asistencias</h1>
          <p className="text-gray-600 mt-1">Registro y seguimiento de asistencias</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="secondary" icon={Download} size="sm" className="flex-1 sm:flex-none">
            Exportar
          </Button>
        </div>
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
          {/* Búsqueda principal */}
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
          
          {/* Filtros secundarios */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <select
                value={actividadFilter}
                onChange={(e) => setActividadFilter(e.target.value)}
                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              >
                <option value="">Todas las actividades</option>
                {mockActividades.map(actividad => (
                  <option key={actividad.id} value={actividad.id}>
                    {actividad.nombre}
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

      {/* Lista de Asistencias - Vista Mobile First */}
      <div className="space-y-4">
        {filteredAsistencias.map((asistencia) => {
          const persona = mockPersonas.find(p => p.dni === asistencia.personaDni);
          const actividad = mockActividades.find(a => a.id === asistencia.actividadId);
          const coach = mockPersonas.find(p => p.dni === asistencia.coach);
          
          return (
            <Card key={asistencia.id} className="hover:shadow-md transition-shadow">
              <div className="space-y-3">
                {/* Header con fecha y estado */}
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-600">
                    {new Date(asistencia.fecha).toLocaleDateString('es-AR')}
                  </div>
                  <div className="flex items-center space-x-2">
                    {getEstadoIcon(asistencia)}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getEstadoColor(asistencia)}`}>
                      {getEstadoText(asistencia)}
                    </span>
                  </div>
                </div>

                {/* Información de la persona */}
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-700 font-bold text-sm">
                      {persona?.name.charAt(0)}{persona?.lastname.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-lg">
                      {persona?.name} {persona?.lastname}
                    </p>
                    <p className="text-sm text-gray-600">DNI: {persona?.dni}</p>
                  </div>
                  <button 
                    onClick={() => handleOpenModal(asistencia)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg flex-shrink-0"
                  >
                    <Eye size={20} />
                  </button>
                </div>

                {/* Información de actividad y coach */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Actividad</p>
                    <p className="font-medium text-gray-900">{actividad?.nombre}</p>
                    <p className="text-sm text-gray-600">{actividad?.horario}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Coach</p>
                    <p className="font-medium text-gray-900">{coach?.name} {coach?.lastname}</p>
                  </div>
                </div>

                {/* Observaciones si existen */}
                {asistencia.observaciones && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Observaciones</p>
                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                      {asistencia.observaciones}
                    </p>
                  </div>
                )}
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

      {/* Modal de Detalle - Optimizado para móvil */}
      {selectedAsistencia && (
        <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-2xl w-full max-w-md mx-auto transform transition-all">
            <div className="p-6">
              {/* Header del modal */}
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
                {/* Estado principal */}
                <div className="flex items-center justify-center mb-6">
                  <div className="flex items-center space-x-3">
                    {getEstadoIcon(selectedAsistencia)}
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${getEstadoColor(selectedAsistencia)}`}>
                      {getEstadoText(selectedAsistencia)}
                    </span>
                  </div>
                </div>

                {/* Información principal */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Fecha</label>
                    <p className="text-gray-900 font-medium">
                      {new Date(selectedAsistencia.fecha).toLocaleDateString('es-AR')}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Persona</label>
                    <p className="text-gray-900 font-medium">
                      {mockPersonas.find(p => p.dni === selectedAsistencia.personaDni)?.name} {' '}
                      {mockPersonas.find(p => p.dni === selectedAsistencia.personaDni)?.lastname}
                    </p>
                    <p className="text-sm text-gray-600">
                      DNI: {mockPersonas.find(p => p.dni === selectedAsistencia.personaDni)?.dni}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Actividad</label>
                    <p className="text-gray-900 font-medium">
                      {mockActividades.find(a => a.id === selectedAsistencia.actividadId)?.nombre}
                    </p>
                    <p className="text-sm text-gray-600">
                      {mockActividades.find(a => a.id === selectedAsistencia.actividadId)?.horario}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Coach</label>
                    <p className="text-gray-900 font-medium">
                      {mockPersonas.find(p => p.dni === selectedAsistencia.coach)?.name} {' '}
                      {mockPersonas.find(p => p.dni === selectedAsistencia.coach)?.lastname}
                    </p>
                  </div>
                </div>
                
                {selectedAsistencia.observaciones && (
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Observaciones</label>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-gray-900">
                        {selectedAsistencia.observaciones}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end mt-8">
                <Button 
                  variant="secondary" 
                  onClick={() => setSelectedAsistencia(null)}
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