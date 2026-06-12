import { useState, useEffect } from 'react';
import { productAPI } from '../services/api';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import { IconPlus, IconEdit, IconTrash, IconSearch, IconProducts, IconWarning } from '../components/Icons';

const emptyProduct = { name: '', sku: '', price: '', quantity_in_stock: '' };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const toast = useToast();

  const fetchProducts = async () => {
    try {
      const res = await productAPI.getAll();
      setProducts(res.data);
    } catch (err) {
      toast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyProduct);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name,
      sku: product.sku,
      price: String(product.price),
      quantity_in_stock: String(product.quantity_in_stock),
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.sku.trim()) e.sku = 'SKU is required';
    if (!form.price || isNaN(form.price) || Number(form.price) < 0) e.price = 'Valid price is required';
    if (form.quantity_in_stock === '' || isNaN(form.quantity_in_stock) || Number(form.quantity_in_stock) < 0)
      e.quantity_in_stock = 'Valid quantity is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        sku: form.sku.trim(),
        price: Number(form.price),
        quantity_in_stock: parseInt(form.quantity_in_stock, 10),
      };
      if (editing) {
        await productAPI.update(editing.id, payload);
        toast('Product updated successfully', 'success');
      } else {
        await productAPI.create(payload);
        toast('Product created successfully', 'success');
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      const detail = err.response?.data?.detail || 'Something went wrong';
      toast(detail, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await productAPI.delete(id);
      toast('Product deleted', 'success');
      setConfirmDelete(null);
      fetchProducts();
    } catch (err) {
      toast(err.response?.data?.detail || 'Delete failed', 'error');
    }
  };

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
  });

  const stockBadge = (qty) => {
    if (qty === 0) return <span className="badge badge--danger">Out of stock</span>;
    if (qty <= 10) return <span className="badge badge--warning">{qty} left</span>;
    return <span className="badge badge--success">{qty} in stock</span>;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Products</h1>
          <p>Manage your product inventory</p>
        </div>
        <button id="add-product-btn" className="btn btn--primary" onClick={openAdd}>
          <IconPlus size={18} /> Add Product
        </button>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-search">
            <span className="table-search-icon"><IconSearch size={16} /></span>
            <input
              id="search-products"
              type="text"
              placeholder="Search by name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="table-count">{filtered.length} product{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div style={{ padding: '20px' }}>
            {[1,2,3].map(i => <div key={i} className="skeleton skeleton-row" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><IconProducts size={44} color="var(--text-muted)" /></div>
            <p>{search ? 'No products match your search' : 'No products yet. Add your first product!'}</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                    <td><code className="sku-code">{p.sku}</code></td>
                    <td className="price-cell">₹{Number(p.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td>{stockBadge(p.quantity_in_stock)}</td>
                    <td>
                      <div className="table-actions">
                        <button className="btn-icon btn-icon--edit" title="Edit" onClick={() => openEdit(p)}>
                          <IconEdit size={16} />
                        </button>
                        <button className="btn-icon btn-icon--delete" title="Delete" onClick={() => setConfirmDelete(p)}>
                          <IconTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Product' : 'Add New Product'}
        footer={
          <>
            <button className="btn btn--ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn--primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Saving...' : editing ? 'Update Product' : 'Create Product'}
            </button>
          </>
        }
      >
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Product Name</label>
            <input
              id="product-name"
              className={`form-input ${errors.name ? 'error' : ''}`}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Wireless Mouse"
            />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">SKU / Code</label>
            <input
              id="product-sku"
              className={`form-input ${errors.sku ? 'error' : ''}`}
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              placeholder="e.g. WM-001"
            />
            {errors.sku && <span className="form-error">{errors.sku}</span>}
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Price (₹)</label>
            <input
              id="product-price"
              className={`form-input ${errors.price ? 'error' : ''}`}
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="0.00"
            />
            {errors.price && <span className="form-error">{errors.price}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Quantity in Stock</label>
            <input
              id="product-qty"
              className={`form-input ${errors.quantity_in_stock ? 'error' : ''}`}
              type="number"
              min="0"
              value={form.quantity_in_stock}
              onChange={(e) => setForm({ ...form, quantity_in_stock: e.target.value })}
              placeholder="0"
            />
            {errors.quantity_in_stock && <span className="form-error">{errors.quantity_in_stock}</span>}
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete Product"
        footer={
          <>
            <button className="btn btn--ghost" onClick={() => setConfirmDelete(null)}>Cancel</button>
            <button className="btn btn--danger" onClick={() => handleDelete(confirmDelete.id)}>Delete</button>
          </>
        }
      >
        <div className="confirm-body">
          <div className="confirm-icon" style={{ color: 'var(--accent-rose)' }}><IconWarning size={48} /></div>
          <p className="confirm-title">Are you sure?</p>
          <p className="confirm-message">
            This will permanently delete <strong>{confirmDelete?.name}</strong> (SKU: {confirmDelete?.sku}).
            This action cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  );
}
