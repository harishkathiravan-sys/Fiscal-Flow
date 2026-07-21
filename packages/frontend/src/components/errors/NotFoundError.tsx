import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';

export function NotFoundError() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-navy-950 px-4">
      <div className="text-center">
        <div className="relative mx-auto h-40 w-40">
          {/* 404 number */}
          <span className="absolute inset-0 flex items-center justify-center text-[8rem] font-black leading-none text-gray-100 dark:text-navy-800 select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="h-16 w-16 text-primary-500 animate-pulse-slow"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"
              />
            </svg>
          </div>
        </div>

        <h1 className="mt-6 text-display-lg text-gray-900 dark:text-white">Page not found</h1>
        <p className="mt-3 max-w-md mx-auto text-gray-500 dark:text-gray-400">
          Sorry, we couldn't find the page you're looking for. It may have been moved or doesn't
          exist.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button variant="primary" onClick={() => navigate('/')}>
            Back to Dashboard
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
