import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiStar, FiArrowRight, FiClock, FiAward, FiUsers, FiMapPin } from 'react-icons/fi';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

import Hero3D from '../../components/Hero3D/Hero3D';
import FoodShowcase from '../../components/FoodShowcase/FoodShowcase';
import FoodCard from '../../components/FoodCard/FoodCard';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import api from '../../services/api';

/* ─── Stats Counter ─── */
function AnimatedStat({ icon: Icon, value, suffix, label }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const end = parseInt(value);
          const step = Math.max(1, Math.floor(end / 60));
          const timer = setInterval(() => {
            start += step;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(start);
            }
          }, 20);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="text-center p-6">
      <Icon className="w-8 h-8 text-gold-500 mx-auto mb-3" />
      <div className="font-display text-3xl md:text-4xl font-bold text-white mb-1">
        {count}{suffix}
      </div>
      <p className="text-platinum-400 text-sm">{label}</p>
    </div>
  );
}

/* ─── Offer Card ─── */
function OfferCard({ offer, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      whileHover={{ y: -10, scale: 1.02 }}
      className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-obsidian-900 to-obsidian-800 border border-obsidian-700/30 hover:border-gold-500/40 transition-all duration-500"
    >
      {/* Shimmer Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 -skew-x-12 group-hover:animate-shimmer" />

      <div className="p-6 relative z-10">
        <div className="flex items-start justify-between mb-4">
          <span className="px-3 py-1 bg-gold-500/20 text-gold-400 text-xs font-bold uppercase tracking-wider rounded-full">
            {offer.tag}
          </span>
          <span className="text-3xl font-display font-bold text-gold-400">
            {offer.discount}
          </span>
        </div>
        <h3 className="font-display text-xl font-semibold text-white mb-2">{offer.title}</h3>
        <p className="text-platinum-400 text-sm mb-4">{offer.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-platinum-500 text-xs flex items-center gap-1">
            <FiClock className="w-3 h-3" />
            {offer.validity}
          </span>
          <Link
            to="/offers"
            className="text-gold-400 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
          >
            View Offer <FiArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Review Card ─── */
function ReviewCard({ review }) {
  return (
    <div className="p-6 bg-obsidian-900/50 backdrop-blur-sm rounded-2xl border border-obsidian-700/20">
      <div className="flex items-center gap-1 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <FiStar
            key={i}
            className={`w-4 h-4 ${i < review.rating ? 'text-gold-500 fill-gold-500' : 'text-obsidian-600'}`}
          />
        ))}
      </div>
      <p className="text-platinum-300 text-sm italic leading-relaxed mb-4">
        &ldquo;{review.comment}&rdquo;
      </p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-obsidian-950 font-bold text-sm">
          {review.name.charAt(0)}
        </div>
        <div>
          <p className="text-white text-sm font-medium">{review.name}</p>
          <p className="text-platinum-500 text-xs">{review.role}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Gallery Item ─── */
function GalleryImage({ src, alt, span = 'col-span-1' }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      whileHover={{ scale: 1.03 }}
      className={`${span} relative group overflow-hidden rounded-xl aspect-square cursor-pointer`}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-4 group-hover:translate-y-0">
        <p className="text-white font-display font-semibold">{alt}</p>
      </div>
    </motion.div>
  );
}

/* ─────────────── MAIN HOME PAGE ─────────────── */
export default function Home() {
  const [specials, setSpecials] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [offers, setOffers] = useState([]);

  // Static data for reviews, offers, gallery (will be replaced with API data)
  const staticOffers = [
    { tag: 'Weekend', discount: '30% OFF', title: 'Royal Weekend Brunch', description: 'Indulge in our lavish weekend brunch buffet with champagne service', validity: 'Every Sat & Sun' },
    { tag: 'Seasonal', discount: '25% OFF', title: 'Monsoon Special Menu', description: 'Curated seasonal dishes featuring the finest regional ingredients', validity: 'Till Aug 31' },
    { tag: 'Couple', discount: '20% OFF', title: 'Candlelight Dinner', description: 'An intimate 7-course dinner experience for two with wine pairing', validity: 'Weekdays only' },
    { tag: 'Family', discount: '15% OFF', title: 'Family Feast Package', description: 'A grand family feast with appetizers, mains, desserts and beverages', validity: 'Daily' },
  ];

  const reviews = [
    { name: 'Priya Sharma', role: 'Food Critic', rating: 5, comment: 'The Grand Palatial has set a new benchmark for luxury dining in India. Every dish is a masterpiece, and the ambiance is simply breathtaking.' },
    { name: 'Rajesh Mehta', role: 'Business Traveler', rating: 5, comment: 'Exceptional service and world-class cuisine. The attention to detail in every aspect of the dining experience is remarkable.' },
    { name: 'Ananya Gupta', role: 'Regular Guest', rating: 5, comment: 'From the stunning interior to the exquisite flavors, every visit feels like a celebration. The truffle risotto is absolute perfection.' },
    { name: 'Vikram Singh', role: 'Hotel Reviewer', rating: 4, comment: 'A true gem in the hospitality industry. The blend of traditional Indian hospitality with modern luxury is outstanding.' },
    { name: 'Meera Patel', role: 'Culinary Enthusiast', rating: 5, comment: 'The tasting menu is a journey through culinary excellence. Chef\'s attention to seasonal ingredients makes every visit unique.' },
  ];

  const galleryImages = [
    { src: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600', alt: 'Luxury Lobby' },
    { src: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600', alt: 'Poolside View', span: 'col-span-2 row-span-2' },
    { src: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600', alt: 'Executive Suite' },
    { src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600', alt: 'Fine Dining' },
    { src: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600', alt: 'Bar & Lounge' },
    { src: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=600', alt: 'Infinity Pool' },
    { src: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600', alt: 'Signature Dish' },
    { src: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600', alt: 'Grand Exterior' },
  ];

  useEffect(() => {
    // Fetch data from API with fallback to empty arrays
    const fetchData = async () => {
      try {
        const [specialsRes, arrivalsRes] = await Promise.allSettled([
          api.get('/api/menu/specials'),
          api.get('/api/menu/new-arrivals'),
        ]);
        if (specialsRes.status === 'fulfilled') setSpecials(specialsRes.value.data?.data || []);
        if (arrivalsRes.status === 'fulfilled') setNewArrivals(arrivalsRes.value.data?.data || []);
      } catch (err) {
        console.log('API not connected yet, using demo mode');
      }
    };
    fetchData();
  }, []);

  // Demo items if API is not connected
  const demoItems = [
    { id: '1', name: 'Truffle Mushroom Risotto', description: 'Creamy arborio rice with black truffle shavings and aged parmesan', price: 1850, image_url: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400', is_todays_special: true, is_veg: true, preparation_time: 25, category_name: 'Main Course' },
    { id: '2', name: 'Wagyu Beef Tenderloin', description: 'Japanese A5 Wagyu with red wine reduction and roasted vegetables', price: 4500, image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', is_new_arrival: true, is_veg: false, preparation_time: 35, category_name: 'Signature' },
    { id: '3', name: 'Lobster Thermidor', description: 'Classic French lobster with creamy mustard sauce and gruyère', price: 3800, image_url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400', is_offer_item: true, offer_price: 2999, is_veg: false, preparation_time: 30, category_name: 'Seafood' },
    { id: '4', name: 'Saffron Paneer Tikka', description: 'Kashmiri saffron marinated paneer with mint chutney', price: 850, image_url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400', is_todays_special: true, is_veg: true, preparation_time: 20, category_name: 'Starters' },
    { id: '5', name: 'Dark Chocolate Fondant', description: 'Valrhona dark chocolate with molten center and vanilla gelato', price: 950, image_url: 'https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?w=400', is_new_arrival: true, is_veg: true, preparation_time: 15, category_name: 'Desserts' },
    { id: '6', name: 'Royal Thai Curry', description: 'Authentic Thai green curry with prawns and jasmine rice', price: 1450, image_url: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400', is_veg: false, preparation_time: 25, category_name: 'Asian' },
    { id: '7', name: 'Mediterranean Sea Bass', description: 'Pan-seared sea bass with lemon butter, capers and herbs', price: 2200, image_url: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400', is_offer_item: true, offer_price: 1799, is_veg: false, preparation_time: 28, category_name: 'Seafood' },
    { id: '8', name: 'Mango Cheesecake', description: 'Alphonso mango cheesecake on buttery biscuit base', price: 750, image_url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400', is_new_arrival: true, is_veg: true, preparation_time: 10, category_name: 'Desserts' },
  ];

  const displaySpecials = specials.length > 0 ? specials : demoItems.filter(i => i.is_todays_special);
  const displayArrivals = newArrivals.length > 0 ? newArrivals : demoItems.filter(i => i.is_new_arrival);
  const displayAll = demoItems;

  return (
    <>
      <Helmet>
        <title>The Grand Palatial - Luxury 5-Star Hotel & Restaurant</title>
        <meta name="description" content="Experience world-class luxury dining and hospitality at The Grand Palatial. Premium 5-star hotel with exquisite cuisine, elegant rooms, and exceptional service." />
      </Helmet>

      {/* ═══ HERO SECTION ═══ */}
      <Hero3D />

      {/* ═══ STATS SECTION ═══ */}
      <section className="relative py-16 bg-obsidian-900/50 border-y border-obsidian-700/20">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <AnimatedStat icon={FiAward} value="25" suffix="+" label="Years of Excellence" />
          <AnimatedStat icon={FiUsers} value="50000" suffix="+" label="Happy Guests" />
          <AnimatedStat icon={FiStar} value="150" suffix="+" label="Award-Winning Dishes" />
          <AnimatedStat icon={FiMapPin} value="12" suffix="" label="Global Locations" />
        </div>
      </section>

      {/* ═══ 3D FOOD SHOWCASE ═══ */}
      <FoodShowcase />

      {/* ═══ TODAY'S SPECIALS ═══ */}
      <section className="relative py-24" id="specials">
        <div className="absolute inset-0 bg-obsidian-950" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 rounded-full blur-[120px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            subtitle="Chef's Selection"
            title="Today's"
            highlight="Specials"
            description="Handpicked by our executive chef, these extraordinary creations showcase the finest seasonal ingredients"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displaySpecials.map((item, i) => (
              <FoodCard key={item.id} item={item} index={i} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              to="/specials"
              className="inline-flex items-center gap-2 px-8 py-3 border border-gold-500/30 text-gold-400 font-medium rounded-full hover:bg-gold-500/10 hover:border-gold-400 transition-all duration-300"
            >
              View All Specials <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ LUXURY OFFERS ═══ */}
      <section className="relative py-24 overflow-hidden" id="offers">
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian-900/50 to-obsidian-950" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold-500/5 rounded-full blur-[150px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            subtitle="Exclusive Deals"
            title="Luxury"
            highlight="Offers"
            description="Indulge in our premium offers designed for the most discerning guests"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {staticOffers.map((offer, i) => (
              <OfferCard key={i} offer={offer} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ NEW ARRIVALS ═══ */}
      <section className="relative py-24" id="new-arrivals">
        <div className="absolute inset-0 bg-obsidian-950" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-500/3 rounded-full blur-[200px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            subtitle="Fresh Additions"
            title="New"
            highlight="Arrivals"
            description="Discover our latest culinary masterpieces, freshly added to delight your palate"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayArrivals.map((item, i) => (
              <FoodCard key={item.id} item={item} index={i} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              to="/menu?filter=new"
              className="inline-flex items-center gap-2 px-8 py-3 border border-gold-500/30 text-gold-400 font-medium rounded-full hover:bg-gold-500/10 hover:border-gold-400 transition-all duration-300"
            >
              See All New Arrivals <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ CUSTOMER REVIEWS ═══ */}
      <section className="relative py-24 overflow-hidden" id="reviews">
        <div className="absolute inset-0 bg-obsidian-900/30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            subtitle="Guest Experiences"
            title="What Our Guests"
            highlight="Say"
            description="Hear from those who have experienced the Grand Palatial difference"
          />
          <Swiper
            modules={[Autoplay, Pagination, EffectCoverflow]}
            effect="coverflow"
            grabCursor
            centeredSlides
            slidesPerView="auto"
            coverflowEffect={{ rotate: 0, stretch: 0, depth: 100, modifier: 2.5, slideShadows: false }}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            breakpoints={{
              0: { slidesPerView: 1, spaceBetween: 16 },
              640: { slidesPerView: 2, spaceBetween: 20 },
              1024: { slidesPerView: 3, spaceBetween: 24 },
            }}
            className="!pb-14"
          >
            {reviews.map((review, i) => (
              <SwiperSlide key={i}>
                <ReviewCard review={review} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* ═══ GALLERY ═══ */}
      <section className="relative py-24" id="gallery">
        <div className="absolute inset-0 bg-obsidian-950" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            subtitle="Visual Journey"
            title="Our"
            highlight="Gallery"
            description="A visual narrative of elegance, luxury, and culinary excellence"
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[200px] md:auto-rows-[250px]">
            {galleryImages.map((img, i) => (
              <GalleryImage key={i} src={img.src} alt={img.alt} span={img.span} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CONTACT ═══ */}
      <section className="relative py-24" id="contact">
        <div className="absolute inset-0 bg-obsidian-900/30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            subtitle="Get in Touch"
            title="Visit"
            highlight="Us"
            description="We would love to welcome you to The Grand Palatial"
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Map */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="rounded-2xl overflow-hidden border border-obsidian-700/30 h-[400px]"
            >
              <iframe
                title="Grand Palatial Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.5!2d77.2!3d28.63!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjjCsDM4JzI0LjAiTiA3N8KwMTInMDAuMCJF!5e0!3m2!1sen!2sin!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="p-6 rounded-2xl bg-obsidian-900/50 border border-obsidian-700/20">
                <h3 className="font-display text-xl font-semibold text-white mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                      <FiMapPin className="w-5 h-5 text-gold-500" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Address</p>
                      <p className="text-platinum-400 text-sm">123 Royal Avenue, Connaught Place, New Delhi, India 110001</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                      <FiClock className="w-5 h-5 text-gold-500" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Hours</p>
                      <p className="text-platinum-400 text-sm">Mon - Sun: 7:00 AM – 11:00 PM</p>
                      <p className="text-platinum-400 text-sm">Bar: Till 1:00 AM</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Contact Form */}
              <div className="p-6 rounded-2xl bg-obsidian-900/50 border border-obsidian-700/20">
                <h3 className="font-display text-xl font-semibold text-white mb-4">Quick Inquiry</h3>
                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Your Name"
                      className="w-full px-4 py-3 bg-obsidian-800 border border-obsidian-700/30 rounded-xl text-white text-sm placeholder:text-platinum-500 focus:outline-none focus:border-gold-500/50 transition-colors"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      className="w-full px-4 py-3 bg-obsidian-800 border border-obsidian-700/30 rounded-xl text-white text-sm placeholder:text-platinum-500 focus:outline-none focus:border-gold-500/50 transition-colors"
                    />
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Your Message"
                    className="w-full px-4 py-3 bg-obsidian-800 border border-obsidian-700/30 rounded-xl text-white text-sm placeholder:text-platinum-500 focus:outline-none focus:border-gold-500/50 transition-colors resize-none"
                  />
                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-gold-600 to-gold-500 text-obsidian-950 font-semibold rounded-full hover:shadow-[0_0_25px_rgba(212,160,23,0.4)] transition-all duration-300"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
