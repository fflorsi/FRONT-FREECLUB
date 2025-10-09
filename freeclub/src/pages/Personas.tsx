import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Filter } from 'lucide-react';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import PersonaForm from '../forms/PersonaForm';
// import { mockPersonas, mockUsuarios } from '../data/mockData';
import { Persona, Usuario } from '../types';
import { useAuth } from '../context/AuthContext';
import { PERMISOS } from '../types';
import { fetchPersonas, editarPersona } from '../api/personas';
import { fetchUsuarios } from '../api/usuarios'


const Personas: React.FC = () => {
  const { hasPermission } = useAuth();
  //const [personas, setPersonas] = useState<Persona[]>(mockPersonas);
  const [personas, setPersonas] = useState<Persona[]>([]);
  // const [usuarios, setUsuarios] = useState<Usuario[]>(mockUsuarios);
  const [_usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const [personasData, usuariosData] = await Promise.all([
          fetchPersonas(),
          fetchUsuarios()
        ]);
        setPersonas(personasData);
        setUsuarios(usuariosData);
      } catch (e) {
        console.error('Error al cargar personas/usuarios:', e);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);
 
  
  const filteredPersonas = useMemo(() => {
    return personas.filter(persona => {
      const matchesSearch = 
      (persona.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (persona.lastname?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (persona.dni || '').includes(searchTerm) ||
      (persona.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      (persona.medical_coverage?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      (persona.phone?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      (persona.address?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      (persona.address_details?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      (persona.blood_type?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      (persona.medical_conditions?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      (persona.emergency_phone?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      (persona.emergency_relation?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === '' || (persona.roles || []).includes(roleFilter);
      const matchesStatus = showInactive || persona.member;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [personas, searchTerm, roleFilter, showInactive]);

  const roles = ['Administrador', 'Socio', 'Profesor'];

  

  const getRoleColor = (role: string) => {
    const colors = {
      superadmin: 'bg-dark-100 text-dark-800',
      admin: 'bg-primary-100 text-primary-800',
      coach: 'bg-emerald-100 text-emerald-800',
      alumno: 'bg-cream-100 text-cream-800',
      padre: 'bg-dark-100 text-dark-800'
    };
    return colors[role as keyof typeof colors] || 'bg-dark-100 text-dark-800';
  };

  const handleSavePersona = (persona: Persona, usuario?: Usuario) => {
    if (isEditing) {
      setPersonas(prev => prev.map(p => p.dni === persona.dni ? persona : p));
    } else {
      setPersonas(prev => [...prev, persona]);
      if (usuario) {
        setUsuarios(prev => [...prev, usuario]);
      }
    }
    setShowForm(false);
    setSelectedPersona(null);
    setIsEditing(false);
  };

  const handleEditPersona = (persona: Persona) => {
    setSelectedPersona(persona);
    setIsEditing(true);
    setShowForm(true);
  };

const handleDeletePersona = async (dni: string) => {
  if (window.confirm('¿Está seguro de que desea eliminar esta persona?')) {
    try {
      // Cambia el estado a inactivo en el backend
      await editarPersona(dni, { member: false });
      // Actualiza el estado local
      setPersonas(prev =>
        prev.map(p => p.dni === dni ? { ...p, member: false } : p)
      );
    } catch (e) {
      alert('Error al desactivar la persona' + e);
    }
  }
};

  const handleAddPersona = () => {
    setSelectedPersona(null);
    setIsEditing(false);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setSelectedPersona(null);
    setIsEditing(false);
  };

  const [showViewModal, setShowViewModal] = useState(false);
  const [viewPersona, setViewPersona] = useState<Persona | null>(null);

  const handleViewPersona = (persona: Persona) => {
    setViewPersona(persona);
    setShowViewModal(true);
    // Prevenir scroll del body
    document.body.classList.add('modal-open');
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewPersona(null);
    // Restaurar scroll del body
    document.body.classList.remove('modal-open');
  };

  return (
    loading ? (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando personas...</p>
        </div>
      </div>
    ) : (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-900">Personas</h1>
          <p className="text-dark-600 mt-1">Gestión de personas del club</p>
        </div>
        {hasPermission(PERMISOS.CREAR_PERSONAS) && (
          <Button icon={Plus} className="mt-4 sm:mt-0" onClick={handleAddPersona}>
            Agregar Persona
          </Button>
        )}
      </div>

      {/* Filtros */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400" size={16} />
            <input
              type="text"
              placeholder="Buscar por nombre, DNI o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400" size={16} />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Todos los roles</option>
              {roles.map(role => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showInactive"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded border-dark-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="showInactive" className="text-sm text-dark-700">
              Mostrar inactivos
            </label>
          </div>

          <div className="text-sm text-dark-600 flex items-center">
            <span className="font-medium">{filteredPersonas.length}</span>
            <span className="ml-1">personas encontradas</span>
          </div>
        </div>
      </Card>

      {/* Lista de Personas */}
      <Card>
        {/* Vista Desktop - Tabla */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-200">
                <th className="text-left py-3 px-4 font-semibold text-dark-700">Persona</th>
                <th className="text-left py-3 px-4 font-semibold text-dark-700">DNI</th>
                <th className="text-left py-3 px-4 font-semibold text-dark-700">Contacto</th>
                <th className="text-left py-3 px-4 font-semibold text-dark-700">Roles</th>
                
                <th className="text-left py-3 px-4 font-semibold text-dark-700">Estado</th>
                <th className="text-left py-3 px-4 font-semibold text-dark-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredPersonas.map((persona) => (
                <tr key={persona.dni} className="border-b border-dark-100 hover:bg-dark-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-700 font-semibold text-sm">
                          {persona.name.charAt(0)}{persona.lastname.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-dark-900">
                          {persona.name} {persona.lastname}
                        </p>
                        <p className="text-sm text-dark-500">
                          Desde: {new Date(persona.join_date).toLocaleDateString('es-AR')}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-dark-900 font-mono">{persona.dni}</td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-sm text-dark-900">{persona.email}</p>
                      <p className="text-sm text-dark-500">{persona.phone}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1">
                      {persona.roles.map((role) => (
                        <span
                          key={role}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(role)}`}
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      persona.member 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-danger-100 text-danger-800'
                    }`}>
                      {persona.member ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        className="p-1 text-primary-600 hover:bg-primary-50 rounded"
                        onClick={() => handleViewPersona(persona)}
                      >
                        <Eye size={16} />
                      </button>
                      {hasPermission(PERMISOS.EDITAR_PERSONAS) && (
                        <button 
                          onClick={() => handleEditPersona(persona)}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                        >
                          <Edit size={16} />
                        </button>
                      )}
                      {hasPermission(PERMISOS.ELIMINAR_PERSONAS) && (
                        <button 
                          onClick={() => handleDeletePersona(persona.dni)}
                          className="p-1 text-danger-600 hover:bg-danger-50 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Vista Mobile/Tablet - Cards */}
        <div className="lg:hidden space-y-4">
          {filteredPersonas.map((persona) => (
            <div key={persona.dni} className="border border-dark-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
              {/* Header con avatar y nombre */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-700 font-semibold">
                      {persona.name.charAt(0)}{persona.lastname.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-dark-900 truncate">
                      {persona.name} {persona.lastname}
                    </p>
                    <p className="text-sm text-dark-500">
                      DNI: {persona.dni}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  persona.member 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-danger-100 text-danger-800'
                }`}>
                  {persona.member ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              {/* Información de contacto */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3 text-sm">
                <div>
                  <span className="text-dark-500">Email:</span>
                  <p className="text-dark-900 truncate">{persona.email}</p>
                </div>
                <div>
                  <span className="text-dark-500">Teléfono:</span>
                  <p className="text-dark-900">{persona.phone}</p>
                </div>
              </div>

              {/* Roles */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <div className="flex flex-wrap gap-1">
                  {persona.roles.map((role) => (
                    <span
                      key={role}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(role)}`}
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              {/* Fecha de ingreso y acciones */}
              <div className="flex items-center justify-between pt-2 border-t border-dark-100">
                <p className="text-xs text-dark-500">
                  Desde: {new Date(persona.join_date).toLocaleDateString('es-AR')}
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    className="p-2 text-primary-600 hover:bg-primary-50 rounded-full"
                    onClick={() => handleViewPersona(persona)}
                  >
                    <Eye size={16} />
                  </button>
                  {hasPermission(PERMISOS.EDITAR_PERSONAS) && (
                    <button 
                      onClick={() => handleEditPersona(persona)}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full"
                    >
                      <Edit size={16} />
                    </button>
                  )}
                  {hasPermission(PERMISOS.ELIMINAR_PERSONAS) && (
                    <button 
                      onClick={() => handleDeletePersona(persona.dni)}
                      className="p-2 text-danger-600 hover:bg-danger-50 rounded-full"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredPersonas.length === 0 && (
          <div className="text-center py-8">
            <p className="text-dark-500">No se encontraron personas con los filtros aplicados</p>
          </div>
        )}
      </Card>

      {/* Formulario de Persona */}
      {showForm && (
        <PersonaForm
          persona={selectedPersona || undefined}
          onSave={handleSavePersona}
          onCancel={handleCancelForm}
          isEditing={isEditing}
        />
      )}

      {showViewModal && viewPersona && (
  <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg sm:text-xl font-semibold text-dark-900">
            Detalles de la Persona
          </h3>
          <button
            onClick={handleCloseViewModal}
            className="text-dark-400 hover:text-dark-600 p-1"
          >
            ✕
          </button>
        </div>
        
        {/* Header con avatar y info principal */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6 p-4 bg-primary-50 rounded-lg">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-700 font-semibold text-xl">
              {viewPersona.name.charAt(0)}{viewPersona.lastname.charAt(0)}
            </span>
          </div>
          <div className="flex-1">
            <p className="font-medium text-dark-900 text-xl">
              {viewPersona.name} {viewPersona.lastname}
            </p>
            <p className="text-sm text-dark-500">
              Miembro desde: {new Date(viewPersona.join_date).toLocaleDateString('es-AR')}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {viewPersona.roles.map((role) => (
                <span
                  key={role}
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(role)}`}
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
          <div className="text-right">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              viewPersona.member 
                ? 'bg-emerald-100 text-emerald-800' 
                : 'bg-danger-100 text-danger-800'
            }`}>
              {viewPersona.member ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>

        {/* Información detallada en grid responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Información Personal */}
          <div className="space-y-4">
            <h4 className="font-semibold text-dark-900 text-lg border-b border-dark-200 pb-2">
              Información Personal
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-dark-700 block">DNI:</label>
                <p className="text-dark-900 font-mono">{viewPersona.dni}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-dark-700 block">Fecha de Nacimiento:</label>
                <p className="text-dark-900">{new Date(viewPersona.birthdate).toLocaleDateString('es-AR')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-dark-700 block">Tipo de Sangre:</label>
                <p className="text-dark-900">{viewPersona.blood_type || 'No especificado'}</p>
              </div>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="space-y-4">
            <h4 className="font-semibold text-dark-900 text-lg border-b border-dark-200 pb-2">
              Contacto
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-dark-700 block">Email:</label>
                <p className="text-dark-900 break-all">{viewPersona.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-dark-700 block">Teléfono:</label>
                <p className="text-dark-900">{viewPersona.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-dark-700 block">Dirección:</label>
                <p className="text-dark-900">{viewPersona.address}</p>
                {viewPersona.address_details && (
                  <p className="text-sm text-dark-600">{viewPersona.address_details}</p>
                )}
              </div>
            </div>
          </div>

          {/* Información Médica y Emergencia */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <h4 className="font-semibold text-dark-900 text-lg border-b border-dark-200 pb-2">
              Médico y Emergencia
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-dark-700 block">Cobertura Médica:</label>
                <p className="text-dark-900">{viewPersona.medical_coverage || 'No especificada'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-dark-700 block">Condiciones Médicas:</label>
                <p className="text-dark-900">{viewPersona.medical_conditions || 'Ninguna'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-dark-700 block">Contacto de Emergencia:</label>
                <p className="text-dark-900">{viewPersona.emergency_phone}</p>
                <p className="text-sm text-dark-600">({viewPersona.emergency_relation})</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-dark-200">
          <Button variant="secondary" onClick={handleCloseViewModal}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  </div>
)}
  </div>
  )
  );
};

export default Personas;