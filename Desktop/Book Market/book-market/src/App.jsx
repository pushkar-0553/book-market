import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { BooksProvider } from './context/BooksContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import WishlistPage from './pages/WishlistPage';
import OrdersPage from './pages/OrdersPage';
import BookDetailsPage from './pages/BookDetailsPage';

// Layout for secondary protected pages (Cart, Checkout, Orders, Wishlist)
// Dashboard has its own Navbar instance with search + menu controls
function SecondaryLayout({ theme, onThemeToggle }) {
  return (
    <ProtectedRoute>
      <a href="#main-content" className="skip-nav">Skip to content</a>
      <Navbar theme={theme} onThemeToggle={onThemeToggle} />
      <div style={{ paddingTop: 'var(--navbar-h)' }}>
        <Outlet context={{ theme, onThemeToggle }} />
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
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('bm_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('bm_theme', theme);
  }, [theme]);

  const handleThemeToggle = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <AuthProvider>
      <CartProvider>
        <BooksProvider>
          <Router>
            <Routes>
              {/* Public */}
              <Route path="/login" element={<LoginPage />} />

              {/* Dashboard — has its own internal Navbar with search */}
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<DashboardPage theme={theme} onThemeToggle={handleThemeToggle} />} />
              </Route>

              {/* Secondary protected pages — shared Navbar from SecondaryLayout */}
              <Route element={<SecondaryLayout theme={theme} onThemeToggle={handleThemeToggle} />}>
                <Route path="/cart"     element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/orders"   element={<OrdersPage />} />
                <Route path="/book/:id" element={<BookDetailsPage />} />
              </Route>

              {/* Fallback */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>

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
    </AuthProvider>
  );
}
