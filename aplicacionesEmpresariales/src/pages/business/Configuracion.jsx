import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BuildingOfficeIcon, EnvelopeIcon, GlobeAltIcon, PhoneIcon, CreditCardIcon } from '@heroicons/react/24/outline';

const Configuracion = () => {
  const [empresa, setEmpresa] = useState({
    nombre: 'Tech Solutions',
    rut: '76.123.456-7',
    giro: 'Desarrollo de Software',
    direccion: 'Av. Providencia 1234, Santiago',
    telefono: '+56223456789',
    email: 'contacto@techsolutions.cl',
    sitioWeb: 'www.techsolutions.cl',
    logo: '🖥️',
    colores: {
      primario: '#4f46e5',
      secundario: '#6366f1'
    }
  });

  const [metodosPago, setMetodosPago] = useState([
    { id: 1, tipo: 'transferencia', activo: true },
    { id: 2, tipo: 'tarjeta', activo: true },
    { id: 3, tipo: 'webpay', activo: false }
  ]);

  const toggleMetodoPago = (id) => {
    setMetodosPago(metodosPago.map(m => 
      m.id === id ? {...m, activo: !m.activo} : m
    ));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmpresa(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Configuración guardada exitosamente!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link to="/business/dashboard" className="text-indigo-600 hover:text-indigo-800">
            ← Volver al dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">Configuración de Empresa</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información de la empresa */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Información Básica</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la empresa</label>
                    <input
                      type="text"
                      name="nombre"
                      value={empresa.nombre}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">RUT</label>
                    <input
                      type="text"
                      name="rut"
                      value={empresa.rut}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giro</label>
                    <input
                      type="text"
                      name="giro"
                      value={empresa.giro}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                    <input
                      type="text"
                      name="direccion"
                      value={empresa.direccion}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <PhoneIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        name="telefono"
                        value={empresa.telefono}
                        onChange={handleChange}
                        className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={empresa.email}
                        onChange={handleChange}
                        className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sitio Web</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <GlobeAltIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="url"
                        name="sitioWeb"
                        value={empresa.sitioWeb}
                        onChange={handleChange}
                        className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                    <div className="flex items-center">
                      <span className="text-4xl mr-4">{empresa.logo}</span>
                      <input
                        type="text"
                        name="logo"
                        value={empresa.logo}
                        onChange={handleChange}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Emoji o URL de imagen"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Configuración adicional */}
          <div className="space-y-6">
            {/* Métodos de pago */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                <CreditCardIcon className="h-6 w-6 inline mr-2 text-indigo-600" />
                Métodos de Pago
              </h2>
              
              <div className="space-y-3">
                {metodosPago.map(metodo => (
                  <div key={metodo.id} className="flex items-center justify-between">
                    <span className="capitalize">{metodo.tipo}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={metodo.activo}
                        onChange={() => toggleMetodoPago(metodo.id)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Colores de la marca */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Colores de la Marca</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color Primario</label>
                  <div className="flex items-center">
                    <input
                      type="color"
                      value={empresa.colores.primario}
                      onChange={(e) => setEmpresa(prev => ({
                        ...prev,
                        colores: {...prev.colores, primario: e.target.value}
                      }))}
                      className="h-10 w-10 rounded cursor-pointer"
                    />
                    <span className="ml-2">{empresa.colores.primario}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color Secundario</label>
                  <div className="flex items-center">
                    <input
                      type="color"
                      value={empresa.colores.secundario}
                      onChange={(e) => setEmpresa(prev => ({
                        ...prev,
                        colores: {...prev.colores, secundario: e.target.value}
                      }))}
                      className="h-10 w-10 rounded cursor-pointer"
                    />
                    <span className="ml-2">{empresa.colores.secundario}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Zona peligrosa */}
            <div className="bg-white shadow rounded-lg p-6 border border-red-200">
              <h2 className="text-xl font-semibold text-red-600 mb-4">Zona Peligrosa</h2>
              
              <div className="space-y-3">
                <button className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 text-sm font-medium">
                  Exportar todos los datos
                </button>
                <button className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 text-sm font-medium">
                  Desactivar cuenta temporalmente
                </button>
                <button className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium">
                  Eliminar cuenta permanentemente
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuracion;