import {
  Banknote,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  FileCheck2,
  FileStack,
  FileInput,
  FileUp,
  FolderInput,
  Gavel,
  Gauge,
  Inbox,
  Scale,
  Rocket,
  ShieldCheck,
  Users,
  type LucideIcon
} from 'lucide-react';

export type AppRoute =
  | 'dashboard'
  | 'placement'
  | 'placement-import'
  | 'matching-review'
  | 'legal-review'
  | 'filing-operations'
  | 'claims'
  | 'payments'
  | 'cases'
  | 'accounts'
  | 'contacts'
  | 'documents'
  | 'scrubbing'
  | 'monitoring'
  | 'imports'
  | 'reporting'
  | 'administration'
  | 'production-readiness';

export type NavigationItem = {
  route: AppRoute;
  label: string;
  icon: LucideIcon;
  permission?: string;
};

export type NavigationSection = {
  title: string;
  items: NavigationItem[];
};

export const navigationSections: NavigationSection[] = [
  {
    title: 'Operations',
    items: [
      { route: 'dashboard', label: 'Operations Center', icon: Gauge },
      { route: 'placement', label: 'Placement', icon: Inbox },
      { route: 'placement-import', label: 'Placement Import', icon: FileUp },
      { route: 'matching-review', label: 'Matching Review', icon: ShieldCheck },
      { route: 'legal-review', label: 'Legal Review', icon: Scale },
      { route: 'filing-operations', label: 'Filing Operations', icon: FileInput },
      { route: 'claims', label: 'Claims / POC', icon: FileCheck2 },
      { route: 'payments', label: 'Payments', icon: Banknote }
    ]
  },
  {
    title: 'Bankruptcy',
    items: [
      { route: 'cases', label: 'Cases', icon: Gavel },
      { route: 'accounts', label: 'Accounts', icon: BriefcaseBusiness },
      { route: 'contacts', label: 'Contacts', icon: Users },
      { route: 'documents', label: 'Documents', icon: FileStack }
    ]
  },
  {
    title: 'Enterprise',
    items: [
      { route: 'scrubbing', label: 'Scrubbing', icon: ShieldCheck },
      { route: 'monitoring', label: 'Monitoring', icon: Scale },
      { route: 'imports', label: 'Imports', icon: FolderInput },
      { route: 'reporting', label: 'Reporting', icon: BarChart3 }
    ]
  },
  {
    title: 'System',
    items: [
      { route: 'administration', label: 'Administration', icon: Building2 },
      { route: 'production-readiness', label: 'Production Readiness', icon: Rocket }
    ]
  }
];

export const routeTitles: Record<AppRoute, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Enterprise Operations Portal',
    subtitle: 'Operations Center · Today’s work and business health'
  },
  placement: {
    title: 'Placement Work Center',
    subtitle: 'Search, triage, and manage placement accounts'
  },
  'placement-import': {
    title: 'Placement Import',
    subtitle: 'Upload and review client placement files'
  },
  'matching-review': {
    title: 'Matching Review',
    subtitle: 'Pending bankruptcy match review workflow'
  },
  'legal-review': {
    title: 'Legal Review',
    subtitle: 'Legal approval, rejection, escalation, and return queue'
  },
  'filing-operations': {
    title: 'Filing Operations',
    subtitle: 'POC generation, external filing, court receipt, and filing completion'
  },
  claims: {
    title: 'Claims / POC',
    subtitle: 'Proof of claim operations'
  },
  payments: {
    title: 'Payments',
    subtitle: 'NDC and receipt payment processing'
  },
  cases: {
    title: 'Bankruptcy Cases',
    subtitle: 'Case search and debtor context'
  },
  accounts: {
    title: 'Accounts',
    subtitle: 'Account search and bankruptcy status'
  },
  contacts: {
    title: 'Contacts',
    subtitle: 'Debtor, signatory, and firm contacts'
  },
  documents: {
    title: 'Documents',
    subtitle: 'Generated and uploaded document packages'
  },
  scrubbing: {
    title: 'Scrubbing',
    subtitle: 'Inventory, runs, responses, and reported bankruptcies'
  },
  monitoring: {
    title: 'Monitoring',
    subtitle: 'OHC alerts and conversion workflow'
  },
  imports: {
    title: 'Imports',
    subtitle: 'G2, bankruptcy, placement, and file ingestion operations'
  },
  reporting: {
    title: 'Reporting',
    subtitle: 'Operational and executive reporting'
  },
  administration: {
    title: 'Administration',
    subtitle: 'Security, clients, portfolios, workflow queues, and system settings'
  },
  'production-readiness': {
    title: 'Production Readiness',
    subtitle: 'End-to-end workflow validation, backend gap register, smoke tests, and release gates'
  }
};
