import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiClock, FiShoppingBag, FiMapPin, FiCompass } from 'react-icons/fi';
import api from '../../services/api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/api/orders/user');
      if (res.data?.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.log('Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status) => {
    switch (status) {
      case 'pending': return 1;
      case 'preparing': return 2;
      case 'ready': return 3;
      case 'delivered': return 4;
      default: return 1;
    }
  };

  return (
    <>
      <Helmet>
        <title>Track Orders | The Grand Palatial</title>
      </Helmet>

      <div className="min-h-screen pt-28 pb-20 bg-obsidian-950 text-white">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="font-display text-3xl font-bold mb-8 text-center md:text-left">
            Track <span className="text-gold-400">Orders</span>
          </h1>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 rounded-full border-2 border-t-gold-500 border-r-transparent animate-spin mb-4" />
              <p className="text-platinum-400 text-sm">Loading your orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 bg-obsidian-900/20 rounded-2xl border border-obsidian-850">
              <FiShoppingBag className="w-16 h-16 text-obsidian-750 mx-auto mb-4" />
              <p className="text-platinum-400 text-lg mb-2">No active orders found</p>
              <p className="text-platinum-500 text-sm">Order some exquisite dishes from the menu first</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const currentStep = getStatusStep(order.status);
                return (
                  <div key={order.id} className="p-6 rounded-3xl bg-obsidian-900/40 border border-obsidian-850 space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-obsidian-800/80">
                      <div>
                        <p className="text-xs text-platinum-500">Order ID</p>
                        <p className="font-mono text-sm font-semibold text-white">#{order.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-platinum-550 text-right sm:text-right">Order Type</p>
                        <p className="text-sm font-medium text-gold-400 capitalize text-right">
                          {order.order_type === 'table_order' ? `Table ${order.table_number}` : 'Home Delivery'}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="py-4">
                      <div className="relative flex items-center justify-between">
                        <div className="absolute left-0 right-0 h-1 bg-obsidian-800 -z-10" />
                        <div
                          className="absolute left-0 h-1 bg-gradient-to-r from-gold-600 to-gold-450 -z-10 transition-all duration-500"
                          style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                        />

                        {/* Step 1: Pending */}
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            currentStep >= 1 ? 'bg-gold-500 text-obsidian-950 shadow-[0_0_15px_rgba(212,160,23,0.4)]' : 'bg-obsidian-800 text-platinum-400'
                          }`}>
                            1
                          </div>
                          <span className="text-[10px] uppercase font-semibold mt-2 tracking-wider">Pending</span>
                        </div>

                        {/* Step 2: Preparing */}
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            currentStep >= 2 ? 'bg-gold-500 text-obsidian-950 shadow-[0_0_15px_rgba(212,160,23,0.4)]' : 'bg-obsidian-800 text-platinum-400'
                          }`}>
                            2
                          </div>
                          <span className="text-[10px] uppercase font-semibold mt-2 tracking-wider">Preparing</span>
                        </div>

                        {/* Step 3: Ready */}
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            currentStep >= 3 ? 'bg-gold-500 text-obsidian-950 shadow-[0_0_15px_rgba(212,160,23,0.4)]' : 'bg-obsidian-800 text-platinum-400'
                          }`}>
                            3
                          </div>
                          <span className="text-[10px] uppercase font-semibold mt-2 tracking-wider">Ready</span>
                        </div>

                        {/* Step 4: Delivered */}
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            currentStep >= 4 ? 'bg-gold-500 text-obsidian-950 shadow-[0_0_15px_rgba(212,160,23,0.4)]' : 'bg-obsidian-800 text-platinum-400'
                          }`}>
                            4
                          </div>
                          <span className="text-[10px] uppercase font-semibold mt-2 tracking-wider">Delivered</span>
                        </div>
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-obsidian-800/80">
                      {/* Items */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-platinum-450 uppercase tracking-wider mb-3">Ordered Creations</h4>
                        {order.items?.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-platinum-300">
                              {item.item_name} <span className="text-gold-500 font-semibold font-mono">x{item.quantity}</span>
                            </span>
                            <span className="text-white font-medium">₹{Number(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>

                      {/* Payment/Address info */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-xs font-bold text-platinum-450 uppercase tracking-wider mb-2">Payment Status</h4>
                          <p className="text-sm font-semibold capitalize text-white">
                            {order.payment_method === 'razorpay' ? 'Razorpay Online' : 'Cash/Pay at Table'} —{' '}
                            <span className={order.payment_status === 'completed' ? 'text-green-500' : 'text-yellow-450'}>
                              {order.payment_status}
                            </span>
                          </p>
                        </div>
                        {order.order_type === 'home_delivery' && order.delivery_street && (
                          <div>
                            <h4 className="text-xs font-bold text-platinum-450 uppercase tracking-wider mb-2">Delivery Location</h4>
                            <p className="text-xs text-platinum-400 leading-relaxed">
                              {order.delivery_street}, {order.delivery_city}, {order.delivery_state} - {order.delivery_postal_code}
                            </p>
                          </div>
                        )}
                        <div className="flex justify-between font-display text-base font-bold text-white border-t border-obsidian-850 pt-3">
                          <span>Total Amount Paid</span>
                          <span className="text-gold-400">₹{Number(order.final_amount).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
