import type { ReactNode } from 'react';

export type AccountWorkspaceTab = 'overview' | 'contacts' | 'bankruptcy' | 'workflow' | 'timeline' | 'claims' | 'documents' | 'tasks' | 'audit';

type TabDefinition = {
  id: AccountWorkspaceTab;
  label: string;
  badge?: string | number | null;
};

type AccountWorkspaceTabsProps = {
  activeTab: AccountWorkspaceTab;
  tabs: TabDefinition[];
  onChange: (tab: AccountWorkspaceTab) => void;
  children: ReactNode;
};

export function AccountWorkspaceTabs({ activeTab, tabs, onChange, children }: AccountWorkspaceTabsProps) {
  return (
    <section className="xocket-card account-tabs-card">
      <div className="account-tabs" role="tablist" aria-label="Account workspace sections">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`account-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onChange(tab.id)}
          >
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge !== null && <small>{tab.badge}</small>}
          </button>
        ))}
      </div>
      <div className="account-tab-content" role="tabpanel">
        {children}
      </div>
    </section>
  );
}
