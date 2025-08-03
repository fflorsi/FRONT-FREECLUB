import React, { useEffect, useState } from 'react';
import { Users, UserCheck, AlertTriangle, Calendar, TrendingUp, Award } from 'lucide-react';
import Card from '../components/Common/Card';
import { fetchPersonas } from '../api/personas';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [personas, setPersonas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarPersonas() {
      setLoading(true);
      try {
        const data = await fetchPersonas();
        setPersonas(data);
      } catch (error) {
        setPersonas([]);
      }
      setLoading(false);
    }
    cargarPersonas();
  }, []);

  // Calcular estadísticas
  const totalPersonas = personas.filter(p => p.activo).length;
  const totalAlumnos = personas.filter(p => p.roles?.includes('alumno') && p.activo).length;
  const totalCoaches = personas.filter(p => p.roles?.includes('coach') && p.activo).length;
  const alumnosConMuchasFaltas = personas.filter(p => p.roles?.includes('alumno') && (p.faltas || 0) > 3).length;

  // Asistencias hoy y porcentaje: no hay endpoint, así que los dejamos en 0
  const asistenciasHoy = 0;
  const porcentajeAsistencia = 0;

  const estadisticas = [
    {
      title: 'Total Personas',
      value: totalPersonas,
      icon: Users,
      color: 'bg-primary-500',
      bgColor: 'bg-primary-50',
      textColor: 'text-primary-700'
    },
    {
      title: 'Alumnos Activos',
      value: totalAlumnos,
      icon: UserCheck,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700'
    },
    {
      title: 'Coaches',
      value: totalCoaches,
      icon: Award,
      color: 'bg-cream-500',
      bgColor: 'bg-cream-50',
      textColor: 'text-cream-700'
    },
    {
      title: 'Alumnos con +3 Faltas',
      value: alumnosConMuchasFaltas,
      icon: AlertTriangle,
      color: 'bg-danger-500',
      bgColor: 'bg-danger-50',
      textColor: 'text-danger-700'
    },
    {
      title: 'Asistencias Hoy',
      value: asistenciasHoy,
      icon: Calendar,
      color: 'bg-dark-500',
      bgColor: 'bg-dark-50',
      textColor: 'text-dark-700'
    },
    {
      title: 'Asistencia General',
      value: `${porcentajeAsistencia}%`,
      icon: TrendingUp,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700'
    }
  ];

  const alumnosConFaltas = personas
    .filter(p => p.roles?.includes('alumno') && (p.faltas || 0) > 0)
    .sort((a, b) => (b.faltas || 0) - (a.faltas || 0))
    .slice(0, 5);

  if (loading) {
    return <div className="p-8 text-center">Cargando datos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-900">Dashboard</h1>
          <p className="text-dark-600 mt-1">
            Bienvenido, {user?.persona?.name} {user?.persona?.lastname}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 text-sm text-dark-500">
          {new Date().toLocaleDateString('es-AR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {estadisticas.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className={`${stat.bgColor} border-none`}>
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className={`text-xs sm:text-sm font-medium ${stat.textColor} mb-1`}>
                    {stat.title}
                  </p>
                  <p className={`text-xl sm:text-2xl font-bold ${stat.textColor}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2 sm:p-3 rounded-full ${stat.color} flex-shrink-0`}>
                  <Icon size={20} className="text-white sm:w-6 sm:h-6" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Alumnos con Faltas */}
        <Card title="Alumnos con Faltas" subtitle="Seguimiento de asistencia">
          <div className="space-y-3">
            {alumnosConFaltas.length > 0 ? (
              alumnosConFaltas.map((alumno) => (
                <div key={alumno.dni} className="flex items-center justify-between p-3 bg-dark-50 rounded-lg">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-300 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-700 font-medium text-xs sm:text-sm">
                        {alumno.nombre?.charAt(0)}{alumno.apellido?.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-dark-900 text-sm sm:text-base truncate">
                        {alumno.nombre} {alumno.apellido}
                      </p>
                      <p className="text-xs sm:text-sm text-dark-500">DNI: {alumno.dni}</p>
                    </div>
                  </div>
                  <div className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex-shrink-0 ${
                    (alumno.faltas || 0) > 3 
                      ? 'bg-danger-100 text-danger-800' 
                      : (alumno.faltas || 0) > 1 
                        ? 'bg-cream-100 text-cream-800'
                        : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {alumno.faltas || 0} faltas
                  </div>
                </div>
              ))
            ) : (
              <p className="text-dark-500 text-center py-4 text-sm">
                No hay alumnos con faltas registradas
              </p>
            )}
          </div>
        </Card>

        {/* Actividades Recientes */}
        <Card title="Actividades Recientes" subtitle="Últimas asistencias tomadas">
          <div className="space-y-3">
            <p className="text-dark-500 text-center py-4 text-sm">
              No hay asistencias registradas
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;