import { useState, useRef, useCallback } from 'react';
import {
  useDocuments,
  useFolders,
  useUploadDocument,
  useDeleteDocument,
  useCreateFolder,
  useDeleteFolder,
} from '../../hooks/useDocuments';
import {
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_TYPE_ICONS,
  type DocumentType,
  type DocumentItem,
} from '../../services/documents';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { ConfirmModal } from '../../components/ui/Modal';
import { Alert } from '../../components/ui/Alert';
import { PageHeader } from '../../components/layout/PageHeader';
import { OcrPanel } from '../../components/documents/OcrPanel';

// ─── Main Component ─────────────────────────

export default function DocumentCenterPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<DocumentType | ''>('');
  const [folderId, setFolderId] = useState<string | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showUpload, setShowUpload] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const { data, isLoading, error } = useDocuments({
    page,
    limit: 20,
    search: search || undefined,
    type: (typeFilter as DocumentType) || undefined,
    folderId,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { data: folderData } = useFolders();
  const uploadMutation = useUploadDocument();
  const deleteMutation = useDeleteDocument();
  const createFolderMutation = useCreateFolder();
  const deleteFolderMutation = useDeleteFolder();

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    await createFolderMutation.mutateAsync({
      name: newFolderName.trim(),
      parentId: folderId || undefined,
    });
    setNewFolderName('');
    setShowNewFolder(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-950">
      <PageHeader
        title="Document Center"
        description="Upload, organize, and manage your financial documents"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Documents' }]}
        actions={
          <Button variant="primary" onClick={() => setShowUpload(true)}>
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            Upload
          </Button>
        }
      />

      <div className="flex gap-6 p-4 lg:p-6">
        {/* Folder Sidebar */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <Card className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Folders
              </h3>
              <button
                onClick={() => setShowNewFolder(true)}
                className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
            </div>

            <button
              onClick={() => {
                setFolderId(null);
                setPage(1);
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                folderId === null
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-navy-800'
              }`}
            >
              📁 All Documents
            </button>

            {showNewFolder && (
              <div className="mt-1 flex gap-1">
                <Input
                  placeholder="Folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateFolder();
                    if (e.key === 'Escape') setShowNewFolder(false);
                  }}
                  autoFocus
                  className="h-8 text-xs"
                />
              </div>
            )}

            {folderData?.folders.map((folder) => (
              <div key={folder.id} className="group flex items-center">
                <button
                  onClick={() => {
                    setFolderId(folder.id);
                    setPage(1);
                  }}
                  className={`flex flex-1 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    folderId === folder.id
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                      : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-navy-800'
                  }`}
                >
                  📂 {folder.name}
                  <span className="ml-auto text-[10px] text-gray-400">
                    {folder._count.documents}
                  </span>
                </button>
                <button
                  onClick={() => deleteFolderMutation.mutate(folder.id)}
                  className="mr-1 hidden rounded p-1 text-gray-300 hover:text-red-500 group-hover:block"
                >
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </Card>
        </aside>

        {/* Main Content */}
        <div className="flex-1 space-y-4">
          {error && <Alert variant="error">{(error as Error).message}</Alert>}

          {/* Filters */}
          <Card className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex-1">
                <Input
                  placeholder="Search documents..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  leftIcon={
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                      />
                    </svg>
                  }
                />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                <button
                  onClick={() => {
                    setTypeFilter('');
                    setPage(1);
                  }}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${!typeFilter ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-navy-800 dark:text-gray-400'}`}
                >
                  All
                </button>
                {(Object.keys(DOCUMENT_TYPE_LABELS) as DocumentType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTypeFilter(typeFilter === t ? '' : t);
                      setPage(1);
                    }}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${typeFilter === t ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-navy-800 dark:text-gray-400'}`}
                  >
                    {DOCUMENT_TYPE_ICONS[t]} {DOCUMENT_TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
              <div className="flex gap-1 border-l border-gray-200 pl-3 dark:border-navy-700">
                <button
                  onClick={() => setView('grid')}
                  className={`rounded-lg p-1.5 ${view === 'grid' ? 'bg-gray-100 dark:bg-navy-800' : ''}`}
                >
                  <svg
                    className="h-4 w-4 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`rounded-lg p-1.5 ${view === 'list' ? 'bg-gray-100 dark:bg-navy-800' : ''}`}
                >
                  <svg
                    className="h-4 w-4 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </Card>

          {/* Documents */}
          {isLoading ? (
            <TableSkeleton rows={6} cols={5} />
          ) : data && data.documents.length === 0 ? (
            <EmptyState onUpload={() => setShowUpload(true)} hasSearch={!!search || !!typeFilter} />
          ) : view === 'grid' ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {data!.documents.map((doc) => (
                <DocumentGridCard
                  key={doc.id}
                  doc={doc}
                  onPreview={() => setPreviewDoc(doc)}
                  onDelete={() => setDeleteDocId(doc.id)}
                />
              ))}
            </div>
          ) : (
            <DocumentListTable
              documents={data!.documents}
              onPreview={setPreviewDoc}
              onDelete={setDeleteDocId}
            />
          )}

          {/* Pagination */}
          {data && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total}{' '}
                documents)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!data.pagination.hasPrev}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!data.pagination.hasNext}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <UploadModal
          folderId={folderId}
          onClose={() => setShowUpload(false)}
          onUpload={async (file, metadata) => {
            await uploadMutation.mutateAsync({ file, metadata });
            setShowUpload(false);
          }}
          isUploading={uploadMutation.isPending}
        />
      )}

      {/* Preview Modal */}
      {previewDoc && <PreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />}

      {/* Delete Confirmation */}
      <ConfirmModal
        open={!!deleteDocId}
        onClose={() => setDeleteDocId(null)}
        onConfirm={async () => {
          if (deleteDocId) await deleteMutation.mutateAsync(deleteDocId);
          setDeleteDocId(null);
        }}
        title="Delete Document"
        description="Are you sure you want to delete this document? This action cannot be undone."
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

