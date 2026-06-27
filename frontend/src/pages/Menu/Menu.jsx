import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FiSearch, FiSliders } from 'react-icons/fi';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import FoodCard from '../../components/FoodCard/FoodCard';
import api from '../../services/api';

const CATEGORIES = [
  { name: 'All', value: 'all' },
  { name: 'Starters', value: 'Starters' },
  { name: 'Main Course', value: 'Main Course' },
  { name: 'Desserts', value: 'Desserts' },
  { name: 'Beverages', value: 'Beverages' }
];

export default function Menu() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState(5000);
  const [dietFilter, setDietFilter] = useState('all'); // all, veg, non-veg

  // Demo Fallback Data
  const demoItems = [
    { id: '1', name: 'Truffle Mushroom Risotto', description: 'Creamy arborio rice with black truffle shavings and aged parmesan', price: 1850, image_url: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400', is_todays_special: true, is_veg: true, preparation_time: 25, category_name: 'Main Course' },
    { id: '2', name: 'Wagyu Beef Tenderloin', description: 'Japanese A5 Wagyu with red wine reduction and roasted vegetables', price: 4500, image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', is_new_arrival: true, is_veg: false, preparation_time: 35, category_name: 'Main Course' },
    { id: '3', name: 'Lobster Thermidor', description: 'Classic French lobster with creamy mustard sauce and gruyère', price: 3800, image_url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400', is_offer_item: true, offer_price: 2999, is_veg: false, preparation_time: 30, category_name: 'Main Course' },
    { id: '4', name: 'Saffron Paneer Tikka', description: 'Kashmiri saffron marinated paneer with mint chutney', price: 850, image_url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400', is_todays_special: true, is_veg: true, preparation_time: 20, category_name: 'Starters' },
    { id: '5', name: 'Dark Chocolate Fondant', description: 'Valrhona dark chocolate with molten center and vanilla gelato', price: 950, image_url: 'https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?w=400', is_new_arrival: true, is_veg: true, preparation_time: 15, category_name: 'Desserts' },
    { id: '6', name: 'Caviar Blinis', description: 'Beluga caviar on miniature buckwheat pancakes with crème fraîche', price: 3200, image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400', is_veg: false, preparation_time: 15, category_name: 'Starters' },
    { id: '7', name: 'Premium Gold Cocktail', description: '24K gold leaf infused gin cocktail with elderflower and citrus', price: 1200, image_url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400', is_veg: true, preparation_time: 10, category_name: 'Beverages' },
    { id: '8', name: 'Champagne Moët & Chandon', description: 'Brut Imperial champagne bottle, served perfectly chilled', price: 4900, image_url: 'https://images.unsplash.com/photo-1594487767530-01968d94e0ed?w=400', is_veg: true, preparation_time: 5, category_name: 'Beverages' }
  ];

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await api.get('/api/menu/items');
        if (res.data?.success && res.data?.data?.length > 0) {
          setItems(res.data.data);
        } else {
          setItems(demoItems);
        }
      } catch (err) {
        console.log('Error fetching menu items, using demo items.');
        setItems(demoItems);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();

    // Check query params
    const cat = searchParams.get('category');
    if (cat) {
      setActiveCategory(cat);
    }
  }, [searchParams]);

  useEffect(() => {
    let result = items;

    // Filter by category
    if (activeCategory !== 'all') {
      result = result.filter(item => item.category_name?.toLowerCase() === activeCategory.toLowerCase());
    }

    // Filter by search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(q) || 
        item.description?.toLowerCase().includes(q)
      );
    }

    // Filter by diet
    if (dietFilter === 'veg') {
      result = result.filter(item => item.is_veg);
    } else if (dietFilter === 'non-veg') {
      result = result.filter(item => !item.is_veg);
    }

    // Filter by price
    result = result.filter(item => {
      const price = item.is_offer_item && item.offer_price ? item.offer_price : item.price;
      return price <= priceRange;
    });

    setFilteredItems(result);
  }, [items, activeCategory, searchQuery, dietFilter, priceRange]);

  const handleCategorySelect = (cat) => {
    setActiveCategory(cat);
    setSearchParams(cat === 'all' ? {} : { category: cat });
  };

  return (
    <>
      <Helmet>
        <title>Exquisite Menu | The Grand Palatial</title>
        <meta name="description" content="Browse our luxury menu featuring the finest appetizers, main courses, desserts and premium beverages." />
      </Helmet>

      <div className="min-h-screen pt-28 pb-20 bg-obsidian-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            subtitle="Fine Dining Menu"
            title="Savor the"
            highlight="Exquisite"
            description="Our menu reflects a commitment to the highest quality, showcasing ingredients prepared with passion and artistic precision."
          />

          {/* Search and Filters Bar */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-10 bg-obsidian-900/40 p-4 rounded-2xl border border-obsidian-850">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <input
                type="text"
                placeholder="Search culinary creations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-obsidian-900 border border-obsidian-800 rounded-full text-white placeholder:text-platinum-500 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all text-sm"
              />
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-platinum-400 w-5 h-5" />
            </div>

            {/* Filter Toggle & Diet Pills */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <div className="flex bg-obsidian-900 p-1 rounded-full border border-obsidian-800">
                <button
                  onClick={() => setDietFilter('all')}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${
                    dietFilter === 'all' ? 'bg-gold-500 text-obsidian-950 shadow-md' : 'text-platinum-400 hover:text-white'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setDietFilter('veg')}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${
                    dietFilter === 'veg' ? 'bg-green-600 text-white shadow-md' : 'text-platinum-400 hover:text-white'
                  }`}
                >
                  Veg
                </button>
                <button
                  onClick={() => setDietFilter('non-veg')}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${
                    dietFilter === 'non-veg' ? 'bg-red-600 text-white shadow-md' : 'text-platinum-400 hover:text-white'
                  }`}
                >
                  Non-Veg
                </button>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-3 rounded-full border transition-all ${
                  showFilters ? 'bg-gold-500/10 border-gold-500 text-gold-400' : 'bg-obsidian-900 border-obsidian-800 text-platinum-300 hover:border-platinum-600'
                }`}
              >
                <FiSliders className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Collapsible Filter Panel */}
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-8 p-6 bg-obsidian-900/60 rounded-2xl border border-obsidian-850 overflow-hidden"
            >
              <div className="max-w-md">
                <h4 className="font-display text-sm font-semibold text-white mb-4">Max Price: ₹{priceRange.toLocaleString()}</h4>
                <input
                  type="range"
                  min="200"
                  max="5000"
                  step="100"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-gold-500 bg-obsidian-850 h-2 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-xs text-platinum-500 mt-2">
                  <span>₹200</span>
                  <span>₹2,500</span>
                  <span>₹5,000</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Category Tabs */}
          <div className="flex overflow-x-auto gap-2 pb-6 mb-10 scrollbar-hide border-b border-obsidian-800/40">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategorySelect(cat.value)}
                className={`px-6 py-3 rounded-full font-display text-sm tracking-wider whitespace-nowrap border transition-all duration-300 cursor-pointer ${
                  activeCategory === cat.value
                    ? 'bg-gradient-to-r from-gold-600 to-gold-500 text-obsidian-950 font-semibold border-transparent shadow-[0_0_20px_rgba(212,160,23,0.3)]'
                    : 'bg-obsidian-900/40 text-platinum-300 border-obsidian-800 hover:text-white hover:border-platinum-600'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Loader or Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 rounded-full border-2 border-t-gold-500 border-r-transparent animate-spin mb-4" />
              <p className="text-platinum-400 text-sm">Preparing culinary menu...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-20 bg-obsidian-900/20 rounded-2xl border border-dashed border-obsidian-800">
              <p className="text-platinum-400 text-lg mb-2">No culinary items matched your filters</p>
              <p className="text-platinum-500 text-sm">Try modifying your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredItems.map((item, index) => (
                <FoodCard key={item.id} item={item} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
