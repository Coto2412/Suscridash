// src/pages/Home.jsx
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar incluido */}
      <Navbar />
      
      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16 pt-8">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Gestión de Suscripciones y Análisis Financiero en una Sola Plataforma
          </h2>
          <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-500">
            SuscriDash combina la gestión de suscripciones empresariales con un dashboard de análisis financiero avanzado.
          </p>
        </div>

        {/* Features Section */}
        <div className="mt-24">
          <div className="text-center">
            <h3 className="text-3xl font-extrabold text-gray-900">¿Qué ofrece SuscriDash?</h3>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500">
              Una solución integral para optimizar los ingresos recurrentes de tu empresa.
            </p>
          </div>

          <div className="mt-16 grid gap-16 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-12">
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
              <h4 className="text-xl font-semibold text-indigo-600">Gestión de Suscripciones</h4>
              <p className="mt-4 text-gray-500">
                Ofrece tus servicios bajo modelos de suscripción (mensual/anual) con herramientas integradas para su administración.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
              <h4 className="text-xl font-semibold text-indigo-600">Dashboard Financiero</h4>
              <p className="mt-4 text-gray-500">
                Visualiza, analiza y optimiza el bienestar financiero de tu empresa con datos en tiempo real.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
              <h4 className="text-xl font-semibold text-indigo-600">Integración Total</h4>
              <p className="mt-4 text-gray-500">
                Elimina la fragmentación de datos al centralizar suscripciones y finanzas en una sola plataforma.
              </p>
            </div>
          </div>
        </div>

        {/* Problem/Solution Section */}
        <div className="mt-24 bg-white p-8 rounded-lg shadow-sm border border-gray-100">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8">
            <div>
              <h3 className="text-2xl font-extrabold text-gray-900">El problema</h3>
              <p className="mt-4 text-lg text-gray-500">
                Muchas empresas usan herramientas separadas para suscripciones (como Stripe o PayPal) y análisis financiero (como Excel o QuickBooks), lo que genera:
              </p>
              <ul className="mt-4 space-y-3">
                <li className="flex items-start">
                  <span className="text-indigo-600">•</span>
                  <span className="ml-2 text-gray-500">Fragmentación de datos y procesos tediosos</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600">•</span>
                  <span className="ml-2 text-gray-500">Falta de una visión centralizada del impacto financiero</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600">•</span>
                  <span className="ml-2 text-gray-500">Lenta toma de decisiones por falta de automatización</span>
                </li>
              </ul>
            </div>
            <div className="mt-12 lg:mt-0">
              <h3 className="text-2xl font-extrabold text-gray-900">Nuestra solución</h3>
              <p className="mt-4 text-lg text-gray-500">
                SuscriDash centraliza dos necesidades críticas (ventas + finanzas) en una sola plataforma:
              </p>
              <ul className="mt-4 space-y-3">
                <li className="flex items-start">
                  <span className="text-indigo-600">•</span>
                  <span className="ml-2 text-gray-500">Optimiza ingresos recurrentes con modelos de suscripción</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600">•</span>
                  <span className="ml-2 text-gray-500">Proporciona transparencia financiera con insights accionables</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600">•</span>
                  <span className="ml-2 text-gray-500">Reduce herramientas externas y costos asociados</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white mt-24 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-base text-gray-400">
              &copy; {new Date().getFullYear()} SuscriDash. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;