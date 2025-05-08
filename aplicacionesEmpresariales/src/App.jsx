import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardFinanciero from './pages/business/DashboardFinanciero';
import Home from './pages/Home';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEmpresas from './pages/admin/AdminEmpresas';
import AdminUsuarios from './pages/admin/AdminUsuarios';
import AdminSuscripciones from './pages/admin/AdminSuscripciones';
import AdminAjustes from './pages/admin/AdminAjustes';
import AdminPermisos from './pages/admin/AdminPermisos';
import AdminNuevaEmpresa from './pages/admin/AdminNuevaEmpresa';
import Empresas from './pages/subscriptions/Empresas';
import MiSuscripcion from './pages/subscriptions/MiSuscripcion';
import Pago from './pages/subscriptions/Pago';
import PlanesEmpresa from './pages/subscriptions/PlanesEmpresa';
import Configuracion from './pages/business/Suscriptores';
import EditarPlan from './pages/business/EditarPlan';
import NuevoPlan from './pages/business/NuevoPlan';
import Suscriptores from './pages/business/Suscriptores';
import Planes from './pages/business/Planes';
// Componente de ruta protegida
const ProtectedRoute = ({ children, allowedRoles }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('access_token');
      const user = JSON.parse(localStorage.getItem('currentUser'));

      console.log('Token en localStorage:', token); // <-- Agrega esto
      console.log('Usuario en localStorage:', user);
      
      if (!token || !user) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await axios.get('http://localhost:5000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setCurrentUser(response.data.user);
      } catch (error) {
        console.error('Error verificando token:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('currentUser');
        setAuthError('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    
    verifyToken();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-gray-50">Cargando...</div>;
  }

  if (authError) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error de autenticación</h2>
          <p className="mb-4">{authError}</p>
          <Link 
            to="/login" 
            className="inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Ir al login
          </Link>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(currentUser.user_type)) {
    switch (currentUser.user_type) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'business':
        return <Navigate to="/business/dashboard" replace />;
      case 'customer':
        return <Navigate to="/suscripciones" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Rutas protegidas para administradores */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/empresas" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminEmpresas />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/empresas/nueva" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminNuevaEmpresa />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/usuarios" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUsuarios />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/suscripciones" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminSuscripciones />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/ajustes" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminAjustes />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/permisos" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPermisos />
            </ProtectedRoute>
          } 
        />
        
        {/* Rutas protegidas para empresas */}
        <Route 
          path="/business/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['business']}>
              <DashboardFinanciero />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/business/planes" 
          element={
            <ProtectedRoute allowedRoles={['business']}>
              <Planes />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/business/planes/nuevo" 
          element={
            <ProtectedRoute allowedRoles={['business']}>
              <NuevoPlan />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/business/planes/editar/:planId" 
          element={
            <ProtectedRoute allowedRoles={['business']}>
              <EditarPlan />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/business/suscriptores" 
          element={
            <ProtectedRoute allowedRoles={['business']}>
              <Suscriptores />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/business/configuracion" 
          element={
            <ProtectedRoute allowedRoles={['business']}>
              <Configuracion />
            </ProtectedRoute>
          } 
        />
        
        {/* Ruta de inicio accesible para todos los usuarios autenticados */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'business', 'customer']}>
              <Home />
            </ProtectedRoute>
          } 
        />
        
        {/* Redirección para rutas no encontradas */}
        <Route path="*" element={<Navigate to="/login" replace />} />

        <Route 
          path="/suscripciones" 
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <Empresas />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/suscripciones/:empresaId" 
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <PlanesEmpresa />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/suscripciones/:empresaId/pago" 
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <Pago />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/mi-suscripcion" 
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <MiSuscripcion />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;