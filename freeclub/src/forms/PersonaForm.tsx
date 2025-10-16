import React, { useState, useEffect } from 'react';
import { Save, X, User, Mail, Heart, AlertTriangle } from 'lucide-react';
import Button from '../components/Common/Button';
import { Persona, Usuario } from '../types';
import { PERMISOS } from '../types';

import { crearPersona, editarPersona } from '../api/personas';
import { crearUsuario } from '../api/usuarios';
import { fetchRoles } from '../api/roles';
// import { fetchUsuarioPorUsername } from '../api/usuarios';



interface PersonaFormProps {
  persona?: Persona;
  onSave: (persona: Persona, usuario?: Usuario) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const PersonaForm: React.FC<PersonaFormProps> = ({ 
  persona, 
  onSave, 
  onCancel, 
  isEditing = false 
}) => {
  const [formData, setFormData] = useState<Partial<Persona>>({
    dni: persona?.dni || '',
    name: persona?.name || '',
    lastname: persona?.lastname || '',
    cuit: persona?.cuit ?? '',
    email: persona?.email || '',
    phone: persona?.phone || '',
    address: persona?.address || '',
    address_details: persona?.address_details || '',
    birthdate: persona?.birthdate || '',
    medical_coverage: persona?.medical_coverage || '',
    blood_type: persona?.blood_type || '',
    medical_conditions: persona?.medical_conditions || '',
    emergency_phone: persona?.emergency_phone || '',
    emergency_relation: persona?.emergency_relation || '',
    join_date: persona?.join_date || new Date().toISOString().split('T')[0],
    roles: (persona?.roles || []).map(r => String(r)),
    member: persona?.member ?? true,
    faltas: persona?.faltas || 0
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<string[]>([]);


  const handleInputChange = (field: keyof Persona, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando se modifica
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

const handleRolChange = (rolId: string | number, checked: boolean) => {
  const rolIdStr = String(rolId);
  setFormData(prev => ({
    ...prev,
    roles: checked
      ? [...(prev.roles || []), rolIdStr]
      : (prev.roles || []).filter((r) => String(r) !== rolIdStr)
  }));
};
  const handlePermisoChange = (permiso: string, checked: boolean) => {
  setPermisosSeleccionados(prev =>
    checked ? [...prev, permiso] : prev.filter(p => p !== permiso)
  );
};


  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.dni) newErrors.dni = 'DNI es requerido';
  if (!formData.name) newErrors.nombre = 'Nombre es requerido';
  if (!formData.lastname) newErrors.apellido = 'Apellido es requerido';
    if (!formData.cuit && !isEditing) newErrors.cuit = 'CUIT es requerido';
    if (!formData.email) newErrors.email = 'Email es requerido';
  if (!formData.phone) newErrors.telefono = 'Teléfono es requerido';
  if (!formData.address) newErrors.direccion = 'Dirección es requerida';
    if (!formData.address_details) newErrors.address_details = 'Detalles de dirección requeridos';
    if (!formData.birthdate) newErrors.fechaNacimiento = 'Fecha de nacimiento es requerida';
    if (!formData.medical_coverage) newErrors.medical_coverage = 'Cobertura médica es requerida';
    if (!formData.blood_type) newErrors.blood_type = 'Tipo de sangre es requerido';
    if (!formData.medical_conditions) newErrors.medical_conditions = 'Afecciones declaradas requeridas';
    if (!formData.emergency_phone) newErrors.telefonoEmergencia = 'Teléfono de emergencia es requerido';
    if (!formData.emergency_relation) newErrors.relacionEmergencia = 'Relación de emergencia es requerida';
    if (!formData.join_date) newErrors.join_date = 'Fecha de inicio del vínculo es requerida';
    if (!formData.roles || formData.roles.length === 0) newErrors.roles = 'Debe seleccionar al menos un rol';
    // Validar formato de email
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email no válido';
    }

    // Validar DNI (8 dígitos)
    if (formData.dni && !/^\d{8}$/.test(formData.dni)) {
      newErrors.dni = 'DNI debe tener 8 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [showUserModal, setShowUserModal] = useState(false);
  const [newUserData, setNewUserData] = useState<{ username: string; password: string } | null>(null);
  const PERMISO_NOMBRE_A_ID: { [nombre: string]: number } = {
  "Ver usuarios": 1,
  "Crear usuarios": 2,
  "Editar usuarios": 3,
  "Eliminar usuarios": 4,
  "Ver personas": 5,
  "Crear personas": 6,
  "Editar personas": 7,
  "Eliminar personas": 8,
  "Ver roles": 9,
  "Asignar roles": 10,
  "Ver permisos": 11,
  "Asignar permisos": 12,
  "VER_ASISTENCIAS": 13,
  "TOMAR_ASISTENCIA": 14,
  "ADMINISTRAR_SISTEMA": 15,
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) return;

  // Prepara los datos para el backend
  const personaBackend = {
    dni: formData.dni!,
    name: formData.name!,
    lastname: formData.lastname!,
    cuit: formData.cuit,
    email: formData.email!,
    phone: formData.phone!,
    address: formData.address!,
    address_details: formData.address_details,
    birthdate: formData.birthdate!,
    medical_coverage: formData.medical_coverage,
    blood_type: formData.blood_type,
    medical_conditions: formData.medical_conditions,
    emergency_phone: formData.emergency_phone!,
    emergency_relation: formData.emergency_relation!,
    join_date: formData.join_date!,
    roles: formData.roles && formData.roles.length > 0
    ? formData.roles.map(r => Number(r))
    : [1], // Usa el primer rol seleccionado o 1 por defecto
    member: formData.member!,
  };

  try {
    if (isEditing) {
      // Editar persona existente
      const updateData: Record<string, unknown> = { ...personaBackend };
      // Si el CUIT está vacío en edición, no lo mandamos para no sobreescribir con nada
      if (!formData.cuit || formData.cuit === '') {
        delete updateData.cuit;
      }
      await editarPersona(formData.dni!, updateData);
      onSave(formData as Persona);
      window.location.reload();
    } else {
      // Crear persona nueva
      await crearPersona(personaBackend);

      // Crear usuario solo si es alta
      const username = formData.dni!;
      const password = `${formData.name!.toLowerCase()}123`;
      await crearUsuario({
        username: formData.dni!,
        password: password,
        permissions: permisosSeleccionados.map(nombre => PERMISO_NOMBRE_A_ID[nombre]).filter(Boolean),
      });
      setNewUserData({ username, password });
      setShowUserModal(true);

    }
  } catch {
    alert("Error al crear o editar persona o usuario");
  }
};

  const [roles, setRoles] = useState<{ id: number|string, name: string, description: string }[]>([]);
  
  useEffect(() => {
  fetchRoles().then(setRoles).catch(() => setRoles([]));
  }, []);

useEffect(() => {
  if (isEditing && persona && roles.length > 0) {
    // Mapear nombres de roles a IDs
    const personaRoleIds = (persona.roles || [])
      .map(nombre =>
        roles.find(r => r.name === nombre)?.id
      )
      .filter(id => id !== undefined)
      .map(id => String(id));
    setFormData(prev => ({
      ...prev,
     // ...persona,
     /* cuit: persona.cuit !== undefined && persona.cuit !== null
      ? persona.cuit
      : prev.cuit, */
      roles: personaRoleIds,
    }));
  }
}, [isEditing, persona, roles]);




  const tiposSangre = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <>
    {/* Modal de usuario creado */}
    {showUserModal && newUserData && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div
          className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 flex flex-col items-center"
          onClick={e => e.stopPropagation()}
        >
          <h2 className="text-xl font-bold text-dark-900 mb-4">Usuario creado exitosamente</h2>
          <div className="mb-4 w-full">
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-dark-700">Usuario:</span>
              <span className="text-dark-900">{newUserData.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-dark-700">Contraseña:</span>
              <span className="text-dark-900">{newUserData.password}</span>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => {
              setShowUserModal(false);
              onSave(formData as Persona);
              window.location.reload();
            }}
          >
            Continuar
          </Button>
        </div>
      </div>
    )}
    {/* Modal principal */}
    {!showUserModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {<div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-dark-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-dark-900">
                {isEditing ? 'Editar Persona' : 'Agregar Nueva Persona'}
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

          <div className="p-6 space-y-8">
            {/* Información Personal */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <User className="text-primary-600" size={20} />
                <h3 className="text-lg font-semibold text-dark-900">Información Personal</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">
                    DNI *
                  </label>
                  <input
                    type="text"
                    value={formData.dni}
                    onChange={(e) => handleInputChange('dni', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.dni ? 'border-danger-300' : 'border-dark-300'
                    }`}
                    placeholder="12345678"
                    maxLength={8}
                  />
                  {errors.dni && <p className="text-danger-600 text-xs mt-1">{errors.dni}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.nombre ? 'border-danger-300' : 'border-dark-300'
                    }`}
                  />
                  {errors.nombre && <p className="text-danger-600 text-xs mt-1">{errors.nombre}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    value={formData.lastname}
                    onChange={(e) => handleInputChange('lastname', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.apellido ? 'border-danger-300' : 'border-dark-300'
                    }`}
                  />
                  {errors.apellido && <p className="text-danger-600 text-xs mt-1">{errors.apellido}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">
                    CUIT
                  </label>
                  <input
                    type="text"
                    value={formData.cuit ?? ''}
                    onChange={(e) => handleInputChange('cuit', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.cuit ? 'border-danger-300' : 'border-dark-300'
                    }`}
                    placeholder="20-12345678-9"
                  />
                  {errors.cuit && <p className="text-danger-600 text-xs mt-1">{errors.cuit}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">
                    Fecha de Nacimiento *
                  </label>
                  <input
                    type="date"
                    value={formData.birthdate}
                    onChange={(e) => handleInputChange('birthdate', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.fechaNacimiento ? 'border-danger-300' : 'border-dark-300'
                    }`}
                  />
                  {errors.fechaNacimiento && <p className="text-danger-600 text-xs mt-1">{errors.fechaNacimiento}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">
                    Inicio del Vínculo *
                  </label>
                  <input
                    type="date"
                    value={formData.join_date}
                    onChange={(e) => handleInputChange('join_date', e.target.value)}
                    className="w-full px-3 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Información de Contacto */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Mail className="text-primary-600" size={20} />
                <h3 className="text-lg font-semibold text-dark-900">Información de Contacto</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.email ? 'border-danger-300' : 'border-dark-300'
                    }`}
                  />
                  {errors.email && <p className="text-danger-600 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.telefono ? 'border-danger-300' : 'border-dark-300'
                    }`}
                  />
                  {errors.telefono && <p className="text-danger-600 text-xs mt-1">{errors.telefono}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">
                    Dirección *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.direccion ? 'border-danger-300' : 'border-dark-300'
                    }`}
                  />
                  {errors.direccion && <p className="text-danger-600 text-xs mt-1">{errors.direccion}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">
                    Detalles de Dirección
                  </label>
                  <input
                    type="text"
                    value={formData.address_details}
                    onChange={(e) => handleInputChange('address_details', e.target.value)}
                    className={`w-full px-3 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.address_details ? 'border-danger-300' : 'border-dark-300'
                    }`}
                    placeholder="Piso, departamento, etc."
                  />
                  {errors.address_details && <p className="text-danger-600 text-xs mt-1">{errors.address_details}</p>}

                </div>
              </div>
            </div>

            {/* Información Médica */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="text-primary-600" size={20} />
                <h3 className="text-lg font-semibold text-dark-900">Información Médica</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">
                    Cobertura Médica
                  </label>
                  <input
                    type="text"
                    value={formData.medical_coverage}
                    onChange={(e) => handleInputChange('medical_coverage', e.target.value)}
                    className={`w-full px-3 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.medical_coverage ? 'border-danger-300' : 'border-dark-300'
                    }`}
                  />
                  {errors.medical_coverage && <p className="text-danger-600 text-xs mt-1">{errors.medical_coverage}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">
                    Tipo de Sangre
                  </label>
                  <select
                    value={formData.blood_type}
                    onChange={(e) => handleInputChange('blood_type', e.target.value)}
                    className={`w-full px-3 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.blood_type ? 'border-danger-300' : 'border-dark-300'
                    }`}
                  >
                    <option value="">Seleccionar</option>
                    {tiposSangre.map(tipo => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                  {errors.blood_type && <p className="text-danger-600 text-xs mt-1">{errors.blood_type}</p>}
                </div>

                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-dark-700 mb-1">
                    Afecciones Declaradas
                  </label>
                  <textarea
                  value={formData.medical_conditions}
                  onChange={(e) => handleInputChange('medical_conditions', e.target.value)}
                  className={`w-full px-3 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.medical_conditions ? 'border-danger-300' : 'border-dark-300'
                  }`}
                  rows={2}
                  placeholder="Alergias, medicamentos, etc."
                />
                {errors.medical_conditions && <p className="text-danger-600 text-xs mt-1">{errors.medical_conditions}</p>}
                </div>
              </div>
            </div>

            {/* Contacto de Emergencia */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <AlertTriangle className="text-primary-600" size={20} />
                <h3 className="text-lg font-semibold text-dark-900">Contacto de Emergencia</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">
                    Teléfono de Emergencia *
                  </label>
                  <input
                    type="tel"
                    value={formData.emergency_phone}
                    onChange={(e) => handleInputChange('emergency_phone', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.telefonoEmergencia ? 'border-danger-300' : 'border-dark-300'
                    }`}
                  />
                  {errors.telefonoEmergencia && <p className="text-danger-600 text-xs mt-1">{errors.telefonoEmergencia}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">
                    Relación *
                  </label>
                  <input
                    type="text"
                    value={formData.emergency_relation}
                    onChange={(e) => handleInputChange('emergency_relation', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.relacionEmergencia ? 'border-danger-300' : 'border-dark-300'
                    }`}
                    placeholder="Padre, madre, hermano, etc."
                  />
                  {errors.relacionEmergencia && <p className="text-danger-600 text-xs mt-1">{errors.relacionEmergencia}</p>}
                </div>
              </div>
            </div>

            {/* Permisos */}
                {!isEditing && (
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <User className="text-primary-600" size={20} />
                <h3 className="text-lg font-semibold text-dark-900">Permisos del Usuario</h3>
              </div>
              <div className="space-y-3">
                {Object.entries(PERMISOS).map(([key, value]) => (
                <div key={key} className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id={key}
                    checked={permisosSeleccionados.includes(value)}
                    onChange={e => handlePermisoChange(value, e.target.checked)}
                    className="mt-1 rounded border-dark-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor={key} className="text-sm font-medium text-dark-900 cursor-pointer">
                    {value}
                  </label>
                </div>
              ))}
              </div>
            </div>
            )}
            {/* Roles */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <User className="text-primary-600" size={20} />
                <h3 className="text-lg font-semibold text-dark-900">Roles</h3>
              </div>
              <div className="space-y-3">
              {roles.map((rol) => (
                <div key={rol.id} className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id={`rol-${rol.id}`}
                    checked={formData.roles?.map(r => String(r)).includes(String(rol.id))}
                    onChange={e => handleRolChange(rol.id, e.target.checked)}
                    className="mt-1 rounded border-dark-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor={`rol-${rol.id}`} className="text-sm font-medium text-dark-900 cursor-pointer">
                    {rol.name} <span className="text-dark-400 text-xs">({rol.description})</span>
                  </label>
                </div>
              ))}
            </div>
            </div>

            {/* Estado */}
            <div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="activo"
                  checked={formData.member}
                  onChange={(e) => handleInputChange('member', e.target.checked)}
                  className="rounded border-dark-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="activo" className="text-sm font-medium text-dark-700">
                  Persona activa en el sistema
                </label>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-dark-200 flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" icon={Save}>
              {isEditing ? 'Actualizar Persona' : 'Crear Persona'}
            </Button>
          </div>
        </form>
      </div>
} </div>
            )}
</>
  );
};

export default PersonaForm;