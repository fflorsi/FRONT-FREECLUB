import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Filter, AlertCircle } from 'lucide-react';
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
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [isEditing, setIsEditing] = useState(false);


  useEffect(() => {
     fetchPersonas()
    .then(data => {
      setPersonas(data);
      console.log('Personas cargadas:', data); // <-- Agrega esto
    })
    .catch(console.error);

        fetchUsuarios() 
    .then(setUsuarios)
    .catch(console.error);
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

  const getFaltasColor = (faltas: number | undefined) => {
    if (!faltas) return 'text-emerald-600';
    if (faltas > 3) return 'text-danger-600 font-bold';
    if (faltas > 1) return 'text-cream-600';
    return 'text-emerald-600';
  };

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
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewPersona(null);
  };

  return (
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-200">
                <th className="text-left py-3 px-4 font-semibold text-dark-700">Persona</th>
                <th className="text-left py-3 px-4 font-semibold text-dark-700">DNI</th>
                <th className="text-left py-3 px-4 font-semibold text-dark-700">Contacto</th>
                <th className="text-left py-3 px-4 font-semibold text-dark-700">Roles</th>
                <th className="text-left py-3 px-4 font-semibold text-dark-700">Faltas</th>
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
                    <div className="flex items-center space-x-1">
                      <span className={getFaltasColor(persona.faltas)}>
                        {persona.faltas || 0}
                      </span>
                      {(persona.faltas || 0) > 3 && (
                        <AlertCircle size={16} className="text-danger-500" />
                      )}
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
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-dark-900">
            Detalles de la Persona
          </h3>
          <button
            onClick={handleCloseViewModal}
            className="text-dark-400 hover:text-dark-600"
          >
            ✕
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3 md:col-span-2">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-700 font-semibold text-lg">
                {viewPersona.name.charAt(0)}{viewPersona.lastname.charAt(0)}
              </span>
            </div>
            <div>
              <p className="font-medium text-dark-900 text-lg">
                {viewPersona.name} {viewPersona.lastname}
              </p>
              <p className="text-sm text-dark-500">
                Desde: {new Date(viewPersona.join_date).toLocaleDateString('es-AR')}
              </p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-dark-700">DNI:</label>
            <p className="text-dark-900">{viewPersona.dni}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-dark-700">Email:</label>
            <p className="text-dark-900">{viewPersona.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-dark-700">Teléfono:</label>
            <p className="text-dark-900">{viewPersona.phone}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-dark-700">Dirección:</label>
            <p className="text-dark-900">{viewPersona.address}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-dark-700">Fecha de Nacimiento:</label>
            <p className="text-dark-900">{new Date(viewPersona.birthdate).toLocaleDateString('es-AR')}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-dark-700">Cobertura Médica:</label>
            <p className="text-dark-900">{viewPersona.medical_coverage}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-dark-700">Tipo de Sangre:</label>
            <p className="text-dark-900">{viewPersona.blood_type}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-dark-700">Condiciones Médicas:</label>
            <p className="text-dark-900">{viewPersona.medical_conditions}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-dark-700">Teléfono de Emergencia:</label>
            <p className="text-dark-900">{viewPersona.emergency_phone}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-dark-700">Parentesco:</label>
            <p className="text-dark-900">{viewPersona.emergency_relation}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-dark-700">Roles:</label>
            <div className="flex flex-wrap gap-2 mt-1">
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
          <div>
            <label className="text-sm font-medium text-dark-700">Faltas:</label>
            <span className={`ml-2 ${getFaltasColor(viewPersona.faltas)}`}>
              {viewPersona.faltas || 0}
            </span>
          </div>
          <div>
            <label className="text-sm font-medium text-dark-700">Estado:</label>
            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
              viewPersona.member 
                ? 'bg-emerald-100 text-emerald-800' 
                : 'bg-danger-100 text-danger-800'
            }`}>
              {viewPersona.member ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="secondary" onClick={handleCloseViewModal}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default Personas;