import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilIcon, PlusIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import Navbar from '../../components/Navbar';

const Planes = () => {
  const navigate = useNavigate();
  
  // Datos simulados de planes
  const [planes, setPlanes] = useState([
    {
      id: 1,
      nombre: "Plan Básico",
      precio: 9900,
      moneda: "CLP",
      periodo: "mes",
      descripcion: "Acceso básico a las funcionalidades",
      caracteristicas: ["Soporte por email", "Acceso básico"],
      estado: "activo"
    },
    {
      id: 2,
      nombre: "Plan Premium",
      precio: 19900,
      moneda: "CLP",
      periodo: "mes",
      descripcion: "Acceso completo con soporte prioritario",
      caracteristicas: ["Soporte 24/7", "Acceso completo", "Actualizaciones"],
      estado: "activo"
    }
  ]);

  const toggleEstadoPlan = (planId) => {
    setPlanes(planes.map(plan => 
      plan.id === planId 
        ? {...plan, estado: plan.estado === 'activo' ? 'inactivo' : 'activo'} 
        : plan
    ));
  };

  const eliminarPlan = (planId) => {
    if (window.confirm("¿Estás seguro de eliminar este plan? Los suscriptores actuales no serán afectados.")) {
      setPlanes(planes.filter(plan => plan.id !== planId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">Gestión de Planes</h1>
          <button
            onClick={() => navigate('/business/planes/nuevo')}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nuevo Plan
          </button>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="grid grid-cols-12 bg-gray-50 px-6 py-3 border-b border-gray-200">
            <div className="col-span-4 font-medium text-gray-700">Nombre</div>
            <div className="col-span-2 font-medium text-gray-700">Precio</div>
            <div className="col-span-3 font-medium text-gray-700">Estado</div>
            <div className="col-span-3 font-medium text-gray-700 text-right">Acciones</div>
          </div>
          
          {planes.map(plan => (
            <div key={plan.id} className="grid grid-cols-12 px-6 py-4 border-b border-gray-200 hover:bg-gray-50">
              <div className="col-span-4">
                <p className="font-medium">{plan.nombre}</p>
                <p className="text-sm text-gray-500">{plan.descripcion}</p>
              </div>
              <div className="col-span-2">
                {new Intl.NumberFormat('es-CL', {style: 'currency', currency: plan.moneda}).format(plan.precio)}/{plan.periodo}
              </div>
              <div className="col-span-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  plan.estado === 'activo' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {plan.estado === 'activo' ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div className="col-span-3 flex justify-end space-x-2">
                <button
                  onClick={() => toggleEstadoPlan(plan.id)}
                  className="text-indigo-600 hover:text-indigo-900"
                  title={plan.estado === 'activo' ? 'Desactivar plan' : 'Activar plan'}
                >
                  <ArrowPathIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => navigate(`/business/planes/editar/${plan.id}`)}
                  className="text-blue-600 hover:text-blue-900"
                  title="Editar plan"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => eliminarPlan(plan.id)}
                  className="text-red-600 hover:text-red-900"
                  title="Eliminar plan"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Planes;