// ─── Grid Card ──────────────────────────────

function DocumentGridCard({
  doc,
  onPreview,
  onDelete,
}: {
  doc: DocumentItem;
  onPreview: () => void;
  onDelete: () => void;
}) {
  const isImage = doc.mimeType.startsWith('image/');
  const isPdf = doc.mimeType === 'application/pdf';

  return (
    <Card hover className="group cursor-pointer" onClick={onPreview}>
      {/* Preview Area */}
      <div className="relative h-36 overflow-hidden rounded-t-xl bg-gray-50 dark:bg-navy-800/50 flex items-center justify-center">
        {isImage ? (
          <img src={doc.url} alt={doc.name} className="h-full w-full object-cover" />
        ) : isPdf ? (
          <div className="flex flex-col items-center gap-2">
            <svg
              className="h-10 w-10 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
            <span className="text-xs text-gray-400">PDF</span>
          </div>
        ) : (
          <span className="text-3xl">{DOCUMENT_TYPE_ICONS[doc.type]}</span>
        )}
        {/* Actions overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center gap-2 bg-navy-950/60 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <a
            href={doc.url}
            download={doc.fileName}
            className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-900 hover:bg-white"
          >
            Download
          </a>
          <button
            onClick={onDelete}
            className="rounded-lg bg-red-500/90 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500"
          >
            Delete
          </button>
        </div>
      </div>
      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">{doc.name}</h4>
          <Badge variant="neutral" size="sm">
            {DOCUMENT_TYPE_LABELS[doc.type]}
          </Badge>
        </div>
        <div className="mt-2 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span>{formatFileSize(doc.fileSize)}</span>
          <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
          {doc._count && doc._count.versions > 0 && <span>v{doc._count.versions + 1}</span>}
        </div>
        {doc.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {doc.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600 dark:bg-navy-800 dark:text-gray-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── List Table ─────────────────────────────

function DocumentListTable({
  documents,
  onPreview,
  onDelete,
}: {
  documents: DocumentItem[];
  onPreview: (d: DocumentItem) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50/50 dark:border-navy-800 dark:bg-navy-800/50">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Name
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Type
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Size
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Date
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-navy-800/50">
            {documents.map((doc) => (
              <tr
                key={doc.id}
                className="hover:bg-gray-50/50 dark:hover:bg-navy-800/30 cursor-pointer"
                onClick={() => onPreview(doc)}
              >
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{DOCUMENT_TYPE_ICONS[doc.type]}</span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{doc.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{doc.fileName}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <Badge variant="neutral" size="sm">
                    {DOCUMENT_TYPE_LABELS[doc.type]}
                  </Badge>
                </td>
                <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400">
                  {formatFileSize(doc.fileSize)}
                </td>
                <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400">
                  {new Date(doc.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-1">
                    <a
                      href={doc.url}
                      download={doc.fileName}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-navy-800"
                      title="Download"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                        />
                      </svg>
                    </a>
                    <button
                      onClick={() => onDelete(doc.id)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                      title="Delete"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ─── Upload Modal ───────────────────────────

function UploadModal({
  folderId,
  onClose,
  onUpload,
  isUploading,
}: {
  folderId: string | null;
  onClose: () => void;
  onUpload: (file: File, metadata: any) => Promise<void>;
  isUploading: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<DocumentType>('OTHER');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) {
        setFile(dropped);
        if (!name) setName(dropped.name.replace(/\.[^/.]+$/, ''));
      }
    },
    [name],
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      if (!name) setName(selected.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    await onUpload(file, {
      name: name || file.name,
      type,
      description: description || undefined,
      tags: tags
        ? tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : undefined,
      folderId: folderId || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-navy-800 dark:bg-navy-900 animate-scale-in">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-navy-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upload Document</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-800"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${
              dragOver
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : file
                  ? 'border-primary-300 bg-primary-50/50 dark:border-primary-700 dark:bg-primary-900/10'
                  : 'border-gray-300 hover:border-primary-400 dark:border-navy-700 dark:hover:border-primary-600'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.csv,.xlsx,.xls,.doc,.docx"
            />
            {file ? (
              <>
                <svg
                  className="h-10 w-10 text-primary-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
                <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="mt-2 text-xs text-red-500 hover:text-red-600"
                >
                  Remove
                </button>
              </>
            ) : (
              <>
                <svg
                  className="h-10 w-10 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Drag & drop or{' '}
                  <span className="text-primary-600 dark:text-primary-400">browse</span>
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  PDF, Images, CSV, Excel, Word (max 50MB)
                </p>
              </>
            )}
          </div>

          <Input
            label="Document Name"
            placeholder="Document name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Document Type
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(DOCUMENT_TYPE_LABELS) as DocumentType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${type === t ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-navy-800 dark:text-gray-400'}`}
                >
                  {DOCUMENT_TYPE_ICONS[t]} {DOCUMENT_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Tags"
            placeholder="Comma-separated tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            hint="e.g. q4-2024, vendor-a, recurring"
          />
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-navy-800">
          <Button variant="secondary" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={isUploading} disabled={!file}>
            Upload Document
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Preview Modal ──────────────────────────

function PreviewModal({ doc, onClose }: { doc: DocumentItem; onClose: () => void }) {
  const isImage = doc.mimeType.startsWith('image/');
  const isPdf = doc.mimeType === 'application/pdf';
  const isOcrCandidate = isImage || isPdf;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex h-[90vh] w-full max-w-7xl flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-navy-800 dark:bg-navy-900 animate-scale-in">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-navy-800">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{doc.name}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {doc.fileName} &middot; {formatFileSize(doc.fileSize)}
            </p>
          </div>
          <div className="flex gap-2">
            <a href={doc.url} download={doc.fileName} className="btn btn-secondary btn-sm">
              Download
            </a>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-800"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Preview area */}
          <div
            className={`flex-1 overflow-auto p-4 ${isOcrCandidate ? 'border-r border-gray-200 dark:border-navy-800' : ''}`}
          >
            {isImage ? (
              <img
                src={doc.url}
                alt={doc.name}
                className="mx-auto max-h-full rounded-lg object-contain"
              />
            ) : isPdf ? (
              <iframe
                src={doc.url}
                className="h-full w-full rounded-lg border-0"
                title={doc.name}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-gray-400">
                <span className="text-5xl">{DOCUMENT_TYPE_ICONS[doc.type]}</span>
                <p className="mt-4 text-sm">Preview not available for this file type</p>
                <a
                  href={doc.url}
                  download={doc.fileName}
                  className="mt-3 text-sm text-primary-600 hover:underline dark:text-primary-400"
                >
                  Download to view
                </a>
              </div>
            )}
          </div>

          {/* OCR Panel sidebar (for images & PDFs) */}
          {isOcrCandidate && (
            <div className="w-[380px] shrink-0 overflow-y-auto p-4">
              <OcrPanel documentId={doc.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ────────────────────────────

function EmptyState({ onUpload, hasSearch }: { onUpload: () => void; hasSearch: boolean }) {
  return (
    <Card className="flex flex-col items-center justify-center py-16">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-navy-800">
        <svg
          className="h-8 w-8 text-gray-400 dark:text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
      </div>
      <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
        {hasSearch ? 'No documents found' : 'No documents yet'}
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {hasSearch
          ? 'Try adjusting your search or filters'
          : 'Upload your first document to get started'}
      </p>
      {!hasSearch && (
        <Button variant="primary" className="mt-4" onClick={onUpload}>
          Upload Document
        </Button>
      )}
    </Card>
  );
}

// ─── Helpers ────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
