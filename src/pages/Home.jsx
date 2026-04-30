import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShieldCheck, Truck, Clock, ArrowRight, Edit } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/home.css';

const CATEGORIES = ['All', 'Tablets', 'Syrups', 'Equipment', 'First Aid', 'Supplements', 'Hygiene', 'General'];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/products?select=*&order=created_at.desc`;
      const response = await fetch(url, {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        }
      });
      
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products via fetch:', err);
      // If direct fetch also fails, we provide empty array
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                        p.description?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'All' || p.category === category;
    return matchSearch && matchCategory;
  });

  return (
    <div className="page" id="home-page">
      {/* Hero Section */}
      <section className="hero container">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot"></span>
            Trusted Online Pharmacy
          </div>

          <h1 className="hero-title">
            Your Health, <br />
            <span className="hero-title-gradient">Our Priority</span>
          </h1>

          <p className="hero-description">
            Get genuine medicines, health products, and wellness essentials delivered to your doorstep. Trusted by thousands of families across India.
          </p>

          <div className="hero-actions">
            <a href="#products" className="btn btn-primary btn-lg">
              Browse Products <ArrowRight size={18} />
            </a>
            <Link to="/register" className="btn btn-secondary btn-lg">
              Create Account
            </Link>
          </div>

          <div className="hero-stats">
            <div>
              <div className="hero-stat-value">500+</div>
              <div className="hero-stat-label">Products Available</div>
            </div>
            <div>
              <div className="hero-stat-value">10K+</div>
              <div className="hero-stat-label">Happy Customers</div>
            </div>
            <div>
              <div className="hero-stat-value">24/7</div>
              <div className="hero-stat-label">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container" style={{ marginBottom: '3rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}>
          {[
            { icon: <ShieldCheck size={24} />, title: '100% Genuine', desc: 'Verified medicines' },
            { icon: <Truck size={24} />, title: 'Fast Delivery', desc: 'Same day dispatch' },
            { icon: <Clock size={24} />, title: '24/7 Support', desc: 'Always here to help' },
          ].map((f, i) => (
            <div key={i} className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 'var(--radius-lg)',
                background: 'rgba(20,184,166,0.1)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: 'var(--primary-400)',
                flexShrink: 0
              }}>
                {f.icon}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{f.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Products Section */}
      <section className="container" id="products">
        <div className="search-section">
          <div className="search-bar">
            <div className="search-input-wrapper">
              <Search size={18} />
              <input
                type="text"
                className="search-input"
                placeholder="Search medicines, health products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                id="search-input"
              />
            </div>
            <div className="category-filters">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`category-chip ${category === cat ? 'active' : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="products-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className="page-title">Our Products</h2>
            <span className="products-count">{filtered.length} products found</span>
          </div>
          {isAdmin && (
            <Link to="/admin/products" className="btn btn-sm btn-secondary">
              <Edit size={16} /> Manage Products
            </Link>
          )}
        </div>

        {loading ? (
          <LoadingSpinner text="Loading products..." />
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Search size={48} className="empty-state-icon" />
            <h3 className="empty-state-title">No products found</h3>
            <p className="empty-state-text">Try adjusting your search or category filter.</p>
          </div>
        ) : (
          <div className="products-grid">
            {filtered.map((product, i) => (
              <div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
