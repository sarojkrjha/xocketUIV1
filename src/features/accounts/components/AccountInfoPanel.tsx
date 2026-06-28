type AccountInfoPanelProps = {
  title: string;
  description?: string;
  items: Array<{ label: string; value?: string | number | null }>;
};

export function AccountInfoPanel({ title, description, items }: AccountInfoPanelProps) {
  return (
    <section className="account-info-panel">
      <div className="account-info-panel-header">
        <h3>{title}</h3>
        {description && <p>{description}</p>}
      </div>
      <dl className="account-key-value-grid">
        {items.map((item) => (
          <div key={item.label} className="account-key-value">
            <dt>{item.label}</dt>
            <dd>{item.value ?? '-'}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
