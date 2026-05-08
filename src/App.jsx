import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { BooksProvider } from './context/BooksContext';
import { DeliveryProvider } from './context/DeliveryContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import WishlistPage from './pages/WishlistPage';
import OrdersPage from './pages/OrdersPage';
import BookDetailsPage from './pages/BookDetailsPage';
import ProfilePage from './pages/ProfilePage';
import LiveOrderTracker from './components/LiveOrderTracker';

// Layout for secondary protected pages (Cart, Checkout, Orders, Wishlist)
// Dashboard has its own Navbar instance with search + menu controls
function SecondaryLayout() {
  return (
    <ProtectedRoute>
      <a href="#main-content" className="skip-nav">Skip to content</a>
      <Navbar />
      <div style={{ paddingTop: 'var(--navbar-h)' }}>
        <Outlet />
      </div>
    </ProtectedRoute>
  );
}

// Dashboard has its own layout (Navbar with search is rendered inside DashboardPage)
function DashboardLayout() {
  return (
    <ProtectedRoute>
      <Outlet />
    </ProtectedRoute>
  );
}

export default function App() {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.removeItem('bm_theme');
  }, []);

  return (
    <AuthProvider>
      <DeliveryProvider>
        <CartProvider>
          <BooksProvider>
            <Router>
              <Routes>
                {/* Public */}
                <Route path="/login" element={<LoginPage />} />

                {/* Dashboard — has its own internal Navbar with search */}
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                </Route>

                {/* Secondary protected pages — shared Navbar from SecondaryLayout */}
                <Route element={<SecondaryLayout />}>
                  <Route path="/cart"     element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/orders"   element={<OrdersPage />} />
                  <Route path="/book/:id" element={<BookDetailsPage />} />
                  <Route path="/profile"  element={<ProfilePage />} />
                </Route>

                {/* Fallback */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>

              <LiveOrderTracker />

              <Toaster
                position="bottom-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '14px',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
                  },
                  success: {
                    style: {
                      background: '#f0fdf4',
                      color: '#166534',
                      border: '1px solid #86efac',
                      borderRadius: '14px',
                      boxShadow: '0 4px 24px rgba(22,101,52,0.12)',
                    },
                    iconTheme: { primary: '#16a34a', secondary: '#f0fdf4' },
                  },
                }}
              />
            </Router>
          </BooksProvider>
        </CartProvider>
      </DeliveryProvider>
    </AuthProvider>
  );
}
