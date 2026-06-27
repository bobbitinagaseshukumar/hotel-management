import { motion } from 'framer-motion';
import { FiPlus, FiMinus, FiStar, FiClock } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';

export default function FoodCard({ item, index = 0 }) {
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();
  const cartItem = cartItems.find((ci) => ci.id === item.id);
  const quantity = cartItem?.quantity || 0;

  const hasOffer = item.is_offer_item && item.offer_price;
  const displayPrice = hasOffer ? item.offer_price : item.price;
  const discount = hasOffer ? Math.round(((item.price - item.offer_price) / item.price) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className="group relative bg-obsidian-900/60 backdrop-blur-sm rounded-2xl border border-obsidian-700/30 overflow-hidden hover:border-gold-500/30 transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
    >
      {/* Image Container */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={item.image_url || '/placeholder-food.jpg'}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian-900 via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {item.is_todays_special && (
            <span className="px-3 py-1 bg-gold-500/90 text-obsidian-950 text-[10px] font-bold uppercase tracking-wider rounded-full backdrop-blur-sm">
              Today&apos;s Special
            </span>
          )}
          {item.is_new_arrival && (
            <span className="px-3 py-1 bg-emerald-500/90 text-white text-[10px] font-bold uppercase tracking-wider rounded-full backdrop-blur-sm">
              New
            </span>
          )}
          {hasOffer && (
            <span className="px-3 py-1 bg-red-500/90 text-white text-[10px] font-bold uppercase tracking-wider rounded-full backdrop-blur-sm">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Veg/Non-Veg Indicator */}
        <div className="absolute top-3 right-3">
          <div className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center ${item.is_veg ? 'border-green-500' : 'border-red-500'}`}>
            <div className={`w-2.5 h-2.5 rounded-full ${item.is_veg ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Category */}
        <p className="text-gold-500/70 text-[11px] font-medium uppercase tracking-widest mb-1.5">
          {item.category_name || 'Signature Dish'}
        </p>

        {/* Name */}
        <h3 className="font-display text-lg font-semibold text-white mb-2 group-hover:text-gold-300 transition-colors line-clamp-1">
          {item.name}
        </h3>

        {/* Description */}
        <p className="text-platinum-400 text-sm leading-relaxed mb-3 line-clamp-2">
          {item.description || 'A masterfully crafted dish for the discerning palate.'}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-3 mb-4 text-xs text-platinum-500">
          {item.preparation_time && (
            <span className="flex items-center gap-1">
              <FiClock className="w-3 h-3" />
              {item.preparation_time} min
            </span>
          )}
          <span className="flex items-center gap-1">
            <FiStar className="w-3 h-3 text-gold-500" />
            4.5
          </span>
        </div>

        {/* Price & Cart */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-gold-400">
              ₹{Number(displayPrice).toLocaleString()}
            </span>
            {hasOffer && (
              <span className="text-sm text-platinum-500 line-through">
                ₹{Number(item.price).toLocaleString()}
              </span>
            )}
          </div>

          {/* Add/Quantity Control */}
          {quantity === 0 ? (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => addToCart(item)}
              className="px-4 py-2 bg-gradient-to-r from-gold-600 to-gold-500 text-obsidian-950 text-sm font-semibold rounded-full hover:shadow-[0_0_20px_rgba(212,160,23,0.4)] transition-all duration-300 flex items-center gap-1"
            >
              <FiPlus className="w-4 h-4" />
              Add
            </motion.button>
          ) : (
            <div className="flex items-center gap-2 bg-obsidian-800 rounded-full border border-gold-500/30 p-1">
              <button
                onClick={() => quantity === 1 ? removeFromCart(item.id) : updateQuantity(item.id, quantity - 1)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-obsidian-700 text-platinum-200 hover:bg-gold-500/20 hover:text-gold-400 transition-colors"
              >
                <FiMinus className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center text-sm font-semibold text-gold-400">{quantity}</span>
              <button
                onClick={() => updateQuantity(item.id, quantity + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gold-500 text-obsidian-950 hover:bg-gold-400 transition-colors"
              >
                <FiPlus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
