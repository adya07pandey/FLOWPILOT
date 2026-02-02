export function WorkflowPieChart({ stats }) {
  const data = [
    { label: "Completed", value: stats.completed, color: "#4CAF91" },
    { label: "Running", value: stats.running, color: "#587170" },
    { label: "Pending", value: stats.pending, color: "#B4C3CC" },
    { label: "Blocked", value: stats.blocked, color: "#D97706" },
  ];

  const total = data.reduce((s, d) => s + d.value, 0);
  let cumulativeAngle = 0;

  const getCoordinates = (angle) => {
    const rad = (angle - 90) * (Math.PI / 180);
    return {
      x: 50 + 50 * Math.cos(rad),
      y: 50 + 50 * Math.sin(rad),
    };
  };

  const slices = data.map((d, i) => {
    const angle = total === 0 ? 0 : (d.value / total) * 360;
    const start = getCoordinates(cumulativeAngle);
    cumulativeAngle += angle;
    const end = getCoordinates(cumulativeAngle);

    const largeArc = angle > 180 ? 1 : 0;

    return (
      <path
        key={i}
        d={`M50 50 L ${start.x} ${start.y} A 50 50 0 ${largeArc} 1 ${end.x} ${end.y} Z`}
        fill={d.color}
        className="pie-slice"
      />
    );
  });

  return (
    <div className="pie-wrapper">
      <svg viewBox="0 0 100 100" className="pie">
        {slices}
      </svg>

      <div className="pie-legend">
        {data.map((d) => (
          <div key={d.label} className="legend-row">
            <span className="legend-dot" style={{ background: d.color }} />
            <span className="legend-text">{d.label}</span>
            <span className="legend-value">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
