import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Upload, Clock, CheckCircle, XCircle, TrendingUp, Calendar, Filter, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import apiFetch from '../lib/api';

interface Forecast {
  id: string;
  dataset_id: string;
  forecast_days: number;
  status: string;
  created_at: string;
  completed_at: string | null;
  results: string | null;
  datasets: {
    name: string;
  };
}

export function Dashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  // const navigate = useNavigate();
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    processing: 0,
    failed: 0,
  });

  useEffect(() => {
    fetchForecasts();
  }, []);

  const fetchForecasts = async () => {
    try {
      const { data, status } = await apiFetch('user/models/status', {
        method: 'GET',
      });
      if (status !== 200) {
        throw new Error('Failed to fetch forecasts');
      }

      // const data = await response.json();
      console.log(data)
      setForecasts(data || []);

      const completed = data?.filter((f: Forecast) => f.status === 'completed').length || 0;
      const processing = data?.filter((f: Forecast) => f.status === 'processing').length || 0;
      const failed = data?.filter((f: Forecast) => f.status === 'failed').length || 0;

      setStats({
        total: data?.length || 0,
        completed,
        processing,
        failed,
      });
    } catch (error: any) {
      showToast(error.details || 'Failed to fetch forecasts', 'error');
    } finally {
      setLoading(false);
    }
  };

  // const handleLogout = async () => {
  //   await signOut();
  //   navigate('/login');
  // };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-blue-400 animate-pulse" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-rose-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'processing':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'failed':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-gray-400">Overview of your forecasting activity</p>
          </div>
          
          {/* ##### modify this to add user icon with name ##### */}
          <div className='flex items-center bg-gray-900/50 backdrop-blur-xl border border-white/5 rounded-xl px-4 py-2'>
            <User className="w-6 h-6 text-gray-400 inline-block mr-2" />
            <span className="text-gray-400">{user?.username}</span>
          </div>
          {/* <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-gray-300 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button> */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Forecasts', value: stats.total, icon: BarChart3, color: 'from-blue-500 to-cyan-500' },
            { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'from-emerald-500 to-teal-500' },
            { label: 'Processing', value: stats.processing, icon: Clock, color: 'from-blue-500 to-violet-500' },
            { label: 'Failed', value: stats.failed, icon: XCircle, color: 'from-rose-500 to-pink-500' },
          ].map((stat, index) => (
            <div
              key={index}
              className="relative group animate-in fade-in slide-in-from-bottom-4 duration-700"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-10 rounded-2xl blur-xl group-hover:opacity-20 transition-opacity`}></div>
              <div className="relative bg-gray-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} opacity-10 flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.value}
                  </div>
                </div>
                <div className="text-gray-400 text-sm font-medium">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <Link
            to="/upload"
            className="group relative overflow-hidden bg-gray-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <Upload className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Upload Data</h3>
              <p className="text-gray-400 text-sm">Import your historical sales data</p>
            </div>
          </Link>

          <Link
            to="/forecast"
            className="group relative overflow-hidden bg-gray-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <TrendingUp className="w-8 h-8 text-cyan-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">New Forecast</h3>
              <p className="text-gray-400 text-sm">Generate demand predictions</p>
            </div>
          </Link>

          <Link
            to="/insights"
            className="group relative overflow-hidden bg-gray-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all animate-in fade-in slide-in-from-bottom-4 duration-700 delay-600"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <BarChart3 className="w-8 h-8 text-teal-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Business Insights</h3>
              <p className="text-gray-400 text-sm">Analyze your business trends</p>
            </div>
          </Link>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Recent Forecasts</h2>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-gray-300 transition-all">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            </div> )
          : forecasts.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-400 mb-6">No forecasts yet. Start by uploading your data.</p>
              <Link
                to="/upload"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500 transition-all"
              >
                <Upload className="w-4 h-4" />
                Upload Data
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {forecasts.length > 0 && forecasts.map((forecast) => (
                <div
                  key={forecast.id}
                  className="group bg-gray-950/50 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 flex items-center justify-center">
                        {getStatusIcon(forecast.status)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-1">
                          {forecast.datasets?.name || 'Unknown Dataset'}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {forecast.forecast_days} days
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDate(forecast.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${getStatusColor(forecast.status)}`}>
                        {forecast.status}
                      </span>
                      <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-300 transition-all">
                        <BarChart3 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
