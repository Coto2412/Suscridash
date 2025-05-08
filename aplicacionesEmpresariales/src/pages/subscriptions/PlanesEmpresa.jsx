import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { CheckIcon } from '@heroicons/react/24/outline';
import Navbar from '../../components/Navbar';

// Datos simulados
const empresas = [
  {
    id: 1,
    nombre: 'Tech Solutions',
    logo: '🖥️',
    descripcion: 'Soluciones tecnológicas para tu negocio',
    categorias: ['Software', 'Productividad'],
    planes: [
      {
        id: 1,
        nombre: "Básico",
        descripcion: "Perfecto para empezar",
        precioMensual: 19900,
        precioAnual: 179900,
        caracteristicas: ["Acceso básico", "Soporte por email", "Actualizaciones mensuales"]
      },
      {
        id: 2,
        nombre: "Profesional",
        descripcion: "Para necesidades avanzadas",
        precioMensual: 39900,
        precioAnual: 359900,
        caracteristicas: ["Acceso completo", "Soporte prioritario", "Actualizaciones semanales", "Integraciones"]
      },
      {
        id: 3,
        nombre: "Premium",
        descripcion: "Solución empresarial completa",
        precioMensual: 89900,
        precioAnual: 899900,
        caracteristicas: ["Acceso premium", "Soporte 24/7", "Actualizaciones en tiempo real", "API acceso"]
      }
    ]
  },
  {
    id: 2,
    nombre: 'Digital Marketing',
    logo: '📈',
    descripcion: 'Expertos en marketing digital',
    categorias: ['Marketing', 'Redes Sociales'],
    planes: [
      {
        id: 1,
        nombre: "Starter",
        descripcion: "Para emprendedores",
        precioMensual: 14900,
        precioAnual: 149900,
        caracteristicas: ["2 campañas/mes", "Informes básicos", "Soporte email"]
      },
      {
        id: 2,
        nombre: "Business",
        descripcion: "Para pequeñas empresas",
        precioMensual: 29900,
        precioAnual: 299900,
        caracteristicas: ["5 campañas/mes", "Informes avanzados", "Soporte prioritario", "Analítica integrada"]
      }
    ]
  },
  {
    id: 3,
    nombre: 'Cloud Services',
    logo: '☁️',
    descripcion: 'Almacenamiento y servicios en la nube',
    categorias: ['Almacenamiento', 'Infraestructura'],
    planes: [
      {
        id: 1,
        nombre: "10GB",
        descripcion: "Plan personal",
        precioMensual: 9900,
        precioAnual: 99900,
        caracteristicas: ["10GB almacenamiento", "1 usuario", "Acceso desde cualquier dispositivo"]
      },
      {
        id: 2,
        nombre: "50GB",
        descripcion: "Plan equipo",
        precioMensual: 19900,
        precioAnual: 199900,
        caracteristicas: ["50GB almacenamiento", "5 usuarios", "Colaboración en tiempo real"]
      },
      {
        id: 3,
        nombre: "1TB",
        descripcion: "Plan empresarial",
        precioMensual: 49900,
        precioAnual: 499900,
        caracteristicas: ["1TB almacenamiento", "Usuarios ilimitados", "Soporte 24/7", "Cifrado avanzado"]
      }
    ]
  },
  {
    id: 4,
    nombre: 'Design Pro',
    logo: '🎨',
    descripcion: 'Herramientas de diseño profesional',
    categorias: ['Diseño', 'Creatividad'],
    planes: [
      {
        id: 1,
        nombre: "Freelancer",
        descripcion: "Para trabajadores independientes",
        precioMensual: 15900,
        precioAnual: 159900,
        caracteristicas: ["Acceso a 5 herramientas", "10 descargas/mes", "Plantillas básicas"]
      },
      {
        id: 2,
        nombre: "Agency",
        descripcion: "Para equipos creativos",
        precioMensual: 59900,
        precioAnual: 599900,
        caracteristicas: ["Acceso completo", "Descargas ilimitadas", "Plantillas premium", "Colaboración en equipo"]
      }
    ]
  }
];

const PlanesEmpresa = () => {
  const { empresaId } = useParams();
  const navigate = useNavigate();
  const [planSeleccionado, setPlanSeleccionado] = useState(null);
  
  const empresa = empresas.find(e => e.id === parseInt(empresaId));
  
  if (!empresa) {
    return <div>Empresa no encontrada</div>;
  }

  const formatoPrecio = (precio) => {
    return new Intl.NumberFormat('es-CL', { 
      style: 'currency', 
      currency: 'CLP',
      minimumFractionDigits: 0 
    }).format(precio);
  };

  const handleSeleccionarPlan = (plan) => {
    setPlanSeleccionado(plan);
  };

  const handleContinuar = () => {
    if (planSeleccionado) {
      navigate(`/suscripciones/${empresaId}/pago`, {
        state: {  // Enviamos los datos por estado de navegación
          planSeleccionado,
          empresa
        }
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link to="/suscripciones" className="text-indigo-600 hover:text-indigo-800">
            ← Volver a todas las empresas
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">
            <span className="text-4xl mr-3">{empresa.logo}</span>
            {empresa.nombre}
          </h1>
          <p className="text-gray-600 mt-2">{empresa.descripcion}</p>
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Planes Disponibles</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {empresa.planes.map(plan => (
            <div 
              key={plan.id}
              onClick={() => handleSeleccionarPlan(plan)}
              className={`border rounded-2xl p-6 cursor-pointer transition-all ${
                planSeleccionado?.id === plan.id 
                  ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200' 
                  : 'border-gray-200 hover:border-indigo-300'
              }`}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.nombre}</h3>
              <p className="text-gray-500 mb-4">{plan.descripcion}</p>
              
              <div className="mb-4">
                <span className="text-2xl font-bold text-gray-900">
                  {formatoPrecio(plan.precioMensual)}
                </span>
                <span className="text-gray-500">/mes</span>
                <div className="text-sm text-gray-500">
                  o {formatoPrecio(plan.precioAnual)} al año (2 meses gratis)
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Incluye:</h4>
                <ul className="space-y-2">
                  {plan.caracteristicas.map((caracteristica, i) => (
                    <li key={i} className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{caracteristica}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {planSeleccionado?.id === plan.id && (
                <div className="text-center text-indigo-600 font-medium">
                  <CheckIcon className="h-5 w-5 inline mr-1" />
                  Seleccionado
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={handleContinuar}
            disabled={!planSeleccionado}
            className={`px-6 py-3 rounded-md text-white font-medium ${
              planSeleccionado 
                ? 'bg-indigo-600 hover:bg-indigo-700' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Continuar al pago →
          </button>
        </div>
      </main>
    </div>
  );
};

export default PlanesEmpresa;