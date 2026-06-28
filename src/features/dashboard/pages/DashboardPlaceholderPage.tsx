import { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  CheckCircle2,
  Clock3,
  Command,
  FileCheck2,
  FileStack,
  Gauge,
  Inbox,
  Layers3,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow,
  Zap
} from 'lucide-react';

import { Button } from '@/shared/components/Button';
import { StatCard } from '@/shared/components/StatCard';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { useReportingDashboard } from '@/features/reporting/hooks/useReporting';
import type { DashboardKey, ReportingDashboardMetric } from '@/features/reporting/types/reporting';
import type { AppRoute } from '@/shared/layout/navigation';

const dashboardOrder: Array<{ key: DashboardKey; label: string; icon: typeof Gauge; routeHint: string }> = [
  { key: 'operations', label: 'Operations', icon: Gauge, routeHint: 'Enterprise health' },
  { key: 'placement', label: 'Placement', icon: Workflow, routeHint: 'Placement queues' },
  { key: 'claims', label: 'Claims', icon: FileCheck2, routeHint: 'POC lifecycle' },
  { key: 'ndc', label: 'NDC', icon: Activity, routeHint: 'Payment operations' },
  { key: 'scrub', label: 'Scrub', icon: ShieldCheck, routeHint: 'Inventory review' },
  { key: 'bankruptcyMonitoring', label: 'Monitoring', icon: Bell, routeHint: 'OHC monitoring' }
];

const workflowSteps = [
  { label: 'Placement Import', owner: 'Operations', sla: 'Configured in workflow queues' },
  { label: 'Matching Review', owner: 'Review Team', sla: 'Configured in workflow queues' },
  { label: 'Legal Review', owner: 'Legal', sla: 'Configured in workflow queues' },
  { label: 'Filing Operations', owner: 'Filer', sla: 'Configured in workflow queues' },
  { label: 'Receipt / Payment', owner: 'Filer / Finance', sla: 'Configured in workflow queues' },
  { label: 'Reporting & Audit', owner: 'Management', sla: 'Snapshot/export driven' }
];

const commandActions: Array<{ label: string; route: AppRoute }> = [
  { label: 'Open Placement Import', route: 'placement-import' },
  { label: 'Open Placement Queue', route: 'placement' },
  { label: 'Open Matching Review', route: 'matching-review' },
  { label: 'Open Legal Review', route: 'legal-review' },
  { label: 'Open Filing Operations', route: 'filing-operations' },
  { label: 'Open Claims Work Center', route: 'claims' },
  { label: 'Open NDC Payments', route: 'payments' },
  { label: 'Open Scrubbing Operations', route: 'scrubbing' },
  { label: 'Open Monitoring Operations', route: 'monitoring' },
  { label: 'Open Enterprise Reporting', route: 'reporting' }
];

function formatMetricValue(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'number') return new Intl.NumberFormat('en-US').format(value);
  return value;
}

function pickMetrics(metrics: ReportingDashboardMetric[] | undefined, count = 4) {
  return (metrics ?? []).slice(0, count);
}

function metricTone(metric: ReportingDashboardMetric | undefined, fallback: ReportingDashboardMetric['tone'] = 'primary') {
  return metric?.tone ?? fallback;
}

type DashboardPlaceholderPageProps = {
  onNavigate?: (route: AppRoute) => void;
};

