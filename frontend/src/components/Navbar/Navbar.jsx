import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineMenuAlt3, HiX } from 'react-icons/hi';
import { FiShoppingCart, FiUser, FiLogIn } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Menu', path: '/menu' },
  { name: 'Specials', path: '/specials' },
  { name: 'Offers', path: '/offers' },
  { name: 'Reservations', path: '/reservations' },
  { name: 'Contact', path: '/#contact' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { cartItems } = useCart();
  const location = useLocation();

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-obsidian-950/80 backdrop-blur-xl border-b border-gold-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-[0_0_20px_rgba(212,160,23,0.4)] group-hover:shadow-[0_0_30px_rgba(212,160,23,0.6)] transition-shadow duration-300">
                  <span className="font-display text-obsidian-950 text-lg font-bold">G</span>
                </div>
                <div className="absolute -inset-1 rounded-full bg-gold-500/20 animate-glow opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-xl font-bold text-white leading-tight tracking-wide">
                  Grand Palatial
                </span>
                <span className="text-[10px] text-gold-500 tracking-[0.35em] uppercase font-body">
                  Luxury Hotel & Restaurant
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`relative px-4 py-2 text-sm font-medium tracking-wide transition-colors duration-300 ${
                      isActive
                        ? 'text-gold-400'
                        : 'text-platinum-300 hover:text-gold-400'
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute bottom-0 left-2 right-2 h-[2px] bg-gradient-to-r from-transparent via-gold-500 to-transparent"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right Actions */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-2.5 rounded-full border border-platinum-700/30 text-platinum-300 hover:text-gold-400 hover:border-gold-500/40 transition-all duration-300"
              >
                <FiShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-gold-500 text-obsidian-950 text-xs font-bold rounded-full flex items-center justify-center"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </Link>

              {/* Auth */}
              {isAuthenticated ? (
                <Link
                  to={user?.role === 'customer' ? '/profile' : '/admin'}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-gold-500/30 text-gold-400 hover:bg-gold-500/10 transition-all duration-300"
                >
                  <FiUser className="w-4 h-4" />
                  <span className="text-sm font-medium">{user?.name?.split(' ')[0] || 'Profile'}</span>
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gold-600 to-gold-500 text-obsidian-950 rounded-full font-semibold text-sm hover:shadow-[0_0_25px_rgba(212,160,23,0.4)] transition-all duration-300 hover:scale-105"
                >
                  <FiLogIn className="w-4 h-4" />
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-3 lg:hidden">
              <Link to="/cart" className="relative p-2 text-platinum-300">
                <FiShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold-500 text-obsidian-950 text-[10px] font-bold rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="p-2 text-platinum-200 hover:text-gold-400 transition-colors"
              >
                {isMobileOpen ? <HiX className="w-6 h-6" /> : <HiOutlineMenuAlt3 className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-obsidian-950/95 backdrop-blur-2xl border-t border-gold-500/10"
            >
              <div className="px-4 py-6 space-y-1">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={link.path}
                      className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                        location.pathname === link.path
                          ? 'text-gold-400 bg-gold-500/10'
                          : 'text-platinum-300 hover:text-gold-400 hover:bg-obsidian-800/50'
                      }`}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
                <div className="pt-4 border-t border-obsidian-700/50">
                  {isAuthenticated ? (
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-3 text-gold-400 rounded-lg hover:bg-gold-500/10"
                    >
                      <FiUser className="w-5 h-5" />
                      <span>My Profile</span>
                    </Link>
                  ) : (
                    <Link
                      to="/login"
                      className="flex items-center justify-center gap-2 mx-4 py-3 bg-gradient-to-r from-gold-600 to-gold-500 text-obsidian-950 rounded-full font-semibold"
                    >
                      <FiLogIn className="w-4 h-4" />
                      Sign In
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}
