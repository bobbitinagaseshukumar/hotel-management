import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPlus, FiMinus, FiTrash2, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

export default function CartSidebar({ isOpen, onClose }) {
  const { cartItems, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 z-[70] w-full max-w-md bg-obsidian-950 border-l border-gold-500/20 shadow-[-20px_0_60px_rgba(0,0,0,0.5)] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-obsidian-800/50">
              <div className="flex items-center gap-3">
                <FiShoppingBag className="w-5 h-5 text-gold-500" />
                <h2 className="font-display text-xl font-semibold text-white">Your Cart</h2>
                <span className="px-2 py-0.5 bg-gold-500/20 text-gold-400 text-xs font-semibold rounded-full">
                  {cartItems.length} items
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-obsidian-800 text-platinum-400 hover:text-white transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <FiShoppingBag className="w-16 h-16 text-obsidian-700 mb-4" />
                  <h3 className="font-display text-lg text-platinum-400 mb-2">Your cart is empty</h3>
                  <p className="text-platinum-500 text-sm mb-6">Explore our exquisite menu and add your favorites</p>
                  <Link
                    to="/menu"
                    onClick={onClose}
                    className="px-6 py-2.5 bg-gradient-to-r from-gold-600 to-gold-500 text-obsidian-950 text-sm font-semibold rounded-full"
                  >
                    Browse Menu
                  </Link>
                </div>
              ) : (
                cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    className="flex gap-4 p-3 rounded-xl bg-obsidian-900/50 border border-obsidian-700/20"
                  >
                    {/* Image */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image_url || '/placeholder-food.jpg'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display text-sm font-semibold text-white truncate">
                        {item.name}
                      </h4>
                      <p className="text-gold-400 font-semibold text-sm mt-1">
                        ₹{Number(item.offer_price || item.price).toLocaleString()}
                      </p>

                      {/* Quantity Control */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1.5 bg-obsidian-800 rounded-full border border-obsidian-700/50 p-0.5">
                          <button
                            onClick={() =>
                              item.quantity === 1
                                ? removeFromCart(item.id)
                                : updateQuantity(item.id, item.quantity - 1)
                            }
                            className="w-7 h-7 flex items-center justify-center rounded-full text-platinum-300 hover:bg-obsidian-700 transition-colors"
                          >
                            <FiMinus className="w-3 h-3" />
                          </button>
                          <span className="w-5 text-center text-sm font-semibold text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-full bg-gold-500/20 text-gold-400 hover:bg-gold-500/30 transition-colors"
                          >
                            <FiPlus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1.5 text-platinum-500 hover:text-red-400 transition-colors"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-obsidian-800/50 space-y-4">
                {/* Subtotal */}
                <div className="flex items-center justify-between">
                  <span className="text-platinum-400 text-sm">Subtotal</span>
                  <span className="text-white font-display text-lg font-semibold">
                    ₹{cartTotal.toLocaleString()}
                  </span>
                </div>

                <p className="text-platinum-500 text-xs">Taxes and delivery charges calculated at checkout</p>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={clearCart}
                    className="flex-1 py-3 border border-obsidian-700 text-platinum-400 text-sm font-medium rounded-full hover:border-red-500/30 hover:text-red-400 transition-colors"
                  >
                    Clear Cart
                  </button>
                  <Link
                    to="/checkout"
                    onClick={onClose}
                    className="flex-[2] py-3 bg-gradient-to-r from-gold-600 to-gold-500 text-obsidian-950 text-sm font-semibold rounded-full text-center flex items-center justify-center gap-2 hover:shadow-[0_0_25px_rgba(212,160,23,0.4)] transition-all"
                  >
                    Checkout
                    <FiArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
