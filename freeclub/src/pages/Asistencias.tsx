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

  const filteredAsistencias = useMemo(() => {
    return asistencias.filter(asistencia => {
      const persona = mockPersonas.find(p => p.dni === asistencia.personaDni);
      const actividad = mockActividades.find(a => a.id === asistencia.actividadId);
      
      const matchesSearch = 
        persona?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        persona?.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    if (asistencia.justificada) return 'bg-cream-100 text-cream-800';
    return 'bg-danger-100 text-danger-800';
  };

  const getEstadoIcon = (asistencia: Asistencia) => {
    if (asistencia.presente) return <CheckCircle size={16} className="text-emerald-600" />;
    if (asistencia.justificada) return <AlertCircle size={16} className="text-cream-600" />;
    return <XCircle size={16} className="text-danger-600" />;
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-900">Asistencias</h1>
          <p className="text-dark-600 mt-1">Registro y seguimiento de asistencias</p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <Button variant="secondary" icon={Download} size="sm">
            Exportar
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-primary-50 border-primary-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-700">Total Registros</p>
              <p className="text-2xl font-bold text-primary-900">{estadisticas.total}</p>
            </div>
            <Calendar className="text-primary-600" size={24} />
          </div>
        </Card>
        
        <Card className="bg-emerald-50 border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700">Presentes</p>
              <p className="text-2xl font-bold text-emerald-900">{estadisticas.presentes}</p>
            </div>
            <CheckCircle className="text-emerald-600" size={24} />
          </div>
        </Card>
        
        <Card className="bg-danger-50 border-danger-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-danger-700">Ausentes</p>
              <p className="text-2xl font-bold text-danger-900">{estadisticas.ausentes}</p>
            </div>
            <XCircle className="text-danger-600" size={24} />
          </div>
        </Card>
        
        <Card className="bg-cream-50 border-cream-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-cream-700">Justificadas</p>
              <p className="text-2xl font-bold text-cream-900">{estadisticas.justificadas}</p>
            </div>
            <AlertCircle className="text-cream-600" size={24} />
          </div>
        </Card>
        
        <Card className="bg-dark-50 border-dark-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-700">% Asistencia</p>
              <p className="text-2xl font-bold text-dark-900">{porcentajeAsistencia}%</p>
            </div>
            <User className="text-dark-600" size={24} />
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400" size={16} />
            <input
              type="text"
              placeholder="Buscar por nombre, DNI o actividad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400" size={16} />
            <select
              value={actividadFilter}
              onChange={(e) => setActividadFilter(e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
              className="w-full px-4 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
              className="w-full px-4 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Fecha desde"
            />
          </div>

          <div>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="w-full px-4 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Fecha hasta"
            />
          </div>
        </div>
      </Card>

      {/* Lista de Asistencias */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-200">
                <th className="text-left py-3 px-4 font-semibold text-dark-700">Fecha</th>
                <th className="text-left py-3 px-4 font-semibold text-dark-700">Persona</th>
                <th className="text-left py-3 px-4 font-semibold text-dark-700">Actividad</th>
                <th className="text-left py-3 px-4 font-semibold text-dark-700">Coach</th>
                <th className="text-left py-3 px-4 font-semibold text-dark-700">Estado</th>
                <th className="text-left py-3 px-4 font-semibold text-dark-700">Observaciones</th>
                <th className="text-left py-3 px-4 font-semibold text-dark-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAsistencias.map((asistencia) => {
                const persona = mockPersonas.find(p => p.dni === asistencia.personaDni);
                const actividad = mockActividades.find(a => a.id === asistencia.actividadId);
                const coach = mockPersonas.find(p => p.dni === asistencia.coach);
                
                return (
                  <tr key={asistencia.id} className="border-b border-dark-100 hover:bg-dark-50">
                    <td className="py-4 px-4 text-dark-900 font-medium">
                      {new Date(asistencia.fecha).toLocaleDateString('es-AR')}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-700 font-semibold text-xs">
                            {persona?.nombre.charAt(0)}{persona?.apellido.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-dark-900">
                            {persona?.nombre} {persona?.apellido}
                          </p>
                          <p className="text-sm text-dark-500">DNI: {persona?.dni}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-dark-900">{actividad?.nombre}</p>
                        <p className="text-sm text-dark-500">{actividad?.horario}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-dark-900">{coach?.nombre} {coach?.apellido}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        {getEstadoIcon(asistencia)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(asistencia)}`}>
                          {getEstadoText(asistencia)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-dark-600 max-w-xs truncate">
                        {asistencia.observaciones || '-'}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <button 
                        onClick={() => setSelectedAsistencia(asistencia)}
                        className="p-1 text-primary-600 hover:bg-primary-50 rounded"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredAsistencias.length === 0 && (
          <div className="text-center py-8">
            <p className="text-dark-500">No se encontraron asistencias con los filtros aplicados</p>
          </div>
        )}
      </Card>

      {/* Modal de Detalle */}
      {selectedAsistencia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-dark-900 mb-4">Detalle de Asistencia</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-dark-700">Fecha:</label>
                  <p className="text-dark-900">{new Date(selectedAsistencia.fecha).toLocaleDateString('es-AR')}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-dark-700">Persona:</label>
                  <p className="text-dark-900">
                    {mockPersonas.find(p => p.dni === selectedAsistencia.personaDni)?.nombre} {' '}
                    {mockPersonas.find(p => p.dni === selectedAsistencia.personaDni)?.apellido}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-dark-700">Actividad:</label>
                  <p className="text-dark-900">
                    {mockActividades.find(a => a.id === selectedAsistencia.actividadId)?.nombre}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-dark-700">Estado:</label>
                  <div className="flex items-center space-x-2 mt-1">
                    {getEstadoIcon(selectedAsistencia)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(selectedAsistencia)}`}>
                      {getEstadoText(selectedAsistencia)}
                    </span>
                  </div>
                </div>
                
                {selectedAsistencia.observaciones && (
                  <div>
                    <label className="text-sm font-medium text-dark-700">Observaciones:</label>
                    <p className="text-dark-900 bg-dark-50 p-2 rounded mt-1">
                      {selectedAsistencia.observaciones}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end mt-6">
                <Button 
                  variant="secondary" 
                  onClick={() => setSelectedAsistencia(null)}
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