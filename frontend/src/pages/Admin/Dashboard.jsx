import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiShoppingBag, FiUsers, FiDollarSign } from 'react-icons/fi';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Demo statistics fallback
  const demoStats = {
    revenue: 145800,
    ordersCount: 342,
    customersCount: 840,
    todayOrders: 18,
    chartData: [
      { name: 'Mon', sales: 12000, orders: 15 },
      { name: 'Tue', sales: 19000, orders: 22 },
      { name: 'Wed', sales: 15000, orders: 18 },
      { name: 'Thu', sales: 24000, orders: 28 },
      { name: 'Fri', sales: 32000, orders: 35 },
      { name: 'Sat', sales: 48000, orders: 50 },
      { name: 'Sun', sales: 41000, orders: 45 },
    ]
  };

  const demoRecentOrders = [
    { id: '1', name: 'Aarav Gupta', type: 'Dine-In (Table 4)', amount: 2650, status: 'preparing' },
    { id: '2', name: 'Tanvi Shah', type: 'Delivery', amount: 1850, status: 'pending' },
    { id: '3', name: 'Kabir Kapoor', type: 'Dine-In (Table 12)', amount: 4800, status: 'ready' },
    { id: '4', name: 'Isha Patel', type: 'Delivery', amount: 950, status: 'delivered' }
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/api/analytics/dashboard');
      if (res.data?.success) {
        setStats(res.data.data);
      } else {
        setStats(demoStats);
      }
      const orderRes = await api.get('/api/orders?limit=5');
      if (orderRes.data?.success) {
        setRecentOrders(orderRes.data.data);
      } else {
        setRecentOrders(demoRecentOrders);
      }
    } catch (err) {
      console.log('Error fetching analytics, using demos');
      setStats(demoStats);
      setRecentOrders(demoRecentOrders);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 rounded-full border-2 border-t-gold-500 border-r-transparent animate-spin mb-4" />
        <p className="text-platinum-400 text-sm">Aggregating luxury metrics...</p>
      </div>
    );
  }

  const cards = [
    { title: 'Total Revenue', value: `₹${stats?.revenue?.toLocaleString()}`, icon: FiDollarSign, color: 'text-gold-500 bg-gold-500/10' },
    { title: 'Total Orders', value: stats?.ordersCount, icon: FiShoppingBag, color: 'text-blue-500 bg-blue-500/10' },
    { title: 'Active Guests', value: stats?.customersCount, icon: FiUsers, color: 'text-purple-500 bg-purple-500/10' },
    { title: 'Today\'s Orders', value: stats?.todayOrders, icon: FiTrendingUp, color: 'text-green-500 bg-green-500/10' },
  ];

  return (
    <div className="space-y-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-2xl bg-obsidian-900 border border-obsidian-800 flex items-center justify-between"
          >
            <div>
              <p className="text-xs text-platinum-450 uppercase tracking-wider">{card.title}</p>
              <h3 className="text-2xl font-bold text-white mt-1.5">{card.value}</h3>
            </div>
            <div className={`p-3.5 rounded-xl ${card.color}`}>
              <card.icon className="w-6 h-6" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Visualizations row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-obsidian-900 border border-obsidian-800 space-y-4">
          <h3 className="font-display text-lg font-bold text-white">Revenue Performance (Weekly)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.chartData || demoStats.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1F" />
                <XAxis dataKey="name" stroke="#5C5C5C" fontSize={11} />
                <YAxis stroke="#5C5C5C" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0D0D11', borderColor: 'rgba(212,160,23,0.3)' }} />
                <Line type="monotone" dataKey="sales" stroke="#D4A017" strokeWidth={2.5} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="lg:col-span-1 p-6 rounded-2xl bg-obsidian-900 border border-obsidian-800 space-y-4">
          <h3 className="font-display text-lg font-bold text-white">Order Frequency</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.chartData || demoStats.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1F" />
                <XAxis dataKey="name" stroke="#5C5C5C" fontSize={11} />
                <YAxis stroke="#5C5C5C" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0D0D11', borderColor: 'rgba(212,160,23,0.3)' }} />
                <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Orders log */}
      <div className="p-6 rounded-2xl bg-obsidian-900 border border-obsidian-800 space-y-4">
        <h3 className="font-display text-lg font-bold text-white">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-platinum-300">
            <thead className="text-xs uppercase tracking-wider text-platinum-500 border-b border-obsidian-850">
              <tr>
                <th className="py-4 px-2">Order ID</th>
                <th className="py-4 px-2">Guest</th>
                <th className="py-4 px-2">Dining preferences</th>
                <th className="py-4 px-2">Status</th>
                <th className="py-4 px-2 text-right">Bill Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian-850/50">
              {recentOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-obsidian-950/20">
                  <td className="py-4 px-2 font-mono text-xs text-white">#{ord.id.substring(0, 8)}</td>
                  <td className="py-4 px-2 font-semibold text-white">{ord.name || 'Anonymous User'}</td>
                  <td className="py-4 px-2 capitalize">{ord.type || (ord.order_type === 'table_order' ? `Table ${ord.table_number}` : 'Delivery')}</td>
                  <td className="py-4 px-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      ord.status === 'delivered' ? 'bg-gold-500/20 text-gold-400' :
                      ord.status === 'ready' ? 'bg-green-500/20 text-green-400' :
                      ord.status === 'preparing' ? 'bg-blue-500/20 text-blue-450' :
                      'bg-yellow-500/20 text-yellow-450'
                    }`}>
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-4 px-2 text-right text-white font-semibold">₹{Number(ord.amount || ord.final_amount).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
