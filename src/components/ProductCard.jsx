import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Package, Edit } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAdmin } = useAuth();

  const inStock = product.stock > 0;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (inStock) {
      addToCart(product, 1);
    }
  };

  return (
    <div
      className="product-card"
      onClick={() => navigate(`/product/${product.id}`)}
      id={`product-card-${product.id}`}
    >
      <div className="product-card-image-wrapper">
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400'}
          alt={product.name}
          className="product-card-image"
          loading="lazy"
        />
        <div className="product-card-stock-badge">
          <span className={`badge ${inStock ? 'badge-success' : 'badge-error'}`}>
            {inStock ? `${product.stock} in stock` : 'Out of stock'}
          </span>
        </div>
      </div>

      <div className="product-card-body">
        <div className="product-card-category">{product.category || 'General'}</div>
        <h3 className="product-card-name">{product.name}</h3>
        <p className="product-card-description">{product.description}</p>

        <div className="product-card-footer">
          <div className="product-card-price">
            <span className="product-card-price-symbol">₹</span>
            {Number(product.price).toFixed(2)}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {isAdmin && (
              <button
                className="btn btn-sm btn-secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/admin/products/edit/${product.id}`);
                }}
                title="Edit Product"
              >
                <Edit size={16} />
              </button>
            )}
            <button
              className="btn btn-sm btn-primary"
              onClick={handleAddToCart}
              disabled={!inStock}
              id={`add-to-cart-${product.id}`}
            >
              <ShoppingCart size={16} />
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
