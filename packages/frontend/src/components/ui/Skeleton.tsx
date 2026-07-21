import { type HTMLAttributes } from 'react';

// ─── Base Skeleton ──────────────────────────

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className = '', ...props }: SkeletonProps) {
  return <div className={`skeleton ${className}`} {...props} />;
}

// ─── Card Skeleton ──────────────────────────

export function CardSkeleton() {
  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-3 w-48" />
    </div>
  );
}

// ─── Table Skeleton ─────────────────────────

interface TableSkeletonProps {
  rows?: number;
  cols?: number;
}

export function TableSkeleton({ rows = 5, cols = 4 }: TableSkeletonProps) {
  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-gray-100 bg-gray-50/50 px-4 py-3 dark:border-navy-800 dark:bg-navy-800/50">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, row) => (
        <div
          key={row}
          className="flex items-center gap-4 border-b border-gray-100 px-4 py-3.5 dark:border-navy-800/50"
        >
          {Array.from({ length: cols }).map((_, col) => (
            <Skeleton
              key={col}
              className={`h-4 ${col === 0 ? 'w-24' : col === cols - 1 ? 'w-20' : 'flex-1'}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Stat Skeleton ──────────────────────────

export function StatSkeleton() {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-12 w-12 rounded-xl" />
      </div>
    </div>
  );
}

// ─── Page Skeleton ──────────────────────────

export function PageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatSkeleton key={i} />
        ))}
      </div>
      <TableSkeleton />
    </div>
  );
}
