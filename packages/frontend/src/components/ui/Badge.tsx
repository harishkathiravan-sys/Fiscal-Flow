import { type ReactNode } from 'react';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
type BadgeSize = 'sm' | 'md';

const variantClasses: Record<BadgeVariant, string> = {
  primary: 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
  danger: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300',
  info: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
  neutral: 'bg-gray-100 text-gray-600 dark:bg-navy-800 dark:text-gray-400',
};

const dotColors: Record<BadgeVariant, string> = {
  primary: 'bg-primary-500', success: 'bg-emerald-500', warning: 'bg-amber-500',
  danger: 'bg-red-500', info: 'bg-blue-500', neutral: 'bg-gray-400',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-2xs',
  md: 'px-2.5 py-0.5 text-xs',
};

export function Badge({ variant = 'neutral', size = 'sm', dot = false, icon, children, className = '' }: {
  variant?: BadgeVariant; size?: BadgeSize; dot?: boolean; icon?: ReactNode; children: ReactNode; className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotColors[variant]}`} />}
      {icon && <span className="flex-shrink-0 [&>svg]:h-3 [&>svg]:w-3">{icon}</span>}
      {children}
    </span>
  );
}
