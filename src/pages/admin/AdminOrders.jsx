import { useState, useEffect } from 'react';
import { Eye, Package } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = orders.filter(o =>
    filter === 'all' || o.payment_status === filter
  );

  const statusBadge = (status) => {
    const map = {
      paid: 'badge-success',
      pending: 'badge-warning',
      failed: 'badge-error',
    };
    return map[status] || 'badge-info';
  };

  if (loading) return <LoadingSpinner text="Loading orders..." />;

  return (
    <div id="admin-orders-page">
      <div className="page-header">
        <h1 className="page-title">Orders</h1>
        <p className="page-subtitle">{orders.length} orders total</p>
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <div className="admin-table-title">All Orders</div>
          <div className="admin-table-actions">
            <select
              className="admin-search"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              style={{ minWidth: '140px' }}
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <Package size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }} />
            <p style={{ color: 'var(--text-muted)' }}>No orders found</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => (
                <tr key={order.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    {order.id.substring(0, 8).toUpperCase()}
                  </td>
                  <td>
                    <div className="admin-order-items">
                      {(order.items || []).map((item, i) => (
                        <span key={i}>
                          {item.name} x{item.quantity}
                          {i < order.items.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>₹{Number(order.total_amount).toFixed(2)}</td>
                  <td>
                    <span className={`badge ${statusBadge(order.payment_status)}`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {new Date(order.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </td>
                  <td>
                    <button
                      className="admin-action-btn edit"
                      onClick={() => setSelectedOrder(order)}
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="admin-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <h3 className="admin-modal-title">Order Details</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Order ID</div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{selectedOrder.id.substring(0, 8).toUpperCase()}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Status</div>
                <span className={`badge ${statusBadge(selectedOrder.payment_status)}`}>
                  {selectedOrder.payment_status}
                </span>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Total</div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary-400)' }}>₹{Number(selectedOrder.total_amount).toFixed(2)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Date</div>
                <div style={{ fontSize: '0.9rem' }}>
                  {new Date(selectedOrder.created_at).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {selectedOrder.razorpay_payment_id && (
              <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Payment ID</div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{selectedOrder.razorpay_payment_id}</div>
              </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>Items:</div>
              {(selectedOrder.items || []).map((item, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0',
                  borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem'
                }}>
                  <span>{item.name} × {item.quantity}</span>
                  <span style={{ fontWeight: 600 }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {selectedOrder.shipping_address && (
              <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Shipping Address</div>
                <div style={{ fontSize: '0.85rem' }}>
                  {selectedOrder.shipping_address.name}, {selectedOrder.shipping_address.street}, {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} - {selectedOrder.shipping_address.pincode}
                </div>
              </div>
            )}

            <div className="admin-modal-actions">
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
