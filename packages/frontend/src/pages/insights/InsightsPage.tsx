import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { insightsApi } from '../../services/insights';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { PageHeader } from '../../components/layout/PageHeader';
import { PageSkeleton } from '../../components/ui/Skeleton';

const severityVariant: Record<string, 'success' | 'warning' | 'danger'> = {
  INFO: 'success',
  WARNING: 'warning',
  CRITICAL: 'danger',
};
const typeIcons: Record<string, string> = {
  CASH_FLOW_PREDICTION: '💰',
  LATE_PAYMENT: '⏰',
  EXPENSE_ANOMALY: '📊',
  DUPLICATE_INVOICE: '📋',
  FINANCIAL_HEALTH: '💪',
  REVENUE_TREND: '📈',
  SUBSCRIPTION_DETECTED: '🔄',
  RECONCILIATION_SUGGESTION: '🔗',
};

export default function InsightsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['insights'],
    queryFn: () => insightsApi.list(),
  });
  const generateMut = useMutation({
    mutationFn: insightsApi.generate,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['insights'] }),
  });
  const dismissMut = useMutation({
    mutationFn: insightsApi.dismiss,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['insights'] }),
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-950">
      <PageHeader
        title="AI Insights"
        description="AI-powered financial analysis and predictions"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Insights' }]}
        actions={
          <Button
            variant="primary"
            onClick={() => generateMut.mutate()}
            loading={generateMut.isPending}
          >
            ⚡ Generate Insights
          </Button>
        }
      />
      <div className="p-4 lg:p-6 space-y-4">
        {isLoading ? (
          <PageSkeleton />
        ) : data?.insights?.length === 0 ? (
          <Card className="py-16 text-center">
            <p className="text-gray-500">No insights yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Click "Generate Insights" to analyze your financial data
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {data?.insights?.map((insight: any) => (
              <Card key={insight.id} className="flex items-start gap-4 p-5">
                <span className="mt-1 text-2xl">{typeIcons[insight.type] || '💡'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{insight.title}</h3>
                    <Badge variant={severityVariant[insight.severity] || 'info'} size="sm">
                      {insight.severity}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {insight.description}
                  </p>
                  <p className="mt-2 text-[11px] text-gray-400">
                    {new Date(insight.createdAt).toLocaleString('en-IN')}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => dismissMut.mutate(insight.id)}>
                  Dismiss
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
