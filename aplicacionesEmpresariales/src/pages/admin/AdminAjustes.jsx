
import { Cog6ToothIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import Navbar from '../../components/Navbar';

const AdminAjustes = () => {
  const [formData, setFormData] = useState({
    system_name: 'Suscridash',
    currency: 'CLP',
    logo_url: '',
    session_timeout: 30,
    email_notifications: true,
    app_notifications: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get('http://localhost:5000/api/admin/settings', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setFormData(response.data.settings);
      } catch (error) {
        console.error('Error obteniendo ajustes:', error);
        toast.error('Error al cargar los ajustes del sistema');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const showSuccessModal = () => {
    Swal.fire({
      title: '¡Cambios guardados!',
      text: 'Los ajustes del sistema se han actualizado correctamente.',
      icon: 'success',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#6366f1', // Color indigo-600
      backdrop: `
        rgba(79, 70, 229, 0.4)
        url("/images/nyan-cat.gif")
        left top
        no-repeat
      `,
      timer: 3000,
      timerProgressBar: true,
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const token = localStorage.getItem('access_token');
      
      const dataToSend = {
        system_name: formData.system_name,
        currency: formData.currency,
        session_timeout: parseInt(formData.session_timeout),
        email_notifications: formData.email_notifications,
        app_notifications: formData.app_notifications,
        logo_url: formData.logo_url
      };
      
      const response = await axios.put(
        'http://localhost:5000/api/admin/settings',
        dataToSend,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setFormData(response.data.settings);
      showSuccessModal(); // Mostrar modal de éxito
    } catch (error) {
      console.error('Error guardando ajustes:', error);
      
      // Mostrar modal de error en lugar de toast
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.error || 'Ocurrió un error al guardar los ajustes',
        icon: 'error',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#6366f1'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsSaving(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const fakeUrl = `https://example.com/logos/${file.name}`;
      
      setFormData(prev => ({
        ...prev,
        logo_url: fakeUrl
      }));
      
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Logo subido correctamente',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo subir el logo',
        icon: 'error',
        confirmButtonText: 'Entendido'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <main className="md:ml-64 p-4 md:p-6">
          <div className="flex items-center mb-6">
            <Cog6ToothIcon className="h-8 w-8 text-indigo-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">Ajustes del Sistema</h1>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Sistema</label>
                  <input
                    type="text"
                    name="system_name"
                    value={formData.system_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Moneda Principal</label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="CLP">Peso Chileno (CLP)</option>
                    <option value="USD">Dólar Americano (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logo del Sistema</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {formData.logo_url && (
                    <div className="mt-2">
                      <img 
                        src={formData.logo_url} 
                        alt="Logo del sistema" 
                        className="h-20 object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/150';
                        }}
                      />
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tiempo de sesión (minutos)</label>
                  <input
                    type="number"
                    name="session_timeout"
                    value={formData.session_timeout}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Notificaciones</label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="email_notifications"
                      checked={formData.email_notifications}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">Enviar notificaciones por email</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="app_notifications"
                      checked={formData.app_notifications}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">Mostrar notificaciones en la aplicación</label>
                  </div>
                </div>
                
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className={`flex items-center px-4 py-2 rounded-md ${isSaving ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} text-white`}
                  >
                    {isSaving ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <CheckIcon className="h-5 w-5 mr-2" />
                        Guardar Cambios
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminAjustes;