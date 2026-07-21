import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClient, useDeleteClient } from '../../hooks/useClients';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { PageSkeleton } from '../../components/ui/Skeleton';
import { ConfirmModal } from '../../components/ui/Modal';
import { Alert } from '../../components/ui/Alert';

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useClient(id!);
  const deleteMutation = useDeleteClient();
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (isLoading) return <PageSkeleton />;
  if (error)
    return (
      <div className="p-6">
        <Alert variant="error">{(error as Error).message}</Alert>
      </div>
    );
  if (!data) return null;

  const client = data.client;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-950">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-5 dark:border-navy-800 dark:bg-navy-900 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <nav className="mb-2 flex items-center gap-1.5 text-sm">
              <a
                href="/dashboard"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Dashboard
              </a>
              <svg
                className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
              <a
                href="/clients"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Clients
              </a>
              <svg
                className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
              <span className="font-medium text-gray-900 dark:text-white">{client.name}</span>
            </nav>
            <div className="flex items-center gap-3">
              <h1 className="text-display-md text-gray-900 dark:text-white">{client.name}</h1>
              <Badge variant={client.isActive ? 'success' : 'neutral'} dot>
                {client.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            {client.companyName && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{client.companyName}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigate(`/clients/${id}/edit`)}>
              Edit Client
            </Button>
            <Button variant="danger" onClick={() => setDeleteOpen(true)}>
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-6 space-y-6">
        {/* Tags */}
        {client.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {client.tags.map((tag) => (
              <Badge key={tag.id} variant="primary">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Main Info */}
          <div className="xl:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InfoField label="Email" value={client.email} />
                  <InfoField label="Phone" value={client.phone} />
                  <InfoField label="Website" value={client.website} isLink />
                  <InfoField label="Industry" value={client.industry} />
                </div>
              </CardContent>
            </Card>

            {/* Address */}
            <Card>
              <CardHeader>
                <CardTitle>Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InfoField label="Address" value={client.address} className="sm:col-span-2" />
                  <InfoField label="City" value={client.city} />
                  <InfoField label="State" value={client.state} />
                  <InfoField label="Pincode" value={client.pincode} />
                  <InfoField label="Country" value={client.country} />
                </div>
              </CardContent>
            </Card>

            {/* Tax Information */}
            <Card>
              <CardHeader>
                <CardTitle>Tax Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InfoField label="GSTIN" value={client.gstin} mono />
                  <InfoField label="PAN" value={client.pan} mono />
                  <InfoField label="TAN" value={client.tan} mono />
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {client.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {client.notes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contacts */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Contacts</CardTitle>
                  <Badge variant="neutral">{client.contacts.length}</Badge>
                </div>
              </CardHeader>
              <div className="divide-y divide-gray-100 dark:divide-navy-800">
                {client.contacts.length === 0 ? (
                  <div className="px-6 py-8 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">No contacts added</p>
                  </div>
                ) : (
                  client.contacts.map((contact) => (
                    <div key={contact.id} className="px-6 py-3.5">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {contact.name}
                            </p>
                            {contact.isPrimary && (
                              <Badge variant="primary" size="sm">
                                Primary
                              </Badge>
                            )}
                          </div>
                          {contact.role && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {contact.role}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-1.5 space-y-0.5">
                        {contact.email && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {contact.email}
                          </p>
                        )}
                        {contact.phone && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {contact.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <InfoField
                    label="Created"
                    value={new Date(client.createdAt).toLocaleDateString()}
                  />
                  <InfoField
                    label="Last Updated"
                    value={new Date(client.updatedAt).toLocaleDateString()}
                  />
                  <InfoField label="Client ID" value={client.id.slice(0, 8) + '...'} mono />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={async () => {
          await deleteMutation.mutateAsync(id!);
          navigate('/clients');
        }}
        title="Delete Client"
        description={`Are you sure you want to delete "${client.name}"? This will also remove all contacts and tags.`}
        confirmLabel="Delete Client"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

// ─── Helper Component ───────────────────────

function InfoField({
  label,
  value,
  mono = false,
  isLink = false,
  className = '',
}: {
  label: string;
  value?: string | null;
  mono?: boolean;
  isLink?: boolean;
  className?: string;
}) {
  if (!value) {
    return (
      <div className={className}>
        <p className="text-xs font-medium text-gray-400 dark:text-gray-500">{label}</p>
        <p className="mt-0.5 text-sm text-gray-300 dark:text-gray-600">—</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <p className="text-xs font-medium text-gray-400 dark:text-gray-500">{label}</p>
      {isLink ? (
        <a
          href={value.startsWith('http') ? value : `https://${value}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-0.5 text-sm text-primary-600 hover:underline dark:text-primary-400"
        >
          {value}
        </a>
      ) : (
        <p
          className={`mt-0.5 text-sm text-gray-900 dark:text-white ${mono ? 'font-mono text-xs' : ''}`}
        >
          {value}
        </p>
      )}
    </div>
  );
}
