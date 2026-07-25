import { type HTMLAttributes, type ReactNode } from 'react';

export function Card({ hover = false, className = '', children, ...props }: HTMLAttributes<HTMLDivElement> & { hover?: boolean }) {
  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white shadow-card dark:border-navy-800 dark:bg-navy-900 ${hover ? 'transition-shadow duration-200 hover:shadow-card-hover dark:hover:shadow-lg' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`px-6 py-4 border-b border-gray-100 dark:border-navy-800 ${className}`} {...props}>{children}</div>;
}

export function CardTitle({ className = '', children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={`text-base font-semibold text-gray-900 dark:text-white ${className}`} {...props}>{children}</h3>;
}

export function CardDescription({ className = '', children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={`mt-1 text-sm text-gray-500 dark:text-gray-400 ${className}`} {...props}>{children}</p>;
}

export function CardContent({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`px-6 py-4 ${className}`} {...props}>{children}</div>;
}

export function CardFooter({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`flex items-center px-6 py-4 border-t border-gray-100 dark:border-navy-800 ${className}`} {...props}>{children}</div>;
}

export function StatCard({ title, value, change, changeType = 'neutral', icon }: { title: string; value: string | number; change?: string; changeType?: 'positive' | 'negative' | 'neutral'; icon?: ReactNode }) {
  const changeColors = { positive: 'text-primary-600 dark:text-primary-400', negative: 'text-red-600 dark:text-red-400', neutral: 'text-gray-500 dark:text-gray-400' };
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">{value}</p>
          {change && <p className={`text-xs ${changeColors[changeType]}`}>{change}</p>}
        </div>
        {icon && <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400">{icon}</div>}
      </div>
    </Card>
  );
}
