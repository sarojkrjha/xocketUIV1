import { CheckCircle2, Circle, FileCheck2 } from 'lucide-react';

import type { ClaimDetail } from '../types/claims';

const workflowSteps = [
  'Draft',
  'Generate Documents',
  'Attorney Assignment',
  'Ready to File',
  'Filed',
  'Receipt Processing',
  'Payments',
  'Closed'
];

function inferCurrentStep(status?: string | null) {
  const value = (status ?? '').toLowerCase();
  if (value.includes('closed')) return 7;
  if (value.includes('paid')) return 6;
  if (value.includes('receipt')) return 5;
  if (value.includes('filed')) return 4;
  if (value.includes('ready')) return 3;
  if (value.includes('attorney')) return 2;
  if (value.includes('document')) return 1;
  return 0;
}

export function ClaimWorkflowPanel({ claim }: { claim: ClaimDetail }) {
  const currentStep = inferCurrentStep(claim.status);

  return (
    <section className="xocket-card claim-workflow-card">
      <div className="xocket-card-header">
        <div>
          <h2 className="xocket-card-title">Claim Workflow</h2>
          <p className="xocket-card-subtitle">Operational lifecycle from claim draft through payment and closure.</p>
        </div>
        <span className="xocket-pill xocket-pill-primary">{claim.status ?? 'Draft'}</span>
      </div>
      <div className="claim-workflow-steps">
        {workflowSteps.map((step, index) => {
          const complete = index < currentStep;
          const active = index === currentStep;
          return (
            <div className={`claim-workflow-step ${complete ? 'complete' : ''} ${active ? 'active' : ''}`} key={step}>
              <div className="claim-workflow-marker">
                {complete ? <CheckCircle2 size={18} /> : active ? <FileCheck2 size={18} /> : <Circle size={18} />}
              </div>
              <div>
                <strong>{step}</strong>
                <span>{active ? 'Current stage' : complete ? 'Completed' : 'Pending'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
