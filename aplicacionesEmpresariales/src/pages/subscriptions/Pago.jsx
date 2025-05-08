import { useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { CreditCardIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Navbar from '../../components/Navbar';

const Pago = () => {
  const { state } = useLocation();
  const { empresaId } = useParams();
  const navigate = useNavigate();
  
  const { planSeleccionado, empresa } = state || {};
  
  const [cupon, setCupon] = useState('');
  const [descuento, setDescuento] = useState(0);
  const [mensajeCupon, setMensajeCupon] = useState('');
  const [datosPago, setDatosPago] = useState({
    numeroTarjeta: '',
    nombreTitular: '',
    fechaExpiracion: '',
    cvv: ''
  });

  // Validación si no hay datos
  if (!planSeleccionado || !empresa) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold text-red-600 mb-4">Datos incompletos</h2>
            <p>No se recibió la información del plan. Por favor selecciona un plan nuevamente.</p>
            <Link 
              to={`/suscripciones/${empresaId}`}
              className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              ← Volver a planes
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const formatoPrecio = (precio) => {
    return new Intl.NumberFormat('es-CL', { 
      style: 'currency', 
      currency: 'CLP',
      minimumFractionDigits: 0 
    }).format(precio);
  };

  const aplicarCupon = () => {
    if (cupon === 'DESCUENTO20') {
      setDescuento(20);
      setMensajeCupon('¡20% de descuento aplicado!');
    } else if (cupon === 'DESCUENTO50') {
      setDescuento(50);
      setMensajeCupon('¡50% de descuento aplicado!');
    } else {
      setDescuento(0);
      setMensajeCupon('Cupón no válido');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Validación de campos
    if (name === "numeroTarjeta") {
      const cleanedValue = value.replace(/\D/g, "").slice(0, 16);
      setDatosPago(prev => ({ ...prev, [name]: cleanedValue }));
      return;
    }
    
    if (name === "cvv") {
      const cleanedValue = value.replace(/\D/g, "").slice(0, 4);
      setDatosPago(prev => ({ ...prev, [name]: cleanedValue }));
      return;
    }
    
    if (name === "fechaExpiracion") {
      const cleanedValue = value.replace(/\D/g, "").slice(0, 4);
      if (cleanedValue.length > 2) {
        setDatosPago(prev => ({
          ...prev,
          [name]: `${cleanedValue.slice(0, 2)}/${cleanedValue.slice(2)}`
        }));
      } else {
        setDatosPago(prev => ({ ...prev, [name]: cleanedValue }));
      }
      return;
    }
    
    setDatosPago(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Guardar la suscripción en localStorage
    const subscriptionData = {
      empresa,
      plan: planSeleccionado,
      fechaContratacion: new Date().toISOString(),
      proximaFacturacion: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
      estado: 'Activa'
    };
    
    localStorage.setItem('currentSubscription', JSON.stringify(subscriptionData));
    
    // Redirigir
    navigate('/mi-suscripcion', {
      state: {
        planSeleccionado,
        empresa,
        pagoExitoso: true
      }
    });
  };

  const precioFinal = planSeleccionado.precioMensual * (1 - descuento / 100);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link to={`/suscripciones/${empresaId}`} className="text-indigo-600 hover:text-indigo-800">
            ← Volver a planes
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">Finalizar Compra</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Resumen de compra */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Resumen de tu compra</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Empresa:</span>
                  <span className="font-medium">{empresa.nombre}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan:</span>
                  <span className="font-medium">{planSeleccionado.nombre}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Precio base:</span>
                  <span>{formatoPrecio(planSeleccionado.precioMensual)}</span>
                </div>
                
                {descuento > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Descuento ({descuento}%):</span>
                    <span>-{formatoPrecio(planSeleccionado.precioMensual * descuento / 100)}</span>
                  </div>
                )}
                
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total a pagar:</span>
                    <span>{formatoPrecio(precioFinal)}</span>
                  </div>
                </div>
              </div>
              
              {/* Cupón de descuento */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Cupón de descuento</label>
                <div className="flex">
                  <input
                    type="text"
                    value={cupon}
                    onChange={(e) => setCupon(e.target.value)}
                    placeholder="Ingresa tu cupón"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={aplicarCupon}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700"
                  >
                    Aplicar
                  </button>
                </div>
                {mensajeCupon && (
                  <p className={`mt-1 text-sm ${descuento > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {mensajeCupon}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Formulario de pago */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">
                <CreditCardIcon className="h-6 w-6 inline mr-2 text-indigo-600" />
                Información de pago
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Número de tarjeta</label>
                    <input
                      type="text"
                      name="numeroTarjeta"
                      value={datosPago.numeroTarjeta}
                      onChange={handleInputChange}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del titular</label>
                    <input
                      type="text"
                      name="nombreTitular"
                      value={datosPago.nombreTitular}
                      onChange={handleInputChange}
                      placeholder="Como aparece en la tarjeta"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de expiración</label>
                    <input
                      type="text"
                      name="fechaExpiracion"
                      value={datosPago.fechaExpiracion}
                      onChange={handleInputChange}
                      placeholder="MM/AA"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                    <input
                      type="text"
                      name="cvv"
                      value={datosPago.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="mt-8">
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
                  >
                    Confirmar pago
                  </button>
                </div>
                
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <CheckIcon className="h-4 w-4 text-green-500 mr-1" />
                  Pago seguro encriptado con SSL
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Pago;