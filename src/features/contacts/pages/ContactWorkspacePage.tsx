import { useMemo, useState } from 'react';
import type { ColDef } from 'ag-grid-community';
import { AtSign, Building2, ContactRound, FileSearch, MapPin, Phone, RefreshCcw, Search, ShieldCheck, UserRound } from 'lucide-react';

import { Button } from '@/shared/components/Button';
import { EnterpriseGrid } from '@/shared/components/grid/EnterpriseGrid';
import { StatCard } from '@/shared/components/StatCard';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { useContactDetail, useContactSearch } from '../hooks/useContacts';
import { ContactMaintenancePanel } from '../components/ContactMaintenancePanel';
import type { ContactRow, ContactSearchRequest } from '../types/contact';

const PAGE_SIZE = 25;

type ContactFilterState = {
  search: string;
  contactType: string;
  last4: string;
  phone: string;
  email: string;
  stateCode: string;
};

function toNumberOrUndefined(value: string) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function maskSsn(last4?: string | null) {
  if (!last4) return '-';
  return `XXX-XX-${last4.padStart(4, '0')}`;
}

function contactTypeLabel(value?: string | number | null) {
  if (value === undefined || value === null || value === '') return 'Unknown';
  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    const map: Record<number, string> = { 1: 'Debtor', 2: 'Co-Debtor', 3: 'Attorney', 4: 'Firm', 5: 'Signatory' };
    return map[numeric] ?? `Type ${numeric}`;
  }
  return String(value);
}

