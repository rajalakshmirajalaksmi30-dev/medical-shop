import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CartItem from '../components/CartItem';
import '../styles/cart.css';

export default function Cart() {
  const { cart, cartTotal, cartCount, clearCart } = useCart();
  const { user } = useAuth();

  if (cart.length === 0) {
    return (
      <div className="page container cart-page" id="cart-page">
        <div className="cart-empty">
          <ShoppingBag size={64} className="cart-empty-icon" />
          <h2 className="cart-empty-title">Your cart is empty</h2>
          <p className="cart-empty-text">Looks like you haven't added any products yet.</p>
          <Link to="/" className="btn btn-primary btn-lg">
            Start Shopping <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page container cart-page" id="cart-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Shopping Cart</h1>
          <p className="page-subtitle">{cartCount} item{cartCount !== 1 ? 's' : ''} in your cart</p>
        </div>
        <button className="btn btn-sm btn-secondary" onClick={clearCart}>
          <Trash2 size={16} /> Clear All
        </button>
      </div>

      <div className="cart-layout">
        <div className="cart-items">
          {cart.map(item => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>

        <div className="cart-summary">
          <h3 className="cart-summary-title">Order Summary</h3>

          <div className="cart-summary-row label">
            <span>Subtotal ({cartCount} items)</span>
            <span>₹{cartTotal.toFixed(2)}</span>
          </div>
          <div className="cart-summary-row label">
            <span>Delivery</span>
            <span style={{ color: 'var(--success)' }}>Free</span>
          </div>

          <div className="cart-summary-divider"></div>

          <div className="cart-summary-total">
            <span>Total</span>
            <span className="cart-summary-total-value">₹{cartTotal.toFixed(2)}</span>
          </div>

          {user ? (
            <Link to="/checkout" className="btn btn-primary btn-lg" style={{ width: '100%' }} id="checkout-btn">
              Proceed to Checkout <ArrowRight size={18} />
            </Link>
          ) : (
            <Link to="/login" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
              Login to Checkout <ArrowRight size={18} />
            </Link>
          )}

          <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
            🔒 Secure checkout powered by Razorpay
          </p>
        </div>
      </div>
    </div>
  );
}
