import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';

// Datos simulados de empresas
const empresas = [
  {
    id: 1,
    nombre: 'Tech Solutions',
    logo: '🖥️',
    descripcion: 'Soluciones tecnológicas para tu negocio',
    categorias: ['Software', 'Productividad'],
    planes: 3
  },
  {
    id: 2,
    nombre: 'Digital Marketing',
    logo: '📈',
    descripcion: 'Expertos en marketing digital',
    categorias: ['Marketing', 'Redes Sociales'],
    planes: 2
  },
  {
    id: 3,
    nombre: 'Cloud Services',
    logo: '☁️',
    descripcion: 'Almacenamiento y servicios en la nube',
    categorias: ['Almacenamiento', 'Infraestructura'],
    planes: 4
  }
];

const Empresas = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Suscripciones Disponibles</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {empresas.map(empresa => (
            <Link 
              key={empresa.id}
              to={`/suscripciones/${empresa.id}`}
              className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="text-4xl mb-4">{empresa.logo}</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">{empresa.nombre}</h2>
                <p className="text-gray-600 mb-4">{empresa.descripcion}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {empresa.categorias.map((categoria, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                      {categoria}
                    </span>
                  ))}
                </div>
                
                <div className="text-sm text-indigo-600">
                  {empresa.planes} planes disponibles →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Empresas;