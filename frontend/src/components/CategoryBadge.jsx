const COLORS = {
  FOOD:        { bg: 'rgba(239,68,68,0.1)',   fg: '#dc2626' },
  HERITAGE:    { bg: 'rgba(180,83,9,0.1)',    fg: '#b45309' },
  SHOPPING:    { bg: 'rgba(219,39,119,0.1)',  fg: '#db2777' },
  CULTURE:     { bg: 'rgba(139,92,246,0.1)',  fg: '#7c3aed' },
  SIGHTSEEING: { bg: 'rgba(37,99,235,0.1)',   fg: '#2563eb' },
  NATURE:      { bg: 'rgba(16,185,129,0.1)',  fg: '#059669' },
  OTHER:       { bg: 'rgba(100,116,139,0.1)', fg: '#475569' },
};

export default function CategoryBadge({ category, size = 'sm' }) {
  const c = COLORS[category] || COLORS.OTHER;
  return (
    <span
      style={{
        background: c.bg,
        color: c.fg,
        padding: size === 'sm' ? '2px 8px' : '4px 12px',
        borderRadius: 6,
        fontSize: size === 'sm' ? '0.68rem' : '0.78rem',
        fontWeight: 700,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        display: 'inline-block',
      }}
    >
      {category}
    </span>
  );
}