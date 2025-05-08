import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { 
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  CreditCardIcon,
  BuildingOfficeIcon,
  TicketIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import Navbar from '../../components/Navbar';

const MiSuscripcion = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [renovacionAutomatica, setRenovacionAutomatica] = useState(true);
  const [loading, setLoading] = useState(true);
  
  const [suscripcion, setSuscripcion] = useState({
    id: 1,
    empresa: {
      id: null,
      nombre: '',
      logo: ''
    },
    plan: {
      id: null,
      nombre: '',
      precioMensual: 0,
      caracteristicas: []
    },
    fechaInicio: '',
    proximaFacturacion: '',
    estado: 'Inactiva',
    metodoPago: 'No configurado'
  });

  useEffect(() => {
    // 1. Verificar si viene de un pago exitoso
    if (searchParams.get('pago') === 'exitoso') {
      const { state } = location;
      
      if (state?.planSeleccionado && state?.empresa) {
        const nuevaSuscripcion = {
          empresa: state.empresa,
          plan: state.planSeleccionado,
          fechaInicio: new Date().toISOString().split('T')[0],
          proximaFacturacion: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
          estado: 'Activa',
          metodoPago: 'Visa **** 4242'
        };
        
        setSuscripcion(nuevaSuscripcion);
        localStorage.setItem('currentSubscription', JSON.stringify(nuevaSuscripcion));
      }
      
      navigate('/mi-suscripcion', { replace: true });
      return;
    }

    // 2. Cargar desde localStorage
    const savedSubscription = JSON.parse(localStorage.getItem('currentSubscription'));
    if (savedSubscription) {
      setSuscripcion(savedSubscription);
    }
    
    setLoading(false);
  }, [searchParams, navigate, location]);

  const cancelarSuscripcion = () => {
    if (window.confirm('¿Estás seguro de que deseas cancelar tu suscripción?\n\nPerderás acceso al servicio en la próxima fecha de facturación.')) {
      const updatedSubscription = {
        ...suscripcion,
        estado: `Cancelada (finaliza el ${suscripcion.proximaFacturacion})`
      };
      
      setSuscripcion(updatedSubscription);
      localStorage.setItem('currentSubscription', JSON.stringify(updatedSubscription));
    }
  };

  const cambiarPlan = () => {
    navigate('/suscripciones');
  };

  const formatoPrecio = (precio) => {
    return new Intl.NumberFormat('es-CL', { 
      style: 'currency', 
      currency: 'CLP',
      minimumFractionDigits: 0 
    }).format(precio);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (!suscripcion.empresa.id || suscripcion.estado === 'Inactiva') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <ExclamationTriangleIcon className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No tienes suscripciones activas</h2>
            <p className="text-gray-600 mb-6">
              Parece que aún no has contratado ningún plan. Explora nuestras opciones para encontrar el que mejor se adapte a tus necesidades.
            </p>
            <Link
              to="/suscripciones"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Ver planes disponibles
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {searchParams.get('pago') === 'exitoso' && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  ¡Gracias por tu suscripción! Ahora tienes acceso a {suscripcion.empresa.nombre} - {suscripcion.plan.nombre}.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Mi Suscripción</h1>
        
        {/* Resumen de suscripción */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Empresa</h3>
              <p className="text-lg font-semibold text-gray-900">
                <BuildingOfficeIcon className="h-5 w-5 inline mr-2" />
                {suscripcion.empresa.nombre}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Plan</h3>
              <p className="text-lg font-semibold text-gray-900">
                <TicketIcon className="h-5 w-5 inline mr-2" />
                {suscripcion.plan.nombre}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {formatoPrecio(suscripcion.plan.precioMensual)}/mes
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Estado</h3>
              <p className="text-lg font-semibold text-gray-900">
                {suscripcion.estado.includes('Activa') ? (
                  <span className="text-green-600">
                    <CheckCircleIcon className="h-5 w-5 inline mr-2" />
                    {suscripcion.estado}
                  </span>
                ) : (
                  <span className="text-red-600">
                    <XCircleIcon className="h-5 w-5 inline mr-2" />
                    {suscripcion.estado}
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Fecha de inicio</h3>
              <p className="text-gray-900">{suscripcion.fechaInicio}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Próxima facturación</h3>
              <p className="text-gray-900">
                <ClockIcon className="h-5 w-5 inline mr-2" />
                {suscripcion.proximaFacturacion}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Método de pago</h3>
              <p className="text-gray-900">
                <CreditCardIcon className="h-5 w-5 inline mr-2" />
                {suscripcion.metodoPago}
              </p>
            </div>
          </div>
        </div>
        
        {/* Características del plan */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Características de tu plan</h2>
          
          <ul className="space-y-3">
            {suscripcion.plan.caracteristicas?.map((caracteristica, index) => (
              <li key={index} className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{caracteristica}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Acciones */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Administrar suscripción</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Renovación automática</h3>
                <p className="text-sm text-gray-500">
                  {renovacionAutomatica 
                    ? 'Tu suscripción se renovará automáticamente' 
                    : 'Tu suscripción no se renovará automáticamente'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={renovacionAutomatica}
                  onChange={() => setRenovacionAutomatica(!renovacionAutomatica)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <button
                onClick={cambiarPlan}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                <ArrowPathIcon className="h-5 w-5 mr-2" />
                Cambiar de plan
              </button>
              
              <button
                onClick={cancelarSuscripcion}
                className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                disabled={suscripcion.estado.includes('Cancelada')}
              >
                <XCircleIcon className="h-5 w-5 mr-2" />
                {suscripcion.estado.includes('Cancelada') ? 'Cancelación programada' : 'Cancelar suscripción'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MiSuscripcion;