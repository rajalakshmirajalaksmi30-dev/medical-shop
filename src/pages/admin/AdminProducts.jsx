import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, Package } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', deleteModal.id);

      if (error) throw error;
      setProducts(prev => prev.filter(p => p.id !== deleteModal.id));
      setDeleteModal(null);
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete product: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner text="Loading products..." />;

  return (
    <div id="admin-products-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{products.length} products total</p>
        </div>
        <Link to="/admin/products/new" className="btn btn-primary" id="add-product-btn">
          <Plus size={18} /> Add Product
        </Link>
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <div className="admin-table-title">All Products</div>
          <div className="admin-table-actions">
            <input
              type="text"
              className="admin-search"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <Package size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }} />
            <p style={{ color: 'var(--text-muted)' }}>No products found</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(product => (
                <tr key={product.id}>
                  <td>
                    <img
                      src={product.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100'}
                      alt={product.name}
                      className="admin-table-image"
                    />
                  </td>
                  <td>
                    <div className="admin-table-product-name">{product.name}</div>
                  </td>
                  <td>
                    <span className="badge badge-info">{product.category || 'General'}</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>₹{Number(product.price).toFixed(2)}</td>
                  <td>
                    <span className={`badge ${product.stock > 0 ? 'badge-success' : 'badge-error'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td>
                    <div className="admin-table-actions-cell">
                      <button
                        className="admin-action-btn edit"
                        onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="admin-action-btn delete"
                        onClick={() => setDeleteModal(product)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="admin-modal-overlay" onClick={() => setDeleteModal(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3 className="admin-modal-title">Delete Product</h3>
            <p className="admin-modal-text">
              Are you sure you want to delete "<strong>{deleteModal.name}</strong>"? This action cannot be undone.
            </p>
            <div className="admin-modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteModal(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
