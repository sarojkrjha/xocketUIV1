import { useMemo, useState } from 'react';
import type { ColDef } from 'ag-grid-community';
import { Activity, AlertTriangle, ArrowRightCircle, CheckCircle2, Clock3, FileDown, Filter, PackagePlus, PlayCircle, RefreshCcw, Search, Send, ShieldAlert } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/shared/components/Button';
import { EnterpriseGrid } from '@/shared/components/grid/EnterpriseGrid';
import { StatCard } from '@/shared/components/StatCard';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { queryKeys } from '@/shared/api/queryKeys';
import { convertMonitoringItemToPlacement, decideMonitoringReportItem, exportMonitoringReport, generateMonitoringReport, markMonitoringReportDelivered, runBankruptcyMonitoring } from '../api/monitoringApi';
import { monitoringRunStatusOptions, monitoringStatusTone } from '../api/monitoringStatusMaps';
import { useMonitoringDashboard, useMonitoringReport, useMonitoringRuns } from '../hooks/useMonitoring';
import type { MonitoringRunItem } from '../types/monitoring';

type RunFilterState = {
  status: number | '';
};

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

function dateFormatter(params: { value?: string | null }) {
  return formatDate(params.value);
}

function numberFormatter(params: { value?: number | null }) {
  if (params.value === null || params.value === undefined) return '-';
  return new Intl.NumberFormat('en-US').format(params.value);
}

