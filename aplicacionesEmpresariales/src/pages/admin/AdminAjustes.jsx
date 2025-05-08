import { Cog6ToothIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import Navbar from '../../components/Navbar';

const AdminAjustes = () => {
  const [formData, setFormData] = useState({
    nombreSistema: 'Suscridash',
    moneda: 'CLP',
    logo: '',
    tiempoSesion: 30,
    notificacionesEmail: true,
    notificacionesApp: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Lógica para guardar ajustes
    console.log('Ajustes guardados:', formData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Agregamos el Navbar */}
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
                    name="nombreSistema"
                    value={formData.nombreSistema}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Moneda Principal</label>
                  <select
                    name="moneda"
                    value={formData.moneda}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    name="logo"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        setFormData(prev => ({ ...prev, logo: URL.createObjectURL(e.target.files[0]) }));
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {formData.logo && (
                    <div className="mt-2">
                      <img src={formData.logo} alt="Logo preview" className="h-20" />
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tiempo de sesión (minutos)</label>
                  <input
                    type="number"
                    name="tiempoSesion"
                    value={formData.tiempoSesion}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Notificaciones</label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="notificacionesEmail"
                      checked={formData.notificacionesEmail}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">Enviar notificaciones por email</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="notificacionesApp"
                      checked={formData.notificacionesApp}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">Mostrar notificaciones en la aplicación</label>
                  </div>
                </div>
                
                <div className="pt-4">
                  <button
                    type="submit"
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    <CheckIcon className="h-5 w-5 mr-2" />
                    Guardar Cambios
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