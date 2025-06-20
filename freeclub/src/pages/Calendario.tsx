import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Users, MapPin, Clock, Filter, Settings } from 'lucide-react';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import EventoForm from '../forms/EventoForm';
import { mockActividades, feriadosArgentinos2024, mockPersonas, mockAsistencias } from '../data/mockData';
import { EventoCalendario } from '../types';
import { useAuth } from '../context/AuthContext';

const Calendario: React.FC = () => {
  const { user } = useAuth();
  const [fechaActual, setFechaActual] = useState(new Date());
  const [vistaActual, setVistaActual] = useState<'mes' | 'semana'>('mes');
  const [filtroActividad, setFiltroActividad] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [eventoSeleccionado, setEventoSeleccionado] = useState<EventoCalendario | null>(null);
  const [showEventoForm, setShowEventoForm] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>('');
  const [showFiltros, setShowFiltros] = useState(false);
  const [eventos, setEventos] = useState<EventoCalendario[]>([]);

  // Generar eventos del calendario
  const eventosGenerados = useMemo(() => {
    const eventosGenerados: EventoCalendario[] = [...eventos];
    
    // Agregar feriados
    feriadosArgentinos2024.forEach(feriado => {
      eventosGenerados.push({
        id: `feriado-${feriado.fecha}`,
        titulo: feriado.nombre,
        fecha: feriado.fecha,
        tipo: 'feriado',
        descripcion: 'Feriado Nacional',
        color: '#c1121f'
      });
    });

    // Generar entrenamientos para el mes actual
    const inicioMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
    const finMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0);
    
    for (let fecha = new Date(inicioMes); fecha <= finMes; fecha.setDate(fecha.getDate() + 1)) {
      const diaSemana = fecha.toLocaleDateString('es-AR', { weekday: 'long' }).toLowerCase();
      
      mockActividades.forEach(actividad => {
        if (actividad.diasSemana.includes(diaSemana) && actividad.activa) {
          // Para alumnos, solo mostrar sus actividades
          if (user?.persona.roles.includes('alumno') && !user?.persona.roles.includes('superadmin')) {
            // En un sistema real, esto vendría de una tabla de inscripciones
            // Por ahora, simulamos que todos los alumnos están en todas las actividades
          }
          
          // Para coaches, solo mostrar sus actividades
          if (user?.persona.roles.includes('coach') && 
              !user?.persona.roles.includes('superadmin') && 
              actividad.coachDni !== user.personaDni) {
            return;
          }

          eventosGenerados.push({
            id: `entrenamiento-${actividad.id}-${fecha.toISOString().split('T')[0]}`,
            titulo: actividad.nombre,
            fecha: fecha.toISOString().split('T')[0],
            tipo: 'entrenamiento',
            descripcion: actividad.descripcion,
            actividadId: actividad.id,
            coachDni: actividad.coachDni,
            horaInicio: actividad.horario.split('-')[0],
            horaFin: actividad.horario.split('-')[1],
            color: '#669bbc'
          });
        }
      });
    }

    return eventosGenerados;
  }, [fechaActual, user, eventos]);

  // Filtrar eventos
  const eventosFiltrados = useMemo(() => {
    let filtrados = eventosGenerados;

    if (filtroActividad) {
      filtrados = filtrados.filter(evento => 
        evento.actividadId === filtroActividad || evento.tipo === 'feriado'
      );
    }

    if (filtroTipo) {
      filtrados = filtrados.filter(evento => evento.tipo === filtroTipo);
    }

    return filtrados;
  }, [eventosGenerados, filtroActividad, filtroTipo]);

  // Obtener días del mes
  const diasDelMes = useMemo(() => {
    const inicioMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
    const finMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0);
    const inicioPrimeraSemana = new Date(inicioMes);
    inicioPrimeraSemana.setDate(inicioPrimeraSemana.getDate() - inicioMes.getDay());
    
    const dias = [];
    const fechaActualIteracion = new Date(inicioPrimeraSemana);
    
    while (fechaActualIteracion <= finMes || fechaActualIteracion.getDay() !== 0) {
      dias.push(new Date(fechaActualIteracion));
      fechaActualIteracion.setDate(fechaActualIteracion.getDate() + 1);
    }
    
    return dias;
  }, [fechaActual]);

  const cambiarMes = (direccion: 'anterior' | 'siguiente') => {
    setFechaActual(prev => {
      const nuevaFecha = new Date(prev);
      if (direccion === 'anterior') {
        nuevaFecha.setMonth(prev.getMonth() - 1);
      } else {
        nuevaFecha.setMonth(prev.getMonth() + 1);
      }
      return nuevaFecha;
    });
  };

  const obtenerEventosDelDia = (fecha: Date) => {
    const fechaStr = fecha.toISOString().split('T')[0];
    return eventosFiltrados.filter(evento => evento.fecha === fechaStr);
  };

  const esHoy = (fecha: Date) => {
    const hoy = new Date();
    return fecha.toDateString() === hoy.toDateString();
  };

  const esMesActual = (fecha: Date) => {
    return fecha.getMonth() === fechaActual.getMonth();
  };

  const getColorEvento = (tipo: EventoCalendario['tipo']) => {
    switch (tipo) {
      case 'entrenamiento':
        return 'bg-primary-100 text-primary-800 border-primary-200';
      case 'partido':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'evento':
        return 'bg-cream-100 text-cream-800 border-cream-200';
      case 'feriado':
        return 'bg-danger-100 text-danger-800 border-danger-200';
      default:
        return 'bg-dark-100 text-dark-800 border-dark-200';
    }
  };

  const handleDayClick = (fecha: Date) => {
    const fechaStr = fecha.toISOString().split('T')[0];
    setFechaSeleccionada(fechaStr);
    setShowEventoForm(true);
  };

  const handleSaveEvento = (evento: EventoCalendario) => {
    setEventos(prev => {
      const existe = prev.find(e => e.id === evento.id);
      if (existe) {
        return prev.map(e => e.id === evento.id ? evento : e);
      } else {
        return [...prev, evento];
      }
    });
    setShowEventoForm(false);
    setEventoSeleccionado(null);
    setFechaSeleccionada('');
  };

  const handleCancelEvento = () => {
    setShowEventoForm(false);
    setEventoSeleccionado(null);
    setFechaSeleccionada('');
  };

  const nombresMeses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Para alumnos, mostrar sus asistencias
  const obtenerAsistenciasAlumno = (fecha: Date) => {
    if (!user?.persona.roles.includes('alumno')) return [];
    
    const fechaStr = fecha.toISOString().split('T')[0];
    return mockAsistencias.filter(a => 
      a.personaDni === user.personaDni && 
      a.fecha === fechaStr
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-900">Calendario</h1>
          <p className="text-dark-600 mt-1">
            {user?.persona.roles.includes('alumno') && !user?.persona.roles.includes('superadmin')
              ? 'Tus actividades y asistencias'
              : 'Programación de actividades y eventos'
            }
          </p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <Button 
            variant="secondary" 
            icon={Filter} 
            size="sm"
            onClick={() => setShowFiltros(!showFiltros)}
          >
            Filtros
          </Button>
          {!user?.persona.roles.includes('alumno') && (
            <Button 
              icon={Plus} 
              size="sm"
              onClick={() => setShowEventoForm(true)}
            >
              Nuevo Evento
            </Button>
          )}
        </div>
      </div>

      {/* Filtros Expandibles */}
      {showFiltros && (
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">
                Filtrar por actividad
              </label>
              <select
                value={filtroActividad}
                onChange={(e) => setFiltroActividad(e.target.value)}
                className="w-full px-3 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
              <label className="block text-sm font-medium text-dark-700 mb-2">
                Filtrar por tipo
              </label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="w-full px-3 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Todos los tipos</option>
                <option value="entrenamiento">Entrenamientos</option>
                <option value="partido">Partidos</option>
                <option value="evento">Eventos</option>
                <option value="feriado">Feriados</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => {
                  setFiltroActividad('');
                  setFiltroTipo('');
                }}
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Controles del Calendario */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => cambiarMes('anterior')}
                className="p-2 hover:bg-dark-100 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} className="text-dark-600" />
              </button>
              <h2 className="text-xl font-semibold text-dark-900 min-w-[200px] text-center">
                {nombresMeses[fechaActual.getMonth()]} {fechaActual.getFullYear()}
              </h2>
              <button
                onClick={() => cambiarMes('siguiente')}
                className="p-2 hover:bg-dark-100 rounded-lg transition-colors"
              >
                <ChevronRight size={20} className="text-dark-600" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex bg-dark-100 rounded-lg p-1">
              <button
                onClick={() => setVistaActual('mes')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  vistaActual === 'mes'
                    ? 'bg-white text-dark-900 shadow-sm'
                    : 'text-dark-600 hover:text-dark-900'
                }`}
              >
                Mes
              </button>
              <button
                onClick={() => setVistaActual('semana')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  vistaActual === 'semana'
                    ? 'bg-white text-dark-900 shadow-sm'
                    : 'text-dark-600 hover:text-dark-900'
                }`}
              >
                Semana
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Vista del Calendario */}
      <Card className="overflow-hidden">
        {/* Encabezados de días */}
        <div className="grid grid-cols-7 border-b border-dark-200">
          {diasSemana.map(dia => (
            <div key={dia} className="p-3 text-center font-semibold text-dark-700 bg-dark-50">
              {dia}
            </div>
          ))}
        </div>

        {/* Días del mes */}
        <div className="grid grid-cols-7">
          {diasDelMes.map((fecha, index) => {
            const eventosDelDia = obtenerEventosDelDia(fecha);
            const asistenciasDelDia = obtenerAsistenciasAlumno(fecha);
            const esHoyDia = esHoy(fecha);
            const esMesActualDia = esMesActual(fecha);

            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border-r border-b border-dark-100 ${
                  !esMesActualDia ? 'bg-dark-25' : 'bg-white'
                } hover:bg-dark-50 transition-colors cursor-pointer`}
                onClick={() => !user?.persona.roles.includes('alumno') && handleDayClick(fecha)}
              >
                <div className={`text-sm font-medium mb-2 ${
                  esHoyDia 
                    ? 'bg-primary-600 text-white w-6 h-6 rounded-full flex items-center justify-center'
                    : esMesActualDia 
                      ? 'text-dark-900' 
                      : 'text-dark-400'
                }`}>
                  {fecha.getDate()}
                </div>

                <div className="space-y-1">
                  {eventosDelDia.slice(0, 3).map(evento => (
                    <div
                      key={evento.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEventoSeleccionado(evento);
                      }}
                      className={`text-xs p-1 rounded border cursor-pointer hover:opacity-80 transition-opacity ${getColorEvento(evento.tipo)}`}
                    >
                      <div className="truncate font-medium">
                        {evento.titulo}
                      </div>
                      {evento.horaInicio && evento.horaFin && (
                        <div className="truncate opacity-75">
                          {evento.horaInicio}-{evento.horaFin}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Mostrar asistencias para alumnos */}
                  {user?.persona.roles.includes('alumno') && asistenciasDelDia.map(asistencia => (
                    <div
                      key={asistencia.id}
                      className={`text-xs p-1 rounded border ${
                        asistencia.presente 
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : asistencia.justificada
                            ? 'bg-cream-100 text-cream-800 border-cream-200'
                            : 'bg-danger-100 text-danger-800 border-danger-200'
                      }`}
                    >
                      <div className="truncate font-medium">
                        {asistencia.presente ? '✓ Presente' : asistencia.justificada ? '⚠ Justificada' : '✗ Ausente'}
                      </div>
                    </div>
                  ))}
                  
                  {eventosDelDia.length > 3 && (
                    <div className="text-xs text-dark-600 font-medium">
                      +{eventosDelDia.length - 3} más
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Leyenda */}
      <Card>
        <h3 className="text-lg font-semibold text-dark-900 mb-4">Leyenda</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-primary-200 border border-primary-300 rounded"></div>
            <span className="text-sm text-dark-700">Entrenamientos</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-emerald-200 border border-emerald-300 rounded"></div>
            <span className="text-sm text-dark-700">Partidos</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-cream-200 border border-cream-300 rounded"></div>
            <span className="text-sm text-dark-700">Eventos</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-danger-200 border border-danger-300 rounded"></div>
            <span className="text-sm text-dark-700">Feriados</span>
          </div>
        </div>
        
        {user?.persona.roles.includes('alumno') && (
          <div className="mt-4 pt-4 border-t border-dark-200">
            <h4 className="font-medium text-dark-900 mb-2">Asistencias:</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-emerald-200 border border-emerald-300 rounded"></div>
                <span className="text-sm text-dark-700">Presente</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-cream-200 border border-cream-300 rounded"></div>
                <span className="text-sm text-dark-700">Justificada</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-danger-200 border border-danger-300 rounded"></div>
                <span className="text-sm text-dark-700">Ausente</span>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Modal de Detalle del Evento */}
      {eventoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-dark-900">
                  {eventoSeleccionado.titulo}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getColorEvento(eventoSeleccionado.tipo)}`}>
                  {eventoSeleccionado.tipo}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CalendarIcon size={16} className="text-dark-500" />
                  <span className="text-dark-900">
                    {new Date(eventoSeleccionado.fecha).toLocaleDateString('es-AR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>

                {eventoSeleccionado.horaInicio && eventoSeleccionado.horaFin && (
                  <div className="flex items-center space-x-2">
                    <Clock size={16} className="text-dark-500" />
                    <span className="text-dark-900">
                      {eventoSeleccionado.horaInicio} - {eventoSeleccionado.horaFin}
                    </span>
                  </div>
                )}

                {eventoSeleccionado.ubicacion && (
                  <div className="flex items-center space-x-2">
                    <MapPin size={16} className="text-dark-500" />
                    <span className="text-dark-900">{eventoSeleccionado.ubicacion}</span>
                  </div>
                )}

                {eventoSeleccionado.coachDni && (
                  <div className="flex items-center space-x-2">
                    <Users size={16} className="text-dark-500" />
                    <span className="text-dark-900">
                      Coach: {mockPersonas.find(p => p.dni === eventoSeleccionado.coachDni)?.nombre} {' '}
                      {mockPersonas.find(p => p.dni === eventoSeleccionado.coachDni)?.apellido}
                    </span>
                  </div>
                )}

                {eventoSeleccionado.descripcion && (
                  <div>
                    <p className="text-sm font-medium text-dark-700 mb-1">Descripción:</p>
                    <p className="text-dark-900 bg-dark-50 p-2 rounded">
                      {eventoSeleccionado.descripcion}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button 
                  variant="secondary" 
                  onClick={() => setEventoSeleccionado(null)}
                >
                  Cerrar
                </Button>
                {eventoSeleccionado.tipo === 'entrenamiento' && !user?.persona.roles.includes('alumno') && (
                  <Button variant="primary">
                    Tomar Asistencia
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulario de Evento */}
      {showEventoForm && (
        <EventoForm
          fechaInicial={fechaSeleccionada}
          onSave={handleSaveEvento}
          onCancel={handleCancelEvento}
        />
      )}
    </div>
  );
};

export default Calendario;