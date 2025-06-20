import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Shield, UserCheck, UserX, Key, EyeOff } from 'lucide-react';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
//import { mockUsuarios, mockPersonas } from '../data/mockData';
import { Usuario, Persona } from '../types';
import { useAuth } from '../context/AuthContext';
import { PERMISOS } from '../types';
import { fetchUsuarios, updateUsuario } from '../api/usuarios';
import { fetchPersonas } from '../api/personas';



const Usuarios: React.FC = () => {
  const { hasPermission } = useAuth();
  //const [usuarios, setUsuarios] = useState<Usuario[]>(mockUsuarios);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'edit' | 'permissions'>('view');
  const [showEditPassword, setShowEditPassword] = useState(false); // Nuevo estado

  useEffect(() => {
      fetchUsuarios().then(setUsuarios).catch(console.error);
      fetchPersonas().then(setPersonas).catch(console.error);
  }, []);

// Mapeo manual de nombre de permiso a ID numérico (ajusta los números según tu backend)
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


const filteredUsuarios = useMemo(() => {
  return usuarios.filter(usuario => {
    const persona = personas.find(p => p.dni === usuario.username);
    // Solo mostrar usuarios cuya persona está activa
    if (!persona || !persona.member) return false;
    const matchesSearch =
      usuario.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      persona?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      persona?.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      persona?.dni?.includes(searchTerm);

    const matchesStatus = statusFilter === '' ||
      (statusFilter === 'activo' && usuario.activo) ||
      (statusFilter === 'inactivo' && !usuario.activo);

    return matchesSearch && matchesStatus;
  });
}, [usuarios, personas, searchTerm, statusFilter]);
  
const toggleUsuarioStatus = (nombreUsuario: string) => {
    setUsuarios(prev => prev.map(u => 
      u.username === nombreUsuario 
        ? { ...u, activo: !u.activo }
        : u
    ));
  };

  const openModal = (usuario: Usuario, type: 'view' | 'edit' | 'permissions') => {
    setSelectedUsuario(usuario);
    setModalType(type);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedUsuario(null);
    setShowModal(false);
  };

  const getPermissionName = (permission: string) => {
    const names: { [key: string]: string } = {
      [PERMISOS.CREAR_PERSONAS]: 'Crear Personas',
      [PERMISOS.EDITAR_PERSONAS]: 'Editar Personas',
      [PERMISOS.VER_PERSONAS]: 'Ver Personas',
      [PERMISOS.ELIMINAR_PERSONAS]: 'Eliminar Personas',
      [PERMISOS.CREAR_USUARIOS]: 'Crear Usuarios',
      [PERMISOS.EDITAR_USUARIOS]: 'Editar Usuarios',
      [PERMISOS.VER_USUARIOS]: 'Ver Usuarios',
      [PERMISOS.TOMAR_ASISTENCIA]: 'Tomar Asistencia',
      [PERMISOS.VER_ASISTENCIAS]: 'Ver Asistencias',
      [PERMISOS.ADMINISTRAR_SISTEMA]: 'Administrar Sistema'
    };
    return names[permission] || permission;
  };

  const estadisticas = {
    total: usuarios.length,
    activos: usuarios.filter(u => u.activo).length,
    inactivos: usuarios.filter(u => !u.activo).length,
    admins: usuarios.filter(u => (u.permissions ?? []).includes(PERMISOS.ADMINISTRAR_SISTEMA)).length  };

return (
  <div className="space-y-6">
    {/* Estadísticas y filtros */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-dark-900">Usuarios</h1>
        <p className="text-dark-600 mt-1">Gestión de usuarios del sistema</p>
      </div>
    </div>

    {/* Tabla de usuarios */}
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dark-200">
              <th className="text-left py-3 px-4 font-semibold text-dark-700">Usuario</th>
              <th className="text-left py-3 px-4 font-semibold text-dark-700">Persona</th>
              <th className="text-left py-3 px-4 font-semibold text-dark-700">Permisos</th>
              <th className="text-left py-3 px-4 font-semibold text-dark-700">Estado</th>
              <th className="text-left py-3 px-4 font-semibold text-dark-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsuarios.map((usuario) => {
              const persona = personas.find(p => p.dni === usuario.username);

              return (
                <tr key={usuario.username} className="border-b border-dark-100 hover:bg-dark-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <Shield size={16} className="text-primary-700" />
                      </div>
                      <div>
                        <p className="font-medium text-dark-900">{usuario.username}</p>
                        <p className="text-sm text-dark-500">DNI: {usuario.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {persona ? (
                      <div>
                        <p className="font-medium text-dark-900">
                          {persona.name} {persona.lastname}
                        </p>
                        <p className="text-sm text-dark-500">{persona.email}</p>
                      </div>
                    ) : (
                      <span className="text-danger-600">Persona no encontrada</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                  <div className="flex flex-wrap gap-1">
                    {(usuario.permissions ?? []).slice(0, 2).map((permiso) => (
                      <span
                        key={permiso}
                        className="px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                      >
                        {getPermissionName(permiso)}
                      </span>
                    ))}
                    {(usuario.permissions ?? []).length > 2 && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-dark-100 text-dark-800">
                        +{(usuario.permissions ?? []).length - 2} más
                      </span>
                    )}
                  </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      usuario.activo 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-danger-100 text-danger-800'
                    }`}>
                      {usuario.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => openModal(usuario, 'view')}
                        className="p-1 text-primary-600 hover:bg-primary-50 rounded"
                      >
                        <Eye size={16} />
                      </button>
                      {hasPermission(PERMISOS.EDITAR_USUARIOS) && (
                        <>
                          <button 
                            onClick={() => openModal(usuario, 'edit')}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => openModal(usuario, 'permissions')}
                            className="p-1 text-cream-600 hover:bg-cream-50 rounded"
                          >
                            <Key size={16} />
                          </button>

                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {filteredUsuarios.length === 0 && (
        <div className="text-center py-8">
          <p className="text-dark-500">No se encontraron usuarios con los filtros aplicados</p>
        </div>
      )}
    </Card>

    {/* Modal */}
    {showModal && selectedUsuario && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-dark-900">
                {modalType === 'view' && 'Detalles del Usuario'}
                {modalType === 'edit' && 'Editar Usuario'}
                {modalType === 'permissions' && 'Gestionar Permisos'}
              </h3>
              <button
                onClick={closeModal}
                className="text-dark-400 hover:text-dark-600"
              >
                ✕
              </button>
            </div>
            
            {modalType === 'view' && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-dark-700">Usuario:</label>
                  <p className="text-dark-900">{selectedUsuario.username}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-dark-700">Persona:</label>
                  <p className="text-dark-900">
                    {personas.find(p => p.dni === selectedUsuario.username)?.name} {' '}
                    {personas.find(p => p.dni === selectedUsuario.username)?.lastname}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-dark-700">Estado:</label>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    selectedUsuario.activo 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-danger-100 text-danger-800'
                  }`}>
                    {selectedUsuario.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-dark-700 mb-2 block">Permisos:</label>
                  <div className="flex flex-wrap gap-2">
                  {(selectedUsuario.permissions ?? []).map((permiso) => (
                    <span
                      key={permiso}
                      className="px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                    >
                      {getPermissionName(permiso)}
                    </span>
                  ))}
                </div>
                </div>
              </div>
            )}
                {modalType === 'edit' && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-dark-700">Usuario:</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-dark-200 rounded px-3 py-2"
                    value={selectedUsuario.username}
                    onChange={e =>
                      setSelectedUsuario({
                        ...selectedUsuario,
                        username: e.target.value
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-dark-700">Contraseña:</label>
                  <div className="relative">
                    <input
                      type={showEditPassword ? 'text' : 'password'}
                      className="mt-1 block w-full border border-dark-200 rounded px-3 py-2 pr-10"
                      value={selectedUsuario.password || ''}
                      onChange={e =>
                        setSelectedUsuario({
                          ...selectedUsuario,
                          password: e.target.value
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-500 hover:text-dark-700"
                      tabIndex={-1}
                    >
                      {showEditPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>
            )} 
            {modalType === 'permissions' && (
              <div className="space-y-4">
                <label className="text-sm font-medium text-dark-700 mb-2 block">Permisos:</label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(PERMISO_NOMBRE_A_ID).map(([nombre, id]) => (
                    <label key={id} className="flex items-center gap-2 bg-dark-50 px-2 py-1 rounded">
                  <input
                    type="checkbox"
                    checked={(selectedUsuario.permissions ?? []).includes(nombre)}
                    onChange={e => {
                      const permisosActuales = selectedUsuario.permissions ?? [];
                      const nuevosPermisos = e.target.checked
                        ? [...permisosActuales, nombre]
                        : permisosActuales.filter(p => p !== nombre);
                      setSelectedUsuario({
                        ...selectedUsuario,
                        permissions: nuevosPermisos,
                      });
                    }}
                  />
                      <span>{nombre}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="secondary" onClick={closeModal}>
                Cerrar
              </Button>
              {modalType !== 'view' && (
                <Button
                  variant="primary"
                  onClick={async () => {
                    if (selectedUsuario) {
                      try {
                        // Enviar los permisos como nombres (strings)
                        await updateUsuario(selectedUsuario.id, {
                          username: selectedUsuario.username,
                          password: selectedUsuario.password,
                          permissions: selectedUsuario.permissions.map(nombre => PERMISO_NOMBRE_A_ID[nombre]), // convierte a IDs
                        });
                        // Refresca la lista de usuarios
                        const nuevosUsuarios = await fetchUsuarios();
                        setUsuarios(nuevosUsuarios);
                        closeModal();
                      } catch (e) {
                        alert('Error al actualizar el usuario' + e);
                      }
                    }
                  }}
                >
                  Guardar Cambios
                </Button>
              )}
            </div>
          </div>
          
        </div>
      </div>
    )}
  </div>
);
}
export default Usuarios;