import { useState, useEffect } from 'react';
import { FiSearch, FiSliders, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/api/orders');
      if (res.data?.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load system orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await api.put(`/api/orders/${id}/status`, { status });
      if (res.data?.success) {
        toast.success(`Order status updated to "${status}"`);
        fetchOrders();
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.user_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' ? true : o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-obsidian-900 p-4 rounded-2xl border border-obsidian-800">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search Order ID or Guest..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-obsidian-955 border border-obsidian-800 rounded-xl text-white placeholder:text-platinum-500 focus:outline-none focus:border-gold-500 text-sm"
          />
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-platinum-400" />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 bg-obsidian-955 border border-obsidian-800 rounded-xl text-white focus:outline-none text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
      </div>

      {/* Orders Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 rounded-full border-2 border-t-gold-500 border-r-transparent animate-spin mb-4" />
          <p className="text-platinum-400 text-sm">Collating order journals...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <p className="text-platinum-500 text-center py-10">No orders logged.</p>
      ) : (
        <div className="overflow-x-auto bg-obsidian-900 rounded-2xl border border-obsidian-800">
          <table className="w-full text-left text-sm text-platinum-300">
            <thead className="text-xs uppercase tracking-wider text-platinum-500 border-b border-obsidian-800">
              <tr>
                <th className="py-4 px-4">Order ID</th>
                <th className="py-4 px-4">Guest</th>
                <th className="py-4 px-4">Preferences</th>
                <th className="py-4 px-4">Bill Total</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 text-right">Modify Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian-800/40">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-obsidian-950/20">
                  <td className="py-4 px-4 font-mono text-xs text-white">#{ord.id}</td>
                  <td className="py-4 px-4 font-semibold text-white">{ord.user_name || 'Walk-in Guest'}</td>
                  <td className="py-4 px-4 capitalize">
                    {ord.order_type === 'table_order' ? `Table ${ord.table_number}` : 'Home Delivery'}
                  </td>
                  <td className="py-4 px-4 font-mono font-semibold text-white">
                    ₹{Number(ord.final_amount).toLocaleString()}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      ord.status === 'delivered' ? 'bg-gold-500/20 text-gold-400' :
                      ord.status === 'ready' ? 'bg-green-500/20 text-green-400' :
                      ord.status === 'preparing' ? 'bg-blue-500/20 text-blue-450' :
                      'bg-yellow-500/20 text-yellow-450'
                    }`}>
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <select
                      value={ord.status}
                      onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                      className="px-3 py-1.5 bg-obsidian-955 border border-obsidian-800 rounded-lg text-xs text-white focus:outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="preparing">Preparing</option>
                      <option value="ready">Ready</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
