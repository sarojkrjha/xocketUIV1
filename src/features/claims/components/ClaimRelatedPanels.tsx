import { CalendarClock, FileStack, ListChecks, ReceiptText } from 'lucide-react';

import { StatusBadge } from '@/shared/components/StatusBadge';
import type { ClaimDetail } from '../types/claims';

function formatCurrency(value?: number | null) {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value);
}

function formatDate(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(date);
}

export function ClaimDocumentsPanel({ claim }: { claim: ClaimDetail }) {
  const documents = claim.documents ?? [];
  return (
    <section className="xocket-card">
      <div className="xocket-card-header">
        <div>
          <h2 className="xocket-card-title"><FileStack size={18} /> Documents</h2>
          <p className="xocket-card-subtitle">Generated packages, uploaded receipts, and document versions.</p>
        </div>
        <span className="xocket-pill">{documents.length} documents</span>
      </div>
      <div className="xocket-card-body">
        {documents.length === 0 ? (
          <div className="claim-empty-business">No documents were returned for this claim. Generate a filing package or upload supporting documentation.</div>
        ) : (
          <div className="claim-list-stack">
            {documents.map((document) => (
              <div className="claim-list-item" key={document.id}>
                <div>
                  <strong>{document.name ?? `Document #${document.id}`}</strong>
                  <span>{document.documentType ?? 'Document'} · Version {document.version ?? '-'}</span>
                </div>
                <StatusBadge label={document.status ?? 'Available'} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function ClaimPaymentsPanel({ claim }: { claim: ClaimDetail }) {
  const payments = claim.payments ?? [];
  return (
    <section className="xocket-card">
      <div className="xocket-card-header">
        <div>
          <h2 className="xocket-card-title"><ReceiptText size={18} /> Payments</h2>
          <p className="xocket-card-subtitle">Payment activity, references, and remaining balance.</p>
        </div>
        <span className="xocket-pill">Paid {formatCurrency(claim.paidAmount)}</span>
      </div>
      <div className="xocket-card-body">
        {payments.length === 0 ? (
          <div className="claim-empty-business">No payments were returned for this claim.</div>
        ) : (
          <div className="claim-list-stack">
            {payments.map((payment) => (
              <div className="claim-list-item" key={payment.id}>
                <div>
                  <strong>{formatCurrency(payment.amount)}</strong>
                  <span>{formatDate(payment.paymentDate)} · {payment.referenceNumber ?? 'No reference'}</span>
                </div>
                <StatusBadge label={payment.status ?? payment.sourceSystem ?? 'Payment'} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function ClaimTimelinePanel({ claim }: { claim: ClaimDetail }) {
  const events = claim.workflowEvents ?? [];
  return (
    <section className="xocket-card">
      <div className="xocket-card-header">
        <div>
          <h2 className="xocket-card-title"><CalendarClock size={18} /> Timeline</h2>
          <p className="xocket-card-subtitle">Chronological claim events, workflow changes, and operational history.</p>
        </div>
        <span className="xocket-pill">{events.length} events</span>
      </div>
      <div className="xocket-card-body">
        {events.length === 0 ? (
          <div className="claim-empty-business">No timeline events were returned for this claim.</div>
        ) : (
          <div className="enterprise-timeline">
            {events.map((event) => (
              <div className="enterprise-timeline-item" key={event.id}>
                <div className="enterprise-timeline-dot" />
                <div>
                  <strong>{event.title}</strong>
                  <span>{formatDate(event.eventUtc)} · {event.description ?? 'No description supplied.'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function ClaimTasksPanel() {
  return (
    <section className="xocket-card">
      <div className="xocket-card-header">
        <div>
          <h2 className="xocket-card-title"><ListChecks size={18} /> Tasks</h2>
          <p className="xocket-card-subtitle">Task integration foundation for claim follow-up and supervisor review.</p>
        </div>
      </div>
      <div className="xocket-card-body">
        <div className="claim-empty-business">Task integration is prepared for Release 2.0.8 shared workspace hardening.</div>
      </div>
    </section>
  );
}
