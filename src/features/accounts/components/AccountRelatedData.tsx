import type { ReactNode } from 'react';
import { CalendarDays, ClipboardList, FileStack, ListChecks } from 'lucide-react';
import type { UseQueryResult } from '@tanstack/react-query';

import { Button } from '@/shared/components/Button';
import { StatusBadge } from '@/shared/components/StatusBadge';
import type { PagedResult } from '@/shared/api/pagination';
import { WorkspaceEmptyState } from './WorkspaceEmptyState';
import type { ClaimSummaryRow, DocumentSummaryRow, TaskSummaryRow, TimelineEventRow } from '../api/accountWorkspaceApi';

type RelatedPanelProps<T> = {
  title: string;
  subtitle: string;
  query: UseQueryResult<PagedResult<T>, Error>;
  emptyIcon: ReactNode;
  emptyTitle: string;
  emptyDescription: string;
  renderItem: (item: T) => React.ReactNode;
  endpointLabel: string;
};

function formatDateTime(value?: string | null) {
  if (!value) {
    return '-';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString();
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

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

function formatCurrency(value?: number | null) {
  return value === null || value === undefined ? '-' : currency.format(value);
}

function stringValue(value?: string | number | null) {
  if (value === undefined || value === null || value === '') {
    return 'Unknown';
  }

  return String(value);
}

export function RelatedDataPanel<T>({
  title,
  subtitle,
  query,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  renderItem,
  endpointLabel
}: RelatedPanelProps<T>) {
  const rows = query.data?.items ?? [];

  return (
    <section className="account-related-panel">
      <div className="account-related-header">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        <div className="account-related-actions">
          <span className="xocket-pill">{endpointLabel}</span>
          <Button variant="secondary" disabled={query.isFetching} onClick={() => query.refetch()}>Refresh</Button>
        </div>
      </div>

      {query.isLoading || query.isFetching ? (
        <div className="account-related-skeleton">
          <span />
          <span />
          <span />
        </div>
      ) : null}

      {query.isError && (
        <div className="xocket-alert xocket-alert-danger">
          {query.error?.message || 'Unable to load related records.'}
        </div>
      )}

      {!query.isLoading && !query.isError && rows.length === 0 && (
        <WorkspaceEmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
      )}

      {!query.isLoading && !query.isError && rows.length > 0 && (
        <div className="account-related-list">
          {rows.map(renderItem)}
        </div>
      )}
    </section>
  );
}

export function TimelineList({ query }: { query: UseQueryResult<PagedResult<TimelineEventRow>, Error> }) {
  return (
    <RelatedDataPanel<TimelineEventRow>
      title="Enterprise Timeline"
      subtitle="Chronological activity for this account workspace."
      query={query}
      endpointLabel="GET /api/v1/timeline"
      emptyIcon={<ListChecks size={28} />}
      emptyTitle="No timeline activity yet"
      emptyDescription="Timeline events will appear here when account, placement, claim, document, and workflow activity is recorded."
      renderItem={(item) => (
        <div className="enterprise-timeline-item" key={item.id}>
          <div className="enterprise-timeline-marker" />
          <div className="enterprise-timeline-content">
            <div className="enterprise-timeline-title-row">
              <h4>{item.title ?? item.eventType ?? 'Timeline Event'}</h4>
              <StatusBadge label={item.eventType ?? 'Event'} />
            </div>
            <p>{item.description ?? 'No description captured.'}</p>
            <small>{formatDateTime(item.eventUtc)} · {item.createdByUserId ?? 'System'}</small>
          </div>
        </div>
      )}
    />
  );
}

export function ClaimsList({ query }: { query: UseQueryResult<PagedResult<ClaimSummaryRow>, Error> }) {
  return (
    <RelatedDataPanel<ClaimSummaryRow>
      title="Claims"
      subtitle="Proof of Claim records connected to this account."
      query={query}
      endpointLabel="GET /api/v1/claims"
      emptyIcon={<ClipboardList size={28} />}
      emptyTitle="No claims found for this account"
      emptyDescription="When a Proof of Claim is created, it will appear here with filing, receipt, and payment status."
      renderItem={(item) => (
        <div className="account-related-row" key={item.id}>
          <div>
            <h4>Claim #{item.claimId ?? item.id}</h4>
            <p>{item.bankruptcyCaseNumber ?? `Case ID ${item.bankruptcyCaseId ?? '-'}`}</p>
          </div>
          <div className="account-related-metrics">
            <strong>{formatCurrency(item.claimAmount)}</strong>
            <span>Bar Date: {formatDate(item.barDate)}</span>
          </div>
          <StatusBadge label={stringValue(item.status)} />
        </div>
      )}
    />
  );
}

export function DocumentsList({ query }: { query: UseQueryResult<PagedResult<DocumentSummaryRow>, Error> }) {
  return (
    <RelatedDataPanel<DocumentSummaryRow>
      title="Documents"
      subtitle="Generated and uploaded documents attached to this account."
      query={query}
      endpointLabel="GET /api/v1/documents"
      emptyIcon={<FileStack size={28} />}
      emptyTitle="No documents attached"
      emptyDescription="Generated POC packages, receipts, supporting files, and uploaded documents will appear here."
      renderItem={(item) => (
        <div className="account-related-row document-row" key={item.id}>
          <div>
            <h4>{item.fileName ?? `Document ${item.documentId ?? item.id}`}</h4>
            <p>{item.documentType ?? 'Document'} · Version {item.version ?? '-'}</p>
          </div>
          <div className="account-related-metrics">
            <span>{formatDateTime(item.createdOnUtc)}</span>
            <span>{item.generatedBy ?? item.uploadedBy ?? 'System'}</span>
          </div>
          <StatusBadge label={stringValue(item.status)} />
        </div>
      )}
    />
  );
}

export function TasksList({ query }: { query: UseQueryResult<PagedResult<TaskSummaryRow>, Error> }) {
  return (
    <RelatedDataPanel<TaskSummaryRow>
      title="Tasks"
      subtitle="Operational tasks linked to this account."
      query={query}
      endpointLabel="GET /api/v1/tasks"
      emptyIcon={<CalendarDays size={28} />}
      emptyTitle="No open tasks"
      emptyDescription="Follow-up tasks, review tasks, and workflow work items will appear here."
      renderItem={(item) => (
        <div className="account-related-row task-row" key={item.id}>
          <div>
            <h4>{item.title ?? `Task ${item.taskId ?? item.id}`}</h4>
            <p>{item.description ?? 'No description captured.'}</p>
          </div>
          <div className="account-related-metrics">
            <strong>Due: {formatDateTime(item.dueUtc)}</strong>
            <span>Assigned: {item.assignedToUserId ?? 'Unassigned'}</span>
          </div>
          <div className="account-related-status-stack">
            <StatusBadge label={`Priority ${stringValue(item.priority)}`} />
            <StatusBadge label={stringValue(item.status)} />
          </div>
        </div>
      )}
    />
  );
}
