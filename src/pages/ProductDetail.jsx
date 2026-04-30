import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Minus, Plus, Package } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/product.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (err) {
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product && product.stock > 0) {
      addToCart(product, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  if (loading) return <LoadingSpinner text="Loading product..." />;
  if (!product) return (
    <div className="page container">
      <div className="empty-state">
        <Package size={48} className="empty-state-icon" />
        <h3 className="empty-state-title">Product not found</h3>
        <p className="empty-state-text">This product may have been removed.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Go to Home</Link>
      </div>
    </div>
  );

  const inStock = product.stock > 0;

  return (
    <div className="page container product-detail" id="product-detail-page">
      <button onClick={() => navigate(-1)} className="product-detail-back">
        <ArrowLeft size={18} /> Back to products
      </button>

      <div className="product-detail-grid">
        <div className="product-detail-image-wrapper">
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600'}
            alt={product.name}
            className="product-detail-image"
          />
        </div>

        <div className="product-detail-info">
          <span className="product-detail-category">{product.category || 'General'}</span>
          <h1 className="product-detail-name">{product.name}</h1>

          <div className="product-detail-price">
            <span>₹</span>{Number(product.price).toFixed(2)}
          </div>

          <p className="product-detail-description">{product.description}</p>

          <div className="product-detail-stock">
            <span className={`product-detail-stock-dot ${inStock ? 'in-stock' : 'out-of-stock'}`}></span>
            <span style={{ fontWeight: 500 }}>
              {inStock ? `${product.stock} units in stock` : 'Currently out of stock'}
            </span>
          </div>

          {inStock && (
            <div className="product-detail-quantity">
              <label>Quantity:</label>
              <div className="quantity-controls">
                <button
                  className="quantity-btn"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus size={16} />
                </button>
                <span className="quantity-value">{quantity}</span>
                <button
                  className="quantity-btn"
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          )}

          <div className="product-detail-actions">
            <button
              className={`btn ${added ? 'btn-accent' : 'btn-primary'} btn-lg`}
              onClick={handleAddToCart}
              disabled={!inStock}
              id="add-to-cart-btn"
              style={{ flex: 1 }}
            >
              <ShoppingCart size={20} />
              {added ? 'Added to Cart!' : 'Add to Cart'}
            </button>
            <button
              className="btn btn-secondary btn-lg"
              onClick={() => { handleAddToCart(); navigate('/cart'); }}
              disabled={!inStock}
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