export function DashboardPlaceholderPage({ onNavigate }: DashboardPlaceholderPageProps) {
  const [commandFilter, setCommandFilter] = useState('');
  const operationsQuery = useReportingDashboard('operations');
  const placementQuery = useReportingDashboard('placement');
  const claimsQuery = useReportingDashboard('claims');
  const ndcQuery = useReportingDashboard('ndc');
  const scrubQuery = useReportingDashboard('scrub');
  const monitoringQuery = useReportingDashboard('bankruptcyMonitoring');

  const dashboardQueries = {
    operations: operationsQuery,
    placement: placementQuery,
    claims: claimsQuery,
    ndc: ndcQuery,
    scrub: scrubQuery,
    bankruptcyMonitoring: monitoringQuery
  } as const;

  const operationsMetrics = pickMetrics(operationsQuery.data?.metrics, 4);
  const operationalCards = [
    { icon: <Inbox size={22} />, label: operationsMetrics[0]?.label ?? 'Operations Metric 1', metric: operationsMetrics[0], fallback: 'Loaded from /reports/dashboard/operations' },
    { icon: <FileCheck2 size={22} />, label: operationsMetrics[1]?.label ?? 'Operations Metric 2', metric: operationsMetrics[1], fallback: 'Loaded from /reports/dashboard/operations' },
    { icon: <Bell size={22} />, label: operationsMetrics[2]?.label ?? 'Operations Metric 3', metric: operationsMetrics[2], fallback: 'Loaded from /reports/dashboard/operations' },
    { icon: <CheckCircle2 size={22} />, label: operationsMetrics[3]?.label ?? 'Operations Metric 4', metric: operationsMetrics[3], fallback: 'Loaded from /reports/dashboard/operations' }
  ];

  const filteredCommands = useMemo(
    () => commandActions.filter((action) => action.label.toLowerCase().includes(commandFilter.toLowerCase())),
    [commandFilter]
  );

  const hasDashboardError = Object.values(dashboardQueries).some((query) => query.isError);
  const isLoadingAnyDashboard = Object.values(dashboardQueries).some((query) => query.isFetching);

  return (
    <div className="production-readiness-page">
      <section className="operations-hero xocket-card production-hero">
        <div>
          <div className="xocket-kicker">LP-07 · Reporting & Operations Center</div>
          <h1>Enterprise Operations Center</h1>
          <p>
            Backend-driven command center for operational health. Metrics below are loaded from the reporting dashboard APIs;
            unavailable values are shown as endpoint-backed placeholders instead of invented counts.
          </p>
        </div>
        <div className="operations-hero-actions">
          <Button variant="secondary" icon={<Command size={18} />}>Ctrl + K</Button>
          <Button icon={<Zap size={18} />} onClick={() => Object.values(dashboardQueries).forEach((query) => query.refetch())}>
            Refresh Operations
          </Button>
        </div>
      </section>

      {hasDashboardError ? (
        <div className="xocket-alert xocket-alert-danger">
          One or more reporting dashboard APIs failed. Open Reporting for module-level detail and backend response troubleshooting.
        </div>
      ) : null}

      <div className="stat-grid operations-stat-grid">
        {operationalCards.map((card, index) => (
          <StatCard
            key={card.label + index}
            icon={card.icon}
            label={card.metric?.label ?? card.label}
            value={operationsQuery.isFetching ? 'Loading' : formatMetricValue(card.metric?.value)}
            helper={card.metric?.helper ?? card.fallback}
            tone={metricTone(card.metric, index === 2 ? 'warning' : 'primary')}
          />
        ))}
      </div>

      <div className="production-grid two-column">
        <section className="xocket-card">
          <div className="xocket-card-header">
            <div>
              <h2 className="xocket-card-title">Live Dashboard Coverage</h2>
              <div className="xocket-card-subtitle">Each tile reflects one Swagger-backed reporting dashboard endpoint.</div>
            </div>
            <StatusBadge tone={hasDashboardError ? 'warning' : 'success'}>{isLoadingAnyDashboard ? 'Refreshing' : 'API Connected'}</StatusBadge>
          </div>
          <div className="xocket-card-body readiness-queue-grid">
            {dashboardOrder.map((item) => {
              const query = dashboardQueries[item.key];
              const firstMetric = query.data?.metrics?.[0];
              const Icon = item.icon;
              return (
                <div className="readiness-queue-card" key={item.key}>
                  <div className="readiness-queue-top">
                    <strong>{item.label}</strong>
                    <StatusBadge tone={query.isError ? 'danger' : query.isFetching ? 'warning' : 'success'}>
                      {query.isError ? 'Error' : query.isFetching ? 'Loading' : 'Loaded'}
                    </StatusBadge>
                  </div>
                  <div className="readiness-queue-value"><Icon size={20} /> {formatMetricValue(firstMetric?.value)}</div>
                  <small>{firstMetric?.label ?? item.routeHint}</small>
                </div>
              );
            })}
          </div>
        </section>

        <section className="xocket-card">
          <div className="xocket-card-header">
            <div>
              <h2 className="xocket-card-title">Operations Alerts</h2>
              <div className="xocket-card-subtitle">Derived from dashboard health, not hardcoded legacy counts.</div>
            </div>
            <StatusBadge tone={hasDashboardError ? 'warning' : 'success'}>{hasDashboardError ? 'Review APIs' : 'Healthy'}</StatusBadge>
          </div>
          <div className="xocket-card-body notification-stack">
            {dashboardOrder.map((item) => {
              const query = dashboardQueries[item.key];
              const firstMetric = query.data?.metrics?.[0];
              return (
                <button type="button" className="notification-row" key={item.key}>
                  <span className={`notification-dot ${query.isError ? 'danger' : 'info'}`} />
                  <span>
                    <strong>{item.label}</strong>
                    <small>{query.isError ? 'Dashboard endpoint returned an error.' : `${firstMetric?.label ?? 'Dashboard'}: ${formatMetricValue(firstMetric?.value)}`}</small>
                  </span>
                  <ArrowRight size={16} />
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <section className="xocket-card workflow-card">
        <div className="xocket-card-header">
          <div>
            <h2 className="xocket-card-title">Legacy Workflow Visibility</h2>
            <div className="xocket-card-subtitle">Operational path rebuilt through LP-01 to LP-06; LP-07 adds reporting visibility.</div>
          </div>
          <StatusBadge tone="info">Workflow Map</StatusBadge>
        </div>
        <div className="xocket-card-body workflow-track">
          {workflowSteps.map((step, index) => (
            <div className="workflow-step done" key={step.label}>
              <div className="workflow-node">{index + 1}</div>
              <strong>{step.label}</strong>
              <span>{step.owner}</span>
              <small>{step.sla}</small>
            </div>
          ))}
        </div>
      </section>

      <div className="production-grid two-column">
        <section className="xocket-card">
          <div className="xocket-card-header">
            <div>
              <h2 className="xocket-card-title">Command Palette Surface</h2>
              <div className="xocket-card-subtitle">Navigation/search shell for operational work centers. Execution remains routed through module pages.</div>
            </div>
            <Command size={22} />
          </div>
          <div className="xocket-card-body command-panel">
            <label className="command-search">
              <Search size={18} />
              <input
                value={commandFilter}
                onChange={(event) => setCommandFilter(event.target.value)}
                placeholder="Search work center shortcuts..."
              />
            </label>
            <div className="command-results">
              {filteredCommands.map((action) => (
                <button type="button" key={action.label} onClick={() => onNavigate?.(action.route)}>
                  <Sparkles size={16} />
                  <span>{action.label}</span>
                  <kbd>Route</kbd>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="xocket-card">
          <div className="xocket-card-header">
            <div>
              <h2 className="xocket-card-title">Reporting Readiness</h2>
              <div className="xocket-card-subtitle">Production readiness is based on implemented surfaces and explicit backend gaps.</div>
            </div>
            <ShieldCheck size={22} />
          </div>
          <div className="xocket-card-body readiness-check-list">
            {[
              ['Operations dashboards', 'Six reporting dashboard endpoints surfaced.'],
              ['Snapshot library', 'Search, detail, and export are implemented in Reporting.'],
              ['Monitoring publishing', 'Monitoring reports can be published to snapshots where backend report id exists.'],
              ['Legacy parity tracking', 'LP notes now document implemented items and backend gaps.'],
              ['No invented metrics', 'Dashboard count values come from API response normalization only.']
            ].map(([area, detail]) => (
              <div className="readiness-check" key={area}>
                <div>
                  <strong>{area}</strong>
                  <span>{detail}</span>
                </div>
                <b>OK</b>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="xocket-card executive-reporting-strip">
        <div className="xocket-card-header">
          <div>
            <h2 className="xocket-card-title">Executive Reporting Modules</h2>
            <div className="xocket-card-subtitle">Open Reporting to drill into snapshots, exports, and dashboard-specific details.</div>
          </div>
          <StatusBadge tone="success">LP-07 Surface</StatusBadge>
        </div>
        <div className="xocket-card-body executive-tile-grid">
          {[
            ['Operations', Gauge],
            ['Placement', Workflow],
            ['Claims', FileCheck2],
            ['Documents', FileStack],
            ['Security', ShieldCheck],
            ['Users', Users],
            ['Performance', Activity],
            ['SLA Risk', AlertTriangle],
            ['Analytics', BarChart3],
            ['Timeline', Clock3],
            ['Templates', Layers3]
          ].map(([label, Icon]) => {
            const TypedIcon = Icon as typeof Gauge;
            return (
              <div className="executive-tile" key={label as string}>
                <TypedIcon size={22} />
                <strong>{label as string}</strong>
                <span>Reporting surface</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
