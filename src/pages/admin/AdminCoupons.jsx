import { useState, useEffect } from 'react';
import { Ticket, Plus, Edit3, Trash2, ToggleLeft, ToggleRight, Search, X, Calendar, Tag, Percent, DollarSign, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/LoadingSpinner';
import '../../styles/coupons.css';

const CATEGORIES = ['Tablets', 'Syrups', 'Equipment', 'First Aid', 'Supplements', 'Hygiene', 'General'];

const emptyCoupon = {
  code: '',
  discount_type: 'percentage',
  discount_value: '',
  min_order_value: '',
  max_discount: '',
  applicable_categories: [],
  expiry_date: '',
  total_usage_limit: '',
  per_user_limit: '1',
  status: true,
};

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...emptyCoupon });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setCoupons(data || []);
    } catch (err) {
      console.error('Error fetching coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyCoupon });
    setError('');
    setShowModal(true);
  };

  const openEdit = (coupon) => {
    setEditing(coupon);
    setForm({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value.toString(),
      min_order_value: coupon.min_order_value?.toString() || '',
      max_discount: coupon.max_discount?.toString() || '',
      applicable_categories: coupon.applicable_categories || [],
      expiry_date: coupon.expiry_date ? new Date(coupon.expiry_date).toISOString().slice(0, 16) : '',
      total_usage_limit: coupon.total_usage_limit?.toString() || '',
      per_user_limit: coupon.per_user_limit?.toString() || '1',
      status: coupon.status,
    });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    setError('');
    if (!form.code.trim()) return setError('Coupon code is required');
    if (!form.discount_value || Number(form.discount_value) <= 0) return setError('Discount value must be > 0');
    if (!form.expiry_date) return setError('Expiry date is required');
    if (form.discount_type === 'percentage' && Number(form.discount_value) > 100) return setError('Percentage cannot exceed 100');

    setSaving(true);
    try {
      const payload = {
        code: form.code.toUpperCase().trim(),
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        min_order_value: form.min_order_value ? Number(form.min_order_value) : 0,
        max_discount: form.max_discount ? Number(form.max_discount) : null,
        applicable_categories: form.applicable_categories.length > 0 ? form.applicable_categories : [],
        expiry_date: new Date(form.expiry_date).toISOString(),
        total_usage_limit: form.total_usage_limit ? Number(form.total_usage_limit) : null,
        per_user_limit: form.per_user_limit ? Number(form.per_user_limit) : 1,
        status: form.status,
        updated_at: new Date().toISOString(),
      };

      if (editing) {
        const { error } = await supabase.from('coupons').update(payload).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('coupons').insert(payload);
        if (error) throw error;
      }

      setShowModal(false);
      fetchCoupons();
    } catch (err) {
      setError(err.message || 'Failed to save coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await supabase.from('coupons').delete().eq('id', id);
      fetchCoupons();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const toggleStatus = async (coupon) => {
    try {
      await supabase.from('coupons').update({ status: !coupon.status }).eq('id', coupon.id);
      fetchCoupons();
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  const toggleCategory = (cat) => {
    setForm(prev => ({
      ...prev,
      applicable_categories: prev.applicable_categories.includes(cat)
        ? prev.applicable_categories.filter(c => c !== cat)
        : [...prev.applicable_categories, cat],
    }));
  };

  const isExpired = (date) => new Date(date) < new Date();

  const filtered = coupons.filter(c =>
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner text="Loading coupons..." />;

  return (
    <div id="admin-coupons-page">
      <div className="page-header">
        <h1 className="page-title">Coupons</h1>
        <p className="page-subtitle">{coupons.length} coupon{coupons.length !== 1 ? 's' : ''} total</p>
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <div className="admin-table-title">All Coupons</div>
          <div className="admin-table-actions">
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                className="admin-search"
                placeholder="Search coupons..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: '2.25rem' }}
              />
            </div>
            <button className="btn btn-primary btn-sm" onClick={openCreate}>
              <Plus size={16} /> Create Coupon
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <Ticket size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }} />
            <p style={{ color: 'var(--text-muted)' }}>No coupons found</p>
          </div>
        ) : (
          <div className="coupon-admin-grid">
            {filtered.map(coupon => (
              <div key={coupon.id} className={`coupon-admin-card ${!coupon.status ? 'inactive' : ''} ${isExpired(coupon.expiry_date) ? 'expired' : ''}`}>
                <div className="coupon-admin-card-header">
                  <div className="coupon-admin-code">
                    <Ticket size={18} />
                    {coupon.code}
                  </div>
                  <div className="coupon-admin-actions">
                    <button className="admin-action-btn" onClick={() => toggleStatus(coupon)} title={coupon.status ? 'Deactivate' : 'Activate'}>
                      {coupon.status ? <ToggleRight size={20} style={{ color: 'var(--success)' }} /> : <ToggleLeft size={20} style={{ color: 'var(--text-muted)' }} />}
                    </button>
                    <button className="admin-action-btn edit" onClick={() => openEdit(coupon)} title="Edit">
                      <Edit3 size={16} />
                    </button>
                    <button className="admin-action-btn delete" onClick={() => handleDelete(coupon.id)} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="coupon-admin-card-body">
                  <div className="coupon-admin-discount">
                    {coupon.discount_type === 'flat' ? (
                      <><span className="coupon-admin-discount-value">₹{coupon.discount_value}</span> OFF</>
                    ) : (
                      <><span className="coupon-admin-discount-value">{coupon.discount_value}%</span> OFF{coupon.max_discount && <span className="coupon-admin-cap"> (max ₹{coupon.max_discount})</span>}</>
                    )}
                  </div>

                  <div className="coupon-admin-meta">
                    {coupon.min_order_value > 0 && (
                      <span className="coupon-admin-chip">Min ₹{coupon.min_order_value}</span>
                    )}
                    <span className={`coupon-admin-chip ${isExpired(coupon.expiry_date) ? 'chip-expired' : 'chip-expiry'}`}>
                      <Calendar size={12} />
                      {isExpired(coupon.expiry_date) ? 'Expired' : new Date(coupon.expiry_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="coupon-admin-chip">
                      Used: {coupon.used_count}{coupon.total_usage_limit ? `/${coupon.total_usage_limit}` : ''}
                    </span>
                  </div>

                  {coupon.applicable_categories && coupon.applicable_categories.length > 0 && (
                    <div className="coupon-admin-categories">
                      {coupon.applicable_categories.map(cat => (
                        <span key={cat} className="coupon-admin-cat-chip">{cat}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="coupon-admin-card-footer">
                  <span className={`coupon-admin-status ${coupon.status ? 'active' : 'inactive'}`}>
                    {coupon.status ? 'Active' : 'Inactive'}
                  </span>
                  <span className="coupon-admin-per-user">
                    {coupon.per_user_limit} use/user
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="coupon-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="coupon-modal" onClick={e => e.stopPropagation()}>
            <div className="coupon-modal-header">
              <h3>{editing ? 'Edit Coupon' : 'Create Coupon'}</h3>
              <button className="coupon-modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>

            <div className="coupon-modal-body">
              {error && <div className="auth-error" style={{ marginBottom: '1rem' }}>{error}</div>}

              <div className="coupon-form-grid">
                <div className="form-group">
                  <label className="form-label">Coupon Code *</label>
                  <input className="form-input" placeholder="e.g. SAVE20" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} />
                </div>

                <div className="form-group">
                  <label className="form-label">Discount Type *</label>
                  <select className="form-input" value={form.discount_type} onChange={e => setForm(p => ({ ...p, discount_type: e.target.value }))}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Discount Value *</label>
                  <input className="form-input" type="number" placeholder={form.discount_type === 'flat' ? '₹ Amount' : '% Value'} value={form.discount_value} onChange={e => setForm(p => ({ ...p, discount_value: e.target.value }))} />
                </div>

                <div className="form-group">
                  <label className="form-label">Min Order Value</label>
                  <input className="form-input" type="number" placeholder="₹0 (no minimum)" value={form.min_order_value} onChange={e => setForm(p => ({ ...p, min_order_value: e.target.value }))} />
                </div>

                {form.discount_type === 'percentage' && (
                  <div className="form-group">
                    <label className="form-label">Max Discount Cap</label>
                    <input className="form-input" type="number" placeholder="₹ Max discount" value={form.max_discount} onChange={e => setForm(p => ({ ...p, max_discount: e.target.value }))} />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Expiry Date *</label>
                  <input className="form-input" type="datetime-local" value={form.expiry_date} onChange={e => setForm(p => ({ ...p, expiry_date: e.target.value }))} />
                </div>

                <div className="form-group">
                  <label className="form-label">Total Usage Limit</label>
                  <input className="form-input" type="number" placeholder="Unlimited" value={form.total_usage_limit} onChange={e => setForm(p => ({ ...p, total_usage_limit: e.target.value }))} />
                </div>

                <div className="form-group">
                  <label className="form-label">Per-User Limit</label>
                  <input className="form-input" type="number" placeholder="1" value={form.per_user_limit} onChange={e => setForm(p => ({ ...p, per_user_limit: e.target.value }))} />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Applicable Categories</label>
                  <div className="coupon-category-chips">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        className={`coupon-cat-chip ${form.applicable_categories.includes(cat) ? 'selected' : ''}`}
                        onClick={() => toggleCategory(cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Leave empty for all categories
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" checked={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.checked }))} />
                    Active
                  </label>
                </div>
              </div>
            </div>

            <div className="coupon-modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editing ? 'Update Coupon' : 'Create Coupon'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
