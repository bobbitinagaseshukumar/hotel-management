import { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { FiCalendar, FiTrendingUp, FiActivity, FiDollarSign } from 'react-icons/fi';
import api from '../../services/api';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Demo statistics fallback
  const demoData = {
    revenueStats: {
      averageOrderValue: 2450,
      totalReservations: 42,
      netProfitMargin: '34%'
    },
    salesTrend: [
      { date: '1 Jun', sales: 45000 },
      { date: '5 Jun', sales: 62000 },
      { date: '10 Jun', sales: 58000 },
      { date: '15 Jun', sales: 84000 },
      { date: '20 Jun', sales: 95000 },
      { date: '25 Jun', sales: 120000 },
      { date: '30 Jun', sales: 145000 }
    ],
    categoryShares: [
      { name: 'Starters', value: 34000, color: '#D4A017' },
      { name: 'Main Course', value: 85000, color: '#3b82f6' },
      { name: 'Desserts', value: 18000, color: '#10b981' },
      { name: 'Beverages', value: 24000, color: '#ec4899' }
    ],
    busyHours: [
      { hour: '12 PM', load: 35 },
      { hour: '2 PM', load: 50 },
      { hour: '4 PM', load: 15 },
      { hour: '6 PM', load: 60 },
      { hour: '8 PM', load: 95 },
      { hour: '10 PM', load: 80 }
    ]
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const res = await api.get('/api/analytics/reports');
      if (res.data?.success) {
        setData(res.data.data);
      } else {
        setData(demoData);
      }
    } catch (err) {
      console.log('Error loading system analytics, showing default values');
      setData(demoData);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 rounded-full border-2 border-t-gold-500 border-r-transparent animate-spin mb-4" />
        <p className="text-platinum-400 text-sm">Aggregating visual telemetry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Highlights Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-obsidian-900 border border-obsidian-800 flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-gold-500/10 text-gold-500">
            <FiDollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-platinum-450 uppercase">Average Ticket Size</p>
            <h4 className="text-xl font-bold text-white mt-1">₹{data?.revenueStats?.averageOrderValue}</h4>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-obsidian-900 border border-obsidian-800 flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-blue-500/10 text-blue-500">
            <FiCalendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-platinum-450 uppercase">System Reservations</p>
            <h4 className="text-xl font-bold text-white mt-1">{data?.revenueStats?.totalReservations} Bookings</h4>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-obsidian-900 border border-obsidian-800 flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-green-500/10 text-green-500">
            <FiActivity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-platinum-450 uppercase">Net Margin (Est.)</p>
            <h4 className="text-xl font-bold text-white mt-1">{data?.revenueStats?.netProfitMargin} Profit</h4>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend (Area Chart) */}
        <div className="p-6 rounded-2xl bg-obsidian-900 border border-obsidian-800 space-y-4">
          <h3 className="font-display text-lg font-bold text-white">Monthly Sales Trends</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.salesTrend || demoData.salesTrend}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4A017" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#D4A017" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1F" />
                <XAxis dataKey="date" stroke="#5C5C5C" fontSize={11} />
                <YAxis stroke="#5C5C5C" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0D0D11', borderColor: 'rgba(212,160,23,0.3)' }} />
                <Area type="monotone" dataKey="sales" stroke="#D4A017" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Contribution (Pie Chart) */}
        <div className="p-6 rounded-2xl bg-obsidian-900 border border-obsidian-800 space-y-4">
          <h3 className="font-display text-lg font-bold text-white">Revenue shares by category</h3>
          <div className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.categoryShares || demoData.categoryShares}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(data?.categoryShares || demoData.categoryShares).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0D0D11', borderColor: 'rgba(212,160,23,0.3)' }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Legend side bar */}
            <div className="w-1/3 space-y-3">
              {(data?.categoryShares || demoData.categoryShares).map((c) => (
                <div key={c.name} className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded" style={{ backgroundColor: c.color }} />
                  <span className="text-xs text-platinum-400 font-medium">{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Busy Dining Hours (Bar Chart) */}
      <div className="p-6 rounded-2xl bg-obsidian-900 border border-obsidian-800 space-y-4">
        <h3 className="font-display text-lg font-bold text-white">Busy Dining Hours (Customer load %)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.busyHours || demoData.busyHours}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1F" />
              <XAxis dataKey="hour" stroke="#5C5C5C" fontSize={11} />
              <YAxis stroke="#5C5C5C" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#0D0D11', borderColor: 'rgba(212,160,23,0.3)' }} />
              <Bar dataKey="load" fill="#D4A017" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
