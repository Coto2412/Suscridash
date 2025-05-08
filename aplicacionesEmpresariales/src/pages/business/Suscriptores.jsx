import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EnvelopeIcon, PhoneIcon, CalendarIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Navbar from '../../components/Navbar';

const Suscriptores = () => {
  const navigate = useNavigate();
  
  // Datos simulados de suscriptores
  const [suscriptores, setSuscriptores] = useState([
    {
      id: 1,
      nombre: 'Juan Pérez',
      email: 'juan.perez@example.com',
      telefono: '+56912345678',
      plan: 'Premium',
      fechaInicio: '2023-05-15',
      proximoPago: '2023-06-15',
      estado: 'activo',
      metodoPago: 'Visa **** 4242'
    },
    {
      id: 2,
      nombre: 'María González',
      email: 'maria.gonzalez@example.com',
      telefono: '+56987654321',
      plan: 'Básico',
      fechaInicio: '2023-04-10',
      proximoPago: '2023-06-10',
      estado: 'activo',
      metodoPago: 'Mastercard **** 5555'
    },
    {
      id: 3,
      nombre: 'Carlos López',
      email: 'carlos.lopez@example.com',
      telefono: '+56911223344',
      plan: 'Empresarial',
      fechaInicio: '2023-01-20',
      proximoPago: '2023-07-20',
      estado: 'cancelado',
      metodoPago: 'Transferencia bancaria'
    }
  ]);

  const [filtro, setFiltro] = useState('todos');

  const cambiarEstado = (id) => {
    setSuscriptores(suscriptores.map(s => 
      s.id === id 
        ? {...s, estado: s.estado === 'activo' ? 'cancelado' : 'activo'} 
        : s
    ));
  };

  const suscriptoresFiltrados = suscriptores.filter(s => 
    filtro === 'todos' ? true : s.estado === filtro
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">Suscriptores</h1>
          <div className="flex space-x-2">
            <select
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="todos">Todos</option>
              <option value="activo">Activos</option>
              <option value="cancelado">Cancelados</option>
            </select>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
              Exportar
            </button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="grid grid-cols-12 bg-gray-50 px-6 py-3 border-b border-gray-200">
            <div className="col-span-3 font-medium text-gray-700">Nombre</div>
            <div className="col-span-2 font-medium text-gray-700">Plan</div>
            <div className="col-span-2 font-medium text-gray-700">Estado</div>
            <div className="col-span-2 font-medium text-gray-700">Próximo pago</div>
            <div className="col-span-3 font-medium text-gray-700 text-right">Acciones</div>
          </div>
          
          {suscriptoresFiltrados.map(suscriptor => (
            <div key={suscriptor.id} className="grid grid-cols-12 px-6 py-4 border-b border-gray-200 hover:bg-gray-50">
              <div className="col-span-3">
                <p className="font-medium">{suscriptor.nombre}</p>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <EnvelopeIcon className="h-4 w-4 mr-1" />
                  {suscriptor.email}
                </div>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <PhoneIcon className="h-4 w-4 mr-1" />
                  {suscriptor.telefono}
                </div>
              </div>
              <div className="col-span-2">
                <span className="inline-block bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-sm">
                  {suscriptor.plan}
                </span>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  Desde {suscriptor.fechaInicio}
                </div>
              </div>
              <div className="col-span-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  suscriptor.estado === 'activo' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {suscriptor.estado === 'activo' ? 'Activo' : 'Cancelado'}
                </span>
                <div className="text-sm text-gray-500 mt-1">
                  {suscriptor.metodoPago}
                </div>
              </div>
              <div className="col-span-2">
                <div className="text-gray-900">{suscriptor.proximoPago}</div>
                <div className="text-sm text-gray-500">
                  {suscriptor.estado === 'activo' ? 'Próxima renovación' : 'Finaliza'}
                </div>
              </div>
              <div className="col-span-3 flex justify-end space-x-2">
                <button
                  onClick={() => cambiarEstado(suscriptor.id)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    suscriptor.estado === 'activo'
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {suscriptor.estado === 'activo' ? (
                    <>
                      <XMarkIcon className="h-4 w-4 inline mr-1" />
                      Cancelar
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-4 w-4 inline mr-1" />
                      Reactivar
                    </>
                  )}
                </button>
                <button
                  onClick={() => navigate(`/business/suscriptores/${suscriptor.id}`)}
                  className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 text-sm font-medium"
                >
                  Detalles
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Mostrando {suscriptoresFiltrados.length} de {suscriptores.length} suscriptores
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium">
              Anterior
            </button>
            <button className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm font-medium">
              1
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium">
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Suscriptores;