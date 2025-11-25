import { useState, useEffect } from 'react';
import { TrendingUp, Filter, Calendar, Package, MapPin, DollarSign, Percent, Sparkles, IndianRupee } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { Dialog } from '../components/Dialog';
import { Card } from '../components/Card';
import { ForecastDetails } from '../components/ForecastDetails'; // Import ForecastDetails

// Define TypeScript Interfaces
interface Prediction {
  date: string;
  predicted_quantity_sold: number;
}

interface ForecastData {
  city: string;
  product: string;
  product_category: string;
  predictions: Prediction[];
  price?: number;
  discount?: number;
}

interface FilterState {
  city: string;
  product: string;
  category: string;
  price: string;
  discount: string;
}

interface ProductCategoryMap {
  [key: string]: string;
}

// const COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
export function Forecast() {
  // const { user } = useAuth();
  const { showToast } = useToast();
  const [forecastDays, setForecastDays] = useState<number>(30);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  // const [showFilters, setShowFilters] = useState(false);
  const [forecastResult, setForecastResult] = useState<ForecastData | null>(null);
  const [recentForecasts, setRecentForecasts] = useState<ForecastData[]>([]);
  const [selectedForecast, setSelectedForecast] = useState<ForecastData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    city: '',
    product: '',
    category: '',
    price: '',
    discount: '',
  });
  const [cities, setCities] = useState<string[]>([]);
  const [products, setProducts] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [productCategoryMap, setProductCategoryMap] = useState<ProductCategoryMap>({});
  const [filteredProducts, setFilteredProducts] = useState<string[]>([]);
  
  useEffect(() => {
    fetchFeatures();
    const storedRecentForecasts = localStorage.getItem('recentForecasts');
    if (storedRecentForecasts) {
      setRecentForecasts(JSON.parse(storedRecentForecasts));
    }

    const storedForecast = localStorage.getItem('lastForecastResult');
    if (storedForecast) {
      // console.log(storedForecast)
      try {
        const parsedForecast: ForecastData = JSON.parse(storedForecast);
        setForecastResult(parsedForecast);
        setFilters({
          city: parsedForecast.city || '',
          product: parsedForecast.product || '',
          category: parsedForecast.product_category || '',
          price: parsedForecast.price ? parsedForecast.price.toString() : '',
          discount: parsedForecast.discount ? parsedForecast.discount.toString() : '',
        });
        setShowResults(true);
      } catch (e) {
        console.error("Failed to parse stored forecast from localStorage", e);
        localStorage.removeItem('lastForecastResult');
      }
    }
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
      if (typeof data.product === 'object' && data.product !== null) {
        const productMap: ProductCategoryMap = data.product;
        const allProducts = Object.keys(productMap);
        const uniqueCategories = [...new Set(Object.values(productMap))] as string[];
        
        setProductCategoryMap(productMap);
        setProducts(allProducts);
        setFilteredProducts(allProducts);
        setCategories(uniqueCategories);
        setFilters((prev) => ({
          ...prev,
          category: uniqueCategories.length > 0 ? uniqueCategories[0] : '',
          product: allProducts.length > 0 ? allProducts[0] : '',
        }));
      } else {
        setProducts([]);
        setFilteredProducts([]);
        setCategories([]);
      }
    } catch(e) {
      console.log(e);
    }
  }

  const generateCacheKey = (payload: any) => {
    return JSON.stringify(payload);
  };

  const handleForecast = async () => {
    if (!filters.city || !filters.product || !filters.category) {
      showToast('Please select a City, Category, and Product to generate a forecast.', 'error');
      return;
    }

    setLoading(true);
    setShowResults(false);
    setForecastResult(null);
    try {
      const payload = {
        product_category: filters.category,
        product: filters.product,
        city: filters.city,
        num_days: forecastDays,
        // price: filters.price ? parseFloat(filters.price) : undefined,
        // discount: filters.discount ? parseFloat(filters.discount) : undefined,
      };

      const cacheKey = generateCacheKey(payload);
      const cachedResult = localStorage.getItem(cacheKey);

      if (cachedResult) {
        try {
          const parsedResult: ForecastData = JSON.parse(cachedResult);
          setForecastResult(parsedResult);
          setShowResults(true);
          showToast('Forecast loaded from cache!', 'info');
          setLoading(false);
          return;
        } catch (e) {
          console.error("Failed to parse cached forecast", e);
          localStorage.removeItem(cacheKey); // Clear corrupted cache
        }
      }

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
      // console.log(res);
      if (!response.ok) {
        // Handle FastAPI validation errors, which come in a 'detail' array
        let errorMessage = 'Failed to generate forecast';
        if (res.detail && Array.isArray(res.detail)) {
          errorMessage = res.detail.map((err: any) => err.msg).join(', ');
        } else if (res.detail) {
          errorMessage = res.detail;
        }
        // showToast(errorMessage, 'error');
        setLoading(false);
        return;
      }
      // console.log(res)
      setForecastResult(res);
      setShowResults(true);
      localStorage.setItem(cacheKey, JSON.stringify(res));
      localStorage.setItem('lastForecastResult', JSON.stringify(res));

      const updatedRecentForecasts = [res, ...recentForecasts.slice(0, 5)];
      setRecentForecasts(updatedRecentForecasts);
      localStorage.setItem('recentForecasts', JSON.stringify(updatedRecentForecasts));

      showToast('Forecast generated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to generate forecast', 'error');
    } finally {
      setLoading(false);
    }
  };
  const handleCategoryChange = (category: string) => {
    setFilters({ ...filters, category: category, product: '' });
    if (category === '') {
      setFilteredProducts(products);
    } else {
      const newFilteredProducts = Object.keys(productCategoryMap).filter(
        (product) => productCategoryMap[product] === category
      );
      setFilteredProducts(newFilteredProducts);
    }
  };

  const handleViewForecast = (forecast: ForecastData) => {
    setSelectedForecast(forecast);
    setIsDialogOpen(true);
  };

  const overviewStats = (result: any) => result ? [
    { label: 'Projected Total Sales', value: result.predictions.reduce((acc: number, p: any) => acc + p.predicted_quantity_sold, 0), change: '', color: 'from-blue-500 to-cyan-500' },
    { label: 'Average Daily Sales', value: (result.predictions.reduce((acc: number, p: any) => acc + p.predicted_quantity_sold, 0) / result.predictions.length).toFixed(2), change: '', color: 'from-cyan-500 to-teal-500' },
  ] : [];

  const chartData = (result: any) => result ? result.predictions.map((p: any) => ({ date: p.date.split('T')[0], predicted: p.predicted_quantity_sold })) : [];
  
  
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
  
            <div className="mb-6">
              {/* <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-gray-200 hover:text-blue-400 transition-all"
                aria-label={showFilters ? 'Hide filters' : 'Show filters'}
              >
                <Filter className="w-4 h-4 animate-pulseConstellation" />
                <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
              </button> */}
              {(
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
                      onChange={(e) => handleCategoryChange(e.target.value)}
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
                      {filteredProducts.map((product) => (
                        <option key={product} value={product}>
                          {product}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* <div>
                    <label className="flex text-sm font-medium text-gray-200 mb-2 items-center gap-2">
                      <IndianRupee className="w-4 h-4 animate-pulseConstellation" />
                      Target Price
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
                  </div> */}
  
                  {/* <div>
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
                  </div> */}
                  
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {overviewStats(forecastResult).map((stat, index) => (
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
                  <AreaChart data={chartData(forecastResult)}>
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
          {recentForecasts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-white mb-6">Recent Forecasts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentForecasts.map((forecast, index) => (
                  <Card
                    key={index}
                    title={`${forecast.product} in ${forecast.city}`}
                    description={`Forecast for ${forecast.predictions.length} days`}
                    onView={() => handleViewForecast(forecast)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        {selectedForecast && (
          <div className="space-y-12">
            {/* Results: Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {overviewStats(selectedForecast).map((stat, index) => (
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
              <h3 className="text-xl font-semibold text-white mb-6">Sales Forecast Trend for {selectedForecast.product} in {selectedForecast.city}</h3>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chartData(selectedForecast)}>
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
                            {selectedForecast.predictions.map((p: any, index: number) => (
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
      </Dialog>
  
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
  