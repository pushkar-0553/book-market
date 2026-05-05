// Navbar — Deep Navy + Gold | Now rendered globally across all protected pages
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FiShoppingCart, FiSearch, FiLogOut,
  FiHeart, FiMenu, FiX, FiPackage, FiSun, FiMoon,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar({ theme, onThemeToggle, onSearch, onMenuToggle, menuOpen, searchValue }) {
  const { user, logout } = useAuth();
  const { cartCount, wishlist } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [profileOpen, setProfileOpen] = useState(false);
  // When searchValue is controlled externally (Dashboard), use it; else use internal state
  const isControlled = searchValue !== undefined;
  const [searchVal, setSearchVal] = useState('');
  const [searchFocus, setSearchFocus] = useState(false);
  const profileRef = useRef(null);

  const displaySearch = isControlled ? searchValue : searchVal;

  const wishCount = wishlist?.length || 0;
  const isDashboard = location.pathname === '/dashboard';
  const isDark = theme === 'dark';

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Clear search when leaving dashboard
  useEffect(() => {
    if (!isDashboard) {
      setSearchVal('');
      onSearch?.('');
    }
  }, [location.pathname]);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">

      {/* Mobile menu toggle — only on dashboard */}
      {isDashboard && (
        <button
          id="nav-menu-toggle"
          onClick={onMenuToggle}
          className="nav-icon-btn lg:hidden"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          style={{ marginRight: '0.25rem' }}
        >
          {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      )}

      {/* Logo */}
      <Link to="/dashboard" id="nav-logo" className="navbar-logo">
        <div className="navbar-logo-icon">
          <span style={{ fontSize: '1.125rem', position: 'relative', zIndex: 1 }}>📖</span>
        </div>
        <div className="hidden sm:block">
          <div className="navbar-logo-text">BookMarket</div>
          <div className="navbar-logo-sub">Engineering Books</div>
        </div>
      </Link>

      {/* Decorative gold accent */}
      <div style={{
        width: 2, height: 32,
        background: 'linear-gradient(180deg, var(--accent-primary), transparent)',
        borderRadius: 4,
        opacity: 0.4,
        flexShrink: 0,
      }} className="hidden sm:block" />

      {/* Search — only visible on Dashboard */}
      {isDashboard && (
        <div className="navbar-search" role="search">
          <FiSearch
            size={15}
            className="navbar-search-icon"
            style={{ color: searchFocus ? 'var(--accent-primary)' : 'var(--text-muted)', transition: 'color 200ms' }}
          />
          <input
            id="navbar-search"
            type="search"
            value={displaySearch}
            onChange={e => {
              if (!isControlled) setSearchVal(e.target.value);
              onSearch?.(e.target.value);
            }}
            onFocus={() => setSearchFocus(true)}
            onBlur={() => setSearchFocus(false)}
            placeholder="Search books, authors, subjects…"
            aria-label="Search books"
          />
        </div>
      )}

      {/* Page title breadcrumb on non-dashboard pages */}
      {!isDashboard && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <span style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
          }}>
            {location.pathname === '/cart' && '🛒 Shopping Cart'}
            {location.pathname === '/checkout' && '💳 Checkout'}
            {location.pathname === '/orders' && '📦 My Orders'}
            {location.pathname === '/wishlist' && '❤️ Wishlist'}
          </span>
        </div>
      )}

      {/* Right side actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: isDashboard ? 'auto' : '0', flexShrink: 0 }}>

        {/* Orders link — desktop */}
        <Link
          to="/orders"
          id="nav-orders"
          className={`nav-icon-btn hidden md:flex ${location.pathname === '/orders' ? 'active' : ''}`}
          aria-label="My Orders"
          title="My Orders"
          style={{ width: 'auto', padding: '0 0.75rem', gap: '0.375rem', fontSize: '0.8125rem', fontWeight: 600 }}
        >
          <FiPackage size={16} />
          <span className="hidden lg:inline">Orders</span>
        </Link>

        {/* Dark mode toggle */}
        <button
          id="theme-toggle"
          onClick={onThemeToggle}
          className="nav-icon-btn"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          {isDark
            ? <FiSun size={18} style={{ color: 'var(--accent-primary)' }} />
            : <FiMoon size={17} />
          }
        </button>

        {/* Wishlist */}
        <Link
          to="/wishlist"
          id="nav-wishlist"
          className={`nav-icon-btn ${location.pathname === '/wishlist' ? 'active' : ''}`}
          aria-label={`Wishlist (${wishCount} item${wishCount !== 1 ? 's' : ''})`}
          title="Wishlist"
          style={{ color: wishCount > 0 ? '#e11d48' : undefined }}
        >
          <FiHeart size={18} fill={wishCount > 0 ? 'currentColor' : 'none'} />
          {wishCount > 0 && (
            <span className="nav-badge" style={{ background: '#e11d48', color: 'white' }}>
              {wishCount > 9 ? '9+' : wishCount}
            </span>
          )}
        </Link>

        {/* Cart */}
        <Link
          to="/cart"
          id="nav-cart"
          className={`nav-icon-btn ${location.pathname === '/cart' ? 'active' : ''}`}
          aria-label={`Cart (${cartCount} item${cartCount !== 1 ? 's' : ''})`}
          title="Cart"
        >
          <FiShoppingCart size={18} />
          {cartCount > 0 && (
            <span className="nav-badge">{cartCount > 9 ? '9+' : cartCount}</span>
          )}
        </Link>

        {/* Profile */}
        <div style={{ position: 'relative' }} ref={profileRef}>
          <button
            id="nav-profile"
            className="nav-profile-btn"
            onClick={() => setProfileOpen(p => !p)}
            aria-expanded={profileOpen}
            aria-haspopup="true"
            style={{ marginLeft: '0.25rem' }}
          >
            <div className="nav-avatar">
              {user?.name?.[0] || 'S'}
            </div>
            <span className="nav-avatar-name hidden sm:block">
              {user?.name?.split(' ')[0] || 'Student'}
            </span>
          </button>

          {profileOpen && (
            <div className="profile-dropdown" role="menu" aria-label="User menu">
              <div className="profile-dropdown-header">
                <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user?.name}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
              </div>
              <Link
                to="/orders"
                className="profile-dropdown-item"
                role="menuitem"
                onClick={() => setProfileOpen(false)}
              >
                <FiPackage size={15} /> My Orders
              </Link>
              <Link
                to="/wishlist"
                className="profile-dropdown-item"
                role="menuitem"
                onClick={() => setProfileOpen(false)}
              >
                <FiHeart size={15} /> Wishlist {wishCount > 0 && `(${wishCount})`}
              </Link>
              <div style={{ height: 1, background: 'var(--border-subtle)', margin: '0.25rem 0' }} />
              <button
                id="nav-logout"
                onClick={handleLogout}
                className="profile-dropdown-item danger"
                role="menuitem"
              >
                <FiLogOut size={15} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}