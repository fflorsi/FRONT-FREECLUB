import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Users, 
  UserCheck, 
  ClipboardList, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Shield,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PERMISOS } from '../../types';

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, logout, hasPermission } = useAuth();
  const location = useLocation();

  const menuItems = [
    {
      title: 'Dashboard',
      icon: BarChart3,
      path: '/dashboard',
      permission: null
    },
    {
      title: 'Personas',
      icon: Users,
      path: '/personas',
      permission: PERMISOS.VER_PERSONAS
    },
    {
      title: 'Usuarios',
      icon: Shield,
      path: '/usuarios',
      permission: PERMISOS.VER_USUARIOS
    },
    {
      title: 'Asistencias',
      icon: ClipboardList,
      path: '/asistencias',
      permission: PERMISOS.VER_ASISTENCIAS
    },
    {
      title: 'Tomar Asistencia',
      icon: UserCheck,
      path: '/tomar-asistencia',
      permission: PERMISOS.TOMAR_ASISTENCIA
    },
    {
      title: 'Calendario',
      icon: Calendar,
      path: '/calendario',
      permission: null
    },
    {
      title: 'Configuración',
      icon: Settings,
      path: '/configuracion',
      permission: PERMISOS.ADMINISTRAR_SISTEMA
    }
  ];

  

  const visibleMenuItems = menuItems.filter(item => 
    !item.permission || hasPermission(item.permission)
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-primary-600 to-dark-900 text-white">
      <div className="flex items-center justify-between p-4 border-b border-primary-500">
        <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-bold text-sm">FC</span>
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="font-bold text-lg">Fútbol Club</h1>
              <p className="text-primary-200 text-xs">Sistema de Gestión</p>
            </div>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded hover:bg-primary-500 lg:block hidden"
        >
          {isCollapsed ? <Menu size={16} /> : <X size={16} />}
        </button>
      </div>

      <div className="flex-1 py-4">
        <nav className="space-y-2 px-3">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary-500 text-white shadow-lg' 
                    : 'text-primary-100 hover:bg-primary-500 hover:text-white'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <Icon size={20} />
                {!isCollapsed && <span className="font-medium">{item.title}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-primary-500 p-4">
        <div className={`flex items-center space-x-3 mb-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {user?.persona?.name?.charAt(0)}{user?.persona?.lastname?.charAt(0)}
            </span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {user?.persona?.name} {user?.persona?.lastname}
              </p>
              <p className="text-primary-200 text-xs truncate">
                {(user?.permisos ??[]).join(', ')}
              </p>
            </div>
          )}
        </div>
        <button
          onClick={logout}
          className={`flex items-center space-x-3 w-full px-3 py-2 text-primary-100 hover:bg-primary-500 hover:text-white rounded-lg transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut size={20} />
          {!isCollapsed && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={`hidden lg:flex flex-col fixed left-0 top-0 h-full z-40 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}>
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-primary-600 text-white rounded-lg shadow-lg"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileOpen(false)} />
          <div className="relative w-64 flex flex-col">
            <SidebarContent />
            <button
              onClick={() => setIsMobileOpen(false)}
              className="absolute top-4 right-4 p-1 text-white hover:bg-primary-500 rounded"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;