import { Persona, Usuario, Asistencia, Actividad } from '../types';
import { PERMISOS } from '../types';

export const mockPersonas: Persona[] = [
  {
    dni: '12345678',
    nombre: 'Carlos',
    apellido: 'Rodriguez',
    cuit: '20-12345678-9',
    email: 'carlos@club.com',
    telefono: '11-4444-5555',
    direccion: 'Av. Libertador 1234',
    direccionDetalles: 'Piso 2, Dpto A',
    fechaNacimiento: '1980-05-15',
    coberturaMedica: 'OSDE',
    tipoSangre: 'A+',
    afeccionesDeclaradas: 'Ninguna',
    telefonoEmergencia: '11-9999-8888',
    relacionEmergencia: 'Esposa',
    inicioVinculo: '2020-01-15',
    roles: ['superadmin'],
    activo: true,
    faltas: 0
  },
  {
    dni: '87654321',
    nombre: 'María',
    apellido: 'González',
    email: 'maria@club.com',
    telefono: '11-3333-4444',
    direccion: 'San Martín 567',
    fechaNacimiento: '1985-09-22',
    telefonoEmergencia: '11-7777-6666',
    relacionEmergencia: 'Hermana',
    inicioVinculo: '2021-03-10',
    roles: ['coach'],
    activo: true,
    faltas: 1
  },
  {
    dni: '11223344',
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan@club.com',
    telefono: '11-2222-3333',
    direccion: 'Belgrano 890',
    fechaNacimiento: '2010-12-03',
    telefonoEmergencia: '11-5555-4444',
    relacionEmergencia: 'Padre',
    inicioVinculo: '2022-02-01',
    roles: ['alumno'],
    activo: true,
    faltas: 4
  },
  {
    dni: '44332211',
    nombre: 'Ana',
    apellido: 'Martínez',
    email: 'ana@club.com',
    telefono: '11-1111-2222',
    direccion: 'Mitre 456',
    fechaNacimiento: '2008-07-18',
    telefonoEmergencia: '11-8888-7777',
    relacionEmergencia: 'Madre',
    inicioVinculo: '2023-01-15',
    roles: ['alumno'],
    activo: true,
    faltas: 2
  },
  {
    dni: '55443322',
    nombre: 'Luis',
    apellido: 'Fernández',
    email: 'luis@club.com',
    telefono: '11-6666-7777',
    direccion: 'Rivadavia 789',
    fechaNacimiento: '1978-11-25',
    telefonoEmergencia: '11-4444-3333',
    relacionEmergencia: 'Esposa',
    inicioVinculo: '2019-08-20',
    roles: ['coach'],
    activo: true,
    faltas: 0
  },
  {
    dni: '66554433',
    nombre: 'Sofia',
    apellido: 'López',
    email: 'sofia@club.com',
    telefono: '11-5555-6666',
    direccion: 'Corrientes 321',
    fechaNacimiento: '2009-03-12',
    telefonoEmergencia: '11-2222-1111',
    relacionEmergencia: 'Madre',
    inicioVinculo: '2023-03-01',
    roles: ['alumno'],
    activo: true,
    faltas: 1
  },
  {
    dni: '77665544',
    nombre: 'Diego',
    apellido: 'Morales',
    email: 'diego@club.com',
    telefono: '11-7777-8888',
    direccion: 'Sarmiento 654',
    fechaNacimiento: '2011-08-25',
    telefonoEmergencia: '11-3333-2222',
    relacionEmergencia: 'Padre',
    inicioVinculo: '2022-07-15',
    roles: ['alumno'],
    activo: true,
    faltas: 5
  }
];

export const mockUsuarios: Usuario[] = [
  {
    nombreUsuario: 'admin',
    personaDni: '12345678',
    contraseña: 'admin123',
    permisos: Object.values(PERMISOS),
    activo: true
  },
  {
    nombreUsuario: 'maria.coach',
    personaDni: '87654321',
    contraseña: 'coach123',
    permisos: [PERMISOS.VER_PERSONAS, PERMISOS.TOMAR_ASISTENCIA, PERMISOS.VER_ASISTENCIAS],
    activo: true
  },
  {
    nombreUsuario: 'luis.coach',
    personaDni: '55443322',
    contraseña: 'coach123',
    permisos: [PERMISOS.VER_PERSONAS, PERMISOS.TOMAR_ASISTENCIA, PERMISOS.VER_ASISTENCIAS],
    activo: true
  },
  {
    nombreUsuario: 'juan.alumno',
    personaDni: '11223344',
    contraseña: 'alumno123',
    permisos: [PERMISOS.VER_ASISTENCIAS],
    activo: true
  }
];

