import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import { Logo } from '../../components/ui/Logo';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left — Branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16">
          <Logo size="lg" />
          <h2 className="mt-10 text-3xl font-bold leading-tight text-white xl:text-4xl">
            Accounting,
            <br />
            <span className="text-primary-200">Automated.</span>
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-primary-100/80">
            Streamline your financial operations with AI-powered bookkeeping, automated reconciliation, and real-time reporting.
          </p>
          <div className="mt-12 space-y-3">
            {['Double-entry bookkeeping with smart categorization', 'OCR-powered receipt and invoice processing', 'Real-time financial reports and dashboards'].map((f) => (
              <div key={f} className="flex items-center gap-2.5">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                </div>
                <span className="text-sm text-primary-100/80">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-20">
        <div className="mx-auto w-full max-w-sm">
          <div className="lg:hidden mb-8"><Logo size="md" /></div>

          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Welcome back</h1>
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">Sign in to your account to continue</p>

          {error && <div className="mt-6"><Alert variant="error">{error}</Alert></div>}

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <Input label="Email" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" autoFocus />
            <Input label="Password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 bg-white text-primary-600 focus:ring-primary-500 dark:border-navy-700 dark:bg-navy-900" />
                <span className="text-sm text-gray-500 dark:text-gray-400">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" loading={loading} className="w-full" size="lg">Sign in</Button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
