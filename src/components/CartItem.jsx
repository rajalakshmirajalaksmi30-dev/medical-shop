import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="cart-item" id={`cart-item-${item.id}`}>
      <img
        src={item.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400'}
        alt={item.name}
        className="cart-item-image"
      />

      <div className="cart-item-info">
        <h3 className="cart-item-name">{item.name}</h3>
        <span className="cart-item-category">{item.category || 'General'}</span>

        <div className="cart-item-bottom">
          <span className="cart-item-price">
            ₹{(item.price * item.quantity).toFixed(2)}
          </span>

          <div className="cart-item-actions">
            <div className="quantity-controls">
              <button
                className="quantity-btn"
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                aria-label="Decrease quantity"
              >
                <Minus size={16} />
              </button>
              <span className="quantity-value">{item.quantity}</span>
              <button
                className="quantity-btn"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                disabled={item.quantity >= item.stock}
                aria-label="Increase quantity"
              >
                <Plus size={16} />
              </button>
            </div>

            <button
              className="cart-item-remove"
              onClick={() => removeFromCart(item.id)}
              aria-label="Remove item"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