export const mockActividades: Actividad[] = [
  {
    id: '1',
    nombre: 'Entrenamiento Juvenil',
    descripcion: 'Entrenamiento para categoría juvenil (15-17 años)',
    coachDni: '87654321',
    diasSemana: ['lunes', 'miércoles', 'viernes'],
    horario: '18:00-20:00',
    activa: true
  },
  {
    id: '2',
    nombre: 'Entrenamiento Infantil',
    descripcion: 'Entrenamiento para categoría infantil (8-12 años)',
    coachDni: '55443322',
    diasSemana: ['martes', 'jueves'],
    horario: '16:00-17:30',
    activa: true
  },
  {
    id: '3',
    nombre: 'Fútbol Femenino',
    descripcion: 'Entrenamiento de fútbol femenino',
    coachDni: '87654321',
    diasSemana: ['sábado'],
    horario: '10:00-12:00',
    activa: true
  },
  {
    id: '4',
    nombre: 'Preparación Física',
    descripcion: 'Sesiones de preparación física general',
    coachDni: '55443322',
    diasSemana: ['lunes', 'miércoles'],
    horario: '19:00-20:00',
    activa: true
  }
];

export const mockAsistencias: Asistencia[] = [
  {
    id: '1',
    personaDni: '11223344',
    fecha: '2024-01-15',
    actividadId: '1',
    coach: '87654321',
    presente: false,
    justificada: false,
    observaciones: 'Ausente sin justificar'
  },
  {
    id: '2',
    personaDni: '11223344',
    fecha: '2024-01-17',
    actividadId: '1',
    coach: '87654321',
    presente: false,
    justificada: true,
    observaciones: 'Enfermedad - Certificado médico'
  },
  {
    id: '3',
    personaDni: '44332211',
    fecha: '2024-01-16',
    actividadId: '2',
    coach: '55443322',
    presente: true,
    justificada: false
  },
  {
    id: '4',
    personaDni: '11223344',
    fecha: '2024-01-19',
    actividadId: '1',
    coach: '87654321',
    presente: false,
    justificada: false,
    observaciones: 'Ausente sin justificar'
  },
  {
    id: '5',
    personaDni: '66554433',
    fecha: '2024-01-16',
    actividadId: '2',
    coach: '55443322',
    presente: true,
    justificada: false
  },
  {
    id: '6',
    personaDni: '77665544',
    fecha: '2024-01-15',
    actividadId: '1',
    coach: '87654321',
    presente: false,
    justificada: false,
    observaciones: 'Llegó tarde y no pudo ingresar'
  },
  {
    id: '7',
    personaDni: '77665544',
    fecha: '2024-01-17',
    actividadId: '1',
    coach: '87654321',
    presente: false,
    justificada: false
  },
  {
    id: '8',
    personaDni: '77665544',
    fecha: '2024-01-19',
    actividadId: '1',
    coach: '87654321',
    presente: false,
    justificada: false
  },
  {
    id: '9',
    personaDni: '77665544',
    fecha: '2024-01-22',
    actividadId: '1',
    coach: '87654321',
    presente: false,
    justificada: false
  },
  {
    id: '10',
    personaDni: '77665544',
    fecha: '2024-01-24',
    actividadId: '1',
    coach: '87654321',
    presente: false,
    justificada: false
  }
];

// Feriados argentinos 2024
export const feriadosArgentinos2024 = [
  { fecha: '2024-01-01', nombre: 'Año Nuevo' },
  { fecha: '2024-02-12', nombre: 'Carnaval' },
  { fecha: '2024-02-13', nombre: 'Carnaval' },
  { fecha: '2024-03-24', nombre: 'Día Nacional de la Memoria por la Verdad y la Justicia' },
  { fecha: '2024-03-29', nombre: 'Viernes Santo' },
  { fecha: '2024-04-02', nombre: 'Día del Veterano y de los Caídos en la Guerra de Malvinas' },
  { fecha: '2024-05-01', nombre: 'Día del Trabajador' },
  { fecha: '2024-05-25', nombre: 'Día de la Revolución de Mayo' },
  { fecha: '2024-06-17', nombre: 'Paso a la Inmortalidad del Gral. Martín Miguel de Güemes' },
  { fecha: '2024-06-20', nombre: 'Paso a la Inmortalidad del Gral. Manuel Belgrano' },
  { fecha: '2024-07-09', nombre: 'Día de la Independencia' },
  { fecha: '2024-08-19', nombre: 'Paso a la Inmortalidad del Gral. José de San Martín' },
  { fecha: '2024-10-14', nombre: 'Día del Respeto a la Diversidad Cultural' },
  { fecha: '2024-11-20', nombre: 'Día de la Soberanía Nacional' },
  { fecha: '2024-12-08', nombre: 'Inmaculada Concepción de María' },
  { fecha: '2024-12-25', nombre: 'Navidad' }
];