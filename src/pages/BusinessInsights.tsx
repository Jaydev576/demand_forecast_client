import React, { useEffect, useMemo, useState } from 'react';
import Plot from 'react-plotly.js';
import type { Data, Layout } from 'plotly.js';
import { Package, IndianRupee } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import apiFetch from '../lib/api';
import { useNavigate } from 'react-router-dom';

type RawData = {
  kpis?: { total_sales?: number; total_revenue?: number };
  charts?: {
    category_product_contribution?: Record<string, Record<string, number>>;
    top_categories?: Record<string, number>;
    top_cities?: Record<string, number>;
    top_products?: Record<string, number>;
  };
  created_at?: string;
  id?: number;
};

export function BusinessInsightsPlotly(): JSX.Element {
  const { showToast } = useToast();
  const [data, setData] = useState<RawData>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // hoveredCategory controls the right-hand detail pie
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  // optionally store the last hovered label/value for nicer title
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);

  useEffect(() => { 
    fetchData(); 
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: d, error } = await apiFetch('insights/');
    if (error) {
      showToast(error.detail || 'Error fetching insights data', 'info');
      setLoading(false);
      return;
    }
    setData(d);
    setLoading(false);
  };

  // Theme/shared layout
  const paperBg = '#0d1117';  // outer bg
  const plotBg = '#0f1724';   // plot bg
  const axisColor = '#9ca3af';
  const gridColor = '#1f2937';
  const textColor = '#e6eef8';
  const accent = ['#60a5fa', '#06b6d4', '#f59e0b', '#ef4444', '#a78bfa'];

  const baseLayout: Partial<Layout> = {
    paper_bgcolor: paperBg,
    plot_bgcolor: plotBg,
    font: { color: textColor, family: 'Inter, system-ui, -apple-system' },
    margin: { t: 40, b: 40, l: 20, r: 20 },
  };

  // Data extraction
  const categoryContribution = data.charts?.category_product_contribution ?? {};
  const topCategories = data.charts?.top_categories ?? {};
  const topCities = data.charts?.top_cities ?? {};
  const topProducts = data.charts?.top_products ?? {};

  // Prepare category pie data
  const categoryPie = useMemo(() => {
    const entries = Object.entries(topCategories ?? {});
    if (entries.length === 0) return null;
    const labels = entries.map(([k]) => k);
    const values = entries.map(([_, v]) => Number(v) || 0);
    const colors = labels.map((_, i) => accent[i % accent.length]);
    return { labels, values, colors };
  }, [topCategories]);

  // Prepare detail pie for selected category (variants/products)
  const detailForCategory = useMemo(() => {
    if (!hoveredCategory) return null;
    const variantsRecord = categoryContribution[hoveredCategory] ?? {};
    const entries = Object.entries(variantsRecord);
    if (entries.length === 0) return null;
    const labels = entries.map(([k]) => k);
    const values = entries.map(([_, v]) => Number(v) || 0);
    const colors = labels.map((_, i) => accent[(i + 1) % accent.length]);
    const total = values.reduce((s, n) => s + n, 0);
    return { labels, values, colors, total };
  }, [hoveredCategory, categoryContribution]);

  const topCitiesPolar = useMemo(() => {
    const entries = Object.entries(topCities ?? {});
    if (entries.length === 0) return null;
    const labels = entries.map(([city]) => city);
    const vals = entries.map(([_, v]) => Number(v) || 0);
    return { labels, vals };
  }, [topCities]);

  const topProductsBar = useMemo(() => {
    const entries = Object.entries(topProducts ?? {});
    if (entries.length === 0) return null;
    const sorted = entries.sort((a, b) => (b[1] as number) - (a[1] as number));
    const names = sorted.map(e => e[0]);
    const vals = sorted.map(e => Number(e[1]) || 0);
    return { names, vals };
  }, [topProducts]);

  const plotConfig = {
    responsive: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['select2d', 'lasso2d'] as ('select2d' | 'lasso2d')[],
  };

  // Handlers: onHover and onUnhover for category pie
  const handleCategoryHover = (evt: any) => {
    // event.points[0].label contains the pie label
    const p = evt?.points?.[0];
    if (!p) return;
    // label property is typically present for pie charts
    const label = (p.label ?? p.x ?? p.customdata) as string | undefined;
    const value = Number(p.value ?? p.y ?? 0);
    if (label) {
      setHoveredCategory(label);
      setHoveredValue(Number.isFinite(value) ? value : null);
    }
  };
  const handleCategoryUnhover = () => {
    setHoveredCategory(null);
    setHoveredValue(null);
  };

  const formatKPI = (val: number | undefined | null) => {
    if (val === undefined || val === null) return '0';
    if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + 'M';
    if (val >= 1_000) return (val / 1_000).toFixed(1) + 'k';
    return val.toLocaleString();
  };

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
        <div className="flex items-center justify-center mb-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2">Business Insights</h1>
            <p className="text-gray-400">Comprehensive analytics and actionable insights</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 text-lg">Loading insights...</div>
        ) : Object.keys(data).length === 0 || (!data.kpis && !data.charts) ? (
          <div className="text-center text-gray-400 text-lg mt-12">
            <p className="mb-4 text-md">No business insights data available.</p>
            <button
              onClick={() => navigate('/upload')}
              className="w-full mt-6 py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
              // className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 shadow-lg"
            >
              Upload Data
            </button>
          </div>
        ) : (
          <>
            {/* KPI cards (unchanged) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {data?.kpis && (
                <>
                  {[
                    { label: 'Total Revenue', value: data.kpis.total_revenue, icon: IndianRupee, color: 'from-blue-500 to-cyan-500' },
                    { label: 'Total Sales', value: data.kpis.total_sales, icon: Package, color: 'from-cyan-500 to-teal-500' },
                  ].map((stat, index) => (
                    <div key={index} className="relative group">
                      <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-10 rounded-2xl blur-xl`}></div>
                      <div className="relative bg-gray-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} opacity-10 flex items-center justify-center`}>
                            <stat.icon className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div 
                          className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}
                          title={stat.value?.toLocaleString()}
                        >
                          {stat.label === 'Total Revenue' ? `₹${formatKPI(stat.value)}` : formatKPI(stat.value)}
                        </div>
                        <div className="text-gray-400 text-sm">{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Pie charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Left: Category Pie */}
              <div className="bg-gray-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Categories (hover for details)</h3>
                <div style={{ width: '100%', height: 360 }}>
                  {categoryPie ? (
                    <Plot
                      data={[
                        {
                          type: 'pie' as const,
                          labels: categoryPie.labels,
                          values: categoryPie.values,
                          marker: { colors: categoryPie.colors, line: { color: plotBg, width: 2 } },
                          hoverinfo: 'label+percent+value',
                          textinfo: 'label+percent',
                          sort: false,
                          direction: 'clockwise',
                        } as Data,
                      ]}
                      layout={{
                        ...baseLayout,
                        title: { text: 'Sales by Category' },
                        showlegend: true,
                        legend: { orientation: 'v', x: 1.02, y: 0.5, font: { color: textColor } },
                        height: 340,
                      } as Partial<Layout>}
                      config={plotConfig}
                      style={{ width: '100%', height: '100%' }}
                      onHover={handleCategoryHover}
                      onUnhover={handleCategoryUnhover}
                    />
                  ) : (
                    <div className="text-gray-400">No category data</div>
                  )}
                </div>
              </div>

              {/* Right: Detail Pie (shows when hoveredCategory is present) */}
              <div className="bg-gray-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">
                  {hoveredCategory ? `Products in ${hoveredCategory}` : 'Hover a category'}
                </h3>
                <div style={{ width: '100%', height: 360 }}>
                  {hoveredCategory && detailForCategory ? (
                    <Plot
                      data={[
                        {
                          type: 'pie' as const,
                          labels: detailForCategory.labels,
                          values: detailForCategory.values,
                          marker: { colors: detailForCategory.colors, line: { color: plotBg, width: 2 } },
                          hoverinfo: 'label+percent+value',
                          textinfo: 'label+percent',
                          sort: false,
                        } as Data,
                      ]}
                      layout={{
                        ...baseLayout,
                        title: { text: `${hoveredCategory} — ${detailForCategory.total.toLocaleString()} sales` },
                        showlegend: false,
                        height: 340,
                      } as Partial<Layout>}
                      config={plotConfig}
                      style={{ width: '100%', height: '100%' }}
                    />
                  ) : (
                    <div className="text-gray-400 flex items-center justify-center h-full">Hover over a category slice to view product breakdown</div>
                  )}
                </div>
              </div>
            </div>

            {/* Keep other charts (Top Cities / Top Products) as before */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Top Cities -> radar/polar */}
              <div className="bg-gray-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Top Cities</h3>
                <div style={{ width: '100%', height: 360 }}>
                  {topCitiesPolar ? (
                    <Plot
                      data={[
                        {
                          type: 'scatterpolar' as const,
                          r: topCitiesPolar.vals,
                          theta: topCitiesPolar.labels,
                          fill: 'toself' as const,
                          name: 'Sales',
                          marker: { color: accent[0] },
                          line: { color: accent[0], width: 2 },
                        } as Data,
                      ]}
                      layout={{
                        ...baseLayout,
                        polar: {
                          bgcolor: plotBg,
                          radialaxis: { visible: true, gridColor, tickfont: { color: axisColor } },
                          angularaxis: { tickfont: { color: axisColor } },
                        },
                        showlegend: false,
                        title: { text: 'Top Cities' },
                        height: 340,
                      } as Partial<Layout>}
                      config={plotConfig}
                      style={{ width: '100%', height: '100%' }}
                    />
                  ) : (
                    <div className="text-gray-400">No city data</div>
                  )}
                </div>
              </div>

              {/* Top products -> horizontal bar */}
              {topProductsBar && (
                <div className="bg-gray-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Top Products</h3>
                  <div style={{ width: '100%', height: Math.min(400, 60 + topProductsBar.names.length * 40) }}>
                    <Plot
                      data={[
                        {
                          type: 'bar' as const,
                          x: topProductsBar.vals.slice().reverse(),
                          y: topProductsBar.names.slice().reverse(),
                          orientation: 'h' as const,
                          marker: { color: accent[0] },
                        } as Data,
                      ]}
                      layout={{
                        ...baseLayout,
                        xaxis: { tickfont: { color: axisColor }, gridColor },
                        yaxis: { tickfont: { color: axisColor }, automargin: true },
                        margin: { t: 20, b: 40, l: 220, r: 20 },
                        title: { text: 'Top Products' },
                        height: Math.min(400, 60 + topProductsBar.names.length * 40),
                      } as Partial<Layout>}
                      config={plotConfig}
                      style={{ width: '100%', height: '100%' }}
                    />
                  </div>
                </div>
              )}
            </div>
          </>
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
