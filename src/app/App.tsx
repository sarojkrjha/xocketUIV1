import { useMemo, useState } from 'react';

import { useAuthStore } from '@/features/auth/store/authStore';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { AppShell } from '@/shared/layout/AppShell';
import { DashboardPlaceholderPage } from '@/features/dashboard/pages/DashboardPlaceholderPage';
import { PlacementWorkCenterPage } from '@/features/placement/pages/PlacementWorkCenterPage';
import { PlacementAccountWorkspacePage } from '@/features/placement/pages/PlacementAccountWorkspacePage';
import { ClaimsWorkCenterPage } from '@/features/claims/pages/ClaimsWorkCenterPage';
import { ClaimWorkspacePage } from '@/features/claims/pages/ClaimWorkspacePage';
import { DocumentCenterPage } from '@/features/documents/pages/DocumentCenterPage';
import { ScrubbingOperationsWorkspacePage } from '@/features/scrubbing/pages/ScrubbingOperationsWorkspacePage';
import { MonitoringOperationsCenterPage } from '@/features/monitoring/pages/MonitoringOperationsCenterPage';
import { PaymentsWorkspacePage } from '@/features/payments/pages/PaymentsWorkspacePage';
import { BankruptcyCasesWorkspacePage } from '@/features/bankruptcy/pages/BankruptcyCasesWorkspacePage';
import { ContactWorkspacePage } from '@/features/contacts/pages/ContactWorkspacePage';
import { EnterpriseReportingCenterPage } from '@/features/reporting/pages/EnterpriseReportingCenterPage';
import { ImportOperationsCenterPage } from '@/features/imports/pages/ImportOperationsCenterPage';
import { PlacementImportWorkspacePage } from '@/features/imports/pages/PlacementImportWorkspacePage';
import { MatchReviewQueuePage } from '@/features/placement/pages/MatchReviewQueuePage';
import { LegalReviewQueuePage } from '@/features/placement/pages/LegalReviewQueuePage';
import { FilingOperationsQueuePage } from '@/features/placement/pages/FilingOperationsQueuePage';
import { AdministrationCenterPage } from '@/features/administration/pages/AdministrationCenterPage';
import { ProductionReadinessPage } from '@/features/readiness/pages/ProductionReadinessPage';
import { AccountSearchPage } from '@/features/accounts/pages/AccountSearchPage';
import { AccountWorkspacePage } from '@/features/accounts/pages/AccountWorkspacePage';
import type { AppRoute } from '@/shared/layout/navigation';

type WorkspaceState = {
  accountId?: number;
  placementAccountId?: number;
  claimId?: number;
};

export function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [activeRoute, setActiveRoute] = useState<AppRoute>('dashboard');
  const [workspace, setWorkspace] = useState<WorkspaceState>({});

  const navigate = (route: AppRoute) => {
    setActiveRoute(route);
    setWorkspace({});
  };

  const page = useMemo(() => {
    switch (activeRoute) {
      case 'placement':
        if (workspace.placementAccountId) {
          return (
            <PlacementAccountWorkspacePage
              placementAccountId={workspace.placementAccountId}
              onBack={() => setWorkspace({})}
            />
          );
        }

        return <PlacementWorkCenterPage onOpenPlacementAccount={(placementAccountId) => setWorkspace({ placementAccountId })} />;
      case 'placement-import':
        return <PlacementImportWorkspacePage />;
      case 'matching-review':
        if (workspace.placementAccountId) {
          return (
            <PlacementAccountWorkspacePage
              placementAccountId={workspace.placementAccountId}
              onBack={() => setWorkspace({})}
            />
          );
        }

        return <MatchReviewQueuePage onOpenPlacementAccount={(placementAccountId) => setWorkspace({ placementAccountId })} />;
      case 'filing-operations':
        if (workspace.placementAccountId) {
          return (
            <PlacementAccountWorkspacePage
              placementAccountId={workspace.placementAccountId}
              onBack={() => setWorkspace({})}
            />
          );
        }

        return <FilingOperationsQueuePage onOpenPlacementAccount={(placementAccountId) => setWorkspace({ placementAccountId })} />;
      case 'legal-review':
        if (workspace.placementAccountId) {
          return (
            <PlacementAccountWorkspacePage
              placementAccountId={workspace.placementAccountId}
              onBack={() => setWorkspace({})}
            />
          );
        }

        return <LegalReviewQueuePage onOpenPlacementAccount={(placementAccountId) => setWorkspace({ placementAccountId })} />;
      case 'claims':
        if (workspace.claimId) {
          return (
            <ClaimWorkspacePage
              claimId={workspace.claimId}
              onBack={() => setWorkspace({})}
            />
          );
        }

        return <ClaimsWorkCenterPage onOpenClaim={(claimId) => setWorkspace({ claimId })} />;
      case 'documents':
        return <DocumentCenterPage />;
      case 'scrubbing':
        return <ScrubbingOperationsWorkspacePage />;
      case 'monitoring':
        return <MonitoringOperationsCenterPage />;
      case 'imports':
        return <ImportOperationsCenterPage />;
      case 'payments':
        return <PaymentsWorkspacePage />;
      case 'cases':
        return <BankruptcyCasesWorkspacePage />;
      case 'contacts':
        return <ContactWorkspacePage />;
      case 'reporting':
        return <EnterpriseReportingCenterPage />;
      case 'administration':
        return <AdministrationCenterPage />;
      case 'production-readiness':
        return <ProductionReadinessPage />;
      case 'accounts':
        if (workspace.accountId) {
          return (
            <AccountWorkspacePage
              accountId={workspace.accountId}
              onBackToSearch={() => setWorkspace({})}
              onOpenPlacement={() => setActiveRoute('placement')}
            />
          );
        }

        return <AccountSearchPage onViewAccount={(accountId) => setWorkspace({ accountId })} />;
      default:
        return <DashboardPlaceholderPage onNavigate={navigate} />;
    }
  }, [activeRoute, workspace.accountId, workspace.placementAccountId, workspace.claimId]);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <AppShell activeRoute={activeRoute} onNavigate={navigate}>
      {page}
    </AppShell>
  );
}
