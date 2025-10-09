import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, Calendar } from 'lucide-react';
import { getActividades, deleteActividad, ActividadResponse } from '../api/actividades';
import { getAsignacionesByActividad } from '../api/asignaciones';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import ActividadForm from '../forms/ActividadForm';

interface ActividadWithDetails extends ActividadResponse {
  profesores: string[];
  ayudantes: string[];
  alumnos: string[];
  horarios: Array<{
    day: string;
    start_time: string;
    end_time: string;
  }>;
}

export default function Actividades() {
  const [actividades, setActividades] = useState<ActividadWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingActividad, setEditingActividad] = useState<ActividadResponse | null>(null);

  useEffect(() => {
    loadActividades();
  }, []);

  const loadActividades = async () => {
    try {
      setLoading(true);
      const actividadesData = await getActividades();
      
      const actividadesWithDetails = await Promise.all(
        actividadesData.map(async (actividad) => {
          const asignaciones = await getAsignacionesByActividad(actividad.id);
          
          const profesores = asignaciones
            .filter(a => a.role.toLowerCase().includes('profesor'))
            .map(a => a.person);
          
          const ayudantes = asignaciones
            .filter(a => a.role.toLowerCase().includes('ayudante'))
            .map(a => a.person);
          
          const alumnos = asignaciones
            .filter(a => {
              const r = a.role.toLowerCase();
              return r === 'socio' || r === 'no socio';
            })
            .map(a => a.person);
          
          const horarios = asignaciones
            .reduce((acc: any[], curr) => {
              const existing = acc.find(h => h.day === curr.day && h.start_time === curr.start_time);
              if (!existing) {
                acc.push({
                  day: curr.day,
                  start_time: curr.start_time,
                  end_time: curr.end_time
                });
              }
              return acc;
            }, []);

          return {
            ...actividad,
            profesores,
            ayudantes,
            alumnos,
            horarios
          };
        })
      );

      setActividades(actividadesWithDetails);
    } catch (error) {
      console.error('Error loading actividades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (actividad: ActividadResponse) => {
    setEditingActividad(actividad);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta actividad?')) {
      try {
        await deleteActividad(id);
        loadActividades();
      } catch (error) {
        console.error('Error deleting actividad:', error);
      }
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingActividad(null);
    loadActividades();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Actividades</h1>
        <Button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2"
        >
          <Plus size={20} />
          Nueva Actividad
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {actividades.map((actividad) => (
          <Card key={actividad.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{actividad.name}</h3>
                <p className="text-gray-600">{actividad.category}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleEdit(actividad)}
                  variant="primary"
                  size="sm"
                >
                  <Edit size={16} />
                </Button>
                <Button
                  onClick={() => handleDelete(actividad.id)}
                  variant="primary"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {actividad.profesores.length > 0 && (
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-blue-600" />
                  <span className="text-sm">
                    Profesor: {actividad.profesores.join(', ')}
                  </span>
                </div>
              )}

              {actividad.ayudantes.length > 0 && (
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-green-600" />
                  <span className="text-sm">
                    Ayudante: {actividad.ayudantes.join(', ')}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Users size={16} className="text-gray-600" />
                <span className="text-sm">
                  {actividad.alumnos.length} alumno{actividad.alumnos.length !== 1 ? 's' : ''}
                </span>
              </div>

              {actividad.horarios.length > 0 && (
                <div className="space-y-1">
                  {actividad.horarios.map((horario, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Calendar size={16} className="text-purple-600" />
                      <span className="text-sm">
                        {horario.day}: {horario.start_time} - {horario.end_time}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {showForm && (
        <ActividadForm
          actividad={editingActividad}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}