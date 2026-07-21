import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClient, useCreateClient, useUpdateClient } from '../../hooks/useClients';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';
import { PageSkeleton } from '../../components/ui/Skeleton';
import type { CreateClientPayload } from '../../services/clients';

export default function ClientFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: existingData, isLoading: loadingExisting } = useClient(id || '');
  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();

  const [form, setForm] = useState<CreateClientPayload>({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    gstin: '',
    pan: '',
    tan: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    industry: '',
    website: '',
    notes: '',
    tags: [],
    contacts: [{ name: '', email: '', phone: '', role: '', isPrimary: true }],
  });
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState('');

  // Populate form when editing
  useEffect(() => {
    if (isEdit && existingData?.client) {
      const c = existingData.client;
      setForm({
        name: c.name,
        email: c.email || '',
        phone: c.phone || '',
        companyName: c.companyName || '',
        gstin: c.gstin || '',
        pan: c.pan || '',
        tan: c.tan || '',
        address: c.address || '',
        city: c.city || '',
        state: c.state || '',
        pincode: c.pincode || '',
        country: c.country || 'India',
        industry: c.industry || '',
        website: c.website || '',
        notes: c.notes || '',
        tags: c.tags.map((t) => t.name),
        contacts:
          c.contacts.length > 0
            ? c.contacts.map((ct) => ({
                name: ct.name,
                email: ct.email || '',
                phone: ct.phone || '',
                role: ct.role || '',
                isPrimary: ct.isPrimary,
              }))
            : [{ name: '', email: '', phone: '', role: '', isPrimary: true }],
      });
    }
  }, [isEdit, existingData]);

  const setField = (field: keyof CreateClientPayload, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && form.tags && !form.tags.includes(tag)) {
      setField('tags', [...form.tags, tag]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setField(
      'tags',
      (form.tags || []).filter((t) => t !== tag),
    );
  };

  const updateContact = (index: number, field: string, value: any) => {
    const contacts = [...(form.contacts || [])];
    contacts[index] = { ...contacts[index], [field]: value };
    setField('contacts', contacts);
  };

  const addContact = () => {
    setField('contacts', [
      ...(form.contacts || []),
      { name: '', email: '', phone: '', role: '', isPrimary: false },
    ]);
  };

  const removeContact = (index: number) => {
    const contacts = [...(form.contacts || [])];
    contacts.splice(index, 1);
    setField(
      'contacts',
      contacts.length > 0
        ? contacts
        : [{ name: '', email: '', phone: '', role: '', isPrimary: true }],
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Clean up empty contacts
    const payload = {
      ...form,
      contacts: (form.contacts || []).filter((c) => c.name.trim()),
    };

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: id!, data: payload });
        navigate(`/clients/${id}`);
      } else {
        const result = await createMutation.mutateAsync(payload);
        navigate(`/clients/${result.client.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    }
  };

  if (isEdit && loadingExisting) return <PageSkeleton />;

  const mutation = isEdit ? updateMutation : createMutation;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-950">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-5 dark:border-navy-800 dark:bg-navy-900 lg:px-8">
        <nav className="mb-2 flex items-center gap-1.5 text-sm">
          <a href="/dashboard" className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
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
          <a href="/clients" className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
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
          <span className="font-medium text-gray-900 dark:text-white">
            {isEdit ? 'Edit Client' : 'New Client'}
          </span>
        </nav>
        <h1 className="text-display-md text-gray-900 dark:text-white">
          {isEdit ? 'Edit Client' : 'Add New Client'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="p-4 lg:p-6 space-y-6 max-w-4xl">
        {error && <Alert variant="error">{error}</Alert>}

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Client Name *"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                required
                className="sm:col-span-2"
              />
              <Input
                label="Email"
                type="email"
                placeholder="john@company.com"
                value={form.email || ''}
                onChange={(e) => setField('email', e.target.value)}
              />
              <Input
                label="Phone"
                placeholder="+91 98765 43210"
                value={form.phone || ''}
                onChange={(e) => setField('phone', e.target.value)}
              />
              <Input
                label="Company Name"
                placeholder="Acme Corp"
                value={form.companyName || ''}
                onChange={(e) => setField('companyName', e.target.value)}
              />
              <Input
                label="Industry"
                placeholder="Technology"
                value={form.industry || ''}
                onChange={(e) => setField('industry', e.target.value)}
              />
              <Input
                label="Website"
                placeholder="https://company.com"
                value={form.website || ''}
                onChange={(e) => setField('website', e.target.value)}
                className="sm:col-span-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tax Info */}
        <Card>
          <CardHeader>
            <CardTitle>Tax Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input
                label="GSTIN"
                placeholder="22AAAAA0000A1Z5"
                value={form.gstin || ''}
                onChange={(e) => setField('gstin', e.target.value.toUpperCase())}
                hint="15-character GST Identification Number"
              />
              <Input
                label="PAN"
                placeholder="ABCDE1234F"
                value={form.pan || ''}
                onChange={(e) => setField('pan', e.target.value.toUpperCase())}
                hint="10-character Permanent Account Number"
              />
              <Input
                label="TAN"
                placeholder="DELH12345A"
                value={form.tan || ''}
                onChange={(e) => setField('tan', e.target.value.toUpperCase())}
              />
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
              <Textarea
                label="Address"
                placeholder="Street address"
                value={form.address || ''}
                onChange={(e) => setField('address', e.target.value)}
                className="sm:col-span-2"
              />
              <Input
                label="City"
                placeholder="Mumbai"
                value={form.city || ''}
                onChange={(e) => setField('city', e.target.value)}
              />
              <Input
                label="State"
                placeholder="Maharashtra"
                value={form.state || ''}
                onChange={(e) => setField('state', e.target.value)}
              />
              <Input
                label="Pincode"
                placeholder="400001"
                value={form.pincode || ''}
                onChange={(e) => setField('pincode', e.target.value)}
              />
              <Input
                label="Country"
                placeholder="India"
                value={form.country || ''}
                onChange={(e) => setField('country', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contacts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Contacts</CardTitle>
              <Button type="button" variant="ghost" size="sm" onClick={addContact}>
                + Add Contact
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(form.contacts || []).map((contact, i) => (
                <div key={i} className="rounded-lg border border-gray-200 p-4 dark:border-navy-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Contact {i + 1}
                    </span>
                    {(form.contacts || []).length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeContact(i)}
                        className="text-xs text-red-500 hover:text-red-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Input
                      placeholder="Name *"
                      value={contact.name}
                      onChange={(e) => updateContact(i, 'name', e.target.value)}
                      required
                    />
                    <Input
                      placeholder="Role"
                      value={contact.role || ''}
                      onChange={(e) => updateContact(i, 'role', e.target.value)}
                    />
                    <Input
                      placeholder="Email"
                      type="email"
                      value={contact.email || ''}
                      onChange={(e) => updateContact(i, 'email', e.target.value)}
                    />
                    <Input
                      placeholder="Phone"
                      value={contact.phone || ''}
                      onChange={(e) => updateContact(i, 'phone', e.target.value)}
                    />
                  </div>
                  <label className="mt-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={contact.isPrimary}
                      onChange={(e) => updateContact(i, 'isPrimary', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 bg-white text-primary-600 focus:ring-primary-500 dark:border-navy-700 dark:bg-navy-900"
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Primary contact
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-3">
              {(form.tags || []).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-0.5 hover:text-primary-900 dark:hover:text-primary-100"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" variant="secondary" onClick={addTag}>
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Add any additional notes about this client..."
              value={form.notes || ''}
              onChange={(e) => setField('notes', e.target.value)}
              className="min-h-[120px]"
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            {isEdit ? 'Save Changes' : 'Create Client'}
          </Button>
        </div>
      </form>
    </div>
  );
}
