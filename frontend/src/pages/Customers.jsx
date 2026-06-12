import { useState, useEffect } from 'react';
import { customerAPI } from '../services/api';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import { IconPlus, IconTrash, IconSearch, IconCustomers, IconWarning } from '../components/Icons';

const emptyCustomer = { full_name: '', email: '', phone: '' };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyCustomer);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const toast = useToast();

  const fetchCustomers = async () => {
    try {
      const res = await customerAPI.getAll();
      setCustomers(res.data);
    } catch (err) {
      toast('Failed to load customers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const openAdd = () => {
    setForm(emptyCustomer);
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email format';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await customerAPI.create({
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
      });
      toast('Customer added successfully', 'success');
      setModalOpen(false);
      fetchCustomers();
    } catch (err) {
      const detail = err.response?.data?.detail || 'Something went wrong';
      toast(detail, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await customerAPI.delete(id);
      toast('Customer deleted', 'success');
      setConfirmDelete(null);
      fetchCustomers();
    } catch (err) {
      toast(err.response?.data?.detail || 'Delete failed', 'error');
    }
  };

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return c.full_name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Customers</h1>
          <p>Manage your customer database</p>
        </div>
        <button id="add-customer-btn" className="btn btn--primary" onClick={openAdd}>
          <IconPlus size={18} /> Add Customer
        </button>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-search">
            <span className="table-search-icon"><IconSearch size={16} /></span>
            <input
              id="search-customers"
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="table-count">{filtered.length} customer{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div style={{ padding: '20px' }}>
            {[1,2,3].map(i => <div key={i} className="skeleton skeleton-row" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><IconCustomers size={44} color="var(--text-muted)" /></div>
            <p>{search ? 'No customers match your search' : 'No customers yet. Add your first customer!'}</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div className="customer-name-cell">
                        <div className="avatar">{c.full_name.charAt(0).toUpperCase()}</div>
                        <span style={{ fontWeight: 500 }}>{c.full_name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--accent-blue-light)' }}>{c.email}</td>
                    <td>{c.phone}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {new Date(c.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="btn-icon btn-icon--delete" title="Delete" onClick={() => setConfirmDelete(c)}>
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

      {/* Add Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add New Customer"
        footer={
          <>
            <button className="btn btn--ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn--primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Saving...' : 'Add Customer'}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input
            id="customer-name"
            className={`form-input ${errors.full_name ? 'error' : ''}`}
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            placeholder="e.g. Rahul Sharma"
          />
          {errors.full_name && <span className="form-error">{errors.full_name}</span>}
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              id="customer-email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="e.g. rahul@example.com"
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              id="customer-phone"
              className={`form-input ${errors.phone ? 'error' : ''}`}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="e.g. +91-9876543210"
            />
            {errors.phone && <span className="form-error">{errors.phone}</span>}
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete Customer"
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
            This will permanently delete <strong>{confirmDelete?.full_name}</strong> and all their associated orders.
          </p>
        </div>
      </Modal>
    </div>
  );
}
