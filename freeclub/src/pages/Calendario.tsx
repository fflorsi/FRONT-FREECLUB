import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Users, MapPin, Clock, Filter } from 'lucide-react';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import { feriadosArgentinos2024, mockAsistencias } from '../data/mockData';
import { EventoCalendario } from '../types';
import { useAuth } from '../context/AuthContext';
import { getActividades, ActividadResponse } from '../api/actividades';
import { getAsignaciones, AsignacionResponse } from '../api/asignaciones';
import { getPersonas, PersonaResponse } from '../api/personas';

const Calendario: React.FC = () => {
  const { user } = useAuth();
  const [fechaActual, setFechaActual] = useState(new Date());
  const [vistaActual, setVistaActual] = useState<'mes' | 'semana'>('mes');
  const [filtroActividad, setFiltroActividad] = useState<number | ''>('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [eventoSeleccionado, setEventoSeleccionado] = useState<EventoCalendario | null>(null);
  const [showFiltros, setShowFiltros] = useState(false);
  const [eventos] = useState<EventoCalendario[]>([]); // setter no usado mientras la creación esté deshabilitada
  const [actividades, setActividades] = useState<ActividadResponse[]>([]);
  const [asignaciones, setAsignaciones] = useState<AsignacionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [personas, setPersonas] = useState<PersonaResponse[]>([]);

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const [acts, asigs, pers] = await Promise.all([
          getActividades(),
          getAsignaciones(),
          getPersonas(),
        ]);
        setActividades(acts);
        setAsignaciones(asigs);
        setPersonas(pers);
      } catch (e) {
        console.error('Error cargando calendario', e);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  // Utilidades
  const normalize = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  const diaAIndex: Record<string, number> = {
    domingo: 0,
    lunes: 1,
    martes: 2,
    miercoles: 3,
    jueves: 4,
    viernes: 5,
    sabado: 6,
  };
  const formatDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Determinar asignaciones visibles según el usuario
  const dniUser = user?.personaDni;
  const rolesLower = useMemo(() => user?.persona.roles?.map(r => r.toLowerCase()) ?? [], [user]);
  // Solo Administrador ve todas las actividades
  const isAdmin = rolesLower.includes('administrador') || rolesLower.includes('admin');
  // Personal técnico/operativo que consideramos como "profes" a efectos de visibilidad (solo ven asignadas)
  const isStaff = [
    'profesor/a','profesor','entrenador/a','entrenador','monitor/a','monitor','ayudante',
    'coordinador/a','coordinador','preparador físico','preparador fisico',
    'kinesiólogo/a','kinesiologo/a','kinesiologo','kinesiólogo',
    'psicólogo/a','psicologo/a','psicologo','psicólogo',
    'nutricionista','guardavidas','administrativo/a','administrativo','portero/a','portero',
    'mantenimiento','delegado categoría','delegado categoria'
  ].some(r => rolesLower.includes(r));
  const isSocio = rolesLower.includes('socio') || rolesLower.includes('no socio');
  // Alumno: socio/no socio sin ser admin ni staff
  const isAlumno = isSocio && !isStaff && !isAdmin;
  const misAsignaciones = useMemo(() => {
    if (isAdmin) return asignaciones;
    if (!dniUser) return [] as AsignacionResponse[];
    return asignaciones.filter(a => a.dni === dniUser);
  }, [asignaciones, dniUser, isAdmin]);

  // Actividades visibles (solo las asignadas), excepto superadmin que ve todas
  const actividadesVisibles = useMemo(() => {
    if (isAdmin) return actividades;
    const ids = new Set(misAsignaciones.map(a => a.activity_id));
    return actividades.filter(act => ids.has(act.id));
  }, [actividades, misAsignaciones, isAdmin]);

  // Generar eventos del calendario con datos reales
  const eventosGenerados = useMemo(() => {
    const out: EventoCalendario[] = [...eventos];

    // Feriados
    feriadosArgentinos2024.forEach(feriado => {
      out.push({
        id: `feriado-${feriado.fecha}`,
        titulo: feriado.nombre,
        fecha: feriado.fecha,
        tipo: 'feriado',
        descripcion: 'Feriado Nacional',
        color: '#c1121f'
      });
    });

    // Agrupar asignaciones por (actividad, dia, hora)
    const grupos = new Map<string, { activity_id: number; day: string; start: string; end: string; profesorDni?: string; ayudanteDni?: string }>();
    // Usar solo las asignaciones visibles para este usuario
    for (const a of misAsignaciones) {
      const key = `${a.activity_id}|${a.day}|${a.start_time}|${a.end_time}`;
      const exist = grupos.get(key);
      const role = normalize(a.role);
      if (!exist) {
        grupos.set(key, {
          activity_id: a.activity_id,
          day: a.day,
          start: a.start_time,
          end: a.end_time,
          profesorDni: role.includes('profesor') ? a.dni : undefined,
          ayudanteDni: role.includes('ayudante') ? a.dni : undefined,
        });
      } else {
        if (!exist.profesorDni && role.includes('profesor')) exist.profesorDni = a.dni;
        if (!exist.ayudanteDni && role.includes('ayudante')) exist.ayudanteDni = a.dni;
      }
    }

    const inicioMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
    const finMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0);

    grupos.forEach(({ activity_id, day, start, end, profesorDni, ayudanteDni }) => {
      const actividad = actividades.find(act => act.id === activity_id);
      if (!actividad) return;
      const idx = diaAIndex[normalize(day)];
      if (idx === undefined) return;

      // Recorrer días del mes y crear eventos para cada coincidencia de día de semana
      const cursor = new Date(inicioMes);
      while (cursor <= finMes) {
        if (cursor.getDay() === idx) {
          out.push({
            id: `act-${activity_id}-${day}-${start}-${formatDate(cursor)}`,
            titulo: actividad.name,
            fecha: formatDate(cursor),
            tipo: 'entrenamiento',
            descripcion: actividad.category,
            actividadId: String(activity_id),
            horaInicio: start.slice(0,5),
            horaFin: end.slice(0,5),
            coachDni: profesorDni || ayudanteDni,
            color: '#669bbc',
          });
        }
        cursor.setDate(cursor.getDate() + 1);
      }
    });

    return out;
  }, [fechaActual, actividades, misAsignaciones, eventos]);

  // Filtrar eventos
  const eventosFiltrados = useMemo(() => {
    let filtrados = eventosGenerados;

    if (filtroActividad !== '') {
      filtrados = filtrados.filter(evento => 
        (evento.actividadId === String(filtroActividad)) || evento.tipo === 'feriado'
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


  const nombresMeses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Para alumnos, mostrar sus asistencias
  const obtenerAsistenciasAlumno = (fecha: Date) => {
    if (!isAlumno) return [];
    
    const fechaStr = fecha.toISOString().split('T')[0];
    return mockAsistencias.filter(a => 
      a.personaDni === (user?.personaDni ?? '') && 
      a.fecha === fechaStr
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-900">Calendario</h1>
          <p className="text-dark-600 mt-1">
            {isAlumno ? 'Tus actividades y asistencias' : 'Programación de actividades y eventos'}
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
          {/* Botón "Nuevo Evento" removido */}
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
                onChange={(e) => setFiltroActividad(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Todas las actividades</option>
                {actividadesVisibles.map(act => (
                  <option key={act.id} value={act.id}>
                    {act.name} - {act.category}
                  </option>
                ))}
              </select>
            </div>

     

            <div className="flex items-end">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => {
                  setFiltroActividad('');
                  
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
        {loading && (
          <div className="p-4 text-center text-gray-600">Cargando calendario...</div>
        )}
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
                onClick={() => { /* crear evento deshabilitado */ }}
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
                      {evento.descripcion && (
                        <div className="truncate opacity-75">
                          {evento.descripcion}
                        </div>
                      )}
                      {evento.horaInicio && evento.horaFin && (
                        <div className="truncate opacity-75">
                          {evento.horaInicio}-{evento.horaFin}
                        </div>
                      )}
                      {evento.coachDni && (
                        <div className="truncate opacity-75">
                          {(() => {
                            const p = personas.find(pp => pp.dni === evento.coachDni);
                            return p ? `Instructor: ${p.name} ${p.lastname}` : undefined;
                          })()}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Mostrar asistencias para alumnos */}
                  {isAlumno && asistenciasDelDia.map(asistencia => (
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
        
        {isAlumno && (
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
                      Coach: {personas.find((p) => p.dni === eventoSeleccionado.coachDni)?.name} {' '}
                      {personas.find((p) => p.dni === eventoSeleccionado.coachDni)?.lastname}
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
                {eventoSeleccionado.tipo === 'entrenamiento' && !isAlumno && (
                  <Button variant="primary">
                    Tomar Asistencia
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulario de Evento oculto hasta implementación */}
    </div>
  );
};

export default Calendario;