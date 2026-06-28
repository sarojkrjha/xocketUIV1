import { useMemo, useState, type ReactNode } from 'react';
import type { ColDef, ValueFormatterParams } from 'ag-grid-community';
import { FilePlus2, FileStack, Filter, RefreshCcw, Search, UploadCloud } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/shared/components/Button';
import { EnterpriseGrid } from '@/shared/components/grid/EnterpriseGrid';
import { StatCard } from '@/shared/components/StatCard';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { queryKeys } from '@/shared/api/queryKeys';
import { documentStatusTone, formatDocumentStatus } from '../api/documentStatusMaps';
import { generateDocument, uploadDocument } from '../api/documentsApi';
import { DocumentVersionDrawer } from '../components/DocumentVersionDrawer';
import { useDocuments } from '../hooks/useDocuments';
import type { DocumentQueueItem, DocumentSearchRequest, GenerateDocumentRequest } from '../types/documents';

type FilterState = {
  search: string;
  referenceType: string;
  referenceId: string;
  documentType: string;
};

const initialFilters: FilterState = {
  search: '',
  referenceType: '',
  referenceId: '',
  documentType: ''
};

const documentTypeOptions = ['ProofOfClaim', 'CourtReceipt', 'FilingPackage', 'ScrubResponse', 'MonitoringReport', 'General'];
const referenceTypeOptions = ['Account', 'PlacementAccount', 'Claim', 'ScrubInventory', 'MonitoringReport'];

type ActionTileProps = {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
};

