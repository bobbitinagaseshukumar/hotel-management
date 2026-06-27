import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  FiGrid,
  FiShoppingBag,
  FiClock,
  FiUsers,
  FiCalendar,
  FiTag,
  FiBarChart2,
  FiLogOut,
  FiMenu,
  FiX,
  FiUser
} from 'react-icons/fi';

const adminLinks = [
  { name: 'Dashboard', path: '/admin', icon: FiGrid },
  { name: 'Menu Items', path: '/admin/menu', icon: FiShoppingBag },
  { name: 'Orders', path: '/admin/orders', icon: FiClock },
  { name: 'Kitchen Live', path: '/admin/kitchen', icon: FiGrid },
  { name: 'Guests', path: '/admin/users', icon: FiUsers },
  { name: 'Bookings', path: '/admin/analytics', icon: FiCalendar }, // Analytics has reservations built in or separate
  { name: 'Analytics', path: '/admin/analytics', icon: FiBarChart2 },
];

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-obsidian-950 flex">
      {/* Sidebar - Desktop */}
      <aside
        className={`hidden md:flex flex-col bg-obsidian-900 border-r border-gold-500/10 transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Header */}
        <div className="h-20 border-b border-obsidian-800 flex items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-obsidian-950 font-bold">
              G
            </div>
            {isSidebarOpen && (
              <span className="font-display font-semibold text-white tracking-wide">
                Palatial Admin
              </span>
            )}
          </Link>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-platinum-400 hover:text-white"
          >
            <FiMenu className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-4 space-y-1">
          {adminLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gold-500 text-obsidian-950 font-semibold shadow-[0_0_20px_rgba(212,160,23,0.2)]'
                    : 'text-platinum-300 hover:bg-obsidian-800/50 hover:text-white'
                }`}
              >
                <link.icon className="w-5 h-5 flex-shrink-0" />
                {isSidebarOpen && <span>{link.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Admin User Info */}
        <div className="p-4 border-t border-obsidian-800">
          <div className="flex items-center gap-3 p-2">
            <div className="w-9 h-9 rounded-full bg-obsidian-800 flex items-center justify-center text-gold-500 font-semibold border border-gold-500/20">
              <FiUser className="w-4 h-4" />
            </div>
            {isSidebarOpen && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white truncate">{user?.name || 'Administrator'}</p>
                <p className="text-[10px] text-gold-500 uppercase tracking-widest font-mono truncate">
                  {user?.role || 'Manager'}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-red-650/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl hover:bg-red-500/20 transition-all"
          >
            <FiLogOut className="w-4 h-4" />
            {isSidebarOpen && <span>Logout Panel</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Side */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Header */}
        <header className="h-20 bg-obsidian-900 border-b border-obsidian-800/60 flex items-center justify-between px-6 md:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-platinum-400 hover:text-white md:hidden"
            >
              <FiMenu className="w-6 h-6" />
            </button>
            <h1 className="font-display text-xl font-bold text-white capitalize">
              {adminLinks.find((l) => l.path === location.pathname)?.name || 'Admin Console'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-3 py-1 rounded bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-bold uppercase tracking-wider font-mono">
              Live Monitor
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
