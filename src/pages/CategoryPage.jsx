import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Search, Filter, ChevronRight, Star, Heart, ShoppingCart, 
  ArrowUpDown, Clock, MapPin, AlertCircle, FileText,
  Percent, Zap, TrendingUp, ChevronDown, SlidersHorizontal
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/category.css';

const BRANDS = ['HealthKart', 'Himalaya', 'Abbott', 'GSK', 'Pfizer', 'Dabur', 'Zydus'];
const CONDITIONS = ['Diabetes', 'Hypertension', 'Immunity', 'Skin Care', 'Digestive Health', 'Bone & Joint'];
const RATINGS = [4, 3, 2];

export default function CategoryPage() {
  const { categoryName } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState('grid'); // 'grid' or 'list'
  
  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 2000 });
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('popularity');
  const [rxRequired, setRxRequired] = useState(false);

  useEffect(() => {
    fetchCategoryProducts();
    window.scrollTo(0, 0);
  }, [categoryName]);

  const fetchCategoryProducts = async () => {
    try {
      setLoading(true);
      // Fetch products for this category
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', categoryName || 'Medicines'); // Default if none

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching category products:', err);
      // Mock data if Supabase fails
      setProducts(getMockProducts());
    } finally {
      setLoading(false);
    }
  };

  const getMockProducts = () => [
    { id: 1, name: 'Paracetamol 500mg', brand: 'GSK', price: 45, oldPrice: 60, rating: 4.8, reviews: 1240, category: 'Medicines', rx: false, image: '/placeholder.png', description: 'Pain and fever relief' },
    { id: 2, name: 'Amoxicillin 250mg', brand: 'Abbott', price: 120, rating: 4.5, reviews: 850, category: 'Medicines', rx: true, image: '/placeholder.png', description: 'Antibiotic medication' },
    { id: 3, name: 'Vitamin C 1000mg', brand: 'HealthKart', price: 350, oldPrice: 450, rating: 4.9, reviews: 2100, category: 'Supplements', rx: false, image: '/placeholder.png', description: 'Immunity booster' },
    { id: 4, name: 'Digital Thermometer', brand: 'Omron', price: 599, rating: 4.7, reviews: 3400, category: 'Equipment', rx: false, image: '/placeholder.png', description: 'Instant temperature check' },
    { id: 5, name: 'Dolo 650', brand: 'Micro Labs', price: 32, rating: 4.9, reviews: 15000, category: 'Medicines', rx: false, image: '/placeholder.png', description: 'Most trusted for fever' },
  ];

  const handleBrandToggle = (brand) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  // Filter & Sort Logic
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = p.price >= priceRange.min && p.price <= priceRange.max;
    const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(p.brand);
    const matchesRx = !rxRequired || p.rx === true;
    const matchesRating = p.rating >= minRating;
    return matchesSearch && matchesPrice && matchesBrand && matchesRx && matchesRating;
  }).sort((a, b) => {
    if (sortBy === 'priceLow') return a.price - b.price;
    if (sortBy === 'priceHigh') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0; // Default popularity
  });

  if (loading) return <LoadingSpinner text={`Browsing ${categoryName}...`} />;

  return (
    <div className="category-page container">
      {/* Breadcrumbs */}
      <nav className="breadcrumbs">
        <div className="breadcrumb-item"><Link to="/">Home</Link> <ChevronRight size={14} className="breadcrumb-separator" /></div>
        <div className="breadcrumb-item">Products <ChevronRight size={14} className="breadcrumb-separator" /></div>
        <div className="breadcrumb-item active">{categoryName || 'Medicines'}</div>
      </nav>

      {/* Category Header */}
      <header className="category-header">
        <div className="category-header-content">
          <h1 className="category-title">{categoryName || 'Medicines'}</h1>
          <p className="category-description">
            Browse our wide selection of authentic healthcare products. From essential medications to daily wellness supplements, we ensure safety and quality in every pack.
          </p>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
            <div className="hero-badge" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <Zap size={14} /> Same Day Delivery
            </div>
            <div className="hero-badge" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <ShieldCheck size={14} /> Quality Verified
            </div>
          </div>
        </div>
        <div className="category-header-bg"></div>
      </header>

      {/* Promo Banners */}
      <div className="promo-banners">
        <div className="promo-card" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <span className="discount-badge" style={{ marginBottom: '1rem', display: 'inline-block' }}>SPECIAL OFFER</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Save 20% on First Order</h3>
            <p style={{ opacity: 0.9, marginTop: '0.5rem' }}>Use Code: HEALTH20 at checkout</p>
          </div>
          <Percent size={80} style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.1 }} />
        </div>
        <div className="promo-card" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <span className="discount-badge" style={{ marginBottom: '1rem', display: 'inline-block' }}>CARE CAMPAIGN</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Free Health Consultation</h3>
            <p style={{ opacity: 0.9, marginTop: '0.5rem' }}>Available with every order above ₹999</p>
          </div>
          <AlertCircle size={80} style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.1 }} />
        </div>
      </div>

      <div className="category-layout">
        {/* Sidebar Filters */}
        <aside className="filters-sidebar">
          <div className="filter-group">
            <h3 className="filter-title">Filters <SlidersHorizontal size={18} /></h3>
          </div>

          <div className="filter-group">
            <h3 className="filter-title">Price Range</h3>
            <div className="price-range">
              <input 
                type="range" 
                min="0" 
                max="5000" 
                step="100"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--primary-600)' }}
              />
              <div className="price-inputs">
                <input type="text" className="price-input" value={`₹${priceRange.min}`} readOnly />
                <span>-</span>
                <input type="text" className="price-input" value={`₹${priceRange.max}`} readOnly />
              </div>
            </div>
          </div>

          <div className="filter-group">
            <h3 className="filter-title">Brand</h3>
            <div className="filter-options">
              {BRANDS.map(brand => (
                <label key={brand} className="filter-checkbox">
                  <input 
                    type="checkbox" 
                    checked={selectedBrands.includes(brand)}
                    onChange={() => handleBrandToggle(brand)}
                  />
                  {brand}
                </label>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h3 className="filter-title">Health Condition</h3>
            <div className="filter-options">
              {CONDITIONS.map(condition => (
                <label key={condition} className="filter-checkbox">
                  <input type="checkbox" />
                  {condition}
                </label>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h3 className="filter-title">Customer Ratings</h3>
            <div className="filter-options">
              {RATINGS.map(rating => (
                <label key={rating} className="filter-checkbox" onClick={() => setMinRating(rating)}>
                  <input type="radio" name="rating" checked={minRating === rating} onChange={() => {}} />
                  <div className="rating-stars">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < rating ? "currentColor" : "none"} />
                    ))}
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem' }}>& Up</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-group" style={{ borderBottom: 'none' }}>
            <label className="filter-checkbox" style={{ fontWeight: 600 }}>
              <input 
                type="checkbox" 
                checked={rxRequired}
                onChange={() => setRxRequired(!rxRequired)}
              />
              Prescription Required
            </label>
          </div>

          <div className="card" style={{ padding: '1rem', background: '#f8fafc', border: 'none' }}>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <MapPin size={18} className="text-primary" />
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Delivery Availability</div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="text" placeholder="Enter PIN code" className="price-input" style={{ background: 'white' }} />
              <button className="btn btn-sm btn-primary">Check</button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="category-main">
          <div className="category-toolbar">
            <div className="results-count">{filteredProducts.length} products found</div>
            <div className="toolbar-actions">
              <div className="search-within">
                <Search size={16} />
                <input 
                  type="text" 
                  placeholder="Search in this category..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select 
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="popularity">Sort by: Popularity</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
                <option value="rating">Average Rating</option>
                <option value="new">Newest First</option>
              </select>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="empty-state">
              <Search size={48} className="empty-state-icon" />
              <h3 className="empty-state-title">No products match your filters</h3>
              <p className="empty-state-text">Try clearing some filters or searching for something else.</p>
              <button className="btn btn-outline" onClick={() => {
                setSelectedBrands([]);
                setSearchQuery('');
                setPriceRange({ min: 0, max: 2000 });
                setRxRequired(false);
                setMinRating(0);
              }}>Clear All Filters</button>
            </div>
          ) : (
            <div className="category-products-grid">
              {filteredProducts.map((p) => (
                <div key={p.id} className="product-card-enhanced">
                  {p.rx && (
                    <div className="product-badge-rx">
                      <FileText size={12} /> RX Required
                    </div>
                  )}
                  <div className="product-image-container">
                    <img src={p.image || '/placeholder.png'} alt={p.name} />
                    <button className="product-wishlist" title="Add to Wishlist">
                      <Heart size={18} />
                    </button>
                  </div>
                  <div className="product-info-enhanced">
                    <div className="product-brand-tag">{p.brand}</div>
                    <Link to={`/product/${p.id}`} className="product-name-enhanced">{p.name}</Link>
                    <div className="product-meta-enhanced">
                      <span>10 Tablets</span>
                      <span>•</span>
                      <span>Strip of 10</span>
                    </div>
                    <div className="product-rating-enhanced">
                      <div className="rating-stars">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill={i < Math.floor(p.rating) ? "currentColor" : "none"} />
                        ))}
                      </div>
                      <span className="rating-count">({p.reviews} reviews)</span>
                    </div>
                    <div className="product-price-row">
                      <span className="current-price">₹{p.price}</span>
                      {p.oldPrice && (
                        <>
                          <span className="old-price">₹{p.oldPrice}</span>
                          <span className="discount-badge">{Math.round((p.oldPrice - p.price)/p.oldPrice * 100)}% OFF</span>
                        </>
                      )}
                    </div>
                    <div className="product-actions-enhanced">
                      <button className="btn btn-primary" style={{ width: '100%' }}>
                        <ShoppingCart size={18} /> Add to Cart
                      </button>
                      <Link to={`/product/${p.id}`} className="btn btn-outline" style={{ padding: '0.5rem' }}>
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="pagination">
            <button className="page-number active">1</button>
            <button className="page-number">2</button>
            <button className="page-number">3</button>
            <span>...</span>
            <button className="page-number">12</button>
            <button className="btn btn-sm btn-outline" style={{ marginLeft: '1rem' }}>Next Page</button>
          </div>
        </main>
      </div>

      {/* Recommendations Section */}
      <section className="recommendations-section">
        <div className="section-header">
          <h2 className="section-title">Frequently Bought Together</h2>
          <p className="text-muted">Customers who bought medicines also bought these wellness products</p>
        </div>
        <div className="category-products-grid">
           {/* Reusing cards for recommendations */}
           {products.slice(0, 4).map(p => (
             <div key={`rec-${p.id}`} className="product-card-enhanced">
               <div className="product-image-container" style={{ height: '180px' }}>
                 <img src={p.image} alt={p.name} />
               </div>
               <div className="product-info-enhanced">
                 <Link to={`/product/${p.id}`} className="product-name-enhanced" style={{ fontSize: '0.95rem' }}>{p.name}</Link>
                 <div className="current-price">₹{p.price}</div>
                 <button className="btn btn-sm btn-outline" style={{ marginTop: '1rem' }}>Add to Cart</button>
               </div>
             </div>
           ))}
        </div>
      </section>

      <section className="recommendations-section" style={{ borderTop: 'none', marginTop: '2rem' }}>
        <div className="section-header">
          <h2 className="section-title">Sponsored Products</h2>
        </div>
        <div className="category-products-grid">
           {products.slice(2, 6).map(p => (
             <div key={`spon-${p.id}`} className="product-card-enhanced">
               <div className="product-image-container" style={{ height: '180px' }}>
                 <img src={p.image} alt={p.name} />
               </div>
               <div className="product-info-enhanced">
                 <Link to={`/product/${p.id}`} className="product-name-enhanced" style={{ fontSize: '0.95rem' }}>{p.name}</Link>
                 <div className="current-price">₹{p.price}</div>
                 <button className="btn btn-sm btn-outline" style={{ marginTop: '1rem' }}>Add to Cart</button>
               </div>
             </div>
           ))}
        </div>
      </section>
    </div>
  );
}
