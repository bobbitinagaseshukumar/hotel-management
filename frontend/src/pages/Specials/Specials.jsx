import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import FoodCard from '../../components/FoodCard/FoodCard';
import api from '../../services/api';

export default function Specials() {
  const [specials, setSpecials] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fallback demo data
  const demoSpecials = [
    { id: '1', name: 'Truffle Mushroom Risotto', description: 'Creamy arborio rice with black truffle shavings and aged parmesan', price: 1850, image_url: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400', is_todays_special: true, is_veg: true, preparation_time: 25, category_name: 'Main Course' },
    { id: '4', name: 'Saffron Paneer Tikka', description: 'Kashmiri saffron marinated paneer with mint chutney', price: 850, image_url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400', is_todays_special: true, is_veg: true, preparation_time: 20, category_name: 'Starters' }
  ];

  useEffect(() => {
    const fetchSpecials = async () => {
      try {
        const res = await api.get('/api/menu/specials');
        if (res.data?.success && res.data?.data?.length > 0) {
          setSpecials(res.data.data);
        } else {
          setSpecials(demoSpecials);
        }
      } catch (err) {
        console.log('Error fetching specials, using fallbacks');
        setSpecials(demoSpecials);
      } finally {
        setLoading(false);
      }
    };
    fetchSpecials();
  }, []);

  return (
    <>
      <Helmet>
        <title>Today&apos;s Specials | The Grand Palatial</title>
      </Helmet>

      <div className="min-h-screen pt-28 pb-20 bg-obsidian-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            subtitle="Signature Creations"
            title="Today's"
            highlight="Specials"
            description="Handcrafted recipes featuring culinary innovation, seasonal textures, and exceptional flavors."
          />

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 rounded-full border-2 border-t-gold-500 border-r-transparent animate-spin mb-4" />
              <p className="text-platinum-400 text-sm">Preparing specials...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {specials.map((item, index) => (
                <FoodCard key={item.id} item={item} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
