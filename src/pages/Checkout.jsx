import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Shield, Ticket } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import '../styles/checkout.css';
import '../styles/coupons.css';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart, appliedCoupon, discount, finalTotal } = useCart();
  const { user } = useAuth();

  const [address, setAddress] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleInputChange = (field, value) => {
    setAddress(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const required = ['name', 'phone', 'street', 'city', 'state', 'pincode'];
    for (const field of required) {
      if (!address[field].trim()) {
        setError(`Please fill in ${field}`);
        return false;
      }
    }
    return true;
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setError('');
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load payment gateway. Please check your internet connection.');
      }

      // Use finalTotal (after discount) for payment
      const paymentAmount = finalTotal;
      const amountInPaise = Math.round(paymentAmount * 100);

      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountInPaise }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment order');
      }

      const orderData = await response.json();

      // Open Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Shantha Krish Medicals',
        description: `Order of ${cart.length} items${appliedCoupon ? ` (Coupon: ${appliedCoupon.code})` : ''}`,
        order_id: orderData.id,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.verified) {
              // Save order to Supabase (with coupon info)
              const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                  user_id: user.id,
                  items: cart.map(item => ({
                    product_id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                  })),
                  total_amount: paymentAmount,
                  payment_status: 'paid',
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  shipping_address: address,
                  coupon_code: appliedCoupon?.code || null,
                  discount_amount: discount || 0,
                })
                .select()
                .single();

              if (orderError) throw orderError;

              // Record coupon usage and increment used_count
              if (appliedCoupon && supabase) {
                try {
                  await supabase.from('coupon_usage').insert({
                    coupon_id: appliedCoupon.id,
                    user_id: user.id,
                    order_id: order.id,
                  });

                  await supabase
                    .from('coupons')
                    .update({ used_count: (appliedCoupon.used_count || 0) + 1 })
                    .eq('id', appliedCoupon.id);
                } catch (couponErr) {
                  console.error('Coupon usage tracking error:', couponErr);
                  // Don't fail the order for this
                }
              }

              clearCart();
              navigate('/order-success', {
                state: {
                  orderId: order.id,
                  paymentId: response.razorpay_payment_id,
                },
              });
            } else {
              navigate('/order-failure', {
                state: { reason: 'Payment verification failed' },
              });
            }
          } catch (err) {
            console.error('Verification error:', err);
            navigate('/order-failure', {
              state: { reason: err.message },
            });
          }
        },
        prefill: {
          name: address.name,
          contact: address.phone,
          email: user?.email || '',
        },
        theme: {
          color: '#0d9488',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp) {
        navigate('/order-failure', {
          state: { reason: resp.error?.description || 'Payment failed' },
        });
      });
      rzp.open();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page container checkout-page" id="checkout-page">
      <div className="page-header">
        <h1 className="page-title">Checkout</h1>
        <p className="page-subtitle">Complete your order</p>
      </div>

      <div className="checkout-layout">
        {/* Shipping Form */}
        <div className="checkout-form-section">
          <h2 className="checkout-form-title">
            <MapPin size={20} /> Shipping Address
          </h2>

          {error && <div className="auth-error" style={{ marginBottom: '1.25rem' }}>{error}</div>}

          <div className="checkout-form-grid">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Your full name"
                value={address.name}
                onChange={e => handleInputChange('name', e.target.value)}
                id="checkout-name"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone *</label>
              <input
                type="tel"
                className="form-input"
                placeholder="+91 98765 43210"
                value={address.phone}
                onChange={e => handleInputChange('phone', e.target.value)}
                id="checkout-phone"
              />
            </div>
            <div className="form-group full-width">
              <label className="form-label">Street Address *</label>
              <input
                type="text"
                className="form-input"
                placeholder="House/Flat No., Street, Area"
                value={address.street}
                onChange={e => handleInputChange('street', e.target.value)}
                id="checkout-street"
              />
            </div>
            <div className="form-group">
              <label className="form-label">City *</label>
              <input
                type="text"
                className="form-input"
                placeholder="City"
                value={address.city}
                onChange={e => handleInputChange('city', e.target.value)}
                id="checkout-city"
              />
            </div>
            <div className="form-group">
              <label className="form-label">State *</label>
              <input
                type="text"
                className="form-input"
                placeholder="State"
                value={address.state}
                onChange={e => handleInputChange('state', e.target.value)}
                id="checkout-state"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Pincode *</label>
              <input
                type="text"
                className="form-input"
                placeholder="600001"
                value={address.pincode}
                onChange={e => handleInputChange('pincode', e.target.value)}
                id="checkout-pincode"
              />
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="checkout-summary">
          <div className="checkout-summary-card">
            <h3 className="checkout-summary-title">Order Summary</h3>

            {cart.map(item => (
              <div key={item.id} className="checkout-item">
                <img
                  src={item.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100'}
                  alt={item.name}
                  className="checkout-item-image"
                />
                <div className="checkout-item-info">
                  <div className="checkout-item-name">{item.name}</div>
                  <div className="checkout-item-qty">Qty: {item.quantity}</div>
                </div>
                <div className="checkout-item-price">₹{(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}

            <div className="checkout-totals">
              <div className="checkout-total-row">
                <span>Subtotal</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="checkout-total-row" style={{ color: 'var(--success)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Ticket size={14} /> Coupon ({appliedCoupon?.code})
                  </span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}

              <div className="checkout-total-row">
                <span>Delivery</span>
                <span style={{ color: 'var(--success)' }}>Free</span>
              </div>
              <div className="checkout-total-final">
                <span>Total</span>
                <span>₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button
            className="btn btn-primary checkout-pay-btn"
            onClick={handlePayment}
            disabled={loading}
            id="pay-now-btn"
          >
            <CreditCard size={20} />
            {loading ? 'Processing...' : `Pay ₹${finalTotal.toFixed(2)}`}
          </button>

          <div className="checkout-secure-note">
            <Shield size={14} /> Payments secured by Razorpay
          </div>
        </div>
      </div>
    </div>
  );
}
