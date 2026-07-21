import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';

interface ServerErrorProps {
  code?: number;
  message?: string;
}

export function ServerError({ code = 500, message }: ServerErrorProps) {
  const navigate = useNavigate();

  const errorMessages: Record<number, { title: string; description: string }> = {
    500: {
      title: 'Internal Server Error',
      description:
        'Something went wrong on our end. Our team has been notified and is working on it.',
    },
    502: {
      title: 'Bad Gateway',
      description: 'We received an invalid response from the server. Please try again in a moment.',
    },
    503: {
      title: 'Service Unavailable',
      description: "We're currently undergoing maintenance. Please check back shortly.",
    },
    403: {
      title: 'Access Denied',
      description: "You don't have permission to access this resource.",
    },
    429: {
      title: 'Too Many Requests',
      description: "You've made too many requests. Please wait a moment and try again.",
    },
  };

  const info = errorMessages[code] || {
    title: `Error ${code}`,
    description: message || 'An unexpected error occurred.',
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-navy-950 px-4">
      <div className="text-center">
        <div className="relative mx-auto h-40 w-40">
          <span className="absolute inset-0 flex items-center justify-center text-[8rem] font-black leading-none text-gray-100 dark:text-navy-800 select-none">
            {code}
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="h-16 w-16 text-red-400 animate-pulse-slow"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
        </div>

        <h1 className="mt-6 text-display-lg text-gray-900 dark:text-white">{info.title}</h1>
        <p className="mt-3 max-w-md mx-auto text-gray-500 dark:text-gray-400">
          {message || info.description}
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button variant="primary" onClick={() => window.location.reload()}>
            Try Again
          </Button>
          <Button variant="secondary" onClick={() => navigate('/')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
