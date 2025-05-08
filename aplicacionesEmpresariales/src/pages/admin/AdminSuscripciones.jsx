import { CreditCardIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import Navbar from '../../components/Navbar';

const AdminSuscripciones = () => {
  // Datos de prueba
  const suscripciones = [
    { id: 1, empresa: 'Tech Solutions SA', plan: 'Empresarial', fechaInicio: '01/01/2023', fechaRenovacion: '01/01/2024', estado: 'Activa', monto: '$89,900' },
    { id: 2, empresa: 'Digital Marketing SpA', plan: 'Profesional', fechaInicio: '15/02/2023', fechaRenovacion: '15/02/2024', estado: 'Activa', monto: '$39,900' },
    { id: 3, empresa: 'Cloud Services Ltda', plan: 'Básico', fechaInicio: '01/03/2023', fechaRenovacion: '01/03/2024', estado: 'Pendiente', monto: '$19,900' },
    { id: 4, empresa: 'Consultoría Financiera', plan: 'Profesional', fechaInicio: '10/04/2023', fechaRenovacion: '10/04/2024', estado: 'Activa', monto: '$39,900' },
    { id: 5, empresa: 'Software Factory', plan: 'Empresarial', fechaInicio: '05/05/2023', fechaRenovacion: '05/05/2024', estado: 'Cancelada', monto: '$89,900' }
  ];

  const getStatusIcon = (estado) => {
    switch(estado) {
      case 'Activa':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'Pendiente':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'Cancelada':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Agregamos el Navbar */}
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <main className="md:ml-64 p-4 md:p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Suscripciones Empresariales</h1>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Inicio</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Renovación</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto Mensual</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {suscripciones.map((sub) => (
                    <tr key={sub.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sub.empresa}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sub.plan}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sub.fechaInicio}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sub.fechaRenovacion}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(sub.estado)}
                          <span className="ml-2">{sub.estado}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sub.monto}</td>
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

export default AdminSuscripciones;