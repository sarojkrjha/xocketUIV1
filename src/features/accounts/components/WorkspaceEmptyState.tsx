import type { ReactNode } from 'react';

type WorkspaceEmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description: string;
};

export function WorkspaceEmptyState({ icon, title, description }: WorkspaceEmptyStateProps) {
  return (
    <div className="workspace-empty-state">
      {icon && <div className="workspace-empty-icon">{icon}</div>}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
