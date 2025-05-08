import { useState, useEffect } from 'react';
import { 
  UserIcon, PlusIcon, PencilIcon, TrashIcon, EyeIcon 
} from '@heroicons/react/24/outline';
import Navbar from '../../components/Navbar';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const AdminUsuarios = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Obtener clientes al cargar el componente
  useEffect(() => {
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
  }, []);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <main className="md:ml-64 p-4 md:p-6">
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
  );
};

export default AdminUsuarios;