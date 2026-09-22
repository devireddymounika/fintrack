function StatCard({
  title,
  amount,
  change,
  type = 'default',
  icon,
  subtext = 'vs last month',
}) {
  const isPositive = typeof change === 'number' ? change >= 0 : true;

  return (
    <div className={`stat-card ${type}`}>
      <div className="stat-top">
        <div className="stat-info">
          <span className="stat-title">{title}</span>
          <h2 className="stat-amount">{amount}</h2>
        </div>

        {icon && <div className={`stat-icon ${type}`}>{icon}</div>}
      </div>

      {change !== undefined && (
        <div className="stat-bottom">
          <span className={`stat-trend ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? '↑' : '↓'} {Math.abs(change)}%
          </span>
          <span className="stat-subtext">{subtext}</span>
        </div>
      )}
    </div>
  );
}

export default StatCard;