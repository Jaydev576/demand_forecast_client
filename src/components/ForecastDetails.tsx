import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Prediction {
    date: string;
    predicted_quantity_sold: number;
}

interface ForecastData {
    product: string;
    city: string;
    predictions: Prediction[];
}

interface ForecastDetailsProps {
    forecast: ForecastData;
}

const overviewStats = (result: ForecastData) => result ? [
    { label: 'Projected Total Sales', value: result.predictions.reduce((acc: number, p: Prediction) => acc + p.predicted_quantity_sold, 0), change: '', color: 'from-blue-500 to-cyan-500' },
    { label: 'Average Daily Sales', value: (result.predictions.reduce((acc: number, p: Prediction) => acc + p.predicted_quantity_sold, 0) / result.predictions.length).toFixed(2), change: '', color: 'from-cyan-500 to-teal-500' },
] : [];

const chartData = (result: ForecastData) => result ? result.predictions.map((p: Prediction) => ({ date: p.date.split('T')[0], predicted: p.predicted_quantity_sold })) : [];


export const ForecastDetails: React.FC<ForecastDetailsProps> = ({ forecast }) => {
    if (!forecast) {
        return null;
    }

    return (
        <div className="space-y-12">
            {/* Results: Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {overviewStats(forecast).map((stat, index) => (
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
                <h3 className="text-xl font-semibold text-white mb-6">Sales Forecast Trend for {forecast.product} in {forecast.city}</h3>
                <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={chartData(forecast)}>
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
                            {forecast.predictions.map((p: Prediction, index: number) => (
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
    );
};
