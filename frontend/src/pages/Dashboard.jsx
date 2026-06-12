import { useState, useEffect } from 'react';
import { dashboardAPI, orderAPI } from '../services/api';
import StatsCard from '../components/StatsCard';
import { IconProducts, IconCustomers, IconOrders, IconWarning, IconClock, IconCheckCircle } from '../components/Icons';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [summaryRes, ordersRes] = await Promise.all([
          dashboardAPI.getSummary(),
          orderAPI.getAll(),
        ]);
        setSummary(summaryRes.data);
        setRecentOrders(ordersRes.data.slice(0, 5));
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="page-header"><div><h1>Dashboard</h1><p>Loading overview...</p></div></div>
        <div className="dashboard-stats">
          {[1,2,3,4].map(i => <div key={i} className="skeleton skeleton-card" />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of your inventory and order operations</p>
        </div>
      </div>

      <div className="dashboard-stats">
        <StatsCard
          icon={<IconProducts size={24} />}
          label="Total Products"
          value={summary?.total_products ?? 0}
          variant="blue"
        />
        <StatsCard
          icon={<IconCustomers size={24} />}
          label="Total Customers"
          value={summary?.total_customers ?? 0}
          variant="emerald"
        />
        <StatsCard
          icon={<IconOrders size={24} />}
          label="Total Orders"
          value={summary?.total_orders ?? 0}
          variant="purple"
        />
        <StatsCard
          icon={<IconWarning size={24} />}
          label="Low Stock Alerts"
          value={summary?.low_stock_products?.length ?? 0}
          variant="amber"
        />
      </div>

      <div className="dashboard-grid">
        {/* Recent Orders */}
        <div className="dashboard-section">
          <h3><IconClock size={18} /> Recent Orders</h3>
          {recentOrders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><IconOrders size={40} color="var(--text-muted)" /></div>
              <p>No orders yet</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order.id}>
                      <td style={{ fontWeight: 600 }}>#{order.id}</td>
                      <td>{order.customer_name}</td>
                      <td style={{ fontWeight: 500 }}>₹{Number(order.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td><span className="badge badge--success">{order.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="dashboard-section">
          <h3><IconWarning size={18} /> Low Stock Alerts</h3>
          {(!summary?.low_stock_products || summary.low_stock_products.length === 0) ? (
            <div className="empty-state">
              <div className="empty-state-icon"><IconCheckCircle size={40} color="var(--accent-emerald)" /></div>
              <p>All products are well stocked</p>
            </div>
          ) : (
            summary.low_stock_products.map(p => (
              <div key={p.id} className="low-stock-item">
                <div className="low-stock-info">
                  <span className="low-stock-name">{p.name}</span>
                  <span className="low-stock-sku">SKU: {p.sku}</span>
                </div>
                <span className={`badge ${p.quantity_in_stock === 0 ? 'badge--danger' : 'badge--warning'}`}>
                  {p.quantity_in_stock} left
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
