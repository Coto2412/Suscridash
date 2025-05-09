import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { CheckIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Navbar from '../../components/Navbar';
import axios from 'axios';
import Swal from 'sweetalert2';

const PlanesEmpresa = () => {
  const { empresaId } = useParams();
  const navigate = useNavigate();
  const [planSeleccionado, setPlanSeleccionado] = useState(null);
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmpresa = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(`http://localhost:5000/api/businesses/${empresaId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.data.business) {
          throw new Error('Empresa no encontrada');
        }
        
        setEmpresa(response.data.business);
      } catch (err) {
        console.error('Error al cargar empresa:', err);
        setError(err.response?.data?.error || err.message || 'Error al cargar la empresa');
      } finally {
        setLoading(false);
      }
    };

    fetchEmpresa();
  }, [empresaId]);

  const formatoPrecio = (precio) => {
    return new Intl.NumberFormat('es-CL', { 
      style: 'currency', 
      currency: 'CLP',
      minimumFractionDigits: 0 
    }).format(precio);
  };

  const handleSeleccionarPlan = (plan) => {
    setPlanSeleccionado(plan);
  };

  const handleContinuar = () => {
    if (planSeleccionado) {
      navigate(`/suscripciones/${empresaId}/pago`, {
        state: {
          planSeleccionado,
          empresa
        }
      });
    } else {
      Swal.fire({
        title: 'Selecciona un plan',
        text: 'Debes seleccionar un plan antes de continuar',
        icon: 'warning',
        confirmButtonText: 'Entendido'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Error al cargar la empresa</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link 
              to="/suscripciones" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Volver a todas las empresas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!empresa || !empresa.plans || empresa.plans.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-4">No hay planes disponibles</h2>
            <p className="text-gray-600 mb-6">Esta empresa no tiene planes de suscripción activos en este momento.</p>
            <Link 
              to="/suscripciones" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Volver a todas las empresas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link 
            to="/suscripciones" 
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            Volver a todas las empresas
          </Link>
          
          <div className="flex items-start mt-4">
            <div className="bg-indigo-100 p-3 rounded-lg mr-4">
              <span className="text-3xl">{empresa.logo || '🏢'}</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {empresa.business_name}
              </h1>
              <p className="text-gray-600 mt-2">{empresa.description || 'No hay descripción disponible'}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {empresa.categories?.map((category, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Planes Disponibles</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {empresa.plans.map(plan => (
            <div 
              key={plan.id}
              onClick={() => handleSeleccionarPlan(plan)}
              className={`border rounded-2xl p-6 cursor-pointer transition-all flex flex-col ${
                planSeleccionado?.id === plan.id 
                  ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200' 
                  : 'border-gray-200 hover:border-indigo-300'
              }`}
            >
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-500 mb-4">{plan.description}</p>
                
                <div className="mb-4">
                  <span className="text-2xl font-bold text-gray-900">
                    {formatoPrecio(plan.monthly_price)}
                  </span>
                  <span className="text-gray-500">/mes</span>
                  {plan.yearly_price && (
                    <div className="text-sm text-gray-500">
                      o {formatoPrecio(plan.yearly_price)} al año ({Math.round((1 - (plan.yearly_price / (plan.monthly_price * 12))) * 100)}% de descuento)
                    </div>
                  )}
                </div>
                
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">Incluye:</h4>
                  <ul className="space-y-2">
                    {plan.features?.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {planSeleccionado?.id === plan.id && (
                <div className="text-center text-indigo-600 font-medium mt-auto">
                  <CheckIcon className="h-5 w-5 inline mr-1" />
                  Seleccionado
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={handleContinuar}
            disabled={!planSeleccionado}
            className={`inline-flex items-center px-6 py-3 rounded-md text-white font-medium ${
              planSeleccionado 
                ? 'bg-indigo-600 hover:bg-indigo-700' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Continuar al pago
            <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </main>
    </div>
  );
};

export default PlanesEmpresa;