import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ChartBarIcon,
  UserIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  BuildingOfficeIcon,
  TicketIcon,
  ShieldCheckIcon,
  ChartPieIcon,
  BanknotesIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import Navbar from '../../components/Navbar';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    newCustomers: 0
  });
  const [recentBusinesses, setRecentBusinesses] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || user.user_type !== 'admin') {
      navigate('/login');
      return;
    }
    setCurrentUser(user);

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        
        const [statsResponse, businessesResponse, activityResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/admin/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          axios.get('http://localhost:5000/api/admin/recent-businesses', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          axios.get('http://localhost:5000/api/admin/recent-activity', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);
        
        setStats(statsResponse.data);
        setRecentBusinesses(businessesResponse.data.businesses);
        setRecentActivity(activityResponse.data.activity);
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Error al cargar los datos del dashboard');
        setLoading(false);
        
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('currentUser');
          navigate('/login');
        }
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 30000);
    return () => clearInterval(intervalId);
  }, [navigate]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const activityDate = new Date(timestamp);
    const diffInSeconds = Math.floor((now - activityDate) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Hace unos segundos';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Hace ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Hace ${hours} hora${hours !== 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `Hace ${days} día${days !== 1 ? 's' : ''}`;
    }
  };

  const getActivityIcon = (iconType) => {
    switch(iconType) {
      case 'business':
        return <BuildingOfficeIcon className="h-4 w-4 text-indigo-600" />;
      case 'subscription':
        return <CreditCardIcon className="h-4 w-4 text-purple-600" />;
      case 'payment':
        return <BanknotesIcon className="h-4 w-4 text-green-600" />;
      case 'user':
        return <UserIcon className="h-4 w-4 text-blue-600" />;
      case 'update':
        return <Cog6ToothIcon className="h-4 w-4 text-yellow-600" />;
      default:
        return <ChartBarIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityColor = (iconType) => {
    switch(iconType) {
      case 'business':
        return 'bg-indigo-100';
      case 'subscription':
        return 'bg-purple-100';
      case 'payment':
        return 'bg-green-100';
      case 'user':
        return 'bg-blue-100';
      case 'update':
        return 'bg-yellow-100';
      default:
        return 'bg-gray-100';
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex">
          {/* Sidebar skeleton */}
          <div className="hidden md:flex md:flex-shrink-0">
            <div className="flex flex-col w-64 fixed h-full bg-white border-r border-gray-200">
              <div className="h-16 bg-gray-200 animate-pulse"></div>
              <div className="p-4 space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Content skeleton */}
          <div className="flex-1 md:ml-64 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow h-32 animate-pulse"></div>
              ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow h-96 animate-pulse"></div>
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow h-64 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar Superior */}
      <Navbar />
      
      {/* Sidebar y Contenido Principal */}
      <div className="flex">
        {/* Sidebar para Desktop */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64 fixed h-full bg-white border-r border-gray-200">
            <div className="flex items-center justify-center h-16 px-4 bg-indigo-600">
              <h1 className="text-xl font-bold text-white">Panel Admin</h1>
            </div>
            <div className="flex flex-col h-full p-4 overflow-y-auto">
              <div className="flex-1 space-y-4">
                <div className="pt-4">
                  <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Administración</h2>
                  <nav className="mt-2 space-y-1">
                    <Link 
                      to="/admin/dashboard" 
                      className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-indigo-50 text-indigo-700 group"
                    >
                      <ChartBarIcon className="flex-shrink-0 h-5 w-5 text-indigo-600" />
                      <span className="ml-3">Dashboard</span>
                    </Link>
                    <Link 
                      to="/admin/empresas" 
                      className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 group"
                    >
                      <BuildingOfficeIcon className="flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-indigo-600" />
                      <span className="ml-3">Empresas</span>
                    </Link>
                    <Link 
                      to="/admin/usuarios" 
                      className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 group"
                    >
                      <UserIcon className="flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-indigo-600" />
                      <span className="ml-3">Usuarios</span>
                    </Link>
                    <Link 
                      to="/admin/suscripciones" 
                      className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 group"
                    >
                      <CreditCardIcon className="flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-indigo-600" />
                      <span className="ml-3">Suscripciones</span>
                    </Link>
                  </nav>
                </div>
                
                <div className="pt-4">
                  <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Configuración</h2>
                  <nav className="mt-2 space-y-1">
                    <Link 
                      to="/admin/ajustes" 
                      className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 group"
                    >
                      <Cog6ToothIcon className="flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-indigo-600" />
                      <span className="ml-3">Ajustes</span>
                    </Link>
                    <Link 
                      to="/admin/permisos" 
                      className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 group"
                    >
                      <ShieldCheckIcon className="flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-indigo-600" />
                      <span className="ml-3">Permisos</span>
                    </Link>
                  </nav>
                </div>
              </div>
              
              <div className="pb-4">
                <button
                  onClick={() => {
                    localStorage.removeItem('currentUser');
                    localStorage.removeItem('access_token');
                    navigate('/login');
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 group"
                >
                  <ArrowLeftOnRectangleIcon className="flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-indigo-600" />
                  <span className="ml-3">Cerrar sesión</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Botón de menú móvil */}
        <div className="md:hidden fixed top-16 right-4 z-20">
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-md bg-indigo-600 text-white focus:outline-none"
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Sidebar para Mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-10">
            <div className="absolute inset-0 bg-gray-600 bg-opacity-75" onClick={toggleMobileMenu}></div>
            <div className="relative flex flex-col w-3/4 h-full bg-white">
              <div className="flex items-center justify-center h-16 px-4 bg-indigo-600">
                <h1 className="text-xl font-bold text-white">Panel Admin</h1>
              </div>
              <div className="flex-1 p-4 overflow-y-auto">
                <nav className="space-y-4">
                  <Link 
                    to="/admin/dashboard" 
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-indigo-50 text-indigo-700 group"
                    onClick={toggleMobileMenu}
                  >
                    <ChartBarIcon className="flex-shrink-0 h-5 w-5 text-indigo-600" />
                    <span className="ml-3">Dashboard</span>
                  </Link>
                  <Link 
                    to="/admin/empresas" 
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 group"
                    onClick={toggleMobileMenu}
                  >
                    <BuildingOfficeIcon className="flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-indigo-600" />
                    <span className="ml-3">Empresas</span>
                  </Link>
                  <Link 
                    to="/admin/usuarios" 
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 group"
                    onClick={toggleMobileMenu}
                  >
                    <UserIcon className="flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-indigo-600" />
                    <span className="ml-3">Usuarios</span>
                  </Link>
                  <Link 
                    to="/admin/suscripciones" 
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 group"
                    onClick={toggleMobileMenu}
                  >
                    <CreditCardIcon className="flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-indigo-600" />
                    <span className="ml-3">Suscripciones</span>
                  </Link>
                  <Link 
                    to="/admin/ajustes" 
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 group"
                    onClick={toggleMobileMenu}
                  >
                    <Cog6ToothIcon className="flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-indigo-600" />
                    <span className="ml-3">Ajustes</span>
                  </Link>
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Contenido Principal */}
        <div className="flex-1 md:ml-64">
          <main className="p-4 md:p-6">
            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                    <BuildingOfficeIcon className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Empresas registradas</h3>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalBusinesses}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                    <TicketIcon className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Suscripciones activas</h3>
                    <p className="text-2xl font-semibold text-gray-900">{stats.activeSubscriptions}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-600">
                    <ChartPieIcon className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Ingresos totales</h3>
                    <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                    <UserIcon className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Nuevos clientes (7d)</h3>
                    <p className="text-2xl font-semibold text-gray-900">+{stats.newCustomers}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent businesses and activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent businesses table */}
              <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Empresas recientes</h2>
                  <Link to="/admin/empresas" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                    Ver todas
                  </Link>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Empresa
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contacto
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Suscripciones
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentBusinesses.map((business) => (
                        <tr key={business.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{business.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                            {business.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                              {business.subscriptions}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              business.status === 'active' ? 'bg-green-100 text-green-800' :
                              business.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {business.status === 'active' ? 'Activo' : 
                               business.status === 'pending' ? 'Pendiente' : 'Suspendido'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent activity */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Actividad reciente</h2>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex">
                      <div className="flex-shrink-0">
                        <div className={`h-8 w-8 rounded-full ${getActivityColor(activity.icon)} flex items-center justify-center`}>
                          {getActivityIcon(activity.icon)}
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium text-gray-900">{activity.title}</span> - {activity.description}
                        </p>
                        <p className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;