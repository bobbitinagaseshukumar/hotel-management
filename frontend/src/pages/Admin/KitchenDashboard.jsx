import { useState, useEffect } from 'react';
import { FiClock, FiCheck, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function KitchenDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fallback demo data
  const demoKitchenOrders = [
    { id: '1', order_type: 'table_order', table_number: 4, status: 'pending', items: [{ item_name: 'Truffle Risotto', quantity: 2 }, { item_name: 'Premium Cocktail', quantity: 1 }], created_at: new Date(Date.now() - 3 * 60000).toISOString() },
    { id: '2', order_type: 'home_delivery', status: 'preparing', items: [{ item_name: 'Lobster Thermidor', quantity: 1 }], created_at: new Date(Date.now() - 12 * 60000).toISOString() },
    { id: '3', order_type: 'table_order', table_number: 12, status: 'ready', items: [{ item_name: 'Dark Chocolate Fondant', quantity: 3 }], created_at: new Date(Date.now() - 25 * 60000).toISOString() }
  ];

  useEffect(() => {
    fetchKitchenOrders();
    const interval = setInterval(fetchKitchenOrders, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchKitchenOrders = async () => {
    try {
      const res = await api.get('/api/orders/kitchen');
      if (res.data?.success) {
        setOrders(res.data.data);
      } else {
        setOrders(demoKitchenOrders);
      }
    } catch (err) {
      console.log('Error loading live kitchen dashboard, loading demo view');
      setOrders(demoKitchenOrders);
    } finally {
      setLoading(false);
    }
  };

  const advanceOrderState = async (id, currentStatus) => {
    let nextStatus = '';
    if (currentStatus === 'pending') nextStatus = 'preparing';
    else if (currentStatus === 'preparing') nextStatus = 'ready';
    else if (currentStatus === 'ready') nextStatus = 'delivered';

    try {
      await api.put(`/api/orders/${id}/status`, { status: nextStatus });
      toast.success(`Order advanced to "${nextStatus}"`);
      fetchKitchenOrders();
    } catch (err) {
      toast.error('Failed to advance order status');
    }
  };

  const pending = orders.filter((o) => o.status === 'pending');
  const preparing = orders.filter((o) => o.status === 'preparing');
  const ready = orders.filter((o) => o.status === 'ready');

  const getElapsedTime = (isoString) => {
    const elapsed = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(elapsed / 60000);
    return `${mins} min ago`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 rounded-full border-2 border-t-gold-500 border-r-transparent animate-spin mb-4" />
        <p className="text-platinum-400 text-sm">Synchronizing live kitchen dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-platinum-450">Real-time status of active culinary creations.</p>
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Pending */}
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl">
            <span className="font-display font-semibold text-yellow-450">Pending Incoming ({pending.length})</span>
          </div>

          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {pending.map((o) => (
              <div key={o.id} className="bg-obsidian-900 border border-obsidian-800 p-5 rounded-2xl space-y-4">
                <div className="flex justify-between text-xs text-platinum-500">
                  <span className="font-mono">#{o.id.substring(0, 8)}</span>
                  <span className="flex items-center gap-1">
                    <FiClock /> {getElapsedTime(o.created_at)}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gold-500 uppercase">
                  {o.order_type === 'table_order' ? `Table ${o.table_number}` : 'Home Delivery'}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-obsidian-800/60">
                  {o.items?.map((item, idx) => (
                    <p key={idx} className="text-sm text-white font-medium">
                      {item.item_name} <span className="text-gold-450 font-bold font-mono">x{item.quantity}</span>
                    </p>
                  ))}
                </div>

                <button
                  onClick={() => advanceOrderState(o.id, o.status)}
                  className="w-full py-2.5 bg-yellow-500 text-obsidian-950 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
                >
                  Start Preparing <FiArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Preparing */}
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
            <span className="font-display font-semibold text-blue-450">Preparing / In Kitchen ({preparing.length})</span>
          </div>

          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {preparing.map((o) => (
              <div key={o.id} className="bg-obsidian-900 border border-obsidian-800 p-5 rounded-2xl space-y-4">
                <div className="flex justify-between text-xs text-platinum-500">
                  <span className="font-mono">#{o.id.substring(0, 8)}</span>
                  <span className="flex items-center gap-1">
                    <FiClock /> {getElapsedTime(o.created_at)}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gold-500 uppercase">
                  {o.order_type === 'table_order' ? `Table ${o.table_number}` : 'Home Delivery'}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-obsidian-800/60">
                  {o.items?.map((item, idx) => (
                    <p key={idx} className="text-sm text-white font-medium">
                      {item.item_name} <span className="text-gold-450 font-bold font-mono">x{item.quantity}</span>
                    </p>
                  ))}
                </div>

                <button
                  onClick={() => advanceOrderState(o.id, o.status)}
                  className="w-full py-2.5 bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
                >
                  Mark as Prepared <FiArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Ready */}
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-green-500/10 border border-green-500/20 p-4 rounded-xl">
            <span className="font-display font-semibold text-green-450">Ready for Service ({ready.length})</span>
          </div>

          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {ready.map((o) => (
              <div key={o.id} className="bg-obsidian-900 border border-obsidian-800 p-5 rounded-2xl space-y-4">
                <div className="flex justify-between text-xs text-platinum-500">
                  <span className="font-mono">#{o.id.substring(0, 8)}</span>
                  <span className="flex items-center gap-1">
                    <FiClock /> {getElapsedTime(o.created_at)}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gold-500 uppercase">
                  {o.order_type === 'table_order' ? `Table ${o.table_number}` : 'Home Delivery'}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-obsidian-800/60">
                  {o.items?.map((item, idx) => (
                    <p key={idx} className="text-sm text-white font-medium">
                      {item.item_name} <span className="text-gold-450 font-bold font-mono">x{item.quantity}</span>
                    </p>
                  ))}
                </div>

                <button
                  onClick={() => advanceOrderState(o.id, o.status)}
                  className="w-full py-2.5 bg-green-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
                >
                  Confirm Dispatched <FiCheck className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
