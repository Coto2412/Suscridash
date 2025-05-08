import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { 
  BuildingOfficeIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  EyeIcon,
  ArrowLeftOnRectangleIcon,
  ChartBarIcon,
  UserIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Navbar from '../../components/Navbar';

const MySwal = withReactContent(Swal);

const AdminEmpresas = () => {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || user.user_type !== 'admin') {
      navigate('/login');
      return;
    }
    setCurrentUser(user);
    fetchBusinesses();
  }, [navigate]);

  const fetchBusinesses = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://localhost:5000/api/admin/businesses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setBusinesses(response.data.businesses);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error('Error fetching businesses:', err);
      setError('Error al cargar las empresas');
      setLoading(false);
      
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('currentUser');
        navigate('/login');
      }
    }
  };

  const handleDelete = async (businessId) => {
    const result = await MySwal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('access_token');
        await axios.delete(`http://localhost:5000/api/admin/businesses/${businessId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setBusinesses(businesses.filter(b => b.id !== businessId));
        
        MySwal.fire(
          'Eliminada!',
          'La empresa ha sido eliminada.',
          'success'
        );
      } catch (error) {
        console.error('Error al eliminar empresa:', error);
        MySwal.fire({
          title: 'Error',
          text: 'No se pudo eliminar la empresa',
          icon: 'error'
        });
      }
    }
  };

  const handleViewDetails = async (businessId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`http://localhost:5000/api/admin/businesses/${businessId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const business = response.data.business;
      
      MySwal.fire({
        title: `Detalles de la Empresa`,
        html: `
          <div class="text-left">
            <p><strong>Nombre de Contacto:</strong> ${business.name}</p>
            <p><strong>Nombre de Empresa:</strong> ${business.business_name}</p>
            <p><strong>Email:</strong> ${business.email}</p>
            <p><strong>RUT/Tax ID:</strong> ${business.tax_id}</p>
            <p><strong>Suscripciones Activas:</strong> ${business.subscriptions}</p>
            <p><strong>Estado:</strong> 
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                business.status === 'active' ? 'bg-green-100 text-green-800' :
                business.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }">
                ${business.status === 'active' ? 'Activo' : 
                 business.status === 'pending' ? 'Pendiente' : 'Suspendido'}
              </span>
            </p>
            <p><strong>Fecha de Registro:</strong> ${business.created_at || 'No disponible'}</p>
          </div>
        `,
        icon: 'info',
        confirmButtonText: 'Cerrar'
      });
    } catch (error) {
      console.error('Error al obtener detalles de la empresa:', error);
      MySwal.fire({
        title: 'Error',
        text: 'No se pudieron cargar los detalles de la empresa',
        icon: 'error'
      });
    }
  };

  const handleEdit = async (businessId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`http://localhost:5000/api/admin/businesses/${businessId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const business = response.data.business;
      
      const { value: formValues } = await MySwal.fire({
        title: 'Editar Empresa',
        html: `
          <div class="grid grid-cols-1 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombre de Contacto</label>
              <input 
                id="swal-input1" 
                class="swal2-input" 
                placeholder="Nombre" 
                value="${business.name}"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombre de Empresa</label>
              <input 
                id="swal-input2" 
                class="swal2-input" 
                placeholder="Nombre de Empresa" 
                value="${business.business_name}"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                id="swal-input3" 
                class="swal2-input" 
                placeholder="Email" 
                value="${business.email}"
                type="email"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">RUT/Tax ID</label>
              <input 
                id="swal-input4" 
                class="swal2-input" 
                placeholder="RUT/Tax ID" 
                value="${business.tax_id}"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select id="swal-input5" class="swal2-input">
                <option value="active" ${business.status === 'active' ? 'selected' : ''}>Activo</option>
                <option value="pending" ${business.status === 'pending' ? 'selected' : ''}>Pendiente</option>
                <option value="suspended" ${business.status === 'suspended' ? 'selected' : ''}>Suspendido</option>
              </select>
            </div>
          </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Guardar Cambios',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
          return {
            name: document.getElementById('swal-input1').value,
            business_name: document.getElementById('swal-input2').value,
            email: document.getElementById('swal-input3').value,
            tax_id: document.getElementById('swal-input4').value,
            status: document.getElementById('swal-input5').value
          };
        }
      });
      
      if (formValues) {
        // Validaciones básicas
        if (!formValues.name || !formValues.business_name || !formValues.email || !formValues.tax_id) {
          throw new Error('Todos los campos son requeridos');
        }
        
        // Enviar actualización
        const updateResponse = await axios.put(
          `http://localhost:5000/api/admin/businesses/${businessId}`,
          formValues,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        // Actualizar lista de empresas
        setBusinesses(businesses.map(b => 
          b.id === businessId ? updateResponse.data.business : b
        ));
        
        MySwal.fire(
          'Actualizada!',
          'La empresa ha sido actualizada.',
          'success'
        );
      }
    } catch (error) {
      console.error('Error al editar empresa:', error);
      MySwal.fire({
        title: 'Error',
        text: error.message || 'No se pudo actualizar la empresa',
        icon: 'error'
      });
    }
  };

  const handleCreateBusiness = async () => {
    try {
      const { value: formValues } = await MySwal.fire({
        title: 'Crear Nueva Empresa',
        html: `
          <div class="grid grid-cols-1 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombre de Empresa*</label>
              <input id="swal-input1" class="swal2-input" placeholder="Nombre de Empresa" required>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email*</label>
              <input id="swal-input2" class="swal2-input" placeholder="Email" type="email" required>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">RUT/Tax ID*</label>
              <input id="swal-input3" class="swal2-input" placeholder="RUT/Tax ID" required>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña*</label>
              <input id="swal-input4" class="swal2-input" placeholder="Contraseña" type="password" required>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña*</label>
              <input id="swal-input5" class="swal2-input" placeholder="Confirmar Contraseña" type="password" required>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select id="swal-input6" class="swal2-input">
                <option value="active">Activo</option>
                <option value="pending">Pendiente</option>
              </select>
            </div>
          </div>
          <p class="text-xs text-gray-500 mt-2">* Campos obligatorios</p>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Crear Empresa',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
          const password = document.getElementById('swal-input4').value;
          const confirmPassword = document.getElementById('swal-input5').value;
          
          if (password !== confirmPassword) {
            Swal.showValidationMessage('Las contraseñas no coinciden');
            return false;
          }
          
          return {
            businessName: document.getElementById('swal-input1').value,
            email: document.getElementById('swal-input2').value,
            taxId: document.getElementById('swal-input3').value,
            password: password,
            confirmPassword: confirmPassword,
            status: document.getElementById('swal-input6').value,
            fullName: document.getElementById('swal-input1').value, // Usamos businessName como fullName
            userType: 'business'
          };
        }
      });
      
      if (formValues) {
        // Validaciones básicas
        if (!formValues.businessName || !formValues.email || !formValues.taxId || 
            !formValues.password || !formValues.confirmPassword) {
          throw new Error('Todos los campos obligatorios deben completarse');
        }
        
        // Enviar creación
        const token = localStorage.getItem('access_token');
        const response = await axios.post(
          'http://localhost:5000/api/auth/register',
          formValues,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        // Agregar nueva empresa a la lista
        setBusinesses([...businesses, {
          ...response.data.user,
          subscriptions: 0,
          status: formValues.status
        }]);
        
        MySwal.fire(
          'Creada!',
          'La empresa ha sido creada exitosamente.',
          'success'
        );
      }
    } catch (error) {
      console.error('Error al crear empresa:', error);
      MySwal.fire({
        title: 'Error',
        text: error.response?.data?.error || error.message || 'No se pudo crear la empresa',
        icon: 'error'
      });
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
            <div className="animate-pulse bg-white shadow rounded-lg overflow-hidden">
              <div className="h-16 bg-gray-200 mb-4"></div>
              <div className="space-y-4 p-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded"></div>
                ))}
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
            onClick={fetchBusinesses}
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
                      className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 group"
                    >
                      <ChartBarIcon className="flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-indigo-600" />
                      <span className="ml-3">Dashboard</span>
                    </Link>
                    <Link 
                      to="/admin/empresas" 
                      className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-indigo-50 text-indigo-700 group"
                    >
                      <BuildingOfficeIcon className="flex-shrink-0 h-5 w-5 text-indigo-600" />
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
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 group"
                    onClick={toggleMobileMenu}
                  >
                    <ChartBarIcon className="flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-indigo-600" />
                    <span className="ml-3">Dashboard</span>
                  </Link>
                  <Link 
                    to="/admin/empresas" 
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-indigo-50 text-indigo-700 group"
                    onClick={toggleMobileMenu}
                  >
                    <BuildingOfficeIcon className="flex-shrink-0 h-5 w-5 text-indigo-600" />
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
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Empresas</h1>
              <button
                onClick={handleCreateBusiness}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Nueva Empresa
              </button>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RUT</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Suscripciones</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {businesses.map((business) => (
                      <tr key={business.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{business.business_name || business.name} </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{business.tax_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{business.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewDetails(business.id)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleEdit(business.id)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button 
                              onClick={() => handleDelete(business.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminEmpresas;