import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { useToast } from '../components/Toast';
import { IconArrowLeft, IconClipboard, IconProducts } from '../components/Icons';

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await orderAPI.getById(id);
        setOrder(res.data);
      } catch (err) {
        toast('Order not found', 'error');
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div>
        <div className="page-header"><div><h1>Order Details</h1><p>Loading...</p></div></div>
        <div className="skeleton skeleton-card" style={{ height: '200px', marginBottom: '20px' }} />
        <div className="skeleton skeleton-card" style={{ height: '300px' }} />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Order #{order.id}</h1>
          <p>Complete order details and line items</p>
        </div>
        <button className="btn btn--ghost" onClick={() => navigate('/orders')}>
          <IconArrowLeft size={16} /> Back to Orders
        </button>
      </div>

      {/* Order Summary */}
      <div className="order-details-card">
        <h3><IconClipboard size={18} /> Order Summary</h3>
        <div className="order-meta">
          <div className="order-meta-item">
            <span className="order-meta-label">Order ID</span>
            <span className="order-meta-value"><span className="order-id-badge">#{order.id}</span></span>
          </div>
          <div className="order-meta-item">
            <span className="order-meta-label">Customer</span>
            <span className="order-meta-value">{order.customer_name}</span>
          </div>
          <div className="order-meta-item">
            <span className="order-meta-label">Status</span>
            <span className="badge badge--success" style={{ alignSelf: 'flex-start', marginTop: '2px' }}>{order.status}</span>
          </div>
          <div className="order-meta-item">
            <span className="order-meta-label">Date</span>
            <span className="order-meta-value">
              {new Date(order.created_at).toLocaleDateString('en-IN', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </span>
          </div>
          <div className="order-meta-item">
            <span className="order-meta-label">Total Amount</span>
            <span className="order-meta-value order-total">
              ₹{Number(order.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="table-container">
        <div className="table-toolbar">
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-white)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IconProducts size={18} /> Order Items ({order.items?.length ?? 0})
          </h3>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Unit Price</th>
                <th>Quantity</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 500 }}>{item.product_name}</td>
                  <td><code className="sku-code">{item.product_sku}</code></td>
                  <td>₹{Number(item.unit_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td><span className="badge badge--info">{item.quantity}</span></td>
                  <td className="price-cell">₹{Number(item.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
              {/* Totals row */}
              <tr className="totals-row">
                <td colSpan="4" style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)' }}>Grand Total</td>
                <td className="price-cell" style={{ fontWeight: 700, color: 'var(--accent-emerald-light)', fontSize: '1.05rem' }}>
                  ₹{Number(order.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
