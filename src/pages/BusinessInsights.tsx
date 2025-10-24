import { useEffect, useState } from 'react';
import { Lightbulb, TrendingUp, TrendingDown, DollarSign, Users, Package, Calendar, Target, IndianRupee } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { useToast } from '../contexts/ToastContext';
import apiFetch from '../lib/api';

export function BusinessInsights() {

  const { showToast } = useToast();
  const [timeRange, setTimeRange] = useState('30d');
  const [data, setData] = useState<{
    kpis?: any;
    charts?: {
      top_categories?: Record<string, number>;
      top_cities?: Record<string, number>;
      top_products?: Record<string, number>;
    };
  }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    const { data: d, error } = await apiFetch('insights');
    if (error) {
      showToast('Error fetching insights data: ' + error.message, 'error');
      setLoading(false);
      return;
    }

    setData(d);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 pointer-events-none">
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Business Insights</h1>
            <p className="text-gray-400">Comprehensive analytics and actionable insights</p>
          </div>
          <div className="flex items-center gap-2">
            {['7d', '30d', '90d', '1y'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${timeRange === range
                    ? 'bg-blue-500/20 text-blue-400 border-2 border-blue-500/50'
                    : 'bg-gray-900/50 text-gray-400 border border-white/10 hover:border-white/20'
                  }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 text-lg">Loading insights...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {data?.kpis && (
                <>
                  {[
                    { label: 'Total Revenue', value: data.kpis.total_revenue, icon: IndianRupee, color: 'from-blue-500 to-cyan-500' },
                    { label: 'Total Sales', value: data.kpis.total_sales, icon: Package, color: 'from-cyan-500 to-teal-500' },
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
                        </div>
                        <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}>
                          {stat.label === 'Total Revenue' ? `₹${stat.value.toLocaleString()}` : stat.value.toLocaleString()}
                        </div>
                        <div className="text-gray-400 text-sm">{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {data?.charts?.top_categories && (
                <div className="bg-gray-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
                  <h3 className="text-xl font-semibold text-white mb-6">Top Categories</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={Object.entries(data.charts.top_categories).map(([name, value]) => ({ name, value }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis dataKey="name" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                      <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          color: '#fff',
                        }}
                      />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {data?.charts?.top_categories && (
                <div className="bg-gray-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
                  <h3 className="text-xl font-semibold text-white mb-6">Top Cities</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={Object.entries(data.charts.top_cities ?? {}).map(([city, value]) => ({ city, value }))}>
                      <PolarGrid stroke="#ffffff20" />
                      <PolarAngleAxis dataKey="city" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                      <PolarRadiusAxis angle={90} domain={[0, Math.max(0, ...Object.values(data.charts.top_cities ?? {}).map((v: any) => Number(v) || 0))]} stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                      <Radar
                        name="Sales"
                        dataKey="value"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          color: '#fff',
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            {data?.charts?.top_products && (
              <div className="bg-gray-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-600">
                <h3 className="text-xl font-semibold text-white mb-6">Top Products</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Product</th>
                        <th className="text-right py-4 px-4 text-sm font-medium text-gray-400">Sales</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(data.charts.top_products ?? {}).map(([product, sales], index) => (
                        <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 flex items-center justify-center">
                                <Package className="w-5 h-5 text-blue-400" />
                              </div>
                              <span className="text-white font-medium">{product}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right text-gray-300">
                            {(sales as number).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </>
        )}
      </div>
    </div>
  );
}
