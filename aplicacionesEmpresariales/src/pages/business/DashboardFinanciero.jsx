import { useState, useEffect } from 'react';
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
import axios from 'axios';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    ingresos: { labels: [], data: [] },
    gastos: { labels: [], data: [] },
    resumen: { ingresos: 0, gastos: 0, beneficio: 0, margen: 0 },
    suscripciones: {
      total: 0,
      activas: 0,
      canceladas: 0,
      crecimiento: 0,
      planes: [],
      tendencia: []
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token');
        
        const response = await axios.get(`http://localhost:5000/api/business/financial-stats?range=${timeRange}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching financial data:', err);
        setError('Error al cargar los datos financieros');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [timeRange]);

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
      labels: data.ingresos.labels,
      datasets: [{
        label: 'Ingresos',
        data: data.ingresos.data,
        backgroundColor: 'rgba(79, 70, 229, 0.7)',
        borderColor: 'rgba(79, 70, 229, 1)',
        borderWidth: 1
      }]
    },
    gastos: {
      labels: data.gastos.labels,
      datasets: [{
        data: data.gastos.data,
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
        data: data.suscripciones.tendencia,
        fill: false,
        backgroundColor: 'rgba(79, 70, 229, 1)',
        borderColor: 'rgba(79, 70, 229, 0.7)',
        tension: 0.4
      }]
    },
    planes: {
      labels: data.suscripciones.planes.map(p => p.nombre),
      datasets: [{
        data: data.suscripciones.planes.map(p => p.cantidad),
        backgroundColor: data.suscripciones.planes.map(p => p.color)
      }]
    }
  });

  const chartData = getChartData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="text-xl font-semibold">Cargando datos financieros...</div>
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
              value: data.resumen.ingresos, 
              color: 'indigo-600' 
            },
            { 
              title: 'Gastos', 
              value: data.resumen.gastos, 
              color: 'red-500' 
            },
            { 
              title: 'Beneficio Neto', 
              value: data.resumen.beneficio, 
              color: 'green-500' 
            },
            { 
              title: 'Margen', 
              value: data.resumen.margen,
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
            { title: 'Suscripciones Totales', value: data.suscripciones.total, color: 'indigo-600' },
            { title: 'Activas', value: data.suscripciones.activas, color: 'green-500' },
            { title: 'Canceladas', value: data.suscripciones.canceladas, color: 'red-500' },
            { title: 'Crecimiento', value: data.suscripciones.crecimiento, suffix: '%', color: 'blue-500' }
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
                {data.suscripciones.crecimiento > 0 ? '↑' : '↓'} {Math.abs(data.suscripciones.crecimiento)}%
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
              to="/business/suscriptores"
              className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-center"
            >
              <div className="text-indigo-600 font-medium">Ver suscriptores</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardFinanciero;