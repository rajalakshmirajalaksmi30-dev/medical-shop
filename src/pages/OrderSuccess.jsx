import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, ShoppingBag, Home } from 'lucide-react';
import '../styles/checkout.css';

export default function OrderSuccess() {
  const location = useLocation();
  const { orderId, paymentId } = location.state || {};

  return (
    <div className="page container" id="order-success-page">
      <div className="order-result">
        <div className="order-result-icon success">
          <CheckCircle size={72} />
        </div>

        <h1 className="order-result-title">Order Placed Successfully!</h1>
        <p className="order-result-text">
          Thank you for your purchase. Your order has been confirmed and will be dispatched soon.
        </p>

        {orderId && (
          <div className="order-result-id">
            Order ID: {orderId.substring(0, 8).toUpperCase()}
          </div>
        )}

        {paymentId && (
          <p className="order-result-text" style={{ fontSize: '0.85rem' }}>
            Payment ID: {paymentId}
          </p>
        )}

        <div className="order-result-actions">
          <Link to="/" className="btn btn-primary btn-lg">
            <Home size={18} /> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
