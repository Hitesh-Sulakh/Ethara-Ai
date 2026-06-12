import { NavLink } from 'react-router-dom';
import { IconDashboard, IconProducts, IconCustomers, IconOrders, IconBolt } from './Icons';

const navItems = [
  { path: '/',          icon: <IconDashboard size={20} />, label: 'Dashboard' },
  { path: '/products',  icon: <IconProducts size={20} />,  label: 'Products' },
  { path: '/customers', icon: <IconCustomers size={20} />, label: 'Customers' },
  { path: '/orders',    icon: <IconOrders size={20} />,    label: 'Orders' },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <IconBolt size={22} color="#fff" />
          </div>
          <div>
            <h2>Ethara AI</h2>
            <span>Inventory System</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(({ path, icon, label }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="sidebar-link-icon">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-footer-badge">v1.0</div>
          <span>Ethara AI © 2026</span>
        </div>
      </aside>
    </>
  );
}
