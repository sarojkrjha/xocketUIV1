import { ChangeEvent, useMemo, useState } from 'react';
import {
  BadgeCheck,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  ExternalLink,
  FileArchive,
  FileText,
  Gavel,
  Loader2,
  Send,
  UploadCloud,
  UserCheck
} from 'lucide-react';

import { useAuthStore } from '@/features/auth/store/authStore';
import { Button } from '@/shared/components/Button';
import { StatusBadge } from '@/shared/components/StatusBadge';
import type { PlacementAccountDetail } from '../types/placement';
import {
  useAssignPlacementFiling,
  useGeneratePlacementDocument,
  usePlacementFilingPage,
  useSubmitPlacementFiling,
  useUploadPlacementCourtReceipt,
  useUploadPlacementPocDocument
} from '../hooks/usePlacementFiling';

const templateOptions = [
  { value: 'ProofOfClaim', label: 'Proof of Claim' },
  { value: 'ExhibitA', label: 'Exhibit A' },
  { value: 'ExhibitB', label: 'Exhibit B' },
  { value: 'CoverLetter', label: 'Cover Letter' },
  { value: 'MailingLabel', label: 'Mailing Label' }
];

const formatDate = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
};

const numberValue = (value: string) => {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

type PlacementFilingWorkspaceProps = {
  detail: PlacementAccountDetail;
  onRefresh: () => void;
};

type ValidationItem = {
  key: string;
  label: string;
  complete: boolean;
  helper: string;
};

function buildValidation(detail: PlacementAccountDetail, pocDocumentId: string, courtReceiptId: string, courtClaimNumber: string): ValidationItem[] {
  return [
    {
      key: 'court',
      label: 'Court selected',
      complete: Boolean(detail.courtName || detail.bankruptcyCourt),
      helper: detail.courtName ?? detail.bankruptcyCourt ?? 'Court is required before external filing.'
    },
    {
      key: 'attorney',
      label: 'Attorney assigned',
      complete: Boolean(detail.attorneyName),
      helper: detail.attorneyName ?? 'Assign attorney before filing.'
    },
    {
      key: 'filer',
      label: 'Filer assigned',
      complete: Boolean(detail.filerUserId),
      helper: detail.filerUserId ?? 'Assign a filing user before submission.'
    },
    {
      key: 'document',
      label: 'POC document selected',
      complete: Boolean(numberValue(pocDocumentId)),
      helper: pocDocumentId || 'Enter the generated/uploaded POC document id returned by the document service.'
    },
    {
      key: 'receipt',
      label: 'Court receipt selected',
      complete: Boolean(numberValue(courtReceiptId)),
      helper: courtReceiptId || 'Enter the uploaded receipt document id before completing submission.'
    },
    {
      key: 'claimNumber',
      label: 'Court claim number captured',
      complete: Boolean(courtClaimNumber.trim()),
      helper: courtClaimNumber || 'Capture claim number after external court filing.'
    }
  ];
}

function WorkflowStep({ complete, active, label, helper }: { complete?: boolean; active?: boolean; label: string; helper: string }) {
  return (
    <div className={`filing-step ${complete ? 'complete' : ''} ${active ? 'active' : ''}`}>
      <span>{complete ? <CheckCircle2 size={16} /> : active ? <Loader2 size={16} /> : null}</span>
      <strong>{label}</strong>
      <small>{helper}</small>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="filing-context-field">
      <span>{label}</span>
      <strong>{value ?? '-'}</strong>
    </div>
  );
}

function FilePicker({ id, label, onChange, disabled }: { id: string; label: string; onChange: (file: File | null) => void; disabled?: boolean }) {
  return (
    <label className={`filing-upload-box ${disabled ? 'disabled' : ''}`} htmlFor={id}>
      <UploadCloud size={24} />
      <strong>{label}</strong>
      <span>PDF, PNG, JPG, DOC, DOCX supported by the API.</span>
      <input
        id={id}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
        disabled={disabled}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.files?.[0] ?? null)}
      />
    </label>
  );
}

