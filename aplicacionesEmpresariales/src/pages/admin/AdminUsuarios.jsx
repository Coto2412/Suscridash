import { useState, useEffect } from 'react';
import { 
  UserIcon, PlusIcon, PencilIcon, TrashIcon, EyeIcon,
  ChartBarIcon, CreditCardIcon, Cog6ToothIcon, ArrowLeftOnRectangleIcon,
  BuildingOfficeIcon, ShieldCheckIcon, Bars3Icon, XMarkIcon
} from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const AdminUsuarios = () => {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || user.user_type !== 'admin') {
      navigate('/login');
      return;
    }
    setCurrentUser(user);

    const fetchClientes = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get('http://localhost:5000/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setClientes(response.data.users);
      } catch (error) {
        console.error('Error al obtener clientes:', error);
        MySwal.fire({
          title: 'Error',
          text: 'No se pudieron cargar los clientes',
          icon: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchClientes();
  }, [navigate]);

  // Función para eliminar cliente
  const handleDelete = async (userId) => {
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
        await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setClientes(clientes.filter(cliente => cliente.id !== userId));
        
        MySwal.fire(
          'Eliminado!',
          'El cliente ha sido eliminado.',
          'success'
        );
      } catch (error) {
        console.error('Error al eliminar cliente:', error);
        MySwal.fire({
          title: 'Error',
          text: 'No se pudo eliminar el cliente',
          icon: 'error'
        });
      }
    }
  };

  // Función para ver detalles del cliente
  const handleViewDetails = async (userId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const cliente = response.data.user;
      
      MySwal.fire({
        title: `Detalles del Cliente`,
        html: `
          <div class="text-left">
            <p><strong>Nombre:</strong> ${cliente.name}</p>
            <p><strong>Email:</strong> ${cliente.email}</p>
            <p><strong>Fecha de Creación:</strong> ${cliente.created_at || 'No disponible'}</p>
          </div>
        `,
        icon: 'info',
        confirmButtonText: 'Cerrar'
      });
    } catch (error) {
      console.error('Error al obtener detalles del cliente:', error);
      MySwal.fire({
        title: 'Error',
        text: 'No se pudieron cargar los detalles del cliente',
        icon: 'error'
      });
    }
  };

  // Función para editar cliente
  const handleEdit = async (userId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const cliente = response.data.user;
      
      const { value: formValues } = await MySwal.fire({
        title: 'Editar Cliente',
        html: `
          <div class="grid grid-cols-1 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input 
                id="swal-input1" 
                class="swal2-input" 
                placeholder="Nombre" 
                value="${cliente.name}"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                id="swal-input2" 
                class="swal2-input" 
                placeholder="Email" 
                value="${cliente.email}"
                type="email"
              >
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
            email: document.getElementById('swal-input2').value,
            user_type: 'customer' // Siempre se mantiene como customer
          };
        }
      });
      
      if (formValues) {
        // Validaciones básicas
        if (!formValues.name || !formValues.email) {
          throw new Error('Nombre y email son campos requeridos');
        }
        
        // Enviar actualización
        const updateResponse = await axios.put(
          `http://localhost:5000/api/admin/users/${userId}`,
          formValues,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        // Actualizar lista de clientes
        setClientes(clientes.map(c => 
          c.id === userId ? updateResponse.data.user : c
        ));
        
        MySwal.fire(
          'Actualizado!',
          'El cliente ha sido actualizado.',
          'success'
        );
      }
    } catch (error) {
      console.error('Error al editar cliente:', error);
      MySwal.fire({
        title: 'Error',
        text: error.message || 'No se pudo actualizar el cliente',
        icon: 'error'
      });
    }
  };

  // Función para crear nuevo cliente
  const handleCreateCliente = async () => {
    try {
      const { value: formValues } = await MySwal.fire({
        title: 'Crear Nuevo Cliente',
        html: `
          <div class="grid grid-cols-1 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input id="swal-input1" class="swal2-input" placeholder="Nombre">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input id="swal-input2" class="swal2-input" placeholder="Email" type="email">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input id="swal-input3" class="swal2-input" placeholder="Contraseña" type="password">
            </div>
          </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Crear Cliente',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
          return {
            name: document.getElementById('swal-input1').value,
            email: document.getElementById('swal-input2').value,
            password: document.getElementById('swal-input3').value,
            user_type: 'customer' // Siempre se crea como customer
          };
        }
      });
      
      if (formValues) {
        // Validaciones básicas
        if (!formValues.name || !formValues.email || !formValues.password) {
          throw new Error('Nombre, email y contraseña son campos requeridos');
        }
        
        // Enviar creación
        const token = localStorage.getItem('access_token');
        const response = await axios.post(
          'http://localhost:5000/api/auth/register',
          {
            ...formValues,
            fullName: formValues.name,
            confirmPassword: formValues.password,
            userType: 'customer' // Forzar tipo customer
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        // Agregar nuevo cliente a la lista
        setClientes([...clientes, response.data.user]);
        
        MySwal.fire(
          'Creado!',
          'El cliente ha sido creado exitosamente.',
          'success'
        );
      }
    } catch (error) {
      console.error('Error al crear cliente:', error);
      MySwal.fire({
        title: 'Error',
        text: error.message || 'No se pudo crear el cliente',
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
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mt-20"></div>
          </div>
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
                      className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 group"
                    >
                      <BuildingOfficeIcon className="flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-indigo-600" />
                      <span className="ml-3">Empresas</span>
                    </Link>
                    <Link 
                      to="/admin/usuarios" 
                      className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-indigo-50 text-indigo-700 group"
                    >
                      <UserIcon className="flex-shrink-0 h-5 w-5 text-indigo-600" />
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
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 group"
                    onClick={toggleMobileMenu}
                  >
                    <BuildingOfficeIcon className="flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-indigo-600" />
                    <span className="ml-3">Empresas</span>
                  </Link>
                  <Link 
                    to="/admin/usuarios" 
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-indigo-50 text-indigo-700 group"
                    onClick={toggleMobileMenu}
                  >
                    <UserIcon className="flex-shrink-0 h-5 w-5 text-indigo-600" />
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
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Clientes</h1>
              <button 
                onClick={handleCreateCliente}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Nuevo Cliente
              </button>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Registro</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clientes.map((cliente) => (
                      <tr key={cliente.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <UserIcon className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{cliente.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cliente.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Cliente
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {cliente.created_at || 'No disponible'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleViewDetails(cliente.id)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </button>
                            <button 
                              onClick={() => handleEdit(cliente.id)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button 
                              onClick={() => handleDelete(cliente.id)}
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

export default AdminUsuarios;