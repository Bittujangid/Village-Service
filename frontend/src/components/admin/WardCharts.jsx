import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { useLang } from '../../context/LanguageContext';

const PIE_COLORS = ['#0284c7', '#f59e0b', '#8b5cf6', '#10b981', '#64748b', '#ec4899'];

const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-slate-200 shadow-md text-xs">
        <p className="font-bold text-slate-800 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-3 py-0.5">
            <span className="flex items-center gap-1.5 font-medium" style={{ color: entry.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
              {entry.name}:
            </span>
            <span className="font-bold text-slate-900">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-slate-200 shadow-md text-xs">
        <p className="font-bold text-slate-900">{data.name}</p>
        <p className="text-slate-600 mt-0.5">
          कुल: <strong className="text-slate-900">{data.value}</strong> ({data.payload.percentage || 0}%)
        </p>
      </div>
    );
  }
  return null;
};

const WardCharts = ({ wardBreakdown = [], categoryDistribution = [] }) => {
  const { lang, t } = useLang();

  // Prepare bar chart data for Wards 1 to 7
  const barData = wardBreakdown.map((w) => ({
    name: lang === 'hi' ? `वार्ड ${w.wardNumber}` : `Ward ${w.wardNumber}`,
    [lang === 'hi' ? 'निस्तारित (Resolved)' : 'Resolved']: w.resolved,
    [lang === 'hi' ? 'प्रगति पर (In Progress)' : 'In Progress']: w.inProgress,
    [lang === 'hi' ? 'लंबित (Pending)' : 'Pending']: w.pending,
  }));

  // Prepare pie chart data
  const pieData = categoryDistribution.map((item) => ({
    name: item.category,
    value: item.count,
    percentage: item.percentage
  }));

  const hasPieData = pieData.length > 0 && pieData.some(d => d.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Clustered Bar Chart: Resolved vs Pending by Ward */}
      <div className="bg-white p-3.5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900">
                {t.wardComparisonChart}
              </h4>
              <p className="text-[11px] text-slate-500">
                {lang === 'hi' ? 'वार्ड 1 से 7 की निस्तारित बनाम लंबित स्थिति' : 'Status breakdown across Wards 1–7'}
              </p>
            </div>
          </div>
        </div>

        <div className="w-full h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11, fill: '#64748b' }} 
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#64748b' }} 
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomBarTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} 
                iconType="circle"
              />
              <Bar 
                dataKey={lang === 'hi' ? 'निस्तारित (Resolved)' : 'Resolved'} 
                fill="#059669" 
                radius={[4, 4, 0, 0]} 
              />
              <Bar 
                dataKey={lang === 'hi' ? 'प्रगति पर (In Progress)' : 'In Progress'} 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]} 
              />
              <Bar 
                dataKey={lang === 'hi' ? 'लंबित (Pending)' : 'Pending'} 
                fill="#f59e0b" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Donut / Pie Chart: Category Distribution */}
      <div className="bg-white p-3.5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
              <PieChartIcon className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900">
                {t.categoryDistributionChart}
              </h4>
              <p className="text-[11px] text-slate-500">
                {lang === 'hi' ? 'पंचायत स्तर पर कुल समस्याओं का वर्गीकरण' : 'Panchayat-wide issue category ratio'}
              </p>
            </div>
          </div>
        </div>

        <div className="w-full h-72 sm:h-80 flex items-center justify-center">
          {hasPieData ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="46%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} 
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-slate-400 py-10">
              <p className="text-sm font-semibold">
                {lang === 'hi' ? 'वर्तमान में कोई शिकायत श्रेणी डेटा उपलब्ध नहीं है।' : 'No category data available.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WardCharts;
