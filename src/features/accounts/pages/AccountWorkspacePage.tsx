import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Banknote,
  BriefcaseBusiness,
  CalendarDays,
  ClipboardList,
  ContactRound,
  FileStack,
  Landmark,
  Network,
  Pencil,
  Plus,
  ShieldCheck,
  UserRound
} from 'lucide-react';

import { Button } from '@/shared/components/Button';
import { StatCard } from '@/shared/components/StatCard';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { useAccountDetails } from '../hooks/useAccountDetails';
import { useAccountClaims, useAccountDocuments, useAccountTasks, useAccountTimeline } from '../hooks/useAccountWorkspaceQueries';
import { AccountInfoPanel } from '../components/AccountInfoPanel';
import { AccountWorkspaceSkeleton } from '../components/AccountWorkspaceSkeleton';
import { AccountWorkspaceTabs, type AccountWorkspaceTab } from '../components/AccountWorkspaceTabs';
import { WorkspaceEmptyState } from '../components/WorkspaceEmptyState';
import { AccountMaintenancePanel } from '../components/AccountMaintenancePanel';
import { ClaimsList, DocumentsList, TasksList, TimelineList } from '../components/AccountRelatedData';
import type { AccountDetail } from '../types/account';

type AccountWorkspacePageProps = {
  accountId: number;
  onBackToSearch: () => void;
  onOpenPlacement?: (accountId: number) => void;
};

const TAB_IDS: AccountWorkspaceTab[] = ['overview', 'contacts', 'bankruptcy', 'workflow', 'timeline', 'claims', 'documents', 'tasks', 'audit'];
const RELATED_PAGE_SIZE = 10;

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

function formatCurrency(value?: number | null) {
  return value === null || value === undefined ? '-' : currency.format(value);
}

