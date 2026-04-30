import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer" id="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand-name">Shantha Krish Medicals</div>
            <p className="footer-brand-desc">
              Your trusted neighborhood pharmacy. Quality medicines, health products, and genuine care for your well-being since 2020.
            </p>
          </div>

          <div>
            <div className="footer-title">Quick Links</div>
            <div className="footer-links">
              <Link to="/" className="footer-link">Home</Link>
              <Link to="/cart" className="footer-link">Cart</Link>
              <Link to="/login" className="footer-link">Login</Link>
              <Link to="/register" className="footer-link">Register</Link>
            </div>
          </div>

          <div>
            <div className="footer-title">Categories</div>
            <div className="footer-links">
              <span className="footer-link">Tablets</span>
              <span className="footer-link">Syrups</span>
              <span className="footer-link">Equipment</span>
              <span className="footer-link">First Aid</span>
              <span className="footer-link">Hygiene</span>
            </div>
          </div>

          <div>
            <div className="footer-title">Contact</div>
            <div className="footer-links">
              <span className="footer-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={14} /> +91 98765 43210
              </span>
              <span className="footer-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={14} /> info@skmedicals.com
              </span>
              <span className="footer-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={14} /> Chennai, Tamil Nadu
              </span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          © {new Date().getFullYear()} Shantha Krish Medicals. All rights reserved. Made with <Heart size={12} style={{ display: 'inline', color: 'var(--error)' }} /> for your health.
        </div>
      </div>
    </footer>
  );
}
