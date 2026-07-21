import { type ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';

// ─── Types ──────────────────────────────────

type Role = 'ADMIN' | 'ACCOUNTANT' | 'CLIENT';

interface RoleGateProps {
  children: ReactNode;
  roles: Role[];
  fallback?: ReactNode;
}

// ─── Role Hierarchy ─────────────────────────

const roleHierarchy: Record<Role, number> = {
  ADMIN: 3,
  ACCOUNTANT: 2,
  CLIENT: 1,
};

function hasRequiredRole(userRole: Role, requiredRoles: Role[]): boolean {
  const userLevel = roleHierarchy[userRole] || 0;
  return requiredRoles.some((required) => userLevel >= roleHierarchy[required]);
}

// ─── Component ──────────────────────────────

export function RoleGate({ children, roles, fallback }: RoleGateProps) {
  const { user } = useAuth();

  if (!user || !hasRequiredRole(user.role as Role, roles)) {
    if (fallback) return <>{fallback}</>;
    return <AccessDenied requiredRoles={roles} currentRole={user?.role as Role} />;
  }

  return <>{children}</>;
}

// ─── Access Denied ──────────────────────────

function AccessDenied({
  requiredRoles,
  currentRole,
}: {
  requiredRoles: Role[];
  currentRole?: Role;
}) {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30">
          <svg
            className="h-8 w-8 text-red-600 dark:text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
        </div>
        <h2 className="text-display-md text-gray-900 dark:text-white">Access Denied</h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          You don't have permission to access this page.
          {currentRole && (
            <>
              <br />
              <span className="text-sm">
                Your role: <strong>{currentRole}</strong> &middot; Required:{' '}
                <strong>{requiredRoles.join(' or ')}</strong>
              </span>
            </>
          )}
        </p>
        <Button variant="primary" className="mt-6" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}

// ─── Convenience Components ─────────────────

export function AdminOnly({ children, fallback }: Omit<RoleGateProps, 'roles'>) {
  return (
    <RoleGate roles={['ADMIN']} fallback={fallback}>
      {children}
    </RoleGate>
  );
}

export function AccountantOrAbove({ children, fallback }: Omit<RoleGateProps, 'roles'>) {
  return (
    <RoleGate roles={['ADMIN', 'ACCOUNTANT']} fallback={fallback}>
      {children}
    </RoleGate>
  );
}
