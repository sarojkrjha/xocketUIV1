import { useMemo, useState } from 'react';
import type { ColDef } from 'ag-grid-community';
import { BarChart3, Download, Eye, FilePlus2, Filter, RefreshCcw, Search, TrendingUp } from 'lucide-react';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/shared/components/Button';
import { EnterpriseGrid } from '@/shared/components/grid/EnterpriseGrid';
import { StatCard } from '@/shared/components/StatCard';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { queryKeys } from '@/shared/api/queryKeys';
import { createBankruptcyMonitoringSnapshot, exportReportSnapshot } from '../api/reportingApi';
import { useReportSnapshotDetail, useReportSnapshots, useReportingDashboard } from '../hooks/useReporting';
import type { DashboardKey, ReportSnapshotItem, ReportSnapshotSearchRequest } from '../types/reporting';

const dashboardTabs: Array<{ key: DashboardKey; label: string; helper: string }> = [
  { key: 'operations', label: 'Operations', helper: 'Enterprise health' },
  { key: 'placement', label: 'Placement', helper: 'Placement throughput' },
  { key: 'claims', label: 'Claims', helper: 'POC performance' },
  { key: 'ndc', label: 'NDC', helper: 'Payment operations' },
  { key: 'scrub', label: 'Scrub', helper: 'Inventory outcomes' },
  { key: 'bankruptcyMonitoring', label: 'Monitoring', helper: 'OHC conversion' }
];

const sourceModuleOptions = ['', 'Placement', 'Claims', 'NDC', 'Scrub', 'BankruptcyMonitoring', 'Operations'];
const statusOptions = [
  { value: '', label: 'All statuses' },
  { value: 1, label: 'Queued' },
  { value: 2, label: 'Generating' },
  { value: 3, label: 'Completed' },
  { value: 4, label: 'Failed' }
];