function formatDate(value?: string | null) {
  if (!value) {
    return '-';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString();
}

function stringValue(value?: string | number | boolean | null) {
  if (value === undefined || value === null || value === '') {
    return '-';
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  return String(value);
}

function maskSsn(last4?: string | null) {
  if (!last4) {
    return '-';
  }

  return `XXX-XX-${last4.padStart(4, '0')}`;
}

function getInitialTab(accountId: number): AccountWorkspaceTab {
  const hash = window.location.hash;
  const match = hash.match(new RegExp(`#?/accounts/${accountId}/([a-z-]+)`));
  const tab = match?.[1] as AccountWorkspaceTab | undefined;
  return tab && TAB_IDS.includes(tab) ? tab : 'overview';
}

export function AccountWorkspacePage({ accountId, onBackToSearch, onOpenPlacement }: AccountWorkspacePageProps) {
  const [activeTab, setActiveTab] = useState<AccountWorkspaceTab>(() => getInitialTab(accountId));
  const accountQuery = useAccountDetails(accountId);
  const account = accountQuery.data;

  const timelineQuery = useAccountTimeline({ accountId, page: 1, pageSize: RELATED_PAGE_SIZE }, activeTab === 'timeline');
  const claimsQuery = useAccountClaims({ accountId, page: 1, pageSize: RELATED_PAGE_SIZE }, activeTab === 'claims');
  const documentsQuery = useAccountDocuments({ accountId, page: 1, pageSize: RELATED_PAGE_SIZE }, activeTab === 'documents');
  const tasksQuery = useAccountTasks({ accountId, page: 1, pageSize: RELATED_PAGE_SIZE }, activeTab === 'tasks');

  useEffect(() => {
    window.history.replaceState(null, '', `#/accounts/${accountId}/${activeTab}`);
  }, [accountId, activeTab]);

  const tabs = useMemo(() => [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'contacts' as const, label: 'Contacts', badge: account?.contacts?.length ?? 0 },
    { id: 'bankruptcy' as const, label: 'Bankruptcy' },
    { id: 'workflow' as const, label: 'Workflow' },
    { id: 'timeline' as const, label: 'Timeline', badge: timelineQuery.data?.totalCount },
    { id: 'claims' as const, label: 'Claims', badge: claimsQuery.data?.totalCount },
    { id: 'documents' as const, label: 'Documents', badge: documentsQuery.data?.totalCount },
    { id: 'tasks' as const, label: 'Tasks', badge: tasksQuery.data?.totalCount },
    { id: 'audit' as const, label: 'Audit' }
  ], [account?.contacts?.length, claimsQuery.data?.totalCount, documentsQuery.data?.totalCount, tasksQuery.data?.totalCount, timelineQuery.data?.totalCount]);

  if (accountQuery.isLoading) {
    return <AccountWorkspaceSkeleton />;
  }

  if (accountQuery.isError || !account) {
    return (
      <div className="placement-page account-workspace-page">
        <Button variant="secondary" onClick={onBackToSearch}><ArrowLeft size={16} /> Back to Search</Button>
        <div className="xocket-alert xocket-alert-danger account-workspace-error">
          {(accountQuery.error as Error)?.message || 'Unable to load account workspace.'}
        </div>
      </div>
    );
  }

  const accountNumber = account.accountNumber ?? account.primaryAccountNumber ?? `#${account.id}`;
  const primaryContactName = account.primaryContactName ?? account.contactName;

  return (
    <div className="placement-page account-workspace-page">
      <nav className="account-breadcrumb" aria-label="Breadcrumb">
        <button type="button" onClick={onBackToSearch}>Accounts</button>
        <span>/</span>
        <button type="button" onClick={onBackToSearch}>Search</button>
        <span>/</span>
        <strong>{accountNumber}</strong>
        <span>/</span>
        <strong className="account-breadcrumb-tab">{activeTab}</strong>
      </nav>

      <section className="account-workspace-hero xocket-card">
        <div className="account-workspace-identity">
          <span className="xocket-pill xocket-pill-primary">Enterprise Account Workspace</span>
          <h1>{accountNumber}</h1>
          <p>
            {account.clientName ?? 'Client not assigned'} · {account.portfolioName ?? 'Portfolio not assigned'}
          </p>
          <div className="account-workspace-meta">
            <StatusBadge label={stringValue(account.status)} />
            {account.isActive !== null && account.isActive !== undefined && (
              <StatusBadge label={account.isActive ? 'Active' : 'Inactive'} />
            )}
            {account.bankruptcyCaseNumber && <StatusBadge label="Bankruptcy" />}
          </div>
        </div>

        <div className="account-action-toolbar">
          <Button variant="secondary" onClick={onBackToSearch}><ArrowLeft size={16} /> Search</Button>
          <Button variant="secondary"><Pencil size={16} /> Edit Account</Button>
          <Button variant="secondary" onClick={() => onOpenPlacement?.(account.id)}><Network size={16} /> Placement</Button>
          <Button><ClipboardList size={16} /> Create Claim</Button>
        </div>
      </section>

      <div className="stat-grid placement-stat-grid account-workspace-stats">
        <StatCard icon={<Banknote size={22} />} value={formatCurrency(account.currentBalance)} label="Current Balance" helper="Account financial position" tone="primary" />
        <StatCard icon={<UserRound size={22} />} value={primaryContactName ?? '-'} label="Primary Contact" helper={maskSsn(account.last4)} tone="info" />
        <StatCard icon={<Landmark size={22} />} value={account.bankruptcyCaseNumber ?? '-'} label="Bankruptcy Case" helper={account.courtName ?? 'Court not assigned'} tone="warning" />
        <StatCard icon={<CalendarDays size={22} />} value={formatDate(account.placementDate)} label="Placement Date" helper="Source placement record" tone="success" />
      </div>

      <AccountWorkspaceTabs activeTab={activeTab} tabs={tabs} onChange={setActiveTab}>
        {renderTab(activeTab, account, { timelineQuery, claimsQuery, documentsQuery, tasksQuery })}
      </AccountWorkspaceTabs>
    </div>
  );
}

type RelatedQueries = {
  timelineQuery: ReturnType<typeof useAccountTimeline>;
  claimsQuery: ReturnType<typeof useAccountClaims>;
  documentsQuery: ReturnType<typeof useAccountDocuments>;
  tasksQuery: ReturnType<typeof useAccountTasks>;
};

function renderTab(activeTab: AccountWorkspaceTab, account: AccountDetail, queries: RelatedQueries) {
  switch (activeTab) {
    case 'overview':
      return <OverviewTab account={account} />;
    case 'contacts':
      return <ContactsTab account={account} />;
    case 'bankruptcy':
      return <BankruptcyTab account={account} />;
    case 'workflow':
      return <AccountMaintenancePanel account={account} />;
    case 'timeline':
      return <TimelineList query={queries.timelineQuery} />;
    case 'claims':
      return <ClaimsList query={queries.claimsQuery} />;
    case 'documents':
      return <DocumentsList query={queries.documentsQuery} />;
    case 'tasks':
      return <TasksList query={queries.tasksQuery} />;
    case 'audit':
      return <WorkspaceEmptyState icon={<BriefcaseBusiness size={28} />} title="Audit foundation ready" description="Audit and workflow history will be surfaced here as backend audit endpoints are exposed." />;
    default:
      return null;
  }
}

function OverviewTab({ account }: { account: AccountDetail }) {
  return (
    <div className="account-overview-grid">
      <AccountInfoPanel
        title="Account Information"
        description="Operational identity and ownership."
        items={[
          { label: 'Account ID', value: account.id },
          { label: 'Account Number', value: account.accountNumber ?? account.primaryAccountNumber },
          { label: 'Client', value: account.clientName ?? account.clientId },
          { label: 'Portfolio', value: account.portfolioName ?? account.portfolioId },
          { label: 'Status', value: stringValue(account.status) },
          { label: 'Active', value: stringValue(account.isActive) }
        ]}
      />

      <AccountInfoPanel
        title="Primary Contact"
        description="Primary debtor/contact details available on the account response."
        items={[
          { label: 'Name', value: account.primaryContactName ?? account.contactName },
          { label: 'Masked SSN', value: maskSsn(account.last4) },
          { label: 'Phone', value: account.phone },
          { label: 'Email', value: account.email }
        ]}
      />

      <AccountInfoPanel
        title="Financial & Placement"
        description="Placement and balance summary."
        items={[
          { label: 'Current Balance', value: formatCurrency(account.currentBalance) },
          { label: 'Placement Date', value: formatDate(account.placementDate) }
        ]}
      />

      <AccountInfoPanel
        title="Bankruptcy Summary"
        description="Current bankruptcy metadata tied to this account."
        items={[
          { label: 'Active Case ID', value: account.activeBankruptcyCaseId ?? account.bankruptcyCaseId },
          { label: 'Case Number', value: account.bankruptcyCaseNumber },
          { label: 'Bankruptcy Status', value: stringValue(account.bankruptcyStatus) },
          { label: 'Filing Date', value: formatDate(account.filingDate) },
          { label: 'Court', value: account.courtName ?? account.courtId }
        ]}
      />
    </div>
  );
}

function ContactsTab({ account }: { account: AccountDetail }) {
  const contacts = account.contacts ?? [];

  if (contacts.length === 0) {
    return (
      <WorkspaceEmptyState
        icon={<ContactRound size={28} />}
        title="No contacts returned"
        description="The account response did not include related contacts. Use the account contact assignment API when contact management is enabled for this workspace."
      />
    );
  }

  return (
    <section className="account-related-panel">
      <div className="account-related-header">
        <div>
          <h3>Contacts</h3>
          <p>Debtor, co-debtor, firm, and other contacts returned by the account workspace response.</p>
        </div>
        <div className="account-related-actions">
          <span className="xocket-pill">GET /api/v1/accounts/{'{accountId}'}</span>
          <Button variant="secondary"><Plus size={16} /> Assign Contact</Button>
        </div>
      </div>

      <div className="account-contact-list enhanced">
        {contacts.map((contact, index) => (
          <div key={`${contact.contactId ?? contact.id ?? index}`} className="account-contact-card enhanced">
            <div className="account-contact-avatar"><ContactRound size={20} /></div>
            <div className="account-contact-main">
              <h3>{contact.contactName ?? contact.fullName ?? `Contact ${index + 1}`}</h3>
              <p>{contact.email ?? 'Email not available'} · {contact.phone ?? 'Phone not available'}</p>
            </div>
            <div className="account-contact-badges">
              {contact.isPrimary && <StatusBadge label="Primary" />}
              <StatusBadge label={stringValue(contact.relationshipType ?? contact.contactType)} />
              <span>{maskSsn(contact.last4)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function BankruptcyTab({ account }: { account: AccountDetail }) {
  return (
    <div className="account-overview-grid single-row">
      <AccountInfoPanel
        title="Bankruptcy Case Context"
        description="Bankruptcy status currently associated with this account."
        items={[
          { label: 'Active Bankruptcy Case ID', value: account.activeBankruptcyCaseId ?? account.bankruptcyCaseId },
          { label: 'Case Number', value: account.bankruptcyCaseNumber },
          { label: 'Status', value: stringValue(account.bankruptcyStatus) },
          { label: 'Filing Date', value: formatDate(account.filingDate) },
          { label: 'Court ID', value: account.courtId },
          { label: 'Court Name', value: account.courtName }
        ]}
      />
      <WorkspaceEmptyState icon={<Landmark size={28} />} title="Placement matching comes next" description="The next workspace will connect placement account detail, bankruptcy candidates, match selection, legal review, and filing assignment." />
    </div>
  );
}
