import { type HTMLAttributes } from 'react';

export function Skeleton({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`skeleton ${className}`} {...props} />;
}

export function CardSkeleton() {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-7 w-7 rounded-full" />
      </div>
      <Skeleton className="h-7 w-20" />
      <Skeleton className="h-3 w-36" />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-4 border-b border-gray-100 bg-gray-50/50 px-4 py-3 dark:border-navy-800 dark:bg-navy-800/40">
        {Array.from({ length: cols }).map((_, i) => <Skeleton key={i} className="h-3 flex-1" />)}
      </div>
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="flex items-center gap-4 border-b border-gray-50 px-4 py-3 dark:border-navy-800/40">
          {Array.from({ length: cols }).map((_, col) => (
            <Skeleton key={col} className={`h-3.5 ${col === 0 ? 'w-24' : col === cols - 1 ? 'w-16' : 'flex-1'}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div className="space-y-2"><Skeleton className="h-3 w-24" /><Skeleton className="h-7 w-28" /><Skeleton className="h-3 w-16" /></div>
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="space-y-2"><Skeleton className="h-7 w-40" /><Skeleton className="h-3.5 w-64" /></div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)}
      </div>
      <TableSkeleton />
    </div>
  );
}
