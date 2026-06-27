import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash, FiSearch, FiCheck, FiX, FiUpload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function MenuManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryName, setCategoryName] = useState('Main Course');
  const [imageUrl, setImageUrl] = useState('');
  const [isVeg, setIsVeg] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isTodaysSpecial, setIsTodaysSpecial] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isOfferItem, setIsOfferItem] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');

  // Categories list
  const categories = ['Starters', 'Main Course', 'Desserts', 'Beverages'];

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await api.get('/api/menu/items');
      if (res.data?.success) {
        setItems(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setPrice('');
    setCategoryName('Main Course');
    setImageUrl('');
    setIsVeg(true);
    setIsAvailable(true);
    setIsTodaysSpecial(false);
    setIsNewArrival(false);
    setIsOfferItem(false);
    setOfferPrice('');
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    setName(item.name);
    setDescription(item.description || '');
    setPrice(item.price);
    setCategoryName(item.category_name || 'Main Course');
    setImageUrl(item.image_url || '');
    setIsVeg(item.is_veg);
    setIsAvailable(item.is_available);
    setIsTodaysSpecial(item.is_todays_special);
    setIsNewArrival(item.is_new_arrival);
    setIsOfferItem(item.is_offer_item);
    setOfferPrice(item.offer_price || '');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price) return toast.error('Please enter name and price');

    const payload = {
      name,
      description,
      price: parseFloat(price),
      category_name: categoryName,
      image_url: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
      is_veg: isVeg,
      is_available: isAvailable,
      is_todays_special: isTodaysSpecial,
      is_new_arrival: isNewArrival,
      is_offer_item: isOfferItem,
      offer_price: isOfferItem && offerPrice ? parseFloat(offerPrice) : null,
    };

    try {
      if (editingId) {
        await api.put(`/api/menu/items/${editingId}`, payload);
        toast.success('Item updated successfully!');
      } else {
        await api.post('/api/menu/items', payload);
        toast.success('Item created successfully!');
      }
      setShowModal(false);
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving menu item');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item from the catalog?')) return;
    try {
      await api.delete(`/api/menu/items/${id}`);
      toast.success('Item deleted');
      fetchItems();
    } catch (err) {
      toast.error('Failed to delete item');
    }
  };

  const toggleAvailability = async (item) => {
    try {
      await api.put(`/api/menu/items/${item.id}`, {
        ...item,
        is_available: !item.is_available,
      });
      toast.success(`${item.name} availability updated`);
      fetchItems();
    } catch (err) {
      toast.error('Failed to toggle availability');
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search and Add bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-obsidian-900 p-4 rounded-2xl border border-obsidian-800">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-obsidian-955 border border-obsidian-800 rounded-xl text-white placeholder:text-platinum-500 focus:outline-none focus:border-gold-500 text-sm"
          />
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-platinum-400" />
        </div>

        <button
          onClick={handleOpenAdd}
          className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-gold-600 to-gold-500 text-obsidian-950 font-semibold text-sm rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(212,160,23,0.3)] transition-all cursor-pointer"
        >
          <FiPlus className="w-4 h-4" /> Add Culinary Item
        </button>
      </div>

      {/* Grid listing */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 rounded-full border-2 border-t-gold-500 border-r-transparent animate-spin mb-4" />
          <p className="text-platinum-400 text-sm">Cataloging menu...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <p className="text-platinum-550 text-center py-10">No matching creations found.</p>
      ) : (
        <div className="overflow-x-auto bg-obsidian-900 rounded-2xl border border-obsidian-800">
          <table className="w-full text-left text-sm text-platinum-300">
            <thead className="text-xs uppercase tracking-wider text-platinum-500 border-b border-obsidian-800">
              <tr>
                <th className="py-4 px-4">Dish</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4">Price</th>
                <th className="py-4 px-4">Tags</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian-800/40">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-obsidian-950/20">
                  <td className="py-4 px-4 flex items-center gap-3">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover bg-obsidian-950"
                    />
                    <div>
                      <p className="font-semibold text-white">{item.name}</p>
                      <span className={`text-[10px] ${item.is_veg ? 'text-green-500' : 'text-red-500'}`}>
                        {item.is_veg ? 'Veg' : 'Non-Veg'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">{item.category_name || 'Main Course'}</td>
                  <td className="py-4 px-4 font-mono font-semibold text-white">
                    ₹{item.price}
                  </td>
                  <td className="py-4 px-4 space-y-1">
                    {item.is_todays_special && (
                      <span className="inline-block px-2 py-0.5 bg-gold-500/10 text-gold-400 text-[9px] font-bold uppercase rounded mr-1.5">
                        Special
                      </span>
                    )}
                    {item.is_new_arrival && (
                      <span className="inline-block px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-bold uppercase rounded mr-1.5">
                        New
                      </span>
                    )}
                    {item.is_offer_item && (
                      <span className="inline-block px-2 py-0.5 bg-red-500/10 text-red-400 text-[9px] font-bold uppercase rounded">
                        Offer
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => toggleAvailability(item)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.is_available
                          ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                          : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                      }`}
                    >
                      {item.is_available ? 'Available' : 'Out of Stock'}
                    </button>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-2 text-platinum-400 hover:text-gold-400 transition-colors"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-platinum-400 hover:text-red-400 transition-colors"
                      >
                        <FiTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal - Add / Edit */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed inset-x-4 top-10 max-w-2xl mx-auto z-[110] bg-obsidian-900 border border-gold-500/20 p-8 rounded-3xl overflow-y-auto max-h-[85vh] shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display text-xl font-bold text-white">
                  {editingId ? 'Edit Menu Creation' : 'Create Menu Creation'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-full hover:bg-obsidian-800 text-platinum-450 hover:text-white"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-platinum-400 mb-2 block">Dish Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-obsidian-950 border border-obsidian-800 rounded-xl text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-platinum-400 mb-2 block">Category</label>
                    <select
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-obsidian-950 border border-obsidian-800 rounded-xl text-sm text-white focus:outline-none"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-platinum-400 mb-2 block">Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 bg-obsidian-950 border border-obsidian-800 rounded-xl text-sm resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-platinum-400 mb-2 block">Price (₹)</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-4 py-2.5 bg-obsidian-950 border border-obsidian-800 rounded-xl text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-platinum-400 mb-2 block">Image URL</label>
                    <input
                      type="text"
                      value={imageUrl}
                      placeholder="https://..."
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full px-4 py-2.5 bg-obsidian-950 border border-obsidian-800 rounded-xl text-sm"
                    />
                  </div>
                </div>

                {/* Checkboxes Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-obsidian-950/60 rounded-xl border border-obsidian-800">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isVeg}
                      onChange={(e) => setIsVeg(e.target.checked)}
                      className="accent-gold-500"
                    />
                    <span className="text-xs text-platinum-300">Is Veg</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isTodaysSpecial}
                      onChange={(e) => setIsTodaysSpecial(e.target.checked)}
                      className="accent-gold-500"
                    />
                    <span className="text-xs text-platinum-300">Today&apos;s Special</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isNewArrival}
                      onChange={(e) => setIsNewArrival(e.target.checked)}
                      className="accent-gold-500"
                    />
                    <span className="text-xs text-platinum-300">New Arrival</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isOfferItem}
                      onChange={(e) => setIsOfferItem(e.target.checked)}
                      className="accent-gold-500"
                    />
                    <span className="text-xs text-platinum-300">Offer Item</span>
                  </label>
                </div>

                {isOfferItem && (
                  <div>
                    <label className="text-xs text-platinum-400 mb-2 block">Offer Price (₹)</label>
                    <input
                      type="number"
                      value={offerPrice}
                      onChange={(e) => setOfferPrice(e.target.value)}
                      className="w-full max-w-xs px-4 py-2.5 bg-obsidian-950 border border-obsidian-800 rounded-xl text-sm"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-obsidian-800/80">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 border border-obsidian-800 hover:border-platinum-700 text-sm font-semibold rounded-full"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-gold-600 to-gold-500 text-obsidian-950 font-semibold text-sm rounded-full"
                  >
                    {editingId ? 'Save Modifications' : 'Create Item'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
