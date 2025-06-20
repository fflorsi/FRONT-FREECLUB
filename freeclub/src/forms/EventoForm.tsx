import React, { useState } from 'react';
import { Save, X, Calendar, Clock, MapPin, Users, FileText, Bell } from 'lucide-react';
import Button from '../components/Common/Button';
import { EventoCalendario, Actividad } from '../types';
import { mockActividades, mockPersonas } from '../data/mockData';

interface EventoFormProps {
  evento?: EventoCalendario;
  fechaInicial?: string;
  onSave: (evento: EventoCalendario) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const EventoForm: React.FC<EventoFormProps> = ({ 
  evento, 
  fechaInicial,
  onSave, 
  onCancel, 
  isEditing = false 
}) => {
  const [formData, setFormData] = useState({
    titulo: evento?.titulo || '',
    fecha: evento?.fecha || fechaInicial || new Date().toISOString().split('T')[0],
    horaInicio: evento?.horaInicio || '09:00',
    horaFin: evento?.horaFin || '10:00',
    tipo: evento?.tipo || 'evento' as EventoCalendario['tipo'],
    descripcion: evento?.descripcion || '',
    ubicacion: evento?.ubicacion || '',
    actividadId: evento?.actividadId || '',
    coachDni: evento?.coachDni || '',
    participantes: evento?.participantes || [],
    color: evento?.color || '#669bbc',
    recordatorio: evento?.recordatorio || false,
    minutosRecordatorio: evento?.minutosRecordatorio || 30
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando se modifica
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.titulo.trim()) newErrors.titulo = 'Título es requerido';
    if (!formData.fecha) newErrors.fecha = 'Fecha es requerida';
    if (!formData.horaInicio) newErrors.horaInicio = 'Hora de inicio es requerida';
    if (!formData.horaFin) newErrors.horaFin = 'Hora de fin es requerida';
    
    // Validar que hora fin sea posterior a hora inicio
    if (formData.horaInicio && formData.horaFin && formData.horaInicio >= formData.horaFin) {
      newErrors.horaFin = 'La hora de fin debe ser posterior a la hora de inicio';
    }

    // Validaciones específicas por tipo
    if (formData.tipo === 'entrenamiento' && !formData.actividadId) {
      newErrors.actividadId = 'Debe seleccionar una actividad para entrenamientos';
    }

    if (formData.tipo === 'partido' && !formData.ubicacion) {
      newErrors.ubicacion = 'Ubicación es requerida para partidos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const nuevoEvento: EventoCalendario = {
      id: evento?.id || `evento-${Date.now()}`,
      titulo: formData.titulo.trim(),
      fecha: formData.fecha,
      horaInicio: formData.horaInicio,
      horaFin: formData.horaFin,
      tipo: formData.tipo,
      descripcion: formData.descripcion.trim(),
      ubicacion: formData.ubicacion.trim(),
      actividadId: formData.actividadId || undefined,
      coachDni: formData.coachDni || undefined,
      participantes: formData.participantes,
      color: formData.color,
      recordatorio: formData.recordatorio,
      minutosRecordatorio: formData.recordatorio ? formData.minutosRecordatorio : undefined
    };

    onSave(nuevoEvento);
  };

  const tiposEvento = [
    { value: 'entrenamiento', label: 'Entrenamiento', color: '#669bbc' },
    { value: 'partido', label: 'Partido', color: '#10b981' },
    { value: 'evento', label: 'Evento Especial', color: '#f59e0b' },
    { value: 'reunion', label: 'Reunión', color: '#8b5cf6' }
  ];

  const coaches = mockPersonas.filter(p => p.roles.includes('coach') && p.activo);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-dark-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-dark-900">
                {isEditing ? 'Editar Evento' : 'Nuevo Evento'}
              </h2>
              <button
                type="button"
                onClick={onCancel}
                className="text-dark-400 hover:text-dark-600"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Información Básica */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="text-primary-600" size={20} />
                <h3 className="text-lg font-semibold text-dark-900">Información Básica</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={formData.titulo}
                    onChange={(e) => handleInputChange('titulo', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.titulo ? 'border-danger-300' : 'border-dark-300'
                    }`}
                    placeholder="Nombre del evento"
                  />
                  {errors.titulo && <p className="text-danger-600 text-xs mt-1">{errors.titulo}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-1">
                      Tipo de Evento *
                    </label>
                    <select
                      value={formData.tipo}
                      onChange={(e) => {
                        const tipo = e.target.value as EventoCalendario['tipo'];
                        const tipoInfo = tiposEvento.find(t => t.value === tipo);
                        handleInputChange('tipo', tipo);
                        if (tipoInfo) {
                          handleInputChange('color', tipoInfo.color);
                        }
                      }}
                      className="w-full px-3 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      {tiposEvento.map(tipo => (
                        <option key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-1">
                      Color
                    </label>
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                      className="w-full h-10 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Fecha y Hora */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Clock className="text-primary-600" size={20} />
                <h3 className="text-lg font-semibold text-dark-900">Fecha y Hora</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => handleInputChange('fecha', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.fecha ? 'border-danger-300' : 'border-dark-300'
                    }`}
                  />
                  {errors.fecha && <p className="text-danger-600 text-xs mt-1">{errors.fecha}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">
                    Hora Inicio *
                  </label>
                  <input
                    type="time"
                    value={formData.horaInicio}
                    onChange={(e) => handleInputChange('horaInicio', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.horaInicio ? 'border-danger-300' : 'border-dark-300'
                    }`}
                  />
                  {errors.horaInicio && <p className="text-danger-600 text-xs mt-1">{errors.horaInicio}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">
                    Hora Fin *
                  </label>
                  <input
                    type="time"
                    value={formData.horaFin}
                    onChange={(e) => handleInputChange('horaFin', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.horaFin ? 'border-danger-300' : 'border-dark-300'
                    }`}
                  />
                  {errors.horaFin && <p className="text-danger-600 text-xs mt-1">{errors.horaFin}</p>}
                </div>
              </div>
            </div>

            {/* Detalles Específicos */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="text-primary-600" size={20} />
                <h3 className="text-lg font-semibold text-dark-900">Detalles</h3>
              </div>
              
              <div className="space-y-4">
                {formData.tipo === 'entrenamiento' && (
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-1">
                      Actividad *
                    </label>
                    <select
                      value={formData.actividadId}
                      onChange={(e) => {
                        handleInputChange('actividadId', e.target.value);
                        const actividad = mockActividades.find(a => a.id === e.target.value);
                        if (actividad) {
                          handleInputChange('coachDni', actividad.coachDni);
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        errors.actividadId ? 'border-danger-300' : 'border-dark-300'
                      }`}
                    >
                      <option value="">Seleccionar actividad</option>
                      {mockActividades.map(actividad => (
                        <option key={actividad.id} value={actividad.id}>
                          {actividad.nombre} - {actividad.horario}
                        </option>
                      ))}
                    </select>
                    {errors.actividadId && <p className="text-danger-600 text-xs mt-1">{errors.actividadId}</p>}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">
                    Entrenador/Responsable
                  </label>
                  <select
                    value={formData.coachDni}
                    onChange={(e) => handleInputChange('coachDni', e.target.value)}
                    className="w-full px-3 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar entrenador</option>
                    {coaches.map(coach => (
                      <option key={coach.dni} value={coach.dni}>
                        {coach.nombre} {coach.apellido}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">
                    Ubicación {formData.tipo === 'partido' && '*'}
                  </label>
                  <input
                    type="text"
                    value={formData.ubicacion}
                    onChange={(e) => handleInputChange('ubicacion', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.ubicacion ? 'border-danger-300' : 'border-dark-300'
                    }`}
                    placeholder="Cancha, dirección, etc."
                  />
                  {errors.ubicacion && <p className="text-danger-600 text-xs mt-1">{errors.ubicacion}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => handleInputChange('descripcion', e.target.value)}
                    className="w-full px-3 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={3}
                    placeholder="Detalles adicionales del evento"
                  />
                </div>
              </div>
            </div>

            {/* Recordatorios */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Bell className="text-primary-600" size={20} />
                <h3 className="text-lg font-semibold text-dark-900">Recordatorios</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="recordatorio"
                    checked={formData.recordatorio}
                    onChange={(e) => handleInputChange('recordatorio', e.target.checked)}
                    className="rounded border-dark-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="recordatorio" className="text-sm font-medium text-dark-700">
                    Enviar recordatorio
                  </label>
                </div>

                {formData.recordatorio && (
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-1">
                      Minutos antes del evento
                    </label>
                    <select
                      value={formData.minutosRecordatorio}
                      onChange={(e) => handleInputChange('minutosRecordatorio', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value={15}>15 minutos</option>
                      <option value={30}>30 minutos</option>
                      <option value={60}>1 hora</option>
                      <option value={120}>2 horas</option>
                      <option value={1440}>1 día</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-dark-200 flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" icon={Save}>
              {isEditing ? 'Actualizar Evento' : 'Crear Evento'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventoForm;