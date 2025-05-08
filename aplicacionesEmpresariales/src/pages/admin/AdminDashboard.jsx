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
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || user.user_type !== 'admin') {
      navigate('/login');
      return;
    }
    setCurrentUser(user);

    // Simular carga de datos
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Datos de prueba para el dashboard
      setStats({
        totalBusinesses: 42,
        activeSubscriptions: 156,
        totalRevenue: 12543000,
        newCustomers: 23
      });

      setRecentBusinesses([
        { id: 1, name: 'Tech Solutions SA', email: 'contacto@techsolutions.cl', subscriptions: 8, status: 'active' },
        { id: 2, name: 'Digital Marketing SpA', email: 'info@digitalmkt.cl', subscriptions: 12, status: 'active' },
        { id: 3, name: 'Cloud Services Ltda', email: 'ventas@cloudservices.cl', subscriptions: 5, status: 'pending' },
        { id: 4, name: 'Consultoría Financiera', email: 'admin@consultoriaf.cl', subscriptions: 3, status: 'active' },
        { id: 5, name: 'Software Factory', email: 'contact@softfactory.cl', subscriptions: 7, status: 'suspended' }
      ]);

      setLoading(false);
    };

    loadData();
  }, [navigate]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
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

            {/* Recent businesses and quick actions */}
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

              {/* Quick actions */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Acciones rápidas</h2>
                  <div className="space-y-3">
                    <Link 
                      to="/admin/empresas/nueva" 
                      className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <BuildingOfficeIcon className="-ml-1 mr-2 h-5 w-5" />
                      Registrar nueva empresa
                    </Link>
                    <Link 
                      to="/admin/permisos" 
                      className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <ShieldCheckIcon className="-ml-1 mr-2 h-5 w-5" />
                      Gestionar permisos
                    </Link>
                    <Link 
                      to="/admin/ajustes" 
                      className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Cog6ToothIcon className="-ml-1 mr-2 h-5 w-5" />
                      Configuración del sistema
                    </Link>
                  </div>
                </div>

                {/* Recent activity */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Actividad reciente</h2>
                  <div className="space-y-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                          <UserIcon className="h-4 w-4 text-indigo-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium text-gray-900">Nueva empresa registrada</span> - Tech Solutions SA
                        </p>
                        <p className="text-xs text-gray-500">Hace 15 minutos</p>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <CreditCardIcon className="h-4 w-4 text-purple-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium text-gray-900">Nueva suscripción creada</span> - Plan Premium
                        </p>
                        <p className="text-xs text-gray-500">Hace 2 horas</p>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                          <BanknotesIcon className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium text-gray-900">Pago procesado</span> - $120,000 CLP
                        </p>
                        <p className="text-xs text-gray-500">Hace 5 horas</p>
                      </div>
                    </div>
                  </div>
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