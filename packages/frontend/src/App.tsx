import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/providers/ThemeProvider';
import { ToastProvider } from './components/providers/ToastProvider';
import { QueryProvider } from './components/providers/QueryProvider';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute, GuestRoute } from './components/auth/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { PageSkeleton } from './components/ui/Skeleton';
import DesignSystemPage from './pages/DesignSystem';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';

// Dashboard & Clients
import DashboardPage from './pages/Dashboard';
import ClientListPage from './pages/clients/ClientListPage';
import ClientDetailPage from './pages/clients/ClientDetailPage';
import ClientFormPage from './pages/clients/ClientFormPage';

// Documents
import DocumentCenterPage from './pages/documents/DocumentCenterPage';

// ─── Dashboard Shell ────────────────────────

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <PageSkeleton />;

  return (
    <AppLayout
      user={user ? { name: user.name, email: user.email, avatar: user.avatar } : undefined}
    >
      {children}
    </AppLayout>
  );
}

// ─── App ────────────────────────────────────

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <QueryProvider>
          <AuthProvider>
            <Routes>
              {/* ── Auth Routes ────────────────── */}
              <Route
                path="/login"
                element={
                  <GuestRoute>
                    <LoginPage />
                  </GuestRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <GuestRoute>
                    <RegisterPage />
                  </GuestRoute>
                }
              />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />

              {/* ── Dashboard ──────────────────── */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardShell>
                      <DashboardPage />
                    </DashboardShell>
                  </ProtectedRoute>
                }
              />

              {/* ── Clients ────────────────────── */}
              <Route
                path="/clients"
                element={
                  <ProtectedRoute>
                    <DashboardShell>
                      <ClientListPage />
                    </DashboardShell>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/clients/new"
                element={
                  <ProtectedRoute>
                    <DashboardShell>
                      <ClientFormPage />
                    </DashboardShell>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/clients/:id"
                element={
                  <ProtectedRoute>
                    <DashboardShell>
                      <ClientDetailPage />
                    </DashboardShell>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/clients/:id/edit"
                element={
                  <ProtectedRoute>
                    <DashboardShell>
                      <ClientFormPage />
                    </DashboardShell>
                  </ProtectedRoute>
                }
              />

              {/* ── Documents ─────────────────── */}
              <Route
                path="/documents"
                element={
                  <ProtectedRoute>
                    <DashboardShell>
                      <DocumentCenterPage />
                    </DashboardShell>
                  </ProtectedRoute>
                }
              />

              {/* ── Design System ──────────────── */}
              <Route path="/design-system" element={<DesignSystemPage />} />

              {/* ── Default ────────────────────── */}
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </AuthProvider>
        </QueryProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
