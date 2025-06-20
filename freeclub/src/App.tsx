import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import LoginForm from './components/Auth/LoginForm';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Personas from './pages/Personas';
import Usuarios from './pages/Usuarios';
import Asistencias from './pages/Asistencias';
import TomarAsistencia from './pages/TomarAsistencia';
import Calendario from './pages/Calendario';
import Configuracion from './pages/Configuración';
import { PERMISOS } from './types';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route 
          path="/personas" 
          element={
            <ProtectedRoute permission={PERMISOS.VER_PERSONAS}>
              <Personas />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/usuarios" 
          element={
            <ProtectedRoute permission={PERMISOS.VER_USUARIOS}>
              <Usuarios />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/asistencias" 
          element={
            <ProtectedRoute permission={PERMISOS.VER_ASISTENCIAS}>
              <Asistencias />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tomar-asistencia" 
          element={
            <ProtectedRoute permission={PERMISOS.TOMAR_ASISTENCIA}>
              <TomarAsistencia />
            </ProtectedRoute>
          } 
        />
        <Route path="/calendario" element={<Calendario />} />
        <Route 
          path="/configuracion" 
          element={
            <ProtectedRoute permission={PERMISOS.ADMINISTRAR_SISTEMA}>
              <Configuracion />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;