export function PlacementFilingWorkspace({ detail, onRefresh }: PlacementFilingWorkspaceProps) {
  const placementAccountId = detail.placementAccountId ?? detail.id;
  const user = useAuthStore((state) => state.user);
  const currentUser = user?.email ?? user?.name ?? 'xocket.user@local';
  const filingPage = usePlacementFilingPage(placementAccountId);
  const assignFiling = useAssignPlacementFiling(placementAccountId);
  const generateDocument = useGeneratePlacementDocument(placementAccountId);
  const uploadPoc = useUploadPlacementPocDocument(placementAccountId);
  const uploadReceipt = useUploadPlacementCourtReceipt(placementAccountId);
  const submitFiling = useSubmitPlacementFiling(placementAccountId);

  const [courtId, setCourtId] = useState('');
  const [district, setDistrict] = useState(detail.filingDistrict ?? '');
  const [division, setDivision] = useState(detail.filingDivision ?? '');
  const [attorneyContactId, setAttorneyContactId] = useState('');
  const [signatoryUserId, setSignatoryUserId] = useState('');
  const [filerUserId, setFilerUserId] = useState(detail.filerUserId ?? currentUser);
  const [templateType, setTemplateType] = useState('ProofOfClaim');
  const [pocDocumentId, setPocDocumentId] = useState('');
  const [courtReceiptId, setCourtReceiptId] = useState('');
  const [courtClaimNumber, setCourtClaimNumber] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const validation = useMemo(
    () => buildValidation(detail, pocDocumentId, courtReceiptId, courtClaimNumber),
    [detail, pocDocumentId, courtReceiptId, courtClaimNumber]
  );
  const canSubmit = validation.every((item) => item.complete);
  const page = filingPage.data;

  const runAssignment = async () => {
    setMessage(null);
    await assignFiling.mutateAsync({
      placementAccountId,
      courtId: numberValue(courtId),
      district: district || null,
      division: division || null,
      attorneyContactId: numberValue(attorneyContactId),
      signatoryUserId: signatoryUserId || null,
      filerUserId: filerUserId || null,
      assignedBy: currentUser
    });
    setMessage('Filing assignment saved.');
    onRefresh();
  };

  const runGenerate = async () => {
    setMessage(null);
    await generateDocument.mutateAsync({ placementAccountId, templateType, generatedBy: currentUser });
    setMessage(`${templateOptions.find((item) => item.value === templateType)?.label ?? templateType} generation requested.`);
    onRefresh();
  };

  const uploadPocFile = async (file: File | null) => {
    if (!file) return;
    setMessage(null);
    await uploadPoc.mutateAsync({ placementAccountId, file, generatedBy: currentUser });
    setMessage(`POC document uploaded: ${file.name}`);
    onRefresh();
  };

  const uploadReceiptFile = async (file: File | null) => {
    if (!file) return;
    setMessage(null);
    await uploadReceipt.mutateAsync({ placementAccountId, file, uploadedBy: currentUser });
    setMessage(`Court receipt uploaded: ${file.name}`);
    onRefresh();
  };

  const runSubmit = async () => {
    if (!canSubmit) return;
    setMessage(null);
    await submitFiling.mutateAsync({
      placementAccountId,
      courtClaimNumber,
      pocDocumentId: numberValue(pocDocumentId) ?? 0,
      courtReceiptId: numberValue(courtReceiptId) ?? 0,
      submittedBy: currentUser
    });
    setMessage('Filing submitted and placement workflow advanced.');
    onRefresh();
  };

  const copy = async (value?: string | null) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setMessage('Copied to clipboard.');
  };

  const busy = assignFiling.isPending || generateDocument.isPending || uploadPoc.isPending || uploadReceipt.isPending || submitFiling.isPending;

  return (
    <section className="filing-workspace">
      <div className="xocket-card filing-sticky-header">
        <div>
          <span className="xocket-pill xocket-pill-primary">Release 2.7.0</span>
          <h2>Placement Filing Completion</h2>
          <p>Complete filing assignment, document generation, external filing, court receipt, and final submit.</p>
        </div>
        <div className="filing-header-actions">
          <StatusBadge label={page?.filingStatus ?? detail.claimStatus ?? detail.queueStatus ?? 'In Progress'} />
          <Button variant="secondary" onClick={() => filingPage.refetch()} disabled={filingPage.isFetching}>Refresh Filing</Button>
        </div>
      </div>

      {message ? <div className="xocket-alert xocket-alert-success">{message}</div> : null}
      {filingPage.isError ? <div className="xocket-alert xocket-alert-warning">Unable to load filing page details. Assignment and upload actions are still available.</div> : null}

      <div className="filing-progress-card xocket-card">
        <WorkflowStep complete={Boolean(detail.bankruptcyCaseNumber)} label="Legal Review" helper={detail.matchStatus ?? 'Review context'} />
        <WorkflowStep complete={Boolean(detail.filerUserId || filerUserId)} active={!detail.filerUserId} label="Assign Filing" helper={detail.filerUserId ?? filerUserId ?? 'Needs filer'} />
        <WorkflowStep complete={Boolean(page?.pocDocumentId || pocDocumentId)} active={!page?.pocDocumentId} label="Generate POC" helper={page?.pocDocumentId ? `Document #${page.pocDocumentId}` : 'Generate/upload required'} />
        <WorkflowStep complete={Boolean(courtClaimNumber || page?.courtClaimNumber)} label="Submit Filing" helper={page?.courtClaimNumber ?? courtClaimNumber ?? 'External court filing'} />
        <WorkflowStep complete={Boolean(page?.courtReceiptId || courtReceiptId)} active={!page?.courtReceiptId} label="Receipt" helper={page?.courtReceiptId ? `Receipt #${page.courtReceiptId}` : 'Upload receipt'} />
        <WorkflowStep complete={Boolean(page?.filingStatus && /complete|filed/i.test(page.filingStatus))} label="Completed" helper={page?.filingStatus ?? 'Pending'} />
      </div>

      <div className="filing-main-grid">
        <div className="filing-main-column">
          <section className="xocket-card">
            <div className="xocket-card-header">
              <div>
                <h2 className="xocket-card-title">Filing Context</h2>
                <p className="xocket-card-subtitle">Court, case, attorney, assignment, and filing page data.</p>
              </div>
              <Gavel size={18} />
            </div>
            <div className="filing-context-grid">
              <Field label="Court" value={page?.courtName ?? detail.courtName ?? detail.bankruptcyCourt} />
              <Field label="Case Number" value={page?.bankruptcyCaseNumber ?? detail.bankruptcyCaseNumber} />
              <Field label="Attorney" value={detail.attorneyName} />
              <Field label="Filer" value={detail.filerUserId ?? filerUserId} />
              <Field label="Tracking Number" value={page?.trackingNumber} />
              <Field label="Court Claim #" value={page?.courtClaimNumber ?? courtClaimNumber} />
              <Field label="Last Updated" value={formatDate(page?.lastUpdatedUtc)} />
              <Field label="Bar Date" value={formatDate(detail.barDate)} />
            </div>
            <div className="filing-link-row">
              <Button variant="secondary" disabled={!page?.courtWebsiteUrl} onClick={() => page?.courtWebsiteUrl && window.open(page.courtWebsiteUrl, '_blank', 'noopener,noreferrer')}><ExternalLink size={16} /> Open Court</Button>
              <Button variant="secondary" disabled={!page?.ecfFilingUrl} onClick={() => page?.ecfFilingUrl && window.open(page.ecfFilingUrl, '_blank', 'noopener,noreferrer')}><ExternalLink size={16} /> Open ECF</Button>
              <Button variant="secondary" disabled={!page?.courtClaimNumber && !courtClaimNumber} onClick={() => copy(page?.courtClaimNumber ?? courtClaimNumber)}><Copy size={16} /> Copy Claim #</Button>
            </div>
          </section>

          <section className="xocket-card">
            <div className="xocket-card-header">
              <div>
                <h2 className="xocket-card-title">Filing Assignment</h2>
                <p className="xocket-card-subtitle">Maps directly to PUT /api/v1/placement/accounts/{'{placementAccountId}'}/filing-assignment.</p>
              </div>
              <UserCheck size={18} />
            </div>
            <div className="filing-form-grid">
              <label><span>Court Id</span><input value={courtId} onChange={(event) => setCourtId(event.target.value)} placeholder="Optional court id" /></label>
              <label><span>District</span><input value={district} onChange={(event) => setDistrict(event.target.value)} placeholder="District" /></label>
              <label><span>Division</span><input value={division} onChange={(event) => setDivision(event.target.value)} placeholder="Division" /></label>
              <label><span>Attorney Contact Id</span><input value={attorneyContactId} onChange={(event) => setAttorneyContactId(event.target.value)} placeholder="Attorney contact id" /></label>
              <label><span>Signatory User Id</span><input value={signatoryUserId} onChange={(event) => setSignatoryUserId(event.target.value)} placeholder="signatory@xocket.local" /></label>
              <label><span>Filer User Id</span><input value={filerUserId} onChange={(event) => setFilerUserId(event.target.value)} placeholder="filer@xocket.local" /></label>
            </div>
            <div className="filing-actions-row">
              <Button onClick={runAssignment} disabled={busy}>{assignFiling.isPending ? <Loader2 size={16} /> : <BadgeCheck size={16} />} Save Assignment</Button>
            </div>
          </section>

          <section className="xocket-card">
            <div className="xocket-card-header">
              <div>
                <h2 className="xocket-card-title">Document Production</h2>
                <p className="xocket-card-subtitle">Generate POC package documents and upload externally produced files.</p>
              </div>
              <FileArchive size={18} />
            </div>
            <div className="filing-document-grid">
              <div className="filing-document-command">
                <label><span>Template</span><select value={templateType} onChange={(event) => setTemplateType(event.target.value)}>{templateOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label>
                <Button onClick={runGenerate} disabled={busy}>{generateDocument.isPending ? <Loader2 size={16} /> : <FileText size={16} />} Generate</Button>
              </div>
              <FilePicker id="poc-document-upload" label="Upload POC / Exhibit Document" onChange={uploadPocFile} disabled={busy} />
              <div className="filing-document-status">
                <strong>Generated Document Tracking</strong>
                <span>Current filing page document id: {page?.pocDocumentId ?? 'not returned yet'}</span>
                <span>Use document center for preview/download/version history until dedicated document response DTO is exposed.</span>
              </div>
            </div>
          </section>
        </div>

        <aside className="filing-action-panel xocket-card">
          <div className="xocket-card-header">
            <div>
              <h2 className="xocket-card-title">Submit Filing</h2>
              <p className="xocket-card-subtitle">Final validation before completing the court filing workflow.</p>
            </div>
            <Send size={18} />
          </div>

          <div className="filing-validation-list">
            {validation.map((item) => (
              <div className={`filing-validation-item ${item.complete ? 'complete' : 'warning'}`} key={item.key}>
                <span>{item.complete ? <CheckCircle2 size={16} /> : <ClipboardCheck size={16} />}</span>
                <div><strong>{item.label}</strong><small>{item.helper}</small></div>
              </div>
            ))}
          </div>

          <div className="filing-submit-fields">
            <label><span>Court Claim Number</span><input value={courtClaimNumber} onChange={(event) => setCourtClaimNumber(event.target.value)} placeholder="Court claim number" /></label>
            <label><span>POC Document Id</span><input value={pocDocumentId} onChange={(event) => setPocDocumentId(event.target.value)} placeholder="Document id" /></label>
            <label><span>Court Receipt Id</span><input value={courtReceiptId} onChange={(event) => setCourtReceiptId(event.target.value)} placeholder="Receipt document id" /></label>
          </div>

          <FilePicker id="court-receipt-upload" label="Upload Court Receipt" onChange={uploadReceiptFile} disabled={busy} />

          <Button className="filing-submit-button" onClick={runSubmit} disabled={!canSubmit || busy}>
            {submitFiling.isPending ? <Loader2 size={16} /> : <Send size={16} />} Submit Filing
          </Button>

          <div className="filing-api-map">
            <strong>Integrated APIs</strong>
            <span>GET filing-page</span>
            <span>PUT filing-assignment</span>
            <span>POST documents/generate</span>
            <span>POST poc-documents</span>
            <span>POST court-receipts</span>
            <span>POST submit-filing</span>
          </div>
        </aside>
      </div>
    </section>
  );
}
