import { Link } from 'react-router-dom';
import { BuildingOfficeIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import Navbar from '../../components/Navbar';

const AdminEmpresas = () => {
  // Datos de prueba
  const empresas = [
    { id: 1, nombre: 'Tech Solutions SA', rut: '76.543.210-1', contacto: 'contacto@techsolutions.cl', estado: 'Activo' },
    { id: 2, nombre: 'Digital Marketing SpA', rut: '65.432.109-2', contacto: 'info@digitalmkt.cl', estado: 'Activo' },
    { id: 3, nombre: 'Cloud Services Ltda', rut: '54.321.098-3', contacto: 'ventas@cloudservices.cl', estado: 'Pendiente' },
    { id: 4, nombre: 'Consultoría Financiera', rut: '43.210.987-4', contacto: 'admin@consultoriaf.cl', estado: 'Activo' },
    { id: 5, nombre: 'Software Factory', rut: '32.109.876-5', contacto: 'contact@softfactory.cl', estado: 'Suspendido' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Agregamos el Navbar */}
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        {/* Navbar y Sidebar se heredan del layout */}
        
        <main className="md:ml-64 p-4 md:p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Empresas</h1>
            <Link
              to="/admin/empresas/nueva"
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Nueva Empresa
            </Link>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RUT</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {empresas.map((empresa) => (
                    <tr key={empresa.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{empresa.nombre}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{empresa.rut}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{empresa.contacto}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          empresa.estado === 'Activo' ? 'bg-green-100 text-green-800' :
                          empresa.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {empresa.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-indigo-600 hover:text-indigo-900">
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminEmpresas;