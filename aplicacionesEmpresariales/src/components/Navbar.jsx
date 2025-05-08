import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

const Navbar = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [hasSubscription, setHasSubscription] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    setCurrentUser(user);
    
    // Verificar si hay una suscripción activa en localStorage
    const subscription = JSON.parse(localStorage.getItem('currentSubscription'));
    setHasSubscription(!!subscription);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentSubscription'); // Limpiar suscripción al cerrar sesión
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!currentUser) return '/login';
    switch(currentUser.user_type) {
      case 'admin':
        return '/admin/dashboard';
      case 'business':
        return '/business/dashboard';
      case 'customer':
        return hasSubscription ? '/mi-suscripcion' : '/suscripciones';
      default:
        return '/login';
    }
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link 
              to={currentUser ? getDashboardLink() : '/login'}
              className="text-xl font-extrabold text-indigo-600 tracking-tight"
            >
              Suscridash
            </Link>
            
            {currentUser && (
              <div className="hidden md:flex space-x-4">
                <Link
                  to="/home"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  Inicio
                </Link>
                {currentUser.userType === 'business' && (
                  <div className="hidden md:flex space-x-4">
                    <Link
                      to="/business/dashboard"
                      className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/business/planes"
                      className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                      Planes
                    </Link>
                    <Link
                      to="/business/suscriptores"
                      className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                      Suscriptores
                    </Link>
                    <Link
                      to="/business/configuracion"
                      className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                      Configuración
                    </Link>
                  </div>
                )}
                {currentUser.userType === 'customer' && (
                  <div className="flex space-x-4">
                    <Link
                      to="/suscripciones"
                      className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                      Suscripciones
                    </Link>
                    {hasSubscription && (
                      <Link
                        to="/mi-suscripcion"
                        className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      >
                        Mi Suscripción
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {currentUser && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 hidden md:block">
                Hola, {currentUser.name}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <ArrowLeftOnRectangleIcon className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;