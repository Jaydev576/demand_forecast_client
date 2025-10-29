import { useState, useEffect } from 'react';
import { TrendingUp, Filter, Calendar, Package, MapPin, DollarSign, Percent, Sparkles, IndianRupee } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useToast } from '../contexts/ToastContext';
import apiFetch from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
interface Dataset {
  id: string;
  name: string;
  created_at: string;
}
const COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
export function Forecast() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [forecastDays, setForecastDays] = useState<number>(30);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [forecastResult, setForecastResult] = useState<any>(null);
  const [filters, setFilters] = useState({
    city: '',
    product: '',
    category: '',
    price: '',
    discount: '',
  });
  const [cities, setCities] = useState<string[]>([]);
  const [products, setProducts] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      const response = await fetch('http://localhost:8000/feature/features', {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to fetch features: ${response.status} ${text}`);
      }

      const data = await response.json();
      
      setCities(Array.isArray(data.city) ? data.city : []);
      setProducts(Array.isArray(data.product) ? data.product : []);
      setCategories(Array.isArray(data.category) ? data.category : []);
    } catch(e) {
      console.log(e);
    }
  }
  // const fetchDatasets = async () => {
    // try {
    //   const { data, error } = await apiFetch("orrigin/datasets");
    //   if (error) throw error;
    //   setDatasets(data || []);
    // } catch (error: any) {
    //   showToast(error.message || 'Failed to fetch datasets', 'error');
    // }
  // };
  // const generateMockForecast = () => {
  //   const days = forecastDays;
  //   const data = [];
  //   const startDate = new Date();
  //   for (let i = 0; i < days; i++) {
  //     const date = new Date(startDate);
  //     date.setDate(date.getDate() + i);
  //     const baseValue = 1000 + Math.random() * 500;
  //     const trend = i * 10;
  //     const seasonal = Math.sin(i / 7) * 200;
  //     data.push({
  //       date: date.toISOString().split('T')[0],
  //       predicted: Math.round(baseValue + trend + seasonal),
  //       confidence_low: Math.round(baseValue + trend + seasonal - 150),
  //       confidence_high: Math.round(baseValue + trend + seasonal + 150),
  //       historical: i < days / 2 ? Math.round(baseValue + trend + seasonal + (Math.random() - 0.5) * 100) : null,
  //     });
  //   }
  //   return data;
  // };
  // const generateCategoryData = () => {
  //   return [
  //     { name: 'Electronics', value: 35, growth: '+12%' },
  //     { name: 'Clothing', value: 25, growth: '+8%' },
  //     { name: 'Food', value: 20, growth: '+15%' },
  //     { name: 'Home', value: 15, growth: '+5%' },
  //     { name: 'Other', value: 5, growth: '+3%' },
  //   ];
  // };
  // const generateCityData = () => {
  //   return [
  //     { city: 'Surat', sales: 12500, forecast: 14200 },
  //     { city: 'Vadodara', sales: 10800, forecast: 12100 },
  //     { city: 'Gandhinagar', sales: 9200, forecast: 10500 },
  //     { city: 'Jamnagar', sales: 8500, forecast: 9800 },
  //     { city: 'Ahemdabad', sales: 7300, forecast: 8600 },
  //   ];
  // };
  const handleForecast = async () => {
    setLoading(true);
    setShowResults(false);
    setForecastResult(null);
    try {
      const payload = {
        product_category: filters.category,
        product: filters.product,
        city: filters.city,
        num_days: forecastDays,
        price: filters.price ? parseFloat(filters.price) : undefined,
        discount: filters.discount ? parseFloat(filters.discount) : undefined,
      };
      console.log("payload: ", payload)
      const response = await fetch('http://localhost:8000/train/predict',
        { 
          method: "POST", 
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('auth_token')}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        })
      
      const res = await response.json();
      console.log(res);
      if (!response.ok) {
        showToast(res.detail || 'Failed to generate forecast', 'error');
        setLoading(false);
        return;
      }
      
      setForecastResult(res);
      showToast('Forecast generated successfully!', 'success');
      setShowResults(true);
    } catch (err: any) {
      showToast(err.message || 'Failed to generate forecast', 'error');
    } finally {
      setLoading(false);
    }
  };
    const overviewStats = forecastResult ? [
      { label: 'Projected Total Sales', value: forecastResult.predictions.reduce((acc: number, p: any) => acc + p.predicted_quantity_sold, 0), change: '', color: 'from-blue-500 to-cyan-500' },
      { label: 'Average Daily Sales', value: (forecastResult.predictions.reduce((acc: number, p: any) => acc + p.predicted_quantity_sold, 0) / forecastResult.predictions.length).toFixed(2), change: '', color: 'from-cyan-500 to-teal-500' },
      { label: 'Forecast Confidence', value: 'N/A', change: '', color: 'from-teal-500 to-emerald-500' },
    ] : [];
  
    const chartData = forecastResult ? forecastResult.predictions.map((p: any) => ({ date: p.date.split('T')[0], predicted: p.predicted_quantity_sold })) : [];
  
  
    return (
      <div className="min-h-screen bg-gray-950 overflow-hidden relative">
        {/* Background Animation: Data Constellation */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-cyan-500/5 to-teal-500/10 pointer-events-none"></div>
        <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none">
          {/* Nodes */}
          <circle cx="10%" cy="20%" r="6" fill="#3B82F6" className="animate-pulseConstellation" style={{ animationDelay: '0s' }} />
          <circle cx="80%" cy="30%" r="5" fill="#06B6D4" className="animate-pulseConstellation" style={{ animationDelay: '0.5s' }} />
          <circle cx="50%" cy="60%" r="7" fill="#14B8A6" className="animate-pulseConstellation" style={{ animationDelay: '1s' }} />
          <circle cx="20%" cy="70%" r="5" fill="#3B82F6" className="animate-pulseConstellation" style={{ animationDelay: '1.5s' }} />
          <circle cx="70%" cy="10%" r="6" fill="#06B6D4" className="animate-pulseConstellation" style={{ animationDelay: '2s' }} />
          {/* Connections */}
          <path
            d="M10% 20% L80% 30%"
            fill="none"
            stroke="#3B82F6"
            strokeWidth="1"
            strokeOpacity="0.3"
            className="animate-connectConstellation"
            style={{ animationDelay: '0.2s' }}
          />
          <path
            d="M50% 60% L20% 70%"
            fill="none"
            stroke="#06B6D4"
            strokeWidth="1"
            strokeOpacity="0.3"
            className="animate-connectConstellation"
            style={{ animationDelay: '0.7s' }}
          />
          <path
            d="M80% 30% L70% 10%"
            fill="none"
            stroke="#14B8A6"
            strokeWidth="1"
            strokeOpacity="0.3"
            className="animate-connectConstellation"
            style={{ animationDelay: '1.2s' }}
          />
          {/* Glow Effects */}
          <circle cx="10%" cy="20%" r="10" fill="url(#glowGradient)" className="animate-glowEffect" />
          <circle cx="80%" cy="30%" r="8" fill="url(#glowGradient)" className="animate-glowEffect" style={{ animationDelay: '0.5s' }} />
          <circle cx="50%" cy="60%" r="9" fill="url(#glowGradient)" className="animate-glowEffect" style={{ animationDelay: '1s' }} />
          <defs>
            <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" style={{ stopColor: '#3B82F6', stopOpacity: 0.2 }} />
              <stop offset="100%" style={{ stopColor: '#3B82F6', stopOpacity: 0 }} />
            </radialGradient>
          </defs>
        </svg>
  
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* 1. Hero Section */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Generate Your Demand Forecast</h1>
            <p className="text-gray-200 text-lg max-w-2xl mx-auto">Predict sales with precision using AI-powered analytics.</p>
          </div>
  
          {/* 2. Forecast Parameters */}
          <div className="bg-gray-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-8 mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Filter className="w-5 h-5 text-blue-400 animate-pulseConstellation" />
              <h2 className="text-xl font-semibold text-white">Set Up Your Forecast</h2>
            </div>
  
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Forecast Duration</label>
                <div className="grid grid-cols-5 gap-2">
                  {[30, 60, 90, ].map((days) => (
                    <button
                      key={days}
                      onClick={() => setForecastDays(days)}
                      className={`px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                        forecastDays === days
                          ? 'bg-blue-500/20 text-blue-400 border-2 border-blue-500/50'
                          : 'bg-gray-950/50 text-gray-200 border border-white/10'
                      }`}
                      aria-label={`Forecast for ${days} days`}
                    >
                      {days}d
                    </button>
                  ))}
                </div>
              </div>
            </div>
  
            <div className="border-t border-white/5 pt-6 mb-6">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-gray-200 hover:text-blue-400 transition-all"
                aria-label={showFilters ? 'Hide filters' : 'Show filters'}
              >
                <Filter className="w-4 h-4 animate-pulseConstellation" />
                <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
              </button>
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 animate-growIn">
                  <div>
                    <label className="flex text-sm font-medium text-gray-200 mb-2 items-center gap-2">
                      <MapPin className="w-4 h-4 animate-pulseConstellation" />
                      City
                    </label>
                    <select
                      value={filters.city}
                      onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-950/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      aria-label="Filter by city"
                    >
                      <option value="">All Cities</option>
                      {cities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
  
                  <div>
                    <label className="flex text-sm font-medium text-gray-200 mb-2 items-center gap-2">
                      <Filter className="w-4 h-4 animate-pulseConstellation" />
                      Category
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-950/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      aria-label="Filter by category"
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                      
                  <div>
                    <label className="flex text-sm font-medium text-gray-200 mb-2 items-center gap-2">
                      <Package className="w-4 h-4 animate-pulseConstellation" />
                      Product
                    </label>
                    <select
                      value={filters.product}
                      onChange={(e) => setFilters({ ...filters, product: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-950/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      aria-label="Filter by product"
                    >
                      <option value="">All Products</option>
                      {products.map((product) => (
                        <option key={product} value={product}>
                          {product}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="flex text-sm font-medium text-gray-200 mb-2 items-center gap-2">
                      <IndianRupee className="w-4 h-4 animate-pulseConstellation" />
                      Price Range
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={filters.price}
                        onChange={(e) => setFilters({ ...filters, price: e.target.value })}
                        placeholder="Price (in rupees)"
                        className="w-full px-3 py-2.5 bg-gray-950/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        aria-label="Price filter"
                      />
                    </div>
                  </div>
  
                  <div>
                    <label className="flex text-sm font-medium text-gray-200 mb-2 items-center gap-2">
                      <Percent className="w-4 h-4 animate-pulseConstellation" />
                      Discount
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={filters.discount}
                        onChange={(e) => setFilters({ ...filters, discount: e.target.value })}
                        placeholder="Discount (in %)"
                        className="w-full px-3 py-2.5 bg-gray-950/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        aria-label="Discount filter"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
  
            <button
              onClick={handleForecast}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 relative overflow-hidden"
              aria-label="Generate forecast"
            >
              {loading && (
                <div className="absolute inset-0 bg-blue-500/20 animate-processWave pointer-events-none"></div>
              )}
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing Forecast...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 animate-pulseConstellation" />
                  Run Forecast
                </>
              )}
            </button>
          </div>
  
          {showResults && forecastResult && (
            <div className="space-y-12">
              {/* Results: Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {overviewStats.map((stat, index) => (
                  <div key={index} className="relative group animate-growIn" style={{ animationDelay: `${index * 0.2}s` }}>
                    <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-10 rounded-2xl blur-xl animate-chartPulse`}></div>
                    <div className="relative bg-gray-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6 transition-all">
                      <div className="text-gray-200 text-sm mb-2">{stat.label}</div>
                      <div className="flex items-end justify-between">
                        <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                          {stat.value}
                        </div>
                        <div className="text-emerald-400 text-sm font-medium">{stat.change}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
  
              {/* Results: Demand Forecast Chart */}
              <div className="bg-gray-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-8 relative overflow-hidden animate-growIn">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 animate-chartPulse pointer-events-none"></div>
                <h3 className="text-xl font-semibold text-white mb-6">Sales Forecast Trend for {forecastResult.product} in {forecastResult.city}</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="date" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                    <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        color: '#fff',
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="predicted"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fill="url(#colorPredicted)"
                      name="Predicted Sales"
                      className="animate-growIn"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
  
              {/* Results: Predictions Table */}
              <div className="bg-gray-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-8 relative overflow-hidden animate-growIn">
                  <h3 className="text-xl font-semibold text-white mb-6">Predictions</h3>
                  <div className="overflow-auto max-h-96">
                      <table className="w-full text-sm text-left text-gray-400">
                          <thead className="text-xs text-gray-300 uppercase bg-gray-800/50">
                              <tr>
                                  <th scope="col" className="px-6 py-3">Date</th>
                                  <th scope="col" className="px-6 py-3">Predicted Quantity Sold</th>
                              </tr>
                          </thead>
                          <tbody>
                              {forecastResult.predictions.map((p: any, index: number) => (
                                  <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-800/50">
                                      <td className="px-6 py-4">{p.date.split('T')[0]}</td>
                                      <td className="px-6 py-4">{p.predicted_quantity_sold}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
            </div>
          )}
        </div>
  
        <style>{`
          @keyframes pulseConstellation {
            0%, 100% { transform: scale(1); opacity: 0.6; }
            50% { transform: scale(1.4); opacity: 1; }
          }
          @keyframes connectConstellation {
            0%, 100% { strokeOpacity: 0.2; }
            50% { strokeOpacity: 0.5; }
          }
          @keyframes glowEffect {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.5; }
          }
          @keyframes chartPulse {
            0%, 100% { opacity: 0.1; }
            50% { opacity: 0.2; }
          }
          @keyframes processWave {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          @keyframes growIn {
            0% { transform: scale(0.95); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
          .animate-pulseConstellation {
            animation: pulseConstellation 4s ease-in-out infinite;
          }
          .animate-connectConstellation {
            animation: connectConstellation 5s ease-in-out infinite;
          }
          .animate-glowEffect {
            animation: glowEffect 3s ease-in-out infinite;
          }
          .animate-chartPulse {
            animation: chartPulse 4s ease-in-out infinite;
          }
          .animate-processWave {
            animation: processWave 2s linear infinite;
          }
          .animate-growIn {
            animation: growIn 0.8s ease-out forwards;
          }
        `}</style>
      </div>
    );
  }
  