import { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { createActividad, updateActividad, ActividadResponse } from '../api/actividades';
import { createAsignacion, deleteAsignacionesByActividad, getAsignacionesByActividad, AsignacionResponse } from '../api/asignaciones';
import { getPersonas, PersonaResponse } from '../api/personas';
import { getRoles, RoleResponse } from '../api/roles';
import Button from '../components/Common/Button';
import Card from '../components/Common/Card';

interface ActividadFormProps {
  actividad?: ActividadResponse | null;
  onClose: () => void;
}

interface FormData {
  name: string;
  category: string;
  profesor: string;
  ayudante: string;
  alumnos: string[];
  horarios: Array<{
    day: string;
    start_time: string;
    end_time: string;
  }>;
}

const DIAS_SEMANA = [
  'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
];

function ActividadForm({ actividad, onClose }: ActividadFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    category: '',
    profesor: '',
    ayudante: '',
    alumnos: [],
    horarios: [{ day: '', start_time: '', end_time: '' }]
  });
  
  const [personas, setPersonas] = useState<PersonaResponse[]>([]);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Estados para acordeones
  const [showProfesores, setShowProfesores] = useState(false);
  const [showAyudantes, setShowAyudantes] = useState(false);
  const [showAlumnos, setShowAlumnos] = useState(false);
  
  // Estado para búsqueda de alumnos
  const [searchAlumnos, setSearchAlumnos] = useState('');

  useEffect(() => {
    loadData();
    if (actividad) {
      loadActividadData();
    }
  }, [actividad]);

  const loadData = async () => {
  try {
    const [personasData, rolesData] = await Promise.all([
      getPersonas(),
      getRoles()
    ]);
    
    setRoles(rolesData);
    setPersonas(personasData);
    
    console.log('Roles disponibles:', rolesData);
    console.log('Personas cargadas:', personasData);
    console.log('Personas activas:', personasData.filter(p => p.member));
    
    // Debug mejorado
   
    
  } catch (error) {
    console.error('Error loading data:', error);
  }
};

  const loadActividadData = async () => {
    if (!actividad) return;
    // Cargar datos de la actividad + asignaciones existentes
    setFormData(prev => ({
      ...prev,
      name: actividad.name,
      category: actividad.category
    }));

    try {
      const asignaciones: AsignacionResponse[] = await getAsignacionesByActividad(actividad.id);
      const profesor = asignaciones.find((a) => a.role.toLowerCase().includes('profesor'));
      const ayudante = asignaciones.find((a) => a.role.toLowerCase().includes('ayudante'));
      const alumnos = asignaciones
        .filter((a) => {
          const r = a.role.toLowerCase();
          return r === 'socio' || r === 'no socio';
        })
        .map((a) => a.dni);

      // Derivar horarios únicos por day + start_time + end_time
      const horariosMap = new Map<string, { day: string; start_time: string; end_time: string }>();
      for (const a of asignaciones) {
        const key = `${a.day}|${a.start_time}|${a.end_time}`;
        if (!horariosMap.has(key)) {
          horariosMap.set(key, { day: a.day, start_time: a.start_time, end_time: a.end_time });
        }
      }
      const horarios = Array.from(horariosMap.values());

      setFormData(prev => ({
        ...prev,
        profesor: profesor ? profesor.dni : '',
        ayudante: ayudante ? ayudante.dni : '',
        alumnos,
        horarios: horarios.length > 0 ? horarios : prev.horarios
      }));
    } catch (e) {
      console.warn('No se pudieron cargar las asignaciones de la actividad:', e);
    }
  };

 const getProfesores = () => {
  const profesorRole = roles.find(r => r.name === 'PROFESOR/A');
  console.log('Rol profesor encontrado:', profesorRole);
  
  if (!profesorRole) {
    console.log('No se encontró el rol PROFESOR/A');
    return [];
  }
  
  const profesores = personas.filter(p => {
    // Cambiar de comparar IDs a comparar nombres
    const hasRole = p.roles?.includes('PROFESOR/A');
    const match = hasRole && p.member;
    console.log(`Persona ${p.name} ${p.lastname}: roles=${JSON.stringify(p.roles)}, hasRole=${hasRole}, member=${p.member}, match=${match}`);
    return match;
  });
  
  console.log('Profesores filtrados:', profesores);
  return profesores;
};

const getAyudantes = () => {
  const ayudanteRole = roles.find(r => r.name === 'AYUDANTE');
  console.log('Rol ayudante encontrado:', ayudanteRole);
  
  if (!ayudanteRole) {
    console.log('No se encontró el rol AYUDANTE');
    return [];
  }
  
  const ayudantes = personas.filter(p => 
    p.roles?.includes('AYUDANTE') && p.member
  );
  console.log('Ayudantes filtrados:', ayudantes);
  return ayudantes;
};

const getAlumnos = () => {
  const socioRole = roles.find(r => r.name === 'SOCIO');
  const noSocioRole = roles.find(r => r.name === 'NO SOCIO');
  console.log('Roles alumnos encontrados:', { socioRole, noSocioRole });
  
  const alumnos = personas.filter(p => {
    const hasValidRole = p.roles?.includes('SOCIO') || p.roles?.includes('NO SOCIO');
    return hasValidRole && p.member;
  });
  
  if (searchAlumnos) {
    return alumnos.filter(a => 
      a.name.toLowerCase().includes(searchAlumnos.toLowerCase()) ||
      a.lastname.toLowerCase().includes(searchAlumnos.toLowerCase()) ||
      a.dni.includes(searchAlumnos)
    );
  }
  
  console.log('Alumnos filtrados:', alumnos);
  return alumnos;
};

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

    try {
      // Validaciones
      if (!formData.name || !formData.category || !formData.profesor) {
        alert('Por favor complete todos los campos requeridos');

        return;
      }

      if (formData.horarios.some(h => !h.day || !h.start_time || !h.end_time)) {
        alert('Por favor complete todos los horarios');
        return;
      }

      let actividadId: number;

      if (actividad) {
        // Actualizar actividad existente
        await updateActividad(actividad.id, {
          name: formData.name,
          category: formData.category
        });
        actividadId = actividad.id;
        
        // Eliminar asignaciones existentes
        await deleteAsignacionesByActividad(actividadId);
      } else {
        // Crear nueva actividad
        const newActividad = await createActividad({
          name: formData.name,
          category: formData.category
        });
        actividadId = newActividad.id;
      }

      // Crear asignaciones con los nombres exactos de roles
    const profesorRole = roles.find(r => r.name === 'PROFESOR/A');
    const ayudanteRole = roles.find(r => r.name === 'AYUDANTE');
    const socioRole = roles.find(r => r.name === 'SOCIO');
    const noSocioRole = roles.find(r => r.name === 'NO SOCIO');

    for (const horario of formData.horarios) {
      // Asignar profesor
      if (formData.profesor && profesorRole) {
        await createAsignacion({
          dni: formData.profesor,
          activity_id: actividadId,
          role_id: profesorRole.id,
          day: horario.day,
          start_time: horario.start_time,
          end_time: horario.end_time
        });
      }

      // Asignar ayudante si existe
      if (formData.ayudante && ayudanteRole) {
        await createAsignacion({
          dni: formData.ayudante,
          activity_id: actividadId,
          role_id: ayudanteRole.id,
          day: horario.day,
          start_time: horario.start_time,
          end_time: horario.end_time
        });
      }

      // Asignar alumnos
      for (const alumnoDni of formData.alumnos) {
        const alumno = personas.find(p => p.dni === alumnoDni);
        if (alumno) {
          // Determinar el rol apropiado del alumno
          let alumnoRoleId: number | undefined;
          
          if (alumno.roles?.includes('SOCIO') && socioRole) {
            alumnoRoleId = socioRole.id;
          } else if (alumno.roles?.includes('NO SOCIO') && noSocioRole) {
            alumnoRoleId = noSocioRole.id;
          }
          
          if (alumnoRoleId) {
            await createAsignacion({
              dni: alumnoDni,
              activity_id: actividadId,
              role_id: alumnoRoleId,
              day: horario.day,
              start_time: horario.start_time,
              end_time: horario.end_time
            });
          }
        }
      }
    }

    onClose();
  } catch (error) {
    console.error('Error saving actividad:', error);
    alert('Error al guardar la actividad');
  } finally {
    setLoading(false);
  }
};

  const addHorario = () => {
    setFormData(prev => ({
      ...prev,
      horarios: [...prev.horarios, { day: '', start_time: '', end_time: '' }]
    }));
  };

  const removeHorario = (index: number) => {
    setFormData(prev => ({
      ...prev,
      horarios: prev.horarios.filter((_, i) => i !== index)
    }));
  };

  const updateHorario = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      horarios: prev.horarios.map((h, i) => 
        i === index ? { ...h, [field]: value } : h
      )
    }));
  };

  const toggleAlumno = (dni: string) => {
    setFormData(prev => ({
      ...prev,
      alumnos: prev.alumnos.includes(dni)
        ? prev.alumnos.filter(a => a !== dni)
        : [...prev.alumnos, dni]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {actividad ? 'Editar Actividad' : 'Nueva Actividad'}
            </h2>
            <Button onClick={onClose} variant="primary" size="sm">
              <X size={20} />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Datos básicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría *
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Profesor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profesor * ({getProfesores().length} disponibles)
              </label>
              <div className="border border-gray-300 rounded-md">
                <button
                  type="button"
                  onClick={() => setShowProfesores(!showProfesores)}
                  className="w-full px-3 py-2 flex justify-between items-center bg-gray-50 hover:bg-gray-100"
                >
                  <span>
                    {formData.profesor 
                      ? `${personas.find(p => p.dni === formData.profesor)?.name} ${personas.find(p => p.dni === formData.profesor)?.lastname}`
                      : 'Seleccionar profesor'
                    }
                  </span>
                  {showProfesores ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {showProfesores && (
                  <div className="max-h-40 overflow-y-auto border-t border-gray-200">
                    {getProfesores().length === 0 ? (
                      <div className="px-3 py-2 text-gray-500">No hay profesores disponibles</div>
                    ) : (
                      getProfesores().map(profesor => (
                        <label key={profesor.dni} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                          <input
                            type="radio"
                            name="profesor"
                            value={profesor.dni}
                            checked={formData.profesor === profesor.dni}
                            onChange={(e) => setFormData(prev => ({ ...prev, profesor: e.target.value }))}
                            className="mr-2"
                          />
                          <span>{profesor.name} {profesor.lastname} - {profesor.dni}</span>
                        </label>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Ayudante */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ayudante (Opcional) ({getAyudantes().length} disponibles)
              </label>
              <div className="border border-gray-300 rounded-md">
                <button
                  type="button"
                  onClick={() => setShowAyudantes(!showAyudantes)}
                  className="w-full px-3 py-2 flex justify-between items-center bg-gray-50 hover:bg-gray-100"
                >
                  <span>
                    {formData.ayudante 
                      ? `${personas.find(p => p.dni === formData.ayudante)?.name} ${personas.find(p => p.dni === formData.ayudante)?.lastname}`
                      : 'Seleccionar ayudante'
                    }
                  </span>
                  {showAyudantes ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {showAyudantes && (
                  <div className="max-h-40 overflow-y-auto border-t border-gray-200">
                    <label className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="ayudante"
                        value=""
                        checked={formData.ayudante === ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, ayudante: e.target.value }))}
                        className="mr-2"
                      />
                      <span>Sin ayudante</span>
                    </label>
                    {getAyudantes().length === 0 ? (
                      <div className="px-3 py-2 text-gray-500">No hay ayudantes disponibles</div>
                    ) : (
                      getAyudantes().map(ayudante => (
                        <label key={ayudante.dni} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                          <input
                            type="radio"
                            name="ayudante"
                            value={ayudante.dni}
                            checked={formData.ayudante === ayudante.dni}
                            onChange={(e) => setFormData(prev => ({ ...prev, ayudante: e.target.value }))}
                            className="mr-2"
                          />
                          <span>{ayudante.name} {ayudante.lastname} - {ayudante.dni}</span>
                        </label>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Alumnos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alumnos ({formData.alumnos.length} seleccionados de {getAlumnos().length} disponibles)
              </label>
              <div className="border border-gray-300 rounded-md">
                <button
                  type="button"
                  onClick={() => setShowAlumnos(!showAlumnos)}
                  className="w-full px-3 py-2 flex justify-between items-center bg-gray-50 hover:bg-gray-100"
                >
                  <span>Seleccionar alumnos</span>
                  {showAlumnos ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {showAlumnos && (
                  <div>
                    <div className="p-3 border-b border-gray-200">
                      <div className="relative">
                        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Buscar alumno..."
                          value={searchAlumnos}
                          onChange={(e) => setSearchAlumnos(e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {getAlumnos().length === 0 ? (
                        <div className="px-3 py-2 text-gray-500">No hay alumnos disponibles</div>
                      ) : (
                        getAlumnos().map(alumno => (
                          <label key={alumno.dni} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.alumnos.includes(alumno.dni)}
                              onChange={() => toggleAlumno(alumno.dni)}
                              className="mr-2"
                            />
                            <span>{alumno.name} {alumno.lastname} - {alumno.dni}</span>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Horarios */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="text-sm font-medium text-gray-700">
                  Horarios *
                </label>
                <Button type="button" onClick={addHorario} variant="primary" size="sm">
                  Agregar Horario
                </Button>
              </div>
              
              <div className="space-y-4">
                {formData.horarios.map((horario, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-md">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Día</label>
                      <select
                        value={horario.day}
                        onChange={(e) => updateHorario(index, 'day', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Seleccionar día</option>
                        {DIAS_SEMANA.map(dia => (
                          <option key={dia} value={dia}>{dia}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Hora inicio</label>
                      <input
                        type="time"
                        value={horario.start_time}
                        onChange={(e) => updateHorario(index, 'start_time', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Hora fin</label>
                      <input
                        type="time"
                        value={horario.end_time}
                        onChange={(e) => updateHorario(index, 'end_time', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="flex items-end">
                      {formData.horarios.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeHorario(index)}
                          variant="primary"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          Eliminar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-4 pt-6">
              <Button type="button" onClick={onClose} variant="primary" size="sm" disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Guardando...' : (actividad ? 'Actualizar' : 'Crear')}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}

export default ActividadForm;