import type { ReactNode } from 'react';

type StatCardProps = {
  icon?: ReactNode;
  label: string;
  value: string | number;
  helper?: string;
  tone?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
};

export function StatCard({ icon, label, value, helper, tone = 'primary' }: StatCardProps) {
  return (
    <div className={`stat-card stat-card-${tone}`}>
      <div className="stat-card-icon">{icon}</div>
      <div>
        <div className="stat-card-value">{value}</div>
        <div className="stat-card-label">{label}</div>
        {helper ? <div className="stat-card-helper">{helper}</div> : null}
      </div>
    </div>
  );
}
