// NuevoPlan.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import axios from 'axios';
import Swal from 'sweetalert2';

const NuevoPlan = () => {
  const navigate = useNavigate();
  const [plan, setPlan] = useState({
    nombre: '',
    precio: '',
    moneda: 'CLP',
    periodo: 'mes',
    descripcion: '',
    caracteristicas: [''],
    estado: 'activo'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPlan(prev => ({ ...prev, [name]: value }));
  };

  const handleCaracteristicaChange = (index, value) => {
    const nuevasCaracteristicas = [...plan.caracteristicas];
    nuevasCaracteristicas[index] = value;
    setPlan(prev => ({ ...prev, caracteristicas: nuevasCaracteristicas }));
  };

  const addCaracteristica = () => {
    setPlan(prev => ({ ...prev, caracteristicas: [...prev.caracteristicas, ''] }));
  };

  const removeCaracteristica = (index) => {
    const nuevasCaracteristicas = plan.caracteristicas.filter((_, i) => i !== index);
    setPlan(prev => ({ ...prev, caracteristicas: nuevasCaracteristicas }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post('http://localhost:5000/api/business/plans', plan, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      Swal.fire({
        title: 'Éxito',
        text: 'Plan creado correctamente',
        icon: 'success'
      }).then(() => {
        navigate('/business/planes');
      });
    } catch (error) {
      console.error('Error al crear plan:', error);
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.error || 'No se pudo crear el plan',
        icon: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">Nuevo Plan de Suscripción</h1>
          <button
            onClick={() => navigate('/business/planes')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                  Nombre del Plan
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={plan.nombre}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="precio" className="block text-sm font-medium text-gray-700">
                    Precio
                  </label>
                  <input
                    type="number"
                    id="precio"
                    name="precio"
                    value={plan.precio}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="moneda" className="block text-sm font-medium text-gray-700">
                    Moneda
                  </label>
                  <select
                    id="moneda"
                    name="moneda"
                    value={plan.moneda}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="CLP">CLP ($)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="periodo" className="block text-sm font-medium text-gray-700">
                    Periodo de facturación
                  </label>
                  <select
                    id="periodo"
                    name="periodo"
                    value={plan.periodo}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="dia">Diario</option>
                    <option value="semana">Semanal</option>
                    <option value="mes">Mensual</option>
                    <option value="ano">Anual</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  rows={3}
                  value={plan.descripcion}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Características
                </label>
                <div className="mt-1 space-y-2">
                  {plan.caracteristicas.map((caracteristica, index) => (
                    <div key={index} className="flex space-x-2">
                      <input
                        type="text"
                        value={caracteristica}
                        onChange={(e) => handleCaracteristicaChange(index, e.target.value)}
                        className="flex-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        required
                      />
                      {plan.caracteristicas.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCaracteristica(index)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addCaracteristica}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Añadir característica
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="estado" className="block text-sm font-medium text-gray-700">
                  Estado
                </label>
                <select
                  id="estado"
                  name="estado"
                  value={plan.estado}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/business/planes')}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar Plan'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NuevoPlan;