import { useState, useEffect } from 'react';
import { 
  CreditCardIcon, CheckCircleIcon, XCircleIcon, ClockIcon,
  ChartBarIcon, UserIcon, Cog6ToothIcon, ArrowLeftOnRectangleIcon,
  BuildingOfficeIcon, ShieldCheckIcon, Bars3Icon, XMarkIcon, TrashIcon,
  PencilIcon, PlusIcon
} from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const AdminSuscripciones = () => {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [businesses, setBusinesses] = useState([]);

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
        const [subscriptionsRes, businessesRes] = await Promise.all([
          axios.get('http://localhost:5000/api/admin/subscriptions', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          axios.get('http://localhost:5000/api/admin/businesses', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);
        
        setSubscriptions(subscriptionsRes.data.subscriptions);
        setBusinesses(businessesRes.data.businesses);
      } catch (error) {
        console.error('Error al obtener datos:', error);
        MySwal.fire({
          title: 'Error',
          text: 'No se pudieron cargar los datos',
          icon: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-CL', options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'active': return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'pending': return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'cancelled': return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default: return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'active': return 'Activa';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const handleDeleteSubscription = async (subscriptionId) => {
    const result = await MySwal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción cancelará la suscripción",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('access_token');
        await axios.delete(`http://localhost:5000/api/admin/subscriptions/${subscriptionId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        setSubscriptions(subscriptions.filter(sub => sub.id !== subscriptionId));
        
        MySwal.fire('Cancelada!', 'La suscripción ha sido cancelada.', 'success');
      } catch (error) {
        console.error('Error al cancelar suscripción:', error);
        MySwal.fire({
          title: 'Error',
          text: 'No se pudo cancelar la suscripción',
          icon: 'error'
        });
      }
    }
  };

  const handleEditSubscription = async (subscription) => {
    const { value: formValues } = await MySwal.fire({
      title: 'Editar Suscripción',
      html: `
        <div class="text-left space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
            <input 
              id="swal-business" 
              class="swal2-input" 
              value="${subscription.business_name}"
              disabled
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del Plan</label>
            <input 
              id="swal-plan" 
              class="swal2-input" 
              value="${subscription.plan_name}"
              placeholder="Nombre del plan"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select id="swal-status" class="swal2-input">
              <option value="active" ${subscription.status === 'active' ? 'selected' : ''}>Activa</option>
              <option value="pending" ${subscription.status === 'pending' ? 'selected' : ''}>Pendiente</option>
              <option value="cancelled" ${subscription.status === 'cancelled' ? 'selected' : ''}>Cancelada</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Monto Mensual (CLP)</label>
            <input 
              id="swal-amount" 
              class="swal2-input" 
              type="number"
              value="${subscription.monthly_amount}"
              placeholder="Monto mensual"
              min="0"
              step="100"
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
          plan_name: document.getElementById('swal-plan').value,
          status: document.getElementById('swal-status').value,
          monthly_amount: parseFloat(document.getElementById('swal-amount').value) || 0
        };
      },
      didOpen: () => {
        document.getElementById('swal-plan').focus();
      },
      validation: (values) => {
        if (!values.plan_name) return 'El nombre del plan es requerido';
        if (!values.monthly_amount || values.monthly_amount <= 0) return 'El monto debe ser positivo';
        return null;
      }
    });
    
    if (formValues) {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.put(
          `http://localhost:5000/api/admin/subscriptions/${subscription.id}`,
          formValues,
          { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );
        
        setSubscriptions(subscriptions.map(sub => 
          sub.id === subscription.id ? response.data.subscription : sub
        ));
        
        MySwal.fire('Actualizada!', 'La suscripción ha sido actualizada.', 'success');
      } catch (error) {
        console.error('Error al actualizar suscripción:', error);
        MySwal.fire({
          title: 'Error',
          text: error.response?.data?.error || 'No se pudo actualizar la suscripción',
          icon: 'error'
        });
      }
    }
  };

  const handleCreateSubscription = async () => {
    const { value: formValues } = await MySwal.fire({
      title: 'Crear Nueva Suscripción',
      html: `
        <div class="text-left space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
            <select id="swal-business" class="swal2-input">
              ${businesses.map(b => 
                `<option value="${b.id}">${b.business_name}</option>`
              ).join('')}
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del Plan</label>
            <input 
              id="swal-plan" 
              class="swal2-input" 
              placeholder="Nombre del plan"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select id="swal-status" class="swal2-input">
              <option value="active">Activa</option>
              <option value="pending">Pendiente</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Monto Mensual (CLP)</label>
            <input 
              id="swal-amount" 
              class="swal2-input" 
              type="number"
              placeholder="Monto mensual"
              min="0"
              step="100"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio</label>
            <input 
              id="swal-start-date" 
              class="swal2-input" 
              type="date"
            >
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Crear Suscripción',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        return {
          business_id: document.getElementById('swal-business').value,
          plan_name: document.getElementById('swal-plan').value,
          status: document.getElementById('swal-status').value,
          monthly_amount: parseFloat(document.getElementById('swal-amount').value) || 0,
          start_date: document.getElementById('swal-start-date').value
        };
      },
      didOpen: () => {
        document.getElementById('swal-plan').focus();
        // Establecer fecha por defecto (hoy)
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('swal-start-date').value = today;
      },
      validation: (values) => {
        if (!values.business_id) return 'Debe seleccionar una empresa';
        if (!values.plan_name) return 'El nombre del plan es requerido';
        if (!values.monthly_amount || values.monthly_amount <= 0) return 'El monto debe ser positivo';
        if (!values.start_date) return 'La fecha de inicio es requerida';
        return null;
      }
    });
    
    if (formValues) {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.post(
          'http://localhost:5000/api/admin/subscriptions',
          formValues,
          { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );
        
        setSubscriptions([...subscriptions, response.data.subscription]);
        
        MySwal.fire('Creada!', 'La suscripción ha sido creada exitosamente.', 'success');
      } catch (error) {
        console.error('Error al crear suscripción:', error);
        MySwal.fire({
          title: 'Error',
          text: error.response?.data?.error || 'No se pudo crear la suscripción',
          icon: 'error'
        });
      }
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
          
          <div className="flex-1 md:ml-64 p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mt-20"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex">
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
                      className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 group"
                    >
                      <UserIcon className="flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-indigo-600" />
                      <span className="ml-3">Usuarios</span>
                    </Link>
                    <Link 
                      to="/admin/suscripciones" 
                      className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-indigo-50 text-indigo-700 group"
                    >
                      <CreditCardIcon className="flex-shrink-0 h-5 w-5 text-indigo-600" />
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
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 group"
                    onClick={toggleMobileMenu}
                  >
                    <UserIcon className="flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-indigo-600" />
                    <span className="ml-3">Usuarios</span>
                  </Link>
                  <Link 
                    to="/admin/suscripciones" 
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-indigo-50 text-indigo-700 group"
                    onClick={toggleMobileMenu}
                  >
                    <CreditCardIcon className="flex-shrink-0 h-5 w-5 text-indigo-600" />
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

        <div className="flex-1 md:ml-64">
          <main className="p-4 md:p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Suscripciones Empresariales</h1>
              <button 
                onClick={handleCreateSubscription}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Nueva Suscripción
              </button>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Inicio</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Renovación</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto Mensual</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {subscriptions.map((sub) => (
                      <tr key={sub.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sub.business_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sub.plan_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(sub.start_date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(sub.renewal_date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(sub.status)}
                            <span className="ml-2">{getStatusText(sub.status)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(sub.monthly_amount)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleEditSubscription(sub)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteSubscription(sub.id)}
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

export default AdminSuscripciones;