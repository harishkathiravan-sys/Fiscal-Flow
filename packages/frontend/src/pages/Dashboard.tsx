import { StatCard, Card, CardHeader, CardTitle, Badge, Avatar } from '../components/ui';

// ─── Dashboard Page ─────────────────────────

export default function DashboardPage() {
  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div>
        <h1 className="text-display-md text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Welcome back! Here's an overview of your financial health.
        </p>
      </div>

      {/* ── Stat Cards ─────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value="$48,352"
          change="+12.5% from last month"
          changeType="positive"
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
                d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
        <StatCard
          title="Total Expenses"
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
          title="Net Profit"
          value="$35,512"
          change="+18.2% from last month"
          changeType="positive"
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
                d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
              />
            </svg>
          }
        />
        <StatCard
          title="Pending Invoices"
          value="12"
          change="3 due this week"
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
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
      </div>

      {/* ── Charts Row ─────────────────────── */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Revenue Chart */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Revenue Overview</CardTitle>
              <div className="flex gap-1">
                {['Week', 'Month', 'Year'].map((period) => (
                  <button
                    key={period}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      period === 'Month'
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                        : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-navy-800'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <div className="px-6 pb-6">
            {/* Chart placeholder */}
            <div className="relative h-64 rounded-xl bg-gray-50 dark:bg-navy-800/50 overflow-hidden">
              {/* Simulated bar chart */}
              <div className="absolute inset-0 flex items-end justify-around px-4 pb-4 pt-8">
                {[40, 65, 45, 80, 55, 90, 70, 95, 60, 85, 75, 100].map((h, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div
                      className="w-6 rounded-t-md bg-gradient-to-t from-primary-600 to-primary-400 transition-all duration-500 hover:from-primary-700 hover:to-primary-500 sm:w-8 lg:w-10"
                      style={{ height: `${h}%` }}
                    />
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">
                      {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}
                    </span>
                  </div>
                ))}
              </div>
              {/* Y-axis labels */}
              <div className="absolute left-2 top-0 flex h-full flex-col justify-between py-8">
                {['$50k', '$40k', '$30k', '$20k', '$10k', '$0'].map((label) => (
                  <span key={label} className="text-[10px] text-gray-400 dark:text-gray-500">
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Account Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Account Breakdown</CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
            {/* Donut chart placeholder */}
            <div className="flex items-center justify-center py-4">
              <div className="relative h-40 w-40">
                <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    strokeWidth="4"
                    className="stroke-gray-100 dark:stroke-navy-800"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    strokeWidth="4"
                    strokeDasharray="35 65"
                    className="stroke-primary-500"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    strokeWidth="4"
                    strokeDasharray="25 75"
                    strokeDashoffset="-35"
                    className="stroke-navy-600"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    strokeWidth="4"
                    strokeDasharray="20 80"
                    strokeDashoffset="-60"
                    className="stroke-amber-500"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    strokeWidth="4"
                    strokeDasharray="15 85"
                    strokeDashoffset="-80"
                    className="stroke-red-400"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">$48.3k</span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">Total</span>
                </div>
              </div>
            </div>
            {/* Legend */}
            <div className="mt-4 space-y-2.5">
              {[
                { label: 'Revenue', color: 'bg-primary-500', value: '35%', amount: '$16,923' },
                { label: 'Assets', color: 'bg-navy-600', value: '25%', amount: '$12,088' },
                { label: 'Expenses', color: 'bg-amber-500', value: '20%', amount: '$9,670' },
                { label: 'Liabilities', color: 'bg-red-400', value: '15%', amount: '$7,253' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.amount}
                    </span>
                    <span className="ml-1.5 text-xs text-gray-400">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* ── Bottom Row ─────────────────────── */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Recent Activity */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <button className="text-xs font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
                View all
              </button>
            </div>
          </CardHeader>
          <div className="divide-y divide-gray-100 dark:divide-navy-800">
            {[
              {
                user: 'Sarah Wilson',
                initials: 'SW',
                action: 'created a journal entry',
                detail: 'Office supplies purchase — $342.00',
                time: '2 minutes ago',
                type: 'journal',
              },
              {
                user: 'Alex Johnson',
                initials: 'AJ',
                action: 'uploaded an invoice',
                detail: 'Invoice #1042 from Acme Corp — $5,200.00',
                time: '15 minutes ago',
                type: 'invoice',
              },
              {
                user: 'You',
                initials: 'YO',
                action: 'posted 3 journal entries',
                detail: 'Bank reconciliation for December',
                time: '1 hour ago',
                type: 'reconciliation',
              },
              {
                user: 'System',
                initials: '🤖',
                action: 'generated a report',
                detail: 'December 2024 Income Statement',
                time: '2 hours ago',
                type: 'report',
              },
              {
                user: 'Mike Chen',
                initials: 'MC',
                action: 'approved a payment',
                detail: 'Vendor payment to CloudTech — $1,200.00',
                time: '3 hours ago',
                type: 'payment',
              },
              {
                user: 'Emily Park',
                initials: 'EP',
                action: 'reconciled a bank account',
                detail: 'Business Checking — 42 transactions matched',
                time: '5 hours ago',
                type: 'reconciliation',
              },
            ].map((activity, i) => (
              <div
                key={i}
                className="flex items-start gap-3 px-6 py-3.5 hover:bg-gray-50/50 dark:hover:bg-navy-800/30 transition-colors"
              >
                <Avatar
                  name={activity.user}
                  size="sm"
                  className={activity.type === 'report' ? 'bg-navy-100 dark:bg-navy-800' : ''}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {activity.user}
                    </span>{' '}
                    {activity.action}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 truncate">
                    {activity.detail}
                  </p>
                </div>
                <span className="shrink-0 text-[11px] text-gray-400 dark:text-gray-500">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Upcoming Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming</CardTitle>
            </CardHeader>
            <div className="px-6 pb-6 space-y-3">
              {[
                { title: 'File Q4 tax return', due: 'Jan 31', priority: 'danger' as const },
                { title: 'Review monthly statements', due: 'Jan 28', priority: 'warning' as const },
                { title: 'Process payroll', due: 'Jan 30', priority: 'info' as const },
                { title: 'Send overdue reminders', due: 'Feb 1', priority: 'neutral' as const },
              ].map((task, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 dark:border-navy-800"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {task.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Due {task.due}</p>
                  </div>
                  <Badge variant={task.priority} dot size="sm">
                    {task.priority === 'danger'
                      ? 'Urgent'
                      : task.priority === 'warning'
                        ? 'Soon'
                        : 'Normal'}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <div className="px-6 pb-6 grid grid-cols-2 gap-2">
              {[
                {
                  label: 'New Entry',
                  icon: '📝',
                  color:
                    'bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/20 dark:hover:bg-primary-900/30 text-primary-700 dark:text-primary-300',
                },
                {
                  label: 'Upload Doc',
                  icon: '📤',
                  color:
                    'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300',
                },
                {
                  label: 'Send Invoice',
                  icon: '🧾',
                  color:
                    'bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/30 text-amber-700 dark:text-amber-300',
                },
                {
                  label: 'Run Report',
                  icon: '📊',
                  color:
                    'bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-300',
                },
              ].map((action) => (
                <button
                  key={action.label}
                  className={`flex flex-col items-center gap-2 rounded-xl p-4 transition-colors ${action.color}`}
                >
                  <span className="text-2xl">{action.icon}</span>
                  <span className="text-xs font-medium">{action.label}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Cash Flow Mini */}
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow</CardTitle>
            </CardHeader>
            <div className="px-6 pb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">$24,830</span>
                <Badge variant="success" dot>
                  Positive
                </Badge>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Net cash flow this month
              </p>

              {/* Mini sparkline placeholder */}
              <div className="mt-4 h-16 rounded-lg bg-gray-50 dark:bg-navy-800/50 flex items-end justify-around px-2 pb-2">
                {[30, 45, 35, 50, 40, 65, 55, 70, 60, 80, 75, 85].map((h, i) => (
                  <div
                    key={i}
                    className={`w-1.5 rounded-full ${i >= 10 ? 'bg-primary-500' : 'bg-gray-200 dark:bg-navy-700'}`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>

              <div className="mt-3 flex justify-between text-[11px]">
                <span className="text-primary-600 dark:text-primary-400">
                  <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-primary-500" />
                  In: $32,100
                </span>
                <span className="text-red-500 dark:text-red-400">
                  <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-red-400" />
                  Out: $7,270
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
