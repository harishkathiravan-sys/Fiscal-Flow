interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
};

export function Logo({ size = 'md', className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`${sizes[size]} flex items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 shadow-sm`}
      >
        <svg
          className={`${size === 'sm' ? 'h-3.5 w-3.5' : size === 'md' ? 'h-4.5 w-4.5' : 'h-6 w-6'} text-white`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 7V4h16v3" />
          <path d="M9 20h6" />
          <path d="M12 4v16" />
        </svg>
      </div>
      {size !== 'sm' && (
        <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
          Fiscal<span className="text-primary-600 dark:text-primary-400">Flow</span>
        </span>
      )}
    </div>
  );
}
