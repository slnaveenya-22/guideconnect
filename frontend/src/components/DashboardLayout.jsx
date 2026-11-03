export default function DashboardLayout({ children, title, subtitle }) {
  return (
    <div style={{ padding: '2rem', width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
      {title && (
        <div className="mb-4">
          <h2 style={{ fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--gc-navy)', marginBottom: '0.25rem' }}>
            {title}
          </h2>
          {subtitle && <p className="text-muted-2 mb-0">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}