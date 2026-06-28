import { useState } from 'react';
import { AtSign, Fingerprint, MapPin, Phone, Save, UserRound } from 'lucide-react';

import { Button } from '@/shared/components/Button';
import type { ContactRow } from '../types/contact';
import { useContactMaintenance } from '../hooks/useContactMaintenance';

function numberOrNull(value: string) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

type Props = { contact: ContactRow };

export function ContactMaintenancePanel({ contact }: Props) {
  const maintenance = useContactMaintenance(contact.id);
  const [message, setMessage] = useState<string | null>(null);
  const [identity, setIdentity] = useState({ contactType: String(contact.contactType ?? 1), fullName: contact.fullName ?? '', companyName: contact.companyName ?? '', isActive: String(contact.isActive ?? true) });
  const [address, setAddress] = useState({ address1: contact.address1 ?? '', city: contact.city ?? '', stateCode: contact.stateCode ?? '', postalCode: contact.postalCode ?? '' });
  const [phone, setPhone] = useState(contact.phone ?? '');
  const [email, setEmail] = useState(contact.email ?? '');
  const [last4, setLast4] = useState(contact.last4 ?? '');

  async function run(operation: () => Promise<unknown>, success: string) {
    setMessage(null);
    try {
      await operation();
      setMessage(success);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Operation failed.');
    }
  }

  return (
    <section className="account-info-panel contact-maintenance-panel">
      <div className="account-info-panel-header">
        <div>
          <span className="enterprise-eyebrow">Release 3.2.0</span>
          <h3>Contact Maintenance</h3>
          <p>Update identity, address, phone, email, and identifiers using dedicated contact APIs.</p>
        </div>
      </div>
      {message && <div className="xocket-alert xocket-alert-info">{message}</div>}
      <div className="account-overview-grid">
        <div className="account-info-panel">
          <div className="account-info-panel-header"><div><span className="enterprise-eyebrow">Identity</span><h3>Contact Profile</h3></div><UserRound size={18} /></div>
          <div className="account-search-form account-advanced-grid compact">
            <label className="evictsure-form-group"><span className="evictsure-form-label">Contact Type</span><input className="evictsure-form-input" value={identity.contactType} onChange={(event) => setIdentity((current) => ({ ...current, contactType: event.target.value }))} /></label>
            <label className="evictsure-form-group"><span className="evictsure-form-label">Full Name</span><input className="evictsure-form-input" value={identity.fullName} onChange={(event) => setIdentity((current) => ({ ...current, fullName: event.target.value }))} /></label>
            <label className="evictsure-form-group"><span className="evictsure-form-label">Company</span><input className="evictsure-form-input" value={identity.companyName} onChange={(event) => setIdentity((current) => ({ ...current, companyName: event.target.value }))} /></label>
            <label className="evictsure-form-group"><span className="evictsure-form-label">Active</span><select className="evictsure-form-input" value={identity.isActive} onChange={(event) => setIdentity((current) => ({ ...current, isActive: event.target.value }))}><option value="true">Active</option><option value="false">Inactive</option></select></label>
          </div>
          <Button disabled={maintenance.updateContact.isPending} onClick={() => run(() => maintenance.updateContact.mutateAsync({ contactId: contact.id, contactType: Number(identity.contactType || 1), fullName: identity.fullName, companyName: identity.companyName, isActive: identity.isActive === 'true' }), 'Contact profile saved.')}><Save size={16} /> Save Contact</Button>
        </div>

        <div className="account-info-panel">
          <div className="account-info-panel-header"><div><span className="enterprise-eyebrow">Address</span><h3>Primary Address</h3></div><MapPin size={18} /></div>
          <div className="account-search-form account-advanced-grid compact">
            <label className="evictsure-form-group"><span className="evictsure-form-label">Address 1</span><input className="evictsure-form-input" value={address.address1} onChange={(event) => setAddress((current) => ({ ...current, address1: event.target.value }))} /></label>
            <label className="evictsure-form-group"><span className="evictsure-form-label">City</span><input className="evictsure-form-input" value={address.city} onChange={(event) => setAddress((current) => ({ ...current, city: event.target.value }))} /></label>
            <label className="evictsure-form-group"><span className="evictsure-form-label">State</span><input className="evictsure-form-input" value={address.stateCode} onChange={(event) => setAddress((current) => ({ ...current, stateCode: event.target.value.toUpperCase() }))} /></label>
            <label className="evictsure-form-group"><span className="evictsure-form-label">Postal Code</span><input className="evictsure-form-input" value={address.postalCode} onChange={(event) => setAddress((current) => ({ ...current, postalCode: event.target.value }))} /></label>
          </div>
          <Button disabled={maintenance.upsertAddress.isPending} onClick={() => run(() => maintenance.upsertAddress.mutateAsync({ contactId: contact.id, addressId: numberOrNull(String((contact.raw?.addressId as string | number | undefined) ?? '')), addressType: 1, ...address, isPrimary: true, isActive: true }), 'Contact address saved.')}>Save Address</Button>
        </div>

        <div className="account-info-panel">
          <div className="account-info-panel-header"><div><span className="enterprise-eyebrow">Communication</span><h3>Phone & Email</h3></div><Phone size={18} /></div>
          <label className="evictsure-form-group"><span className="evictsure-form-label">Phone</span><input className="evictsure-form-input" value={phone} onChange={(event) => setPhone(event.target.value)} /></label>
          <Button variant="secondary" disabled={maintenance.upsertPhone.isPending} onClick={() => run(() => maintenance.upsertPhone.mutateAsync({ contactId: contact.id, phoneId: numberOrNull(String((contact.raw?.phoneId as string | number | undefined) ?? '')), phoneType: 1, phoneNumber: phone, isPrimary: true, isActive: true }), 'Contact phone saved.')}><Phone size={16} /> Save Phone</Button>
          <label className="evictsure-form-group"><span className="evictsure-form-label">Email</span><input className="evictsure-form-input" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <Button disabled={maintenance.upsertEmail.isPending} onClick={() => run(() => maintenance.upsertEmail.mutateAsync({ contactId: contact.id, emailId: numberOrNull(String((contact.raw?.emailId as string | number | undefined) ?? '')), emailType: 1, email, isPrimary: true, isActive: true }), 'Contact email saved.')}><AtSign size={16} /> Save Email</Button>
        </div>

        <div className="account-info-panel">
          <div className="account-info-panel-header"><div><span className="enterprise-eyebrow">Identifier</span><h3>SSN / Last 4</h3></div><Fingerprint size={18} /></div>
          <label className="evictsure-form-group"><span className="evictsure-form-label">Last 4</span><input className="evictsure-form-input" maxLength={4} value={last4} onChange={(event) => setLast4(event.target.value)} /></label>
          <Button disabled={maintenance.upsertIdentifier.isPending} onClick={() => run(() => maintenance.upsertIdentifier.mutateAsync({ contactId: contact.id, identifierId: numberOrNull(String((contact.raw?.identifierId as string | number | undefined) ?? '')), identifierType: 1, identifierValue: last4, last4, sourceSystem: 'Xocket.UI', isActive: true }), 'Contact identifier saved.')}><Fingerprint size={16} /> Save Identifier</Button>
        </div>
      </div>
    </section>
  );
}
