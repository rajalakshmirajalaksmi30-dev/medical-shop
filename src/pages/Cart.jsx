import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Trash2, Ticket, X, ChevronDown, ChevronUp, Clock, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import CartItem from '../components/CartItem';
import '../styles/cart.css';
import '../styles/coupons.css';

export default function Cart() {
  const {
    cart, cartTotal, cartCount, clearCart,
    appliedCoupon, discount, finalTotal,
    couponError, couponLoading, applyCoupon, removeCoupon, calculateDiscount,
  } = useCart();
  const { user } = useAuth();

  const [couponCode, setCouponCode] = useState('');
  const [showAvailable, setShowAvailable] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  useEffect(() => {
    if (showAvailable && availableCoupons.length === 0) {
      fetchAvailableCoupons();
    }
  }, [showAvailable]);

  const fetchAvailableCoupons = async () => {
    if (!supabase) return;
    setLoadingCoupons(true);
    try {
      const { data } = await supabase
        .from('coupons')
        .select('*')
        .eq('status', true)
        .gte('expiry_date', new Date().toISOString())
        .order('discount_value', { ascending: false });

      // Filter out coupons that have exceeded total usage limit
      const valid = (data || []).filter(c =>
        !c.total_usage_limit || c.used_count < c.total_usage_limit
      );
      setAvailableCoupons(valid);
    } catch (err) {
      console.error('Error fetching coupons:', err);
    } finally {
      setLoadingCoupons(false);
    }
  };

  const handleApply = () => {
    if (!couponCode.trim()) return;
    applyCoupon(couponCode, user?.id);
  };

  const handleSelectCoupon = (code) => {
    setCouponCode(code);
    applyCoupon(code, user?.id);
    setShowAvailable(false);
  };

  // Find which coupon gives the best deal
  const getBestDealCode = () => {
    if (availableCoupons.length === 0 || cartTotal <= 0) return null;
    let best = null;
    let bestDiscount = 0;
    for (const c of availableCoupons) {
      const d = calculateDiscount(c, cart, cartTotal);
      if (d > bestDiscount) {
        bestDiscount = d;
        best = c.code;
      }
    }
    return best;
  };

  const bestDealCode = getBestDealCode();

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

          {discount > 0 && (
            <div className="cart-summary-discount">
              <span>Discount ({appliedCoupon?.code})</span>
              <span>-₹{discount.toFixed(2)}</span>
            </div>
          )}

          <div className="cart-summary-row label">
            <span>Delivery</span>
            <span style={{ color: 'var(--success)' }}>Free</span>
          </div>

          <div className="cart-summary-divider"></div>

          <div className="cart-summary-total">
            <span>Total</span>
            <span className="cart-summary-total-value">₹{finalTotal.toFixed(2)}</span>
          </div>

          {/* Coupon Section */}
          <div className="coupon-section">
            <div className="coupon-section-title">
              <Ticket size={18} /> Apply Coupon
            </div>

            {appliedCoupon ? (
              <div className="coupon-applied">
                <div className="coupon-applied-info">
                  <span className="coupon-applied-code">✅ {appliedCoupon.code}</span>
                  <span className="coupon-applied-saving">You save ₹{discount.toFixed(2)}</span>
                </div>
                <button className="coupon-remove-btn" onClick={removeCoupon} title="Remove coupon">
                  <X size={18} />
                </button>
              </div>
            ) : (
              <>
                <div className="coupon-input-row">
                  <input
                    className="coupon-input"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === 'Enter' && handleApply()}
                    id="coupon-input"
                  />
                  <button
                    className="coupon-apply-btn"
                    onClick={handleApply}
                    disabled={couponLoading || !couponCode.trim()}
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </div>

                {couponError && (
                  <div className="coupon-error">{couponError}</div>
                )}
              </>
            )}

            {/* Available Coupons */}
            {!appliedCoupon && (
              <>
                <button
                  className="coupon-available-toggle"
                  onClick={() => setShowAvailable(!showAvailable)}
                >
                  <Sparkles size={14} />
                  {showAvailable ? 'Hide' : 'View'} available coupons
                  {showAvailable ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {showAvailable && (
                  <div className="coupon-available-list">
                    {loadingCoupons ? (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>Loading...</p>
                    ) : availableCoupons.length === 0 ? (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>No coupons available</p>
                    ) : (
                      availableCoupons.map(c => {
                        const savings = calculateDiscount(c, cart, cartTotal);
                        const isEligible = savings > 0;
                        return (
                          <div
                            key={c.id}
                            className="coupon-available-item"
                            onClick={() => isEligible && handleSelectCoupon(c.code)}
                            style={{ opacity: isEligible ? 1 : 0.5, cursor: isEligible ? 'pointer' : 'not-allowed' }}
                          >
                            {c.code === bestDealCode && <span className="coupon-best-deal">Best Deal</span>}
                            <div className="coupon-available-item-left">
                              <span className="coupon-available-item-code">{c.code}</span>
                              <span className="coupon-available-item-desc">
                                {c.discount_type === 'flat'
                                  ? `₹${c.discount_value} off`
                                  : `${c.discount_value}% off${c.max_discount ? ` (max ₹${c.max_discount})` : ''}`
                                }
                                {c.min_order_value > 0 ? ` on orders ≥ ₹${c.min_order_value}` : ''}
                              </span>
                            </div>
                            <div className="coupon-available-item-right">
                              {isEligible ? (
                                <span className="coupon-available-item-discount">-₹{savings.toFixed(0)}</span>
                              ) : (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Not eligible</span>
                              )}
                              <div className="coupon-available-item-expiry">
                                <Clock size={10} />
                                {new Date(c.expiry_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {user ? (
            <Link to="/checkout" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '1.25rem' }} id="checkout-btn">
              Proceed to Checkout <ArrowRight size={18} />
            </Link>
          ) : (
            <Link to="/login" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '1.25rem' }}>
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
