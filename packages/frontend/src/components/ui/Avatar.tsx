import { type ReactNode } from 'react';

// ─── Types ──────────────────────────────────

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

// ─── Component ──────────────────────────────

export function Avatar({ src, alt = '', name, size = 'md', className = '' }: AvatarProps) {
  const initials = name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100 font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 ${sizeClasses[size]} ${className}`}
    >
      {src ? (
        <img src={src} alt={alt || name || ''} className="h-full w-full object-cover" />
      ) : (
        <span>{initials || '?'}</span>
      )}
    </div>
  );
}

// ─── Avatar Group ───────────────────────────

interface AvatarGroupProps {
  children: ReactNode;
  max?: number;
}

export function AvatarGroup({ children, max = 3 }: AvatarGroupProps) {
  const items = Array.isArray(children) ? children : [children];
  const visible = items.slice(0, max);
  const remaining = items.length - max;

  return (
    <div className="flex -space-x-2">
      {visible.map((child, i) => (
        <div key={i} className="relative ring-2 ring-white dark:ring-navy-900">
          {child}
        </div>
      ))}
      {remaining > 0 && (
        <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600 ring-2 ring-white dark:bg-navy-800 dark:text-gray-400 dark:ring-navy-900">
          +{remaining}
        </div>
      )}
    </div>
  );
}
