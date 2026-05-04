import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const CartContext = createContext({});

export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('sk_medicals_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Coupon state
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('sk_medicals_cart', JSON.stringify(cart));
    // Recalculate discount when cart changes
    if (appliedCoupon) {
      const newDiscount = calculateDiscount(appliedCoupon, cart, cartTotalRaw);
      setDiscount(newDiscount);
    }
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
            : item
        );
      }
      return [...prev, { ...product, quantity: Math.min(quantity, product.stock) }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    removeCoupon();
  };

  const cartTotalRaw = cart.reduce(
    (sum, item) => sum + item.price * item.quantity, 0
  );

  const cartTotal = cartTotalRaw;

  const cartCount = cart.reduce(
    (sum, item) => sum + item.quantity, 0
  );

  const finalTotal = Math.max(0, cartTotal - discount);

  // Calculate discount based on coupon
  const calculateDiscount = (coupon, cartItems, total) => {
    if (!coupon) return 0;

    // Check minimum order value
    if (coupon.min_order_value && total < coupon.min_order_value) return 0;

    // Calculate eligible total based on categories
    let eligibleTotal = total;
    const cats = coupon.applicable_categories;
    if (cats && cats.length > 0) {
      eligibleTotal = cartItems
        .filter(item => cats.includes(item.category))
        .reduce((sum, item) => sum + item.price * item.quantity, 0);
    }

    if (eligibleTotal <= 0) return 0;

    let discountAmount = 0;
    if (coupon.discount_type === 'flat') {
      discountAmount = coupon.discount_value;
    } else {
      discountAmount = (eligibleTotal * coupon.discount_value) / 100;
      if (coupon.max_discount && discountAmount > coupon.max_discount) {
        discountAmount = coupon.max_discount;
      }
    }

    // Don't let discount exceed total
    return Math.min(discountAmount, total);
  };

  // Apply coupon
  const applyCoupon = async (code, userId) => {
    setCouponError('');
    setCouponLoading(true);

    try {
      if (!code || !code.trim()) {
        throw new Error('Please enter a coupon code');
      }

      if (!supabase) {
        throw new Error('Service unavailable');
      }

      // Fetch coupon
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase().trim())
        .single();

      if (error || !coupon) {
        throw new Error('Invalid coupon code');
      }

      // Validate status
      if (!coupon.status) {
        throw new Error('This coupon is no longer active');
      }

      // Validate expiry
      if (new Date(coupon.expiry_date) < new Date()) {
        throw new Error('This coupon has expired');
      }

      // Validate total usage limit
      if (coupon.total_usage_limit && coupon.used_count >= coupon.total_usage_limit) {
        throw new Error('This coupon has reached its usage limit');
      }

      // Validate per-user limit
      if (userId && coupon.per_user_limit) {
        const { count } = await supabase
          .from('coupon_usage')
          .select('*', { count: 'exact', head: true })
          .eq('coupon_id', coupon.id)
          .eq('user_id', userId);

        if (count >= coupon.per_user_limit) {
          throw new Error('You have already used this coupon');
        }
      }

      // Validate min order value
      if (coupon.min_order_value && cartTotalRaw < coupon.min_order_value) {
        throw new Error(`Minimum order value of ₹${coupon.min_order_value} required`);
      }

      // Validate category
      const cats = coupon.applicable_categories;
      if (cats && cats.length > 0) {
        const hasEligible = cart.some(item => cats.includes(item.category));
        if (!hasEligible) {
          throw new Error(`This coupon is only valid for: ${cats.join(', ')}`);
        }
      }

      // Calculate discount
      const discountAmount = calculateDiscount(coupon, cart, cartTotalRaw);
      if (discountAmount <= 0) {
        throw new Error('No discount applicable for your current cart');
      }

      setAppliedCoupon(coupon);
      setDiscount(discountAmount);
      setCouponError('');
    } catch (err) {
      setCouponError(err.message);
      setAppliedCoupon(null);
      setDiscount(0);
    } finally {
      setCouponLoading(false);
    }
  };

  // Remove coupon
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponError('');
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartCount,
    // Coupon
    appliedCoupon,
    discount,
    finalTotal,
    couponError,
    couponLoading,
    applyCoupon,
    removeCoupon,
    calculateDiscount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
