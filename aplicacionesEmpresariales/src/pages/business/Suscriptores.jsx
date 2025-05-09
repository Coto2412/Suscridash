import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  CalendarIcon, 
  CheckIcon, 
  XMarkIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import Navbar from '../../components/Navbar';
import axios from 'axios';
import Swal from 'sweetalert2';

const Suscriptores = () => {
  const navigate = useNavigate();
  const [suscriptores, setSuscriptores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Cargar suscriptores al montar el componente o cambiar filtros
  useEffect(() => {
    fetchSuscriptores();
  }, [filtro, searchQuery]);

  const fetchSuscriptores = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      const response = await axios.get('http://localhost:5000/api/business/subscribers', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          status: filtro,
          search: searchQuery
        }
      });
      
      setSuscriptores(response.data.subscribers);
      setError(null);
    } catch (err) {
      console.error('Error fetching subscribers:', err);
      setError('Error al cargar los suscriptores');
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (id, estadoActual) => {
    try {
      const result = await Swal.fire({
        title: estadoActual === 'active' ? '¿Cancelar suscripción?' : '¿Reactivar suscripción?',
        text: estadoActual === 'active' 
          ? 'El usuario perderá acceso al finalizar el período pagado' 
          : 'El usuario recuperará acceso inmediatamente',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, confirmar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: estadoActual === 'active' ? '#d33' : '#28a745'
      });
      
      if (result.isConfirmed) {
        const token = localStorage.getItem('access_token');
        const nuevoEstado = estadoActual === 'active' ? 'cancelled' : 'active';
        
        await axios.put(
          `http://localhost:5000/api/business/subscribers/${id}/status`,
          { status: nuevoEstado },
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        // Actualizar lista localmente sin recargar toda la página
        setSuscriptores(suscriptores.map(s => 
          s.id === id ? { ...s, estado: nuevoEstado } : s
        ));
        
        Swal.fire(
          'Estado actualizado',
          `La suscripción ha sido ${nuevoEstado === 'active' ? 'reactivada' : 'cancelada'}`,
          'success'
        );
      }
    } catch (err) {
      console.error('Error updating subscriber status:', err);
      Swal.fire(
        'Error',
        'No se pudo actualizar el estado de la suscripción',
        'error'
      );
    }
  };

  const exportarSuscriptores = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await axios.get('http://localhost:5000/api/business/subscribers/export', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // En un sistema real, aquí descargarías el archivo
      // Para este ejemplo, mostramos los datos en un alert
      Swal.fire({
        title: 'Datos para exportación',
        html: `
          <div class="text-left">
            <p>Formato: ${response.data.format}</p>
            <p>Registros: ${response.data.count}</p>
            <pre class="mt-4 p-2 bg-gray-100 rounded text-xs">${JSON.stringify(response.data.data, null, 2)}</pre>
          </div>
        `,
        confirmButtonText: 'Cerrar'
      });
      
    } catch (err) {
      console.error('Error exporting subscribers:', err);
      Swal.fire(
        'Error',
        'No se pudo preparar la exportación',
        'error'
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="text-xl font-semibold">Cargando suscriptores...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="text-xl font-semibold text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">Suscriptores</h1>
          <div className="flex space-x-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="cancelled">Cancelados</option>
            </select>
            <button 
              onClick={exportarSuscriptores}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
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
          
          {suscriptores.length > 0 ? (
            suscriptores.map(suscriptor => (
              <div key={suscriptor.id} className="grid grid-cols-12 px-6 py-4 border-b border-gray-200 hover:bg-gray-50">
                <div className="col-span-3">
                  <p className="font-medium">{suscriptor.nombre}</p>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <EnvelopeIcon className="h-4 w-4 mr-1" />
                    {suscriptor.email}
                  </div>
                  {suscriptor.telefono && (
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <PhoneIcon className="h-4 w-4 mr-1" />
                      {suscriptor.telefono}
                    </div>
                  )}
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
                    suscriptor.estado === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {suscriptor.estado === 'active' ? 'Activo' : 'Cancelado'}
                  </span>
                  <div className="text-sm text-gray-500 mt-1">
                    {suscriptor.metodoPago}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-gray-900">{suscriptor.proximoPago}</div>
                  <div className="text-sm text-gray-500">
                    {suscriptor.estado === 'active' ? 'Próxima renovación' : 'Finaliza'}
                  </div>
                </div>
                <div className="col-span-3 flex justify-end space-x-2">
                  <button
                    onClick={() => cambiarEstado(suscriptor.id, suscriptor.estado)}
                    className={`px-3 py-1 rounded-md text-sm font-medium flex items-center ${
                      suscriptor.estado === 'active'
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {suscriptor.estado === 'active' ? (
                      <>
                        <XMarkIcon className="h-4 w-4 mr-1" />
                        Cancelar
                      </>
                    ) : (
                      <>
                        <CheckIcon className="h-4 w-4 mr-1" />
                        Reactivar
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => navigate(`/business/suscriptores/${suscriptor.id}`)}
                    className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 text-sm font-medium flex items-center"
                  >
                    Detalles
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">
              No se encontraron suscriptores {filtro !== 'all' ? `con estado ${filtro}` : ''}
              {searchQuery && ` que coincidan con "${searchQuery}"`}
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Mostrando {suscriptores.length} suscriptores
          </div>
          {/* En un sistema real, aquí iría la paginación */}
          {/* <div className="flex space-x-2">
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium">
              Anterior
            </button>
            <button className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm font-medium">
              1
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium">
              Siguiente
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Suscriptores;