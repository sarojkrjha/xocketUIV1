import { useMemo, useState } from 'react';
import type { ColDef } from 'ag-grid-community';
import { BadgeCheck, Eye, Flag, Loader2, RefreshCcw, SearchCheck, Sparkles } from 'lucide-react';

import { EnterpriseGrid } from '@/shared/components/grid/EnterpriseGrid';
import { Button } from '@/shared/components/Button';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { useAuthStore } from '@/features/auth/store/authStore';
import type { PlacementAccountDetail, PlacementBankruptcyMatch } from '../types/placement';
import { useAddPlacementFlag, useRunPlacementMatching, useSelectPlacementMatch } from '../hooks/usePlacementMatching';
import { EvidenceBadge, MatchScoreIndicator } from './MatchScoreIndicator';
import { MatchDecisionPanel } from './MatchDecisionPanel';
import { MatchCandidateDrawer } from './MatchCandidateDrawer';

export function MatchReviewWorkspace({ detail, onRefresh }: { detail: PlacementAccountDetail; onRefresh: () => void }) {
  const user = useAuthStore((state) => state.user);
  const operator = user?.email ?? user?.name ?? 'operator@xocket.local';
  const placementAccountId = detail.placementAccountId ?? detail.id;
  const runMatching = useRunPlacementMatching(placementAccountId);
  const selectMatch = useSelectPlacementMatch(placementAccountId);
  const addFlag = useAddPlacementFlag(placementAccountId);
  const [generatedMatches, setGeneratedMatches] = useState<PlacementBankruptcyMatch[] | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<PlacementBankruptcyMatch | null>((detail.matches ?? [])[0] ?? null);
  const [drawerCandidate, setDrawerCandidate] = useState<PlacementBankruptcyMatch | null>(null);
  const [flagCode, setFlagCode] = useState('MANUAL_REVIEW');
  const [notes, setNotes] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const candidates = generatedMatches ?? detail.matches ?? [];

  const columns = useMemo<ColDef<PlacementBankruptcyMatch>[]>(() => [
    {
      headerName: 'Score',
      field: 'score',
      pinned: 'left',
      minWidth: 170,
      cellRenderer: ({ data }: { data?: PlacementBankruptcyMatch }) => <MatchScoreIndicator score={data?.score} compact />
    },
    {
      headerName: 'Candidate',
      field: 'debtorName',
      minWidth: 260,
      cellRenderer: ({ data }: { data?: PlacementBankruptcyMatch }) => (
        <div className="grid-primary-cell">
          <strong>{data?.debtorName ?? 'Debtor unavailable'}</strong>
          <span>{data?.caseNumber ?? `Case #${data?.bankruptcyCaseId ?? '-'}`} · {data?.chapter ?? 'Chapter unknown'}</span>
        </div>
      )
    },
    {
      headerName: 'Identity',
      minWidth: 220,
      cellRenderer: ({ data }: { data?: PlacementBankruptcyMatch }) => (
        <div className="grid-primary-cell">
          <strong>{data?.debtorLast4 ? `XXX-XX-${data.debtorLast4}` : 'SSN unavailable'}</strong>
          <span>{data?.phone ?? data?.email ?? 'No communication evidence'}</span>
        </div>
      )
    },
    {
      headerName: 'Location',
      field: 'address',
      minWidth: 260,
      valueFormatter: ({ value }) => value || '-'
    },
    {
      headerName: 'Court Context',
      minWidth: 260,
      cellRenderer: ({ data }: { data?: PlacementBankruptcyMatch }) => (
        <div className="grid-primary-cell">
          <strong>{data?.courtName ?? 'Court unavailable'}</strong>
          <span>{data?.attorneyName ?? data?.trusteeName ?? 'Attorney / trustee unavailable'}</span>
        </div>
      )
    },
    {
      headerName: 'Evidence',
      minWidth: 360,
      cellRenderer: ({ data }: { data?: PlacementBankruptcyMatch }) => (
        <div className="match-grid-evidence">
          {(data?.evidence ?? []).slice(0, 4).map((evidence) => <EvidenceBadge key={evidence.key} evidence={evidence} />)}
        </div>
      )
    },
    {
      headerName: 'Decision',
      field: 'decision',
      minWidth: 140,
      cellRenderer: ({ value }: { value?: string | null }) => <StatusBadge label={value ?? 'Candidate'} />
    },
    {
      headerName: 'View',
      minWidth: 120,
      pinned: 'right',
      sortable: false,
      filter: false,
      cellRenderer: ({ data }: { data?: PlacementBankruptcyMatch }) => (
        <button className="xeds-row-action" type="button" onClick={() => data && setDrawerCandidate(data)}><Eye size={14} /> View</button>
      )
    }
  ], []);

  const handleRunMatching = async () => {
    setSuccessMessage(null);
    const matches = await runMatching.mutateAsync(operator);
    setGeneratedMatches(matches);
    setSelectedMatch(matches[0] ?? null);
    setDrawerCandidate(matches[0] ?? null);
    setSuccessMessage(`${matches.length} candidate(s) returned from the matching engine.`);
  };

  const handleAccept = async () => {
    if (!selectedMatch) return;
    const matchId = selectedMatch.placementBankruptcyMatchId ?? selectedMatch.id;
    await selectMatch.mutateAsync({ placementAccountId, placementBankruptcyMatchId: matchId, selectedBy: operator });
    setSuccessMessage(`Accepted match ${selectedMatch.caseNumber ?? matchId}.`);
    onRefresh();
  };


  const handleRejectCandidate = async () => {
    await addFlag.mutateAsync({
      placementAccountId,
      flagCode: 'MATCH_REJECTED',
      flagDescription: notes || `Candidate rejected or disputed from Match Review Workspace: ${selectedMatch?.caseNumber ?? selectedMatch?.bankruptcyCaseId ?? 'candidate unavailable'}.`,
      createdBy: operator
    });
    setNotes('');
    setSuccessMessage('Candidate rejection recorded as a review flag. No dedicated reject-match endpoint exists in the current Swagger.');
    onRefresh();
  };

  const handleAddFlag = async () => {
    await addFlag.mutateAsync({
      placementAccountId,
      flagCode,
      flagDescription: notes || `Manual review requested from Match Review Workspace for ${selectedMatch?.caseNumber ?? 'candidate'}.`,
      createdBy: operator
    });
    setNotes('');
    setSuccessMessage('Review flag added.');
    onRefresh();
  };

  return (
    <div className="match-workspace">
      <section className="xocket-card match-command-card">
        <div className="xocket-card-header">
          <div>
            <h2 className="xocket-card-title">Enterprise Match Review</h2>
            <p className="xocket-card-subtitle">Run matching, compare bankruptcy candidates side-by-side, and select the correct case.</p>
          </div>
          <div className="match-command-actions">
            <Button variant="secondary" onClick={onRefresh}><RefreshCcw size={16} /> Refresh</Button>
            <Button onClick={handleRunMatching} disabled={runMatching.isPending}>
              {runMatching.isPending ? <Loader2 size={16} className="spin" /> : <SearchCheck size={16} />}
              Run Matching
            </Button>
          </div>
        </div>
        <div className="match-context-strip">
          <div><span>Account</span><strong>{detail.accountNumber ?? '-'}</strong></div>
          <div><span>Debtor</span><strong>{detail.debtorName ?? detail.contactName ?? '-'}</strong></div>
          <div><span>Last 4</span><strong>{detail.last4Ssn ? `XXX-XX-${detail.last4Ssn}` : '-'}</strong></div>
          <div><span>Current Match</span><strong>{detail.matchStatus ?? 'Unknown'}</strong></div>
        </div>
      </section>

      <section className="match-intelligence-strip">
        <div className="match-intelligence-card">
          <Sparkles size={18} />
          <div>
            <span>Decision Confidence</span>
            <strong>{selectedMatch ? `${selectedMatch.score ?? 0}% · ${(selectedMatch.score ?? 0) >= 90 ? 'High' : (selectedMatch.score ?? 0) >= 75 ? 'Medium' : 'Manual Review'}` : 'No candidate selected'}</strong>
          </div>
        </div>
        <div className="match-intelligence-card">
          <span>Selected Candidate</span>
          <strong>{selectedMatch?.caseNumber ?? selectedMatch?.debtorName ?? 'Select a row to review'}</strong>
        </div>
        <div className="match-intelligence-card">
          <span>Review Rule</span>
          <strong>Accept only after evidence confirms identity and case context.</strong>
        </div>
      </section>

      {successMessage ? <div className="xocket-alert xocket-alert-success"><BadgeCheck size={16} /> {successMessage}</div> : null}
      {runMatching.isError ? <div className="xocket-alert xocket-alert-danger">{(runMatching.error as Error).message}</div> : null}
      {selectMatch.isError ? <div className="xocket-alert xocket-alert-danger">{(selectMatch.error as Error).message}</div> : null}
      {addFlag.isError ? <div className="xocket-alert xocket-alert-danger">{(addFlag.error as Error).message}</div> : null}

      <div className="match-workspace-grid">
        <section className="xocket-card match-grid-card">
          <div className="xocket-card-header">
            <div>
              <h2 className="xocket-card-title">Candidate Comparison Grid</h2>
              <p className="xocket-card-subtitle">Evidence-first comparison. Click a row for details; accept only after reviewing confidence and conflicts.</p>
            </div>
            <span className="xocket-pill">{candidates.length} candidates</span>
          </div>
          <div className="xocket-card-body">
            <EnterpriseGrid<PlacementBankruptcyMatch>
              rows={candidates}
              columns={columns}
              height={520}
              isLoading={runMatching.isPending}
              emptyMessage="No candidates are available. Run matching or confirm that candidates exist for this placement account."
              onRowDoubleClicked={(row) => setDrawerCandidate(row)}
              onSelectionChanged={(rows) => setSelectedMatch(rows[0] ?? null)}
            />
          </div>
        </section>

        <MatchDecisionPanel
          selectedMatch={selectedMatch}
          isSelecting={selectMatch.isPending}
          isAddingFlag={addFlag.isPending}
          flagCode={flagCode}
          notes={notes}
          onFlagCodeChange={setFlagCode}
          onNotesChange={setNotes}
          onAccept={handleAccept}
          onRejectCandidate={handleRejectCandidate}
          onAddFlag={handleAddFlag}
        />
      </div>

      <section className="xocket-card match-guidance-card">
        <div className="xocket-card-header">
          <div>
            <h2 className="xocket-card-title">Review Guidance</h2>
            <p className="xocket-card-subtitle">Designed to support a decision, not simply display records.</p>
          </div>
          <Flag size={18} />
        </div>
        <div className="match-guidance-grid">
          <div><strong>High Confidence</strong><span>SSN or strong identity evidence plus no major conflicts.</span></div>
          <div><strong>Medium Confidence</strong><span>Candidate may be correct, but reviewer should confirm address, court, or debtor context.</span></div>
          <div><strong>Low Confidence</strong><span>Route for manual review or add a flag before downstream POC work.</span></div>
        </div>
      </section>

      <MatchCandidateDrawer candidate={drawerCandidate} onClose={() => setDrawerCandidate(null)} />
    </div>
  );
}
