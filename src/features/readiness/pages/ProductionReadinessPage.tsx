import { useMemo, useState } from 'react';
import type { ColDef } from 'ag-grid-community';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileSearch,
  Gauge,
  Layers3,
  RefreshCcw,
  ShieldAlert,
  ShieldCheck,
  Workflow,
  XCircle
} from 'lucide-react';

import { Button } from '@/shared/components/Button';
import { EnterpriseGrid } from '@/shared/components/grid/EnterpriseGrid';
import { StatCard } from '@/shared/components/StatCard';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { useReportingDashboard } from '@/features/reporting/hooks/useReporting';

type ReadinessStatus = 'Complete' | 'Needs UAT' | 'Backend Gap' | 'Risk';

type WorkflowRow = {
  lp: string;
  workflow: string;
  implemented: string;
  validationScope: string;
  status: ReadinessStatus;
  evidence: string;
};

type GapRow = {
  area: string;
  gap: string;
  impact: string;
  requiredOwner: 'Backend' | 'QA' | 'Business' | 'DevOps';
  priority: 'P0' | 'P1' | 'P2';
};

const workflowRows: WorkflowRow[] = [
  {
    lp: 'LP-01',
    workflow: 'Placement Import & Queue Management',
    implemented: 'Import wizard, imported files, import detail, placement queue switcher, queue movement.',
    validationScope: 'Upload a placement file, review imported file detail, open accounts in placement queue, move queue status.',
    status: 'Needs UAT',
    evidence: 'LP_01_IMPLEMENTATION_NOTES.md'
  },
  {
    lp: 'LP-02',
    workflow: 'Matching & Legal Review',
    implemented: 'Dedicated matching queue, candidate review, flag creation, legal review queue, flag resolution.',
    validationScope: 'Run matching from placement account, review candidates, select match, resolve legal flags.',
    status: 'Needs UAT',
    evidence: 'LP_02_IMPLEMENTATION_NOTES.md'
  },
  {
    lp: 'LP-03',
    workflow: 'Filing Operations',
    implemented: 'Filing queue, filing workspace routing, assignment, document generation, POC upload, submit filing, receipt upload.',
    validationScope: 'Assign filer, generate POC, upload POC/court receipt, submit filing from one placement account.',
    status: 'Needs UAT',
    evidence: 'LP_03_IMPLEMENTATION_NOTES.md'
  },
  {
    lp: 'LP-04',
    workflow: 'Claims Lifecycle',
    implemented: 'Create claim, eligibility check, attorney assignment, filing package, filing registration, receipt, payments, lifecycle panels.',
    validationScope: 'Create claim from account/case context, advance status, add payment, handle amendment/objection/transfer flows.',
    status: 'Needs UAT',
    evidence: 'LP_04_IMPLEMENTATION_NOTES.md'
  },
  {
    lp: 'LP-05',
    workflow: 'NDC & Payments',
    implemented: 'NDC dashboard, import runs, run detail, payment review, schedule management, post NDC payment to claim.',
    validationScope: 'Trigger import, review run, review payment, post payment to known claim id, deactivate schedule.',
    status: 'Needs UAT',
    evidence: 'LP_05_IMPLEMENTATION_NOTES.md'
  },
  {
    lp: 'LP-06',
    workflow: 'Bankruptcy Monitoring & Scrubbing',
    implemented: 'Monitoring run/report flow, report item approval/rejection/conversion, scrub inventory/run/detail/schedules.',
    validationScope: 'Run monitor, generate report, approve/reject item, convert to placement, run scrub and review result batch.',
    status: 'Needs UAT',
    evidence: 'LP_06_IMPLEMENTATION_NOTES.md'
  },
  {
    lp: 'LP-07',
    workflow: 'Reporting & Operations Center',
    implemented: 'Operations dashboard API surfaces, reporting dashboards, snapshot search/detail/export, monitoring snapshot publishing.',
    validationScope: 'Load all dashboards, search snapshots, open detail, export snapshot, publish monitoring report snapshot.',
    status: 'Needs UAT',
    evidence: 'LP_07_IMPLEMENTATION_NOTES.md'
  },
  {
    lp: 'LP-08',
    workflow: 'Administration, Templates & Security',
    implemented: 'Clients, portfolios, workflow queues, system settings, users, role assignment, client access, permission summary.',
    validationScope: 'Create admin records, assign user role/client, validate permission visibility with real user session.',
    status: 'Needs UAT',
    evidence: 'LP_08_IMPLEMENTATION_NOTES.md'
  }
];

