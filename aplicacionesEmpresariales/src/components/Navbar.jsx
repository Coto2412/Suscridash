import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftOnRectangleIcon,
  HomeIcon,
  CreditCardIcon,
  UserIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const Navbar = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    setCurrentUser(user);
    
    // Verificar suscripción activa
    const checkSubscription = async () => {
      if (user && user.user_type === 'customer') {
        try {
          const token = localStorage.getItem('access_token');
          const response = await axios.get('http://localhost:5000/api/customer/subscription', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          setHasSubscription(response.data.hasSubscription);
        } catch (error) {
          console.error('Error verificando suscripción:', error);
          setHasSubscription(false);
        }
      }
      setLoading(false);
    };
    
    checkSubscription();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('access_token');
    localStorage.removeItem('currentSubscription');
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

  const handleNavigateToSubscriptions = () => {
    if (hasSubscription) {
      Swal.fire({
        title: 'Ya tienes una suscripción',
        text: 'Actualmente tienes una suscripción activa. ¿Deseas ver los detalles?',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Ver mi suscripción',
        cancelButtonText: 'Explorar otras opciones'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/mi-suscripcion');
        } else {
          navigate('/suscripciones');
        }
      });
    } else {
      navigate('/suscripciones');
    }
  };

  if (loading && currentUser?.user_type === 'customer') {
    return (
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="text-xl font-extrabold text-indigo-600 tracking-tight">
              Suscridash
            </div>
            <div className="animate-pulse bg-gray-200 h-8 w-24 rounded-md"></div>
          </div>
        </div>
      </nav>
    );
  }

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
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  <HomeIcon className="h-5 w-5 mr-1" />
                  Inicio
                </Link>
                
                {currentUser.user_type === 'business' && (
                  <>
                    <Link
                      to="/business/dashboard"
                      className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                      <CreditCardIcon className="h-5 w-5 mr-1" />
                      Dashboard
                    </Link>
                    <Link
                      to="/business/planes"
                      className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                      <ShoppingCartIcon className="h-5 w-5 mr-1" />
                      Planes
                    </Link>
                  </>
                )}
                
                {currentUser.user_type === 'customer' && (
                  <>
                    <button
                      onClick={handleNavigateToSubscriptions}
                      className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                      <ShoppingCartIcon className="h-5 w-5 mr-1" />
                      {hasSubscription ? 'Mi Suscripción' : 'Suscripciones'}
                    </button>
                    {hasSubscription && (
                      <Link
                        to="/mi-suscripcion"
                        className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      >
                        <CreditCardIcon className="h-5 w-5 mr-1" />
                        Detalles
                      </Link>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          
          {currentUser && (
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center">
                <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">
                  {currentUser.name}
                </span>
              </div>
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