import { useState } from 'react';
import { BellPlus, ContactRound, DatabaseZap, Landmark, Pencil, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/shared/components/Button';
import type { AccountDetail } from '../types/account';
import { useAccountMaintenance } from '../hooks/useAccountMaintenance';

function toNumberOrUndefined(value: string) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toNumberOrNull(value: string) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

type PanelProps = { account: AccountDetail };

export function AccountMaintenancePanel({ account }: PanelProps) {
  const maintenance = useAccountMaintenance(account.id);
  const [accountForm, setAccountForm] = useState({
    accountNumber: account.primaryAccountNumber ?? account.accountNumber ?? '',
    clientId: String(account.clientId ?? ''),
    portfolioId: String(account.portfolioId ?? ''),
    currentBalance: String(account.currentBalance ?? ''),
    placementDate: account.placementDate?.slice(0, 10) ?? '',
    status: String(account.status ?? 1),
    isActive: String(account.isActive ?? true)
  });
  const [contactForm, setContactForm] = useState({ contactId: '', relationshipType: '1', isPrimary: 'false' });
  const [bankruptcyForm, setBankruptcyForm] = useState({
    activeBankruptcyCaseId: String(account.activeBankruptcyCaseId ?? account.bankruptcyCaseId ?? ''),
    bankruptcyCaseNumber: account.bankruptcyCaseNumber ?? '',
    bankruptcyStatus: String(account.bankruptcyStatus ?? ''),
    filingDate: account.filingDate?.slice(0, 10) ?? '',
    courtId: String(account.courtId ?? ''),
    courtName: account.courtName ?? ''
  });
  const [timelineForm, setTimelineForm] = useState({ eventType: 'AccountNote', title: '', description: '', createdByUserId: 'system' });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: '2', dueUtc: '', assignedToUserId: '' });
  const [message, setMessage] = useState<string | null>(null);

  async function run(operation: () => Promise<unknown>, success: string) {
    setMessage(null);
    try {
      await operation();
      setMessage(success);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Operation failed.');
    }
  }

  async function saveAccount() {
    await run(() => maintenance.updateAccount.mutateAsync({
      accountId: account.id,
      clientId: Number(accountForm.clientId || account.clientId || 0),
      portfolioId: Number(accountForm.portfolioId || account.portfolioId || 0),
      primaryAccountNumber: accountForm.accountNumber,
      currentBalance: toNumberOrNull(accountForm.currentBalance),
      placementDate: accountForm.placementDate || null,
      status: Number(accountForm.status || 1),
      isActive: accountForm.isActive === 'true'
    }), 'Account saved successfully.');
  }

  async function assignContact() {
    const contactId = toNumberOrUndefined(contactForm.contactId);
    if (!contactId) {
      setMessage('Enter a valid contact id before assigning.');
      return;
    }

    await run(() => maintenance.assignContact.mutateAsync({
      accountId: account.id,
      contactId,
      relationshipType: Number(contactForm.relationshipType || 1),
      isPrimary: contactForm.isPrimary === 'true',
      isActive: true
    }), 'Contact assigned to account.');
    setContactForm((current) => ({ ...current, contactId: '' }));
  }

  async function removeContact(contactId?: number | null) {
    if (!contactId) return;
    await run(() => maintenance.removeContact.mutateAsync(contactId), 'Contact removed from account.');
  }

  async function saveBankruptcy() {
    await run(() => maintenance.updateBankruptcy.mutateAsync({
      accountId: account.id,
      activeBankruptcyCaseId: toNumberOrNull(bankruptcyForm.activeBankruptcyCaseId),
      bankruptcyCaseNumber: bankruptcyForm.bankruptcyCaseNumber || null,
      bankruptcyStatus: toNumberOrNull(bankruptcyForm.bankruptcyStatus),
      filingDate: bankruptcyForm.filingDate || null,
      courtId: toNumberOrNull(bankruptcyForm.courtId),
      courtName: bankruptcyForm.courtName || null
    }), 'Bankruptcy metadata saved.');
  }

  async function addTimeline() {
    if (!timelineForm.title.trim()) {
      setMessage('Timeline title is required.');
      return;
    }
    await run(() => maintenance.createTimelineEvent.mutateAsync({
      eventType: timelineForm.eventType,
      title: timelineForm.title,
      description: timelineForm.description,
      createdByUserId: timelineForm.createdByUserId,
      eventUtc: new Date().toISOString(),
      referenceType: 'Account',
      referenceId: account.id
    }), 'Timeline event created.');
    setTimelineForm((current) => ({ ...current, title: '', description: '' }));
  }

  async function addTask() {
    if (!taskForm.title.trim()) {
      setMessage('Task title is required.');
      return;
    }
    await run(() => maintenance.createTask.mutateAsync({
      title: taskForm.title,
      description: taskForm.description,
      priority: Number(taskForm.priority || 2),
      dueUtc: taskForm.dueUtc ? new Date(taskForm.dueUtc).toISOString() : null,
      assignedToUserId: taskForm.assignedToUserId || null,
      createdByUserId: 'system',
      referenceType: 'Account',
      referenceId: account.id
    }), 'Task created.');
    setTaskForm((current) => ({ ...current, title: '', description: '', dueUtc: '' }));
  }

  async function rebuildIndex() {
    await run(() => maintenance.rebuildIndex.mutateAsync({ accountId: account.id, rebuildAll: false }), 'Account search index rebuild requested.');
  }

  return (
    <section className="account-related-panel account-maintenance-panel">
      <div className="account-related-header">
        <div>
          <span className="enterprise-eyebrow">Release 3.2.0</span>
          <h3>Account Workflow Actions</h3>
          <p>Maintenance operations wired to account, contact assignment, bankruptcy, timeline, task, and search-index APIs.</p>
        </div>
        <div className="account-related-actions">
          <span className="xocket-pill">Accounts · Tasks · Timeline</span>
          <Button variant="secondary" disabled={maintenance.rebuildIndex.isPending} onClick={rebuildIndex}><DatabaseZap size={16} /> Rebuild Index</Button>
        </div>
      </div>

      {message && <div className="xocket-alert xocket-alert-info">{message}</div>}

      <div className="account-overview-grid">
        <div className="account-info-panel">
          <div className="account-info-panel-header"><div><span className="enterprise-eyebrow">Account</span><h3>Edit Account</h3></div><Pencil size={18} /></div>
          <div className="account-search-form account-advanced-grid compact">
            <label className="evictsure-form-group"><span className="evictsure-form-label">Account #</span><input className="evictsure-form-input" value={accountForm.accountNumber} onChange={(event) => setAccountForm((current) => ({ ...current, accountNumber: event.target.value }))} /></label>
            <label className="evictsure-form-group"><span className="evictsure-form-label">Client ID</span><input className="evictsure-form-input" value={accountForm.clientId} onChange={(event) => setAccountForm((current) => ({ ...current, clientId: event.target.value }))} /></label>
            <label className="evictsure-form-group"><span className="evictsure-form-label">Portfolio ID</span><input className="evictsure-form-input" value={accountForm.portfolioId} onChange={(event) => setAccountForm((current) => ({ ...current, portfolioId: event.target.value }))} /></label>
            <label className="evictsure-form-group"><span className="evictsure-form-label">Balance</span><input className="evictsure-form-input" value={accountForm.currentBalance} onChange={(event) => setAccountForm((current) => ({ ...current, currentBalance: event.target.value }))} /></label>
            <label className="evictsure-form-group"><span className="evictsure-form-label">Placement Date</span><input type="date" className="evictsure-form-input" value={accountForm.placementDate} onChange={(event) => setAccountForm((current) => ({ ...current, placementDate: event.target.value }))} /></label>
            <label className="evictsure-form-group"><span className="evictsure-form-label">Status</span><input className="evictsure-form-input" value={accountForm.status} onChange={(event) => setAccountForm((current) => ({ ...current, status: event.target.value }))} /></label>
            <label className="evictsure-form-group"><span className="evictsure-form-label">Active</span><select className="evictsure-form-input" value={accountForm.isActive} onChange={(event) => setAccountForm((current) => ({ ...current, isActive: event.target.value }))}><option value="true">Active</option><option value="false">Inactive</option></select></label>
          </div>
          <Button disabled={maintenance.updateAccount.isPending} onClick={saveAccount}>Save Account</Button>
        </div>

        <div className="account-info-panel">
          <div className="account-info-panel-header"><div><span className="enterprise-eyebrow">Contacts</span><h3>Assign / Remove</h3></div><ContactRound size={18} /></div>
          <div className="account-search-form account-advanced-grid compact">
            <label className="evictsure-form-group"><span className="evictsure-form-label">Contact ID</span><input className="evictsure-form-input" value={contactForm.contactId} onChange={(event) => setContactForm((current) => ({ ...current, contactId: event.target.value }))} /></label>
            <label className="evictsure-form-group"><span className="evictsure-form-label">Relationship</span><input className="evictsure-form-input" value={contactForm.relationshipType} onChange={(event) => setContactForm((current) => ({ ...current, relationshipType: event.target.value }))} /></label>
            <label className="evictsure-form-group"><span className="evictsure-form-label">Primary</span><select className="evictsure-form-input" value={contactForm.isPrimary} onChange={(event) => setContactForm((current) => ({ ...current, isPrimary: event.target.value }))}><option value="false">No</option><option value="true">Yes</option></select></label>
          </div>
          <Button disabled={maintenance.assignContact.isPending} onClick={assignContact}><Plus size={16} /> Assign Contact</Button>
          <div className="account-contact-list compact-list">
            {(account.contacts ?? []).map((contact) => (
              <div className="account-contact-card enhanced" key={contact.contactId ?? contact.id}>
                <div className="account-contact-main"><strong>{contact.contactName ?? contact.fullName ?? `Contact ${contact.contactId ?? contact.id}`}</strong><span>ID {contact.contactId ?? contact.id}</span></div>
                <Button variant="secondary" disabled={maintenance.removeContact.isPending} onClick={() => removeContact(contact.contactId ?? contact.id)}><Trash2 size={14} /> Remove</Button>
              </div>
            ))}
          </div>
        </div>

        <div className="account-info-panel">
          <div className="account-info-panel-header"><div><span className="enterprise-eyebrow">Bankruptcy</span><h3>Active Case</h3></div><Landmark size={18} /></div>
          <div className="account-search-form account-advanced-grid compact">
            <label className="evictsure-form-group"><span className="evictsure-form-label">Case ID</span><input className="evictsure-form-input" value={bankruptcyForm.activeBankruptcyCaseId} onChange={(event) => setBankruptcyForm((current) => ({ ...current, activeBankruptcyCaseId: event.target.value }))} /></label>
            <label className="evictsure-form-group"><span className="evictsure-form-label">Case #</span><input className="evictsure-form-input" value={bankruptcyForm.bankruptcyCaseNumber} onChange={(event) => setBankruptcyForm((current) => ({ ...current, bankruptcyCaseNumber: event.target.value }))} /></label>
            <label className="evictsure-form-group"><span className="evictsure-form-label">Status</span><input className="evictsure-form-input" value={bankruptcyForm.bankruptcyStatus} onChange={(event) => setBankruptcyForm((current) => ({ ...current, bankruptcyStatus: event.target.value }))} /></label>
            <label className="evictsure-form-group"><span className="evictsure-form-label">Filing Date</span><input type="date" className="evictsure-form-input" value={bankruptcyForm.filingDate} onChange={(event) => setBankruptcyForm((current) => ({ ...current, filingDate: event.target.value }))} /></label>
            <label className="evictsure-form-group"><span className="evictsure-form-label">Court ID</span><input className="evictsure-form-input" value={bankruptcyForm.courtId} onChange={(event) => setBankruptcyForm((current) => ({ ...current, courtId: event.target.value }))} /></label>
            <label className="evictsure-form-group"><span className="evictsure-form-label">Court Name</span><input className="evictsure-form-input" value={bankruptcyForm.courtName} onChange={(event) => setBankruptcyForm((current) => ({ ...current, courtName: event.target.value }))} /></label>
          </div>
          <Button disabled={maintenance.updateBankruptcy.isPending} onClick={saveBankruptcy}>Save Bankruptcy</Button>
        </div>

        <div className="account-info-panel">
          <div className="account-info-panel-header"><div><span className="enterprise-eyebrow">Work</span><h3>Timeline & Task</h3></div><BellPlus size={18} /></div>
          <div className="account-search-form account-advanced-grid compact">
            <label className="evictsure-form-group"><span className="evictsure-form-label">Event Type</span><input className="evictsure-form-input" value={timelineForm.eventType} onChange={(event) => setTimelineForm((current) => ({ ...current, eventType: event.target.value }))} /></label>
            <label className="evictsure-form-group"><span className="evictsure-form-label">Timeline Title</span><input className="evictsure-form-input" value={timelineForm.title} onChange={(event) => setTimelineForm((current) => ({ ...current, title: event.target.value }))} /></label>
            <label className="evictsure-form-group full"><span className="evictsure-form-label">Description</span><textarea className="evictsure-form-input" value={timelineForm.description} onChange={(event) => setTimelineForm((current) => ({ ...current, description: event.target.value }))} /></label>
          </div>
          <Button variant="secondary" disabled={maintenance.createTimelineEvent.isPending} onClick={addTimeline}>Add Timeline</Button>
          <div className="account-search-form account-advanced-grid compact">
            <label className="evictsure-form-group"><span className="evictsure-form-label">Task Title</span><input className="evictsure-form-input" value={taskForm.title} onChange={(event) => setTaskForm((current) => ({ ...current, title: event.target.value }))} /></label>
            <label className="evictsure-form-group"><span className="evictsure-form-label">Priority</span><select className="evictsure-form-input" value={taskForm.priority} onChange={(event) => setTaskForm((current) => ({ ...current, priority: event.target.value }))}><option value="1">Low</option><option value="2">Normal</option><option value="3">High</option></select></label>
            <label className="evictsure-form-group"><span className="evictsure-form-label">Due</span><input type="datetime-local" className="evictsure-form-input" value={taskForm.dueUtc} onChange={(event) => setTaskForm((current) => ({ ...current, dueUtc: event.target.value }))} /></label>
            <label className="evictsure-form-group"><span className="evictsure-form-label">Assigned To</span><input className="evictsure-form-input" value={taskForm.assignedToUserId} onChange={(event) => setTaskForm((current) => ({ ...current, assignedToUserId: event.target.value }))} /></label>
            <label className="evictsure-form-group full"><span className="evictsure-form-label">Task Description</span><textarea className="evictsure-form-input" value={taskForm.description} onChange={(event) => setTaskForm((current) => ({ ...current, description: event.target.value }))} /></label>
          </div>
          <Button disabled={maintenance.createTask.isPending} onClick={addTask}><Plus size={16} /> Create Task</Button>
        </div>
      </div>
    </section>
  );
}
