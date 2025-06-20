export interface Persona {
  dni: string;
  name: string;
  lastname: string;
  cuit?: string;
  email: string;
  phone: string;
  address: string;
  address_details?: string;
  birthdate: string;
  medical_coverage?: string;
  blood_type?: string;
  medical_conditions?: string;
  emergency_phone: string;
  emergency_relation: string;
  join_date: string;
  roles: string[];
  member: boolean;
  faltas?: number;
}

export interface Usuario {
  id: number;
  username: string;
  personaDni: string;
  password: string;
  permissions: string[];
  activo: boolean;
}

export interface Actividad {
  id: string;
  nombre: string;
  descripcion: string;
  coachDni: string;
  diasSemana: string[];
  horario: string;
  activa: boolean;
}

export interface Asistencia {
  id: string;
  personaDni: string;
  fecha: string;
  actividadId: string;
  coach: string;
  presente: boolean;
  justificada: boolean;
  observaciones?: string;
}

export interface AuthUser {
  nombreUsuario: string;
  personaDni: string;
  permisos: string[];
  persona: Persona;
  password:string;
}

export interface EventoCalendario {
  id: string;
  titulo: string;
  fecha: string;
  horaInicio?: string;
  horaFin?: string;
  tipo: 'entrenamiento' | 'partido' | 'evento' | 'feriado' | 'reunion';
  descripcion?: string;
  ubicacion?: string;
  actividadId?: string;
  coachDni?: string;
  participantes?: string[];
  color?: string;
  recordatorio?: boolean;
  minutosRecordatorio?: number;
}

export type UserRole = 'superadmin' | 'admin' | 'coach' | 'alumno' | 'padre';

export const PERMISOS = {
  VER_USUARIOS: 'Ver usuarios',
  CREAR_USUARIOS: 'Crear usuarios',
  EDITAR_USUARIOS: 'Editar usuarios',
  ELIMINAR_USUARIOS: 'Eliminar usuarios',
  VER_PERSONAS: 'Ver personas',
  CREAR_PERSONAS: 'Crear personas',
  EDITAR_PERSONAS: 'Editar personas',
  ELIMINAR_PERSONAS: 'Eliminar personas',
  VER_ROLES: 'Ver roles',
  ASIGNAR_ROLES: 'Asignar roles',
  VER_PERMISOS: 'Ver permisos',
  ASIGNAR_PERMISOS: 'Asignar permisos',
  VER_ASISTENCIAS: 'VER_ASISTENCIAS',
  TOMAR_ASISTENCIA: 'TOMAR_ASISTENCIA',
  ADMINISTRAR_SISTEMA: 'ADMINISTRAR_SISTEMA'
} as const;