export function MonitoringOperationsCenterPage() {
  const queryClient = useQueryClient();
  const pageSize = 25;
  const [page, setPage] = useState(1);
  const [hasRunSearch, setHasRunSearch] = useState(false);
  const [runFilters, setRunFilters] = useState<RunFilterState>({ status: '' });
  const [submittedRunFilters, setSubmittedRunFilters] = useState<RunFilterState>({ status: '' });
  const [runForm, setRunForm] = useState({ clientId: '', portfolioId: '', runType: 'Daily', triggeredBy: 'UI User' });
  const [reportIdInput, setReportIdInput] = useState('');
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [convertForm, setConvertForm] = useState({ reportItemId: '', claimAmount: '', accountOpenDate: '', convertedBy: 'UI User' });
  const [reportForm, setReportForm] = useState({ runId: '', clientId: '', portfolioId: '', createdBy: 'UI User' });
  const [decisionForm, setDecisionForm] = useState({ reportItemId: '' });
  const [deliveryForm, setDeliveryForm] = useState({ reportId: '', deliveredBy: 'UI User' });

  const dashboardQuery = useMonitoringDashboard();
  const runRequest = useMemo(() => ({
    page,
    pageSize,
    status: toNumberOrUndefined(submittedRunFilters.status)
  }), [page, submittedRunFilters.status]);

  const runsQuery = useMonitoringRuns(runRequest, hasRunSearch);
  const reportQuery = useMonitoringReport(selectedReportId);
  const dashboard = dashboardQuery.data;
  const rows = runsQuery.data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((runsQuery.data?.totalCount ?? 0) / pageSize));

  const invalidateMonitoring = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.monitoring.root });
  };

  const runMonitoringMutation = useMutation({ mutationFn: runBankruptcyMonitoring, onSuccess: invalidateMonitoring });
  const generateReportMutation = useMutation({ mutationFn: generateMonitoringReport, onSuccess: invalidateMonitoring });
  const decideItemMutation = useMutation({ mutationFn: decideMonitoringReportItem, onSuccess: invalidateMonitoring });
  const deliveredMutation = useMutation({ mutationFn: markMonitoringReportDelivered, onSuccess: invalidateMonitoring });
  const convertMutation = useMutation({ mutationFn: convertMonitoringItemToPlacement, onSuccess: invalidateMonitoring });

  const columns = useMemo<ColDef<MonitoringRunItem>[]>(() => [
    { headerName: 'Run', field: 'runId', pinned: 'left', minWidth: 120 },
    {
      headerName: 'Monitoring Context',
      field: 'runType',
      minWidth: 240,
      cellRenderer: ({ data }: { data?: MonitoringRunItem }) => (
        <div className="grid-primary-cell">
          <strong>{data?.runType ?? 'Monitoring Run'}</strong>
          <span>Client {data?.clientId ?? '-'} · Portfolio {data?.portfolioId ?? '-'}</span>
        </div>
      )
    },
    { headerName: 'Status', field: 'statusLabel', minWidth: 160, cellRenderer: ({ data }: { data?: MonitoringRunItem }) => <StatusBadge label={data?.statusLabel ?? 'Unknown'} tone={monitoringStatusTone(data?.status)} /> },
    { headerName: 'Accounts', field: 'totalAccounts', minWidth: 130, valueFormatter: numberFormatter },
    { headerName: 'Alerts', field: 'alertCount', minWidth: 120, valueFormatter: numberFormatter },
    { headerName: 'Converted', field: 'convertedCount', minWidth: 130, valueFormatter: numberFormatter },
    { headerName: 'Started', field: 'startedOnUtc', minWidth: 150, valueFormatter: dateFormatter },
    { headerName: 'Completed', field: 'completedOnUtc', minWidth: 150, valueFormatter: dateFormatter },
    { headerName: 'Triggered By', field: 'triggeredBy', minWidth: 160, valueFormatter: ({ value }) => value || '-' }
  ], []);

  async function downloadReport(reportId: number) {
    const blob = await exportMonitoringReport(reportId);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bankruptcy-monitoring-report-${reportId}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  function submitRunSearch() {
    setPage(1);
    setSubmittedRunFilters(runFilters);
    setHasRunSearch(true);
  }

  return (
    <div className="enterprise-page monitoring-page">
      <section className="placement-hero xocket-card monitoring-hero">
        <div> 
          <h1>Enterprise Monitoring Operations Center</h1>
          <p>Run bankruptcy monitoring, generate client reports, approve or reject report items, mark delivery, convert approved items to placement, and publish reporting snapshots.</p>
        </div>
        <div className="placement-hero-actions">
          <Button variant="secondary" onClick={() => invalidateMonitoring()}><RefreshCcw size={16} /> Refresh</Button>
        </div>
      </section>

      <div className="stat-grid placement-stat-grid placement-stat-grid-wide">
        <StatCard icon={<ShieldAlert size={22} />} value={dashboard?.todayAlerts ?? 0} label="Today's Alerts" helper="Requires review" tone="warning" />
        <StatCard icon={<AlertTriangle size={22} />} value={dashboard?.pendingReviews ?? 0} label="Pending Reviews" helper="Open decisions" tone="warning" />
        <StatCard icon={<ArrowRightCircle size={22} />} value={dashboard?.convertedToPlacement ?? 0} label="Converted" helper="Moved to placement" tone="success" />
        <StatCard icon={<FileDown size={22} />} value={dashboard?.reportsGenerated ?? 0} label="Reports" helper="Generated outputs" tone="info" />
        <StatCard icon={<Activity size={22} />} value={dashboard?.failedRuns ?? 0} label="Failed Runs" helper="Needs action" tone="danger" />
        <StatCard icon={<Clock3 size={22} />} value={dashboard?.averageProcessingMinutes ?? 0} label="Avg Minutes" helper="Processing time" tone="primary" />
      </div>

      <section className="document-workspace-panel monitoring-production-panel">
        <div className="document-workspace-section-title">
          <div>
            <span className="enterprise-eyebrow">Today's Work</span>
            <h2>Monitoring Production</h2>
            <p>Run monitoring, load run history, review a report, and convert qualified report items to placement.</p>
          </div>
        </div>

        <div className="document-actions-layout document-actions-layout-polished monitoring-actions-layout">
          <section className="enterprise-card document-action-tile monitoring-action-tile">
            <div className="document-action-tile-header">
              <div className="document-action-icon monitoring-action-icon"><PlayCircle size={20} /></div>
              <div><h3>Run Monitoring</h3><p>Start an OHC monitoring run for a client or portfolio.</p></div>
            </div>
            <div className="document-action-grid">
              <label className="evictsure-form-group"><span className="evictsure-form-label">Client Id</span><input className="evictsure-form-input" value={runForm.clientId} onChange={(event) => setRunForm((current) => ({ ...current, clientId: event.target.value }))} /></label>
              <label className="evictsure-form-group"><span className="evictsure-form-label">Portfolio Id</span><input className="evictsure-form-input" value={runForm.portfolioId} onChange={(event) => setRunForm((current) => ({ ...current, portfolioId: event.target.value }))} /></label>
              <label className="evictsure-form-group"><span className="evictsure-form-label">Run Type</span><select className="evictsure-form-input" value={runForm.runType} onChange={(event) => setRunForm((current) => ({ ...current, runType: event.target.value }))}><option>Daily</option><option>Manual</option><option>Portfolio</option><option>Client</option></select></label>
              <label className="evictsure-form-group"><span className="evictsure-form-label">Triggered By</span><input className="evictsure-form-input" value={runForm.triggeredBy} onChange={(event) => setRunForm((current) => ({ ...current, triggeredBy: event.target.value }))} /></label>
            </div>
            <div className="document-action-footer">
              <span className="workspace-muted">Runs are asynchronous; refresh run history to see progress.</span>
              <Button disabled={runMonitoringMutation.isPending} onClick={() => runMonitoringMutation.mutate({ clientId: toNumberOrUndefined(runForm.clientId), portfolioId: toNumberOrUndefined(runForm.portfolioId), runType: runForm.runType, triggeredBy: runForm.triggeredBy })}>Run Monitoring</Button>
            </div>
          </section>

          <section className="enterprise-card document-action-tile monitoring-action-tile">
            <div className="document-action-tile-header">
              <div className="document-action-icon monitoring-action-icon"><PackagePlus size={20} /></div>
              <div><h3>Generate Client Report</h3><p>Create the reviewable monitoring report from a completed monitoring run.</p></div>
            </div>
            <div className="document-action-grid">
              <label className="evictsure-form-group"><span className="evictsure-form-label">Run Id</span><input className="evictsure-form-input" value={reportForm.runId} onChange={(event) => setReportForm((current) => ({ ...current, runId: event.target.value }))} /></label>
              <label className="evictsure-form-group"><span className="evictsure-form-label">Client Id</span><input className="evictsure-form-input" value={reportForm.clientId} onChange={(event) => setReportForm((current) => ({ ...current, clientId: event.target.value }))} /></label>
              <label className="evictsure-form-group"><span className="evictsure-form-label">Portfolio Id</span><input className="evictsure-form-input" value={reportForm.portfolioId} onChange={(event) => setReportForm((current) => ({ ...current, portfolioId: event.target.value }))} /></label>
              <label className="evictsure-form-group"><span className="evictsure-form-label">Created By</span><input className="evictsure-form-input" value={reportForm.createdBy} onChange={(event) => setReportForm((current) => ({ ...current, createdBy: event.target.value }))} /></label>
            </div>
            <div className="document-action-footer">
              <span className="workspace-muted">Generate only after run results are complete and validated.</span>
              <Button disabled={!toNumberOrUndefined(reportForm.runId) || !toNumberOrUndefined(reportForm.clientId) || generateReportMutation.isPending} onClick={() => generateReportMutation.mutate({ runId: toNumberOrUndefined(reportForm.runId) ?? 0, clientId: toNumberOrUndefined(reportForm.clientId) ?? 0, portfolioId: toNumberOrUndefined(reportForm.portfolioId), createdBy: reportForm.createdBy })}>Generate Report</Button>
            </div>
          </section>

          <section className="enterprise-card document-action-tile monitoring-action-tile">
            <div className="document-action-tile-header">
              <div className="document-action-icon monitoring-action-icon"><CheckCircle2 size={20} /></div>
              <div><h3>Review Report Item</h3><p>Approve or reject a monitoring report item before conversion.</p></div>
            </div>
            <div className="document-action-grid">
              <label className="evictsure-form-group"><span className="evictsure-form-label">Report Item Id</span><input className="evictsure-form-input" value={decisionForm.reportItemId} onChange={(event) => setDecisionForm({ reportItemId: event.target.value })} /></label>
            </div>
            <div className="document-action-footer">
              <span className="workspace-muted">Use reject for false positive or already known bankruptcy items.</span>
              <div className="placement-hero-actions">
                <Button disabled={!toNumberOrUndefined(decisionForm.reportItemId) || decideItemMutation.isPending} onClick={() => decideItemMutation.mutate({ reportItemId: toNumberOrUndefined(decisionForm.reportItemId) ?? 0, decision: 'approve' })}>Approve</Button>
                <Button variant="secondary" disabled={!toNumberOrUndefined(decisionForm.reportItemId) || decideItemMutation.isPending} onClick={() => decideItemMutation.mutate({ reportItemId: toNumberOrUndefined(decisionForm.reportItemId) ?? 0, decision: 'reject' })}>Reject</Button>
              </div>
            </div>
          </section>

          <section className="enterprise-card document-action-tile monitoring-action-tile">
            <div className="document-action-tile-header">
              <div className="document-action-icon monitoring-action-icon"><Send size={20} /></div>
              <div><h3>Mark Report Delivered</h3><p>Record delivery after the monitoring report has been sent to the client.</p></div>
            </div>
            <div className="document-action-grid">
              <label className="evictsure-form-group"><span className="evictsure-form-label">Report Id</span><input className="evictsure-form-input" value={deliveryForm.reportId} onChange={(event) => setDeliveryForm((current) => ({ ...current, reportId: event.target.value }))} /></label>
              <label className="evictsure-form-group"><span className="evictsure-form-label">Delivered By</span><input className="evictsure-form-input" value={deliveryForm.deliveredBy} onChange={(event) => setDeliveryForm((current) => ({ ...current, deliveredBy: event.target.value }))} /></label>
            </div>
            <div className="document-action-footer">
              <span className="workspace-muted">This closes the external delivery audit step.</span>
              <Button disabled={!toNumberOrUndefined(deliveryForm.reportId) || deliveredMutation.isPending} onClick={() => deliveredMutation.mutate({ reportId: toNumberOrUndefined(deliveryForm.reportId) ?? 0, deliveredBy: deliveryForm.deliveredBy })}>Mark Delivered</Button>
            </div>
          </section>

          <section className="enterprise-card document-action-tile monitoring-action-tile">
            <div className="document-action-tile-header">
              <div className="document-action-icon monitoring-action-icon"><ArrowRightCircle size={20} /></div>
              <div><h3>Convert Report Item</h3><p>Convert an approved monitoring report item into placement workflow.</p></div>
            </div>
            <div className="document-action-grid">
              <label className="evictsure-form-group"><span className="evictsure-form-label">Report Item Id</span><input className="evictsure-form-input" value={convertForm.reportItemId} onChange={(event) => setConvertForm((current) => ({ ...current, reportItemId: event.target.value }))} /></label>
              <label className="evictsure-form-group"><span className="evictsure-form-label">Claim Amount</span><input className="evictsure-form-input" value={convertForm.claimAmount} onChange={(event) => setConvertForm((current) => ({ ...current, claimAmount: event.target.value }))} /></label>
              <label className="evictsure-form-group"><span className="evictsure-form-label">Account Open Date</span><input className="evictsure-form-input" type="date" value={convertForm.accountOpenDate} onChange={(event) => setConvertForm((current) => ({ ...current, accountOpenDate: event.target.value }))} /></label>
              <label className="evictsure-form-group"><span className="evictsure-form-label">Converted By</span><input className="evictsure-form-input" value={convertForm.convertedBy} onChange={(event) => setConvertForm((current) => ({ ...current, convertedBy: event.target.value }))} /></label>
            </div>
            <div className="document-action-footer">
              <span className="workspace-muted">Only convert items after business review is complete.</span>
              <Button disabled={!toNumberOrUndefined(convertForm.reportItemId) || !toNumberOrUndefined(convertForm.claimAmount) || !convertForm.accountOpenDate || convertMutation.isPending} onClick={() => convertMutation.mutate({ reportItemId: toNumberOrUndefined(convertForm.reportItemId) ?? 0, claimAmount: toNumberOrUndefined(convertForm.claimAmount) ?? 0, accountOpenDate: convertForm.accountOpenDate, convertedBy: convertForm.convertedBy })}>Convert</Button>
            </div>
          </section>
        </div>
      </section>

      <section className="xocket-card placement-filter-card monitoring-filter-card">
        <div className="xocket-card-header">
          <div>
            <h2 className="xocket-card-title">Monitoring Runs</h2>
            <p className="xocket-card-subtitle">Search-first history with server-side pagination only.</p>
          </div>
          <span className="xocket-pill monitoring-pill">EnterpriseGrid 3.1</span>
        </div>
        <div className="placement-filter-row">
          <select className="placement-select" value={runFilters.status} onChange={(event) => setRunFilters({ status: event.target.value === '' ? '' : Number(event.target.value) })}>
            <option value="">All statuses</option>
            {monitoringRunStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <Button onClick={submitRunSearch}><Search size={16} /> Load Runs</Button>
          <Button variant="secondary" onClick={() => { setRunFilters({ status: '' }); setSubmittedRunFilters({ status: '' }); setHasRunSearch(false); setPage(1); }}><Filter size={16} /> Clear</Button>
        </div>

        {!hasRunSearch ? (
          <div className="placement-empty-business">Load monitoring runs when needed. Large datasets are never loaded automatically.</div>
        ) : runsQuery.isError ? (
          <div className="xocket-alert xocket-alert-danger">Unable to load monitoring runs.</div>
        ) : (
          <>
            <EnterpriseGrid rows={rows} columns={columns} isLoading={runsQuery.isFetching} height={560} emptyMessage="No monitoring runs matched the current filters." />
            <div className="placement-pagination-bar">
              <span>Page {page} of {totalPages}</span>
              <div>
                <Button variant="secondary" disabled={page <= 1 || runsQuery.isFetching} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</Button>
                <Button variant="secondary" disabled={page >= totalPages || runsQuery.isFetching} onClick={() => setPage((current) => current + 1)}>Next</Button>
              </div>
            </div>
          </>
        )}
      </section>

      <section className="document-workspace-panel monitoring-report-panel">
        <div className="document-workspace-section-title">
          <div>
            <span className="enterprise-eyebrow">Report Review</span>
            <h2>Monitoring Report Workspace</h2>
            <p>Load a monitoring report by id to review totals, delivery status, and export the report package.</p>
          </div>
        </div>
        <div className="monitoring-report-search-row">
          <label className="evictsure-form-group"><span className="evictsure-form-label">Report Id</span><input className="evictsure-form-input" value={reportIdInput} onChange={(event) => setReportIdInput(event.target.value)} /></label>
          <Button disabled={!toNumberOrUndefined(reportIdInput)} onClick={() => setSelectedReportId(toNumberOrUndefined(reportIdInput) ?? null)}>Load Report</Button>
          <Button variant="secondary" disabled={!selectedReportId} onClick={() => selectedReportId && downloadReport(selectedReportId)}><FileDown size={16} /> Export</Button>
        </div>

        {reportQuery.isError ? <div className="xocket-alert xocket-alert-danger">Unable to load monitoring report.</div> : null}
        {reportQuery.data ? (
          <div className="monitoring-report-summary-grid">
            <div className="enterprise-card monitoring-report-card"><span>Report</span><strong>{reportQuery.data.reportId}</strong><small>{reportQuery.data.statusLabel}</small></div>
            <div className="enterprise-card monitoring-report-card"><span>Total Items</span><strong>{reportQuery.data.totalItems ?? 0}</strong><small>Reviewed population</small></div>
            <div className="enterprise-card monitoring-report-card"><span>Approved</span><strong>{reportQuery.data.approvedItems ?? 0}</strong><small>Ready for conversion</small></div>
            <div className="enterprise-card monitoring-report-card"><span>Rejected</span><strong>{reportQuery.data.rejectedItems ?? 0}</strong><small>Not converted</small></div>
            <div className="enterprise-card monitoring-report-card"><span>Converted</span><strong>{reportQuery.data.convertedItems ?? 0}</strong><small>Placement workflow</small></div>
            <div className="enterprise-card monitoring-report-card"><span>Delivered</span><strong>{formatDate(reportQuery.data.deliveredOnUtc)}</strong><small>{reportQuery.data.createdBy ?? 'Not delivered'}</small></div>
          </div>
        ) : (
          <div className="placement-empty-business">Load a report to review monitoring output. Report items remain server-side until requested.</div>
        )}
      </section>
    </div>
  );
}
