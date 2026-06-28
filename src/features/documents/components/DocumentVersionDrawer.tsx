import { Download, FileClock, UploadCloud, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/shared/components/Button';
import { queryKeys } from '@/shared/api/queryKeys';
import { downloadDocumentVersion, uploadDocumentVersion } from '../api/documentsApi';
import { useDocumentVersions } from '../hooks/useDocumentVersions';
import type { DocumentQueueItem, DocumentVersion } from '../types/documents';

type DocumentVersionDrawerProps = {
  document: DocumentQueueItem | null;
  onClose: () => void;
};

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

function VersionRow({ version, documentId, fileName }: { version: DocumentVersion; documentId: number; fileName: string }) {
  const downloadMutation = useMutation({
    mutationFn: () => downloadDocumentVersion(documentId, version.documentVersionId),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = version.fileName ?? fileName;
      anchor.click();
      URL.revokeObjectURL(url);
    }
  });

  return (
    <div className="document-version-row">
      <div className="document-version-main">
        <strong>Version {version.versionNumber ?? version.documentVersionId}</strong>
        <span>{version.fileName ?? fileName}</span>
      </div>
      <div className="document-version-meta">
        <span>{formatBytes(version.fileSizeBytes)}</span>
        <span>{formatDate(version.uploadedOnUtc ?? version.createdOnUtc)}</span>
        <span>{version.uploadedBy ?? '-'}</span>
      </div>
      <Button variant="secondary" onClick={() => downloadMutation.mutate()} disabled={downloadMutation.isPending}>
        <Download size={16} /> Download
      </Button>
    </div>
  );
}

export function DocumentVersionDrawer({ document, onClose }: DocumentVersionDrawerProps) {
  const queryClient = useQueryClient();
  const versionsQuery = useDocumentVersions(document?.documentId ?? null);
  const uploadMutation = useMutation({
    mutationFn: uploadDocumentVersion,
    onSuccess: async () => {
      if (document) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.documents.versions(document.documentId) });
      }
    }
  });

  if (!document) return null;

  return (
    <aside className="match-drawer document-drawer">
      <div className="match-drawer-header">
        <div>
          <span>Document Center</span>
          <h3>{document.fileName}</h3>
        </div>
        <button className="match-drawer-close" onClick={onClose} aria-label="Close document drawer">
          <X size={18} />
        </button>
      </div>

      <div className="match-drawer-body">
        <section className="enterprise-card compact-card">
          <div className="enterprise-card-title-row">
            <FileClock size={18} />
            <h4>Version History</h4>
          </div>

          {versionsQuery.isLoading ? <p className="workspace-muted">Loading versions...</p> : null}
          {versionsQuery.isError ? <p className="workspace-error">Unable to load document versions.</p> : null}
          {!versionsQuery.isLoading && versionsQuery.data?.length === 0 ? (
            <p className="workspace-muted">No version history is available for this document.</p>
          ) : null}
          <div className="document-version-list">
            {versionsQuery.data?.map((version) => (
              <VersionRow key={version.documentVersionId} version={version} documentId={document.documentId} fileName={document.fileName} />
            ))}
          </div>
        </section>

        <section className="enterprise-card compact-card">
          <div className="enterprise-card-title-row">
            <UploadCloud size={18} />
            <h4>Upload New Version</h4>
          </div>
          <input
            className="evictsure-form-input"
            type="file"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              uploadMutation.mutate({ documentId: document.documentId, file, uploadedBy: 'UI User' });
              event.target.value = '';
            }}
          />
          {uploadMutation.isPending ? <p className="workspace-muted">Uploading new version...</p> : null}
          {uploadMutation.isSuccess ? <p className="workspace-success">Version uploaded successfully.</p> : null}
          {uploadMutation.isError ? <p className="workspace-error">Version upload failed.</p> : null}
        </section>
      </div>
    </aside>
  );
}
