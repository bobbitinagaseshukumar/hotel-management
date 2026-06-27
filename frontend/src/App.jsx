import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Loader from './components/Loader/Loader';
import CartSidebar from './components/Cart/CartSidebar';
import { useAuth } from './context/AuthContext';

// Lazy-loaded pages for performance
const Home = lazy(() => import('./pages/Home/Home'));
const Menu = lazy(() => import('./pages/Menu/Menu'));
const Specials = lazy(() => import('./pages/Specials/Specials'));
const Offers = lazy(() => import('./pages/Offers/Offers'));
const Login = lazy(() => import('./pages/Login/Login'));
const Profile = lazy(() => import('./pages/Profile/Profile'));
const Checkout = lazy(() => import('./pages/Checkout/Checkout'));
const Orders = lazy(() => import('./pages/Orders/Orders'));
const Reservations = lazy(() => import('./pages/Reservations/Reservations'));

// Admin pages
const AdminLayout = lazy(() => import('./pages/Admin/AdminLayout'));
const Dashboard = lazy(() => import('./pages/Admin/Dashboard'));
const MenuManagement = lazy(() => import('./pages/Admin/MenuManagement'));
const OrderManagement = lazy(() => import('./pages/Admin/OrderManagement'));
const KitchenDashboard = lazy(() => import('./pages/Admin/KitchenDashboard'));
const UserManagement = lazy(() => import('./pages/Admin/UserManagement'));
const Analytics = lazy(() => import('./pages/Admin/Analytics'));

// Protected Route wrapper
function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <Loader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && user?.role === 'customer') return <Navigate to="/" replace />;

  return children;
}

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    // Simulate initial loading for luxury feel
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <Loader />;

  return (
    <div className="min-h-screen bg-obsidian-950">
      <ScrollToTop />

      {/* Show Navbar and Footer only on non-admin routes */}
      {!isAdminRoute && <Navbar onCartOpen={() => setIsCartOpen(true)} />}

      {/* Cart Sidebar */}
      {!isAdminRoute && (
        <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      )}

      {/* Page Content */}
      <Suspense fallback={<Loader />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/specials" element={<Specials />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reservations" element={<Reservations />} />

            {/* Protected Customer Routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />
            <Route path="/cart" element={<Menu />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="menu" element={<MenuManagement />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route path="kitchen" element={<KitchenDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="analytics" element={<Analytics />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </Suspense>

      {/* Footer */}
      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default App;
