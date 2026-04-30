import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/LoadingSpinner';

const CATEGORIES = ['Tablets', 'Syrups', 'Equipment', 'First Aid', 'Supplements', 'Hygiene', 'General'];

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    stock: '',
    category: 'General',
  });

  useEffect(() => {
    if (isEdit) fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setForm({
        name: data.name || '',
        description: data.description || '',
        price: data.price?.toString() || '',
        image_url: data.image_url || '',
        stock: data.stock?.toString() || '',
        category: data.category || 'General',
      });
    } catch (err) {
      console.error('Error:', err);
      setError('Product not found');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate
    if (!form.name.trim()) { setError('Product name is required'); return; }
    if (!form.price || Number(form.price) <= 0) { setError('Valid price is required'); return; }
    if (form.stock === '' || Number(form.stock) < 0) { setError('Valid stock quantity is required'); return; }

    setSaving(true);
    try {
      const productData = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        image_url: form.image_url.trim(),
        stock: Number(form.stock),
        category: form.category,
        updated_at: new Date().toISOString(),
      };

      if (isEdit) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData);
        if (error) throw error;
      }

      navigate('/admin/products');
    } catch (err) {
      setError(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading product..." />;

  return (
    <div className="admin-form-page" id="admin-product-form">
      <Link to="/admin/products" className="product-detail-back" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
        <ArrowLeft size={18} /> Back to Products
      </Link>

      <div className="page-header">
        <h1 className="page-title">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
        <p className="page-subtitle">{isEdit ? 'Update product details' : 'Create a new product listing'}</p>
      </div>

      <div className="admin-form-card">
        {error && <div className="auth-error" style={{ marginBottom: '1.25rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="admin-form-grid">
            <div className="form-group full-width">
              <label className="form-label" htmlFor="product-name">Product Name *</label>
              <input
                type="text"
                id="product-name"
                className="form-input"
                placeholder="e.g., Paracetamol 500mg"
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                required
              />
            </div>

            <div className="form-group full-width">
              <label className="form-label" htmlFor="product-description">Description</label>
              <textarea
                id="product-description"
                className="form-input form-textarea"
                placeholder="Enter product description..."
                value={form.description}
                onChange={e => handleChange('description', e.target.value)}
                rows={4}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="product-price">Price (₹) *</label>
              <input
                type="number"
                id="product-price"
                className="form-input"
                placeholder="0.00"
                min="0.01"
                step="0.01"
                value={form.price}
                onChange={e => handleChange('price', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="product-stock">Stock Quantity *</label>
              <input
                type="number"
                id="product-stock"
                className="form-input"
                placeholder="0"
                min="0"
                value={form.stock}
                onChange={e => handleChange('stock', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="product-category">Category</label>
              <select
                id="product-category"
                className="form-input"
                value={form.category}
                onChange={e => handleChange('category', e.target.value)}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group full-width">
              <label className="form-label" htmlFor="product-image">Image URL</label>
              <input
                type="url"
                id="product-image"
                className="form-input"
                placeholder="https://example.com/image.jpg"
                value={form.image_url}
                onChange={e => handleChange('image_url', e.target.value)}
              />
              {form.image_url && (
                <div className="image-preview">
                  <img
                    src={form.image_url}
                    alt="Preview"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              id="save-product-btn"
            >
              <Save size={18} />
              {saving ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product')}
            </button>
            <Link to="/admin/products" className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