function toNumberOrUndefined(value: string | number | '') {
  if (value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function formatDate(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(date);
}

function formatMetricValue(value: number | string | null | undefined) {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'number') return new Intl.NumberFormat('en-US').format(value);
  return value;
}

function statusTone(status?: number | null) {
  switch (status) {
    case 1: return 'info';
    case 2: return 'warning';
    case 3: return 'success';
    case 4: return 'danger';
    default: return 'neutral';
  }
}

export function EnterpriseReportingCenterPage() {
  const queryClient = useQueryClient();
  const pageSize = 25;
  const [activeDashboard, setActiveDashboard] = useState<DashboardKey>('operations');
  const [page, setPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<number | null>(null);
  const [filters, setFilters] = useState({ search: '', reportCode: '', sourceModule: '', status: '' as number | '' });
  const [submittedFilters, setSubmittedFilters] = useState(filters);
  const [monitoringSnapshotForm, setMonitoringSnapshotForm] = useState({ reportId: '', createdBy: 'UI User' });

  const dashboardQuery = useReportingDashboard(activeDashboard);
  const snapshotRequest = useMemo<ReportSnapshotSearchRequest>(() => ({
    page,
    pageSize,
    search: submittedFilters.search,
    reportCode: submittedFilters.reportCode,
    sourceModule: submittedFilters.sourceModule,
    status: toNumberOrUndefined(submittedFilters.status)
  }), [page, submittedFilters.reportCode, submittedFilters.search, submittedFilters.sourceModule, submittedFilters.status]);

  const snapshotsQuery = useReportSnapshots(snapshotRequest, hasSearched);
  const snapshotDetailQuery = useReportSnapshotDetail(selectedSnapshotId);
  const snapshotRows = snapshotsQuery.data?.items ?? [];
  const createMonitoringSnapshotMutation = useMutation({
    mutationFn: createBankruptcyMonitoringSnapshot,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.reporting.root });
      setHasSearched(true);
      setSubmittedFilters((current) => ({ ...current, sourceModule: 'BankruptcyMonitoring' }));
    }
  });
  const totalPages = Math.max(1, Math.ceil((snapshotsQuery.data?.totalCount ?? 0) / pageSize));

  const columns = useMemo<ColDef<ReportSnapshotItem>[]>(() => [
    {
      headerName: 'Report',
      field: 'reportName',
      pinned: 'left',
      minWidth: 260,
      cellRenderer: ({ data }: { data?: ReportSnapshotItem }) => (
        <div className="grid-primary-cell">
          <strong>{data?.reportName ?? data?.reportCode ?? `Snapshot ${data?.snapshotId ?? ''}`}</strong>
          <span>{data?.reportCode ?? '-'} · {data?.sourceModule ?? 'Enterprise'}</span>
        </div>
      )
    },
    { headerName: 'Status', field: 'status', minWidth: 150, cellRenderer: ({ data }: { data?: ReportSnapshotItem }) => <StatusBadge label={data?.status ?? 'Unknown'} tone={statusTone(data?.statusCode)} /> },
    { headerName: 'Rows', field: 'totalRows', minWidth: 120, valueFormatter: ({ value }) => value === null || value === undefined ? '-' : new Intl.NumberFormat('en-US').format(Number(value)) },
    { headerName: 'Generated', field: 'generatedUtc', minWidth: 160, valueFormatter: ({ value }) => formatDate(value) },
    { headerName: 'Created By', field: 'createdBy', minWidth: 160, valueFormatter: ({ value }) => value || '-' },
    { headerName: 'File', field: 'fileName', minWidth: 220, valueFormatter: ({ value }) => value || '-' },
    {
      headerName: 'Action',
      minWidth: 180,
      pinned: 'right',
      sortable: false,
      filter: false,
      cellRenderer: ({ data }: { data?: ReportSnapshotItem }) => (
        <button className="xocket-grid-action" onClick={() => data?.snapshotId && setSelectedSnapshotId(data.snapshotId)}>
          <Eye size={15} /> View
        </button>
      )
    }
  ], []);

  function searchSnapshots() {
    setPage(1);
    setSubmittedFilters(filters);
    setHasSearched(true);
  }

  function clearSearch() {
    const cleared = { search: '', reportCode: '', sourceModule: '', status: '' as number | '' };
    setFilters(cleared);
    setSubmittedFilters(cleared);
    setPage(1);
    setHasSearched(false);
    setSelectedSnapshotId(null);
  }

  async function downloadSnapshot(snapshotId: number) {
    const blob = await exportReportSnapshot(snapshotId);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `report-snapshot-${snapshotId}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  const dashboard = dashboardQuery.data;

  return (
    <div className="enterprise-page reporting-page">
      <section className="placement-hero xocket-card reporting-hero">
        <div> 
          <h1>Enterprise Reporting Center</h1>
          <p>Executive dashboards, monitoring report snapshot generation, operational health, and export-ready management reporting.</p>
        </div>
        <div className="placement-hero-actions">
          <Button variant="secondary" onClick={() => dashboardQuery.refetch()}><RefreshCcw size={16} /> Refresh Dashboard</Button>
        </div>
      </section>

      <section className="xocket-card reporting-dashboard-card">
       {/*  <div className="xocket-card-header">
          <div>
            <h2 className="xocket-card-title">Business Health Dashboards</h2>
            <p className="xocket-card-subtitle">Choose a dashboard area. Each dashboard is loaded from the backend reporting API.</p>
          </div>
          <span className="xocket-pill reporting-pill">{dashboard?.title ?? 'Operations'}</span>
        </div> */}

        <div className="stat-grid placement-stat-grid placement-stat-grid-wide">
          {dashboardTabs.map((tab) => (
            <button key={tab.key} className={`reporting-tab ${activeDashboard === tab.key ? 'active' : ''}`} onClick={() => setActiveDashboard(tab.key)}>
              <BarChart3 size={16} />
              <span>{tab.label}</span>
              <small>{tab.helper}</small>
            </button>
          ))}
          <br>
          </br>
        </div>

        {dashboardQuery.isError ? <div className="xocket-alert xocket-alert-danger">Unable to load reporting dashboard.</div> : null}
        <div className="stat-grid placement-stat-grid reporting-stat-grid">
          {(dashboard?.metrics ?? []).map((metric) => (
            <StatCard
              key={metric.code}
              icon={<TrendingUp size={22} />}
              value={formatMetricValue(metric.value)}
              label={metric.label}
              helper={metric.trend ? `${metric.helper} · ${metric.trend}` : metric.helper}
              tone={metric.tone}
            />
          ))}
        </div>
      </section>


      <section className="document-workspace-panel reporting-production-panel">
        <div className="document-workspace-section-title">
          <div>
            <span className="enterprise-eyebrow">Monitoring Report Publishing</span>
            <h2>Create Bankruptcy Monitoring Snapshot</h2>
            <p>Publish a delivered bankruptcy monitoring report into the enterprise reporting snapshot library.</p>
          </div>
        </div>
        <div className="document-actions-layout document-actions-layout-polished">
          <section className="enterprise-card document-action-tile">
            <div className="document-action-tile-header">
              <div className="document-action-icon"><FilePlus2 size={20} /></div>
              <div><h3>Snapshot From Monitoring Report</h3><p>Uses /api/v1/reports/snapshots/bankruptcy-monitoring/{'{'}reportId{'}'}.</p></div>
            </div>
            <div className="document-action-grid">
              <label className="evictsure-form-group"><span className="evictsure-form-label">Monitoring Report Id</span><input className="evictsure-form-input" value={monitoringSnapshotForm.reportId} onChange={(event) => setMonitoringSnapshotForm((current) => ({ ...current, reportId: event.target.value }))} /></label>
              <label className="evictsure-form-group"><span className="evictsure-form-label">Created By</span><input className="evictsure-form-input" value={monitoringSnapshotForm.createdBy} onChange={(event) => setMonitoringSnapshotForm((current) => ({ ...current, createdBy: event.target.value }))} /></label>
            </div>
            <div className="document-action-footer">
              <span className="workspace-muted">After creation, search the snapshot library with module BankruptcyMonitoring.</span>
              <Button disabled={!toNumberOrUndefined(monitoringSnapshotForm.reportId) || createMonitoringSnapshotMutation.isPending} onClick={() => createMonitoringSnapshotMutation.mutate({ reportId: toNumberOrUndefined(monitoringSnapshotForm.reportId) ?? 0, createdBy: monitoringSnapshotForm.createdBy })}>Create Snapshot</Button>
            </div>
          </section>
        </div>
      </section>

      <section className="xocket-card placement-filter-card reporting-filter-card">
        <div className="xocket-card-header">
          <div>
            <h2 className="xocket-card-title">Report Snapshot Library</h2>
            <p className="xocket-card-subtitle">Search-first reporting library with server-side pagination only.</p>
          </div>
          <span className="xocket-pill reporting-pill">Snapshots</span>
        </div>

        <div className="placement-filter-row reporting-filter-row">
          <div className="evictsure-form-group">
            <span className="evictsure-form-label">Search</span>
            <input className="evictsure-form-input" value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Report name, code, file..." />
          </div>
          <div className="evictsure-form-group">
            <span className="evictsure-form-label">Report Code</span>
            <input className="evictsure-form-input" value={filters.reportCode} onChange={(event) => setFilters((current) => ({ ...current, reportCode: event.target.value }))} placeholder="OPS_DAILY" />
          </div>
          <div className="evictsure-form-group">
            <span className="evictsure-form-label">Module</span>
            <select className="evictsure-form-input" value={filters.sourceModule} onChange={(event) => setFilters((current) => ({ ...current, sourceModule: event.target.value }))}>
              {sourceModuleOptions.map((option) => <option key={option} value={option}>{option || 'All modules'}</option>)}
            </select>
          </div>
          <div className="evictsure-form-group">
            <span className="evictsure-form-label">Status</span>
            <select className="evictsure-form-input" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value === '' ? '' : Number(event.target.value) }))}>
              {statusOptions.map((option) => <option key={option.label} value={option.value}>{option.label}</option>)}
            </select>
          </div>
          <div className="reporting-filter-actions">
            <Button onClick={searchSnapshots}><Search size={16} /> Search</Button>
            <Button variant="secondary" onClick={clearSearch}><Filter size={16} /> Clear</Button>
          </div>
        </div>

        {!hasSearched ? (
          <div className="placement-empty-business">Search report snapshots when needed. Reporting data is never loaded in bulk by default.</div>
        ) : snapshotsQuery.isError ? (
          <div className="xocket-alert xocket-alert-danger">Unable to load report snapshots.</div>
        ) : (
          <>
            <EnterpriseGrid rows={snapshotRows} columns={columns} isLoading={snapshotsQuery.isFetching} height={560} emptyMessage="No report snapshots matched the current filters." />
            <div className="placement-pagination-bar">
              <span>Page {page} of {totalPages}</span>
              <div>
                <Button variant="secondary" disabled={page <= 1 || snapshotsQuery.isFetching} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</Button>
                <Button variant="secondary" disabled={page >= totalPages || snapshotsQuery.isFetching} onClick={() => setPage((current) => current + 1)}>Next</Button>
              </div>
            </div>
          </>
        )}
      </section>

      <section className="document-workspace-panel reporting-detail-panel">
        <div className="document-workspace-section-title">
          <div>
            <span className="enterprise-eyebrow">Snapshot Detail</span>
            <h2>Report Viewer</h2>
            <p>Open a snapshot to review metadata and export the generated report package.</p>
          </div>
          {selectedSnapshotId ? <Button variant="secondary" onClick={() => downloadSnapshot(selectedSnapshotId)}><Download size={16} /> Export</Button> : null}
        </div>

        {snapshotDetailQuery.isError ? <div className="xocket-alert xocket-alert-danger">Unable to load snapshot detail.</div> : null}
        {snapshotDetailQuery.data ? (
          <>
            <div className="reporting-detail-grid">
              <div className="enterprise-card reporting-detail-card"><span>Snapshot</span><strong>{snapshotDetailQuery.data.snapshotId}</strong><small>{snapshotDetailQuery.data.reportCode ?? 'Report'}</small></div>
              <div className="enterprise-card reporting-detail-card"><span>Module</span><strong>{snapshotDetailQuery.data.sourceModule ?? '-'}</strong><small>{snapshotDetailQuery.data.status ?? 'Unknown'}</small></div>
              <div className="enterprise-card reporting-detail-card"><span>Rows</span><strong>{snapshotDetailQuery.data.totalRows ?? 0}</strong><small>Export population</small></div>
              <div className="enterprise-card reporting-detail-card"><span>Generated</span><strong>{formatDate(snapshotDetailQuery.data.generatedUtc)}</strong><small>{snapshotDetailQuery.data.createdBy ?? 'System'}</small></div>
            </div>

            {snapshotDetailQuery.data.description ? (
              <div className="enterprise-card reporting-preview-card">
                <span className="enterprise-eyebrow">Description</span>
                <p>{snapshotDetailQuery.data.description}</p>
              </div>
            ) : null}

            {snapshotDetailQuery.data.previewRows.length > 0 ? (
              <div className="enterprise-card reporting-preview-card">
                <span className="enterprise-eyebrow">Preview Rows</span>
                <div className="reporting-preview-table">
                  <table>
                    <thead>
                      <tr>
                        {Object.keys(snapshotDetailQuery.data.previewRows[0] ?? {}).slice(0, 8).map((key) => <th key={key}>{key}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {snapshotDetailQuery.data.previewRows.slice(0, 10).map((row, index) => (
                        <tr key={index}>
                          {Object.keys(snapshotDetailQuery.data?.previewRows[0] ?? {}).slice(0, 8).map((key) => <td key={key}>{String(row[key] ?? '-')}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="placement-empty-business">No preview rows were returned for this snapshot. Use Export to download the generated report package.</div>
            )}
          </>
        ) : (
          <div className="placement-empty-business">Select View from a report snapshot row to open the report viewer.</div>
        )}
      </section>
    </div>
  );
}