function ActionTile({ icon, title, description, children }: ActionTileProps) {
  return (
    <section className="enterprise-card document-action-tile">
      <div className="document-action-tile-header">
        <div className="document-action-icon">{icon}</div>
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function toNumberOrUndefined(value: string) {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function formatDate(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(date);
}

function formatBytes(value?: number | null) {
  if (!value) return '-';
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function dateFormatter(params: ValueFormatterParams<DocumentQueueItem, string | null | undefined>) {
  return formatDate(params.value);
}

function DocumentGeneratePanel({ onGenerated }: { onGenerated: () => void }) {
  const [form, setForm] = useState({
    documentType: 'ProofOfClaim',
    referenceType: 'Claim',
    referenceId: '',
    templateType: 'Default',
    fileName: '',
    generatePdf: true
  });

  const mutation = useMutation({
    mutationFn: (request: GenerateDocumentRequest) => generateDocument(request),
    onSuccess: onGenerated
  });

  const canGenerate = Boolean(form.documentType && form.referenceType && toNumberOrUndefined(form.referenceId));

  return (
    <ActionTile
      icon={<FilePlus2 size={20} />}
      title="Generate Document"
      description="Create POC, filing package, scrub response, or monitoring output from a template."
    >
      <div className="document-action-grid">
        <label className="evictsure-form-group">
          <span className="evictsure-form-label">Document Type</span>
          <select className="evictsure-form-select" value={form.documentType} onChange={(event) => setForm((current) => ({ ...current, documentType: event.target.value }))}>
            {documentTypeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <label className="evictsure-form-group">
          <span className="evictsure-form-label">Reference Type</span>
          <select className="evictsure-form-select" value={form.referenceType} onChange={(event) => setForm((current) => ({ ...current, referenceType: event.target.value }))}>
            {referenceTypeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <label className="evictsure-form-group">
          <span className="evictsure-form-label">Reference Id</span>
          <input className="evictsure-form-input" value={form.referenceId} onChange={(event) => setForm((current) => ({ ...current, referenceId: event.target.value }))} placeholder="Claim, placement, or account id" />
        </label>
        <label className="evictsure-form-group">
          <span className="evictsure-form-label">Template</span>
          <input className="evictsure-form-input" value={form.templateType} onChange={(event) => setForm((current) => ({ ...current, templateType: event.target.value }))} />
        </label>
      </div>
      <div className="document-action-footer">
        <label className="document-inline-check">
          <input type="checkbox" checked={form.generatePdf} onChange={(event) => setForm((current) => ({ ...current, generatePdf: event.target.checked }))} />
          Generate PDF
        </label>
        <Button
          onClick={() => mutation.mutate({
            documentType: form.documentType,
            referenceType: form.referenceType,
            referenceId: toNumberOrUndefined(form.referenceId) ?? 0,
            templateType: form.templateType,
            fileName: form.fileName || undefined,
            generatedBy: 'UI User',
            generatePdf: form.generatePdf
          })}
          disabled={!canGenerate || mutation.isPending}
        >
          Generate
        </Button>
      </div>
      {mutation.isSuccess ? <p className="workspace-success">Document generation requested.</p> : null}
      {mutation.isError ? <p className="workspace-error">Document generation failed.</p> : null}
    </ActionTile>
  );
}

function DocumentUploadPanel({ onUploaded }: { onUploaded: () => void }) {
  const [form, setForm] = useState({
    documentType: 'General',
    referenceType: 'Claim',
    referenceId: '',
    uploadedBy: 'UI User'
  });
  const [file, setFile] = useState<File | null>(null);

  const mutation = useMutation({
    mutationFn: uploadDocument,
    onSuccess: onUploaded
  });

  const canUpload = Boolean(file && form.documentType && form.referenceType && toNumberOrUndefined(form.referenceId) && form.uploadedBy);

  return (
    <ActionTile
      icon={<UploadCloud size={20} />}
      title="Upload Document"
      description="Attach court receipts, supporting documents, attorney letters, or external files."
    >
      <div className="document-action-grid">
        <label className="evictsure-form-group">
          <span className="evictsure-form-label">Document Type</span>
          <select className="evictsure-form-select" value={form.documentType} onChange={(event) => setForm((current) => ({ ...current, documentType: event.target.value }))}>
            {documentTypeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <label className="evictsure-form-group">
          <span className="evictsure-form-label">Reference Type</span>
          <select className="evictsure-form-select" value={form.referenceType} onChange={(event) => setForm((current) => ({ ...current, referenceType: event.target.value }))}>
            {referenceTypeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <label className="evictsure-form-group">
          <span className="evictsure-form-label">Reference Id</span>
          <input className="evictsure-form-input" value={form.referenceId} onChange={(event) => setForm((current) => ({ ...current, referenceId: event.target.value }))} />
        </label>
        <label className="evictsure-form-group">
          <span className="evictsure-form-label">File</span>
          <input className="evictsure-form-input" type="file" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
        </label>
      </div>
      <div className="document-action-footer">
        <span className="workspace-muted">{file ? file.name : 'No file selected'}</span>
        <Button
          onClick={() => {
            if (!file) return;
            mutation.mutate({
              file,
              documentType: form.documentType,
              referenceType: form.referenceType,
              referenceId: toNumberOrUndefined(form.referenceId) ?? 0,
              uploadedBy: form.uploadedBy
            });
          }}
          disabled={!canUpload || mutation.isPending}
        >
          Upload
        </Button>
      </div>
      {mutation.isSuccess ? <p className="workspace-success">Document uploaded successfully.</p> : null}
      {mutation.isError ? <p className="workspace-error">Document upload failed.</p> : null}
    </ActionTile>
  );
}

export function DocumentCenterPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [submittedFilters, setSubmittedFilters] = useState<FilterState>(initialFilters);
  const [hasSubmittedQuery, setHasSubmittedQuery] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentQueueItem | null>(null);
  const pageSize = 25;

  const request = useMemo<DocumentSearchRequest>(() => ({
    page,
    pageSize,
    search: submittedFilters.search.trim() || undefined,
    referenceType: submittedFilters.referenceType || undefined,
    referenceId: toNumberOrUndefined(submittedFilters.referenceId),
    documentType: submittedFilters.documentType || undefined
  }), [page, submittedFilters]);

  const documentsQuery = useDocuments(request, hasSubmittedQuery);
  const rows = documentsQuery.data?.items ?? [];
  const totalCount = documentsQuery.data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const columns = useMemo<ColDef<DocumentQueueItem>[]>(() => [
    { field: 'fileName', headerName: 'Document', minWidth: 220 },
    { field: 'documentType', headerName: 'Type', minWidth: 150 },
    { field: 'referenceType', headerName: 'Reference', minWidth: 140 },
    { field: 'referenceId', headerName: 'Reference Id', minWidth: 120 },
    {
      field: 'statusLabel',
      headerName: 'Status',
      minWidth: 140,
      cellRenderer: (params: { data?: DocumentQueueItem }) => {
        const label = params.data?.statusLabel ?? formatDocumentStatus(params.data?.status);
        return <StatusBadge label={label} tone={documentStatusTone(label)} />;
      }
    },
    { field: 'versionNumber', headerName: 'Version', minWidth: 110 },
    { field: 'fileSizeBytes', headerName: 'Size', minWidth: 110, valueFormatter: (params) => formatBytes(params.value) },
    { field: 'generatedBy', headerName: 'Generated By', minWidth: 150 },
    { field: 'uploadedBy', headerName: 'Uploaded By', minWidth: 150 },
    { field: 'createdOnUtc', headerName: 'Created', minWidth: 140, valueFormatter: dateFormatter }
  ], []);

  const refreshDocuments = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.documents.root });
    if (hasSubmittedQuery) {
      await documentsQuery.refetch();
    }
  };

  return (
    <div className="enterprise-page document-center-page">
      <div className="enterprise-page-header">
        <div> 
          <h1>Enterprise Document Center</h1>
          <p>Generate, upload, version, review, and download documents across Placement, Claims, Scrubbing, and Monitoring.</p>
        </div>
        <div className="enterprise-header-actions">
          <Button variant="secondary" onClick={() => refreshDocuments()} disabled={documentsQuery.isFetching}>
            <RefreshCcw size={16} /> Refresh
          </Button>
        </div>
      </div>

      <section className="document-workspace-panel">
        <div className="document-workspace-section-title">
          <div>
            <span className="enterprise-eyebrow">Today's Work</span>
            <h2>Document Production</h2>
            <p>Generate and upload documents from one operational work area before searching the library below.</p>
          </div>
        </div>

        <div className="document-kpi-row">
          <StatCard icon={<FileStack size={20} />} label="Loaded Documents" value={String(totalCount)} />
          <StatCard icon={<FilePlus2 size={20} />} label="Ready to Generate" value="Ready" tone="success" />
          <StatCard icon={<UploadCloud size={20} />} label="Ready to Upload" value="Ready" tone="info" />
        </div>

        <div className="document-actions-layout document-actions-layout-polished">
          <DocumentGeneratePanel onGenerated={refreshDocuments} />
          <DocumentUploadPanel onUploaded={refreshDocuments} />
        </div>
      </section>

      <section className="enterprise-card document-search-card document-library-card">
        <div className="enterprise-card-title-row">
          <Filter size={18} />
          <div>
            <h3>Document Library</h3>
            <p>Search before loading to protect performance on large repositories.</p>
          </div>
        </div>
        <div className="account-search-form document-search-form">
          <label className="evictsure-form-group">
            <span className="evictsure-form-label">Search</span>
            <input className="evictsure-form-input" value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="File name, document type, reference..." />
          </label>
          <label className="evictsure-form-group">
            <span className="evictsure-form-label">Document Type</span>
            <input className="evictsure-form-input" value={filters.documentType} onChange={(event) => setFilters((current) => ({ ...current, documentType: event.target.value }))} placeholder="ProofOfClaim" />
          </label>
          <label className="evictsure-form-group">
            <span className="evictsure-form-label">Reference Type</span>
            <input className="evictsure-form-input" value={filters.referenceType} onChange={(event) => setFilters((current) => ({ ...current, referenceType: event.target.value }))} placeholder="Claim" />
          </label>
          <label className="evictsure-form-group">
            <span className="evictsure-form-label">Reference Id</span>
            <input className="evictsure-form-input" value={filters.referenceId} onChange={(event) => setFilters((current) => ({ ...current, referenceId: event.target.value }))} placeholder="12345" />
          </label>
        </div>
        <div className="document-action-footer">
          <Button
            onClick={() => {
              setPage(1);
              setSubmittedFilters(filters);
              setHasSubmittedQuery(true);
            }}
          >
            <Search size={16} /> Search Library
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setFilters(initialFilters);
              setSubmittedFilters(initialFilters);
              setPage(1);
              setHasSubmittedQuery(false);
            }}
          >
            Clear
          </Button>
        </div>
      </section>

      {!hasSubmittedQuery ? (
        <section className="enterprise-empty-state">
          <FileStack size={42} />
          <h3>Search before loading documents</h3>
          <p>Use file name, document type, reference type, or reference id to avoid loading unnecessary data.</p>
        </section>
      ) : (
        <section className="enterprise-card document-grid-card">
          <div className="enterprise-card-title-row enterprise-card-title-row-spaced">
            <div>
              <h3>Documents</h3>
              <p>{documentsQuery.isFetching ? 'Loading documents...' : `${totalCount} matching document(s)`}</p>
            </div>
          </div>
          {documentsQuery.isError ? <div className="xocket-alert xocket-alert-danger">Unable to load documents.</div> : null}
          <EnterpriseGrid<DocumentQueueItem>
            rows={rows}
            columns={columns}
            isLoading={documentsQuery.isFetching}
            emptyMessage="No documents matched your search."
            height={520}
            onRowDoubleClicked={(row) => setSelectedDocument(row)}
          />
          <div className="account-search-pagination">
            <Button variant="secondary" disabled={page <= 1 || documentsQuery.isFetching} onClick={() => setPage((current) => Math.max(1, current - 1))}>
              Previous
            </Button>
            <span>Page {page} of {totalPages}</span>
            <Button variant="secondary" disabled={page >= totalPages || documentsQuery.isFetching} onClick={() => setPage((current) => current + 1)}>
              Next
            </Button>
          </div>
        </section>
      )}

      <DocumentVersionDrawer document={selectedDocument} onClose={() => setSelectedDocument(null)} />
    </div>
  );
}