const backendGaps: GapRow[] = [
  { area: 'Placement Import', gap: 'No separate validate/preview/reprocess/archive/export-errors endpoints.', impact: 'Import wizard uses uploaded/import detail payloads where available; true pre-import validation requires backend support.', requiredOwner: 'Backend', priority: 'P1' },
  { area: 'Matching', gap: 'No dedicated reject/skip match endpoint and no standalone matching-review queue endpoint.', impact: 'UI can surface candidate review and supported select/flag actions, but exact legacy reject/skip parity remains backend-limited.', requiredOwner: 'Backend', priority: 'P1' },
  { area: 'Filing', gap: 'No bulk filing assignment/generation/submit and no receipt-pending queue endpoint.', impact: 'Bulk filing queue operations are limited to available single-account APIs.', requiredOwner: 'Backend', priority: 'P2' },
  { area: 'Claims', gap: 'No close/reopen/withdraw/distribution/recovery/settlement endpoints.', impact: 'Advanced late-stage claim lifecycle cannot be fully automated from UI.', requiredOwner: 'Backend', priority: 'P1' },
  { area: 'NDC', gap: 'No manual map-without-post, reject/exception, bulk post, reprocess run, or original file download endpoints.', impact: 'Payment exception handling cannot match legacy until backend actions exist.', requiredOwner: 'Backend', priority: 'P1' },
  { area: 'Scrubbing', gap: 'No scrub run cancel/retry, result item paging, schedule edit, or inventory deactivate endpoints.', impact: 'Operational remediation is view/create/deactivate limited.', requiredOwner: 'Backend', priority: 'P2' },
  { area: 'Reporting', gap: 'No generic report create, schedule/subscription, date-range filters, drill-down, notification feed, or global search endpoints.', impact: 'Executive reporting is dashboard/snapshot driven only.', requiredOwner: 'Backend', priority: 'P1' },
  { area: 'Administration', gap: 'No template CRUD, audit trail, login history, session management, role mutation, or role-permission mapping endpoints.', impact: 'Templates and security audit surfaces are readiness registers, not executable workflows.', requiredOwner: 'Backend', priority: 'P0' }
];

const smokeTests = [
  'Login and /auth/me session hydration',
  'Placement import upload with real client id and user id',
  'Placement queue search, filter, open detail, queue move',
  'Matching candidate select and legal flag lifecycle',
  'Filing assignment, POC generation, receipt upload, submit filing',
  'Claim create with eligibility, status advance, payment add/post',
  'NDC import run detail and payment post to claim',
  'Bankruptcy monitoring run, report generation, approve/reject/convert',
  'Scrub inventory import/run/result review/reported bankruptcy resolve',
  'Report snapshots search/detail/export',
  'Administration create/update flows and permission visibility',
  'File upload/download/export error handling with large payloads'
];

const releaseGateRows = [
  { gate: 'API Smoke Test', owner: 'QA', result: 'Required', description: 'Execute every primary workflow against live API and test data.' },
  { gate: 'Backend Gap Sign-off', owner: 'Product + Backend', result: 'Required', description: 'Accept or schedule backend gaps listed in this page and LP notes.' },
  { gate: 'Security / Role Validation', owner: 'Security', result: 'Required', description: 'Validate real roles, client access, authorization errors, and session expiry.' },
  { gate: 'Performance Baseline', owner: 'DevOps', result: 'Required', description: 'Test large grids, file upload/download, dashboard load, and API latency.' },
  { gate: 'UAT Script Approval', owner: 'Business', result: 'Required', description: 'Business users execute legacy workflows from import through reporting.' },
  { gate: 'Production Configuration', owner: 'DevOps', result: 'Required', description: 'Environment variables, API URL, CORS, auth issuer, logging, and deployment slots.' }
];

function statusTone(status: ReadinessStatus) {
  switch (status) {
    case 'Complete': return 'success';
    case 'Needs UAT': return 'warning';
    case 'Backend Gap': return 'danger';
    case 'Risk': return 'danger';
    default: return 'neutral';
  }
}

function priorityTone(priority: GapRow['priority']) {
  if (priority === 'P0') return 'danger';
  if (priority === 'P1') return 'warning';
  return 'info';
}

