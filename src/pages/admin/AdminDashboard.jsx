import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, BarChart3, Home } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import '../../styles/admin.css';

export default function AdminDashboard() {
  const location = useLocation();
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  const isActive = (path) => {
    if (path === '/admin' && location.pathname === '/admin') return 'active';
    if (path !== '/admin' && location.pathname.startsWith(path)) return 'active';
    return '';
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact' }),
        supabase.from('orders').select('*'),
      ]);

      const orders = ordersRes.data || [];
      const revenue = orders
        .filter(o => o.payment_status === 'paid' || o.status === 'shipped' || o.status === 'delivered')
        .reduce((sum, o) => sum + Number(o.total_amount), 0);
      const pending = orders.filter(o => o.status === 'pending' || o.payment_status === 'pending').length;

      setStats({
        products: productsRes.count || 0,
        orders: orders.length,
        revenue,
        pending,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const showDashboard = location.pathname === '/admin';

  return (
    <div className="admin-layout" id="admin-panel">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-title">Admin Panel</div>
        <nav className="admin-sidebar-nav">
          <Link to="/admin" className={`admin-sidebar-link ${isActive('/admin')}`}>
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/admin/products" className={`admin-sidebar-link ${isActive('/admin/products')}`}>
            <Package size={20} /> Products
          </Link>
          <Link to="/admin/orders" className={`admin-sidebar-link ${isActive('/admin/orders')}`}>
            <ShoppingCart size={20} /> Orders
          </Link>
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Link to="/" className="admin-sidebar-link">
              <Home size={20} /> Back to Store
            </Link>
          </div>
        </nav>
      </aside>

      <main className="admin-content">
        {showDashboard ? (
          <>
            <div className="page-header">
              <h1 className="page-title">Dashboard</h1>
              <p className="page-subtitle">Welcome to Shantha Krish Medicals Admin</p>
            </div>

            <div className="admin-stats">
              <div className="admin-stat-card">
                <div className="admin-stat-header">
                  <div className="admin-stat-icon teal">
                    <Package size={22} />
                  </div>
                </div>
                <div className="admin-stat-value">{stats.products}</div>
                <div className="admin-stat-label">Total Products</div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-header">
                  <div className="admin-stat-icon indigo">
                    <ShoppingCart size={22} />
                  </div>
                </div>
                <div className="admin-stat-value">{stats.orders}</div>
                <div className="admin-stat-label">Total Orders</div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-header">
                  <div className="admin-stat-icon green">
                    <BarChart3 size={22} />
                  </div>
                </div>
                <div className="admin-stat-value">₹{stats.revenue.toFixed(0)}</div>
                <div className="admin-stat-label">Total Revenue</div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-header">
                  <div className="admin-stat-icon amber">
                    <ShoppingCart size={22} />
                  </div>
                </div>
                <div className="admin-stat-value">{stats.pending}</div>
                <div className="admin-stat-label">Pending Orders</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <Link to="/admin/products" className="card" style={{ padding: '2rem', textAlign: 'center', textDecoration: 'none' }}>
                <Package size={36} style={{ color: 'var(--primary-400)', marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Manage Products</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Add, edit, or remove products</p>
              </Link>
              <Link to="/admin/orders" className="card" style={{ padding: '2rem', textAlign: 'center', textDecoration: 'none' }}>
                <ShoppingCart size={36} style={{ color: 'var(--accent-400)', marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>View Orders</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Track and manage customer orders</p>
              </Link>
            </div>
          </>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}
