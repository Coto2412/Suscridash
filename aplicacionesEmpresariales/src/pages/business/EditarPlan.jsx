import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const EditarPlan = () => {
  const { planId } = useParams();
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

  // Simular carga de datos del plan
  useEffect(() => {
    // Aquí normalmente harías una llamada a la API
    const planEjemplo = {
      id: planId,
      nombre: 'Plan Premium',
      precio: 19900,
      moneda: 'CLP',
      periodo: 'mes',
      descripcion: 'Acceso completo con soporte prioritario',
      caracteristicas: [
        'Soporte 24/7',
        'Acceso completo',
        'Actualizaciones automáticas'
      ],
      estado: 'activo'
    };
    setPlan(planEjemplo);
  }, [planId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPlan(prev => ({ ...prev, [name]: value }));
  };

  const handleCaracteristicaChange = (index, value) => {
    const nuevasCaracteristicas = [...plan.caracteristicas];
    nuevasCaracteristicas[index] = value;
    setPlan(prev => ({ ...prev, caracteristicas: nuevasCaracteristicas }));
  };

  const agregarCaracteristica = () => {
    setPlan(prev => ({ ...prev, caracteristicas: [...prev.caracteristicas, ''] }));
  };

  const removerCaracteristica = (index) => {
    setPlan(prev => ({
      ...prev,
      caracteristicas: prev.caracteristicas.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para actualizar el plan
    alert('Plan actualizado exitosamente!');
    navigate('/business/planes');
  };

  const handleCancel = () => {
    if (window.confirm('¿Estás seguro de cancelar los cambios?')) {
      navigate('/business/planes');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link to="/business/planes" className="text-indigo-600 hover:text-indigo-800">
            ← Volver a todos los planes
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">Editar Plan</h1>
          <p className="text-gray-500">ID: {planId}</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del plan</label>
                <input
                  type="text"
                  name="nombre"
                  value={plan.nombre}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                  <input
                    type="number"
                    name="precio"
                    value={plan.precio}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
                  <select
                    name="moneda"
                    value={plan.moneda}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="CLP">CLP (Peso chileno)</option>
                    <option value="USD">USD (Dólar americano)</option>
                    <option value="EUR">EUR (Euro)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Periodo</label>
                  <select
                    name="periodo"
                    value={plan.periodo}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="dia">Diario</option>
                    <option value="semana">Semanal</option>
                    <option value="mes">Mensual</option>
                    <option value="año">Anual</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  name="descripcion"
                  value={plan.descripcion}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Características</label>
                <div className="space-y-2">
                  {plan.caracteristicas.map((caracteristica, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="text"
                        value={caracteristica}
                        onChange={(e) => handleCaracteristicaChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => removerCaracteristica(index)}
                        className="ml-2 p-2 text-red-600 hover:text-red-800"
                        disabled={plan.caracteristicas.length <= 1}
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={agregarCaracteristica}
                    className="mt-2 flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Agregar característica
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="estado"
                    name="estado"
                    checked={plan.estado === 'activo'}
                    onChange={() => setPlan(prev => ({
                      ...prev,
                      estado: prev.estado === 'activo' ? 'inactivo' : 'activo'
                    }))}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="estado" className="ml-2 block text-sm text-gray-700">
                    Plan activo (disponible para nuevos suscriptores)
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
              >
                <CheckIcon className="h-5 w-5 inline mr-2" />
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditarPlan;