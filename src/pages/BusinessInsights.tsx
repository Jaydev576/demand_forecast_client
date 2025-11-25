// BusinessInsightsPlotlyPies.tsx
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

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: d, error } = await apiFetch('insights');
    // console.log(d, error)
    if (error) {
      showToast('Error fetching insights data: ' + error.detail, 'error');
      setLoading(false);
      return;
    }
    // console.log(d)
    setData(d);
    setLoading(false);
  };

  // Theme / shared layout
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#050616' }}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Business Insights</h1>
            <p className="text-gray-400">Comprehensive analytics and actionable insights</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 text-lg">Loading insights...</div>
        ) : Object.keys(data).length === 0 || (!data.kpis && !data.charts) ? (
          <div className="text-center text-gray-400 text-lg mt-8">
            <p className="mb-4">No business insights data available.</p>
            <button
              onClick={() => navigate('/upload')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 shadow-lg"
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
                        <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}>
                          {stat.label === 'Total Revenue' ? `₹${stat.value?.toLocaleString()}` : stat.value?.toLocaleString()}
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
    </div>
  );
}
