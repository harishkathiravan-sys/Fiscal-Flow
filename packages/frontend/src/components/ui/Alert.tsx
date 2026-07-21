import { type ReactNode } from 'react';

// ─── Types ──────────────────────────────────

type AlertVariant = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  onClose?: () => void;
  className?: string;
}

// ─── Styles ─────────────────────────────────

const variantClasses: Record<AlertVariant, string> = {
  success:
    'bg-primary-50 border-primary-200 text-primary-900 dark:bg-primary-900/20 dark:border-primary-800 dark:text-primary-200',
  error:
    'bg-red-50 border-red-200 text-red-900 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
  warning:
    'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-200',
  info: 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
};

const defaultIcons: Record<AlertVariant, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

// ─── Component ──────────────────────────────

export function Alert({
  variant = 'info',
  title,
  children,
  icon,
  action,
  onClose,
  className = '',
}: AlertProps) {
  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-xl border p-4 ${variantClasses[variant]} ${className}`}
    >
      <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center text-sm font-bold">
        {icon || defaultIcons[variant]}
      </span>
      <div className="flex-1 min-w-0">
        {title && <h4 className="text-sm font-semibold">{title}</h4>}
        <div className={`text-sm ${title ? 'mt-1 opacity-80' : ''}`}>{children}</div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 rounded-lg p-1 opacity-60 hover:opacity-100 transition-opacity"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
