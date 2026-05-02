import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronDown, ChevronUp, MapPin, CreditCard, Clock, CheckCircle, XCircle, Truck, ShoppingBag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/my-orders.css';

export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      paid: {
        label: 'Confirmed',
        icon: CheckCircle,
        className: 'status-confirmed',
        description: 'Your order has been confirmed and is being prepared.',
      },
      pending: {
        label: 'Pending',
        icon: Clock,
        className: 'status-pending',
        description: 'Your order is pending payment confirmation.',
      },
      processing: {
        label: 'Processing',
        icon: Package,
        className: 'status-processing',
        description: 'Your order is being prepared for shipment.',
      },
      shipped: {
        label: 'Shipped',
        icon: Truck,
        className: 'status-shipped',
        description: 'Your order is on its way!',
      },
      delivered: {
        label: 'Delivered',
        icon: CheckCircle,
        className: 'status-delivered',
        description: 'Your order has been delivered.',
      },
      failed: {
        label: 'Failed',
        icon: XCircle,
        className: 'status-failed',
        description: 'Payment failed. Please try again.',
      },
      cancelled: {
        label: 'Cancelled',
        icon: XCircle,
        className: 'status-cancelled',
        description: 'This order has been cancelled.',
      },
    };
    return configs[status] || configs.pending;
  };

  const getProgressSteps = (status) => {
    const steps = ['confirmed', 'processing', 'shipped', 'delivered'];
    const statusMap = { paid: 'confirmed', pending: 'pending' };
    const current = statusMap[status] || status;
    const currentIndex = steps.indexOf(current);
    return steps.map((step, index) => ({
      label: step.charAt(0).toUpperCase() + step.slice(1),
      completed: index <= currentIndex,
      active: index === currentIndex,
    }));
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) return <LoadingSpinner text="Loading your orders..." />;

  return (
    <div className="page container my-orders-page" id="my-orders-page">
      <div className="page-header">
        <h1 className="page-title">My Orders</h1>
        <p className="page-subtitle">
          {orders.length > 0
            ? `You have ${orders.length} order${orders.length > 1 ? 's' : ''}`
            : 'Track your order status here'}
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="orders-empty">
          <div className="orders-empty-icon">
            <ShoppingBag size={64} />
          </div>
          <h2 className="orders-empty-title">No orders yet</h2>
          <p className="orders-empty-text">
            When you place an order, it will appear here so you can track its status.
          </p>
          <Link to="/" className="btn btn-primary btn-lg">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const statusConfig = getStatusConfig(order.payment_status);
            const StatusIcon = statusConfig.icon;
            const isExpanded = expandedOrder === order.id;
            const progress = getProgressSteps(order.payment_status);

            return (
              <div
                key={order.id}
                className={`order-card ${isExpanded ? 'expanded' : ''}`}
                id={`order-${order.id.substring(0, 8)}`}
              >
                {/* Order Header */}
                <div
                  className="order-card-header"
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                >
                  <div className="order-card-left">
                    <div className="order-id-row">
                      <span className="order-id-label">Order</span>
                      <span className="order-id-value">
                        #{order.id.substring(0, 8).toUpperCase()}
                      </span>
                    </div>
                    <div className="order-date">{formatDate(order.created_at)}</div>
                  </div>

                  <div className="order-card-center">
                    <div className={`order-status-badge ${statusConfig.className}`}>
                      <StatusIcon size={14} />
                      {statusConfig.label}
                    </div>
                  </div>

                  <div className="order-card-right">
                    <div className="order-total">₹{Number(order.total_amount).toFixed(2)}</div>
                    <div className="order-item-count">
                      {(order.items || []).length} item{(order.items || []).length !== 1 ? 's' : ''}
                    </div>
                    <button className="order-expand-btn" aria-label="Toggle details">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="order-card-body">
                    {/* Status Description */}
                    <div className="order-status-info">
                      <StatusIcon size={18} />
                      <span>{statusConfig.description}</span>
                    </div>

                    {/* Progress Tracker (only for non-failed/cancelled orders) */}
                    {order.payment_status !== 'failed' && order.payment_status !== 'cancelled' && (
                      <div className="order-progress">
                        {progress.map((step, idx) => (
                          <div
                            key={step.label}
                            className={`progress-step ${step.completed ? 'completed' : ''} ${step.active ? 'active' : ''}`}
                          >
                            <div className="progress-dot">
                              {step.completed && <CheckCircle size={14} />}
                            </div>
                            {idx < progress.length - 1 && <div className="progress-line" />}
                            <span className="progress-label">{step.label}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Items */}
                    <div className="order-items-section">
                      <h4 className="order-section-title">
                        <Package size={16} /> Items Ordered
                      </h4>
                      <div className="order-items-list">
                        {(order.items || []).map((item, i) => (
                          <div key={i} className="order-item-row">
                            <div className="order-item-info">
                              <span className="order-item-name">{item.name}</span>
                              <span className="order-item-qty">× {item.quantity}</span>
                            </div>
                            <span className="order-item-price">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="order-items-total">
                        <span>Total</span>
                        <span>₹{Number(order.total_amount).toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    {order.shipping_address && (
                      <div className="order-address-section">
                        <h4 className="order-section-title">
                          <MapPin size={16} /> Delivery Address
                        </h4>
                        <div className="order-address-card">
                          <div className="order-address-name">
                            {order.shipping_address.name}
                          </div>
                          <div className="order-address-line">
                            {order.shipping_address.street}
                          </div>
                          <div className="order-address-line">
                            {order.shipping_address.city}, {order.shipping_address.state} -{' '}
                            {order.shipping_address.pincode}
                          </div>
                          {order.shipping_address.phone && (
                            <div className="order-address-phone">
                              📞 {order.shipping_address.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Payment Info */}
                    {order.razorpay_payment_id && (
                      <div className="order-payment-section">
                        <h4 className="order-section-title">
                          <CreditCard size={16} /> Payment Details
                        </h4>
                        <div className="order-payment-id">
                          Payment ID: {order.razorpay_payment_id}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
