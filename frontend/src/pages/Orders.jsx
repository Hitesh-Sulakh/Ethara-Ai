import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI, productAPI, customerAPI } from '../services/api';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import { IconPlus, IconEye, IconTrash, IconSearch, IconOrders, IconWarning, IconClose } from '../components/Icons';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({
    customer_id: '',
    items: [{ product_id: '', quantity: '' }],
  });
  const [errors, setErrors] = useState({});

  const fetchOrders = async () => {
    try {
      const res = await orderAPI.getAll();
      setOrders(res.data);
    } catch (err) {
      toast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const openCreate = async () => {
    try {
      const [custRes, prodRes] = await Promise.all([
        customerAPI.getAll(),
        productAPI.getAll(),
      ]);
      setCustomers(custRes.data);
      setProducts(prodRes.data);
      setForm({ customer_id: '', items: [{ product_id: '', quantity: '' }] });
      setErrors({});
      setModalOpen(true);
    } catch (err) {
      toast('Failed to load form data', 'error');
    }
  };

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { product_id: '', quantity: '' }] });
  };

  const removeItem = (index) => {
    if (form.items.length <= 1) return;
    setForm({ ...form, items: form.items.filter((_, i) => i !== index) });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...form.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setForm({ ...form, items: newItems });
  };

  const validate = () => {
    const e = {};
    if (!form.customer_id) e.customer_id = 'Select a customer';
    const itemErrors = form.items.map((item) => {
      const ie = {};
      if (!item.product_id) ie.product_id = 'Select a product';
      if (!item.quantity || isNaN(item.quantity) || Number(item.quantity) < 1)
        ie.quantity = 'Min 1';
      return ie;
    });
    if (itemErrors.some((ie) => Object.keys(ie).length > 0)) e.items = itemErrors;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await orderAPI.create({
        customer_id: Number(form.customer_id),
        items: form.items.map((item) => ({
          product_id: Number(item.product_id),
          quantity: Number(item.quantity),
        })),
      });
      toast('Order created successfully', 'success');
      setModalOpen(false);
      fetchOrders();
    } catch (err) {
      const detail = err.response?.data?.detail || 'Something went wrong';
      toast(detail, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await orderAPI.delete(id);
      toast('Order cancelled and stock restored', 'success');
      setConfirmDelete(null);
      fetchOrders();
    } catch (err) {
      toast(err.response?.data?.detail || 'Delete failed', 'error');
    }
  };

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      String(o.id).includes(q) ||
      o.customer_name.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Orders</h1>
          <p>Track and manage customer orders</p>
        </div>
        <button id="create-order-btn" className="btn btn--primary" onClick={openCreate}>
          <IconPlus size={18} /> Create Order
        </button>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-search">
            <span className="table-search-icon"><IconSearch size={16} /></span>
            <input
              id="search-orders"
              type="text"
              placeholder="Search by order # or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="table-count">{filtered.length} order{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div style={{ padding: '20px' }}>
            {[1,2,3].map(i => <div key={i} className="skeleton skeleton-row" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><IconOrders size={44} color="var(--text-muted)" /></div>
            <p>{search ? 'No orders match your search' : 'No orders yet. Create your first order!'}</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id}>
                    <td><span className="order-id-badge">#{o.id}</span></td>
                    <td style={{ fontWeight: 500 }}>{o.customer_name}</td>
                    <td>
                      <span className="badge badge--info">{o.items?.length ?? 0} item{(o.items?.length ?? 0) !== 1 ? 's' : ''}</span>
                    </td>
                    <td className="price-cell">₹{Number(o.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td><span className="badge badge--success">{o.status}</span></td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {new Date(o.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="btn-icon btn-icon--view" title="View Details" onClick={() => navigate(`/orders/${o.id}`)}>
                          <IconEye size={16} />
                        </button>
                        <button className="btn-icon btn-icon--delete" title="Cancel Order" onClick={() => setConfirmDelete(o)}>
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

      {/* Create Order Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New Order"
        footer={
          <>
            <button className="btn btn--ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn--primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Creating...' : 'Place Order'}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Customer</label>
          <select
            id="order-customer"
            className={`form-select ${errors.customer_id ? 'error' : ''}`}
            value={form.customer_id}
            onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
          >
            <option value="">Select a customer...</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
            ))}
          </select>
          {errors.customer_id && <span className="form-error">{errors.customer_id}</span>}
        </div>

        <label className="form-label" style={{ marginBottom: '12px', display: 'block' }}>Order Items</label>
        <div className="order-items-list">
          {form.items.map((item, idx) => (
            <div key={idx} className="order-item-row">
              <div className="form-group">
                <select
                  className={`form-select ${errors.items?.[idx]?.product_id ? 'error' : ''}`}
                  value={item.product_id}
                  onChange={(e) => updateItem(idx, 'product_id', e.target.value)}
                >
                  <option value="">Select product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (₹{Number(p.price).toFixed(2)}) — {p.quantity_in_stock} in stock
                    </option>
                  ))}
                </select>
                {errors.items?.[idx]?.product_id && <span className="form-error">{errors.items[idx].product_id}</span>}
              </div>
              <div className="form-group">
                <input
                  className={`form-input ${errors.items?.[idx]?.quantity ? 'error' : ''}`}
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                  placeholder="Qty"
                />
                {errors.items?.[idx]?.quantity && <span className="form-error">{errors.items[idx].quantity}</span>}
              </div>
              <button
                className="btn-icon btn-icon--delete"
                onClick={() => removeItem(idx)}
                disabled={form.items.length <= 1}
                title="Remove item"
              >
                <IconClose size={14} />
              </button>
            </div>
          ))}
        </div>
        <button className="btn btn--ghost btn--sm add-item-btn" onClick={addItem}>
          <IconPlus size={14} /> Add Another Item
        </button>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Cancel Order"
        footer={
          <>
            <button className="btn btn--ghost" onClick={() => setConfirmDelete(null)}>Keep Order</button>
            <button className="btn btn--danger" onClick={() => handleDelete(confirmDelete.id)}>Cancel Order</button>
          </>
        }
      >
        <div className="confirm-body">
          <div className="confirm-icon" style={{ color: 'var(--accent-rose)' }}><IconWarning size={48} /></div>
          <p className="confirm-title">Cancel Order #{confirmDelete?.id}?</p>
          <p className="confirm-message">
            This will cancel the order and restore stock for all items. This action cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  );
}
