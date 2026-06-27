import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiMapPin, FiClock, FiSettings, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  // Profile Edit fields
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');

  // Address fields
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressLabel, setAddressLabel] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressState, setAddressState] = useState('');
  const [addressPostalCode, setAddressPostalCode] = useState('');

  // Order history
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchAddresses();
    fetchOrderHistory();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/api/auth/addresses');
      if (res.data?.success) {
        setAddresses(res.data.data);
      }
    } catch (err) {
      console.log('Error fetching addresses');
    }
  };

  const fetchOrderHistory = async () => {
    try {
      const res = await api.get('/api/orders/user');
      if (res.data?.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.log('Error fetching order history');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/api/auth/profile', { name, phone, avatar_url: avatarUrl });
      if (res.data?.success) {
        updateProfile(res.data.data);
        toast.success('Profile updated successfully');
      }
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addressStreet || !addressCity || !addressState || !addressPostalCode) {
      return toast.error('Please enter all address details');
    }

    const payload = {
      label: addressLabel || 'Home',
      street: addressStreet,
      city: addressCity,
      state: addressState,
      postal_code: addressPostalCode,
    };

    try {
      if (editingAddressId) {
        await api.put(`/api/auth/addresses/${editingAddressId}`, payload);
        toast.success('Address updated successfully');
      } else {
        await api.post('/api/auth/addresses', payload);
        toast.success('Address added successfully');
      }
      resetAddressForm();
      fetchAddresses();
    } catch (err) {
      toast.error('Failed to save address');
    }
  };

  const handleEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    setAddressLabel(addr.label);
    setAddressStreet(addr.street);
    setAddressCity(addr.city);
    setAddressState(addr.state);
    setAddressPostalCode(addr.postal_code);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await api.delete(`/api/auth/addresses/${id}`);
      toast.success('Address deleted successfully');
      fetchAddresses();
    } catch (err) {
      toast.error('Failed to delete address');
    }
  };

  const resetAddressForm = () => {
    setEditingAddressId(null);
    setAddressLabel('');
    setAddressStreet('');
    setAddressCity('');
    setAddressState('');
    setAddressPostalCode('');
    setShowAddressForm(false);
  };

  return (
    <>
      <Helmet>
        <title>Guest Console | The Grand Palatial</title>
      </Helmet>

      <div className="min-h-screen pt-28 pb-20 bg-obsidian-950 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="md:col-span-1 space-y-3">
              <div className="bg-obsidian-900/60 p-6 rounded-2xl border border-obsidian-850 text-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-obsidian-950 text-3xl font-bold mx-auto mb-4 shadow-[0_0_20px_rgba(212,160,23,0.3)]">
                  {user?.name?.charAt(0) || 'G'}
                </div>
                <h3 className="font-display text-lg font-bold truncate">{user?.name}</h3>
                <p className="text-xs text-platinum-400 mt-0.5 truncate">{user?.email}</p>
                <div className="mt-4 pt-4 border-t border-obsidian-800/80">
                  <span className="text-[10px] text-gold-500 tracking-[0.2em] uppercase font-body block">Loyalty Points</span>
                  <span className="text-2xl font-display font-bold text-gold-400 mt-1 block">
                    {user?.loyalty_points || 0} pts
                  </span>
                </div>
              </div>

              <div className="bg-obsidian-900/40 rounded-2xl border border-obsidian-850 p-2 space-y-1">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === 'profile' ? 'bg-gold-500 text-obsidian-950 font-semibold' : 'text-platinum-300 hover:bg-obsidian-800/50'
                  }`}
                >
                  <FiUser className="w-4 h-4" /> Edit Profile
                </button>
                <button
                  onClick={() => setActiveTab('addresses')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === 'addresses' ? 'bg-gold-500 text-obsidian-950 font-semibold' : 'text-platinum-300 hover:bg-obsidian-800/50'
                  }`}
                >
                  <FiMapPin className="w-4 h-4" /> Saved Addresses
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === 'orders' ? 'bg-gold-500 text-obsidian-950 font-semibold' : 'text-platinum-300 hover:bg-obsidian-800/50'
                  }`}
                >
                  <FiClock className="w-4 h-4" /> Order History
                </button>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all text-left"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="md:col-span-3">
              <div className="bg-obsidian-900/40 p-8 rounded-3xl border border-obsidian-850 min-h-[480px]">
                {activeTab === 'profile' && (
                  /* ─── EDIT PROFILE ─── */
                  <div>
                    <h2 className="font-display text-2xl font-bold text-white mb-6">Profile Settings</h2>
                    <form onSubmit={handleUpdateProfile} className="space-y-5 max-w-xl">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-platinum-400 font-medium block mb-2">Full Name</label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 bg-obsidian-950 border border-obsidian-800 rounded-xl text-white focus:outline-none focus:border-gold-500/50 transition-colors text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-xs text-platinum-400 font-medium block mb-2">Phone Number</label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-4 py-3 bg-obsidian-950 border border-obsidian-800 rounded-xl text-white focus:outline-none focus:border-gold-500/50 transition-colors text-sm"
                            required
                          />
                        </div>
                      </div>

                      <div className="pt-4">
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-6 py-3 bg-gradient-to-r from-gold-600 to-gold-500 text-obsidian-950 font-semibold rounded-full hover:shadow-[0_0_20px_rgba(212,160,23,0.3)] transition-all"
                        >
                          {loading ? 'Saving...' : 'Save Settings'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeTab === 'addresses' && (
                  /* ─── SAVED ADDRESSES ─── */
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="font-display text-2xl font-bold text-white">Saved Addresses</h2>
                      {!showAddressForm && (
                        <button
                          onClick={() => { resetAddressForm(); setShowAddressForm(true); }}
                          className="px-4 py-2 border border-gold-500/40 text-gold-400 text-sm font-semibold rounded-full hover:bg-gold-500/10 flex items-center gap-1.5 transition-all"
                        >
                          <FiPlus className="w-4 h-4" /> Add Address
                        </button>
                      )}
                    </div>

                    {showAddressForm ? (
                      /* Address Form */
                      <form onSubmit={handleSaveAddress} className="space-y-4 max-w-xl bg-obsidian-950/60 p-6 rounded-2xl border border-obsidian-850 mb-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-platinum-400 font-medium block mb-1">Label (e.g. Home, Work)</label>
                            <input
                              type="text"
                              value={addressLabel}
                              onChange={(e) => setAddressLabel(e.target.value)}
                              placeholder="Home"
                              className="w-full px-4 py-2.5 bg-obsidian-900 border border-obsidian-800 rounded-xl text-white focus:outline-none focus:border-gold-500/50 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-platinum-400 font-medium block mb-1">Postal Code</label>
                            <input
                              type="text"
                              value={addressPostalCode}
                              onChange={(e) => setAddressPostalCode(e.target.value)}
                              className="w-full px-4 py-2.5 bg-obsidian-900 border border-obsidian-800 rounded-xl text-white focus:outline-none focus:border-gold-500/50 text-sm"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs text-platinum-400 font-medium block mb-1">Street Address</label>
                          <input
                            type="text"
                            value={addressStreet}
                            onChange={(e) => setAddressStreet(e.target.value)}
                            className="w-full px-4 py-2.5 bg-obsidian-900 border border-obsidian-800 rounded-xl text-white focus:outline-none focus:border-gold-500/50 text-sm"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-platinum-400 font-medium block mb-1">City</label>
                            <input
                              type="text"
                              value={addressCity}
                              onChange={(e) => setAddressCity(e.target.value)}
                              className="w-full px-4 py-2.5 bg-obsidian-900 border border-obsidian-800 rounded-xl text-white focus:outline-none focus:border-gold-500/50 text-sm"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-xs text-platinum-400 font-medium block mb-1">State</label>
                            <input
                              type="text"
                              value={addressState}
                              onChange={(e) => setAddressState(e.target.value)}
                              className="w-full px-4 py-2.5 bg-obsidian-900 border border-obsidian-800 rounded-xl text-white focus:outline-none focus:border-gold-500/50 text-sm"
                              required
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button
                            type="submit"
                            className="px-5 py-2 bg-gold-500 text-obsidian-950 text-sm font-semibold rounded-full transition-all"
                          >
                            Save Address
                          </button>
                          <button
                            type="button"
                            onClick={resetAddressForm}
                            className="px-5 py-2 border border-obsidian-700 text-platinum-450 text-sm font-semibold rounded-full"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : null}

                    {/* Address List */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {addresses.length === 0 ? (
                        <p className="text-platinum-500 text-sm">No saved addresses yet.</p>
                      ) : (
                        addresses.map((addr) => (
                          <div key={addr.id} className="p-5 rounded-2xl bg-obsidian-950/40 border border-obsidian-850 flex justify-between items-start">
                            <div>
                              <span className="px-2 py-0.5 bg-gold-500/20 text-gold-400 text-[10px] font-bold uppercase rounded-md">
                                {addr.label}
                              </span>
                              <p className="text-white text-sm font-semibold mt-2">{addr.street}</p>
                              <p className="text-platinum-400 text-xs mt-1">{addr.city}, {addr.state} - {addr.postal_code}</p>
                            </div>
                            <div className="flex gap-1.5 ml-2">
                              <button
                                onClick={() => handleEditAddress(addr)}
                                className="p-2 text-platinum-500 hover:text-gold-400 transition-colors"
                              >
                                <FiEdit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteAddress(addr.id)}
                                className="p-2 text-platinum-500 hover:text-red-400 transition-colors"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'orders' && (
                  /* ─── ORDER HISTORY ─── */
                  <div>
                    <h2 className="font-display text-2xl font-bold text-white mb-6">Order History</h2>
                    {orders.length === 0 ? (
                      <p className="text-platinum-500 text-sm">You haven&apos;t placed any orders yet.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-platinum-300">
                          <thead className="text-xs uppercase tracking-wider text-platinum-500 border-b border-obsidian-850">
                            <tr>
                              <th className="py-4 px-2">Order ID</th>
                              <th className="py-4 px-2">Type</th>
                              <th className="py-4 px-2">Status</th>
                              <th className="py-4 px-2">Date</th>
                              <th className="py-4 px-2 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-obsidian-850/50">
                            {orders.map((ord) => (
                              <tr key={ord.id} className="hover:bg-obsidian-900/20">
                                <td className="py-4 px-2 font-mono text-xs text-white truncate max-w-[120px]">
                                  #{ord.id.substring(0, 8)}
                                </td>
                                <td className="py-4 px-2 capitalize">
                                  {ord.order_type === 'table_order' ? `Table ${ord.table_number}` : 'Home Delivery'}
                                </td>
                                <td className="py-4 px-2">
                                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                    ord.status === 'delivered' ? 'bg-gold-500/20 text-gold-400' :
                                    ord.status === 'ready' ? 'bg-green-500/20 text-green-400' :
                                    ord.status === 'preparing' ? 'bg-blue-500/20 text-blue-400' :
                                    'bg-yellow-500/20 text-yellow-450'
                                  }`}>
                                    {ord.status}
                                  </span>
                                </td>
                                <td className="py-4 px-2 text-xs text-platinum-500">
                                  {new Date(ord.created_at).toLocaleDateString()}
                                </td>
                                <td className="py-4 px-2 text-right text-white font-semibold">
                                  ₹{Number(ord.final_amount).toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
