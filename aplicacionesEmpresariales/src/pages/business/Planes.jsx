import { useState, useEffect } from 'react';
import { PencilIcon, PlusIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import Navbar from '../../components/Navbar';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const Planes = () => {
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Cargar planes al montar el componente
  useEffect(() => {
    fetchPlanes();
  }, []);

  const fetchPlanes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      const response = await axios.get('http://localhost:5000/api/business/plans', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setPlanes(response.data.plans);
      setError(null);
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError('Error al cargar los planes');
    } finally {
      setLoading(false);
    }
  };

  const toggleEstadoPlan = async (planId) => {
    try {
      const token = localStorage.getItem('access_token');
      
      const result = await MySwal.fire({
        title: '¿Cambiar estado del plan?',
        text: 'Los suscriptores existentes mantendrán su estado actual',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, cambiar',
        cancelButtonText: 'Cancelar'
      });
      
      if (result.isConfirmed) {
        await axios.put(
          `http://localhost:5000/api/business/plans/${planId}/toggle-status`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        fetchPlanes(); // Recargar lista de planes
        
        MySwal.fire(
          'Estado cambiado',
          'El estado del plan ha sido actualizado',
          'success'
        );
      }
    } catch (err) {
      console.error('Error toggling plan status:', err);
      MySwal.fire(
        'Error',
        'No se pudo cambiar el estado del plan',
        'error'
      );
    }
  };

  const eliminarPlan = async (planId) => {
    try {
      const result = await MySwal.fire({
        title: '¿Eliminar este plan?',
        text: 'Los suscriptores actuales no serán afectados, pero no podrás aceptar nuevos suscriptores',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });
      
      if (result.isConfirmed) {
        const token = localStorage.getItem('access_token');
        await axios.delete(
          `http://localhost:5000/api/business/plans/${planId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        fetchPlanes(); // Recargar lista de planes
        
        MySwal.fire(
          'Eliminado',
          'El plan ha sido eliminado',
          'success'
        );
      }
    } catch (err) {
      console.error('Error deleting plan:', err);
      MySwal.fire(
        'Error',
        'No se pudo eliminar el plan',
        'error'
      );
    }
  };

  const mostrarModalCrearPlan = () => {
    MySwal.fire({
      title: 'Crear nuevo plan',
      html: (
        <div className="text-left">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Nombre del plan</label>
            <input 
              type="text" 
              id="swal-nombre" 
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
              placeholder="Ej: Plan Premium"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Descripción</label>
            <textarea 
              id="swal-descripcion" 
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
              placeholder="Describe los beneficios del plan"
              rows="3"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Precio</label>
              <input 
                type="number" 
                id="swal-precio" 
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                placeholder="Ej: 19900"
                min="0"
                step="100"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Moneda</label>
              <select 
                id="swal-moneda" 
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="CLP">CLP</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Periodo</label>
              <select 
                id="swal-periodo" 
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="mes">Mensual</option>
                <option value="trimestre">Trimestral</option>
                <option value="anio">Anual</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Estado</label>
              <select 
                id="swal-estado" 
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Características (separadas por comas)</label>
            <textarea 
              id="swal-caracteristicas" 
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
              placeholder="Ej: Soporte 24/7, Acceso completo, Actualizaciones"
              rows="2"
            />
          </div>
        </div>
      ),
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Crear plan',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        return {
          nombre: document.getElementById('swal-nombre').value,
          descripcion: document.getElementById('swal-descripcion').value,
          precio: parseFloat(document.getElementById('swal-precio').value),
          moneda: document.getElementById('swal-moneda').value,
          periodo: document.getElementById('swal-periodo').value,
          estado: document.getElementById('swal-estado').value,
          caracteristicas: document.getElementById('swal-caracteristicas').value
            .split(',')
            .map(item => item.trim())
            .filter(item => item.length > 0)
        };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('access_token');
          await axios.post(
            'http://localhost:5000/api/business/plans',
            result.value,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );
          
          fetchPlanes(); // Recargar lista de planes
          
          MySwal.fire(
            'Plan creado',
            'El nuevo plan ha sido creado exitosamente',
            'success'
          );
        } catch (err) {
          console.error('Error creating plan:', err);
          MySwal.fire(
            'Error',
            'No se pudo crear el plan',
            'error'
          );
        }
      }
    });
  };

  const mostrarModalEditarPlan = (plan) => {
    MySwal.fire({
      title: 'Editar plan',
      html: (
        <div className="text-left">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Nombre del plan</label>
            <input 
              type="text" 
              id="swal-nombre" 
              defaultValue={plan.nombre}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
              placeholder="Ej: Plan Premium"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Descripción</label>
            <textarea 
              id="swal-descripcion" 
              defaultValue={plan.descripcion}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
              placeholder="Describe los beneficios del plan"
              rows="3"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Precio</label>
              <input 
                type="number" 
                id="swal-precio" 
                defaultValue={plan.precio}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                placeholder="Ej: 19900"
                min="0"
                step="100"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Moneda</label>
              <select 
                id="swal-moneda" 
                defaultValue={plan.moneda}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="CLP">CLP</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Periodo</label>
              <select 
                id="swal-periodo" 
                defaultValue={plan.periodo}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="mes">Mensual</option>
                <option value="trimestre">Trimestral</option>
                <option value="anio">Anual</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Estado</label>
              <select 
                id="swal-estado" 
                defaultValue={plan.estado}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Características (separadas por comas)</label>
            <textarea 
              id="swal-caracteristicas" 
              defaultValue={plan.caracteristicas.join(', ')}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
              placeholder="Ej: Soporte 24/7, Acceso completo, Actualizaciones"
              rows="2"
            />
          </div>
        </div>
      ),
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar cambios',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        return {
          nombre: document.getElementById('swal-nombre').value,
          descripcion: document.getElementById('swal-descripcion').value,
          precio: parseFloat(document.getElementById('swal-precio').value),
          moneda: document.getElementById('swal-moneda').value,
          periodo: document.getElementById('swal-periodo').value,
          estado: document.getElementById('swal-estado').value,
          caracteristicas: document.getElementById('swal-caracteristicas').value
            .split(',')
            .map(item => item.trim())
            .filter(item => item.length > 0)
        };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('access_token');
          await axios.put(
            `http://localhost:5000/api/business/plans/${plan.id}`,
            result.value,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );
          
          fetchPlanes(); // Recargar lista de planes
          
          MySwal.fire(
            'Plan actualizado',
            'Los cambios han sido guardados',
            'success'
          );
        } catch (err) {
          console.error('Error updating plan:', err);
          MySwal.fire(
            'Error',
            'No se pudo actualizar el plan',
            'error'
          );
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="text-xl font-semibold">Cargando planes...</div>
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
          <h1 className="text-3xl font-bold text-indigo-600">Gestión de Planes</h1>
          <button
            onClick={mostrarModalCrearPlan}
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
          
          {planes.length > 0 ? (
            planes.map(plan => (
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
                    onClick={() => mostrarModalEditarPlan(plan)}
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
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">
              No hay planes creados. Crea tu primer plan haciendo clic en "Nuevo Plan".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Planes;