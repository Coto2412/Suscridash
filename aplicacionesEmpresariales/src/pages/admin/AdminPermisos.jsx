import { ShieldCheckIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import Navbar from '../../components/Navbar';

const AdminPermisos = () => {
  const [roles, setRoles] = useState([
    { id: 1, nombre: 'Administrador', permisos: ['all'], editable: false },
    { id: 2, nombre: 'Gerente', permisos: ['empresas', 'suscripciones', 'reportes'], editable: true },
    { id: 3, nombre: 'Finanzas', permisos: ['suscripciones', 'reportes'], editable: true },
    { id: 4, nombre: 'Ventas', permisos: ['empresas', 'suscripciones'], editable: true },
    { id: 5, nombre: 'Soporte', permisos: ['empresas'], editable: true }
  ]);

  const [nuevoRol, setNuevoRol] = useState('');

  const togglePermiso = (rolId, permiso) => {
    setRoles(roles.map(rol => {
      if (rol.id === rolId) {
        if (rol.permisos.includes(permiso)) {
          return {
            ...rol,
            permisos: rol.permisos.filter(p => p !== permiso)
          };
        } else {
          return {
            ...rol,
            permisos: [...rol.permisos, permiso]
          };
        }
      }
      return rol;
    }));
  };

  const agregarRol = () => {
    if (nuevoRol.trim()) {
      setRoles([
        ...roles,
        {
          id: roles.length + 1,
          nombre: nuevoRol,
          permisos: [],
          editable: true
        }
      ]);
      setNuevoRol('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Agregamos el Navbar */}
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <main className="md:ml-64 p-4 md:p-6">
          <div className="flex items-center mb-6">
            <ShieldCheckIcon className="h-8 w-8 text-indigo-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Permisos</h1>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Roles Existentes</h2>
              <div className="space-y-4">
                {roles.map((rol) => (
                  <div key={rol.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium text-gray-900">{rol.nombre}</h3>
                      {rol.editable && (
                        <button className="text-red-600 hover:text-red-800 text-sm">
                          Eliminar Rol
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {['empresas', 'suscripciones', 'reportes', 'configuracion'].map((permiso) => (
                        <div key={permiso} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`${rol.id}-${permiso}`}
                            checked={rol.permisos.includes('all') || rol.permisos.includes(permiso)}
                            onChange={() => togglePermiso(rol.id, permiso)}
                            disabled={rol.permisos.includes('all') || !rol.editable}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`${rol.id}-${permiso}`} className="ml-2 block text-sm text-gray-700 capitalize">
                            {permiso}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Agregar Nuevo Rol</h2>
              <div className="flex">
                <input
                  type="text"
                  value={nuevoRol}
                  onChange={(e) => setNuevoRol(e.target.value)}
                  placeholder="Nombre del nuevo rol"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={agregarRol}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700"
                >
                  <CheckIcon className="h-5 w-5 mr-1" />
                  Agregar
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPermisos;