import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Eye, Clock, CheckCircle, XCircle, Truck, ShoppingBag, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/myorders.css';

export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user) {
      fetchMyOrders();
    }
  }, [user]);

  const fetchMyOrders = async () => {
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <CheckCircle size={16} />;
      case 'shipped': return <Truck size={16} />;
      case 'delivered': return <CheckCircle size={16} />;
      case 'pending': return <Clock size={16} />;
      case 'failed': return <XCircle size={16} />;
      default: return <Package size={16} />;
    }
  };

  const getStatusClass = (order) => {
    const status = order.status || order.payment_status;
    switch (status) {
      case 'paid': return 'status-paid';
      case 'shipped': return 'status-shipped';
      case 'delivered': return 'status-delivered';
      case 'pending': return 'status-pending';
      case 'failed': return 'status-failed';
      default: return 'status-pending';
    }
  };

  const getDisplayStatus = (order) => {
    return order.status || order.payment_status || 'pending';
  };

  const filteredOrders = orders.filter(o => {
    if (filter === 'all') return true;
    const status = o.status || o.payment_status;
    return status === filter;
  });

  if (loading) return <LoadingSpinner text="Loading your orders..." />;

  if (orders.length === 0) {
    return (
      <div className="page container myorders-page" id="myorders-page">
        <div className="myorders-empty">
          <ShoppingBag size={64} className="myorders-empty-icon" />
          <h2 className="myorders-empty-title">No orders yet</h2>
          <p className="myorders-empty-text">You haven't placed any orders yet. Start shopping to see your orders here.</p>
          <Link to="/" className="btn btn-primary btn-lg">
            Start Shopping <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page container myorders-page" id="myorders-page">
      <div className="myorders-header">
        <div>
          <h1 className="page-title">My Orders</h1>
          <p className="page-subtitle">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
        </div>
        <div className="myorders-filters">
          {['all', 'pending', 'paid', 'shipped', 'delivered', 'failed'].map(f => (
            <button
              key={f}
              className={`myorders-filter-chip ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="myorders-list">
        {filteredOrders.map((order, i) => (
          <div
            key={order.id}
            className="myorder-card animate-fade-in-up"
            style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}
          >
            <div className="myorder-card-header">
              <div className="myorder-card-id">
                <Package size={18} />
                <span>Order #{order.id.substring(0, 8).toUpperCase()}</span>
              </div>
              <span className={`myorder-status ${getStatusClass(order)}`}>
                {getStatusIcon(order)}
                {getDisplayStatus(order)}
              </span>
            </div>

            <div className="myorder-card-body">
              <div className="myorder-items">
                {(order.items || []).map((item, idx) => (
                  <div key={idx} className="myorder-item">
                    <div className="myorder-item-info">
                      <span className="myorder-item-name">{item.name}</span>
                      <span className="myorder-item-qty">× {item.quantity}</span>
                    </div>
                    <span className="myorder-item-price">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="myorder-card-footer">
                <div className="myorder-meta">
                  <span className="myorder-date">
                    <Clock size={14} />
                    {new Date(order.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </span>
                  <span className="myorder-total">Total: <strong>₹{Number(order.total_amount).toFixed(2)}</strong></span>
                </div>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => setSelectedOrder(order)}
                >
                  <Eye size={16} /> View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="myorder-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="myorder-modal" onClick={e => e.stopPropagation()}>
            <div className="myorder-modal-header">
              <h3>Order Details</h3>
              <button className="myorder-modal-close" onClick={() => setSelectedOrder(null)}>×</button>
            </div>

            <div className="myorder-modal-body">
              <div className="myorder-detail-grid">
                <div className="myorder-detail-item">
                  <div className="myorder-detail-label">Order ID</div>
                  <div className="myorder-detail-value" style={{ fontFamily: 'monospace' }}>
                    {selectedOrder.id.substring(0, 8).toUpperCase()}
                  </div>
                </div>
                <div className="myorder-detail-item">
                  <div className="myorder-detail-label">Status</div>
                  <span className={`myorder-status ${getStatusClass(selectedOrder)}`}>
                    {getStatusIcon(selectedOrder)}
                    {getDisplayStatus(selectedOrder)}
                  </span>
                </div>
                <div className="myorder-detail-item">
                  <div className="myorder-detail-label">Total Amount</div>
                  <div className="myorder-detail-value" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                    ₹{Number(selectedOrder.total_amount).toFixed(2)}
                  </div>
                </div>
                <div className="myorder-detail-item">
                  <div className="myorder-detail-label">Date</div>
                  <div className="myorder-detail-value">
                    {new Date(selectedOrder.created_at).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {selectedOrder.razorpay_payment_id && (
                <div className="myorder-payment-info">
                  <div className="myorder-detail-label">Payment ID</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    {selectedOrder.razorpay_payment_id}
                  </div>
                </div>
              )}

              <div className="myorder-items-detail">
                <div className="myorder-detail-label" style={{ marginBottom: '0.5rem' }}>Items</div>
                {(selectedOrder.items || []).map((item, i) => (
                  <div key={i} className="myorder-item-detail-row">
                    <span>{item.name} × {item.quantity}</span>
                    <span style={{ fontWeight: 600 }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {selectedOrder.shipping_address && (
                <div className="myorder-shipping-info">
                  <div className="myorder-detail-label" style={{ marginBottom: '0.25rem' }}>Shipping Address</div>
                  <div style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
                    {selectedOrder.shipping_address.name}<br />
                    {selectedOrder.shipping_address.street}<br />
                    {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} - {selectedOrder.shipping_address.pincode}
                  </div>
                </div>
              )}
            </div>

            <div className="myorder-modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedOrder(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
