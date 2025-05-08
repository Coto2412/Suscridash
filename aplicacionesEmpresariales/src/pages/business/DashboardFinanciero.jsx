import { useState } from 'react';
import Navbar from '../../components/Navbar';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Link } from 'react-router-dom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const DashboardFinanciero = () => {
  const [timeRange, setTimeRange] = useState('mensual');

  // Datos financieros
  const ingresosData = {
    mensual: [12000, 19000, 15000, 18000, 22000, 25000, 21000],
    trimestral: [45000, 52000, 68000],
    anual: [250000, 280000, 310000]
  };

  const gastosData = {
    mensual: [5000, 8000, 3000, 2000],
    trimestral: [15000, 24000, 9000, 6000],
    anual: [60000, 96000, 36000, 24000]
  };

  // Métricas de suscripciones
  const metricasSuscripciones = {
    total: 1245,
    activas: 892,
    canceladas: 353,
    crecimiento: 12.5,
    planes: [
      { nombre: 'Básico', cantidad: 512, color: 'rgba(79, 70, 229, 0.7)' },
      { nombre: 'Premium', cantidad: 380, color: 'rgba(99, 102, 241, 0.7)' },
      { nombre: 'Empresarial', cantidad: 353, color: 'rgba(129, 140, 248, 0.7)' }
    ],
    tendencia: [65, 59, 80, 81, 56, 55, 90]
  };

  // Configuración de gráficos
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.raw.toLocaleString()} CLP`;
          }
        }
      }
    },
    maintainAspectRatio: false
  };

  // Datos para gráficos
  const getChartData = () => ({
    ingresos: {
      labels: timeRange === 'mensual' 
        ? ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul'] 
        : timeRange === 'trimestral' 
          ? ['Q1', 'Q2', 'Q3'] 
          : ['2021', '2022', '2023'],
      datasets: [{
        label: 'Ingresos',
        data: ingresosData[timeRange],
        backgroundColor: 'rgba(79, 70, 229, 0.7)',
        borderColor: 'rgba(79, 70, 229, 1)',
        borderWidth: 1
      }]
    },
    gastos: {
      labels: ['Suscripciones', 'Nóminas', 'Servicios', 'Otros'],
      datasets: [{
        data: gastosData[timeRange],
        backgroundColor: [
          'rgba(79, 70, 229, 0.7)',
          'rgba(99, 102, 241, 0.7)',
          'rgba(129, 140, 248, 0.7)',
          'rgba(165, 180, 252, 0.7)'
        ],
        borderColor: [
          'rgba(79, 70, 229, 1)',
          'rgba(99, 102, 241, 1)',
          'rgba(129, 140, 248, 1)',
          'rgba(165, 180, 252, 1)'
        ],
        borderWidth: 1
      }]
    },
    tendencia: {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul'],
      datasets: [{
        label: 'Crecimiento',
        data: metricasSuscripciones.tendencia,
        fill: false,
        backgroundColor: 'rgba(79, 70, 229, 1)',
        borderColor: 'rgba(79, 70, 229, 0.7)',
        tension: 0.4
      }]
    },
    planes: {
      labels: metricasSuscripciones.planes.map(p => p.nombre),
      datasets: [{
        data: metricasSuscripciones.planes.map(p => p.cantidad),
        backgroundColor: metricasSuscripciones.planes.map(p => p.color)
      }]
    }
  });

  const chartData = getChartData();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">Dashboard Financiero</h1>
          <div className="flex space-x-2">
            {['mensual', 'trimestral', 'anual'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  timeRange === range 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-indigo-50'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Resumen financiero */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { 
              title: 'Ingresos', 
              value: ingresosData[timeRange].reduce((a, b) => a + b, 0), 
              color: 'indigo-600' 
            },
            { 
              title: 'Gastos', 
              value: gastosData[timeRange].reduce((a, b) => a + b, 0), 
              color: 'red-500' 
            },
            { 
              title: 'Beneficio Neto', 
              value: ingresosData[timeRange].reduce((a, b) => a + b, 0) - gastosData[timeRange].reduce((a, b) => a + b, 0), 
              color: 'green-500' 
            },
            { 
              title: 'Margen', 
              value: ((ingresosData[timeRange].reduce((a, b) => a + b, 0) - gastosData[timeRange].reduce((a, b) => a + b, 0)) / 
                     ingresosData[timeRange].reduce((a, b) => a + b, 0) * 100), // Added closing parenthesis here and a comma
              suffix: '%',
              color: 'blue-500' 
            }
          ].map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-lg font-medium text-gray-500">{item.title}</h3>
              <p className={`text-3xl font-bold text-${item.color} mt-2`}>
                {item.suffix ? item.value.toFixed(1) : item.value.toLocaleString()}{item.suffix || ''}
              </p>
            </div>
          ))}
        </div>

        {/* Métricas de suscripciones */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Suscripciones Totales', value: metricasSuscripciones.total, color: 'indigo-600' },
            { title: 'Activas', value: metricasSuscripciones.activas, color: 'green-500' },
            { title: 'Canceladas', value: metricasSuscripciones.canceladas, color: 'red-500' },
            { title: 'Crecimiento', value: metricasSuscripciones.crecimiento, suffix: '%', color: 'blue-500' }
          ].map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-lg font-medium text-gray-500">{item.title}</h3>
              <p className={`text-3xl font-bold text-${item.color} mt-2`}>
                {item.value.toLocaleString()}{item.suffix || ''}
              </p>
              {index === 3 && (
                <p className={`text-sm mt-1 ${
                  item.value > 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {item.value > 0 ? '↑' : '↓'} {Math.abs(item.value)}% vs período anterior
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Gráficos principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Ingresos ({timeRange})</h2>
              <Link to="/business/suscriptores" className="text-sm text-indigo-600 hover:text-indigo-800">
                Ver detalles →
              </Link>
            </div>
            <div className="h-80">
              <Bar options={chartOptions} data={chartData.ingresos} />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Distribución de Planes</h2>
            <div className="h-80">
              <Pie options={chartOptions} data={chartData.planes} />
            </div>
          </div>
        </div>

        {/* Gráficos secundarios */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Distribución de Gastos</h2>
            <div className="h-80">
              <Pie options={chartOptions} data={chartData.gastos} />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Tendencia de Crecimiento</h2>
              <span className="text-sm text-green-500">
                {metricasSuscripciones.crecimiento > 0 ? '↑' : '↓'} {Math.abs(metricasSuscripciones.crecimiento)}%
              </span>
            </div>
            <div className="h-80">
              <Line options={chartOptions} data={chartData.tendencia} />
            </div>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/business/planes/nuevo"
              className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-center"
            >
              <div className="text-indigo-600 font-medium">Crear nuevo plan</div>
            </Link>
            <Link
              to="/business/suscriptores"
              className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-center"
            >
              <div className="text-indigo-600 font-medium">Ver suscriptores</div>
            </Link>
            <Link
              to="/business/configuracion"
              className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-center"
            >
              <div className="text-indigo-600 font-medium">Configuración</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardFinanciero;