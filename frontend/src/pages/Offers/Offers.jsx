import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import FoodCard from '../../components/FoodCard/FoodCard';
import api from '../../services/api';

export default function Offers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fallback demo data
  const demoOffers = [
    { id: '3', name: 'Lobster Thermidor', description: 'Classic French lobster with creamy mustard sauce and gruyère', price: 3800, image_url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400', is_offer_item: true, offer_price: 2999, is_veg: false, preparation_time: 30, category_name: 'Main Course' },
    { id: '7', name: 'Mediterranean Sea Bass', description: 'Pan-seared sea bass with lemon butter, capers and herbs', price: 2200, image_url: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400', is_offer_item: true, offer_price: 1799, is_veg: false, preparation_time: 28, category_name: 'Seafood' }
  ];

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await api.get('/api/menu/offers');
        if (res.data?.success && res.data?.data?.length > 0) {
          setOffers(res.data.data);
        } else {
          setOffers(demoOffers);
        }
      } catch (err) {
        console.log('Error fetching offers, using fallback values');
        setOffers(demoOffers);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  return (
    <>
      <Helmet>
        <title>Exclusive Offers | The Grand Palatial</title>
      </Helmet>

      <div className="min-h-screen pt-28 pb-20 bg-obsidian-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            subtitle="Exclusive Promotions"
            title="Premium"
            highlight="Offers"
            description="Explore our curated promotions designed to deliver maximum luxury value on select preparations."
          />

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 rounded-full border-2 border-t-gold-500 border-r-transparent animate-spin mb-4" />
              <p className="text-platinum-400 text-sm">Fetching offers...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {offers.map((item, index) => (
                <FoodCard key={item.id} item={item} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
