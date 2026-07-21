import { useState } from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  StatCard,
  Input,
  Textarea,
  Select,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
  TableEmpty,
  Badge,
  Alert,
  Modal,
  ConfirmModal,
  Skeleton,
  CardSkeleton,
  TableSkeleton,
  StatSkeleton,
  EmptyState,
  Avatar,
  Logo,
  PageHeader,
  useToast,
  useTheme,
} from '../components/ui';

// ─── Icons (inline) ─────────────────────────

const PlusIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const SearchIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
    />
  </svg>
);

const InvoiceIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
    />
  </svg>
);

export default function DesignSystemPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const { resolved, setTheme } = useTheme();

  const showToast = (variant: 'success' | 'error' | 'warning' | 'info') => {
    const messages = {
      success: { title: 'Changes saved', description: 'Your settings have been updated.' },
      error: { title: 'Something went wrong', description: 'Please try again later.' },
      warning: {
        title: 'Unsaved changes',
        description: 'You have unsaved changes that will be lost.',
      },
      info: { title: 'Pro tip', description: 'You can use keyboard shortcuts to navigate faster.' },
    };
    addToast({ variant, ...messages[variant] });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-950">
      {/* ── Page Header ─────────────────────── */}
      <PageHeader
        title="Design System"
        description="FiscalFlow component library & style guide"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Design System' }]}
        actions={
          <Button variant="primary" icon={<PlusIcon />}>
            Add Component
          </Button>
        }
      />

      <div className="space-y-12 p-6 lg:p-8">
        {/* ═══════════════════════════════════════ */}
        {/* COLOR PALETTE                          */}
        {/* ═══════════════════════════════════════ */}
        <section>
          <h2 className="text-display-sm text-gray-900 dark:text-white mb-4">Color Palette</h2>
          <Card className="p-6">
            <div className="space-y-6">
              {/* Primary (Emerald) */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Primary — Emerald Green
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { shade: 50, cls: 'bg-primary-50 border border-gray-200 dark:border-navy-700' },
                    {
                      shade: 100,
                      cls: 'bg-primary-100 border border-gray-200 dark:border-navy-700',
                    },
                    { shade: 200, cls: 'bg-primary-200' },
                    { shade: 300, cls: 'bg-primary-300' },
                    { shade: 400, cls: 'bg-primary-400' },
                    { shade: 500, cls: 'bg-primary-500' },
                    { shade: 600, cls: 'bg-primary-600' },
                    { shade: 700, cls: 'bg-primary-700' },
                    { shade: 800, cls: 'bg-primary-800' },
                    { shade: 900, cls: 'bg-primary-900' },
                    { shade: 950, cls: 'bg-primary-950' },
                  ].map(({ shade, cls }) => (
                    <div key={shade} className="flex flex-col items-center">
                      <div className={`h-12 w-12 rounded-lg shadow-sm ${cls}`} />
                      <span className="mt-1 text-[10px] text-gray-500">{shade}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Secondary (Navy) */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Secondary — Deep Navy
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { shade: 50, cls: 'bg-navy-50 border border-gray-200 dark:border-navy-700' },
                    { shade: 100, cls: 'bg-navy-100 border border-gray-200 dark:border-navy-700' },
                    { shade: 200, cls: 'bg-navy-200' },
                    { shade: 300, cls: 'bg-navy-300' },
                    { shade: 400, cls: 'bg-navy-400' },
                    { shade: 500, cls: 'bg-navy-500' },
                    { shade: 600, cls: 'bg-navy-600' },
                    { shade: 700, cls: 'bg-navy-700' },
                    { shade: 800, cls: 'bg-navy-800' },
                    { shade: 900, cls: 'bg-navy-900' },
                    { shade: 950, cls: 'bg-navy-950 border border-navy-800' },
                  ].map(({ shade, cls }) => (
                    <div key={shade} className="flex flex-col items-center">
                      <div className={`h-12 w-12 rounded-lg shadow-sm ${cls}`} />
                      <span className="mt-1 text-[10px] text-gray-500">{shade}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Semantic */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Semantic Colors
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: 'Success', bg: 'bg-emerald-500' },
                    { name: 'Warning', bg: 'bg-amber-500' },
                    { name: 'Danger', bg: 'bg-red-500' },
                    { name: 'Info', bg: 'bg-blue-500' },
                  ].map((c) => (
                    <div key={c.name} className="flex flex-col items-center">
                      <div className={`h-12 w-12 rounded-lg shadow-sm ${c.bg}`} />
                      <span className="mt-1 text-[10px] text-gray-500">{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* ═══════════════════════════════════════ */}
        {/* TYPOGRAPHY                             */}
        {/* ═══════════════════════════════════════ */}
        <section>
          <h2 className="text-display-sm text-gray-900 dark:text-white mb-4">Typography</h2>
          <Card className="p-6 space-y-4">
            <div className="text-display-2xl text-gray-900 dark:text-white">Display 2XL</div>
            <div className="text-display-xl text-gray-900 dark:text-white">Display XL</div>
            <div className="text-display-lg text-gray-900 dark:text-white">Display LG</div>
            <div className="text-display-md text-gray-900 dark:text-white">Display MD</div>
            <div className="text-display-sm text-gray-900 dark:text-white">Display SM</div>
            <div className="text-display-xs text-gray-900 dark:text-white">Display XS</div>
            <div className="border-t border-gray-200 dark:border-navy-800 pt-4 mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong className="text-gray-900 dark:text-white">Body text.</strong> FiscalFlow
                uses Inter for UI and JetBrains Mono for code and numbers. All display sizes include
                tight letter-spacing for a professional, modern feel.
              </p>
              <p className="mt-2 font-mono text-sm text-primary-600 dark:text-primary-400">
                font-mono: 1,234.56 ✓
              </p>
            </div>
          </Card>
        </section>

        {/* ═══════════════════════════════════════ */}
        {/* BUTTONS                                */}
        {/* ═══════════════════════════════════════ */}
        <section>
          <h2 className="text-display-sm text-gray-900 dark:text-white mb-4">Buttons</h2>
          <Card className="p-6 space-y-6">
            {/* Variants */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Variants
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
            </div>
            {/* Sizes */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Sizes</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>
            {/* States */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                States
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  loading={loading}
                  onClick={() => {
                    setLoading(true);
                    setTimeout(() => setLoading(false), 2000);
                  }}
                >
                  Click to Load
                </Button>
                <Button disabled>Disabled</Button>
                <Button variant="primary" icon={<PlusIcon />}>
                  With Icon
                </Button>
                <Button variant="secondary" icon={<SearchIcon />}>
                  Search
                </Button>
              </div>
            </div>
          </Card>
        </section>

        {/* ═══════════════════════════════════════ */}
        {/* CARDS                                  */}
        {/* ═══════════════════════════════════════ */}
        <section>
          <h2 className="text-display-sm text-gray-900 dark:text-white mb-4">Cards</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Revenue"
              value="$48,352"
              change="+12.5% from last month"
              changeType="positive"
              icon={<InvoiceIcon />}
            />
            <StatCard
              title="Expenses"
              value="$12,840"
              change="+3.2% from last month"
              changeType="negative"
              icon={
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
                  />
                </svg>
              }
            />
            <StatCard
              title="Invoices"
              value="284"
              change="+8 this week"
              changeType="neutral"
              icon={
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
              }
            />
            <StatCard
              title="Pending Review"
              value="12"
              change="3 due today"
              changeType="negative"
              icon={
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card hover className="cursor-pointer">
              <CardContent>
                <h3 className="font-semibold text-gray-900 dark:text-white">Interactive Card</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Hover me to see the elevation effect. Use the hover prop for clickable cards.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Card with Header</CardTitle>
                <CardDescription>This card has a header, content, and footer.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Content goes here. Cards are the primary container for grouping related
                  information.
                </p>
              </CardContent>
              <CardFooter className="gap-2">
                <Button size="sm" variant="primary">
                  Save
                </Button>
                <Button size="sm" variant="ghost">
                  Cancel
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* ═══════════════════════════════════════ */}
        {/* INPUTS                                 */}
        {/* ═══════════════════════════════════════ */}
        <section>
          <h2 className="text-display-sm text-gray-900 dark:text-white mb-4">Inputs</h2>
          <Card className="p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Input label="Company Name" placeholder="Acme Corp" />
              <Input
                label="Tax ID"
                placeholder="12-3456789"
                hint="Enter your business tax identification number"
              />
              <Input
                label="Search"
                placeholder="Search transactions..."
                leftIcon={<SearchIcon />}
              />
              <Input
                label="With Error"
                placeholder="Invalid input"
                error="This field is required"
              />
              <Input label="Email" type="email" placeholder="accounting@company.com" disabled />
              <Select
                label="Account Type"
                placeholder="Select type..."
                options={[
                  { value: 'asset', label: 'Asset' },
                  { value: 'liability', label: 'Liability' },
                  { value: 'equity', label: 'Equity' },
                  { value: 'revenue', label: 'Revenue' },
                  { value: 'expense', label: 'Expense' },
                ]}
              />
              <div className="md:col-span-2">
                <Textarea label="Notes" placeholder="Add any additional notes..." />
              </div>
            </div>
          </Card>
        </section>

        {/* ═══════════════════════════════════════ */}
        {/* TABLES                                 */}
        {/* ═══════════════════════════════════════ */}
        <section>
          <h2 className="text-display-sm text-gray-900 dark:text-white mb-4">Tables</h2>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Transaction</TableHeader>
                <TableHeader>Date</TableHeader>
                <TableHeader>Account</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader className="text-right">Amount</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                {
                  name: 'Office Supplies',
                  date: 'Jan 15, 2025',
                  account: '1200 - Cash',
                  status: 'primary' as const,
                  statusLabel: 'Posted',
                  amount: '-$342.00',
                },
                {
                  name: 'Client Payment',
                  date: 'Jan 14, 2025',
                  account: '4100 - Revenue',
                  status: 'success' as const,
                  statusLabel: 'Cleared',
                  amount: '+$5,200.00',
                },
                {
                  name: 'Software License',
                  date: 'Jan 12, 2025',
                  account: '5200 - Expenses',
                  status: 'warning' as const,
                  statusLabel: 'Pending',
                  amount: '-$1,200.00',
                },
                {
                  name: 'Payroll',
                  date: 'Jan 10, 2025',
                  account: '6100 - Payroll',
                  status: 'success' as const,
                  statusLabel: 'Cleared',
                  amount: '-$12,450.00',
                },
              ].map((row, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium text-gray-900 dark:text-white">
                    {row.name}
                  </TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell className="font-mono text-xs">{row.account}</TableCell>
                  <TableCell>
                    <Badge variant={row.status} dot>
                      {row.statusLabel}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm font-medium">
                    {row.amount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>

        {/* ═══════════════════════════════════════ */}
        {/* BADGES                                 */}
        {/* ═══════════════════════════════════════ */}
        <section>
          <h2 className="text-display-sm text-gray-900 dark:text-white mb-4">Badges</h2>
          <Card className="p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary">Primary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="danger">Danger</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="neutral">Neutral</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary" dot>
                With Dot
              </Badge>
              <Badge variant="success" dot>
                Active
              </Badge>
              <Badge variant="warning" dot>
                Processing
              </Badge>
              <Badge variant="danger" dot>
                Overdue
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary" size="md">
                Large
              </Badge>
              <Badge variant="success" size="md">
                Large Success
              </Badge>
            </div>
          </Card>
        </section>

        {/* ═══════════════════════════════════════ */}
        {/* ALERTS                                 */}
        {/* ═══════════════════════════════════════ */}
        <section>
          <h2 className="text-display-sm text-gray-900 dark:text-white mb-4">Alerts</h2>
          <div className="space-y-3">
            <Alert variant="success" title="Changes saved">
              Your journal entries have been posted successfully.
            </Alert>
            <Alert variant="error" title="Upload failed">
              The document could not be processed. Please check the file format.
            </Alert>
            <Alert variant="warning" title="Trial balance is off">
              Your debits and credits do not equal. Review your entries before closing the period.
            </Alert>
            <Alert variant="info">
              This is an informational alert without a title. Useful for general notices.
            </Alert>
            <Alert variant="success" title="Dismissable alert" onClose={() => {}}>
              Click the X button to dismiss this alert.
            </Alert>
          </div>
        </section>

        {/* ═══════════════════════════════════════ */}
        {/* MODALS                                 */}
        {/* ═══════════════════════════════════════ */}
        <section>
          <h2 className="text-display-sm text-gray-900 dark:text-white mb-4">Modals</h2>
          <Card className="p-6">
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => setModalOpen(true)}>
                Open Modal
              </Button>
              <Button variant="danger" onClick={() => setConfirmOpen(true)}>
                Delete Confirmation
              </Button>
            </div>

            <Modal
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              title="Create Journal Entry"
              description="Record a new double-entry bookkeeping transaction."
              footer={
                <>
                  <Button variant="secondary" onClick={() => setModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={() => setModalOpen(false)}>
                    Create Entry
                  </Button>
                </>
              }
            >
              <div className="space-y-4">
                <Input label="Description" placeholder="Enter entry description" />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Debit" type="number" placeholder="0.00" />
                  <Input label="Credit" type="number" placeholder="0.00" />
                </div>
              </div>
            </Modal>

            <ConfirmModal
              open={confirmOpen}
              onClose={() => setConfirmOpen(false)}
              onConfirm={() => {
                setConfirmOpen(false);
                showToast('success');
              }}
              title="Delete Journal Entry"
              description="Are you sure you want to delete this journal entry? This action cannot be undone."
              confirmLabel="Delete Entry"
            />
          </Card>
        </section>

        {/* ═══════════════════════════════════════ */}
        {/* SKELETONS                              */}
        {/* ═══════════════════════════════════════ */}
        <section>
          <h2 className="text-display-sm text-gray-900 dark:text-white mb-4">Loading Skeletons</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
            <StatSkeleton />
            <TableSkeleton rows={3} cols={5} />
          </div>
        </section>

        {/* ═══════════════════════════════════════ */}
        {/* AVATARS                                */}
        {/* ═══════════════════════════════════════ */}
        <section>
          <h2 className="text-display-sm text-gray-900 dark:text-white mb-4">Avatars & Logo</h2>
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Avatar name="John Doe" size="xs" />
              <Avatar name="Jane Smith" size="sm" />
              <Avatar name="Alex Johnson" size="md" />
              <Avatar name="Sarah Wilson" size="lg" />
              <Avatar name="Mike Chen" size="xl" />
            </div>
            <div className="flex items-center gap-4">
              <Logo size="sm" />
              <Logo size="md" />
              <Logo size="lg" />
            </div>
          </Card>
        </section>

        {/* ═══════════════════════════════════════ */}
        {/* EMPTY STATES                           */}
        {/* ═══════════════════════════════════════ */}
        <section>
          <h2 className="text-display-sm text-gray-900 dark:text-white mb-4">Empty States</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <EmptyState
                title="No journal entries yet"
                description="Create your first journal entry to start tracking your finances."
                action={{ label: 'Create Entry', onClick: () => {} }}
              />
            </Card>
            <Card>
              <EmptyState
                title="No documents uploaded"
                description="Upload receipts, invoices, and other financial documents for OCR processing."
                icon={
                  <svg
                    className="h-8 w-8"
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
                }
              />
            </Card>
          </div>
        </section>

        {/* ═══════════════════════════════════════ */}
        {/* TOAST NOTIFICATIONS                    */}
        {/* ═══════════════════════════════════════ */}
        <section>
          <h2 className="text-display-sm text-gray-900 dark:text-white mb-4">
            Toast Notifications
          </h2>
          <Card className="p-6">
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" onClick={() => showToast('success')}>
                Success Toast
              </Button>
              <Button variant="danger" onClick={() => showToast('error')}>
                Error Toast
              </Button>
              <Button variant="secondary" onClick={() => showToast('warning')}>
                Warning Toast
              </Button>
              <Button variant="ghost" onClick={() => showToast('info')}>
                Info Toast
              </Button>
            </div>
          </Card>
        </section>

        {/* ═══════════════════════════════════════ */}
        {/* DARK MODE TOGGLE                       */}
        {/* ═══════════════════════════════════════ */}
        <section>
          <h2 className="text-display-sm text-gray-900 dark:text-white mb-4">Theme</h2>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Current theme: <strong className="text-gray-900 dark:text-white">{resolved}</strong>
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={resolved === 'light' ? 'primary' : 'secondary'}
                  onClick={() => setTheme('light')}
                >
                  ☀️ Light
                </Button>
                <Button
                  size="sm"
                  variant={resolved === 'dark' ? 'primary' : 'secondary'}
                  onClick={() => setTheme('dark')}
                >
                  🌙 Dark
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setTheme('system')}>
                  💻 System
                </Button>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