export function ContactWorkspacePage() {
  const [page, setPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);
  const [filters, setFilters] = useState<ContactFilterState>({ search: '', contactType: '', last4: '', phone: '', email: '', stateCode: '' });
  const [submittedFilters, setSubmittedFilters] = useState<ContactFilterState>({ search: '', contactType: '', last4: '', phone: '', email: '', stateCode: '' });
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null);

  const request = useMemo<ContactSearchRequest>(() => ({
    page,
    pageSize: PAGE_SIZE,
    search: submittedFilters.search,
    contactType: toNumberOrUndefined(submittedFilters.contactType),
    last4: submittedFilters.last4,
    phone: submittedFilters.phone,
    email: submittedFilters.email,
    stateCode: submittedFilters.stateCode
  }), [page, submittedFilters]);

  const contactsQuery = useContactSearch(request, hasSearched);
  const contactDetailQuery = useContactDetail(selectedContactId);
  const contacts = contactsQuery.data?.items ?? [];
  const totalCount = contactsQuery.data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const selectedContact = contactDetailQuery.data ?? contacts.find((row) => row.id === selectedContactId) ?? null;

  const columns = useMemo<ColDef<ContactRow>[]>(() => [
    {
      headerName: 'Contact',
      field: 'fullName',
      pinned: 'left',
      minWidth: 260,
      cellRenderer: ({ data }: { data?: ContactRow }) => (
        <div className="grid-primary-cell">
          <strong>{data?.fullName ?? data?.companyName ?? `#${data?.id ?? '-'}`}</strong>
          <span>{data?.companyName ?? contactTypeLabel(data?.contactType)}</span>
        </div>
      )
    },
    { headerName: 'Type', field: 'contactType', minWidth: 140, valueFormatter: ({ value }) => contactTypeLabel(value) },
    { headerName: 'Last 4', field: 'last4', minWidth: 130, valueFormatter: ({ value }) => maskSsn(value) },
    { headerName: 'Phone', field: 'phone', minWidth: 160, valueFormatter: ({ value }) => value || '-' },
    { headerName: 'Email', field: 'email', minWidth: 240, valueFormatter: ({ value }) => value || '-' },
    { headerName: 'City', field: 'city', minWidth: 140, valueFormatter: ({ value }) => value || '-' },
    { headerName: 'State', field: 'stateCode', minWidth: 100, valueFormatter: ({ value }) => value || '-' },
    { headerName: 'Status', field: 'isActive', minWidth: 130, cellRenderer: ({ data }: { data?: ContactRow }) => <StatusBadge label={data?.isActive === false ? 'Inactive' : 'Active'} tone={data?.isActive === false ? 'neutral' : 'success'} /> }
  ], []);

  function submitSearch() {
    setPage(1);
    setSubmittedFilters(filters);
    setHasSearched(true);
  }

  function clearSearch() {
    const empty = { search: '', contactType: '', last4: '', phone: '', email: '', stateCode: '' };
    setFilters(empty);
    setSubmittedFilters(empty);
    setSelectedContactId(null);
    setHasSearched(false);
    setPage(1);
  }

  return (
    <div className="enterprise-page monitoring-page">
      <section className="placement-hero xocket-card monitoring-hero">
        <div> 
          <h1>Enterprise Contact Workspace</h1>
          <p>Search debtor, signatory, attorney, firm, and related contacts using server-side filters with CRM-style contact context.</p>
        </div>
        <div className="placement-hero-actions">
          <Button variant="secondary" onClick={() => contactsQuery.refetch()}><RefreshCcw size={16} /> Refresh</Button>
        </div>
      </section>

      <div className="stat-grid placement-stat-grid placement-stat-grid-wide">
        <StatCard icon={<ContactRound size={22} />} value={totalCount} label="Contacts Found" helper="Server result count" tone="primary" />
        <StatCard icon={<UserRound size={22} />} value={contacts.filter((row) => contactTypeLabel(row.contactType).toLowerCase().includes('debtor')).length} label="Debtor Contacts" helper="Current result set" tone="info" />
        <StatCard icon={<Building2 size={22} />} value={contacts.filter((row) => row.companyName).length} label="Firm / Company" helper="Current result set" tone="warning" />
        <StatCard icon={<AtSign size={22} />} value={contacts.filter((row) => row.email).length} label="With Email" helper="Current result set" tone="success" />
        <StatCard icon={<Phone size={22} />} value={contacts.filter((row) => row.phone).length} label="With Phone" helper="Current result set" tone="success" />
        <StatCard icon={<ShieldCheck size={22} />} value={contacts.filter((row) => row.last4).length} label="Identifier" helper="Last 4 present" tone="info" />
      </div>

      <section className="document-workspace-panel monitoring-production-panel">
        <div className="document-workspace-section-title">
          <div>
            <span className="enterprise-eyebrow">Contact Search</span>
            <h2>Master Contact Library</h2>
            <p>Search-first loading prevents large contact datasets from loading by default.</p>
          </div>
        </div>

        <div className="account-search-form account-advanced-grid">
          <label className="evictsure-form-group"><span className="evictsure-form-label">Search</span><input className="evictsure-form-input" value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Name, company, contact..." /></label>
          <label className="evictsure-form-group"><span className="evictsure-form-label">Contact Type</span><select className="evictsure-form-input" value={filters.contactType} onChange={(event) => setFilters((current) => ({ ...current, contactType: event.target.value }))}><option value="">Any</option><option value="1">Debtor</option><option value="2">Co-Debtor</option><option value="3">Attorney</option><option value="4">Firm</option><option value="5">Signatory</option></select></label>
          <label className="evictsure-form-group"><span className="evictsure-form-label">Last 4</span><input className="evictsure-form-input" maxLength={4} value={filters.last4} onChange={(event) => setFilters((current) => ({ ...current, last4: event.target.value }))} placeholder="1234" /></label>
          <label className="evictsure-form-group"><span className="evictsure-form-label">Phone</span><input className="evictsure-form-input" value={filters.phone} onChange={(event) => setFilters((current) => ({ ...current, phone: event.target.value }))} placeholder="Phone" /></label>
          <label className="evictsure-form-group"><span className="evictsure-form-label">Email</span><input className="evictsure-form-input" value={filters.email} onChange={(event) => setFilters((current) => ({ ...current, email: event.target.value }))} placeholder="Email" /></label>
          <label className="evictsure-form-group"><span className="evictsure-form-label">State</span><input className="evictsure-form-input" maxLength={2} value={filters.stateCode} onChange={(event) => setFilters((current) => ({ ...current, stateCode: event.target.value.toUpperCase() }))} placeholder="TX" /></label>
        </div>

        <div className="account-search-toolbar">
          <div className="workspace-muted">Contacts are loaded only after search.</div>
          <div className="account-header-actions"><Button variant="secondary" onClick={clearSearch}>Clear</Button><Button onClick={submitSearch}><Search size={16} /> Search Contacts</Button></div>
        </div>
      </section>

      <section className="document-library-card">
        <div className="document-workspace-section-title">
          <div>
            <span className="enterprise-eyebrow">Current Work</span>
            <h2>Contacts</h2>
            <p>{hasSearched ? `${totalCount.toLocaleString()} matching contact records.` : 'Search to load contacts.'}</p>
          </div>
        </div>
        <EnterpriseGrid rows={contacts} columns={columns} isLoading={contactsQuery.isFetching} height={520} emptyMessage={hasSearched ? 'No contacts matched your criteria.' : 'Search to load contacts.'} onRowDoubleClicked={(row) => setSelectedContactId(row.id)} />
        {hasSearched && (
          <div className="account-search-toolbar">
            <span className="workspace-muted">Page {page} of {totalPages}</span>
            <div className="account-header-actions"><Button variant="secondary" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</Button><Button variant="secondary" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}>Next</Button></div>
          </div>
        )}
      </section>

      {selectedContact && (
        <section className="account-info-panel">
          <div className="account-info-panel-header">
            <div>
              <span className="enterprise-eyebrow">Contact Workspace</span>
              <h2>{selectedContact.fullName ?? selectedContact.companyName ?? `Contact ${selectedContact.id}`}</h2>
            </div>
            <Button variant="secondary" onClick={() => setSelectedContactId(null)}>Close</Button>
          </div>
          <div className="account-overview-grid">
            <div className="account-contact-card">
              <div className="account-contact-avatar"><UserRound size={24} /></div>
              <div className="account-contact-main"><strong>{selectedContact.fullName ?? selectedContact.companyName ?? '-'}</strong><span>{contactTypeLabel(selectedContact.contactType)}</span></div>
              <div className="account-contact-badges"><StatusBadge label={selectedContact.isActive === false ? 'Inactive' : 'Active'} tone={selectedContact.isActive === false ? 'neutral' : 'success'} /></div>
            </div>
            <div className="account-info-panel">
              <div className="account-info-panel-header"><div><span className="enterprise-eyebrow">Communication</span><h3>Phone and Email</h3></div></div>
              <div className="account-key-value-grid">
                <div className="account-key-value"><span>Phone</span><strong>{selectedContact.phone ?? '-'}</strong></div>
                <div className="account-key-value"><span>Email</span><strong>{selectedContact.email ?? '-'}</strong></div>
                <div className="account-key-value"><span>Identifier</span><strong>{maskSsn(selectedContact.last4)}</strong></div>
              </div>
            </div>
            <div className="account-info-panel">
              <div className="account-info-panel-header"><div><span className="enterprise-eyebrow">Address</span><h3>Primary Address</h3></div><MapPin size={18} /></div>
              <div className="account-key-value-grid">
                <div className="account-key-value"><span>Address</span><strong>{selectedContact.address1 ?? '-'}</strong></div>
                <div className="account-key-value"><span>City</span><strong>{selectedContact.city ?? '-'}</strong></div>
                <div className="account-key-value"><span>State</span><strong>{selectedContact.stateCode ?? '-'}</strong></div>
                <div className="account-key-value"><span>Postal Code</span><strong>{selectedContact.postalCode ?? '-'}</strong></div>
              </div>
            </div>
            <div className="account-info-panel">
              <div className="account-info-panel-header"><div><span className="enterprise-eyebrow">Related Work</span><h3>Accounts, Timeline, Tasks, Documents</h3></div></div>
              <div className="workspace-empty-state"><div className="workspace-empty-icon"><FileSearch size={22} /></div><strong>Maintenance enabled</strong><span>Use the panel below for profile, address, phone, email, and identifier updates.</span></div>
            </div>
          </div>
        <ContactMaintenancePanel contact={selectedContact} />
        </section>
      )}
    </div>
  );
}