function downloadReadinessCsv() {
  const rows = [
    ['Type', 'Area', 'Status/Priority', 'Owner/Evidence', 'Detail'],
    ...workflowRows.map((row) => ['Workflow', `${row.lp} ${row.workflow}`, row.status, row.evidence, row.validationScope]),
    ...backendGaps.map((row) => ['Backend Gap', row.area, row.priority, row.requiredOwner, `${row.gap} Impact: ${row.impact}`]),
    ...releaseGateRows.map((row) => ['Release Gate', row.gate, row.result, row.owner, row.description])
  ];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'xocket-lp09-readiness-matrix.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export function ProductionReadinessPage() {
  const [activeTab, setActiveTab] = useState<'workflows' | 'gaps' | 'smoke' | 'gates'>('workflows');
  const operationsDashboard = useReportingDashboard('operations');
  const placementDashboard = useReportingDashboard('placement');
  const claimsDashboard = useReportingDashboard('claims');

  const dashboardHealth = [operationsDashboard, placementDashboard, claimsDashboard];
  const dashboardErrors = dashboardHealth.filter((query) => query.isError).length;
  const dashboardLoaded = dashboardHealth.filter((query) => query.isSuccess).length;

  const workflowColumns = useMemo<ColDef<WorkflowRow>[]>(() => [
    { headerName: 'LP', field: 'lp', width: 110, pinned: 'left' },
    { headerName: 'Workflow', field: 'workflow', minWidth: 260 },
    { headerName: 'Implemented', field: 'implemented', minWidth: 360 },
    { headerName: 'Validation Scope', field: 'validationScope', minWidth: 360 },
    { headerName: 'Status', field: 'status', width: 160, cellRenderer: ({ data }: { data?: WorkflowRow }) => <StatusBadge tone={statusTone(data?.status ?? 'Needs UAT')}>{data?.status ?? 'Needs UAT'}</StatusBadge> },
    { headerName: 'Evidence', field: 'evidence', minWidth: 220 }
  ], []);

  const gapColumns = useMemo<ColDef<GapRow>[]>(() => [
    { headerName: 'Area', field: 'area', width: 180, pinned: 'left' },
    { headerName: 'Backend Gap', field: 'gap', minWidth: 380 },
    { headerName: 'Impact', field: 'impact', minWidth: 360 },
    { headerName: 'Owner', field: 'requiredOwner', width: 140 },
    { headerName: 'Priority', field: 'priority', width: 130, cellRenderer: ({ data }: { data?: GapRow }) => <StatusBadge tone={priorityTone(data?.priority ?? 'P2')}>{data?.priority ?? 'P2'}</StatusBadge> }
  ], []);

  return (
    <div className="production-readiness-page lp09-page">
      <section className="operations-hero xocket-card production-hero lp09-hero">
        <div>
          <div className="xocket-kicker">LP-09 · End-to-End Validation & Production Readiness</div>
          <h1>Legacy Workflow Validation Center</h1>
          <p>
            Final readiness surface for validating LP-01 through LP-08 against live API behavior. This page does not invent backend
            functionality; it exposes workflow coverage, backend gaps, smoke-test scope, and release gates for UAT sign-off.
          </p>
        </div>
        <div className="operations-hero-actions">
          <Button variant="secondary" icon={<Download size={18} />} onClick={downloadReadinessCsv}>Export Matrix</Button>
          <Button icon={<RefreshCcw size={18} />} onClick={() => dashboardHealth.forEach((query) => query.refetch())}>Refresh Health</Button>
        </div>
      </section>

      <div className="stat-grid operations-stat-grid lp09-stat-grid">
        <StatCard icon={<Workflow size={22} />} label="Legacy Parity Sprints" value="8" helper="LP-01 through LP-08 implemented before LP-09 validation." tone="primary" />
        <StatCard icon={<ClipboardCheck size={22} />} label="UAT Required" value={workflowRows.length} helper="Every workflow is implemented but requires live backend verification." tone="warning" />
        <StatCard icon={<ShieldAlert size={22} />} label="Backend Gap Areas" value={backendGaps.length} helper="Explicit gaps are tracked instead of hidden behind UI placeholders." tone="danger" />
        <StatCard icon={<Gauge size={22} />} label="Dashboard Health" value={`${dashboardLoaded}/${dashboardHealth.length}`} helper={dashboardErrors ? `${dashboardErrors} reporting dashboard API error(s).` : 'Core dashboards loaded or ready to load.'} tone={dashboardErrors ? 'warning' : 'success'} />
      </div>

      <section className="xocket-card lp09-summary-card">
        <div className="xocket-card-header">
          <div>
            <h2 className="xocket-card-title">Production Readiness Position</h2>
            <div className="xocket-card-subtitle">Feature implementation is not equal to production certification. LP-09 turns that into a measurable UAT gate.</div>
          </div>
          <StatusBadge tone="warning">Needs Live Validation</StatusBadge>
        </div>
        <div className="xocket-card-body lp09-readiness-strip">
          <div className="lp09-readiness-item success"><CheckCircle2 size={20} /><strong>UI workflow surfaces implemented</strong><span>LP-01 to LP-08 screens/actions are present.</span></div>
          <div className="lp09-readiness-item warning"><AlertTriangle size={20} /><strong>Live API smoke test required</strong><span>Response shapes, data state, authorization, and errors must be verified.</span></div>
          <div className="lp09-readiness-item danger"><XCircle size={20} /><strong>Backend gaps remain</strong><span>Missing APIs are listed explicitly below and in LP notes.</span></div>
          <div className="lp09-readiness-item info"><FileSearch size={20} /><strong>Traceability included</strong><span>Export matrix for QA/UAT/release tracking.</span></div>
        </div>
      </section>

      <section className="xocket-card lp09-tabs-card">
        <div className="lp09-tabbar">
          <button className={activeTab === 'workflows' ? 'active' : ''} onClick={() => setActiveTab('workflows')}>Workflow Matrix</button>
          <button className={activeTab === 'gaps' ? 'active' : ''} onClick={() => setActiveTab('gaps')}>Backend Gaps</button>
          <button className={activeTab === 'smoke' ? 'active' : ''} onClick={() => setActiveTab('smoke')}>Smoke Tests</button>
          <button className={activeTab === 'gates' ? 'active' : ''} onClick={() => setActiveTab('gates')}>Release Gates</button>
        </div>

        {activeTab === 'workflows' ? (
          <div className="xocket-card-body">
            <EnterpriseGrid rows={workflowRows} columns={workflowColumns} height={520} rowHeight={76} emptyMessage="No workflow rows configured." />
          </div>
        ) : null}

        {activeTab === 'gaps' ? (
          <div className="xocket-card-body">
            <div className="xocket-alert xocket-alert-warning lp09-gap-alert">
              These are not UI omissions. They are backend/API capabilities required for exact legacy parity and production operations.
            </div>
            <EnterpriseGrid rows={backendGaps} columns={gapColumns} height={520} rowHeight={86} emptyMessage="No backend gaps recorded." />
          </div>
        ) : null}

        {activeTab === 'smoke' ? (
          <div className="xocket-card-body lp09-smoke-grid">
            {smokeTests.map((test, index) => (
              <div className="lp09-smoke-card" key={test}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{test}</strong>
                <StatusBadge tone="warning">Pending QA</StatusBadge>
              </div>
            ))}
          </div>
        ) : null}

        {activeTab === 'gates' ? (
          <div className="xocket-card-body lp09-gate-grid">
            {releaseGateRows.map((gate) => (
              <div className="lp09-gate-card" key={gate.gate}>
                <div>
                  <strong>{gate.gate}</strong>
                  <span>{gate.description}</span>
                </div>
                <div className="lp09-gate-meta">
                  <StatusBadge tone="info">{gate.owner}</StatusBadge>
                  <StatusBadge tone="warning">{gate.result}</StatusBadge>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className="xocket-card lp09-final-card">
        <div className="xocket-card-header">
          <div>
            <h2 className="xocket-card-title">Go-Live Rule</h2>
            <div className="xocket-card-subtitle">This application should only be marked production-ready after these conditions are true.</div>
          </div>
          <ShieldCheck size={24} />
        </div>
        <div className="xocket-card-body readiness-check-list">
          {[
            ['All smoke tests executed against live API', 'No UI-only claim of completion.'],
            ['P0 backend gaps accepted or implemented', 'Especially security audit/templates/role-permission mapping.'],
            ['Business users complete UAT scripts', 'Placement import through reporting must match legacy operating behavior.'],
            ['Security and client-access validation completed', 'Unauthorized, forbidden, expired session, and cross-client access must be tested.'],
            ['Performance baseline captured', 'Large grid paging, upload/download, dashboards, and long-running operations.']
          ].map(([title, detail]) => (
            <div className="readiness-check" key={title}>
              <div><strong>{title}</strong><span>{detail}</span></div>
              <b>Gate</b>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
