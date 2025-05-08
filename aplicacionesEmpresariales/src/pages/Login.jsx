// src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';


const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'customer' // 'admin', 'business' o 'customer'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    console.log('Enviando:', {
      email: formData.email,
      password: formData.password,
      userType: formData.userType
    });
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: formData.email,
        password: formData.password,
        userType: formData.userType
      });

      const { access_token, user } = response.data;
      
      // Guardar token y datos de usuario
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      // Redirección según tipo de usuario
      let redirectPath = '/home';
      if (user.user_type === 'admin') {
        redirectPath = '/admin/dashboard';
      } else if (user.user_type === 'business') {
        redirectPath = '/business/dashboard';
      }
      
      navigate(redirectPath);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setError(error.response?.data?.error || 'Ocurrió un error al intentar iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Elementos decorativos */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 opacity-10 -translate-y-1/3 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 opacity-10 translate-y-1/3 -translate-x-1/4"></div>
        <div className="absolute bottom-0 right-1/4 w-40 h-40 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 opacity-10 translate-y-1/4"></div>
      </div>
      
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl z-10">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-indigo-600 tracking-tight">Suscridash</h1>
          <p className="mt-2 text-sm text-gray-600">Inicia sesión en tu cuenta</p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Selector de tipo de usuario */}
            <div>
              <label htmlFor="userType" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de usuario
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['customer', 'business', 'admin'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, userType: type }))}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      formData.userType === type 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type === 'customer' && 'Cliente'}
                    {type === 'business' && 'Empresa'}
                    {type === 'admin' && 'Administrador'}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={
                    formData.userType === 'admin' ? 'admin@suscridash.cl' :
                    formData.userType === 'business' ? 'empresa@ejemplo.cl' :
                    'cliente@ejemplo.cl'
                  }
                />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              </div>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={
                    formData.userType === 'admin' ? 'admin123' :
                    formData.userType === 'business' ? 'empresa123' :
                    'cliente123'
                  }
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${isLoading ? 'bg-indigo-400 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Cargando...' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            ¿No tienes una cuenta?{' '}
            <Link 
              to={`/register?type=${formData.userType}`} 
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Regístrate como {formData.userType === 'customer' ? 'cliente' : formData.userType === 'business' ? 'empresa' : 'admin'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;