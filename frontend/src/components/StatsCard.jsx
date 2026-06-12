export default function StatsCard({ icon, label, value, variant = 'blue' }) {
  return (
    <div className={`stats-card stats-card--${variant}`}>
      <div className="stats-card-header">
        <span className="stats-card-label">{label}</span>
        <div className={`stats-card-icon stats-card-icon--${variant}`}>{icon}</div>
      </div>
      <div className="stats-card-value">{value}</div>
    </div>
  );
}
