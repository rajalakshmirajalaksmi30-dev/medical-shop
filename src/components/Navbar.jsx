import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Menu, X, User, LogOut, LayoutDashboard, Home, Info, Heart } from 'lucide-react';
import '../styles/navbar.css';

export default function Navbar() {
  const { user, profile, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const handleLogout = async (e) => {
    try {
      await logout();
      setMobileOpen(false);
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navLinks = (
    <>
      <Link to="/" className={`navbar-link ${isActive('/')}`} onClick={() => setMobileOpen(false)}>
        <Home size={18} />
        Home
      </Link>
      <Link to="/about" className={`navbar-link navbar-link-highlight ${isActive('/about')}`} onClick={() => setMobileOpen(false)}>
        <Info size={18} />
        About
      </Link>
      <Link to="/cart" className={`navbar-link ${isActive('/cart')}`} onClick={() => setMobileOpen(false)} style={{ position: 'relative' }}>
        <ShoppingCart size={18} />
        Cart
        {cartCount > 0 && <span className="navbar-cart-badge">{cartCount}</span>}
      </Link>
    </>
  );

  const authLinks = (
    <>
      {user ? (
        <div className="navbar-user-container" style={{ position: 'relative' }}>
          <div className="navbar-user-info" onClick={() => setDropdownOpen(!dropdownOpen)} style={{ cursor: 'pointer' }}>
            <div className="navbar-avatar">
              {(profile?.full_name || user.email)?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="navbar-username">{profile?.full_name || user.email?.split('@')[0]}</span>
          </div>
          
          {dropdownOpen && (
            <div className="navbar-dropdown">
              {isAdmin && (
                <Link to="/admin" className="dropdown-item" onClick={() => { setDropdownOpen(false); setMobileOpen(false); }}>
                  <LayoutDashboard size={16} />
                  Admin Panel
                </Link>
              )}
              <button type="button" className="dropdown-item text-danger" onClick={handleLogout} title="Logout" id="logout-btn">
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <Link to="/login" className="btn btn-sm btn-secondary" onClick={() => setMobileOpen(false)}>
            Login
          </Link>
          <Link to="/register" className="btn btn-sm btn-primary" onClick={() => setMobileOpen(false)}>
            Sign Up
          </Link>
        </>
      )}
    </>
  );

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <img src="/logo.png" alt="SK Logo" className="navbar-logo-img" />
          <div>
            <div className="navbar-title">Shantha Krish</div>
            <div className="navbar-title-sub">Medicals</div>
          </div>
        </Link>

        <div className="navbar-links">
          {navLinks}
        </div>

        <div className="navbar-auth">
          {authLinks}
        </div>

        <button
          className="navbar-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="navbar-mobile-menu">
          {navLinks}
          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
            {authLinks}
          </div>
        </div>
      )}
    </nav>
  );
}
